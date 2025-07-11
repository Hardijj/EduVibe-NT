import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import "../styles/global.css";
import "../styles/LiveClasses.css"; // reuse card styles

const Recordings = () => {
  const { subject, chapter } = useParams();
  const location = useLocation();
  const { from, to, view } = location.state || {};

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = `https://php-pearl.vercel.app/api/api.php?token=my_secret_key_123&view=${view}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_URL);
        const json = await res.json();
        if (json.status) setVideos(json.data.list || []);
      } catch (e) {
        console.error("Fetch error", e);
      }
      setLoading(false);
    };
    fetchData();
  }, [API_URL]);

  const filterByTitle = (title) => {
    if (!from && !to) return true;
    if (from && !to) return title >= from;
    if (!from && to) return title <= to;
    return title >= from && title <= to;
  };

  const formatTime = (unix) => {
    const d = new Date(parseInt(unix) * 1000);
    return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  const renderCard = (video, i) => {
    const isLive = video.is_live === "1";
    const title = video.title || "Untitled";
    const thumb = video.thumbnail_url;
    const fileUrl = video.file_url;

    const cardBody = (
      <>
        <img src={thumb} alt={title} className="thumb" />
        <div className="card-content">
          <h4 className="card-title">{title}</h4>
          <p className="card-meta">📚 {subject} | 📁 {chapter}</p>
          <p className="card-meta">
            {isLive ? (
              <span className="live-badge">🔴 Live Now</span>
            ) : (
              <>📅 {formatTime(video.start_date)}</>
            )}
          </p>
          <p className="card-meta">
            {isLive ? "Currently Live" : video.live_status === "2" ? "✅ Was Live" : "🎬 Recorded"}
          </p>
        </div>
      </>
    );

    return isLive ? (
      <Link
        to="/video/10/live"
        key={i}
        state={{ m3u8Url: fileUrl, chapterName: title }}
        className="live-item"
      >
        {cardBody}
      </Link>
    ) : (
      <Link
        to={`/video/10/${subject}/0`}
        key={i}
        state={{ m3u8Url: fileUrl, chapterName: title }}
        className="live-item"
      >
        {cardBody}
      </Link>
    );
  };

  return (
    <div className="live-classes-container">
      <h2 className="section-heading">📼 Recordings - {subject} / {chapter}</h2>
      {loading ? (
        <p style={{ color: "white" }}>Loading...</p>
      ) : (
        <div className="live-list">
          {videos.filter((v) => filterByTitle(v.title)).map((v, i) => renderCard(v, i))}
        </div>
      )}
    </div>
  );
};

export default Recordings;
