export const metadata = {
  title: "Comme Avant — Confitures & gourmandises",
  description: "Des goûts et des saveurs d'antan. Par amour du goût du vrai.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" style={{ WebkitTextSizeAdjust: "100%" }}>
      <body style={{ margin: 0, minHeight: "100%", background: "#EFE7D5" }}>{children}</body>
    </html>
  );
}
