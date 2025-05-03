import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Loading from './Loading';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const [name, setName] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const res = await fetch("https://speedcubing.top/api/checklogin", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await res.json();

      if (data.loggedin) {
        setName(data.name);
        setLoggedIn(true);
      }
      setLoading(false);
    };

    checkLogin();
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="sticky z-10 top-[0] h-[20px] p-[10px] bg-[#000000] text-[white] text-center font-['JetBrains_Mono',_monospace] cursor-default select-none">
        <span>
          <img src="/assets/icons/house-solid.svg" alt="" width="15" />
          <Link to="/">Home</Link>
        </span>
        <span>
          <img src="/assets/icons/cube-solid.svg" alt="" width="15" />
          <Link to="/algs">Algorithms</Link>
        </span>
        <span>
          <img src="/assets/icons/github.svg" alt="" width="15" />
          <a href="/github" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </span>
        <span>
          <img src="/assets/icons/discord.svg" alt="" width="15" />
          <a href="/discord" target="_blank" rel="noopener noreferrer">
            Discord
          </a>
        </span>

{loggedIn ? (
  <a className='absolute -right-[10px]' href="/logout">
    Logout ({name})
  </a>
) : (
  <Link
    className='absolute -right-[10px]'
    to={
      location.pathname === "/"
        ? "/login"
        : "/login?return_to=" + encodeURIComponent(window.location.href)
    }
  >
    Login
  </Link>
)}

      </header>
      <main className="flex-[1] flex flex-col h-screen">{loading ? <Loading /> : children}</main>
      <footer className="h-[20px] p-[10px] bg-[#000000] text-[white] font-['JetBrains_Mono',_monospace] text-center">
        <span>© 2025 speedcubing.top</span>
      </footer>
    </div>
  );
};

export default Layout;
