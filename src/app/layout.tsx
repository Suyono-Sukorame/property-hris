import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Manrope:wght@500;600;700;800&family=Public+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f8fafc] text-[#0f172a] antialiased selection:bg-[#0f766e] selection:text-white">
        {children}
      </body>
    </html>
  );
}
