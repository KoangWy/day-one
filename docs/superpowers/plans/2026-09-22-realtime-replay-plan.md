# Kế hoạch triển khai: Replay realtime

**Spec:** `docs/superpowers/specs/2026-09-22-realtime-replay-design.md` · **Branch:** `feat/realtime-replay`
**Ngày:** 22/09/2026

Mỗi task kết thúc bằng test xanh và một commit. Lệnh kiểm tra (Windows, không có `uv` trên PATH thì dùng venv sẵn có):

```bash
cd apps/server && .venv/Scripts/python.exe -m pytest -q && .venv/Scripts/python.exe -m ruff check navigation tests
cd apps/web && npm test && npm run build && npm run test:e2e
```

---

## Các điểm spec chưa nói rõ và cách chốt

| Điểm | Cách làm |
|---|---|
| Ai giữ `generation` | `machine.ts` giữ `state.generation` và tăng mỗi khi vòng chụp đổi ngữ cảnh (START, RESET, đổi bước, tạm dừng rồi chạy lại). `App.tsx` gọi `frameLoop.start(index, generation)`, nên kết quả mang `generation` lúc gửi và máy trạng thái so trực tiếp. |
| `OBSERVE_ERROR` cũ | Cũng mang `step_index` và `generation`, và bị bỏ theo đúng quy tắc của `OBSERVATION`. Lỗi đến từ request cũ không được tính vào 3 lỗi liên tiếp. `offline: true` (khi `navigator.onLine = false`) bật `visionDown` ngay. |
| Đồng hồ khi `AUDIO_DONE` đến lúc đang `override` | Vẫn nhận `AUDIO_DONE` của `s{i}-instruction` ở `walking`, `lost`, `override`, miễn đồng hồ chưa chạy. Nếu không, bấm Next khi `visionDown` trước khi đọc xong sẽ làm đồng hồ không bao giờ chạy. |
| Origin 30 s | Tính từ lúc `START`. |
| P0 cắt ngang P1 | Câu P1 bị cắt được đưa lại **đầu** hàng đợi, để P1 không bao giờ bị bỏ. |
| Push-to-talk | `voice.hush()` dừng câu đang phát (tính là xong, phát `AUDIO_DONE`) và giữ hàng đợi. Khi mic đóng thì `voice.resume()`. |
| Chữ trên màn hình | Vùng `aria-live` chính luôn hiện chữ câu P1 gần nhất, ở cả hai chế độ. Mỗi lần nói, kể cả REPEAT, dựng lại node để trình đọc màn hình đọc lại. Khi `walking`/`lost` mà câu P1 gần nhất không phải hướng dẫn thì hiện thêm dòng hướng dẫn của bước. Câu gợi ý chỉ vào vùng `aria-live` riêng khi tắt App voice. |
| `step_summary` | Ghi thành một phần tử `event: "step_summary"` trong cùng mảng `events`, có `at`, `step`, `sample`. |
| `stop` trong metrics | Chỉ ghi khi đang đi (không ghi khi đang `idle` hoặc đã `arrived`). |
| Route v1 cũ trong `DATA_DIR` riêng | `Store.list()` bỏ qua tuyến không hợp lệ với schema mới, để `/routes` không lỗi 500. `GET` trực tiếp tuyến đó vẫn trả 503 "Route needs operator review" như hiện tại. |
| `data/examples/lift-lobby-to-toilet-v1/` | Giữ nguyên làm nguồn gốc (spec chỉ thay bản trong `data/runtime/routes/`). README của v2 ghi rõ v1 là schema cũ. |
| Manifest của `evaluate.py` | Mỗi case có `checkpoint` inline (có `expected_seconds` là checkpoint, không có là origin), hoặc `step_index` kèm `--route <route_id>` để lấy checkpoint từ tuyến đã publish. |

---

## Task 1 — Model v2 và câu mẫu (server)

- `models.py`: `OriginCheckpoint` (thêm `short_name` 1–40 ký tự, phải có chữ hoặc số), `Checkpoint(OriginCheckpoint)` thêm `expected_seconds` 1–600 và bỏ `question`. `Review.origin: OriginCheckpoint`. `AssetStep`, `Assets` v2. `ObserveRequest` (đổi tên từ `ReplayRequest`, giữ validator JPEG). `Observation(Evidence)` thêm `target_visible`, `position`, `distance`. `ObserveResponse.classify()` phân loại theo mục 4.2.
- `phrases.py`: `build_phrases(route, review)`.
- Test: số key (53 cho tuyến 2 bước), nội dung từng loại câu, không có `s{last}-reached`, phân loại `matched`/`candidate`/`none`, làm sạch `position`/`distance`.

## Task 2 — Provider `observe`

- `Gemini.observe` thay `match`. Prompt giữ mọi quy tắc cũ và thêm hướng dẫn cho 3 trường mới. Không gửi `expected_seconds` cho mô hình.
- `OpenCode.generate`: ví dụ JSON cho `Observation` có đủ trường mới.
- Test: schema và ví dụ trong prompt JSON mode; enum sai → `ProviderUnavailable`; không retry.

## Task 3 — `speech.py` và endpoint

- `speech.py`: `synthesize()` (chuyển từ `prepare.py`), `Speech.get()` tìm file publish, rồi cache `tts-cache/{sha256}.mp3`, rồi Edge-TTS (timeout 5 s, file tạm, `os.replace`, khoá theo tên file).
- `main.py`: `POST /observe` với semaphore 4 và 503 `busy`; `GET /speech/{route_id}/{key}.mp3`; bỏ `/replay`, `/audio`. `Store.route_dir()`, bỏ `Store.audio()`.
- Test: như mục 12.2 (phân loại, busy, speech 404/traversal/publish/cache một lần/503/không ghi vào tuyến), cộng các test bảo mật hiện có chuyển sang `/observe`.

## Task 4 — Publish v2 và dữ liệu mẫu

- `prepare.py`: tạo `phrases`, một MP3 cho mỗi key, `Assets` v2.
- `teach.py`: khung `review.json` có `short_name: ""`, `expected_seconds: 0`.
- `data/examples/office-to-toilet-sample/` theo schema v2; `data/examples/lift-lobby-to-toilet-v2/` (route, review, README).
- Test: thiếu `short_name`/`expected_seconds` bị từ chối; khung teach bị từ chối; 53 MP3 cho tuyến v2; test UTF-8 chuyển sang `short_name`.

## Task 5 — `evaluate.py` và `scripts/metrics.py`

- `evaluate.py` dùng `observe` và `classify`. Báo `false_positives`, `candidate_rate` (tách dương/âm), `p50_ms`, `p95_ms`, `errors`.
- `metrics.py` đọc v2 (`version: 2`), từ chối định dạng cũ bằng thông báo rõ.
- Test cho cả hai với provider giả.

## Task 6 — Lõi client: `machine.ts`, `hints.ts`, `voice.ts`, `frameLoop.ts`

- Hàm thuần, test bằng vitest và thời gian giả, theo mục 12.1.
- `types.ts`, `api.ts` (`observe`, `speechUrl`), `metrics.ts` v2, `parseCommand` thêm `where`/`where am i`.

## Task 7 — `App.tsx`

- Chỉ nối module: `dispatch()` → `voice.say` / ghi metrics / đồng bộ vòng chụp. `TICK` mỗi 1 s. Nút Next ≥88 px, focus theo mục 7, Where am I, Repeat, Stop. Chữ về quyền riêng tư mục 10. Giữ hành vi RESET khi Stop, ẩn app, `pagehide`, mất track camera.
- `vite.config.ts`: proxy và `navigateFallbackDenylist` cho `/observe`, `/speech`.

## Task 8 — E2E mock

- Viết lại `e2e/replay.spec.ts` theo mục 12.3, axe ở mọi trạng thái.

## Task 9 — Tuyến v2 thật và `test:real`

- Publish `lift-lobby-to-toilet-v2` bằng Edge-TTS thật; `git rm` bản v1 trong `data/runtime/routes/`; `.gitignore` cho v2.
- `e2e-real/real-build.spec.ts`: mọi key trả MP3 thật; đi trọn tuyến, chỉ mock `/observe`.

## Task 10 — Đánh giá trên frame thật

- Trích frame từ `IMG_7546.MOV` (và các video nguồn khác cho mẫu âm) bằng PyAV. Ảnh nằm trong `data/runtime/eval/`, không commit. Chạy `evaluate.py` với DeepSeek, lưu kết quả đã làm sạch (không có ảnh) để đưa vào repo.

## Task 11 — Tài liệu

- `README.md`, `docs/PROTOTYPE_RUNBOOK.md` (Replay, Teach, kiểm thử), `docs/DEMO_HANDOFF.md` (tuyến v2, file đi kèm), `docs/PROTOTYPE_VERIFICATION.md` (kết quả của branch), dòng STRUCTURE trong `AGENTS.md`. Không có biến môi trường mới nên `.env.example` giữ nguyên.

## Task 12 — Thử thật (mục 12.4), phần của nhóm

Cần người cầm iPhone đi trên hành lang thật, agent không làm thay được. Checklist nằm trong `docs/DEMO_HANDOFF.md`.
