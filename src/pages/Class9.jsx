import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const subjects = [
  { name: 'Maths', api: 'maths' },
  { name: 'Science', api: 'sci' },
  { name: 'SST', api: 'sst' }
];

const subjectFilters = {
  Accounts: 'No videos found',
  Maths: 'No videos found',
  Economics: 'No videos found'
};

const Class9 = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [videos, setVideos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('videos');
  const navigate = useNavigate();

  const fetchLectures = async (api, name) => {
    setLoading(true);
    try {
      const res = await fetch(`https://php-pearl.vercel.app/api/nine?api=${api}`);
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

  const goToVideo = (lecture) => {
    if (lecture.youtubeUrl) {
      window.open(lecture.youtubeUrl, "_blank");
    } else {
      const noteMatch = notes.find(n => n.title === lecture.name);
      navigate(`/video/113/${selectedSubject}/0`, {
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
        color: '#fff',
        fontFamily: 'Poppins, sans-serif',
        padding: 20
      }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');`}
      </style>

      {!selectedSubject && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {subjects.map(subject => (
            <div
              key={subject.api}
              onClick={() => fetchLectures(subject.api, subject.name)}
              style={{
                background: '#1f1f1f',
                padding: 30,
                textAlign: 'center',
                borderRadius: 12,
                fontSize: 20,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                transition: 'transform 0.2s, background 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
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

          <h2 style={{ fontWeight: 600, marginBottom: 20 }}>{selectedSubject} Lectures</h2>

          {/* Tab Selector */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
            {['videos', 'notes'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  backgroundColor: activeTab === tab ? '#333' : '#1e1e1e',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <div className="spinner" />
              <style>
                {`
                  .spinner {
                    margin: 0 auto;
                    width: 40px;
                    height: 40px;
                    border: 5px solid rgba(255, 255, 255, 0.2);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                  }

                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}
              </style>
            </div>
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
                      fontWeight: 500,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#292929')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#1e1e1e')}
                  >
                    🎥 {lecture.name}
                  </div>
                ))}

              {activeTab === 'notes' &&
                notes.map((note, index) => (
                  <a
                    key={index}
                    href={note.url}
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
                      fontWeight: 500,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#292929')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#1e1e1e')}
                  >
                    📄 {note.title}
                  </a>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Class9;
