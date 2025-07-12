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
        { name: "Chemical Reaction & Equations", index: 0, to:"Chemical reaction and equation L8" },
        { name: "Light", index: 1, from:"Light L1",to:"Light + Doubt Class (Part -2)" },
        { name: "Life Processes", index: 2,from:"Life Processes L1",to:"Life Processes L8 + Doubt Class" },
        { name: "Acid Base & Salt", index: 3,from:"Acid base and salts L1",to:"Doubt Solving Class" },
        { name: "Human eye & Colourful World", index: 4, from:"Human eye - L1",to:"Doubt Class" },
        { name: "Control & Coordination", index:5, from:"Control and Co-ordination L1"},
      ]
    },
    Maths: {
      view: "maths",
      chapters: [
        { name: "DPP", index: 19, onlyDpp:"mathsdpp" },
        {
          name: "Real Number",
          index: 0,
          from: "Aarambh Batch 10th Maths - 1st FREE Class | Real Numbers Lecture 1",
          to: "Real Number L6",
          fromNotes:"Real numbers L1",toNotes:"Real Number L6"
        },
        { name: "Polynomial", index: 1, from: "Polynomials L1", to: "Polynomials L6", fromNotes:"Polynomials L1",toNotes:"Polynomials L6" },
        { name: "Pair of Linear Eq in two var", index: 2, from: "Pair of Linear Equations in 2 Var. L1", to: "Pair of linear Equation in 2 Var. L8", fromNotes:"Pair of linear Equation in 2 Var. L1",toNotes:"Pair of linear Equation in 2 Var. L8" },
        { name: "Trigonometry", index: 3, from: "Trigonometry L1", to:"Trigonometry L8", fromNotes:"Trigonometry L1",toNotes:"Trigonometry L8" },
        { name: "Applicatios of Trigonometry", index: 4, from:"Some Applications of Trigonometry L1", to:"Some Applications of Trigonometry L6", fromNotes:"Some Application of Trigonometry | L1",toNotes:"Some App Of Trigno L6" },
        {
          name: "Quadratic Equations",
          index: 5,
          from: "Quadratic Equations L1",
          to: "Quadratic Equations L8",
          fromNotes:"Quadratic Equations L1", toNotes:"Quadratic Equations L8"
        },
         { name: "Arithmetic Progression", index:6, from: "AP - 1"},
      ]
    },
    SST: {
      view: "sst",
      chapters: [
        { name: "WPP", index: 19 },
        { name: "All Lectures", index: 100 },
        { name: "Development", index: 0, from: "Aarambh Batch 10th Social Science - 1st FREE Class | Development Lecture 1 | Check Desc.", to:"Development - 5 & Doubt Solving Class" },
        { name: "Resources and Development", index: 1, from: "Resources and Development - 1",to:"Doubt Solving Class" },
        { name: "Power Sharing", index: 2, from:"Power Sharing L1",to:"Doubt Class + Power Sharing" },
        { name: "Rise of Nationalism in Europe", index: 3, from:"The Rise of Nationalism L1",to:"The Rise of Nationalism in Europe L11" },
        { name: "Forest & Wildlife Resources", index: 4, from:"Forest And Wildlife Resources L1",to:"Forest And Wildlife Resources L3" },
        { name: "Sectors of Indian economy", index: 5,from:"Sectors of the Indian Economy - 1",to:"Doubt +Sectors of Indian Economy class L6" },
        { name: "Federalism", index: 6, from:"FEDERALISM- L1" },
      ]
    },
    IT: {
      view: "it",
      chapters: [
        { name: "IT", index: 0 },
      ]
    },
    English: {
      A: [
        { name: "LR", index: 100, view:"englr" },
        { name: "Grammer", index: 101, view:"enggm" },
        { name: "Writting Skill", index: 102, view:"engws" },
        { name: "Reading Comprehension", index: 103, view:"engrc" },
      ],
      B: [
        { name: "First Flight", index: 0, view: "engff" },
        { name: "Footprint Without Feet", index: 1, view:"engfoot" },
        { name: "Grammer", index: 101, view:"enggm" },
        { name: "Writting Skill", index: 102, view:"engws" },
        { name: "Reading Comprehension", index: 103, view:"engrc" },
      ]
    },
    Hindi: {
      A: [
        { name: "Kshitij", index: 0, view:"hinks" },
        { name: "kritika", index: 1, view:"hinkr" },
      ],
      B: [
        { name: "Sparsh", index: 100, view:"hinsp" },
        { name: "Sanchayan", index: 101, view:"hinsn" },
      ]
    },
    Sanskrit: {
      chapters: [
        { name: "Sanskrit", index: 0, view: "sans" },
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

export default Lectures;
