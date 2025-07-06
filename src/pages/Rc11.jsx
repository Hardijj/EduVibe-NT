import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const subjects = [
  { name: 'Grammer', api: 'gm' },
  { name: 'Writting Skill', api: 'ws' },
  { name: 'Hornbill', api: 'hb' },
  { name: 'Hindi', api: 'hn'},
  { name: 'Applied Maths', api: 'am'},
  { name: 'Aroh', api: 'ar'},
  { name: 'Snapshot', api: 'sn'},
];

// Define where to start for each subject
const subjectFilters = {
  Accounts: 'No videos found',
  Maths: 'No videos found',
  Economics: 'No videos found'
};

const Rc11 = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [videos, setVideos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('videos');
  const navigate = useNavigate();

  const fetchLectures = async (api, name) => {
    setLoading(true);
    try {
      const res = await fetch(`https://php-pearl.vercel.app/api/index/?api=${api}`);
      const data = await res.json();

      const marker = subjectFilters[name];
      const videoStart = data.videos.findIndex(item => item.name === marker);
      const noteStart = data.notes.findIndex(item => item.title === marker);

      setVideos(videoStart !== -1 ? data.videos.slice(videoStart) : data.videos);
      setNotes(noteStart !== -1 ? data.notes.slice(noteStart) : data.notes);
      setSelectedSubject(name);
      setActiveTab('videos');
    } catch (err) {
      alert("Failed to fetch lectures.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = (subject) => {
    fetchLectures(subject.api, subject.name);
  };

  const goToVideo = (lecture) => {
    if (lecture.youtubeUrl) {
      window.open(lecture.youtubeUrl, "_blank");
    } else {
      const noteMatch = notes.find(n => n.title === lecture.name);
      navigate(`/video/11/${selectedSubject}/0`, {
        state: {
          m3u8Url: lecture.m3u8Url,
          notesUrl: noteMatch?.url || null,
          title: lecture.name
        }
      });
    }
  };

  const handleBack = () => {
    setSelectedSubject(null);
    setVideos([]);
    setNotes([]);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#121212',
        color: '#ffffff',
        fontFamily: 'Poppins, sans-serif',
        padding: 20
      }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');`}
      </style>

      {!selectedSubject && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {subjects.map((subject) => (
            <div
              key={subject.api}
              onClick={() => handleSubjectClick(subject)}
              style={{
                background: '#1f1f1f',
                padding: 30,
                textAlign: 'center',
                borderRadius: 12,
                fontSize: 20,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {subject.name}
            </div>
          ))}
        </div>
      )}

      {selectedSubject && (
        <div>
          <button
            onClick={handleBack}
            style={{
              marginBottom: 20,
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ← Back
          </button>

          <h2 style={{ fontWeight: 600 }}>{selectedSubject} Lectures</h2>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
            <button
              onClick={() => setActiveTab('videos')}
              style={{
                backgroundColor: activeTab === 'videos' ? '#333' : '#1e1e1e',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              style={{
                backgroundColor: activeTab === 'notes' ? '#333' : '#1e1e1e',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Notes
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              {activeTab === 'videos' &&
                videos.map((lecture, index) => (
                  <div
                    key={index}
                    onClick={() => goToVideo(lecture)}
                    style={{
                      marginBottom: 12,
                      padding: 15,
                      backgroundColor: '#1e1e1e',
                      borderRadius: 10,
                      border: '1px solid #333',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      fontWeight: 500
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#292929')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#1e1e1e')}
                  >
                    {lecture.name}
                  </div>
                ))}

              {activeTab === 'notes' &&
                notes.map((note, index) => (
                  <a
                    key={index}
                    href={note.youtubeUrl || note.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      marginBottom: 12,
                      padding: 15,
                      backgroundColor: '#1e1e1e',
                      borderRadius: 10,
                      border: '1px solid #333',
                      textDecoration: 'none',
                      color: '#fff',
                      transition: 'background 0.2s',
                      fontWeight: 500
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#292929')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#1e1e1e')}
                  >
                    {note.title}
                  </a>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Rc11;
