import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";
import imageUrl10 from "../assets/10img.jpg";
import mlogo from "../assets/ntmlogo.jpg";

const VAPID_PUBLIC = "BFQe3gbumuWcVGq-HwzVlCz72z0VE_m6D2AlQFYl8IFwNpqGP2bTWwSJIqur9toFk4nK6Cc52S_x93YeERrMrm4"; // replace with yours

const Homepage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    if (Notification.permission === "default") {
      setShowPermissionPopup(true);
    }
  }, []);

  const urlB64ToUint8 = (b64) =>
    Uint8Array.from(
      atob((b64 + "=".repeat((4 - b64.length % 4) % 4)).replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

  const handleEnablePush = async () => {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setShowPermissionPopup(false);
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8(VAPID_PUBLIC),
      });

      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      setShowPermissionPopup(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Push error:", err);
    }
  };

  const handleCloseWelcome = () => setShowWelcomePopup(false);

  const handleClick = (cls) => navigate(`/subjects/${cls}`);

  return (
    <>
      {/* ===== Welcome Popup ===== */}
      {showWelcomePopup && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ fontWeight: "bold", marginBottom: "12px" }}>Welcome to EduVibe!</h2>
            <p style={{ marginBottom: "16px", color: "#ccc" }}>
              Explore batches and start learning with ease. This website is absolutely free of cost.
              If you haven't joined our Telegram channel, join now for updates 👇👇
            </p>
            <a
              href="https://t.me/eduvibe_all_classes"
              target="_blank"
              rel="noopener noreferrer"
              style={primaryBtn}
            >
              Join Telegram
            </a>
            <br />
            <button style={ghostBtn} onClick={handleCloseWelcome}>Close</button>
          </div>
        </div>
      )}

      {/* ===== Notification Permission Popup ===== */}
      {showPermissionPopup && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ marginBottom: "12px" }}>🔔 Enable Notifications</h3>
            <p style={{ color: "#ccc", marginBottom: "16px" }}>
              Get instant updates for live classes & lectures!
            </p>
            <button style={primaryBtn} onClick={handleEnablePush}>Allow Notifications</button>
            <button style={ghostBtn} onClick={() => setShowPermissionPopup(false)}>Maybe Later</button>
          </div>
        </div>
      )}

      {/* ===== Toast Popup ===== */}
      {showToast && (
        <div style={toastStyle}>
          ✅ You’ll now receive notifications!
        </div>
      )}

      {/* ===== Header ===== */}
      <div style={headerStyle}>EduVibe-NT</div>

      {/* ===== Main Content ===== */}
      <div className="container" style={mainStyle}>
        <img src={mlogo} alt="Logo" className="big-logo" />
        <h2 className="section-heading" style={{ color: "#fff" }}>Our Batches</h2>

        <div className="batch-container">
          <Batch img={imageUrl10} title="Aarambh Batch 2.0 2025-26" onClick={() => handleClick(10)} />
          <Batch img="https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/183130728609_Prarambh%20BATCh%20Science%20Class%2011.png" title="Prarambh 2.0 Science Class 11" onClick={() => handleClick(11)} />
          <Batch img="https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/737975028610_Prarambh%20BATCh%20Commerce%2011.png" title="Prarambh 2.0 Commerce Class 11" onClick={() => handleClick(113)} />
          <Batch img="https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/216113028517_Prarambh%20BATCh%20Humanities%2011.png" title="Prarambh 2.0 Humanities Class 11" onClick={() => handleClick(111)} />
          <Batch img="https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/152792333113_9th%20aarambh%202.0%20banner%20app.jpg" title="Aarambh Batch 2.0 Class 9" onClick={() => handleClick(9)} />
        </div>
      </div>
    </>
  );
};

const Batch = ({ img, title, onClick }) => (
  <div className="click-box" onClick={onClick}>
    <img src={img} alt={title} className="homepage-image" />
    <h1 style={{ color: "#fff" }}>{title}</h1>
  </div>
);

/* ========== Styles ========== */
const overlayStyle = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
};
const modalStyle = {
  backgroundColor: "#1e1e1e", padding: 24, borderRadius: 10,
  width: "90%", maxWidth: 400, textAlign: "center", color: "#fff",
  boxShadow: "0 0 20px rgba(255,255,255,0.1)",
};
const primaryBtn = {
  display: "inline-block", backgroundColor: "#229ED9", color: "#fff",
  padding: "10px 20px", borderRadius: "6px", textDecoration: "none",
  border: "none", marginTop: "10px", cursor: "pointer",
};
const ghostBtn = {
  ...primaryBtn, backgroundColor: "#333", marginTop: 10,
};
const toastStyle = {
  position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
  background: "#28a745", color: "#fff", padding: "10px 20px", borderRadius: 6,
  boxShadow: "0 2px 6px rgba(0,0,0,0.4)", zIndex: 999,
};
const headerStyle = {
  width: "100%", padding: "10px 0", backgroundColor: "#ffffff", borderBottom: "1px solid #444",
  textAlign: "center", fontWeight: "bold", fontSize: "20px", color: "#111",
  position: "sticky", top: "0", zIndex: "10",
};
const mainStyle = {
  backgroundColor: "#121212", minHeight: "100vh", paddingBottom: "40px"
};

export default Homepage;
