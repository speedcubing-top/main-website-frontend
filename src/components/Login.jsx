import React, {useState} from 'react';
import { useSearchParams } from 'react-router-dom';

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
    <div className="flex-[1] bg-[#101010]">
      <table align="center" width="200" border="0">
        <tbody>
          <tr>
            <td>
              {errorMessage && <p className="font-['JetBrains_Mono',_monospace] text-[white]">{errorMessage}</p>}
              <form onSubmit={handleSubmit} id="myform">
                <label className="font-['JetBrains_Mono',_monospace] text-[white]" htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" /><br />
                <label className="font-['JetBrains_Mono',_monospace] text-[white]" htmlFor="password">Password:</label>
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
