import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../styles/LiveClasses.css";

const Notes = () => {
  const { subject, chapter } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { from = null, to = null, view = subject.toLowerCase() } = location.state || {};

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://php-pearl.vercel.app/api/api.php?token=my_secret_key_123&view=${view}notes`
        );
        const json = await res.json();

        if (json.status && json.data?.list) {
          let list = json.data.list.filter(
            (item) => item.file_type === "1" && item.file_url
          );

          list.sort((a, b) => Number(a.created) - Number(b.created));

          const startIdx = from
            ? list.findIndex((item) => item.title?.trim() === from.trim())
            : 0;
          const endIdx = to
            ? list.findIndex((item) => item.title?.trim() === to.trim())
            : list.length - 1;

          const validList = list.slice(
            Math.max(startIdx, 0),
            Math.max(endIdx + 1, startIdx + 1)
          );

          setNotes(validList);

          if (validList.length === 1) {
            window.location.href = validList[0].file_url;
          }
        }
      } catch (err) {
        console.error("Error fetching notes:", err);
      }
      setLoading(false);
    };

    fetchNotes();
  }, [view, from, to]);

  return (
    <div className="live-classes-container">
      <h2>{subject} / {chapter} Notes</h2>

      {loading ? (
        <p className="loading-text">Loading Notes...</p>
      ) : notes.length === 0 ? (
        <p className="loading-text">No notes found.</p>
      ) : notes.length === 1 ? (
        <p className="loading-text">Redirecting to note...</p>
      ) : (
        <div className="card-grid">
          {notes.map((note, idx) => (
            <div
              key={idx}
              className="card-link"
              onClick={() => window.location.href = note.file_url}
              style={{ cursor: "pointer" }}
            >
              <div className="live-card">
                <div className="card-content">
                  <h4 className="card-title">{note.title || "Untitled PDF"}</h4>
                  <p className="card-subject">📚 {subject}</p>
                  <p className="card-status">📄 PDF Note</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;
