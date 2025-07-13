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

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdowns((prev) => {
        const updated = {};
        Object.keys(prev).forEach((id) => {
          updated[id] = Math.max(prev[id] - 1, 0);
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
          fetch(`https://php-pearl.vercel.app/api/api.php?token=my_secret_key_123&view=${actualView}`),
          fetch(`https://php-pearl.vercel.app/api/api.php?token=my_secret_key_123&view=${actualView}notes`)
        ]);

        const lectureJson = await lectureRes.json();
        const notesJson = await notesRes.json();

        if (lectureJson.status && lectureJson.data?.list) {
          let list = lectureJson.data.list.filter(
            (item) => item.video_type === "7" || item.video_type === "8"
          );
          list.sort((a, b) => Number(a.start_date) - Number(b.start_date));
          setLectures(list);

          const countdownInit = {};
          list.forEach((item) => {
            if (item.video_type === "8" && item.live_status === "0") {
              const secondsLeft = parseInt(item.start_date) - Math.floor(Date.now() / 1000);
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
          setNotes(pdfs);
        }
      } catch (err) {
        console.error("Error fetching data", err);
      }
      setLoading(false);
    };

    fetchData();
  }, [subject, view, onlyDpp]);

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

  const liveLectures = lectures.filter(l => l.video_type === "8" && l.live_status === "1");
  const upcomingLectures = lectures.filter(l => l.video_type === "8" && l.live_status === "0");
  const completedLectures = lectures.filter(l => l.video_type === "7");

  const renderLectureCard = (item, idx, extraInfo = null) => {
    const title = item.title || "Untitled";
    const img = item.thumbnail_url || "https://decicqog4ulhy.cloudfront.net/0/admin_v1/application_management/clientlogo/4370222540_7521371540_next_topper_logo%20%281%29.png";
    return (
      <div className="card-link" key={idx}>
        <div className="live-card">
          <img
            src={img}
            alt={title}
            className="card-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://decicqog4ulhy.cloudfront.net/0/admin_v1/application_management/clientlogo/4370222540_7521371540_next_topper_logo%20%281%29.png";
            }}
          />
          <div className="card-content">
            <h4 className="card-title">{title}</h4>
            <p className="card-subject">📚 {subject}</p>
            {extraInfo}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="live-classes-container">
      <h2>{subject} / {chapter}</h2>

      {!onlyDpp && (
        <div className="tabs-wrapper">
          {["live", "upcoming", "completed"].map((t) => (
            <button
              key={t}
              className={`tab-button ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "live" ? "🔴 Live" : t === "upcoming" ? "⏳ Upcoming" : "✅ Completed"}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : tab === "upcoming" ? (
        upcomingLectures.length === 0 ? (
          <p className="loading-text">No upcoming classes.</p>
        ) : (
          <div className="card-grid">
            {upcomingLectures.map((item, idx) =>
              renderLectureCard(item, idx, (
                <>
                  <p className="card-status">🕒 Scheduled</p>
                  <p className="card-countdown">🟢 Starts at: {formatDate(item.start_date)}</p>
                  <p className="card-countdown">🔚 Ends at: {formatDate(item.end_date)}</p>
                  <p className="card-countdown">⏳ Countdown: {formatCountdown(countdowns[item.id])}</p>
                </>
              ))
            )}
          </div>
        )
      ) : tab === "live" ? (
        liveLectures.length === 0 ? (
          <p className="loading-text">No live classes now.</p>
        ) : (
          <div className="card-grid">
            {liveLectures.map((item, idx) => (
              <Link
                key={idx}
                to={`/video/10/live`}
                state={{ m3u8Url: item.file_url, chapterName: item.title }}
                className="card-link"
              >
                {renderLectureCard(item, idx, (
                  <>
                    <p className="card-status">🔴 Live Now</p>
                    <p className="card-countdown">🗓️ {formatDate(item.start_date)}</p>
                  </>
                ))}
              </Link>
            ))}
          </div>
        )
      ) : (
        completedLectures.length === 0 ? (
          <p className="loading-text">No completed classes.</p>
        ) : (
          <div className="card-grid">
            {completedLectures.map((item, idx) => (
              <Link
                key={idx}
                to={`/video/10/${subject}/0`}
                state={{ m3u8Url: item.file_url, chapterName: item.title }}
                className="card-link"
              >
                {renderLectureCard(item, idx, (
                  <>
                    <p className="card-status">📽️ Recorded</p>
                    <p className="card-countdown">🗓️ {formatDate(item.start_date)}</p>
                    <p className="card-countdown">⏱️ {formatDuration(item.video_duration)}</p>
                  </>
                ))}
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Recording;
