import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";
import "../styles/LiveClasses.css";

const LiveClasses11s = () => {
  const [data, setData] = useState({ live: [], upcoming: [], completed: [] });
  const [activeTab, setActiveTab] = useState("live");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("https://automation9thphp.vercel.app/api/live1.php");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch classes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleCardClick = (card, type) => {
    if (type === "completed") {
      navigate("/video/11/recorded/0", {
        state: { m3u8Url: card.link, chapterName: card.title },
      });
    } else if (type === "live") {
      navigate("/video/11/live", {
        state: { m3u8Url: card.link, chapterName: card.title },
      });
    }
    // For upcoming, do nothing
  };

  return (
    <div className="live-classes-container">
      <h2>Science 11th (PCMB) Classes</h2>

      {/* Tabs */}
      <div className="tabs-wrapper">
        {["live", "upcoming", "completed"].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "live" && "🔴 Live"}
            {tab === "upcoming" && "⏳ Upcoming"}
            {tab === "completed" && "📺 Completed"}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <p className="loading-text">Loading classes...</p>
      ) : (
        <div className="card-grid">
          {data[activeTab]?.length > 0 ? (
            data[activeTab].map((card, index) => (
              <div
                key={index}
                className="card-link"
                onClick={() => handleCardClick(card, activeTab)}
                style={{ cursor: activeTab === "upcoming" ? "not-allowed" : "pointer" }}
              >
                <div className="live-card">
                  <img
                    src={card.thumbnail}
                    alt={card.title}
                    className="card-image"
                  />
                  <div className="card-content">
                    <div className="card-title">{card.title}</div>
                    <div className="card-status">{activeTab} Class</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="loading-text">No {activeTab} classes found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveClasses11s;
