import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import "../styles/Lectures.css";
import "../styles/LiveClasses.css";

const Recording = () => {
  const { subject, chapterName } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const from = state?.from || null;
  const to = state?.to || null;
  const view = state?.view || null;

  const [recordings, setRecordings] = useState([]);
  const [lives, setLives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`https://php-pearl.vercel.app/api/api.php?token=my_secret_key_123&view=${view}`);
        const json = await res.json();
        const list = json?.data?.list || [];

        const allRecordings = list.filter(item => item.is_live !== "1");
        const allLives = list.filter(item => item.is_live === "1");

        let filtered = allRecordings;
        if (from) {
          const fromIndex = allRecordings.findIndex(item => item.title === from);
          const toIndex = to ? allRecordings.findIndex(item => item.title === to) : allRecordings.length - 1;

          if (fromIndex !== -1) {
            const sliceEnd = toIndex !== -1 ? toIndex + 1 : allRecordings.length;
            filtered = allRecordings.slice(fromIndex, sliceEnd);
          }
        }

        setRecordings(filtered.reverse());
        setLives(allLives);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch recordings:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [from, to, view]);

  const renderBox = (item, isLive = false) => (
    <Link
      to={isLive ? "/video/10/live" : `/video/10/${subject}/0`}
      state={{ m3u8Url: item.file_url, chapterName: item.title }}
      key={item.id}
      className="subject-box"
    >
      <img src={item.thumbnail_url} alt={item.title} className="thumb" />
      <div className="box-content">
        <h4>{item.title}</h4>
        {isLive ? <p className="live-tag">🔴 Live Now</p> : <p>🎬 Recorded</p>}
      </div>
    </Link>
  );

  return (
    <div className="lectures-container">
      <h2>{subject} - {chapterName}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="lecture-boxes">
          {lives.map(item => renderBox(item, true))}
          {recordings.map(item => renderBox(item))}
        </div>
      )}
    </div>
  );
};

export default Recording;
