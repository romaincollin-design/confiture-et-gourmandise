# Session « Comme Avant · Communication, diffusion, automatisation » (CRM et clients existants)
## Ce qui est propre
Clients (CRM), Publimail, Promos, annonces, boucle production → clients (§5.7), automatisation. La prospection de nouveaux clients a sa propre session (`Prospection.md`). Plan complet : `kit/AUTOMATISATION.md`.
## Règles
Consentement (`opt_in`) seule source d'audience ; jamais rétrogradé ; clé client `cleClient` ; téléphones via `formatTel`. Rien ne part sans validation de Romain. Prospection par e-mail et données personnelles : règles CNIL vérifiées avant le premier envoi.
## Argent
Renvoi : `Gestion.md`. Les offres reprennent des prix existants, ne les fixent pas.
## Code
`ProClients`, `ProPublimail`, `ProPromos`, `upsertClient`, RPC `save_lead`, `admin_customers`, `admin_save_customer`.
## Où ça vit
Alimentée par Client (contacts) et Gestion (fournées validées) ; jouée par Admin. Lire aussi : Client.md.
## À faire et notes
Édition d'un client sans email impossible (RPC par id/téléphone). Annonce « Noël approche » non publiée (Supabase a expiré). Lignes « Croissance » de `kit/A-FAIRE.md`.
