import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../styles/LiveClasses.css";

const Recording = () => {
  const { subject, chapter } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    from = null,
    to = null,
    fromNotes = null,
    toNotes = null,
    view = subject.toLowerCase(),
  } = location.state || {};

  const [tab, setTab] = useState("lecture");
  const [lectures, setLectures] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 🔁 Fetch both recordings and notes in parallel
        const [lectureRes, notesRes] = await Promise.all([
          fetch(`https://php-pearl.vercel.app/api/api.php?token=my_secret_key_123&view=${view}`),
          fetch(`https://php-pearl.vercel.app/api/api.php?token=my_secret_key_123&view=${view}notes`)
        ]);

        const lectureJson = await lectureRes.json();
        const notesJson = await notesRes.json();

        if (lectureJson.status && lectureJson.data?.list) {
          let list = [...lectureJson.data.list].filter(v => v.video_type === "7" || v.video_type === "8");
          list.sort((a, b) => Number(a.start_date) - Number(b.start_date));

          const startIdx = from
            ? list.findIndex((item) => item.title?.trim() === from.trim())
            : 0;
          const endIdx = to
            ? list.findIndex((item) => item.title?.trim() === to.trim())
            : list.length - 1;

          const validLectures = list.slice(
            Math.max(startIdx, 0),
            Math.max(endIdx + 1, startIdx + 1)
          );

          setLectures(validLectures);
        }

        if (notesJson.status && notesJson.data?.list) {
          let pdfs = notesJson.data.list.filter((item) => item.file_type === "1" && item.file_url);
          pdfs.sort((a, b) => Number(a.created) - Number(b.created));

          const startNoteIdx = fromNotes
            ? pdfs.findIndex((item) => item.title?.trim() === fromNotes.trim())
            : 0;
          const endNoteIdx = toNotes
            ? pdfs.findIndex((item) => item.title?.trim() === toNotes.trim())
            : pdfs.length - 1;

          const validNotes = pdfs.slice(
            Math.max(startNoteIdx, 0),
            Math.max(endNoteIdx + 1, startNoteIdx + 1)
          );

          setNotes(validNotes);
        }
      } catch (err) {
        console.error("Fetching error:", err);
      }
      setLoading(false);
    };

    fetchData();
  }, [view, from, to, fromNotes, toNotes]);

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

      {/* ✅ Tabs */}
      <div className="tabs-wrapper">
        <button
          className={`tab-button ${tab === "lecture" ? "active" : ""}`}
          onClick={() => setTab("lecture")}
        >
          🎥 Lectures
        </button>
        <button
          className={`tab-button ${tab === "notes" ? "active" : ""}`}
          onClick={() => setTab("notes")}
        >
          📄 Notes
        </button>
      </div>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : tab === "lecture" ? (
        lectures.length === 0 ? (
          <p className="loading-text">No recordings found.</p>
        ) : (
          <div className="card-grid">
            {lectures.map((item, idx) => {
              const isLive = item.video_type === "8";
              const title = item.title || "Untitled";
              const time = formatDate(item.start_date);
              const formatDuration = (seconds) => {
  const s = parseInt(seconds || "0", 10);
  if (isNaN(s) || s <= 0) return "—";

  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);

  if (hrs > 0 && mins > 0) return `${hrs} hr ${mins} min`;
  if (hrs > 0) return `${hrs} hr`;
  if (mins > 0) return `${mins} min`;
  return "0 min";
};

const duration = formatDuration(item.video_duration);
              const liveNow = item.live_status === "1";

              const toUrl = isLive ? `/video/10/live` : `/video/10/${subject}/0`;

              return (
                <a
                  href={toUrl}
                  key={idx}
                  className="card-link"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = item.file_url;
                  }}
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
                        {isLive ? (liveNow ? "🔴 Live Now" : "🕒 Scheduled") : "📽️ Recorded"}
                      </p>
                      <p className="card-countdown">🗓️ {time}</p>
                      <p className="card-countdown">⏱️ Duration: {duration}</p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )
      ) : notes.length === 0 ? (
        <p className="loading-text">No notes found.</p>
      ) : (
        <div className="card-grid">
          {notes.map((note, idx) => (
            <div
              key={idx}
              className="card-link"
              onClick={() => window.location.href = note.file_url}
              style={{ cursor: "pointer" }}
            >
              <div className="live-card">
                <div className="card-content">
                  <h4 className="card-title">{note.title || "Untitled PDF"}</h4>
                  <p className="card-subject">📚 {subject}</p>
                  <p className="card-status">📄 PDF Note</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recording;
