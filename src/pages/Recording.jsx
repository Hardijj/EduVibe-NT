import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import "../styles/LiveClasses.css";

const Recording = () => {
  const { subject, chapter } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    from = null,
    to = null,
    fromid = null,
    toid = null,
    fromNotes = null,
    toNotes = null,
    view = null,
    onlyDpp = null,
  } = location.state || {};

  const [tab, setTab] = useState("lecture");
  const [lectures, setLectures] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({});

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem("lectureProgress");
    if (saved) setProgress(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("lectureProgress", JSON.stringify(progress));
  }, [progress]);

  const toggleLecture = (id) => {
    setProgress((prev) => {
      const updated = { ...prev };
      if (updated[id]) delete updated[id];
      else updated[id] = true;
      return updated;
    });
  };

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== "true") navigate("/login");
  }, [navigate]);

  // LOCAL JSON LOADER
  const localFetch = async (viewName) => {
    try {
      const json = await import(`../data/10/${viewName}.json`);
      return json.default;
    } catch (err) {
      console.error("❌ Local JSON not found:", viewName, err);
      return null;
    }
  };

  // MAIN FETCH
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const actualView = view || subject.toLowerCase();

      let lectureJson = null;
      let notesJson = null;

      // ⭐ ONLY DPP MODE — fetch only one file
      if (onlyDpp) {
        lectureJson = await localFetch(onlyDpp);

        // Treat this file as NOTES
        if (lectureJson?.data?.list) {
          setNotes(lectureJson.data.list);
        } else {
          setNotes([]);
        }

        setLectures([]); // no lectures in DPP mode
        setLoading(false);
        return; // skip all other logic
      }

      // ⭐ NORMAL 2-file mode
      const results = await Promise.allSettled([
        localFetch(actualView),
        localFetch(actualView + "notes"),
      ]);

      lectureJson = results[0].status === "fulfilled" ? results[0].value : null;
      notesJson = results[1].status === "fulfilled" ? results[1].value : null;

      // LECTURES PROCESSING
      if (lectureJson?.data?.list) {
        let list = lectureJson.data.list.filter(
          (item) => item.video_type === "7" || item.video_type === "8"
        );

        list.sort((a, b) => Number(a.start_date) - Number(b.start_date));

        if (from) {
          const idx = list.findIndex(
            (item) => item.title?.trim() === from.trim()
          );
          if (idx !== -1) list = list.slice(idx);
        }

        if (fromid) {
          const idx = list.findIndex(
            (item) => item.id?.trim() === fromid.trim()
          );
          if (idx !== -1) list = list.slice(idx);
        }

        if (to) {
          const idx = list.findIndex(
            (item) => item.title?.trim() === to.trim()
          );
          if (idx !== -1) list = list.slice(0, idx + 1);
        }

        if (toid) {
          const idx = list.findIndex(
            (item) => item.id?.trim() === toid.trim()
          );
          if (idx !== -1) list = list.slice(0, idx + 1);
        }

        setLectures(list);
      }

      // NOTES PROCESSING
      if (notesJson?.data?.list) {
        let pdfs = notesJson.data.list.filter(
          (item) => item.file_type === "1" && item.file_url
        );

        pdfs.sort((a, b) => Number(a.created) - Number(b.created));

        if (fromNotes) {
          const idx = pdfs.findIndex(
            (item) => item.title?.trim() === fromNotes.trim()
          );
          if (idx !== -1) pdfs = pdfs.slice(idx);
        }

        if (toNotes) {
          const idx = pdfs.findIndex(
            (item) => item.title?.trim() === toNotes.trim()
          );
          if (idx !== -1) pdfs = pdfs.slice(0, idx + 1);
        }

        setNotes(pdfs);
      }

      setLoading(false);
    };

    fetchData();
  }, [subject, view, from, to, fromNotes, toNotes, fromid, toid, onlyDpp]);

  // UTIL
  const formatDate = (timestamp) => {
    const ts = parseInt(timestamp) * 1000;
    if (!ts || isNaN(ts)) return "—";
    return new Date(ts).toLocaleString("en-IN", {
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

  // UI
  return (
    <div className="live-classes-container">
      <h2>
        {subject} / {chapter}
      </h2>

      {!onlyDpp && (
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
      )}

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : onlyDpp || tab === "notes" ? (
        notes.length === 0 ? (
          <p className="loading-text">No PDFs found.</p>
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
                    <p className="card-status">📄 PDF</p>
                    <p className="card-countdown">
                      🗓️ {formatDate(note.created)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : lectures.length === 0 ? (
        <p className="loading-text">No lectures found.</p>
      ) : (
        <div className="card-grid">
          {lectures.map((item, idx) => {
            const title = item.title || "Untitled";
            const time = formatDate(item.start_date);
            const duration = formatDuration(item.video_duration);
            const isLive = item.video_type === "8";
            const isRecorded = item.video_type === "7";
            const liveNow = item.live_status === "1";

            const fileUrl = item.file_url;

            const toUrl = isLive
              ? `/video/10/live`
              : `/video/10/${subject}/0`;

            return (
              <div key={idx} className="card-link" style={{ position: "relative" }}>
                <Link
                  to={toUrl}
                  state={{ m3u8Url: fileUrl, chapterName: title }}
                  className="card-link-wrapper"
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div className="live-card">
                    <img
                      src={
                        item.thumbnail_url ||
                        "https://decicqog4ulhy.cloudfront.net/0/admin_v1/application_management/clientlogo/4370222540_7521371540_next_topper_logo%20%281%29.png"
                      }
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
                      <p className="card-countdown">
                        ⏱️ Duration: {duration}
                      </p>
                      <p className="card-countdown">👉 -by EduVibe-NT</p>
                    </div>
                  </div>
                </Link>

                <span
                  onClick={() => toggleLecture(item.id)}
                  className={`done-btn ${progress[item.id] ? "checked" : ""}`}
                >
                  ✔
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Recording;
