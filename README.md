# Offixed · Day One

Prototype PWA cho ADC Hackathon 2026: một tuyến được người dẫn duyệt. Trong lúc đi, camera gửi ảnh liên tục để tìm từng mốc. App báo khi tới mốc bằng câu mẫu đã duyệt, rồi chờ người dùng bấm hoặc nói **Next**. Next nghĩa là "tôi sẵn sàng", không phải "tôi đã kiểm chứng".

> **Branch `feat/realtime-replay`.** Luồng realtime theo [thiết kế](docs/superpowers/specs/2026-09-22-realtime-replay-design.md) và [kế hoạch triển khai](docs/superpowers/plans/2026-09-22-realtime-replay-plan.md). `main` giữ luồng cũ (bấm Check, chụp, hỏi Yes/No) và tuyến `lift-lobby-to-toilet-v1` cho bài nộp 7:00 23/09.

**Tuyến demo: Lift lobby → Toilet, 2 checkpoint (`lift-lobby-to-toilet-v2`).** Hướng dẫn và bằng chứng nhận diện giống hệt bản v1 người dùng duyệt ngày 21/09/2026; v2 thêm `short_name` và `expected_seconds` cho từng mốc. Biển tầng trong video là **3**.

**AI cho demo:** DeepSeek V4.1 Flash qua OpenCode Go (`VLM_PROVIDER=opencode`, `OPENCODE_MODEL=deepseek-v4.1-flash`). Key chỉ nằm trong `.env` trên server. Mỗi ảnh gọi VLM một lần; mô hình chỉ trả dữ liệu có cấu trúc (`matched` / `candidate` / `none`, vị trí trong khung hình), không bao giờ tự viết câu nói. `candidate` không bao giờ làm app chuyển bước.

```bash
cd apps/server
uv sync --all-extras --frozen
cd ../web
npm ci
npm run build
cd ../..
bash scripts/serve.sh
```

Mở <http://127.0.0.1:8000>. Điền provider/key trong `.env` theo `.env.example`; frontend không nhận key. Repo kèm tuyến đã publish và 53 MP3 (mỗi câu mẫu một file) tại `data/runtime/routes/lift-lobby-to-toilet-v2/`, nên máy mới không cần tạo lại audio. Chỉ chạy lệnh prepare dưới đây nếu chưa có thư mục tuyến:

```bash
cd apps/server
uv run python -m navigation.prepare ../../data/examples/lift-lobby-to-toilet-v2 \
  --reviewer "Team Offixed" --reviewed
```

Route đã publish không bị ghi đè; nếu đã có sẵn thì bỏ qua lệnh prepare. Kết quả đánh giá DeepSeek (không chứa ảnh) cũng đi cùng repo; xem [bàn giao dữ liệu demo](docs/DEMO_HANDOFF.md#dữ-liệu-demo-đi-cùng-repo). Key, chứng chỉ, video nguồn và runtime khác bị Git bỏ qua.

- [Hướng dẫn chạy, teach, HTTPS và thiết bị](docs/PROTOTYPE_RUNBOOK.md)
- [Kết quả kiểm thử và giới hạn đã biết](docs/PROTOTYPE_VERIFICATION.md)
- [Bản duyệt tuyến demo v2](data/examples/lift-lobby-to-toilet-v2/README.md)
- [Checklist demo, thử thật và deck/video](docs/DEMO_HANDOFF.md)
- [Video nguồn: thư mục Google Drive và bản cục bộ](docs/DEMO_HANDOFF.md#video-nguồn)

Wayfinding aid, not a safety device. App không phát hiện vật cản. Accessibility target: WCAG 2.2 AA / ISO/IEC 40500:2025; không tuyên bố chứng nhận tuân thủ.
