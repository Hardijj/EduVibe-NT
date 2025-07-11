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

  // ✅ Protect Route
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
          Sanskrit: "sanskrit",
        };

        const view = viewMap[subject] || "science";

        const res = await fetch(
          `https://php-pearl.vercel.app/api/api.php?token=my_secret_key_123&view=${view}`
        );
        const json = await res.json();

        if (json.status && json.data?.list) {
          let list = [...json.data.list];

          // ✅ Sort by start_date (ascending)
          list.sort((a, b) => Number(a.start_date) - Number(b.start_date));

          // ✅ Filter by from/to range
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
        } else {
          console.error("Invalid response or empty data list");
        }
      } catch (err) {
        console.error("Error fetching recordings:", err);
      }
      setLoading(false);
    };

    fetchRecordings();
  }, [subject, from, to]);

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
            const isLive = item.is_live !== "0";
            const toUrl = isLive
              ? `/video/10/live`
              : `/video/10/${subject}/0`;

            return (
              <Link
                to={toUrl}
                state={{ m3u8Url: item.file_url, chapterName: item.title }}
                key={idx}
                className="card-link"
              >
                <div className="live-card">
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="card-image"
                  />
                  <div className="card-content">
                    <h4 className="card-title">{item.title}</h4>
                    <p className="card-subject">{subject}</p>
                    <p className="card-status">
                      {isLive ? "🔴 Live Now" : "📽️ Recorded"}
                    </p>
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
