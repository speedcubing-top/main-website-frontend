import React, { useEffect, useRef, useState } from 'react';
import { NoteHeading } from '../utils/markdownUtils';
import styles from './NoteToc.module.css';

interface NoteTocProps {
  headings: NoteHeading[];
}

// A heading counts as current once it scrolls up past the sticky site header.
const ACTIVE_OFFSET = 72;
const USER_SCROLL_EVENTS = ['wheel', 'touchmove', 'keydown', 'mousedown'];

function getHashId() {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch (err) {
    return '';
  }
}

const NoteToc: React.FC<NoteTocProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  // A heading jumped to stays current until the reader scrolls themselves, since short
  // sections near the bottom can never reach ACTIVE_OFFSET.
  const pinnedId = useRef<string | null>(null);
  const minLevel = Math.min(...headings.map((heading) => heading.level));

  useEffect(() => {
    let frame = 0;
    const isHeading = (id: string) => headings.some((heading) => heading.id === id);
    const update = () => {
      frame = 0;
      if (pinnedId.current) {
        setActiveId(pinnedId.current);
        return;
      }

      let current = headings[0]?.id ?? null;
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (!element || element.getBoundingClientRect().top > ACTIVE_OFFSET) {
          break;
        }
        current = heading.id;
      }

      // At the bottom of the page, the last heading on screen is the one being read.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        for (const heading of headings) {
          const element = document.getElementById(heading.id);
          if (element && element.getBoundingClientRect().top < window.innerHeight) {
            current = heading.id;
          }
        }
      }
      setActiveId(current);
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };
    const onHashChange = () => {
      const id = getHashId();
      if (isHeading(id)) {
        pinnedId.current = id;
        update();
      }
    };
    const unpin = () => {
      pinnedId.current = null;
    };

    pinnedId.current = isHeading(getHashId()) ? getHashId() : null;
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', onHashChange);
    USER_SCROLL_EVENTS.forEach((type) => window.addEventListener(type, unpin, { passive: true }));
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('hashchange', onHashChange);
      USER_SCROLL_EVENTS.forEach((type) => window.removeEventListener(type, unpin));
      cancelAnimationFrame(frame);
    };
  }, [headings]);

  return (
    <aside className={`col-start-3 row-start-1 min-w-0 ${styles.toc}`}>
      <nav className={styles.nav} aria-label="Table of contents">
        <div className={styles.title}>TOC</div>
        <ul className={styles.list}>
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                className={`${styles.link} ${heading.id === activeId ? styles.active : ''}`}
                style={{ paddingLeft: 12 + (heading.level - minLevel) * 12 }}
                href={`#${encodeURIComponent(heading.id)}`}
                aria-current={heading.id === activeId ? 'location' : undefined}
                onClick={() => {
                  pinnedId.current = heading.id;
                  setActiveId(heading.id);
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default NoteToc;
