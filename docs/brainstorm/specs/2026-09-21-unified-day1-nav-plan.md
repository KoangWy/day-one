> Provenance: recovered from Codex session "Lap plan cho spec unified day1 nav" (prompt 2026-09-21, session 01a0c385) via the implement-session handoff (session 01a0c391). Saved verbatim to this file on 2026-09-21; only this provenance block was added. Source spec: docs/brainstorm/specs/2026-09-21-unified-day1-nav-design.md.
>
> Note: the plan targets office-to-toilet with 4-5 checkpoints. The demo later pivoted to Lift lobby-to-Toilet with 2 checkpoints per user approval; see docs/PROTOTYPE_RUNBOOK.md and data/examples/lift-lobby-to-toilet-v1/README.md.

---
# Unified Day-1 Navigation — Kế hoạch triển khai Tier A

## 1. Mục tiêu và tech stack

Xây prototype chạy trên **iPhone**, kiểm thử accessibility trên **Windows + NVDA**, đúng spec đã khóa: teach một tuyến office → toilet từ video, sau đó replay qua 4–5 checkpoint có xác nhận của người dùng.

| Thành phần | Lựa chọn |
|---|---|
| Frontend | React + TypeScript + Vite; HTML semantic, CSS thuần; `vite-plugin-pwa` |
| Backend | Python 3.11 + FastAPI + Pydantic + Uvicorn; quản lý dependency bằng `uv` |
| Nhận diện landmark | Gemini `gemini-2.5-flash`, SDK `google-genai`, request/response với structured output |
| Xử lý video | FFmpeg lấy keyframe khoảng 1 fps |
| Transcript teach | `faster-whisper`, model `base.en`, chạy CPU; cho phép sửa transcript |
| Giọng đọc | Edge-TTS tạo sẵn MP3; giọng `en-US-AriaNeural` |
| Lưu trữ | JSON và audio trên laptop; không cần database |
| Kiểm thử | pytest, Vitest, Playwright + axe; Safari/VoiceOver và NVDA kiểm tra trực tiếp |

Gemini Flash phù hợp với xử lý ảnh theo lượt; structured output giúp backend kiểm tra kết quả trước khi sử dụng. Model được cấu hình qua `VLM_MODEL`, API key chỉ nằm trên server. [Models](https://ai.google.dev/gemini-api/docs/models), [structured output](https://ai.google.dev/gemini-api/docs/structured-output).

Các nguồn tham khảo và cách sử dụng:

- [OCCAM Lab Clew](https://github.com/occamLab/Clew): tham khảo luồng ghi tuyến và đi lại tuyến. Repo dùng Swift/ARKit; giữ đúng spec “ideas only”, không sao chép code.
- [faster-whisper](https://github.com/SYSTRAN/faster-whisper): dùng trực tiếp cho transcript có timestamp.
- [edge-tts](https://github.com/rany2/edge-tts): dùng trực tiếp, tạo audio trước demo vì tổng hợp giọng nói cần mạng.

Chọn PWA theo spec để dùng chung giao diện iPhone và Windows. Không thêm native app, vector database, agent framework, streaming hoặc obstacle detection.

## 2. Kiến trúc và hợp đồng dữ liệu

### Triển khai trên laptop

Frontend build thành static assets, FastAPI phục vụ cùng origin với API và audio. iPhone và Windows kết nối cùng mạng riêng của team.

Dùng HTTPS qua Uvicorn và chứng chỉ `mkcert` cho địa chỉ LAN của laptop. Cài CA công khai và bật trust trên thiết bị demo; không chia sẻ private key. Camera trình duyệt yêu cầu secure context; mkcert có hướng dẫn cài trust trên iOS. [Camera](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia), [mkcert](https://github.com/FiloSottile/mkcert).

Tổ chức thành `apps/web`, `apps/server` và `data`. Chỉ commit code, fixture đã làm sạch và route mẫu; bỏ qua API key, chứng chỉ, raw media, dữ liệu runtime và output build.

### Giữ nguyên schema của spec

`route.json` tiếp tục chỉ chứa `route_id` và `steps[{id,instruction,landmark,voice_cue}]`.

Chốt ý nghĩa để tránh lệch một checkpoint:

- `instruction`: hướng dẫn đi từ điểm đã xác nhận trước đó tới landmark của step hiện tại.
- `landmark`: điểm đích cần kiểm tra ở step đó.
- `voice_cue`: trích lời người dẫn; dùng chuỗi rỗng nếu không có.
- Step cuối kết thúc tại **biển/cửa toilet bên ngoài**, không quay bên trong.

Lưu origin, câu hỏi checkpoint và mapping audio trong metadata đi kèm, không thêm field vào schema đã khóa.

| Endpoint | Hợp đồng |
|---|---|
| `POST /ingest-video` | Multipart MP4, `route_id`, transcript chỉnh tay tùy chọn; trả route nháp đúng schema. Chỉ cho phép gọi từ loopback trên laptop |
| `GET /routes` | Trả danh sách route đã duyệt, mỗi phần tử đúng schema |
| `GET /routes/{route_id}/assets` | Trả mô tả origin, câu hỏi và URL audio cho origin, từng step, arrival, fallback |
| `POST /replay` | Giữ request `{route_id, step_index, image_jpeg_640}` và response `{matched, instruction, checkpoint_question, audio_url}` |
| `GET /audio/{asset_id}` | Phục vụ MP3 đã tạo sẵn |

Quy ước bổ sung cho `/replay`:

- `step_index=-1` là kiểm tra origin; các step thường đánh số từ `0`.
- `image_jpeg_640` là JPEG base64, cạnh dài tối đa 640 px, giữ tỉ lệ ảnh.
- `instruction` luôn lấy từ nội dung đã duyệt, không lấy chỉ đường mới do VLM sinh ra. Tại origin chưa xác nhận, không trả hướng dẫn di chuyển.
- Route không tồn tại trả 404; payload/index sai trả 422; timeout/provider lỗi trả 503 để UI phân biệt với “ảnh không khớp”.
- Server không giữ phiên replay. Frontend giữ step hiện tại, số lần không khớp và landmark cuối được người dùng xác nhận.

## 3. Luồng triển khai

### A. Teach từ video

1. Quay một tuyến ngắn có 4–5 landmark phân biệt được bằng chữ; người dẫn nói rõ hướng và checkpoint bằng tiếng Anh.
2. Import MP4 trên laptop. FFmpeg lấy frame khoảng 1 fps, faster-whisper tạo transcript có timestamp.
3. Gửi keyframe sang VLM. Transcript và frame được nhóm theo thời gian để tạo route nháp.
4. Người phụ trách duyệt lại thứ tự, hướng trái/phải, chữ trên biển và lời dẫn. Không suy diễn `voice_cue` từ hình ảnh.
5. Lệnh chuẩn bị route kiểm tra đủ 4–5 step, tạo metadata và toàn bộ audio, rồi mới công bố route qua `/routes`.
6. Xuất log teach có timestamp để dựng recap 20 giây; ghi rõ đây là xử lý video đã quay.

“Offline ingest” được hiểu là xử lý trước buổi replay, **vẫn cần mạng cho VLM và Edge-TTS**. Ứng dụng xóa bản video/audio tạm sau xử lý, kể cả khi lỗi; không tự xóa file nguồn của người dùng. Chỉ giữ route, metadata và audio hướng dẫn đã duyệt.

### B. Origin và replay

Luồng chính:

`Start → kiểm tra origin → người dùng xác nhận → hướng dẫn step → chụp checkpoint → xác nhận Yes → step tiếp theo → arrival`

**Origin**

- Nút Start xin camera và kích hoạt audio.
- Chụp ba frame cách nhau khoảng một giây, thu cạnh dài về ≤640 px trước khi gửi.
- Gọi `/replay` với `step_index=-1` cho từng frame. Ít nhất hai frame khớp mới hiển thị câu hỏi xác nhận office.
- Chỉ bắt đầu s1 sau câu trả lời Yes. No/unsure hoặc thiếu bằng chứng: cho chụp lại, hiển thị “I only know the office route”; không cho bỏ qua origin bằng Next.

**Checkpoint**

- Phát instruction đã lưu; người dùng di chuyển rồi bấm Check checkpoint.
- VLM chỉ đánh giá ảnh có khớp landmark dự kiến hay không. Prompt yêu cầu bằng chứng chữ/đặc điểm đã lưu; biển mờ, bằng chứng mâu thuẫn hoặc chỉ giống chung chung đều không khớp.
- Backend kiểm tra structured output nội bộ gồm `matched` và bằng chứng quan sát; không dùng VLM để sinh hướng rẽ hoặc nhận định đường an toàn.
- Khi khớp, hỏi checkpoint bằng câu đã duyệt. Yes mới tiến bước; No giữ nguyên step và cho chụp lại.
- Yes tại step cuối chuyển sang arrival và dừng camera.

**Fallback**

- Hai lần `matched=false` liên tiếp ở cùng step kích hoạt thông báo lost-track theo spec, kèm landmark cuối được xác nhận, Repeat và Next.
- Next mở xác nhận rõ: “Continue using saved directions without visual verification?”; chỉ Yes mới tiến bước. Ghi nhận thao tác này là manual override.
- Timeout VLM sau 10 giây; không tự gọi lặp vô hạn. Cho Retry hoặc fallback thủ công tại step thường.
- Repeat chỉ phát lại audio; không gọi VLM.
- Mỗi thời điểm chỉ có một request checkpoint; bỏ response cũ sau reset hoặc chuyển step.
- Reload hoặc quay lại sau khi app bị đưa xuống nền yêu cầu kiểm tra origin lại.

### C. PWA accessible trên iPhone

- Một màn hình chính: tiến độ, instruction, checkpoint question, Check checkpoint, Yes/No, Repeat, Next khi fallback và Stop.
- Camera sau với `playsinline`; có xử lý từ chối quyền, mất camera và không đọc được biển.
- Dùng một audio element; nếu Safari chặn phát tự động sau request, hiện nút Play instruction. Kiểm tra hành vi trên iPhone thật. [WebKit media policies](https://webkit.org/blog/6784/new-video-policies-for-ios/).
- Voice command dạng push-to-talk, chỉ nhận `yes`, `no`, `repeat`, `next`, `stop`. Feature-detect SpeechRecognition; không hỗ trợ hoặc lỗi thì dùng nút và ô nhập lệnh. Thông báo rằng nhận dạng giọng nói có thể gửi audio tới dịch vụ của trình duyệt. [SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition).
- Label rõ, focus dễ thấy, nút tối thiểu 44×44 px, tương phản tốt, hỗ trợ phóng to; cập nhật qua `aria-live="polite"`.
- Cho tắt giọng ứng dụng để người dùng nghe screen reader; không bật mic khi audio đang phát.
- Service worker chỉ cache app shell. Không cache ảnh/request replay; mất mạng hiển thị trạng thái, không tuyên bố định vị offline.

### D. Privacy và phạm vi tuyên bố

Replay chỉ gửi snapshot theo thao tác người dùng; không upload camera liên tục. Không lưu ảnh replay hoặc ghi ảnh/base64 vào log.

Consent nói rõ ảnh được gửi tới nhà cung cấp VLM. Quay ở khu vực được đồng ý, tránh người ngoài và thông tin nhạy cảm. Không tuyên bố cloud provider “không lưu dữ liệu” khi chưa xác minh chính sách.

## 4. Phân công, thứ tự và mốc bàn giao

Trước khi sửa repo: kiểm tra `git status`, chạy `git pull origin main`; nếu có conflict thì báo các file và phương án xử lý theo AGENTS.md. Pin dependency bằng lockfile sau lần build thành công đầu tiên.

| Mốc | Người A — PWA | Người B — Teach/backend | Người C — VLM/demo |
|---|---|---|---|
| Đầu phiên 21/09 | Safari camera/audio qua HTTPS | Scaffold API, schema, fixture route | Kiểm tra key/quota bằng ảnh landmark thật; chuẩn bị Windows/NVDA |
| Tiếp theo 21/09 | Luồng replay chạy với API giả lập | Ingest, transcript, metadata, audio | Prompt origin/checkpoint và ảnh thử âm tính |
| Cuối 21/09 | Kết nối API thật trên iPhone | Route đã duyệt, đủ audio | Hoàn thành một lượt origin → arrival; chuẩn bị deck |
| 22/09, ngoài lịch BTC | Sửa lỗi từ kiểm thử người dùng | Chốt route, cleanup và log metrics | Lấy phản hồi tại fireside chat; chạy thử và quay evidence |
| Trước 15:00 ngày 22/09 | Đóng băng tính năng | Đóng băng data/API | Chốt số liệu và demo footage |
| Tối 22/09 | Kiểm tra sản phẩm cuối | Kiểm tra file/audio | Hoàn thiện và nộp deck/video |

Ưu tiên tích hợp một step thật trước khi hoàn thiện toàn bộ UI. Nếu chậm, giữ typed/button fallback và sửa transcript thủ công như spec cho phép; không thêm các mục Future Work.

Dependency phải xác minh ngay đầu phiên: Safari dùng được HTTPS/camera/audio, API key có quota, có Windows chạy NVDA thật. Mock chỉ dùng để phát triển và phải được ghi nhãn khi xuất hiện trong demo.

## 5. Kiểm thử và tiêu chí hoàn thành

### Kiểm thử chức năng

- Teach: video hợp lệ, thiếu audio, transcript sửa tay, video lỗi; lỗi giữa chừng không công bố route dở dang và vẫn dọn file tạm.
- Origin: đúng office, sai vị trí, ảnh mờ, chỉ một trong ba frame khớp, người dùng trả lời No; mọi trường hợp chưa xác nhận đều không phát hướng dẫn s1.
- Checkpoint: đúng biển, sai biển, cảnh tương tự, JSON VLM lỗi, timeout; không có trường hợp AI tự tăng step.
- UI: double-click Yes, response đến muộn, Repeat, manual override, Stop, reload và đưa app xuống nền.
- Privacy: xác nhận ảnh replay không nằm trong cache/log.

Dùng pytest kiểm tra API và xử lý lỗi; Vitest kiểm tra chuyển trạng thái; Playwright kiểm tra hành trình bằng bàn phím và tích hợp API giả lập. Ghi rõ bài kiểm thử dùng mock; chạy kiểm chứng VLM riêng bằng ảnh thật.

### Accessibility và đo lường

- Chạy toàn bộ hành trình bằng bàn phím + **NVDA thật trên Windows**, ghi màn hình có tiếng.
- Chạy camera, audio và các nút với **VoiceOver trên iPhone** ở Safari và chế độ Add to Home Screen.
- axe không còn lỗi serious/critical trên màn hình chính; kiểm tra thủ công focus, thông báo lỗi và nội dung được đọc.
- Bộ ảnh kiểm chứng tối thiểu: ba ảnh mới mỗi landmark, mười ảnh không thuộc checkpoint, ảnh origin đúng/sai. Báo false positive riêng.
- Chạy ít nhất ba lượt tuyến hoàn chỉnh. Báo số lượt hoàn thành, số checkpoint VLM khớp, số manual override và số lần mất dấu.
- Đo teach time gồm thời gian duyệt thủ công; p50 replay từ lúc bấm Check đến lúc có kết quả. Mục tiêu p50 ≤5 giây, báo số đo thực tế và cỡ mẫu.

### Bàn giao cuộc thi

- Video mục tiêu **4 phút 40 giây**, MP4 16:9, tiếng Anh; slide luôn rõ, footage và tiến độ đặt cạnh slide.
- Deck theo template chính thức, slide 1–6 đúng thứ tự; appendix từ slide 7. Tên dự kiến: `OFFIXED_UNIFIED DAY-1 NAVIGATION.pptx`.
- Có metrics thực đo, credit Clew, bảng so sánh có nguồn, consent/retention, và “Wayfinding aid, not a safety device”.
- Ghi “Accessibility target: WCAG 2.2 AA / ISO/IEC 40500:2025” cùng phạm vi kiểm thử; không tự nhận chứng nhận tuân thủ.
- Kiểm chứng nguồn và ngữ cảnh trước khi dùng các số liệu 94%, thời gian học tuyến hoặc 52,5%; không dùng số liệu tác vụ desktop để chứng minh độ chính xác điều hướng.
- Nộp tối 22/09 qua link riêng của team; hạn tuyệt đối **07:00 ngày 23/09/2026**.

Các mặc định đã chốt: iPhone + Windows theo lựa chọn của bạn; laptop có mạng gọi VLM; một route tiếng Anh; mọi nội dung hướng dẫn được người duyệt. Rà soát theo brainstorming tập trung vào làm rõ origin, nghĩa của từng step, fallback và lịch bàn giao; giữ nguyên phạm vi Tier A.
