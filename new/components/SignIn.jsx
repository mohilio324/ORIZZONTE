import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SignIn.css";

function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      username: formData.FirstName + formData.LastName,
      email: formData.Email,
      password: formData.password,
    };

    try {
      await axios.post("http://127.0.0.1:8000/api/signup/", payload);
      navigate("/Login");
    } catch (err) {
      const serverError = err.response?.data?.errors;
      if (serverError) {
        setError(Object.values(serverError).flat()[0]);
      } else {
        setError("Registration failed. Please try again.");
      }
      console.log(err.response?.data);
    }
  };

  return (
    <div className="split-screen">
      <div className="image">
        <div className="cmp1">
          <h2>SIGN UP</h2>
        </div>
        <div className="cmp2">
          <button onClick={() => navigate("/Login")}>
            <h2>LOGIN</h2>
          </button>
        </div>
      </div>

      <div className="login">
        <h2>Create your account</h2>
        {error && (
          <p style={{ color: "#ff4d4d", fontSize: "14px", marginBottom: "10px" }}>
            {error}
          </p>
        )}
        <p>
          Join the Orizzonte community and unlock exclusive services,priority{" "}
          <br /> support, and special member offers.
        </p>
        <form onSubmit={handleLogin}>
          <div className="NameRow">
            <div className="form-group">
              <label htmlFor="FirstName">First name</label>
              <input
                type="text"
                className="input1"
                id="FirstName"
                name="FirstName"
                value={formData.FirstName}
                onChange={handleChange}
                placeholder="  Enter your first name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="LastName">Last name</label>
              <input
                type="text"
                id="LastName"
                name="LastName"
                className="input1"
                value={formData.LastName}
                onChange={handleChange}
                placeholder="  Enter your last name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="Email">Email</label>
            <input
              type="email"
              id="Email"
              name="Email"
              className="input2"
              value={formData.Email}
              onChange={handleChange}
              placeholder="  Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <p>Gender</p>
            <div className="gender-row">
              <div className="radio-item">
                <label htmlFor="female">female</label>
                <input type="radio" id="female" name="gender" />
              </div>
              <div className="radio-item">
                <label htmlFor="male">male</label>
                <input type="radio" id="male" name="gender" />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              className="input2"
              value={formData.password}
              onChange={handleChange}
              placeholder="   Create password"
              required
            />
          </div>

          <button type="submit" className="btn-sbmt">
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignIn;