import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";
import imageUrl10 from "../assets/10img.jpg";
import image10old from "../assets/10imgold.jpg";
import abhay10 from "../assets/Abhay-10.jpg";
import mlogo from "../assets/ntmlogo.jpg";

const ALL_TABS = [
  { id: "9", title: "Class 9" },
  { id: "10", title: "Class 10" },
  { id: "11", title: "Class 11" },
  { id: "12", title: "Class 12" },
];

const ALL_BATCHES = [
  {
    id: "upcoming-x",
    tab: "10",  // Show inside Class 10 tab
    title: "Abhay 2025-26 Class 10",
    img: abhay10,
    redirect: () => null,
    upcoming: true,
  },
  {
    id: "10",
    tab: "10",
    title: "Aarambh Batch 2.0 2025-26",
    img: imageUrl10,
    redirect: (navigate) => navigate("/subjects/10"),
  },
  {
    id: "11s",
    tab: "11",
    title: "Prarambh 2.0 Science Class 11",
    img: "https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/183130728609_Prarambh%20BATCh%20Science%20Class%2011.png",
    redirect: () => (window.location.href = "https://edu-vibe-nt-live.vercel.app/api/11s.php"),
  },
  {
    id: "12",
    tab: "12",
    title: "Prarambh 2.0 Science Class 12",
    img: "https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/337551428612_Prarambh%20BATCh%20Science%2012.jpg",
    redirect: () => (window.location.href = "https://edu-vibe-nt-live.vercel.app/api/12s.php"),
  },
  {
    id: "11c",
    tab: "11",
    title: "Prarambh 2.0 Commerce Class 11",
    img: "https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/737975028610_Prarambh%20BATCh%20Commerce%2011.png",
    redirect: () => (window.location.href = "https://edu-vibe-nt-live.vercel.app/api/11c.php"),
  },
  {
    id: "11h",
    tab: "11",
    title: "Prarambh 2.0 Humanities Class 11",
    img: "https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/216113028517_Prarambh%20BATCh%20Humanities%2011.png",
    redirect: () => (window.location.href = "/subjects/111"),
  },
  {
    id: "9",
    tab: "9",
    title: "Aarambh Batch 2.0 Class 9",
    img: "https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/152792333113_9th%20aarambh%202.0%20banner%20app.jpg",
    redirect: (navigate) => navigate("/subjects/9"),
  },
  {
    id: "100",
    tab: "10",
    title: "Aarambh Batch Class 10 2024-25",
    img: image10old,
    redirect: () => (window.location.href = "https://batch-web.vercel.app"),
  },
  {
    id: "101",
    tab: "10",
    title: "Abhay Batch Class 10 2024-25",
    img: "https://i.postimg.cc/pVKv3cLR/667423824369-IMG-9619.png",
    redirect: () => (window.location.href = "https://batch-web.vercel.app"),
  },

  // ⭐ UPCOMING BATCH — NON CLICKABLE ⭐
  
];

const Homepage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("10");
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(savedFavs);
  }, []);

  const toggleFavorite = (id) => {
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter((f) => f !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const getBatchesForTab = () => {
    const list = ALL_BATCHES.filter((b) => b.tab === activeTab);

    const favList = list.filter((b) => favorites.includes(b.id));
    const otherList = list.filter((b) => !favorites.includes(b.id));

    return [...favList, ...otherList];
  };

  return (
    <>
      {/* Header */}
      <div
        style={{
          width: "100%",
          padding: "10px 0",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #444",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "20px",
          color: "#111",
          position: "sticky",
          top: "0",
          zIndex: "10",
        }}
      >
        EduVibe-NT
      </div>

      <div className="container" style={{ backgroundColor: "#121212", minHeight: "100vh", paddingBottom: "60px" }}>
        <img src={mlogo} alt="Logo" className="big-logo" />

        {/* Tabs */}
        <div style={{ display: "flex", overflowX: "auto", padding: "10px" }}>
          {ALL_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 18px",
                marginRight: "8px",
                backgroundColor: activeTab === tab.id ? "#fff" : "#333",
                color: activeTab === tab.id ? "#000" : "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {/* Batch List */}
        <div className="batch-container">
          {getBatchesForTab().map((batch) => (
            <div
              className="click-box"
              key={batch.id}
              onClick={() => {
                if (!batch.upcoming) batch.redirect(navigate);
              }}
              style={{
                position: "relative",
                opacity: batch.upcoming ? 0.6 : 1,
                cursor: batch.upcoming ? "default" : "pointer",
              }}
            >
              {/* Coming Soon Tag */}
              {batch.upcoming && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    background: "#ff9800",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    color: "#000",
                    fontSize: "13px",
                    zIndex: 99,
                  }}
                >
                  Coming Soon
                </div>
              )}

              {/* Favorite ❤️ */}
              {!batch.upcoming && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(batch.id);
                  }}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    fontSize: "26px",
                    cursor: "pointer",
                    color: favorites.includes(batch.id) ? "red" : "white",
                  }}
                >
                  ❤️
                </span>
              )}

              <img src={batch.img} alt={batch.title} className="homepage-image" />
              <h1 style={{ color: "#fff" }}>{batch.title}</h1>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Homepage;
