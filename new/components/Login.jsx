
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext.jsx";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // 1. Unified state: ensure keys match what you use in handleLogin
  const [credentials, setCredentials] = useState({
    username: "", // Changed from email to username to match your payload logic
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 2. Use AuthContext login which handles token + role storage
      const data = await login(credentials.username, credentials.password);

      console.log("Login successful! Role:", data.role);

      // 3. Route based on role
      if (data.role === "boss") {
        navigate("/admin");
      } else if (data.role === "employee") {
        navigate("/employee-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err.response?.data);
      // DRF usually returns detail for auth errors
      const msg = err.response?.data?.detail || "Invalid username or password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-screen2">
      <div className="image2">
        <div className="cmp11"><h2>LOGIN</h2></div>
        <div className="cmp22">
          <button onClick={() => navigate("/SignIn")}><h2>SIGN UP</h2></button>
        </div>
      </div>

      <div className="login2">
        <form onSubmit={handleLogin}>
          <div className="form-group2">
            <img src="/images/logo.svg" alt="Logo" />
            <h2>WELCOME BACK!</h2>
          </div>

          {error && <p style={{ color: "#ff4d4d", textAlign: "center", fontSize: "14px" }}>{error}</p>}

          <div className="input-wrapper">
            <img src="/images/HEAD.svg" className="input-icon" alt="user" />
            <input
              type="text"
              id="username"
              name="username"
              className="input-login1"
              placeholder="  Enter your username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-wrapper">
            <img src="/images/LOCK.svg" className="input-icon" alt="lock" />
            <input
              type="password"
              id="password2"
              name="password"
              className="input-login2"
              placeholder="  Password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-grou">
            <div className="ROW">
              <a href="#forgot">forgot password?</a>
              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "LOGIN"}
              </button>
            </div>
          </div>
        </form>

        <div className="foot">
          <span>Or Login With</span>
          <div className="socials">
            <p>facebook</p>
            <img src="/images/Facebook_Logo.svg" alt="FB" />
            <p>Google</p>
            <img src="/images/Google_Logo.svg" alt="G" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;