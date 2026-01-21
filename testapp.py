import requests

# URL of your Flask server
url = 'http://127.0.0.1:5000/predict'

# High risk feature values
data = {
    'features': [0.7, 1, 1, 0.48, 0.24, 1, 0, 0.6, 0, 0.3, 0, 0, 0.3]
}




# (normalized values: high age, male, bad chest pain, high BP, high cholesterol, high sugar, abnormal ECG, low heart rate, exercise angina, high oldpeak, flat slope, major vessels, thal defect)

# Send POST request
response = requests.post(url, json=data)

# Print response
print(response.json())
