# Heart_Disease_AI — Heart Disease Risk Predictor (React + Flask)

This project is a **demo** web app that lets a user enter health metrics and get a **risk estimate** from a trained ML model.

## Repo structure

- `backend/` — Flask API + training script
  - `app.py` — serves the API (`/api/*`) and (optionally) the React production build
  - `train_model.py` — trains the model and saves it to `backend/models/heart_model_pipeline.joblib`
  - `data/` — raw + processed datasets (demo files)
  - `models/` — saved model artifacts
- `frontend/healthfront/` — React UI (Home + Predict + Contact)

> Note: the root-level `app.py` and `index.html` are legacy experiments. The real app uses `backend/app.py` + the React UI.

> Educational demo only. Not medical advice.

## Run locally (development)

### 1) Start the backend (Flask)

From the repo root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# (Optional) retrain the model
python train_model.py

# Start the API (default: http://127.0.0.1:5002)
python app.py
```

### 2) Start the frontend (React)

In a **second** terminal:

```bash
cd frontend/healthfront
npm install
npm start
```

The React dev server uses a proxy to the backend on `5002`, so the UI can call `/api/predict` without extra CORS config.

## Production (single server)

Build the React app, then let Flask serve it:

```bash
cd frontend/healthfront
npm run build

cd ../../backend
python app.py
```

Open: `http://127.0.0.1:5002`

## API

### Health check
`GET /api/health`

### Predict
`POST /api/predict` with JSON body:

```json
{
  "age": 57,
  "sex": 1,
  "cp": 2,
  "trestbps": 130,
  "chol": 250,
  "fbs": 0,
  "restecg": 1,
  "thalach": 160,
  "exang": 0,
  "oldpeak": 1.2,
  "slope": 1,
  "ca": 0,
  "thal": 2
}
```

Response example:

```json
{
  "prediction": 0,
  "risk_level": "Low",
  "probability": 0.23
}
```
