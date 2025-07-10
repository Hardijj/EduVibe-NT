import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/LiveClasses.css";
import tt from "../assets/tt.png";

const subjectMap = {
  "2151767": "maths",
  "2154118": "science",
  "2153529": "sst"
};

const LiveClasses = () => {
  const [liveData, setLiveData] = useState([]);
  const [upcomingData, setUpcomingData] = useState([]);
  const [completedData, setCompletedData] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      const token = "my_secret_key_123";
      const base = "https://php-pearl.vercel.app/api/api.php";

      const get = async (type) => {
        const res = await fetch(`${base}?view=${type}&token=${token}`);
        const data = await res.json();
        return data?.data || [];
      };

      setLiveData(await get("live"));
      setUpcomingData(await get("upcoming"));
      setCompletedData(await get("completed"));
    };

    fetchAll();
  }, []);

  return (
    <div className="subjects-container">
      <img src={tt} alt="Logo" className="tt" />
      <h2>Live Classes</h2>

      <h3>🔴 Live Now</h3>
      <div className="subject-boxes">
        {liveData.map((item, i) => (
          <Link
            to="/video/10/live"
            state={{ chapterName: "Live Class", m3u8Url: item.file_url }}
            className="subject-box"
            key={`live-${i}`}
          >
            <img src={item.thumbnail_url} alt={item.title} />
            <div className="box-content">
              <div className="title">{item.title}</div>
              <div className="subtitle">Click to Join</div>
              <div className="status">🔴 Live Now</div>
            </div>
          </Link>
        ))}
      </div>

      <h3>📅 Upcoming</h3>
      <div className="subject-boxes">
        {upcomingData.map((item, i) => (
          <div className="subject-box" key={`upcoming-${i}`}>
            <img src={item.thumbnail_url} alt={item.title} />
            <div className="box-content">
              <div className="title">{item.title}</div>
              <div className="subtitle">Starting Soon</div>
              <div className="status">⏰ Will be live at {new Date(item.start_date * 1000).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      <h3>✅ Completed</h3>
      <div className="subject-boxes">
        {completedData.map((item, i) => {
          const subject = subjectMap[item.id] || "maths";
          return (
            <Link
              to={`/video/10/${subject}/0`}
              state={{ chapterName: item.title, m3u8Url: item.file_url }}
              className="subject-box"
              key={`completed-${i}`}
            >
              <img src={item.thumbnail_url} alt={item.title} />
              <div className="box-content">
                <div className="title">{item.title}</div>
                <div className="subtitle">Watch Recording</div>
                <div className="status">📅 Was live at {new Date(item.start_date * 1000).toLocaleString()}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default LiveClasses;
