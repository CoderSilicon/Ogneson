import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./fonts.css";
import icon from "./favicon.ico";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "Ogneson",
  icons: {
    icon: icon.src,
  },
  description: "Space' Chemical Elements",
  keywords: ["chemistry", "elements", "periodic table", "science"],
  authors: [{ name: "CoderSilicon" }],
  openGraph: {
    title: "Ogneson",
    description: "Space' Chemical Elements",
    type: "website",
  },
  verification: {
    google: "NOAPF0IigEsK49O_rSZv9G2yvCRcHe9wPi9fL_j4ing",
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Ogneson",
    url: "https://ogneson.vercel.app/",
  };
  return (
    
    <html lang="en">
      <body className="antialiased bg-black">{children}</body>
    </html>
  );
}
