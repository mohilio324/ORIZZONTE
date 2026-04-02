import { useNavigate } from "react-router-dom";
import "./SignIn.css";

function SignIn() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    //handling logic ta3 sign in
    navigate("/");
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
                class="input1"
                id="FirstName"
                name="FirstName"
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
