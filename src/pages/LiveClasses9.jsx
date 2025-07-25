import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/global.css"

// ✅ Replace with your teacher-specific M3U8 links
const teacherLinks = {
  Science: {
    "Prashant sir": "https://d133w6ldrek1er.cloudfront.net/out/v1/f15d86916b1f404baeb09967b920d86a/index.m3u8",
    "Tapur Ma'am": "https://dga9kme080o0w.cloudfront.net/out/v1/ac361b0bc5c84abba22ce98a674f14a3/index.m3u8",
  },
  SST: {
    "DSR": "https://dga9kme080o0w.cloudfront.net/out/v1/90ab1354cfcd4c5b83cf78a87d96041e/index.m3u8",
    "Teacher": "https://sst-desai.live/link.m3u8",
  },
  Maths: {
    "Shobhit Bhaiya": "https://dga9kme080o0w.cloudfront.net/out/v1/5c7cfedca3df4fc99ea383b5f2e6a7a8/index.m3u8",
    "Kuldeep Sir": "https://d133w6ldrek1er.cloudfront.net/out/v1/49856fa811d3403facbfba24d0db04ab/index.m3u8",
  }
};

// ✅ Your subject time-table
const timetable = {
  Monday: { "17:00": "Science", "20:00": "SST" },
  Tuesday: { "17:00": "Science", "20:00": "SST" },
  Wednesday: { "17:00": "SST", "20:00": "Science" },
  Thursday: { "17:00": "SST", "20:00": "Maths" },
  Friday: { "17:00": "Maths" },
  Saturday: { "17:00": "Maths" }
};

const LiveClasses9 = () => {
  const navigate = useNavigate();
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    const now = new Date();
    const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    const currentTime = `${hours}:${minutes}`;
    const todaySchedule = timetable[dayName] || {};
    const allSlots = Object.keys(todaySchedule);

    // Check closest matching slot
    let matchedSlot = null;
    for (let time of allSlots) {
      const [slotHour, slotMin] = time.split(":").map(Number);
      const slotDate = new Date(now);
      slotDate.setHours(slotHour, slotMin, 0, 0);
      if (now.getTime() >= slotDate.getTime() && now.getTime() <= slotDate.getTime() + 3600000) {
        matchedSlot = time;
        break;
      }
    }

    if (!matchedSlot) {
      alert("No live class right now.");
      return;
    }

    const subject = todaySchedule[matchedSlot];
    setSelectedSubject(subject);
    setTeacherOptions(Object.keys(teacherLinks[subject]));
  }, []);

  const handleTeacherSelection = (teacherName) => {
    const now = Math.floor(Date.now() / 1000); // UNIX timestamp in seconds
    const m3u8Url = `${teacherLinks[selectedSubject][teacherName]}?start=${now}`;

    navigate(`/video/9/live`, {
      state: {
        m3u8Url: m3u8Url,
      }
    });
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      {selectedSubject && (
        <>
          <h2>Live Class: {selectedSubject}</h2>
          <p>Choose your teacher:</p>
          {teacherOptions.map((teacher) => (
            <button
              key={teacher}
              onClick={() => handleTeacherSelection(teacher)}
              style={{ margin: "10px", padding: "10px 20px", cursor: "pointer" }}
            >
              {teacher}
            </button>
          ))}
        </>
      )}
    </div>
  );
};

export default LiveClasses9;
