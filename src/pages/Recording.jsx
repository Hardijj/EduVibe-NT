import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import "../styles/LiveClasses.css";

const Recording = () => {
  const { subject, chapter } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { from = null, to = null } = location.state || {};

  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const fetchRecordings = async () => {
      setLoading(true);
      try {
        const viewMap = {
          Science: "science",
          Maths: "maths",
          SST: "sst",
          IT: "it",
          English: "english",
          Hindi: "hindi",
          Sanskrit: "sans",
        };

        const view = viewMap[subject] || "science";

        const res = await fetch(
          `https://php-pearl.vercel.app/api/api.php?token=my_secret_key_123&view=${view}`
        );
        const json = await res.json();

        if (json.status && json.data?.list) {
          let list = [...json.data.list];

          // ✅ Sort by start_date ascending
          list.sort((a, b) => Number(a.start_date) - Number(b.start_date));

          // ✅ Filter by from/to
          const startIdx = from
            ? list.findIndex((item) => item.title?.trim() === from.trim())
            : 0;
          const endIdx = to
            ? list.findIndex((item) => item.title?.trim() === to.trim())
            : list.length - 1;

          const validList = list.slice(
            Math.max(startIdx, 0),
            Math.max(endIdx + 1, startIdx + 1)
          );

          setRecordings(validList);
        }
      } catch (err) {
        console.error("Error fetching:", err);
      }
      setLoading(false);
    };

    fetchRecordings();
  }, [subject, from, to]);

  const formatDate = (timestamp) => {
    const ts = parseInt(timestamp) * 1000;
    if (!ts) return "—";
    const date = new Date(ts);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="live-classes-container">
      <h2>{subject} / {chapter}</h2>

      {loading ? (
        <p className="loading-text">Loading Recordings...</p>
      ) : recordings.length === 0 ? (
        <p className="loading-text">No recordings found.</p>
      ) : (
        <div className="card-grid">
          {recordings.map((item, idx) => {
            const isLiveType = item.video_type === "8";
            const isRecordedType = item.video_type === "7";

            const title = item.title || "Untitled";
            const time = formatDate(item.start_date);
            const duration = item.video_duration || "—";
            const liveNow = item.live_status === "1";

            const toUrl = isLiveType
              ? `/video/10/live`
              : `/video/10/${subject}/0`;

            return (
              <Link
                to={toUrl}
                state={{
                  m3u8Url: item.file_url,
                  chapterName: title,
                }}
                key={idx}
                className="card-link"
              >
                <div className="live-card">
                  <img
                    src={item.thumbnail_url}
                    alt={title}
                    className="card-image"
                  />
                  <div className="card-content">
                    <h4 className="card-title">{title}</h4>
                    <p className="card-subject">📚 {subject}</p>
                    <p className="card-status">
                      {isRecordedType && "📽️ Recorded"}
                      {isLiveType && (liveNow ? "🔴 Live Now" : "🕒 Scheduled")}
                    </p>
                    <p className="card-countdown">🗓️ {time}</p>
                    <p className="card-countdown">⏱️ Duration: {duration}s</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Recording;
