import type { Metadata } from 'next';
import { Public_Sans, Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Property HRIS - Sistem Manajemen SDM & Operasional Properti',
  description: 'Sistem Manajemen Sumber Daya Manusia dan Absensi Lapangan Terintegrasi untuk Pengembang Properti dan Konstruksi.',
  openGraph: {
    title: 'Property HRIS - Enterprise Workforce Management',
    description: 'Sistem Manajemen SDM & Absensi Lapangan Terintegrasi untuk Pengembang Properti',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${publicSans.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#f8fafc] text-[#0f172a] antialiased selection:bg-[#0f766e] selection:text-white">
        {children}
      </body>
    </html>
  );
}
