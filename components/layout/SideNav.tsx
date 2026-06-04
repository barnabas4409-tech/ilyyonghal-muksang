'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    href: '/',
    label: '홈',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          stroke="currentColor" strokeWidth="1.6"
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? '0.12' : '0'}
        />
        <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/today',
    label: '오늘의 묵상',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 20h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
          stroke="currentColor" strokeWidth="1.6"
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? '0.12' : '0'}
        />
      </svg>
    ),
  },
  {
    href: '/journal',
    label: '내 여정',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
          stroke="currentColor" strokeWidth="1.6"
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? '0.1' : '0'}
        />
      </svg>
    ),
  },
  {
    href: '/discover',
    label: '좋은 묵상 발견',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6"
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? '0.1' : '0'} />
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: '나',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle
          cx="12" cy="7" r="4"
          stroke="currentColor" strokeWidth="1.6"
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? '0.12' : '0'}
        />
      </svg>
    ),
  },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border/60 min-h-dvh sticky top-0 px-4 py-6">
      {/* 로고 */}
      <Link href="/" className="flex items-center gap-2.5 px-2 mb-8">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-semibold">✝</span>
        </div>
        <span className="text-sm font-semibold text-foreground">일용할묵상</span>
      </Link>

      {/* 네비게이션 */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || (href === '/' && pathname.startsWith('/group'));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium liquid-transition-fast ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              {icon(active)}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* 하단 여백용 */}
      <div className="flex-1" />
      <p className="px-2 text-[10px] text-muted-foreground/40">© 2026 일용할묵상</p>
    </aside>
  );
}
