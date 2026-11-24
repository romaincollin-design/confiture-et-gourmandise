// Données fictives communes aux tests navigateur (Supabase intercepté). Réutilisées par scripts/verif-ecran.js.
const today = new Date().toISOString().slice(0, 10);
const P = (id, name, cat, unit, price, cost, stock, extra) => Object.assign({ id, name, cat, unit, price, cost, coef: cost ? +(price / cost).toFixed(2) : 0, stock, illu: '', col: '', soon: false, active: true, sort: 1, composition: null }, extra || {});
const products = [
  P('p1', 'Pissaladière de ma mère', 'Salé', 'pot 300 g', 10, 3.82, 12, { illu: 'pissa' }), P('p2', "Pot d'anchois", 'Produits locaux', 'pot 100 g', 5.5, 3.49, 4, { active: false }),
  P('p3', "Petit pot d'olives", 'Produits locaux', 'pot 100 g', 5.5, 3.49, 4, { active: false }), P('p4', 'Sachet de thym', 'Produits locaux', 'sachet 10 g', 0, 0, 0, { active: false }),
  P('p5', 'Miel', 'Miel', 'pot 500 g', 12, 6.4, 22), P('p6', 'Confiture de melon', 'Confitures', 'pot 383 g', 9, 2.1, 3), P('p7', "Pain d'épices", 'Fêtes', 'part 272 g', 10, 3.1, 0),
  P('p8', 'Crème de marron', 'Gourmandises', 'pot 250 g', 7, 3.5, 6),
  P('cof1', 'Coffret Pissaladière DIY', 'Coffrets', 'coffret', 0, 0, 0, { active: false, composition: { items: [{ pid: 'p1', qty: 1 }, { pid: 'p2', qty: 1 }, { pid: 'p3', qty: 1 }, { pid: 'p4', qty: 1 }], emballage: [{ label: 'Boîte et impression', qty: 1, cost: 1.8 }, { label: 'Fascicule', qty: 1, cost: 0.7 }], visuel: '' } }),
];
const mk = (id, titre, famille, date, extra) => Object.assign({ id, titre, famille, date, lieu: 'Casa Mama', personnel: [{ nom: 'Mama', taux: 0 }], frais_extra: [], rounds_extra: [], oignon_kg: famille === 'pissaladiere' ? 24 : '', poids_fini_kg: 15, extra: [], pots: [{ type: 'pot', format_g: 300, nb: 20 }] }, extra || {});
const batches = [mk('b1', 'Pissaladière de ma mère', 'pissaladiere', today), mk('b2', 'Pissaladière de ma mère', 'pissaladiere', '2026-11-09'), mk('b3', 'Pissaladière à la part', 'pissaladiere', '2026-10-26'), mk('b4', 'Confiture de melon', 'confiture', '2026-11-20'), mk('b5', 'Caramel beurre salé', 'caramel_pot', '2026-11-01')];
const ts = (j) => new Date(Date.now() - j * 864e5).getTime();
const sales = [1, 2, 3, 5, 8].map((j, i) => ({ id: 's' + i, ts: ts(j), total: 30 + i * 12, count: 3, items: [{ pid: 'p1', name: 'Pissaladière de ma mère', qty: 2, price: 10, cost: 3.82 }, { pid: 'p5', name: 'Miel', qty: 1, price: 12, cost: 6.4 }] }));
const orders = [
  { id: 'CA-1048', oid: 'o1', name: 'Aline Martin', email: 'aline@mail.fr', tel: '0612345678', items: 3, total: 32, pickup: 'sam. 28/11 · stand de Vence', date: 'Auj.', ts: ts(0), status: 'À préparer', paid: false, lines: [{ pid: 'p1', name: 'Pissaladière de ma mère', qty: 2, price: 10 }, { pid: 'p5', name: 'Miel', qty: 1, price: 12 }] },
  { id: 'CA-1045', oid: 'o2', name: 'Simon Dupuis', email: '', tel: '+393348101516', items: 2, total: 12, pickup: 'sam. 28/11', date: 'Auj.', ts: ts(1), status: 'Prête', paid: true, lines: [{ pid: 'p8', name: 'Crème de marron', qty: 2, price: 7 }] },
];
const clients = [{ prenom: 'Aline', nom: 'Martin', tel: '0612345678', email: 'aline@mail.fr', optin: true, orders: 5, spent: 148.5 }, { prenom: 'Julien', nom: 'Croci', tel: '0609908489', email: '', optin: true, orders: 3, spent: 74 }, { prenom: 'Simon', nom: 'Dupuis', tel: '+393348101516', email: '', optin: false, orders: 1, spent: 27 }];
// Formes BRUTES renvoyées par les RPC (celles que lisent mapOrderRow et la boucle de chargement de EspacePro)
const iso = (j) => new Date(Date.now() - j * 864e5).toISOString();
const ordersRaw = [
  { ref: 'CA-1048', id: 'o1', name: 'Aline Martin', email: 'aline@mail.fr', tel: '0612345678', items_count: 3, total: 32, pickup: 'sam. 28/11 · stand de Vence', created_at: iso(0), status: 'À préparer', paid: false, parrain: '', wa_sent: false, recap: '', items: [{ pid: 'p1', name: 'Pissaladière de ma mère', unit: 'pot 300 g', qty: 2, price: 10 }, { pid: 'p5', name: 'Miel', unit: 'pot 500 g', qty: 1, price: 12 }] },
  { ref: 'CA-1047', id: 'o3', name: 'Julien Croci', email: '', tel: '0609908489', items_count: 4, total: 37, pickup: 'sam. 28/11 · stand de Vence', created_at: iso(0), status: 'À préparer', paid: true, parrain: '', wa_sent: false, recap: '', items: [{ pid: 'p6', name: 'Confiture de melon', unit: 'pot 383 g', qty: 3, price: 9 }, { pid: 'p7', name: "Pain d'épices", unit: 'part 272 g', qty: 1, price: 10 }] },
  { ref: 'CA-1046', id: 'o4', name: 'Marie Bonnet', email: 'm.bonnet@mail.fr', tel: '0677214003', items_count: 1, total: 28, pickup: 'dim. 29/11 · à domicile', created_at: iso(1), status: 'À préparer', paid: false, parrain: '', wa_sent: false, recap: '', items: [{ pid: 'cof1', name: 'Coffret Pissaladière DIY', unit: 'coffret', qty: 1, price: 28 }] },
  { ref: 'CA-1045', id: 'o2', name: 'Simon Dupuis', email: '', tel: '+393348101516', items_count: 2, total: 14, pickup: 'sam. 28/11', created_at: iso(1), status: 'Prête', paid: true, parrain: '', wa_sent: true, recap: '', items: [{ pid: 'p8', name: 'Crème de marron', unit: 'pot 250 g', qty: 2, price: 7 }] },
  { ref: 'CA-1040', id: 'o5', name: 'Laurence Nahoum', email: '', tel: '0611223344', items_count: 2, total: 20, pickup: 'dim. 22/11', created_at: iso(3), status: 'Remise', paid: true, parrain: '', wa_sent: true, recap: '', items: [{ pid: 'p1', name: 'Pissaladière de ma mère', unit: 'pot 300 g', qty: 2, price: 10 }] },
];
const clientsRaw = [
  { email: 'aline.martin@mail.fr', prenom: 'Aline', nom: 'Martin', tel: '0612345678', orders: 5, spent: 148.5, opt_in: true, adresse: '3 rue des Lilas', cp: '06140', ville: 'Vence', notes: '', created_at: iso(80) },
  { email: '', prenom: 'Julien', nom: 'Croci', tel: '0609908489', orders: 3, spent: 74, opt_in: true, adresse: '', cp: '', ville: '', notes: '', created_at: iso(60) },
  { email: '', prenom: 'Simon', nom: 'Dupuis', tel: '+393348101516', orders: 1, spent: 27, opt_in: false, adresse: '', cp: '', ville: '', notes: '', created_at: iso(40) },
  { email: 'm.bonnet@mail.fr', prenom: 'Marie', nom: 'Bonnet', tel: '0677214003', orders: 0, spent: 0, opt_in: true, adresse: '', cp: '', ville: 'Saint-Paul', notes: '', created_at: iso(5) },
];
const salesRaw = [1, 2, 3, 5, 8, 12, 20].map((j, i) => ({ id: 's' + i, ts: iso(j), total: 30 + i * 12, count: 3, items: [{ pid: 'p1', name: 'Pissaladière de ma mère', qty: 2, price: 10, cost: 3.82 }, { pid: 'p5', name: 'Miel', qty: 1, price: 12, cost: 6.4 }] }));
const rpc = { admin_check: true, admin_products: products, PRODUCTS: products.filter((p) => p.active), admin_batches: { batches, rendement: 64.3 }, admin_orders: ordersRaw, admin_customers: clientsRaw, admin_sales: salesRaw };
module.exports = { products, batches, sales, orders, clients, rpc, today };
