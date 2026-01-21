import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";
  const hash = location.hash || "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // If user navigates to /#how or /#stats, scroll after route renders.
  useEffect(() => {
    if (!isHome) return;
    if (hash === "#how") setTimeout(() => scrollToId("how"), 60);
    if (hash === "#stats") setTimeout(() => scrollToId("stats"), 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHome, hash]);

  const goToSection = (targetHash, id) => (e) => {
    e.preventDefault();

    if (!isHome) {
      navigate(`/${targetHash}`);
      return;
    }

    window.history.replaceState(null, "", targetHash);
    scrollToId(id);
  };

  const homeIsActive = isHome && hash !== "#how" && hash !== "#stats";
  const howIsActive = isHome && hash === "#how";
  const statsIsActive = isHome && hash === "#stats";

  return (
    <header className={`nav-wrap ${scrolled ? "nav-scrolled" : ""}`}>
      <nav className="nav-inner" aria-label="Primary">
        <Link to="/" className="nav-brand" aria-label="HeartCare Home">
          <span className="nav-logo" aria-hidden>
            ❤
          </span>
          <span className="nav-brandText">HeartCare</span>
        </Link>

        <div className="nav-pills" role="navigation" aria-label="Sections">
          <Link to="/" className={`nav-link ${homeIsActive ? "active" : ""}`}>
            Home
          </Link>

          <a
            href="/#how"
            onClick={goToSection("#how", "how")}
            className={`nav-link ${howIsActive ? "active" : ""}`}
          >
            How it works
          </a>

          <a
            href="/#stats"
            onClick={goToSection("#stats", "stats")}
            className={`nav-link ${statsIsActive ? "active" : ""}`}
          >
            Stats
          </a>

          <Link
            to="/contact"
            className={`nav-link ${location.pathname === "/contact" ? "active" : ""}`}
          >
            Contact
          </Link>
        </div>

        <div className="nav-cta">
          <Link to="/predict" className="nav-btn">
            Start Prediction
          </Link>
        </div>
      </nav>
    </header>
  );
}
