import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import About from "./About";
import Stats from "./Stats";

import "./Home.css";

export default function Home() {
  const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="home-page">
      {/* HERO */}
      <section className="home-hero">
        <div className="home-container home-heroGrid">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="home-heroLeft"
          >
            <div className="home-badge">
              <span className="dot" />
              AI-Powered Early Screening
            </div>

            <h1 className="home-title">
              Empowering Early Detection of <span>Heart Disease</span>
            </h1>

            <p className="home-subtitle">
              HeartCare helps you estimate heart disease risk using an ML model trained on clinical
              features. Get a clear risk score + an easy explanation in seconds.
            </p>

            <div className="home-actions">
              <Link className="home-btn home-btnPrimary" to="/predict">
                Start Prediction
              </Link>
              <a className="home-btn home-btnGhost" href="#how">
                How it works
              </a>
            </div>

            <div className="home-trust">
              <div className="trustItem">
                <div className="trustIcon">⚡</div>
                <div>
                  <div className="trustTitle">Instant</div>
                  <div className="trustText">Results in seconds</div>
                </div>
              </div>

              <div className="trustItem">
                <div className="trustIcon">🧠</div>
                <div>
                  <div className="trustTitle">ML Model</div>
                  <div className="trustText">Consistent predictions</div>
                </div>
              </div>

              <div className="trustItem">
                <div className="trustIcon">🔒</div>
                <div>
                  <div className="trustTitle">Local</div>
                  <div className="trustText">Runs on your machine</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="home-section">
        <div className="home-container">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="home-h2"
          >
            How it works
          </motion.h2>

          <div className="home-steps">
            <div className="stepCard">
              <div className="stepNum">1</div>
              <div className="stepTitle">Enter clinical inputs</div>
              <div className="stepText">
                Fill the form on the Predict page (we guide you with tips + examples).
              </div>
            </div>

            <div className="stepCard">
              <div className="stepNum">2</div>
              <div className="stepTitle">We run the model</div>
              <div className="stepText">
                Your inputs are normalized and passed into the trained pipeline.
              </div>
            </div>

            <div className="stepCard">
              <div className="stepNum">3</div>
              <div className="stepTitle">Get a clear result</div>
              <div className="stepText">
                You’ll see a risk score plus a friendly explanation to interpret it.
              </div>
            </div>
          </div>

          <div className="home-cta">
            <div className="home-ctaText">Ready to test it? Jump straight to the predictor.</div>
            <Link className="home-btn home-btnPrimary" to="/predict">
              Go to Predict
            </Link>
          </div>
        </div>
      </section>

      {/* KEEP YOUR SECTIONS */}
      <About />

      <section id="stats" className="home-section">
        <Stats />
      </section>
    </div>
  );
}
