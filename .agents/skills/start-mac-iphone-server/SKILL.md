---
name: start-mac-iphone-server
description: Bật, khởi động lại hoặc xử lý lỗi kết nối server Day One trên Mac để test bằng Safari trên iPhone qua Tailscale và HTTPS. Dùng khi người dùng nhờ bật server Mac, mở prototype trên iPhone hoặc báo không kết nối được cổng 8443.
---

# Bật Day One trên Mac cho iPhone

Thực sự khởi động server và kiểm tra kết nối khi được yêu cầu bật; không chỉ đưa lệnh cho người dùng tự chạy. Dùng HTTPS trực tiếp của repo trên cổng 8443. Đây là thao tác vận hành local, không cần sửa mã nguồn ứng dụng hay gọi AI để thử key.

Chạy các lệnh từ thư mục gốc repo ADC HACKATHON. Đọc [runbook](../../../docs/PROTOTYPE_RUNBOOK.md) nếu cấu hình đã thay đổi. Không hardcode đường dẫn home, IP hay PID của phiên trước.

## 1. Kiểm tra và đồng bộ

```bash
git status --short --branch
git pull origin main
command -v uv node npm mkcert tailscale python3
tailscale ip -4
lsof -nP -iTCP:8443 -sTCP:LISTEN
```

- Giữ nguyên thay đổi local. Nếu pull bị chặn hoặc có conflict, xử lý theo AGENTS.md; không reset/stash tự động. `lsof` không tìm thấy listener trả exit code 1: server chưa chạy.
- Tailscale phải đang kết nối. Dùng IPv4 của chính Mac từ `tailscale ip -4`; IP đã dùng trong phiên setup không phải giá trị cố định.
- Nếu cổng 8443 đang được dùng, xác định tiến trình bằng `ps` và thư mục làm việc qua `lsof -a -p PID -d cwd`. Tái sử dụng server Day One khỏe nếu không cần cập nhật. Không dừng dịch vụ khác để giành cổng.
- `.env` ở gốc repo được backend tự nạp. Không in nội dung/key, không ghi đè file hiện hữu. Nếu thiếu, tạo từ `.env.example` rồi hướng dẫn người dùng điền key local. `/health` chỉ xác nhận key có mặt.

## 2. Chuẩn bị bản chạy

Trên máy mới hoặc sau khi pull thay đổi dependency/frontend, chạy và kiểm tra từng lệnh thành công:

```bash
uv sync --project apps/server --all-extras --frozen
npm --prefix apps/web ci
npm --prefix apps/web run build
```

Nếu dependency và bản build hiện tại đã cập nhật, bỏ qua cài lại/build lại. Server phục vụ `apps/web/dist`, không tự build frontend khi khởi động.

Tuyến demo `lift-lobby-to-toilet-v1` và audio đã nằm trong `data/runtime/routes/`; không chạy lại teach/prepare. Nếu route thiếu, kiểm tra `DATA_DIR` và dữ liệu đã publish trước. Bản hiện tại không dùng `scripts/setup_assets.py` hay MediaPipe. Nếu `apps/web/public/privacy/` còn từ bản cũ, di chuyển vào một thư mục backup mới trong `data/runtime/` trước khi build để tránh đóng gói lại asset cũ; không xóa dữ liệu người dùng.

## 3. Kiểm tra chứng chỉ theo IP Tailscale

```bash
openssl x509 -in .certs/lan.pem -noout -dates -ext subjectAltName
```

Chứng chỉ phải còn hạn, chứa IPv4 Tailscale hiện tại trong SAN và có `.certs/lan-key.pem` tương ứng. Chứng chỉ chỉ chứa IP Wi-Fi cũ không dùng được cho IP Tailscale. Nếu thiếu/sai/hết hạn, tạo lại bằng CA hiện hữu:

```bash
task_tailscale_ip="$(tailscale ip -4)"
bash scripts/setup_https.sh "$task_tailscale_ip"
```

Không tái tạo/xóa root CA. Nếu server đang chạy và vừa thay chứng chỉ, khởi động lại đúng server của repo để nạp chứng chỉ mới. Nếu thiếu `mkcert`, hướng dẫn cài `brew install mkcert`; không tự thay đổi trust store hệ điều hành.

## 4. Chạy server nền

Khi không còn listener của app cần thay thế ở cổng 8443, chạy đoạn sau từ gốc repo. Dùng process tách session với stdin/stdout/stderr được chuyển hướng để server không phụ thuộc terminal của lượt tool hiện tại:

```bash
python3 - <<'PY'
from pathlib import Path
import subprocess

task_root = Path.cwd()
assert (task_root / 'scripts/serve.sh').is_file(), 'Run from the repository root'
task_state = task_root / 'data/runtime/local-server'
task_state.mkdir(parents=True, exist_ok=True)
with (task_state / 'https.log').open('ab', buffering=0) as task_log:
    task_process = subprocess.Popen(
        ['bash', 'scripts/serve.sh', '--https'],
        cwd=task_root,
        stdin=subprocess.DEVNULL,
        stdout=task_log,
        stderr=subprocess.STDOUT,
        start_new_session=True,
        close_fds=True,
    )
(task_state / 'https.pid').write_text(str(task_process.pid) + '\n', encoding='utf-8')
print(f'Start requested; PID {task_process.pid}; log: {task_state / "https.log"}')
PY
```

PID vừa tạo chưa chứng minh app chạy được. Chờ startup ngắn rồi kiểm tra bên dưới. Khi cần dừng/restart, xác minh PID, process group và thư mục repo trước khi gửi SIGTERM cho nhóm tiến trình đã tạo; PID file có thể cũ. Không dùng `pkill python`/`killall uvicorn`. Chỉ xóa PID file sau khi xác nhận nhóm server đó đã dừng. Không tự tạo LaunchAgent đăng nhập máy hoặc bật `caffeinate` vô thời hạn.

Giữ nguyên các cờ `--no-proxy-headers --no-access-log` của `scripts/serve.sh`. Không đổi sang Tailscale Serve/Funnel trong quy trình này: HTTP proxy loopback làm mất ý nghĩa kiểm tra địa chỉ socket của `/ingest-video`, vốn chỉ dành cho laptop.

## 5. Xác nhận trước khi báo thành công

```bash
task_tailscale_ip="$(tailscale ip -4)"
task_ca_root="$(mkcert -CAROOT)"
lsof -nP -iTCP:8443 -sTCP:LISTEN
curl --fail --silent --show-error --connect-timeout 5 --max-time 10 \
  --cacert "$task_ca_root/rootCA.pem" "https://$task_tailscale_ip:8443/health"
curl --fail --silent --show-error --connect-timeout 5 --max-time 10 \
  --cacert "$task_ca_root/rootCA.pem" -o /dev/null "https://$task_tailscale_ip:8443/"
curl --fail --silent --show-error --connect-timeout 5 --max-time 10 \
  --cacert "$task_ca_root/rootCA.pem" "https://$task_tailscale_ip:8443/routes"
```

Mong đợi HTTPS hợp lệ, HTTP 200, health `status=ok`, tuyến demo xuất hiện. Không dùng `curl -k` làm bằng chứng chứng chỉ hợp lệ; không gọi `/replay`, `/ingest-video` hoặc provider để kiểm tra startup. Nếu lỗi, đọc `data/runtime/local-server/https.log`, sửa nguyên nhân cụ thể rồi thử lại một lần; không lặp khởi động mù.

Báo URL đầy đủ `https://IP-Tailscale-của-Mac:8443`, server đang chạy nền và nơi lưu log/PID. Phân biệt kiểm tra từ Mac với xác nhận Safari trên iPhone thật. Nhắc giữ Mac thức và Tailscale kết nối trên hai máy.

## 6. Trust chứng chỉ và test trên iPhone

Nếu iPhone đã trust `rootCA.pem` của Mac này, đổi leaf certificate/IP không cần cài lại root. Khi setup lần đầu, tìm file bằng:

```bash
open -R "$(mkcert -CAROOT)/rootCA.pem"
```

Chỉ AirDrop `rootCA.pem`. Không gửi `rootCA-key.pem` hoặc `.certs/lan-key.pem`. Trên iPhone: cài profile trong Settings → General → VPN & Device Management, sau đó bật full trust ở Settings → General → About → Certificate Trust Settings. Không tự nhận đã hoàn tất thao tác trên iPhone.

Mở URL có **https://** bằng Safari, đồng ý gửi ảnh → Start this walk → cho phép camera. Thử `/health` trước nếu trang không mở. Tuyến thật bắt đầu ở số 3 cạnh thang máy → biển Office for Research & Innovation → hai biển xe lăn cạnh cửa chớp toilet. Ảnh hiện được gửi không che mặt; dùng khu vực quay đã đồng ý. Test ở nơi khác chỉ kiểm tra được kết nối/UI/camera và từ chối cảnh không khớp.

Chẩn đoán theo biểu hiện:

- Không kết nối máy chủ: kiểm tra listener, process/log, Mac có sleep, Tailscale hai máy và firewall cổng 8443. Không tắt firewall toàn hệ thống.
- Cảnh báo chứng chỉ: kiểm tra full trust trên iPhone, SAN đúng IP và hạn chứng chỉ. Không hướng dẫn bỏ qua cảnh báo để xin camera.
- Camera không mở: URL HTTPS hợp lệ và quyền camera Safari; mở trực tiếp Safari.
- AI trả 503: lỗi provider/key/timeout, khác lỗi kết nối server. Không suy ra key hợp lệ từ `vlm_configured=true`.
- Mất tiếng: bật App voice, kiểm tra âm lượng, bấm Play instruction nếu hiện. Chuyển app/khóa màn hình reset về origin theo thiết kế.
