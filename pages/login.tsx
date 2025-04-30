import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';

const Login: React.FC = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    const res = await fetch(`${window.location.origin}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(form.entries())),
      credentials: 'include',
    });

    const data = await res.json();

    if (!data.loggedin) {
      setErrorMessage('Invalid username/password');
    } else {
      const returnTo = typeof router.query.return_to === 'string' ? router.query.return_to : '/';
      window.location.href = returnTo;
    }
  };

  return (
    <div className="flex-1 bg-[#101010]">
      <table align="center" width="200" border={0}>
        <tbody>
          <tr>
            <td>
              {errorMessage && (
                <p className="font-['JetBrains_Mono',_monospace] text-white">{errorMessage}</p>
              )}
              <form onSubmit={handleSubmit} id="myform">
                <label
                  className="font-['JetBrains_Mono',_monospace] text-white"
                  htmlFor="username"
                >
                  Username:
                </label>
                <input type="text" id="username" name="username" />
                <br />
                <label
                  className="font-['JetBrains_Mono',_monospace] text-white"
                  htmlFor="password"
                >
                  Password:
                </label>
                <input type="password" id="password" name="password" />
                <br />
                <input type="submit" value="Login" />
              </form>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Login;
