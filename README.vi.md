> [English](./README.md) | **Tiếng Việt** (mặc định là tiếng Anh)

# Day One

Prototype wayfinding trong nhà cho nhân viên khiếm thị trong những ngày đầu ở văn phòng mới — bởi **Team Offixed**, xây dựng tại **ADC Hackathon 2026** (bảng AI & Employability, nhóm Visual Impairment).

Thay vì mô tả thế giới cho người khiếm thị, Day One sửa tuyến đường từ gốc: đồng nghiệp quay một lượt đi, người duyệt phê duyệt, và nhân viên đi lại từng checkpoint — AI đối chiếu landmark, con người luôn xác nhận.

## Vì sao có Day One

Bắt đầu công việc mới vốn đã căng thẳng. Với nhân viên khiếm thị, một tòa nhà lạ — sảnh thang máy, hành lang dài, cửa giống nhau — đồng nghĩa với việc phụ thuộc đồng nghiệp cho mỗi lần đi toilet hay phòng họp. Công cụ hiện có mô tả những gì camera thấy, nhưng không biết tuyến đường văn phòng *của bạn* và không đảm bảo chỉ dẫn đúng.

Day One chọn cách hẹp nhưng đáng tin hơn: một tuyến đã lưu, có người duyệt, đi lại với xác nhận của người dùng ở mỗi bước.

## Chức năng chính

- **Teach một lần** — quay video lượt đi; hệ thống soạn thảo bước đi, landmark và tiêu chí nhận dạng.
- **Người duyệt** — người duyệt sửa chỉ đường, biển/đặc điểm bắt buộc, câu hỏi và thông điệp arrival trước khi publish.
- **Replay có hướng dẫn** — PWA kiểm tra điểm xuất phát bằng 3 ảnh, rồi xác minh từng checkpoint bằng một ảnh. Mỗi bước chỉ tiến khi người dùng xác nhận.
- **Voice dựng sẵn** — mọi chỉ dẫn là audio tổng hợp sẵn (Edge-TTS), replay không phụ thuộc TTS trực tiếp.
- **Riêng tư từ thiết kế** — ảnh replay không bao giờ lưu; API key ở server, không tới frontend.
- **PWA cài được** — app shell chạy từ home screen; service worker không cache API, ảnh hay audio.

## Cách hoạt động

```
Teach (video) → Review (con người) → Publish (bất biến) → Replay (AI khớp + người dùng Yes)
```

1. Đồng nghiệp quay tuyến và tải video lên (`POST /ingest-video` hoặc teach CLI).
2. Người duyệt sửa bản nháp (`route.json`, `review.json`, transcript) rồi publish — route đã publish là bất biến.
3. Nhân viên mở PWA, xác nhận điểm xuất phát, đi từng checkpoint. VLM đối chiếu mỗi ảnh với tiêu chí đã duyệt; cần **Yes** của người dùng mới qua bước. Hai miss liên tiếp mở fallback nêu landmark đã xác nhận gần nhất.

## Công nghệ

| Lớp | Công nghệ |
|---|---|
| Frontend | React 19 + Vite + TypeScript, PWA (`vite-plugin-pwa`) |
| Backend | FastAPI + Uvicorn, validation Pydantic, Python 3.11 quản lý bằng `uv` |
| Vision (VLM) | Provider cắm được: OpenCode Go (DeepSeek V4.1 Flash) hoặc Gemini Developer API |
| Speech | Edge-TTS dựng sẵn (`en-US-AriaNeural`); phát Web Audio, có chế độ screen reader |
| Transcription lúc teach | `faster-whisper` (CPU) + transcript sửa tay |
| Kiểm thử | pytest + ruff (server), vitest + Playwright + axe (web) |

## Cấu trúc repo

```
./
├── apps/server/      # FastAPI: /routes, /replay, /audio, /ingest-video; CLI teach/prepare/evaluate
├── apps/web/         # React + Vite PWA (UI replay, state machine, xuất metrics)
├── data/examples/    # Fixture tuyến đã duyệt (demo: lift-lobby-to-toilet-v1)
├── data/runtime/     # Tuyến đã publish + audio dựng sẵn (chỉ diện handoff; còn lại gitignored)
├── scripts/          # serve.sh, setup_https.sh, metrics.py
└── docs/             # Hướng dẫn build, kết quả xác minh, bàn giao demo
```

## Bắt đầu

Yêu cầu: Node 22+, `uv`, FFmpeg (chỉ lúc teach).

```bash
cd apps/server
uv sync --all-extras --frozen
cd ../web
npm ci
npm run build
cd ../..
bash scripts/serve.sh
```

Mở <http://127.0.0.1:8000>. Chép `.env.example` thành `.env` và điền provider key — frontend không bao giờ nhận key. Repo kèm sẵn tuyến demo đã publish với audio dựng sẵn, nên máy mới replay ngay mà không cần chạy lại teach hay TTS.

Test iPhone qua LAN (HTTPS + camera), flow teach và ghi chú thiết bị: xem [hướng dẫn vận hành](docs/PROTOTYPE_RUNBOOK.vi.md).

## Cấu hình

| Biến | Mục đích |
|---|---|
| `VLM_PROVIDER` | `opencode` (DeepSeek qua OpenCode Go) hoặc `gemini` |
| `OPENCODE_API_KEY` / `OPENCODE_MODEL` | Key và model cho provider OpenCode |
| `GEMINI_API_KEY` / `VLM_MODEL` | Key và model cho provider Gemini |
| `DATA_DIR` | Ghi đè thư mục runtime (tùy chọn) |

## Kiểm thử

```bash
cd apps/server
uv run python -m pytest -q
uv run ruff check navigation tests
cd ../web
npm test
npm run build
npm run test:e2e    # mock API + camera tổng hợp
npm run test:real   # server thật + build thật, chỉ mock /replay
```

Số liệu đã đo và giới hạn trung thực nằm ở [bản xác minh](docs/PROTOTYPE_VERIFICATION.vi.md) — gồm smoke test trên provider thật (10 request, 6/6 case cốt lõi đúng, không false positive, p50 ≈ 3 s).

## Accessibility & an toàn

- Mục tiêu accessibility: **WCAG 2.2 AA / ISO/IEC 40500:2025** (axe-check ở mọi phase replay; test NVDA/VoiceOver thật được theo dõi ở demo handoff). Không tuyên bố chứng nhận tuân thủ.
- **Công cụ wayfinding, không phải thiết bị an toàn.** Gậy trắng vẫn là lớp an toàn chính. Không obstacle detection, không định vị offline, không chỉ đường do AI tự sinh — instruction luôn từ tuyến đã duyệt.

## Giới hạn

- Một thời điểm chỉ một tuyến đã lưu; không khám phá hay reroute trực tiếp.
- Replay cần mạng (VLM + audio host); teach "offline" nghĩa là chuẩn bị trước lượt đi.
- Nhận dạng landmark cần biển chiếm đủ khung hình — đứng gần biển.
- Mọi checkpoint cần **Yes** tường minh của người dùng; override bị đếm manual, không tính là AI match.

## Tài liệu

- [Hướng dẫn vận hành — chạy, teach, HTTPS, thiết bị](docs/PROTOTYPE_RUNBOOK.vi.md)
- [Xác minh — kết quả kiểm thử và giới hạn](docs/PROTOTYPE_VERIFICATION.vi.md)
- [Bàn giao demo — thử hiện trường, checklist deck/video](docs/DEMO_HANDOFF.vi.md)
- [Bản duyệt tuyến demo](data/examples/lift-lobby-to-toilet-v1/README.vi.md)

## Nhóm

**Offixed** — 3 thành viên, ADC Hackathon 2026, RMIT Saigon South Campus (21–23/09/2026).

## Ghi nhận

Teach-and-share tuyến đường lấy cảm hứng từ [OCCAM Lab Clew](https://github.com/occamLab/Clew); implementation gốc của Team Offixed. Không sao chép code Clew.

## License

Chưa có file license — mọi quyền được bảo lưu. Liên hệ nhóm nếu muốn tái sử dụng.
