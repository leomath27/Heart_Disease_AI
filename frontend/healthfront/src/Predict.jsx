import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Predict.css";

// For CRA dev server, package.json "proxy" forwards /api/* to Flask.
// In production, Flask serves the React build on the same origin.
const API_BASE = process.env.REACT_APP_API_URL || "";

const FIELD_DEFS = [
  { key: "age", label: "Age", type: "number", placeholder: "e.g., 54", min: 1, max: 120 },
  { key: "sex", label: "Sex", type: "select", options: [{ value: 1, label: "Male" }, { value: 0, label: "Female" }] },
  { key: "cp", label: "Chest Pain Type", type: "select", options: [
      { value: 0, label: "Typical angina" },
      { value: 1, label: "Atypical angina" },
      { value: 2, label: "Non-anginal pain" },
      { value: 3, label: "Asymptomatic" },
    ]
  },
  { key: "trestbps", label: "Resting Blood Pressure", type: "number", placeholder: "e.g., 130", min: 60, max: 260 },
  { key: "chol", label: "Serum Cholesterol (mg/dl)", type: "number", placeholder: "e.g., 250", min: 80, max: 700 },
  { key: "fbs", label: "Fasting Blood Sugar > 120 mg/dl", type: "select", options: [{ value: 1, label: "True" }, { value: 0, label: "False" }] },
  { key: "restecg", label: "Resting ECG", type: "select", options: [
      { value: 0, label: "Normal" },
      { value: 1, label: "ST-T wave abnormality" },
      { value: 2, label: "Left ventricular hypertrophy" },
    ]
  },
  { key: "thalach", label: "Max Heart Rate Achieved", type: "number", placeholder: "e.g., 150", min: 60, max: 240 },
  { key: "exang", label: "Exercise Induced Angina", type: "select", options: [{ value: 1, label: "Yes" }, { value: 0, label: "No" }] },
  { key: "oldpeak", label: "Oldpeak (ST depression)", type: "number", placeholder: "e.g., 1.0", min: 0, max: 10, step: "0.1" },
  { key: "slope", label: "Slope of Peak Exercise ST", type: "select", options: [
      { value: 0, label: "Upsloping" },
      { value: 1, label: "Flat" },
      { value: 2, label: "Downsloping" },
    ]
  },
  { key: "ca", label: "Number of Major Vessels (0–3)", type: "number", placeholder: "0–3", min: 0, max: 3 },
  { key: "thal", label: "Thalassemia", type: "select", options: [
      { value: 1, label: "Normal" },
      { value: 2, label: "Fixed defect" },
      { value: 3, label: "Reversible defect" },
    ]
  },
];

const PRESETS = {
  "High Risk Example": {
    age: 35,
    sex: 0,
    cp: 0,
    trestbps: 110,
    chol: 180,
    fbs: 0,
    restecg: 0,
    thalach: 175,
    exang: 0,
    oldpeak: 0.0,
    slope: 0,
    ca: 0,
    thal: 1,
  },
  "Typical Example": {
    age: 54,
    sex: 1,
    cp: 2,
    trestbps: 130,
    chol: 246,
    fbs: 0,
    restecg: 1,
    thalach: 150,
    exang: 0,
    oldpeak: 1.1,
    slope: 1,
    ca: 1,
    thal: 2,
  },
  "Low Risk Example": {
    age: 61,
    sex: 1,
    cp: 3,
    trestbps: 160,
    chol: 320,
    fbs: 1,
    restecg: 2,
    thalach: 115,
    exang: 1,
    oldpeak: 2.4,
    slope: 2,
    ca: 2,
    thal: 3,
  },
};

function clamp(n, min, max) {
  const num = Number.isFinite(n) ? n : Number(n);
  if (!Number.isFinite(num)) return n;
  return Math.min(Math.max(num, min), max);
}

function formatPercent(prob) {
  const p = Number(prob);
  if (!Number.isFinite(p)) return "—";
  return `${Math.round(p * 1000) / 10}%`;
}

function getRiskMeta(level) {
  switch (level) {
    case "High":
      return { label: "High", className: "risk-high" };
    case "Medium":
      return { label: "Medium", className: "risk-medium" };
    case "Low":
    default:
      return { label: "Low", className: "risk-low" };
  }
}

function getGuidance(level) {
  if (level === "High") {
    return {
      title: "High risk (screening)",
      bullets: [
        "Consider contacting a healthcare professional for evaluation.",
        "If you have chest pain, shortness of breath, or dizziness, seek urgent care.",
        "Track blood pressure, exercise tolerance, and symptoms.",
      ],
    };
  }
  if (level === "Medium") {
    return {
      title: "Medium risk (screening)",
      bullets: [
        "Review lifestyle factors (diet, exercise, sleep, stress).",
        "If you have risk factors (smoking, diabetes, family history), talk to a clinician.",
        "Retest later with updated measurements for trend tracking.",
      ],
    };
  }
  return {
    title: "Low risk (screening)",
    bullets: [
      "Maintain healthy habits (movement, balanced nutrition, sleep).",
      "Continue regular checkups and monitor risk factors.",
      "Remember: low risk ≠ no risk. This is not a diagnosis.",
    ],
  };
}

function predictionLabel(pred) {
  if (pred === 1) return "Model suggests higher likelihood of heart disease";
  if (pred === 0) return "Model suggests lower likelihood of heart disease";
  return "Prediction";
}

function loadHistory() {
  try {
    const raw = localStorage.getItem("heartcare_history");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(next) {
  try {
    localStorage.setItem("heartcare_history", JSON.stringify(next));
  } catch {
    // ignore
  }
}

export default function Predict() {
  const [formData, setFormData] = useState(() => {
    // Start empty but with defaults for selects
    const base = {};
    FIELD_DEFS.forEach((f) => {
      if (f.type === "select") base[f.key] = String(f.options[0].value);
      else base[f.key] = "";
    });
    return base;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // small “looks good” feature: store last runs
  const [history, setHistory] = useState(() => loadHistory().slice(0, 5));

  const [apiOk, setApiOk] = useState(false);

  // API Health check
  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("API offline")))
      .then(() => setApiOk(true))
      .catch(() => setApiOk(false));
  }, []);

  const totalFields = FIELD_DEFS.length;

  const filledCount = useMemo(() => {
    return FIELD_DEFS.reduce((acc, f) => {
      const v = formData[f.key];
      return v !== "" && v !== null && v !== undefined ? acc + 1 : acc;
    }, 0);
  }, [formData]);

  const progressPct = Math.round((filledCount / totalFields) * 100);

  const onChange = (key) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const applyPreset = (name) => {
    const preset = PRESETS[name];
    if (!preset) return;

    const next = { ...formData };
    FIELD_DEFS.forEach((f) => {
      const val = preset[f.key];
      next[f.key] = typeof val === "number" ? String(val) : String(val ?? "");
    });

    setFormData(next);
    setResult(null);
    setError("");
  };

  const resetForm = () => {
    const next = {};
    FIELD_DEFS.forEach((f) => {
      if (f.type === "select") next[f.key] = String(f.options[0].value);
      else next[f.key] = "";
    });
    setFormData(next);
    setResult(null);
    setError("");
  };

  const validate = () => {
    for (const f of FIELD_DEFS) {
      const raw = formData[f.key];
      if (raw === "" || raw === null || raw === undefined) {
        return `Please fill in: ${f.label}`;
      }
      if (f.type === "number") {
        const num = Number(raw);
        if (!Number.isFinite(num)) return `${f.label} must be a number.`;
        if (typeof f.min === "number" && num < f.min) return `${f.label} must be ≥ ${f.min}.`;
        if (typeof f.max === "number" && num > f.max) return `${f.label} must be ≤ ${f.max}.`;
      }
    }
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const vErr = validate();
    if (vErr) {
      setError(vErr);
      return;
    }

    // Build payload in the exact order expected by the backend.
    const payload = {};
    FIELD_DEFS.forEach((f) => {
      const raw = formData[f.key];
      const num = f.type === "number" ? Number(raw) : Number(raw);
      payload[f.key] = Number.isFinite(num) ? num : raw;
    });

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Prediction failed. Check backend logs.");
        return;
      }

      setResult(data);

      // Save to history
      const entry = {
        ts: Date.now(),
        risk_level: data.risk_level,
        probability: data.probability,
      };
      const nextHistory = [entry, ...history].slice(0, 5);
      setHistory(nextHistory);
      saveHistory(nextHistory);
    } catch (err) {
      setError("Could not reach the API. Make sure Flask is running on port 5002.");
    } finally {
      setLoading(false);
    }
  };

  const riskMeta = result ? getRiskMeta(result.risk_level) : null;
  const guidance = result ? getGuidance(result.risk_level) : null;

  const gaugePct = useMemo(() => {
    if (!result) return 0;
    const p = Number(result.probability);
    if (!Number.isFinite(p)) return 0;
    return clamp(Math.round(p * 100), 0, 100);
  }, [result]);

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  return (
    <div className="predict-page">
      <div className="predict-container">
        <div className="predict-topRow">
          <div>
            <h1 className="predict-title">Heart Disease Risk Predictor</h1>
            <p className="predict-subtitle">
              Enter the clinical inputs below. We’ll return a probability score + a simple risk label.
            </p>
          </div>

          <div className={`api-pill ${apiOk ? "ok" : "bad"}`}>API: {apiOk ? "Online" : "Offline"}</div>
        </div>

        <div className="predict-grid">
          {/* LEFT: FORM */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="form-card"
          >
            <div className="form-header">
              <div>
                <div className="form-kicker">Input Form</div>
                <div className="form-progressWrap">
                  <div className="form-progressText">
                    Completion: <b>{progressPct}%</b>
                  </div>
                  <div className="form-progressBar">
                    <div className="form-progressFill" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
              </div>

              <div className="preset-row">
                <div className="preset-label">Presets</div>
                <div className="preset-buttons">
                  {Object.keys(PRESETS).map((name) => (
                    <button
                      key={name}
                      type="button"
                      className="preset-btn"
                      onClick={() => applyPreset(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={onSubmit} className="predict-form">
              <div className="fields-grid">
                {FIELD_DEFS.map((f) => (
                  <div className="field" key={f.key}>
                    <label className="field-label" htmlFor={f.key}>
                      {f.label}
                    </label>

                    {f.type === "select" ? (
                      <select
                        id={f.key}
                        value={formData[f.key]}
                        onChange={onChange(f.key)}
                        className="field-input"
                      >
                        {f.options.map((opt) => (
                          <option key={opt.value} value={String(opt.value)}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={f.key}
                        type="number"
                        value={formData[f.key]}
                        onChange={onChange(f.key)}
                        placeholder={f.placeholder}
                        min={f.min}
                        max={f.max}
                        step={f.step || "1"}
                        className="field-input"
                      />
                    )}

                    {f.type === "number" && (typeof f.min === "number" || typeof f.max === "number") ? (
                      <div className="field-hint">
                        Range: {f.min ?? "—"} to {f.max ?? "—"}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="actions-row">
                <button type="button" className="btn secondary" onClick={resetForm} disabled={loading}>
                  Reset
                </button>
                <button type="submit" className="btn primary" disabled={loading}>
                  {loading ? "Predicting…" : "Predict"}
                </button>
              </div>

              <AnimatePresence>
                {error ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="alert alert-error"
                  >
                    {error}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <AnimatePresence>
                {result ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="result-card"
                  >
                    <div className="result-top">
                      <div>
                        <div className="result-kicker">Prediction Result</div>
                        <div className="result-main">{predictionLabel(result.prediction)}</div>
                        <div className="result-sub">
                          Probability: <b>{formatPercent(result.probability)}</b>
                        </div>
                      </div>

                      {riskMeta ? (
                        <div className={`risk-pill ${riskMeta.className}`}>{riskMeta.label} Risk</div>
                      ) : null}
                    </div>

                    {guidance ? (
                      <div className="guidance">
                        <div className="guidance-title">{guidance.title}</div>
                        <ul className="guidance-list">
                          {guidance.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className="disclaimer">
                      This tool is for educational screening only — not medical advice.
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* RIGHT: SIDE PANEL */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="side-panel"
          >
            <div className="panel-card">
              <div className="panel-title">Risk Gauge</div>
              <div className="gauge-wrap" aria-label="Risk gauge">
                <div className="gauge">
                  <div className="gauge-track" />
                  <div className="gauge-fill" style={{ width: `${gaugePct}%` }} />
                </div>
                <div className="gauge-metrics">
                  <div className="gauge-metric">
                    <div className="metric-label">Risk</div>
                    <div className="metric-value">{result ? result.risk_level : "—"}</div>
                  </div>
                  <div className="gauge-metric">
                    <div className="metric-label">Probability</div>
                    <div className="metric-value">{result ? formatPercent(result.probability) : "—"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel-card">
              <div className="panel-title">Recent Predictions</div>
              {history.length === 0 ? (
                <div className="panel-muted">No runs yet. Your last 5 results will show here.</div>
              ) : (
                <div className="history-list">
                  {history.map((h) => (
                    <div key={h.ts} className="history-item">
                      <div className="history-left">
                        <div className={`history-pill ${getRiskMeta(h.risk_level).className}`}>
                          {h.risk_level}
                        </div>
                        <div className="history-prob">{formatPercent(h.probability)}</div>
                      </div>
                      <div className="history-time">
                        {new Date(h.ts).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="panel-actions">
                <button type="button" className="btn tiny" onClick={clearHistory} disabled={history.length === 0}>
                  Clear
                </button>
              </div>
            </div>

            <div className="panel-card">
              <div className="panel-title">Tips</div>
              <div className="panel-muted">
                • Try a preset to demo quickly<br />
                • If API is offline, start the Flask backend first<br />
                • Keep screenshots for your report
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
