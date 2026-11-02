import React, { useEffect, useState } from 'react';
import { NoteHeading } from '../utils/markdownUtils';
import styles from './NoteToc.module.css';

interface NoteTocProps {
  headings: NoteHeading[];
}

// A heading counts as current once it scrolls up past the sticky site header.
const ACTIVE_OFFSET = 72;

const NoteToc: React.FC<NoteTocProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const minLevel = Math.min(...headings.map((heading) => heading.level));

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = headings[0]?.id ?? null;
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (!element || element.getBoundingClientRect().top > ACTIVE_OFFSET) {
          break;
        }
        current = heading.id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [headings]);

  return (
    <aside className={`col-start-3 row-start-1 min-w-0 ${styles.toc}`}>
      <nav className={styles.nav} aria-label="Contents">
        <div className={styles.title}>Contents</div>
        <ul className={styles.list}>
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                className={`${styles.link} ${heading.id === activeId ? styles.active : ''}`}
                style={{ paddingLeft: 12 + (heading.level - minLevel) * 12 }}
                href={`#${encodeURIComponent(heading.id)}`}
                aria-current={heading.id === activeId ? 'location' : undefined}
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
