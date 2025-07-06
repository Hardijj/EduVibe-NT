import { useEffect } from "react";
import { useLocation, matchPath } from "react-router-dom";

/**
 * Put ONLY path–title pairs here.
 * Add, rename, or delete entries anytime — App.js never changes.
 */
const TITLE_MAP = {
  "/": "Homepage",
  "/subjects/10": "Class 10th",
  "/subjects/11": "Class 11th Science",
  "/subjects/113": "Class 11th Commerce",
  "/subjects/111": "Class 11th Arts",
  "/subjects/9": "Class 9th",
  "/subjectss/9": "Class 9th Auto",
  "/10/test": "10th Test",
  "/10/rc": "10th Recorded",
  "/11/rc": "11th Recorded",
  "/lectures/9/:subject": "Subjects 9th",
  "/lectures/11/:subject": "Subjects 11th Science",
  "/11/lectures": "Subjects 11th Science Auto",
  "/11/com/lectures": "11th Commerce",
  "/chapter-lectures/9/:subject/:chapterIndex": "Lectures 9th",
  "/chapter-lectures/10/:subject/:chapterIndex": "Lectures 10th",
  "/chapter-lectures/11/:subject/:chapterIndex": "Lectures 11th Science",
  "/video/9/:subject/:chapterIndex": "Video 9th",
  "/video/11/:subject/:chapterIndex": "Video 11th Science",
  "/video/113/:subject/:chapterIndex": "Video 11th Commerce",
  "/video/111/:subject/:chapterIndex": "Video 11th Arts",
  "/video/9/live": "Live 9th",
  "/video/10/live": "Live 10th",
  "/video/11/live": "Live 11th Science",
  "/video/11/bio/live": "Live 11th Biology",
  "/video/11/com/live": "Live 11th Commerce",
};

/**
 * Invisible component that sets the tab title
 * according to TITLE_MAP whenever the URL changes.
 */
export default function TitleSetter({ fallback = "MySite" }) {
  const location = useLocation();

  useEffect(() => {
    const match = Object.entries(TITLE_MAP).find(([pattern]) =>
      matchPath({ path: pattern, end: false }, location.pathname)
    );
    document.title = match ? match[1] : fallback;
  }, [location.pathname, fallback]);

  return null;           // renders nothing
}
