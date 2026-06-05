export const dynamic = "force-static";

export async function GET() {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:;Comme Avant;;;",
    "FN:Comme Avant",
    "ORG:Comme Avant — Confitures & Gourmandises",
    "TEL;TYPE=CELL:+33613545224",
    "EMAIL;TYPE=INTERNET:confituresetgourmandise@gmail.com",
    "URL:https://confiture-et-gourmandise.vercel.app",
    "NOTE:Des goûts et des saveurs d'antan, par amour du goût du vrai.",
    "END:VCARD",
  ].join("\r\n");

  return new Response(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="comme-avant.vcf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
