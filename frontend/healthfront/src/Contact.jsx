import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./Contact.css";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3500);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="contact-header"
        >
          <h1>
            Get in touch with <span>HeartCare</span>
          </h1>
          <p>
            Questions about the model, the inputs, or how to run the project locally? Send a message
            and we’ll get back to you.
          </p>
        </motion.div>

        <div className="contact-grid">
          <div className="contact-infoCard">
            <div className="infoRow">
              <div className="infoIcon">📍</div>
              <div>
                <div className="infoTitle">Location</div>
                <div className="infoText">Ottawa, Canada (Local Demo)</div>
              </div>
            </div>

            <div className="infoRow">
              <div className="infoIcon">⏱️</div>
              <div>
                <div className="infoTitle">Response time</div>
                <div className="infoText">Usually within 24–48 hours</div>
              </div>
            </div>

            <div className="infoRow">
              <div className="infoIcon">🩺</div>
              <div>
                <div className="infoTitle">Medical note</div>
                <div className="infoText">
                  HeartCare is a screening tool, not a diagnosis. Always consult a healthcare
                  professional.
                </div>
              </div>
            </div>

            <div className="infoTip">
              Tip: For your report, include screenshots of <b>Home → Predict → Results → Contact</b>.
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="contact-formCard"
            onSubmit={onSubmit}
          >
            <label>
              <span>Name</span>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </label>

            <label>
              <span>Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              <span>Message</span>
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                placeholder="Write your message…"
                rows={6}
                required
              />
            </label>

            <button className="contact-submit" type="submit">
              Send Message
            </button>

            <div className="contact-footer">
              Want to try the model now? <Link to="/predict">Go to Predict</Link>.
            </div>

            {sent && <div className="contact-toast">Message sent! (demo)</div>}
          </motion.form>
        </div>
      </div>
    </div>
  );
}
