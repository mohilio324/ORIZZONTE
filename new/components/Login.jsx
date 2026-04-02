import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    //handling logic ta3 login
    navigate("/");
  };

  return (
    <div className="split-screen2">
      <div className="image2">
        <div className="cmp11">
          <h2>LOGIN</h2>
        </div>
        <div className="cmp22">
          <button onClick={() => navigate("/SignIn")}>
            <h2>SIGN UP</h2>
          </button>
        </div>
      </div>

      <div className="login2">
        <form onSubmit={handleLogin}>
          <div className="form-group2">
            <img src="/images/logo.svg" alt="" />
            <h2>WELCOME BACK!</h2>
          </div>

          <div className="input-wrapper">
            <i className="fa-solid fa-lock"></i>
            <img src="/images/HEAD.svg" className="input-icon" />
            <input
              type="email"
              id="EMAIL"
              name="EMAIL"
              className="input-login1"
              placeholder="  Enter your email"
              required
            />
          </div>

          <div className="input-wrapper">
            <i className="fa-solid fa-lock"></i>
            <img src="/images/LOCK.svg" className="input-icon" />
            <input
              type="password"
              id="password2"
              name="password2"
              className="input-login2"
              placeholder="  Password"
              required
            />
          </div>

          <div className="form-grou">
            <div className="ROW">
              <a href="">forgot password?</a>
              <button>LOGIN</button>
            </div>
          </div>
        </form>
        <div class="foot">
          <span>Or Login With</span>
          <div class="socials">
            <p>facebook</p>
            <img src="/images/Facebook_Logo.svg" alt="" />
            <p>Google</p>
            <img src="/images/Google_Logo.svg" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
