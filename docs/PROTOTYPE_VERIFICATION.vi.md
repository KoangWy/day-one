> [English](./PROTOTYPE_VERIFICATION.md) | **Tiếng Việt** (mặc định là tiếng Anh)

# Xác minh prototype — kết quả kiểm thử và giới hạn đã biết

Ghi chú nội bộ. Cập nhật sau session triển khai ngày 21/09/2026 và lượt chạy lại buổi tối 21/09/2026 trên laptop Windows (§1b). Chỉ ghi những gì đã chạy thật; việc chưa làm được đánh dấu NOT DONE. Bổ sung 22/09/2026: §1c ghi smoke `/replay` DeepSeek thật trên frame của video tuyến đã duyệt; §1d ghi lượt chạy lại trên Windows sau thay đổi capture. Lệnh backend chuẩn hiện tại là `uv run python -m pytest -q` (lệnh trần `uv run pytest -q` bị lỗi launcher trên máy này).

Tuyến demo đã khóa: **Lift lobby → Toilet, 2 checkpoint** (`lift-lobby-to-toilet-v1`). Ngoại lệ đã duyệt cho yêu cầu 4–5 mốc có chữ trong spec Tier A (`docs/brainstorm/specs/2026-09-21-unified-day1-nav-design.md:18-24`): chấp nhận cả biển chữ và pictogram xe lăn cộng đặc điểm vật lý. Schema `route.json` giữ nguyên.

## 1. Đã pass ngày 21/09/2026 (môi trường dev hiện tại)

| Kiểm tra | Lệnh | Kết quả thực tế |
|---|---|---|
| Backend API + teach + provider | `cd apps/server && uv run pytest -q` | **34 passed** |
| Lint backend | `uv run ruff check navigation tests` | **All checks passed** |
| State machine frontend | `cd apps/web && npm test` | **8 passed** (`src/machine.test.ts:1-61`) |
| Build frontend | `npm run build` | **pass**, 38 module, PWA `generateSW`, 11 precache entry (384.81 KiB) |
| Publish tuyến lift-lobby | `uv run python -m navigation.prepare ../../data/examples/lift-lobby-to-toilet-v1 --reviewer "Team Offixed" --reviewed` (chạy trước session này) | Đã publish, `approved_at 2026-09-21T11:22:08`, reviewer `Team Offixed — approved by user in session 2026-09-21`, `sample=false` |

Coverage backend (đọc từ `apps/server/tests/`): `route.json` khớp schema trong `apps/server/navigation/models.py:25-33`, origin không bao giờ trả instruction di chuyển (`test_api.py:35-41`), bằng chứng thiếu (sai chữ/mờ/mâu thuẫn/chung chung) luôn `matched=false` (`test_api.py:44-56`), request sai trả 404/422/503 mà không echo base64 (`test_api.py:59-94`), không lưu ảnh replay (`test_api.py:17-31`), `/ingest-video` chặn non-loopback + cross-origin trước khi parse (`test_api.py:97-102`), publish atomic — lỗi TTS không bao giờ lộ route nửa vời (`test_teach.py`), pictogram yêu cầu đủ mọi entry `required_features` (`test_provider.py`), adapter OpenCode dùng schema chặt, không retry ẩn (`test_provider.py`).

Coverage frontend (`apps/web/e2e/replay.spec.ts`, 5 test, mock API + camera tổng hợp): origin cần ≥2 khớp trên 3 ảnh, không có Next tại origin; fallback chỉ sau 2 miss liên tiếp; Repeat không bao giờ gọi VLM; override cần Yes riêng và bị đếm manual override; Stop/background/reload reset về origin; axe `wcag2a/wcag2aa/wcag21aa/wcag22aa` không báo lỗi serious/critical **trên mock**. E2E chạy build thật nhưng với camera/API giả — **không nói gì về độ chính xác landmark**.

## 1b. Chạy lại trên laptop Windows (tối 21/09/2026, `main` @ `a28c46b` + fix bên dưới)

Môi trường: Windows 11, Git Bash, Node 24.19, npm 11.17, uv 0.12.17 (Python 3.11 do uv quản lý), Playwright Chrome for Testing 153 + WebKit 26.6. Không FFmpeg, không mkcert, không VLM key trên laptop này.

| Kiểm tra | Lệnh | Kết quả thực tế |
|---|---|---|
| Backend | `uv run pytest -q` | **35 passed** (34 cũ + 1 test hồi quy UTF-8 mới) |
| Lint backend | `uv run ruff check navigation tests` | **All checks passed** |
| State machine frontend | `npm test` | **8 passed** |
| Build frontend | `npm run build` | **pass**, PWA `generateSW`, 11 precache entry (384.82 KiB) |
| Mock E2E | `npm run test:e2e` | Chromium **7/7 passed**. WebKit **2 passed, 5 skipped**: WebKit của Playwright trên Windows không có `MediaStream`/`getUserMedia`, nên journey camera tự skip kèm lý do thay vì capture giả |
| Real build E2E (mới) | `npm run test:real` | Chromium **2/2 passed**; WebKit **1 passed, 1 skipped** (axe màn hình chờ pass trước điểm skip camera). FastAPI thật + `dist` thật + route đã publish + MP3 thật; **chỉ `/replay` bị mock** |
| Publish route | `uv run python -m navigation.prepare ../../data/examples/lift-lobby-to-toilet-v1 --reviewer "Team Offixed" --reviewed` | Publish trong ~8 s, `sample=False`, 11 MP3 (512.928 byte), `route.json` giống hệt example đã duyệt |
| Serve smoke | `bash scripts/serve.sh` | `/health` ok (`vlm_configured=false`), `/` 200, `/replay` không key → **503** (không phải mismatch) |
| Metrics | `uv run --project apps/server python scripts/metrics.py <session.json>` | Tóm tắt đúng một session field tổng hợp (tách sample/field) |

`test:real` chứng minh gì trên Chromium: mọi MP3 build sẵn đều serve dạng `audio/mpeg`; `sw.js` không bao giờ precache `/audio/` hay `/routes`; tuyến demo đi origin (3 ảnh, mọi ảnh ≤640 px) → s1 confirmed → s2 hai miss → fallback nêu landmark đã xác nhận gần nhất → override tường minh → "Saved route finished" kèm "Arrival has not been visually verified"; camera được nhả cuối lượt; chỉ MP3 đã duyệt được fetch; text VLM mock không bao giờ tới UI; **không lỗi axe serious/critical** (wcag2a/2aa/21aa/22aa) tại idle, origin confirm, walking, từng checkpoint confirm, fallback, override và arrival. Không nói gì về độ chính xác landmark.

Đã sửa trong session này:
- **Bug encoding Windows**: `prepare`, `storage`, `teach`, `teach_cli`, `evaluate` và `scripts/metrics.py` đọc/ghi JSON bằng default locale (ở đây là cp1252). Một `review.json` UTF-8 chứa `’` sẽ bị publish thành `â€™` ra UI/TTS, và tên reviewer tiếng Việt làm publish crash với `UnicodeEncodeError`. Mọi I/O text hiện là UTF-8 tường minh; test hồi quy `test_reviewed_unicode_text_survives_publication_on_any_locale`.
- Journey camera E2E skip kèm lý do trên browser không có `MediaStream` thay vì fail với `canvas.captureStream is not a function`.
- Gợi ý cài đặt `scripts/setup_https.sh` đã bao gồm Windows (`winget install FiloSottile.mkcert`).

## 1c. Smoke provider thật sau khi chuyển sang DeepSeek (22/09/2026, `main` @ `45e961d` + patch adapter DeepSeek)

Bối cảnh: người dùng chọn **OpenCode Go / DeepSeek V4.1 Flash** (`VLM_PROVIDER=opencode`, `OPENCODE_MODEL=deepseek-v4.1-flash`) cho demo/video hackathon. Adapter post Chat Completions với `response_format=json_object`, JSON schema cộng một object Evidence mẫu trong prompt, và `thinking: disabled`; nhánh MiMo cũ giữ `json_schema`. Parse Pydantic chặt và guard bằng chứng (`Evidence.supports`, `models.py:125`) giữ nguyên, nên JSON mode không hạ ngưỡng match. Deadline giữ 10 s server / 12 s browser; không fallback provider tự động, không retry ẩn.

| Kiểm tra | Lệnh | Kết quả thực tế |
|---|---|---|
| Backend sau fix fail-closed | `cd apps/server && uv run python -m pytest -q` | **51 passed** (43 kế thừa + 7 shape 200 sai + 1 label theo model) |
| Lint backend | `uv run ruff check navigation tests` | **All checks passed** |
| Unit frontend | `cd apps/web && npm test` | **8 passed** |
| Build frontend | `npm run build` | pass, PWA `generateSW`, 11 precache entry (384.81 KiB) |
| Mock E2E | `npm run test:e2e` | **14 passed** (Chromium 7 + WebKit 7, không skip trên macOS) |
| Real-build E2E | `npm run test:real` | **4 passed** (Chromium 2 + WebKit 2); `/replay` bị mock, nên không phải evidence AI live |

Đo ngày 22/09/2026 qua endpoint `/replay` thật (in-process `TestClient`, provider DeepSeek thật từ `.env`) trên frame của video tuyến đã duyệt `IMG_7546.MOV`, mỗi frame gửi đúng như app web chụp: cạnh dài ≤640 px (640×360), JPEG quality 85. Artifact: `data/runtime/deepseek-route-smoke-2026-09-22.json` (thuộc diện handoff cho phép). Đây **không phải** lượt đi mới hay capture browser/thiết bị mới.

| Case | Giây video | `step_index` | Kỳ vọng | HTTP | `matched` | Đúng | API ms |
|---|---|---|---|---|---|---|---|
| origin | 12.0 | -1 | true | 200 | true | có | 3553 |
| office | 20.75 | 0 | true | 200 | true | có | 2934 |
| toilet | 25.5 | 1 | true | 200 | true | có | 3100 |
| office is not origin | 20.75 | -1 | false | 200 | false | có | 3127 |
| toilet is not office | 25.5 | 0 | false | 200 | false | có | 2755 |
| origin is not toilet | 12.0 | 1 | false | 200 | false | có | 2674 |
| office, đứng xa hơn | 20.25 | 0 | true | 200 | false | **không** | 2954 |
| office, đứng xa hơn | 20.5 | 0 | true | 200 | false | **không** | 2658 |
| office, đứng gần | 21.0 | 0 | true | 200 | true | có | 3457 |
| biển office ngoài khung | 22.5 | 0 | false | 200 | false | có | 3163 |

Mười request thật: 10/10 HTTP 200, sáu case cốt lõi đúng **6/6**, tổng 8/10, **không false positive**, p50 API **3,03 s**, không timeout. Hai miss là biển office quay từ xa: ở 640 px chữ "Office for Research" quá nhỏ để đọc, và guard bằng chứng từ chối đúng văn bản không đọc được. Từ giây 20,75, khi biển lấp đầy bên trái khung hình, checkpoint office khớp.

Giới hạn trung thực cho demo:
- 3,03 s là thời gian **API một request** đo quanh call in-process, không phải latency origin 3 frame hay thời gian click-to-result end-to-end.
- Người dùng phải dừng **gần biển office**; một tuyến hoàn chỉnh AI-verified trên thiết bị thật chưa được rehearsal. Đừng tuyên bố "100%" hay "sẵn sàng" cho tuyến thật đầy đủ.
- Nếu walkthrough dùng nút override, deck/video phải gắn nhãn **manual override**, không phải AI match.
- `npm run test:real` mock `/replay`, nên không chứng minh AI live.

## 1d. Chạy lại trên laptop Windows sau thay đổi capture (22/09/2026, `main` @ `a4c2bef` + working tree)

Capture web hiện gửi thẳng JPEG ≤640 px từ khung camera; pipeline teach gửi keyframe ≤640 px đúng như trích xuất, và `navigation.evaluate` resize mỗi ảnh về cùng JPEG ≤640 px quality 85 như app web trước khi gọi provider.

| Kiểm tra | Lệnh | Kết quả thực tế |
|---|---|---|
| Backend | `cd apps/server && uv run python -m pytest -q` | **50 passed** |
| Lint backend | `uv run ruff check navigation tests` | **All checks passed** |
| Unit frontend | `cd apps/web && npm test` | **8 passed** |
| Build frontend | `npm run build` | pass, PWA `generateSW`, 11 precache entry (259.78 KiB) |
| Mock E2E | `npm run test:e2e` | Chromium **5/5 passed**; WebKit 5 skipped (WebKit Windows không có `MediaStream`) |
| Real-build E2E | `npm run test:real` | Chromium **2/2 passed**; WebKit **1 passed, 1 skipped**; `/replay` bị mock |

## 2. Route đã publish (đọc từ `data/runtime/routes/lift-lobby-to-toilet-v1/`)

- `route.json` giống từng byte với `data/examples/lift-lobby-to-toilet-v1/route.json` (s1 dọc hành lang tới biển Office for Research & Innovation; s2 dọc cùng hành lang tới cửa toilet với hai pictogram xe lăn cộng cửa chớp).
- `review.json`: origin là số tầng **3** cạnh cửa thang máy; arrival kết thúc **ngoài** cửa toilet; `destination_is_exterior=true`; `voice_cue` rỗng vì transcript không đáng tin (xem `data/examples/lift-lobby-to-toilet-v1/README.vi.md:1-5`).
- Audio Edge-TTS build sẵn (`en-US-AriaNeural`): 11 file MP3, tổng ~513 KB (origin 42 KB, retry 41 KB, s0/s1-instruction ~59 KB mỗi file, question 28–32 KB, fallback 58–60 KB mỗi anchor, override 26 KB, arrival 43 KB). Publish atomic qua rename; route đã publish là bất biến — `prepare` từ chối ghi đè.

## 3. Probe provider đã đo thật (không phải ground truth)

**Provider demo hiện tại (22/09/2026): OpenCode Go / DeepSeek V4.1 Flash — xem §1c.** Probe MiMo bên dưới là khảo sát trước đó, giữ lại làm lịch sử.

`data/runtime/model-probe.json` (OpenCode Go `mimo-v2.5`, biển chữ tổng hợp, `synthetic_only=true`): 1/1 khớp đúng, 2 case `unavailable_or_timeout`, latency **10,4–11,5 s** — trên mục tiêu p50 ≤5 s của kế hoạch. Kết luận trong `docs/PROTOTYPE_RUNBOOK.vi.md:100-106`: giữ `VLM_PROVIDER=gemini` mặc định, `opencode` chỉ là opt-in demo; không chuyển sang Muse Spark (Responses API khác cộng điều khoản consent training). `/health` chỉ báo key đã cấu hình, không bao giờ báo quota còn hiệu lực.

Đánh giá VLM thật **CHƯA LÀM**: dùng `apps/server/navigation/evaluate.py:14-44` với manifest local (tối thiểu 3 ảnh mới mỗi landmark, 10 ảnh âm tính, origin đúng/sai; đường dẫn `image` tương đối từ manifest; không commit ảnh thật). Lệnh trong `docs/PROTOTYPE_RUNBOOK.vi.md:127-132`. Báo false positive riêng.

## 4. Giới hạn đã biết (đừng pitch ngược lại)

- Không obstacle detection, không định vị offline, không chỉ đường AI sinh trong replay — instruction luôn từ route đã duyệt (`apps/server/navigation/main.py:88-94`).
- Origin yêu cầu 3 ảnh với ≥2 khớp cộng Yes mới bắt đầu; không có Next tại origin. Hai non-match liên tiếp kích hoạt fallback; Next cần Yes riêng và bị đếm manual override (`apps/web/src/machine.ts:15-55`).
- Mỗi request provider có deadline server 10 s; 503 ≠ ảnh không khớp; không retry ẩn; Repeat chỉ phát lại MP3 (`docs/PROTOTYPE_RUNBOOK.vi.md:89-98`).
- Teach "offline" vẫn cần mạng cho VLM + Edge-TTS; `faster-whisper base.en` chạy CPU và transcript vang/khẩu âm phải sửa tay; `voice_cue` không khớp transcript bị xóa (`apps/server/navigation/teach.py:186-189`).
- Draft thừa chưa duyệt: `data/runtime/drafts/lift-lobby-vlm-draft/` (route VLM sinh, step ID sai chuẩn, trích `voice_cue` chưa xác minh) — không bao giờ publish, không bao giờ demo. Xóa hoặc re-review trước freeze.
- Key, chứng chỉ, media nguồn, model tải về và runtime khác vẫn bị Git bỏ qua. Route `lift-lobby-to-toilet-v1` đã duyệt, `published.json`, 11 MP3 và hai JSON kết quả DeepSeek là ngoại lệ handoff tường minh (xem `DEMO_HANDOFF.vi.md`). Video/frame nguồn trong `data/runtime/source-media/` giữ local hoặc trên Drive.

## 5. Trạng thái checklist pre-freeze (cần trước freeze 15:00 22/09)

Check tự động — hiện tại trên macOS 22/09/2026 (xem §1c):
- [x] `npm run test:e2e` trên Chromium + WebKit — **14 passed** (Chromium 7 + WebKit 7, không skip) trên macOS; các skip WebKit Windows trước đó là lịch sử (§1b).
- [x] `npm run test:real` trên Chromium + WebKit — **4 passed** (Chromium 2 + WebKit 2) với server thật, `dist` thật, route đã publish và MP3 build sẵn; **`/replay` bị mock**, nên đây không phải evidence AI live.
- [x] axe trên build thật — Chromium + WebKit, VLM bị mock (§1c).
- [x] Prototype gốc đã commit — `6d67ad8` trên `main`; adapter DeepSeek, tài liệu cập nhật và asset demo nằm trong commit handoff 22/09 (xem lịch sử Git).

Lịch sử, giữ để tham chiếu — laptop Windows 21/09/2026 (§1b): `npm run test:e2e` Chromium 7/7, WebKit 2 passed + 5 skipped; `npm run test:real` Chromium 2/2, WebKit 1 passed + 1 skipped. WebKit Windows không có `MediaStream`, nên journey camera của nó skip.

Còn NOT DONE (cần phần cứng, con người hoặc capture mới — không thể làm từ code):
- [ ] Đánh giá VLM thật kèm số false-positive/latency — chạy `navigation.evaluate` với manifest local (tối thiểu 3 ảnh mới mỗi landmark, 10 ảnh âm tính, origin đúng/sai). Đã bao phủ một phần trên macOS 22/09 — §1c có 6 frame `/replay` thật và p50 API trên frame hiện có. Dùng sẵn provider/key OpenCode đã cấu hình (`VLM_PROVIDER=opencode`, `OPENCODE_MODEL=deepseek-v4.1-flash`); không cần setup key Gemini riêng cho demo.
- [ ] Ít nhất 3 lượt đi đầy đủ cộng `scripts/metrics.py` trên session metrics, tách sample/field (`scripts/metrics.py:8-30`).
- [ ] NVDA thật trên Windows + VoiceOver/Safari trên iPhone thật (quay màn hình kèm audio). Axe tự động và automation WebKit không thay thế được.
- [ ] Test HTTPS cùng LAN (`scripts/setup_https.sh` + `scripts/serve.sh --https`) mỗi khi IP laptop đổi — ghi chú Windows cũ: mkcert chưa cài trên laptop Windows; cho Python qua firewall chỉ với Private networks.
