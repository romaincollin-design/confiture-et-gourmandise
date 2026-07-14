"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  ShoppingBag, Plus, Minus, Check, MapPin, Truck, Mail, Tag, Package,
  Users, Settings, ChevronRight, ChevronLeft, ChevronDown, QrCode, Send, CreditCard,
  Smartphone, Power, Store, Sparkles, Trash2, X, MessageCircle, Copy, Lock, Globe,
  Calendar, BarChart3, TrendingUp, Percent, Wallet, Phone, Download, Database
} from "lucide-react";
import { supabase } from "../lib/supabase";

const FONT = `
@import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Raleway:wght@300;400;500;600;700&display=swap');
* { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
input, textarea, select { font-family: 'Raleway', sans-serif; }
input::placeholder, textarea::placeholder { color: #A89E89; }
input:focus, textarea:focus, select:focus { outline: 2px solid #7A2B3333; outline-offset: 0; }
.ca-scroll::-webkit-scrollbar { width: 8px; }
.ca-scroll::-webkit-scrollbar-thumb { background: #00000018; border-radius: 8px; }
@keyframes caIn { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: none;} }
.ca-anim { animation: caIn .35s cubic-bezier(.2,.7,.3,1) both; }
.ca-tap { transition: transform .12s ease, background .15s ease, border-color .15s ease, opacity .15s; }
.ca-tap:active { transform: scale(.97); }
.pro-shell { display: flex; min-height: 706px; }
.pro-nav { width: 212px; background: #FBF6EA; border-right: 1px solid #241F1718; padding: 12px; flex-shrink: 0; }
.pro-content { flex: 1; padding: 24px 26px; max-height: 706px; overflow-y: auto; background: #EFE7D5; }
.caisse-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
@media (min-width: 600px) { .caisse-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 720px) {
  .pro-shell { flex-direction: column; min-height: 0; }
  .pro-nav { width: 100%; display: flex; gap: 6px; overflow-x: auto; border-right: none; border-bottom: 1px solid #241F1718; padding: 8px; -webkit-overflow-scrolling: touch; }
  .pro-nav button { width: auto !important; white-space: nowrap; margin-bottom: 0 !important; flex-shrink: 0; }
  .pro-content { max-height: none; padding: 16px 14px 90px; }
}
`;

const C = {
  cream: "#EFE7D5", paper: "#FBF6EA", board: "#16140F", chalk: "#F3ECD6",
  ink: "#241F17", soft: "#8C8068", line: "#241F1718",
  jam: "#7A2B33", caramel: "#B5722B", ok: "#3F7A4B",
};
const SCRIPT = "'Pacifico', cursive";
const SANS = "'Raleway', system-ui, sans-serif";
const eur = (n) => (Number.isInteger(n) ? n + " €" : n.toFixed(2).replace(".", ",") + " €");
const csvCell = (v) => { const s = String(v ?? ""); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const downloadCSV = (filename, header, rows) => {
  try {
    const lines = [header, ...rows].map((r) => r.map(csvCell).join(";"));
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    document.body.removeChild(a); setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch (e) {}
};
const copyText = (t) => { try { navigator.clipboard && navigator.clipboard.writeText(t); } catch (e) {} };

const BRAND = { name: "Comme Avant", tag: "Confitures & gourmandises", tel: "06 13 54 52 24", wa: "33613545224", email: "confituresetgourmandise@gmail.com" };
const VCARD = `BEGIN:VCARD
VERSION:3.0
FN:Comme Avant — Confitures & gourmandises
ORG:Comme Avant (association)
TEL;TYPE=CELL:06 13 54 52 24
EMAIL:confituresetgourmandise@gmail.com
NOTE:Des goûts et des saveurs d'antan. Circuit court, fait main.
END:VCARD`;
const VCARD_HREF = "data:text/vcard;charset=utf-8," + encodeURIComponent(VCARD);

const CAT_ORDER = ["Confitures", "Gelées", "Gourmandises", "Salé", "Miel", "Crème de marron", "Produits locaux", "Bientôt"];
const CAT_SUB = {
  Confitures: "fruits frais · locaux · sans traitement",
  "Gelées": "fruits frais · locaux · sans traitement",
  Gourmandises: "fait avec amour",
  "Salé": "fait maison",
  Miel: "récolte locale",
  "Crème de marron": "fait maison",
  "Produits locaux": "du coin, faits près d'ici",
  "Bientôt": "très bientôt en pot",
};

const SEED_PRODUCTS = [
  { id: "orange-amere", name: "Oranges amères", cat: "Confitures", price: 7, unit: "pot 250g", stock: 12, illu: "orange", col: "#C25E1E" },
  { id: "orange-amere-340", name: "Oranges amères", cat: "Confitures", price: 9, unit: "pot 340g", stock: 12, illu: "orange", col: "#C25E1E" },
  { id: "orange-douce", name: "Oranges douces", cat: "Confitures", price: 7, unit: "pot 250g", stock: 10, illu: "orange", col: "#E07A1F" },
  { id: "orange-douce-340", name: "Oranges douces", cat: "Confitures", price: 9, unit: "pot 340g", stock: 10, illu: "orange", col: "#E07A1F" },
  { id: "quetsche", name: "Quetsche", cat: "Confitures", price: 7, unit: "pot 250g", stock: 9, illu: "plum", col: "#5B2A4A" },
  { id: "quetsche-340", name: "Quetsche", cat: "Confitures", price: 9, unit: "pot 340g", stock: 9, illu: "plum", col: "#5B2A4A" },
  { id: "reine-claude", name: "Reine Claude", cat: "Confitures", price: 7, unit: "pot 250g", stock: 8, illu: "plum", col: "#7E8B3A" },
  { id: "reine-claude-340", name: "Reine Claude", cat: "Confitures", price: 9, unit: "pot 340g", stock: 8, illu: "plum", col: "#7E8B3A" },
  { id: "mure", name: "Mûre", cat: "Confitures", price: 7, unit: "pot 250g", stock: 7, illu: "mure", col: "#5B2150" },
  { id: "mure-340", name: "Mûre", cat: "Confitures", price: 9, unit: "pot 340g", stock: 7, illu: "mure", col: "#5B2150" },
  { id: "pomme", name: "Pomme", cat: "Confitures", price: 7, unit: "pot 250g", stock: 14, illu: "apple", col: "#B23A2E" },
  { id: "pomme-340", name: "Pomme", cat: "Confitures", price: 9, unit: "pot 340g", stock: 14, illu: "apple", col: "#B23A2E" },
  { id: "citron", name: "Citron", cat: "Confitures", price: 7, unit: "pot 250g", stock: 11, illu: "lemon", col: "#E3B100" },
  { id: "citron-340", name: "Citron", cat: "Confitures", price: 9, unit: "pot 340g", stock: 11, illu: "lemon", col: "#E3B100" },
  { id: "citron-bergamotte", name: "Citron Bergamotte", cat: "Confitures", price: 7, unit: "pot 250g", stock: 6, illu: "lemon", col: "#C9D14A" },
  { id: "citron-bergamotte-340", name: "Citron Bergamotte", cat: "Confitures", price: 9, unit: "pot 340g", stock: 6, illu: "lemon", col: "#C9D14A" },
  { id: "citron-gingembre", name: "Citron Gingembre", cat: "Confitures", price: 7, unit: "pot 250g", stock: 6, illu: "lemon", col: "#D8A93A" },
  { id: "citron-gingembre-340", name: "Citron Gingembre", cat: "Confitures", price: 9, unit: "pot 340g", stock: 6, illu: "lemon", col: "#D8A93A" },
  { id: "gelee-citron", name: "Gelée de Citron", cat: "Gelées", price: 7, unit: "pot 250g", stock: 8, illu: "lemon", col: "#E3B100" },
  { id: "gelee-citron-340", name: "Gelée de Citron", cat: "Gelées", price: 9, unit: "pot 340g", stock: 8, illu: "lemon", col: "#E3B100" },
  { id: "gelee-orange", name: "Gelée d'Orange amère", cat: "Gelées", price: 7, unit: "pot 250g", stock: 7, illu: "orange", col: "#C25E1E" },
  { id: "gelee-orange-340", name: "Gelée d'Orange amère", cat: "Gelées", price: 9, unit: "pot 340g", stock: 7, illu: "orange", col: "#C25E1E" },
  { id: "gelee-pomme", name: "Gelée de Pomme", cat: "Gelées", price: 7, unit: "pot 250g", stock: 9, illu: "apple", col: "#B23A2E" },
  { id: "gelee-pomme-340", name: "Gelée de Pomme", cat: "Gelées", price: 9, unit: "pot 340g", stock: 9, illu: "apple", col: "#B23A2E" },
  { id: "gelee-coing", name: "Gelée de Coing", cat: "Gelées", price: 7, unit: "pot 250g", stock: 5, illu: "quince", col: "#D8A93A" },
  { id: "gelee-coing-340", name: "Gelée de Coing", cat: "Gelées", price: 9, unit: "pot 340g", stock: 5, illu: "quince", col: "#D8A93A" },
  { id: "caramels", name: "Caramels au beurre salé", cat: "Gourmandises", price: 4, unit: "sachet 100g", stock: 20, illu: "caramel", col: "#9A5E1F" },
  { id: "cake-13", name: "Cake aux fruits confits", cat: "Gourmandises", price: 13, unit: "part ≈ 340 g · 38 €/kg", stock: 6, illu: "cake", col: "#A9712E" },
  { id: "cake-14", name: "Cake aux fruits confits", cat: "Gourmandises", price: 14, unit: "part ≈ 370 g · 38 €/kg", stock: 6, illu: "cake", col: "#A9712E" },
  { id: "pain-13", name: "Pain d'épices", cat: "Gourmandises", price: 13, unit: "part ≈ 370 g · 35 €/kg", stock: 6, illu: "loaf", col: "#8A5A24" },
  { id: "pain-14", name: "Pain d'épices", cat: "Gourmandises", price: 14, unit: "part 400 g · 35 €/kg", stock: 6, illu: "loaf", col: "#8A5A24" },
  { id: "pissa-part", name: "Pissaladière", cat: "Salé", price: 3, unit: "à la part", stock: 24, illu: "pissa", col: "#7A6A2A" },
  { id: "pissa-1", name: "Pissaladière", cat: "Salé", price: 33, unit: "1 plaque (12 parts)", stock: 4, illu: "pissa", col: "#7A6A2A" },
  { id: "pissa-2", name: "Pissaladière", cat: "Salé", price: 60, unit: "2 plaques · 30 €/plaque", stock: 2, illu: "pissa", col: "#7A6A2A" },
  { id: "miel", name: "Miel", cat: "Miel", price: 12, unit: "pot 500g", stock: 10, illu: "miel", col: "#D9A441" },
  { id: "creme-marron", name: "Crème de marron", cat: "Crème de marron", price: 10, unit: "pot 500g", stock: 10, illu: "marron", col: "#7A4A26" },
  { id: "fraise", name: "Fraise", cat: "Bientôt", price: 7, unit: "pot 250g", stock: 0, soon: true, illu: "berry", col: "#C0392B" },
  { id: "abricot", name: "Abricot", cat: "Bientôt", price: 7, unit: "pot 250g", stock: 0, soon: true, illu: "apricot", col: "#E08A2E" },
  { id: "nefle", name: "Nèfle", cat: "Bientôt", price: 7, unit: "pot 250g", stock: 0, soon: true, illu: "apricot", col: "#C98A3A" },
];
const SEED_ORDERS = [];
const SEED_SALES = [];
const SEED_CLIENTS = [];

/* ---------- Illustrations façon étiquette ---------- */
function Illu({ k, col, s = 46 }) {
  const hl = "rgba(255,255,255,.30)";
  const leaf = <path d="M23 8 Q21 3 16 4 Q18 9 23 10 Z" fill="#6f8f3a" />;
  const wrap = (kids) => <svg width={s} height={s} viewBox="0 0 46 46" style={{ display: "block" }}>{kids}</svg>;
  if (k === "lemon") return wrap(<>{leaf}<ellipse cx="23" cy="27" rx="14" ry="10" fill={col} /><ellipse cx="18" cy="23" rx="3.4" ry="2.2" fill={hl} /></>);
  if (k === "mure") return wrap(<>{leaf}<g>{[[18, 18], [24, 16], [30, 18], [15, 24], [21, 23], [27, 23], [33, 24], [19, 30], [25, 31], [31, 30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.6" fill={i % 2 ? "#7B1FA2" : col} />)}</g></>);
  if (k === "caramel") return wrap(<><path d="M9 20 L14 25 L9 30 Z" fill={col} opacity=".7" /><path d="M37 20 L32 25 L37 30 Z" fill={col} opacity=".7" /><rect x="13" y="16" width="20" height="18" rx="5" fill={col} /><rect x="17" y="20" width="6" height="4" rx="2" fill={hl} /></>);
  if (k === "cake") return wrap(<><path d="M10 30 L23 13 L36 30 Z" fill={col} /><circle cx="21" cy="25" r="2" fill="#5b2150" /><circle cx="27" cy="26" r="2" fill="#C0392B" /><circle cx="24" cy="20" r="1.8" fill="#E3B100" /></>);
  if (k === "loaf") return wrap(<><path d="M9 33 V23 q0 -7 14 -7 q14 0 14 7 v10 q0 1.6 -1.6 1.6 H10.6 Q9 34.6 9 33 z" fill={col} /><path d="M9 31 h28 v2 q0 1.6 -1.6 1.6 H10.6 Q9 34.6 9 31 z" fill="#5E3717" /><path d="M12 21 q11 -4 22 0" stroke={hl} strokeWidth="2.2" fill="none" strokeLinecap="round" /><g stroke="#F3ECD6" strokeWidth="1.3" strokeLinecap="round" opacity=".92" fill="none"><path d="M14 22 q1.6 4 -0.5 8" /><path d="M21 20.5 q1.6 5 -0.5 10" /><path d="M28 21 q1.6 4 -0.5 9" /></g><g fill="#3a2410"><circle cx="17" cy="29" r=".7" /><circle cx="25" cy="30" r=".7" /><circle cx="31" cy="28" r=".7" /></g></>);
  if (k === "pissa") return wrap(<><rect x="6" y="15" width="34" height="16" rx="3.5" fill="#E0AE55" /><rect x="8.5" y="17.2" width="29" height="11.6" rx="2.5" fill="#E9CE94" /><g stroke="#CDA663" strokeWidth=".8" strokeLinecap="round" opacity=".8" fill="none"><path d="M10 20 q6 -1.5 13 0 t14 0" /><path d="M10 26 q7 1.5 13 0 t13 0" /></g><g stroke="#9C6B45" strokeWidth="1.7" strokeLinecap="round"><line x1="12" y1="17.5" x2="19" y2="28.5" /><line x1="19" y1="17.5" x2="26" y2="28.5" /><line x1="26" y1="17.5" x2="33" y2="28.5" /><line x1="19" y1="17.5" x2="12" y2="28.5" /><line x1="26" y1="17.5" x2="19" y2="28.5" /><line x1="33" y1="17.5" x2="26" y2="28.5" /></g><g fill="#2B2620"><circle cx="15.5" cy="23" r="1.7" /><circle cx="23" cy="20" r="1.7" /><circle cx="23" cy="26" r="1.7" /><circle cx="30.5" cy="23" r="1.7" /></g></>);
  if (k === "potpissa") return wrap(<>
    <rect x="13" y="6" width="20" height="5" rx="2" fill="#123a52" />
    <rect x="13" y="6" width="20" height="2.2" rx="1.1" fill="#1c516f" />
    <path d="M12 11 h22 v24 q0 5 -5 5 h-12 q-5 0 -5 -5 z" fill="#b9772e" />
    <path d="M15 12 h3 v26 h-1.4 q-1.6 0 -1.6 -2 z" fill="rgba(255,255,255,.22)" />
    <rect x="12" y="17" width="22" height="16" rx="1.5" fill="#f6efdd" />
    <rect x="12" y="17" width="22" height="16" rx="1.5" fill="none" stroke="#123a52" strokeWidth="1.1" />
    <circle cx="16.4" cy="20.4" r="1.5" fill="#f4b32c" />
    <circle cx="29.6" cy="20.4" r="1.5" fill="#f4b32c" />
    <rect x="14.6" y="23.2" width="16.8" height="2.5" rx="1" fill="#123a52" />
    <rect x="16.4" y="26.6" width="13.2" height="1.5" rx=".75" fill="#c65a35" />
    <g fill="#123a52" opacity=".75"><rect x="17.4" y="29.4" width="11.2" height="1" rx=".5" /></g>
  </>);
  if (k === "miel") return wrap(<><g transform="rotate(20 38 14)"><rect x="36.4" y="5" width="2.4" height="20" rx="1.2" fill="#B07E3A" /><ellipse cx="37.6" cy="21.5" rx="3.5" ry="4.2" fill="#C9912F" /><path d="M34.6 18.8 h6 M34.4 21.5 h6.2 M34.8 24.2 h5.4" stroke="#8a5e22" strokeWidth="0.9" strokeLinecap="round" /></g><rect x="12" y="17" width="22" height="23" rx="6" fill="#F7F1E2" stroke="#E2D6BC" strokeWidth="1" /><path d="M13 23 h20 v11 q0 5 -5 5 h-10 q-5 0 -5 -5 z" fill={col} /><rect x="15" y="24" width="3" height="12" rx="1.5" fill={hl} /><rect x="11" y="13" width="24" height="6" rx="2.5" fill="#A9742E" /><rect x="11" y="13" width="24" height="2.4" rx="1.2" fill="#C08A3C" /><path d="M23 27 l3 1.7 v3.4 l-3 1.7 l-3 -1.7 v-3.4 z" fill="none" stroke="#9A6A1E" strokeWidth="1.4" /><g transform="translate(9 12)"><ellipse cx="-2" cy="-3.6" rx="3.3" ry="2" fill="#e6f3f6" stroke="#c4dde2" strokeWidth=".6" transform="rotate(-25 -2 -3.6)" /><ellipse cx="3" cy="-3.6" rx="3.3" ry="2" fill="#e6f3f6" stroke="#c4dde2" strokeWidth=".6" transform="rotate(25 3 -3.6)" /><ellipse cx="0.5" cy="0.6" rx="4.4" ry="3.3" fill="#F2C53D" stroke="#d9a82f" strokeWidth=".5" /><path d="M-1 -2.1 v5.5 M1.7 -2.4 v6" stroke="#3a2a12" strokeWidth="1.4" /><circle cx="-3.7" cy="-0.5" r="2" fill="#2a1f10" /><path d="M-4.8 -2.1 q-1 -1.6 -2.3 -1.7 M-3.6 -2.3 q-0.6 -1.8 -1.5 -2.4" stroke="#2a1f10" strokeWidth=".7" fill="none" strokeLinecap="round" /></g></>);
  if (k === "marron") return wrap(<><rect x="11" y="15" width="24" height="5" rx="2.5" fill="#5A3A22" /><rect x="11" y="15" width="24" height="2" rx="1" fill="#6E4A2E" /><path d="M13 20 h20 v12 q0 4 -4 4 h-12 q-4 0 -4 -4 z" fill={col} /><rect x="16" y="22" width="3" height="11" rx="1.5" fill={hl} /><g transform="translate(15 34)"><path d="M-1 -8 q2 -2 0 -4" stroke="#4a2a12" strokeWidth="1.2" strokeLinecap="round" fill="none" /><path d="M-6 -2 q0 -7 6 -7 q6 0 6 7 q0 5 -6 6 q-6 -1 -6 -6 z" fill="#6B3F1E" /><path d="M-6 -2 q0 -7 6 -7" stroke="#9a6a3e" strokeWidth="1" fill="none" opacity=".55" /><ellipse cx="0" cy="4.4" rx="3.6" ry="1.5" fill="#E7C98F" /></g><g transform="translate(27 36) scale(.82)"><path d="M-1 -8 q2 -2 0 -4" stroke="#4a2a12" strokeWidth="1.4" strokeLinecap="round" fill="none" /><path d="M-6 -2 q0 -7 6 -7 q6 0 6 7 q0 5 -6 6 q-6 -1 -6 -6 z" fill="#7A4A26" /><path d="M-6 -2 q0 -7 6 -7" stroke="#a87a4a" strokeWidth="1" fill="none" opacity=".55" /><ellipse cx="0" cy="4.4" rx="3.6" ry="1.5" fill="#E7C98F" /></g></>);
  if (k === "berry") return wrap(<><path d="M23 9 Q19 6 16 8 M23 9 Q27 6 30 8" stroke="#6f8f3a" strokeWidth="2" fill="none" strokeLinecap="round" /><path d="M14 18 Q23 12 32 18 Q30 34 23 38 Q16 34 14 18 Z" fill={col} /><g fill="#ffe9a8">{[[19, 21], [26, 21], [22, 25], [18, 28], [27, 28], [23, 31]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1" />)}</g></>);
  // round fruits: orange, plum, apple, quince, apricot
  return wrap(<>{leaf}<circle cx="23" cy="26" r="13" fill={col} /><ellipse cx="18" cy="21" rx="3.4" ry="2.4" fill={hl} /></>);
}

export default function App() {
  const [view, setView] = useState("client");
  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [orders, setOrders] = useState(SEED_ORDERS);
  const [clients, setClients] = useState(SEED_CLIENTS);
  const [promos, setPromos] = useState([{ code: "SAVEURS10", pct: 10, active: true }]);
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [profile, setProfile] = useState({ name: "Comme Avant", tag: "Confitures, gourmandises & produits locaux", tagline: "Des goûts et des saveurs d'antan, par amour du goût du vrai.", tel: "06 13 54 52 24", email: "confituresetgourmandise@gmail.com", wa: "33613545224", pin: "1234" });
  const [proAuth, setProAuth] = useState(false);

  const [step, setStep] = useState("welcome");
  const [intent, setIntent] = useState("order");
  const [cust, setCust] = useState({ prenom: "", nom: "", tel: "", email: "" });
  const [cart, setCart] = useState({});
  const [mode, setMode] = useState("retrait");
  const [promoInput, setPromoInput] = useState("");
  const [applied, setApplied] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);

  const cartLines = useMemo(
    () => Object.entries(cart).map(([id, q]) => ({ ...products.find((p) => p.id === id), qty: q })).filter((l) => l.qty > 0),
    [cart, products]
  );
  const sub = cartLines.reduce((s, l) => s + l.price * l.qty, 0);
  const discount = applied ? sub * (applied.pct / 100) : 0;
  const total = sub - discount;
  const count = cartLines.reduce((s, l) => s + l.qty, 0);

  const add = (id) => { const p = products.find((x) => x.id === id); setCart((c) => ({ ...c, [id]: Math.min((c[id] || 0) + 1, p.stock) })); };
  const sub1 = (id) => setCart((c) => ({ ...c, [id]: Math.max((c[id] || 0) - 1, 0) }));

  const upsertClient = (c) => setClients((list) => list.find((x) => x.email === c.email) ? list : [{ email: c.email, prenom: c.prenom, nom: c.nom, tel: c.tel, orders: 0, spent: 0 }, ...list]);

  const placeOrder = () => {
    const id = "C-" + (1043 + orders.length);
    const o = { id, name: `${cust.prenom} ${cust.nom}`.trim(), email: cust.email, items: count, total, mode, date: "Auj.", status: "À préparer", paid: false };
    setOrders((l) => [o, ...l]);
    setClients((list) => list.map((x) => x.email === cust.email ? { ...x, orders: x.orders + 1, spent: +(x.spent + total).toFixed(2) } : x));
    setLastOrder({ ...o, lines: cartLines });
    setStep("done");
  };
  const resetClient = () => { setStep("welcome"); setIntent("order"); setCart({}); setApplied(null); setPromoInput(""); setCust({ prenom: "", nom: "", tel: "", email: "" }); setMode("retrait"); };

  return (
    <div style={{ fontFamily: SANS, background: C.cream, color: C.ink, minHeight: 770, borderRadius: 16, overflow: "hidden", position: "relative" }}>
      <style>{FONT}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: `1px solid ${C.line}`, background: C.paper }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: C.board, display: "grid", placeItems: "center" }}><Store size={16} color={C.chalk} /></div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: SCRIPT, fontSize: 18, lineHeight: 1, color: C.jam }}>{profile.name}</div>
            <div style={{ fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: C.soft, maxWidth: 230, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.tag}</div>
          </div>
        </div>
        <div style={{ display: "flex", background: C.cream, borderRadius: 11, padding: 3, border: `1px solid ${C.line}` }}>
          {[["client", "Client", Smartphone], ["pro", "Pro", Settings]].map(([k, lbl, Ic]) => (
            <button key={k} onClick={() => setView(k)} className="ca-tap" style={{ display: "flex", alignItems: "center", gap: 6, border: "none", cursor: "pointer", padding: "7px 13px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, letterSpacing: ".03em", background: view === k ? C.board : "transparent", color: view === k ? C.chalk : C.soft }}>
              <Ic size={14} /> {lbl}
            </button>
          ))}
        </div>
      </div>

      {view === "client"
        ? <ClientView {...{ step, setStep, intent, setIntent, cust, setCust, products, cartLines, cart, add, sub1, sub, discount, total, count, mode, setMode, promoInput, setPromoInput, applied, setApplied, promos, paymentEnabled, placeOrder, upsertClient, lastOrder, resetClient, profile }} />
        : proAuth
          ? <ProView {...{ orders, setOrders, products, setProducts, clients, promos, setPromos, paymentEnabled, setPaymentEnabled, profile, setProfile, onLogout: () => setProAuth(false) }} />
          : <ProLogin pin={profile.pin} onOk={() => setProAuth(true)} />}
    </div>
  );
}

/* ---------------- CLIENT ---------------- */
function ClientView(props) {
  const { step } = props;
  return (
    <div style={{ display: "grid", placeItems: "start center", padding: "20px 14px 120px", minHeight: "100%", background: `radial-gradient(120% 70% at 80% -10%, ${C.jam}10, transparent 55%), ${C.cream}` }}>
      <div style={{ width: "100%", maxWidth: 460, background: C.paper, borderRadius: 24, border: `1px solid ${C.line}`, boxShadow: "0 24px 60px -34px #16140f44", overflow: "hidden" }}>
        {step === "welcome" && <Welcome {...props} />}
        {step === "contact" && <Contact {...props} />}
        {step === "coords" && <Coords {...props} />}
        {step === "leadDone" && <LeadDone {...props} />}
        {step === "shop" && <Shop {...props} />}
        {step === "cart" && <Cart {...props} />}
        {step === "checkout" && <Checkout {...props} />}
        {step === "done" && <Done {...props} />}
        {step === "avis" && <Reviews {...props} />}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <svg width="100%" viewBox="0 0 292 104" style={{ display: "block", maxWidth: 290, margin: "8px auto 0" }}>
      {/* Confiture */}
      <g transform="translate(2 6)">
        <path d="M9 22 Q30 8 51 22 L51 27 Q30 19 9 27 Z" fill="#F3ECD6" stroke="#241F1722" strokeWidth="1" />
        <path d="M9 25 Q30 17 51 25" fill="none" stroke="#B5722B" strokeWidth="2" strokeLinecap="round" />
        <rect x="13" y="26" width="34" height="7" rx="3" fill="#DCCFAF" />
        <rect x="11" y="31" width="38" height="55" rx="10" fill="#FBF6EA" stroke="#241F171F" strokeWidth="1.2" />
        <path d="M13 52 H47 V77 Q47 84 40 84 H20 Q13 84 13 77 Z" fill="#7A2B33" />
        <rect x="15" y="35" width="5" height="42" rx="2.5" fill="#FFFFFF40" />
        <rect x="18" y="57" width="24" height="15" rx="3" fill="#FBF6EA" stroke="#7A2B33" strokeWidth="1" />
        <line x1="22" y1="62" x2="38" y2="62" stroke="#7A2B33" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="24" y1="66" x2="36" y2="66" stroke="#7A2B33" strokeOpacity=".5" strokeWidth="1" strokeLinecap="round" />
      </g>
      {/* Miel */}
      <g transform="translate(74 6)">
        <rect x="11" y="31" width="38" height="55" rx="10" fill="#FBF6EA" stroke="#241F171F" strokeWidth="1.2" />
        <path d="M13 44 H47 V77 Q47 84 40 84 H20 Q13 84 13 77 Z" fill="#D8A93A" />
        <rect x="15" y="35" width="5" height="44" rx="2.5" fill="#FFFFFF38" />
        <rect x="18" y="55" width="24" height="16" rx="3" fill="#FBF6EA" stroke="#C6913E" strokeWidth="1" />
        <path d="M30 58 l4 2.3 v4.4 l-4 2.3 l-4 -2.3 v-4.4 z" fill="none" stroke="#C6913E" strokeWidth="1.1" />
        <rect x="12" y="24" width="36" height="10" rx="3" fill="#B5722B" />
        <rect x="12" y="24" width="36" height="3" rx="1.5" fill="#9A5E1F" />
        <line x1="50" y1="18" x2="54" y2="38" stroke="#9A6A2E" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="49" y1="27" x2="55" y2="29" stroke="#9A6A2E" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="50" y1="23" x2="55" y2="25" stroke="#9A6A2E" strokeWidth="1.3" strokeLinecap="round" />
        <g transform="translate(15 15)"><ellipse cx="-4" cy="-5" rx="5" ry="3" fill="#e6f3f6" stroke="#c4dde2" strokeWidth="1" transform="rotate(-22 -4 -5)" /><ellipse cx="5" cy="-5" rx="5" ry="3" fill="#e6f3f6" stroke="#c4dde2" strokeWidth="1" transform="rotate(22 5 -5)" /><ellipse cx="0.5" cy="0.5" rx="6.5" ry="5" fill="#F2C53D" stroke="#d9a82f" strokeWidth="1" /><path d="M-1.5 -3.5 v8 M2.5 -4 v9" stroke="#3a2a12" strokeWidth="2" /><circle cx="-5.5" cy="-0.6" r="3" fill="#2a1f10" /><path d="M-7 -3 q-1.5 -2.5 -3.5 -2.6 M-5.4 -3.4 q-1 -2.8 -2.3 -3.6" stroke="#2a1f10" strokeWidth="1" fill="none" strokeLinecap="round" /></g>
      </g>
      {/* Pissaladière */}
      <g transform="translate(146 6)">
        <ellipse cx="30" cy="86" rx="24" ry="4" fill="#E7DCC4" />
        <rect x="6" y="42" width="48" height="38" rx="7" fill="#D9A441" stroke="#A9742E" strokeWidth="1" />
        <rect x="11" y="47" width="38" height="28" rx="5" fill="#E9CE94" />
        <g stroke="#CDA663" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity=".8"><path d="M14 54 q8 -2 16 0 t15 0" /><path d="M14 63 q9 2 17 0 t14 0" /><path d="M14 71 q8 -2 16 0 t13 0" /></g>
        <g stroke="#9C6B45" strokeWidth="2.4" strokeLinecap="round"><line x1="17" y1="48" x2="29" y2="74" /><line x1="29" y1="48" x2="41" y2="74" /><line x1="40" y1="48" x2="47" y2="64" /><line x1="29" y1="48" x2="17" y2="74" /><line x1="41" y1="48" x2="29" y2="74" /><line x1="47" y1="56" x2="40" y2="74" /></g>
        <g fill="#241F17"><circle cx="22" cy="61" r="2.6" /><circle cx="34" cy="54" r="2.6" /><circle cx="34" cy="68" r="2.6" /><circle cx="45" cy="61" r="2.6" /></g>
      </g>
      {/* Pain d'épices */}
      <g transform="translate(216 6)">
        <ellipse cx="30" cy="86" rx="27" ry="4" fill="#E7DCC4" />
        <path d="M9 80 V56 Q9 42 30 42 Q51 42 51 56 V80 Q51 84 47 84 H13 Q9 84 9 80 Z" fill="#8A5A24" stroke="#6E4519" strokeWidth="1" />
        <path d="M9 74 H51 V80 Q51 84 47 84 H13 Q9 84 9 80 Z" fill="#5E3717" />
        <path d="M14 50 q16 -6 32 0" stroke="#FFFFFF" strokeWidth="3" opacity=".22" fill="none" strokeLinecap="round" />
        <g stroke="#F3ECD6" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity=".92"><path d="M18 52 q2 8 -1 16" /><path d="M30 49 q2 9 -1 18" /><path d="M42 52 q2 8 -1 16" /></g>
        <g fill="#3a2410"><circle cx="22" cy="69" r="1.2" /><circle cx="32" cy="71" r="1.2" /><circle cx="42" cy="67" r="1.2" /></g>
      </g>
    </svg>
  );
}

function Welcome({ setStep, setIntent, profile, returning, cust, reviews }) {
  const steps = [["1", "Coordonnées"], ["2", "Saveurs"], ["3", "Commande"]];
  const avg = reviews && reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
  return (
    <div className="ca-anim">
      <div style={{ background: "#ECE1CC", borderBottom: `1px solid ${C.line}`, padding: "22px 24px 12px", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: C.caramel }}>✦ &nbsp; ✦ &nbsp; ✦</div>
        <div style={{ fontSize: 10.5, letterSpacing: ".24em", textTransform: "uppercase", color: C.soft, marginTop: 6 }}>Association artisanale</div>
        <h1 style={{ fontFamily: SCRIPT, fontSize: 38, lineHeight: 1.22, margin: "8px 0 0", color: C.jam }}>{profile.name}</h1>
        <div style={{ fontFamily: SCRIPT, fontSize: 15.5, lineHeight: 1.25, color: C.ink, marginTop: 2, padding: "0 6px" }}>{profile.tag}</div>
        <Hero />
      </div>
      <div style={{ padding: "18px 24px 28px", textAlign: "center" }}>
        <p style={{ fontFamily: SCRIPT, color: C.jam, fontSize: 22, lineHeight: 1.35, margin: "0 0 16px" }}>{profile.tagline}</p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginBottom: 18 }}>
          {["Circuit court", "Fait main", "Producteurs indépendants"].map((t) => (<span key={t} style={{ fontSize: 11, fontWeight: 600, color: C.jam, background: "#7A2B3312", padding: "5px 11px", borderRadius: 20 }}>{t}</span>))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 18 }}>
          {steps.map(([n, l], i) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 19, height: 19, borderRadius: "50%", background: C.jam, color: "#fff", fontSize: 11, fontWeight: 700, display: "grid", placeItems: "center", flexShrink: 0 }}>{n}</span>
              <span style={{ fontSize: 11, color: C.soft, fontWeight: 600 }}>{l}</span>
              {i < 2 && <ChevronRight size={13} color={C.soft} />}
            </div>
          ))}
        </div>
        {returning && cust?.prenom ? (
          <>
            <BigBtn onClick={() => { setIntent("order"); setStep("shop"); }}>Bon retour {cust.prenom} — Commander <ChevronRight size={16} /></BigBtn>
            <GhostBtn onClick={() => { setIntent("order"); setStep("coords"); }}>Modifier mes coordonnées</GhostBtn>
          </>
        ) : (
          <BigBtn onClick={() => { setIntent("order"); setStep("coords"); }}>Entrer dans la boutique <ChevronRight size={16} /></BigBtn>
        )}
        <WhatsAppBtn profile={profile} />
        <ShareBtn cust={cust} />
        <button onClick={() => setStep("avis")} className="ca-tap" style={{ width: "100%", marginTop: 10, background: "transparent", border: `1.5px solid ${C.line}`, color: C.ink, borderRadius: 13, padding: "12px 18px", fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Stars value={avg ? Math.round(avg) : 5} size={15} /> {reviews && reviews.length ? `${avg.toFixed(1)} · ${reviews.length} avis — donner le mien` : "Donner votre avis"}
        </button>
        <InstallBanner />
        <button onClick={() => setStep("contact")} className="ca-tap" style={{ width: "100%", marginTop: 12, background: "transparent", border: "none", color: C.soft, fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, textDecoration: "underline", textUnderlineOffset: 3 }}><Smartphone size={14} /> Enregistrer nos coordonnées</button>
      </div>
    </div>
  );
}

function Contact({ setStep, profile }) {
  const site = profile.site || "https://confiture-et-gourmandise.vercel.app";
  const siteShort = site.replace(/^https?:\/\//, "");
  const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.name}\nORG:${profile.name} — ${profile.tag}\nTEL;TYPE=CELL:${profile.tel}\nEMAIL:${profile.email}\nURL:${site}\nNOTE:${profile.tagline}\nEND:VCARD`;
  const saveContact = () => {
    try {
      const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "comme-avant.vcf";
      document.body.appendChild(a); a.click();
      setTimeout(() => { try { document.body.removeChild(a); URL.revokeObjectURL(url); } catch (e) {} }, 1500);
    } catch (e) {
      window.location.href = "data:text/vcard;charset=utf-8," + encodeURIComponent(vcard);
    }
  };
  return (
    <div className="ca-anim" style={{ padding: "6px 22px 28px" }}>
      <StepHead onBack={() => setStep("welcome")} title="Nos coordonnées" sub="Gardez le stand dans votre poche" />
      <div style={{ background: C.board, color: C.chalk, borderRadius: 16, padding: 22, textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: "#d8b46a" }}>✦ &nbsp; ✦ &nbsp; ✦</div>
        <div style={{ fontFamily: SCRIPT, fontSize: 30, marginTop: 6 }}>{profile.name}</div>
        <div style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", opacity: .75, marginBottom: 18, padding: "0 8px" }}>{profile.tag}</div>
        {[[Smartphone, profile.tel], [Mail, profile.email], [Globe, siteShort], [MapPin, "Sur le marché · livraison dans la semaine"]].map(([Ic, v], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", fontSize: 14.5, padding: "6px 0" }}>
            <Ic size={16} color="#d8b46a" /> {v}
          </div>
        ))}
      </div>
      <a href="/api/contact" className="ca-tap"
        style={{ width: "100%", background: C.jam, color: "#fff", borderRadius: 13, padding: "16px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", boxSizing: "border-box", textDecoration: "none" }}>
        <Smartphone size={17} /> Ajouter à mes contacts
      </a>
      <GhostBtn onClick={() => setStep("coords")}><ShoppingBag size={16} /> Plutôt passer une commande</GhostBtn>
    </div>
  );
}

function Coords({ cust, setCust, setStep, upsertClient, intent }) {
  const [optin, setOptin] = useState(false);
  const ok = cust.prenom.trim() && cust.nom.trim() && cust.tel.replace(/\D/g, "").length >= 6 && /\S+@\S+\.\S+/.test(cust.email);
  const lead = intent === "lead";
  const set = (k) => (v) => setCust({ ...cust, [k]: v });
  const valider = async (next) => { await upsertClient({ ...cust, optin }); setStep(next); };
  return (
    <div className="ca-anim" style={{ padding: "6px 22px 28px" }}>
      <StepHead onBack={() => setStep("welcome")} title="Vos coordonnées"
        sub={lead ? "Restez informé·e de nos nouveautés et offres" : "Pour préparer et confirmer votre commande"} />
      <form autoComplete="on" onSubmit={(e) => e.preventDefault()}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
          <Field label="Prénom" value={cust.prenom} onChange={set("prenom")} name="given-name" autoComplete="given-name" />
          <Field label="Nom" value={cust.nom} onChange={set("nom")} name="family-name" autoComplete="family-name" />
        </div>
        <Field label="Téléphone" value={cust.tel} onChange={set("tel")} type="tel" name="tel" autoComplete="tel" />
        <Field label="Email" value={cust.email} onChange={set("email")} type="email" name="email" autoComplete="email" />
      </form>
      <label className="ca-tap" style={{ display: "flex", alignItems: "flex-start", gap: 9, background: C.cream, border: `1px solid ${C.line}`, borderRadius: 11, padding: "11px 12px", cursor: "pointer", margin: "2px 0 12px" }}>
        <input type="checkbox" checked={optin} onChange={(e) => setOptin(e.target.checked)} style={{ accentColor: C.jam, marginTop: 2, width: 17, height: 17, flexShrink: 0 }} />
        <span style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.45 }}>Je souhaite rester en contact et vous autorise à me contacter (nouveautés, offres et confirmation de commande).</span>
      </label>
      <p style={{ fontSize: 11, color: C.soft, lineHeight: 1.5, margin: "0 0 16px" }}>Vos coordonnées servent uniquement à gérer votre commande et, si vous l'acceptez, à vous tenir informé·e — jamais transmises à des tiers. Vous pouvez demander leur suppression à tout moment.</p>
      {lead
        ? <BigBtn disabled={!ok} onClick={() => valider("leadDone")}>Valider mes coordonnées <Check size={16} /></BigBtn>
        : <BigBtn disabled={!ok} onClick={() => valider("shop")}>Voir nos saveurs <ChevronRight size={17} /></BigBtn>}
      {!ok && <p style={{ fontSize: 11.5, color: C.soft, textAlign: "center", marginTop: 10 }}>Prénom, nom, téléphone et email sont nécessaires pour commander.</p>}
    </div>
  );
}

function LeadDone({ setStep, resetClient, cust }) {
  return (
    <div className="ca-anim" style={{ padding: "32px 24px 34px", textAlign: "center" }}>
      <div style={{ width: 62, height: 62, borderRadius: 20, background: "#3F7A4B18", display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Check size={30} color={C.ok} /></div>
      <h2 style={{ fontFamily: SCRIPT, fontSize: 26, margin: "0 0 6px", color: C.jam }}>Merci{cust?.prenom ? `, ${cust.prenom}` : ""} !</h2>
      <p style={{ color: C.soft, fontSize: 14, margin: "0 0 22px", lineHeight: 1.55 }}>Vos coordonnées sont bien enregistrées. On vous préviendra de nos nouvelles fournées et de nos offres.</p>
      <BigBtn onClick={() => setStep("shop")}><ShoppingBag size={16} /> Voir nos saveurs</BigBtn>
      <GhostBtn onClick={() => setStep("contact")}><Smartphone size={16} /> Enregistrer nos coordonnées</GhostBtn>
      <button onClick={resetClient} className="ca-tap" style={{ ...backBtn(), margin: "16px auto 0" }}>Retour à l'accueil</button>
    </div>
  );
}

function Shop({ products, cart, add, sub1, count, total, setStep, reviews }) {
  const extra = [...new Set(products.filter((p) => p.active !== false && !CAT_ORDER.includes(p.cat)).map((p) => p.cat))];
  const cats = [...CAT_ORDER, ...extra].filter((c) => products.some((p) => p.active !== false && p.cat === c));
  const [open, setOpen] = useState({});
  const toggle = (c) => setOpen((o) => ({ ...o, [c]: !o[c] }));
  return (
    <div className="ca-anim" style={{ padding: "4px 0 92px" }}>
      <div style={{ padding: "0 22px" }}>
        <button onClick={() => setStep("coords")} className="ca-tap" style={backBtn()}><ChevronLeft size={16} /> Retour</button>
        <div style={{ textAlign: "center", margin: "4px 0 12px" }}>
          <div style={{ fontSize: 12, color: C.caramel }}>✦ &nbsp; ✦ &nbsp; ✦</div>
          <h2 style={{ fontFamily: SCRIPT, fontSize: 30, margin: "2px 0 0", color: C.jam }}>Nos Saveurs</h2>
          <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: C.soft }}>choisissez une catégorie</div>
        </div>
      </div>
      {cats.map((cat) => {
        const items = products.filter((p) => p.active !== false && p.cat === cat);
        const isOpen = !!open[cat];
        return (
          <div key={cat} style={{ borderTop: `1px solid ${C.line}` }}>
            <button onClick={() => toggle(cat)} className="ca-tap" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 22px", background: isOpen ? "#7A2B3308" : "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
              <div>
                <div style={{ fontFamily: SCRIPT, fontSize: 20, color: C.jam }}>{cat}</div>
                <div style={{ fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: C.soft, marginTop: 1 }}>{CAT_SUB[cat] || ""} · {items.length} produit{items.length > 1 ? "s" : ""}</div>
              </div>
              <ChevronDown size={20} color={C.soft} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
            </button>
            {isOpen && items.map((p) => {
              const q = cart[p.id] || 0; const out = p.stock === 0 && !p.soon;
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 22px", borderTop: `1px solid ${C.line}`, opacity: (out || p.soon) ? .6 : 1 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 11, background: C.cream, display: "grid", placeItems: "center", flexShrink: 0 }}><Illu k={p.illu} col={p.col} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14.5 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: C.soft }}>
                      <span style={{ fontFamily: SCRIPT, color: C.jam, fontSize: 14 }}>{eur(p.price)}</span> · {p.unit}
                      {!out && !p.soon && p.stock <= 5 && <span style={{ color: C.caramel, fontWeight: 600 }}> · plus que {p.stock}</span>}
                    </div>
                  </div>
                  {p.soon ? <Pill>Bientôt</Pill> : out ? <Pill>Rupture</Pill> : q === 0 ? (
                    <button onClick={() => add(p.id)} className="ca-tap" style={{ border: `1px solid ${C.jam}`, background: "transparent", color: C.jam, borderRadius: 10, width: 38, height: 38, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}><Plus size={18} /></button>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, background: C.jam, borderRadius: 10, padding: 3, flexShrink: 0 }}>
                      <Sq onClick={() => sub1(p.id)}><Minus size={15} color="#fff" /></Sq>
                      <span style={{ minWidth: 18, textAlign: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>{q}</span>
                      <Sq onClick={() => add(p.id)}><Plus size={15} color="#fff" /></Sq>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
      <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 18, marginTop: 4 }}>
        <ReviewsCarousel reviews={reviews} setStep={setStep} />
      </div>
      {count > 0 && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60, display: "flex", justifyContent: "center", padding: "0 14px max(14px, env(safe-area-inset-bottom))", pointerEvents: "none" }}>
          <button onClick={() => setStep("cart")} className="ca-tap" style={{ pointerEvents: "auto", width: "100%", maxWidth: 432, background: C.board, color: C.chalk, border: "none", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", boxShadow: "0 12px 30px -10px #16140faa" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 600, fontSize: 14 }}><ShoppingBag size={17} /> Mon panier · {count}</span>
            <span style={{ fontFamily: SCRIPT, fontSize: 17, color: "#e9c980" }}>{eur(total)}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function Cart({ cartLines, add, sub1, sub, discount, total, promoInput, setPromoInput, applied, setApplied, promos, setStep }) {
  const tryPromo = () => setApplied(promos.find((p) => p.active && p.code.toLowerCase() === promoInput.trim().toLowerCase()) || null);
  return (
    <div className="ca-anim" style={{ padding: "6px 22px 28px" }}>
      <StepHead onBack={() => setStep("shop")} title="Votre panier" sub={`${cartLines.length} article${cartLines.length > 1 ? "s" : ""}`} />
      {cartLines.map((l) => (
        <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: C.cream, display: "grid", placeItems: "center", flexShrink: 0 }}><Illu k={l.illu} col={l.col} s={32} /></div>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>{l.name}</div><div style={{ fontSize: 12, color: C.soft }}>{eur(l.price)} · {l.unit}</div></div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, border: `1px solid ${C.line}`, borderRadius: 9, padding: 2 }}>
            <Sq onClick={() => sub1(l.id)}><Minus size={14} color={C.ink} /></Sq>
            <span style={{ minWidth: 16, textAlign: "center", fontWeight: 700, fontSize: 13 }}>{l.qty}</span>
            <Sq onClick={() => add(l.id)}><Plus size={14} color={C.ink} /></Sq>
          </div>
          <div style={{ fontFamily: SCRIPT, fontSize: 14, color: C.jam, minWidth: 52, textAlign: "right" }}>{eur(l.price * l.qty)}</div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, margin: "16px 0 12px" }}>
        <input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="Code (ex. SAVEURS10)" style={{ ...inp(), flex: 1 }} />
        <button onClick={tryPromo} className="ca-tap" style={{ border: `1px solid ${C.jam}`, background: "transparent", color: C.jam, borderRadius: 11, padding: "0 15px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Appliquer</button>
      </div>
      {applied && <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: C.ok, fontWeight: 600, marginBottom: 10 }}><Check size={15} /> {applied.code} appliqué (−{applied.pct} %)</div>}
      <Totals {...{ sub, discount, total }} />
      <div style={{ marginTop: 16 }}><BigBtn onClick={() => setStep("checkout")}>Finaliser <ChevronRight size={17} /></BigBtn></div>
    </div>
  );
}

function Checkout({ pickupDay, setPickupDay, sub, discount, total, paymentEnabled, placeOrder, placing, setStep }) {
  const [pm, setPm] = useState("cb");
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const fmt = (d) => cap(d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }));
  const days = (() => { const out = []; const base = new Date(); for (let i = 0; i < 21 && out.length < 4; i++) { const x = new Date(); x.setDate(base.getDate() + i); if (x.getDay() === 0 || x.getDay() === 6) out.push(x); } return out; })();
  useEffect(() => { if (!pickupDay && days.length) setPickupDay(fmt(days[0])); }, []);
  return (
    <div className="ca-anim" style={{ padding: "6px 22px 28px" }}>
      <StepHead onBack={() => setStep("cart")} title="Finaliser" sub="Jour de retrait & règlement" />
      <Section>Jour de retrait au marché</Section>
      <div style={{ fontSize: 12.5, color: C.soft, margin: "0 0 11px", lineHeight: 1.45 }}>Le marché a lieu le <b style={{ color: C.ink }}>samedi et le dimanche</b>. Choisissez quand venir chercher votre commande au stand.</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 10 }}>
        {days.map((d) => { const lbl = fmt(d); const sel = pickupDay === lbl; return (
          <button key={lbl} onClick={() => setPickupDay(lbl)} className="ca-tap" style={{ textAlign: "left", cursor: "pointer", borderRadius: 12, padding: "11px 13px", border: `1.5px solid ${sel ? C.jam : C.line}`, background: sel ? "#7A2B330d" : C.cream }}>
            <Calendar size={16} color={sel ? C.jam : C.soft} />
            <div style={{ fontWeight: 600, fontSize: 13, marginTop: 5, lineHeight: 1.25 }}>{lbl}</div>
          </button>
        ); })}
      </div>
      <label style={{ display: "block", marginBottom: 18 }}>
        <span style={{ fontSize: 12, color: C.soft }}>Autre jour souhaité</span>
        <input type="date" onChange={(e) => { if (e.target.value) { const d = new Date(e.target.value + "T12:00:00"); setPickupDay(fmt(d)); } }} style={{ ...inp(), marginTop: 5 }} />
      </label>
      <Section>Paiement</Section>
      {paymentEnabled ? (
        <div style={{ marginBottom: 16 }}>
          {[["cb", CreditCard, "Carte bancaire"], ["paypal", Mail, "PayPal"], ["lydia", Smartphone, "Lydia"]].map(([k, Ic, t]) => (
            <label key={k} className="ca-tap" style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 13px", borderRadius: 11, border: `1.5px solid ${pm === k ? C.jam : C.line}`, background: C.cream, marginBottom: 8, cursor: "pointer" }}>
              <input type="radio" checked={pm === k} onChange={() => setPm(k)} style={{ accentColor: C.jam }} />
              <Ic size={16} color={C.jam} /> <span style={{ fontWeight: 600, fontSize: 14 }}>{t}</span>
            </label>
          ))}
          <div style={{ fontSize: 11, color: C.soft }}>Module démo — branchement réel à la mise en production.</div>
        </div>
      ) : (
        <div style={{ borderRadius: 13, padding: 15, border: `1.5px dashed ${C.line}`, background: C.cream, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 13.5, color: C.soft }}><Power size={15} /> Paiement en ligne — en veille</div>
          <div style={{ fontSize: 12.5, color: C.soft, lineHeight: 1.5, marginTop: 6 }}>Vous réglez <b style={{ color: C.ink }}>à l'enlèvement</b> (espèces, Wero, carte…). Le paiement en ligne s'active en un clic côté Pro.</div>
        </div>
      )}
      <Totals {...{ sub, discount, total }} />
      <div style={{ marginTop: 16 }}><BigBtn onClick={placeOrder}>{placing ? "Enregistrement…" : `${paymentEnabled ? "Payer & commander" : "Valider la réservation"} · ${eur(total)}`}</BigBtn></div>
    </div>
  );
}

function Done({ lastOrder, mode, resetClient, paymentEnabled, cust, profile, setStep }) {
  const [copied, setCopied] = useState(false);
  const [ask, setAsk] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAsk(true), 1600); return () => clearTimeout(t); }, []);
  const o = lastOrder || { lines: [], total: 0, id: "" };
  const lignes = o.lines.map((l) => `• ${l.qty}x ${l.name} (${l.unit}) — ${eur(l.price * l.qty)}`).join("\n");
  const recap = `🛒 COMMANDE ${profile.name} — réf. ${o.id}\n———————————\n👤 ${cust?.prenom || ""} ${cust?.nom || ""}\n📞 ${cust?.tel || ""}\n✉️ ${cust?.email || ""}\n———————————\nBonjour ! Je souhaite passer commande :\n\n${lignes}\n\nTotal : ${eur(o.total)}\n📅 Retrait souhaité : ${o.pickup || "à convenir"}\n📍 Au stand, sur le marché${!paymentEnabled ? "\n💶 Règlement à l'enlèvement" : ""}\n\nMerci de me confirmer la disponibilité 🙂`;
  const wa = `https://wa.me/${profile.wa}?text=${encodeURIComponent(recap)}`;
  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent("Commande " + profile.name + " " + o.id)}&body=${encodeURIComponent(recap)}`;
  const copy = () => { try { navigator.clipboard && navigator.clipboard.writeText(recap); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 1800); };
  return (
    <div className="ca-anim" style={{ padding: "30px 22px 30px", textAlign: "center" }}>
      <div style={{ width: 58, height: 58, borderRadius: 18, background: "#3F7A4B18", display: "grid", placeItems: "center", margin: "0 auto 12px" }}><Check size={28} color={C.ok} /></div>
      <h2 style={{ fontFamily: SCRIPT, fontSize: 25, margin: "0 0 6px", color: C.jam }}>Votre commande est prête</h2>
      <p style={{ color: C.soft, fontSize: 13.5, margin: "0 0 16px", lineHeight: 1.5 }}>Réf. <b style={{ color: C.ink }}>{o.id}</b> · envoyez-la au stand pour qu'on vous la prépare.</p>
      <div style={{ background: C.cream, borderRadius: 14, padding: 16, textAlign: "left", border: `1px solid ${C.line}`, marginBottom: 18 }}>
        {o.lines.map((l) => (
          <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "4px 0" }}><span>{l.qty}× {l.name}</span><span style={{ fontFamily: SCRIPT, color: C.jam }}>{eur(l.price * l.qty)}</span></div>
        ))}
        <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 700 }}><span>Total</span><span style={{ fontFamily: SCRIPT, color: C.jam }}>{eur(o.total)}</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: C.soft, marginTop: 10 }}><Calendar size={14} /> Retrait au stand{o.pickup ? ` · ${o.pickup}` : ""}{!paymentEnabled && " · règlement à l'enlèvement"}</div>
      </div>
      <div style={{ background: "#3F7A4B14", border: "1px solid #3F7A4B33", borderRadius: 13, padding: "12px 14px", textAlign: "left", marginBottom: 16, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <Check size={16} color={C.ok} style={{ marginTop: 1, flexShrink: 0 }} />
        <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.45 }}>Envoyez votre commande ci-dessous — <b>on vous recontacte rapidement pour la confirmer</b> (disponibilités et jour de retrait au marché). Aucun paiement en ligne : règlement à l'enlèvement.</div>
      </div>
      <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: C.caramel, fontWeight: 700, textAlign: "left", marginBottom: 10 }}>Envoyer ma commande</div>
      <a href={wa} target="_blank" rel="noreferrer" className="ca-tap" style={{ width: "100%", background: "#1FA855", color: "#fff", borderRadius: 13, padding: "14px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, textDecoration: "none", boxSizing: "border-box" }}><MessageCircle size={17} /> Envoyer par WhatsApp</a>
      <a href={mailto} className="ca-tap" style={{ width: "100%", marginTop: 10, background: C.board, color: C.chalk, borderRadius: 13, padding: "14px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, textDecoration: "none", boxSizing: "border-box" }}><Mail size={16} /> Envoyer par email</a>
      <button onClick={copy} className="ca-tap" style={{ width: "100%", marginTop: 10, background: "transparent", border: `1.5px solid ${C.line}`, color: C.jam, borderRadius: 13, padding: "12px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{copied ? <><Check size={15} /> Copié</> : <><Copy size={15} /> Copier le récapitulatif</>}</button>
      <button onClick={() => setStep("avis")} className="ca-tap" style={{ width: "100%", marginTop: 10, background: "transparent", border: `1.5px solid ${C.line}`, color: C.ink, borderRadius: 13, padding: "12px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Stars value={5} size={15} /> Donner mon avis</button>
      <button onClick={resetClient} className="ca-tap" style={{ ...backBtn(), margin: "16px auto 0" }}>Nouvelle commande</button>
      {ask && (
        <div onClick={() => setAsk(false)} style={{ position: "fixed", inset: 0, zIndex: 95, background: "#16140fcc", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 12px max(12px, env(safe-area-inset-bottom))" }}>
          <div className="ca-anim" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: C.paper, borderRadius: 20, padding: "22px 18px", textAlign: "center", boxShadow: "0 24px 60px -16px #000" }}>
            <div style={{ fontFamily: SCRIPT, fontSize: 25, color: C.jam, marginBottom: 4 }}>Merci {cust?.prenom || ""} !</div>
            <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.5, margin: "0 0 14px" }}>Votre plaisir compte. Donnez une note et un mot — ça aide beaucoup la petite fabrique 🍓</p>
            <div style={{ marginBottom: 16 }}><Stars value={0} size={36} onChange={() => { setAsk(false); setStep("avis"); }} /></div>
            <BigBtn onClick={() => { setAsk(false); setStep("avis"); }}>Donner mon avis <ChevronRight size={16} /></BigBtn>
            <button onClick={() => setAsk(false)} className="ca-tap" style={{ width: "100%", marginTop: 10, background: "transparent", border: "none", color: C.soft, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Plus tard</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- PRO ---------------- */
function ProView({ sales, setSales, orders, setOrders, products, setProducts, clients, promos, setPromos, paymentEnabled, setPaymentEnabled, profile, setProfile, onLogout, onRefresh, loading, pass, visits }) {
  const [tab, setTab] = useState("caisse");
  const NAV = [["caisse", "Caisse", CreditCard], ["stats", "Statistiques", TrendingUp], ["ventes", "Ventes", BarChart3], ["commandes", "Commandes", ShoppingBag], ["produits", "Produits", Package], ["clients", "Clients (CRM)", Users], ["publimail", "Publimail", Mail], ["promos", "Promos", Tag], ["profil", "Enseigne", Store], ["reglages", "Réglages", Settings]];
  return (
    <div className="pro-shell">
      <div className="pro-nav">
        {NAV.map(([k, lbl, Ic]) => (
          <button key={k} onClick={() => setTab(k)} className="ca-tap" style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, border: "none", cursor: "pointer", padding: "11px 12px", borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 3, textAlign: "left", background: tab === k ? C.board : "transparent", color: tab === k ? C.chalk : C.ink }}><Ic size={16} /> {lbl}</button>
        ))}
      </div>
      <div className="ca-scroll pro-content">
        {tab === "caisse" && <ProCaisse {...{ products, sales, setSales, pass, orders, setOrders }} />}
        {tab === "stats" && <ProStats {...{ sales, orders, visits, clients, products, onRefresh, loading }} />}
        {tab === "ventes" && <ProVentes {...{ sales, setSales, orders, products, pass }} />}
        {tab === "commandes" && <ProOrders {...{ orders, setOrders, onRefresh, loading, pass, products }} />}
        {tab === "produits" && <ProProducts {...{ products, setProducts, pass }} />}
        {tab === "clients" && <ProClients {...{ clients, orders, onRefresh, loading }} />}
        {tab === "publimail" && <ProMail {...{ clients }} />}
        {tab === "promos" && <ProPromos {...{ promos, setPromos }} />}
        {tab === "profil" && <ProProfile {...{ profile, setProfile, onLogout, pass }} />}
        {tab === "reglages" && <ProSettings {...{ paymentEnabled, setPaymentEnabled, pass }} />}
      </div>
    </div>
  );
}
function ProStats({ sales, orders, visits, clients, products, onRefresh, loading }) {
  const [range, setRange] = useState(30);
  const dayKeyOf = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const days = useMemo(() => {
    const out = []; const now = new Date();
    for (let i = range - 1; i >= 0; i--) { const d = new Date(now); d.setDate(now.getDate() - i); out.push(dayKeyOf(d.getTime())); }
    return out;
  }, [range]);
  const label = (k) => { const [, m, d] = k.split("-"); return `${d}/${m}`; };

  const caisseByDay = {}, orderByDay = {}, visitByDay = {};
  (sales || []).forEach((s) => { const k = dayKeyOf(s.ts); caisseByDay[k] = (caisseByDay[k] || 0) + (Number(s.total) || 0); });
  (orders || []).forEach((o) => { const k = dayKeyOf(o.ts); orderByDay[k] = (orderByDay[k] || 0) + (Number(o.total) || 0); });
  (visits || []).forEach((v) => { const k = dayKeyOf(v.ts); visitByDay[k] = (visitByDay[k] || 0) + 1; });

  const caSeries = days.map((k) => (caisseByDay[k] || 0) + (orderByDay[k] || 0));
  const vSeries = days.map((k) => visitByDay[k] || 0);
  const caMax = Math.max(1, ...caSeries), vMax = Math.max(1, ...vSeries);
  const caTotal = caSeries.reduce((a, b) => a + b, 0);
  const vTotal = vSeries.reduce((a, b) => a + b, 0);
  const nbCmd = (orders || []).filter((o) => days.includes(dayKeyOf(o.ts))).length;
  const conv = vTotal ? Math.round((nbCmd / vTotal) * 1000) / 10 : 0;
  const panier = nbCmd ? Math.round(((orders || []).filter((o) => days.includes(dayKeyOf(o.ts))).reduce((a, o) => a + (Number(o.total) || 0), 0) / nbCmd) * 100) / 100 : 0;

  // top produits (caisse + commandes)
  const qtyByProduct = {};
  (sales || []).forEach((s) => { if (!days.includes(dayKeyOf(s.ts))) return; (s.items || []).forEach((i) => { qtyByProduct[i.name] = (qtyByProduct[i.name] || 0) + (i.qty || 0); }); });
  (orders || []).forEach((o) => { if (!days.includes(dayKeyOf(o.ts))) return; (o.lines || []).forEach((i) => { qtyByProduct[i.name] = (qtyByProduct[i.name] || 0) + (i.qty || 0); }); });
  const top = Object.entries(qtyByProduct).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const topMax = Math.max(1, ...top.map(([, q]) => q));

  // jours de la semaine (pics)
  const JN = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const byDow = [0, 0, 0, 0, 0, 0, 0];
  days.forEach((k) => { const d = new Date(k + "T12:00:00"); byDow[d.getDay()] += (caisseByDay[k] || 0) + (orderByDay[k] || 0); });
  const dowMax = Math.max(1, ...byDow);

  const W = 760, H = 170, pad = 8;
  const pts = caSeries.map((v, i) => { const x = pad + (i * (W - pad * 2)) / Math.max(1, caSeries.length - 1); const y = H - pad - (v / caMax) * (H - pad * 2); return [x, y]; });
  const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = pts.length ? `${path} L${pts[pts.length - 1][0].toFixed(1)} ${H - pad} L${pts[0][0].toFixed(1)} ${H - pad} Z` : "";
  const kpi = (lbl, val, sub) => (
    <div style={{ flex: 1, minWidth: 130, background: C.board, color: C.chalk, borderRadius: 14, padding: "13px 14px" }}>
      <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".12em", opacity: .7 }}>{lbl}</div>
      <div style={{ fontSize: 25, fontWeight: 700, marginTop: 3 }}>{val}</div>
      {sub && <div style={{ fontSize: 11, opacity: .65, marginTop: 2 }}>{sub}</div>}
    </div>
  );
  return (
    <div>
      <ProHead title="Statistiques" sub="Fréquentation et courbe des ventes" />
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        {[[7, "7 jours"], [30, "30 jours"], [90, "3 mois"], [365, "1 an"]].map(([n, l]) => (
          <button key={n} onClick={() => setRange(n)} className="ca-tap" style={{ border: `1px solid ${range === n ? C.jam : C.line}`, background: range === n ? C.jam : "#fff", color: range === n ? "#fff" : C.ink, borderRadius: 999, padding: "7px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>{l}</button>
        ))}
        {onRefresh && <button onClick={onRefresh} className="ca-tap" style={{ marginLeft: "auto", border: `1px solid ${C.line}`, background: "#fff", color: C.jam, borderRadius: 999, padding: "7px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>{loading ? "…" : "↻ Actualiser"}</button>}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        {kpi("Visites", vTotal, "scans + ouvertures")}
        {kpi("Chiffre d'affaires", eur(caTotal), "caisse + commandes")}
        {kpi("Commandes", nbCmd, `panier moyen ${eur(panier)}`)}
        {kpi("Conversion", conv + " %", "visite → commande")}
      </div>

      <div style={card()}>
        <div style={{ ...h2 }}>Courbe des ventes</div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 170, display: "block" }}>
          <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.jam} stopOpacity=".28" /><stop offset="100%" stopColor={C.jam} stopOpacity="0" /></linearGradient></defs>
          {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={pad} y1={pad + f * (H - pad * 2)} x2={W - pad} y2={pad + f * (H - pad * 2)} stroke={C.line} strokeWidth="1" />)}
          {area && <path d={area} fill="url(#grad)" />}
          {path && <path d={path} fill="none" stroke={C.jam} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />}
          {pts.map(([x, y], i) => caSeries[i] > 0 ? <circle key={i} cx={x} cy={y} r="2.8" fill={C.jam} /> : null)}
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: C.soft, marginTop: 4 }}>
          <span>{days.length ? label(days[0]) : ""}</span><span>Max {eur(caMax)}</span><span>{days.length ? label(days[days.length - 1]) : ""}</span>
        </div>
      </div>

      <div style={card()}>
        <div style={{ ...h2 }}>Fréquentation (visites / scans QR)</div>
        {vTotal === 0 ? <div style={{ fontSize: 13, color: C.soft }}>Aucune visite enregistrée pour l'instant. Le comptage démarre maintenant : chaque scan du QR code et chaque ouverture de la boutique sera compté ici.</div> : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 130 }}>
            {vSeries.map((v, i) => (
              <div key={i} title={`${label(days[i])} · ${v} visite(s)`} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
                <div style={{ height: `${Math.max(v ? 6 : 1, (v / vMax) * 100)}%`, background: v ? C.caramel : C.line, borderRadius: 3, transition: "height .25s" }} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={card()}>
        <div style={{ ...h2 }}>Pics de vente par jour de la semaine</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
          {byDow.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
              <div style={{ fontSize: 10, color: C.soft, marginBottom: 3 }}>{v ? eur(v) : ""}</div>
              <div style={{ width: "100%", height: `${Math.max(v ? 6 : 1, (v / dowMax) * 78)}%`, background: v === dowMax && v > 0 ? C.jam : C.caramel, opacity: v ? 1 : .25, borderRadius: 5 }} />
              <div style={{ fontSize: 11, color: C.ink, marginTop: 5, fontWeight: 600 }}>{JN[i]}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={card()}>
        <div style={{ ...h2 }}>Produits les plus vendus</div>
        {top.length === 0 ? <div style={{ fontSize: 13, color: C.soft }}>Aucune vente sur la période.</div> : top.map(([name, q]) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
            <div style={{ width: 150, fontSize: 12.5, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
            <div style={{ flex: 1, height: 12, background: C.line, borderRadius: 6, overflow: "hidden" }}>
              <div style={{ width: `${(q / topMax) * 100}%`, height: "100%", background: C.jam, borderRadius: 6 }} />
            </div>
            <div style={{ width: 34, textAlign: "right", fontSize: 12.5, fontWeight: 700, color: C.jam }}>{q}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
const STATUSES = ["À préparer", "Prête", "Remise"];
function ProOrders({ orders, setOrders, onRefresh, loading, pass, products }) {
  const sellable = (products || []).filter((p) => !p.soon && p.active !== false);
  const [openId, setOpenId] = useState(null);
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);
  const addItem = (p) => setEdit((e) => {
    const idx = e.items.findIndex((i) => i.name === p.name && i.unit === p.unit);
    if (idx >= 0) return { ...e, items: e.items.map((i, k) => k === idx ? { ...i, qty: i.qty + 1 } : i) };
    return { ...e, items: [...e.items, { name: p.name, unit: p.unit, price: p.price, qty: 1 }] };
  });
  const persistStatus = async (o, s) => {
    setOrders((l) => l.map((x) => x.id === o.id ? { ...x, status: s } : x));
    if (supabase && pass && o.oid) { try { await supabase.rpc("admin_set_order_status", { pass, p_oid: o.oid, p_status: s }); } catch (e) {} }
  };
  const openEdit = (o) => setEdit({ id: o.id, ref: o.id, oid: o.oid, name: o.name, items: (o.lines || []).map((l) => ({ ...l })), pickup: o.pickup || "", status: o.status || STATUSES[0] });
  const editTotal = edit ? edit.items.reduce((a, i) => a + i.price * i.qty, 0) : 0;
  const setQty = (k, d) => setEdit((e) => ({ ...e, items: e.items.map((i, idx) => idx === k ? { ...i, qty: Math.max(0, i.qty + d) } : i) }));
  const rmLine = (k) => setEdit((e) => ({ ...e, items: e.items.filter((_, idx) => idx !== k) }));
  const saveEdit = async () => {
    if (busy) return; setBusy(true);
    const items = edit.items.filter((i) => i.qty > 0);
    const total = items.reduce((a, i) => a + i.price * i.qty, 0);
    const count = items.reduce((a, i) => a + i.qty, 0);
    if (items.length === 0) { await delOrder(); return; }
    setOrders((l) => l.map((x) => x.id === edit.id ? { ...x, lines: items, total, items: count, pickup: edit.pickup, status: edit.status } : x));
    if (supabase && pass && edit.oid) { try { await supabase.rpc("admin_update_order", { pass, p_oid: edit.oid, p_items: items, p_total: total, p_count: count, p_pickup: edit.pickup, p_status: edit.status }); } catch (e) {} }
    setBusy(false); setEdit(null);
  };
  const delOrder = async () => {
    setOrders((l) => l.filter((x) => x.id !== edit.id));
    if (supabase && pass && edit.oid) { try { await supabase.rpc("admin_delete_order", { pass, p_oid: edit.oid }); } catch (e) {} }
    setBusy(false); setEdit(null);
  };
  const groups = {};
  orders.forEach((o) => { const k = o.date || "—"; (groups[k] = groups[k] || []).push(o); });
  const keys = Object.keys(groups);
  const waNum = (t) => (t || "").replace(/\D/g, "").replace(/^0/, "33");
  return (
    <div className="ca-anim">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div><h2 style={{ fontFamily: SCRIPT, fontSize: 24, margin: 0, color: C.jam }}>Commandes</h2><div style={{ fontSize: 13, color: C.soft, marginTop: 3 }}>{orders.length} commande{orders.length > 1 ? "s" : ""} · {eur(orders.reduce((s, o) => s + o.total, 0))}</div></div>
        {onRefresh && <button onClick={onRefresh} disabled={loading} className="ca-tap" style={{ background: C.board, color: C.chalk, border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 600, cursor: loading ? "default" : "pointer", fontSize: 12.5, whiteSpace: "nowrap", flexShrink: 0, opacity: loading ? .6 : 1 }}>{loading ? "Actualisation…" : "↻ Actualiser"}</button>}
      </div>
      {keys.length === 0 && <div style={{ fontSize: 13.5, color: C.soft, padding: "8px 2px" }}>Aucune commande pour le moment.</div>}
      {keys.map((day) => {
        const list = groups[day];
        const dayTotal = list.reduce((s, o) => s + o.total, 0);
        return (
          <div key={day} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 2px 8px" }}>
              <div style={{ fontFamily: SCRIPT, fontSize: 18, color: C.jam, textTransform: "capitalize" }}>{day}</div>
              <div style={{ fontSize: 12, color: C.soft }}>{list.length} cmd · {eur(dayTotal)}</div>
            </div>
            {list.map((o) => {
              const open = openId === o.id;
              return (
                <div key={o.id} style={card()}>
                  <div onClick={() => setOpenId(open ? null : o.id)} className="ca-tap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, cursor: "pointer" }}>
                    <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 9 }}>
                      <ChevronDown size={16} color={C.soft} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14.5 }}>{o.name} <span style={{ color: C.soft, fontWeight: 500 }}>· {o.id}</span></div>
                        <div style={{ fontSize: 12, color: C.soft, marginTop: 3, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}><Calendar size={13} /> Retrait : <b style={{ color: C.ink, fontWeight: 600 }}>{o.pickup || "à convenir"}</b> · {o.items} art.{o.paid ? <span style={{ color: C.ok, fontWeight: 600 }}> · payé</span> : <span style={{ color: C.caramel, fontWeight: 600 }}> · à régler</span>}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <span style={{ fontFamily: SCRIPT, fontSize: 18, color: C.jam }}>{eur(o.total)}</span>
                      <select value={o.status} onChange={(e) => persistStatus(o, e.target.value)} style={sel(o.status)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                    </div>
                  </div>
                  {open && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
                      {o.lines && o.lines.length ? o.lines.map((l, k) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0" }}>
                          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.qty}× {l.name}{l.unit ? <span style={{ color: C.soft }}> · {l.unit}</span> : null}</span>
                          <span style={{ flexShrink: 0, marginLeft: 8 }}>{eur(l.price * l.qty)}</span>
                        </div>
                      )) : <div style={{ fontSize: 12.5, color: C.soft }}>{o.items} article(s) — le détail produit par produit est enregistré pour les nouvelles commandes.</div>}
                      {o.parrain && <div style={{ fontSize: 12, color: C.caramel, fontWeight: 600, marginTop: 8 }}>Parrainé par : {o.parrain}</div>}
                      <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 8, paddingTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {o.tel && <a href={`tel:${o.tel.replace(/\s/g, "")}`} className="ca-tap" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: C.ink, textDecoration: "none", border: `1px solid ${C.line}`, borderRadius: 9, padding: "8px 12px" }}><Phone size={14} /> {o.tel}</a>}
                        {o.tel && <a href={`https://wa.me/${waNum(o.tel)}`} target="_blank" rel="noreferrer" className="ca-tap" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#1FA855", textDecoration: "none", border: `1px solid ${C.line}`, borderRadius: 9, padding: "8px 12px" }}><MessageCircle size={14} /> WhatsApp</a>}
                        {o.email && <a href={`mailto:${o.email}`} className="ca-tap" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: C.ink, textDecoration: "none", border: `1px solid ${C.line}`, borderRadius: 9, padding: "8px 12px" }}><Mail size={14} /> {o.email}</a>}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                        <button onClick={() => openEdit(o)} className="ca-tap" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: C.jam, background: "#fff", border: `1.5px solid ${C.jam}`, borderRadius: 10, padding: "9px 14px", cursor: "pointer" }}><Settings size={14} /> Modifier la commande</button>
                        <button onClick={() => persistStatus(o, "Prête")} className="ca-tap" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "#fff", background: C.ok, border: "none", borderRadius: 10, padding: "9px 14px", cursor: "pointer", opacity: o.status === "Prête" || o.status === "Remise" ? .5 : 1 }}><Check size={14} /> {o.status === "Prête" || o.status === "Remise" ? "Validée" : "Valider la commande"}</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
      {edit && (
        <div onClick={() => !busy && setEdit(null)} style={{ position: "fixed", inset: 0, zIndex: 100, background: "#16140fcc", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 12px max(12px, env(safe-area-inset-bottom))" }}>
          <div className="ca-anim" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: C.paper, borderRadius: 20, padding: "18px 16px", maxHeight: "86vh", overflowY: "auto", boxShadow: "0 24px 60px -16px #000" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ fontFamily: SCRIPT, fontSize: 22, color: C.jam }}>Modifier la commande</div>
              <button onClick={() => !busy && setEdit(null)} aria-label="Fermer" style={{ background: "transparent", border: "none", color: C.soft, cursor: "pointer", padding: 2, lineHeight: 0 }}><X size={20} /></button>
            </div>
            <div style={{ fontSize: 12.5, color: C.soft, marginBottom: 12 }}>{edit.name} · {edit.ref}</div>
            <Lbl>Articles</Lbl>
            <div style={{ marginTop: 6 }}>
              {edit.items.length === 0 ? <div style={{ fontSize: 13, color: C.soft, padding: "8px 0" }}>Plus aucun article — la commande sera supprimée à la validation.</div> : edit.items.map((i, k) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.name}{i.unit ? <span style={{ color: C.soft }}> · {i.unit}</span> : null}</div>
                    <div style={{ fontSize: 11.5, color: C.soft }}>{eur(i.price)} l'unité · {eur(i.price * i.qty)}</div>
                  </div>
                  <button onClick={() => setQty(k, -1)} className="ca-tap" style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.line}`, background: "#fff", color: C.jam, cursor: "pointer", fontSize: 17, lineHeight: 1 }}>−</button>
                  <span style={{ minWidth: 20, textAlign: "center", fontWeight: 700 }}>{i.qty}</span>
                  <button onClick={() => setQty(k, 1)} className="ca-tap" style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.line}`, background: "#fff", color: C.jam, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>+</button>
                  <button onClick={() => rmLine(k)} aria-label="Retirer" className="ca-tap" style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", color: C.soft, cursor: "pointer", lineHeight: 0 }}><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
            <select value="" onChange={(e) => { const p = sellable.find((x) => x.id === e.target.value); if (p) addItem(p); e.target.value = ""; }} style={{ ...inp(), marginTop: 12, color: C.jam, fontWeight: 600 }}>
              <option value="">+ Ajouter un article…</option>
              {sellable.map((p) => <option key={p.id} value={p.id} style={{ color: C.ink, fontWeight: 400 }}>{p.name} · {p.unit} · {eur(p.price)}</option>)}
            </select>
            <div style={{ marginTop: 14 }}><Lbl>Jour de retrait</Lbl><input value={edit.pickup} onChange={(e) => setEdit({ ...edit, pickup: e.target.value })} placeholder="ex. Samedi 14 juin" style={{ ...inp(), marginTop: 4 }} /></div>
            <div style={{ marginTop: 12 }}><Lbl>Statut</Lbl><select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })} style={{ ...inp(), marginTop: 4 }}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "14px 0", fontSize: 15 }}>
              <span style={{ color: C.soft }}>Total</span><span style={{ fontFamily: SCRIPT, fontSize: 22, color: C.jam }}>{eur(editTotal)}</span>
            </div>
            <button onClick={saveEdit} disabled={busy} className="ca-tap" style={{ width: "100%", background: C.ok, color: "#fff", border: "none", borderRadius: 13, padding: "14px", fontWeight: 700, fontSize: 15, cursor: busy ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Check size={18} /> {busy ? "…" : "Valider les modifications"}</button>
            <button onClick={delOrder} disabled={busy} className="ca-tap" style={{ width: "100%", marginTop: 10, background: "transparent", color: C.jam, border: `1px solid ${C.line}`, borderRadius: 13, padding: "12px", fontWeight: 600, fontSize: 13.5, cursor: busy ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Trash2 size={15} /> Supprimer la commande</button>
          </div>
        </div>
      )}
    </div>
  );
}
function ProProducts({ products, setProducts, pass }) {
  const ILLUS = ["orange", "lemon", "plum", "mure", "apple", "quince", "berry", "apricot", "caramel", "cake", "loaf", "pissa", "miel", "marron"];
  const blank = { name: "", cat: "Confitures", unit: "pot 250g", price: "", cost: "", coef: "", stock: "", illu: "orange", col: "#C25E1E" };
  const [creating, setCreating] = useState(false);
  const [nw, setNw] = useState(blank);
  const [openId, setOpenId] = useState(null);
  const [openCat, setOpenCat] = useState({});

  const persist = (np) => { if (supabase && pass) { supabase.rpc("admin_save_product", { pass, p_id: np.id, p_name: np.name || "", p_cat: np.cat || "", p_unit: np.unit || "", p_price: Number(np.price) || 0, p_cost: Number(np.cost) || 0, p_coef: Number(np.coef) || 0, p_stock: Number(np.stock) || 0, p_illu: np.illu || "", p_col: np.col || "", p_soon: !!np.soon, p_active: np.active !== false }).then(() => {}, () => {}); } };
  const apply = (id, fn) => { const cur = products.find((p) => p.id === id); if (!cur) return; const np = fn(cur); setProducts((l) => l.map((p) => p.id === id ? np : p)); persist(np); };
  const updField = (id, key, val) => apply(id, (p) => ({ ...p, [key]: (key === "price" || key === "stock" || key === "cost") ? (val === "" ? 0 : +val) : val }));
  // prix d'achat × coef = prix de vente (liaison à double sens)
  const onCost = (p, val) => apply(p.id, (x) => { const cost = val === "" ? 0 : +val; const coef = x.coef || (x.cost ? +(x.price / x.cost).toFixed(2) : 0); return { ...x, cost, coef, price: coef ? +(cost * coef).toFixed(2) : x.price }; });
  const onCoef = (p, val) => apply(p.id, (x) => { const coef = val === "" ? 0 : +val; return { ...x, coef, price: x.cost ? +(x.cost * coef).toFixed(2) : x.price }; });
  const onPrice = (p, val) => apply(p.id, (x) => { const price = val === "" ? 0 : +val; return { ...x, price, coef: x.cost ? +(price / x.cost).toFixed(2) : x.coef }; });
  const toggle = (id) => apply(id, (p) => ({ ...p, active: p.active === false ? true : false }));
  const remove = (id) => { setProducts((l) => l.filter((p) => p.id !== id)); if (supabase && pass) { supabase.rpc("admin_delete_product", { pass, p_id: id }).then(() => {}, () => {}); } };
  const canCreate = nw.name && (nw.price !== "" || (nw.cost !== "" && nw.coef !== ""));
  const create = () => {
    const cost = +nw.cost || 0; const coef = +nw.coef || 0;
    const price = nw.price !== "" ? +nw.price : (cost && coef ? +(cost * coef).toFixed(2) : 0);
    if (!nw.name || !price) return;
    const slug = (nw.name || "prod").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "prod";
    const np = { id: slug + "-" + Date.now().toString(36).slice(-4), name: nw.name, cat: nw.cat, unit: nw.unit, price, cost, coef, stock: +nw.stock || 0, illu: nw.illu, col: nw.col, soon: false, active: true };
    setProducts((l) => [np, ...l]); persist(np);
    setOpenCat((o) => ({ ...o, [nw.cat]: true }));
    setNw(blank); setCreating(false);
  };
  const swatch = (active) => ({ width: 40, height: 40, borderRadius: 10, border: `1.5px solid ${active ? C.jam : C.line}`, background: C.cream, display: "grid", placeItems: "center", cursor: "pointer" });
  const extra = [...new Set(products.map((p) => p.cat))].filter((c) => !CAT_ORDER.includes(c));
  const cats = [...CAT_ORDER, ...extra].filter((c) => products.some((p) => p.cat === c));

  return (
    <div className="ca-anim">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div><h2 style={{ fontFamily: SCRIPT, fontSize: 24, margin: 0, color: C.jam }}>Produits & stock</h2><div style={{ fontSize: 13, color: C.soft, marginTop: 3 }}>Rangés par catégorie · cliquez pour déplier</div></div>
        <button onClick={() => { setCreating((v) => !v); setNw(blank); }} className="ca-tap" style={{ background: creating ? "transparent" : C.jam, color: creating ? C.soft : "#fff", border: creating ? `1px solid ${C.line}` : "none", borderRadius: 10, padding: "10px 14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, whiteSpace: "nowrap" }}>{creating ? <X size={15} /> : <Plus size={15} />} {creating ? "Fermer" : "Nouveau produit"}</button>
      </div>

      {creating && (
        <div style={{ ...card(), background: C.paper, border: `1.5px solid #7A2B3333` }}>
          <Section>Nouveau produit · rangé automatiquement dans sa catégorie</Section>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ gridColumn: "1 / -1" }}><MiniLabel>Nom</MiniLabel><input value={nw.name} onChange={(e) => setNw({ ...nw, name: e.target.value })} placeholder="Confiture de figue" style={inp()} /></div>
            <div><MiniLabel>Catégorie</MiniLabel><select value={nw.cat} onChange={(e) => setNw({ ...nw, cat: e.target.value })} style={{ ...inp(), cursor: "pointer" }}>{CAT_ORDER.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><MiniLabel>Format / poids</MiniLabel><input value={nw.unit} onChange={(e) => setNw({ ...nw, unit: e.target.value })} placeholder="pot 250g" style={inp()} /></div>
            <div><MiniLabel>Prix d'achat €</MiniLabel><input type="number" value={nw.cost} onChange={(e) => { const cost = e.target.value; setNw((n) => ({ ...n, cost, price: (n.coef !== "" && cost !== "") ? (+cost * +n.coef).toFixed(2) : n.price })); }} placeholder="2.50" style={inp()} /></div>
            <div><MiniLabel>Coef ×</MiniLabel><input type="number" step="0.1" value={nw.coef} onChange={(e) => { const coef = e.target.value; setNw((n) => ({ ...n, coef, price: (coef !== "" && n.cost !== "") ? (+n.cost * +coef).toFixed(2) : n.price })); }} placeholder="2.8" style={inp()} /></div>
            <div><MiniLabel>Prix de vente €</MiniLabel><input type="number" value={nw.price} onChange={(e) => setNw({ ...nw, price: e.target.value })} placeholder="7" style={inp()} /></div>
            <div><MiniLabel>Stock</MiniLabel><input type="number" value={nw.stock} onChange={(e) => setNw({ ...nw, stock: e.target.value })} placeholder="0" style={inp()} /></div>
          </div>
          <div style={{ margin: "12px 0 0" }}><MiniLabel>Illustration & couleur</MiniLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4, alignItems: "center" }}>
              {ILLUS.map((k) => (<button key={k} onClick={() => setNw({ ...nw, illu: k })} className="ca-tap" style={swatch(nw.illu === k)}><Illu k={k} col={nw.col} s={30} /></button>))}
              <input type="color" value={nw.col} onChange={(e) => setNw({ ...nw, col: e.target.value })} title="Couleur" style={{ width: 40, height: 40, border: `1px solid ${C.line}`, borderRadius: 10, background: C.cream, cursor: "pointer", marginLeft: 4 }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={create} disabled={!canCreate} className="ca-tap" style={{ flex: 1, background: !canCreate ? C.line : C.jam, color: "#fff", border: "none", borderRadius: 11, padding: "12px", fontWeight: 600, cursor: !canCreate ? "default" : "pointer", fontSize: 13.5 }}>Créer le produit</button>
            <button onClick={() => { setNw(blank); setCreating(false); }} className="ca-tap" style={{ border: `1px solid ${C.line}`, background: "transparent", color: C.soft, borderRadius: 11, padding: "12px 16px", fontWeight: 600, cursor: "pointer", fontSize: 13.5 }}>Annuler</button>
          </div>
        </div>
      )}

      {cats.map((cat) => {
        const items = products.filter((p) => p.cat === cat);
        const isOpen = !!openCat[cat];
        return (
          <div key={cat} style={{ marginBottom: 10 }}>
            <button onClick={() => setOpenCat((o) => ({ ...o, [cat]: !o[cat] }))} className="ca-tap" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 15px", borderRadius: 12, border: `1px solid ${C.line}`, background: isOpen ? "#7A2B3308" : C.paper, cursor: "pointer" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: SCRIPT, fontSize: 19, color: C.jam }}>{cat}</span>
                <span style={{ fontSize: 11.5, color: C.soft, background: C.cream, padding: "3px 9px", borderRadius: 20, fontWeight: 600 }}>{items.length}</span>
              </span>
              <ChevronDown size={18} color={C.soft} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
            </button>
            {isOpen && (
              <div style={{ marginTop: 8 }}>
                {items.map((p) => (
                  <div key={p.id} style={{ ...card(), opacity: p.active === false ? .55 : 1 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "auto 2fr 1.3fr 0.9fr 0.8fr auto", gap: 9, alignItems: "end" }}>
                      <button onClick={() => setOpenId(openId === p.id ? null : p.id)} className="ca-tap" title="Illustration & catégorie" style={{ ...swatch(openId === p.id), width: 42, height: 42, alignSelf: "center" }}><Illu k={p.illu} col={p.col} s={32} /></button>
                      <div><MiniLabel>Nom</MiniLabel><input value={p.name} onChange={(e) => updField(p.id, "name", e.target.value)} style={inp()} /></div>
                      <div><MiniLabel>Format / poids</MiniLabel><input value={p.unit} onChange={(e) => updField(p.id, "unit", e.target.value)} style={inp()} /></div>
                      <div><MiniLabel>Prix vente €</MiniLabel><input type="number" value={p.price} onChange={(e) => onPrice(p, e.target.value)} style={inp()} /></div>
                      <div><MiniLabel>Stock</MiniLabel><input type="number" value={p.stock} onChange={(e) => updField(p.id, "stock", e.target.value)} style={{ ...inp(), borderColor: p.stock <= 5 ? C.caramel : C.line }} /></div>
                      <div style={{ display: "flex", gap: 6, alignSelf: "center" }}>
                        <button onClick={() => toggle(p.id)} className="ca-tap" style={{ border: `1px solid ${C.line}`, background: p.active === false ? "transparent" : "#3F7A4B14", color: p.active === false ? C.soft : C.ok, borderRadius: 9, padding: "9px 10px", fontWeight: 600, fontSize: 11.5, cursor: "pointer", whiteSpace: "nowrap" }}>{p.active === false ? "Masqué" : "En ligne"}</button>
                        <button onClick={() => remove(p.id)} className="ca-tap" title="Supprimer" style={{ border: `1px solid ${C.line}`, background: "transparent", color: C.jam, borderRadius: 9, padding: "9px 10px", cursor: "pointer", display: "grid", placeItems: "center" }}><Trash2 size={15} /></button>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 9, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, color: C.soft }}>Achat</span>
                        <input type="number" value={p.cost ?? ""} onChange={(e) => onCost(p, e.target.value)} placeholder="—" style={{ ...inp(), width: 66, padding: "7px 9px" }} />
                        <span style={{ fontSize: 11, color: C.soft }}>€</span>
                      </div>
                      <span style={{ fontSize: 13, color: C.soft, fontWeight: 700 }}>×</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, color: C.soft }}>Coef</span>
                        <input type="number" step="0.1" value={p.coef ?? ""} onChange={(e) => onCoef(p, e.target.value)} placeholder="—" style={{ ...inp(), width: 62, padding: "7px 9px" }} />
                      </div>
                      <span style={{ fontSize: 13, color: C.soft, fontWeight: 700 }}>=</span>
                      <span style={{ fontSize: 12.5, color: C.ink, background: C.cream, border: `1px solid ${C.line}`, borderRadius: 20, padding: "5px 11px" }}>Vente <b style={{ color: C.jam }}>{eur(p.price || 0)}</b>{p.cost > 0 && <> · marge <b style={{ color: (p.price - p.cost) >= 0 ? C.ok : "#B23B3B" }}>{eur(+(p.price - p.cost).toFixed(2))}</b></>}</span>
                    </div>
                    {openId === p.id && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                          <div><MiniLabel>Catégorie</MiniLabel><select value={p.cat} onChange={(e) => updField(p.id, "cat", e.target.value)} style={{ ...inp(), cursor: "pointer" }}>{CAT_ORDER.map((c) => <option key={c}>{c}</option>)}</select></div>
                          <div><MiniLabel>Couleur</MiniLabel><input type="color" value={p.col} onChange={(e) => updField(p.id, "col", e.target.value)} style={{ width: "100%", height: 38, border: `1px solid ${C.line}`, borderRadius: 10, background: C.cream, cursor: "pointer" }} /></div>
                        </div>
                        <MiniLabel>Illustration</MiniLabel>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                          {ILLUS.map((k) => (<button key={k} onClick={() => updField(p.id, "illu", k)} className="ca-tap" style={{ ...swatch(p.illu === k), width: 38, height: 38 }}><Illu k={k} col={p.col} s={28} /></button>))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
function ProClients({ clients, orders }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [page, setPage] = useState(0);
  const PER = 8;
  const filtered = clients.filter((c) => ((c.prenom + " " + c.nom + " " + c.email + " " + c.tel).toLowerCase().includes(q.toLowerCase().trim())));
  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const pg = Math.min(page, pages - 1);
  const rows = filtered.slice(pg * PER, pg * PER + PER);
  const ordersOf = (email) => orders.filter((o) => o.email === email);
  const selIdx = filtered.findIndex((c) => c.email === sel);
  const selClient = selIdx >= 0 ? filtered[selIdx] : null;
  const move = (d) => { const n = selIdx + d; if (n >= 0 && n < filtered.length) setSel(filtered[n].email); };
  const arrowBtn = (d) => ({ width: 32, height: 32, borderRadius: 9, border: `1px solid ${C.line}`, background: "#fff", color: d ? "#C9BFA8" : C.ink, cursor: d ? "default" : "pointer", display: "grid", placeItems: "center" });
  const exportCsv = () => downloadCSV(`clients-${new Date().toISOString().slice(0, 10)}.csv`, ["Prénom", "Nom", "Téléphone", "Email", "Commandes", "Total dépensé", "Consentement contact"], filtered.map((c) => [c.prenom, c.nom, c.tel || "", c.email, c.orders || 0, (c.spent || 0) + " €", c.optin ? "oui" : "non"]));
  return (
    <div className="ca-anim">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div><h2 style={{ fontFamily: SCRIPT, fontSize: 24, margin: 0, color: C.jam }}>Clients · CRM</h2><div style={{ fontSize: 13, color: C.soft, marginTop: 3 }}>{clients.length} contacts · fiches, filtre &amp; export</div></div>
        <button onClick={exportCsv} disabled={!filtered.length} className="ca-tap" style={{ background: filtered.length ? C.board : C.line, color: C.chalk, border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 600, cursor: filtered.length ? "pointer" : "default", display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, whiteSpace: "nowrap", flexShrink: 0 }}><Send size={14} /> Export CSV</button>
      </div>
      <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Filtrer : nom, email, téléphone…" style={{ ...inp(), marginBottom: 12 }} />
      <div style={{ display: "grid", gap: 8 }}>
        {rows.length === 0 ? <div style={{ fontSize: 13, color: C.soft, padding: "10px 2px" }}>Aucun client pour ce filtre.</div>
          : rows.map((c) => (
            <button key={c.email} onClick={() => setSel(c.email)} className="ca-tap" style={{ textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: "12px 13px", borderRadius: 13, border: `1.5px solid ${sel === c.email ? C.jam : C.line}`, background: sel === c.email ? "#7A2B330d" : C.paper }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: C.board, color: C.chalk, display: "grid", placeItems: "center", fontFamily: SCRIPT, fontSize: 15, flexShrink: 0 }}>{(c.prenom[0] || "")}{(c.nom[0] || "")}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{c.prenom} {c.nom}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.ink, marginTop: 3 }}><Phone size={12} color={C.soft} /> {c.tel || "—"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.soft, marginTop: 1, overflow: "hidden" }}><Mail size={11} /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</span></div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: SCRIPT, fontSize: 17, color: C.jam }}>{eur(c.spent || 0)}</div>
                <div style={{ fontSize: 11, color: C.soft }}>{c.orders || 0} cmd</div>
              </div>
              <ChevronRight size={16} color={C.soft} style={{ flexShrink: 0 }} />
            </button>
          ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px 0" }}>
        <span style={{ fontSize: 12, color: C.soft }}>{filtered.length} client{filtered.length > 1 ? "s" : ""}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => setPage(Math.max(0, pg - 1))} disabled={pg === 0} className="ca-tap" style={arrowBtn(pg === 0)}><ChevronLeft size={16} /></button>
          <span style={{ fontSize: 12, color: C.ink, minWidth: 54, textAlign: "center" }}>{pg + 1} / {pages}</span>
          <button onClick={() => setPage(Math.min(pages - 1, pg + 1))} disabled={pg >= pages - 1} className="ca-tap" style={arrowBtn(pg >= pages - 1)}><ChevronRight size={16} /></button>
        </div>
      </div>
      {selClient && (
        <div style={{ ...card(), marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: C.board, color: C.chalk, display: "grid", placeItems: "center", fontFamily: SCRIPT, fontSize: 15, flexShrink: 0 }}>{(selClient.prenom[0] || "")}{(selClient.nom[0] || "")}</div>
              <div style={{ minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{selClient.prenom} {selClient.nom}</div><div style={{ fontSize: 12, color: C.soft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selClient.email} · {selClient.tel}</div></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <button onClick={() => move(-1)} disabled={selIdx <= 0} className="ca-tap" style={arrowBtn(selIdx <= 0)}><ChevronLeft size={16} /></button>
              <span style={{ fontSize: 11, color: C.soft }}>{selIdx + 1}/{filtered.length}</span>
              <button onClick={() => move(1)} disabled={selIdx >= filtered.length - 1} className="ca-tap" style={arrowBtn(selIdx >= filtered.length - 1)}><ChevronRight size={16} /></button>
            </div>
          </div>
          <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: C.caramel, fontWeight: 700, margin: "6px 0 8px" }}>Commandes de ce client</div>
          {ordersOf(selClient.email).length === 0 ? (
            <div style={{ fontSize: 13, color: C.soft }}>Aucune commande enregistrée.</div>
          ) : ordersOf(selClient.email).map((o) => (
            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "7px 0", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ color: C.ink }}>{o.id} <span style={{ color: C.soft }}>· {o.date}{o.pickup ? " · retrait " + o.pickup : ""}</span></span>
              <span style={{ fontWeight: 700, color: C.jam }}>{eur(o.total)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function ProMail({ clients }) {
  const [aud, setAud] = useState("optin");
  const [chan, setChan] = useState("email");
  const [obj, setObj] = useState("");
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const filt = (c) => aud === "tous" ? true : aud === "optin" ? c.optin : aud === "acheteurs" ? (c.orders > 0) : (c.orders === 0);
  const recipients = clients.filter(filt);
  const withEmail = recipients.filter((c) => c.email);
  const withTel = recipients.filter((c) => c.tel);

  const templates = [
    ["Nouveauté", "Nouveauté au stand", "Bonjour {prenom},\nGrande nouvelle cette semaine au marché : … Au plaisir de vous y retrouver !\nComme Avant"],
    ["Offre", "Offre de la semaine", "Bonjour {prenom},\nCette semaine seulement : … Pensez à réserver. À très vite au marché !\nComme Avant"],
    ["Rappel marché", "On vous attend au marché", "Bonjour {prenom},\nNous sommes au marché ce week-end (samedi & dimanche). Vos confitures et gourmandises vous attendent !\nComme Avant"],
  ];

  const bccLink = `mailto:?bcc=${encodeURIComponent(withEmail.map((c) => c.email).join(","))}&subject=${encodeURIComponent(obj)}&body=${encodeURIComponent(msg)}`;
  const waLink = (c) => `https://wa.me/${(c.tel || "").replace(/\D/g, "").replace(/^0/, "33")}?text=${encodeURIComponent(msg.replace(/\{prenom\}/g, c.prenom || ""))}`;
  const copyMsg = () => { copyText(msg); setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const exportList = () => downloadCSV(`diffusion-${aud}.csv`, ["Prénom", "Nom", "Téléphone", "Email", "Consentement"], recipients.map((c) => [c.prenom, c.nom, c.tel || "", c.email || "", c.optin ? "oui" : "non"]));

  const AUDS = [["optin", "Consentement"], ["tous", "Tous"], ["acheteurs", "Ont commandé"], ["prospects", "Prospects"]];
  const canEmail = withEmail.length && obj;
  return (
    <div className="ca-anim">
      <ProHead title="Publimail" sub="Offres & nouveautés — envoi groupé email / WhatsApp" />
      <div style={card()}>
        <MiniLabel>Destinataires</MiniLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "6px 0 6px" }}>
          {AUDS.map(([k, l]) => (<button key={k} onClick={() => setAud(k)} className="ca-tap" style={{ border: `1.5px solid ${aud === k ? C.jam : C.line}`, background: aud === k ? "#7A2B330d" : C.cream, borderRadius: 10, padding: "8px 12px", fontWeight: 600, fontSize: 12.5, cursor: "pointer", color: C.ink }}>{l}</button>))}
        </div>
        <div style={{ fontSize: 12, color: C.soft, marginBottom: 14 }}>{recipients.length} contact{recipients.length > 1 ? "s" : ""} · {withEmail.length} email · {withTel.length} tél{aud !== "optin" && <span style={{ color: C.caramel }}> · pensez au consentement (RGPD)</span>}</div>

        <MiniLabel>Modèles</MiniLabel>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "6px 0 14px" }}>
          {templates.map(([t, subj, body]) => <button key={t} onClick={() => { setObj(subj); setMsg(body); }} className="ca-tap" style={{ border: `1px solid ${C.line}`, background: C.cream, borderRadius: 20, padding: "6px 12px", fontSize: 12, cursor: "pointer", color: C.ink }}>{t}</button>)}
        </div>

        <MiniLabel>Objet (email)</MiniLabel>
        <input value={obj} onChange={(e) => setObj(e.target.value)} placeholder="Les confitures de mûre sont arrivées" style={{ ...inp(), margin: "6px 0 12px" }} />
        <MiniLabel>Message</MiniLabel>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} placeholder="Bonjour {prenom}, cette semaine au marché…" style={{ ...inp(), margin: "6px 0 6px", resize: "vertical", lineHeight: 1.5 }} />
        <div style={{ fontSize: 11.5, color: C.soft, marginBottom: 14 }}>Astuce : <b>{"{prenom}"}</b> est remplacé par le prénom du client dans les messages WhatsApp.</div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[["email", "Email groupé", Mail], ["whatsapp", "WhatsApp", MessageCircle]].map(([k, l, Ic]) => (<button key={k} onClick={() => setChan(k)} className="ca-tap" style={{ flex: 1, border: `1.5px solid ${chan === k ? C.jam : C.line}`, background: chan === k ? "#7A2B330d" : C.cream, borderRadius: 10, padding: "10px", fontWeight: 600, fontSize: 12.5, cursor: "pointer", color: C.ink, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}><Ic size={15} /> {l}</button>))}
        </div>

        {chan === "email" ? (
          <a href={bccLink} className="ca-tap" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", background: canEmail ? C.jam : C.line, color: "#fff", borderRadius: 12, padding: "13px", fontWeight: 600, fontSize: 13.5, textDecoration: "none", pointerEvents: canEmail ? "auto" : "none", boxSizing: "border-box" }}><Mail size={16} /> Ouvrir l'email vers {withEmail.length} contact{withEmail.length > 1 ? "s" : ""}</a>
        ) : (
          <div>
            <button onClick={copyMsg} className="ca-tap" style={{ width: "100%", marginBottom: 10, border: `1.5px solid ${C.line}`, background: "transparent", color: C.jam, borderRadius: 12, padding: "11px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{copied ? <><Check size={15} /> Message copié</> : <><Copy size={15} /> Copier le message</>}</button>
            <div style={{ fontSize: 11.5, color: C.soft, marginBottom: 8, lineHeight: 1.4 }}>WhatsApp n'autorise pas l'envoi en masse par lien : ouvrez chaque conversation (message pré-rempli) ou créez une <b>Liste de diffusion</b> dans WhatsApp et collez le message.</div>
            <div style={{ display: "grid", gap: 6, maxHeight: 220, overflowY: "auto" }}>
              {withTel.length === 0 ? <div style={{ fontSize: 13, color: C.soft }}>Aucun contact avec téléphone.</div> : withTel.map((c) => (
                <a key={c.email || c.tel} href={msg ? waLink(c) : undefined} target="_blank" rel="noreferrer" className="ca-tap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, border: `1px solid ${C.line}`, background: C.cream, borderRadius: 10, padding: "9px 12px", textDecoration: "none", color: C.ink, pointerEvents: msg ? "auto" : "none", opacity: msg ? 1 : .5 }}>
                  <span style={{ minWidth: 0 }}><b style={{ fontSize: 13 }}>{c.prenom} {c.nom}</b><span style={{ display: "block", fontSize: 11.5, color: C.soft }}>{c.tel}</span></span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#1FA855", fontWeight: 600, fontSize: 12, flexShrink: 0 }}><MessageCircle size={14} /> Envoyer</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <button onClick={exportList} disabled={!recipients.length} className="ca-tap" style={{ width: "100%", marginTop: 14, border: `1px solid ${C.line}`, background: "transparent", color: C.soft, borderRadius: 11, padding: "10px", fontWeight: 600, fontSize: 12.5, cursor: recipients.length ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}><Send size={14} /> Exporter la liste (CSV)</button>
      </div>
    </div>
  );
}
function ProPromos({ promos, setPromos }) {
  const [code, setCode] = useState(""); const [pct, setPct] = useState("");
  const addPromo = () => { if (!code || !pct) return; setPromos((l) => [{ code: code.toUpperCase(), pct: +pct, active: true }, ...l]); setCode(""); setPct(""); };
  return (
    <div className="ca-anim">
      <ProHead title="Codes promo" sub="Créez des réductions pour fidéliser" />
      <div style={{ ...card(), display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 10, alignItems: "end", background: C.paper }}>
        <div><MiniLabel>Code</MiniLabel><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="MARCHE" style={inp()} /></div>
        <div><MiniLabel>Remise %</MiniLabel><input type="number" value={pct} onChange={(e) => setPct(e.target.value)} placeholder="10" style={inp()} /></div>
        <button onClick={addPromo} className="ca-tap" style={{ background: C.jam, color: "#fff", border: "none", borderRadius: 10, padding: "11px 14px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Créer</button>
      </div>
      {promos.map((p) => (
        <div key={p.code} style={{ ...card(), display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}><Tag size={17} color={C.caramel} /><div><div style={{ fontFamily: SCRIPT, fontSize: 16, color: C.jam }}>{p.code}</div><div style={{ fontSize: 12, color: C.soft }}>−{p.pct}% sur le panier</div></div></div>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.ok, background: "#3F7A4B14", padding: "5px 11px", borderRadius: 8 }}>actif</span>
        </div>
      ))}
    </div>
  );
}
function ProSettings({ paymentEnabled, setPaymentEnabled, pass }) {
  const [pm, setPm] = useState({ wero: true, cb: true, especes: true, cheque: false, virement: false });
  const [bk, setBk] = useState({ busy: false, msg: "" });
  const [imp, setImp] = useState({ busy: false, msg: "" });
  const fileRef = useRef(null);
  const onImportFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file || !supabase || !pass || imp.busy) return;
    setImp({ busy: true, msg: "Lecture du fichier…" });
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const ws = wb.Sheets["Produits"];
      if (!ws) { setImp({ busy: false, msg: "Onglet « Produits » introuvable dans ce fichier." }); return; }
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const num = (v) => { if (v === "" || v == null) return 0; const n = parseFloat(String(v).replace(",", ".").replace(/[^0-9.\-]/g, "")); return isNaN(n) ? 0 : n; };
      const slug = (s) => ((s || "prod").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "prod");
      let ok = 0, skip = 0;
      for (const row of rows) {
        const name = String(row["Produit"] || "").trim();
        if (!name) { skip++; continue; }
        let id = String(row["ID (ne pas modifier)"] || row["ID"] || "").trim();
        if (!id) id = slug(name) + "-" + Date.now().toString(36).slice(-4) + Math.floor(Math.random() * 100);
        const actifRaw = String(row["Actif (oui/non)"] ?? row["Actif"] ?? "oui").trim().toLowerCase();
        const active = !(actifRaw === "non" || actifRaw === "no" || actifRaw === "false" || actifRaw === "0");
        try {
          await supabase.rpc("admin_import_product", { pass, p_id: id, p_name: name, p_cat: String(row["Catégorie"] || "").trim() || "Confitures", p_unit: String(row["Unité"] || "").trim(), p_price: num(row["Prix de vente (€)"]), p_cost: num(row["Prix d'achat (€)"]), p_coef: num(row["Coefficient"]), p_stock: Math.round(num(row["Stock"])), p_active: active });
          ok++;
        } catch (err) { skip++; }
      }
      setImp({ busy: false, msg: `Import terminé : ${ok} produit(s) mis à jour${skip ? `, ${skip} ligne(s) ignorée(s)` : ""}.` });
    } catch (e2) {
      setImp({ busy: false, msg: "Fichier illisible — utilisez le classeur de sauvegarde (.xlsx)." });
    }
  };

  const [rst, setRst] = useState({ busy: false, msg: "" });
  const restoreRef = useRef(null);
  const onRestoreFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file || !supabase || !pass || rst.busy) return;
    if (!window.confirm("Restaurer va réinjecter les données de ce fichier dans la base. À faire de préférence sur une base vide (sinon des doublons peuvent apparaître). Continuer ?")) return;
    setRst({ busy: true, msg: "Restauration en cours…" });
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      const J = (name) => { const ws = wb.Sheets[name]; return ws ? XLSX.utils.sheet_to_json(ws, { defval: "" }) : []; };
      const num = (v) => { if (v === "" || v == null) return 0; const n = parseFloat(String(v).replace(",", ".").replace(/[^0-9.\-]/g, "")); return isNaN(n) ? 0 : n; };
      const iso = (v) => { if (!v) return null; if (v instanceof Date) return v.toISOString(); const d = new Date(v); return isNaN(d.getTime()) ? null : d.toISOString(); };
      const cnt = { clients: 0, produits: 0, commandes: 0, ventes: 0, avis: 0, promos: 0 };

      for (const r of J("Produits")) {
        const name = String(r["Produit"] || "").trim(); if (!name) continue;
        let id = String(r["ID (ne pas modifier)"] || r["ID"] || "").trim();
        if (!id) id = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) + "-" + Date.now().toString(36).slice(-4);
        const actif = String(r["Actif (oui/non)"] ?? r["Actif"] ?? "oui").trim().toLowerCase();
        try { await supabase.rpc("admin_import_product", { pass, p_id: id, p_name: name, p_cat: String(r["Catégorie"] || "").trim() || "Confitures", p_unit: String(r["Unité"] || "").trim(), p_price: num(r["Prix de vente (€)"]), p_cost: num(r["Prix d'achat (€)"]), p_coef: num(r["Coefficient"]), p_stock: Math.round(num(r["Stock"])), p_active: !(actif === "non") }); cnt.produits++; } catch (er) {}
      }
      for (const r of J("Clients")) {
        const email = String(r["Email"] || "").trim(), nom = String(r["Nom"] || "").trim(), pre = String(r["Prénom"] || "").trim();
        if (!email && !nom && !pre) continue;
        try { await supabase.rpc("admin_restore_customer", { pass, p_prenom: pre, p_nom: nom, p_tel: String(r["Téléphone"] || "").trim(), p_email: email, p_opt_in: String(r["Newsletter"] || "").trim().toLowerCase() === "oui" }); cnt.clients++; } catch (er) {}
      }
      const artByRef = {};
      for (const r of J("Commandes_articles")) { const ref = String(r["Référence"] || "").trim(); if (!ref) continue; (artByRef[ref] = artByRef[ref] || []).push({ name: String(r["Article"] || ""), unit: String(r["Unité"] || ""), qty: num(r["Quantité"]), price: num(r["Prix unitaire (€)"]) }); }
      for (const r of J("Commandes")) {
        const nom = String(r["Client"] || "").trim(); if (!nom) continue;
        const items = artByRef[String(r["Référence"] || "").trim()] || [];
        try { await supabase.rpc("admin_restore_order", { pass, p_name: nom, p_email: String(r["Email"] || "").trim(), p_tel: String(r["Téléphone"] || "").trim(), p_items_count: Math.round(num(r["Nb articles"])), p_total: num(r["Total (€)"]), p_status: String(r["Statut"] || "").trim(), p_paid: String(r["Payé"] || "").trim().toLowerCase() === "oui", p_pickup: String(r["Retrait / Lieu"] || "").trim(), p_parrain: String(r["Parrain"] || "").trim(), p_created_at: iso(r["Date ISO (ne pas modifier)"] || r["Date"]), p_items: items }); cnt.commandes++; } catch (er) {}
      }
      const vaById = {};
      for (const r of J("Ventes_articles")) { const sid = String(r["ID vente"] || "").trim(); (vaById[sid] = vaById[sid] || []).push({ name: String(r["Article"] || ""), qty: num(r["Quantité"]), price: num(r["Prix unitaire (€)"]) }); }
      for (const r of J("Ventes_caisse")) {
        const sid = String(r["ID vente"] || "").trim();
        let items = vaById[sid];
        if (!items || !items.length) items = String(r["Détail"] || "").split(",").map((s) => s.trim()).filter(Boolean).map((s) => { const m = s.match(/^(\d+)\s*[x×]\s*(.+)$/i); return m ? { name: m[2].trim(), qty: num(m[1]), price: 0 } : null; }).filter(Boolean);
        const total = num(r["Total (€)"]); if (!total && (!items || !items.length)) continue;
        try { await supabase.rpc("admin_restore_sale", { pass, p_ts: iso(r["Date ISO (ne pas modifier)"] || r["Date"]), p_count: Math.round(num(r["Nb articles"])), p_total: total, p_items: items }); cnt.ventes++; } catch (er) {}
      }
      for (const r of J("Avis")) { const pre = String(r["Prénom"] || "").trim(), com = String(r["Commentaire"] || "").trim(); if (!pre && !com) continue; try { await supabase.rpc("admin_restore_review", { pass, p_prenom: pre, p_rating: Math.round(num(r["Note (/5)"])) || 5, p_comment: com, p_created_at: iso(r["Date"]) }); cnt.avis++; } catch (er) {} }
      for (const r of J("Promos")) { const code = String(r["Code"] || "").trim(); if (!code) continue; try { await supabase.rpc("admin_restore_promo", { pass, p_code: code, p_pct: num(r["Réduction (%)"]), p_active: String(r["Actif"] || "").trim().toLowerCase() !== "non" }); cnt.promos++; } catch (er) {} }
      const par = {}; for (const r of J("Paramètres")) par[String(r["Champ"] || "").trim()] = r["Valeur"];
      if (Object.keys(par).length) { try { await supabase.rpc("admin_restore_profile", { pass, p_name: String(par["Nom"] || ""), p_tagline: String(par["Slogan"] || ""), p_tel: String(par["Téléphone"] || ""), p_wa: String(par["WhatsApp"] || ""), p_email: String(par["Email"] || ""), p_site: String(par["Site"] || ""), p_atitle: String(par["Annonce — titre"] || ""), p_abody: String(par["Annonce — texte"] || "") }); } catch (er) {} }

      setRst({ busy: false, msg: `Restauration terminée : ${cnt.clients} clients, ${cnt.produits} produits, ${cnt.commandes} commandes, ${cnt.ventes} ventes, ${cnt.avis} avis, ${cnt.promos} promos. Actualisez les écrans.` });
    } catch (e3) {
      setRst({ busy: false, msg: "Fichier illisible — utilisez un classeur de sauvegarde complet (.xlsx)." });
    }
  };
  const exportExcel = async () => {
    if (!supabase || !pass || bk.busy) return;
    setBk({ busy: true, msg: "Préparation de la sauvegarde…" });
    try {
      const XLSX = await import("xlsx");
      const [rc, ro, rs, rp, rv, rpr, rpm] = await Promise.all([
        supabase.rpc("admin_customers", { pass }),
        supabase.rpc("admin_orders", { pass }),
        supabase.rpc("admin_sales", { pass }),
        supabase.from("products").select("*").order("cat", { ascending: true }).order("name", { ascending: true }),
        supabase.from("reviews").select("created_at, prenom, rating, comment").order("created_at", { ascending: false }),
        supabase.from("profile").select("*").limit(1),
        supabase.from("promos").select("*"),
      ]);
      const clients = Array.isArray(rc.data) ? rc.data : [];
      const orders = Array.isArray(ro.data) ? ro.data : [];
      const sales = Array.isArray(rs.data) ? rs.data : [];
      const prods = Array.isArray(rp.data) ? rp.data : [];
      const avis = Array.isArray(rv.data) ? rv.data : [];
      const prof = (Array.isArray(rpr.data) && rpr.data[0]) || {};
      const promos = Array.isArray(rpm.data) ? rpm.data : [];
      orders.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
      sales.sort((a, b) => String(b.ts || "").localeCompare(String(a.ts || "")));
      const LIEU = "Marché de Grasse";
      const n2 = (x) => Math.round((Number(x) || 0) * 100) / 100;
      const dfr = (d) => d ? new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
      const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
      const dcols = (iso) => {
        if (!iso) return { date: "", jour: "", heure: "", sem: "", mois: "", an: "" };
        const d = new Date(iso);
        const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const day = (t.getUTCDay() + 6) % 7; t.setUTCDate(t.getUTCDate() - day + 3);
        const firstThu = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
        const week = 1 + Math.round(((t - firstThu) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
        return { date: d, jour: JOURS[d.getDay()], heure: d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), sem: t.getUTCFullYear() + "-S" + String(week).padStart(2, "0"), mois: d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"), an: d.getFullYear() };
      };
      const wb = XLSX.utils.book_new();
      const sheet = (name, headers, rows, cols, dateCols, moneyCols) => {
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows], { cellDates: true });
        if (cols) ws["!cols"] = cols.map((w) => ({ wch: w }));
        const nR = rows.length + 1;
        (dateCols || []).forEach((ci) => { for (let r = 2; r <= nR; r++) { const ref = XLSX.utils.encode_cell({ r: r - 1, c: ci - 1 }); if (ws[ref] && ws[ref].v != null && ws[ref].v !== "") ws[ref].z = "dd/mm/yyyy"; } });
        (moneyCols || []).forEach((ci) => { for (let r = 2; r <= nR; r++) { const ref = XLSX.utils.encode_cell({ r: r - 1, c: ci - 1 }); if (ws[ref] && typeof ws[ref].v === "number") ws[ref].z = "0.00"; } });
        ws["!autofilter"] = { ref: `A1:${XLSX.utils.encode_col(headers.length - 1)}${Math.max(2, nR)}` };
        XLSX.utils.book_append_sheet(wb, ws, name);
        return ws;
      };

      const info = XLSX.utils.aoa_to_sheet([
        ["COMME AVANT — Sauvegarde complète des données"],
        ["Export réalisé le", dfr(new Date())],
        [],
        ["Onglet", "Contenu"],
        ["Produits", "Prix d'achat, coefficient, prix de vente, marges (calculées). Modifiable → réimport dans l'app."],
        ["Ventes_caisse", "Une ligne par vente (Date, Jour, Semaine, Mois, Année, Lieu, total)."],
        ["Ventes_articles", "Une ligne par article vendu → pour graphiques : prix, pics de vente, saisonnalité."],
        ["Commandes", "Une ligne par commande (avec Date / Jour / Semaine / Mois / Année)."],
        ["Commandes_articles", "Une ligne par article commandé."],
        ["Clients", "Coordonnées clients (CRM)."],
        ["Avis", "Avis clients."],
        ["Paramètres", "Réglages boutique (profil, annonce)."],
        ["Promos", "Codes promo."],
        ["Synthèse", "Totaux (CA, nb clients…)."],
        [],
        ["Filtrer", "Chaque onglet a des flèches de filtre sur la 1re ligne. Dans Numbers : sélectionner le tableau → Organiser → Filtres."],
        ["Stats / graphiques", "Onglet → Insertion → Tableau croisé dynamique. Ex : somme des Quantités par Article et par Mois (saisonnalité), ou Total par Jour (pics)."],
        ["Modifier les prix", "Onglet Produits : remplir Prix d'achat et Coefficient. Enregistrer, puis Réglages → Importer."],
        ["Confidentialité (RGPD)", "Données personnelles : conserver en lieu sûr, garder plusieurs copies (clé USB, cloud perso)."],
      ]);
      info["!cols"] = [{ wch: 26 }, { wch: 95 }];
      XLSX.utils.book_append_sheet(wb, info, "Lisez-moi");

      {
        const head = ["ID (ne pas modifier)", "Produit", "Catégorie", "Unité", "Prix d'achat (€)", "Coefficient", "Prix de vente (€)", "Marge (€)", "Marge (%)", "Stock", "Actif (oui/non)"];
        const rows = prods.map((p) => [p.id || "", p.name || "", p.cat || "", p.unit || "", n2(Number(p.cost) || 0), Number(p.coef) || 0, n2(Number(p.price) || 0), null, null, p.stock == null ? 0 : p.stock, p.active === false ? "non" : "oui"]);
        const ws = sheet("Produits", head, rows, [22, 24, 16, 22, 16, 12, 17, 12, 10, 7, 14], [], [5, 7]);
        for (let i = 0; i < prods.length; i++) { const r = i + 2; ws["H" + r] = { t: "n", f: `G${r}-E${r}`, z: "0.00" }; ws["I" + r] = { t: "n", f: `IF(G${r}=0,0,(G${r}-E${r})/G${r})`, z: "0.0%" }; }
      }

      sheet("Ventes_caisse",
        ["Date", "Jour", "Heure", "Semaine", "Mois", "Année", "Lieu", "Nb articles", "Total (€)", "Détail", "ID vente", "Date ISO (ne pas modifier)"],
        sales.map((s) => { const c = dcols(s.ts); return [c.date, c.jour, c.heure, c.sem, c.mois, c.an, LIEU, s.count || 0, n2(s.total), (s.items || []).map((i) => `${i.qty}× ${i.name}`).join(", "), s.id || "", s.ts || ""]; }),
        [12, 11, 7, 10, 9, 7, 16, 11, 12, 50, 16, 22], [1], [9]);

      const vaRows = [];
      sales.forEach((s) => { const c = dcols(s.ts); (s.items || []).forEach((it) => { const q = it.qty || 0, pr = n2(it.price); vaRows.push([c.date, c.jour, c.sem, c.mois, c.an, LIEU, it.name || "", q, pr, n2(q * pr), s.id || ""]); }); });
      sheet("Ventes_articles",
        ["Date", "Jour", "Semaine", "Mois", "Année", "Lieu", "Article", "Quantité", "Prix unitaire (€)", "Total ligne (€)", "ID vente"],
        vaRows, [12, 11, 10, 9, 7, 16, 26, 9, 17, 16, 16], [1], [9, 10]);

      sheet("Commandes",
        ["Référence", "Date", "Jour", "Semaine", "Mois", "Année", "Client", "Téléphone", "Email", "Retrait / Lieu", "Nb articles", "Total (€)", "Statut", "Payé", "Parrain", "ID commande", "Date ISO (ne pas modifier)"],
        orders.map((o) => { const c = dcols(o.created_at); return [o.ref || "", c.date, c.jour, c.sem, c.mois, c.an, o.name || "", o.tel || "", o.email || "", o.pickup || LIEU, o.items_count || 0, n2(o.total), o.status || "", o.paid ? "oui" : "non", o.parrain || "", o.id || "", o.created_at || ""]; }),
        [12, 12, 11, 10, 9, 7, 18, 15, 26, 18, 10, 12, 12, 7, 20, 24, 22], [2], [12]);

      const caRows = [];
      orders.forEach((o) => { const c = dcols(o.created_at); (o.items || []).forEach((it) => { const q = it.qty || 0, pr = n2(it.price); caRows.push([o.ref || "", c.date, c.sem, c.mois, c.an, o.name || "", it.name || "", it.unit || "", q, pr, n2(q * pr)]); }); });
      sheet("Commandes_articles",
        ["Référence", "Date", "Semaine", "Mois", "Année", "Client", "Article", "Unité", "Quantité", "Prix unitaire (€)", "Total ligne (€)"],
        caRows, [12, 12, 10, 9, 7, 18, 24, 16, 9, 17, 16], [2], [10, 11]);

      sheet("Clients",
        ["Prénom", "Nom", "Téléphone", "Email", "Newsletter", "Nb commandes", "Total dépensé (€)"],
        clients.map((c) => [c.prenom || "", c.nom || "", c.tel || "", c.email || "", c.opt_in ? "oui" : "non", c.orders || 0, n2(c.spent)]),
        [14, 16, 16, 28, 11, 13, 18], [], [7]);

      sheet("Avis",
        ["Date", "Prénom", "Note (/5)", "Commentaire"],
        avis.map((a) => { const c = dcols(a.created_at); return [c.date, a.prenom || "", a.rating || "", a.comment || ""]; }),
        [12, 14, 10, 55], [1]);

      sheet("Paramètres",
        ["Champ", "Valeur"],
        [["Nom", prof.name || ""], ["Slogan", prof.tagline || ""], ["Téléphone", prof.tel || ""], ["WhatsApp", prof.wa || ""], ["Email", prof.email || ""], ["Site", prof.site || ""], ["Annonce — titre", prof.announce_title || ""], ["Annonce — texte", prof.announce_body || ""]],
        [22, 80]);

      sheet("Promos",
        ["Code", "Réduction (%)", "Actif"],
        promos.map((p) => [p.code || "", p.pct || "", p.active ? "oui" : "non"]),
        [18, 14, 8]);

      const caCmd = orders.reduce((a, o) => a + (Number(o.total) || 0), 0);
      const caCaisse = sales.reduce((a, s) => a + (Number(s.total) || 0), 0);
      sheet("Synthèse",
        ["Indicateur", "Valeur"],
        [["Nombre de clients", clients.length], ["Nombre de commandes", orders.length], ["CA commandes (€)", n2(caCmd)], ["Nombre de ventes caisse", sales.length], ["CA caisse (€)", n2(caCaisse)], ["CA total (€)", n2(caCmd + caCaisse)], ["Nombre de produits", prods.length], ["Nombre d'avis", avis.length], ["Export réalisé le", dfr(new Date())]],
        [26, 22]);

      const now = new Date();
      const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}h${String(now.getMinutes()).padStart(2, "0")}`;
      XLSX.writeFile(wb, `comme-avant-sauvegarde-${stamp}.xlsx`);
      setBk({ busy: false, msg: "Sauvegarde téléchargée ✓" });
    } catch (e) {
      setBk({ busy: false, msg: "Erreur pendant l'export — réessayez." });
    }
  };
  const METHODS = [
    { k: "wero", label: "Wero", desc: "paiement mobile (banques FR)", bg: "linear-gradient(135deg,#E5007D,#7B2FF7)", fg: "#fff", tag: "wero" },
    { k: "cb", label: "Carte bancaire", desc: "au stand (TPE)", bg: "#1A2B4A", fg: "#fff", tag: "CB" },
    { k: "especes", label: "Espèces", desc: "à l'enlèvement", bg: "#3F7A4B", fg: "#fff", tag: "€" },
    { k: "cheque", label: "Chèque", desc: "à l'ordre de l'enseigne", bg: "#B5722B", fg: "#fff", tag: "✓" },
    { k: "virement", label: "Virement", desc: "IBAN sur demande", bg: "#16140F", fg: "#fff", tag: "IBAN" },
  ];
  return (
    <div className="ca-anim">
      <ProHead title="Réglages" sub="Moyens de paiement, QR code et paiement en ligne" />
      <div style={card()}>
        <Section>Moyens de paiement acceptés</Section>
        <div style={{ fontSize: 12.5, color: C.soft, marginBottom: 12, lineHeight: 1.5 }}>Affichés au client au moment de la commande. Activez ceux que vous acceptez.</div>
        {METHODS.map((m) => (
          <div key={m.k} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: `1px solid ${C.line}` }}>
            <span style={{ width: 54, height: 34, borderRadius: 8, background: m.bg, color: m.fg, display: "grid", placeItems: "center", fontWeight: 800, fontSize: m.tag.length > 2 ? 11 : 15, flexShrink: 0 }}>{m.tag}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: C.soft }}>{m.desc}</div>
            </div>
            <Switch on={pm[m.k]} onClick={() => setPm((s) => ({ ...s, [m.k]: !s[m.k] }))} />
          </div>
        ))}
        <div style={{ fontSize: 11, color: C.soft, marginTop: 10, lineHeight: 1.4 }}>Les pastilles sont des repères visuels ; les logos officiels (Wero, CB…) pourront être importés ensuite.</div>
      </div>
      <div style={card()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}><CreditCard size={17} color={C.jam} /> Paiement en ligne</div>
            <div style={{ fontSize: 13, color: C.soft, lineHeight: 1.5, marginTop: 4, maxWidth: 380 }}>{paymentEnabled ? "Actif côté client." : "En veille — les clients réservent et règlent à l'enlèvement."}</div>
          </div>
          <Switch on={paymentEnabled} onClick={() => setPaymentEnabled((v) => !v)} />
        </div>
      </div>
      <div style={{ ...card(), display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 96, height: 96, borderRadius: 14, background: C.board, display: "grid", placeItems: "center", flexShrink: 0 }}><QrCode size={56} color={C.chalk} /></div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>QR code du stand</div>
          <div style={{ fontSize: 13, color: C.soft, lineHeight: 1.5, marginTop: 4 }}>À imprimer et poser sur le stand. Il ouvre votre boutique à l'adresse :</div>
          <div style={{ marginTop: 8, fontFamily: SCRIPT, fontSize: 16, color: C.jam }}>confiture-et-gourmandise.vercel.app</div>
        </div>
      </div>

      <div style={card()}>
        <div style={{ fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}><Download size={17} color={C.jam} /> Sauvegarde Excel</div>
        <div style={{ fontSize: 13, color: C.soft, lineHeight: 1.5, marginTop: 6 }}>Télécharge un classeur Excel complet sur cet appareil : clients, commandes (et détail par article), produits avec prix d'achat / vente / marge, ventes caisse, avis et une synthèse. Une copie qui vous appartient, indépendante du cloud.</div>
        <button onClick={exportExcel} disabled={bk.busy} className="ca-tap" style={{ marginTop: 12, width: "100%", background: bk.busy ? C.soft : C.jam, color: "#fff", border: "none", borderRadius: 13, padding: "14px", fontWeight: 700, fontSize: 15, cursor: bk.busy ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Download size={18} /> {bk.busy ? "Préparation…" : "Télécharger la sauvegarde Excel"}</button>
        {bk.msg && !bk.busy && <div style={{ fontSize: 12.5, color: bk.msg.includes("Erreur") ? C.jam : C.ok, fontWeight: 600, marginTop: 8, textAlign: "center" }}>{bk.msg}</div>}
        <div style={{ fontSize: 11, color: C.soft, marginTop: 10, lineHeight: 1.4 }}>Conseil : faites-le régulièrement (par ex. chaque semaine). Le fichier contient des données personnelles — gardez-le en lieu sûr (RGPD).</div>
      </div>

      <div style={card()}>
        <div style={{ fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}><Package size={17} color={C.jam} /> Importer depuis Excel</div>
        <div style={{ fontSize: 13, color: C.soft, lineHeight: 1.5, marginTop: 6 }}>Modifiez l'onglet <b style={{ color: C.ink }}>Produits</b> de votre sauvegarde (prix d'achat, coefficient, prix de vente, stock…), enregistrez le fichier, puis importez-le ici : les produits sont mis à jour dans la boutique. Illustrations et couleurs conservées.</div>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={onImportFile} style={{ display: "none" }} />
        <button onClick={() => fileRef.current && fileRef.current.click()} disabled={imp.busy} className="ca-tap" style={{ marginTop: 12, width: "100%", background: imp.busy ? C.soft : "#fff", color: C.jam, border: `1.5px solid ${C.jam}`, borderRadius: 13, padding: "13px", fontWeight: 700, fontSize: 15, cursor: imp.busy ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Package size={18} /> {imp.busy ? "Import en cours…" : "Importer un fichier Excel"}</button>
        {imp.msg && !imp.busy && <div style={{ fontSize: 12.5, color: (imp.msg.includes("illisible") || imp.msg.includes("introuvable")) ? C.jam : C.ok, fontWeight: 600, marginTop: 8, textAlign: "center", lineHeight: 1.4 }}>{imp.msg}</div>}
        <div style={{ fontSize: 11, color: C.soft, marginTop: 10, lineHeight: 1.4 }}>Astuce : ne modifiez pas la colonne ID. Pour créer un produit, ajoutez une ligne en laissant l'ID vide.</div>
      </div>

      <div style={{ ...card(), border: `1.5px solid ${C.jam}44` }}>
        <div style={{ fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}><Database size={17} color={C.jam} /> Restaurer depuis un fichier</div>
        <div style={{ fontSize: 13, color: C.soft, lineHeight: 1.5, marginTop: 6 }}>En cas de perte, de piratage ou de transfert : réinjecte tout le contenu d'une sauvegarde Excel (clients, commandes, ventes, produits, avis, promos, paramètres) dans la base. À utiliser de préférence sur une base vide.</div>
        <input ref={restoreRef} type="file" accept=".xlsx,.xls" onChange={onRestoreFile} style={{ display: "none" }} />
        <button onClick={() => restoreRef.current && restoreRef.current.click()} disabled={rst.busy} className="ca-tap" style={{ marginTop: 12, width: "100%", background: rst.busy ? C.soft : "#fff", color: C.jam, border: `1.5px solid ${C.jam}`, borderRadius: 13, padding: "13px", fontWeight: 700, fontSize: 15, cursor: rst.busy ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Database size={18} /> {rst.busy ? "Restauration en cours…" : "Restaurer depuis un fichier Excel"}</button>
        {rst.msg && !rst.busy && <div style={{ fontSize: 12.5, color: rst.msg.includes("illisible") ? C.jam : C.ok, fontWeight: 600, marginTop: 8, textAlign: "center", lineHeight: 1.4 }}>{rst.msg}</div>}
        <div style={{ fontSize: 11, color: C.soft, marginTop: 10, lineHeight: 1.4 }}>Utilise les colonnes techniques (ID, Date ISO) du fichier pour tout remettre fidèlement. Ne pas modifier ces colonnes dans Excel.</div>
      </div>

      <div style={{ ...card(), background: "#FBF6EA" }}>
        <div style={{ fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}><Database size={17} color={C.caramel} /> Connexion Excel « live » (avancé)</div>
        <div style={{ fontSize: 13, color: C.soft, lineHeight: 1.5, marginTop: 6 }}>Pour qu'Excel se branche directement sur la base et s'actualise d'un clic (Données → Obtenir des données → Base de données PostgreSQL). Des tableaux propres sont déjà préparés dans le schéma <b style={{ color: C.ink }}>reporting</b> (clients, commandes, commandes_articles, produits, ventes_caisse, avis).</div>
        <div style={{ fontSize: 12.5, color: C.soft, lineHeight: 1.6, marginTop: 8 }}>Identifiants à récupérer dans Supabase → Project Settings → Database → « Connection string ». Il faut le <b style={{ color: C.ink }}>mot de passe de la base</b> (différent du mot de passe commerçant). C'est l'option technique : le bouton ci-dessus reste le moyen recommandé.</div>
      </div>
    </div>
  );
}

function ProProfile({ profile, setProfile, onLogout, pass }) {
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);
  const set = (k) => (v) => { setDraft((p) => ({ ...p, [k]: v })); setSaved(false); };
  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);
  const save = () => { setProfile(draft); setSaved(true); setTimeout(() => setSaved(false), 2500); };
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annSaved, setAnnSaved] = useState(false);
  const [annBusy, setAnnBusy] = useState(false);
  useEffect(() => {
    if (!supabase) return;
    supabase.from("profile").select("announce_title, announce_body").eq("id", 1).maybeSingle().then(({ data }) => { if (data) { setAnnTitle(data.announce_title || ""); setAnnBody(data.announce_body || ""); } }, () => {});
  }, []);
  const saveAnn = async (clear) => {
    if (!supabase || !pass || annBusy) return;
    setAnnBusy(true);
    try {
      const { error } = await supabase.rpc("admin_set_announce", { pass, title: clear ? "" : annTitle, body: clear ? "" : annBody });
      if (!error) { if (clear) { setAnnTitle(""); setAnnBody(""); } setAnnSaved(true); setTimeout(() => setAnnSaved(false), 2500); }
    } catch (e) {}
    finally { setAnnBusy(false); }
  };
  return (
    <div className="ca-anim" style={{ paddingBottom: 84 }}>
      <ProHead title="Profil de l'enseigne" sub="Vos infos commerce — reprises sur la boutique, la carte contact et les commandes" />
      <div style={card()}>
        <Section>Bandeau d'annonce (boutique)</Section>
        <div style={{ fontSize: 12.5, color: C.soft, marginBottom: 10, lineHeight: 1.45 }}>Message affiché en haut de la boutique. Quand un client le touche, il arrive directement sur la page pour commander.</div>
        <Field label="Titre" value={annTitle} onChange={setAnnTitle} />
        <div style={{ marginBottom: 12 }}><Lbl>Message</Lbl><textarea value={annBody} onChange={(e) => setAnnBody(e.target.value)} rows={2} style={{ ...inp(), resize: "vertical", lineHeight: 1.5, marginTop: 5 }} /></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => saveAnn(false)} disabled={annBusy} className="ca-tap" style={{ flex: 1, background: C.ok, color: "#fff", border: "none", borderRadius: 11, padding: "12px", fontWeight: 700, cursor: annBusy ? "default" : "pointer", fontSize: 13.5 }}>{annBusy ? "…" : annSaved ? "Publié ✓" : "Publier l'annonce"}</button>
          <button onClick={() => saveAnn(true)} disabled={annBusy} className="ca-tap" style={{ border: `1px solid ${C.line}`, background: "transparent", color: C.jam, borderRadius: 11, padding: "12px 14px", fontWeight: 600, cursor: annBusy ? "default" : "pointer", fontSize: 13 }}>Retirer</button>
        </div>
      </div>
      <div style={card()}>
        <Section>Identité</Section>
        <Field label="Nom de l'enseigne" value={draft.name} onChange={set("name")} />
        <Field label="Sous-titre" value={draft.tag} onChange={set("tag")} />
        <div style={{ marginBottom: 12 }}><Lbl>Signature</Lbl><textarea value={draft.tagline} onChange={(e) => set("tagline")(e.target.value)} rows={2} style={{ ...inp(), resize: "vertical", lineHeight: 1.5, marginTop: 5 }} /></div>
      </div>
      <div style={card()}>
        <Section>Contact</Section>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Téléphone" value={draft.tel} onChange={set("tel")} type="tel" />
          <Field label="WhatsApp" value={draft.wa} onChange={set("wa")} type="tel" />
        </div>
        <div style={{ fontSize: 11, color: C.soft, margin: "-4px 0 10px", lineHeight: 1.4 }}>WhatsApp au format international sans « + » ni espaces — ex. 33613545224.</div>
        <Field label="Email" value={draft.email} onChange={set("email")} type="email" />
        <Field label="Site internet" value={draft.site || ""} onChange={set("site")} />
      </div>
      <div style={card()}>
        <Section>Accès commerçant</Section>
        <button onClick={onLogout} className="ca-tap" style={{ marginTop: 2, border: `1px solid ${C.line}`, background: "transparent", color: C.jam, borderRadius: 11, padding: "11px 16px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><Lock size={15} /> Se déconnecter</button>
      </div>
      <div style={{ position: "sticky", bottom: 0, paddingTop: 10, background: `linear-gradient(transparent, ${C.cream} 30%)` }}>
        <button onClick={save} disabled={!dirty} className="ca-tap"
          style={{ width: "100%", background: dirty ? C.ok : C.line, color: dirty ? "#fff" : C.soft, border: "none", borderRadius: 13, padding: "15px 18px", fontWeight: 700, fontSize: 15, cursor: dirty ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
          <Check size={18} /> {saved ? "Modifications enregistrées ✓" : dirty ? "Valider les modifications" : "Aucune modification"}
        </button>
      </div>
    </div>
  );
}

function ProLogin({ pin, onOk }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!code || busy) return;
    setBusy(true); setErr("");
    try {
      if (supabase) {
        const { data, error } = await supabase.rpc("admin_check", { pass: code });
        if (error) throw error;
        if (data === true) { onOk(code); return; }
        setErr("Mot de passe incorrect"); setCode("");
      } else {
        if (code === pin) onOk(code); else { setErr("Mot de passe incorrect"); setCode(""); }
      }
    } catch (e) { setErr("Connexion impossible, réessayez"); }
    finally { setBusy(false); }
  };
  return (
    <div style={{ padding: "56px 24px", display: "grid", placeItems: "center", background: C.cream, minHeight: 620 }}>
      <div style={{ width: "100%", maxWidth: 350, background: C.paper, border: `1px solid ${C.line}`, borderRadius: 18, padding: 28, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: C.board, display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Lock size={26} color={C.chalk} /></div>
        <h2 style={{ fontFamily: SCRIPT, fontSize: 26, margin: "0 0 4px", color: C.jam }}>Espace commerçant</h2>
        <p style={{ fontSize: 13, color: C.soft, lineHeight: 1.5, margin: "0 0 18px" }}>Réservé à l'enseigne. Les clients qui scannent le QR code n'y ont pas accès.</p>
        <input type="password" value={code} onChange={(e) => { setCode(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Mot de passe" style={{ ...inp(), textAlign: "center", letterSpacing: ".12em" }} />
        {err && <div style={{ fontSize: 12.5, color: C.jam, fontWeight: 600, margin: "8px 0 0" }}>{err}</div>}
        <div style={{ marginTop: 12 }}><BigBtn onClick={submit}>{busy ? "Connexion…" : <>Entrer <ChevronRight size={16} /></>}</BigBtn></div>
      </div>
    </div>
  );
}

/* ---------------- Helpers ---------------- */
const card = () => ({ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 11 });
const inp = () => ({ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: C.cream, fontSize: 14, color: C.ink });
const sel = (s) => ({ padding: "8px 10px", borderRadius: 9, border: `1px solid ${C.line}`, background: s === "Livrée" || s === "Retirée" ? "#3F7A4B14" : C.cream, fontSize: 12.5, fontWeight: 600, color: C.ink, cursor: "pointer" });
const backBtn = () => ({ display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "transparent", color: C.soft, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0 });
function Sq({ children, onClick }) { return <button onClick={onClick} className="ca-tap" style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer" }}>{children}</button>; }
function Pill({ children }) { return <span style={{ fontSize: 11.5, fontWeight: 600, color: C.soft, background: C.cream, padding: "6px 10px", borderRadius: 9, flexShrink: 0 }}>{children}</span>; }
function Stars({ value, size = 16, onChange }) {
  return <span style={{ display: "inline-flex", gap: size > 24 ? 8 : 3 }}>{[1, 2, 3, 4, 5].map((n) => (
    <span key={n} onClick={onChange ? () => onChange(n) : undefined} style={{ cursor: onChange ? "pointer" : "default", color: n <= value ? C.jam : "#DDD3C1", fontSize: size, lineHeight: 1, transition: "color .15s" }}>♥</span>
  ))}</span>;
}
function ShareBtn({ cust, label = "Partager Comme Avant" }) {
  const ref = cust?.email ? "?ref=" + encodeURIComponent(cust.email) : "";
  const url = "https://confiture-et-gourmandise.vercel.app/" + ref;
  const msg = `J'ai découvert cette petite fabrique locale, Comme Avant 🍓\nIl faut que tu essayes, c'est trop bon !\nConfitures, gourmandises & produits locaux : ${url}`;
  const share = async () => {
    try { if (navigator.share) { await navigator.share({ title: "Comme Avant", text: msg, url }); return; } } catch (e) { return; }
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };
  return <GhostBtn onClick={share}><Send size={15} /> {label}</GhostBtn>;
}
function Reviews({ setStep, setIntent, reviews, addReview, cust }) {
  const registered = !!(cust && cust.prenom && cust.prenom.trim() && cust.email && /\S+@\S+\.\S+/.test(cust.email));
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const prenom = (cust?.prenom || "").trim();
  const submit = async () => {
    if (!rating || busy) return;
    setBusy(true);
    await addReview({ prenom: prenom || "Client", rating, comment: comment.trim() });
    setBusy(false); setDone(true); setRating(0); setComment("");
  };
  const avg = reviews && reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
  const ReviewList = () => (reviews && reviews.length > 0) ? (
    <div style={{ marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: C.caramel, fontWeight: 700 }}>Ils ont aimé</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.soft }}><Stars value={Math.round(avg)} size={13} /> {avg.toFixed(1)} · {reviews.length} avis</span>
      </div>
      {reviews.slice(0, 20).map((r) => (
        <div key={r.id} style={{ borderTop: `1px solid ${C.line}`, padding: "10px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <b style={{ fontSize: 13.5 }}>{r.prenom || "Client"}</b>
            <Stars value={r.rating} size={13} />
          </div>
          {r.comment && <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.45, marginTop: 3 }}>{r.comment}</div>}
        </div>
      ))}
    </div>
  ) : null;
  return (
    <div className="ca-anim" style={{ padding: "6px 22px 28px" }}>
      <StepHead onBack={() => setStep("welcome")} title="Votre avis" />
      {!registered ? (
        <div style={{ textAlign: "center", padding: "14px 0 4px" }}>
          <div style={{ fontFamily: SCRIPT, fontSize: 22, color: C.jam, marginBottom: 8 }}>Faisons connaissance</div>
          <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.5, margin: "0 0 14px" }}>Pour laisser un avis, créez d'abord votre fiche (prénom et contact). C'est rapide, et ça nous permet de vous reconnaître à chaque visite.</p>
          <BigBtn onClick={() => { if (setIntent) setIntent("lead"); setStep("coords"); }}>M'inscrire <ChevronRight size={16} /></BigBtn>
          <ReviewList />
        </div>
      ) : done ? (
        <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
          <div style={{ fontFamily: SCRIPT, fontSize: 25, color: C.jam, marginBottom: 6 }}>Merci {prenom} !</div>
          <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.5, margin: "0 0 4px" }}>Votre avis nous touche. Découvrez nos <b>saveurs et compositions du moment</b> :</p>
          <div style={{ marginTop: 14 }}><BigBtn onClick={() => setStep("shop")}>Commander nos saveurs du moment <ChevronRight size={16} /></BigBtn></div>
          <button onClick={() => setDone(false)} className="ca-tap" style={{ width: "100%", marginTop: 10, background: "transparent", border: `1.5px solid ${C.line}`, color: C.ink, borderRadius: 13, padding: "11px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Laisser un autre avis</button>
          <div style={{ marginTop: 8 }}><ShareBtn cust={cust} label="Faire découvrir à un proche" /></div>
          <ReviewList />
        </div>
      ) : (
        <>
          <div style={{ textAlign: "center", margin: "6px 0 18px" }}>
            <div style={{ fontFamily: SCRIPT, fontSize: 22, color: C.jam, marginBottom: 12 }}>Votre niveau de plaisir</div>
            <Stars value={rating} size={40} onChange={setRating} />
          </div>
          <div style={{ background: C.cream, border: `1px solid ${C.line}`, borderRadius: 11, padding: "10px 14px", marginBottom: 14, fontSize: 13.5 }}>Avis publié au nom de <b style={{ color: C.jam }}>{prenom}</b></div>
          <Lbl htmlFor="rv_com">Commentaire</Lbl>
          <textarea id="rv_com" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="Un mot sur ce que vous avez aimé…" style={{ ...inp(), resize: "vertical", lineHeight: 1.5, marginBottom: 14 }} />
          <BigBtn onClick={submit} disabled={!rating || busy}>{busy ? "Envoi…" : "Publier mon avis"}</BigBtn>
          <ReviewList />
        </>
      )}
    </div>
  );
}
function ReviewsCarousel({ reviews, setStep, title = "Ils ont aimé" }) {
  const list = reviews || [];
  const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", marginBottom: 10 }}>
        <span style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: C.caramel, fontWeight: 700 }}>{title}</span>
        {list.length > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.soft }}><Stars value={Math.round(avg)} size={13} /> {avg.toFixed(1)} · {list.length}</span>}
      </div>
      <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "0 22px 8px", scrollSnapType: "x mandatory" }}>
        {list.map((r) => (
          <div key={r.id} style={{ flex: "0 0 76%", maxWidth: 280, scrollSnapAlign: "start", background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <b style={{ fontSize: 13.5 }}>{r.prenom || "Client"}</b><Stars value={r.rating} size={13} />
            </div>
            {r.comment && <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.45 }}>{r.comment}</div>}
          </div>
        ))}
        <button onClick={() => setStep("avis")} className="ca-tap" style={{ flex: "0 0 auto", scrollSnapAlign: "start", background: C.board, color: C.chalk, border: "none", borderRadius: 14, padding: "14px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, minWidth: 130 }}>
          <Stars value={5} size={16} /> {list.length ? "Donner mon avis" : "Soyez le premier à donner votre avis"}
        </button>
      </div>
    </div>
  );
}
function BigBtn({ children, onClick, disabled }) { return <button onClick={onClick} disabled={disabled} className="ca-tap" style={{ width: "100%", background: disabled ? C.line : C.board, color: disabled ? C.soft : C.chalk, border: "none", borderRadius: 13, padding: "15px 18px", fontWeight: 600, fontSize: 14, cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{children}</button>; }
function GhostBtn({ children, onClick }) { return <button onClick={onClick} className="ca-tap" style={{ width: "100%", marginTop: 10, background: "transparent", color: C.jam, border: `1.5px solid ${C.line}`, borderRadius: 13, padding: "13px 18px", fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{children}</button>; }
function JamBtn({ children, onClick }) { return <button onClick={onClick} className="ca-tap" style={{ width: "100%", marginTop: 10, background: C.jam, color: "#fff", border: "none", borderRadius: 13, padding: "14px 18px", fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{children}</button>; }
function StepHead({ onBack, title, sub }) {
  return (
    <div style={{ padding: "6px 0 14px" }}>
      <button onClick={onBack} className="ca-tap" style={{ ...backBtn(), marginBottom: 10 }}><ChevronLeft size={16} /> Retour</button>
      <h2 style={{ fontFamily: SCRIPT, fontSize: 24, margin: 0, color: C.jam }}>{title}</h2>
      {sub ? <div style={{ fontSize: 12.5, color: C.soft, marginTop: 2 }}>{sub}</div> : null}
    </div>
  );
}
function ProHead({ title, sub }) { return <div style={{ marginBottom: 18 }}><h2 style={{ fontFamily: SCRIPT, fontSize: 24, margin: 0, color: C.jam }}>{title}</h2><div style={{ fontSize: 13, color: C.soft, marginTop: 3 }}>{sub}</div></div>; }
function Section({ children }) { return <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: C.caramel, fontWeight: 700, marginBottom: 10 }}>{children}</div>; }
function Lbl({ children, htmlFor }) { return <label htmlFor={htmlFor} style={{ display: "block", marginBottom: 4, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 600, color: C.soft }}>{children}</label>; }
function Field({ label, value, onChange, type = "text", ph, autoComplete, name }) {
  const email = type === "email";
  const tel = type === "tel";
  return (
    <div style={{ marginBottom: 12 }}>
      <Lbl htmlFor={name}>{label}</Lbl>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        inputMode={tel ? "tel" : email ? "email" : undefined}
        autoCapitalize={email ? "none" : undefined}
        autoCorrect={email ? "off" : undefined}
        spellCheck={email ? false : undefined}
        style={inp()}
      />
    </div>
  );
}
function MiniLabel({ children }) { return <div style={{ fontSize: 10.5, letterSpacing: ".05em", textTransform: "uppercase", fontWeight: 600, color: C.soft, marginBottom: 4 }}>{children}</div>; }
function Totals({ sub, discount, total }) {
  return (
    <div style={{ background: C.cream, borderRadius: 13, padding: 14, border: `1px solid ${C.line}` }}>
      <Row l="Sous-total" v={eur(sub)} />
      {discount > 0 && <Row l="Remise" v={"−" + eur(discount)} c={C.ok} />}
      <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 8, paddingTop: 8 }}><Row l={<b>Total</b>} v={<span style={{ fontFamily: SCRIPT, fontSize: 18, color: C.jam }}>{eur(total)}</span>} /></div>
    </div>
  );
}
function Row({ l, v, c }) { return <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "3px 0", color: c || C.ink }}><span>{l}</span><span>{v}</span></div>; }
function Switch({ on, onClick }) {
  return <button onClick={onClick} className="ca-tap" style={{ width: 52, height: 30, borderRadius: 30, border: "none", cursor: "pointer", background: on ? C.jam : "#16140f26", position: "relative", flexShrink: 0 }}><span style={{ position: "absolute", top: 3, left: on ? 25 : 3, width: 24, height: 24, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px #0003" }} /></button>;
}

/* ---------------- Conteneurs séparés (1 site, 2 espaces) ---------------- */
const SEED_PROMOS = [{ code: "SAVEURS10", pct: 10, active: true }];
const SEED_PROFILE = { name: "Comme Avant", tag: "Confitures, gourmandises & produits locaux", tagline: "Des goûts et des saveurs d'antan, par amour du goût du vrai.", tel: "06 13 54 52 24", email: "confituresetgourmandise@gmail.com", wa: "33613545224", site: "https://confiture-et-gourmandise.vercel.app", pin: "1234" };

function Header({ profile, badge }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: `1px solid ${C.line}`, background: C.paper }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: C.board, display: "grid", placeItems: "center" }}><Store size={16} color={C.chalk} /></div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: SCRIPT, fontSize: 18, lineHeight: 1, color: C.jam }}>{profile.name}</div>
          <div style={{ fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: C.soft, maxWidth: 240, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.tag}</div>
        </div>
      </div>
      {badge && <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: C.soft }}><Lock size={13} /> {badge}</span>}
    </div>
  );
}

export function BoutiquePublique() {
  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [promos] = useState(SEED_PROMOS);
  const [profile] = useState(SEED_PROFILE);
  const [announce, setAnnounce] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [parrain, setParrain] = useState("");
  useEffect(() => {
    let refCode = "";
    try { const r = new URLSearchParams(window.location.search).get("ref"); if (r) { setParrain(r); refCode = r; } } catch (e) {}
    if (!supabase) return;
    try {
      const key = "ca_visit_" + new Date().toISOString().slice(0, 10);
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        const src = document.referrer ? "web" : "direct";
        supabase.rpc("track_visit", { p_path: window.location.pathname || "/", p_ref: refCode, p_source: src }).then(() => {}, () => {});
      }
    } catch (e) {}
    supabase.from("profile").select("announce_title, announce_body").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data) setAnnounce({ title: data.announce_title || "", body: data.announce_body || "" });
    }, () => {});
    supabase.from("reviews").select("id, prenom, rating, comment, created_at").order("created_at", { ascending: false }).limit(50).then(({ data }) => {
      if (Array.isArray(data)) setReviews(data);
    }, () => {});
    supabase.from("products").select("*").order("sort", { ascending: true }).then(({ data }) => {
      if (Array.isArray(data) && data.length) setProducts(data.map(mapProduct));
    }, () => {});
  }, []);
  const addReview = async (r) => {
    setReviews((l) => [{ id: "tmp" + Date.now(), prenom: r.prenom, rating: r.rating, comment: r.comment, created_at: new Date().toISOString() }, ...l]);
    if (supabase) { try { await supabase.from("reviews").insert({ prenom: r.prenom, rating: r.rating, comment: r.comment }); } catch (e) {} }
  };
  const paymentEnabled = false;
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [step, setStep] = useState("welcome");
  const [intent, setIntent] = useState("order");
  const [cust, setCust] = useState({ prenom: "", nom: "", tel: "", email: "" });
  const [returning, setReturning] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ca_cust");
      if (saved) { const c = JSON.parse(saved); if (c && c.prenom) { setCust(c); setReturning(true); } }
    } catch (e) {}
  }, []);
  const [cart, setCart] = useState({});
  const [mode, setMode] = useState("retrait");
  const [pickupDay, setPickupDay] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [applied, setApplied] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const cartLines = useMemo(() => Object.entries(cart).map(([id, q]) => ({ ...products.find((p) => p.id === id), qty: q })).filter((l) => l.qty > 0), [cart, products]);
  const sub = cartLines.reduce((s, l) => s + l.price * l.qty, 0);
  const discount = applied ? sub * (applied.pct / 100) : 0;
  const total = sub - discount;
  const count = cartLines.reduce((s, l) => s + l.qty, 0);
  const add = (id) => { const p = products.find((x) => x.id === id); setCart((c) => ({ ...c, [id]: Math.min((c[id] || 0) + 1, p.stock) })); };
  const sub1 = (id) => setCart((c) => ({ ...c, [id]: Math.max((c[id] || 0) - 1, 0) }));
  const [placing, setPlacing] = useState(false);
  const upsertClient = async (c) => {
    try { localStorage.setItem("ca_cust", JSON.stringify(c)); } catch (e) {}
    setReturning(true);
    setClients((list) => list.find((x) => x.email === c.email) ? list : [{ email: c.email, prenom: c.prenom, nom: c.nom, tel: c.tel, orders: 0, spent: 0, optin: !!c.optin }, ...list]);
    if (supabase && c.email) {
      try {
        const { error } = await supabase.rpc("save_customer", { p_prenom: c.prenom || "", p_nom: c.nom || "", p_tel: c.tel || "", p_email: c.email, p_opt_in: !!c.optin });
        if (error) { try { localStorage.setItem("ca_cust_pending", JSON.stringify(c)); } catch (e2) {} return false; }
        try { localStorage.removeItem("ca_cust_pending"); } catch (e3) {}
        return true;
      } catch (e) {
        try { localStorage.setItem("ca_cust_pending", JSON.stringify(c)); } catch (e4) {}
        return false;
      }
    }
    return true;
  };
  const custOk = !!(cust.prenom && cust.prenom.trim() && cust.nom && cust.nom.trim() && cust.tel && cust.tel.replace(/\D/g, "").length >= 6 && /\S+@\S+\.\S+/.test(cust.email || ""));
  const placeOrder = async () => {
    if (!custOk) { setStep("coords"); return; }
    if (placing) return;
    const id = "C-" + (1043 + orders.length);
    const o = { id, name: `${cust.prenom} ${cust.nom}`.trim(), email: cust.email, tel: cust.tel, items: count, total, mode: "retrait", pickup: pickupDay, date: "Auj.", status: "À préparer", paid: false, lines: cartLines.map((l) => ({ name: l.name, unit: l.unit, qty: l.qty, price: l.price })) };
    setOrders((l) => [o, ...l]);
    setLastOrder({ ...o, lines: cartLines });
    setPlacing(true);
    if (supabase) {
      const oid = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : (Date.now() + "-" + Math.random().toString(36).slice(2));
      try {
        await supabase.rpc("save_customer", { p_prenom: cust.prenom || "", p_nom: cust.nom || "", p_tel: cust.tel || "", p_email: cust.email, p_opt_in: !!cust.optin });
        const { error } = await supabase.from("orders").insert({ id: oid, name: o.name, email: o.email, tel: o.tel, items_count: count, total, mode: "retrait", pickup: pickupDay, status: "À préparer", paid: false, parrain: parrain || "" });
        if (!error) {
          await supabase.from("order_items").insert(cartLines.map((l) => ({ order_id: oid, product_id: null, product_name: l.name, unit: l.unit, qty: l.qty, unit_price: l.price })));
        } else {
          try { localStorage.setItem("ca_order_pending", JSON.stringify({ o, lines: cartLines, pickupDay, parrain })); } catch (e5) {}
        }
      } catch (e) {
        try { localStorage.setItem("ca_order_pending", JSON.stringify({ o, lines: cartLines, pickupDay, parrain })); } catch (e6) {}
      }
    }
    setPlacing(false);
    setStep("done");
  };
  const resetClient = () => { setStep("welcome"); setIntent("order"); setCart({}); setApplied(null); setPromoInput(""); setCust({ prenom: "", nom: "", tel: "", email: "" }); setMode("retrait"); setPickupDay(""); };
  return (
    <div style={{ fontFamily: SANS, background: C.cream, color: C.ink, minHeight: "100vh" }}>
      <style>{FONT}</style>
      <Announce title={announce?.title} body={announce?.body} onOpen={() => { setIntent("order"); setStep("shop"); }} />
      <Header profile={profile} />
      <ClientView {...{ step, setStep, intent, setIntent, cust, setCust, products, cartLines, cart, add, sub1, sub, discount, total, count, mode, setMode, pickupDay, setPickupDay, promoInput, setPromoInput, applied, setApplied, promos, paymentEnabled, placeOrder, placing, upsertClient, lastOrder, resetClient, profile, returning, reviews, addReview }} />
    </div>
  );
}

const mapProduct = (p) => ({ id: p.id, name: p.name, cat: p.cat, unit: p.unit, price: Number(p.price) || 0, cost: Number(p.cost) || 0, coef: Number(p.coef) || 0, stock: p.stock == null ? 0 : p.stock, illu: p.illu, col: p.col, soon: !!p.soon, active: p.active !== false });
const mapOrderRow = (o) => {
  const d = new Date(o.created_at);
  const sameDay = d.toDateString() === new Date().toDateString();
  const date = sameDay ? "Auj." : d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
  return { id: o.ref, oid: o.id, name: o.name, email: o.email, tel: o.tel, items: o.items_count, total: Number(o.total) || 0, pickup: o.pickup, date, ts: new Date(o.created_at).getTime(), status: o.status, paid: o.paid, parrain: o.parrain || "", lines: (o.items || []).map((i) => ({ name: i.name, unit: i.unit, qty: i.qty, price: Number(i.price) || 0 })) };
};

export function EspacePro() {
  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [orders, setOrders] = useState(SEED_ORDERS);
  const [sales, setSales] = useState(SEED_SALES);
  const [clients, setClients] = useState(SEED_CLIENTS);
  const [promos, setPromos] = useState(SEED_PROMOS);
  const [visits, setVisits] = useState([]);
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [profile, setProfile] = useState(SEED_PROFILE);
  const [proAuth, setProAuth] = useState(false);
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(false);
  const refresh = async (p) => {
    const key = p || pass;
    if (!supabase || !key) return;
    setLoading(true);
    try {
      const [ro, rc, rs, rp, rv] = await Promise.all([
        supabase.rpc("admin_orders", { pass: key }),
        supabase.rpc("admin_customers", { pass: key }),
        supabase.rpc("admin_sales", { pass: key }),
        supabase.from("products").select("*").order("sort", { ascending: true }),
        supabase.rpc("admin_visits", { pass: key }),
      ]);
      if (ro && Array.isArray(ro.data)) setOrders(ro.data.map(mapOrderRow));
      if (rc && Array.isArray(rc.data)) setClients(rc.data.map((c) => ({ email: c.email, prenom: c.prenom, nom: c.nom, tel: c.tel, orders: c.orders, spent: Number(c.spent) || 0, optin: c.opt_in })));
      if (rs && Array.isArray(rs.data)) setSales(rs.data.map((s) => ({ id: s.id, ts: new Date(s.ts).getTime(), total: Number(s.total) || 0, count: s.count, items: (s.items || []).map((i) => ({ name: i.name, qty: i.qty, price: Number(i.price) || 0, cost: Number(i.cost) || 0 })) })));
      if (rp && Array.isArray(rp.data) && rp.data.length) setProducts(rp.data.map(mapProduct));
      if (rv && Array.isArray(rv.data)) setVisits(rv.data.map((v) => ({ ts: new Date(v.ts).getTime(), path: v.path, ref: v.ref, source: v.source })));
    } catch (e) {}
    finally { setLoading(false); }
  };
  const onAuth = (p) => { setPass(p); setProAuth(true); refresh(p); };
  useEffect(() => {
    if (!proAuth || !pass) return;
    const onFocus = () => refresh(pass);
    const onVis = () => { if (!document.hidden) refresh(pass); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    const iv = setInterval(() => { if (!document.hidden) refresh(pass); }, 60000);
    return () => { window.removeEventListener("focus", onFocus); document.removeEventListener("visibilitychange", onVis); clearInterval(iv); };
  }, [proAuth, pass]);
  return (
    <div style={{ fontFamily: SANS, background: C.cream, color: C.ink, minHeight: "100vh" }}>
      <style>{FONT}</style>
      <Header profile={profile} badge="Espace commerçant" />
      {proAuth
        ? <ProView {...{ sales, setSales, orders, setOrders, products, setProducts, clients, promos, setPromos, paymentEnabled, setPaymentEnabled, profile, setProfile, onLogout: () => { setProAuth(false); setPass(null); }, onRefresh: () => refresh(), loading, pass, visits }} />
        : <ProLogin pin={profile.pin} onOk={onAuth} />}
      <InstallBanner admin />
    </div>
  );
}

/* ---------------- Extras : retour client, WhatsApp, install, nouveauté ---------------- */
// Annonce "nouveauté" (modifiable plus tard depuis l'espace pro / Supabase)
const ANNOUNCE = { id: "2026-06-fraise", title: "Nouveauté de saison", body: "Bientôt : confiture de Fraise — édition limitée. Restez à l'affût !" };

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

function WhatsAppBtn({ profile }) {
  const mounted = useMounted();
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const check = () => { const h = new Date().getHours(); setOpen(h >= 9 && h < 18); };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, []);
  if (!mounted) return null;
  if (open) {
    return (
      <a href={`https://wa.me/${profile.wa}?text=${encodeURIComponent("💬 " + profile.name + " — Bonjour ! J'ai une question au sujet de vos confitures et gourmandises.")}`} target="_blank" rel="noreferrer" className="ca-tap"
        style={{ width: "100%", marginTop: 12, background: "#1FA855", color: "#fff", borderRadius: 13, padding: "13px 18px", fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, textDecoration: "none", boxSizing: "border-box" }}>
        <MessageCircle size={16} /> Nous écrire sur WhatsApp
      </a>
    );
  }
  return (
    <div style={{ width: "100%", marginTop: 12, background: C.cream, color: C.soft, border: `1px solid ${C.line}`, borderRadius: 13, padding: "13px 18px", fontWeight: 600, fontSize: 12.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxSizing: "border-box" }}>
      <MessageCircle size={15} /> WhatsApp · disponible de 9h à 18h
    </div>
  );
}

function InstallTip() {
  const mounted = useMounted();
  const [deferred, setDeferred] = useState(null);
  const [ios, setIos] = useState(false);
  const [showIos, setShowIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    try {
      const ua = navigator.userAgent || "";
      const isIos = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua);
      const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
      setIos(isIos);
      setInstalled(standalone);
    } catch (e) {}
    const handler = (e) => { e.preventDefault(); setDeferred(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  if (!mounted || installed) return null;
  const btn = { width: "100%", marginTop: 10, background: "transparent", color: C.soft, border: `1.5px dashed ${C.line}`, borderRadius: 13, padding: "12px 16px", fontWeight: 600, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 };
  if (deferred) {
    return (
      <button className="ca-tap" style={btn} onClick={async () => { deferred.prompt(); try { await deferred.userChoice; } catch (e) {} setDeferred(null); }}>
        <Smartphone size={15} /> Installer l'appli sur mon écran d'accueil
      </button>
    );
  }
  if (ios) {
    return (
      <>
        <button className="ca-tap" style={btn} onClick={() => setShowIos((s) => !s)}>
          <Smartphone size={15} /> Ajouter à l'écran d'accueil
        </button>
        {showIos && (
          <div style={{ marginTop: 8, background: C.cream, border: `1px solid ${C.line}`, borderRadius: 12, padding: "11px 13px", fontSize: 12.5, color: C.ink, lineHeight: 1.5, textAlign: "left" }}>
            Touchez <b>Partager</b> <Send size={12} /> en bas de Safari, puis <b>« Sur l'écran d'accueil »</b>. L'icône Comme Avant apparaîtra comme une appli.
          </div>
        )}
      </>
    );
  }
  return null;
}

function Announce({ title, body, onOpen }) {
  const mounted = useMounted();
  const [show, setShow] = useState(false);
  const t = (title != null && title !== "") ? title : ANNOUNCE.title;
  const b = (body != null && body !== "") ? body : ANNOUNCE.body;
  const key = "ca_seen_" + (t + "|" + b).length + "_" + (t || "").slice(0, 12);
  useEffect(() => { try { if (localStorage.getItem(key) !== "1") setShow(true); else setShow(false); } catch (e) { setShow(true); } }, [key]);
  if (!mounted || !show || (!t && !b)) return null;
  const close = (e) => { if (e) e.stopPropagation(); try { localStorage.setItem(key, "1"); } catch (e2) {} setShow(false); };
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 90, display: "flex", justifyContent: "center", padding: "max(10px, env(safe-area-inset-top)) 12px 0", pointerEvents: "none" }}>
      <div className="ca-anim" onClick={() => { if (onOpen) { onOpen(); setShow(false); } }} role={onOpen ? "button" : undefined} style={{ pointerEvents: "auto", width: "100%", maxWidth: 460, background: C.board, color: C.chalk, borderRadius: 15, padding: "14px 14px 14px 16px", display: "flex", gap: 12, alignItems: "flex-start", boxShadow: "0 16px 34px -14px #16140fcc", cursor: onOpen ? "pointer" : "default" }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: C.jam, display: "grid", placeItems: "center", flexShrink: 0 }}><Sparkles size={20} color={C.chalk} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15.5 }}>{t}</div>
          <div style={{ fontSize: 14, opacity: .9, lineHeight: 1.45, marginTop: 2 }}>{b}</div>
          {onOpen && <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 9, display: "inline-flex", alignItems: "center", gap: 5, background: C.jam, color: "#fff", borderRadius: 20, padding: "5px 12px" }}>Commander <ChevronRight size={14} /></div>}
        </div>
        <button onClick={close} aria-label="Fermer" style={{ background: "transparent", border: "none", color: C.chalk, cursor: "pointer", opacity: .7, padding: 2, lineHeight: 0, flexShrink: 0 }}><X size={18} /></button>
      </div>
    </div>
  );
}

// Bannière d'installation automatique (Android : invite native ; iOS : instructions)
function InstallBanner({ admin = false }) {
  const mounted = useMounted();
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [plat, setPlat] = useState(null);
  const [steps, setSteps] = useState(false);
  const KEY = admin ? "ca_install_dismiss_admin" : "ca_install_dismiss";
  useEffect(() => {
    if ("serviceWorker" in navigator) { navigator.serviceWorker.register("/sw.js").catch(() => {}); }
    let t, t2, gotPrompt = false;
    try {
      const ua = navigator.userAgent || "";
      const isIos = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const isAndroid = /android/i.test(ua);
      const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
      const dismissed = localStorage.getItem(KEY) === "1";
      if (!standalone && !dismissed) {
        if (isIos) { setPlat("ios"); t = setTimeout(() => setShow(true), admin ? 600 : 1400); }
        else if (isAndroid) { setPlat("android"); t2 = setTimeout(() => { if (admin || !gotPrompt) setShow(true); }, admin ? 600 : 3500); }
      }
    } catch (e) {}
    if (!admin) {
      const handler = (e) => { e.preventDefault(); gotPrompt = true; setDeferred(e); try { if (localStorage.getItem(KEY) !== "1") setShow(true); } catch (_) {} };
      window.addEventListener("beforeinstallprompt", handler);
      return () => { window.removeEventListener("beforeinstallprompt", handler); if (t) clearTimeout(t); if (t2) clearTimeout(t2); };
    }
    return () => { if (t) clearTimeout(t); if (t2) clearTimeout(t2); };
  }, []);
  if (!mounted || !show) return null;
  const close = () => { try { localStorage.setItem(KEY, "1"); } catch (e) {} setShow(false); setSteps(false); };
  const install = async () => { try { deferred.prompt(); await deferred.userChoice; } catch (e) {} setDeferred(null); setShow(false); };
  const ShareGlyph = ({ s = 20, c = C.jam }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><path d="M8 7l4-4 4 4" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></svg>
  );
  const title = admin ? "Installer l'Espace Pro" : "Installer l'appli Comme Avant";
  const sub = admin
    ? <>Ajoutez le raccourci <b>Espace Pro</b> à votre écran d'accueil.</>
    : deferred ? <>Accès direct depuis votre écran d'accueil.</>
      : plat === "ios" ? <>Ajoutez la boutique à votre écran d'accueil en 3 étapes.</>
        : <>Menu <b>⋮</b> du navigateur puis <b>« Installer l'application »</b>.</>;
  const iosSteps = [
    <>Touchez l'icône <b>Partager</b> en bas de Safari <span style={{ verticalAlign: "middle", display: "inline-flex" }}><ShareGlyph s={16} /></span> (en haut sur iPad).</>,
    <>Faites défiler et choisissez <b>« Sur l'écran d'accueil »</b>.</>,
    <>Touchez <b>Ajouter</b> — l'icône apparaît sur votre écran d'accueil.</>,
  ];
  const androidSteps = [
    <>Touchez le menu <b>⋮</b> en haut à droite de Chrome.</>,
    <>Choisissez <b>« Ajouter à l'écran d'accueil »</b>.</>,
    <>Touchez <b>Ajouter</b> — le raccourci apparaît sur votre écran.</>,
  ];
  const stepsList = plat === "ios" ? iosSteps : androidSteps;
  const showStepsBtn = admin || plat === "ios";
  return (
    <>
      {steps && (
        <div onClick={() => setSteps(false)} style={{ position: "fixed", inset: 0, zIndex: 80, background: "#16140fcc", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 12px max(12px, env(safe-area-inset-bottom))" }}>
          <div className="ca-anim" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: C.paper, color: C.ink, borderRadius: 20, padding: "20px 18px", boxShadow: "0 24px 60px -16px #000" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontFamily: SCRIPT, fontSize: 22, color: C.jam }}>{admin ? "Raccourci Espace Pro" : "Installer"} · {plat === "ios" ? "iPhone" : "Android"}</div>
              <button onClick={() => setSteps(false)} aria-label="Fermer" style={{ background: "transparent", border: "none", color: C.soft, cursor: "pointer", padding: 2, lineHeight: 0 }}><X size={20} /></button>
            </div>
            {stepsList.map((row, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 26, height: 26, borderRadius: 13, background: C.jam, color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 14, lineHeight: 1.45, paddingTop: 2 }}>{row}</div>
              </div>
            ))}
            <div style={{ fontSize: 12, color: C.soft, lineHeight: 1.45, background: C.cream, borderRadius: 10, padding: "10px 12px", marginTop: 4 }}>
              {plat === "ios"
                ? <>Cette option n'existe que dans <b>Safari</b>. Si vous avez ouvert le lien depuis Instagram, un mail ou Chrome, ouvrez-le d'abord dans Safari (menu <b>···</b> → <b>Ouvrir dans Safari</b>).</>
                : <>{admin ? "Le raccourci ouvrira directement votre Espace Pro." : "Si le menu ne propose pas l'option, ouvrez la page dans Chrome."}</>}
            </div>
          </div>
        </div>
      )}
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 70, display: "flex", justifyContent: "center", padding: "0 12px max(12px, env(safe-area-inset-bottom))", pointerEvents: "none" }}>
        <div className="ca-anim" style={{ pointerEvents: "auto", width: "100%", maxWidth: 460, background: C.paper, color: C.ink, border: `1px solid ${C.line}`, borderRadius: 16, padding: "13px 13px 13px 15px", display: "flex", gap: 12, alignItems: "center", boxShadow: "0 18px 40px -16px #16140f88" }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: admin ? C.board : C.jam, display: "grid", placeItems: "center", flexShrink: 0 }}>{admin ? <Lock size={18} color="#fff" /> : <Smartphone size={20} color="#fff" />}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>{title}</div>
            <div style={{ fontSize: 13, color: C.soft, marginTop: 1, lineHeight: 1.4 }}>{sub}</div>
          </div>
          {(!admin && deferred)
            ? <button onClick={install} className="ca-tap" style={{ background: C.jam, color: "#fff", border: "none", borderRadius: 11, padding: "10px 16px", fontWeight: 700, fontSize: 13.5, cursor: "pointer", flexShrink: 0 }}>Installer</button>
            : showStepsBtn
              ? <button onClick={() => setSteps(true)} className="ca-tap" style={{ background: C.jam, color: "#fff", border: "none", borderRadius: 11, padding: "10px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0 }}>Comment ?</button>
              : <Send size={18} color={C.jam} style={{ flexShrink: 0 }} />}
          <button onClick={close} aria-label="Fermer" style={{ background: "transparent", border: "none", color: C.soft, cursor: "pointer", padding: 2, lineHeight: 0, flexShrink: 0 }}><X size={18} /></button>
        </div>
      </div>
    </>
  );
}

/* ---------------- Ventes — tableau de bord (jour/semaine/mois/année) ---------------- */
function ProVentes({ sales, setSales, orders, products, pass }) {
  const sellable = (products || []).filter((p) => !p.soon && p.active !== false);
  const [per, setPer] = useState("jour");
  const [openDay, setOpenDay] = useState(null);
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);
  const addItem = (p) => setEdit((e) => {
    const idx = e.items.findIndex((i) => i.name === p.name);
    if (idx >= 0) return { ...e, items: e.items.map((i, k) => k === idx ? { ...i, qty: i.qty + 1 } : i) };
    return { ...e, items: [...e.items, { pid: p.id, name: p.name, qty: 1, price: p.price, cost: p.cost || 0 }] };
  });
  const pad = (n) => String(n).padStart(2, "0");
  const isCaisse = (s) => !String(s.id).startsWith("o-");
  const openEdit = (s) => {
    const d = new Date(s.ts);
    setEdit({ id: s.id, items: s.items.map((i) => ({ ...i })), date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` });
  };
  const editTotal = edit ? edit.items.reduce((a, i) => a + i.price * i.qty, 0) : 0;
  const setQty = (k, delta) => setEdit((e) => ({ ...e, items: e.items.map((i, idx) => idx === k ? { ...i, qty: Math.max(0, i.qty + delta) } : i) }));
  const rmLine = (k) => setEdit((e) => ({ ...e, items: e.items.filter((_, idx) => idx !== k) }));
  const saveEdit = async () => {
    if (busy) return;
    setBusy(true);
    const items = edit.items.filter((i) => i.qty > 0);
    const total = items.reduce((a, i) => a + i.price * i.qty, 0);
    const count = items.reduce((a, i) => a + i.qty, 0);
    const ts = new Date(edit.date + "T" + (edit.time || "10:00") + ":00").getTime();
    if (items.length === 0) { await delSale(); return; }
    if (setSales) setSales((list) => list.map((s) => s.id === edit.id ? { ...s, items, total, count, ts } : s));
    if (supabase && pass) { try { await supabase.rpc("admin_update_sale", { pass, p_sid: edit.id, p_items: items, p_total: total, p_count: count, p_ts: new Date(ts).toISOString() }); } catch (e) {} }
    setBusy(false); setEdit(null);
  };
  const delSale = async () => {
    if (setSales) setSales((list) => list.filter((s) => s.id !== edit.id));
    if (supabase && pass) { try { await supabase.rpc("admin_delete_sale", { pass, p_sid: edit.id }); } catch (e) {} }
    setBusy(false); setEdit(null);
  };
  const now = new Date();
  const orderSales = (orders || []).map((o) => ({ id: "o-" + o.id, ts: o.ts || Date.now(), total: o.total, count: o.items, items: (o.lines || []).map((l) => ({ name: l.name, qty: l.qty, price: l.price, cost: 0 })) }));
  const allSales = [...(sales || []), ...orderSales];
  const inPeriod = (ts) => { const d = new Date(ts); if (per === "jour") return d.toDateString() === now.toDateString(); if (per === "semaine") return (now - d) <= 7 * 86400000 && d <= now; if (per === "mois") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); return d.getFullYear() === now.getFullYear(); };
  const list = allSales.filter((s) => inPeriod(s.ts));
  const ca = list.reduce((a, s) => a + s.total, 0);
  const marge = list.reduce((a, s) => a + s.items.reduce((m, i) => m + (i.price - (i.cost || 0)) * i.qty, 0), 0);
  const nb = list.length;
  const panier = nb ? ca / nb : 0;
  const costKnown = list.length > 0 && list.every((s) => s.items.every((i) => i.cost > 0));

  let buckets = [];
  if (per === "jour") { const h = {}; list.forEach((s) => { const k = new Date(s.ts).getHours(); h[k] = (h[k] || 0) + s.total; }); for (let i = 7; i <= 20; i++) buckets.push({ label: i + "h", value: h[i] || 0 }); }
  else if (per === "semaine") { for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(now.getDate() - i); const key = d.toDateString(); const v = list.filter((s) => new Date(s.ts).toDateString() === key).reduce((a, s) => a + s.total, 0); buckets.push({ label: d.toLocaleDateString("fr-FR", { weekday: "narrow" }), value: v }); } }
  else if (per === "mois") { const bd = {}; list.forEach((s) => { const d = new Date(s.ts).getDate(); bd[d] = (bd[d] || 0) + s.total; }); const ds = Object.keys(bd).map(Number).sort((a, b) => a - b); buckets = ds.length ? ds.map((d) => ({ label: String(d), value: bd[d] })) : [{ label: "—", value: 0 }]; }
  else { const M = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]; const bm = Array(12).fill(0); list.forEach((s) => { bm[new Date(s.ts).getMonth()] += s.total; }); buckets = bm.map((v, i) => ({ label: M[i], value: v })); }
  const max = Math.max(1, ...buckets.map((b) => b.value));

  const top = {}; list.forEach((s) => s.items.forEach((i) => { top[i.name] = top[i.name] || { qty: 0, ca: 0 }; top[i.name].qty += i.qty; top[i.name].ca += i.qty * i.price; }));
  const topRows = Object.entries(top).sort((a, b) => b[1].ca - a[1].ca).slice(0, 6);

  const fmtDay = (ts) => new Date(ts).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" });
  const fmtTime = (ts) => new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const dayMap = {};
  [...list].sort((a, b) => b.ts - a.ts).forEach((s) => { const k = new Date(s.ts).toDateString(); (dayMap[k] = dayMap[k] || { ts: s.ts, key: k, label: fmtDay(s.ts), sales: [] }).sales.push(s); });
  const dayList = Object.values(dayMap).sort((a, b) => b.ts - a.ts);
  const saleMargin = (s) => s.items.reduce((m, i) => m + (i.price - (i.cost || 0)) * i.qty, 0);
  const exportCsv = () => {
    const rows = [];
    [...list].sort((a, b) => a.ts - b.ts).forEach((s) => s.items.forEach((i) => {
      rows.push([fmtDay(s.ts), fmtTime(s.ts), s.id, i.name, i.qty, eur(i.price), eur(i.cost || 0), eur((i.price - (i.cost || 0)) * i.qty)]);
    }));
    downloadCSV(`ventes-${per}-${now.toISOString().slice(0, 10)}.csv`, ["Jour", "Heure", "Ticket", "Produit", "Quantité", "Prix vente", "Prix achat", "Marge"], rows);
  };

  const PERIODS = [["jour", "Jour"], ["semaine", "Semaine"], ["mois", "Mois"], ["année", "Année"]];
  const card = { background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 14 };
  const h2 = { fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: C.caramel, fontWeight: 700, marginBottom: 12 };
  const kpi = (label, value, Ic, color) => (
    <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14, padding: "13px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.soft, marginBottom: 4 }}><Ic size={13} /> {label}</div>
      <div style={{ fontFamily: SCRIPT, fontSize: 22, color: color || C.jam, lineHeight: 1.1 }}>{value}</div>
    </div>
  );

  return (
    <div className="ca-anim" style={{ paddingBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div><h2 style={{ fontFamily: SCRIPT, fontSize: 24, margin: 0, color: C.jam }}>Ventes</h2><div style={{ fontSize: 13, color: C.soft, marginTop: 3 }}>Contrôle de gestion · CA, marge, détail & export</div></div>
        <button onClick={exportCsv} disabled={!list.length} className="ca-tap" style={{ background: list.length ? C.board : C.line, color: C.chalk, border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 600, cursor: list.length ? "pointer" : "default", display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, whiteSpace: "nowrap", flexShrink: 0 }}><Send size={14} /> Export CSV</button>
      </div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 14 }}>
        {PERIODS.map(([k, lbl]) => { const s = per === k; return (
          <button key={k} onClick={() => setPer(k)} className="ca-tap" style={{ flexShrink: 0, border: `1px solid ${s ? C.board : C.line}`, background: s ? C.board : C.paper, color: s ? C.chalk : C.ink, borderRadius: 20, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{lbl}</button>
        ); })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {kpi("Chiffre d'affaires", eur(ca), TrendingUp)}
        {kpi("Marge", eur(marge), Percent, C.ok)}
        {kpi("Ventes", String(nb), CreditCard)}
        {kpi("Panier moyen", eur(panier), Wallet)}
      </div>
      {!costKnown && <div style={{ fontSize: 11.5, color: C.soft, background: C.cream, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px", marginBottom: 14, lineHeight: 1.4 }}>La marge se calcule avec les prix d'achat saisis dans l'onglet Produits — complétez-les pour une marge exacte.</div>}
      <div style={card}>
        <div style={h2}>Évolution · {PERIODS.find((p) => p[0] === per)[1].toLowerCase()}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120, paddingTop: 6 }}>
          {buckets.map((b, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, minWidth: 0 }}>
              <div style={{ fontSize: 8.5, color: C.soft, height: 10 }}>{b.value > 0 ? Math.round(b.value) : ""}</div>
              <div style={{ width: "100%", maxWidth: 26, height: Math.round((b.value / max) * 80) || 2, background: b.value ? C.jam : C.line, borderRadius: 4, transition: "height .3s" }} />
              <span style={{ fontSize: 9, color: C.soft, whiteSpace: "nowrap" }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={card}>
        <div style={h2}>Top produits</div>
        {topRows.length === 0 ? <div style={{ fontSize: 13, color: C.soft }}>Aucune vente sur la période.</div> : topRows.map(([name, v]) => (
          <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13.5, padding: "7px 0", borderBottom: `1px solid ${C.line}` }}>
            <span style={{ color: C.ink, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name} <span style={{ color: C.soft }}>×{v.qty}</span></span>
            <span style={{ fontWeight: 700, color: C.jam, flexShrink: 0, marginLeft: 8 }}>{eur(v.ca)}</span>
          </div>
        ))}
      </div>
      <div style={{ ...card, marginBottom: 0 }}>
        <div style={h2}>Détail par jour</div>
        {dayList.length === 0 ? <div style={{ fontSize: 13, color: C.soft }}>Aucune vente sur la période.</div> : dayList.map((d) => {
          const dayCa = d.sales.reduce((a, s) => a + s.total, 0);
          const dayMarge = d.sales.reduce((a, s) => a + saleMargin(s), 0);
          const open = openDay === d.key;
          return (
            <div key={d.key} style={{ borderBottom: `1px solid ${C.line}` }}>
              <button onClick={() => setOpenDay(open ? null : d.key)} className="ca-tap" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "transparent", border: "none", cursor: "pointer", padding: "11px 0", textAlign: "left" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <ChevronDown size={16} color={C.soft} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
                  <span style={{ minWidth: 0 }}><span style={{ fontWeight: 600, fontSize: 13.5, textTransform: "capitalize" }}>{d.label}</span><span style={{ fontSize: 11.5, color: C.soft, marginLeft: 8 }}>{d.sales.length} vente{d.sales.length > 1 ? "s" : ""}</span></span>
                </span>
                <span style={{ textAlign: "right", flexShrink: 0 }}><span style={{ fontFamily: SCRIPT, fontSize: 16, color: C.jam }}>{eur(dayCa)}</span><span style={{ display: "block", fontSize: 10.5, color: C.ok }}>marge {eur(dayMarge)}</span></span>
              </button>
              {open && (
                <div style={{ padding: "0 0 12px 24px" }}>
                  {d.sales.map((s) => (
                    <div key={s.id} style={{ background: C.cream, border: `1px solid ${C.line}`, borderRadius: 11, padding: "10px 12px", marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.soft, marginBottom: 5 }}><span>{fmtTime(s.ts)}</span><span>{s.count} art. · <b style={{ color: C.jam }}>{eur(s.total)}</b></span></div>
                      {s.items.map((i, k) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.ink, padding: "2px 0" }}>
                          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.qty}× {i.name}</span>
                          <span style={{ flexShrink: 0, marginLeft: 8 }}>{eur(i.price * i.qty)}</span>
                        </div>
                      ))}
                      {isCaisse(s)
                        ? <button onClick={() => openEdit(s)} className="ca-tap" style={{ marginTop: 8, border: `1px solid ${C.line}`, background: C.paper, color: C.jam, borderRadius: 9, padding: "7px 12px", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}><Settings size={13} /> Modifier / corriger</button>
                        : <div style={{ marginTop: 6, fontSize: 11, color: C.soft }}>Commande client — à gérer dans l'onglet Commandes</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {edit && (
        <div onClick={() => !busy && setEdit(null)} style={{ position: "fixed", inset: 0, zIndex: 100, background: "#16140fcc", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 12px max(12px, env(safe-area-inset-bottom))" }}>
          <div className="ca-anim" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: C.paper, borderRadius: 20, padding: "18px 16px", maxHeight: "86vh", overflowY: "auto", boxShadow: "0 24px 60px -16px #000" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontFamily: SCRIPT, fontSize: 22, color: C.jam }}>Modifier la vente</div>
              <button onClick={() => !busy && setEdit(null)} aria-label="Fermer" style={{ background: "transparent", border: "none", color: C.soft, cursor: "pointer", padding: 2, lineHeight: 0 }}><X size={20} /></button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1 }}><Lbl>Date</Lbl><input type="date" value={edit.date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setEdit({ ...edit, date: e.target.value })} style={{ ...inp(), marginTop: 4 }} /></div>
              <div style={{ width: 120 }}><Lbl>Heure</Lbl><input type="time" value={edit.time} onChange={(e) => setEdit({ ...edit, time: e.target.value })} style={{ ...inp(), marginTop: 4 }} /></div>
            </div>
            <Lbl>Articles</Lbl>
            <div style={{ marginTop: 6 }}>
              {edit.items.length === 0 ? <div style={{ fontSize: 13, color: C.soft, padding: "8px 0" }}>Plus aucun article — la vente sera supprimée à la validation.</div> : edit.items.map((i, k) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.name}</div>
                    <div style={{ fontSize: 11.5, color: C.soft }}>{eur(i.price)} l'unité · {eur(i.price * i.qty)}</div>
                  </div>
                  <button onClick={() => setQty(k, -1)} className="ca-tap" style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.line}`, background: C.paper, color: C.jam, cursor: "pointer", fontSize: 17, lineHeight: 1 }}>−</button>
                  <span style={{ minWidth: 20, textAlign: "center", fontWeight: 700 }}>{i.qty}</span>
                  <button onClick={() => setQty(k, 1)} className="ca-tap" style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.line}`, background: C.paper, color: C.jam, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>+</button>
                  <button onClick={() => rmLine(k)} aria-label="Retirer" className="ca-tap" style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", color: C.soft, cursor: "pointer", lineHeight: 0 }}><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
            <select value="" onChange={(e) => { const p = sellable.find((x) => x.id === e.target.value); if (p) addItem(p); e.target.value = ""; }} style={{ ...inp(), marginTop: 12, color: C.jam, fontWeight: 600 }}>
              <option value="">+ Ajouter un article…</option>
              {sellable.map((p) => <option key={p.id} value={p.id} style={{ color: C.ink, fontWeight: 400 }}>{p.name} · {p.unit} · {eur(p.price)}</option>)}
            </select>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "14px 0", fontSize: 15 }}>
              <span style={{ color: C.soft }}>Total</span><span style={{ fontFamily: SCRIPT, fontSize: 22, color: C.jam }}>{eur(editTotal)}</span>
            </div>
            <button onClick={saveEdit} disabled={busy} className="ca-tap" style={{ width: "100%", background: C.ok, color: "#fff", border: "none", borderRadius: 13, padding: "14px", fontWeight: 700, fontSize: 15, cursor: busy ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Check size={18} /> {busy ? "…" : "Valider les modifications"}</button>
            <button onClick={delSale} disabled={busy} className="ca-tap" style={{ width: "100%", marginTop: 10, background: "transparent", color: C.jam, border: `1px solid ${C.line}`, borderRadius: 13, padding: "12px", fontWeight: 600, fontSize: 13.5, cursor: busy ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Trash2 size={15} /> Supprimer cette vente</button>
          </div>
        </div>
      )}
    </div>
  );
}
function ProCaisse({ products, sales, setSales, pass, orders, setOrders }) {
  const [ticket, setTicket] = useState(() => {
    try { if (typeof window !== "undefined") { const raw = localStorage.getItem("ca_caisse_ticket"); if (raw) return JSON.parse(raw) || {}; } } catch (e) {}
    return {};
  });
  useEffect(() => { try { localStorage.setItem("ca_caisse_ticket", JSON.stringify(ticket)); } catch (e) {} }, [ticket]);
  const [flash, setFlash] = useState(null);
  const [justClosed, setJustClosed] = useState(false);
  const [cat, setCat] = useState(null);
  const [retro, setRetro] = useState(() => { try { return typeof window !== "undefined" && JSON.parse(localStorage.getItem("ca_caisse_retro") || "{}").retro || false; } catch (e) { return false; } });
  const [saleDate, setSaleDate] = useState(() => { try { return (typeof window !== "undefined" && JSON.parse(localStorage.getItem("ca_caisse_retro") || "{}").saleDate) || ""; } catch (e) { return ""; } });
  const [saleTime, setSaleTime] = useState(() => { try { return (typeof window !== "undefined" && JSON.parse(localStorage.getItem("ca_caisse_retro") || "{}").saleTime) || "10:00"; } catch (e) { return "10:00"; } });
  useEffect(() => { try { localStorage.setItem("ca_caisse_retro", JSON.stringify({ retro, saleDate, saleTime })); } catch (e) {} }, [retro, saleDate, saleTime]);
  const tsFor = () => {
    if (!retro || !saleDate) return Date.now();
    const d = new Date(saleDate + "T" + (saleTime || "10:00") + ":00");
    return isNaN(d.getTime()) ? Date.now() : d.getTime();
  };
  const sellable = products.filter((p) => !p.soon && p.active !== false);
  const cats = CAT_ORDER.filter((c) => sellable.some((p) => p.cat === c));
  const activeCat = cat && cats.includes(cat) ? cat : cats[0];
  const catItems = sellable.filter((p) => p.cat === activeCat);

  const add = (p) => {
    setTicket((t) => ({ ...t, [p.id]: { name: p.name, unit: p.unit, price: p.price, qty: (t[p.id]?.qty || 0) + 1 } }));
    setFlash(p.id); setTimeout(() => setFlash((f) => (f === p.id ? null : f)), 500);
  };
  const dec = (pid) => setTicket((t) => { const cur = t[pid]; if (!cur) return t; const q = cur.qty - 1; const n = { ...t }; if (q <= 0) delete n[pid]; else n[pid] = { ...cur, qty: q }; return n; });
  const removeLine = (pid) => setTicket((t) => { const n = { ...t }; delete n[pid]; return n; });
  const lines = Object.entries(ticket);
  const tCount = lines.reduce((a, [, l]) => a + l.qty, 0);
  const tTotal = lines.reduce((a, [, l]) => a + l.qty * l.price, 0);
  const closeOrder = async () => {
    if (tCount === 0) return;
    const items = lines.map(([pid, l]) => ({ pid, name: l.name, qty: l.qty, price: l.price, cost: (products.find((p) => p.id === pid)?.cost) || 0 }));
    const sid = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : (Date.now() + "-" + Math.random().toString(36).slice(2, 6));
    const ts = tsFor();
    setSales((o) => [{ id: sid, items, total: tTotal, count: tCount, ts }, ...o]);
    setTicket({}); setJustClosed(true); setTimeout(() => setJustClosed(false), 1800);
    if (supabase) { try { await supabase.from("sales").insert({ id: sid, total: tTotal, count: tCount, items, ts: new Date(ts).toISOString() }); } catch (e) {} }
  };
  const cancelOrder = (id) => { setSales((o) => o.filter((x) => x.id !== id)); if (supabase && pass) { try { supabase.rpc("admin_delete_sale", { pass, p_sid: id }); } catch (e) {} } };
  const [edit, setEdit] = useState(null);
  const [ebusy, setEbusy] = useState(false);
  const pad = (n) => String(n).padStart(2, "0");
  const openEdit = (s) => { const d = new Date(s.ts); setEdit({ id: s.id, items: s.items.map((i) => ({ ...i })), date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` }); };
  const eTotal = edit ? edit.items.reduce((a, i) => a + i.price * i.qty, 0) : 0;
  const eQty = (k, d) => setEdit((e) => ({ ...e, items: e.items.map((i, idx) => idx === k ? { ...i, qty: Math.max(0, i.qty + d) } : i) }));
  const eRm = (k) => setEdit((e) => ({ ...e, items: e.items.filter((_, idx) => idx !== k) }));
  const eAdd = (p) => setEdit((e) => { const idx = e.items.findIndex((i) => i.name === p.name); if (idx >= 0) return { ...e, items: e.items.map((i, k) => k === idx ? { ...i, qty: i.qty + 1 } : i) }; return { ...e, items: [...e.items, { pid: p.id, name: p.name, qty: 1, price: p.price, cost: p.cost || 0 }] }; });
  const eSave = async () => {
    if (ebusy) return; setEbusy(true);
    const items = edit.items.filter((i) => i.qty > 0);
    const total = items.reduce((a, i) => a + i.price * i.qty, 0);
    const cnt = items.reduce((a, i) => a + i.qty, 0);
    const ts = new Date(edit.date + "T" + (edit.time || "10:00") + ":00").getTime();
    if (items.length === 0) { setSales((l) => l.filter((x) => x.id !== edit.id)); if (supabase && pass) { try { await supabase.rpc("admin_delete_sale", { pass, p_sid: edit.id }); } catch (e) {} } setEbusy(false); setEdit(null); return; }
    setSales((l) => l.map((x) => x.id === edit.id ? { ...x, items, total, count: cnt, ts } : x));
    if (supabase && pass) { try { await supabase.rpc("admin_update_sale", { pass, p_sid: edit.id, p_items: items, p_total: total, p_count: cnt, p_ts: new Date(ts).toISOString() }); } catch (e) {} }
    setEbusy(false); setEdit(null);
  };

  const validateOrder = (o) => {
    if (setOrders) setOrders((l) => l.map((x) => x.id === o.id ? { ...x, status: "Remise", paid: true } : x));
    if (supabase && pass && o.oid) { try { supabase.rpc("admin_validate_order", { pass, p_oid: o.oid }).then(() => {}, () => {}); } catch (e) {} }
  };
  const pending = (orders || []).filter((o) => o.status !== "Remise");
  const pendingByDate = {};
  pending.forEach((o) => { const k = o.date || "—"; (pendingByDate[k] = pendingByDate[k] || []).push(o); });
  const [oEdit, setOEdit] = useState(null);
  const [obusy, setObusy] = useState(false);
  const oOpen = (o) => setOEdit({ id: o.id, oid: o.oid, name: o.name, items: (o.lines || []).map((l) => ({ ...l })), pickup: o.pickup || "", status: o.status || "À préparer" });
  const oTotal = oEdit ? oEdit.items.reduce((a, i) => a + i.price * i.qty, 0) : 0;
  const oQ = (k, d) => setOEdit((e) => ({ ...e, items: e.items.map((i, idx) => idx === k ? { ...i, qty: Math.max(0, i.qty + d) } : i) }));
  const oRm = (k) => setOEdit((e) => ({ ...e, items: e.items.filter((_, idx) => idx !== k) }));
  const oAdd = (p) => setOEdit((e) => { const idx = e.items.findIndex((i) => i.name === p.name && i.unit === p.unit); if (idx >= 0) return { ...e, items: e.items.map((i, k) => k === idx ? { ...i, qty: i.qty + 1 } : i) }; return { ...e, items: [...e.items, { name: p.name, unit: p.unit, price: p.price, qty: 1 }] }; });
  const oSave = async () => {
    if (obusy) return; setObusy(true);
    const items = oEdit.items.filter((i) => i.qty > 0);
    const total = items.reduce((a, i) => a + i.price * i.qty, 0);
    const count = items.reduce((a, i) => a + i.qty, 0);
    if (setOrders) setOrders((l) => l.map((x) => x.id === oEdit.id ? { ...x, lines: items, total, items: count, pickup: oEdit.pickup } : x));
    if (supabase && pass && oEdit.oid) { try { await supabase.rpc("admin_update_order", { pass, p_oid: oEdit.oid, p_items: items, p_total: total, p_count: count, p_pickup: oEdit.pickup, p_status: oEdit.status }); } catch (e) {} }
    setObusy(false); setOEdit(null);
  };
  const dayKey = (ts) => new Date(ts).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
  const hhmm = (ts) => new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const todayK = dayKey(Date.now());
  const todayOrders = sales.filter((o) => dayKey(o.ts) === todayK);
  const todayTotal = todayOrders.reduce((a, o) => a + o.total, 0);
  const todayItems = todayOrders.reduce((a, o) => a + o.count, 0);

  const byProd = {};
  todayOrders.forEach((o) => o.items.forEach((it) => { byProd[it.name] = byProd[it.name] || { qty: 0, sum: 0 }; byProd[it.name].qty += it.qty; byProd[it.name].sum += it.qty * it.price; }));
  const prodRows = Object.entries(byProd).sort((a, b) => b[1].sum - a[1].sum);

  const byHour = Array(24).fill(0);
  todayOrders.forEach((o) => { byHour[new Date(o.ts).getHours()] += o.total; });
  const maxHour = Math.max(1, ...byHour);
  const hoursActive = byHour.map((v, h) => [h, v]).filter(([h]) => h >= 7 && h <= 20);

  const byDay = {};
  sales.forEach((o) => { const k = dayKey(o.ts); byDay[k] = byDay[k] || { count: 0, sum: 0 }; byDay[k].count++; byDay[k].sum += o.total; });
  const dayRows = Object.entries(byDay);

  const card = { background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 14 };
  const h2 = { fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: C.caramel, fontWeight: 700, marginBottom: 10 };

  return (
    <div className="ca-anim" style={{ paddingBottom: 24 }}>
      <div style={{ fontFamily: SCRIPT, fontSize: 26, color: C.jam, marginBottom: 2 }}>Caisse</div>
      <div style={{ fontSize: 13, color: C.soft, marginBottom: 16 }}>Touchez les produits, puis « Fermer la commande » pour l'enregistrer.</div>

      <div style={{ background: retro ? "#7A2B330D" : C.paper, border: `1px solid ${retro ? C.jam + "66" : C.line}`, borderRadius: 14, padding: "12px 14px", marginBottom: 16 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: C.ink }}>
          <input type="checkbox" checked={retro} onChange={(e) => { setRetro(e.target.checked); if (e.target.checked && !saleDate) setSaleDate(new Date().toISOString().slice(0, 10)); }} style={{ width: 18, height: 18, accentColor: C.jam }} />
          Saisie rétroactive — vente déjà faite un autre jour
        </label>
        {retro && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}><Lbl>Date de la vente</Lbl><input type="date" value={saleDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setSaleDate(e.target.value)} style={{ ...inp(), marginTop: 4 }} /></div>
              <div style={{ width: 120 }}><Lbl>Heure</Lbl><input type="time" value={saleTime} onChange={(e) => setSaleTime(e.target.value)} style={{ ...inp(), marginTop: 4 }} /></div>
            </div>
            <div style={{ fontSize: 12.5, color: C.jam, fontWeight: 700, marginTop: 9, lineHeight: 1.4 }}>{saleDate ? `Cette vente sera enregistrée pour le ${new Date(saleDate + "T" + (saleTime || "10:00")).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" })} à ${saleTime}.` : "Choisissez la date."}</div>
            <div style={{ fontSize: 11.5, color: C.soft, marginTop: 4, lineHeight: 1.4 }}>Ajoutez les produits réellement vendus (pissaladière, caramels…) puis fermez la commande — autant de fois que nécessaire pour ce jour.</div>
          </div>
        )}
      </div>

      <div style={{ background: C.board, color: C.chalk, borderRadius: 16, padding: "16px 18px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", opacity: .65 }}>Aujourd'hui · {todayK}</div>
          <div style={{ fontFamily: SCRIPT, fontSize: 34, color: "#e9c980", lineHeight: 1.1 }}>{eur(todayTotal)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 30, fontWeight: 700 }}>{todayOrders.length}</div>
          <div style={{ fontSize: 11, opacity: .65 }}>commande{todayOrders.length > 1 ? "s" : ""} · {todayItems} art.</div>
        </div>
      </div>

      {pending.length > 0 && (
        <div style={{ ...card, border: `1.5px solid ${C.caramel}66` }}>
          <div style={{ ...h2, color: C.caramel }}>Commandes en cours ({pending.length})</div>
          <div style={{ fontSize: 12, color: C.soft, marginTop: -6, marginBottom: 10 }}>Par date. « Modifier » pour ajouter/retirer un article ; « Valider le retrait » quand le client repart (remise + payée).</div>
          {Object.keys(pendingByDate).map((d) => (
            <div key={d} style={{ marginBottom: 6 }}>
              <div style={{ fontFamily: SCRIPT, fontSize: 16, color: C.jam, textTransform: "capitalize", margin: "6px 0 2px" }}>{d}</div>
              {pendingByDate[d].map((o) => (
                <div key={o.id} style={{ padding: "9px 0", borderBottom: `1px solid ${C.line}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{o.name} <span style={{ color: C.soft, fontWeight: 500 }}>· {o.id}</span></div>
                      <div style={{ fontSize: 12, color: C.soft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.lines && o.lines.length ? o.lines.map((l) => `${l.qty}× ${l.name}`).join(", ") : `${o.items} art.`}</div>
                    </div>
                    <span style={{ fontFamily: SCRIPT, fontSize: 16, color: C.jam, flexShrink: 0 }}>{eur(o.total)}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button onClick={() => oOpen(o)} className="ca-tap" style={{ background: "#fff", border: `1px solid ${C.line}`, color: C.jam, borderRadius: 9, padding: "7px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}><Settings size={13} /> Modifier</button>
                    <button onClick={() => validateOrder(o)} className="ca-tap" style={{ background: C.ok, color: "#fff", border: "none", borderRadius: 9, padding: "7px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}><Check size={14} /> Valider le retrait</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 12, WebkitOverflowScrolling: "touch" }}>
        {cats.map((c) => {
          const sel = c === activeCat;
          return (
            <button key={c} onClick={() => setCat(c)} className="ca-tap" style={{ flexShrink: 0, border: `1px solid ${sel ? C.board : C.line}`, background: sel ? C.board : C.paper, color: sel ? C.chalk : C.ink, borderRadius: 20, padding: "9px 15px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
              {c} <span style={{ opacity: .6, fontSize: 11 }}>{sellable.filter((p) => p.cat === c).length}</span>
            </button>
          );
        })}
      </div>
      <div className="caisse-grid" style={{ marginBottom: 6 }}>
        {catItems.map((p) => (
          <button key={p.id} onClick={() => add(p)} className="ca-tap" style={{ position: "relative", overflow: "hidden", textAlign: "left", cursor: "pointer", border: `1px solid ${ticket[p.id] ? C.jam : C.line}`, borderRadius: 14, padding: "12px 12px 13px", background: C.paper, display: "flex", flexDirection: "column", gap: 6, minHeight: 78 }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ width: 14, height: 14, borderRadius: 5, background: p.col, display: "inline-block" }} />
              {ticket[p.id] && <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: C.jam, borderRadius: 20, minWidth: 20, height: 20, display: "grid", placeItems: "center", padding: "0 6px" }}>{ticket[p.id].qty}</span>}
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, lineHeight: 1.2 }}>{p.name}</span>
            <span style={{ fontSize: 12, color: C.soft }}>{p.unit} · <b style={{ color: C.jam }}>{eur(p.price)}</b></span>
            {flash === p.id && <span style={{ position: "absolute", inset: 0, background: C.ok, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: 700, fontSize: 14 }}><Plus size={18} /> Ajouté</span>}
          </button>
        ))}
      </div>

      {tCount > 0 && (
        <div style={{ ...card, border: `1.5px solid ${C.jam}` }}>
          <div style={{ ...h2, display: "flex", alignItems: "center", justifyContent: "space-between" }}><span>Commande en cours</span><span style={{ fontSize: 11, fontWeight: 600, color: C.ok }}>✓ sauvegardée</span></div>
          {lines.map(([pid, l]) => (
            <div key={pid} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ flex: 1, fontSize: 13.5, color: C.ink, minWidth: 0 }}>{l.name} <span style={{ color: C.soft }}>· {eur(l.price)}</span></span>
              <button onClick={() => dec(pid)} className="ca-tap" style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.line}`, background: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}><Minus size={14} /></button>
              <span style={{ minWidth: 18, textAlign: "center", fontWeight: 700, fontSize: 14 }}>{l.qty}</span>
              <button onClick={() => add({ id: pid, name: l.name, unit: l.unit, price: l.price })} className="ca-tap" style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.line}`, background: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}><Plus size={14} /></button>
              <button onClick={() => removeLine(pid)} className="ca-tap" style={{ marginLeft: 4, background: "#fff", border: `1.5px solid ${C.jam}`, color: C.jam, borderRadius: 8, padding: "5px 8px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><X size={12} /></button>
            </div>
          ))}
          <button onClick={closeOrder} className="ca-tap" style={{ width: "100%", marginTop: 14, background: C.ok, color: "#fff", border: "none", borderRadius: 14, padding: "15px 18px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 10px 24px -12px #16140f88" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 9 }}><Check size={18} /> {retro && saleDate ? `Enregistrer pour le ${new Date(saleDate + "T" + (saleTime || "10:00")).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })} · ${tCount} art.` : `Fermer la commande · ${tCount} art.`}</span>
            <span style={{ fontFamily: SCRIPT, fontSize: 18 }}>{eur(tTotal)}</span>
          </button>
          <button onClick={() => setTicket({})} className="ca-tap" style={{ width: "100%", marginTop: 8, background: "transparent", border: "none", color: C.soft, fontSize: 12.5, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>Vider la commande</button>
        </div>
      )}

      {justClosed && <div style={{ background: "#3F7A4B14", border: "1px solid #3F7A4B33", color: C.ok, borderRadius: 12, padding: "10px 14px", fontWeight: 700, fontSize: 13.5, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><Check size={16} /> Commande enregistrée</div>}

      <div style={card}>
        <div style={h2}>Ventes du jour</div>
        {todayOrders.length === 0 ? (
          <div style={{ fontSize: 13, color: C.soft, padding: "6px 0" }}>Aucune commande fermée aujourd'hui.</div>
        ) : todayOrders.map((o) => (
          <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${C.line}` }}>
            <span style={{ fontSize: 12, color: C.soft, width: 46, flexShrink: 0 }}>{hhmm(o.ts)}</span>
            <span style={{ flex: 1, fontSize: 13.5, color: C.ink, minWidth: 0 }}>{o.count} article{o.count > 1 ? "s" : ""} <span style={{ color: C.soft }}>· {o.items.map((it) => it.name + (it.qty > 1 ? " ×" + it.qty : "")).join(", ")}</span></span>
            <span style={{ fontWeight: 700, color: C.jam, fontSize: 13.5 }}>{eur(o.total)}</span>
            <button onClick={() => openEdit(o)} className="ca-tap" style={{ background: C.paper, border: `1px solid ${C.line}`, color: C.jam, borderRadius: 9, padding: "6px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}><Settings size={13} /> Modifier</button>
            <button onClick={() => cancelOrder(o.id)} className="ca-tap" style={{ background: "#fff", border: `1.5px solid ${C.jam}`, color: C.jam, borderRadius: 9, padding: "6px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}><X size={13} /> Annuler</button>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={h2}>Par produit · aujourd'hui</div>
        {prodRows.length === 0 ? <div style={{ fontSize: 13, color: C.soft }}>—</div> : prodRows.map(([name, v]) => (
          <div key={name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "6px 0", borderBottom: `1px solid ${C.line}` }}>
            <span style={{ color: C.ink }}>{name} <span style={{ color: C.soft }}>× {v.qty}</span></span>
            <span style={{ fontWeight: 700, color: C.jam }}>{eur(v.sum)}</span>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={h2}>Par heure · aujourd'hui</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 90, paddingTop: 6 }}>
          {hoursActive.map(([h, v]) => (
            <div key={h} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", height: Math.round((v / maxHour) * 70) || 2, background: v ? C.jam : C.line, borderRadius: 4 }} />
              <span style={{ fontSize: 9, color: C.soft }}>{h}h</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card, marginBottom: 0 }}>
        <div style={h2}>Historique par jour</div>
        {dayRows.length === 0 ? <div style={{ fontSize: 13, color: C.soft }}>—</div> : dayRows.map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "7px 0", borderBottom: `1px solid ${C.line}` }}>
            <span style={{ color: C.ink, textTransform: "capitalize" }}>{k} <span style={{ color: C.soft }}>· {v.count} cmd</span></span>
            <span style={{ fontWeight: 700, color: C.jam }}>{eur(v.sum)}</span>
          </div>
        ))}
      </div>
      {edit && (
        <div onClick={() => !ebusy && setEdit(null)} style={{ position: "fixed", inset: 0, zIndex: 100, background: "#16140fcc", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 12px max(12px, env(safe-area-inset-bottom))" }}>
          <div className="ca-anim" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: C.paper, borderRadius: 20, padding: "18px 16px", maxHeight: "86vh", overflowY: "auto", boxShadow: "0 24px 60px -16px #000" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontFamily: SCRIPT, fontSize: 22, color: C.jam }}>Modifier la vente</div>
              <button onClick={() => !ebusy && setEdit(null)} aria-label="Fermer" style={{ background: "transparent", border: "none", color: C.soft, cursor: "pointer", padding: 2, lineHeight: 0 }}><X size={20} /></button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1 }}><Lbl>Date</Lbl><input type="date" value={edit.date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setEdit({ ...edit, date: e.target.value })} style={{ ...inp(), marginTop: 4 }} /></div>
              <div style={{ width: 120 }}><Lbl>Heure</Lbl><input type="time" value={edit.time} onChange={(e) => setEdit({ ...edit, time: e.target.value })} style={{ ...inp(), marginTop: 4 }} /></div>
            </div>
            <Lbl>Articles</Lbl>
            <div style={{ marginTop: 6 }}>
              {edit.items.length === 0 ? <div style={{ fontSize: 13, color: C.soft, padding: "8px 0" }}>Plus aucun article — la vente sera supprimée.</div> : edit.items.map((i, k) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.name}</div>
                    <div style={{ fontSize: 11.5, color: C.soft }}>{eur(i.price)} l'unité · {eur(i.price * i.qty)}</div>
                  </div>
                  <button onClick={() => eQty(k, -1)} className="ca-tap" style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.line}`, background: "#fff", color: C.jam, cursor: "pointer", fontSize: 17, lineHeight: 1 }}>−</button>
                  <span style={{ minWidth: 20, textAlign: "center", fontWeight: 700 }}>{i.qty}</span>
                  <button onClick={() => eQty(k, 1)} className="ca-tap" style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.line}`, background: "#fff", color: C.jam, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>+</button>
                  <button onClick={() => eRm(k)} aria-label="Retirer" className="ca-tap" style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", color: C.soft, cursor: "pointer", lineHeight: 0 }}><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
            <select value="" onChange={(e) => { const p = sellable.find((x) => x.id === e.target.value); if (p) eAdd(p); e.target.value = ""; }} style={{ ...inp(), marginTop: 12, color: C.jam, fontWeight: 600 }}>
              <option value="">+ Ajouter un article…</option>
              {sellable.map((p) => <option key={p.id} value={p.id} style={{ color: C.ink, fontWeight: 400 }}>{p.name} · {p.unit} · {eur(p.price)}</option>)}
            </select>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "14px 0", fontSize: 15 }}>
              <span style={{ color: C.soft }}>Total</span><span style={{ fontFamily: SCRIPT, fontSize: 22, color: C.jam }}>{eur(eTotal)}</span>
            </div>
            <button onClick={eSave} disabled={ebusy} className="ca-tap" style={{ width: "100%", background: C.ok, color: "#fff", border: "none", borderRadius: 13, padding: "14px", fontWeight: 700, fontSize: 15, cursor: ebusy ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Check size={18} /> {ebusy ? "…" : "Valider les modifications"}</button>
          </div>
        </div>
      )}
      {oEdit && (
        <div onClick={() => !obusy && setOEdit(null)} style={{ position: "fixed", inset: 0, zIndex: 100, background: "#16140fcc", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 12px max(12px, env(safe-area-inset-bottom))" }}>
          <div className="ca-anim" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: C.paper, borderRadius: 20, padding: "18px 16px", maxHeight: "86vh", overflowY: "auto", boxShadow: "0 24px 60px -16px #000" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ fontFamily: SCRIPT, fontSize: 22, color: C.jam }}>Modifier la commande</div>
              <button onClick={() => !obusy && setOEdit(null)} aria-label="Fermer" style={{ background: "transparent", border: "none", color: C.soft, cursor: "pointer", padding: 2, lineHeight: 0 }}><X size={20} /></button>
            </div>
            <div style={{ fontSize: 12.5, color: C.soft, marginBottom: 12 }}>{oEdit.name} · {oEdit.id}</div>
            <Lbl>Articles</Lbl>
            <div style={{ marginTop: 6 }}>
              {oEdit.items.length === 0 ? <div style={{ fontSize: 13, color: C.soft, padding: "8px 0" }}>Plus aucun article.</div> : oEdit.items.map((i, k) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.name}{i.unit ? <span style={{ color: C.soft }}> · {i.unit}</span> : null}</div>
                    <div style={{ fontSize: 11.5, color: C.soft }}>{eur(i.price)} l'unité · {eur(i.price * i.qty)}</div>
                  </div>
                  <button onClick={() => oQ(k, -1)} className="ca-tap" style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.line}`, background: "#fff", color: C.jam, cursor: "pointer", fontSize: 17, lineHeight: 1 }}>−</button>
                  <span style={{ minWidth: 20, textAlign: "center", fontWeight: 700 }}>{i.qty}</span>
                  <button onClick={() => oQ(k, 1)} className="ca-tap" style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.line}`, background: "#fff", color: C.jam, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>+</button>
                  <button onClick={() => oRm(k)} aria-label="Retirer" className="ca-tap" style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", color: C.soft, cursor: "pointer", lineHeight: 0 }}><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
            <select value="" onChange={(e) => { const p = sellable.find((x) => x.id === e.target.value); if (p) oAdd(p); e.target.value = ""; }} style={{ ...inp(), marginTop: 12, color: C.jam, fontWeight: 600 }}>
              <option value="">+ Ajouter un article…</option>
              {sellable.map((p) => <option key={p.id} value={p.id} style={{ color: C.ink, fontWeight: 400 }}>{p.name} · {p.unit} · {eur(p.price)}</option>)}
            </select>
            <div style={{ marginTop: 14 }}><Lbl>Jour de retrait</Lbl><input value={oEdit.pickup} onChange={(e) => setOEdit({ ...oEdit, pickup: e.target.value })} placeholder="ex. Samedi 14 juin" style={{ ...inp(), marginTop: 4 }} /></div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "14px 0", fontSize: 15 }}>
              <span style={{ color: C.soft }}>Total</span><span style={{ fontFamily: SCRIPT, fontSize: 22, color: C.jam }}>{eur(oTotal)}</span>
            </div>
            <button onClick={oSave} disabled={obusy} className="ca-tap" style={{ width: "100%", background: C.ok, color: "#fff", border: "none", borderRadius: 13, padding: "14px", fontWeight: 700, fontSize: 15, cursor: obusy ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Check size={18} /> {obusy ? "…" : "Enregistrer la commande"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
