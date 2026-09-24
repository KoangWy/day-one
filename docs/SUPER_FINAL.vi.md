> [English](./SUPER_FINAL.md) | **Tiếng Việt**

# Super final — đưa các tính năng trong video demo vào app thật

Nhánh `super-final-project`, tạo ngày 23/09/2026 từ `feat/realtime-replay` (camera kiểm tra liên
tục, câu mẫu, bấm Next để đi tiếp) cộng với `main`. Video đã nộp (`OFFIXED_DAY ONE.mp4`) có những
tính năng chỉ là cảnh dựng sẵn hoặc giọng TTS ghép thêm, chưa phải app thật. Nhánh này làm thật từng
tính năng. Cột "Đã kiểm chứng" ghi rõ kiểm bằng cách nào.

| Trong video | Đã làm thành | Đã kiểm chứng |
|---|---|---|
| "Before you start, hang your phone at chest height…" (0:03) | Thẻ **Wear your phone** trước lần đi đầu: hình minh hoạ, 4 bước, nút *Play setup instructions* đọc to; *I'm ready* ẩn thẻ trên điện thoại này; *Phone setup* mở lại | e2e `journeys.spec.ts` (cả hai trình duyệt) |
| Stage 1 · Learn: *Record* → "Recording started." → "Learning." → "Route learned ✓", "3 places remembered" (0:16–0:57) | Trang **Teach a route** (`#/teach`) cho người dẫn: quay camera + lời dẫn bằng MediaRecorder, gửi lên kèm thanh tiến độ, laptop học ở nền (FFmpeg tách frame, Whisper, một lần gọi DeepSeek), rồi đọc lại các nơi đã nhớ | e2e (mock laptop) + **chạy thật** trên laptop: đoạn đi 37 s có lời dẫn, 720p (12 MB, như điện thoại quay) học xong trong ~63 s |
| "AI biến biển báo và cửa có sẵn thành checkpoint" (lời thuyết trình) | AI soạn nháp các bước, chữ trên biển, đặc điểm, **nguy hiểm trên đường** và các nơi; trang **Review** (`#/review/<id>`) điền sẵn các gợi ý đó. Người đi không nghe câu nào cho tới khi người dẫn xác nhận và publish | pytest `test_guide.py`; e2e review; bản nháp thật bị chặn khi publish vì hai điểm giống hệt nhau (xem dưới) |
| Stage 2 · Walk alone: chọn tuyến đã lưu (lời thuyết trình) | **Danh sách tuyến** trên trang Walk lấy từ `/catalog`; điện thoại nhớ lựa chọn, `?route=<id>` mở thẳng một tuyến | e2e |
| Guide 1 → Guide 2 → Guide 3: cổng → thang máy, rồi thang máy → toilet hoặc → meeting room | **Continue your journey**: khi tới nơi, app đề xuất mọi tuyến bắt đầu từ đúng nơi vừa tới (khớp theo tên nơi) | e2e; `/catalog` trên server thật liệt kê đủ 3 đoạn |
| "Be careful. Someone is in front of you." kèm chuông (1:02, thuyết trình 2:14) | **Cảnh báo vật cản chạy trên điện thoại**: MediaPipe EfficientDet-Lite0 chạy trong trình duyệt 4 lần/giây; người (hoặc ghế, băng ghế, vali…) ở gần, giữa khung hình trong 2 khung liên tiếp (vật là 3) sẽ có chuông, banner đỏ và câu cảnh báo cắt ngang mọi câu khác, chỉ một lần; hết thấy thì "Warning ended." Ảnh không rời điện thoại | Unit test trên detection **ghi lại từ footage hành lang của nhóm**; e2e dùng chính footage đó làm camera qua detector thật; ảnh chụp banner lúc chạy |
| "Be careful. Automatic door ahead." (1:13) và "A glass door is in front of you." → "Push the door open and go through." (Guide 3) | **Nguy hiểm theo tuyến** được dạy cùng tuyến (cửa kính, cửa tự động, cửa, cầu thang, bậc, lối hẹp, khác): nói "On the way: …" sau hướng dẫn, rồi chuông + cảnh báo + cách đi qua khi camera thấy nó ở gần; mỗi bước một lần | DeepSeek trên frame thật: cửa tự động 3/3, cửa kính 3/3 khi ở gần (xem Kiểm chứng) |
| "Turn around." · "The call button is on your right." · "Up to level 3" | Câu đã duyệt trong hai tuyến mới | Publish với giọng Edge-TTS thật |
| Guide 1 và Guide 3 thành tuyến hoàn chỉnh | `entrance-to-lift-lobby-v1` và `lift-lobby-to-meeting-room-v1`, soạn từ footage của nhóm, mỗi tuyến 56 câu | Eval `/observe` DeepSeek trên frame footage đã tonemap |

Luồng realtime cũ (camera tìm từng mốc, gợi ý, reached, Next, lost → override, vision down, Where am I,
metrics) giữ nguyên; tuyến `lift-lobby-to-toilet-v2` vẫn chạy như trước.

## Âm thanh

Một hàng đợi. **P0** (cảnh báo vật cản hoặc nguy hiểm) phát ngay kèm chuông hai nốt (Android rung
thêm) và cắt ngang; **P1** (hướng dẫn, tới nơi) không bao giờ bị bỏ; **P2** (mốc đang ở đâu trong khung
hình) bị bỏ khi đang bận. Tắt *App voice* thì P0 thành `role="alert"` cho trình đọc màn hình, P1 vào
vùng live polite.

## Chạy

Giống runbook, thêm ba điểm:

```bash
cd apps/server && uv sync --all-extras --frozen   # có imageio-ffmpeg: teach chạy được khi không có FFmpeg trong PATH
cd ../web && npm ci && npm run build               # prebuild copy runtime MediaPipe và tải model 4,6 MB một lần (cần internet)
```

- **Dạy tuyến từ điện thoại:** thêm `TEACH_PIN=<ít nhất 4 ký tự>` vào `.env` rồi restart. Trên điện
  thoại mở `https://<laptop>:8443/#/teach` và nhập mã người dẫn. Trên chính laptop thì không cần mã.
- **Đi:** mở `https://<laptop>:8443/`, chọn tuyến, bấm *Start this walk*. Có thể tắt *Obstacle alerts*
  riêng trên từng điện thoại.
- Laptop Windows không có `uv` trong PATH: dùng `python -m uv …`; venv chạy được mọi thứ:
  `apps/server/.venv/Scripts/python.exe -m uvicorn --app-dir apps/server navigation.main:app --port 8000`.

## Kiểm chứng (23/09/2026, laptop Windows)

- **Tự động:** server 133 pytest, ruff sạch; web 75 vitest; Playwright e2e 12/12 trên Chromium
  (WebKit trên Windows không có MediaStream nên các hành trình cần camera tự skip; hai hành trình
  không cần camera đều đạt); `test:real` 5 đạt, 1 skip WebKit.
- **Cảnh báo vật cản trên footage.** Đoạn hành lang dùng trong video (một bạn đi về phía camera và
  đi ngang ở ~11,5 s): một cảnh báo lúc **7,25 s**, sớm khoảng 4 s, và im lặng với người ở xa hoặc sát
  mép. Đoạn thang máy → meeting room (quay người qua sofa sau vách kính, chậu cây, người ở bên):
  **không cảnh báo**. Ngưỡng ban đầu báo lúc 10 s và báo nhầm sofa; đã chỉnh theo footage này và giữ
  detection ghi lại làm test hồi quy (`apps/web/src/obstacles.footage.test.ts`). Tốc độ detector: ~100 ms
  mỗi khung trên CPU laptop trong Chromium. **Chưa đo trên iPhone.**
- **Tuyến mới, DeepSeek V4.1 Flash trên frame đã tonemap** (`data/runtime/deepseek-super-final-eval-2026-09-23.json`):
  cổng → sảnh thang máy khớp 9/11 frame checkpoint, **0 khớp sai**, cảnh báo cửa tự động 3/3 frame gần
  và một lần sớm ~5 m; sảnh thang máy → meeting room khớp 8/9, **0 khớp sai**, cảnh báo cửa kính 3/3.
  Mô tả cửa kính đầu tiên ("frameless glass door with a tall handle") báo 0/3 vì cửa có khung — đúng là
  cần người duyệt. p50 2,5–3,0 s mỗi ảnh.
- **Teach chạy thật.** Bản nháp AI của đoạn cổng → thang máy khá hợp lý nhưng đặt cùng một cửa RMIT ở
  điểm xuất phát và bước 1, và bảo người đi *đẩy* cửa tự động. Publish giờ từ chối checkpoint giống
  hệt điểm ngay trước nó; trang Review hiện đúng lỗi đó.

## Giới hạn

- Chưa đi thử tại chỗ bằng iPhone + VoiceOver với các tính năng này (việc còn mở giống nhánh realtime).
  `expected_seconds` của hai tuyến mới lấy từ footage.
- Cảnh báo nguy hiểm đến từ VLM trên cloud, ~2,5–3 s mỗi ảnh: đi bình thường thì cảnh báo có thể tới
  muộn hơn người thật nói 1–2 m. Cảnh báo vật cản trên máy thì nhanh, nhưng chỉ biết vật thể COCO:
  không thấy vách kính, cột, biển thấp, bậc hay cầu thang trừ khi người dẫn dạy nó thành nguy hiểm.
  **Công cụ hỗ trợ tìm đường, không phải thiết bị an toàn** — vẫn dùng gậy.
- Phát hiện vật cản chỉ chạy khi đang tìm (điểm xuất phát, đang đi, lạc), không chạy khi chờ Next.
- Dạy tuyến từ điện thoại cần `TEACH_PIN`; ai có mã trong cùng mạng đều dạy và publish được. Dùng
  mạng riêng của nhóm.
- Nhận giọng trên điện thoại là tuỳ chọn dự phòng; trên iPhone nó có thể tranh micro với việc quay,
  nên Whisper trên laptop là đường chính.
