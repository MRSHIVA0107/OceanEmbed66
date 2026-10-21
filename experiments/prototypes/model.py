"""
model.py
OceanEmbed-Lite ST Architecture:
Causal Temporal Encoder + Multi-Scale Spatial U-Net + Depth-Conditioned Residual Decoder
~3.8M Trainable Parameters | Strictly Causal Forward Time Flow
"""

import torch
import torch.nn as nn
import torch.nn.functional as F

class ResBlock2D(nn.Module):
    """Standard Residual Block with GroupNorm and GELU."""
    def __init__(self, channels, groups=4):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, kernel_size=3, padding=1, bias=False)
        self.gn1 = nn.GroupNorm(groups, channels)
        self.act1 = nn.GELU()
        self.conv2 = nn.Conv2d(channels, channels, kernel_size=3, padding=1, bias=False)
        self.gn2 = nn.GroupNorm(groups, channels)
        self.act2 = nn.GELU()

    def forward(self, x):
        residual = x
        out = self.act1(self.gn1(self.conv1(x)))
        out = self.gn2(self.conv2(out))
        out = self.act2(out + residual)
        return out


class ConvGRUCell(nn.Module):
    """2D Convolutional GRU Cell for strictly causal spatiotemporal memory."""
    def __init__(self, in_channels, hidden_channels, kernel_size=3):
        super().__init__()
        padding = kernel_size // 2
        self.hidden_channels = hidden_channels
        self.conv_gates = nn.Conv2d(
            in_channels + hidden_channels, 2 * hidden_channels, kernel_size=kernel_size, padding=padding
        )
        self.conv_can = nn.Conv2d(
            in_channels + hidden_channels, hidden_channels, kernel_size=kernel_size, padding=padding
        )

    def forward(self, x, h):
        combined = torch.cat([x, h], dim=1)
        gates = torch.sigmoid(self.conv_gates(combined))
        r, z = torch.chunk(gates, 2, dim=1)
        
        can_combined = torch.cat([x, r * h], dim=1)
        can = torch.tanh(self.conv_can(can_combined))
        new_h = (1.0 - z) * h + z * can
        return new_h


class CausalConvGRU(nn.Module):
    """Forward-only (causal) ConvGRU over temporal window T."""
    def __init__(self, in_channels=128, hidden_channels=128, kernel_size=3):
        super().__init__()
        self.cell = ConvGRUCell(in_channels, hidden_channels, kernel_size=kernel_size)
        self.hidden_channels = hidden_channels

    def forward(self, x_seq):
        # x_seq: [B, T, C, H, W]
        B, T, C, H, W = x_seq.shape
        h = torch.zeros(B, self.hidden_channels, H, W, device=x_seq.device, dtype=x_seq.dtype)
        for t in range(T):
            h = self.cell(x_seq[:, t], h)
        return h  # Returns state at final timestep t (causal)


class OceanEmbedLiteST(nn.Module):
    """
    OceanEmbed-Lite ST:
    Compact, causal, physics-aware spatiotemporal model for subsurface ocean reconstruction.
    Supports Core-6 (C=6) and Core-7 (C=7) configurations.
    """
    def __init__(
        self,
        in_channels=6,
        num_depths=6,
        depth_embed_dim=16,
        dropout_p=0.10,
        standard_depths=(0, 50, 100, 200, 500, 1000)
    ):
        super().__init__()
        self.in_channels = in_channels
        self.num_depths = num_depths
        self.standard_depths = standard_depths
        self.dropout_p = dropout_p

        # 1. Shared Spatial Stem (per-day feature extraction)
        self.stem_conv = nn.Conv2d(in_channels, 32, kernel_size=3, padding=1)
        self.stem_gn = nn.GroupNorm(4, 32)
        self.stem_act = nn.GELU()
        self.stem_res32 = ResBlock2D(32, groups=4)

        # Downsample 1: 68x60 -> 34x30
        self.down1 = nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1)
        self.down1_gn = nn.GroupNorm(8, 64)
        self.res64 = ResBlock2D(64, groups=8)

        # Downsample 2: 34x30 -> 17x15
        self.down2 = nn.Conv2d(64, 128, kernel_size=3, stride=2, padding=1)
        self.down2_gn = nn.GroupNorm(8, 128)
        self.res128 = ResBlock2D(128, groups=8)

        # 2. Causal Temporal Bottleneck (Forward-only ConvGRU at 17x15)
        self.temporal_gru = CausalConvGRU(in_channels=128, hidden_channels=128, kernel_size=3)

        # 3. Multi-Scale Spatial U-Net Decoder
        # Stage 1: 17x15 -> 34x30 with skip from res64 (128 + 64 = 192)
        self.dec_conv1 = nn.Conv2d(192, 64, kernel_size=3, padding=1)
        self.dec_gn1 = nn.GroupNorm(8, 64)
        self.dec_res1 = ResBlock2D(64, groups=8)

        # Stage 2: 34x30 -> 68x60 with skip from res32 (64 + 32 = 96)
        self.dec_conv2 = nn.Conv2d(96, 64, kernel_size=3, padding=1)
        self.dec_gn2 = nn.GroupNorm(8, 64)
        self.dec_res2 = ResBlock2D(64, groups=8)

        # 4. Learned Depth Conditioning at 6 Discrete Standard Depths
        # Learned 16-D embedding per discrete level
        self.depth_embeddings = nn.Parameter(torch.randn(num_depths, depth_embed_dim) * 0.02)

        # Shared 1x1 projection head:
        # Input per depth: Spatial Latent (64) + Depth Embedding (16) + Climatology Prior (1) = 81 channels
        in_head = 64 + depth_embed_dim + 1
        self.head_conv1 = nn.Conv2d(in_head, 48, kernel_size=1)
        self.head_gn1 = nn.GroupNorm(4, 48)
        self.head_act1 = nn.GELU()
        self.dropout = nn.Dropout2d(p=dropout_p)
        self.head_conv2 = nn.Conv2d(48, 24, kernel_size=1)
        self.head_act2 = nn.GELU()
        self.head_conv3 = nn.Conv2d(24, 1, kernel_size=1)

    def extract_spatial_features(self, x):
        """Processes single-frame 2D tensor [B, C, H, W] through stem and encoder."""
        f32 = self.stem_res32(self.stem_act(self.stem_gn(self.stem_conv(x))))
        f64 = self.res64(F.gelu(self.down1_gn(self.down1(f32))))
        f128 = self.res128(F.gelu(self.down2_gn(self.down2(f64))))
        return f32, f64, f128

    def forward(self, x_seq, clim_t, sigma_train=None):
        """
        x_seq: [B, 7, C, 68, 60] strictly causal surface sequence from t-6 to t
        clim_t: [B, 6, 68, 60] monthly spatial climatology prior across 6 depths
        sigma_train: [1, 6, 1, 1] vertical standard deviation for de-standardization
        Returns:
            pred_t: [B, 6, 68, 60] reconstructed temperature in °C
            delta_norm: [B, 6, 68, 60] predicted normalized anomalies
        """
        B, T, C, H, W = x_seq.shape
        assert C == self.in_channels, f"Expected {self.in_channels} channels, got {C}"
        assert T == 7, f"Expected 7-day temporal window, got {T}"

        # 1. Shared Spatial Encoding across 7 days
        seq_f128 = []
        last_f32, last_f64 = None, None
        for t in range(T):
            f32, f64, f128 = self.extract_spatial_features(x_seq[:, t])
            seq_f128.append(f128)
            if t == T - 1:
                # Save skip connections from target day t for U-Net reconstruction
                last_f32 = f32
                last_f64 = f64

        seq_f128 = torch.stack(seq_f128, dim=1)  # [B, 7, 128, 17, 15]

        # 2. Causal ConvGRU Bottleneck
        h_bottleneck = self.temporal_gru(seq_f128)  # [B, 128, 17, 15]

        # 3. U-Net Decoder with Skip Reconnections
        # Stage 1: upsample to 34x30 + concat skip
        up1 = F.interpolate(h_bottleneck, size=(34, 30), mode="bilinear", align_corners=False)
        cat1 = torch.cat([up1, last_f64], dim=1)  # [B, 192, 34, 30]
        dec1 = self.dec_res1(F.gelu(self.dec_gn1(self.dec_conv1(cat1))))  # [B, 64, 34, 30]

        # Stage 2: upsample to 68x60 + concat skip
        up2 = F.interpolate(dec1, size=(68, 60), mode="bilinear", align_corners=False)
        cat2 = torch.cat([up2, last_f32], dim=1)  # [B, 96, 68, 60]
        spatial_latent = self.dec_res2(F.gelu(self.dec_gn2(self.dec_conv2(cat2))))  # [B, 64, 68, 60]

        # 4. Depth-Conditioned Anomaly Head across 6 Discrete Levels
        delta_norm_list = []
        for k in range(self.num_depths):
            # Broadcast 16-D depth embedding across spatial grid
            d_emb = self.depth_embeddings[k].view(1, -1, 1, 1).expand(B, -1, H, W)
            # Slice corresponding monthly climatology prior channel
            c_prior = clim_t[:, k:k+1]  # [B, 1, H, W]

            # Concatenate: [64 spatial + 16 depth embedding + 1 climatology prior] = 81 channels
            head_in = torch.cat([spatial_latent, d_emb, c_prior], dim=1)
            
            feat = self.head_act1(self.head_gn1(self.head_conv1(head_in)))
            feat = self.dropout(feat)
            feat = self.head_act2(self.head_conv2(feat))
            anomaly_k = self.head_conv3(feat)  # [B, 1, H, W]
            delta_norm_list.append(anomaly_k)

        delta_norm = torch.cat(delta_norm_list, dim=1)  # [B, 6, 68, 60]

        # 5. De-standardize and Add Monthly Spatial Climatology
        if sigma_train is not None:
            if sigma_train.dim() == 1:
                sigma = sigma_train.view(1, -1, 1, 1)
            else:
                sigma = sigma_train
            pred_t = clim_t + sigma * delta_norm
        else:
            pred_t = clim_t + delta_norm

        return pred_t, delta_norm


def count_parameters(model):
    """Calculates total trainable parameter count."""
    return sum(p.numel() for p in model.parameters() if p.requires_grad)

if __name__ == "__main__":
    model = OceanEmbedLiteST(in_channels=6)
    total_params = count_parameters(model)
    print(f"OceanEmbedLiteST Core-6 Parameter Count: {total_params:,}")
