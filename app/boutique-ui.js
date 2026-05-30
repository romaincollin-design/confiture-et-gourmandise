"use client";
import { useState, useMemo } from "react";
import {
  ShoppingBag, Plus, Minus, Check, MapPin, Truck, Mail, Tag, Package,
  Users, Settings, ChevronRight, ChevronLeft, ChevronDown, QrCode, Send, CreditCard,
  Smartphone, Power, Store, Sparkles, Trash2, X, MessageCircle, Copy, Lock
} from "lucide-react";

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
`;

const C = {
  cream: "#EFE7D5", paper: "#FBF6EA", board: "#16140F", chalk: "#F3ECD6",
  ink: "#241F17", soft: "#8C8068", line: "#241F1718",
  jam: "#7A2B33", caramel: "#B5722B", ok: "#3F7A4B",
};
const SCRIPT = "'Pacifico', cursive";
const SANS = "'Raleway', system-ui, sans-serif";
const eur = (n) => (Number.isInteger(n) ? n + " €" : n.toFixed(2).replace(".", ",") + " €");

const BRAND = { name: "Comme Avant", tag: "Confitures & gourmandises", tel: "06 12 34 56 78", wa: "33612345678", email: "contact@comme-avant.fr" };
const VCARD = `BEGIN:VCARD
VERSION:3.0
FN:Comme Avant — Confitures & gourmandises
ORG:Comme Avant (association)
TEL;TYPE=CELL:06 12 34 56 78
EMAIL:contact@comme-avant.fr
NOTE:Des goûts et des saveurs d'antan. Circuit court, fait main.
END:VCARD`;
const VCARD_HREF = "data:text/vcard;charset=utf-8," + encodeURIComponent(VCARD);

const CAT_ORDER = ["Confitures", "Gelées", "Gourmandises", "Salé", "Produits locaux", "Bientôt"];
const CAT_SUB = {
  Confitures: "fruits frais · locaux · sans traitement",
  "Gelées": "fruits frais · locaux · sans traitement",
  Gourmandises: "fait avec amour",
  "Salé": "fait maison",
  "Produits locaux": "du coin, faits près d'ici",
  "Bientôt": "très bientôt en pot",
};

const SEED_PRODUCTS = [
  { id: "orange-amere", name: "Oranges amères", cat: "Confitures", price: 7, unit: "pot 250g", stock: 12, illu: "orange", col: "#C25E1E" },
  { id: "orange-douce", name: "Oranges douces", cat: "Confitures", price: 7, unit: "pot 250g", stock: 10, illu: "orange", col: "#E07A1F" },
  { id: "quetsche", name: "Quetsche", cat: "Confitures", price: 7, unit: "pot 250g", stock: 9, illu: "plum", col: "#5B2A4A" },
  { id: "reine-claude", name: "Reine Claude", cat: "Confitures", price: 7, unit: "pot 250g", stock: 8, illu: "plum", col: "#7E8B3A" },
  { id: "mure", name: "Mûre", cat: "Confitures", price: 7, unit: "pot 250g", stock: 7, illu: "mure", col: "#5B2150" },
  { id: "pomme", name: "Pomme", cat: "Confitures", price: 7, unit: "pot 250g", stock: 14, illu: "apple", col: "#B23A2E" },
  { id: "citron", name: "Citron", cat: "Confitures", price: 7, unit: "pot 250g", stock: 11, illu: "lemon", col: "#E3B100" },
  { id: "citron-bergamotte", name: "Citron Bergamotte", cat: "Confitures", price: 7, unit: "pot 250g", stock: 6, illu: "lemon", col: "#C9D14A" },
  { id: "citron-gingembre", name: "Citron Gingembre", cat: "Confitures", price: 7, unit: "pot 250g", stock: 6, illu: "lemon", col: "#D8A93A" },
  { id: "gelee-citron", name: "Gelée de Citron", cat: "Gelées", price: 7, unit: "pot 250g", stock: 8, illu: "lemon", col: "#E3B100" },
  { id: "gelee-orange", name: "Gelée d'Orange amère", cat: "Gelées", price: 7, unit: "pot 250g", stock: 7, illu: "orange", col: "#C25E1E" },
  { id: "gelee-pomme", name: "Gelée de Pomme", cat: "Gelées", price: 7, unit: "pot 250g", stock: 9, illu: "apple", col: "#B23A2E" },
  { id: "gelee-coing", name: "Gelée de Coing", cat: "Gelées", price: 7, unit: "pot 250g", stock: 5, illu: "quince", col: "#D8A93A" },
  { id: "caramels", name: "Caramels au beurre salé", cat: "Gourmandises", price: 4, unit: "sachet 100g", stock: 20, illu: "caramel", col: "#9A5E1F" },
  { id: "cake", name: "Cake aux fruits confits", cat: "Gourmandises", price: 35, unit: "au kilo", stock: 6, illu: "cake", col: "#A9712E" },
  { id: "pain-epices", name: "Pain d'épices", cat: "Gourmandises", price: 35, unit: "au kilo", stock: 6, illu: "loaf", col: "#8A5A24" },
  { id: "pissaladiere", name: "Pissaladière", cat: "Salé", price: 36, unit: "plaque (12 parts) · 3 € la part", stock: 4, illu: "pissa", col: "#7A6A2A" },
  { id: "fraise", name: "Fraise", cat: "Bientôt", price: 7, unit: "pot 250g", stock: 0, soon: true, illu: "berry", col: "#C0392B" },
  { id: "abricot", name: "Abricot", cat: "Bientôt", price: 7, unit: "pot 250g", stock: 0, soon: true, illu: "apricot", col: "#E08A2E" },
  { id: "nefle", name: "Nèfle", cat: "Bientôt", price: 7, unit: "pot 250g", stock: 0, soon: true, illu: "apricot", col: "#C98A3A" },
];
const SEED_ORDERS = [
  { id: "C-1042", name: "Sophie Mercier", email: "sophie.m@email.fr", items: 3, total: 21, mode: "retrait", date: "Mar 27/05", status: "Prête", paid: false },
  { id: "C-1041", name: "Karim Belaïd", email: "karim.b@email.fr", items: 6, total: 46, mode: "livraison", date: "Lun 26/05", status: "Livrée", paid: true },
];
const SEED_CLIENTS = [
  { email: "sophie.m@email.fr", prenom: "Sophie", nom: "Mercier", tel: "06 12 34 56 78", orders: 4, spent: 84 },
  { email: "karim.b@email.fr", prenom: "Karim", nom: "Belaïd", tel: "06 98 76 54 32", orders: 2, spent: 67 },
  { email: "lea.r@email.fr", prenom: "Léa", nom: "Roux", tel: "07 11 22 33 44", orders: 0, spent: 0 },
];

/* ---------- Illustrations façon étiquette ---------- */
function Illu({ k, col, s = 46 }) {
  const hl = "rgba(255,255,255,.30)";
  const leaf = <path d="M23 8 Q21 3 16 4 Q18 9 23 10 Z" fill="#6f8f3a" />;
  const wrap = (kids) => <svg width={s} height={s} viewBox="0 0 46 46" style={{ display: "block" }}>{kids}</svg>;
  if (k === "lemon") return wrap(<>{leaf}<ellipse cx="23" cy="27" rx="14" ry="10" fill={col} /><ellipse cx="18" cy="23" rx="3.4" ry="2.2" fill={hl} /></>);
  if (k === "mure") return wrap(<>{leaf}<g>{[[18, 18], [24, 16], [30, 18], [15, 24], [21, 23], [27, 23], [33, 24], [19, 30], [25, 31], [31, 30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.6" fill={i % 2 ? "#7B1FA2" : col} />)}</g></>);
  if (k === "caramel") return wrap(<><path d="M9 20 L14 25 L9 30 Z" fill={col} opacity=".7" /><path d="M37 20 L32 25 L37 30 Z" fill={col} opacity=".7" /><rect x="13" y="16" width="20" height="18" rx="5" fill={col} /><rect x="17" y="20" width="6" height="4" rx="2" fill={hl} /></>);
  if (k === "cake") return wrap(<><path d="M10 30 L23 13 L36 30 Z" fill={col} /><circle cx="21" cy="25" r="2" fill="#5b2150" /><circle cx="27" cy="26" r="2" fill="#C0392B" /><circle cx="24" cy="20" r="1.8" fill="#E3B100" /></>);
  if (k === "loaf") return wrap(<><rect x="9" y="18" width="28" height="14" rx="7" fill={col} /><path d="M14 22 L20 22 M24 22 L31 22" stroke={hl} strokeWidth="1.6" strokeLinecap="round" /></>);
  if (k === "pissa") return wrap(<><path d="M9 32 L23 12 L37 32 Z" fill={col} opacity=".55" /><circle cx="20" cy="26" r="1.8" fill="#241F17" /><circle cx="26" cy="27" r="1.8" fill="#241F17" /><circle cx="23" cy="21" r="1.6" fill="#241F17" /></>);
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
  const [profile, setProfile] = useState({ name: "Comme Avant", tag: "Confitures, gourmandises & produits locaux", tagline: "Des goûts et des saveurs d'antan, par amour du goût du vrai.", tel: "06 12 34 56 78", email: "contact@comme-avant.fr", wa: "33612345678", pin: "1234" });
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
      </g>
      {/* Pissaladière */}
      <g transform="translate(146 6)">
        <ellipse cx="30" cy="86" rx="25" ry="4" fill="#E7DCC4" />
        <path d="M30 28 L10 80 Q30 87 50 80 Z" fill="#CDA456" stroke="#A9742E" strokeWidth="1" />
        <path d="M10 80 Q30 87 50 80" fill="none" stroke="#A9742E" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M22 58 q8 -5 16 0" fill="none" stroke="#B07F33" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M19 69 q11 -6 22 0" fill="none" stroke="#B07F33" strokeWidth="1.4" strokeLinecap="round" />
        <ellipse cx="26" cy="63" rx="2.3" ry="2.9" fill="#2E241A" />
        <ellipse cx="35" cy="71" rx="2.3" ry="2.9" fill="#2E241A" />
        <ellipse cx="30" cy="52" rx="2.1" ry="2.7" fill="#2E241A" />
      </g>
      {/* Pain d'épices */}
      <g transform="translate(216 6)">
        <ellipse cx="30" cy="86" rx="27" ry="4" fill="#E7DCC4" />
        <path d="M7 66 Q7 46 30 46 Q53 46 53 66 L53 78 Q53 84 47 84 L13 84 Q7 84 7 78 Z" fill="#8A5A24" stroke="#6E4519" strokeWidth="1" />
        <path d="M12 56 Q30 47 48 56" fill="none" stroke="#A56E2C" strokeWidth="2" strokeLinecap="round" />
        <line x1="22" y1="50" x2="20" y2="63" stroke="#6E4519" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="30" y1="48" x2="30" y2="63" stroke="#6E4519" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="38" y1="50" x2="40" y2="63" stroke="#6E4519" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="24" cy="74" r="1" fill="#5E3C16" />
        <circle cx="36" cy="76" r="1" fill="#5E3C16" />
        <circle cx="30" cy="72" r="1" fill="#5E3C16" />
      </g>
    </svg>
  );
}

function Welcome({ setStep, setIntent, profile }) {
  const steps = [["1", "Coordonnées"], ["2", "Saveurs"], ["3", "Commande"]];
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
        <p style={{ color: C.ink, fontSize: 14.5, lineHeight: 1.55, margin: "0 0 14px" }}>{profile.tagline}</p>
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
        <BigBtn onClick={() => { setIntent("order"); setStep("coords"); }}>Entrer dans la boutique <ChevronRight size={16} /></BigBtn>
        <button onClick={() => setStep("contact")} className="ca-tap" style={{ width: "100%", marginTop: 12, background: "transparent", border: "none", color: C.soft, fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, textDecoration: "underline", textUnderlineOffset: 3 }}><Smartphone size={14} /> Enregistrer nos coordonnées</button>
      </div>
    </div>
  );
}

function Contact({ setStep, profile }) {
  const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.name}\nORG:${profile.name}\nTEL;TYPE=CELL:${profile.tel}\nEMAIL:${profile.email}\nNOTE:${profile.tagline}\nEND:VCARD`;
  const href = "data:text/vcard;charset=utf-8," + encodeURIComponent(vcard);
  return (
    <div className="ca-anim" style={{ padding: "6px 22px 28px" }}>
      <StepHead onBack={() => setStep("welcome")} title="Nos coordonnées" sub="Gardez le stand dans votre poche" />
      <div style={{ background: C.board, color: C.chalk, borderRadius: 16, padding: 22, textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "#d8b46a" }}>✦ &nbsp; ✦ &nbsp; ✦</div>
        <div style={{ fontFamily: SCRIPT, fontSize: 26, marginTop: 6 }}>{profile.name}</div>
        <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", opacity: .7, marginBottom: 16, padding: "0 8px" }}>{profile.tag}</div>
        {[[Smartphone, profile.tel], [Mail, profile.email], [MapPin, "Sur le marché · livraison dans la semaine"]].map(([Ic, v], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", fontSize: 13, padding: "5px 0" }}>
            <Ic size={15} color="#d8b46a" /> {v}
          </div>
        ))}
      </div>
      <a href={href} download="contact.vcf" className="ca-tap"
        style={{ width: "100%", background: C.jam, color: "#fff", borderRadius: 13, padding: "15px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", boxSizing: "border-box" }}>
        <Smartphone size={16} /> Ajouter à mes contacts
      </a>
      <GhostBtn onClick={() => setStep("coords")}><ShoppingBag size={16} /> Plutôt passer une commande</GhostBtn>
    </div>
  );
}

function Coords({ cust, setCust, setStep, upsertClient, intent }) {
  const [optin, setOptin] = useState(true);
  const ok = cust.prenom && cust.nom && cust.tel && cust.email.includes("@");
  const lead = intent === "lead";
  const set = (k) => (v) => setCust({ ...cust, [k]: v });
  return (
    <div className="ca-anim" style={{ padding: "6px 22px 28px" }}>
      <StepHead onBack={() => setStep("welcome")} title="Vos coordonnées"
        sub={lead ? "Restez informé·e de nos nouveautés et offres" : "Une étape avant de découvrir nos saveurs"} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
        <Field label="Prénom" value={cust.prenom} onChange={set("prenom")} ph="Marie" />
        <Field label="Nom" value={cust.nom} onChange={set("nom")} ph="Dupont" />
      </div>
      <Field label="Téléphone" value={cust.tel} onChange={set("tel")} type="tel" ph="06 12 34 56 78" />
      <Field label="Email" value={cust.email} onChange={set("email")} type="email" ph="marie@email.fr" />
      <label className="ca-tap" style={{ display: "flex", alignItems: "flex-start", gap: 9, background: C.cream, border: `1px solid ${C.line}`, borderRadius: 11, padding: "11px 12px", cursor: "pointer", margin: "2px 0 14px" }}>
        <input type="checkbox" checked={optin} onChange={(e) => setOptin(e.target.checked)} style={{ accentColor: C.jam, marginTop: 2 }} />
        <span style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.45 }}>Je souhaite recevoir les nouveautés et offres de Comme Avant.</span>
      </label>
      <p style={{ fontSize: 11, color: C.soft, lineHeight: 1.5, margin: "0 0 16px" }}>Vos infos servent uniquement à {lead ? "vous tenir informé·e" : "gérer votre commande"} — jamais transmises à des tiers.</p>
      {lead
        ? <BigBtn disabled={!ok} onClick={() => { upsertClient(cust); setStep("leadDone"); }}>Valider mes coordonnées <Check size={16} /></BigBtn>
        : <BigBtn disabled={!ok} onClick={() => { upsertClient(cust); setStep("shop"); }}>Voir nos saveurs <ChevronRight size={17} /></BigBtn>}
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

function Shop({ products, cart, add, sub1, count, total, setStep }) {
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

function Checkout({ mode, setMode, sub, discount, total, paymentEnabled, placeOrder, setStep }) {
  const [pm, setPm] = useState("cb");
  return (
    <div className="ca-anim" style={{ padding: "6px 22px 28px" }}>
      <StepHead onBack={() => setStep("cart")} title="Finaliser" sub="Récupération & règlement" />
      <Section>Mode de récupération</Section>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        {[["retrait", MapPin, "Retrait", "Au stand, le marché"], ["livraison", Truck, "Livraison", "Dans la semaine"]].map(([k, Ic, t, s]) => (
          <button key={k} onClick={() => setMode(k)} className="ca-tap" style={{ textAlign: "left", cursor: "pointer", borderRadius: 13, padding: 14, border: `1.5px solid ${mode === k ? C.jam : C.line}`, background: mode === k ? "#7A2B330d" : C.cream }}>
            <Ic size={18} color={mode === k ? C.jam : C.soft} />
            <div style={{ fontWeight: 600, fontSize: 14, marginTop: 7 }}>{t}</div>
            <div style={{ fontSize: 11.5, color: C.soft }}>{s}</div>
          </button>
        ))}
      </div>
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
          <div style={{ fontSize: 12.5, color: C.soft, lineHeight: 1.5, marginTop: 6 }}>Vous réglez <b style={{ color: C.ink }}>à l'enlèvement</b> (espèces / lien envoyé). Le paiement carte, PayPal ou Lydia s'active en un clic côté Pro.</div>
        </div>
      )}
      <Totals {...{ sub, discount, total }} />
      <div style={{ marginTop: 16 }}><BigBtn onClick={placeOrder}>{paymentEnabled ? "Payer & commander" : "Valider la réservation"} · {eur(total)}</BigBtn></div>
    </div>
  );
}

function Done({ lastOrder, mode, resetClient, paymentEnabled, cust, profile }) {
  const [copied, setCopied] = useState(false);
  const o = lastOrder || { lines: [], total: 0, id: "" };
  const lignes = o.lines.map((l) => `• ${l.qty}x ${l.name} (${l.unit}) — ${eur(l.price * l.qty)}`).join("\n");
  const recap = `Commande ${profile.name} ${o.id}\n${cust?.prenom || ""} ${cust?.nom || ""}\nTél : ${cust?.tel || ""}\nEmail : ${cust?.email || ""}\n\n${lignes}\n\nTotal : ${eur(o.total)}\n${mode === "retrait" ? "Retrait au stand le jour du marché" : "Livraison dans la semaine"}${!paymentEnabled ? " — règlement à l'enlèvement" : ""}`;
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
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: C.soft, marginTop: 10 }}>{mode === "retrait" ? <MapPin size={14} /> : <Truck size={14} />}{mode === "retrait" ? "Retrait au stand le jour du marché" : "Livraison prévue dans la semaine"}{!paymentEnabled && " · règlement à l'enlèvement"}</div>
      </div>
      <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: C.caramel, fontWeight: 700, textAlign: "left", marginBottom: 10 }}>Envoyer ma commande</div>
      <a href={wa} target="_blank" rel="noreferrer" className="ca-tap" style={{ width: "100%", background: "#1FA855", color: "#fff", borderRadius: 13, padding: "14px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, textDecoration: "none", boxSizing: "border-box" }}><MessageCircle size={17} /> Envoyer par WhatsApp</a>
      <a href={mailto} className="ca-tap" style={{ width: "100%", marginTop: 10, background: C.board, color: C.chalk, borderRadius: 13, padding: "14px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, textDecoration: "none", boxSizing: "border-box" }}><Mail size={16} /> Envoyer par email</a>
      <button onClick={copy} className="ca-tap" style={{ width: "100%", marginTop: 10, background: "transparent", border: `1.5px solid ${C.line}`, color: C.jam, borderRadius: 13, padding: "12px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{copied ? <><Check size={15} /> Copié</> : <><Copy size={15} /> Copier le récapitulatif</>}</button>
      <button onClick={resetClient} className="ca-tap" style={{ ...backBtn(), margin: "16px auto 0" }}>Nouvelle commande</button>
    </div>
  );
}

/* ---------------- PRO ---------------- */
function ProView({ orders, setOrders, products, setProducts, clients, promos, setPromos, paymentEnabled, setPaymentEnabled, profile, setProfile, onLogout }) {
  const [tab, setTab] = useState("commandes");
  const NAV = [["commandes", "Commandes", ShoppingBag], ["produits", "Produits", Package], ["clients", "Clients (CRM)", Users], ["publimail", "Publimail", Mail], ["promos", "Promos", Tag], ["profil", "Enseigne", Store], ["reglages", "Réglages", Settings]];
  return (
    <div style={{ display: "flex", minHeight: 706 }}>
      <div style={{ width: 212, background: C.paper, borderRight: `1px solid ${C.line}`, padding: 12, flexShrink: 0 }}>
        {NAV.map(([k, lbl, Ic]) => (
          <button key={k} onClick={() => setTab(k)} className="ca-tap" style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, border: "none", cursor: "pointer", padding: "11px 12px", borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 3, textAlign: "left", background: tab === k ? C.board : "transparent", color: tab === k ? C.chalk : C.ink }}><Ic size={16} /> {lbl}</button>
        ))}
      </div>
      <div className="ca-scroll" style={{ flex: 1, padding: "24px 26px", maxHeight: 706, overflowY: "auto", background: C.cream }}>
        {tab === "commandes" && <ProOrders {...{ orders, setOrders }} />}
        {tab === "produits" && <ProProducts {...{ products, setProducts }} />}
        {tab === "clients" && <ProClients {...{ clients }} />}
        {tab === "publimail" && <ProMail {...{ clients }} />}
        {tab === "promos" && <ProPromos {...{ promos, setPromos }} />}
        {tab === "profil" && <ProProfile {...{ profile, setProfile, onLogout }} />}
        {tab === "reglages" && <ProSettings {...{ paymentEnabled, setPaymentEnabled }} />}
      </div>
    </div>
  );
}
const STATUSES = ["À préparer", "Prête", "Retirée", "Livrée"];
function ProOrders({ orders, setOrders }) {
  const setStatus = (id, s) => setOrders((l) => l.map((o) => o.id === id ? { ...o, status: s } : o));
  return (
    <div className="ca-anim">
      <ProHead title="Commandes" sub={`${orders.length} commandes · ${eur(orders.reduce((s, o) => s + o.total, 0))} de chiffre`} />
      {orders.map((o) => (
        <div key={o.id} style={card()}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{o.name} <span style={{ color: C.soft, fontWeight: 500 }}>· {o.id}</span></div>
              <div style={{ fontSize: 12, color: C.soft, marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>{o.mode === "retrait" ? <MapPin size={13} /> : <Truck size={13} />}{o.mode} · {o.items} art. · {o.date}{o.paid ? <span style={{ color: C.ok, fontWeight: 600 }}>· payé</span> : <span style={{ color: C.caramel, fontWeight: 600 }}>· à régler</span>}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: SCRIPT, fontSize: 18, color: C.jam }}>{eur(o.total)}</span>
              <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} style={sel(o.status)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
function ProProducts({ products, setProducts }) {
  const ILLUS = ["orange", "lemon", "plum", "mure", "apple", "quince", "berry", "apricot", "caramel", "cake", "loaf", "pissa"];
  const blank = { name: "", cat: "Confitures", unit: "pot 250g", price: "", stock: "", illu: "orange", col: "#C25E1E" };
  const [creating, setCreating] = useState(false);
  const [nw, setNw] = useState(blank);
  const [openId, setOpenId] = useState(null);
  const [openCat, setOpenCat] = useState({});

  const updField = (id, key, val) => setProducts((l) => l.map((p) => p.id === id ? { ...p, [key]: (key === "price" || key === "stock") ? (val === "" ? 0 : +val) : val } : p));
  const toggle = (id) => setProducts((l) => l.map((p) => p.id === id ? { ...p, active: p.active === false ? true : false } : p));
  const remove = (id) => setProducts((l) => l.filter((p) => p.id !== id));
  const create = () => {
    if (!nw.name || nw.price === "") return;
    setProducts((l) => [{ id: "x" + Date.now(), name: nw.name, cat: nw.cat, unit: nw.unit, price: +nw.price, stock: +nw.stock || 0, illu: nw.illu, col: nw.col }, ...l]);
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
            <div><MiniLabel>Prix unitaire €</MiniLabel><input type="number" value={nw.price} onChange={(e) => setNw({ ...nw, price: e.target.value })} placeholder="7" style={inp()} /></div>
            <div><MiniLabel>Stock</MiniLabel><input type="number" value={nw.stock} onChange={(e) => setNw({ ...nw, stock: e.target.value })} placeholder="0" style={inp()} /></div>
          </div>
          <div style={{ margin: "12px 0 0" }}><MiniLabel>Illustration & couleur</MiniLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4, alignItems: "center" }}>
              {ILLUS.map((k) => (<button key={k} onClick={() => setNw({ ...nw, illu: k })} className="ca-tap" style={swatch(nw.illu === k)}><Illu k={k} col={nw.col} s={30} /></button>))}
              <input type="color" value={nw.col} onChange={(e) => setNw({ ...nw, col: e.target.value })} title="Couleur" style={{ width: 40, height: 40, border: `1px solid ${C.line}`, borderRadius: 10, background: C.cream, cursor: "pointer", marginLeft: 4 }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={create} disabled={!nw.name || nw.price === ""} className="ca-tap" style={{ flex: 1, background: (!nw.name || nw.price === "") ? C.line : C.jam, color: "#fff", border: "none", borderRadius: 11, padding: "12px", fontWeight: 600, cursor: (!nw.name || nw.price === "") ? "default" : "pointer", fontSize: 13.5 }}>Créer le produit</button>
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
                      <div><MiniLabel>Prix €</MiniLabel><input type="number" value={p.price} onChange={(e) => updField(p.id, "price", e.target.value)} style={inp()} /></div>
                      <div><MiniLabel>Stock</MiniLabel><input type="number" value={p.stock} onChange={(e) => updField(p.id, "stock", e.target.value)} style={{ ...inp(), borderColor: p.stock <= 5 ? C.caramel : C.line }} /></div>
                      <div style={{ display: "flex", gap: 6, alignSelf: "center" }}>
                        <button onClick={() => toggle(p.id)} className="ca-tap" style={{ border: `1px solid ${C.line}`, background: p.active === false ? "transparent" : "#3F7A4B14", color: p.active === false ? C.soft : C.ok, borderRadius: 9, padding: "9px 10px", fontWeight: 600, fontSize: 11.5, cursor: "pointer", whiteSpace: "nowrap" }}>{p.active === false ? "Masqué" : "En ligne"}</button>
                        <button onClick={() => remove(p.id)} className="ca-tap" title="Supprimer" style={{ border: `1px solid ${C.line}`, background: "transparent", color: C.jam, borderRadius: 9, padding: "9px 10px", cursor: "pointer", display: "grid", placeItems: "center" }}><Trash2 size={15} /></button>
                      </div>
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
function ProClients({ clients }) {
  return (
    <div className="ca-anim">
      <ProHead title="Clients · CRM" sub={`${clients.length} contacts capturés via le QR`} />
      {clients.map((c) => (
        <div key={c.email} style={{ ...card(), display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.board, color: C.chalk, display: "grid", placeItems: "center", fontFamily: SCRIPT, fontSize: 15 }}>{c.prenom[0]}{c.nom[0]}</div>
            <div><div style={{ fontWeight: 600, fontSize: 14 }}>{c.prenom} {c.nom}</div><div style={{ fontSize: 12, color: C.soft }}>{c.email} · {c.tel}</div></div>
          </div>
          <div style={{ textAlign: "right" }}><div style={{ fontFamily: SCRIPT, fontSize: 16, color: C.jam }}>{eur(c.spent)}</div><div style={{ fontSize: 11.5, color: C.soft }}>{c.orders === 0 ? "prospect" : `${c.orders} commande${c.orders > 1 ? "s" : ""}`}</div></div>
        </div>
      ))}
    </div>
  );
}
function ProMail({ clients }) {
  const [aud, setAud] = useState("tous"); const [obj, setObj] = useState(""); const [msg, setMsg] = useState(""); const [sent, setSent] = useState(0);
  const targets = aud === "tous" ? clients.length : aud === "acheteurs" ? clients.filter((c) => c.orders > 0).length : clients.filter((c) => c.orders === 0).length;
  return (
    <div className="ca-anim">
      <ProHead title="Publimail" sub="Annoncez nouveautés et offres à vos clients" />
      <div style={card()}>
        <MiniLabel>Destinataires</MiniLabel>
        <div style={{ display: "flex", gap: 8, margin: "6px 0 16px" }}>
          {[["tous", "Tous"], ["acheteurs", "Ont commandé"], ["prospects", "Prospects"]].map(([k, l]) => (<button key={k} onClick={() => setAud(k)} className="ca-tap" style={{ flex: 1, border: `1.5px solid ${aud === k ? C.jam : C.line}`, background: aud === k ? "#7A2B330d" : C.cream, borderRadius: 10, padding: "9px", fontWeight: 600, fontSize: 12.5, cursor: "pointer", color: C.ink }}>{l}</button>))}
        </div>
        <MiniLabel>Objet</MiniLabel>
        <input value={obj} onChange={(e) => setObj(e.target.value)} placeholder="Les confitures de mûre sont arrivées" style={{ ...inp(), margin: "6px 0 12px" }} />
        <MiniLabel>Message</MiniLabel>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} placeholder="Bonjour, cette semaine au marché…" style={{ ...inp(), margin: "6px 0 14px", resize: "vertical", lineHeight: 1.5 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12.5, color: C.soft }}>→ {targets} contact{targets > 1 ? "s" : ""}</span>
          <button onClick={() => setSent(targets)} disabled={!obj} className="ca-tap" style={{ background: obj ? C.jam : C.line, color: "#fff", border: "none", borderRadius: 11, padding: "11px 18px", fontWeight: 600, cursor: obj ? "pointer" : "default", display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><Send size={15} /> Envoyer</button>
        </div>
        {sent > 0 && <div style={{ marginTop: 12, fontSize: 13, color: C.ok, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}><Check size={15} /> Envoyé à {sent} contacts (démo)</div>}
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
function ProSettings({ paymentEnabled, setPaymentEnabled }) {
  return (
    <div className="ca-anim">
      <ProHead title="Réglages" sub="Le QR code et l'activation du paiement" />
      <div style={card()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}><CreditCard size={17} color={C.jam} /> Paiement en ligne</div>
            <div style={{ fontSize: 13, color: C.soft, lineHeight: 1.5, marginTop: 4, maxWidth: 380 }}>Le parcours carte / PayPal / Lydia est déjà câblé. {paymentEnabled ? "Il est actif côté client." : "Il est en veille — les clients réservent et règlent à l'enlèvement."}</div>
          </div>
          <Switch on={paymentEnabled} onClick={() => setPaymentEnabled((v) => !v)} />
        </div>
        {paymentEnabled && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["PayPal — email / lien", "contact@comme-avant.fr"], ["IBAN virement", "FR76 ····"], ["Lydia — n° / lien", "lien Lydia Pro"]].map(([l, ph]) => (<div key={l}><MiniLabel>{l}</MiniLabel><input placeholder={ph} style={inp()} /></div>))}
            <div style={{ alignSelf: "end", fontSize: 11, color: C.soft }}>Démo — branchement réel à la mise en production.</div>
          </div>
        )}
      </div>
      <div style={{ ...card(), display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 96, height: 96, borderRadius: 14, background: C.board, display: "grid", placeItems: "center", flexShrink: 0 }}><QrCode size={56} color={C.chalk} /></div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>QR code du stand</div>
          <div style={{ fontSize: 13, color: C.soft, lineHeight: 1.5, marginTop: 4 }}>À imprimer et poser sur le stand. Il ouvre votre boutique à l'adresse :</div>
          <div style={{ marginTop: 8, fontFamily: SCRIPT, fontSize: 17, color: C.jam }}>comme-avant.fr</div>
        </div>
      </div>
    </div>
  );
}

function ProProfile({ profile, setProfile, onLogout }) {
  const set = (k) => (v) => setProfile((p) => ({ ...p, [k]: v }));
  return (
    <div className="ca-anim">
      <ProHead title="Profil de l'enseigne" sub="Vos infos commerce — reprises sur la boutique, la carte contact et les commandes" />
      <div style={card()}>
        <Section>Identité</Section>
        <Field label="Nom de l'enseigne" value={profile.name} onChange={set("name")} />
        <Field label="Sous-titre" value={profile.tag} onChange={set("tag")} />
        <div style={{ marginBottom: 12 }}><Lbl>Signature</Lbl><textarea value={profile.tagline} onChange={(e) => set("tagline")(e.target.value)} rows={2} style={{ ...inp(), resize: "vertical", lineHeight: 1.5, marginTop: 5 }} /></div>
      </div>
      <div style={card()}>
        <Section>Contact</Section>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Téléphone" value={profile.tel} onChange={set("tel")} type="tel" />
          <Field label="WhatsApp" value={profile.wa} onChange={set("wa")} type="tel" />
        </div>
        <div style={{ fontSize: 11, color: C.soft, margin: "-4px 0 10px", lineHeight: 1.4 }}>WhatsApp au format international sans « + » ni espaces — ex. 33612345678.</div>
        <Field label="Email" value={profile.email} onChange={set("email")} type="email" />
      </div>
      <div style={card()}>
        <Section>Accès commerçant</Section>
        <Field label="Code d'accès à cet espace" value={profile.pin} onChange={set("pin")} />
        <button onClick={onLogout} className="ca-tap" style={{ marginTop: 6, border: `1px solid ${C.line}`, background: "transparent", color: C.jam, borderRadius: 11, padding: "11px 16px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><Lock size={15} /> Se déconnecter</button>
      </div>
    </div>
  );
}

function ProLogin({ pin, onOk }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);
  const submit = () => { if (code === pin) onOk(); else { setErr(true); setCode(""); } };
  return (
    <div style={{ padding: "56px 24px", display: "grid", placeItems: "center", background: C.cream, minHeight: 620 }}>
      <div style={{ width: "100%", maxWidth: 350, background: C.paper, border: `1px solid ${C.line}`, borderRadius: 18, padding: 28, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: C.board, display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Lock size={26} color={C.chalk} /></div>
        <h2 style={{ fontFamily: SCRIPT, fontSize: 26, margin: "0 0 4px", color: C.jam }}>Espace commerçant</h2>
        <p style={{ fontSize: 13, color: C.soft, lineHeight: 1.5, margin: "0 0 18px" }}>Réservé à l'enseigne. Les clients qui scannent le QR code n'y ont pas accès.</p>
        <input type="password" value={code} onChange={(e) => { setCode(e.target.value); setErr(false); }} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Code d'accès" style={{ ...inp(), textAlign: "center", letterSpacing: ".2em" }} />
        {err && <div style={{ fontSize: 12.5, color: C.jam, fontWeight: 600, margin: "8px 0 0" }}>Code incorrect</div>}
        <div style={{ marginTop: 12 }}><BigBtn onClick={submit}>Entrer <ChevronRight size={16} /></BigBtn></div>
        <div style={{ fontSize: 11, color: C.soft, marginTop: 12 }}>Démo : code <b style={{ color: C.ink }}>1234</b></div>
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
function BigBtn({ children, onClick, disabled }) { return <button onClick={onClick} disabled={disabled} className="ca-tap" style={{ width: "100%", background: disabled ? C.line : C.board, color: disabled ? C.soft : C.chalk, border: "none", borderRadius: 13, padding: "15px 18px", fontWeight: 600, fontSize: 14, cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{children}</button>; }
function GhostBtn({ children, onClick }) { return <button onClick={onClick} className="ca-tap" style={{ width: "100%", marginTop: 10, background: "transparent", color: C.jam, border: `1.5px solid ${C.line}`, borderRadius: 13, padding: "13px 18px", fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{children}</button>; }
function JamBtn({ children, onClick }) { return <button onClick={onClick} className="ca-tap" style={{ width: "100%", marginTop: 10, background: C.jam, color: "#fff", border: "none", borderRadius: 13, padding: "14px 18px", fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{children}</button>; }
function StepHead({ onBack, title, sub }) {
  return (
    <div style={{ padding: "6px 0 14px" }}>
      <button onClick={onBack} className="ca-tap" style={{ ...backBtn(), marginBottom: 10 }}><ChevronLeft size={16} /> Retour</button>
      <h2 style={{ fontFamily: SCRIPT, fontSize: 24, margin: 0, color: C.jam }}>{title}</h2>
      <div style={{ fontSize: 12.5, color: C.soft, marginTop: 2 }}>{sub}</div>
    </div>
  );
}
function ProHead({ title, sub }) { return <div style={{ marginBottom: 18 }}><h2 style={{ fontFamily: SCRIPT, fontSize: 24, margin: 0, color: C.jam }}>{title}</h2><div style={{ fontSize: 13, color: C.soft, marginTop: 3 }}>{sub}</div></div>; }
function Section({ children }) { return <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: C.caramel, fontWeight: 700, marginBottom: 10 }}>{children}</div>; }
function Lbl({ children }) { return <label style={{ fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 600, color: C.soft }}>{children}</label>; }
function Field({ label, value, onChange, type = "text", ph }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <Lbl>{label}</Lbl>
      <input type={type} value={value} placeholder={ph} onChange={(e) => onChange(e.target.value)} style={inp()} />
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
const SEED_PROFILE = { name: "Comme Avant", tag: "Confitures, gourmandises & produits locaux", tagline: "Des goûts et des saveurs d'antan, par amour du goût du vrai.", tel: "06 12 34 56 78", email: "contact@comme-avant.fr", wa: "33612345678", pin: "1234" };

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
  const [products] = useState(SEED_PRODUCTS);
  const [promos] = useState(SEED_PROMOS);
  const [profile] = useState(SEED_PROFILE);
  const paymentEnabled = false;
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [step, setStep] = useState("welcome");
  const [intent, setIntent] = useState("order");
  const [cust, setCust] = useState({ prenom: "", nom: "", tel: "", email: "" });
  const [cart, setCart] = useState({});
  const [mode, setMode] = useState("retrait");
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
  const upsertClient = (c) => setClients((list) => list.find((x) => x.email === c.email) ? list : [{ email: c.email, prenom: c.prenom, nom: c.nom, tel: c.tel, orders: 0, spent: 0 }, ...list]);
  const placeOrder = () => {
    const id = "C-" + (1043 + orders.length);
    const o = { id, name: `${cust.prenom} ${cust.nom}`.trim(), email: cust.email, items: count, total, mode, date: "Auj.", status: "À préparer", paid: false };
    setOrders((l) => [o, ...l]);
    setLastOrder({ ...o, lines: cartLines });
    setStep("done");
  };
  const resetClient = () => { setStep("welcome"); setIntent("order"); setCart({}); setApplied(null); setPromoInput(""); setCust({ prenom: "", nom: "", tel: "", email: "" }); setMode("retrait"); };
  return (
    <div style={{ fontFamily: SANS, background: C.cream, color: C.ink, minHeight: "100vh" }}>
      <style>{FONT}</style>
      <Header profile={profile} />
      <ClientView {...{ step, setStep, intent, setIntent, cust, setCust, products, cartLines, cart, add, sub1, sub, discount, total, count, mode, setMode, promoInput, setPromoInput, applied, setApplied, promos, paymentEnabled, placeOrder, upsertClient, lastOrder, resetClient, profile }} />
    </div>
  );
}

export function EspacePro() {
  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [orders, setOrders] = useState(SEED_ORDERS);
  const [clients, setClients] = useState(SEED_CLIENTS);
  const [promos, setPromos] = useState(SEED_PROMOS);
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [profile, setProfile] = useState(SEED_PROFILE);
  const [proAuth, setProAuth] = useState(false);
  return (
    <div style={{ fontFamily: SANS, background: C.cream, color: C.ink, minHeight: "100vh" }}>
      <style>{FONT}</style>
      <Header profile={profile} badge="Espace commerçant" />
      {proAuth
        ? <ProView {...{ orders, setOrders, products, setProducts, clients, promos, setPromos, paymentEnabled, setPaymentEnabled, profile, setProfile, onLogout: () => setProAuth(false) }} />
        : <ProLogin pin={profile.pin} onOk={() => setProAuth(true)} />}
    </div>
  );
}
