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
  // NEW logic ---------------------------------------------
const { id } = useParams();           // might be undefined with your static routes
const computedId = location.pathname  // "/video/11/bio/live"
  .replace(/^\/video\//, "")          // "11/bio/live"
  .replace(/\/live$/, "")             // "11/bio"
  .replace(/\//g, "_");               // "11_bio"  ← safe event name
const videoId = id || computedId;     // final key sent to the server
//---------------------------------------------------------

  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const lastTap = useRef(0);

  const [studiedMinutes, setStudiedMinutes] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [viewerCount, setViewerCount] = useState(0); // 👀 NEW

  const chaptersName = localStorage.getItem("chapterName");
  const lecturesName = localStorage.getItem("lectureName");

  const { chapterName, lectureName, m3u8Url, notesUrl } = location.state || {};
  const isLive = location.pathname.includes("/live");
  const telegramDownloaderLink = "https://t.me/+UHFOhCOAU7xhYWY9"; // Replace with actual link

  /* ------------------------------------------------------------------ */
  /*  Guard: user must be logged‑in                                      */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) navigate("/login");
  }, [navigate]);

  /* ------------------------------------------------------------------ */
  /*  Reset daily study‑time clock                                       */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem("lastStudyDate");
    if (lastDate !== today) {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("studyTime_")) localStorage.removeItem(key);
      });
      localStorage.setItem("lastStudyDate", today);
    }

    const stored = parseFloat(localStorage.getItem(`studyTime_${today}`)) || 0;
    setStudiedMinutes(Math.floor(stored / 60));
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Live‑viewer counter via Socket.IO                                  */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
  console.log("🚩 videoId from URL =", videoId);

  if (!videoId) return;

  const socket = io("https://absolute-lynelle-bots-tg12345-47d47cb0.koyeb.app");

  socket.on("connect", () => {
    console.log("🔌 connected", socket.id);          //  <-- SHOULD PRINT   (C)
    socket.emit("joinVideo", videoId);
    console.log("📨 emitted joinVideo", videoId);    //  <-- SHOULD PRINT   (D)
  });

  socket.on(`viewerCount-${videoId}`, (c) => {
    console.log(`📡 viewerCount-${videoId}`, c);     //  <-- SHOULD PRINT   (E)
    setViewerCount(c);
  });

  socket.on("connect_error", (err) => console.error("❌ connect_error", err));

  return () => socket.disconnect();
}, [videoId]);
  /* ------------------------------------------------------------------ */
  /*  video.js initialisation + hotkeys, quality selector, timers        */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!videoRef.current) return;

    const videoSource = m3u8Url;

    playerRef.current = videojs(videoRef.current, {
      controls: true,
      preload: true,
      autoplay: true,
      fluid: true,
      playbackRates: [0.5, 1, 1.25, 1.5, 1.75, 2],
      html5: {
        vhs: {
          overrideNative: true,
          enableLowInitialPlaylist: true,
        },
      },
      function () {
        // Hotkeys plugin options
        this.hotkeys({
          volumeStep: 0.1,
          seekStep: 10,
          enableModifiersForNumbers: false,
        });
      },
    });

    playerRef.current.src({
      src: videoSource,
      type: "application/x-mpegURL",
    });

    /* ---------------- study‑time tracker ---------------- */
    let sessionStart = null;
    let studyTimer = null;

    const updateStudyTime = () => {
      const now = Date.now();
      const elapsed = sessionStart ? (now - sessionStart) / 1000 : 0;
      sessionStart = now;
      const today = new Date().toLocaleDateString();
      const key = `studyTime_${today}`;
      const existing = parseFloat(localStorage.getItem(key)) || 0;
      const newTotal = existing + elapsed;
      localStorage.setItem(key, newTotal.toString());
      setStudiedMinutes(Math.floor(newTotal / 60));
    };

    playerRef.current.ready(() => {
      playerRef.current.qualityLevels();
      playerRef.current.hlsQualitySelector({ displayCurrentQuality: true });

      /* ---------- custom mini time‑display inside play‑toggle ---------- */
      const controlBar = playerRef.current.controlBar;
      const playToggleEl = controlBar.getChild("playToggle")?.el();
      if (playToggleEl) {
        const timeDisplay = document.createElement("div");
        timeDisplay.className = "vjs-custom-time-display";
        Object.assign(timeDisplay.style, {
          position: "absolute",
          bottom: "50px",
          left: "0",
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          fontSize: "13px",
          padding: "4px 8px",
          borderRadius: "4px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 999,
        });
        timeDisplay.textContent = "00:00 / 00:00";
        playToggleEl.style.position = "relative";
        playToggleEl.appendChild(timeDisplay);

        const formatTime = (sec) => {
          if (isNaN(sec) || sec < 0) return "00:00";
          const m = Math.floor(sec / 60)
            .toString()
            .padStart(2, "0");
          const s = Math.floor(sec % 60)
            .toString()
            .padStart(2, "0");
          return `${m}:${s}`;
        };

        playerRef.current.on("loadedmetadata", () => {
          timeDisplay.textContent = `00:00 / ${formatTime(
            playerRef.current.duration()
          )}`;
        });
        playerRef.current.on("timeupdate", () => {
          timeDisplay.textContent = `${formatTime(
            playerRef.current.currentTime()
          )} / ${formatTime(playerRef.current.duration())}`;
        });
      }

      /* ---------- study‑time hooks ---------- */
      playerRef.current.on("play", () => {
        sessionStart = Date.now();
        clearInterval(studyTimer);
        studyTimer = setInterval(updateStudyTime, 10000);
      });
      ["pause", "ended"].forEach((evt) => {
        playerRef.current.on(evt, () => {
          updateStudyTime();
          clearInterval(studyTimer);
        });
      });
    });

    /* ---------------- mobile touch gestures ---------------- */
    const videoContainer = videoRef.current.parentElement;
    const videoEl = videoRef.current;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    let holdTimeout = null;
    let speedHeld = false;

    const handleTouchStart = () => {
      if (!isMobile) return;
      holdTimeout = setTimeout(() => {
        if (playerRef.current && !speedHeld) {
          speedHeld = true;
          playerRef.current.playbackRate(2);
        }
      }, 1000);
    };

    const handleTouchEnd = () => {
      if (!isMobile) return;
      clearTimeout(holdTimeout);
      if (playerRef.current && speedHeld) {
        playerRef.current.playbackRate(1);
        speedHeld = false;
      }
    };

    const handleDoubleTap = (event) => {
      const currentTime = Date.now();
      const tapGap = currentTime - lastTap.current;
      lastTap.current = currentTime;

      const touch = event.changedTouches[0];
      const rect = videoContainer.getBoundingClientRect();
      const tapX = touch.clientX - rect.left;
      const width = rect.width;

      if (tapGap < 300) {
        if (tapX < width / 3) {
          playerRef.current.currentTime(playerRef.current.currentTime() - 10);
        } else if (tapX > (2 * width) / 3) {
          playerRef.current.currentTime(playerRef.current.currentTime() + 10);
        } else {
          playerRef.current.paused()
            ? playerRef.current.play()
            : playerRef.current.pause();
        }
      }
    };

    videoEl.addEventListener("touchstart", handleTouchStart);
    videoEl.addEventListener("touchend", handleTouchEnd);
    videoContainer.addEventListener("touchend", handleDoubleTap);

    /* -------------- cleanup -------------- */
    return () => {
      videoEl.removeEventListener("touchstart", handleTouchStart);
      videoEl.removeEventListener("touchend", handleTouchEnd);
      videoContainer.removeEventListener("touchend", handleDoubleTap);

      if (playerRef.current) playerRef.current.dispose();
      clearInterval(studyTimer);
    };
  }, [m3u8Url, isLive]);

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                           */
  /* ------------------------------------------------------------------ */
  const formatTime = (sec) => {
    if (isNaN(sec) || sec < 0) return "00:00";
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleDownloadClick = () => {
    const fileName = `${chaptersName} ${lecturesName}`;
    const downloadUrl = m3u8Url;
    const intentUrl = `intent:${downloadUrl}#Intent;action=android.intent.action.VIEW;package=idm.internet.download.manager;scheme=1dmdownload;S.title=${encodeURIComponent(
      fileName
    )};end`;
    window.location.href = intentUrl;
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <div>
      <h2>
        {isLive
          ? "🔴 Live Class"
          : `Now Playing: ${chaptersName} - ${lecturesName || "Unknown Lecture"}`}
      </h2>

      <div style={{ position: "relative" }}>
        <video ref={videoRef} className="video-js vjs-default-skin" />

        {/* 👁 Live viewers badge */}
        {isLive && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(0,0,0,0.7)",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              zIndex: 1000,
            }}
          >
            🛑 {viewerCount} watching
          </div>
        )}
      </div>

      {!isLive && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={handleDownloadClick}
            style={{
              backgroundColor: "#28a745",
              color: "#fff",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            Download Lecture
          </button>
        </div>
      )}

      {/* Popup for Telegram downloader */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
            zIndex: 1000,
            textAlign: "center",
            maxWidth: "90%",
          }}
        >
          <p style={{ marginBottom: "15px", color: "#333" }}>
            Link copied to clipboard. Go to Telegram group, paste the link, and send to download the video.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#ddd",
                border: "none",
                borderRadius: "5px",
                color: "#333",
                fontWeight: "bold",
                flex: 1,
                marginRight: "10px",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => window.open(telegramDownloaderLink, "_blank")}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                border: "none",
                borderRadius: "5px",
                color: "#fff",
                fontWeight: "bold",
                flex: 1,
              }}
            >
              Go to Downloader
            </button>
          </div>
        </div>
      )}

      {/* Notes download button */}
      {notesUrl && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <a
            href={notesUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "8px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              fontSize: "16px",
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
          fontSize: "12px",
          marginTop: "30px",
          color: "#ffffff",
        }}
      >
        Today’s Study Time: <strong>{studiedMinutes} min</strong>
      </div>
    </div>
  );
};

export default VideoPlayer;
