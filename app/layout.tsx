import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/layout/BottomNav';
import AuthProvider from '@/components/layout/AuthProvider';

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
  themeColor: '#F7F4EF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-dvh flex flex-col bg-[#F7F4EF] dark:bg-[#16140F] text-[#2C2416] dark:text-[#E8DCC8]">
        <AuthProvider>
          <main className="flex-1 pb-20">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
