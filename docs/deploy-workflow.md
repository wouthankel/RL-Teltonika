# Deploy Workflow Teltonika-Server

**2026-07-20: CI/CD werkt weer.** Push naar `main` triggert `.github/workflows/deploy.yml`, dat via SSH (`appleboy/ssh-action`, secret `TELTONIKA_DEPLOY_SSH_KEY`) inlogt op de server en `deploy.sh` draait. Geen ghcr, geen self-hosted runner meer nodig. Zie "CI/CD status" onderaan voor de opzet en hoe je 'm zou uitbreiden/aanpassen. Handmatige SSH-deploy hieronder blijft werken als fallback (bv. als de Actions-run zelf niet start).

## Server

```bash
ssh -i ~/.ssh/ritlijst_server root@88.99.121.53   # ritlijst-teltonika, enige Teltonika-server
```

Zie `RL-Portal/docs/operations/infrastructure.md` voor de volledige serverlijst (`ritlijst-app-1`, `ritlijst-teltonika`, `ritlijst-beheer`) en netwerk-indeling. Privé IP `10.0.1.10` op `ritlijst-net`, verbonden met `ritlijst-app-1` (Hub).

## 2026-07-20: repo-migratie

De server draaide tot deze datum vanuit een ouder, apart repo (`wouthankel/Teltonika-Server`, andere geschiedenis) met een aantal **niet-gecommite** lokale fixes (kern-IO's 86-232: tachograaf, kentekens, kaartnummers, CNG, ultrasoon brandstof — corrigeerden foutieve `geofence_zone_N`-placeholders). Repo is herstart als `wouthankel/RL-Teltonika`; de checkout is omgezet naar dit nieuwe repo, met behoud van `.env`, `certs/` en de Redis-queue-volume (`teltonika-server_redis-data`, project-naam blijft `teltonika-server` — houd de directory-naam `/var/teltonika-server` aan, anders maakt compose een nieuw, leeg volume aan). Oude checkout staat nog als `/var/teltonika-server-oldrepo` en `/var/teltonika-server.bak-20260720-145055` (kan opgeruimd worden zodra bevestigd is dat alles goed draait).

## Deploy-stappen

```bash
cd /var/teltonika-server
git pull --ff-only
docker compose build          # lokale build, geen ghcr-pull nodig
docker compose up -d --force-recreate
docker compose ps
docker compose logs --tail=50 teltonika
```

Bij lokale wijzigingen die in de weg zitten: eerst bekijken (`git status --short` / `git diff`), niet blind `git reset --hard` — er stonden hier eerder waardevolle ongecommite fixes in (zie migratie-sectie hierboven). Stash met `-u` als er echt iets in de weg zit, niet weggooien.

## Server-specifieke bestanden (niet in git)

- `.env` — `HUB_INGEST_URL`, `TELTONIKA_INGEST_TOKEN`, `PORT`, `TLS_CERT_PATH`/`TLS_KEY_PATH`, `REDIS_HOST`/`REDIS_PORT`, `QUEUE_KEY`.
- `certs/server.crt` + `certs/server.key` — TLS voor de Teltonika TCP-verbinding. Backup in `certs/backup-20260620/`.
- `logs/` — gemount in de container.

Bij een verse checkout (zoals bij de migratie hierboven) altijd deze drie overzetten vanaf de vorige checkout voordat je `docker compose up` draait.

## Verificatie

```bash
docker compose ps
ss -tlnp | grep 5027
docker compose logs -f teltonika   # wacht op eerstvolgend avl_data bericht, check op io_unknown
```

`redis` moet `keys loaded: N` tonen bij het laden van de AOF — 0 keys na een verse volume betekent dataverlies in de packet-queue.

## CI/CD status

Sinds 2026-07-20 werkt CD automatisch via SSH, geen ghcr en geen self-hosted runner meer (de oude opzet met beide is verwijderd — faalde altijd met 403 op de ghcr-push en had toch geen runner om de deploy-job te draaien).

Opzet:
- `.github/workflows/deploy.yml` draait op een gewone `ubuntu-latest` GitHub-hosted runner, gebruikt `appleboy/ssh-action` om in te loggen op `root@88.99.121.53` met secret `TELTONIKA_DEPLOY_SSH_KEY`.
- Die SSH-key (ed25519, alleen aangemaakt voor dit doel) staat in `~/.ssh/authorized_keys` op de server met een **forced command**: `command="/var/teltonika-server/deploy.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty`. Wat de workflow ook stuurt, de server draait altijd exact `deploy.sh` — de key kan niet gebruikt worden voor een vrije root-shell, ook niet als het secret ooit lekt.
- `/var/teltonika-server/deploy.sh` (op de server, niet in git — server-specifiek net als `.env`/`certs/`): `git fetch && git reset --hard origin/main && docker compose build && docker compose up -d --force-recreate`. Let op: dit is een **harde reset**, in tegenstelling tot de `git pull --ff-only` in de handmatige procedure hierboven — bedoeld voor deterministische CD, niet voor gebruik als er bewust lokale server-wijzigingen open staan (zie migratie-sectie hierboven voor waarom dat een keer belangrijk was).
- De losse `claude-code@ritlijst` root-key (onbeperkt) staat nog los in `authorized_keys` voor interactief SSH-beheer — de deploy-key is een aparte regel, geen vervanging daarvan.

Om de deploy-key te roteren: nieuw keypair genereren, public key met dezelfde forced-command-restrictie toevoegen aan `authorized_keys` op de server, oude regel verwijderen, `gh secret set TELTONIKA_DEPLOY_SSH_KEY --repo wouthankel/RL-Teltonika` met de nieuwe private key.

## Niet doen

- Niet uitgaan van automatische deploy na `git push origin main` — dat gebeurt nu niet.
- Geen `git reset --hard` op de server zonder expliciete opdracht.
- Geen nieuwe checkout-directorynaam gebruiken voor `/var/teltonika-server` zonder de Redis-volume-naam (project-naam) mee te nemen.
- Geen secrets (`.env`, `certs/*.key`) committen.
