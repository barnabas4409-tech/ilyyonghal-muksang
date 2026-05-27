'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    href: '/',
    label: '홈',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          stroke="currentColor"
          strokeWidth="1.6"
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? '0.12' : '0'}
        />
        <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/today',
    label: '묵상',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 20h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
          stroke="currentColor"
          strokeWidth="1.6"
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? '0.12' : '0'}
        />
      </svg>
    ),
  },
  {
    href: '/journal',
    label: '기록',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
          stroke="currentColor"
          strokeWidth="1.6"
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? '0.1' : '0'}
        />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: '나',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle
          cx="12" cy="7" r="4"
          stroke="currentColor"
          strokeWidth="1.6"
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? '0.12' : '0'}
        />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
      <div className="max-w-lg mx-auto flex items-center justify-around px-4 py-2">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-1 px-4 liquid-transition-fast ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {icon(active)}
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
