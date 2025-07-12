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
        // Fetch lectures and notes in parallel
        const [lectureRes, notesRes] = await Promise.all([
          fetch(`https://php-pearl.vercel.app/api/api.php?token=my_secret_key_123&view=${view}`),
          fetch(`https://php-pearl.vercel.app/api/api.php?token=my_secret_key_123&view=${view}notes`)
        ]);

        const lectureJson = await lectureRes.json();
        const notesJson = await notesRes.json();

        // ✅ Filter and sort lectures
        if (lectureJson.status && lectureJson.data?.list) {
          let list = [...lectureJson.data.list]
            .filter((v) => v.video_type === "7" || v.video_type === "8")
            .sort((a, b) => Number(a.start_date) - Number(b.start_date));

          let filtered = [...list];

          if (from) {
            const fromIndex = list.findIndex((item) => item.title?.trim() === from.trim());
            filtered = fromIndex !== -1 ? list.slice(fromIndex) : list;
          }

          if (to) {
            const toIndex = filtered.findIndex((item) => item.title?.trim() === to.trim());
            filtered = toIndex !== -1 ? filtered.slice(0, toIndex + 1) : filtered;
          }

          setLectures(filtered);
        }

        // ✅ Filter and sort notes
        if (notesJson.status && notesJson.data?.list) {
          let pdfs = notesJson.data.list
            .filter((item) => item.file_type === "1" && item.file_url)
            .sort((a, b) => Number(a.created) - Number(b.created));

          let filteredNotes = [...pdfs];

          if (fromNotes) {
            const fromIndex = pdfs.findIndex((item) => item.title?.trim() === fromNotes.trim());
            filteredNotes = fromIndex !== -1 ? pdfs.slice(fromIndex) : pdfs;
          }

          if (toNotes) {
            const toIndex = filteredNotes.findIndex((item) => item.title?.trim() === toNotes.trim());
            filteredNotes = toIndex !== -1 ? filteredNotes.slice(0, toIndex + 1) : filteredNotes;
          }

          setNotes(filteredNotes);
        }

      } catch (err) {
        console.error("❌ Fetching error:", err);
      }
      setLoading(false);
    };

    fetchData();
  }, [view, from, to, fromNotes, toNotes]);

  const formatDate = (timestamp) => {
    const ts = parseInt(timestamp) * 1000;
    if (!ts || isNaN(ts)) return "—";
    const date = new Date(ts);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

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

  return (
    <div className="live-classes-container">
      <h2>{subject} / {chapter}</h2>

      {/* 🔁 Tab Switcher */}
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
              const title = item.title || "Untitled";
              const time = formatDate(item.start_date);
              const duration = formatDuration(item.video_duration);
              const isLive = item.video_type === "8";
              const isRecorded = item.video_type === "7";
              const liveNow = item.live_status === "1";

              return (
                <div
                  key={idx}
                  className="card-link"
                  onClick={() => (window.location.href = item.file_url)}
                  style={{ cursor: "pointer" }}
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
                        {isRecorded && "📽️ Recorded"}
                        {isLive && (liveNow ? "🔴 Live Now" : "🕒 Scheduled")}
                      </p>
                      <p className="card-countdown">🗓️ {time}</p>
                      <p className="card-countdown">⏱️ Duration: {duration}</p>
                    </div>
                  </div>
                </div>
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
              onClick={() => (window.location.href = note.file_url)}
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
