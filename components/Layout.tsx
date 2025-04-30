import React, { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import Loading from './Loading';
import MuzakPlayer from "./MuzakPlayer";
import Link from 'next/link';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkLogin = async () => {
      const res = await fetch(`${window.location.origin}/api/checklogin`, {
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
        <div className="absolute -left-[-10px]">
          <MuzakPlayer />
        </div>

        <span className={styles.span}>
          <img src="/assets/icons/house-solid.svg" alt="" width="15" />
          <Link className={styles.a} href="/">Home</Link>
        </span>
        <span className={styles.span}>
          <img src="/assets/icons/cube-solid.svg" alt="" width="15" />
          <Link className={styles.a} href="/notes">Notes</Link>
        </span>
        <span className={styles.span}>
          <img src="/assets/icons/github.svg" alt="" width="15" />
          <a className={styles.a} href="/github" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </span>
        <span className={styles.span}>
          <img src="/assets/icons/discord.svg" alt="" width="15" />
          <a className={styles.a} href="/discord" target="_blank" rel="noopener noreferrer">
            Discord
          </a>
        </span>

        {loggedIn ? (
          <a className={`${styles.a} absolute -right-[10px]`} href="/logout">
            Logout ({name})
          </a>
        ) : (
          <Link
            className={`${styles.a} absolute -right-[10px]`}
            href={{
              pathname: '/login',
              query: router.pathname === '/' ? undefined : { return_to: router.asPath }
            }}
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
