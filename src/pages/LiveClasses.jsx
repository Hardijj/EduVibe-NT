import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js"; // ⚡ Add this
import "../styles/LiveClasses.css";

const tabs = ["live", "upcoming", "completed"];
const subjectMap = {
  "35848": "Maths",
  "35850": "Science",
  "35849": "SST"
};

const API_BASE = "https://viewer-ten-psi.vercel.app/view.php";
const SECRET = "my_secret_key_123"; // ⚠️ this must match PHP secret

const LiveClasses = () => {
  const [data, setData] = useState({});
  const [activeTab, setActiveTab] = useState("live");
  const [loading, setLoading] = useState(true);
  const [timeMap, setTimeMap] = useState({});
  const [liveError, setLiveError] = useState("");
  const navigate = useNavigate();

  const secureFetch = async (view) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = CryptoJS.SHA256(timestamp + view + SECRET).toString();

    const res = await fetch(`${API_BASE}?view=${view}`, {
      headers: {
        "X-Timestamp": timestamp,
        "X-Signature": signature,
      },
    });

    if (!res.ok) {
      throw new Error("Invalid response");
    }
    return res.json();
  };

  useEffect(() => {
    const fetchAll = async () => {
      const result = {};
      const times = {};
      for (const tab of tabs) {
        try {
          const json = await secureFetch(tab);
          result[tab] = json?.data || [];
          times[tab] = json?.time || "";
        } catch {
          result[tab] = [];
          times[tab] = "";
        }
      }
      setData(result);
      setTimeMap(times);
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
    const time = item.start_date;
    const fileUrlWithStart = fileUrl.includes("?")
      ? `${fileUrl}&start=${time}`
      : `${fileUrl}?start=${time}`;
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

    if (tab === "live") {
      return (
        <div
          key={item.id}
          className="card-link"
          onClick={async () => {
            setLiveError("");
            try {
              const res = await fetch(fileUrlWithStart, { method: "HEAD" });
              if (res.ok) {
                navigate(`/video/10/live/0`, {
                  state: { m3u8Url: fileUrlWithStart, chapterName: title },
                });
              } else {
                setLiveError("🔴 Live class hasn't started yet. Please try again shortly.");
                setTimeout(() => setLiveError(""), 4000);
              }
            } catch {
              setLiveError("⚠️ Unable to check live status. Please try again.");
              setTimeout(() => setLiveError(""), 4000);
            }
          }}
        >
          {card}
        </div>
      );
    }

    if (tab === "completed") {
      return (
        <Link
          key={item.id}
          to={`/video/10/${subject.toLowerCase()}/0`}
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
      {liveError && (
        <div className="live-error-banner">
          🚫 {liveError}
        </div>
      )}
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
