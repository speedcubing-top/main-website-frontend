import React, {useState} from 'react';
import { useSearchParams } from 'react-router-dom';
import './Login.css';

const Login = () => {

  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("https://speedcubing.top/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.target).entries())),
      credentials: "include", // 確保 cookie 被存儲
    });

    const data = await res.json();

    if (!data.loggedin) {
      setErrorMessage("Invalid username/password");
    } else {
      window.location.href = searchParams.get("return_to") || "/";
    }
  }

  return (
    <div className="logindiv">
      <table align="center" width="200" border="0">
        <tbody>
          <tr>
            <td>
              {errorMessage && <p>{errorMessage}</p>}
              <form onSubmit={handleSubmit} id="myform">
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" /><br />
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" /><br />
                <input type="submit" value="Login" />
              </form>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Login;
