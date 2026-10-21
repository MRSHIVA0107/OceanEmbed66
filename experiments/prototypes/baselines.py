"""
baselines.py
OceanEmbed-Lite ST Baseline Models Suite
Responsibility:
- 1. Monthly Climatology Baseline (minimum credible reference).
- 2. SST-Only Ridge Regression Baseline (value of SST alone).
- 3. Multi-Source Tabular Baseline (same-day 6 channels non-deep-learning).
- Common valid support evaluation on held-out test blocks.
"""

import numpy as np

class MonthlyClimatologyBaseline:
    """Computes and predicts historical monthly spatial mean temperature fields."""
    def __init__(self):
        self.climatology_cache = {}  # month -> [6, H, W]

    def fit(self, train_dates, train_targets, mask):
        """
        train_dates: list of datetime objects or month integers (1-12)
        train_targets: [N, 6, H, W] array of ground truth temperatures in °C
        mask: [H, W] binary ocean mask
        """
        months = np.array([d.month if hasattr(d, "month") else int(d) for d in train_dates])
        unique_months = np.unique(months)
        
        for m in unique_months:
            idx = np.where(months == m)[0]
            month_mean = np.mean(train_targets[idx], axis=0) * mask
            self.climatology_cache[int(m)] = month_mean

    def predict(self, month, shape=None):
        m = int(month)
        if m in self.climatology_cache:
            return self.climatology_cache[m]
        # Fallback to annual mean
        all_means = list(self.climatology_cache.values())
        return np.mean(all_means, axis=0) if all_means else np.zeros(shape)


class SSTOnlyRidgeBaseline:
    """Linear mapping from same-day SST to subsurface temperature at 6 discrete depths."""
    def __init__(self, alpha=1.0):
        self.alpha = alpha
        self.weights = {}  # depth_k -> (slope, intercept)

    def fit(self, train_sst, train_targets, mask):
        """
        train_sst: [N, H, W]
        train_targets: [N, 6, H, W]
        mask: [H, W]
        """
        valid_idx = np.where(mask > 0)
        x = train_sst[:, valid_idx[0], valid_idx[1]].reshape(-1, 1)  # [N * num_ocean, 1]
        x_mean = np.mean(x)
        x_centered = x - x_mean
        
        for k in range(6):
            y = train_targets[:, k, valid_idx[0], valid_idx[1]].reshape(-1, 1)
            y_mean = np.mean(y)
            y_centered = y - y_mean
            
            # Ridge regression analytical solution: w = (X^T X + alpha I)^-1 X^T Y
            slope = float(np.sum(x_centered * y_centered) / (np.sum(x_centered**2) + self.alpha))
            intercept = float(y_mean - slope * x_mean)
            self.weights[k] = (slope, intercept)

    def predict(self, sst_field, mask):
        """Predicts [6, H, W] field from single-day SST field [H, W]."""
        H, W = sst_field.shape
        out = np.zeros((6, H, W), dtype=np.float32)
        for k in range(6):
            slope, intercept = self.weights[k]
            out[k] = (slope * sst_field + intercept) * mask
        return out


class MultiSourceTabularBaseline:
    """Ridge / Linear model using all 6 same-day surface channels."""
    def __init__(self, alpha=10.0):
        self.alpha = alpha
        self.weights = {}  # depth_k -> (w_vector, intercept)

    def fit(self, train_features, train_targets, mask):
        """
        train_features: [N, 6, H, W] (SST, SLA, U_cur, V_cur, U_wind, V_wind)
        train_targets: [N, 6, H, W]
        mask: [H, W]
        """
        valid_idx = np.where(mask > 0)
        N, C, H, W = train_features.shape
        
        # Flatten spatial ocean cells into tabular matrix [N * num_ocean, C]
        x_list = [train_features[:, c, valid_idx[0], valid_idx[1]].reshape(-1, 1) for c in range(C)]
        X = np.hstack(x_list)
        X_mean = np.mean(X, axis=0)
        X_c = X - X_mean
        
        XtX = X_c.T @ X_c + self.alpha * np.eye(C)
        
        for k in range(6):
            Y = train_targets[:, k, valid_idx[0], valid_idx[1]].reshape(-1, 1)
            Y_mean = np.mean(Y)
            Y_c = Y - Y_mean
            
            w = np.linalg.solve(XtX, X_c.T @ Y_c).flatten()
            intercept = float(Y_mean - np.dot(X_mean, w))
            self.weights[k] = (w, intercept)

    def predict(self, feature_field, mask):
        """Predicts [6, H, W] from [6, H, W] multi-source input."""
        C, H, W = feature_field.shape
        out = np.zeros((6, H, W), dtype=np.float32)
        for k in range(6):
            w, intercept = self.weights[k]
            pred_k = np.zeros((H, W), dtype=np.float32)
            for c in range(C):
                pred_k += w[c] * feature_field[c]
            pred_k += intercept
            out[k] = pred_k * mask
        return out
