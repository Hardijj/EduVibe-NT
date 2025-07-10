import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/LiveClasses.css";
import tt from "../assets/tt.png";

const SUBJECT_IDS = {
  maths: "2151767",
  science: "2154118",
  sst: "2153529"
};

const LiveClasses = () => {
  const [videos, setVideos] = useState({ live: [], upcoming: [], completed: [] });

  useEffect(() => {
    const fetchAll = async () => {
      const types = ["live", "upcoming", "completed"];
      const results = {};
      for (let type of types) {
        const res = await fetch(`https://nexttoppers.com/api/api.php?view=${type}&token=my_secret_key_123`);
        const json = await res.json();
        results[type] = json.data || [];
      }
      setVideos(results);
    };
    fetchAll();
  }, []);

  const formatDate = (ts) => new Date(parseInt(ts) * 1000).toLocaleString();
  const getStatus = (status) =>
    status === "1" ? "🔴 Live Now" : status === "2" ? "✅ Was Live" : "🕓 Upcoming";

  return (
    <div className="live-classes-page">
      <img src={tt} alt="Logo" className="tt" />
      <h2>Live Classes</h2>

      {["live", "upcoming", "completed"].map((tab) => (
        <div key={tab}>
          <h3 className="tab-heading">{tab.charAt(0).toUpperCase() + tab.slice(1)} Classes</h3>
          <div className="video-grid">
            {videos[tab].map((v, i) => (
              <div key={i} className="video-card">
                <div className="card-strip" />
                <img src={v.thumbnail_url} alt={v.title} className="thumbnail" />
                <div className="card-content">
                  <h4 className="title">{v.title}</h4>
                  {tab === "live" ? (
                    <Link
                      to="/video/10/live"
                      state={{ m3u8Url: v.file_url }}
                      className="watch-btn"
                    >
                      Join Live
                    </Link>
                  ) : tab === "upcoming" ? (
                    <div className="upcoming-time">Starts at {formatDate(v.start_date)}</div>
                  ) : (
                    <Link
                      to={`/video/10/${
                        v.id === SUBJECT_IDS.maths
                          ? "maths"
                          : v.id === SUBJECT_IDS.science
                          ? "science"
                          : "sst"
                      }/0`}
                      state={{ m3u8Url: v.file_url }}
                      className="watch-btn"
                    >
                      Watch Now
                    </Link>
                  )}
                  <div className="status-label">{getStatus(v.live_status)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveClasses;
