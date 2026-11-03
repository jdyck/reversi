import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Reversi — A little strategy goes a long way',
  description: 'Learn and play Reversi, one move at a time.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Reversi', statusBarStyle: 'default' },
};
export const viewport: Viewport = { themeColor: '#f6f5ef', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
