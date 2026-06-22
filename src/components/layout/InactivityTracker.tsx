'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { logout } from '@/lib/actions/auth';
import { toast } from 'sonner';

export default function InactivityTracker({ timeoutMs = 15 * 60 * 1000 }: { timeoutMs?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Don't track inactivity on login page
    if (pathname === '/login') return;

    const handleInactive = async () => {
      toast.error('Tu sesión ha expirado por inactividad.');
      await logout();
      router.push('/login');
    };

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(handleInactive, timeoutMs);
    };

    // Initialize timer
    resetTimer();

    // Events to track
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    // Attach event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [pathname, router, timeoutMs]);

  return null;
}
