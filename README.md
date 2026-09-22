# Offixed · Day One

Prototype PWA cho ADC Hackathon 2026: một tuyến được người dẫn duyệt, kiểm tra origin bằng ba ảnh, rồi tiến từng checkpoint sau khi người dùng xác nhận.

**Tuyến demo hiện tại: Lift lobby → Toilet, 2 checkpoint.** Người dùng đã duyệt thay đổi từ office → toilet và duyệt hai câu chỉ đường ngày 21/09/2026. Biển tầng trong video là **3**. Schema `route.json` giữ nguyên; thông tin origin, điều kiện nhận dạng và audio ở metadata riêng.

**AI cho demo:** DeepSeek V4.1 Flash qua OpenCode Go (`VLM_PROVIDER=opencode`, `OPENCODE_MODEL=deepseek-v4.1-flash`), chốt ngày 22/09/2026. Key chỉ ở `.env` trên server; UI luôn chờ người dùng xác nhận checkpoint.

```bash
cd apps/server
uv sync --all-extras --frozen
cd ../web
npm ci
npm run build
cd ../..
bash scripts/serve.sh
```

Mở <http://127.0.0.1:8000>. Điền provider/key trong `.env` theo `.env.example`; frontend không nhận key. Repo kèm tuyến đã publish và 11 MP3 tại `data/runtime/routes/lift-lobby-to-toilet-v1/`, nên máy mới không cần tạo lại audio. Chỉ dùng lệnh prepare dưới đây nếu chưa có thư mục tuyến:

```bash
cd apps/server
uv run python -m navigation.prepare ../../data/examples/lift-lobby-to-toilet-v1 \
  --reviewer "Team Offixed" --reviewed
```

Route đã công bố không ghi đè; nếu có sẵn, bỏ qua lệnh prepare. JSON kết quả DeepSeek cũng đi cùng repo; xem [bàn giao dữ liệu demo](docs/DEMO_HANDOFF.md#dữ-liệu-demo-đi-cùng-repo). Key, chứng chỉ, video nguồn và runtime khác bị Git bỏ qua.

- [Hướng dẫn chạy, teach, HTTPS và thiết bị](docs/PROTOTYPE_RUNBOOK.md)
- [Kết quả kiểm thử và giới hạn đã biết](docs/PROTOTYPE_VERIFICATION.md)
- [Bản duyệt tuyến demo](data/examples/lift-lobby-to-toilet-v1/README.md)
- [Checklist demo, deck/video và thử tại hiện trường](docs/DEMO_HANDOFF.md)
- [Video nguồn: thư mục Google Drive và bản cục bộ](docs/DEMO_HANDOFF.md#video-nguồn)

Wayfinding aid, not a safety device. Accessibility target: WCAG 2.2 AA / ISO/IEC 40500:2025; không tuyên bố chứng nhận tuân thủ.
