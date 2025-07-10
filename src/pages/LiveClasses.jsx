import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/LiveClasses.css";

const tabs = ["live", "upcoming", "completed"];
const subjectMap = {
  "2151767": "maths",
  "2154118": "science",
  "2153529": "sst"
};

const GITHUB_API_BASE = "https://php-pearl.vercel.app/api/api.php?token=my_secret_key_123&view=";

const LiveClasses = () => {
  const [data, setData] = useState({});
  const [activeTab, setActiveTab] = useState("live");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const out = {};
      for (const tab of tabs) {
        try {
          const res = await fetch(`${GITHUB_API_BASE}${tab}`);
          const json = await res.json();
          out[tab] = json?.data || [];
        } catch {
          out[tab] = [];
        }
      }
      setData(out);
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
    const subject = subjectMap[item.id] || "unknown";
    const fileUrl = item.file_url;
    const title = item.title || "Untitled";
    const thumb = item.thumbnail_url;
    const startAt = formatTime(item.start_date);

    if (tab === "live") {
      return (
        <Link
          to={`/video/10/live`}
          state={{ m3u8Url: fileUrl, chapterName: title }}
          className="live-item"
        >
          <img src={thumb} alt={title} className="thumb" />
          <div>
            <h4>{title}</h4>
            <p>🔴 Live Now</p>
          </div>
        </Link>
      );
    }

    if (tab === "upcoming") {
      return (
        <div className="live-item upcoming">
          <img src={thumb} alt={title} className="thumb" />
          <div>
            <h4>{title}</h4>
            <p>{countdownTo(item.start_date)}</p>
            <p>📅 {startAt}</p>
          </div>
        </div>
      );
    }

    if (tab === "completed") {
      return (
        <Link
          to={`/video/10/${subject}/0`}
          state={{ m3u8Url: fileUrl, chapterName: title }}
          className="live-item"
        >
          <img src={thumb} alt={title} className="thumb" />
          <div>
            <h4>{title}</h4>
            <p>✅ Was Live At: {startAt}</p>
          </div>
        </Link>
      );
    }
  };

  return (
    <div className="live-classes-container">
      <h2>🔴 Live Classes</h2>
      <div className="tab-buttons">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? "active" : ""}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="live-list">
          {data[activeTab]?.map((item, i) => (
            <div key={i}>{renderCard(item, activeTab)}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveClasses;
