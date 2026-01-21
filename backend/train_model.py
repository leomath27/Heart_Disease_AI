import os
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

BASE_DIR = Path(__file__).resolve().parent
REPO_DIR = BASE_DIR.parent

FEATURE_ORDER = [
  "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"
]


def _find_dataset() -> Path:
  candidates = [
    BASE_DIR / "data" / "raw" / "heart.csv",
    BASE_DIR / "data" / "raw" / "heart_2.csv",
    REPO_DIR / "heart.csv",
  ]
  for p in candidates:
    if p.exists():
      return p

  # try any csv in raw folder
  raw_dir = BASE_DIR / "data" / "raw"
  if raw_dir.exists():
    for p in raw_dir.glob("*.csv"):
      return p

  raise FileNotFoundError(
    "Dataset not found. Put a CSV into backend/data/raw (e.g., heart.csv)."
  )


def main() -> None:
  csv_path = _find_dataset()
  df = pd.read_csv(csv_path)

  # target column name varies across datasets
  target_col = None
  for cand in ("target", "output", "label", "HeartDisease"):
    if cand in df.columns:
      target_col = cand
      break
  if target_col is None:
    raise ValueError(
      f"Could not find target column in {csv_path.name}. Expected one of: target, output, label, HeartDisease"
    )

  # Keep only expected features (drop extras)
  missing = [c for c in FEATURE_ORDER if c not in df.columns]
  if missing:
    raise ValueError(
      f"Missing required feature columns: {missing}. Your CSV columns were: {list(df.columns)}"
    )

  X = df[FEATURE_ORDER]
  y = df[target_col]

  X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y if len(set(y)) > 1 else None
  )

  model = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", RandomForestClassifier(n_estimators=300, random_state=42)),
  ])

  model.fit(X_train, y_train)
  acc = model.score(X_test, y_test)

  out_dir = BASE_DIR / "models"
  out_dir.mkdir(parents=True, exist_ok=True)
  out_path = out_dir / "heart_model_pipeline.joblib"
  joblib.dump(model, out_path)

  print(f"Saved model -> {out_path}")
  print(f"Holdout accuracy: {acc:.3f}")


if __name__ == "__main__":
  main()
