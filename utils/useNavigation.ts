import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export function isNotesUrl(url: string) {
  const pathname = url.split(/[?#]/)[0];
  return pathname === '/notes' || pathname.startsWith('/notes/');
}

// The URL being navigated to, or null when no navigation is in progress.
export function useNavigatingTo() {
  const router = useRouter();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  useEffect(() => {
    const start = (url: string, { shallow }: { shallow: boolean }) => setNavigatingTo(shallow ? null : url);
    const done = () => setNavigatingTo(null);

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', done);
    router.events.on('routeChangeError', done);
    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', done);
    };
  }, [router.events]);

  return navigatingTo;
}
