export const metadata = {
  title: "Comme Avant — Confitures & gourmandises",
  description: "Des goûts et des saveurs d'antan. Par amour du goût du vrai.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Comme Avant", statusBarStyle: "default" },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#EFE7D5",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" style={{ WebkitTextSizeAdjust: "100%" }}>
      <body style={{ margin: 0, minHeight: "100%", background: "#EFE7D5" }}>{children}</body>
    </html>
  );
}
