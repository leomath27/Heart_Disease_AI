from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load your saved model
model = joblib.load('random_forest_model_updated.pkl')

# Define a route for prediction
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)
        features = np.array(data['features']).reshape(1, -1)
        prediction_proba = model.predict_proba(features)

        if prediction_proba[0][1] > 0.5:
            result = "Heart disease detected"
        else:
            result = "No heart disease detected"

        return jsonify({"prediction": result, "probability": prediction_proba[0][1]})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
