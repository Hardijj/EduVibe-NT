import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/LiveClasses.css";

const tabs = ["live", "upcoming", "completed"];
const subjectMap = {
  "35848": "Maths",
  "35850": "Science",
  "35849": "SST"
};

const GITHUB_API_BASE =
  "https://php-pearl.vercel.app/api/api.php?token=my_secret_key_123&view=";

const LiveClasses = () => {
  const [data, setData] = useState({});
  const [activeTab, setActiveTab] = useState("live");
  const [loading, setLoading] = useState(true);
  const [timeMap, setTimeMap] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      const result = {};
      const times = {};
      for (const tab of tabs) {
        try {
          const res = await fetch(`${GITHUB_API_BASE}${tab}`);
          const json = await res.json();
          result[tab] = json?.data || [];
          times[tab] = json?.time || "";
        } catch {
          result[tab] = [];
          times[tab] = "";
        }
      }
      setData(result);
      setTimeMap(times); // ✅ Save time for each tab
      setLoading(false);
    };
    fetchAll();
  }, []);

  const formatTime = (unix) => {
    const d = new Date(parseInt(unix) * 1000);
    return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  const formatDuration = (seconds) => {
    const s = parseInt(seconds || "0", 10);
    if (isNaN(s) || s <= 0) return "—";
    const mins = Math.floor(s / 60);
    const hrs = Math.floor(mins / 60);
    const remMin = mins % 60;
    return hrs > 0 ? `${hrs}h ${remMin}m` : `${remMin}m`;
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
    const subject = subjectMap[item.payload.topic_id] || "Unknown";
    const fileUrl = item.file_url;
    const time = timeMap[tab] || ""; // ✅ get time for current tab
    const fileUrlWithStart = `${fileUrl}?start=${time}`;
    const title = item.title || "Untitled";
    const thumb =
      item.thumbnail_url ||
      "https://decicqog4ulhy.cloudfront.net/0/admin_v1/application_management/clientlogo/4370222540_7521371540_next_topper_logo%20%281%29.png";
    const startAt = formatTime(item.start_date);
    const endAt = formatTime(item.end_date);
    const duration = formatDuration(item.video_length || item.playtime || 0);

    const card = (
      <div className={`live-card ${tab}`}>
        <div className="color-strip" />
        <img src={thumb} alt={title} className="card-image" />
        <div className="card-content">
          <h3 className="card-title">{title}</h3>
          <p className="card-subject">📘 {subject}</p>

          {tab === "live" && (
            <>
              <p className="card-status live">🔴 Live Now</p>
              <p className="card-countdown">🗓️ Start: {startAt}</p>
              <p className="card-countdown">🕓 End: {endAt}</p>
              <p className="card-countdown">⏱️ Duration: {duration}</p>
            </>
          )}

          {tab === "upcoming" && (
            <>
              <p className="card-countdown">{countdownTo(item.start_date)}</p>
              <p className="card-countdown">🗓️ Start: {startAt}</p>
              <p className="card-countdown">🕓 End: {endAt}</p>
              <p className="card-status upcoming">🟡 Scheduled</p>
            </>
          )}

          {tab === "completed" && (
            <>
              <p className="card-status completed">✅ Completed</p>
              <p className="card-countdown">🗓️ Start: {startAt}</p>
              <p className="card-countdown">🕓 End: {endAt}</p>
              <p className="card-countdown">⏱️ Duration: {duration}</p>
            </>
          )}
        </div>
      </div>
    );

    // ✅ Wrap only live & completed in Link
    if (tab === "live" || tab === "completed") {
      return (
        <Link
          key={item.id}
          to={`/video/10/${tab === "live" ? "live" : subject.toLowerCase()}/0`}
          state={{ m3u8Url: fileUrlWithStart, chapterName: title }}
          className="card-link"
        >
          {card}
        </Link>
      );
    }

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
