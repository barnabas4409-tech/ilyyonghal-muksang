import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/layout/BottomNav';
import SideNav from '@/components/layout/SideNav';
import AuthProvider from '@/components/layout/AuthProvider';
import { ThemeProvider } from '@/components/layout/ThemeProvider';

export const metadata: Metadata = {
  title: '일용할묵상',
  description: '매일 말씀을 읽고, 묵상을 기록하며 영적 루틴을 만들어가세요.',
  keywords: '성경, 묵상, 일용할묵상, 성경읽기, 영적루틴',
  openGraph: {
    title: '일용할묵상',
    description: '매일 말씀을 읽고, 묵상을 기록하며 영적 루틴을 만들어가세요.',
    type: 'website',
    locale: 'ko_KR',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F7F4' },
    { media: '(prefers-color-scheme: dark)',  color: '#100D0A' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-dvh flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex min-h-dvh w-full">
              {/* 데스크탑 사이드바 */}
              <SideNav />

              {/* 콘텐츠 영역 */}
              <div className="flex flex-col flex-1 min-w-0">
                <main className="flex-1 pb-20 lg:pb-0">
                  {/* 모바일: 꽉 채움 / 데스크탑: 중앙 최대 너비 */}
                  <div className="w-full max-w-[430px] mx-auto lg:max-w-2xl">
                    {children}
                  </div>
                </main>
                <BottomNav />
              </div>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
