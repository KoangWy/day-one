# Day One — vận hành prototype

Tài liệu nội bộ. UI, chỉ đường và audio đều bằng tiếng Anh. **Branch `feat/realtime-replay`:** replay gửi ảnh liên tục và nói câu mẫu (mục Replay); `main` giữ luồng Check/Yes cũ. Quyết định cập nhật ngày 21/09/2026: người dùng chọn **Lift lobby → Toilet**, 2–3 checkpoint, cho phép nhận diện pictogram với đặc điểm vật lý; route đã duyệt hiện có 2 checkpoint. Đây là ngoại lệ được duyệt cho yêu cầu 4–5 mốc có chữ trong kế hoạch ban đầu. Không sửa schema route.

## Cấu hình và khởi động

Cần Node 22+, `uv`, Python 3.11 do uv quản lý, FFmpeg. Cài `uv sync --all-extras --frozen` trong `apps/server`, `npm ci` trong `apps/web` rồi build frontend. Dependency được pin trong `uv.lock` và `package-lock.json`.

**Laptop Windows** (đã chạy thử 21/09/2026, Git Bash): cài uv bằng `py -m pip install --user uv` rồi thêm `%APPDATA%\Python\Python313\Scripts` vào PATH (hoặc `winget install astral-sh.uv`). `python3` trên Windows thường là alias Microsoft Store — gọi script Python bằng `uv run --project apps/server python ...`. npm 11+ chặn `postinstall` của esbuild; không cần duyệt vì binary `@esbuild/win32-x64` vẫn chạy. Mọi file JSON/transcript được đọc/ghi UTF-8 tường minh nên review có dấu `’`/tiếng Việt không bị lỗi trên locale cp1252. FFmpeg chỉ cần cho teach: `winget install Gyan.FFmpeg`.

Sao chép `.env.example` thành `.env` nếu chưa có. Không ghi đè `.env` hiện hữu. Không paste key vào frontend hoặc lệnh curl có thể bị lưu trong history.

Provider demo đã chốt ngày 22/09/2026: **DeepSeek V4.1 Flash qua OpenCode Go**, phục vụ quay video/thuyết trình.

```dotenv
VLM_PROVIDER=opencode
OPENCODE_MODEL=deepseek-v4.1-flash
OPENCODE_API_KEY=...
```

DeepSeek dùng Chat Completions với `response_format=json_object`, schema trong prompt và thinking tắt; backend vẫn kiểm tra kiểu dữ liệu/ngữ nghĩa bằng Pydantic trước khi dùng kết quả. MiMo giữ nhánh `json_schema` nếu được chọn thủ công. Không đổi sang Muse Spark trong biến này vì Muse dùng Responses API. UI lấy tên provider/model từ `/health` để hiển thị consent đúng; không tự đổi model/provider khi lỗi. Restart server sau khi đổi `.env`.

Adapter Gemini Developer API vẫn có sẵn khi cấu hình thủ công `VLM_PROVIDER=gemini`, `VLM_MODEL` và `GEMINI_API_KEY`; không cần cấu hình Vertex AI cho demo hiện tại.

```bash
bash scripts/serve.sh
```

Server phục vụ bản build, API và audio cùng origin ở `http://127.0.0.1:8000`. Dev frontend riêng: `npm run dev` trong `apps/web`, proxy API tới server 8000. `/health` chỉ báo key có được cấu hình, **không chứng minh key còn hiệu lực/quota**. Không bật access log, debug request body hoặc proxy ghi body.

Tuyến demo đã publish, 53 MP3 và JSON kết quả DeepSeek được chia sẻ cùng repo theo [mục bàn giao dữ liệu demo](DEMO_HANDOFF.md#dữ-liệu-demo-đi-cùng-repo). Sau clone/pull không cần chạy `prepare` nếu `data/runtime/routes/lift-lobby-to-toilet-v2/` đã có; vẫn phải build frontend. Nếu `.env` có `DATA_DIR` riêng, bỏ cấu hình đó để dùng dữ liệu đi kèm hoặc chép tuyến vào `<DATA_DIR>/routes/`.

## HTTPS cho iPhone/Windows cùng LAN

```bash
brew install mkcert                 # macOS; Windows: winget install FiloSottile.mkcert
bash scripts/setup_https.sh 192.168.0.143  # thay bằng IP LAN hiện tại của laptop
bash scripts/serve.sh --https
```

Laptop Windows: lần đầu chạy `--https`, Windows Defender Firewall hỏi cho phép Python — chỉ chọn **Private networks**, người dùng tự bấm. Không thì iPhone/máy NVDA không kết nối được cổng 8443.

Server HTTPS ở `https://<IP-LAN>:8443`. Script tạo chứng chỉ nhưng không tự thay đổi trust store. Xem thư mục CA bằng `mkcert -CAROOT`.

1. Cài CA trên laptop nếu muốn trình duyệt local tin cậy: `mkcert -install` (hệ điều hành có thể yêu cầu quyền admin).
2. Chỉ chuyển **rootCA.pem** sang iPhone/Windows. Không chuyển `rootCA-key.pem` hay `.certs/lan-key.pem`.
3. iPhone: cài profile chứng chỉ, sau đó bật full trust trong Settings → General → About → Certificate Trust Settings. Mở URL HTTPS trong Safari, cấp camera; thử cả Add to Home Screen.
4. Windows: import CA vào Trusted Root Certification Authorities của tài khoản demo, mở URL HTTPS và chạy NVDA thật.
5. Nếu IP laptop đổi, tạo lại chứng chỉ cho IP mới. Dùng mạng riêng của team. Chạy Uvicorn với `--no-proxy-headers`: ingest kiểm tra địa chỉ socket loopback, không tin `X-Forwarded-For`.

Camera cần secure context theo [MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia). Cách trust CA trên thiết bị theo [mkcert](https://github.com/FiloSottile/mkcert). Kiểm thử WebKit tự động không thay thế Safari/VoiceOver trên iPhone thật.

## Teach và duyệt

`POST /ingest-video` chỉ nhận từ laptop qua loopback. Multipart gồm `video` MP4, `route_id`, `transcript` tùy chọn. Tối đa 120 MB/180 giây. Raw MOV từ iPhone cần chuyển thành MP4 trước; không sửa/xóa bản gốc của người dùng:

```bash
ffmpeg -i input.MOV -map 0:v:0 -map '0:a:0?' -c:v libx264 -crf 23 -c:a aac output.mp4
```

Có thể dùng CLI local thay cho HTTP:

```bash
cd apps/server
uv run python -m navigation.teach_cli /absolute/path/output.mp4 --route-id lift-to-toilet-v2
# Có transcript chỉnh tay:
uv run python -m navigation.teach_cli /absolute/path/output.mp4 \
  --route-id lift-to-toilet-v3 --transcript /absolute/path/transcript.json
```

Transcript nhận text hoặc JSON `[{"start":0,"end":8,"text":"..."}]`, giây tính từ đầu video/clip nhập. Frame khoảng 1 fps, cạnh dài 640. `faster-whisper base.en` chạy CPU; model tải lần đầu cần mạng. Keyframe được gửi nguyên cho provider. Transcript tự động có thể sai, nhất là tiếng vang/khẩu âm; reviewer phải sửa. `voice_cue` không có trích dẫn khớp transcript bị xóa.

Kết quả nằm trong `data/runtime/drafts/<route-id>/`:

- `route.json`: đúng schema `{route_id, steps[{id,instruction,landmark,voice_cue}]}`.
- `review.json`: sửa origin, `required_text`, `required_features`, arrival; điền `short_name` (1–40 ký tự, tên mốc dùng trong câu nói, ví dụ `office sign`) cho origin và mọi checkpoint, và `expected_seconds` (1–600, thời gian đi bình thường tới mốc) cho mọi checkpoint; xác nhận `destination_is_exterior`. Khung do teach tạo để trống hai trường này (`""` và `0`) nên prepare từ chối cho tới khi người duyệt điền.
- `transcript.json`: kiểm tra timestamp và lời nói.
- `teach-log.json`: timestamp dựng recap; ghi rõ pre-recorded.

Reviewer kiểm tra thứ tự, hướng trái/phải, biển tầng, dấu hiệu cố định, câu trích và điểm kết thúc ngoài toilet. `instruction` luôn đi từ điểm xác nhận trước tới landmark của **step hiện tại**. Sau khi duyệt:

```bash
uv run python -m navigation.prepare ../../data/runtime/drafts/lift-to-toilet-v2 \
  --reviewer "Tên người duyệt" --reviewed
```

Prepare dựng mọi câu nói từ `phrases.py` (nguồn duy nhất của câu nói; tuyến 2 bước có 53 key) và tạo sẵn một MP3 Edge-TTS `en-US-AriaNeural` cho mỗi key, mất khoảng 2–3 phút; chỉ công bố bằng rename atomic sau khi có đủ MP3. Không ghi đè version đã công bố. TTS thất bại không xuất hiện route dở dang. Khi publish một runtime draft, xóa transcript/draft tạm; giữ route, metadata, audio và timing log. Video/audio/frame tạm của ingest được xóa cả khi lỗi. Những file nguồn do người dùng cung cấp và bản tải Drive phục vụ review không bị ingest tự xóa; sau review có thể tự xóa `data/runtime/source-media/`.

Teach “offline” nghĩa là chuẩn bị trước replay: VLM và Edge-TTS vẫn cần mạng. [faster-whisper](https://github.com/SYSTRAN/faster-whisper), [Edge-TTS](https://github.com/rany2/edge-tts).

## Replay

Luồng realtime, chi tiết ở `docs/superpowers/specs/2026-09-22-realtime-replay-design.md`:

- Start xin camera và mở khoá một audio element bằng âm câm. Từ đó vòng chụp gửi JPEG (cạnh dài ≤640 px) tới `/observe`: tối đa 2 request cùng lúc, hai lần gửi cách nhau ≥1 s. Vòng chụp tạm dừng khi chờ Next hoặc chờ trả lời override, và tắt khi tới nơi, Stop, app xuống nền hoặc mất track camera.
- **Tới mốc:** khi ít nhất 2 trong 3 kết quả thành công gần nhất của bước là `matched`. App nói câu "reached" rồi **chờ Next** (nút cao 88 px, hoặc nói "next"). Next nghĩa là sẵn sàng đi tiếp, không phải đã kiểm chứng. Tới mốc cuối thì vào arrival ngay. `candidate` chỉ sinh câu gợi ý ("Possible office sign, ahead, slightly left."), không bao giờ chuyển bước. Câu gợi ý chỉ nói mốc nằm ở đâu trong khung hình, không ra lệnh rẽ, cách nhau ≥8 s (hoặc ≥3 s nếu vị trí đổi), và bị bỏ nếu đang nói câu khác.
- **Lạc:** đồng hồ của bước bắt đầu khi đọc xong hướng dẫn. Quá `max(3 × expected_seconds, 30 s)` thì app nói câu "lost" và vẫn tiếp tục tìm. Next lúc này mở override ("Continue using saved directions without the camera finding …?"); Yes đi tiếp và được ghi `manual_override`, No quay lại tìm. Qua mốc cuối bằng override thì arrival ghi rõ là chưa được camera xác nhận.
- **Origin:** không có override, kể cả khi mất kết nối. Sau 30 s chưa thấy thì nhắc lại một lần.
- **Mất camera check:** 3 lỗi liên tiếp, hoặc `navigator.onLine = false`, bật `visionDown`: app nói câu tương ứng, vòng chụp giãn nhịp 3 s → 5 s → 10 s, và Next mở override (trừ ở origin). Một kết quả thành công tắt cờ và app nói "Camera check is back."
- Luôn có Where am I (nói nơi vừa qua và mốc đang tìm), Repeat (phát lại câu gần nhất) và Stop. Lệnh giọng nói kiểu push-to-talk: `next`, `yes`, `no`, `repeat`, `where` / `where am I`, `stop`; mở mic thì app dừng nói. Ô gõ lệnh vẫn còn.
- Âm thanh đi qua một hàng đợi. P1 (mọi câu trừ gợi ý) không bao giờ bị bỏ và cắt ngang câu gợi ý; P2 (gợi ý) bị bỏ khi đang bận hoặc mic đang nghe; P0 chừa cho cảnh báo vật cản sau này. Tắt App voice thì câu P1 hiện ở vùng `aria-live` chính, câu gợi ý ở vùng `aria-live` riêng. Nếu Safari chặn audio, nút Play instruction hiện ra và đồng hồ bước vẫn chạy. [WebKit](https://webkit.org/blog/6784/new-video-policies-for-ios/), [SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition).
- Reload hoặc app xuống nền reset về origin. Không có định vị offline, phát hiện vật cản hoặc chỉ đường do AI sinh.

API:

- `POST /observe` `{route_id, step_index, image_jpeg_640}` → `{step_index, target, position, distance}`. `target`: `matched` chỉ khi đạt đúng ngưỡng bằng chứng cũ (`Evidence.supports`); `candidate` khi mô hình thấy thứ có thể là mốc; còn lại `none` (khi đó `position`/`distance` luôn `null`). Index origin là `-1`. 404: route chưa publish; 422: payload/index/JPEG sai; 503 `Visual check unavailable`: provider lỗi hoặc quá 10 s; 503 `Visual check busy`: đã có 4 request đang chạy. Response lỗi không lặp lại base64. Không lưu ảnh.
- `GET /speech/{route_id}/{key}.mp3`: chỉ nhận key có trong `assets.phrases` của tuyến đã publish, không nhận chữ tự do. Trả file publish; thiếu file thì lấy từ `data/runtime/tts-cache/` hoặc tạo bằng Edge-TTS (timeout 5 s, mỗi câu chỉ tạo một lần) và không bao giờ ghi vào thư mục tuyến. TTS lỗi → 503.
- `GET /routes/{route_id}/assets` → `{origin_label, sample, steps[{short_name, expected_seconds}], phrases}`. `/routes`, `/health` giữ nguyên. Service worker chỉ precache app shell, không cache API, ảnh hoặc audio.

## Model và chi phí đã khảo sát

**Cập nhật 22/09/2026:** dùng `deepseek-v4.1-flash` qua OpenCode Go theo lựa chọn của người dùng. Giữ deadline `/observe` 10 giây ở server/12 giây ở browser; kết quả test với provider thật được ghi trong `docs/PROTOTYPE_VERIFICATION.md`. [DeepSeek JSON Output](https://api-docs.deepseek.com/guides/json_mode/) dùng `json_object`, nên không chỉ đổi tên model trong adapter MiMo cũ. Kết quả cuối luôn qua kiểm tra schema/bằng chứng và chờ người dùng xác nhận.

Khảo sát trước khi chuyển sang DeepSeek:

[OpenCode Go](https://opencode.ai/docs/go/) ngày 21/09/2026 niêm yết MiMo V2.5 $0.14 input/$0.28 output, Muse Spark 1.3 Contributor $0.10/$0.20 trên 1M token. `/models` trả MiMo V2.5, không thấy MiMo v3. V2.5 đọc ảnh/JSON được trong probe nhỏ, nhưng latency chưa đạt mục tiêu. Go hướng tới coding-agent traffic; không coi quyền dùng demo là bảo đảm dịch vụ cho sản phẩm. Muse Contributor cho phép sử dụng prompts/completions để huấn luyện, nên không được tự thay vào consent MiMo. Các probe Muse trong phiên chỉ dùng ảnh chữ tổng hợp.

[Codex non-interactive](https://learn.chatgpt.com/docs/non-interactive-mode) hỗ trợ ảnh qua CLI và `--output-schema`, tái dùng đăng nhập CLI. Có thể hỗ trợ chuẩn bị/đánh giá demo. Prototype không nhúng agent Codex vào endpoint replay; chưa đo được độ trễ CLI và không lấy token đăng nhập để giả lập một API key.

Gemini dùng SDK và [structured output](https://ai.google.dev/gemini-api/docs/structured-output). Giữ `VLM_MODEL` cấu hình được; thay model cần chạy đánh giá lại. Không tự suy ra chính sách lưu trữ cloud từ việc app không giữ ảnh.

## Kiểm thử và đo số liệu

```bash
cd apps/server
uv run python -m pytest -q
uv run ruff check navigation tests
cd ../web
npm test
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

E2E dùng camera tổng hợp + API mock (`/observe`, `/speech`): đi trọn tuyến, lạc bằng `page.clock` rồi override, `visionDown` rồi hồi phục, không có override ở origin, Stop khi request đang chạy, xuống nền/reload, và kiểm tra không có request nào trong lúc chờ Next; axe ở mọi trạng thái. Không đại diện độ chính xác landmark. WebKit của Playwright **trên Windows** không có `MediaStream`, nên 6 hành trình cần camera tự skip (có ghi lý do); chạy trên macOS/Linux để có WebKit đầy đủ.

Kiểm tra **bản build thật** (server FastAPI thật, `dist` thật, route đã publish và `/speech` thật; chỉ `/observe` được mock nên không cần key): cần `npm run build` và route `lift-lobby-to-toilet-v2` đã publish. Lệnh tự khởi động uvicorn ở cổng 8000 hoặc dùng lại server đang chạy (máy không có `uv` trong PATH thì tự chạy `apps/server/.venv/Scripts/python.exe -m uvicorn navigation.main:app --port 8000` trong `apps/server` trước). Kiểm tra mọi key trong `phrases` trả MP3, service worker không cache `/speech`/API, đi origin → gợi ý → reached → Next → lost → override → arrival chưa xác nhận, chạy axe ở từng phase, và mọi audio đã tải đều là câu mẫu của tuyến. Đổi route bằng `DEMO_ROUTE_ID=<route-id>`.

```bash
cd apps/web
npm run test:real
```

Download session metrics trên UI (JSON `kind: "offixed-replay-session", version: 2`: các sự kiện `start`, `origin_found`, `reached`, `next`, `lost`, `where`, `manual_override`, `vision_down`, `vision_back`, `arrival`, `stop`, và một `step_summary` khi rời mỗi bước với `frames_sent`, `errors`, `candidates`, `matches`, `time_to_reach_ms`, `hints_spoken`, `latency_p50_ms`), rồi:

```bash
python3 scripts/metrics.py session1.json session2.json session3.json
# Windows: uv run --project apps/server python scripts/metrics.py session1.json ...
```

Đánh giá VLM thật dùng manifest local. Mỗi case có `id`, `image` (đường dẫn tương đối từ manifest), `expected` (true nếu mốc có trong ảnh), và **một trong hai**: `checkpoint` inline theo schema review (có `expected_seconds` là checkpoint, không có là origin), hoặc `step_index` kèm `--route <route_id>` để lấy checkpoint từ tuyến đã publish. Tối thiểu ba ảnh mới mỗi landmark, mười ảnh âm tính và origin đúng/sai. Không commit ảnh thật.

```bash
cd apps/server
uv run python -m navigation.evaluate /private/eval/cases.json --output /private/eval/results.json \
  --route lift-lobby-to-toilet-v2
```

Lệnh này thu ảnh về cạnh dài ≤640 px, JPEG chất lượng 85 như app web, rồi gọi `observe` của provider đang cấu hình, tối đa một call/case, và phân loại giống hệt `/observe`. Kết quả báo riêng `false_positives` (mẫu âm bị `matched`), `true_positives`, tỷ lệ `candidate` ở mẫu dương và mẫu âm, `p50_ms`, `p95_ms` và `errors`. Kết quả ngày 22/09: `data/runtime/deepseek-observe-eval-2026-09-22.json`. Metrics UI chỉ là số liệu vận hành, không thay ground truth hoặc các lượt đi thực tế.

## Credit

Route teach-and-share inspired by [OCCAM Lab Clew](https://github.com/occamLab/Clew); original implementation by Team Offixed. Không sao chép code Clew.
