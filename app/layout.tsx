import type { Metadata, Viewport } from 'next';
import './globals.css';
import { siteUrl } from '../lib/site';

export const metadata: Metadata = {
  title: 'Play Reversi Online | Learn and Play',
  description: 'Play Reversi against the computer, with a friend on the same device, or online. Learn the rules with an interactive guide.',
  ...(siteUrl ? { metadataBase: new URL(siteUrl), alternates: { canonical: '/' } } : {}),
  openGraph: {
    type: 'website',
    title: 'Play Reversi Online | Learn and Play',
    description: 'Play Reversi against the computer or a friend, and learn the rules with an interactive guide.',
    ...(siteUrl ? { url: '/', images: [{ url: '/icon-512.png', width: 512, height: 512, alt: 'Reversi game board' }] } : {}),
  },
  twitter: { card: 'summary', title: 'Play Reversi Online | Learn and Play', description: 'Play Reversi against the computer or a friend, and learn the rules with an interactive guide.' },
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg', apple: '/apple-touch-icon.png?v=2' },
  appleWebApp: { capable: true, title: 'Reversi', statusBarStyle: 'default' },
};
export const viewport: Viewport = { themeColor: '#00121d', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
