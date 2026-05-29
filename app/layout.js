export const metadata = {
  title: "Comme Avant — Confitures & gourmandises",
  description: "Des goûts et des saveurs d'antan. Par amour du goût du vrai.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, background: "#EFE7D5" }}>{children}</body>
    </html>
  );
}
