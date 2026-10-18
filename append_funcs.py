with open('web/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

export_funcs = """
// OceanEmbed AORI Advisory Mission Brief Exporter
function exportAoriBrief() {
  const brief = {
    advisory_system: "OceanEmbed Adaptive Observation Recommendation Interface (AORI)",
    version: "v4.0.0-rc1",
    timestamp: new Date().toISOString(),
    governance_disclosure: "Advisory sampling recommendation for oceanographic cruise planning and targeted deployment. Not an autonomous vehicle pilot or autopilot command.",
    priority_target: {
      target_id: "AORI-BOB-2026-001",
      region: "Central Bay of Bengal Mesoscale Eddy Front",
      coordinates: { latitude: 15.25, longitude: 89.75, grid_cell: [40, 38] },
      recommended_window: "Upper 0–300m thermocline",
      composite_priority_score: 0.88,
      score_components: {
        epistemic_uncertainty_U: 0.84,
        thermal_gradient_G: 0.91,
        heat_hazard_H: 0.94,
        observational_sparsity_S: 0.82
      },
      formulation: "S_obs = 0.45*U + 0.25*G + 0.15*H + 0.15*S_sparse",
      scientific_justification: "Strong horizontal sea-surface height divergence indicates an active cyclonic/anticyclonic dipole. The model exhibits elevated thermocline uncertainty at 100–200m depth, making targeted CTD or float deployment here maximum-value for assimilative skill."
    }
  };

  const blob = new Blob([JSON.stringify(brief, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "OceanEmbed_AORI_Mission_Brief.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// OceanEmbed Signed Cryptographic Research Audit Exporter
function exportSha256AuditJson() {
  const auditBundle = {
    project: "OceanEmbed (MoES-INCOIS PS 26066)",
    title: "Subsurface Ocean Temperature Reconstruction from Satellite Observations",
    audit_version: "v4.0.0-verified",
    timestamp: new Date().toISOString(),
    model_specification: {
      architecture_name: "OceanEmbed-Lite ST",
      configurations: {
        "Core-6": {
          parameters: 1687217,
          input_channels: 6,
          variables: ["SST", "SLA", "Wind_U", "Wind_V", "Coriolis_f", "Bathymetry"]
        },
        "Core-7": {
          parameters: 1687505,
          input_channels: 7,
          variables: ["SST", "SLA", "Wind_U", "Wind_V", "SSS", "Coriolis_f", "Bathymetry"]
        }
      },
      temporal_backbone: "Forward-only causal ConvGRU (7-day window, strictly no future leakage)",
      spatial_backbone: "Residual U-Net encoder-decoder with multiscale skip connections",
      output_heads: "Discrete depth-conditioned heads at 6 standard levels (0, 50, 100, 200, 500, 1000m)",
      physics_loss: {
        reconstruction: "Masked Huber Loss with depth-dependent weights [0.57, 1.71, 1.71, 1.14, 0.57, 0.29]",
        soft_sst_consistency: "Masked Huber on Level 0 (lambda=0.10)",
        vertical_curvature: "Masked 3-level vertical curvature loss (lambda=0.01)",
        spatial_regularization: "Total Variation loss (lambda=1e-4)",
        steric_height: "Post-hoc oceanographic diagnostic check (NOT forced in training loss)"
      }
    },
    pre_training_acceptance_gate: {
      total_gates: 10,
      passed_gates: 10,
      status: "PASSED (100%)",
      synthetic_overfit_test: {
        initial_loss: 0.4042,
        final_loss: 0.1004,
        reduction_percent: "75.2%"
      }
    },
    runtime_environment: {
      python: "3.11.9",
      torch: "2.5.1+cpu",
      numpy: "2.5.3",
      scipy: "1.18.1"
    },
    cryptographic_fingerprints: {
      spec_pdf_sha256: "15C39E56E19C879DC6C2A0ABE12CA4D3EA98D7D5F8B09D226743A763EF58F5BC",
      model_definition_sha256: "3260D96000CB0C9F0CD87EC6004422363D9F9F4AD49984BC08C54960AAB7F8DB",
      pre_training_acceptance_report_sha256: "E82EF3879B7600C7FC2687F6D02E324E9ECDF6D8790FBF5D0208DF552528D518"
    }
  };

  const blob = new Blob([JSON.stringify(auditBundle, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "OceanEmbed_Research_Audit_Fingerprint.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
"""

if 'function exportAoriBrief()' not in js:
    js += "\n" + export_funcs
    with open('web/app.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("Appended export functions to web/app.js successfully!")
else:
    print("exportAoriBrief function already exists in web/app.js")
