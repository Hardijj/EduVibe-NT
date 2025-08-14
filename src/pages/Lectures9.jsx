import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "../styles/Lectures.css";

const Lectures9 = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState("A");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  const lectures9 = {
    Science: {
      chapters: [
        { name: "ACP", index: 19, onlyDpp: "sciencedpp" },
        { name: "Matter in our Surroundings", view: "mattersurrounding" },
        { name: "Is matter around us pure ?", view: "matterpure" },
        { name: "Atoms & Molecules", view: "atom" },
        { name: "Motion", view: "motion" },
        { name: "Force & law of motion", view: "force" },
        { name: "Gravitation", view: "gravitation" },
        { name: "The Fundamental Unit of Life", view: "fundamental" },
        { name: "Tissue", view: "tissues" },
      ]
    },
    Maths: {
      view: "maths",
      chapters: [
        { name: "DPP", index: 19, onlyDpp:"mathsdpp" },
        { name: "Maths"},
      ]
    },
    SST: {
      view: "sst",
      chapters: [
        { name: "WPP", index: 19, onlyDpp:"sstdpp" },
        { name: "SST", index: 100 },
      ]
    },
    IT: {
      view: "it",
      chapters: [
        { name: "IT", index: 0 },
      ]
    },
    AI: {
      view: "ai",
      chapters: [
        { name: "AI"}
      ],
    },
    English: {
      A: [
        { name: "LR", index: 100, view:"englr" },
        { name: "Grammer", index: 101, view:"enggm" },
        { name: "Reading Comprehension", index: 103, view:"engrc" },
        { name: "Live", view: "engalive" },
      ],
      B: [
        { name: "BeeHive", index: 0, view: "engbee" },
        { name: "Moments", index: 1, view:"engmoments" },
        { name: "Grammer", index: 101, view:"enggm" },
        { name: "Reading Comprehension", index: 103, view:"engrc" },
        { name: "Live", view: "engblive" },
      ]
    },
    Hindi: {
      A: [
        { name: "Kshitij", index: 0, view:"hinks" },
        { name: "kritika", index: 1, view:"hinkr" },
        { name: "Live", view: "hinalive" },
      ],
      B: [
        { name: "Sparsh", index: 100, view:"hinsp" },
        { name: "Sanchayan", index: 101, view:"hinsn" },
        { name: "Live", view: "hinblive" },
      ]
    },
    Sanskrit: {
      chapters: [
        { name: "Shemushi", index: 0, view: "shemushi" },
        { name: "Manshi", view: "manshi" },
        { name: "Grammar", view: "sansgm" },
        { name: "Live", view: "sanslive" },
      ]
    }
  };

  const isCourseSubject = subject === "English" || subject === "Hindi";
  const selectedSubject = lectures9[subject];
  const chapters = isCourseSubject
    ? selectedSubject[selectedCourse]
    : selectedSubject.chapters;

  return (
    <div className="lectures-container">
      <img
        src="https://dxixtlyravvxx.cloudfront.net/540/admin_v1/sample/55335180_10th%20weekly.jpeg"
        alt="Weekly Planner"
        className="tt"
      />
      <h2>{subject} Lectures</h2>

      {isCourseSubject && (
        <div className="course-tabs">
          <button
            className={`course-tab ${selectedCourse === "A" ? "active" : ""}`}
            onClick={() => setSelectedCourse("A")}
          >
            Course A
          </button>
          <button
            className={`course-tab ${selectedCourse === "B" ? "active" : ""}`}
            onClick={() => setSelectedCourse("B")}
          >
            Course B
          </button>
        </div>
      )}

      <div className="lecture-boxes">
        {chapters?.map((chapter, idx) => (
          <Link
  key={idx}
  to={`/9/recordings/${subject}/${chapter.name}`}
  state={{
  from: chapter.from || null,
  to: chapter.to || null,
  fromNotes: chapter.fromNotes || null,
  toNotes: chapter.toNotes || null,
  view: chapter.view || subject.toLowerCase(),
  onlyDpp: chapter.onlyDpp || null,
}}
  className="subject-box"
>
  {chapter.name}
</Link>
        ))}
      </div>
    </div>
  );
};

export default Lectures9;
