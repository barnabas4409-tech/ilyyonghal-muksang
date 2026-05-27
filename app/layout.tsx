import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/layout/BottomNav';
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
    { media: '(prefers-color-scheme: light)', color: '#F7F4EF' },
    { media: '(prefers-color-scheme: dark)',  color: '#16140F' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-dvh flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <main className="flex-1 pb-20">
              {children}
            </main>
            <BottomNav />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
