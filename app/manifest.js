export default function manifest() {
  return {
    name: "Comme Avant — Confitures & gourmandises",
    short_name: "Comme Avant",
    description: "Commandez nos confitures, gourmandises et produits locaux.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#EFE7D5",
    theme_color: "#EFE7D5",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
