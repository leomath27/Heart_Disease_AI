import React from "react";
import { motion } from "framer-motion";
import "./About.css";

export default function About() {
  return (
    <section className="about-section" id="about">
      <div className="home-container">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="home-h2"
        >
          About HeartCare
        </motion.h2>

        <p className="about-lead">
          HeartCare is a lightweight demo that shows how machine learning can support early
          screening. Enter a few clinical measurements and we’ll estimate risk using a trained
          model.
        </p>

        <div className="about-grid">
          <div className="about-card">
            <div className="about-icon">💡</div>
            <div className="about-title">AI-powered prediction</div>
            <div className="about-text">
              Generates a risk score from common clinical inputs (age, blood pressure, cholesterol,
              etc.) and presents the result in a clear way.
            </div>
          </div>

          <div className="about-card">
            <div className="about-icon">⚙️</div>
            <div className="about-title">Full-stack project</div>
            <div className="about-text">
              A Python backend (Flask) exposes an <code>/api/predict</code> endpoint, while a React UI
              provides the form, guidance, and results view.
            </div>
          </div>

          <div className="about-card">
            <div className="about-icon">🩺</div>
            <div className="about-title">Important note</div>
            <div className="about-text">
              This is a screening tool — not a diagnosis. Always consult a healthcare professional.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
