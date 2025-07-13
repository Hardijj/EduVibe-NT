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
    fromNotes = null,
    toNotes = null,
    view = null,
    onlyDpp = null,
  } = location.state || {};

  const [tab, setTab] = useState("live");
  const [lectures, setLectures] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState({});

  const tabs = ["live", "upcoming", "completed"];

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((id) => {
          updated[id] = Math.max(updated[id] - 1, 0);
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
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

          if (from) {
            const fromIndex = list.findIndex(
              (item) => item.title?.trim() === from.trim()
            );
            list = fromIndex !== -1 ? list.slice(fromIndex) : list;
          }

          if (to) {
            const toIndex = list.findIndex(
              (item) => item.title?.trim() === to.trim()
            );
            list = toIndex !== -1 ? list.slice(0, toIndex + 1) : list;
          }

          setLectures(list);

          const countdownInit = {};
          list.forEach((item) => {
            if (item.video_type === "8" && item.live_status === "0") {
              const secondsLeft =
                parseInt(item.start_date) - Math.floor(Date.now() / 1000);
              countdownInit[item.id] = Math.max(secondsLeft, 0);
            }
          });
          setCountdowns(countdownInit);
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

  const formatCountdown = (seconds) => {
    const s = Math.max(parseInt(seconds), 0);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs.toString().padStart(2, "0")} hr ${mins
      .toString()
      .padStart(2, "0")} min ${secs.toString().padStart(2, "0")} sec`;
  };

  const upcomingLectures = lectures.filter(
    (item) => item.video_type === "8" && item.live_status === "0"
  );
  const liveLectures = lectures.filter(
    (item) => item.video_type === "8" && item.live_status === "1"
  );
  const completedLectures = lectures.filter(
    (item) => item.video_type === "7"
  );

  return (
    <div className="live-classes-container">
      <h2>
        {subject} / {chapter}
      </h2>

      {!onlyDpp && (
        <div className="tabs-wrapper">
          {tabs.map((t) => (
            <button
              key={t}
              className={`tab-button ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "live" && "🔴 Live"}
              {t === "upcoming" && "⏳ Upcoming"}
              {t === "completed" && "✅ Completed"}
            </button>
          ))}
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
                    <p className="card-countdown">🗓️ {formatDate(note.created)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === "upcoming" ? (
        upcomingLectures.length === 0 ? (
          <p className="loading-text">No upcoming lectures.</p>
        ) : (
          <div className="card-grid">
            {upcomingLectures.map((item, idx) => (
              <div key={idx} className="card-link">
                <div className="live-card">
                  <img
                    src={item.thumbnail_url || "https://decicqog4ulhy.cloudfront.net/0/admin_v1/application_management/clientlogo/4370222540_7521371540_next_topper_logo%20%281%29.png"}
                    alt={item.title || "Untitled"}
                    className="card-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://decicqog4ulhy.cloudfront.net/0/admin_v1/application_management/clientlogo/4370222540_7521371540_next_topper_logo%20%281%29.png";
                    }}
                  />
                  <div className="card-content">
                    <h4 className="card-title">{item.title || "Untitled"}</h4>
                    <p className="card-subject">📚 {subject}</p>
                    <p className="card-status">🕒 Scheduled</p>
                    <p className="card-countdown">
                      🕒 Starts at: {formatDate(item.start_date)}
                    </p>
                    <p className="card-countdown">
                      ⏱️ Ends at: {formatDate(item.end_date)}
                    </p>
                    <p className="card-countdown">
                      ⏳ Starting in: {formatCountdown(countdowns[item.id] || 0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === "live" ? (
        liveLectures.length === 0 ? (
          <p className="loading-text">No live classes right now.</p>
        ) : (
          <div className="card-grid">
            {liveLectures.map((item, idx) => {
              const toUrl = `/video/10/live`;
              return (
                <Link
                  to={toUrl}
                  state={{
                    m3u8Url: item.file_url,
                    chapterName: item.title,
                  }}
                  key={idx}
                  className="card-link"
                >
                  <div className="live-card">
                    <img
                      src={item.thumbnail_url || "https://decicqog4ulhy.cloudfront.net/0/admin_v1/application_management/clientlogo/4370222540_7521371540_next_topper_logo%20%281%29.png"}
                      alt={item.title}
                      className="card-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://decicqog4ulhy.cloudfront.net/0/admin_v1/application_management/clientlogo/4370222540_7521371540_next_topper_logo%20%281%29.png";
                      }}
                    />
                    <div className="card-content">
                      <h4 className="card-title">{item.title}</h4>
                      <p className="card-subject">📚 {subject}</p>
                      <p className="card-status">🔴 Live Now</p>
                      <p className="card-countdown">
                        🗓️ {formatDate(item.start_date)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )
      ) : tab === "completed" ? (
        completedLectures.length === 0 ? (
          <p className="loading-text">No completed lectures.</p>
        ) : (
          <div className="card-grid">
            {completedLectures.map((item, idx) => {
              const toUrl = `/video/10/${subject}/0`;
              return (
                <Link
                  to={toUrl}
                  state={{
                    m3u8Url: item.file_url,
                    chapterName: item.title,
                  }}
                  key={idx}
                  className="card-link"
                >
                  <div className="live-card">
                    <img
                      src={item.thumbnail_url || "https://decicqog4ulhy.cloudfront.net/0/admin_v1/application_management/clientlogo/4370222540_7521371540_next_topper_logo%20%281%29.png"}
                      alt={item.title}
                      className="card-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://decicqog4ulhy.cloudfront.net/0/admin_v1/application_management/clientlogo/4370222540_7521371540_next_topper_logo%20%281%29.png";
                      }}
                    />
                    <div className="card-content">
                      <h4 className="card-title">{item.title}</h4>
                      <p className="card-subject">📚 {subject}</p>
                      <p className="card-status">📽️ Recorded</p>
                      <p className="card-countdown">
                        🗓️ {formatDate(item.start_date)}
                      </p>
                      <p className="card-countdown">
                        ⏱️ Duration: {formatDuration(item.video_duration)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )
      ) : null}
    </div>
  );
};

export default Recording;
