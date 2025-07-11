import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import "../styles/LiveClasses.css";

const Recording = () => {
  const { subject, chapter } = useParams();
  const location = useLocation();
  const { from, to, view } = location.state || {};
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://php-pearl.vercel.app/api/api.php?token=my_secret_key_123&view=${view}`
        );
        const json = await res.json();
        const list = json?.data?.list || [];

        // Reverse order: newest first
        let filtered = list.reverse();

        // Apply from/to title filtering if present
        if (from || to) {
          const fromIndex = filtered.findIndex((v) => v.title === from);
          const toIndex = filtered.findIndex((v) => v.title === to);

          const start = fromIndex !== -1 ? fromIndex : 0;
          const end = toIndex !== -1 ? toIndex + 1 : filtered.length;

          filtered = filtered.slice(start, end);
        }

        setVideos(filtered);
      } catch (err) {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [from, to, view]);

  const formatTime = (unix) => {
    const d = new Date(parseInt(unix) * 1000);
    return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  return (
    <div className="live-classes-container">
      <h2>📼 Recordings - {chapter}</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="live-list">
          {videos.map((item, idx) => {
            const isLive = item.is_live === "1";
            const title = item.title || "Untitled";
            const thumb = item.thumbnail_url;
            const fileUrl = item.file_url;

            return (
              <Link
                key={idx}
                to={isLive ? "/video/10/live" : `/video/10/${subject}/0`}
                state={{ m3u8Url: fileUrl, chapterName: title }}
                className="live-item"
              >
                <img src={thumb} alt={title} className="thumb" />
                <div className="record-info">
                  <h4>{title}</h4>
                  <p>📅 {formatTime(item.start_date)}</p>
                  <p>{isLive ? "🔴 Live Now" : "🎞️ Recorded Video"}</p>
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
