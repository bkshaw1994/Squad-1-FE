import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import axios from "axios";
import "./LoginCard.css";

function CreateAccount() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCpassword] = useState("");
  const [emailId, setEmailId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [cpasswordError, setCpasswordError] = useState("");
  const [emailIdError, setEmailIdError] = useState("");
  const [nameError, setNameError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }

    // Load remembered username
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }
  }, [navigate]);

  const validateName = (name) => {
    if (!name.trim()) {
      setNameError("Name is required");
      return false;
    }
    if (name.trim().length < 3) {
      setNameError("Name must be at least 3 characters");
      return false;
    }
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name)) {
      setNameError("Name can contain only letters and spaces");
      return false;
    }
    setNameError("");
    return true;
  };

  const validateUsername = (username) => {
    if (!username) {
      setUsernameError("Username is required");
      return false;
    } else if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return false;
    }
    setUsernameError("");
    return true;
  };
  const validateEmailId = (emailId) => {
    if (!emailId) {
      setEmailIdError("Email is required");
      return false;
    }
    setEmailIdError("");
    return true;
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };
  const validateCpassword = (cpassword) => {
    if (!cpassword) {
      setCpasswordError("Password is required");
      return false;
    } else if (password != cpassword) {
      console.log(cpassword);
      setCpasswordError("Password must be same");
      return false;
    }
    setCpasswordError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("Form submitted with:", { username, password, cpassword });

    // Validate inputs
    const isNameValid = validateName(name);
    const isEmailValid = validateEmailId(emailId)
    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);
    const isCpasswordValid = validateCpassword(cpassword);

    console.log("Validation results:", {
      isUsernameValid,
      isPasswordValid,
      isCpasswordValid,
    });

    if (
      !isNameValid ||
      !isEmailValid ||
      !isUsernameValid ||
      !isPasswordValid ||
      !isCpasswordValid
    ) {
      console.log("Validation failed, stopping");
      return;
    }

    setLoading(true);
    console.log("Making API call to login...");
    console.log("Username value:", username, "Length:", username.length);
    console.log("Password value:", password, "Length:", password.length);
    console.log("Cpassword value:", cpassword, "Length:", cpassword.length);

    const payload = {
        name: name.trim(),
      userName: username.trim(),
      email: emailId.trim(), // Backend expects 'userName' with capital N
      password: password.trim(),
    };
    console.log("Sending payload:", JSON.stringify(payload));

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Full API Response:", response);
      console.log("Response data:", response.data);

      // Handle successful login - backend returns: { success: true, data: { token, user info } }
        if (response.data.success && response.data.data?.token) {
            const token = response.data.data.token

            const userData = {
                name: response.data.data.name,
                userName: response.data.data.userName,
                email: response.data.data.email
            }

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(userData))

        // Handle remember me
        if (rememberMe) {
          localStorage.setItem("rememberedUsername", username);
        } else {
          localStorage.removeItem("rememberedUsername");
        }

        console.log("Navigating to dashboard...");
        navigate("/dashboard", { replace: true });
      } else {
        console.error(
          "Unexpected response structure:",
          JSON.stringify(response.data, null, 2)
        );
        setError("Login failed: Invalid response from server");
      }
    } catch (err) {
      // Handle errors
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);
      if (err.response) {
        // Server responded with error
        setError(err.response.data.message || "Duplicate User");
      } else if (err.request) {
        // Request made but no response
        setError("Cannot connect to server. Please try again.");
      } else {
        // Other errors
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Logo Section */}
      <div className="logo-section">
        <div className="logo-icon">
          <LogIn />
        </div>
        <h1 className="app-title">MyApp</h1>
      </div>

      {/* SignUp Card */}
      <div className="login-card">
        <div className="login-card-inner">
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}
            {/* Name */}
            <div className="form-group">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError("");
                  setError("");
                }}
                onBlur={() => validateName(name)}
                placeholder="Name"
                className={`input-field ${nameError ? "error" : ""}`}
              />
              {nameError && <p className="field-error">{nameError}</p>}
            </div>

            {/* Email Input */}
            <div className="form-group">
              <input
                id="emailId"
                type="email"
                value={emailId}
                onChange={(e) => {
                  setEmailId(e.target.value);
                  setEmailIdError("");
                  setError("");
                }}
                onBlur={() => validateEmailId(emailId)}
                placeholder="EmailId"
                className={`input-field ${emailIdError ? "error" : ""}`}
              />
              {emailIdError && <p className="field-error">{emailIdError}</p>}
            </div>
            {/* Username input */}
            <div className="form-group">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError("");
                  setError("");
                }}
                onBlur={() => validateUsername(username)}
                placeholder="Username"
                className={`input-field ${usernameError ? "error" : ""}`}
              />
              {usernameError && <p className="field-error">{usernameError}</p>}
            </div>

            {/* Password Input */}
            <div className="form-group">
              <div className="password-container">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                    setError("");
                  }}
                  onBlur={() => validatePassword(password)}
                  placeholder="Password"
                  className={`input-field ${passwordError ? "error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {passwordError && <p className="field-error">{passwordError}</p>}
            </div>
            {/* confirm password   */}
            <div className="form-group">
              <div className="password-container">
                <input
                  id="cpassword"
                  type={showPassword ? "text" : "password"}
                  value={cpassword}
                  onChange={(e) => {
                    setCpassword(e.target.value);
                    setCpasswordError("");
                    setError("");
                  }}
                  onBlur={() => validateCpassword(cpassword)}
                  placeholder="confirm Password"
                  className={`input-field ${cpasswordError ? "error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {cpasswordError && (
                <p className="field-error">{cpasswordError}</p>
              )}
            </div>

            {/* SignUp Button */}
            <button type="submit" disabled={loading} className="login-button">
              {loading ? "Logging in..." : "Sign Up"}
            </button>

            {/* Forgot Password */}
          </form>
        </div>
      </div>

      {/* Create Account Button */}
      <div className="create-account-card">
        <button
          type="button"
          onClick={() => (window.location.href = "/Login")}
          className="create-account-button"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default CreateAccount;
