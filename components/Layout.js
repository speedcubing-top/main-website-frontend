import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Loading from './Loading';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginUrl, setLoginUrl] = useState('/login');

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

  useEffect(() => {
    const returnTo = router.pathname === "/" ? "/login" : `/login?return_to=${encodeURIComponent(window.location.href)}`;
    setLoginUrl(returnTo);
  }, [router.pathname]);

  return (
    <div className={styles.layoutdiv}>
      <header className={styles.header}>
        <span>
          <img src="/assets/icons/house-solid.svg" alt="" width="15" />
          <Link href="/">Home</Link>
        </span>
        <span>
          <img src="/assets/icons/cube-solid.svg" alt="" width="15" />
          <Link href="/algs">Algorithms</Link>
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
  <a className={styles.loginbutton} href="/logout">
    Logout ({name})
  </a>
) : (
  <Link className={styles.loginbutton} href={loginUrl}>Login</Link>
)}

      </header>
      <main className={styles.main}>{loading ? <Loading /> : children}</main>
      <footer className={styles.footer}>
        <span>© 2025 speedcubing.top</span>
      </footer>
    </div>
  );
};

export default Layout;
