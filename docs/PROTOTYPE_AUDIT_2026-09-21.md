# Day One — kiểm chứng độc lập và việc cần hoàn tất

Kiểm tra tối 21/09/2026, trên Mac Apple Silicon; mã nguồn `main` tại `45e961d`. `git status` sạch trước kiểm tra; `git pull origin main` báo đã cập nhật. Người dùng xác nhận **chưa chạy thử thực tế**. Báo cáo này bổ sung cho `PROTOTYPE_VERIFICATION.md`. Trong phiên audit, người dùng cung cấp key OpenCode mới sau khi thu hồi key cũ; đã cập nhật riêng key trong `.env` bị Git bỏ qua, không ghi key vào báo cáo/log. Không sửa code, lựa chọn provider/model hoặc tuyến đã duyệt.

_(Mục **“## Kết luận”** và **“## 1. Đã chạy lại”** dưới đây là **quan sát lịch sử ngày 21/09/2026** với MiMo/35 test; nhiều câu không còn đúng. Trạng thái hiện tại xem mục “Cập nhật 22/09/2026” ở dưới và `docs/PROTOTYPE_VERIFICATION.md` §1c. Câu “Không sửa code, lựa chọn provider/model…” chỉ đúng cho phiên audit 21/09. Riêng mục **“## 2. Phát hiện cần xử lý”**: active route và metrics vẫn là backlog hoàn thiện chưa sửa; pipeline đánh giá đã sửa ngày 22/09/2026.)_

## Cập nhật 22/09/2026 — trạng thái hiện tại (thay kết luận P0 bên dưới)

Kết luận P0 "MiMo vượt deadline" bên dưới là **quan sát lịch sử ngày 21/09/2026** với `mimo-v2.5`; giữ nguyên để đối chiếu nhưng không còn là trạng thái demo hiện tại. Ngày 22/09/2026 người dùng chốt demo dùng **DeepSeek V4.1 Flash qua OpenCode Go** (`VLM_PROVIDER=opencode`, `OPENCODE_MODEL=deepseek-v4.1-flash`). Adapter đã chuyển sang Chat Completions với `response_format=json_object`, schema + ví dụ Evidence trong prompt và thinking tắt; nhánh MiMo giữ `json_schema`; Pydantic strict và evidence guard giữ nguyên. Deadline vẫn server 10 giây/client 12 giây, không tự đổi provider, không retry ẩn.

Đo thật ngày 22/09/2026 trên frame của video tuyến đã duyệt `IMG_7546.MOV`, gửi đúng như app web chụp (cạnh dài ≤640 px, JPEG 85; chi tiết `docs/PROTOTYPE_VERIFICATION.md` §1c): 10/10 HTTP 200, **6/6 case chính đúng** (origin, office, toilet và ba case âm tính chéo), **không có false positive**, p50 API **3,03 giây**, không timeout. Mốc **office** chỉ khớp khi biển đủ lớn trong khung (từ giây 20,75); chụp xa hơn (20,25 và 20,5 giây) thì chữ quá nhỏ và bị từ chối đúng. Đây là ảnh trích từ video có sẵn, **không phải** lượt đi tuyến/browser mới và chưa chứng minh tuyến thật chạy hết. Mục pipeline đánh giá bên dưới đã sửa; active route và metrics vẫn là backlog hoàn thiện đã ghi nhận, **chưa** sửa.

## Kết luận _(lịch sử 21/09/2026 — số liệu và trạng thái bên dưới đã cũ; xem “Cập nhật 22/09/2026” ở trên)_

Luồng Tier A đã được triển khai khá đầy đủ và qua kiểm thử tự động. **Chưa đủ điều kiện chốt demo AI thật:** key OpenCode mới đã xác thực thành công nhưng các probe với deadline 10 giây đều timeout; một probe được cho chờ lâu hơn trả kết quả đúng sau **11.727 giây**. Chưa đo nhận diện trên ảnh thật, chưa đi tuyến, chưa kiểm thử NVDA/VoiceOver trên thiết bị thật. Có ba vấn đề code khác cần xử lý trước khi thu số liệu/chốt phiên bản: chọn phiên bản tuyến, tiền xử lý ảnh đánh giá và ý nghĩa metrics.

Phạm vi đúng vẫn là **Lift lobby → Toilet, 2 checkpoint**, theo thay đổi đã duyệt. Không coi việc thiếu 4–5 checkpoint của đặc tả cũ là lỗi.

## 1. Đã chạy lại _(lịch sử 21/09/2026: 35 test backend; hiện tại 51 test — xem §1c)_

| Kiểm tra | Kết quả thực tế |
|---|---|
| Backend: `uv run python -m pytest -q` | **35 passed** |
| Backend: `uv run ruff check navigation tests` | **All checks passed** |
| Frontend: `npm test` | **8 passed** |
| Frontend: `npm run build` | **Pass**, PWA được sinh |
| `npm run test:e2e` | **14 passed**, Chromium 7 + WebKit 7; không skip trên Mac |
| `npm run test:real` | **4 passed**, Chromium 2 + WebKit 2 |
| Route/audio | Route đã publish, đủ **11 MP3**; kiểm tra API/audio và axe qua các phase thuộc bộ real-build |
| Tài sản local | Có chứng chỉ HTTPS; chưa chứng minh thiết bị thật đã trust/kết nối được |

Giới hạn: E2E dùng camera tổng hợp. Cả bộ `test:real` cũng **mock `/replay`**; các kết quả trên không đo độ chính xác AI hoặc khả năng đi tuyến. WebKit tự động không thay thế iPhone thật. [Tài liệu Playwright](https://playwright.dev/docs/accessibility-testing) cũng nêu kiểm thử tự động không phát hiện được mọi lỗi accessibility.

Hai ghi chú về môi trường kiểm thử _(lịch sử 21/09/2026)_:

- **Lịch sử:** lệnh `uv run pytest -q` trong runbook lỗi `ModuleNotFoundError: navigation` trên môi trường đó; `uv run python -m pytest -q` mới chạy đủ test. Runbook đã chuẩn hóa sang `uv run python -m pytest -q`; nguyên nhân gốc của launcher/editable installation vẫn chưa xác định.
- Lượt đầu chạy đồng thời hai bộ Playwright bị xung đột thư mục `test-results` (ENOENT lúc đóng trace). Chạy lại mock E2E khi bộ real-build đã kết thúc đạt 14/14. Chạy tuần tự, hoặc đặt output directory riêng nếu muốn chạy đồng thời.

## 2. Phát hiện cần xử lý

### P0 — Key mới dùng được, nhưng MiMo vượt deadline của ứng dụng _(lịch sử 21/09/2026; xem Cập nhật 22/09/2026 ở đầu)_

Cấu hình được nạp chọn **OpenCode Go / MiMo `mimo-v2.5`**. Ban đầu key cũ trả 401; người dùng xác nhận đã thu hồi và cung cấp key mới. Key mới đã lưu vào `.env` local, quyền file 0600; probe xác nhận process nạp đúng giá trị mới.

| Probe với key mới, chỉ dùng ảnh tổng hợp 640×360 | Kết quả |
|---|---|
| Adapter, ảnh `OFFICE 7`, kỳ vọng khớp `OFFICE 7`, deadline 10 giây | Timeout, **10,002 ms** |
| Adapter, ảnh `OFFICE 8`, kỳ vọng không khớp `OFFICE 7`, deadline 10 giây | Timeout, **10,003 ms** |
| `/replay` thật qua ASGI, route đã publish, ảnh office không phải lift origin | **503**, **10,019 ms** |
| Cùng adapter/prompt/schema, riêng probe chẩn đoán cho chờ tối đa 30 giây | **HTTP 200**, khớp đúng ảnh `OFFICE 7`, **11,727 ms** |

Kết luận: **auth OpenCode đã được giải quyết; latency vẫn là blocker thực tế.** Deadline ứng dụng vẫn là server 10 giây/client 12 giây; không tăng timeout production trong audit. Một kết quả synthetic đúng không đo độ chính xác tuyến thật và không đủ để tính p50 đáng tin cậy.

Kết quả đã làm sạch lưu local tại `data/runtime/audit-provider-smoke.json` và `data/runtime/audit-provider-extended-diagnostic.json`, đều bị Git bỏ qua. Không gửi ảnh/video thật trong workspace. Thời gian lỗi không phải latency nhận diện thành công.

Gemini hiện trả **401 / UNAUTHENTICATED** với credential có sẵn; chưa có cơ sở dùng làm phương án dự phòng. `/health` chỉ kiểm tra biến key có giá trị (`apps/server/navigation/main.py:120`); `vlm_configured=true` không đồng nghĩa provider hoạt động trong deadline.

**Cách hoàn tất:** restart server đang chạy để nạp key mới. Chốt chính sách latency bằng đo lường: ưu tiên model/cấu hình giữ đủ bằng chứng nhận diện và đáp ứng deadline; nếu tiếp tục MiMo, cho timeout server/client cấu hình được và thống nhất mức chờ chấp nhận được với team/người dùng. Có thể thử server 20 giây/client 25 giây trong một lần đo tiếp theo, nhưng đó chỉ là ứng viên cần đánh giá, không làm đạt mục tiêu p50 ≤5 giây. Origin gọi ba request tuần tự nên phải đo riêng tổng thời gian origin. Thêm chẩn đoán vận hành phân loại auth/quota/timeout, không ghi key, ảnh hoặc raw provider exception.

**Điều kiện đạt:** smoke positive/negative qua API thật hoàn tất ổn định trong deadline đã chọn; tiếp tục đạt yêu cầu ảnh đúng/ảnh sai ở mục 3. Công bố p50, cỡ mẫu và tỷ lệ timeout thực đo; không coi tăng timeout là giảm latency.

### P1 — Publish v2 nhưng ứng dụng vẫn chọn v1

`prepare` yêu cầu version mới khi sửa route (`apps/server/navigation/prepare.py:34`), nhưng `Store.list()` sắp xếp theo đường dẫn (`storage.py:18`) và UI luôn chọn `routes[0]` (`apps/web/src/App.tsx:103`).

**Đã tái hiện bằng dữ liệu tạm:** cùng tồn tại `lift-lobby-to-toilet-v1` và `lift-lobby-to-toilet-v2` thì danh sách bắt đầu bằng v1; frontend sẽ tiếp tục dùng v1. Điều này ảnh hưởng trực tiếp lần sửa chỉ đường sau field test.

**Cách hoàn tất:** chỉ định tường minh route đang dùng cho demo, ví dụ cấu hình active route ID; đồng bộ server, UI và E2E. Không cần xây màn hình quản lý nhiều tuyến cho Tier A. Giữ các bản cũ bất biến.

**Điều kiện đạt:** có v1 và v2 cùng lúc, chọn v2 thì UI, metadata, MP3 và `/replay` đều dùng v2; route ID không tồn tại phải báo rõ.

### P1 — Pipeline đánh giá ảnh khác replay thực tế _(đã sửa 22/09/2026)_

**Đã sửa:** `navigation.evaluate` giờ xoay ảnh theo EXIF, thu cạnh dài về ≤640 px và encode JPEG chất lượng 85 giống app web (`replay_jpeg` trong `evaluate.py`) trước khi gọi provider. Mô tả vấn đề ban đầu giữ bên dưới để đối chiếu.

`navigation.evaluate` gửi ảnh đầu vào với nguyên kích thước. Replay trên web thu nhỏ cạnh dài xuống tối đa 640 px trước khi encode; API cũng giới hạn 640 px.

**Đã tái hiện local, không gọi mạng:** ảnh tổng hợp 1280×960 sau đường xử lý dùng bởi evaluation vẫn là 1280×960. Kết quả đánh giá ảnh lớn có thể không đại diện khả năng đọc biển nhỏ trong ảnh replay.

**Cách hoàn tất:** chuẩn hóa hướng ảnh và kích thước ≤640, dùng JPEG chất lượng tương đương web; ghi kích thước cùng kết quả. Đánh giá cuối nên có cả ảnh được chụp qua pipeline của trình duyệt, vì encoder Python và web vẫn có khác biệt.

**Điều kiện đạt:** ảnh gửi đi trong mọi case ≤640; bộ ảnh đánh giá phản ánh khoảng cách, góc cầm điện thoại và ánh sáng thực tế, không chỉ ảnh cận cảnh đẹp.

### P1 — Metrics chưa đủ để tuyên bố thành công thực tế

- `App.tsx:72` ghi `arrival` cho cả đích được xác minh và đích bị bỏ qua. `scripts/metrics.py:22` đếm cả hai vào `completions`.
- **Đã tái hiện:** session tổng hợp bỏ qua cả hai checkpoint vẫn cho `completions=1`, `visual_matches=0`, `manual_overrides=2`. Đây là hoàn thành luồng UI; không được dùng như một lượt đi được AI xác minh thành công.
- `App.tsx:239–242` chỉ ghi thời gian `visual_check` khi xử lý thành công; lỗi/timeout không có event thời gian tương ứng. Hiện không đủ dữ liệu để báo tỷ lệ lỗi và thời gian chờ toàn bộ lượt kiểm tra.
- Nhãn `field_route` chỉ suy ra từ `sample=false` của **route**, không chứng minh session dùng camera/AI thật. Mock trên route đã duyệt cũng có thể rơi vào nhóm này.
- File export chưa có route ID, provider/model, session ID hoặc chế độ mock/field (`apps/web/src/metrics.ts`).

**Cách hoàn tất:** bổ sung provenance của session, kết quả từng attempt gồm match/mismatch/error/timeout/cancel, thời gian lỗi, trạng thái arrival và số checkpoint đã xác minh. Báo riêng: kết thúc luồng, đến đích được xác minh, toàn tuyến được xác minh, manual override, error rate; tách thời gian origin với checkpoint. Thêm positive/false-negative và số negative trả lời hợp lệ vào summary evaluation, giữ errors riêng.

**Điều kiện đạt:** session bỏ qua hai mốc không được báo là thành công xác minh; mock không được gộp với field; mọi timeout có số liệu riêng. Chuẩn hóa trước khi đi thử để tránh phải thu lại dữ liệu.

## 3. Phần chưa có bằng chứng hoàn tất

| Hạng mục | Việc cần làm và điều kiện chốt |
|---|---|
| Độ chính xác AI | Tối thiểu 3 ảnh mới cho mỗi checkpoint; origin đúng/sai; ít nhất 10 case âm tính gồm sai tầng, biển giống, ảnh mờ và thiếu pictogram/đặc điểm cửa. Gắn ground truth thủ công; báo TP/FN/FP/TN, errors và cỡ mẫu. Nếu có false positive thì sửa điều kiện nhận diện/chọn mốc rồi đánh giá lại; zero FP trên bộ nhỏ vẫn không chứng minh an toàn tổng quát. |
| Đi tuyến thật | Ít nhất 3 lượt origin → s1 → s2 → arrival, ghi số mốc xác minh, override, thất bại và p50 từ lúc bấm đến kết quả. Mục tiêu kế hoạch p50 checkpoint ≤5 giây; công bố số thực đo nếu chưa đạt. |
| iPhone và accessibility | HTTPS trên LAN, Safari và Add to Home Screen, camera sau, audio bị chặn, tắt/mở app voice, VoiceOver, background/reload. Windows + NVDA thực hiện bằng bàn phím; ghi màn hình có tiếng. |
| Hướng dẫn dùng được bằng tai | `currentAudio()` chưa có audio cho hướng dẫn origin ban đầu hoặc arrival chưa xác minh (`App.tsx:135`). Kiểm tra hành trình thực với app voice và với screen reader để chốt bổ sung cue nào. Đặc biệt thử xem người khiếm thị có tự hướng camera vào mốc và biết lúc cần bấm Check được không. |
| Teach và công sức người duyệt | Route đã publish hiện không có `teach-log.json`; log còn lại nằm ở draft chưa duyệt, không thay thế bằng chứng teach của bản công bố. Chạy một lượt ingest → sửa transcript/metadata → duyệt → publish → replay đúng version; ghi cả thời gian thao tác và thời gian chờ. |
| Phản hồi người dùng | Chưa có bằng chứng phỏng vấn/usability test trong các tài liệu bàn giao đã đọc. Theo chiến lược repo, ưu tiên ít nhất 2 người khiếm thị đang đi làm; ghi khó khăn, thay đổi sau feedback và tác động tới onboarding. Không suy diễn walkthrough của người sáng mắt thành validation với người dùng đích. |
| Deck/video | Không thấy deliverable cuối trong workspace đã kiểm tra; media bị gitignore và có thể ở ngoài repo. Cần xác minh riêng. Deck `.pptx` tiếng Anh theo template, slide 1–6 giữ nguyên thứ tự; tên `OFFIXED_PROJECT TITLE.pptx`. Video tiếng Anh dưới 5 phút, MP4/MOV, 16:9, slides rõ xuyên suốt. |

Giữ tuyên bố accessibility là **mục tiêu/phạm vi đã test**, không chứng nhận. Các yêu cầu nộp bài theo tài liệu canonical `docs/ADC_Hackathon_2026_Thong_tin_cuoc_thi.md`: nộp tối 22/09; hạn tuyệt đối **07:00 ngày 23/09/2026**.

## 4. Thứ tự hoàn tất đề xuất cho ba người

1. **Chặn lỗi trước khi thu evidence:** người phụ trách backend xử lý latency/deadline, chốt provider/model, sửa chọn active route; người frontend sửa metrics và bổ sung kiểm tra hồi quy có ý nghĩa; người còn lại chuẩn bị ảnh có ground truth, thiết bị/consent và deck template. Pipeline evaluate đã được chuẩn hóa giống replay (22/09). Auth OpenCode đã qua với key mới.
2. **Có một lượt tích hợp thật sớm nhất:** chạy HTTPS → camera iPhone → provider thật → hai checkpoint → arrival. Nếu chưa xong, tập trung vào nguyên nhân đang chặn lượt này.
3. **Thu evidence trong ngày 22/09:** ảnh đánh giá, ba lượt đi, NVDA/VoiceOver và phản hồi người dùng. Duyệt lại chỉ đường nếu cách nói theo dấu hiệu thị giác chưa dùng được với người nghe; publish version mới và kiểm tra UI dùng đúng version.
4. **Chốt trước 15:00 ngày 22/09:** route, provider/model, code, số liệu và video demo. Chuẩn bị bản quay thành công thật làm phương án dự phòng; ghi đúng pre-recorded/mock nếu sử dụng. Không đổi model sau khi đã thu số liệu mà bỏ qua đánh giá lại.
5. **Hoàn thiện bài nộp tối 22/09:** vấn đề onboarding, quy trình đồng nghiệp dạy và duyệt tuyến, evidence AI và accessibility, feedback, giới hạn, credit Clew, deck/video đúng định dạng. Lưu xác nhận nộp thành công.

Sau hackathon mới ưu tiên sản phẩm dùng rộng hơn: UX cho người dạy/duyệt tuyến, vòng đời version và chia sẻ route, vận hành provider, deployment và quản trị dữ liệu của tổ chức. Hiện lựa chọn có hiệu quả nhất là hoàn tất một tuyến thật, đo trung thực và có người dùng đích kiểm chứng.
