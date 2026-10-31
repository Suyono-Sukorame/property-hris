import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://property-hris.vercel.app'),
  title: 'HRIS - Griya Bumi Raya',
  description: 'Sistem Manajemen SDM & Presensi Lapangan untuk Bumi Raya Propertindo.',
  icons: {
    icon: '/property-hris.png',
    apple: '/property-hris.png',
  },
  openGraph: {
    title: 'HRIS - Griya Bumi Raya | Bumi Raya Propertindo',
    description: 'Sistem Manajemen SDM & Presensi Lapangan Terintegrasi',
    images: ['/property-hris.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/property-hris.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#f8fafc] text-[#0f172a] antialiased selection:bg-[#0f766e] selection:text-white font-sans overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
