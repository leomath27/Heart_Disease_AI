document.querySelector("form").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent the form from submitting to the server

  // Get input values from the form and store them in an array
  const formDataArray = [
    document.getElementById("age").value,
    document.getElementById("sex").value,
    document.getElementById("cp").value,
    document.getElementById("trestbps").value,
    document.getElementById("chol").value,
    document.getElementById("fbs").value,
    document.getElementById("restecg").value,
    document.getElementById("thalach").value,
    document.getElementById("exang").value,
    document.getElementById("oldpeak").value,
    document.getElementById("slope").value,
    document.getElementById("ca").value,
    document.getElementById("thal").value,
  ];

  // Display the form data array on the page
  const resultDiv = document.createElement("div");
  resultDiv.innerHTML = `
      <h3>Form Data (Array):</h3>
      <pre>${JSON.stringify(formDataArray, null, 2)}</pre>
    `;
  document.body.appendChild(resultDiv);

  const normalizedData = normalizeData(formDataArray);
  console.log(normalizedData);
  function normalizeData(formDataArray) {
    // Normalization ranges for each feature (from your dataset)
    const normalizationRanges = {
      age: [29, 77], // Age range: 29-77
      sex: [0, 1], // Male (1) or Female (0)
      cp: [0, 3], // Chest Pain (0: typical, 1: atypical, 2: non-anginal, 3: asymptomatic)
      trestbps: [94, 200], // Blood Pressure (94-200)
      chol: [126, 564], // Cholesterol (126-564)
      fbs: [0, 1], // Fasting Blood Sugar (0 or 1)
      restecg: [0, 2], // Resting ECG results (0: normal, 1: ST-T wave abnormality, 2: hypertrophy)
      thalach: [71, 202], // Max Heart Rate (71-202)
      exang: [0, 1], // Exercise Angina (0: No, 1: Yes)
      oldpeak: [0, 6.2], // Oldpeak (0-6.2)
      slope: [0, 2], // Slope of ST Segment (0: up, 1: flat, 2: down)
      ca: [0, 3], // Major vessels (0-3)
      thal: [1, 3], // Thalassemia (1: normal, 2: fixed, 3: reversible)
    };

    // Normalize each feature using the defined ranges
    return [
      normalize(formDataArray[0], normalizationRanges.age), // age
      normalize(formDataArray[1], normalizationRanges.sex), // sex (0 for female, 1 for male)
      normalize(formDataArray[2], normalizationRanges.cp), // chest pain
      normalize(formDataArray[3], normalizationRanges.trestbps), // blood pressure
      normalize(formDataArray[4], normalizationRanges.chol), // cholesterol
      normalize(formDataArray[5], normalizationRanges.fbs), // fasting blood sugar
      normalize(formDataArray[6], normalizationRanges.restecg), // resting ECG
      normalize(formDataArray[7], normalizationRanges.thalach), // max heart rate
      normalize(formDataArray[8], normalizationRanges.exang), // exercise angina
      normalize(formDataArray[9], normalizationRanges.oldpeak), // oldpeak
      normalize(formDataArray[10], normalizationRanges.slope), // slope
      normalize(formDataArray[11], normalizationRanges.ca), // major vessels
      normalize(formDataArray[12], normalizationRanges.thal), // thalassemia
    ];
  }

  // Helper function to normalize a value between 0 and 1
  function normalize(value, range) {
    const epsilon = 0.000001; // very small number
    return (value - range[0]) / (range[1] - range[0] + epsilon);
  }
});
