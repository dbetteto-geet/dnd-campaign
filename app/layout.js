import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dungeons & Cinghiali",
  description: "App per la campagna DnD dei Cinghiali",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dungeons & Cinghiali",
  },
};

export const viewport = {
  themeColor: "#1D9E75",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Dungeons & Cinghiali" />
<script dangerouslySetInnerHTML={{ __html: `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
    })
  }
`}} />
<link rel="icon" type="image/png" href="/icon-192.png" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@uiw/react-md-editor/markdown-editor.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@uiw/react-markdown-preview/markdown-preview.css" />     
</head>
      <body>{children}</body>
    </html>
  );
}