# Offixed · Day One

Prototype PWA cho ADC Hackathon 2026: một tuyến được người dẫn duyệt, kiểm tra origin bằng ba ảnh, rồi tiến từng checkpoint sau khi người dùng xác nhận.

**Tuyến demo hiện tại: Lift lobby → Toilet, 2 checkpoint.** Người dùng đã duyệt thay đổi từ office → toilet và duyệt hai câu chỉ đường ngày 21/09/2026. Biển tầng trong video là **3**. Schema `route.json` giữ nguyên; thông tin origin, điều kiện nhận dạng và audio ở metadata riêng.

```bash
cd apps/server
uv sync --all-extras --frozen
cd ../web
npm ci
cd ../..
uv run --project apps/server python scripts/setup_assets.py
cd apps/web
npm run build
cd ../..
bash scripts/serve.sh
```

Mở <http://127.0.0.1:8000>. Điền provider/key trong `.env` theo `.env.example`; frontend không nhận key. Lệnh prepare bên dưới tạo route đã duyệt và MP3 trước khi dùng.

```bash
cd apps/server
uv run python -m navigation.prepare ../../data/examples/lift-lobby-to-toilet-v1 \
  --reviewer "Team Offixed" --reviewed
```

Route đã công bố không ghi đè; nếu có sẵn, bỏ qua lệnh prepare. Model MediaPipe/WASM, MP3, key, chứng chỉ và video đều là dữ liệu cục bộ, bị Git bỏ qua.

- [Hướng dẫn chạy, teach, HTTPS và thiết bị](docs/PROTOTYPE_RUNBOOK.md)
- [Kết quả kiểm thử và giới hạn đã biết](docs/PROTOTYPE_VERIFICATION.md)
- [Bản duyệt tuyến demo](data/examples/lift-lobby-to-toilet-v1/README.md)
- [Checklist demo, deck/video và thử tại hiện trường](docs/DEMO_HANDOFF.md)

Wayfinding aid, not a safety device. Accessibility target: WCAG 2.2 AA / ISO/IEC 40500:2025; không tuyên bố chứng nhận tuân thủ.
