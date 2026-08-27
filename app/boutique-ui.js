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
@keyframes capulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.02); } }
.ca-anim { animation: caIn .35s cubic-bezier(.2,.7,.3,1) both; }
.ca-tap { transition: transform .12s ease, background .15s ease, border-color .15s ease, opacity .15s; }
.ca-tap:active { transform: scale(.97); }
.pro-shell { display: flex; min-height: 706px; }
.pro-nav { width: 212px; background: #FBF6EA; border-right: 1px solid #241F1718; padding: 12px; flex-shrink: 0; }
.pro-content { flex: 1; padding: 24px 26px; max-height: 706px; overflow-y: auto; background: #EFE7D5; }
.caisse-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
@media (min-width: 600px) { .caisse-grid { grid-template-columns: repeat(3, 1fr); } }
.caisse-empty-ticket { display: none; }
.caisse-mobilebar { display: none; }
@media (min-width: 900px) {
  .caisse-work { display: grid; grid-template-columns: 1fr 330px; gap: 20px; align-items: start; }
  .caisse-ticket { position: sticky; top: 0; }
  .caisse-empty-ticket { display: block; }
}
@media (max-width: 720px) {
  .caisse-mobilebar { display: flex; position: fixed; left: 14px; right: 14px; bottom: 14px; z-index: 60; background: #16140F; color: #F3ECD6; border: none; border-radius: 15px; padding: 13px 18px; align-items: center; justify-content: space-between; box-shadow: 0 12px 28px -10px #00000070; cursor: pointer; }
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
        <button onClick={() => { if (returning && cust && cust.email) { setStep("contact"); } else { setIntent("contact"); setStep("coords"); } }} className="ca-tap" style={{ width: "100%", marginTop: 12, background: "transparent", border: "none", color: C.soft, fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, textDecoration: "underline", textUnderlineOffset: 3 }}><Smartphone size={14} /> Enregistrer nos coordonnées</button>
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
        : intent === "contact"
          ? <BigBtn disabled={!ok} onClick={() => valider("contact")}>Valider et voir nos coordonnées <ChevronRight size={17} /></BigBtn>
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
  const toggle = (c) => setOpen((o) => (o[c] ? {} : { [c]: true }));
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
  const [showCal, setShowCal] = useState(false);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const fmt = (d) => cap(d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }));
  const days = (() => { const out = []; const base = new Date(); for (let i = 0; i < 30 && out.length < 6; i++) { const x = new Date(); x.setDate(base.getDate() + i); if (x.getDay() === 0 || x.getDay() === 6) out.push(x); } return out; })();
  useEffect(() => { if (!pickupDay && days.length) setPickupDay(fmt(days[0])); }, []);
  const JJ = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];
  const MM = ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];
  return (
    <div className="ca-anim" style={{ padding: "6px 22px 28px" }}>
      <StepHead onBack={() => setStep("cart")} title="Finaliser" sub="Jour de retrait & règlement" />
      <Section>Jour de retrait au marché</Section>
      <div style={{ fontSize: 12.5, color: C.soft, margin: "0 0 10px" }}>Marché le <b style={{ color: C.ink }}>samedi et dimanche</b>. Touchez un jour :</div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 8, WebkitOverflowScrolling: "touch" }}>
        {days.map((d) => { const lbl = fmt(d); const sel = pickupDay === lbl; return (
          <button key={lbl} onClick={() => setPickupDay(lbl)} className="ca-tap" style={{ flexShrink: 0, cursor: "pointer", borderRadius: 13, padding: "9px 4px", width: 64, textAlign: "center", border: `1.5px solid ${sel ? C.jam : C.line}`, background: sel ? C.jam : C.cream, color: sel ? "#fff" : C.ink, transition: "all .15s" }}>
            <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".06em", opacity: sel ? .85 : .55, fontWeight: 700 }}>{JJ[d.getDay()]}</div>
            <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.15, margin: "1px 0" }}>{d.getDate()}</div>
            <div style={{ fontSize: 10.5, opacity: sel ? .85 : .55, fontWeight: 600 }}>{MM[d.getMonth()]}</div>
          </button>
        ); })}
      </div>
      <div style={{ fontSize: 12.5, color: C.ink, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <Check size={14} color={C.ok} /> Retrait le <b>{pickupDay || "—"}</b>
      </div>
      {!showCal ? (
        <button onClick={() => setShowCal(true)} className="ca-tap" style={{ background: "transparent", border: "none", color: C.jam, fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0, marginBottom: 18, textDecoration: "underline", textUnderlineOffset: 3 }}><Calendar size={14} /> Choisir une autre date</button>
      ) : (
        <label style={{ display: "block", marginBottom: 18 }}>
          <span style={{ fontSize: 12, color: C.soft }}>Autre date</span>
          <input type="date" autoFocus min={new Date().toISOString().slice(0, 10)} onChange={(e) => { if (e.target.value) { const d = new Date(e.target.value + "T12:00:00"); setPickupDay(fmt(d)); } }} style={{ ...inp(), marginTop: 5 }} />
        </label>
      )}
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
  const [sent, setSent] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAsk(true), 1600); return () => clearTimeout(t); }, []);
  const o = lastOrder || { lines: [], total: 0, id: "" };
  const markSent = () => {
    setSent(true);
    if (supabase && o.oid) { try { supabase.rpc("mark_wa_sent", { p_oid: o.oid }).then(() => {}, () => {}); } catch (e) {} }
  };

  const lignes = o.lines.map((l) => `• ${l.qty}x ${l.name} (${l.unit}) — ${eur(l.price * l.qty)}`).join("\n");
  const recap = `🛒 COMMANDE ${profile.name} — réf. ${o.id}\n———————————\n👤 ${cust?.prenom || ""} ${cust?.nom || ""}\n📞 ${cust?.tel || ""}\n✉️ ${cust?.email || ""}\n———————————\nBonjour ! Je souhaite passer commande :\n\n${lignes}\n\nTotal : ${eur(o.total)}\n📅 Retrait souhaité : ${o.pickup || "à convenir"}\n📍 Au stand, sur le marché${!paymentEnabled ? "\n💶 Règlement à l'enlèvement" : ""}\n\nMerci de me confirmer la disponibilité 🙂`;
  const wa = `https://wa.me/${profile.wa}?text=${encodeURIComponent(recap)}`;
  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent("Commande " + profile.name + " " + o.id)}&body=${encodeURIComponent(recap)}`;
  useEffect(() => {
    const t = setTimeout(() => { try { const w = window.open(wa, "_blank"); if (w) markSent(); } catch (e) {} }, 900);
    return () => clearTimeout(t);
  }, []);
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
      <div style={{ background: sent ? "#3F7A4B14" : "#B5722B1f", border: `1.5px solid ${sent ? "#3F7A4B55" : C.caramel}`, borderRadius: 13, padding: "13px 15px", textAlign: "left", marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
        {sent ? <Check size={18} color={C.ok} style={{ marginTop: 1, flexShrink: 0 }} /> : <MessageCircle size={18} color={C.caramel} style={{ marginTop: 1, flexShrink: 0 }} />}
        <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.5 }}>
          {sent
            ? <><b>Commande transmise ✓</b> Nous vous recontactons rapidement pour confirmer.</>
            : <><b>Dernière étape obligatoire : envoyez votre commande.</b> Sans cet envoi, nous ne sommes pas prévenus et votre commande ne sera pas préparée.</>}
        </div>
      </div>
      <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: C.caramel, fontWeight: 700, textAlign: "left", marginBottom: 10 }}>Envoyer ma commande</div>
      <a href={wa} target="_blank" rel="noreferrer" onClick={markSent} className="ca-tap" style={{ width: "100%", background: "#1FA855", color: "#fff", borderRadius: 13, padding: "18px", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, textDecoration: "none", boxSizing: "border-box", boxShadow: sent ? "none" : "0 10px 28px -10px #1FA855aa", animation: sent ? "none" : "capulse 1.8s ease-in-out infinite" }}><MessageCircle size={20} /> {sent ? "Renvoyer par WhatsApp" : "Envoyer par WhatsApp"}</a>
      <a href={mailto} className="ca-tap" style={{ width: "100%", marginTop: 10, background: C.board, color: C.chalk, borderRadius: 13, padding: "14px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, textDecoration: "none", boxSizing: "border-box" }}><Mail size={16} /> Envoyer par email</a>
      <button onClick={copy} className="ca-tap" style={{ width: "100%", marginTop: 10, background: "transparent", border: `1.5px solid ${C.line}`, color: C.jam, borderRadius: 13, padding: "12px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{copied ? <><Check size={15} /> Copié</> : <><Copy size={15} /> Copier le récapitulatif</>}</button>
      <button onClick={() => setStep("avis")} className="ca-tap" style={{ width: "100%", marginTop: 10, background: "transparent", border: `1.5px solid ${C.line}`, color: C.ink, borderRadius: 13, padding: "12px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Stars value={5} size={15} /> Donner mon avis</button>
      <button onClick={resetClient} className="ca-tap" style={{ ...backBtn(), margin: "16px auto 0" }}>Nouvelle commande</button>
      {ask && (
        <div onClick={() => setAsk(false)} style={{ position: "fixed", inset: 0, zIndex: 95, background: "#16140fcc", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 12px", overflowY: "auto" }}>
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
  const NAV = [["caisse", "Caisse", CreditCard], ["stats", "Tableau de bord", TrendingUp], ["commandes", "Commandes", ShoppingBag], ["produits", "Produits", Package], ["clients", "Clients (CRM)", Users], ["fournisseurs", "Fournisseurs", Truck], ["gestion", "Contrôle de gestion", Percent], ["publimail", "Publimail", Mail], ["promos", "Promos", Tag], ["profil", "Enseigne", Store], ["reglages", "Réglages", Settings]];
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
        {tab === "fournisseurs" && <ProFournisseurs {...{ pass }} />}
        {tab === "gestion" && <ProProduction {...{ pass }} />}
        {tab === "commandes" && <ProOrders {...{ orders, setOrders, onRefresh, loading, pass, products }} />}
        {tab === "produits" && <ProProducts {...{ products, setProducts, pass }} />}
        {tab === "clients" && <ProClients {...{ clients, orders, pass }} />}
        {tab === "publimail" && <ProMail {...{ clients }} />}
        {tab === "promos" && <ProPromos {...{ promos, setPromos }} />}
        {tab === "profil" && <ProProfile {...{ profile, setProfile, onLogout, pass }} />}
        {tab === "reglages" && <ProSettings {...{ paymentEnabled, setPaymentEnabled, pass }} />}
      </div>
    </div>
  );
}
function CalGrid({ sales, selected, onPick }) {
  const [cur, setCur] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const todayIso = iso(new Date());
  const byDay = {};
  (sales || []).forEach((s) => { const k = iso(new Date(s.ts)); byDay[k] = (byDay[k] || 0) + (Number(s.total) || 0); });
  const y = cur.getFullYear(), m = cur.getMonth();
  const first = new Date(y, m, 1);
  const startPad = (first.getDay() + 6) % 7; // lundi = 0
  const nbDays = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= nbDays; d++) cells.push(new Date(y, m, d));
  const maxCa = Math.max(1, ...Object.values(byDay));
  const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const nav = (delta) => setCur(new Date(y, m + delta, 1));
  return (
    <div style={{ maxWidth: 420, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <button onClick={() => nav(-1)} className="ca-tap" style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 8, width: 30, height: 30, cursor: "pointer", display: "grid", placeItems: "center", color: C.jam }}><ChevronLeft size={16} /></button>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, textTransform: "capitalize" }}>{MOIS[m]} {y}</div>
        <button onClick={() => nav(1)} className="ca-tap" style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 8, width: 30, height: 30, cursor: "pointer", display: "grid", placeItems: "center", color: C.jam }}><ChevronRight size={16} /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 3 }}>
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 10, color: C.soft, fontWeight: 700 }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "clamp(3px, 0.8vw, 6px)" }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const k = iso(d);
          const ca = byDay[k] || 0;
          const isSel = selected === k || (!selected && k === todayIso);
          const isFuture = k > todayIso;
          const isToday = k === todayIso;
          return (
            <button key={i} onClick={() => !isFuture && onPick(k)} disabled={isFuture} className="ca-tap"
              style={{ position: "relative", aspectRatio: "1", minHeight: 38, borderRadius: "clamp(8px, 1.4vw, 11px)", cursor: isFuture ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, padding: 2,
                border: `1.5px solid ${isSel ? C.jam : (isToday ? C.caramel : "transparent")}`,
                background: isSel ? C.jam : (ca ? `rgba(122,43,51,${0.08 + 0.32 * (ca / maxCa)})` : "#fff"),
                color: isSel ? "#fff" : (isFuture ? "#C9C0AE" : C.ink), opacity: isFuture ? .45 : 1 }}>
              <span style={{ fontSize: "clamp(12px, 1.6vw, 15px)", fontWeight: ca || isSel ? 700 : 500, lineHeight: 1 }}>{d.getDate()}</span>
              {ca > 0 && <span style={{ fontSize: "clamp(8px, 1vw, 10px)", fontWeight: 700, color: isSel ? "#ffffffcc" : C.jam, lineHeight: 1 }}>{Math.round(ca)}€</span>}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: C.soft, marginTop: 8, lineHeight: 1.4 }}>Touchez un jour pour y enregistrer une vente. L'intensité indique le chiffre d'affaires.</div>
    </div>
  );
}
function ProFournisseurs({ pass }) {
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ k: "societe", dir: 1 });
  const [sel, setSel] = useState(null);
  const [edit, setEdit] = useState(null);
  const [inv, setInv] = useState(null);
  const blank = { id: null, societe: "", contact_prenom: "", contact_nom: "", tel: "", email: "", adresse: "", cp: "", ville: "", siret: "", categorie: "", notes: "" };

  const load = async () => {
    if (!supabase || !pass) return;
    setBusy(true);
    try { const { data } = await supabase.rpc("admin_suppliers", { pass }); if (Array.isArray(data)) setList(data); } catch (e) {}
    setBusy(false);
  };
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!edit || !edit.societe) return;
    setBusy(true);
    try { await supabase.rpc("admin_save_supplier", { pass, p_id: edit.id, p_societe: edit.societe, p_prenom: edit.contact_prenom || "", p_nom: edit.contact_nom || "", p_tel: edit.tel || "", p_email: edit.email || "", p_adresse: edit.adresse || "", p_cp: edit.cp || "", p_ville: edit.ville || "", p_siret: edit.siret || "", p_categorie: edit.categorie || "", p_notes: edit.notes || "" }); setEdit(null); await load(); } catch (e) {}
    setBusy(false);
  };
  const remove = async (id) => {
    if (!window.confirm("Supprimer ce fournisseur et ses factures ?")) return;
    try { await supabase.rpc("admin_delete_supplier", { pass, p_id: id }); setSel(null); await load(); } catch (e) {}
  };
  const saveInv = async () => {
    if (!inv || !inv.supplier_id) return;
    setBusy(true);
    try { await supabase.rpc("admin_save_invoice", { pass, p_id: inv.id || null, p_supplier: inv.supplier_id, p_numero: inv.numero || "", p_date: inv.date_facture || null, p_ht: Number(inv.montant_ht) || 0, p_ttc: Number(inv.montant_ttc) || 0, p_payee: !!inv.payee, p_notes: inv.notes || "" }); setInv(null); await load(); } catch (e) {}
    setBusy(false);
  };
  const tot = (s2) => (s2.factures || []).reduce((a, f) => a + (Number(f.montant_ttc) || 0), 0);
  const impayes = (s2) => (s2.factures || []).filter((f) => !f.payee).length;

  const base = list.filter((s2) => ((s2.societe || "") + " " + (s2.contact_nom || "") + " " + (s2.ville || "") + " " + (s2.categorie || "") + " " + (s2.siret || "")).toLowerCase().includes(q.toLowerCase().trim()));
  const rows = [...base].sort((a, b) => {
    const k = sort.k;
    if (k === "total") return (tot(a) - tot(b)) * sort.dir;
    if (k === "nb") return (((a.factures || []).length) - ((b.factures || []).length)) * sort.dir;
    return String(a[k] || "").toLowerCase().localeCompare(String(b[k] || "").toLowerCase()) * sort.dir;
  });
  const selS = rows.find((s2) => s2.id === sel) || null;
  const th = (k, label) => (
    <th onClick={() => setSort((s2) => ({ k, dir: s2.k === k ? -s2.dir : 1 }))}
      style={{ padding: "9px 8px", textAlign: (k === "total" || k === "nb") ? "right" : "left", fontSize: 11, textTransform: "uppercase", letterSpacing: ".07em", color: sort.k === k ? C.jam : C.soft, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", borderBottom: `2px solid ${C.line}`, background: C.paper, position: "sticky", top: 0, userSelect: "none" }}>
      {label} <span style={{ opacity: sort.k === k ? 1 : .3 }}>{sort.k === k ? (sort.dir === 1 ? "▲" : "▼") : "↕"}</span>
    </th>
  );
  const F = ({ l, v, on, type }) => (<div style={{ flex: 1, minWidth: 130 }}><Lbl>{l}</Lbl><input type={type || "text"} value={v || ""} onChange={(e) => on(e.target.value)} style={{ ...inp(), marginTop: 4 }} /></div>);
  const exportCsv = () => downloadCSV(`fournisseurs-${new Date().toISOString().slice(0, 10)}.csv`,
    ["Société", "Contact", "Téléphone", "Email", "Adresse", "CP", "Ville", "SIRET", "Catégorie", "Factures", "Total TTC"],
    rows.map((s2) => [s2.societe, [s2.contact_prenom, s2.contact_nom].filter(Boolean).join(" "), s2.tel || "", s2.email || "", s2.adresse || "", s2.cp || "", s2.ville || "", s2.siret || "", s2.categorie || "", (s2.factures || []).length, tot(s2) + " €"]));

  return (
    <div className="ca-anim">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <div><h2 style={{ fontFamily: SCRIPT, fontSize: 24, margin: 0, color: C.jam }}>Fournisseurs</h2><div style={{ fontSize: 13, color: C.soft, marginTop: 3 }}>{list.length} professionnel(s) · triez en cliquant sur les colonnes</div></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setEdit({ ...blank })} className="ca-tap" style={{ background: C.jam, color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}><Plus size={14} /> Nouveau</button>
          <button onClick={exportCsv} disabled={!rows.length} className="ca-tap" style={{ background: rows.length ? C.board : C.line, color: C.chalk, border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Send size={14} /> CSV</button>
        </div>
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer : société, contact, ville, SIRET…" style={{ ...inp(), marginBottom: 12 }} />

      <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden", background: C.paper }}>
        <div style={{ overflowX: "auto", maxHeight: "60vh", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 660 }}>
            <thead><tr>
              {th("societe", "Société")}{th("contact_nom", "Contact")}{th("tel", "Téléphone")}{th("ville", "Ville")}{th("categorie", "Catégorie")}{th("nb", "Fact.")}{th("total", "Total TTC")}
            </tr></thead>
            <tbody>
              {rows.length === 0 ? <tr><td colSpan={7} style={{ padding: 18, textAlign: "center", color: C.soft, fontSize: 13 }}>{busy ? "Chargement…" : "Aucun fournisseur. Créez le premier avec « Nouveau »."}</td></tr>
                : rows.map((s2, i) => (
                  <tr key={s2.id} onClick={() => setSel(s2.id)} className="ca-tap" style={{ cursor: "pointer", background: sel === s2.id ? "#7A2B3312" : (i % 2 ? "#ffffff66" : "transparent"), borderBottom: `1px solid ${C.line}` }}>
                    <td style={{ padding: "10px 8px", fontWeight: 700, color: C.ink }}>{s2.societe}{impayes(s2) > 0 && <span style={{ marginLeft: 6, fontSize: 9.5, fontWeight: 700, color: "#fff", background: C.caramel, borderRadius: 4, padding: "2px 5px" }}>{impayes(s2)} À PAYER</span>}</td>
                    <td style={{ padding: "10px 8px", color: C.ink }}>{[s2.contact_prenom, s2.contact_nom].filter(Boolean).join(" ") || "—"}</td>
                    <td style={{ padding: "10px 8px", color: C.ink, whiteSpace: "nowrap" }}>{s2.tel || "—"}</td>
                    <td style={{ padding: "10px 8px", color: s2.ville ? C.ink : "#C9C0AE" }}>{s2.ville || "—"}</td>
                    <td style={{ padding: "10px 8px", color: C.soft }}>{s2.categorie || "—"}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 600 }}>{(s2.factures || []).length}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, color: C.jam, whiteSpace: "nowrap" }}>{eur(tot(s2))}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: C.soft, marginTop: 8 }}>Touchez une ligne pour ouvrir la fiche fournisseur et ses achats.</div>

      {selS && (() => {
        const fs = (selS.factures || []).slice().sort((a, b) => String(b.date_facture || "").localeCompare(String(a.date_facture || "")));
        const totalTtc = tot(selS);
        const impaye = fs.filter((f) => !f.payee).reduce((a, f) => a + (Number(f.montant_ttc) || 0), 0);
        return (
          <div onClick={() => setSel(null)} style={{ position: "fixed", inset: 0, zIndex: 100, background: "#16140fcc", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 12px", overflowY: "auto" }}>
            <div className="ca-anim" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: C.paper, borderRadius: 20, padding: "18px 16px", maxHeight: "min(90vh, 880px)", margin: "auto", overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: C.board, color: C.chalk, display: "grid", placeItems: "center", fontFamily: SCRIPT, fontSize: 19, flexShrink: 0, paddingTop: 3 }}>{(selS.societe || "?")[0].toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SCRIPT, fontSize: 22, color: C.jam, lineHeight: 1.15 }}>{selS.societe}</div>
                  <div style={{ fontSize: 12, color: C.soft }}>{selS.categorie || "Fournisseur"}</div>
                </div>
                <button onClick={() => setSel(null)} style={{ background: "transparent", border: "none", color: C.soft, cursor: "pointer", lineHeight: 0 }}><X size={20} /></button>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <div style={{ flex: 1, background: C.jam, color: "#fff", borderRadius: 12, padding: "11px 12px" }}><div style={{ fontSize: 10, opacity: .75, textTransform: "uppercase", letterSpacing: ".1em" }}>Total achats</div><div style={{ fontSize: 21, fontWeight: 700 }}>{eur(totalTtc)}</div></div>
                <div style={{ flex: 1, background: C.board, color: C.chalk, borderRadius: 12, padding: "11px 12px" }}><div style={{ fontSize: 10, opacity: .7, textTransform: "uppercase", letterSpacing: ".1em" }}>Factures</div><div style={{ fontSize: 21, fontWeight: 700 }}>{fs.length}</div></div>
                <div style={{ flex: 1, background: impaye ? C.caramel : C.board, color: impaye ? "#fff" : C.chalk, borderRadius: 12, padding: "11px 12px" }}><div style={{ fontSize: 10, opacity: .75, textTransform: "uppercase", letterSpacing: ".1em" }}>Impayé</div><div style={{ fontSize: 21, fontWeight: 700 }}>{eur(impaye)}</div></div>
              </div>

              <div style={{ ...h2 }}>Coordonnées</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 14px", fontSize: 13, marginBottom: 14 }}>
                <div><span style={{ color: C.soft, fontSize: 11.5 }}>Contact</span><br /><b>{[selS.contact_prenom, selS.contact_nom].filter(Boolean).join(" ") || "—"}</b></div>
                <div><span style={{ color: C.soft, fontSize: 11.5 }}>Téléphone</span><br /><b>{selS.tel || "—"}</b></div>
                <div><span style={{ color: C.soft, fontSize: 11.5 }}>Email</span><br /><b style={{ wordBreak: "break-all", fontSize: 12.5 }}>{selS.email || "—"}</b></div>
                <div><span style={{ color: C.soft, fontSize: 11.5 }}>SIRET</span><br /><b>{selS.siret || "—"}</b></div>
                <div style={{ gridColumn: "1 / -1" }}><span style={{ color: C.soft, fontSize: 11.5 }}>Adresse</span><br /><b>{[selS.adresse, selS.cp, selS.ville].filter(Boolean).join(", ") || "—"}</b></div>
                {selS.notes && <div style={{ gridColumn: "1 / -1" }}><span style={{ color: C.soft, fontSize: 11.5 }}>Notes</span><br />{selS.notes}</div>}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ ...h2, marginBottom: 0 }}>Achats / factures ({fs.length})</span>
                <button onClick={() => setInv({ id: null, supplier_id: selS.id, numero: "", date_facture: new Date().toISOString().slice(0, 10), montant_ht: "", montant_ttc: "", payee: false })} className="ca-tap" style={{ background: "#fff", border: `1px solid ${C.line}`, color: C.jam, borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><Plus size={12} /> Ajouter</button>
              </div>
              {fs.length === 0 ? <div style={{ fontSize: 13, color: C.soft, marginBottom: 10 }}>Aucun achat enregistré.</div>
                : fs.map((f) => (
                  <div key={f.id} onClick={() => setInv({ ...f, supplier_id: selS.id })} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 0", borderBottom: `1px solid ${C.line}`, cursor: "pointer" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{f.numero || "sans n°"}</div>
                      <div style={{ fontSize: 11.5, color: C.soft }}>{f.date_facture ? new Date(f.date_facture).toLocaleDateString("fr-FR") : "—"} · HT {eur(f.montant_ht)}</div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.ink, flexShrink: 0 }}>{eur(f.montant_ttc)}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: f.payee ? C.ok : C.caramel, borderRadius: 5, padding: "2px 6px", flexShrink: 0 }}>{f.payee ? "PAYÉE" : "À PAYER"}</span>
                  </div>
                ))}

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button onClick={() => setEdit({ ...selS })} className="ca-tap" style={{ flex: 1, background: "#fff", border: `1.5px solid ${C.jam}`, color: C.jam, borderRadius: 13, padding: "13px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}><Settings size={16} /> Modifier</button>
                <button onClick={() => remove(selS.id)} className="ca-tap" style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.soft, borderRadius: 13, padding: "13px 15px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        );
      })()}

      {edit && (
        <div onClick={() => !busy && setEdit(null)} style={{ position: "fixed", inset: 0, zIndex: 101, background: "#16140fcc", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 12px", overflowY: "auto" }}>
          <div className="ca-anim" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 500, background: C.paper, borderRadius: 20, padding: "18px 16px", maxHeight: "min(90vh, 880px)", margin: "auto", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontFamily: SCRIPT, fontSize: 21, color: C.jam }}>{edit.id ? "Modifier" : "Nouveau fournisseur"}</div>
              <button onClick={() => setEdit(null)} style={{ background: "transparent", border: "none", color: C.soft, cursor: "pointer", lineHeight: 0 }}><X size={20} /></button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <F l="Société *" v={edit.societe} on={(v) => setEdit({ ...edit, societe: v })} />
              <F l="Catégorie" v={edit.categorie} on={(v) => setEdit({ ...edit, categorie: v })} />
              <F l="Prénom contact" v={edit.contact_prenom} on={(v) => setEdit({ ...edit, contact_prenom: v })} />
              <F l="Nom contact" v={edit.contact_nom} on={(v) => setEdit({ ...edit, contact_nom: v })} />
              <F l="Téléphone" v={edit.tel} on={(v) => setEdit({ ...edit, tel: v })} />
              <F l="Email" v={edit.email} on={(v) => setEdit({ ...edit, email: v })} type="email" />
              <div style={{ flexBasis: "100%" }}><F l="Adresse" v={edit.adresse} on={(v) => setEdit({ ...edit, adresse: v })} /></div>
              <F l="Code postal" v={edit.cp} on={(v) => setEdit({ ...edit, cp: v })} />
              <F l="Ville" v={edit.ville} on={(v) => setEdit({ ...edit, ville: v })} />
              <F l="SIRET" v={edit.siret} on={(v) => setEdit({ ...edit, siret: v })} />
              <div style={{ flexBasis: "100%" }}><Lbl>Notes</Lbl><textarea value={edit.notes || ""} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} rows={2} style={{ ...inp(), marginTop: 4, resize: "vertical" }} /></div>
            </div>
            <button onClick={save} disabled={busy || !edit.societe} className="ca-tap" style={{ width: "100%", marginTop: 14, background: edit.societe ? C.ok : C.soft, color: "#fff", border: "none", borderRadius: 13, padding: "14px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Check size={18} /> {busy ? "…" : "Enregistrer"}</button>
          </div>
        </div>
      )}

      {inv && (
        <div onClick={() => !busy && setInv(null)} style={{ position: "fixed", inset: 0, zIndex: 102, background: "#16140fcc", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 12px", overflowY: "auto" }}>
          <div className="ca-anim" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: C.paper, borderRadius: 20, padding: "18px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontFamily: SCRIPT, fontSize: 21, color: C.jam }}>{inv.id ? "Modifier la facture" : "Nouvel achat"}</div>
              <button onClick={() => setInv(null)} style={{ background: "transparent", border: "none", color: C.soft, cursor: "pointer", lineHeight: 0 }}><X size={20} /></button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <F l="N° facture" v={inv.numero} on={(v) => setInv({ ...inv, numero: v })} />
              <F l="Date" v={inv.date_facture} on={(v) => setInv({ ...inv, date_facture: v })} type="date" />
              <F l="Montant HT (€)" v={inv.montant_ht} on={(v) => setInv({ ...inv, montant_ht: v })} type="number" />
              <F l="Montant TTC (€)" v={inv.montant_ttc} on={(v) => setInv({ ...inv, montant_ttc: v })} type="number" />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 12, cursor: "pointer", fontSize: 13.5, fontWeight: 600 }}>
              <input type="checkbox" checked={!!inv.payee} onChange={(e) => setInv({ ...inv, payee: e.target.checked })} style={{ width: 18, height: 18, accentColor: C.ok }} /> Facture payée
            </label>
            <button onClick={saveInv} disabled={busy} className="ca-tap" style={{ width: "100%", marginTop: 14, background: C.ok, color: "#fff", border: "none", borderRadius: 13, padding: "14px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Check size={18} /> {busy ? "…" : "Enregistrer"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ MODULE PILOTAGE DE PRODUCTION (fournées) ============
const PF = { navy: "#123A52", ochre: "#C65A35", yellow: "#F4B32C", good: "#4b7a57", warn: "#a6482a" };
const PF_ING = [
  { key: "oignon", label: "Oignon", unit: "kg", qf: "oignon_kg", pf: "px_oignon", pu: "€/kg", div: 1, color: "#123A52", family: "weight" },
  { key: "huile", label: "Huile d'olive", unit: "cl", qf: "huile_cl", pf: "px_huile", pu: "€/L", div: 100, color: "#C65A35", family: "volume" },
  { key: "sel", label: "Sel", unit: "g", qf: "sel_g", pf: "px_sel", pu: "€/kg", div: 1000, color: "#F4B32C", family: "weight" },
  { key: "poivre", label: "Poivre", unit: "g", qf: "poivre_g", pf: "px_poivre", pu: "€/kg", div: 1000, color: "#4b7a57", family: "weight" },
  { key: "anchois", label: "Anchois", unit: "g", qf: "anchois_g", pf: "px_anchois", pu: "€/kg", div: 1000, color: "#8B3A3A", family: "weight" },
  { key: "thym", label: "Thym", unit: "g", qf: "thym_g", pf: "px_thym", pu: "€/kg", div: 1000, color: "#6b4d8f", family: "weight" },
  { key: "ail", label: "Ail", unit: "g", qf: "ail_g", pf: "px_ail", pu: "€/kg", div: 1000, color: "#8a6d3f", family: "weight" },
];
// options d'unité disponibles par famille, et facteur de conversion vers l'unité de base (kg pour le poids, L pour le volume)
const PF_UNIT_OPTS = { weight: { g: 1000, kg: 1 }, volume: { ml: 1000, cl: 100, L: 1 } };
// quantités de référence par défaut (fournée du 09/08, 7,7 kg d'oignons), exprimées en unité de base (kg ou L)
const PF_REF_BASE = { oignon: 7.7, huile: 0.5, sel: 0.005, poivre: 0.003, anchois: 0.15, thym: 0.003, ail: 0.05 };
const pfNum = (x) => { const n = parseFloat(String(x == null ? "" : x).replace(",", ".")); return isNaN(n) ? 0 : n; };
// convertit une quantité en unité de base (kg/L) vers l'unité fixe historique de l'ingrédient
const pfFromBase = (baseQty, ing) => baseQty * PF_UNIT_OPTS[ing.family][ing.unit];
// proportion de référence pour 1 kg d'oignon, dans l'unité native de l'ingrédient : valeur personnalisée de LA FOURNÉE si saisie, sinon le défaut du 09/08
const pfRefRatio = (f, ing) => {
  const custom = f[ing.key + "_ref"];
  if (custom != null && custom !== "") return pfNum(custom);
  return pfFromBase(PF_REF_BASE[ing.key] / PF_REF_BASE.oignon, ing);
};
// calcule les 6 ingrédients (hors oignon) proportionnellement à une quantité d'oignon (en kg), selon la référence (personnalisée ou par défaut) de CETTE fournée
const pfSuggestRecipe = (f, oignonBaseKg) => {
  const patch = {};
  PF_ING.forEach((ing) => {
    if (ing.key === "oignon") return;
    patch[ing.qf] = Math.round(pfRefRatio(f, ing) * oignonBaseKg * 1000) / 1000;
  });
  return patch;
};

// affichage : convertit la valeur stockée (toujours dans ing.unit) vers l'unité actuellement choisie pour l'AFFICHAGE uniquement
const pfDisplayUnit = (f, ing) => f[ing.key + "_unit"] || ing.unit;
const pfDisplayVal = (f, ing) => {
  const chosen = pfDisplayUnit(f, ing);
  const baseQty = pfNum(f[ing.qf]) / PF_UNIT_OPTS[ing.family][ing.unit]; // vers kg/L
  return baseQty * PF_UNIT_OPTS[ing.family][chosen];
};
// convertit une saisie faite dans l'unité choisie vers l'unité de STOCKAGE fixe (ing.unit) — le champ stocké ne change jamais de signification
const pfParseToStorage = (typedVal, ing, chosenUnit) => {
  const baseQty = pfNum(typedVal) / PF_UNIT_OPTS[ing.family][chosenUnit];
  return baseQty * PF_UNIT_OPTS[ing.family][ing.unit];
};
// packLabels = intitulés des 3 champs de contenant/emballage (null = champ masqué pour cette famille)
const FAMILLES = [
  { key: "pissaladiere", label: "Pissaladière", ingLabel: "Matières premières", packLabels: ["Bocal", "Capuchon", "Étiquette"], unitWord: "pot" },
  { key: "grande_fournee", label: "Grande fournée", ingLabel: "Matières premières", packLabels: ["Bocal", "Capuchon", "Étiquette"], unitWord: "pot" },
  { key: "confiture", label: "Confiture", ingLabel: "Ingrédients", packLabels: ["Bocal", "Capuchon", "Étiquette"], unitWord: "pot" },
  { key: "caramel_pot", label: "Caramel (pot)", ingLabel: "Ingrédients", packLabels: ["Pot (couvercle + étiquette)", "Sachet non tissé", null], unitWord: "pot" },
  { key: "caramel_bonbon", label: "Caramel (bonbon)", ingLabel: "Ingrédients", packLabels: ["Sachet", "Fermoir", "Papier (emballage indiv.)"], unitWord: "sachet" },
  { key: "biscuit", label: "Biscuit sablé", ingLabel: "Ingrédients", packLabels: ["Sachet + fermoir", null, null], unitWord: "sachet" },
  { key: "pain_epices", label: "Pain d'épices", ingLabel: "Ingrédients", packLabels: ["Moule / barquette", null, "Emballage"], unitWord: "barquette" },
  { key: "kit_farine", label: "Kit Farine", ingLabel: "Composition du kit", packLabels: ["Sac", null, null], unitWord: "kit" },
];
const famOf = (key) => FAMILLES.find((x) => x.key === key) || FAMILLES[0];
const isPissaFam = (famille) => famille === "pissaladiere" || famille === "grande_fournee";
// pour une fournée Pissaladière, chaque format de contenant peut être un "pot" classique ou un "kit" (pot + sac + accompagnements groupés)
const POT_TYPE_LABELS = { pot: ["Bocal", "Capuchon", "Étiquette"], kit: ["Pot", "Sac", "Accompagnements (huile+anchois+olive)"] };
// unités disponibles pour les ingrédients libres : g/kg/ml/cl/L convertis automatiquement vers un prix au kg ou au litre, "pièce" = prix direct
const EXTRA_UNITS = { g: { div: 1000, pu: "€/kg" }, kg: { div: 1, pu: "€/kg" }, ml: { div: 1000, pu: "€/L" }, cl: { div: 100, pu: "€/L" }, L: { div: 1, pu: "€/L" }, piece: { div: 1, pu: "€/unité" } };

// valeurs de départ par famille (chiffres transmis par Romain le 14/08/2026 — certaines lignes restent à confirmer)
const FAM_DEFAULTS = {
  pissaladiere: { extra: [], pots: [{ type: "pot", format_g: 250, px_bocal: 0.85, px_capuchon: 0.20, px_etiquette: 0.30, nb: "", px_vente: "" }] },
  grande_fournee: { extra: [], pots: [{ type: "pot", format_g: 250, px_bocal: 0.85, px_capuchon: 0.20, px_etiquette: 0.30, nb: "", px_vente: "" }], kg_par_feu: 3, temps_cycle_min: 40, epluchage_kg_par_min: 0.5 },
  confiture: {
    extra: [
      { label: "Fruit (à préciser)", qty: "", unit: "g", price: "" },
      { label: "Sucre", qty: "", unit: "g", price: "" },
      { label: "Citron", qty: "", unit: "g", price: "" },
    ],
    pots: [{ format_g: 250, px_bocal: 0.85, px_capuchon: 0, px_etiquette: 0, nb: "", px_vente: "" }],
    px_vente_kg: 23.50,
  },
  caramel_pot: {
    extra: [
      { label: "Crème fleurette", qty: 500, unit: "ml", price: 3.44 },
      { label: "Sucre vergeoise", qty: 400, unit: "g", price: 3.16 },
      { label: "Corn syrup", qty: 200, unit: "g", price: 15.16 },
      { label: "Beurre salé", qty: 100, unit: "g", price: 10.16 },
      { label: "Vanille", qty: 5, unit: "g", price: 10.96 },
      { label: "Fleur de sel", qty: "", unit: "g", price: "" },
    ],
    pots: [{ format_g: 106, px_bocal: "", px_capuchon: 0.20, px_etiquette: "", nb: "", px_vente: 4.24 }],
    poids_fini_kg: 0.866,
    px_vente_kg: 40,
  },
  caramel_bonbon: {
    extra: [
      { label: "Crème fleurette", qty: 500, unit: "ml", price: 3.44 },
      { label: "Sucre vergeoise", qty: 400, unit: "g", price: 3.16 },
      { label: "Corn syrup", qty: 200, unit: "g", price: 15.16 },
      { label: "Beurre salé", qty: 100, unit: "g", price: 10.16 },
      { label: "Vanille", qty: 5, unit: "g", price: 10.96 },
      { label: "Fleur de sel", qty: "", unit: "g", price: "" },
    ],
    pots: [{ format_g: "", px_bocal: "", px_capuchon: "", px_etiquette: "", nb: "", px_vente: "" }],
    poids_fini_kg: 0.866,
    px_vente_kg: 40,
  },
  biscuit: {
    extra: [
      { label: "Farine de sarrasin bio", qty: 250, unit: "g", price: 5.85 },
      { label: "Beurre", qty: 125, unit: "g", price: 10.88 },
      { label: "Sucre glace", qty: 90, unit: "g", price: 3.98 },
      { label: "Œuf", qty: 1, unit: "piece", price: 0.58 },
      { label: "Sel (pincée)", qty: 1, unit: "g", price: 0 },
    ],
    pots: [{ format_g: 100, px_bocal: 0.10, px_capuchon: "", px_etiquette: "", nb: "", px_vente: "" }],
  },
  pain_epices: {
    extra: [
      { label: "Farine petit épeautre", qty: 280, unit: "g", price: 6.29 },
      { label: "Beurre", qty: 125, unit: "g", price: 10.88 },
      { label: "Œufs", qty: 2, unit: "piece", price: 0.58 },
      { label: "Crème de coco", qty: 200, unit: "ml", price: 8.05 },
      { label: "Bicarbonate", qty: 5, unit: "g", price: 2.88 },
      { label: "Miel", qty: 300, unit: "g", price: 10 },
      { label: "Épices mélangées", qty: 7, unit: "g", price: 132 },
      { label: "Orangettes", qty: "", unit: "g", price: "" },
    ],
    pots: [{ format_g: 270, px_bocal: 0.33, px_capuchon: "", px_etiquette: 0.03, nb: 4, px_vente: 9.45 }],
    poids_fini_kg: 1.08,
    px_vente_kg: 35,
  },
  kit_farine: {
    extra: [
      { label: "Farine bio", qty: 200, unit: "g", price: 1.99 },
      { label: "Huile", qty: 1, unit: "piece", price: 3 },
      { label: "Anchois", qty: 1, unit: "piece", price: 5 },
      { label: "Olives", qty: 1, unit: "piece", price: 2.5 },
    ],
    // même astuce que Kit Pissaladière : format = poids fini (200 g) pour que le coût "produit" = exactement la somme des ingrédients
    pots: [{ format_g: 200, px_bocal: 1.5, px_capuchon: "", px_etiquette: "", nb: "", px_vente: "" }],
    poids_fini_kg: 0.2,
  },
};

const pfBlank = (famille = "pissaladiere") => {
  const d = FAM_DEFAULTS[famille] || FAM_DEFAULTS.pissaladiere;
  const isPissa = isPissaFam(famille);
  return {
    id: null, titre: "", date: new Date().toISOString().slice(0, 10), lieu: "3AD Kitchen, Carros", famille, estimation: false,
    oignon_kg: "", temps_h: isPissa ? 2 : "", temps_min: isPissa ? 10 : "",
    personnel: [{ nom: "", taux: 20 }], taux_local: 15, transport: 0,
    huile_cl: isPissa ? 50 : 0, sel_g: isPissa ? 5 : 0, poivre_g: isPissa ? 3 : 0, anchois_g: isPissa ? 150 : 0, thym_g: isPissa ? 3 : 0, ail_g: isPissa ? 50 : 0,
    px_oignon: 1.39, px_huile: 8, px_sel: 1.5, px_poivre: 55, px_anchois: 22, px_thym: 65, px_ail: 12,
    poids_fini_kg: d.poids_fini_kg != null ? d.poids_fini_kg : "",
    extra: d.extra ? JSON.parse(JSON.stringify(d.extra)) : [],
    frais_extra: [],
    pissa_poids_plaque: "", pissa_nb_plaques: "", pissa_px_vente: "", px_vente_kg: d.px_vente_kg != null ? d.px_vente_kg : "",
    nb_feux: "", kg_par_feu: d.kg_par_feu != null ? d.kg_par_feu : "", temps_cycle_min: d.temps_cycle_min != null ? d.temps_cycle_min : "",
    epluchage_kg_par_min: d.epluchage_kg_par_min != null ? d.epluchage_kg_par_min : "",
    rounds_extra: [], temps_par_ronde_min: isPissa ? 40 : "",
    pots: d.pots ? JSON.parse(JSON.stringify(d.pots)) : [{ type: "pot", format_g: 250, px_bocal: 0.85, px_capuchon: 0.20, px_etiquette: 0.30, nb: "", px_vente: "" }],
  };
};

function pfCalc(f, rendementEstime) {
  const tempsTotal = pfNum(f.temps_h) + pfNum(f.temps_min) / 60;
  let totalMatieres = 0;
  PF_ING.forEach((ing) => { totalMatieres += (pfNum(f[ing.qf]) / ing.div) * pfNum(f[ing.pf]); });
  // fournées supplémentaires du même jour (mêmes prix/unités que la fournée principale, quantités propres à chacune)
  const rondesExtra = f.rounds_extra || [];
  let oignonTotalRondes = pfNum(f.oignon_kg);
  const poidsCuitDe = (oignonCru, poidsFini) => (poidsFini !== "" && poidsFini != null) ? pfNum(poidsFini) : pfNum(oignonCru) * 0.9; // estimé à 90% si non pesé
  let poidsCuitTotalRondes = poidsCuitDe(f.oignon_kg, f.poids_fini_kg);
  let uneEstimationRondes = f.poids_fini_kg === "" || f.poids_fini_kg == null;
  rondesExtra.forEach((r) => {
    PF_ING.forEach((ing) => { totalMatieres += (pfNum(r[ing.qf]) / ing.div) * pfNum(f[ing.pf]); });
    oignonTotalRondes += pfNum(r.oignon_kg);
    poidsCuitTotalRondes += poidsCuitDe(r.oignon_kg, r.poids_fini_kg);
    if (r.poids_fini_kg === "" || r.poids_fini_kg == null) uneEstimationRondes = true;
  });
  const ratioMoyenJour = oignonTotalRondes > 0 ? poidsCuitTotalRondes / oignonTotalRondes : 0;
  const nbRondesTotal = 1 + rondesExtra.length;
  // ingrédients libres (ex. vin blanc) : utilisés à chaque fournée/tournée du jour, donc comptés une fois par fournée
  (f.extra || []).forEach((e) => { const div = (EXTRA_UNITS[e.unit] || EXTRA_UNITS.piece).div; totalMatieres += (pfNum(e.qty) / div) * pfNum(e.price) * nbRondesTotal; });
  const tempsCuissonRondesMin = nbRondesTotal * pfNum(f.temps_par_ronde_min);
  const tauxSum = (f.personnel || []).reduce((s, p) => s + pfNum(p.taux), 0);
  const coutMO = tempsTotal * tauxSum;
  const coutLocal = tempsTotal * pfNum(f.taux_local);
  const coutTransport = pfNum(f.transport);
  const coutFraisExtra = (f.frais_extra || []).reduce((sum, x) => sum + pfNum(x.montant), 0);
  const revientHE = totalMatieres + coutMO + coutLocal + coutTransport + coutFraisExtra;
  const hasRondes = rondesExtra.length > 0;
  let poidsFini = hasRondes ? poidsCuitTotalRondes : (f.poids_fini_kg !== "" && f.poids_fini_kg != null ? pfNum(f.poids_fini_kg) : null);
  let isEstimated = hasRondes ? uneEstimationRondes : false;
  if (!hasRondes && !poidsFini && pfNum(f.oignon_kg) && rendementEstime) { poidsFini = pfNum(f.oignon_kg) * (rendementEstime / 100); isEstimated = true; }
  const oignonBaseRendement = hasRondes ? oignonTotalRondes : pfNum(f.oignon_kg);
  const rendement = (poidsFini && oignonBaseRendement) ? poidsFini / oignonBaseRendement : null;
  const coutKg = poidsFini ? revientHE / poidsFini : null;
  // rendement générique (hors pissaladière) : poids brut = somme des ingrédients pesables (g/kg/ml/cl/L), les ingrédients "à la pièce" (œufs, citrons…) sont exclus faute de poids connu
  let poidsBrut = 0;
  (f.extra || []).forEach((e) => { if (e.unit !== "piece") { const div = (EXTRA_UNITS[e.unit] || EXTRA_UNITS.piece).div; poidsBrut += pfNum(e.qty) / div; } });
  const rendementGeneric = (poidsFini && poidsBrut) ? poidsFini / poidsBrut : null;
  // process de fabrication (production grand volume) : nb de feux x kg par feu x cycles de cuisson sur la durée de prod
  const nbFeux = pfNum(f.nb_feux);
  const tempsCycleMin = pfNum(f.temps_cycle_min);
  const kgParFeu = pfNum(f.kg_par_feu);
  const cyclesParFeu = tempsCycleMin > 0 ? Math.floor((tempsTotal * 60) / tempsCycleMin) : 0;
  const cyclesTotal = cyclesParFeu * nbFeux;
  const tempsCuissonUtiliseMin = cyclesParFeu * tempsCycleMin; // par feu (les feux tournent en parallèle)
  // combien de tournées faut-il pour traiter la quantité d'oignons DEJA SAISIE dans la fournée (sens inverse du calcul ci-dessus)
  const capaciteParTournee = nbFeux * kgParFeu; // kg traités par tournée, tous feux confondus
  const oignonSaisi = pfNum(f.oignon_kg);
  const tourneesNecessaires = capaciteParTournee > 0 && oignonSaisi > 0 ? Math.ceil(oignonSaisi / capaciteParTournee) : 0;
  const tempsNecessaireMin = tourneesNecessaires * tempsCycleMin;
  const quantiteBruteProcess = cyclesTotal * kgParFeu;
  // temps d'épluchage : réparti sur le nombre de personnes déclarées en Main d'œuvre
  const epluchageKgParMin = pfNum(f.epluchage_kg_par_min);
  const nbPersonnelEpluchage = Math.max(1, (f.personnel || []).filter((p) => pfNum(p.taux) > 0 || (p.nom || "").trim() !== "").length || (f.personnel || []).length);
  const tempsEpluchageTotalMin = epluchageKgParMin > 0 ? quantiteBruteProcess / epluchageKgParMin : 0;
  const tempsEpluchageParPersonneMin = nbPersonnelEpluchage > 0 ? tempsEpluchageTotalMin / nbPersonnelEpluchage : tempsEpluchageTotalMin;
  const poidsPissa = pfNum(f.pissa_poids_plaque) * pfNum(f.pissa_nb_plaques);
  const poidsDispoPots = poidsFini != null ? Math.max(0, poidsFini - poidsPissa) : null;
  const pots = f.pots || [];
  let poidsAlloue = 0, coutEmballageTotal = 0, nbPotsTotal = 0, coutProduitTotal = 0, margeTotale = 0, revenuTotal = 0, nbPotsPrix = 0, coutProduitAvecPrix = 0;
  const potLines = pots.map((p) => {
    const nb = pfNum(p.nb);
    const formatKg = pfNum(p.format_g) / 1000;
    const coutAccomp = p.type === "kit"
      ? (p.accompagnements || []).reduce((s, a) => { const div = (EXTRA_UNITS[a.unit] || EXTRA_UNITS.piece).div; return s + (pfNum(a.qty) / div) * pfNum(a.price); }, 0)
      : pfNum(p.px_etiquette);
    const cEmb = pfNum(p.px_bocal) + pfNum(p.px_capuchon) + coutAccomp;
    const cProd = coutKg !== null ? coutKg * formatKg : null;
    const cTot = cProd !== null ? cProd + cEmb : null;
    const pxv = (p.px_vente === "" || p.px_vente == null) ? null : pfNum(p.px_vente);
    const mU = (pxv != null && cTot !== null) ? pxv - cTot : null;
    const coefU = (pxv != null && cTot) ? pxv / cTot : null;
    poidsAlloue += formatKg * nb; coutEmballageTotal += cEmb * nb; nbPotsTotal += nb;
    if (cTot !== null) coutProduitTotal += cTot * nb;
    if (pxv != null) { margeTotale += (mU || 0) * nb; revenuTotal += pxv * nb; nbPotsPrix += nb; if (cTot !== null) coutProduitAvecPrix += cTot * nb; }
    return { ...p, nb, coutUnitaireProduit: cProd, coutUnitaireEmballage: cEmb, coutUnitaireTotal: cTot, margeUnitaire: mU, coefUnitaire: coefU };
  });
  const ecartPoids = poidsDispoPots !== null ? poidsDispoPots - poidsAlloue : null;
  const coutPotMoyen = nbPotsTotal ? coutProduitTotal / nbPotsTotal : null;
  const margeMoyenne = nbPotsPrix ? margeTotale / nbPotsPrix : null;
  const coefMoyen = coutProduitAvecPrix ? revenuTotal / coutProduitAvecPrix : null;
  const prixVenteMoyen = nbPotsPrix ? revenuTotal / nbPotsPrix : null;
  // vente des plaques (pissaladière uniquement) — déclinaison séparée des pots
  const nbPlaques = pfNum(f.pissa_nb_plaques);
  const coutPlaque = (coutKg != null && pfNum(f.pissa_poids_plaque)) ? coutKg * pfNum(f.pissa_poids_plaque) : null;
  const pxVentePlaque = (f.pissa_px_vente === "" || f.pissa_px_vente == null) ? null : pfNum(f.pissa_px_vente);
  const margePlaqueUnit = (pxVentePlaque != null && coutPlaque != null) ? pxVentePlaque - coutPlaque : null;
  const revenuPlaques = pxVentePlaque != null ? pxVentePlaque * nbPlaques : 0;
  const margePlaquesTotal = margePlaqueUnit != null ? margePlaqueUnit * nbPlaques : 0;
  const revenuTotalGlobal = revenuTotal + revenuPlaques;
  const margeTotaleGlobal = margeTotale + margePlaquesTotal;
  return { tempsTotal, totalMatieres, coutMO, coutLocal, coutTransport, coutFraisExtra, revientHE, poidsFini, poidsBrut, rendementGeneric, poidsPissa, poidsDispoPots, isEstimated, rendement, coutKg, potLines, poidsAlloue, ecartPoids, coutEmballageTotal, nbPotsTotal, coutProduitTotal, margeTotale, revenuTotal, coutPotMoyen, margeMoyenne, coefMoyen, prixVenteMoyen, nbPlaques, coutPlaque, pxVentePlaque, margePlaqueUnit, revenuPlaques, margePlaquesTotal, revenuTotalGlobal, margeTotaleGlobal, nbFeux, kgParFeu, tempsCycleMin, cyclesParFeu, cyclesTotal, tempsCuissonUtiliseMin, quantiteBruteProcess, tempsEpluchageTotalMin, tempsEpluchageParPersonneMin, nbPersonnelEpluchage, capaciteParTournee, tourneesNecessaires, tempsNecessaireMin, nbRondesTotal, tempsCuissonRondesMin, oignonTotalRondes, poidsCuitTotalRondes, ratioMoyenJour };
}
const eur2 = (x) => (x == null || isNaN(x)) ? "—" : (Math.round(x * 100) / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
const eur3 = (x) => (x == null || isNaN(x)) ? "—" : (Math.round(x * 1000) / 1000).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 3 }) + " €";

function ProProduction({ pass }) {
  const [batches, setBatches] = useState([]);
  const [rendementEstime, setRendementEstime] = useState(64.3);
  const [famille, setFamille] = useState("pissaladiere");
  const [view, setView] = useState("list"); // list | edit | dash
  const [cur, setCur] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [etab, setEtab] = useState("mat");
  const timer = useRef(null);

  const load = async () => {
    if (!supabase || !pass) return;
    setBusy(true);
    try { const { data } = await supabase.rpc("admin_batches", { pass }); if (data) { setBatches(Array.isArray(data.batches) ? data.batches : []); if (data.rendement != null) setRendementEstime(Number(data.rendement) || 64.3); } } catch (e) {}
    setBusy(false);
  };
  useEffect(() => { load(); }, []);

  const NUM_KEYS = ["oignon_kg", "temps_h", "temps_min", "taux_local", "transport", "poids_fini_kg", "pissa_poids_plaque", "pissa_nb_plaques", "huile_cl", "sel_g", "poivre_g", "anchois_g", "thym_g", "ail_g", "px_oignon", "px_huile", "px_sel", "px_poivre", "px_anchois", "px_thym", "px_ail"];
  const pfNorm = (f) => {
    const o = { ...f };
    NUM_KEYS.forEach((k) => { if (o[k] === "" || o[k] == null) { if (k === "poids_fini_kg") o[k] = ""; else o[k] = 0; } else o[k] = pfNum(o[k]); });
    o.personnel = (o.personnel || []).map((p) => ({ nom: p.nom || "", taux: p.taux === "" || p.taux == null ? 0 : pfNum(p.taux) }));
    o.pots = (o.pots || []).map((p) => ({ format_g: p.format_g === "" || p.format_g == null ? 0 : pfNum(p.format_g), px_bocal: pfNum(p.px_bocal), px_capuchon: pfNum(p.px_capuchon), px_etiquette: pfNum(p.px_etiquette), nb: p.nb === "" || p.nb == null ? "" : pfNum(p.nb), px_vente: p.px_vente === "" || p.px_vente == null ? "" : pfNum(p.px_vente) }));
    o.extra = (o.extra || []).map((e) => ({ label: e.label || "", qty: pfNum(e.qty), price: pfNum(e.price), unit: e.unit || "piece" }));
    o.frais_extra = (o.frais_extra || []).map((x) => ({ label: x.label || "", montant: pfNum(x.montant) }));
    o.famille = f.famille || "pissaladiere";
    return o;
  };
  const persist = async (fRaw) => {
    if (!supabase || !pass) return;
    const f = pfNorm(fRaw);
    try {
      const { data } = await supabase.rpc("admin_save_batch", { pass, p_id: f.id || null, p_data: f, p_date: f.date || null });
      if (data && !f.id) { setCur((c) => c ? { ...c, id: data } : c); f.id = data; }
      setBatches((list) => { const id = f.id || data; const nf = { ...f, id }; const i = list.findIndex((x) => x.id === id); if (i >= 0) { const cp = [...list]; cp[i] = nf; return cp; } return [nf, ...list]; });
      setSaved(true); setTimeout(() => setSaved(false), 1200);
    } catch (e) {}
  };
  const change = (patch) => { setCur((c) => { const nf = { ...c, ...patch }; clearTimeout(timer.current); timer.current = setTimeout(() => persist(nf), 600); return nf; }); };
  const openNew = () => { setCur(pfBlank(famille)); setEtab("mat"); setView("edit"); };
  const openEdit = (f) => { setCur(JSON.parse(JSON.stringify(f))); setEtab("mat"); setView("edit"); };
  const del = async (id) => { if (!window.confirm("Supprimer cette fournée ?")) return; try { await supabase.rpc("admin_delete_batch", { pass, p_id: id }); } catch (e) {} setBatches((l) => l.filter((x) => x.id !== id)); setView("list"); };
  const setRendement = async (v) => { setRendementEstime(v); try { await supabase.rpc("admin_set_rendement", { pass, p_val: v }); } catch (e) {} };

  const R = cur ? pfCalc(cur, rendementEstime) : null;

  // -------- champ numérique --------
  const NF = (l, key, unit, ph, obj, on) => (
    <div style={{ flex: "1 1 120px", minWidth: 110 }}>
      <Lbl>{l}{unit ? <span style={{ color: C.soft, fontWeight: 400 }}> ({unit})</span> : null}</Lbl>
      <input inputMode="decimal" value={obj[key] == null ? "" : String(obj[key]).replace(".", ",")} placeholder={ph || "0"} onChange={(e) => on(key, e.target.value.replace(",", "."))} style={{ ...inp(), marginTop: 4, fontSize: 17, fontWeight: 700, color: C.ink }} />
    </div>
  );

  // -------- jauge de rendement --------
  const Gauge = ({ pct, tag, big }) => {
    const p = Math.max(0, Math.min(100, pct || 0));
    return (
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: big ? 30 : 22, fontWeight: 800, color: PF.navy }}>{pct ? p.toFixed(0) : "—"}<span style={{ fontSize: 14 }}>%</span></span>
          {tag && <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", background: tag === "Mesuré" ? PF.good : PF.ochre, borderRadius: 5, padding: "2px 7px" }}>{tag}</span>}
        </div>
        <div style={{ height: 9, background: "#ebdcb8", borderRadius: 5, overflow: "hidden", marginTop: 6 }}>
          <div style={{ width: p + "%", height: "100%", background: `linear-gradient(90deg, ${PF.ochre}, ${PF.yellow})`, borderRadius: 5, transition: "width .3s" }} />
        </div>
      </div>
    );
  };

  const heroCards = (r, fam) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 14 }}>
      {fam.key === "pissaladiere" ? (
        <div style={{ ...card(), background: "#fff", margin: 0 }}>
          <div style={{ ...h2, marginBottom: 8 }}>Transformation</div>
          <Gauge pct={r.rendement ? r.rendement * 100 : 0} tag={r.rendement ? (r.isEstimated ? "Estimé" : "Mesuré") : null} big />
          <div style={{ fontSize: 11.5, color: C.soft, marginTop: 7 }}>{r.poidsFini ? `${r.poidsFini.toFixed(2)} kg cuits` : "poids à peser"}</div>
        </div>
      ) : (
        <div style={{ ...card(), background: "#fff", margin: 0 }}>
          <div style={{ ...h2, marginBottom: 8 }}>Transformation</div>
          {(() => {
            const pct = r.rendementGeneric != null ? r.rendementGeneric * 100 : null;
            return (
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: PF.navy }}>{pct != null ? pct.toFixed(0) : "—"}<span style={{ fontSize: 14 }}>%</span></span>
                  {pct != null && <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", background: PF.good, borderRadius: 5, padding: "2px 7px" }}>Mesuré</span>}
                </div>
                <div style={{ height: 9, background: "#ebdcb8", borderRadius: 5, overflow: "hidden", marginTop: 6 }}>
                  <div style={{ width: Math.max(0, Math.min(100, pct || 0)) + "%", height: "100%", background: `linear-gradient(90deg, ${PF.ochre}, ${PF.yellow})`, borderRadius: 5, transition: "width .3s" }} />
                </div>
              </div>
            );
          })()}
          <div style={{ fontSize: 11.5, color: C.soft, marginTop: 7 }}>{(r.poidsFini && r.poidsBrut) ? `${r.poidsFini.toFixed(2)} kg cuit / ${r.poidsBrut.toFixed(2)} kg cru` : "poids cru (ingrédients) et cuit à renseigner"}</div>
        </div>
      )}
      <div style={{ ...card(), background: PF.navy, color: "#fff", margin: 0, border: "none" }}>
        <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".1em", opacity: .8 }}>Coût de revient</div>
        <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{eur2(r.coutKg)}<span style={{ fontSize: 13, opacity: .8 }}>/kg</span></div>
        <div style={{ fontSize: 11.5, opacity: .75, marginTop: 3 }}>revient total {eur2(r.revientHE)}</div>
      </div>
      <div style={{ ...card(), background: "#fff", margin: 0 }}>
        <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".1em", color: C.soft }}>Coût / {fam.unitWord} moyen</div>
        <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: PF.navy }}>{eur3(r.coutPotMoyen)}</div>
        <div style={{ fontSize: 11.5, color: C.soft, marginTop: 3 }}>{r.nbPotsTotal || 0} {fam.unitWord}(s)</div>
      </div>
      <div style={{ ...card(), background: "#fff", margin: 0 }}>
        <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".1em", color: C.soft }}>Coefficient moyen</div>
        <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: PF.ochre }}>{r.coefMoyen ? "×" + r.coefMoyen.toFixed(2) : "—"}</div>
        <div style={{ fontSize: 11.5, color: C.soft, marginTop: 3 }}>PV moyen {eur2(r.prixVenteMoyen)}</div>
      </div>
      <div style={{ ...card(), background: r.margeMoyenne >= 0 ? "#e7f0e8" : "#faece5", margin: 0, borderColor: r.margeMoyenne >= 0 ? PF.good + "55" : PF.warn + "55" }}>
        <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".1em", color: C.soft }}>Marge / {fam.unitWord}</div>
        <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: r.margeMoyenne >= 0 ? PF.good : PF.warn }}>{eur3(r.margeMoyenne)}</div>
        <div style={{ fontSize: 11.5, color: C.soft, marginTop: 3 }}>marge totale {eur2(r.margeTotale)}</div>
      </div>
    </div>
  );

  // ================= VUE LISTE =================
  if (view === "list") {
    const isPissa = isPissaFam(famille);
    const famBatches = batches.filter((b) => (b.famille || "pissaladiere") === famille);
    const cols = isPissa ? ["Date", "Titre", "Oignon", "Cuit", "Rdt", "Coût/kg", "Coef", "Marge/pot"] : ["Date", "Titre", "Poids fini", "Coût/kg", "Coef", "Marge/unité"];
    return (
      <div className="ca-anim">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          <div><h2 style={{ fontFamily: SCRIPT, fontSize: 24, margin: 0, color: C.jam }}>Contrôle de gestion</h2><div style={{ fontSize: 13, color: C.soft, marginTop: 3 }}>Pilotage des fournées · coût de revient & marges</div></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setView("dash")} className="ca-tap" style={{ background: "#fff", border: `1px solid ${C.line}`, color: C.jam, borderRadius: 10, padding: "10px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><BarChart3 size={15} /> Analyse</button>
            <button onClick={openNew} className="ca-tap" style={{ background: C.jam, color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Plus size={15} /> Fournée</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {FAMILLES.map((fm) => (
            <button key={fm.key} onClick={() => setFamille(fm.key)} className="ca-tap" style={{ flex: "1 1 auto", border: `1px solid ${famille === fm.key ? C.jam : C.line}`, background: famille === fm.key ? C.jam : "#fff", color: famille === fm.key ? "#fff" : C.ink, borderRadius: 999, padding: "9px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{fm.label}</button>
          ))}
        </div>

        {isPissa && (
          <div style={{ ...card(), background: "#fff7e0", borderColor: PF.yellow + "66", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12.5, color: C.ink, flex: 1, minWidth: 200 }}><b>Taux de transformation estimé</b><br /><span style={{ color: C.soft }}>utilisé tant que le poids cuit n'est pas pesé</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input inputMode="decimal" value={rendementEstime} onChange={(e) => setRendement(pfNum(e.target.value))} style={{ ...inp(), width: 80, textAlign: "center" }} />
              <span style={{ fontWeight: 700, color: PF.navy }}>%</span>
            </div>
          </div>
        )}

        {famBatches.length === 0 ? <div style={{ ...card(), fontSize: 13, color: C.soft }}>{busy ? "Chargement…" : `Aucune fournée « ${famOf(famille).label} ». Créez la première avec le bouton « Fournée ».`}</div> : (
          <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden", background: C.paper }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 640 }}>
                <thead><tr>
                  {cols.map((t, i) => <th key={i} style={{ padding: "9px 8px", textAlign: i > 1 ? "right" : "left", fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: C.soft, fontWeight: 700, borderBottom: `2px solid ${C.line}`, whiteSpace: "nowrap" }}>{t}</th>)}
                </tr></thead>
                <tbody>
                  {famBatches.map((f, i) => { const r = pfCalc(f, rendementEstime); return (
                    <tr key={f.id} onClick={() => openEdit(f)} className="ca-tap" style={{ cursor: "pointer", background: f.estimation ? "#fff7e0" : (i % 2 ? "#ffffff66" : "transparent"), borderBottom: `1px solid ${C.line}` }}>
                      <td style={{ padding: "10px 8px", fontWeight: 600, whiteSpace: "nowrap" }}>{f.date ? new Date(f.date).toLocaleDateString("fr-FR") : "—"}</td>
                      <td style={{ padding: "10px 8px", color: f.titre ? C.ink : C.soft, fontWeight: f.titre ? 600 : 400, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.titre || f.lieu || "—"}{f.estimation && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 800, color: "#fff", background: PF.ochre, borderRadius: 5, padding: "1px 5px" }}>EST.</span>}</td>
                      {isPissa && <td style={{ padding: "10px 8px", textAlign: "right" }}>{pfNum(f.oignon_kg) || "—"}{pfNum(f.oignon_kg) ? " kg" : ""}</td>}
                      <td style={{ padding: "10px 8px", textAlign: "right" }}>{r.poidsFini ? r.poidsFini.toFixed(2) + " kg" : "—"}{r.isEstimated ? "*" : ""}</td>
                      {isPissa && <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 600, color: PF.navy }}>{r.rendement ? (r.rendement * 100).toFixed(0) + "%" : "—"}</td>}
                      <td style={{ padding: "10px 8px", textAlign: "right", whiteSpace: "nowrap" }}>{eur2(r.coutKg)}</td>
                      <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, color: PF.ochre }}>{r.coefMoyen ? "×" + r.coefMoyen.toFixed(2) : "—"}</td>
                      <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, color: r.margeMoyenne >= 0 ? PF.good : PF.warn, whiteSpace: "nowrap" }}>{eur3(r.margeMoyenne)}</td>
                    </tr>
                  ); })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div style={{ fontSize: 11.5, color: C.soft, marginTop: 8 }}>{isPissa ? "* rendement estimé (poids non pesé). " : ""}Touchez une ligne pour ouvrir la fournée.</div>
      </div>
    );
  }

  // ================= VUE ANALYSE (dashboard) =================
  if (view === "dash") {
    const isPissa = isPissaFam(famille);
    const rows = batches.filter((b) => (b.famille || "pissaladiere") === famille).map((f) => ({ f, r: pfCalc(f, rendementEstime) })).filter((x) => x.r.coutKg != null).reverse();
    const bar = (title, get, fmt, col) => {
      const vals = rows.map((x) => get(x)).filter((v) => v != null && !isNaN(v));
      const mx = Math.max(1, ...vals);
      return (
        <div style={card()}>
          <div style={{ ...h2 }}>{title}</div>
          {rows.length === 0 ? <div style={{ fontSize: 13, color: C.soft }}>Pas assez de données.</div> : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 130 }}>
              {rows.map((x, i) => { const v = get(x); return (
                <div key={i} title={`${x.f.date} · ${fmt(v)}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", minWidth: 0 }}>
                  <div style={{ fontSize: 8.5, color: C.soft, marginBottom: 2, whiteSpace: "nowrap" }}>{v != null ? fmt(v) : ""}</div>
                  <div style={{ width: "100%", height: `${Math.max(v ? 4 : 1, (v / mx) * 80)}%`, background: col, borderRadius: "4px 4px 0 0" }} />
                  <div style={{ fontSize: 8, color: C.soft, marginTop: 3, whiteSpace: "nowrap" }}>{x.f.date ? new Date(x.f.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) : ""}</div>
                </div>
              ); })}
            </div>
          )}
        </div>
      );
    };
    return (
      <div className="ca-anim">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <button onClick={() => setView("list")} className="ca-tap" style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 9, width: 36, height: 36, cursor: "pointer", display: "grid", placeItems: "center", color: C.jam }}><ChevronLeft size={18} /></button>
          <div><h2 style={{ fontFamily: SCRIPT, fontSize: 23, margin: 0, color: C.jam }}>Analyse — {famOf(famille).label}</h2><div style={{ fontSize: 12.5, color: C.soft }}>{rows.length} fournée(s) exploitable(s)</div></div>
        </div>
        {bar("Transformation par fournée — cru → cuit (%)", (x) => isPissa ? (x.r.rendement ? x.r.rendement * 100 : null) : (x.r.rendementGeneric != null ? x.r.rendementGeneric * 100 : null), (v) => v.toFixed(0) + "%", PF.navy)}
        {bar("Coût de revient / kg", (x) => x.r.coutKg, (v) => eur2(v), PF.ochre)}
        {bar("Coefficient multiplicateur moyen", (x) => x.r.coefMoyen, (v) => "×" + v.toFixed(2), PF.good)}
        {bar(`Coût des contenants / ${famOf(famille).unitWord}`, (x) => x.r.nbPotsTotal ? x.r.coutEmballageTotal / x.r.nbPotsTotal : null, (v) => eur3(v), PF.yellow)}
      </div>
    );
  }

  // ================= VUE ÉDITEUR =================
  const f = cur;
  const FAM = famOf(f.famille || "pissaladiere");
  const isPissa = isPissaFam(FAM.key);
  return (
    <div className="ca-anim">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button onClick={() => setView("list")} className="ca-tap" style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 9, width: 36, height: 36, cursor: "pointer", display: "grid", placeItems: "center", color: C.jam, flexShrink: 0 }}><ChevronLeft size={18} /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ fontFamily: SCRIPT, fontSize: 23, margin: 0, color: C.jam, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.titre ? f.titre : `Fournée · ${FAM.label}`}</h2>
            {f.estimation && <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: PF.ochre, borderRadius: 6, padding: "3px 8px", flexShrink: 0, letterSpacing: ".03em" }}>ESTIMATION</span>}
          </div>
          <div style={{ fontSize: 12, color: saved ? PF.good : C.soft }}>{f.titre ? FAM.label + " · " : ""}{saved ? "✓ enregistré" : "enregistrement automatique"}</div>
        </div>
        {f.id && <button onClick={() => del(f.id)} className="ca-tap" style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.soft, borderRadius: 9, padding: "9px 12px", fontSize: 12.5, cursor: "pointer", flexShrink: 0 }}><Trash2 size={15} /></button>}
      </div>

      {heroCards(R, FAM)}

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {[["mat", "Matières"], ["mo", "Main d'œuvre & frais"], ["pot", "Contenants & vente"]].map(([k, l]) => (
          <button key={k} onClick={() => setEtab(k)} className="ca-tap" style={{ flex: "1 1 auto", border: `1px solid ${etab === k ? C.jam : C.line}`, background: etab === k ? C.jam : "#fff", color: etab === k ? "#fff" : C.ink, borderRadius: 999, padding: "9px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{l}</button>
        ))}
      </div>

      {etab === "mat" && (
        <div style={card()}>
          <button onClick={() => change({ estimation: !f.estimation })} className="ca-tap" style={{ width: "100%", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, background: f.estimation ? "#fff7e0" : "#f7f4ec", border: `1.5px solid ${f.estimation ? PF.yellow : C.line}`, borderRadius: 12, padding: "11px 13px", cursor: "pointer", textAlign: "left" }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${f.estimation ? PF.ochre : C.soft}`, background: f.estimation ? PF.ochre : "transparent", display: "grid", placeItems: "center", flexShrink: 0 }}>{f.estimation && <Check size={13} color="#fff" />}</span>
            <span style={{ flex: 1 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>Estimation / pronostic</span>
              <span style={{ display: "block", fontSize: 11.5, color: C.soft, marginTop: 1 }}>Fournée hypothétique (ex. simulation grande capacité) — n'affecte pas tes vraies statistiques de production.</span>
            </span>
          </button>
          <div style={{ marginBottom: 10 }}>
            <Lbl>Titre de la fournée</Lbl>
            <input value={f.titre || ""} placeholder={`ex. ${FAM.label === "Confiture" ? "Confiture fraise, Confiture citron…" : FAM.label + " — variante…"}`} onChange={(e) => change({ titre: e.target.value })} style={{ ...inp(), marginTop: 4, fontSize: 15, fontWeight: 600 }} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: "1 1 140px" }}><Lbl>Date</Lbl><input type="date" value={f.date || ""} onChange={(e) => change({ date: e.target.value })} style={{ ...inp(), marginTop: 4 }} /></div>
            <div style={{ flex: "2 1 200px" }}><Lbl>Lieu de production</Lbl><input value={f.lieu || ""} placeholder="ex. 3AD Kitchen, Carros" onChange={(e) => change({ lieu: e.target.value })} style={{ ...inp(), marginTop: 4 }} /></div>
          </div>
          <div style={{ ...h2 }}>{FAM.ingLabel}</div>
          {FAM.key === "confiture" && (
            <div style={{ background: "#fff7e0", border: `1px solid ${PF.yellow}66`, borderRadius: 10, padding: "9px 12px", marginBottom: 12, fontSize: 12, color: C.ink, lineHeight: 1.5 }}>
              <b>Principe :</b> 1 kg de fruit · 500 g de sucre · 1 citron (sauf agrumes : oranges amères/douces) · un peu de vanille selon le fruit.
            </div>
          )}
          {isPissa && PF_ING.map((ing) => {
            const chosenUnit = pfDisplayUnit(f, ing);
            const opts = Object.keys(PF_UNIT_OPTS[ing.family]);
            const sameUnit = chosenUnit === ing.unit;
            const isEmpty = f[ing.qf] == null || f[ing.qf] === "";
            // si l'unité affichée est l'unité native (cas normal), on affiche/stocke le texte brut tel quel (pas de recalcul à chaque frappe, la virgule ne saute plus)
            const displayVal = sameUnit ? f[ing.qf] : (isEmpty ? "" : Math.round(pfDisplayVal(f, ing) * 1000) / 1000);
            return (
              <div key={ing.key} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div style={{ width: 90, flexShrink: 0, display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: C.ink }}><span style={{ width: 10, height: 10, borderRadius: 3, background: ing.color, display: "inline-block" }} />{ing.label}</div>
                  <div style={{ flex: "1 1 90px", minWidth: 80 }}>
                    <Lbl>Quantité</Lbl>
                    <input inputMode="decimal" value={displayVal == null || displayVal === "" ? "" : String(displayVal).replace(".", ",")} placeholder="0" onChange={(e) => {
                      const raw = e.target.value.replace(",", ".");
                      const stored = sameUnit ? raw : (raw === "" ? "" : Math.round(pfParseToStorage(raw, ing, chosenUnit) * 1000) / 1000);
                      if (ing.key === "oignon" && raw !== "" && !isNaN(parseFloat(raw))) {
                        const baseKg = pfNum(raw) / PF_UNIT_OPTS.weight[chosenUnit];
                        change({ [ing.qf]: stored, ...pfSuggestRecipe(f, baseKg) });
                      } else {
                        change({ [ing.qf]: stored });
                      }
                    }} style={{ ...inp(), marginTop: 4, fontSize: 17, fontWeight: 700 }} />
                  </div>
                  <div style={{ flex: "0 1 64px", minWidth: 58 }}>
                    <Lbl>Unité</Lbl>
                    <select value={chosenUnit} onChange={(e) => change({ [ing.key + "_unit"]: e.target.value })} style={{ ...inp(), marginTop: 4, fontSize: 13, padding: "9px 6px" }}>
                      {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", paddingLeft: 98 }}>
                  <div style={{ flex: "1 1 100px", minWidth: 90 }}>
                    <Lbl>Réf. /kg oignon</Lbl>
                    {ing.key === "oignon" ? (
                      <div style={{ marginTop: 4, height: 40, display: "flex", alignItems: "center", fontSize: 12, color: C.soft, fontStyle: "italic" }}>base</div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <input inputMode="decimal" value={String(Math.round(pfRefRatio(f, ing) * 1000) / 1000).replace(".", ",")} onChange={(e) => change({ [ing.key + "_ref"]: e.target.value.replace(",", ".") })} style={{ ...inp(), marginTop: 4, fontSize: 13, padding: "9px 6px", color: PF.navy, fontWeight: 700, width: "100%" }} />
                        <span style={{ fontSize: 10.5, color: C.soft, flexShrink: 0 }}>{ing.unit}/kg</span>
                      </div>
                    )}
                  </div>
                  {NF("Prix", ing.pf, ing.pu, "0", f, (k, v) => change({ [k]: v }))}
                </div>
              </div>
            );
          })}

          {isPissa && (() => {
            const rondes = f.rounds_extra || [];
            const updateRonde = (idx, patch) => { const arr = [...rondes]; arr[idx] = { ...arr[idx], ...patch }; change({ rounds_extra: arr }); };
            const cloneFrom = (source) => {
              const clone = {};
              PF_ING.forEach((ing) => { clone[ing.qf] = source[ing.qf]; });
              clone.nb_feux = source.nb_feux != null ? source.nb_feux : f.nb_feux;
              clone.temps_cuisson_min = source.temps_cuisson_min != null ? source.temps_cuisson_min : f.temps_cycle_min;
              change({ rounds_extra: [...rondes, clone] });
            };
            const removeRonde = (idx) => change({ rounds_extra: rondes.filter((_, j) => j !== idx) });
            return (
              <div style={{ marginTop: 18 }}>
                <div style={{ ...h2 }}>Fournées supplémentaires (même jour)</div>
                <div style={{ fontSize: 11.5, color: C.soft, marginBottom: 10, lineHeight: 1.4 }}>Pour saisir plusieurs cuissons distinctes faites le même jour, avec des quantités différentes à chaque fois. « Dupliquer » recopie les unités déjà choisies — modifie juste les chiffres.</div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                  <button onClick={() => cloneFrom(f)} className="ca-tap" style={{ background: "#fff", border: `1px dashed ${C.jam}`, color: C.jam, borderRadius: 8, padding: "7px 12px", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>+ Dupliquer la fournée ci-dessus</button>
                </div>
                {rondes.map((r, idx) => {
                  const rNbFeux = pfNum(r.nb_feux);
                  const rKgParFeu = pfNum(f.kg_par_feu);
                  const rOignon = pfNum(r.oignon_kg);
                  const rTournees = rNbFeux > 0 && rKgParFeu > 0 && rOignon > 0 ? Math.ceil(rOignon / (rNbFeux * rKgParFeu)) : 0;
                  const rTempsTotal = rTournees * pfNum(r.temps_cuisson_min);
                  return (
                  <div key={idx} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 10, marginBottom: 8, background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <b style={{ fontSize: 12.5, color: PF.navy }}>Fournée {idx + 2}</b>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => cloneFrom(r)} className="ca-tap" style={{ background: "#fff", border: `1px solid ${C.line}`, color: C.soft, borderRadius: 6, padding: "4px 9px", fontSize: 10.5, fontWeight: 700, cursor: "pointer" }}>Dupliquer</button>
                        <button onClick={() => removeRonde(idx)} className="ca-tap" style={{ background: "transparent", border: "none", color: C.soft, cursor: "pointer", lineHeight: 0 }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {PF_ING.filter((ing) => ing.key === "oignon").map((ing) => {
                        const chosenUnit = pfDisplayUnit(f, ing);
                        const sameUnit = chosenUnit === ing.unit;
                        const isEmpty = r[ing.qf] == null || r[ing.qf] === "";
                        const dv = sameUnit ? r[ing.qf] : (isEmpty ? "" : Math.round((pfNum(r[ing.qf]) / PF_UNIT_OPTS[ing.family][ing.unit]) * PF_UNIT_OPTS[ing.family][chosenUnit] * 1000) / 1000);
                        return (
                          <div key={ing.key} style={{ flex: "1 1 80px", minWidth: 72 }}>
                            <Lbl>{ing.label} cru ({chosenUnit})</Lbl>
                            <input inputMode="decimal" value={dv == null || dv === "" ? "" : String(dv).replace(".", ",")} placeholder="0" onChange={(e) => {
                              const raw = e.target.value.replace(",", ".");
                              const stored = sameUnit ? raw : (raw === "" ? "" : Math.round((pfNum(raw) / PF_UNIT_OPTS[ing.family][chosenUnit]) * PF_UNIT_OPTS[ing.family][ing.unit] * 1000) / 1000);
                              if (raw !== "" && !isNaN(parseFloat(raw))) {
                                const baseKg = pfNum(raw) / PF_UNIT_OPTS.weight[chosenUnit];
                                updateRonde(idx, { [ing.qf]: stored, ...pfSuggestRecipe(f, baseKg) });
                              } else {
                                updateRonde(idx, { [ing.qf]: stored });
                              }
                            }} style={{ ...inp(), marginTop: 4, fontSize: 14, fontWeight: 700, padding: "8px 8px" }} />
                          </div>
                        );
                      })}
                      <div style={{ flex: "1 1 80px", minWidth: 72 }}>
                        <Lbl>Oignons cuits (kg)</Lbl>
                        <input inputMode="decimal" value={r.poids_fini_kg == null || r.poids_fini_kg === "" ? "" : String(r.poids_fini_kg).replace(".", ",")} placeholder={rOignon > 0 ? String(Math.round(rOignon * 0.9 * 100) / 100).replace(".", ",") : "0"} onChange={(e) => updateRonde(idx, { poids_fini_kg: e.target.value.replace(",", ".") })} style={{ ...inp(), marginTop: 4, fontSize: 14, fontWeight: 700, padding: "8px 8px" }} />
                      </div>
                      {rOignon > 0 && (() => {
                        const rEstime = r.poids_fini_kg === "" || r.poids_fini_kg == null;
                        const rRatio = Math.round((((rEstime ? rOignon * 0.9 : pfNum(r.poids_fini_kg))) / rOignon) * 1000) / 10;
                        return (
                          <div style={{ flex: "0 1 110px", minWidth: 100, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                            <Lbl>Ratio</Lbl>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                              <span style={{ fontSize: 22, fontWeight: 800, color: PF.navy }}>{rRatio}<span style={{ fontSize: 12 }}>%</span></span>
                              <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: rEstime ? PF.ochre : PF.good, borderRadius: 5, padding: "2px 6px" }}>{rEstime ? "Estimé" : "Mesuré"}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8, background: "#f7f4ec", borderRadius: 8, padding: 8 }}>
                      <div style={{ flex: "1 1 80px", minWidth: 72 }}>
                        <Lbl>Nombre de feux</Lbl>
                        <input inputMode="decimal" value={r.nb_feux == null ? "" : String(r.nb_feux).replace(".", ",")} placeholder="0" onChange={(e) => updateRonde(idx, { nb_feux: e.target.value.replace(",", ".") })} style={{ ...inp(), marginTop: 4, fontSize: 14, fontWeight: 700, padding: "8px 8px" }} />
                      </div>
                      <div style={{ flex: "1 1 80px", minWidth: 72 }}>
                        <Lbl>Temps de cuisson (min)</Lbl>
                        <input inputMode="decimal" value={r.temps_cuisson_min == null ? "" : String(r.temps_cuisson_min).replace(".", ",")} placeholder="40" onChange={(e) => updateRonde(idx, { temps_cuisson_min: e.target.value.replace(",", ".") })} style={{ ...inp(), marginTop: 4, fontSize: 14, fontWeight: 700, padding: "8px 8px" }} />
                      </div>
                      {rTournees > 0 && (
                        <div style={{ flex: "2 1 200px", minWidth: 180, display: "flex", alignItems: "center", fontSize: 11.5, color: C.ink }}>
                          {rOignon} kg ÷ ({rNbFeux} feux × {rKgParFeu} kg/feu réf.) = <b style={{ margin: "0 4px", color: PF.navy }}>{rTournees} rotation{rTournees > 1 ? "s" : ""}</b> × {pfNum(r.temps_cuisson_min)} min = <b style={{ marginLeft: 4, color: PF.navy }}>{Math.round(rTempsTotal)} min</b>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                      {PF_ING.filter((ing) => ing.key !== "oignon").map((ing) => {
                        const chosenUnit = pfDisplayUnit(f, ing);
                        const sameUnit = chosenUnit === ing.unit;
                        const isEmpty = r[ing.qf] == null || r[ing.qf] === "";
                        const dv = sameUnit ? r[ing.qf] : (isEmpty ? "" : Math.round((pfNum(r[ing.qf]) / PF_UNIT_OPTS[ing.family][ing.unit]) * PF_UNIT_OPTS[ing.family][chosenUnit] * 1000) / 1000);
                        return (
                          <div key={ing.key} style={{ flex: "1 1 80px", minWidth: 72 }}>
                            <Lbl>{ing.label} ({chosenUnit})</Lbl>
                            <input inputMode="decimal" value={dv == null || dv === "" ? "" : String(dv).replace(".", ",")} placeholder="0" onChange={(e) => {
                              const raw = e.target.value.replace(",", ".");
                              const stored = sameUnit ? raw : (raw === "" ? "" : Math.round((pfNum(raw) / PF_UNIT_OPTS[ing.family][chosenUnit]) * PF_UNIT_OPTS[ing.family][ing.unit] * 1000) / 1000);
                              updateRonde(idx, { [ing.qf]: stored });
                            }} style={{ ...inp(), marginTop: 4, fontSize: 14, fontWeight: 700, padding: "8px 8px" }} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  );
                })}
                <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 4 }}>
                  {NF("Temps par fournée", "temps_par_ronde_min", "min", "40", f, (k, v) => change({ [k]: v }))}
                </div>
                {R.nbRondesTotal > 1 && (
                  <div style={{ marginTop: 8, background: "#f6efdd", borderRadius: 10, padding: "10px 12px", fontSize: 12.5, color: C.ink, lineHeight: 1.6 }}>
                    <div>{R.nbRondesTotal} fournées × {pfNum(f.temps_par_ronde_min)} min = <b style={{ color: PF.navy }}>{Math.round(R.tempsCuissonRondesMin)} min</b> de cuisson au total ({(R.tempsCuissonRondesMin / 60).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} h) — le reste du temps de prod ({R.tempsTotal.toLocaleString("fr-FR")} h indiquées en Main d'œuvre) peut servir à éplucher/préparer la suite.</div>
                    <div style={{ marginTop: 4 }}>Cumul du jour : <b style={{ color: PF.navy }}>{R.oignonTotalRondes.toLocaleString("fr-FR")} kg cru</b> → <b style={{ color: PF.good }}>{R.poidsCuitTotalRondes.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} kg cuit</b> — ratio moyen du jour : <b style={{ color: PF.navy }}>{Math.round(R.ratioMoyenJour * 1000) / 10}%</b></div>
                  </div>
                )}
              </div>
            );
          })()}

          {(f.extra || []).map((e, i) => (
            <div key={"x" + i} style={{ display: "flex", gap: 8, alignItems: "flex-end", padding: "6px 0", borderBottom: `1px solid ${C.line}`, flexWrap: "wrap" }}>
              <div style={{ flex: "2 1 130px", minWidth: 110 }}>
                <Lbl>Ingrédient</Lbl>
                <input value={e.label || ""} placeholder="ex. Fraises" onChange={(ev) => { const ex = [...f.extra]; ex[i] = { ...ex[i], label: ev.target.value }; change({ extra: ex }); }} style={{ ...inp(), marginTop: 4, fontSize: 13 }} />
              </div>
              <div style={{ flex: "1 1 70px", minWidth: 64 }}><Lbl>Quantité</Lbl><input inputMode="decimal" value={e.qty == null ? "" : String(e.qty).replace(".", ",")} placeholder="0" onChange={(ev) => { const ex = [...f.extra]; ex[i] = { ...ex[i], qty: ev.target.value.replace(",", ".") }; change({ extra: ex }); }} style={{ ...inp(), marginTop: 4, fontSize: 17, fontWeight: 700 }} /></div>
              <div style={{ flex: "0 1 68px", minWidth: 62 }}>
                <Lbl>Unité</Lbl>
                <select value={e.unit || "piece"} onChange={(ev) => { const ex = [...f.extra]; ex[i] = { ...ex[i], unit: ev.target.value }; change({ extra: ex }); }} style={{ ...inp(), marginTop: 4, fontSize: 13, padding: "9px 6px" }}>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="cl">cl</option>
                  <option value="L">L</option>
                  <option value="piece">pièce</option>
                </select>
              </div>
              <div style={{ flex: "1 1 90px", minWidth: 80 }}><Lbl>Prix ({(EXTRA_UNITS[e.unit] || EXTRA_UNITS.piece).pu})</Lbl><input inputMode="decimal" value={e.price == null ? "" : String(e.price).replace(".", ",")} placeholder="0" onChange={(ev) => { const ex = [...f.extra]; ex[i] = { ...ex[i], price: ev.target.value.replace(",", ".") }; change({ extra: ex }); }} style={{ ...inp(), marginTop: 4, fontSize: 17, fontWeight: 700 }} /></div>
              <button onClick={() => change({ extra: f.extra.filter((_, j) => j !== i) })} className="ca-tap" style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.soft, borderRadius: 9, width: 40, height: 40, cursor: "pointer", flexShrink: 0 }}><Trash2 size={15} /></button>
            </div>
          ))}
          <button onClick={() => change({ extra: [...(f.extra || []), { label: "", qty: "", price: "", unit: "g" }] })} className="ca-tap" style={{ marginTop: 10, background: "#fff", border: `1px dashed ${C.jam}`, color: C.jam, borderRadius: 10, padding: "9px 13px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} /> Ajouter un ingrédient</button>
          <div style={{ marginTop: 14, background: PF.navy, color: "#fff", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".12em", opacity: .8 }}>Total matières</span>
            <b style={{ fontSize: 30, fontWeight: 800 }}>{eur2(R.totalMatieres)}</b>
          </div>
          <div style={{ marginTop: 14, ...h2 }}>{isPissa ? "Poids (cru → cuit)" : "Poids obtenu"}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {NF(isPissa ? "Poids cuit — à peser" : "Poids fini (après cuisson/repos)", "poids_fini_kg", "kg", "0", f, (k, v) => change({ [k]: v }))}
          </div>

          {isPissa && (
            <div style={{ marginTop: 18 }}>
              <div style={{ ...h2 }}>Process de fabrication (optionnel — pour estimer une grande quantité)</div>
              <div style={{ fontSize: 11.5, color: C.soft, marginBottom: 10, lineHeight: 1.4 }}>Renseigne aussi le temps de production dans l'onglet « Main d'œuvre & frais » — c'est lui qui détermine combien de cycles de cuisson rentrent dans la journée, et donc la quantité totale produite.</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {NF("Nombre de feux", "nb_feux", "", "0", f, (k, v) => change({ [k]: v }))}
                {NF("Kg d'oignons par feu", "kg_par_feu", "kg", "0", f, (k, v) => change({ [k]: v }))}
                {NF("Temps de cuisson / cycle", "temps_cycle_min", "min", "0", f, (k, v) => change({ [k]: v }))}
              </div>
              {R.cyclesTotal > 0 && (
                <div style={{ marginTop: 10, background: "#f6efdd", borderRadius: 10, padding: "10px 12px", fontSize: 12.5, color: C.ink, lineHeight: 1.7 }}>
                  <div>Temps de prod disponible : <b>{R.tempsTotal.toLocaleString("fr-FR")} h</b></div>
                  <div>Tournées (cycles) par feu : {R.tempsTotal.toLocaleString("fr-FR")} h ÷ {pfNum(f.temps_cycle_min)} min/cycle = <b>{R.cyclesParFeu} cycles/feu</b></div>
                  <div>Temps de cuisson total utilisé : {R.cyclesParFeu} cycles × {pfNum(f.temps_cycle_min)} min = <b>{Math.round(R.tempsCuissonUtiliseMin)} min</b> ({(R.tempsCuissonUtiliseMin / 60).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} h) par feu</div>
                  <div>Tournées totales (tous feux) : {R.cyclesParFeu} cycles/feu × {pfNum(f.nb_feux)} feux = <b>{R.cyclesTotal} cycles</b></div>
                  <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span>→ <b style={{ color: PF.navy }}>{R.quantiteBruteProcess.toLocaleString("fr-FR")} kg d'oignons</b> crus, soit ≈ <b style={{ color: PF.good }}>{(R.quantiteBruteProcess * 0.9).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} kg cuits</b> (rendement 90%, réf. fournée du 09/08)</span>
                    <button onClick={() => {
                      const q = R.quantiteBruteProcess; // kg
                      change({
                        oignon_kg: Math.round(q * 1000) / 1000,
                        ...pfSuggestRecipe(f, q),
                        poids_fini_kg: Math.round(q * 0.9 * 100) / 100,
                      });
                    }} className="ca-tap" style={{ background: PF.navy, color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Appliquer à toute la recette</button>
                  </div>
                </div>
              )}
              {pfNum(f.oignon_kg) > 0 && R.capaciteParTournee > 0 && (
                <div style={{ marginTop: 10, background: "#eef3f6", border: `1px solid ${PF.navy}33`, borderRadius: 10, padding: "10px 12px", fontSize: 12.5, color: C.ink, lineHeight: 1.7 }}>
                  <div style={{ fontWeight: 700, color: PF.navy, marginBottom: 4 }}>Pour traiter les {pfNum(f.oignon_kg).toLocaleString("fr-FR")} kg d'oignons déjà saisis :</div>
                  <div>Capacité par tournée : {pfNum(f.nb_feux)} feux × {pfNum(f.kg_par_feu)} kg = <b>{R.capaciteParTournee} kg/tournée</b></div>
                  <div>Tournées (fournées) nécessaires : {pfNum(f.oignon_kg).toLocaleString("fr-FR")} kg ÷ {R.capaciteParTournee} kg = <b>{R.tourneesNecessaires} tournée{R.tourneesNecessaires > 1 ? "s" : ""}</b></div>
                  <div>Temps total nécessaire : {R.tourneesNecessaires} × {pfNum(f.temps_cycle_min)} min = <b>{Math.round(R.tempsNecessaireMin)} min</b> ({(R.tempsNecessaireMin / 60).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} h)</div>
                  <div>Temps de prod indiqué (Main d'œuvre) : <b>{R.tempsTotal.toLocaleString("fr-FR")} h</b> — {(R.tempsNecessaireMin / 60) <= R.tempsTotal ? <b style={{ color: PF.good }}>✓ ça rentre dans le temps prévu</b> : <b style={{ color: PF.warn }}>⚠ il manque {((R.tempsNecessaireMin / 60) - R.tempsTotal).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} h</b>}</div>
                </div>
              )}
              {FAM.key === "grande_fournee" && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ ...h2 }}>Temps d'épluchage</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
                    {NF("Kg épluchés / min / personne", "epluchage_kg_par_min", "kg", "0,5", f, (k, v) => change({ [k]: v }))}
                    <div style={{ fontSize: 11.5, color: C.soft, paddingBottom: 10 }}>ex. 5 kg épluchés en 10 min par une personne → 0,5 kg/min</div>
                  </div>
                  {R.tempsEpluchageTotalMin > 0 && (
                    <div style={{ marginTop: 8, background: "#f6efdd", borderRadius: 10, padding: "10px 12px", fontSize: 12.5, color: C.ink, lineHeight: 1.6 }}>
                      {R.quantiteBruteProcess.toLocaleString("fr-FR")} kg ÷ {pfNum(f.epluchage_kg_par_min)} kg/min = <b style={{ color: PF.navy }}>{Math.round(R.tempsEpluchageTotalMin)} min</b> d'épluchage au total, soit <b style={{ color: PF.navy }}>{Math.round(R.tempsEpluchageParPersonneMin)} min</b> par personne (réparti sur {R.nbPersonnelEpluchage} personne{R.nbPersonnelEpluchage > 1 ? "s" : ""} déclarée{R.nbPersonnelEpluchage > 1 ? "s" : ""} en Main d'œuvre)
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {etab === "mo" && (
        <div style={card()}>
          <div style={{ ...h2 }}>Temps de production</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            {NF("Temps", "temps_h", "h", "0", f, (k, v) => change({ [k]: v }))}
            {NF("dont", "temps_min", "min", "0", f, (k, v) => change({ [k]: v }))}
          </div>
          <div style={{ ...h2 }}>Personnel (€/h par personne)</div>
          {(f.personnel || []).map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 8 }}>
              <div style={{ flex: "2 1 120px" }}><Lbl>Nom</Lbl><input value={p.nom || ""} placeholder="Nom" onChange={(e) => { const pers = [...f.personnel]; pers[i] = { ...pers[i], nom: e.target.value }; change({ personnel: pers }); }} style={{ ...inp(), marginTop: 4 }} /></div>
              <div style={{ flex: "1 1 90px" }}><Lbl>Taux (€/h)</Lbl><input inputMode="decimal" value={p.taux == null ? "" : String(p.taux).replace(".", ",")} placeholder="0" onChange={(e) => { const pers = [...f.personnel]; pers[i] = { ...pers[i], taux: e.target.value.replace(",", ".") }; change({ personnel: pers }); }} style={{ ...inp(), marginTop: 4 }} /></div>
              <button onClick={() => { const pers = f.personnel.filter((_, j) => j !== i); change({ personnel: pers.length ? pers : [{ nom: "", taux: "" }] }); }} className="ca-tap" style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.soft, borderRadius: 9, width: 40, height: 40, cursor: "pointer", flexShrink: 0 }}><Minus size={15} /></button>
            </div>
          ))}
          <button onClick={() => change({ personnel: [...(f.personnel || []), { nom: "", taux: "" }] })} className="ca-tap" style={{ background: "#fff", border: `1px dashed ${C.jam}`, color: C.jam, borderRadius: 10, padding: "9px 13px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} /> Ajouter une personne</button>
          <div style={{ ...h2, marginTop: 16 }}>Frais</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {NF("Location du local", "taux_local", "€/h", "0", f, (k, v) => change({ [k]: v }))}
            {NF("Transport", "transport", "€", "0", f, (k, v) => change({ [k]: v }))}
          </div>
          {(f.frais_extra || []).map((fr, i) => (
            <div key={"fr" + i} style={{ display: "flex", gap: 8, alignItems: "flex-end", marginTop: 8 }}>
              <div style={{ flex: "2 1 140px" }}><Lbl>Libellé du frais</Lbl><input value={fr.label || ""} placeholder="ex. Gaz, électricité…" onChange={(e) => { const fx = [...f.frais_extra]; fx[i] = { ...fx[i], label: e.target.value }; change({ frais_extra: fx }); }} style={{ ...inp(), marginTop: 4 }} /></div>
              <div style={{ flex: "1 1 90px" }}><Lbl>Montant (€)</Lbl><input inputMode="decimal" value={fr.montant == null ? "" : String(fr.montant).replace(".", ",")} placeholder="0" onChange={(e) => { const fx = [...f.frais_extra]; fx[i] = { ...fx[i], montant: e.target.value.replace(",", ".") }; change({ frais_extra: fx }); }} style={{ ...inp(), marginTop: 4, fontSize: 17, fontWeight: 700 }} /></div>
              <button onClick={() => change({ frais_extra: f.frais_extra.filter((_, j) => j !== i) })} className="ca-tap" style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.soft, borderRadius: 9, width: 40, height: 40, cursor: "pointer", flexShrink: 0 }}><Minus size={15} /></button>
            </div>
          ))}
          <button onClick={() => change({ frais_extra: [...(f.frais_extra || []), { label: "", montant: "" }] })} className="ca-tap" style={{ marginTop: 10, background: "#fff", border: `1px dashed ${C.jam}`, color: C.jam, borderRadius: 10, padding: "9px 13px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} /> Ajouter un frais</button>
          {(() => {
            const tauxSum = (f.personnel || []).reduce((s, p) => s + pfNum(p.taux), 0);
            const tempsAffiche = R.tempsTotal.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
            const tempsManquant = R.tempsTotal === 0 && (tauxSum > 0 || pfNum(f.taux_local) > 0);
            return (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.line}`, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: C.soft }}><span>Matières</span><span style={{ color: C.ink }}>{eur2(R.totalMatieres)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: C.soft, gap: 8 }}><span>Main d'œuvre <span style={{ fontSize: 11, opacity: .7 }}>({tempsAffiche} h × {tauxSum.toLocaleString("fr-FR")} €/h)</span></span><span style={{ color: C.ink, whiteSpace: "nowrap" }}>{eur2(R.coutMO)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: C.soft, gap: 8 }}><span>Local <span style={{ fontSize: 11, opacity: .7 }}>({tempsAffiche} h × {pfNum(f.taux_local).toLocaleString("fr-FR")} €/h)</span></span><span style={{ color: C.ink, whiteSpace: "nowrap" }}>{eur2(R.coutLocal)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: C.soft }}><span>Transport</span><span style={{ color: C.ink }}>{eur2(R.coutTransport)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: C.soft }}><span>Autres frais</span><span style={{ color: C.ink }}>{eur2(R.coutFraisExtra)}</span></div>
                {tempsManquant && (
                  <div style={{ fontSize: 11.5, color: PF.warn, marginTop: 8, background: "#faece5", borderRadius: 8, padding: "7px 10px", lineHeight: 1.4 }}>⚠ Temps de production à 0 h → la main d'œuvre et le local ne sont pas comptés. Renseigne « Temps » et « dont (min) » ci-dessus si la fournée a pris du temps.</div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0 0", fontWeight: 800, color: PF.navy, fontSize: 15 }}><span>Coût de revient total</span><span>{eur2(R.revientHE)}</span></div>
              </div>
            );
          })()}
        </div>
      )}

      {etab === "pot" && (
        <div style={card()}>
          <div style={{ ...h2 }}>Contenants & vente</div>

          <div style={{ background: "#f6efdd", border: `1px solid ${PF.yellow}55`, borderRadius: 12, padding: 12, marginBottom: 14, display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 160px", minWidth: 140 }}>
              <Lbl>Prix de vente au kg (repère)</Lbl>
              <input inputMode="decimal" value={f.px_vente_kg == null ? "" : String(f.px_vente_kg).replace(".", ",")} placeholder="ex. 35" onChange={(e) => change({ px_vente_kg: e.target.value.replace(",", ".") })} style={{ ...inp(), marginTop: 4, fontSize: 17, fontWeight: 700 }} />
            </div>
            <div style={{ fontSize: 11.5, color: C.soft, flex: "2 1 220px" }}>Renseigne un prix au kg : chaque format ci-dessous te proposera son prix de vente calculé automatiquement (modifiable ensuite).</div>
          </div>

          {FAM.key === "kit_pissaladiere" && (() => {
            const kOignon = R.quantiteBruteProcess / 7.7; // ratio vs la fournée de référence (09/08 : 7,7 kg d'oignons)
            const matieresRecette = R.quantiteBruteProcess * 1.39 + (50 * kOignon / 100) * 8 + (50 * kOignon / 1000) * 1.5 + (30 * kOignon / 1000) * 55 + (150 * kOignon / 1000) * 22 + (3 * kOignon / 1000) * 65 + (50 * kOignon / 1000) * 12;
            const cuit = R.quantiteBruteProcess * 0.9;
            const coutTotalProd = matieresRecette + R.coutMO + R.coutLocal;
            const coutKgProd = cuit > 0 ? coutTotalProd / cuit : 0;
            return (
              <div style={{ background: "#eef3f6", border: `1px solid ${PF.navy}33`, borderRadius: 12, padding: 13, marginBottom: 14 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: PF.navy, marginBottom: 8, display: "flex", alignItems: "center", gap: 7 }}><Package size={15} /> Process de fabrication (production de la pissaladière du kit)</div>
                <div style={{ fontSize: 11.5, color: C.soft, marginBottom: 10, lineHeight: 1.4 }}>Calcule combien coûte réellement le kg de pissaladière produit (recette classique, proportionnelle à la fournée du 09/08) — au lieu d'un prix de référence fixe. Renseigne aussi le temps de prod dans « Main d'œuvre & frais ».</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {NF("Nombre de feux", "nb_feux", "", "0", f, (k, v) => change({ [k]: v }))}
                  {NF("Kg d'oignons par feu", "kg_par_feu", "kg", "0", f, (k, v) => change({ [k]: v }))}
                  {NF("Temps de cuisson / cycle", "temps_cycle_min", "min", "0", f, (k, v) => change({ [k]: v }))}
                </div>
                {R.cyclesTotal > 0 && (
                  <div style={{ marginTop: 10, background: "#f6efdd", borderRadius: 10, padding: "10px 12px", fontSize: 12.5, color: C.ink, lineHeight: 1.7 }}>
                    <div>Temps de prod disponible : <b>{R.tempsTotal.toLocaleString("fr-FR")} h</b> · Tournées par feu : {R.tempsTotal.toLocaleString("fr-FR")} h ÷ {pfNum(f.temps_cycle_min)} min = <b>{R.cyclesParFeu} cycles/feu</b></div>
                    <div>Temps de cuisson total utilisé (par feu) : {R.cyclesParFeu} × {pfNum(f.temps_cycle_min)} min = <b>{Math.round(R.tempsCuissonUtiliseMin)} min</b> ({(R.tempsCuissonUtiliseMin / 60).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} h)</div>
                    <div>Tournées totales (tous feux) : {R.cyclesParFeu} × {pfNum(f.nb_feux)} feux = <b>{R.cyclesTotal} cycles</b> → <b style={{ color: PF.navy }}>{R.quantiteBruteProcess.toLocaleString("fr-FR")} kg d'oignons crus</b>, ≈ <b style={{ color: PF.good }}>{cuit.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} kg cuits</b> (rendement 90%)</div>
                    <div style={{ marginTop: 4 }}>Matières recette : {eur2(matieresRecette)} + main d'œuvre {eur2(R.coutMO)} + local {eur2(R.coutLocal)} = {eur2(coutTotalProd)} ÷ {cuit.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} kg = <b style={{ color: PF.navy }}>{eur3(coutKgProd)}/kg</b></div>
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={() => {
                        const idx = (f.extra || []).findIndex((e) => (e.label || "").toLowerCase().startsWith("pissaladière"));
                        const extra = [...(f.extra || [])];
                        const nouveauLabel = `Pissaladière (pot 300 g) — calculé : ${R.cyclesTotal} cycles, ${eur3(coutKgProd)}/kg`;
                        if (idx >= 0) extra[idx] = { ...extra[idx], label: nouveauLabel, price: Math.round(coutKgProd * 1000) / 1000 };
                        change({ extra });
                      }} className="ca-tap" style={{ background: PF.navy, color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Appliquer ce prix à l'ingrédient « Pissaladière »</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {isPissa && (
            <div style={{ background: "#eef3f6", border: `1px solid ${PF.navy}33`, borderRadius: 12, padding: 13, marginBottom: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: PF.navy, marginBottom: 8, display: "flex", alignItems: "center", gap: 7 }}><Package size={15} /> Pissaladière — vendue en plaque (hors pots)</div>
              <div style={{ fontSize: 11.5, color: C.soft, marginBottom: 9, lineHeight: 1.4 }}>Ce poids est déduit du total avant le calcul des pots. Renseigne aussi le prix de vente pour suivre la marge des plaques séparément des pots.</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {NF("Poids par plaque", "pissa_poids_plaque", "kg", "0", f, (k, v) => change({ [k]: v }))}
                {NF("Nombre de plaques", "pissa_nb_plaques", "", "0", f, (k, v) => change({ [k]: v }))}
                {NF("Prix de vente / plaque", "pissa_px_vente", "€", "0", f, (k, v) => change({ [k]: v }))}
              </div>
              {R.poidsPissa > 0 && (
                <div style={{ marginTop: 9, fontSize: 12.5, display: "flex", justifyContent: "space-between", color: C.ink }}>
                  <span style={{ color: C.soft }}>Poids pissaladière</span><b style={{ color: PF.navy }}>{R.poidsPissa.toFixed(2)} kg</b>
                </div>
              )}
              {R.poidsDispoPots != null && (
                <div style={{ marginTop: 3, fontSize: 12.5, display: "flex", justifyContent: "space-between", color: C.ink }}>
                  <span style={{ color: C.soft }}>Poids disponible pour les pots</span><b style={{ color: PF.good }}>{R.poidsDispoPots.toFixed(2)} kg</b>
                </div>
              )}
              {R.coutPlaque != null && (
                <div style={{ marginTop: 3, fontSize: 12.5, display: "flex", justifyContent: "space-between", color: C.ink }}>
                  <span style={{ color: C.soft }}>Coût / plaque</span><b style={{ color: PF.navy }}>{eur3(R.coutPlaque)}</b>
                </div>
              )}
              {R.pxVentePlaque != null && (
                <div style={{ marginTop: 9, paddingTop: 9, borderTop: `1px solid ${PF.navy}22`, display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12.5, color: C.soft, alignItems: "center" }}>
                  <span>Marge/plaque <b style={{ color: R.margePlaqueUnit >= 0 ? PF.good : PF.warn }}>{eur3(R.margePlaqueUnit)}</b></span>
                  <span>Total ventes plaques <b style={{ color: PF.navy }}>{eur2(R.revenuPlaques)}</b></span>
                  <span>Marge totale plaques <b style={{ color: R.margePlaquesTotal >= 0 ? PF.good : PF.warn }}>{eur2(R.margePlaquesTotal)}</b></span>
                </div>
              )}
            </div>
          )}

          {(f.pots || []).map((p, i) => { const pl = R.potLines[i] || {}; const cTot = pl.coutUnitaireTotal; const labels = isPissa ? POT_TYPE_LABELS[p.type || "pot"] : FAM.packLabels; const unitWord = isPissa && p.type === "kit" ? "kit" : FAM.unitWord; return (
            <div key={i} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, marginBottom: 10, background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <b style={{ fontSize: 13, color: PF.navy }}>Format {i + 1}</b>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isPissa && (
                    <div style={{ display: "flex", background: "#f3ede0", borderRadius: 8, padding: 2 }}>
                      {["pot", "kit"].map((t) => (
                        <button key={t} onClick={() => { const pots = [...f.pots]; pots[i] = { ...pots[i], type: t }; change({ pots }); }} className="ca-tap" style={{ border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 11.5, fontWeight: 700, cursor: "pointer", background: (p.type || "pot") === t ? PF.navy : "transparent", color: (p.type || "pot") === t ? "#fff" : C.soft, textTransform: "capitalize" }}>{t}</button>
                      ))}
                    </div>
                  )}
                  {f.pots.length > 1 && <button onClick={() => change({ pots: f.pots.filter((_, j) => j !== i) })} className="ca-tap" style={{ background: "transparent", border: "none", color: C.soft, cursor: "pointer", lineHeight: 0 }}><Trash2 size={15} /></button>}
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                {NF("Format", "format_g", "g", "0", p, (k, v) => { const pots = [...f.pots]; pots[i] = { ...pots[i], [k]: v }; change({ pots }); })}
                {labels[0] && NF(labels[0], "px_bocal", "€", "0", p, (k, v) => { const pots = [...f.pots]; pots[i] = { ...pots[i], [k]: v }; change({ pots }); })}
                {labels[1] && NF(labels[1], "px_capuchon", "€", "0", p, (k, v) => { const pots = [...f.pots]; pots[i] = { ...pots[i], [k]: v }; change({ pots }); })}
                {p.type !== "kit" && labels[2] && NF(labels[2], "px_etiquette", "€", "0", p, (k, v) => { const pots = [...f.pots]; pots[i] = { ...pots[i], [k]: v }; change({ pots }); })}
                {NF(`Nb de ${unitWord}s`, "nb", "", "0", p, (k, v) => { const pots = [...f.pots]; pots[i] = { ...pots[i], [k]: v }; change({ pots }); })}
              </div>
              {p.type === "kit" && (
                <div style={{ marginTop: 10 }}>
                  <Lbl>Accompagnements (huile, anchois, olive…)</Lbl>
                  {(p.accompagnements || []).map((a, ai) => (
                    <div key={ai} style={{ display: "flex", gap: 8, alignItems: "flex-end", padding: "6px 0", borderBottom: `1px solid ${C.line}`, flexWrap: "wrap" }}>
                      <div style={{ flex: "2 1 120px", minWidth: 100 }}>
                        <Lbl>Ingrédient</Lbl>
                        <input value={a.label || ""} placeholder="ex. Huile" onChange={(ev) => { const pots = [...f.pots]; const acc = [...(pots[i].accompagnements || [])]; acc[ai] = { ...acc[ai], label: ev.target.value }; pots[i] = { ...pots[i], accompagnements: acc }; change({ pots }); }} style={{ ...inp(), marginTop: 4, fontSize: 13 }} />
                      </div>
                      <div style={{ flex: "1 1 64px", minWidth: 58 }}><Lbl>Quantité</Lbl><input inputMode="decimal" value={a.qty == null ? "" : String(a.qty).replace(".", ",")} placeholder="0" onChange={(ev) => { const pots = [...f.pots]; const acc = [...(pots[i].accompagnements || [])]; acc[ai] = { ...acc[ai], qty: ev.target.value.replace(",", ".") }; pots[i] = { ...pots[i], accompagnements: acc }; change({ pots }); }} style={{ ...inp(), marginTop: 4, fontSize: 15, fontWeight: 700 }} /></div>
                      <div style={{ flex: "0 1 62px", minWidth: 58 }}>
                        <Lbl>Unité</Lbl>
                        <select value={a.unit || "piece"} onChange={(ev) => { const pots = [...f.pots]; const acc = [...(pots[i].accompagnements || [])]; acc[ai] = { ...acc[ai], unit: ev.target.value }; pots[i] = { ...pots[i], accompagnements: acc }; change({ pots }); }} style={{ ...inp(), marginTop: 4, fontSize: 12.5, padding: "9px 5px" }}>
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="ml">ml</option>
                          <option value="cl">cl</option>
                          <option value="L">L</option>
                          <option value="piece">pièce</option>
                        </select>
                      </div>
                      <div style={{ flex: "1 1 80px", minWidth: 72 }}><Lbl>Prix ({(EXTRA_UNITS[a.unit] || EXTRA_UNITS.piece).pu})</Lbl><input inputMode="decimal" value={a.price == null ? "" : String(a.price).replace(".", ",")} placeholder="0" onChange={(ev) => { const pots = [...f.pots]; const acc = [...(pots[i].accompagnements || [])]; acc[ai] = { ...acc[ai], price: ev.target.value.replace(",", ".") }; pots[i] = { ...pots[i], accompagnements: acc }; change({ pots }); }} style={{ ...inp(), marginTop: 4, fontSize: 15, fontWeight: 700 }} /></div>
                      <button onClick={() => { const pots = [...f.pots]; pots[i] = { ...pots[i], accompagnements: (pots[i].accompagnements || []).filter((_, j) => j !== ai) }; change({ pots }); }} className="ca-tap" style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.soft, borderRadius: 9, width: 36, height: 36, cursor: "pointer", flexShrink: 0 }}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button onClick={() => { const pots = [...f.pots]; pots[i] = { ...pots[i], accompagnements: [...(pots[i].accompagnements || []), { label: "", qty: "", price: "", unit: "piece" }] }; change({ pots }); }} className="ca-tap" style={{ marginTop: 8, background: "#fff", border: `1px dashed ${C.jam}`, color: C.jam, borderRadius: 8, padding: "6px 11px", fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}><Plus size={12} /> Ajouter un accompagnement</button>
                </div>
              )}
              {FAM.key === "grande_fournee" && pfNum(p.nb) > 0 && pfNum(p.format_g) > 0 && (
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => {
                    const poidsCuitNecessaire = pfNum(p.nb) * (pfNum(p.format_g) / 1000);
                    const q = poidsCuitNecessaire / 0.9; // poids cru nécessaire (rendement 90%), kg
                    change({
                      oignon_kg: Math.round(q * 1000) / 1000,
                      ...pfSuggestRecipe(f, q),
                      poids_fini_kg: Math.round(poidsCuitNecessaire * 100) / 100,
                    });
                  }} className="ca-tap" style={{ background: "#fff", border: `1.5px dashed ${PF.navy}`, color: PF.navy, borderRadius: 8, padding: "8px 12px", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>← Calculer les achats nécessaires pour {p.nb} {unitWord}(s)</button>
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 9, alignItems: "flex-end" }}>
                <div style={{ flex: "1 1 120px", minWidth: 110 }}>
                  <Lbl>Coefficient de vente</Lbl>
                  <input inputMode="decimal" value={p.coef_vente == null ? "" : String(p.coef_vente).replace(".", ",")} placeholder="ex. 3" onChange={(e) => { const pots = [...f.pots]; pots[i] = { ...pots[i], coef_vente: e.target.value.replace(",", ".") }; change({ pots }); }} style={{ ...inp(), marginTop: 4, fontSize: 17, fontWeight: 700 }} />
                </div>
                {NF("Prix de vente", "px_vente", "€", "0", p, (k, v) => { const pots = [...f.pots]; pots[i] = { ...pots[i], [k]: v }; change({ pots }); })}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10, fontSize: 12, color: C.soft, alignItems: "center" }}>
                {(() => {
                  const nbAuto = (R.poidsDispoPots && pfNum(p.format_g)) ? Math.floor((R.poidsDispoPots * 1000) / pfNum(p.format_g)) : null;
                  if (nbAuto == null) return null;
                  const dejaBon = pfNum(p.nb) === nbAuto;
                  return (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#f6efdd", borderRadius: 8, padding: "4px 9px" }}>
                      <Package size={13} color={PF.navy} />
                      <span>≈ <b style={{ color: PF.navy }}>{nbAuto} {unitWord}(s)</b> possibles ({R.poidsDispoPots.toFixed(2)} kg ÷ {pfNum(p.format_g)} g)</span>
                      {!dejaBon && <button onClick={() => { const pots = [...f.pots]; pots[i] = { ...pots[i], nb: nbAuto }; change({ pots }); }} className="ca-tap" style={{ background: PF.navy, color: "#fff", border: "none", borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Appliquer</button>}
                    </span>
                  );
                })()}
                {(() => {
                  const coef = pfNum(p.coef_vente);
                  if (!coef || !cTot) return null;
                  const suggestion = Math.round(cTot * coef * 100) / 100;
                  const dejaBon = pfNum(p.px_vente) === suggestion;
                  return (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#f3ece0", borderRadius: 8, padding: "4px 9px" }}>
                      <Percent size={13} color={PF.navy} />
                      <span>≈ <b style={{ color: PF.navy }}>{eur2(suggestion)}</b> suggéré (coût {eur3(cTot)} × {coef.toLocaleString("fr-FR")}) → marge <b style={{ color: PF.good }}>{eur3(suggestion - cTot)}</b></span>
                      {!dejaBon && <button onClick={() => { const pots = [...f.pots]; pots[i] = { ...pots[i], px_vente: suggestion }; change({ pots }); }} className="ca-tap" style={{ background: PF.navy, color: "#fff", border: "none", borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Appliquer</button>}
                    </span>
                  );
                })()}
                {(() => {
                  const pxKg = pfNum(f.px_vente_kg);
                  if (!pxKg || !pfNum(p.format_g)) return null;
                  const suggestion = Math.round(pxKg * pfNum(p.format_g) / 1000 * 100) / 100;
                  const dejaBon = pfNum(p.px_vente) === suggestion;
                  return (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#eef3f6", borderRadius: 8, padding: "4px 9px" }}>
                      <Wallet size={13} color={PF.navy} />
                      <span>≈ <b style={{ color: PF.navy }}>{eur2(suggestion)}</b> suggéré ({pxKg.toLocaleString("fr-FR")} €/kg × {pfNum(p.format_g)} g)</span>
                      {!dejaBon && <button onClick={() => { const pots = [...f.pots]; pots[i] = { ...pots[i], px_vente: suggestion }; change({ pots }); }} className="ca-tap" style={{ background: PF.navy, color: "#fff", border: "none", borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Appliquer</button>}
                    </span>
                  );
                })()}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.line}`, fontSize: 12.5 }}>
                <span style={{ color: C.soft }}>Coût/{unitWord} <b style={{ color: PF.navy }}>{eur3(cTot)}</b></span>
                <span style={{ color: C.soft }}>Marge/{unitWord} <b style={{ color: pl.margeUnitaire >= 0 ? PF.good : PF.warn }}>{eur3(pl.margeUnitaire)}</b></span>
                <span style={{ color: C.soft }}>Coef <b style={{ color: PF.ochre }}>{pl.coefUnitaire ? "×" + pl.coefUnitaire.toFixed(2) : "—"}</b></span>
                {pfNum(p.nb) > 0 && pfNum(p.px_vente) > 0 && <span style={{ color: C.soft }}>Total ventes <b style={{ color: PF.navy }}>{eur2(pfNum(p.nb) * pfNum(p.px_vente))}</b></span>}
                {pfNum(p.nb) > 0 && pl.margeUnitaire != null && <span style={{ color: C.soft }}>Marge totale <b style={{ color: pl.margeUnitaire >= 0 ? PF.good : PF.warn }}>{eur2(pfNum(p.nb) * pl.margeUnitaire)}</b></span>}
              </div>
              {cTot !== null && (
                <div style={{ fontSize: 10.5, color: C.soft, marginTop: 6, fontStyle: "italic", lineHeight: 1.5 }}>
                  détail matière : coût de revient {eur3(R.coutKg)}/kg × {pfNum(p.format_g)} g = <b>{eur3(pl.coutUnitaireProduit)}</b> (produit)
                  <br />détail emballage : {p.type === "kit"
                    ? [labels[0] && `${eur3(p.px_bocal)} (${labels[0]})`, labels[1] && `${eur3(p.px_capuchon)} (${labels[1]})`, ...(p.accompagnements || []).map((a) => a.label && `${eur3((pfNum(a.qty) / (EXTRA_UNITS[a.unit] || EXTRA_UNITS.piece).div) * pfNum(a.price))} (${a.label})`)].filter(Boolean).join(" + ")
                    : [labels[0], labels[1], labels[2]].map((l, li) => l && `${eur3([p.px_bocal, p.px_capuchon, p.px_etiquette][li])} (${l})`).filter(Boolean).join(" + ")
                  } = <b>{eur3(pl.coutUnitaireEmballage)}</b>
                  <br />coût total : {eur3(pl.coutUnitaireProduit)} (produit) + {eur3(pl.coutUnitaireEmballage)} (emballage) = <b>{eur3(cTot)}</b> (coût du {unitWord})
                  {pl.margeUnitaire != null && <><br />marge : {eur2(pfNum(p.px_vente))} (prix de vente) − {eur3(cTot)} (coût) = <b>{eur3(pl.margeUnitaire)}</b></>}
                </div>
              )}
            </div>
          ); })}
          <button onClick={() => change({ pots: [...(f.pots || []), { format_g: "", px_bocal: "", px_capuchon: "", px_etiquette: "", nb: "", px_vente: "" }] })} className="ca-tap" style={{ background: "#fff", border: `1px dashed ${C.jam}`, color: C.jam, borderRadius: 10, padding: "9px 13px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} /> Ajouter un format</button>

          {(R.revenuTotalGlobal > 0 || R.nbPotsTotal > 0) && (
            <div style={{ marginTop: 14, background: PF.navy, color: "#fff", borderRadius: 14, padding: "15px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".1em", opacity: .8 }}>Total ventes ({R.nbPotsTotal} {FAM.unitWord}(s){isPissa && R.nbPlaques > 0 ? ` + ${R.nbPlaques} plaque(s)` : ""})</span>
                <b style={{ fontSize: 26, fontWeight: 800 }}>{eur2(R.revenuTotalGlobal)}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12.5, opacity: .85 }}>
                <span>Marge totale</span><b>{eur2(R.margeTotaleGlobal)}</b>
              </div>
            </div>
          )}

          {R.ecartPoids != null && Math.abs(R.ecartPoids) > 0.05 && (
            <div style={{ marginTop: 12, fontSize: 12, color: R.ecartPoids < 0 ? PF.warn : C.soft, background: R.ecartPoids < 0 ? "#faece5" : "#f6efdd", borderRadius: 9, padding: "9px 11px" }}>
              Écart poids : {R.ecartPoids > 0 ? "+" : ""}{R.ecartPoids.toFixed(2)} kg entre le poids disponible pots ({R.poidsDispoPots ? R.poidsDispoPots.toFixed(2) : "—"}) et les pots remplis ({R.poidsAlloue.toFixed(2)}).
            </div>
          )}
        </div>
      )}

      <button onClick={async () => { clearTimeout(timer.current); await persist(cur); setView("list"); }} className="ca-tap" style={{ width: "100%", marginTop: 6, marginBottom: 24, background: C.jam, color: "#fff", border: "none", borderRadius: 14, padding: "16px", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}><Check size={19} /> Valider la fournée</button>
    </div>
  );
}

function ProStats({ sales, orders, visits, clients, products, onRefresh, loading }) {
  const [gran, setGran] = useState("mois");   // jour | semaine | mois | annee
  const [off, setOff] = useState(0);          // 0 = période en cours, -1 = précédente...
  const [drill, setDrill] = useState(null);   // index de la sous-période ouverte
  const [calDay, setCalDay] = useState(null); // jour précis choisi via le calendrier (iso)
  const [calOpen, setCalOpen] = useState(false);

  const MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  const M3 = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
  const JN = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];

  const flux = useMemo(() => {
    const out = [];
    (sales || []).forEach((s) => out.push({ ts: s.ts, total: Number(s.total) || 0, items: (s.items || []).map((i) => ({ name: i.name, qty: i.qty || 0, price: Number(i.price) || 0 })) }));
    (orders || []).forEach((o) => out.push({ ts: o.ts, total: Number(o.total) || 0, items: (o.lines || []).map((i) => ({ name: i.name, qty: i.qty || 0, price: Number(i.price) || 0 })) }));
    return out;
  }, [sales, orders]);
  const costOf = (n) => { const p = (products || []).find((x) => x.name === n); return p ? Number(p.cost) || 0 : 0; };

  // ---- bornes de la période sélectionnée (et de la précédente) ----
  const bounds = (o) => {
    const now = new Date();
    let start, end, label;
    if (gran === "total") {
      start = new Date(2020, 0, 1); end = new Date(now); end.setDate(end.getDate() + 1); end.setHours(0, 0, 0, 0);
      label = "depuis le début";
    } else if (gran === "jour") {
      const d = new Date(now); d.setDate(now.getDate() + o); d.setHours(0,0,0,0);
      start = d; end = new Date(d); end.setDate(d.getDate() + 1);
      label = d.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" });
    } else if (gran === "semaine") {
      const d = new Date(now); d.setDate(now.getDate() + o * 7);
      const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dow); d.setHours(0,0,0,0);
      start = d; end = new Date(d); end.setDate(d.getDate() + 7);
      const f = new Date(end); f.setDate(end.getDate() - 1);
      label = `sem. du ${d.getDate()} ${M3[d.getMonth()]} au ${f.getDate()} ${M3[f.getMonth()]}`;
    } else if (gran === "mois") {
      const d = new Date(now.getFullYear(), now.getMonth() + o, 1);
      start = d; end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      label = `${MOIS[d.getMonth()]} ${d.getFullYear()}`;
    } else {
      const d = new Date(now.getFullYear() + o, 0, 1);
      start = d; end = new Date(d.getFullYear() + 1, 0, 1);
      label = String(d.getFullYear());
    }
    return { start, end, label };
  };
  const cur = bounds(off), prv = bounds(off - 1);
  const now = new Date();
  const enCours = off === 0 && now < cur.end;            // période pas terminée
  const ecoule = Math.min(now - cur.start, cur.end - cur.start); // temps écoulé dans la période

  const agg = (a, b, cap) => {
    const r = { ca: 0, nb: 0, qty: 0, marge: 0, prods: {} };
    flux.forEach((f) => {
      const t = new Date(f.ts);
      if (t < a || t >= b) return;
      if (cap && (t - a) > cap) return;                  // comparaison à durée égale
      r.ca += f.total; r.nb += 1;
      f.items.forEach((i) => {
        r.qty += i.qty; r.marge += (i.price - costOf(i.name)) * i.qty;
        if (!r.prods[i.name]) r.prods[i.name] = { qty: 0, ca: 0, marge: 0 };
        r.prods[i.name].qty += i.qty; r.prods[i.name].ca += i.qty * i.price;
        r.prods[i.name].marge += (i.price - costOf(i.name)) * i.qty;
      });
    });
    return r;
  };
  const A = agg(cur.start, cur.end);
  // si la période est en cours, on compare la précédente sur la MÊME durée écoulée
  const B = agg(prv.start, prv.end, enCours ? ecoule : null);
  const delta = B.ca ? Math.round(((A.ca - B.ca) / B.ca) * 1000) / 10 : (A.ca ? 100 : 0);
  const GRANS = [["jour","Jour"],["semaine","Semaine"],["mois","Mois"],["annee","Année"],["total","Total"]];
  const PREV = { jour: "la veille", semaine: "la semaine précédente", mois: "le mois précédent", annee: "l'an dernier", total: "" };
  const hasCoutData = (products || []).some((p) => Number(p.cost) > 0);

  // ---- produits de la période ----
  const prods = Object.entries(A.prods).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.ca - a.ca);
  const pMax = Math.max(1, ...prods.map((p) => p.ca));
  const DONUT = ["#7A2B33","#B5722B","#3F7A4B","#8C6A4A","#C09A5B","#5E6B34","#A34E5C","#D0A96B","#6E7F8D","#8E5A3C"];
  const donut = prods.slice(0, 8);
  const autres = prods.slice(8).reduce((a, p) => a + p.ca, 0);
  if (autres > 0) donut.push({ name: "Autres", ca: autres, qty: 0, marge: 0 });
  const dTot = donut.reduce((a, p) => a + p.ca, 0) || 1;
  let acc = 0;
  const R = 52, CX = 65, CY = 65, SW = 22;
  const arcs = donut.map((p, i) => {
    const frac = p.ca / dTot;
    const a0 = acc * 2 * Math.PI - Math.PI / 2; acc += frac;
    const a1 = acc * 2 * Math.PI - Math.PI / 2;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = CX + R * Math.cos(a0), y0 = CY + R * Math.sin(a0);
    const x1 = CX + R * Math.cos(a1), y1 = CY + R * Math.sin(a1);
    return { d: `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1}`, col: DONUT[i % DONUT.length], p, pct: Math.round(frac * 1000) / 10 };
  });

  // ---- courbe d'évolution (sous-périodes de la période courante) ----
  const subs = useMemo(() => {
    const out = [];
    if (gran === "jour") { for (let h = 0; h < 24; h++) out.push({ lab: String(h).padStart(2,"0"), ca: 0 }); }
    else if (gran === "semaine") { for (let i = 0; i < 7; i++) { const d = new Date(cur.start); d.setDate(cur.start.getDate() + i); out.push({ lab: JN[d.getDay()], ca: 0 }); } }
    else if (gran === "mois") { const n = new Date(cur.start.getFullYear(), cur.start.getMonth() + 1, 0).getDate(); for (let i = 1; i <= n; i++) out.push({ lab: String(i), ca: 0 }); }
    else { for (let i = 0; i < 12; i++) out.push({ lab: M3[i], ca: 0 }); }
    flux.forEach((f) => {
      const t = new Date(f.ts); if (t < cur.start || t >= cur.end) return;
      let idx;
      if (gran === "jour") idx = t.getHours();
      else if (gran === "semaine") idx = Math.floor((t - cur.start) / 86400000);
      else if (gran === "mois") idx = t.getDate() - 1;
      else idx = t.getMonth();
      if (out[idx]) out[idx].ca += f.total;
    });
    return out;
  }, [flux, gran, off, products]);
  const sMax = Math.max(1, ...subs.map((s) => s.ca));

  const kpi = (l, v, sub, accent) => (
    <div style={{ flex: "1 1 130px", minWidth: 128, background: accent ? C.jam : C.board, color: accent ? "#fff" : C.chalk, borderRadius: 14, padding: "13px 14px", display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", opacity: .7, minHeight: 26 }}>{l}</div>
      <div style={{ fontSize: "clamp(20px, 2.4vw, 26px)", fontWeight: 700, marginTop: "auto" }}>{v}</div>
      <div style={{ fontSize: 11, opacity: .68, marginTop: 2, minHeight: 15 }}>{sub || ""}</div>
    </div>
  );

  return (
    <div>
      <ProHead title="Tableau de bord" sub="Pilotage de l'activité" />

      <div style={{ ...card(), marginBottom: 14, padding: calOpen ? undefined : "12px 14px" }}>
        <button onClick={() => setCalOpen((o) => !o)} className="ca-tap" style={{ width: "100%", background: "transparent", border: "none", padding: 0, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", color: C.ink }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700 }}><Calendar size={16} color={C.jam} /> Consulter un jour précis</span>
          <ChevronDown size={18} color={C.soft} style={{ transform: calOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
        </button>
        {calOpen && (
          <div style={{ marginTop: 14 }}>
            <CalGrid sales={flux} selected={calDay || ""} onPick={(iso) => setCalDay(iso)} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {GRANS.map(([k, l]) => (
          <button key={k} onClick={() => { setGran(k); setOff(0); }} className="ca-tap" style={{ flex: "1 1 auto", border: `1px solid ${gran === k ? C.jam : C.line}`, background: gran === k ? C.jam : "#fff", color: gran === k ? "#fff" : C.ink, borderRadius: 999, padding: "9px 10px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{l}</button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        {gran !== "total" && <button onClick={() => setOff(off - 1)} className="ca-tap" style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 9, width: 34, height: 34, cursor: "pointer", display: "grid", placeItems: "center", color: C.jam, flexShrink: 0 }}><ChevronLeft size={17} /></button>}
        <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, textTransform: "capitalize", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cur.label}</div>
          {enCours && gran !== "total" && <div style={{ fontSize: 10.5, color: C.caramel, fontWeight: 700 }}>en cours</div>}
        </div>
        {gran !== "total" && <button onClick={() => setOff(Math.min(0, off + 1))} disabled={off >= 0} className="ca-tap" style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 9, width: 34, height: 34, cursor: off >= 0 ? "default" : "pointer", display: "grid", placeItems: "center", color: off >= 0 ? "#C9C0AE" : C.jam, flexShrink: 0 }}><ChevronRight size={17} /></button>}
        {onRefresh && <button onClick={onRefresh} className="ca-tap" style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 9, height: 34, padding: "0 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", color: C.jam, flexShrink: 0 }}>{loading ? "…" : "↻"}</button>}
      </div>

      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 14, alignItems: "stretch" }}>
        {gran === "total" ? kpi("Chiffre d'affaires", eur(A.ca), null, true) : kpi("Chiffre d'affaires", eur(A.ca), `${delta >= 0 ? "▲ +" : "▼ "}${delta}% vs ${PREV[gran]}`, true)}
        {kpi("Marge", hasCoutData ? eur(A.marge) : "—", hasCoutData ? (A.ca ? `${Math.round((A.marge / A.ca) * 100)} % du CA` : "—") : "prix d'achat non renseignés")}
        {kpi("Articles vendus", A.qty, `${A.nb} vente(s)`)}
      </div>

      {enCours && gran !== "total" && (
        <div style={{ background: "#B5722B14", border: `1px solid ${C.caramel}55`, borderRadius: 11, padding: "9px 12px", fontSize: 12, color: C.ink, marginBottom: 14, lineHeight: 1.45 }}>
          Comparaison honnête : {PREV[gran]} est mesuré <b>sur la même durée écoulée</b> ({eur(B.ca)}), pas sur la période complète.
        </div>
      )}

      <div style={card()}>
        <div style={{ ...h2 }}>Ventes {gran === "jour" ? "par heure" : gran === "semaine" ? "par jour" : gran === "mois" ? "jour par jour" : "mois par mois"}</div>
        {A.ca === 0 ? <div style={{ fontSize: 13, color: C.soft }}>Aucune vente sur cette période.</div> : (<>
          <div style={{ fontSize: 11.5, color: C.soft, marginTop: -6, marginBottom: 8 }}>Touchez une barre pour voir le détail des produits vendus.</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: gran === "mois" ? 2 : 5, height: 140 }}>
            {subs.map((s, i) => (
              <div key={i} onClick={() => s.ca && setDrill(i)} title={s.ca ? `${s.lab} · ${eur(s.ca)} — cliquer pour le détail` : s.lab} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", minWidth: 0, cursor: s.ca ? "pointer" : "default" }}>
                <div style={{ width: "100%", height: `${Math.max(s.ca ? 4 : 1, (s.ca / sMax) * 82)}%`, background: s.ca === sMax && s.ca > 0 ? C.jam : C.caramel, opacity: s.ca ? 1 : .16, borderRadius: "4px 4px 0 0", transition: "height .25s, filter .15s" }} />
                <div style={{ fontSize: gran === "mois" ? 7.5 : 10, color: C.soft, marginTop: 4, whiteSpace: "nowrap" }}>{gran === "mois" ? (i % 3 === 0 ? s.lab : "") : s.lab}</div>
              </div>
            ))}
          </div>
        </>)}
      </div>

      {((drill !== null && subs[drill]) || calDay) && (() => {
        // bornes de la période cliquée : soit une sous-période du graphique, soit un jour choisi au calendrier
        let a, b, titre;
        const closeAll = () => { setDrill(null); setCalDay(null); };
        if (calDay) {
          const [Y, M, Dd] = calDay.split("-").map(Number);
          a = new Date(Y, M - 1, Dd); b = new Date(a); b.setDate(a.getDate() + 1);
          titre = a.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
        } else {
          if (gran === "jour") { a = new Date(cur.start); a.setHours(drill, 0, 0, 0); b = new Date(a); b.setHours(drill + 1); }
          else if (gran === "semaine") { a = new Date(cur.start); a.setDate(cur.start.getDate() + drill); b = new Date(a); b.setDate(a.getDate() + 1); }
          else if (gran === "mois") { a = new Date(cur.start.getFullYear(), cur.start.getMonth(), drill + 1); b = new Date(a); b.setDate(a.getDate() + 1); }
          else { a = new Date(cur.start.getFullYear(), drill, 1); b = new Date(cur.start.getFullYear(), drill + 1, 1); }
          titre = gran === "jour" ? `${String(drill).padStart(2, "0")}h — ${String(drill + 1).padStart(2, "0")}h`
            : gran === "annee" ? `${MOIS[drill]} ${cur.start.getFullYear()}`
            : a.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" });
        }
        const D = agg(a, b);
        const dp = Object.entries(D.prods).map(([name, v]) => ({ name, ...v })).sort((x, y) => y.ca - x.ca);
        const dMaxx = Math.max(1, ...dp.map((x) => x.ca));
        const tickets = flux.filter((f) => { const t = new Date(f.ts); return t >= a && t < b; }).sort((x, y) => y.ts - x.ts);
        return (
          <div onClick={closeAll} style={{ position: "fixed", inset: 0, zIndex: 100, background: "#16140fcc", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 12px", overflowY: "auto" }}>
            <div className="ca-anim" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: C.paper, borderRadius: 20, padding: "18px 16px", maxHeight: "min(90vh, 880px)", margin: "auto", overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: SCRIPT, fontSize: 22, color: C.jam, textTransform: "capitalize", lineHeight: 1.15 }}>{titre}</div>
                  <div style={{ fontSize: 12, color: C.soft }}>{D.nb} vente(s) · {D.qty} article(s)</div>
                </div>
                <button onClick={closeAll} style={{ background: "transparent", border: "none", color: C.soft, cursor: "pointer", lineHeight: 0 }}><X size={20} /></button>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <div style={{ flex: 1, background: C.jam, color: "#fff", borderRadius: 12, padding: "11px 12px" }}><div style={{ fontSize: 10, opacity: .75, textTransform: "uppercase", letterSpacing: ".1em" }}>Chiffre d'affaires</div><div style={{ fontSize: 22, fontWeight: 700 }}>{eur(D.ca)}</div></div>
                <div style={{ flex: 1, background: C.board, color: C.chalk, borderRadius: 12, padding: "11px 12px" }}><div style={{ fontSize: 10, opacity: .7, textTransform: "uppercase", letterSpacing: ".1em" }}>Marge</div><div style={{ fontSize: 22, fontWeight: 700 }}>{eur(D.marge)}</div></div>
              </div>
              <div style={{ ...h2 }}>Produits vendus</div>
              {dp.length === 0 ? <div style={{ fontSize: 13, color: C.soft }}>Aucun détail.</div> : dp.map((p, i) => (
                <div key={p.name} style={{ padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                    <span style={{ width: 19, height: 19, borderRadius: 6, background: i < 3 ? C.jam : C.line, color: i < 3 ? "#fff" : C.soft, fontSize: 10.5, fontWeight: 700, display: "grid", placeItems: "center", flexShrink: 0 }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <span style={{ fontSize: 12, color: C.soft, flexShrink: 0 }}>×{p.qty}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.jam, flexShrink: 0, minWidth: 52, textAlign: "right" }}>{eur(p.ca)}</span>
                  </div>
                  <div style={{ height: 6, background: C.line, borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${(p.ca / dMaxx) * 100}%`, height: "100%", background: C.jam, borderRadius: 3 }} /></div>
                </div>
              ))}
              {tickets.length > 0 && (<>
                <div style={{ ...h2, marginTop: 14 }}>Tickets ({tickets.length})</div>
                {tickets.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${C.line}`, fontSize: 12.5 }}>
                    <span style={{ color: C.soft, flexShrink: 0 }}>{new Date(t.ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                    <span style={{ flex: 1, minWidth: 0, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(t.items || []).map((x) => `${x.qty}× ${x.name}`).join(", ")}</span>
                    <b style={{ color: C.jam, flexShrink: 0 }}>{eur(t.total)}</b>
                  </div>
                ))}
              </>)}
            </div>
          </div>
        );
      })()}

      <div style={card()}>
        <div style={{ ...h2 }}>Répartition des ventes par produit</div>
        {prods.length === 0 ? <div style={{ fontSize: 13, color: C.soft }}>Aucune vente sur cette période.</div> : (
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <svg viewBox="0 0 130 130" style={{ width: "clamp(130px, 30vw, 175px)", flexShrink: 0, margin: "0 auto" }}>
              {arcs.map((a, i) => <path key={i} d={a.d} fill="none" stroke={a.col} strokeWidth={SW} />)}
              <text x={CX} y={CY - 4} textAnchor="middle" style={{ fontSize: 15, fontWeight: 700, fill: C.ink }}>{eur(A.ca)}</text>
              <text x={CX} y={CY + 10} textAnchor="middle" style={{ fontSize: 8, fill: C.soft }}>{prods.length} produits</text>
            </svg>
            <div style={{ flex: "1 1 200px", minWidth: 190 }}>
              {arcs.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3.5px 0", fontSize: 12.5 }}>
                  <span style={{ width: 11, height: 11, borderRadius: 3, background: a.col, flexShrink: 0 }} />
                  <span style={{ flex: 1, minWidth: 0, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.p.name}</span>
                  <b style={{ color: C.jam, flexShrink: 0 }}>{a.pct}%</b>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={card()}>
        <div style={{ ...h2 }}>Produits les plus performants — {cur.label}</div>
        {prods.length === 0 ? <div style={{ fontSize: 13, color: C.soft }}>Aucune vente sur cette période.</div> : prods.map((p, i) => (
          <div key={p.name} style={{ padding: "9px 0", borderBottom: `1px solid ${C.line}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
              <span style={{ width: 20, height: 20, borderRadius: 6, background: i < 3 ? C.jam : C.line, color: i < 3 ? "#fff" : C.soft, fontSize: 11, fontWeight: 700, display: "grid", placeItems: "center", flexShrink: 0 }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: C.jam, flexShrink: 0 }}>{eur(p.ca)}</span>
            </div>
            <div style={{ height: 8, background: C.line, borderRadius: 4, overflow: "hidden", marginBottom: 5 }}>
              <div style={{ width: `${(p.ca / pMax) * 100}%`, height: "100%", background: C.jam, borderRadius: 4 }} />
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11, color: C.soft }}>
              <span><b style={{ color: C.ink }}>{p.qty}</b> vendus</span>
              <span>marge <b style={{ color: p.marge > 0 ? C.ok : C.soft }}>{eur(p.marge)}</b></span>
              <span><b style={{ color: C.ink }}>{Math.round((p.ca / (A.ca || 1)) * 100)}%</b> du CA</span>
            </div>
          </div>
        ))}
      </div>

      <div style={card()}>
        <div style={{ ...h2 }}>Zone géographique</div>
        {(() => {
          const bv = {}; (clients || []).forEach((c) => { const v = (c.ville || "").trim() || "Non renseignée"; bv[v] = (bv[v] || 0) + 1; });
          const villes = Object.entries(bv).sort((a, b) => b[1] - a[1]).slice(0, 8);
          const vm = Math.max(1, ...villes.map(([, n]) => n));
          if (!clients || !clients.length) return <div style={{ fontSize: 13, color: C.soft }}>Aucun client enregistré.</div>;
          return villes.map(([v, n]) => (
            <div key={v} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
              <div style={{ width: 120, fontSize: 12.5, color: v === "Non renseignée" ? C.soft : C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}><MapPin size={12} color={C.soft} /> {v}</div>
              <div style={{ flex: 1, height: 11, background: C.line, borderRadius: 6, overflow: "hidden" }}><div style={{ width: `${(n / vm) * 100}%`, height: "100%", background: v === "Non renseignée" ? C.soft : C.caramel, borderRadius: 6 }} /></div>
              <div style={{ width: 26, textAlign: "right", fontSize: 12.5, fontWeight: 700, color: C.ink }}>{n}</div>
            </div>
          ));
        })()}
      </div>

      <div style={card()}>
        <div style={{ ...h2 }}>Fréquentation (scans QR / ouvertures)</div>
        {(visits || []).length === 0 ? <div style={{ fontSize: 13, color: C.soft }}>Le comptage vient de démarrer : chaque scan du QR et chaque ouverture de la boutique sera compté ici.</div> : (() => {
          const bd = {}; (visits || []).forEach((v) => { const d = new Date(v.ts); bd[`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`] = (bd[`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`] || 0) + 1; });
          const vs = []; const n2 = new Date();
          for (let i = 29; i >= 0; i--) { const d = new Date(n2); d.setDate(n2.getDate() - i); vs.push(bd[`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`] || 0); }
          const vm = Math.max(1, ...vs);
          return <>
            <div style={{ fontSize: 12, color: C.soft, marginTop: -6, marginBottom: 8 }}>{(visits || []).length} visite(s) au total · 30 derniers jours</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 90 }}>
              {vs.map((v, i) => <div key={i} title={`${v} visite(s)`} style={{ flex: 1, height: `${Math.max(v ? 6 : 1, (v / vm) * 100)}%`, background: v ? C.caramel : C.line, borderRadius: 3, alignSelf: "flex-end" }} />)}
            </div>
          </>;
        })()}
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
        <div onClick={() => !busy && setEdit(null)} style={{ position: "fixed", inset: 0, zIndex: 100, background: "#16140fcc", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 12px", overflowY: "auto" }}>
          <div className="ca-anim" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: C.paper, borderRadius: 20, padding: "18px 16px", maxHeight: "min(90vh, 880px)", margin: "auto", overflowY: "auto", boxShadow: "0 24px 60px -16px #000" }}>
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
function ProClients({ clients, orders, pass }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [sort, setSort] = useState({ k: "nom", dir: 1 });
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);

  const ordersOf = (email) => (orders || []).filter((o) => (o.email || "").toLowerCase() === (email || "").toLowerCase());
  const base = (clients || []).filter((c) => ((c.prenom || "") + " " + (c.nom || "") + " " + (c.email || "") + " " + (c.tel || "") + " " + (c.ville || "")).toLowerCase().includes(q.toLowerCase().trim()));
  const rows = [...base].sort((a, b) => {
    const k = sort.k;
    let va = a[k], vb = b[k];
    if (k === "spent" || k === "orders") { va = Number(va) || 0; vb = Number(vb) || 0; return (va - vb) * sort.dir; }
    if (k === "created_at") { va = va ? new Date(va).getTime() : 0; vb = vb ? new Date(vb).getTime() : 0; return (va - vb) * sort.dir; }
    va = String(va || "").toLowerCase(); vb = String(vb || "").toLowerCase();
    return va.localeCompare(vb) * sort.dir;
  });
  const selClient = rows.find((c) => c.email === sel) || null;
  const th = (k, label, w) => (
    <th onClick={() => setSort((s) => ({ k, dir: s.k === k ? -s.dir : 1 }))}
      style={{ padding: "9px 8px", textAlign: k === "spent" || k === "orders" ? "right" : "left", fontSize: 11, textTransform: "uppercase", letterSpacing: ".07em", color: sort.k === k ? C.jam : C.soft, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", borderBottom: `2px solid ${C.line}`, background: C.paper, position: "sticky", top: 0, width: w, userSelect: "none" }}>
      {label} <span style={{ opacity: sort.k === k ? 1 : .3 }}>{sort.k === k ? (sort.dir === 1 ? "▲" : "▼") : "↕"}</span>
    </th>
  );
  const exportCsv = () => downloadCSV(`clients-${new Date().toISOString().slice(0, 10)}.csv`,
    ["Prénom", "Nom", "Téléphone", "Email", "Adresse", "CP", "Ville", "Inscrit le", "Commandes", "Total dépensé"],
    rows.map((c) => [c.prenom, c.nom, c.tel || "", c.email, c.adresse || "", c.cp || "", c.ville || "", c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : "", c.orders || 0, (c.spent || 0) + " €"]));
  const save = async () => {
    if (!edit || !edit.email || !supabase || !pass) return;
    setBusy(true);
    try { await supabase.rpc("admin_save_customer", { pass, p_email: edit.email, p_prenom: edit.prenom || "", p_nom: edit.nom || "", p_tel: edit.tel || "", p_adresse: edit.adresse || "", p_cp: edit.cp || "", p_ville: edit.ville || "", p_notes: edit.notes || "" }); } catch (e) {}
    setBusy(false); setEdit(null);
  };
  const F = ({ l, v, on }) => (<div style={{ flex: 1, minWidth: 130 }}><Lbl>{l}</Lbl><input value={v || ""} onChange={(e) => on(e.target.value)} style={{ ...inp(), marginTop: 4 }} /></div>);

  return (
    <div className="ca-anim">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <div><h2 style={{ fontFamily: SCRIPT, fontSize: 24, margin: 0, color: C.jam }}>Clients · CRM</h2><div style={{ fontSize: 13, color: C.soft, marginTop: 3 }}>{(clients || []).length} contacts · triez en cliquant sur les colonnes</div></div>
        <button onClick={exportCsv} disabled={!rows.length} className="ca-tap" style={{ background: rows.length ? C.board : C.line, color: C.chalk, border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 600, cursor: rows.length ? "pointer" : "default", display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, whiteSpace: "nowrap" }}><Send size={14} /> Export CSV</button>
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer : nom, email, téléphone, ville…" style={{ ...inp(), marginBottom: 12 }} />

      <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden", background: C.paper }}>
        <div style={{ overflowX: "auto", maxHeight: "60vh", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 640 }}>
            <thead><tr>
              {th("prenom", "Prénom")}{th("nom", "Nom")}{th("tel", "Téléphone")}{th("email", "Email")}{th("ville", "Ville")}{th("created_at", "Inscrit le")}{th("orders", "Cmd")}{th("spent", "Total")}
            </tr></thead>
            <tbody>
              {rows.length === 0 ? <tr><td colSpan={8} style={{ padding: 18, textAlign: "center", color: C.soft, fontSize: 13 }}>Aucun client pour ce filtre.</td></tr>
                : rows.map((c, i) => (
                  <tr key={c.email} onClick={() => setSel(c.email)} className="ca-tap" style={{ cursor: "pointer", background: sel === c.email ? "#7A2B3312" : (i % 2 ? "#ffffff66" : "transparent"), borderBottom: `1px solid ${C.line}` }}>
                    <td style={{ padding: "10px 8px", fontWeight: 600, color: C.ink }}>{c.prenom || "—"}</td>
                    <td style={{ padding: "10px 8px", color: C.ink }}>{c.nom || "—"}</td>
                    <td style={{ padding: "10px 8px", color: C.ink, whiteSpace: "nowrap" }}>{c.tel || "—"}</td>
                    <td style={{ padding: "10px 8px", color: C.soft, maxWidth: 190, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</td>
                    <td style={{ padding: "10px 8px", color: c.ville ? C.ink : "#C9C0AE" }}>{c.ville || "—"}</td>
                    <td style={{ padding: "10px 8px", color: C.soft, whiteSpace: "nowrap" }}>{c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : "—"}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 600 }}>{c.orders || 0}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, color: C.jam, whiteSpace: "nowrap" }}>{eur(c.spent || 0)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: C.soft, marginTop: 8 }}>Touchez une ligne pour ouvrir la fiche client.</div>

      {selClient && (() => {
        const os = ordersOf(selClient.email);
        const totalP = os.reduce((a, o) => a + (Number(o.total) || 0), 0);
        const byProd = {};
        os.forEach((o) => (o.lines || []).forEach((l) => { byProd[l.name] = (byProd[l.name] || 0) + (l.qty || 0); }));
        const favs = Object.entries(byProd).sort((a, b) => b[1] - a[1]).slice(0, 5);
        return (
          <div onClick={() => setSel(null)} style={{ position: "fixed", inset: 0, zIndex: 100, background: "#16140fcc", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 12px", overflowY: "auto" }}>
            <div className="ca-anim" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: C.paper, borderRadius: 20, padding: "18px 16px", maxHeight: "min(90vh, 880px)", margin: "auto", overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: C.board, color: C.chalk, display: "grid", placeItems: "center", fontFamily: SCRIPT, fontSize: 18, flexShrink: 0, paddingTop: 3 }}>{(selClient.prenom || "")[0]}{(selClient.nom || "")[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SCRIPT, fontSize: 22, color: C.jam, lineHeight: 1.15 }}>{selClient.prenom} {selClient.nom}</div>
                  <div style={{ fontSize: 12, color: C.soft }}>Inscrit le {selClient.created_at ? new Date(selClient.created_at).toLocaleDateString("fr-FR") : "—"}{os.length > 0 && <> · 1ère commande le {new Date(Math.min(...os.map((o) => o.ts))).toLocaleDateString("fr-FR")}</>}</div>
                </div>
                <button onClick={() => setSel(null)} style={{ background: "transparent", border: "none", color: C.soft, cursor: "pointer", lineHeight: 0 }}><X size={20} /></button>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <div style={{ flex: 1, background: C.jam, color: "#fff", borderRadius: 12, padding: "11px 12px" }}><div style={{ fontSize: 10, opacity: .75, textTransform: "uppercase", letterSpacing: ".1em" }}>Total dépensé</div><div style={{ fontSize: 22, fontWeight: 700 }}>{eur(totalP)}</div></div>
                <div style={{ flex: 1, background: C.board, color: C.chalk, borderRadius: 12, padding: "11px 12px" }}><div style={{ fontSize: 10, opacity: .7, textTransform: "uppercase", letterSpacing: ".1em" }}>Commandes</div><div style={{ fontSize: 22, fontWeight: 700 }}>{os.length}</div></div>
                <div style={{ flex: 1, background: C.board, color: C.chalk, borderRadius: 12, padding: "11px 12px" }}><div style={{ fontSize: 10, opacity: .7, textTransform: "uppercase", letterSpacing: ".1em" }}>Panier moy.</div><div style={{ fontSize: 22, fontWeight: 700 }}>{eur(os.length ? totalP / os.length : 0)}</div></div>
              </div>

              <div style={{ ...h2 }}>Coordonnées</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 14px", fontSize: 13, marginBottom: 14 }}>
                <div><span style={{ color: C.soft, fontSize: 11.5 }}>Téléphone</span><br /><b>{selClient.tel || "—"}</b></div>
                <div><span style={{ color: C.soft, fontSize: 11.5 }}>Email</span><br /><b style={{ wordBreak: "break-all", fontSize: 12.5 }}>{selClient.email}</b></div>
                <div style={{ gridColumn: "1 / -1" }}><span style={{ color: C.soft, fontSize: 11.5 }}>Adresse</span><br /><b>{[selClient.adresse, selClient.cp, selClient.ville].filter(Boolean).join(", ") || "— non renseignée"}</b></div>
                {selClient.notes && <div style={{ gridColumn: "1 / -1" }}><span style={{ color: C.soft, fontSize: 11.5 }}>Notes</span><br />{selClient.notes}</div>}
              </div>

              {favs.length > 0 && (<>
                <div style={{ ...h2 }}>Produits préférés</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {favs.map(([n, q2]) => <span key={n} style={{ background: "#7A2B3312", color: C.jam, border: `1px solid ${C.jam}33`, borderRadius: 999, padding: "5px 11px", fontSize: 12, fontWeight: 600 }}>{n} · {q2}</span>)}
                </div>
              </>)}

              <div style={{ ...h2 }}>Historique d'achats ({os.length})</div>
              {os.length === 0 ? <div style={{ fontSize: 13, color: C.soft, marginBottom: 12 }}>Aucune commande enregistrée.</div>
                : os.sort((a, b) => b.ts - a.ts).map((o) => (
                  <div key={o.id} style={{ padding: "9px 0", borderBottom: `1px solid ${C.line}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{o.id} <span style={{ fontWeight: 500, color: C.soft }}>· {new Date(o.ts).toLocaleDateString("fr-FR")}</span></div>
                        <div style={{ fontSize: 12, color: C.soft }}>{(o.lines || []).map((l) => `${l.qty}× ${l.name}`).join(", ") || `${o.items} art.`}</div>
                      </div>
                      <span style={{ fontFamily: SCRIPT, fontSize: 16, color: C.jam, flexShrink: 0 }}>{eur(o.total)}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: o.status === "Remise" ? C.ok : C.caramel, borderRadius: 5, padding: "2px 6px", flexShrink: 0 }}>{o.status}</span>
                    </div>
                  </div>
                ))}

              <button onClick={() => setEdit({ ...selClient })} className="ca-tap" style={{ width: "100%", marginTop: 16, background: "#fff", border: `1.5px solid ${C.jam}`, color: C.jam, borderRadius: 13, padding: "13px", fontWeight: 700, fontSize: 14.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Settings size={17} /> Modifier la fiche</button>
            </div>
          </div>
        );
      })()}

      {edit && (
        <div onClick={() => !busy && setEdit(null)} style={{ position: "fixed", inset: 0, zIndex: 101, background: "#16140fcc", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 12px", overflowY: "auto" }}>
          <div className="ca-anim" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: C.paper, borderRadius: 20, padding: "18px 16px", maxHeight: "min(90vh, 880px)", margin: "auto", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontFamily: SCRIPT, fontSize: 21, color: C.jam }}>Modifier la fiche</div>
              <button onClick={() => setEdit(null)} style={{ background: "transparent", border: "none", color: C.soft, cursor: "pointer", lineHeight: 0 }}><X size={20} /></button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <F l="Prénom" v={edit.prenom} on={(v) => setEdit({ ...edit, prenom: v })} />
              <F l="Nom" v={edit.nom} on={(v) => setEdit({ ...edit, nom: v })} />
              <F l="Téléphone" v={edit.tel} on={(v) => setEdit({ ...edit, tel: v })} />
              <div style={{ flexBasis: "100%" }}><F l="Adresse" v={edit.adresse} on={(v) => setEdit({ ...edit, adresse: v })} /></div>
              <F l="Code postal" v={edit.cp} on={(v) => setEdit({ ...edit, cp: v })} />
              <F l="Ville" v={edit.ville} on={(v) => setEdit({ ...edit, ville: v })} />
              <div style={{ flexBasis: "100%" }}><Lbl>Notes</Lbl><textarea value={edit.notes || ""} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} rows={2} style={{ ...inp(), marginTop: 4, resize: "vertical" }} /></div>
            </div>
            <div style={{ fontSize: 11.5, color: C.soft, marginTop: 8 }}>L'email ({edit.email}) identifie le client, il n'est pas modifiable.</div>
            <button onClick={save} disabled={busy} className="ca-tap" style={{ width: "100%", marginTop: 14, background: C.ok, color: "#fff", border: "none", borderRadius: 13, padding: "14px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Check size={18} /> {busy ? "…" : "Enregistrer"}</button>
          </div>
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
const h2 = { fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: C.caramel, fontWeight: 700, marginBottom: 12 };
const inp = () => ({ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.jam}22`, background: "#ffffff", fontSize: 14, color: C.ink, boxShadow: "inset 0 1px 2px #241f1708" });
const sel = (s) => ({ padding: "8px 10px", borderRadius: 9, border: `1px solid ${C.line}`, background: s === "Livrée" || s === "Retirée" ? "#3F7A4B14" : C.cream, fontSize: 12.5, fontWeight: 600, color: C.ink, cursor: "pointer" });
const backBtn = () => ({ display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "transparent", color: C.soft, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0 });
function Sq({ children, onClick }) { return <button onClick={onClick} className="ca-tap" style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer" }}>{children}</button>; }
function Pill({ children }) { return <span style={{ fontSize: 11.5, fontWeight: 600, color: C.soft, background: C.cream, padding: "6px 10px", borderRadius: 9, flexShrink: 0 }}>{children}</span>; }
function Stars({ value, size = 16, onChange, color }) {
  return <span style={{ display: "inline-flex", gap: size > 24 ? 8 : 3 }}>{[1, 2, 3, 4, 5].map((n) => (
    <span key={n} onClick={onChange ? () => onChange(n) : undefined} style={{ cursor: onChange ? "pointer" : "default", color: n <= value ? (color || C.jam) : (color ? "#ffffff44" : "#DDD3C1"), fontSize: size, lineHeight: 1, transition: "color .15s" }}>♥</span>
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
    <div style={{ marginTop: 30, background: C.board, padding: "26px 0 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -18, left: 18, fontFamily: SCRIPT, fontSize: 110, color: C.jam, opacity: .22, lineHeight: 1, pointerEvents: "none" }}>&ldquo;</div>
      <div style={{ padding: "0 22px", marginBottom: 16, textAlign: "center", position: "relative" }}>
        <div style={{ fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: C.caramel, fontWeight: 700, marginBottom: 4 }}>Paroles de gourmands</div>
        <div style={{ fontFamily: SCRIPT, fontSize: 28, color: C.chalk, lineHeight: 1.15 }}>{title}</div>
        {list.length > 0 ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 10, background: C.jam, borderRadius: 999, padding: "7px 16px" }}>
            <Stars value={Math.round(avg)} size={15} color="#fff" />
            <span style={{ fontSize: 14.5, fontWeight: 700, color: "#fff" }}>{avg.toFixed(1)}</span>
            <span style={{ fontSize: 12.5, color: "#ffffffcc" }}>· {list.length} avis</span>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "#F3ECD699", marginTop: 8 }}>Aucun avis pour l'instant — soyez le premier !</div>
        )}
      </div>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 22px 6px", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
        {list.map((r) => (
          <div key={r.id} style={{ flex: "0 0 78%", maxWidth: 292, scrollSnapAlign: "start", background: C.paper, borderRadius: 16, padding: "15px 16px", boxShadow: "0 10px 28px -12px #000" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
              <div style={{ width: 33, height: 33, borderRadius: "50%", background: C.jam, color: "#fff", display: "grid", placeItems: "center", fontFamily: SCRIPT, fontSize: 15, flexShrink: 0, paddingTop: 2 }}>{(r.prenom || "C").charAt(0).toUpperCase()}</div>
              <div style={{ minWidth: 0 }}>
                <b style={{ fontSize: 13.5, display: "block", color: C.ink }}>{r.prenom || "Client"}</b>
                <Stars value={r.rating} size={12} />
              </div>
            </div>
            {r.comment && <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.5, fontStyle: "italic" }}>« {r.comment} »</div>}
          </div>
        ))}
        <button onClick={() => setStep("avis")} className="ca-tap" style={{ flex: "0 0 auto", scrollSnapAlign: "start", background: C.jam, color: "#fff", border: "none", borderRadius: 16, padding: "16px 22px", fontWeight: 700, fontSize: 13.5, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 9, minWidth: 155, boxShadow: "0 10px 28px -12px #000" }}>
          <Stars value={5} size={18} color="#fff" /> {list.length ? "Donner mon avis" : "Soyez le premier"}
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

// Filet de sécurité : si un fragment JS périmé (après déploiement) échoue à charger, on recharge une seule fois au lieu de laisser l'écran blanc.
function useChunkErrorRecovery() {
  useEffect(() => {
    const t = setTimeout(() => { try { sessionStorage.removeItem("ca_chunk_reload"); } catch (e) {} }, 8000);
    const isChunkError = (msg) => typeof msg === "string" && /Loading chunk|ChunkLoadError|dynamically imported module|Importing a module script failed/i.test(msg);
    const reloadOnce = () => {
      try { if (sessionStorage.getItem("ca_chunk_reload") === "1") return; sessionStorage.setItem("ca_chunk_reload", "1"); } catch (e) {}
      window.location.reload();
    };
    const onError = (e) => { if (isChunkError(e && e.message)) reloadOnce(); };
    const onRejection = (e) => { const msg = (e && e.reason && e.reason.message) || String((e && e.reason) || ""); if (isChunkError(msg)) reloadOnce(); };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => { clearTimeout(t); window.removeEventListener("error", onError); window.removeEventListener("unhandledrejection", onRejection); };
  }, []);
}

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
  useChunkErrorRecovery();
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
    const oid = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : (Date.now() + "-" + Math.random().toString(36).slice(2));
    const o = { id, oid, name: `${cust.prenom} ${cust.nom}`.trim(), email: cust.email, tel: cust.tel, items: count, total, mode: "retrait", pickup: pickupDay, date: "Auj.", status: "À préparer", paid: false, lines: cartLines.map((l) => ({ name: l.name, unit: l.unit, qty: l.qty, price: l.price })) };
    setOrders((l) => [o, ...l]);
    setLastOrder({ ...o, lines: cartLines });
    setPlacing(true);
    if (supabase) {
      try {
        await supabase.rpc("save_customer", { p_prenom: cust.prenom || "", p_nom: cust.nom || "", p_tel: cust.tel || "", p_email: cust.email, p_opt_in: !!cust.optin });
        const recapTxt = `COMMANDE ${o.id}\n${o.name} · ${o.tel} · ${o.email}\n${cartLines.map((l) => `${l.qty}x ${l.name} (${l.unit}) — ${eur(l.price * l.qty)}`).join("\n")}\nTotal : ${eur(total)}\nRetrait : ${pickupDay || "à convenir"}`;
        const { error } = await supabase.from("orders").insert({ id: oid, name: o.name, email: o.email, tel: o.tel, items_count: count, total, mode: "retrait", pickup: pickupDay, status: "À préparer", paid: false, parrain: parrain || "", recap: recapTxt, wa_sent: false });
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
  return { id: o.ref, oid: o.id, name: o.name, email: o.email, tel: o.tel, items: o.items_count, total: Number(o.total) || 0, pickup: o.pickup, date, ts: new Date(o.created_at).getTime(), status: o.status, paid: o.paid, parrain: o.parrain || "", waSent: !!o.wa_sent, recap: o.recap || "", lines: (o.items || []).map((i) => ({ name: i.name, unit: i.unit, qty: i.qty, price: Number(i.price) || 0 })) };
};

export function EspacePro() {
  useChunkErrorRecovery();
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
      if (rc && Array.isArray(rc.data)) setClients(rc.data.map((c) => ({ email: c.email, prenom: c.prenom, nom: c.nom, tel: c.tel, orders: c.orders, spent: Number(c.spent) || 0, optin: c.opt_in, adresse: c.adresse || "", cp: c.cp || "", ville: c.ville || "", notes: c.notes || "", created_at: c.created_at || null })));
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
        <div onClick={() => setSteps(false)} style={{ position: "fixed", inset: 0, zIndex: 80, background: "#16140fcc", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 12px", overflowY: "auto" }}>
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

function ProCaisse({ products, sales, setSales, pass, orders, setOrders }) {
  const ticketRef = useRef(null);
  const [ticket, setTicket] = useState({});
  const ticketFirstSave = useRef(true);
  useEffect(() => {
    try { const raw = localStorage.getItem("ca_caisse_ticket"); if (raw) setTicket(JSON.parse(raw) || {}); } catch (e) {}
  }, []);
  useEffect(() => {
    if (ticketFirstSave.current) { ticketFirstSave.current = false; return; }
    try { localStorage.setItem("ca_caisse_ticket", JSON.stringify(ticket)); } catch (e) {}
  }, [ticket]);
  const [flash, setFlash] = useState(null);
  const [justClosed, setJustClosed] = useState(false);
  const [cat, setCat] = useState(null);
  const [retro, setRetro] = useState(false);
  const [saleDate, setSaleDate] = useState("");
  const [saleTime, setSaleTime] = useState("10:00");
  const retroFirstSave = useRef(true);
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem("ca_caisse_retro") || "{}");
      const today = new Date().toISOString().slice(0, 10);
      if (v.saleDate && v.saleDate !== today) {
        // date périmée (session d'un autre jour) : on repart sur aujourd'hui pour ne pas dater une vraie vente du jour sous la mauvaise date
        localStorage.removeItem("ca_caisse_retro");
      } else {
        if (v.retro) setRetro(true);
        if (v.saleDate) setSaleDate(v.saleDate);
        if (v.saleTime) setSaleTime(v.saleTime);
      }
    } catch (e) {}
  }, []);
  useEffect(() => {
    if (retroFirstSave.current) { retroFirstSave.current = false; return; }
    try { localStorage.setItem("ca_caisse_retro", JSON.stringify({ retro, saleDate, saleTime })); } catch (e) {}
  }, [retro, saleDate, saleTime]);
  const tsFor = () => {
    if (!retro || !saleDate) return Date.now();
    const d = new Date(saleDate + "T" + (saleTime || "10:00") + ":00");
    return isNaN(d.getTime()) ? Date.now() : d.getTime();
  };
  const sellable = products.filter((p) => !p.soon && p.active !== false);
  const cats = CAT_ORDER.filter((c) => sellable.some((p) => p.cat === c));
  const activeCat = cat && cats.includes(cat) ? cat : cats[0];
  const catItems = sellable.filter((p) => p.cat === activeCat);

  const add = (p, offert) => {
    setTicket((t) => ({ ...t, [p.id]: { name: p.name, unit: p.unit, price: p.price, offert: offert != null ? offert : (t[p.id]?.offert || false), custom: t[p.id]?.custom || p.custom || false, qty: (t[p.id]?.qty || 0) + 1 } }));
    setFlash(p.id); setTimeout(() => setFlash((f) => (f === p.id ? null : f)), 500);
  };
  const dec = (pid) => setTicket((t) => { const cur = t[pid]; if (!cur) return t; const q = cur.qty - 1; const n = { ...t }; if (q <= 0) delete n[pid]; else n[pid] = { ...cur, qty: q }; return n; });
  const removeLine = (pid) => setTicket((t) => { const n = { ...t }; delete n[pid]; return n; });
  const addCustomLine = () => {
    const id = "custom-" + Date.now();
    setTicket((t) => ({ ...t, [id]: { name: "Article libre", unit: "pièce", price: 0, qty: 1, custom: true } }));
  };
  const setLineName = (pid, name) => setTicket((t) => { const cur = t[pid]; if (!cur) return t; return { ...t, [pid]: { ...cur, name } }; });
  const setLinePrice = (pid, price) => setTicket((t) => { const cur = t[pid]; if (!cur) return t; return { ...t, [pid]: { ...cur, price } }; });
  const toggleOffert = (pid) => setTicket((t) => { const cur = t[pid]; if (!cur) return t; return { ...t, [pid]: { ...cur, offert: !cur.offert } }; });
  const lines = Object.entries(ticket);
  const tCount = lines.reduce((a, [, l]) => a + l.qty, 0);
  const tTotal = lines.reduce((a, [, l]) => a + (l.offert ? 0 : l.qty * pfNum(l.price)), 0);
  const closingRef = useRef(false);
  const closeOrder = async () => {
    if (tCount === 0 || closingRef.current) return;
    closingRef.current = true;
    const items = lines.map(([pid, l]) => ({ pid, name: l.name, qty: l.qty, price: pfNum(l.price), offert: !!l.offert, cost: (products.find((p) => p.id === pid)?.cost) || 0 }));
    const sid = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : (Date.now() + "-" + Math.random().toString(36).slice(2, 6));
    const ts = tsFor();
    setSales((o) => [{ id: sid, items, total: tTotal, count: tCount, ts }, ...o]);
    setTicket({}); setJustClosed(true); setTimeout(() => setJustClosed(false), 1800);
    if (supabase) { try { await supabase.from("sales").insert({ id: sid, total: tTotal, count: tCount, items, ts: new Date(ts).toISOString() }); } catch (e) {} }
    closingRef.current = false;
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
  // Le récap suit le jour choisi dans le calendrier (aujourd'hui par défaut)
  const focusTs = (retro && saleDate) ? new Date(saleDate + "T12:00:00").getTime() : Date.now();
  const focusIsToday = !(retro && saleDate);
  const todayK = dayKey(focusTs);
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

      <div style={{ background: retro ? "#7A2B330D" : C.paper, border: `1px solid ${retro ? C.jam + "66" : C.line}`, borderRadius: 14, padding: "13px 14px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, display: "flex", alignItems: "center", gap: 7 }}><Calendar size={16} color={C.jam} /> Jour de la vente</div>
          <button onClick={() => { setRetro(false); setSaleDate(""); }} className="ca-tap" style={{ border: `1px solid ${!retro ? C.jam : C.line}`, background: !retro ? C.jam : "#fff", color: !retro ? "#fff" : C.ink, borderRadius: 999, padding: "6px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Aujourd'hui</button>
        </div>
        <CalGrid sales={sales} selected={retro ? saleDate : ""} onPick={(iso) => { const today = new Date().toISOString().slice(0, 10); if (iso === today) { setRetro(false); setSaleDate(""); } else { setRetro(true); setSaleDate(iso); if (!saleTime) setSaleTime("10:00"); } }} />
        {retro && saleDate && (
          <div style={{ marginTop: 11, paddingTop: 11, borderTop: `1px solid ${C.line}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, fontSize: 12.5, color: C.jam, fontWeight: 700, lineHeight: 1.4 }}>Vente enregistrée pour le {new Date(saleDate + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" })}</div>
              <div style={{ width: 104 }}><input type="time" value={saleTime} onChange={(e) => setSaleTime(e.target.value)} style={{ ...inp(), padding: "8px 10px", fontSize: 13 }} /></div>
            </div>
          </div>
        )}
      </div>

      <div style={{ background: C.board, color: C.chalk, borderRadius: 16, padding: "16px 18px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", opacity: .65 }}>{focusIsToday ? "Aujourd'hui" : "Saisie"} · {todayK}</div>
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
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{o.name} <span style={{ color: C.soft, fontWeight: 500 }}>· {o.id}</span>{o.waSent === false && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: "#fff", background: C.caramel, borderRadius: 5, padding: "2px 5px", verticalAlign: "middle" }}>NON TRANSMISE</span>}</div>
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

      <div className="caisse-work">
        <div className="caisse-products">
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
          <button onClick={addCustomLine} className="ca-tap" style={{ width: "100%", marginBottom: 10, background: "#fff", border: `1.5px dashed ${C.jam}`, color: C.jam, borderRadius: 14, padding: "12px 14px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}><Plus size={16} /> Article libre (nom + prix + quantité)</button>
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
        </div>

        <div className="caisse-ticket" ref={ticketRef}>
          {tCount > 0 ? (
            <div style={{ ...card, border: `1.5px solid ${C.jam}` }}>
              <div style={{ ...h2, display: "flex", alignItems: "center", justifyContent: "space-between" }}><span>Commande en cours</span><span style={{ fontSize: 11, fontWeight: 600, color: C.ok }}>✓ sauvegardée</span></div>
              {lines.map(([pid, l]) => (
                <div key={pid} style={{ padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {l.custom ? (
                      <input value={l.name || ""} onChange={(e) => setLineName(pid, e.target.value)} placeholder="Nom de l'article" style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, color: C.ink, border: `1px solid ${C.line}`, borderRadius: 7, padding: "5px 7px", background: "#fff" }} />
                    ) : (
                      <span style={{ flex: 1, fontSize: 13.5, color: C.ink, minWidth: 0 }}>{l.name}{l.offert && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 800, color: "#fff", background: PF.good, borderRadius: 5, padding: "2px 6px", verticalAlign: "middle" }}>OFFERT</span>}</span>
                    )}
                    <button onClick={() => dec(pid)} className="ca-tap" style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.line}`, background: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}><Minus size={14} /></button>
                    <span style={{ minWidth: 18, textAlign: "center", fontWeight: 700, fontSize: 14 }}>{l.qty}</span>
                    <button onClick={() => add({ id: pid, name: l.name, unit: l.unit, price: l.price }, l.offert)} className="ca-tap" style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.line}`, background: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}><Plus size={14} /></button>
                    <button onClick={() => removeLine(pid)} className="ca-tap" style={{ marginLeft: 4, background: "#fff", border: `1.5px solid ${C.jam}`, color: C.jam, borderRadius: 8, padding: "5px 8px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><X size={12} /></button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <span style={{ fontSize: 11.5, color: C.soft, flexShrink: 0 }}>Prix unitaire</span>
                    <input inputMode="decimal" disabled={l.offert} value={l.price == null ? "" : String(l.price).replace(".", ",")} onChange={(e) => setLinePrice(pid, e.target.value.replace(",", "."))} style={{ width: 72, border: `1px solid ${C.line}`, borderRadius: 7, padding: "5px 7px", fontSize: 13, fontWeight: 700, color: l.offert ? C.soft : C.ink, background: l.offert ? "#f3ede0" : "#fff", textDecoration: l.offert ? "line-through" : "none" }} />
                    <span style={{ fontSize: 11.5, color: C.soft }}>€</span>
                    <button onClick={() => toggleOffert(pid)} className="ca-tap" style={{ marginLeft: "auto", background: l.offert ? PF.good : "#fff", color: l.offert ? "#fff" : C.soft, border: `1px solid ${l.offert ? PF.good : C.line}`, borderRadius: 7, padding: "5px 10px", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>{l.offert ? "✓ Offert" : "Offrir"}</button>
                  </div>
                </div>
              ))}
              <button onClick={closeOrder} className="ca-tap" style={{ width: "100%", marginTop: 14, background: C.ok, color: "#fff", border: "none", borderRadius: 14, padding: "15px 18px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 10px 24px -12px #16140f88" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 9 }}><Check size={18} /> {retro && saleDate ? `Enregistrer pour le ${new Date(saleDate + "T" + (saleTime || "10:00")).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })} · ${tCount} art.` : `Fermer la commande · ${tCount} art.`}</span>
                <span style={{ fontFamily: SCRIPT, fontSize: 18 }}>{eur(tTotal)}</span>
              </button>
              <button onClick={() => setTicket({})} className="ca-tap" style={{ width: "100%", marginTop: 8, background: "transparent", border: "none", color: C.soft, fontSize: 12.5, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>Vider la commande</button>
            </div>
          ) : (
            <div className="caisse-empty-ticket" style={card}>
              <div style={h2}>Commande en cours</div>
              <div style={{ fontSize: 13, color: C.soft }}>Touchez un produit pour commencer une vente.</div>
            </div>
          )}
        </div>
      </div>

      {tCount > 0 && (
        <button onClick={() => ticketRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} className="caisse-mobilebar ca-tap">
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700 }}><ShoppingBag size={16} /> {tCount} art.</span>
          <span style={{ fontFamily: SCRIPT, fontSize: 19 }}>{eur(tTotal)}</span>
        </button>
      )}

      {justClosed && <div style={{ background: "#3F7A4B14", border: "1px solid #3F7A4B33", color: C.ok, borderRadius: 12, padding: "10px 14px", fontWeight: 700, fontSize: 13.5, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><Check size={16} /> Commande enregistrée</div>}

      <div style={card}>
        <div style={h2}>{focusIsToday ? "Ventes du jour" : "Ventes du " + new Date(focusTs).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" })}</div>
        {todayOrders.length === 0 ? (
          <div style={{ fontSize: 13, color: C.soft, padding: "6px 0" }}>Aucune commande fermée aujourd'hui.</div>
        ) : todayOrders.map((o) => (
          <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${C.line}` }}>
            <span style={{ fontSize: 12, color: C.soft, width: 46, flexShrink: 0 }}>{hhmm(o.ts)}</span>
            <span style={{ flex: 1, fontSize: 13.5, color: C.ink, minWidth: 0 }}>{o.count} article{o.count > 1 ? "s" : ""} <span style={{ color: C.soft }}>· {o.items.map((it) => it.name + " ×" + it.qty).join(", ")}</span></span>
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
        <div onClick={() => !ebusy && setEdit(null)} style={{ position: "fixed", inset: 0, zIndex: 100, background: "#16140fcc", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 12px", overflowY: "auto" }}>
          <div className="ca-anim" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: C.paper, borderRadius: 20, padding: "18px 16px", maxHeight: "min(90vh, 880px)", margin: "auto", overflowY: "auto", boxShadow: "0 24px 60px -16px #000" }}>
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
        <div onClick={() => !obusy && setOEdit(null)} style={{ position: "fixed", inset: 0, zIndex: 100, background: "#16140fcc", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 12px", overflowY: "auto" }}>
          <div className="ca-anim" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: C.paper, borderRadius: 20, padding: "18px 16px", maxHeight: "min(90vh, 880px)", margin: "auto", overflowY: "auto", boxShadow: "0 24px 60px -16px #000" }}>
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
