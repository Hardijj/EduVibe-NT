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

  /* ───────────────────────────────
     Route / URL helpers
  ─────────────────────────────── */
  const { id } = useParams(); // may be undefined on static routes
  const computedId = location.pathname          // e.g. "/video/11/bio/live"
    .replace(/^\/video\//, "")                  // "11/bio/live"
    .replace(/\/live$/, "")                     // "11/bio"
    .replace(/\//g, "_");                       // "11_bio"
  const videoId = id || computedId;             // final key for Socket.IO

  /* ───────────────────────────────
     Refs & State
  ─────────────────────────────── */
  const videoRef  = useRef(null);
  const playerRef = useRef(null);
  const lastTap   = useRef(0);

  const [studiedMinutes, setStudiedMinutes] = useState(0);
  const [showPopup,     setShowPopup]       = useState(false);
  const [viewerCount,   setViewerCount]     = useState(0);

  const chaptersName = localStorage.getItem("chapterName");
  const lecturesName = localStorage.getItem("lectureName");

  const { m3u8Url, notesUrl, chapterName } = location.state || {};
  const isLive = location.pathname.includes("/live");
  const telegramDownloaderLink = "https://t.me/+UHFOhCOAU7xhYWY9"; // update as needed

  /* ───────────────────────────────
     Login guard
  ─────────────────────────────── */
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== "true") navigate("/login");
  }, [navigate]);

  /* ───────────────────────────────
     Reset study-time daily
  ─────────────────────────────── */
  useEffect(() => {
    const today    = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem("lastStudyDate");

    if (lastDate !== today) {
      Object.keys(localStorage).forEach((k) => k.startsWith("studyTime_") && localStorage.removeItem(k));
      localStorage.setItem("lastStudyDate", today);
    }
    const stored = parseFloat(localStorage.getItem(`studyTime_${today}`)) || 0;
    setStudiedMinutes(Math.floor(stored / 60));
  }, []);

  /* ───────────────────────────────
     Live-viewer counter (Socket.IO)
  ─────────────────────────────── */
  useEffect(() => {
    if (!videoId) return;

    const socket = io("https://absolute-lynelle-bots-tg12345-47d47cb0.koyeb.app");

    socket.on("connect", () => socket.emit("joinVideo", videoId));
    socket.on(`viewerCount-${videoId}`, setViewerCount);
    socket.on("connect_error", console.error);

    return () => socket.disconnect();
  }, [videoId]);

  /* ───────────────────────────────
     Video.js initialisation
  ─────────────────────────────── */
  useEffect(() => {
    if (!videoRef.current) return;

    /* ---------- orientation helpers ---------- */
    const lockLandscape = async () => {
      const o = window.screen?.orientation || window.screen?.mozOrientation || window.screen?.msOrientation;
      if (o?.lock) {
        try { await o.lock("landscape"); } catch (_) {}
      }
    };
    const unlockOrientation = async () => {
      const o = window.screen?.orientation || window.screen?.mozOrientation || window.screen?.msOrientation;
      if (o?.unlock) o.unlock();
      else if (o?.lock) o.lock("portrait").catch(() => {});
    };

    /* ---------- player creation ---------- */
    const player = playerRef.current = videojs(
      videoRef.current,
      {
        controls: true,
        preload: "auto",
        autoplay: true,
        fluid: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 1.75, 2],
        html5: {
          vhs: {
            overrideNative: true,
            enableLowInitialPlaylist: true,
          },
        },
        plugins: {
          hotkeys: {
            volumeStep: 0.1,
            seekStep: 10,
            enableModifiersForNumbers: false,
          },
        },
      },
      function readyCb() {
        /* duplicate-safe extra hotkey init */
        this.hotkeys({ volumeStep: 0.1, seekStep: 10, enableModifiersForNumbers: false });
      }
    );

    player.src({ src: m3u8Url, type: "application/x-mpegURL" });

    /* ---------- full-screen orientation lock ---------- */
    const fsHandler = () => (player.isFullscreen() ? lockLandscape() : unlockOrientation());
    player.on("fullscreenchange", fsHandler);

    /* ---------- study-time tracker ---------- */
    let sessionStart = null;
    let studyTimer   = null;
    const updateStudyTime = () => {
      const now     = Date.now();
      const elapsed = sessionStart ? (now - sessionStart) / 1000 : 0;
      sessionStart  = now;
      const today   = new Date().toLocaleDateString();
      const key     = `studyTime_${today}`;
      const total   = (parseFloat(localStorage.getItem(key)) || 0) + elapsed;
      localStorage.setItem(key, total.toString());
      setStudiedMinutes(Math.floor(total / 60));
    };

    player.ready(() => {
      player.qualityLevels();
      player.hlsQualitySelector({ displayCurrentQuality: true });

      /* mini time display inside play-toggle */
      const playToggleEl = player.controlBar.getChild("playToggle")?.el();
      if (playToggleEl) {
        const td = document.createElement("div");
        Object.assign(td.style, {
          position: "absolute",
          bottom: "50px",
          left:   "0",
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          fontSize: "13px",
          padding: "4px 8px",
          borderRadius: "4px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 999,
        });
        const fmt = (s) => {
          if (isNaN(s) || s < 0) return "00:00";
          return `${Math.floor(s / 60).toString().padStart(2,"0")}:${Math.floor(s % 60).toString().padStart(2,"0")}`;
        };
        td.textContent = "00:00 / 00:00";
        playToggleEl.style.position = "relative";
        playToggleEl.appendChild(td);

        player.on("loadedmetadata", () => { td.textContent = `00:00 / ${fmt(player.duration())}`; });
        player.on("timeupdate",    () => { td.textContent = `${fmt(player.currentTime())} / ${fmt(player.duration())}`; });
      }

      player.on("play",  () => { sessionStart = Date.now(); clearInterval(studyTimer); studyTimer = setInterval(updateStudyTime, 10_000); });
      player.on("pause", updateStudyTime);
      player.on("ended", updateStudyTime);
    });

    /* ---------- mobile touch gestures ---------- */
    const videoContainer = videoRef.current.parentElement;
    const videoEl        = videoRef.current;
    const isMobile       = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    let holdTimeout = null;
    let speedHeld   = false;

    const handleTouchStart = () => {
      if (!isMobile) return;
      holdTimeout = setTimeout(() => {
        if (player && !speedHeld) { speedHeld = true; player.playbackRate(2); }
      }, 1_000);
    };
    const handleTouchEnd = () => {
      if (!isMobile) return;
      clearTimeout(holdTimeout);
      if (player && speedHeld) { player.playbackRate(1); speedHeld = false; }
    };
    const handleDoubleTap = (e) => {
      const now     = Date.now();
      const tapGap  = now - lastTap.current;
      lastTap.current = now;

      const { clientX } = e.changedTouches[0];
      const { left, width } = videoContainer.getBoundingClientRect();
      const tapX = clientX - left;

      if (tapGap < 300) {
        if (tapX < width / 3)             player.currentTime(player.currentTime() - 10);
        else if (tapX > (2 * width) / 3)  player.currentTime(player.currentTime() + 10);
        else                              player.paused() ? player.play() : player.pause();
      }
    };

    videoEl.addEventListener("touchstart", handleTouchStart);
    videoEl.addEventListener("touchend",   handleTouchEnd);
    videoContainer.addEventListener("touchend", handleDoubleTap);

    /* ---------- cleanup ---------- */
    return () => {
      videoEl.removeEventListener("touchstart", handleTouchStart);
      videoEl.removeEventListener("touchend",   handleTouchEnd);
      videoContainer.removeEventListener("touchend", handleDoubleTap);
      player.off("fullscreenchange", fsHandler);
      player.dispose();
      clearInterval(studyTimer);
    };
  }, [m3u8Url, isLive]);

  /* ───────────────────────────────
     Misc helpers
  ─────────────────────────────── */
  const handleDownloadClick = () => {
    const fileName  = `${chaptersName} ${lecturesName}`;
    const intentUrl =
      `intent:${m3u8Url}` +
      "#Intent;action=android.intent.action.VIEW;" +
      "package=idm.internet.download.manager;" +
      "scheme=1dmdownload;" +
      `S.title=${encodeURIComponent(fileName)};end`;
    window.location.href = intentUrl;
  };

  /* ───────────────────────────────
     Render
  ─────────────────────────────── */
  return (
    <div>
      <h2>
        {isLive
          ? "🔴 Live Class"
          : `Now Playing: $(chapterName) || "Unknown Lecture"}`}
      </h2>

      {/* Player wrapper goes fullscreen so badge stays visible */}
      <div data-vjs-player style={{ position: "relative" }}>
        <video
          ref={videoRef}
          className="video-js vjs-default-skin"
          tabIndex={0}                 /* focusable → hot-keys work */
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
              zIndex: 9_999,
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
            zIndex: 1_000,
            textAlign: "center",
            maxWidth: "90%",
          }}
        >
          <p style={{ marginBottom: 15, color: "#333" }}>
            Link copied to clipboard. Go to Telegram group, paste the link, and send to download the video.
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

      <div style={{ textAlign: "center", fontSize: 12, marginTop: 30, color: "#fff" }}>
        Today’s Study Time: <strong>{studiedMinutes} min</strong>
      </div>
    </div>
  );
};

export default VideoPlayer;
