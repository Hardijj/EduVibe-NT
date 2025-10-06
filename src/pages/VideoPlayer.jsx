import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-contrib-quality-levels";
import "videojs-hls-quality-selector";
import "videojs-hotkeys";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";

const VideoPlayer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPopupp, setShowPopupp] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [studiedMinutes, setStudiedMinutes] = useState(0);

  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const lastTap = useRef(0);

  const { id } = useParams();
  const computedId = location.pathname
    .replace(/^\/video\//, "")
    .replace(/\/live$/, "")
    .replace(/\//g, "_");
  const videoId = id || computedId;

  const { m3u8Url, notesUrl, chapterName } = location.state || {};
  const isLive = location.pathname.includes("/live");
  const telegramDownloaderLink = "https://t.me/+UHFOhCOAU7xhYWY9";

  /* ─────────── LOGIN GUARD ─────────── */
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== "true") navigate("/login");
  }, [navigate]);

  /* ─────────── RESET DAILY STUDY TIME ─────────── */
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem("lastStudyDate");

    if (lastDate !== today) {
      Object.keys(localStorage).forEach((k) =>
        k.startsWith("studyTime_") ? localStorage.removeItem(k) : null
      );
      localStorage.setItem("lastStudyDate", today);
    }
    const stored = parseFloat(localStorage.getItem(`studyTime_${today}`)) || 0;
    setStudiedMinutes(Math.floor(stored / 60));
  }, []);

  /* ─────────── SOCKET.IO VIEWERS ─────────── */
  useEffect(() => {
    if (!videoId) return;

    const socket = io("https://absolute-lynelle-bots-tg12345-47d47cb0.koyeb.app");
    socket.on("connect", () => socket.emit("joinVideo", videoId));
    socket.on(`viewerCount-${videoId}`, setViewerCount);
    socket.on("connect_error", console.error);

    return () => socket.disconnect();
  }, [videoId]);

  /* ─────────── VIDEO.JS SETUP ─────────── */
  useEffect(() => {
    if (!videoRef.current) return;

    const player = (playerRef.current = videojs(
      videoRef.current,
      {
        controls: true,
        preload: "auto",
        autoplay: true,
        fluid: true,
        liveui: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        html5: {
          vhs: {
            overrideNative: true,
            enableLowInitialPlaylist: true,
          },
        },
        plugins: {
          hotkeys: { volumeStep: 0.1, seekStep: 10, enableModifiersForNumbers: false },
        },
      },
      function readyCb() {
        this.hotkeys({ volumeStep: 0.1, seekStep: 10, enableModifiersForNumbers: false });
      }
    ));

    player.src({ src: m3u8Url, type: "application/x-mpegURL" });

    /* Track study time */
    let sessionStart = null;
    let studyTimer = null;

    const updateStudyTime = () => {
      const now = Date.now();
      const elapsed = sessionStart ? (now - sessionStart) / 1000 : 0;
      sessionStart = now;
      const today = new Date().toLocaleDateString();
      const key = `studyTime_${today}`;
      const total = (parseFloat(localStorage.getItem(key)) || 0) + elapsed;
      localStorage.setItem(key, total.toString());
      setStudiedMinutes(Math.floor(total / 60));
    };

    player.ready(() => {
      player.qualityLevels();
      player.hlsQualitySelector({ displayCurrentQuality: true });
      player.on("play", () => {
        sessionStart = Date.now();
        clearInterval(studyTimer);
        studyTimer = setInterval(updateStudyTime, 10_000);
      });
      player.on("pause", updateStudyTime);
      player.on("ended", updateStudyTime);
    });

    return () => {
      clearInterval(studyTimer);
      player.dispose();
    };
  }, [m3u8Url]);

  /* ─────────── DOWNLOAD CLICK ─────────── */
  const handleDownloadClick = () => {
    const fileName = `${chapterName}`;
    const intentUrl =
      `intent:${m3u8Url}` +
      "#Intent;action=android.intent.action.VIEW;" +
      "package=idm.internet.download.manager;" +
      "scheme=1dmdownload;" +
      `S.title=${encodeURIComponent(fileName)};end`;
    window.location.href = intentUrl;
  };

  const handleClosePopup = () => {
    setShowPopupp(false);
  };

  /* ─────────── RETURN UI ─────────── */
  return (
    <>
      {showPopupp && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.85)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#1e1e1e",
              padding: "24px",
              borderRadius: "10px",
              width: "90%",
              maxWidth: "400px",
              textAlign: "center",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#fff",
              boxShadow: "0 0 20px rgba(255,255,255,0.1)",
            }}
          >
            <h2 style={{ fontWeight: "bold", marginBottom: "12px" }}>
              Welcome to EduVibe!
            </h2>
            <p style={{ marginBottom: "16px", color: "#ccc" }}>
              Explore batches and start learning with ease. This website is absolutely free and ad-free.  
              Join our Telegram channel for updates 👇👇
            </p>
            <a
              href="https://t.me/eduvibe_all_classes"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                backgroundColor: "#229ED9",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "6px",
                textDecoration: "none",
                marginBottom: "10px",
              }}
            >
              Join Telegram
            </a>
            <br />
            <button
              onClick={handleClosePopup}
              style={{
                backgroundColor: "#333",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div>
        <h2>
          {isLive
            ? "🔴 Live Class"
            : `Now Playing: ${chapterName || "Unknown Lecture"}`}
        </h2>

        <div data-vjs-player style={{ position: "relative" }}>
          <video
            ref={videoRef}
            className="video-js vjs-default-skin"
            tabIndex={0}
          />
          {isLive && (
            <div
              style={{
                position: "absolute",
                top: 15,
                right: 15,
                background: "rgba(0,0,0,0.35)",
                color: "#fff",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                zIndex: 9999,
                pointerEvents: "none",
              }}
            >
              🔴 {viewerCount} watching
            </div>
          )}
        </div>

        {!isLive && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button
              onClick={handleDownloadClick}
              style={{
                background: "#28a745",
                color: "#fff",
                padding: "10px 20px",
                border: "none",
                borderRadius: 5,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              Download Lecture
            </button>
          </div>
        )}

        {/* Telegram-downloader popup */}
        {showPopup && (
          <div
            style={{
              position: "fixed",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#fff",
              padding: 20,
              borderRadius: 10,
              boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
              zIndex: 1000,
              textAlign: "center",
              maxWidth: "90%",
            }}
          >
            <p style={{ marginBottom: 15, color: "#333" }}>
              Link copied. Go to Telegram, paste it, and send to download.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowPopup(false)}
                style={{
                  flex: 1,
                  padding: "8px 16px",
                  background: "#ddd",
                  border: "none",
                  borderRadius: 5,
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => window.open(telegramDownloaderLink, "_blank")}
                style={{
                  flex: 1,
                  padding: "8px 16px",
                  background: "#007bff",
                  border: "none",
                  borderRadius: 5,
                  fontWeight: "bold",
                  color: "#fff",
                }}
              >
                Go to Downloader
              </button>
            </div>
          </div>
        )}

        {/* Notes button */}
        {notesUrl && (
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <a
              href={notesUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                background: "#007bff",
                color: "#fff",
                textDecoration: "none",
                borderRadius: 8,
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Download Notes
            </a>
          </div>
        )}

        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            marginTop: 30,
            color: "#fff",
          }}
        >
          Today’s Study Time: <strong>{studiedMinutes} min</strong>
        </div>
      </div>
    </>
  );
};

export default VideoPlayer;
