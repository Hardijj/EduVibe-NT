import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ClassPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { classId } = location.state || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const res = await fetch("https://studyverse-nxt-live.vercel.app/api/schedule");
        const json = await res.json();
        setData(json[classId]);
      } catch (err) {
        console.error("Error fetching schedule:", err);
      } finally {
        setLoading(false);
      }
    }
    if (classId) fetchSchedule();
  }, [classId]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!data) return <p className="p-4 text-red-500">No schedule found for this class.</p>;

  const now = new Date();
  const isLive = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    return now >= startTime && now <= endTime;
  };

  const handleJoin = (url) => {
    navigate(`/video/${classId}/live`, { state: { streamUrl: url } });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{data.pageTitle}</h1>

      {data.class1Visible && (
        <div className="p-4 bg-gray-100 rounded-xl mb-4">
          <h2 className="text-xl font-semibold">{data.class1Subject}</h2>
          <p>{data.classTimeLabel}</p>
          {isLive(data.class1Times.startTime, data.class1Times.endTime) ? (
            <button
              onClick={() => handleJoin(data.class1LiveStreamUrl)}
              className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded"
            >
              Join Live Class
            </button>
          ) : (
            <p className="text-gray-500 mt-2">Class is not live now.</p>
          )}
        </div>
      )}

      {data.class2Visible && (
        <div className="p-4 bg-gray-100 rounded-xl">
          <h2 className="text-xl font-semibold">{data.class2Subject}</h2>
          <p>{data.classTimeLabel2}</p>
          {isLive(data.class2Times.startTime, data.class2Times.endTime) ? (
            <button
              onClick={() => handleJoin(data.class2LiveStreamUrl)}
              className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded"
            >
              Join Live Class
            </button>
          ) : (
            <p className="text-gray-500 mt-2">Class is not live now.</p>
          )}
        </div>
      )}
    </div>
  );
      }
