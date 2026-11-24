#!/usr/bin/env node
/* Vérification d'un écran en UNE commande (remplace les scripts Playwright réécrits à chaque fois : ~4 000 jetons économisés par écran).
   Usage : NODE_PATH=/opt/node-tools/node_modules node scripts/verif-ecran.js <ecran> [--port 3411] [--sans-serveur] [--out DIR]
   Écrans : aujourdhui | caisse | production | fiche | coffret | produits | stats | commandes | crm | stock
   Fait : démarre `next start` sur le port (et ne tue QUE ce port), intercepte Supabase (scripts/fixtures-admin.js), navigue,
   capture PLEINE PAGE en 1280 et 390 px, compte les éléments rendus, mesure le débordement horizontal, liste les erreurs JS
   (hors React #418/#423/#425). Sortie : 3 lignes par largeur + chemins des PNG. Build préalable obligatoire (npm run build). */
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const { spawn, execSync } = require('child_process');
const a = process.argv.slice(2); const ecran = a[0] || 'aujourdhui'; const opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const PORT = +opt('--port', 3411); const OUT = opt('--out', path.join(process.cwd(), '.verif')); const F = require('./fixtures-admin.js'); fs.mkdirSync(OUT, { recursive: true });
const NAV = { aujourdhui: "Aujourd'hui", caisse: 'Caisse', production: 'Production', fiche: 'Production', coffret: 'Coffrets', produits: 'Produits', stats: /Tableau de bord|Chiffres/, commandes: 'Commandes', crm: /Clients/, stock: 'Stock' };
const CSS = '.pro-shell{height:auto!important;min-height:0!important}.pro-content{height:auto!important;overflow:visible!important;max-height:none!important}';
(async () => {
  let srv; if (!a.includes('--sans-serveur')) { srv = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', String(PORT)], { stdio: 'ignore' }); for (let i = 0; i < 40; i++) { try { execSync(`curl -s -o /dev/null localhost:${PORT}/admin`); break; } catch (e) { await new Promise((r) => setTimeout(r, 500)); } } }
  const b = await chromium.launch(); let ko = 0;
  for (const W of [1280, 390]) {
    const p = await b.newPage({ viewport: { width: W, height: 900 } }); const errs = [];
    p.on('pageerror', (e) => { if (!/#418|#423|#425/.test(e.message)) errs.push(e.message.slice(0, 160)); });
    await p.route('**/*supabase.co/**', async (r) => { const u = r.request().url(); const m = u.match(/rpc\/(\w+)/); const fn = m ? m[1] : (u.includes('/products') ? 'PRODUCTS' : 'REST'); let body = F.rpc[fn] !== undefined ? F.rpc[fn] : (fn === 'admin_orders' ? F.orders : fn === 'admin_sales' ? F.sales : fn === 'admin_customers' ? F.clients : /^admin_(save|patch|adjust|assemble|set|update|validate|delete)/.test(fn) ? true : []);
      await r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }, body: JSON.stringify(body) }); });
    await p.goto(`http://localhost:${PORT}/admin`); await p.waitForTimeout(1200); const pin = await p.$('input'); if (pin) { await pin.fill('1234'); await p.keyboard.press('Enter'); } await p.waitForTimeout(1500);
    if (W === 390 && !['aujourdhui', 'caisse', 'produits', 'stats'].includes(ecran)) { await p.locator('.pro-nav button', { hasText: 'Plus' }).first().click().catch(() => {}); await p.waitForTimeout(300); }
    const n = NAV[ecran]; await p.locator('button:visible', { hasText: n }).first().click().catch(() => console.log('  ! onglet introuvable :', n)); await p.waitForTimeout(900);
    if (ecran === 'fiche') { await p.locator('button:visible', { hasText: /Pissaladière de ma mère/ }).first().click().catch(() => {}); await p.waitForTimeout(600); await p.locator('tr:visible').last().locator('td').nth(1).click().catch(() => {}); await p.waitForTimeout(900); }
    if (ecran === 'coffret') { await p.locator('[role=button]').first().click().catch(() => {}); await p.waitForTimeout(800); }
    await p.addStyleTag({ content: CSS }); const hc = await p.evaluate(() => { const c = document.querySelector('.pro-content'); return c ? c.scrollHeight : 0; }); if (hc > 800) { await p.setViewportSize({ width: W, height: Math.min(6000, hc + 160) }); await p.waitForTimeout(300); } const png = path.join(OUT, `${ecran}-${W}.png`); await p.screenshot({ path: png, fullPage: true });
    const m = await p.evaluate(() => ({ el: document.querySelectorAll('button,input,select,td,h1,h2').length, deb: document.documentElement.scrollWidth - innerWidth, h: document.documentElement.scrollHeight }));
    const bad = m.el < 8 || m.deb > 0 || errs.length; if (bad) ko++;
    console.log(`${W}px ${bad ? 'KO' : 'ok'} : ${m.el} éléments rendus, débordement ${m.deb}px, hauteur ${m.h}px, erreurs JS : ${errs.join(' | ') || 'aucune'} → ${png}`); await p.close();
  }
  await b.close(); if (srv) { try { execSync(`fuser -k ${PORT}/tcp`, { stdio: 'ignore' }); } catch (e) {} } process.exit(ko ? 1 : 0);
})();
