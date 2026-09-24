> [English](./README.md) | **Tiếng Việt** (mặc định là tiếng Anh)

# Day One

Prototype wayfinding trong nhà cho nhân viên khiếm thị trong những ngày đầu ở văn phòng mới — bởi **Team Offixed**, xây dựng tại **ADC Hackathon 2026** (bảng AI & Employability, nhóm Visual Impairment).

Thay vì mô tả thế giới cho người khiếm thị, Day One sửa tuyến đường từ gốc: đồng nghiệp đi cùng một lần và nói hướng dẫn, một người duyệt từng chữ, và hôm sau nhân viên tự đi — camera tìm từng mốc, cảnh báo cửa và người phía trước, còn người đi tự quyết khi nào bước tiếp.

> **Nhánh `super-final-project`.** Mọi tính năng trong video demo đều chạy thật trên nhánh này: dạy tuyến bằng điện thoại, AI soạn nháp có người duyệt, nhiều tuyến nối thành hành trình, cảnh báo nguy hiểm theo tuyến (cửa kính, cửa tự động), cảnh báo vật cản chạy trên điện thoại và thẻ "Wear your phone". Bảng đối chiếu video → tính năng và cách kiểm chứng: [docs/SUPER_FINAL.vi.md](docs/SUPER_FINAL.vi.md). `main` giữ luồng Check/Yes đã nộp ngày 23/09.

## Vì sao có Day One

Bắt đầu công việc mới vốn đã căng thẳng. Với nhân viên khiếm thị, một tòa nhà lạ — sảnh thang máy, hành lang dài, cửa giống nhau — đồng nghĩa với việc phụ thuộc đồng nghiệp cho mỗi lần đi toilet hay phòng họp. Công cụ hiện có mô tả những gì camera thấy, nhưng không biết tuyến đường văn phòng *của bạn* và không đảm bảo chỉ dẫn đúng.

Day One chọn cách hẹp nhưng đáng tin hơn: các tuyến đã lưu, có người duyệt, camera kiểm tra từng mốc khi đi lại.

## Chức năng chính

- **Dạy một lần, bằng điện thoại** — người dẫn quay lượt đi kèm lời dẫn (`#/teach`); laptop soạn nháp các bước, chữ trên biển, mốc, nguy hiểm và các nơi, rồi đọc lại "3 places remembered".
- **Người duyệt** — người dẫn sửa bản nháp AI ngay trên điện thoại (`#/review/<id>`) và xác nhận trước khi người đi nghe bất kỳ câu nào. Publish từ chối checkpoint trông giống hệt điểm ngay trước nó.
- **Tự đi** — chọn tuyến đã lưu; camera gửi ảnh mỗi 1–3 s để tìm mốc, app nói mốc nằm đâu trong khung hình, báo khi tới checkpoint và chờ **Next**. Tới nơi thì gợi ý đoạn tiếp theo (sảnh thang máy → meeting room, → toilet).
- **Cảnh báo** — nguy hiểm đã dạy ("Be careful. A glass door is in front of you." → "Push the door open and go through.") và cảnh báo vật cản trên máy ("Be careful. Someone is in front of you."), đều kèm chuông và banner.
- **Giọng dựng sẵn** — mọi câu là câu mẫu đã duyệt có sẵn MP3 Edge-TTS; AI không bao giờ tự viết câu nói.
- **Riêng tư** — không lưu ảnh; phát hiện vật cản không rời điện thoại; API key ở laptop.

## Cách hoạt động

```
Teach (video + giọng từ điện thoại) → AI soạn nháp → Review (con người) → Publish (bất biến) → Walk (camera tìm mốc, người đi bấm Next)
```

1. Người dẫn quay tuyến ở `#/teach`. Laptop tách frame (FFmpeg), chép lời (faster-whisper) và gọi VLM một lần để soạn nháp kèm gợi ý.
2. Người dẫn duyệt và publish; mọi câu được tạo sẵn MP3. Tuyến đã publish là bất biến; phiên bản mới có ID mới.
3. Nhân viên chọn tuyến ở trang Walk. `/observe` phân loại từng ảnh `matched` / `candidate` / `none` theo bằng chứng đã duyệt (2 trong 3 ảnh gần nhất khớp = tới mốc) và báo các nguy hiểm đã dạy khi thấy ở gần. MediaPipe trên điện thoại canh người và vật cản trên lối đi.

## Công nghệ

| Lớp | Công nghệ |
|---|---|
| Frontend | React 19 + Vite + TypeScript, PWA (`vite-plugin-pwa`), MediaPipe Tasks Vision (EfficientDet-Lite0) chạy trong trình duyệt |
| Backend | FastAPI + Uvicorn, validation Pydantic, Python 3.11 quản lý bằng `uv` |
| Vision (VLM) | Provider cắm được: OpenCode Go (DeepSeek V4.1 Flash) hoặc Gemini Developer API |
| Speech | Edge-TTS dựng sẵn (`en-US-AriaNeural`), một hàng đợi âm thanh có mức ưu tiên, chế độ screen reader |
| Teach | FFmpeg (hệ thống hoặc `imageio-ffmpeg`), `faster-whisper` (CPU), MediaRecorder trên điện thoại |
| Kiểm thử | pytest + ruff (server), vitest + Playwright + axe (web) |

## Cấu trúc repo

```
./
├── apps/server/      # FastAPI: /catalog, /routes, /observe, /speech, /app-speech, /guide/* (teach, nháp, publish); CLI teach/prepare/evaluate
├── apps/web/         # React PWA: trang Walk, Teach, Review; state machine, hàng đợi giọng, cảnh báo vật cản
├── data/examples/    # Bundle tuyến đã duyệt (3 đoạn demo + 1 mẫu)
├── data/runtime/     # Tuyến đã publish + audio dựng sẵn (theo allowlist); nháp và cache chỉ ở máy
├── scripts/          # serve.sh, setup_https.sh, metrics.py
└── docs/             # Super final, vận hành, kết quả xác minh, bàn giao demo, spec
```

## Bắt đầu

Yêu cầu: Node 22+, `uv`, internet cho lần build đầu (model detector) và cho VLM, giọng nói.

```bash
cd apps/server
uv sync --all-extras --frozen
cd ../web
npm ci
npm run build
cd ../..
bash scripts/serve.sh
```

Mở <http://127.0.0.1:8000>. Chép `.env.example` thành `.env` và điền provider key — frontend không bao giờ nhận key. Repo kèm sẵn ba tuyến đã publish với audio dựng sẵn, máy mới đi được ngay.

Test iPhone qua LAN (HTTPS + camera), dạy tuyến bằng điện thoại và ghi chú thiết bị: xem [hướng dẫn vận hành](docs/PROTOTYPE_RUNBOOK.vi.md).

## Cấu hình

| Biến | Mục đích |
|---|---|
| `VLM_PROVIDER` | `opencode` (DeepSeek qua OpenCode Go) hoặc `gemini` |
| `OPENCODE_API_KEY` / `OPENCODE_MODEL` | Key và model cho provider OpenCode |
| `GEMINI_API_KEY` / `VLM_MODEL` | Key và model cho provider Gemini |
| `TEACH_PIN` | Mã người dẫn (≥4 ký tự) cho phép điện thoại dạy và publish tuyến; không có thì chỉ laptop làm được |
| `DATA_DIR` | Tuỳ chọn đổi thư mục dữ liệu runtime |

## Kiểm thử

```bash
cd apps/server
uv run python -m pytest -q
uv run ruff check navigation tests
cd ../web
npm test
npm run build
npm run test:e2e    # API mock + camera tổng hợp (+ detector thật trên footage local nếu có)
npm run test:real   # server thật + build thật, chỉ mock /observe
```

Kết quả đo và giới hạn: [kiểm chứng super final](docs/SUPER_FINAL.vi.md#kiểm-chứng-23092026-laptop-windows) và [kết quả xác minh prototype](docs/PROTOTYPE_VERIFICATION.md).

## Trợ năng & an toàn

- Mục tiêu trợ năng: **WCAG 2.2 AA / ISO/IEC 40500:2025** (axe kiểm tra mọi trang và mọi trạng thái khi đi; test NVDA/VoiceOver thật theo dõi trong bàn giao demo). Không tuyên bố đã được chứng nhận.
- **Công cụ hỗ trợ tìm đường, không phải thiết bị an toàn.** Gậy trắng vẫn là lớp an toàn chính. Cảnh báo vật cản có thể bỏ sót (vách kính, cột, bậc); cảnh báo nguy hiểm từ cloud có thể muộn 1–2 m; chỉ dẫn luôn lấy từ tuyến đã duyệt.

## Giới hạn

- Nhánh này chưa đi thử tại chỗ bằng iPhone + VoiceOver; chưa đo tốc độ detector trên iPhone.
- Đi lại cần mạng (VLM + audio trên laptop); không định vị offline, không tự tìm đường mới.
- Next nghĩa là "tôi sẵn sàng", không phải "tôi đã kiểm chứng"; override được tính là thủ công, không bao giờ tính là camera khớp.

## Tài liệu

- [Super final — tính năng trong video và cách kiểm chứng](docs/SUPER_FINAL.vi.md)
- [Hướng dẫn vận hành — chạy, teach, HTTPS, thiết bị](docs/PROTOTYPE_RUNBOOK.vi.md)
- [Kết quả xác minh và giới hạn](docs/PROTOTYPE_VERIFICATION.md)
- [Bàn giao demo — field test, checklist deck/video](docs/DEMO_HANDOFF.md)
- [Thiết kế replay realtime](docs/superpowers/specs/2026-09-22-realtime-replay-design.md)

## Nhóm

**Offixed** — 3 thành viên, ADC Hackathon 2026, RMIT Saigon South Campus (21–23/09/2026).

## Ghi nhận

Ý tưởng teach-and-share tuyến lấy cảm hứng từ [OCCAM Lab Clew](https://github.com/occamLab/Clew); phần hiện thực là của Team Offixed. Không sao chép code Clew. Phát hiện vật cản dùng model MediaPipe EfficientDet-Lite0 của Google (Apache-2.0), tải về lúc build.

## Giấy phép

Chưa có file license — bảo lưu mọi quyền. Liên hệ nhóm nếu muốn tái sử dụng.
