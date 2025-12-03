import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const [verifyLink, setVerifyLink] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const isVerified = localStorage.getItem("isVerified") === "true";

    // Redirect if already logged in (no expiration check now)
    if (isLoggedIn && isVerified) {
      const redirectPath = location.state?.redirectPath || "/subjects";
      navigate(redirectPath);
      return;
    }

    const initializeLogin = () => {
      // If token not present, generate and store a new one
      let currentToken = localStorage.getItem("currentToken");
      if (!currentToken) {
        currentToken = Math.random().toString(36).substring(2, 10);
        localStorage.setItem("currentToken", currentToken);
      }

      const url = `https://edu-vibe-nt-old.vercel.app/verify/${currentToken}`;
      setVerifyLink(url);
      setLoading(false);
    };

    initializeLogin();
  }, [navigate, location.state]);

  return (
    <div className="login-container">
      <h2>Login Remove Succesfully ✅</h2>
      <p>Ek baar button pe click karne ke baad khul jayega, no ads wala link. Directly</p>

      {loading ? (
        <p>Generating your link...</p>
      ) : (
        verifyLink && (
          <a href={verifyLink} className="shortener-button">
            Click Here ✅
          </a>
        )
      )}

      <p>After just clicking, you will be redirected.</p>
    </div>
  );
};

export default Login;
