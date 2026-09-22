> **English** (default) | [Tiếng Việt](./README.vi.md)

# Offixed · Day One

Prototype PWA for ADC Hackathon 2026: one reviewer-approved route, origin check with three photos, then advance checkpoint by checkpoint after user confirmation.

**Current demo route: Lift lobby → Toilet, 2 checkpoints.** The user approved the office → toilet change and the two direction sentences on 21/09/2026. The floor sign in the video is **3**. The `route.json` schema is unchanged; origin info, recognition conditions and audio live in separate metadata.

**Demo AI:** DeepSeek V4.1 Flash via OpenCode Go (`VLM_PROVIDER=opencode`, `OPENCODE_MODEL=deepseek-v4.1-flash`), locked on 22/09/2026. Keys stay in server-side `.env` only; the UI always waits for user confirmation at each checkpoint.

```bash
cd apps/server
uv sync --all-extras --frozen
cd ../web
npm ci
npm run build
cd ../..
bash scripts/serve.sh
```

Open <http://127.0.0.1:8000>. Fill in provider/keys in `.env` per `.env.example`; the frontend never receives keys. The repo ships the published route and 11 MP3s under `data/runtime/routes/lift-lobby-to-toilet-v1/`, so a fresh machine does not need to regenerate audio. Only run the prepare command below when the route folder is missing:

```bash
cd apps/server
uv run python -m navigation.prepare ../../data/examples/lift-lobby-to-toilet-v1 \
  --reviewer "Team Offixed" --reviewed
```

Published routes are immutable; skip prepare when it already exists. The DeepSeek result JSON ships with the repo too; see [demo data shipped with the repo](docs/DEMO_HANDOFF.md#demo-data-shipped-with-the-repo). Keys, certificates, source video and other runtime files are ignored by Git.

- [Run, teach, HTTPS and device guide](docs/PROTOTYPE_RUNBOOK.md)
- [Test results and known limits](docs/PROTOTYPE_VERIFICATION.md)
- [Demo route review](data/examples/lift-lobby-to-toilet-v1/README.md)
- [Demo checklist, deck/video and field test](docs/DEMO_HANDOFF.md)
- [Source video: Google Drive folder and local copy](docs/DEMO_HANDOFF.md#source-video)

Wayfinding aid, not a safety device. Accessibility target: WCAG 2.2 AA / ISO/IEC 40500:2025; no conformance certification claimed.
