import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/LiveClasses.css";

const tabs = ["live", "upcoming", "completed"];
const subjectMap = {
  "2151767": "Maths",
  "2154118": "Science",
  "2153529": "SST"
};

const GITHUB_API_BASE = "https://php-pearl.vercel.app/api/api.php?token=my_secret_key_123&view=";

const LiveClasses = () => {
  const [data, setData] = useState({});
  const [activeTab, setActiveTab] = useState("live");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const result = {};
      for (const tab of tabs) {
        try {
          const res = await fetch(`${GITHUB_API_BASE}${tab}`);
          const json = await res.json();
          result[tab] = json?.data || [];
        } catch {
          result[tab] = [];
        }
      }
      setData(result);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const formatTime = (unix) => {
    const d = new Date(parseInt(unix) * 1000);
    return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  const countdownTo = (unix) => {
    const ms = parseInt(unix) * 1000 - Date.now();
    if (ms < 0) return "🔴 Starting soon";
    const mins = Math.floor(ms / 60000);
    const hrs = Math.floor(mins / 60);
    const remMin = mins % 60;
    return `🕒 ${hrs}h ${remMin}m left`;
  };

  const renderCard = (item, tab) => {
  const subject = subjectMap[item.id] || "Unknown";
  const fileUrl = item.file_url;
  const title = item.title || "Untitled";
  const thumb = item.thumbnail_url;
  const startAt = formatTime(item.start_date);
  const path =
    tab === "live"
      ? `/video/10/live`
      : tab === "completed"
      ? `/video/10/${subject.toLowerCase()}/0`
      : null;

  const card = (
    <div className={`live-card ${tab}`}>
      <div className="color-strip" />
      <img src={thumb} alt={title} className="card-image" />
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-subject">📘 {subject}</p>

        {tab === "live" && (
          <p className="card-status live">🔴 Live Now</p>
        )}
        {tab === "upcoming" && (
          <>
            <p className="card-countdown">{countdownTo(item.start_date)}</p>
            <p className="card-status upcoming">Will Be Live</p>
          </>
        )}
        {tab === "completed" && (
          <p className="card-status completed">✅ Was Live: {startAt}</p>
        )}
      </div>
    </div>
  );

  // ✅ Wrap only live & completed in Link
  if (tab === "live" || tab === "completed") {
    return (
      <Link
        key={item.id}
        to={path}
        state={{ m3u8Url: fileUrl, chapterName: title }}
        className="card-link"
      >
        {card}
      </Link>
    );
  }

  // ❌ Upcoming: No redirect
  return (
    <div key={item.id} className="card-link">
      {card}
    </div>
  );
};

  return (
    <div className="live-classes-container">
      <h2>🔴 Live Classes</h2>
      <div className="tabs-wrapper">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="loading-text">⏳ Loading...</p>
      ) : (
        <div className="card-grid">
          {data[activeTab]?.map((item) => renderCard(item, activeTab))}
        </div>
      )}
    </div>
  );
};

export default LiveClasses;
