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
  const [pathname, setPathname] = useState('');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  return pathname;
};

export const useSearchParams = () => {
  const [searchParams, setSearchParams] = useState(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSearchParams(new URLSearchParams(window.location.search));
    }
  }, []);

  return searchParams || (typeof URLSearchParams !== 'undefined' ? new URLSearchParams() : null);
};
