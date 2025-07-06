import { useEffect } from "react";
import { useLocation, matchPath } from "react-router-dom";

/**
 * Most specific routes first
 * (from longest to shortest — important!)
 */
const TITLE_MAP = [
  { path: "/video/11/com/live", title: "Live 11th Commerce" },
  { path: "/video/11/bio/live", title: "Live 11th Biology" },
  { path: "/video/11/live", title: "Live 11th Science" },
  { path: "/video/10/live", title: "Live 10th" },
  { path: "/video/9/live", title: "Live 9th" },
  { path: "/video/113/:subject/:chapterIndex", title: "Video 11th Commerce" },
  { path: "/video/111/:subject/:chapterIndex", title: "Video 11th Arts" },
  { path: "/video/11/:subject/:chapterIndex", title: "Video 11th Science" },
  { path: "/video/9/:subject/:chapterIndex", title: "Video 9th" },
  { path: "/video/10/:subject/:chapterIndex", title: "Video 10th" },
  { path: "/chapter-lectures/11/:subject/:chapterIndex", title: "Lectures 11th Science" },
  { path: "/chapter-lectures/10/:subject/:chapterIndex", title: "Lectures 10th" },
  { path: "/chapter-lectures/9/:subject/:chapterIndex", title: "Lectures 9th" },
  { path: "/lectures/11/:subject", title: "Subjects 11th Science" },
  { path: "/lectures/9/:subject", title: "Subjects 9th" },
  { path: "/lectures/10/:subject", title: "Subjects 10th" },
  { path: "/11/com/lectures", title: "11th Commerce" },
  { path: "/11/lectures", title: "Subjects 11th Science Auto" },
  { path: "/11/rc", title: "11th Recorded" },
  { path: "/10/rc", title: "10th Recorded" },
  { path: "/10/test", title: "10th Test" },
  { path: "/subjectss/9", title: "Class 9th Auto" },
  { path: "/subjects/113", title: "Class 11th Commerce" },
  { path: "/subjects/111", title: "Class 11th Arts" },
  { path: "/subjects/11", title: "Class 11th Science" },
  { path: "/subjects/10", title: "Class 10th" },
  { path: "/subjects/9", title: "Class 9th" },
  { path: "/", title: "Homepage" },  // ✅ least specific last!
];

export default function TitleSetter({ fallback = "Next Toppers" }) {
  const location = useLocation();

  useEffect(() => {
    const matched = TITLE_MAP.find(({ path }) =>
      matchPath({ path, end: true }, location.pathname)
    );

    const pageTitle = matched?.title || fallback;
    document.title = pageTitle;

  }, [location.pathname, fallback]);

  return null;
  }
