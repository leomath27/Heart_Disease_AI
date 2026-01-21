import os
from pathlib import Path

import numpy as np
import pandas as pd
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import joblib

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    roc_auc_score,
    confusion_matrix,
)

# --------------------
# Paths
# --------------------
BASE_DIR = Path(__file__).resolve().parent
REPO_DIR = BASE_DIR.parent
FRONTEND_BUILD_DIR = REPO_DIR / "frontend" / "healthfront" / "build"

FEATURE_ORDER = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal",
]


def _resolve_model_path() -> Path:
    env_path = os.getenv("MODEL_PATH")
    candidates = [
        Path(env_path).expanduser().resolve() if env_path else None,
        BASE_DIR / "models" / "heart_model_pipeline.joblib",
        BASE_DIR / "heart_model_pipeline.joblib",
        REPO_DIR / "backend" / "models" / "heart_model_pipeline.joblib",
        REPO_DIR / "heart_model_pipeline.joblib",
    ]

    for p in candidates:
        if p and p.exists():
            return p

    raise FileNotFoundError("Model bundle not found.")


def _resolve_dataset_path() -> Path:
    candidates = [
        REPO_DIR / "heart.csv",
        REPO_DIR / "backend" / "heart.csv",
        REPO_DIR / "combined_heart_dataset.xlsx",
        REPO_DIR / "combined_normalized_data.xlsx",
    ]

    for p in candidates:
        if p.exists():
            return p

    raise FileNotFoundError("Dataset not found for stats.")


# --------------------
# Load model
# --------------------
MODEL_PATH = _resolve_model_path()
_bundle = joblib.load(MODEL_PATH)

if isinstance(_bundle, dict) and "pipeline" in _bundle:
    MODEL = _bundle["pipeline"]
    saved_features = _bundle.get("features")
    if isinstance(saved_features, list):
        FEATURE_ORDER = saved_features
else:
    MODEL = _bundle


# --------------------
# App
# --------------------
app = Flask(__name__, static_folder=str(FRONTEND_BUILD_DIR), static_url_path="")
CORS(app)


def _risk_level(prob: float) -> str:
    if prob >= 0.7:
        return "High"
    if prob >= 0.4:
        return "Medium"
    return "Low"


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "model_path": str(MODEL_PATH),
    })


# --------------------
# Prediction
# --------------------
@app.post("/api/predict")
def predict():
    payload = request.get_json(silent=True) or {}

    missing = [k for k in FEATURE_ORDER if k not in payload]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    try:
        row = {k: float(payload[k]) for k in FEATURE_ORDER}
    except Exception:
        return jsonify({"error": "All input fields must be numeric."}), 400

    X = pd.DataFrame([row], columns=FEATURE_ORDER)

    if hasattr(MODEL, "predict_proba"):
        prob = float(MODEL.predict_proba(X)[0][1])
    else:
        prob = float(MODEL.predict(X)[0])

    pred = 1 if prob >= 0.5 else 0

    return jsonify({
        "prediction": pred,
        "probability": prob,
        "risk_level": _risk_level(prob),
    })


# --------------------
# REAL STATS ENDPOINT
# --------------------
@app.get("/api/stats")
def stats():
    data_path = _resolve_dataset_path()

    # Load dataset
    if data_path.suffix == ".csv":
        df = pd.read_csv(data_path)
    else:
        df = pd.read_excel(data_path)

    if "target" not in df.columns:
        return jsonify({"error": "Dataset must contain 'target' column"}), 400

    X = df[FEATURE_ORDER]
    y = df["target"]

    y_pred = MODEL.predict(X)
    y_prob = MODEL.predict_proba(X)[:, 1]

    # Feature importance (safe extraction)
    feature_importance = {}
    for step in reversed(getattr(MODEL, "steps", [])):
        if hasattr(step[1], "feature_importances_"):
            feature_importance = dict(
                zip(FEATURE_ORDER, step[1].feature_importances_)
            )
            break

    stats = {
        "dataset": {
            "samples": int(len(df)),
            "disease_rate": float(y.mean()),
            "avg_age_disease": float(df[df["target"] == 1]["age"].mean()),
            "avg_age_no_disease": float(df[df["target"] == 0]["age"].mean()),
            "male_ratio": float((df["sex"] == 1).mean()),
        },
        "model": {
            "accuracy": float(accuracy_score(y, y_pred)),
            "precision": float(precision_score(y, y_pred)),
            "recall": float(recall_score(y, y_pred)),
            "roc_auc": float(roc_auc_score(y, y_prob)),
            "confusion_matrix": confusion_matrix(y, y_pred).tolist(),
        },
        "feature_importance": feature_importance,
    }

    return jsonify(stats)


# --------------------
# Frontend serving
# --------------------
@app.get("/")
def serve_index():
    if FRONTEND_BUILD_DIR.exists():
        return send_from_directory(FRONTEND_BUILD_DIR, "index.html")
    return jsonify({"message": "Frontend build not found"}), 404


@app.get("/<path:path>")
def serve_static(path: str):
    if not FRONTEND_BUILD_DIR.exists():
        return jsonify({"error": "Frontend build not found"}), 404

    file_path = FRONTEND_BUILD_DIR / path
    if file_path.exists():
        return send_from_directory(FRONTEND_BUILD_DIR, path)

    return send_from_directory(FRONTEND_BUILD_DIR, "index.html")


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5002"))
    app.run(host="0.0.0.0", port=port, debug=True)
