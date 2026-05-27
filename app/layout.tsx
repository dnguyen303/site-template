import './globals.css';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: {
    default: 'VetHaul | Junk Removal Denver',
    template: '%s | VetHaul',
  },
  description:
    'Denver veteran-owned junk removal. Same-day and next-day pickup for furniture, appliances, garage cleanouts, and more. Upfront pricing, book online in 60 seconds.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[linear-gradient(180deg,#f8fafc,#f3f4f6_40%,#fff)] text-slate-900 antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
