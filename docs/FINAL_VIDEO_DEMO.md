# Hướng dẫn quay demo Day One trên iPhone

Nhánh: `demo/final-video`. Ba cảnh prototype có kịch bản dùng video đã chuẩn bị và giọng AI ghép sẵn. Chữ, trạng thái và bộ đếm bám theo thời gian video; mỗi cảnh có thể mở và quay lại độc lập.

## Mở và quay demo

iPhone cần kết nối Tailscale tới Mac đang chạy server. Mở **https://100.124.205.33:8443/?demo=1** bằng Safari.

| Cảnh | Link trực tiếp | Thời lượng |
| --- | --- | --- |
| Teach | https://100.124.205.33:8443/?demo=teach | 43,61 giây |
| Elevator → Restroom | https://100.124.205.33:8443/?demo=route | 14,37 giây |
| Cảnh báo người phía trước | https://100.124.205.33:8443/?demo=collision | 9 giây |

1. Giữ điện thoại dọc, chọn cảnh và bật quay màn hình iPhone.
2. Để **App narration** bật và tăng âm lượng. Chạm **Record** hoặc **Start guidance** để phát cả hình và tiếng.
3. Dùng **Pause**, **Resume**, **Restart** khi cần. Chuyển ứng dụng sẽ tạm dừng video; quay lại rồi chạm Resume.
4. Teach có hiệu ứng nhấn Record để nhóm ghép câu “Learn this route” vào đúng cú chạm. Trạng thái cuối được giữ lại để dễ cắt dựng.

Đã kiểm tra bố cục 393×852 và 375×667: nút bắt đầu, câu hướng dẫn và toàn bộ khung hình 16:9 cùng nằm trong màn hình. Video thuyết trình cuối do nhóm ghép riêng.

App cũ vẫn ở `/`. Demo không mở camera/micro hoặc gọi API nhận diện. Media được phục vụ từ Mac, không phát từ Drive hay gọi TTS khi quay. Chứng chỉ HTTPS hiện có chứa địa chỉ Tailscale trên; không dùng địa chỉ LAN khác nếu chứng chỉ chưa bao gồm nó.

### Nếu vẫn thấy app cũ

Service worker có thể còn giữ bản app trước. Đóng các tab Day One cũ rồi mở lại link có `?demo=1`; tải lại trang nếu cần. Nếu vẫn chưa cập nhật, xóa **riêng dữ liệu website `100.124.205.33`** trong phần dữ liệu website của cài đặt Safari rồi mở lại. Không cần xóa dữ liệu các website khác.

Người dùng đã xác nhận trang chọn demo hiện trên iPhone thật. Phát trọn ba cảnh, chất lượng quay màn hình có tiếng và VoiceOver trên thiết bị thật vẫn cần nhóm kiểm tra.

## Nội dung các cảnh

- **Teach:** giữ hình đầu 2 giây, đọc “Recording started.” → video gốc 37,61 giây với nguyên tiếng người dạy → đóng camera, loading 1 giây và đọc “Learning.” → dấu tích, “Route learned.” và phần kết 3 giây.
- **Dẫn đường:** 0 giây “Turn right.”; 3,5 giây “Continue straight.”; 10 giây “You have arrived. The restroom is on your right.” Tiếng gốc được tắt; câu cuối kết thúc trước khi hết clip.
- **Cảnh báo:** đúng đoạn nguồn `[5, 14)` giây, dài 9 giây. Âm báo ở giây 1; “Be careful. Someone is in front of you.” bắt đầu khoảng giây 1,45. Banner tắt ở giây 7 khi người đi qua; không khẳng định lối đi an toàn.

## Tạo lại media và chạy trên máy khác

Chạy từ **thư mục gốc repository**. Cần môi trường `uv` hiện có của server, FFmpeg/ffprobe và Node/npm.

```bash
# Tải video nguồn và tạo đủ media; cần Internet cho Drive và Edge-TTS.
uv run --project apps/server python scripts/prepare_final_video_media.py

# Chỉ tạo lại một cảnh sau khi sửa lời hoặc thời gian.
uv run --project apps/server python scripts/prepare_final_video_media.py --scene teach

# Kiểm tra thời lượng, codec và fast-start của media hiện có.
uv run --project apps/server python scripts/prepare_final_video_media.py --verify-only

# Đưa giao diện và media mới vào dist cho server hiện tại.
npm --prefix apps/web run build
```

Nếu server HTTPS chưa chạy, bật bằng `bash scripts/serve.sh --https`. Khi cổng 8443 đã chạy, chỉ cần build lại; không mở thêm server trùng cổng. Cấu hình chứng chỉ trên máy mới theo `docs/PROTOTYPE_RUNBOOK.md`.

- Lời dẫn, timeline và nguồn: `apps/web/src/demo/timeline.json`.
- Script: `scripts/prepare_final_video_media.py`.
- MP4 hoàn chỉnh: `apps/web/public/demo-media/` — **bị Git bỏ qua**, cần tạo lại hoặc chép riêng khi chuyển máy.
- Bản gốc, file trung gian, báo cáo và ảnh kiểm thử: `data/runtime/final-video/` — bị Git bỏ qua.
- Clip H.264/AAC, 1920×1080, 30 fps, fast-start; giọng `en-US-AriaNeural`. Giữ nguyên tiếng người dạy; cắt khoảng lặng đầu/cuối lời AI để vừa các mốc.

## Kiểm tra đã hoàn tất

65 unit tests; 16 E2E Chromium và 16 E2E WebKit cho demo; kiểm tra hồi quy app cũ; build thành công. HTTPS trả đúng media và hỗ trợ HTTP Range. QA độc lập đã đối chiếu frame đoạn cắt với video gốc, xác nhận tiếng teach lệch đúng 2 giây và lời dẫn không bị cắt. Chi tiết tại `docs/agent-work/final-video/WORKER_REPORT.md` và `CHECKPOINT.md`.
