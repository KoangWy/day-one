# Day One — vận hành prototype

Tài liệu nội bộ. UI, chỉ đường và audio đều bằng tiếng Anh. Quyết định cập nhật ngày 21/09/2026: người dùng chọn **Lift lobby → Toilet**, 2–3 checkpoint, cho phép nhận diện pictogram với đặc điểm vật lý; route đã duyệt hiện có 2 checkpoint. Đây là ngoại lệ được duyệt cho yêu cầu 4–5 mốc có chữ trong kế hoạch ban đầu. Không sửa schema route.

## Cấu hình và khởi động

Cần Node 22+, `uv`, Python 3.11 do uv quản lý, FFmpeg. Cài `uv sync --all-extras --frozen` trong `apps/server`, `npm ci` trong `apps/web`; chạy `scripts/setup_assets.py` bằng môi trường server rồi build frontend. Dependency được pin trong `uv.lock` và `package-lock.json`.

Sao chép `.env.example` thành `.env` nếu chưa có. Không ghi đè `.env` hiện hữu. Không paste key vào frontend hoặc lệnh curl có thể bị lưu trong history.

```dotenv
VLM_PROVIDER=gemini
VLM_MODEL=gemini-2.5-flash
GEMINI_API_KEY=...
```

Demo OpenCode Go theo lựa chọn của người dùng:

```dotenv
VLM_PROVIDER=opencode
OPENCODE_MODEL=mimo-v2.5
OPENCODE_API_KEY=...
```

Chỉ adapter MiMo Chat Completions đã được triển khai; không đổi sang Muse Spark trong biến này vì Muse dùng Responses API. Không tự chuyển provider khi lỗi: việc chuyển provider cũng đổi nơi nhận ảnh. UI lấy tên provider từ `/health` để hiển thị consent đúng. Restart server sau khi đổi `.env`.

```bash
bash scripts/serve.sh
```

Server phục vụ bản build, API và audio cùng origin ở `http://127.0.0.1:8000`. Dev frontend riêng: `npm run dev` trong `apps/web`, proxy API tới server 8000. `/health` chỉ báo key có được cấu hình, **không chứng minh key còn hiệu lực/quota**. Không bật access log, debug request body hoặc proxy ghi body.

## HTTPS cho iPhone/Windows cùng LAN

```bash
brew install mkcert
bash scripts/setup_https.sh 192.168.0.143  # thay bằng IP LAN hiện tại của laptop
bash scripts/serve.sh --https
```

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

Transcript nhận text hoặc JSON `[{"start":0,"end":8,"text":"..."}]`, giây tính từ đầu video/clip nhập. Frame khoảng 1 fps, cạnh dài 640. `faster-whisper base.en` chạy CPU; model tải lần đầu cần mạng. MediaPipe xử lý trên laptop trước khi gửi keyframe cho provider. Nếu không có model che mặt, dừng trước upload. Transcript tự động có thể sai, nhất là tiếng vang/khẩu âm; reviewer phải sửa. `voice_cue` không có trích dẫn khớp transcript bị xóa.

Kết quả nằm trong `data/runtime/drafts/<route-id>/`:

- `route.json`: đúng schema `{route_id, steps[{id,instruction,landmark,voice_cue}]}`.
- `review.json`: sửa origin, `required_text`, `required_features`, câu hỏi, arrival; xác nhận `destination_is_exterior`.
- `transcript.json`: kiểm tra timestamp và lời nói.
- `teach-log.json`: timestamp dựng recap; ghi rõ pre-recorded.

Reviewer kiểm tra thứ tự, hướng trái/phải, biển tầng, dấu hiệu cố định, câu trích và điểm kết thúc ngoài toilet. `instruction` luôn đi từ điểm xác nhận trước tới landmark của **step hiện tại**. Sau khi duyệt:

```bash
uv run python -m navigation.prepare ../../data/runtime/drafts/lift-to-toilet-v2 \
  --reviewer "Tên người duyệt" --reviewed
```

Prepare tạo sẵn Edge-TTS `en-US-AriaNeural`; chỉ công bố bằng rename atomic sau khi có đủ MP3. Không ghi đè version đã công bố. TTS thất bại không xuất hiện route dở dang. Khi publish một runtime draft, xóa transcript/draft tạm; giữ route, metadata, audio và timing log. Video/audio/frame tạm của ingest được xóa cả khi lỗi. Những file nguồn do người dùng cung cấp và bản tải Drive phục vụ review không bị ingest tự xóa; sau review có thể tự xóa `data/runtime/source-media/`.

Teach “offline” nghĩa là chuẩn bị trước replay: VLM và Edge-TTS vẫn cần mạng. [faster-whisper](https://github.com/SYSTRAN/faster-whisper), [Edge-TTS](https://github.com/rany2/edge-tts).

## Replay

- Start xin camera, tải model che mặt local, kích hoạt một audio element.
- Check starting point chụp 3 ảnh cách khoảng 1 giây, gửi từng request; ít nhất 2 ảnh khớp và người dùng Yes mới bắt đầu s1. Không có Next tại origin.
- Check checkpoint gửi một JPEG đã che mặt; Yes mới tăng bước. Backend luôn lấy instruction từ route đã duyệt. Hai non-match liên tiếp mở fallback; Next còn cần Yes riêng và được đếm manual override.
- Mỗi request provider có deadline server 10 giây; 503 khác với ảnh không khớp. Không retry ẩn. Repeat chỉ phát MP3.
- Stop/arrival dừng camera. Reload hoặc app xuống nền reset về origin. Không có định vị offline, obstacle detection hoặc chỉ đường do AI sinh trong replay.
- App voice có thể tắt để nghe screen reader; nếu Safari chặn audio, nút Play instruction hiện ra. Voice command có disclosure, push-to-talk và typed/button fallback; không bật mic khi app voice đang phát. [WebKit](https://webkit.org/blog/6784/new-video-policies-for-ios/), [SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition).

`/replay`: `{route_id,step_index,image_jpeg_640}` → `{matched,instruction,checkpoint_question,audio_url}`. Index origin là `-1`. 404: route chưa công bố; 422: payload/index/JPEG sai; 503: provider/timeout. Response lỗi không echo base64. Không lưu ảnh replay. Service worker chỉ precache app shell, không cache API, ảnh, audio hoặc model/WASM.

## Model và chi phí đã khảo sát

[OpenCode Go](https://opencode.ai/docs/go/) ngày 21/09/2026 niêm yết MiMo V2.5 $0.14 input/$0.28 output, Muse Spark 1.3 Contributor $0.10/$0.20 trên 1M token. `/models` trả MiMo V2.5, không thấy MiMo v3. V2.5 đọc ảnh/JSON được trong probe nhỏ, nhưng latency chưa đạt mục tiêu. Go hướng tới coding-agent traffic; không coi quyền dùng demo là bảo đảm dịch vụ cho sản phẩm. Muse Contributor cho phép sử dụng prompts/completions để huấn luyện, nên không được tự thay vào consent MiMo. Các probe Muse trong phiên chỉ dùng ảnh chữ tổng hợp.

[Codex non-interactive](https://learn.chatgpt.com/docs/non-interactive-mode) hỗ trợ ảnh qua CLI và `--output-schema`, tái dùng đăng nhập CLI. Có thể hỗ trợ chuẩn bị/đánh giá demo. Prototype không nhúng agent Codex vào endpoint replay; chưa đo được độ trễ CLI và không lấy token đăng nhập để giả lập một API key.

Gemini dùng SDK và [structured output](https://ai.google.dev/gemini-api/docs/structured-output). Giữ `VLM_MODEL` cấu hình được; thay model cần chạy đánh giá lại. Không tự suy ra chính sách lưu trữ cloud từ việc app không giữ ảnh.

## Kiểm thử và đo số liệu

```bash
cd apps/server
uv run pytest -q
uv run ruff check navigation tests
cd ../web
npm test
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

E2E dùng camera tổng hợp + API mock, chạy MediaPipe/WASM thật. Không đại diện độ chính xác landmark. Download session metrics trên UI, rồi:

```bash
python3 scripts/metrics.py session1.json session2.json session3.json
```

Đánh giá VLM thật dùng manifest local với các case `id`, `image`, `expected` và `checkpoint` theo schema metadata; tối thiểu ba ảnh mới mỗi landmark, mười ảnh âm tính và origin đúng/sai. `image` là đường dẫn tương đối từ manifest. Không commit ảnh thật.

```bash
cd apps/server
uv run python -m navigation.evaluate /private/eval/cases.json --output /private/eval/results.json
```

Lệnh này gửi ảnh qua che mặt tới provider đang cấu hình, tối đa một call/case. Báo số false positive với mẫu âm tính riêng; giữ timeout/errors trong kết quả. Metrics UI chỉ là số liệu vận hành, không thay ground truth hoặc các lượt đi thực tế.

## Credit

Route teach-and-share inspired by [OCCAM Lab Clew](https://github.com/occamLab/Clew); original implementation by Team Offixed. Không sao chép code Clew. MediaPipe face detector được tải bản versioned về laptop và phục vụ cùng origin, theo [hướng dẫn Web](https://developers.google.com/edge/mediapipe/solutions/vision/face_detector/web_js).
