import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
    <div className='layoutdiv'>
      <header>
        <span>
          <img src="/assets/icons/house-solid.svg" alt="" width="15" />
          <a href="/">Home</a>
        </span>
        <span>
          <img src="/assets/icons/cube-solid.svg" alt="" width="15" />
          <a href="/algs">Algorithms</a>
        </span>
        <span>
          <img src="/assets/icons/github.svg" alt="" width="15" />
          <a href="/github" target="_blank">
            GitHub
          </a>
        </span>
        <span>
          <img src="/assets/icons/discord.svg" alt="" width="15" />
          <a href="/discord" target="_blank">
            Discord
          </a>
        </span>

        <a className='loginbutton' href={(() => {
          if (loggedIn) {
            return "/logout";
          } else if(location.pathname === "/") {
            return "/login";
          } else {
            return "/login?return_to=" + encodeURIComponent(window.location.href);
          }
        })()}> 
          {loggedIn ? `Logout (${name})` : 'Login'}
        </a>

      </header>
      <main>{loading ? <Loading /> : children}</main>
      <footer>
        <span>© 2024 speedcubing.top</span>
      </footer>
    </div>
  );
};

export default Layout;
