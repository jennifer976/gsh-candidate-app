# Add to app — next release

**Purpose:** Single checklist for anything that ships on the **website** (or is decided in chat) but is **not yet in the candidate app**, or must wait for the **next** Play/App Store binary.

**How we use it**
1. When we gate or ship something on web only, **add a row here the same day**.
2. Before starting a new EAS / Play build, **read this file** and decide what lands in that release.
3. After something ships in an app build, move it to **Done in a release** (with version / date).
4. Do **not** assume “web is done ⇒ app is done.” Web and app are separate repos.

**App repo:** `gsh-candidate-app` → `jennifer976/gsh-candidate-app`  
**Playbook:** root `DEPLOY_PLAYBOOK.txt` → **BLOCK 3B**

---

## Queued for next app release

| Priority | Item | Web status (today) | App work needed | Notes |
|----------|------|--------------------|-----------------|-------|
| P0 | **Company sponsor checker** | Coming soon (`/tools/visa-checker`) | Already **Coming soon** in app (`5e1c73c`). Next release: turn **live** when register coverage is ready (restore search UI; keep naming “Company sponsor checker”, not Visa Wizard). | Do not launch live until you say so. |
| P1 | **Grow Your Network** | Coming soon (`/grow-your-network`) | **Not in app.** Add Tools & resources (or More) row → open site URL in **in-app browser**. Show Coming soon until web listings exist (community **threads**, not org homepages). | No native directory until usage proves value. |
| P1 | **Company directory** | Coming soon (`/companies`) | **Not in app.** Optional: Tools / Resources link → `/companies` in-app browser with Coming soon. Native browse list only when web directory launches. | Individual company profiles from **job links** can stay web-only or deep-link later. |
| P2 | Parity pass after web launch | — | When web removes Coming soon for the above, **same day** update app copy/UI or ship follow-up build. | Avoid another “live on web, unfinished in app” gap. |

---

## Ideas / later (not blocking next binary)

- Native Grow Your Network / company directory screens (only after in-app browser proves demand).
- Push notifications polish (applications / messages).
- Expert Insights Home section (beyond tools link) when catalogue grows.
- Offline / poor-network messaging on job feed and apply.
- See also: `docs/FUTURE_CONSIDERATIONS.md` (broader backlog).

---

## Done in a release

| App version / commit | Date | What shipped |
|----------------------|------|--------------|
| `1.0.1` / `30941a9` | 2026-07 | Visual review: All jobs / Curated roles, Filter while searching, chart colours, FAQ/tools/a11y polish. |
| `5e1c73c` (include in next Play upload) | 2026-07-21 | Company sponsor checker gated as **Coming soon**; labels clarified vs Visa Wizard. |

---

## Template (copy a row when adding)

```
| P? | **Short name** | Web: … | App: … | Notes: … |
```
