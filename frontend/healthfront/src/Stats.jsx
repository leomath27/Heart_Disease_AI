import React, { useEffect, useState } from "react";
import "./Stats.css";

const API = "http://127.0.0.1:5002/api/stats";

export default function Stats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  if (!stats) return <p className="loading">Loading statistics…</p>;

  const { dataset, model, feature_importance } = stats;

  const topFeatures = Object.entries(feature_importance)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const [
    tn,
    fp,
    fn,
    tp
  ] = model.confusion_matrix.flat();

  return (
    <div className="stats-container">
      <h1>Model & Dataset Statistics</h1>

      {/* Dataset Overview */}
      <section>
        <h2>Dataset Overview</h2>
        <div className="card-grid">
          <StatCard label="Patients" value={dataset.samples} />
          <StatCard label="Heart Disease Rate" value={`${(dataset.disease_rate * 100).toFixed(1)}%`} />
          <StatCard label="Avg Age (Disease)" value={dataset.avg_age_disease.toFixed(1)} />
          <StatCard label="Avg Age (No Disease)" value={dataset.avg_age_no_disease.toFixed(1)} />
        </div>
      </section>

      {/* Model Performance */}
      <section>
        <h2>Model Performance</h2>
        <table className="metrics-table">
          <tbody>
            <Metric label="Accuracy" value={`${(model.accuracy * 100).toFixed(1)}%`} />
            <Metric label="Precision" value={`${(model.precision * 100).toFixed(1)}%`} />
            <Metric label="Recall" value={`${(model.recall * 100).toFixed(1)}%`} />
            <Metric label="ROC-AUC" value={model.roc_auc.toFixed(3)} />
          </tbody>
        </table>
      </section>
    </div>
  );
}

const StatCard = ({ label, value }) => (
  <div className="stat-card">
    <p>{label}</p>
    <h3>{value}</h3>
  </div>
);

const Metric = ({ label, value }) => (
  <tr>
    <td>{label}</td>
    <td>{value}</td>
  </tr>
);

const ConfCell = ({ label, value }) => (
  <div className="conf-cell">
    <p>{label}</p>
    <h3>{value}</h3>
  </div>
);
