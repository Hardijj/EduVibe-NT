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

    /* ─── Orientation lock/unlock ─── */
    const lockLandscape = async () => {
      const o = window.screen?.orientation || window.screen?.mozOrientation || window.screen?.msOrientation;
      if (o?.lock) try { await o.lock("landscape"); } catch (_) {}
    };
    const unlockOrientation = async () => {
      const o = window.screen?.orientation || window.screen?.mozOrientation || window.screen?.msOrientation;
      if (o?.unlock) o.unlock();
      else if (o?.lock) o.lock("portrait").catch(() => {});
    };
    const fsHandler = () => (player.isFullscreen() ? lockLandscape() : unlockOrientation());
    player.on("fullscreenchange", fsHandler);

    /* ─── Gestures ─── */
    const videoEl = videoRef.current;
    const container = videoRef.current.parentElement;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    let holdTimeout = null;
    let speedHeld = false;

    const handleTouchStart = () => {
      if (!isMobile) return;
      holdTimeout = setTimeout(() => {
        if (player && !speedHeld) {
          speedHeld = true;
          player.playbackRate(2);
        }
      }, 1000);
    };
    const handleTouchEnd = () => {
      if (!isMobile) return;
      clearTimeout(holdTimeout);
      if (player && speedHeld) {
        player.playbackRate(1);
        speedHeld = false;
      }
    };
    const handleDoubleTap = (e) => {
      const now = Date.now();
      const tapGap = now - lastTap.current;
      lastTap.current = now;
      const { clientX } = e.changedTouches[0];
      const { left, width } = container.getBoundingClientRect();
      const tapX = clientX - left;

      if (tapGap < 300) {
        if (tapX < width / 3) player.currentTime(player.currentTime() - 10);
        else if (tapX > (2 * width) / 3) player.currentTime(player.currentTime() + 10);
        else player.paused() ? player.play() : player.pause();
      }
    };

    videoEl.addEventListener("touchstart", handleTouchStart);
    videoEl.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("touchend", handleDoubleTap);

    return () => {
      clearInterval(studyTimer);
      player.off("fullscreenchange", fsHandler);
      videoEl.removeEventListener("touchstart", handleTouchStart);
      videoEl.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchend", handleDoubleTap);
      player.dispose();
    };
  }, [m3u8Url]);

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

  /* Auto-close popup after 5s */
  useEffect(() => {
    const timer = setTimeout(() => setShowPopupp(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Welcome Popup */}
      {showPopupp && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.9)",
      zIndex: 1000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
    }}
  >
    <div
      style={{
        background: "linear-gradient(135deg, #1c1c1c, #2a2a2a)",
        padding: "25px",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "420px",
        textAlign: "center",
        color: "#fff",
        boxShadow: "0 8px 25px rgba(0,0,0,0.5)",
        animation: "fadeIn 0.3s ease-in-out",
      }}
    >
      <h2 style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "1.6em" }}>
        Welcome to EduVibe!
      </h2>

      <p style={{ marginBottom: "16px", color: "#ddd", lineHeight: 1.5 }}>
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
          padding: "12px 22px",
          borderRadius: "8px",
          textDecoration: "none",
          marginBottom: "15px",
          fontWeight: "bold",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          transition: "all 0.2s ease-in-out",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#1a7bbd")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#229ED9")}
      >
        Join Telegram
      </a>

      <p style={{ marginBottom: "20px", color: "#aaa", fontSize: "0.9em" }}>
        <strong>Features of this Video Player:</strong><br />
        • Hold on screen to speed up playback<br />
        • Double tap left/right to skip<br />
        • Center tap to play/pause<br />
        • Fullscreen with auto landscape lock
      </p>

      <button
        onClick={handleClosePopup}
        style={{
          backgroundColor: "#333",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "all 0.2s ease-in-out",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#444")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#333")}
      >
        Close
      </button>
    </div>
  </div>
)}

      {/* Video Player */}
      <div>
        <h2>
          {isLive ? "🔴 Live Class" : `Now Playing: ${chapterName || "Unknown Lecture"}`}
        </h2>

        <div data-vjs-player style={{ position: "relative" }}>
          <video ref={videoRef} className="video-js vjs-default-skin" tabIndex={0} />
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

        {/* Telegram downloader popup */}
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
