import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";
import imageUrl10 from "../assets/10img.jpg";
import mlogo from "../assets/ntmlogo.jpg";

const VAPID_PUBLIC = "BFQe3gbumuWcVGq-HwzVlCz72z0VE_m6D2AlQFYl8IFwNpqGP2bTWwSJIqur9toFk4nK6Cc52S_x93YeERrMrm4";           //  <-- put yours here

const Homepage = () => {
  const navigate = useNavigate();

  /* ───────── state ───────── */
  const [showRequest, setShowRequest] = useState(false);   // ask perm
  const [showConfirm, setShowConfirm] = useState(false);   // success toast

  /* ───────── ask only if needed ───────── */
  useEffect(() => {
    if (Notification.permission === "default") {
      setShowRequest(true);
    }
  }, []);

  /* ───────── helpers ───────── */
  const urlB64ToUint8 = (b64) =>
    Uint8Array.from(atob((b64 + "=".repeat((4 - b64.length % 4) % 4)).replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0));

  const handleEnablePush = async () => {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return setShowRequest(false);

      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8(VAPID_PUBLIC),
      });

      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub }),
      });

      setShowRequest(false);
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    } catch (err) {
      console.error("Push setup error:", err);
    }
  };

  const handleClick = (cls) => navigate(`/subjects/${cls}`);

  /* ───────── UI ───────── */
  return (
    <>
      {/* === permission popup === */}
      {showRequest && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginBottom: 12 }}>Enable Notifications</h2>
            <p style={{ color: "#ccc", marginBottom: 16 }}>
              Allow notifications to get instant updates on new classes & uploads.
            </p>
            <button style={btnMain} onClick={handleEnablePush}>
              Allow Notifications
            </button>
            <button style={btnGhost} onClick={() => setShowRequest(false)}>
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* === success toast === */}
      {showConfirm && (
        <div style={toastStyle}>✅ You’ll now receive notifications!</div>
      )}

      {/* === header === */}
      <header style={headerStyle}>EduVibe-NT</header>

      {/* === main content === */}
      <div className="container" style={mainStyle}>
        <img src={mlogo} alt="Logo" className="big-logo" />
        <h2 className="section-heading" style={{ color: "#fff" }}>Our Batches</h2>

        <div className="batch-container">
          <Batch img={imageUrl10} head="Aarambh Batch 2.0 2025-26" onClick={() => handleClick(10)} />
          <Batch img="https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/183130728609_Prarambh%20BATCh%20Science%20Class%2011.png"
                 head="Prarambh 2.0 Science Class 11" onClick={() => handleClick(11)} />
          <Batch img="https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/737975028610_Prarambh%20BATCh%20Commerce%2011.png"
                 head="Prarambh 2.0 Commerce Class 11" onClick={() => handleClick(113)} />
          <Batch img="https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/216113028517_Prarambh%20BATCh%20Humanities%2011.png"
                 head="Prarambh 2.0 Humanities Class 11" onClick={() => handleClick(111)} />
          <Batch img="https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/152792333113_9th%20aarambh%202.0%20banner%20app.jpg"
                 head="Aarambh Batch 2.0 Class 9" onClick={() => handleClick(9)} />
        </div>
      </div>
    </>
  );
};

/* ========== small helper component ========== */
const Batch = ({ img, head, onClick }) => (
  <div className="click-box" onClick={onClick}>
    <img src={img} alt={head} className="homepage-image" />
    <h1 style={{ color: "#fff" }}>{head}</h1>
  </div>
);

/* ========== styles ========== */
const overlayStyle = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex",
  alignItems: "center", justifyContent: "center", zIndex: 1000,
};
const modalStyle = {
  background: "#1e1e1e", padding: 24, borderRadius: 10, width: "90%",
  maxWidth: 380, textAlign: "center", color: "#fff", boxShadow: "0 0 20px rgba(255,255,255,0.1)",
};
const btnMain = {
  width: "100%", padding: "10px 20px", margin: "8px 0", border: "none",
  borderRadius: 6, background: "#229ED9", color: "#fff", cursor: "pointer",
};
const btnGhost = {
  ...btnMain, background: "#333",
};
const toastStyle = {
  position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
  background: "#28a745", color: "#fff", padding: "10px 20px", borderRadius: 6,
  boxShadow: "0 2px 6px rgba(0,0,0,0.4)", zIndex: 999,
};
const headerStyle = {
  width: "100%", padding: "10px 0", background: "#fff", borderBottom: "1px solid #444",
  textAlign: "center", fontWeight: "bold", fontSize: 20, color: "#111", position: "sticky", top: 0, zIndex: 10,
};
const mainStyle = { background: "#121212", minHeight: "100vh", paddingBottom: 40 };

export default Homepage;
