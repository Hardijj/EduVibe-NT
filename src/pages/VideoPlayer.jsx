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
  const [showPopup, setShowPopup] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [studiedMinutes, setStudiedMinutes] = useState(0);

  const videoRef = useRef(null);
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

  // LOGIN GUARD
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== "true") navigate("/login");
  }, [navigate]);

  // RESET DAILY STUDY TIME
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

  // SOCKET.IO VIEWERS — only for live mode
useEffect(() => {
  if (!videoId || !isLive) return; // only run for live videos

  const socket = io("https://absolute-lynelle-bots-tg12345-47d47cb0.koyeb.app");
  socket.on("connect", () => socket.emit("joinVideo", videoId));
  socket.on(`viewerCount-${videoId}`, setViewerCount);
  socket.on("connect_error", console.error);

  return () => socket.disconnect();
}, [videoId, isLive]);

  // VIDEO.JS SETUP + GESTURES + AUTO CLOSE POPUP
  useEffect(() => {
    if (!videoRef.current) return;

    const player = videojs(videoRef.current, {
      controls: true,
      preload: "auto",
      autoplay: true,
      fluid: true,
      liveui: true,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      html5: { vhs: { overrideNative: true, enableLowInitialPlaylist: true } },
      plugins: {
        hotkeys: { volumeStep: 0.1, seekStep: 10, enableModifiersForNumbers: false },
      },
    });

    player.src({ src: m3u8Url, type: "application/x-mpegURL" });

    // Orientation Lock
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

    // Track study time
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

    // Gestures
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

    // Auto close popup after 5 sec
    const popupTimer = setTimeout(() => setShowPopup(false), 5000);

    return () => {
      clearInterval(studyTimer);
      clearTimeout(popupTimer);
      videoEl.removeEventListener("touchstart", handleTouchStart);
      videoEl.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchend", handleDoubleTap);
      player.off("fullscreenchange", fsHandler);
      player.dispose();
    };
  }, [m3u8Url, isLive]);

  // DOWNLOAD CLICK
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

  return (
  <div style={{ position: "relative", width: "100%", maxWidth: "100%", overflow: "hidden", color: "#fff" }}>
    <h2>
      {isLive
        ? "🔴 Live Class"
        : `Now Playing: ${chapterName || "Unknown Lecture"}`}
    </h2>
  <video ref={videoRef} className="video-js vjs-big-play-centered" playsInline />

      {/* Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <button className="popup-close" onClick={() => setShowPopup(false)}>×</button>
            <h2>Welcome to EduVibe!</h2>
            <p>
              Explore batches and start learning with ease.<br />
              This website is absolutely free and ad-free.<br />
              Join our Telegram channel for updates 👇👇
            </p>
            <a href="https://t.me/eduvibe_all_classes" target="_blank" rel="noopener noreferrer">
              Join Telegram
            </a>
            <p style={{ marginTop: "12px", fontSize: "0.9em", color: "#ccc" }}>
              <strong>Features of this Video Player:</strong><br/>
              • Hold on screen to speed up playback<br/>
              • Double tap left/right to skip<br/>
              • Center tap to play/pause<br/>
              • Swipe up/down for brightness & volume<br/>
              • Fullscreen with auto landscape lock
            </p>
          </div>
        </div>
      )}

      {/* Download & Study Time */}
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
      <div style={{ textAlign: "center", fontSize: 12, marginTop: 30, color: "#fff" }}>
        Today’s Study Time: <strong>{studiedMinutes} min</strong>
      </div>

      <style>{`
        .popup-overlay {
  position: fixed; /* Changed from absolute to fixed */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
  animation: fadeIn 0.4s ease;
                   }
        .popup-card {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          backdrop-filter: blur(20px);
          padding: 24px;
          text-align: center;
          color: #fff;
          width: 90%;
          max-width: 360px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          animation: scaleIn 0.3s ease;
          position: relative;
        }
        .popup-card h2 {
          font-weight: bold;
          margin-bottom: 12px;
        }
        .popup-card p {
          color: #ddd;
          margin-bottom: 16px;
          line-height: 1.5;
        }
        .popup-card a {
          display: inline-block;
          background-color: #229ED9;
          color: #fff;
          padding: 10px 20px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.3s;
        }
        .popup-card a:hover {
          background-color: #1b8dc5;
        }
        .popup-close {
          position: absolute;
          top: 8px;
          right: 12px;
          background: transparent;
          color: #fff;
          border: none;
          font-size: 22px;
          cursor: pointer;
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
