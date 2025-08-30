import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/global.css";
// import tt from "../assets/tt.png";

const Artsub11 = () => {
  const navigate = useNavigate();
  const [m3u8Url, setM3u8Url] = useState("");

  /* ————————————————————————————————————————————————
     1) Guard-route: redirect to /login if not logged in
     ———————————————————————————————————————————————— */
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/login");
    }
  }, [navigate]);

  /* ————————————————————————————————————————————————
     2) Poll live.php once a minute
        • live.php returns {"liveUrl": ""} when OFFLINE
        •               returns {"liveUrl": "<.m3u8 | YouTube>"} when ON
     ———————————————————————————————————————————————— */
  useEffect(() => {
    const fetchLiveUrl = async () => {
      try {
        const res   = await fetch("https://php-pearl.vercel.app/api/live", { cache: "no-store" });
        const json  = await res.json();
        setM3u8Url(json.liveUrl || "");
      } catch (err) {
        console.error("live fetch failed:", err);
        setM3u8Url("");        // keep UI consistent on error
      }
    };

    fetchLiveUrl();                    // run once at mount
    const id = setInterval(fetchLiveUrl, 60_000);   // poll every 60 s
    return () => clearInterval(id);    // cleanup
  }, []);

  /* ————————————————————————————————————————————————
     3) Normal subject list (unchanged)
     ———————————————————————————————————————————————— */
  const subjects = [
    { name: "Click Here for Live's Recorded", path: "/subjectss/11" },
  ];

  /* ————————————————————————————————————————————————
     4) Simple visual cue: disable Live link when offline
     ———————————————————————————————————————————————— */
  const liveDisabled = !m3u8Url;

  return (
    <div className="subjects-container">
      <img
        src=""
        alt="Logo"
        className="tt"
      />
      <h2>Select Subject - Class 11th Humanities</h2>

      <div className="live-class-container">
        <Link
          to={liveDisabled ? "#" : "/video/11/arts/live"}
          state={{ chapterName: "Live Class", m3u8Url }}
          className={`subject-box live-class-section ${liveDisabled ? "disabled" : ""}`}
          onClick={(e) => liveDisabled && e.preventDefault()}
        >
          {liveDisabled ? "🔴 Live Class (Not Started)" : "🔴 Live Class (Click to Join)"}
        </Link>
      </div>

      <div className="subject-boxes">
        {subjects.map(({ name, path }, i) => (
          <Link key={i} to={path} className="subject-box">
            {name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Artsub11;
