"""
losses.py
OceanEmbed-Lite ST Physics-Aware Loss Functions & Diagnostics
Responsibility:
- Masked depth-normalized Huber reconstruction loss with thermocline weighting.
- Soft masked surface SST consistency loss (Huber).
- Non-uniform vertical curvature loss using 3-level validity intersection mask.
- Tiny spatial total-variation penalty.
- Post-hoc steric height consistency diagnostic (NEVER used in training loss).
"""

import torch
import torch.nn as nn
import torch.nn.functional as F

class OceanEmbedLoss(nn.Module):
    """
    Composite masked objective function for OceanEmbed-Lite ST.
    Combines depth-normalized Huber reconstruction, soft surface constraint,
    non-uniform vertical curvature, and spatial smoothness regularizer.
    """
    def __init__(
        self,
        depth_weights=(0.57, 1.71, 1.71, 1.14, 0.57, 0.29),
        depths=(0.0, 50.0, 100.0, 200.0, 500.0, 1000.0),
        lambda_surface=0.10,
        lambda_curv=0.01,
        lambda_spatial=1e-4,
        huber_delta=1.0,
        eps=1e-6
    ):
        super().__init__()
        assert len(depth_weights) == 6
        assert len(depths) == 6
        self.register_buffer("depth_weights", torch.tensor(depth_weights, dtype=torch.float32))
        self.register_buffer("depths", torch.tensor(depths, dtype=torch.float32))
        self.lambda_surface = lambda_surface
        self.lambda_curv = lambda_curv
        self.lambda_spatial = lambda_spatial
        self.huber_delta = huber_delta
        self.eps = eps

    def forward(self, pred_t, target_t, mask, sst_obs, sigma_train):
        """
        pred_t: [B, 6, H, W] predicted temperature in °C
        target_t: [B, 6, H, W] target temperature in °C
        mask: [B, 6, H, W] binary ocean mask (1 = valid ocean, 0 = invalid/land)
        sst_obs: [B, H, W] observed satellite SST in °C
        sigma_train: [6] or [1, 6, 1, 1] vertical training-only standard deviations
        """
        B, K, H, W = pred_t.shape
        if sigma_train.dim() == 1:
            sigma = sigma_train.view(1, K, 1, 1)
        else:
            sigma = sigma_train

        # 1. Depth-Normalized Huber Reconstruction Loss
        # Normalize errors by training vertical std per depth
        norm_error = (pred_t - target_t) / (sigma + self.eps)
        huber_elem = F.huber_loss(norm_error, torch.zeros_like(norm_error), reduction="none", delta=self.huber_delta)
        
        # Apply mask and compute depth-weighted loss
        masked_huber = huber_elem * mask
        loss_recon = 0.0
        for k in range(K):
            denom = mask[:, k].sum() + self.eps
            loss_recon += self.depth_weights[k] * (masked_huber[:, k].sum() / denom)

        # 2. Soft Surface SST Consistency Loss (Depth 0)
        surf_mask = mask[:, 0]  # [B, H, W]
        surf_norm_error = (pred_t[:, 0] - sst_obs) / (sigma[:, 0] + self.eps)
        surf_huber = F.huber_loss(surf_norm_error, torch.zeros_like(surf_norm_error), reduction="none", delta=self.huber_delta)
        denom_surf = surf_mask.sum() + self.eps
        loss_surface = (surf_huber * surf_mask).sum() / denom_surf

        # 3. Masked Non-Uniform Vertical Curvature Loss
        # Only penalize where 3 consecutive depths are valid: M_curv = M_{k-1} * M_k * M_{k+1}
        loss_curv = 0.0
        curv_count = 0
        for k in range(1, K - 1):
            z_prev = self.depths[k - 1]
            z_curr = self.depths[k]
            z_next = self.depths[k + 1]
            
            dz_up = z_curr - z_prev
            dz_down = z_next - z_curr
            
            grad_up = (pred_t[:, k] - pred_t[:, k - 1]) / dz_up
            grad_down = (pred_t[:, k + 1] - pred_t[:, k]) / dz_down
            second_diff = (grad_down - grad_up)
            
            m_curv = mask[:, k - 1] * mask[:, k] * mask[:, k + 1]
            denom_c = m_curv.sum() + self.eps
            loss_curv += (torch.square(second_diff) * m_curv).sum() / denom_c
            curv_count += 1
            
        if curv_count > 0:
            loss_curv = loss_curv / curv_count

        # 4. Horizontal Spatial Total-Variation Penalty
        # Suppresses high-frequency checkerboard / salt-and-pepper noise without blurring fronts
        diff_x = torch.abs(pred_t[:, :, :, 1:] - pred_t[:, :, :, :-1])
        diff_y = torch.abs(pred_t[:, :, 1:, :] - pred_t[:, :, :-1, :])
        loss_spatial = (diff_x.mean() + diff_y.mean()) / 2.0

        # Composite Objective
        total_loss = (
            loss_recon
            + self.lambda_surface * loss_surface
            + self.lambda_curv * loss_curv
            + self.lambda_spatial * loss_spatial
        )

        return {
            "loss": total_loss,
            "recon_loss": loss_recon,
            "surface_loss": loss_surface,
            "curv_loss": loss_curv,
            "spatial_loss": loss_spatial
        }

@torch.no_grad()
def compute_steric_diagnostic(pred_t, clim_t, depths, target_sla, alpha=2.5e-4):
    """
    POST-HOC EVALUATION DIAGNOSTIC ONLY (Never used in training loss).
    Evaluates approximate thermosteric consistency between reconstructed anomalies
    and satellite altimetry SLA: eta_steric = sum alpha * Delta T * Delta z.
    """
    # pred_t, clim_t: [B, 6, H, W]
    delta_t = pred_t - clim_t
    B, K, H, W = delta_t.shape
    
    # Trapezoidal vertical integration across standard depths
    steric_sla = torch.zeros(B, H, W, device=pred_t.device)
    for k in range(K - 1):
        dz = depths[k + 1] - depths[k]
        avg_dt = 0.5 * (delta_t[:, k] + delta_t[:, k + 1])
        steric_sla += alpha * avg_dt * dz
        
    # Residual against target SLA
    residual = torch.abs(steric_sla - target_sla)
    return {
        "steric_sla": steric_sla,
        "mean_residual_meters": residual.mean().item(),
        "correlation": float(torch.corrcoef(torch.stack([steric_sla.flatten(), target_sla.flatten()]))[0, 1].item())
    }
