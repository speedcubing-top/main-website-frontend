import React, { useEffect, useState } from "react";

interface LoadingProps {
  // The page being navigated to, to show the requests it takes to load it.
  url?: string;
}

interface PageRequests {
  data: string;
  // getServerSideProps makes these from the frontend server, so the browser never sees them.
  server: string[];
}

// Mirrors how Next names its data requests and what each page's getServerSideProps fetches.
function getPageRequests(url: string): PageRequests | null {
  const buildId = window.__NEXT_DATA__?.buildId;
  if (!buildId) {
    return null;
  }

  const { pathname, searchParams } = new URL(url, window.location.origin);
  const dataUrl = (page: string, params: string[][] = []) => {
    const query = new URLSearchParams([...params, ...Array.from(searchParams)]).toString();
    return `/_next/data/${buildId}${page}.json${query ? `?${query}` : ''}`;
  };

  if (pathname === '/') {
    return { data: dataUrl('/index'), server: ['/api/notes/mainpage'] };
  }
  if (pathname === '/notes') {
    return { data: dataUrl('/notes'), server: ['/api/notetree'] };
  }
  if (pathname.startsWith('/notes/')) {
    const slug = pathname.slice('/notes/'.length).split('/').map((part) => ['slug', decodeURIComponent(part)]);
    return { data: dataUrl(pathname, slug), server: [`/api/notes${pathname.slice('/notes'.length)}`, '/api/notetree'] };
  }
  if (pathname === '/redirect') {
    return { data: dataUrl('/redirect'), server: [] };
  }
  return null;
}

const Loading: React.FC<LoadingProps> = ({ url }) => {
  const [requests, setRequests] = useState<PageRequests | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!url) {
      return;
    }
    setRequests(getPageRequests(url));

    const startedAt = Date.now();
    const intervalId = setInterval(() => setElapsed(Date.now() - startedAt), 100);
    return () => clearInterval(intervalId);
  }, [url]);

  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#101010] text-center font-[family-name:var(--font-jetbrains-mono),_monospace]">
      <h1 className="m-0 text-[white]">Loading... please wait</h1>
      {requests && (
        <div className="mt-[24px] max-w-[90%] text-left text-[13px] leading-[22px] text-[#8b949e] break-all">
          <div>
            <span className="text-[#79c0ff]">GET</span> {requests.data}
          </div>
          {requests.server.map((path) => (
            <div key={path} className="pl-[16px]">
              └ server → backend <span className="text-[#79c0ff]">GET</span> {path}
            </div>
          ))}
          <div className="mt-[8px] tabular-nums">{(elapsed / 1000).toFixed(1)}s</div>
        </div>
      )}
    </div>
  );
};

export default Loading;
