import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import "../styles/LiveClasses.css";

const fallbackImage =
  "https://decicqog4ulhy.cloudfront.net/0/admin_v1/application_management/clientlogo/4370222540_7521371540_next_topper_logo%20%281%29.png";

const Recording = () => {
  const { subject, chapter } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    from = null,
    to = null,
    fromNotes = null,
    toNotes = null,
    view = null,
    onlyDpp = null,
  } = location.state || {};

  const [tab, setTab] = useState("lecture");
  const [lectures, setLectures] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState({});

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdowns((prev) => {
        const updated = {};
        Object.entries(prev).forEach(([id, seconds]) => {
          updated[id] = Math.max(0, seconds - 1);
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (onlyDpp) {
          const res = await fetch(
            `https://php-pearl.vercel.app/api/api.php?token=my_secret_key_123&view=${onlyDpp}`
          );
          const json = await res.json();
          if (json.status && json.data?.list) {
            let pdfs = json.data.list.filter(
              (item) => item.file_type === "1" && item.file_url
            );
            pdfs.sort((a, b) => Number(a.created) - Number(b.created));
            if (from) {
              const fromIndex = pdfs.findIndex(
                (item) => item.title?.trim() === from.trim()
              );
              pdfs = fromIndex !== -1 ? pdfs.slice(fromIndex) : pdfs;
            }
            setNotes(pdfs);
          }
          setLoading(false);
          return;
        }

        const actualView = view || subject.toLowerCase();
        const [lectureRes, notesRes] = await Promise.all([
          fetch(
            `https://php-pearl.vercel.app/api/api.php?token=my_secret_key_123&view=${actualView}`
          ),
          fetch(
            `https://php-pearl.vercel.app/api/api.php?token=my_secret_key_123&view=${actualView}notes`
          ),
        ]);

        const lectureJson = await lectureRes.json();
        const notesJson = await notesRes.json();

        if (lectureJson.status && lectureJson.data?.list) {
          let list = lectureJson.data.list.filter(
            (item) => item.video_type === "7" || item.video_type === "8"
          );
          list.sort((a, b) => Number(a.start_date) - Number(b.start_date));

          const upcoming = {};
          list.forEach((item) => {
            if (item.video_type === "8" && item.live_status === "0") {
              const secondsLeft =
                parseInt(item.start_date) - Math.floor(Date.now() / 1000);
              upcoming[item.id] = Math.max(0, secondsLeft);
            }
          });

          setLectures(list);
          setCountdowns(upcoming);
        }

        if (notesJson.status && notesJson.data?.list) {
          let pdfs = notesJson.data.list.filter(
            (item) => item.file_type === "1" && item.file_url
          );
          pdfs.sort((a, b) => Number(a.created) - Number(b.created));

          if (fromNotes) {
            const fromIndex = pdfs.findIndex(
              (item) => item.title?.trim() === fromNotes.trim()
            );
            pdfs = fromIndex !== -1 ? pdfs.slice(fromIndex) : pdfs;
          }

          if (toNotes) {
            const toIndex = pdfs.findIndex(
              (item) => item.title?.trim() === toNotes.trim()
            );
            pdfs = toIndex !== -1 ? pdfs.slice(0, toIndex + 1) : pdfs;
          }

          setNotes(pdfs);
        }
      } catch (err) {
        console.error("❌ Error fetching data:", err);
      }
      setLoading(false);
    };

    fetchData();
  }, [subject, view, from, to, fromNotes, toNotes, onlyDpp]);

  const formatDate = (timestamp) => {
    const ts = parseInt(timestamp) * 1000;
    if (!ts || isNaN(ts)) return "—";
    const date = new Date(ts);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatCountdown = (seconds) => {
    const s = Math.max(parseInt(seconds), 0);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs.toString().padStart(2, "0")}h : ${mins
      .toString()
      .padStart(2, "0")}m : ${secs.toString().padStart(2, "0")}s`;
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

      {!onlyDpp && (
        <div className="tabs-wrapper">
          <button className={`tab-button ${tab === "lecture" ? "active" : ""}`} onClick={() => setTab("lecture")}>🎥 Lectures</button>
          <button className={`tab-button ${tab === "notes" ? "active" : ""}`} onClick={() => setTab("notes")}>📄 Notes</button>
          <button className={`tab-button ${tab === "upcoming" ? "active" : ""}`} onClick={() => setTab("upcoming")}>⏳ Upcoming</button>
        </div>
      )}

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : tab === "notes" ? (
        notes.length === 0 ? (
          <p className="loading-text">No PDFs found.</p>
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
                    <p className="card-status">📄 PDF</p>
                    <p className="card-countdown">🗓️ {formatDate(note.created)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === "upcoming" ? (
        lectures.filter(l => l.video_type === "8" && l.live_status === "0").length === 0 ? (
          <p className="loading-text">No upcoming classes.</p>
        ) : (
          <div className="card-grid">
            {lectures.filter(l => l.video_type === "8" && l.live_status === "0").map((item, idx) => {
              const title = item.title || "Untitled";
              const start = formatDate(item.start_date);
              const end = formatDate(item.end_date);
              const countdown = formatCountdown(countdowns[item.id] || 0);

              return (
                <div className="card-link" key={idx}>
                  <div className="live-card">
                    <img
                      src={item.thumbnail_url || fallbackImage}
                      alt={title}
                      className="card-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImage;
                      }}
                    />
                    <div className="card-content">
                      <h4 className="card-title">{title}</h4>
                      <p className="card-subject">📚 {subject}</p>
                      <p className="card-status">🕒 Scheduled</p>
                      <p className="card-countdown">Starts at: {start}</p>
                      <p className="card-countdown">Ends at: {end}</p>
                      <p className="card-countdown">⏳ Countdown: {countdown}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="card-grid">
          {lectures.filter(item => item.video_type === "7" || (item.video_type === "8" && item.live_status === "1")).map((item, idx) => {
            const title = item.title || "Untitled";
            const time = formatDate(item.start_date);
            const duration = formatDuration(item.video_duration);
            const isLive = item.video_type === "8" && item.live_status === "1";
            const toUrl = isLive ? `/video/10/live` : `/video/10/${subject}/0`;

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
                    src={item.thumbnail_url || fallbackImage}
                    alt={title}
                    className="card-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackImage;
                    }}
                  />
                  <div className="card-content">
                    <h4 className="card-title">{title}</h4>
                    <p className="card-subject">📚 {subject}</p>
                    <p className="card-status">{isLive ? "🔴 Live Now" : "📽️ Recorded"}</p>
                    <p className="card-countdown">🗓️ {time}</p>
                    <p className="card-countdown">⏱️ Duration: {duration}</p>
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
