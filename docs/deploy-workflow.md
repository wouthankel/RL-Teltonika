# Deploy Workflow Teltonika-Server

SSH-deploy naar de productieserver is de bewezen werkwijze. `.github/workflows/deploy.yml` (ghcr push + self-hosted runner) staat nog in de repo maar **werkt niet**: ghcr-push faalt met 403 (package nooit gelinkt aan deze repo in GitHub package-settings) en er draait geen self-hosted Actions runner op de server. Niet vertrouwen op automatische deploy via push naar `main` totdat dit expliciet gefixt is — zie "CI/CD status" onderaan.

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

`.github/workflows/deploy.yml` bouwt op `ubuntu-latest` en pusht naar `ghcr.io/wouthankel/teltonika-server`, gevolgd door een `deploy`-job op `runs-on: self-hosted`. Beide stappen zijn momenteel kapot:

- **Build/push**: 403 Forbidden op de eerste blob-push. Ghcr-package voor een **user-owned** (niet org) repo moet los gelinkt worden aan de repo via package-settings (`github.com/users/wouthankel/packages/container/teltonika-server/settings` → Manage Actions access), of eenmalig handmatig gepusht worden met een classic PAT (`write:packages`) om het package aan te maken. Kan niet via API/CLI, alleen via web-UI.
- **Deploy**: geen self-hosted runner geregistreerd op `ritlijst-teltonika` (gecheckt: geen `actions-runner`-directory, geen systemd-unit). Deze job zou oneindig "queued" blijven staan als de build-stap wel zou slagen.

Zolang dit niet gefixt is: **handmatig deployen zoals hierboven**, net als bij de Ritlijst Hub (`RL-Portal/docs/operations/deploy-workflow.md`) en CRM — CD is daar ook "voorbereid, nog niet actief" om dezelfde reden (geen runner/secrets).

## Niet doen

- Niet uitgaan van automatische deploy na `git push origin main` — dat gebeurt nu niet.
- Geen `git reset --hard` op de server zonder expliciete opdracht.
- Geen nieuwe checkout-directorynaam gebruiken voor `/var/teltonika-server` zonder de Redis-volume-naam (project-naam) mee te nemen.
- Geen secrets (`.env`, `certs/*.key`) committen.
