import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function LiveClassPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function fetchSchedule() {
    try {
      const res = await fetch("https://automation9thphp.vercel.app/api/Live.php");
      const data = await res.json();// Debugging
      setClassData(data[String(classId)]);
    } catch (err) {
      console.error("Error fetching schedule:", err);
    } finally {
      setLoading(false);
    }
  }
  fetchSchedule();
}, [classId]);

  const handleLectureClick = (startTime, url) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // start + 2 hours

    if (now >= start && now <= end) {
      // within live + 2 hours window
      navigate(`/video/${classId}/live`, { state: { streamUrl: url } });
    } else {
      alert("This lecture is not currently available.");
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (!classData) return <p className="p-4 text-red-500">No data found for this class.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{classData.pageTitle}</h1>

      {classData.class1Visible && (
        <div
          onClick={() => handleLectureClick(classData.class1Times.startTime, classData.class1LiveStreamUrl)}
          className="cursor-pointer p-4 bg-gray-100 rounded-xl mb-4 hover:bg-gray-200 transition"
        >
          <h2 className="text-xl font-semibold">{classData.class1Subject}</h2>
          <p>{classData.classTimeLabel}</p>
        </div>
      )}

      {classData.class2Visible && (
        <div
          onClick={() => handleLectureClick(classData.class2Times.startTime, classData.class2LiveStreamUrl)}
          className="cursor-pointer p-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
        >
          <h2 className="text-xl font-semibold">{classData.class2Subject}</h2>
          <p>{classData.classTimeLabel2}</p>
        </div>
      )}
    </div>
  );
                         }
