import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "../styles/Lectures.css";

const Lectures = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState("A");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  const lectures = {
    Notice: [
      { name: "Introduction", index: 0 },
    ],
    Science: {
      view: "science",
      chapters: [
        { name: "ACP", index: 19 },
        { name: "Chemical Reaction & Equations", index: 0 },
        { name: "Light", index: 1 },
        { name: "Life Processes", index: 2 },
        { name: "Acid Base & Salt", index: 3 },
        { name: "Human eye & Colourful World", index: 4 },
      ]
    },
    Maths: {
      view: "maths",
      chapters: [
        { name: "DPP", index: 19 },
        {
          name: "Real Number",
          index: 0,
          from: "Aarambh Batch 10th Maths - 1st FREE Class | Real Numbers Lecture 1",
          to: "Real Number L6"
        },
        { name: "Polynomial", index: 1, from: "Polynomials L1", to: "Polynomials L6" },
        { name: "Pair of Linear Eq in two var", index: 2, from: "Pair of Linear Equations in 2 Var. L1", to: "Pair of linear Equation in 2 Var. L8" },
        { name: "Trigonometry", index: 3, from: "Trigonometry L1", to:"Trigonometry L8" },
        { name: "Applicatios of Trigonometry", index: 4, from:"Some Applications of Trigonometry L1", to:"Some Applications of Trigonometry L6" },
        {
          name: "Quadratic Equations",
          index: 5,
          from: "Quadratic Equations L1"
        },
      ]
    },
    SST: {
      view: "sst",
      chapters: [
        { name: "WPP", index: 19 },
        { name: "Holiday Homework", index: 100 },
        { name: "Development", index: 0 },
        { name: "Resources and Development", index: 1 },
        { name: "Power Sharing", index: 2 },
        { name: "Rise of Nationalism in Europe", index: 3 },
        { name: "Forest & Wildlife Resources", index: 4 },
        { name: "Sectors of Indian economy", index: 5 },
        { name: "Federalism", index: 6 },
      ]
    },
    IT: {
      view: "it",
      chapters: [
        { name: "Notice", index: 0 },
        { name: "Communication Skills II", index: 1 },
        { name: "Skill Management II", index: 2 },
      ]
    },
    English: {
      view: "english",
      A: [
        { name: "Two Gentlemen of Verona", index: 100 },
        { name: "Frog and Nightingale", index: 101 },
        { name: "Mr Packletide's Tiger", index: 102 },
        { name: "Not Marble nor Glied Monuments", index: 103 },
      ],
      B: [
        { name: "A Letter to God", index: 0 },
        { name: "A Dust of Snow", index: 1 },
        { name: "Fire & Ice", index: 2 },
        { name: "A Triumph of Surgery", index: 3 },
        { name: "Grammar", index: 19 },
      ]
    },
    Hindi: {
      view: "hindi",
      A: [
        { name: "Chapter 1", index: 0 },
        { name: "राम - लक्ष्मण - परशुराम संवाद", index: 1 },
        { name: "कृतिका, माता का अँचल शिवपूजन सहाय", index: 2 },
      ],
      B: [
        { name: "Kabir sakhi", index: 100 },
        { name: "मीरा बाई पद", index: 101 },
        { name: "मैथिलीशरण गुप्त मनुष्यता", index: 102 },
        { name: "प्रेमचंद (बड़े भाई साहब)", index: 103 },
        { name: "सुमित्रानंदन पंत पर्वत प्रदेश में पावस", index: 104 },
      ]
    },
    Sanskrit: {
      view: "sanskrit",
      chapters: [
        { name: "शुचिपर्यावरणम्", index: 0 },
      ]
    }
  };

  const isCourseSubject = subject === "English" || subject === "Hindi";
  const selectedSubject = lectures[subject];
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
            to={`/10/recordings/${subject}/${chapter.name}`}
            state={{
              from: chapter.from || null,
              to: chapter.to || null,
              view: selectedSubject.view || null,
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

export default Lectures;
