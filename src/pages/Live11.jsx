import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function LiveRedirect() {
  const { classId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAndRedirect() {
      try {
        const res = await fetch("https://studyverse-nxt-live.vercel.app/api/schedule");
        const data = await res.json();
        const classData = data[classId];

        if (!classData) {
          navigate("/", { replace: true });
          return;
        }

        const now = new Date();
        const isLive = (start, end) => {
          const s = new Date(start);
          const e = new Date(end);
          return now >= s && now <= e;
        };

        let streamUrl = null;

        if (classData.class1Visible && isLive(classData.class1Times.startTime, classData.class1Times.endTime)) {
          streamUrl = classData.class1LiveStreamUrl;
        } else if (classData.class2Visible && isLive(classData.class2Times.startTime, classData.class2Times.endTime)) {
          streamUrl = classData.class2LiveStreamUrl;
        }

        if (streamUrl) {
          navigate(`/video/${classId}/live`, { state: { streamUrl } });
        } else {
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Failed to fetch schedule", error);
        navigate("/", { replace: true });
      }
    }

    fetchAndRedirect();
  }, [classId, navigate]);

  return <p className="p-4">Redirecting to live class...</p>;
                                              }
