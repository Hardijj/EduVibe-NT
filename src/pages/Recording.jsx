import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import CryptoJS from "crypto-js";
import "../styles/LiveClasses.css";

const SECRET = "my32bitkeyforhardxsignaturefuckh"; // Must match PHP secret
const API_BASE = "https://viewer-ten-psi.vercel.app/view.php";

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

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem("lectureProgress");
    if (saved) setProgress(JSON.parse(saved));
  }, []);

  // Save progress when updated
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
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) navigate("/login");
  }, [navigate]);

  // Secure fetch with X-Signature + AES decryption
const AES_KEY = CryptoJS.enc.Utf8.parse("FphackyouHaterMFandextraa16chars");  // same as PHP $customKey
const AES_IV  = CryptoJS.enc.Utf8.parse("phuckyounoobBtch");   // same as PHP $customIV

const secureFetch = async (viewName) => {
  // --- Step 1: Make HMAC X-Signature ---
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const hash = CryptoJS.HmacSHA256(timestamp, SECRET);
  const hashBase64 = CryptoJS.enc.Base64.stringify(hash);
  const signature = btoa(timestamp + hashBase64);

  // --- Step 2: Fetch encrypted data ---
  const res = await fetch(`${API_BASE}?view=${viewName}`, {
    headers: {
      "X-Signature": signature,
    },
  });

  if (!res.ok) throw new Error("Invalid response");

  const encryptedBase64 = await res.text();

  // --- Step 3: Properly parse and decrypt ---
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.enc.Base64.parse(encryptedBase64) },
    AES_KEY,
    { iv: AES_IV, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
);
  const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
  if (!plaintext) throw new Error("Decryption failed");

  return JSON.parse(plaintext);
};

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (onlyDpp) {
          const json = await secureFetch(onlyDpp);

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
        const [lectureJson, notesJson] = await Promise.all([
          secureFetch(actualView),
          secureFetch(actualView + "notes"),
        ]);

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

          if (fromid) {
            const fromidIndex = list.findIndex(
              (item) => item.id?.trim() === fromid.trim()
            );
            list = fromidIndex !== -1 ? list.slice(fromidIndex) : list;
          }

          if (to) {
            const toIndex = list.findIndex(
              (item) => item.title?.trim() === to.trim()
            );
            list = toIndex !== -1 ? list.slice(0, toIndex + 1) : list;
          }

          if (toid) {
            const toidIndex = list.findIndex(
              (item) => item.id?.trim() === toid.trim()
            );
            list = toidIndex !== -1 ? list.slice(0, toidIndex + 1) : list;
          }

          setLectures(list);
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
                    <h4 className="card-title">
                      {note.title || "Untitled PDF"}
                    </h4>
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
              <div key={idx} className="card-link">
                <div className="live-card">
                  <img
                    src={item.thumbnail_url}
                    alt={title}
                    className="card-image"
                  />
                  <div className="card-content">
                    <Link
                      to={toUrl}
                      state={{ m3u8Url: fileUrl, chapterName: title }}
                      className="card-inner"
                    >
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
                    </Link>

                    <span
                      onClick={() => toggleLecture(item.id)}
                      className={`done-btn ${
                        progress[item.id] ? "checked" : ""
                      }`}
                    >
                      ✔
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Recording;
