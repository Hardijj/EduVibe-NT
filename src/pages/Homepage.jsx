import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";

import imageUrl10 from "../assets/10img.jpg";
import mlogo from "../assets/ntmlogo.jpg";

const Homepage = () => {
  const navigate = useNavigate();

  // login flag (unchanged)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // welcome popup (unchanged)
  const [showPopup, setShowPopup] = useState(true);
  // 🔔 new bell-chip state
  const [showBell, setShowBell] = useState(false);

  /* login status */
  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
  }, []);

  /* decide whether to show the bell */
  useEffect(() => {
    if (
      Notification.permission !== "granted" &&
      !localStorage.getItem("bellDismissed")
    ) {
      setShowBell(true);
    }
  }, []);

  /* handle Enable Notifications */
  const handleEnablePush = async () => {
    try {
      if (typeof window.enablePush === "function") {
        await window.enablePush();
      }
    } finally {
      setShowBell(false);
      localStorage.setItem("bellDismissed", "1");
    }
  };

  const handleClick = (classNumber) => {
    navigate(`/subjects/${classNumber}`);
  };

  return (
    <>
      {/* 🔔 floating bell chip */}
      {showBell && (
        <button
          onClick={handleEnablePush}
          style={{
            position: "fixed",
            bottom: 22,
            right: 22,
            background: "#ffbe0b",
            color: "#000",
            border: "none",
            borderRadius: "50px",
            padding: "10px 16px",
            fontWeight: 600,
            boxShadow: "0 3px 8px rgba(0,0,0,0.35)",
            zIndex: 999,
            cursor: "pointer",
          }}
        >
          🔔 Enable&nbsp;Notifications
        </button>
      )}

      {/* Welcome popup (unchanged) */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#1e1e1e",
              padding: 24,
              borderRadius: 10,
              width: "90%",
              maxWidth: 400,
              textAlign: "center",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#fff",
              boxShadow: "0 0 20px rgba(255,255,255,0.08)",
            }}
          >
            <h2 style={{ marginBottom: 12 }}>Welcome to EduVibe!</h2>
            <p style={{ marginBottom: 16, color: "#ccc" }}>
              Explore batches and start learning with ease. This website is
              absolutely free. Join our Telegram channel for updates 👇👇
            </p>
            <a
              href="https://t.me/eduvibe_all_classes"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                backgroundColor: "#229ED9",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: 6,
                textDecoration: "none",
                marginBottom: 10,
              }}
            >
              Join Telegram
            </a>
            <br />
            <button
              onClick={() => setShowPopup(false)}
              style={{
                backgroundColor: "#333",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                marginTop: 10,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          width: "100%",
          padding: "10px 0",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #444",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 20,
          color: "#111",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        EduVibe-NT
      </div>

      {/* Main content */}
      <div
        className="container"
        style={{ backgroundColor: "#121212", minHeight: "100vh", paddingBottom: 40 }}
      >
        <img src={mlogo} alt="Logo" className="big-logo" />
        <h2 className="section-heading" style={{ color: "#fff" }}>
          Our Batches
        </h2>

        <div className="batch-container">
          <div className="click-box" onClick={() => handleClick(10)}>
            <img
              src={imageUrl10}
              alt="Aarambh Batch 2025-26"
              className="homepage-image"
            />
            <h1 style={{ color: "#fff" }}>Aarambh Batch 2.0 2025-26</h1>
          </div>

          <div className="click-box" onClick={() => handleClick(11)}>
            <img
              src="https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/183130728609_Prarambh%20BATCh%20Science%20Class%2011.png"
              alt="Class 11 Science"
              className="homepage-image"
            />
            <h1 style={{ color: "#fff" }}>Prarambh 2.0 Science Class 11</h1>
          </div>

          <div className="click-box" onClick={() => handleClick(113)}>
            <img
              src="https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/737975028610_Prarambh%20BATCh%20Commerce%2011.png"
              alt="Class 11 Commerce"
              className="homepage-image"
            />
            <h1 style={{ color: "#fff" }}>Prarambh 2.0 Commerce Class 11</h1>
          </div>

          <div className="click-box" onClick={() => handleClick(111)}>
            <img
              src="https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/216113028517_Prarambh%20BATCh%20Humanities%2011.png"
              alt="Class 11 Humanities"
              className="homepage-image"
            />
            <h1 style={{ color: "#fff" }}>Prarambh 2.0 Humanities Class 11</h1>
          </div>

          <div className="click-box" onClick={() => handleClick(9)}>
            <img
              src="https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/152792333113_9th%20aarambh%202.0%20banner%20app.jpg"
              alt="Class 9 Aarambh"
              className="homepage-image"
            />
            <h1 style={{ color: "#fff" }}>Aarambh Batch 2.0 Class 9</h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default Homepage;
