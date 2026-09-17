import { useEffect, useState } from 'react';

const staticRouter = {
  push: (url) => {
    if (typeof window !== 'undefined') window.location.href = url;
  },
  replace: (url) => {
    if (typeof window !== 'undefined') window.location.replace(url);
  },
  back: () => {
    if (typeof window !== 'undefined') window.history.back();
  },
  refresh: () => {
    if (typeof window !== 'undefined') window.location.reload();
  },
  prefetch: () => {}
};

export const useRouter = () => staticRouter;

export const usePathname = () => {
  const [pathname, setPathname] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '';
  });
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };
    if (window.location.pathname !== pathname) {
      setPathname(window.location.pathname);
    }
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return pathname;
};

export const useSearchParams = () => {
  const [searchParams, setSearchParams] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return null;
  });
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleLocationChange = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return searchParams || (typeof URLSearchParams !== 'undefined' ? new URLSearchParams() : null);
};
