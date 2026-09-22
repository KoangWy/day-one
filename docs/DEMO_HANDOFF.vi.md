> [English](./DEMO_HANDOFF.md) | **Tiếng Việt** (mặc định là tiếng Anh)

# Demo handoff — checklist chạy, thử hiện trường, deck/video

Ghi chú nội bộ. Một tuyến demo duy nhất: `lift-lobby-to-toilet-v1` (Lift lobby → Toilet, 2 checkpoint). Toàn bộ UI, chỉ đường và audio đều bằng tiếng Anh. Provider demo chốt ngày 22/09/2026: **OpenCode Go / DeepSeek V4.1 Flash**; đặt `VLM_PROVIDER=opencode`, `OPENCODE_MODEL=deepseek-v4.1-flash` trong `.env` cục bộ rồi restart server. Màn hình chờ phải ghi consent tên DeepSeek.

**Trạng thái AI đã đo (22/09/2026).** `/replay` thật trên frame của video tuyến đã duyệt `IMG_7546.MOV`, gửi đúng như app web chụp (cạnh dài ≤640 px, JPEG quality 85): 10/10 HTTP 200, sáu case cốt lõi (origin, office, toilet và ba cross-check) đúng **6/6**, **không false positive**, p50 API khoảng **3,0 s**, không timeout (`data/runtime/deepseek-route-smoke-2026-09-22.json`). Biển office phải chiếm đủ khung hình: từ khoảng giây 20,75 trở đi mới khớp, đứng xa hơn (20,25 s, 20,5 s) chữ quá nhỏ nên bị từ chối đúng. Đây là smoke test trên frame, chưa phải một lượt đi hoàn chỉnh: trước khi quay tuyến AI-verified đầy đủ, hãy rehearsal trên thiết bị thật và đứng gần biển office; mọi lần dùng nút override trong video phải gắn nhãn **manual override**. Chi tiết: `docs/PROTOTYPE_VERIFICATION.vi.md` §1c.

## Video nguồn

- [Thư mục Google Drive chứa video nguồn](https://drive.google.com/drive/u/0/folders/1JMS3SMx0U5kOF_lFNu6eB4SwSjnMFs7w) — người dùng cung cấp trong session triển khai Tier A; khôi phục link vào repo ngày 22/09/2026.
- Bản tải về và frame trích xuất trên máy: `data/runtime/source-media/` (bị Git bỏ qua).
- Đây là nguồn video phục vụ prototype; trạng thái video thuyết trình cuối cùng được theo dõi riêng ở checklist bài nộp bên dưới.

## Dữ liệu demo đi cùng repo

Theo yêu cầu bàn giao ngày 22/09/2026, `.gitignore` cho phép đúng các file sau để commit/push cùng code:

- `data/runtime/routes/lift-lobby-to-toilet-v1/route.json` và `published.json`: nội dung đã duyệt, metadata và mapping audio.
- 11 MP3 tổng hợp Edge-TTS trong `data/runtime/routes/lift-lobby-to-toilet-v1/audio/`.
- `data/runtime/deepseek-route-smoke-2026-09-22.json`: số đo và kết quả nhận diện, không chứa ảnh/base64 hoặc credential.

Tổng cộng 14 file, khoảng 0,52 MB. Sau khi các file được commit/push, teammate clone/pull sẽ có sẵn tuyến và evidence; không cần gửi riêng hoặc gọi lại TTS/VLM để tái tạo chúng. `.env` vẫn gửi riêng. Dùng `DATA_DIR` mặc định để app đọc tuyến trong repo; nếu cấu hình thư mục khác, cần chép tuyến vào `<DATA_DIR>/routes/`.

Video/frame nguồn, draft, log runtime, kết quả thử mới, route khác và MP3 ngoài danh sách vẫn bị Git bỏ qua. Trên máy mới vẫn build frontend; tạo chứng chỉ HTTPS theo IP máy mới nếu dùng iPhone.

## 1. Chạy demo trên laptop (backend + frontend + build đã xác minh)

```bash
cd apps/server
uv sync --all-extras --frozen
cd ../web
npm ci
npm run build
cd ../..
bash scripts/serve.sh
```

Mở `http://127.0.0.1:8000`. Cấu hình `.env` từ `.env.example` (frontend không bao giờ nhận key). Route đã publish là bất biến — bỏ qua `prepare` khi `data/runtime/routes/lift-lobby-to-toilet-v1/` đã tồn tại:

```bash
cd apps/server
uv run python -m navigation.prepare ../../data/examples/lift-lobby-to-toilet-v1 \
  --reviewer "Team Offixed" --reviewed
```

Tự kiểm tra trước demo trên laptop (server thật + build thật + route đã publish và MP3 thật, VLM mock, axe ở mọi phase; Chromium đã pass ngày 21/09):

```bash
cd apps/web
npm run test:real
```

Laptop Windows: cài uv bằng `py -m pip install --user uv`, chạy lệnh từ Git Bash, và dùng `uv run --project apps/server python ...` ở mọi bước ghi `python3`.

Chi tiết teach/HTTPS/thiết bị: `docs/PROTOTYPE_RUNBOOK.vi.md`. Kết quả kiểm thử + giới hạn: `docs/PROTOTYPE_VERIFICATION.vi.md`.

## 2. Thử hiện trường (xong trước freeze 15:00 ngày 22/09)

- [ ] iPhone thật: HTTPS cùng LAN (`bash scripts/setup_https.sh <LAN-IP>` rồi `bash scripts/serve.sh --https`), cài + trust CA, cấp camera trong Safari, thử cả Add to Home Screen. Quay footage hành lang thật.
- [ ] Máy Windows thật: mở URL HTTPS, chạy **NVDA thật**, đi origin → s1 → s2 → arrival chỉ bằng bàn phím, quay màn hình kèm audio.
- [ ] Chỉ quay ở khu vực đã được đồng ý, tránh người qua đường/thông tin nhạy cảm; gậy trắng vẫn là lớp an toàn chính. Không demo bịt mắt với volunteer.
- [ ] Xóa draft thừa `data/runtime/drafts/lift-lobby-vlm-draft/` (không phải route đã duyệt) trước khi quay.
- [ ] Rehearsal checkpoint office khi đứng gần biển (footage chỉ khớp khi biển lấp đầy bên trái khung hình) trước khi quay tuyến AI-verified đầy đủ; nếu vẫn không khớp, gắn nhãn checkpoint đó là manual override trong video.
- [ ] Mỗi lượt đi: dùng Download session metrics trong UI. Đi ít nhất 3 lượt đầy đủ, rồi tổng hợp (giữ tách sample/field):

```bash
python3 scripts/metrics.py session1.json session2.json session3.json
# Windows: uv run --project apps/server python scripts/metrics.py session1.json session2.json session3.json
```

- [ ] Đánh giá VLM thật bằng manifest local (3 ảnh mới mỗi landmark, 10 ảnh âm tính, origin đúng/sai; không commit ảnh thật):

```bash
cd apps/server
uv run python -m navigation.evaluate /private/eval/cases.json --output /private/eval/results.json
```

## 3. Deck + video (nộp tối 22/09; deadline cứng 07:00 23/09/2026)

Nguồn: `docs/ADC_Hackathon_2026_Thong_tin_cuoc_thi.md:52-69`. Link nộp riêng của team do ban tổ chức gửi khoảng 13:00 ngày 22/09 (không lưu trong repo).

- [ ] Deck dùng đúng template chính thức (`https://apps.rmit.edu.vn/r/aao`), tiếng Anh, xuất **.pptx** (không PDF/link). Giữ slide 1–6 đúng thứ tự; nội dung thêm từ slide 7 trở đi. Tên file `OFFIXED_<PROJECT TITLE>.pptx`.
- [ ] Nội dung bắt buộc: bảng differentiator (GoodMaps/Clew/Be My Eyes), metric đo thật (thời gian teach gồm review tay, replay success, p50, manual override), dòng credit `Route teach-and-share inspired by OCCAM Lab Clew; original implementation by Team Offixed`, consent/lưu trữ, `Wayfinding aid, not a safety device`, `Accessibility target: WCAG 2.2 AA / ISO/IEC 40500:2025` (ghi phạm vi test, không tuyên bố chứng nhận).
- [ ] Video **dưới 5 phút**, **MP4/MOV**, **16:9**, tiếng Anh, slide hiển thị xuyên suốt. Kịch bản Tier A: 0:00–0:30 problem → 0:30–1:00 teach recap (pre-recorded + log, gắn nhãn rõ) → 1:00–3:30 replay với origin + checkpoint + arrival → 3:30–4:30 differentiator + honesty note → 4:30–5:00 metrics + disclaimer + ask.
- [ ] Rubric: Innovation & Impact · User-Centered Design & Accessibility · Feasibility & Practicality · Utilization of AI (+ Presentation & Communication ở finale): `https://apps.rmit.edu.vn/r/ADC2026`.
- [ ] Sau khi nộp: làm Post-event survey trước 14:00 ngày 23/09 để đủ điều kiện Lucky Draw; ở lại sau finale để trao đổi với sponsor.

## 4. Chia việc gợi ý (3 người, theo spec Tier A)

- PWA + accessible UI + phát audio + test iPhone/VoiceOver.
- Teach/backend + freeze route + cleanup + metrics log.
- Replay/VLM prompt + evaluation + ráp video/deck.

Ưu tiên: một lượt đi thật origin → arrival trước mọi polish UI. Giữ fallback typed/button và transcript sửa tay; không thêm Future Work (realtime YOLO, CLIP, streaming, place graph, vibration, buddy ping, barometer, background run, Vietnamese voice, live teach).
