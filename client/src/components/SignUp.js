import React from "react";
import { useState, useEffect } from "react";
import User from "../User.js";

const SignUp = ({ onSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [nName, setnName] = useState("");
  const [userID, setUserID] = useState(0);
  const [verificationLink, setVerificationLink] = useState("");
  const [localstate, setstate] = useState("signup");
  const [verified, setVerified] = useState(false);
  const [vCode, setVCode] = useState(0);

  useEffect(() => {
    if (localstate) {
      let current_user = new User(userID, nName, email, password);
      onSignup({ state: localstate, user: current_user });
    }
  }, [userID]);

  useEffect(() => {
    setstate("signup");
  }, [email]);

  const addUser = async () => {
    const newUser = {
      nName: nName,
      email: email,
      password: password,
    };

    const send = {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Specify the content type as JSON
      },
      body: JSON.stringify(newUser), // Convert the object to a JSON string
    };

    const response = await fetch("/api/users/add-user", send);
    if (response.status === 409) {
      alert("Account under " + email + " already exists.");
    } else if (response.status === 200) {
    } else {
      alert("error: " + response);
    }
    return response.json();
  };

  const handleSignup = async () => {
    // Validate login details (you can add your own validation logic here)
    if (email && password && password2 && nName) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("invalid email format");
      } else {
        if (password === password2) {
          const data = await addUser();
          if (data.status == 200) {
            setVerificationLink(data.link);
            setstate("verifying");
          }
        } else {
          alert("Passwords dont match.");
        }
      }
    } else {
      alert("Please enter email, first name, last name, password.");
    }
  };

  const handleKeyDown = (event) => {
    const keyCode = event.which || event.keyCode;
    // Allow only numeric characters (0-9) and the backspace key
    if ((keyCode < 48 || keyCode > 57) && keyCode !== 8) {
      event.preventDefault();
    }
  };

  const handleInputChange = (event) => {
    // Remove non-numeric characters using a regular expression
    const numericValue = event.target.value.replace(/[^0-9]/g, "");
    setVCode(Number(numericValue));
  };

  const verifyEmail = async () => {
    try {
      const response = await fetch(
        `/verify-email/${encodeURIComponent(verificationLink)}/${vCode}`
      );
      const data = await response.json();

      if (response.ok) {
        setVerified(true);
        alert(`Email: ${email} successfully verified. Logging in....`);
        setUserID(data.userID);
        setstate("loggedin");
      } else {
        console.error("Verification failed:", data);
        alert(data.message);
      }
    } catch (error) {
      console.error("Error verifying email:", error.message);
    }
  };

  return (
    <div className="signup">
      <span>
        Email:{" "}
        <input
          type="text"
          id="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        Nickname:{" "}
        <input
          type="text"
          id="nName"
          onChange={(e) => setnName(e.target.value)}
        />
        <br />
        Password:{" "}
        <input
          type="text"
          id="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        Confirm Password:{" "}
        <input
          type="text"
          id="password2"
          onChange={(e) => setPassword2(e.target.value)}
        />
      </span>
      <button onClick={handleSignup}>Sign Up</button>
      {verificationLink && (
        <div>
          <p> Open link to receive verification code: {verificationLink} </p>
          <span>
            5 Digit Verification Code:{" "}
            <input
              type="text"
              id="vCode"
              onKeyDown={handleKeyDown}
              onChange={handleInputChange}
            />
          </span>
          <button onClick={verifyEmail}>Verify Email</button>
        </div>
      )}
    </div>
  );
};

export default SignUp;