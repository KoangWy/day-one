# Tiếp tục chuyển demo sang DeepSeek — 22/09/2026

## Phạm vi đã duyệt

Khôi phục từ session **Xác minh và đề xuất hoàn thiện** (`01a0c4d7-5d76-75b3-a3da-bfc88b7de625`). Quyết định cuối của người dùng: dùng **DeepSeek V4.1 Flash qua OpenCode Go** cho demo/video hackathon, hoàn tất thay đổi và báo kết quả. Giữ tuyến `lift-lobby-to-toilet-v1`, hai checkpoint; không mở rộng sang toàn bộ backlog của audit.

Áp dụng kế hoạch Tier A đã có tại `docs/brainstorm/specs/2026-09-21-unified-day1-nav-plan.md`, với thay đổi tuyến đã được duyệt và quyết định provider mới. Giữ hợp đồng `/replay`, xác nhận của người dùng, kiểm tra bằng chứng, che mặt, timeout hiện tại và không tự đổi provider. Không nới điều kiện nhận diện để ảnh mờ vượt kiểm tra.

## Baseline và phân công

- Nhánh `main`, HEAD `45e961d2803ce569e526ceb33170aa097b894fe8`; đã chạy `git status` và `git pull origin main`, không có cập nhật/conflict.
- Thay đổi kế thừa: `.env.example`, `README.md`, `apps/server/navigation/provider.py`, `apps/server/tests/test_provider.py`, `docs/DEMO_HANDOFF.md`, `docs/PROTOTYPE_RUNBOOK.md`; audit `docs/PROTOTYPE_AUDIT_2026-09-21.md` chưa được Git theo dõi.
- Bản đối chiếu cục bộ không chứa `.env`: `/var/folders/1t/mmb2pzr53dl5dj3c7g_cfsmc0000gn/T/offixed-deepseek-resume-1n6l9dxv`.
- Astra giữ phạm vi, quyết định kiến trúc, checkpoint này và nghiệm thu. Một worker `/root/finish_deepseek_demo`, role `astra_flash_builder`, nhận phần rà soát/sửa adapter, kiểm thử, cập nhật tài liệu và `FLASH_REPORT.md`.
- Doctor: cấu hình root `gpt-6-astra`, worker `opencode-go/deepseek-v4.1-flash`, provider `opencode Go`, effort `high`, trạng thái `static-ready`. Đây chưa phải bằng chứng inference thực tế của worker.

## Các bước và điều kiện nghiệm thu

1. Hoàn tất adapter DeepSeek và regression tests: JSON mode tương thích, validation chặt, lỗi provider được làm sạch; giữ đường Gemini/MiMo.
2. Cập nhật handoff/audit/verification theo artifacts đã đo; phân biệt API thật trên frame cũ với mock E2E và đi tuyến thực tế. Giữ false negative ở mốc văn phòng trong kết luận.
3. Kiểm tra cục bộ phù hợp, Playwright chạy tuần tự; Astra đối chiếu patch và evidence trong một lượt review.

Phạm vi triển khai ban đầu: không gọi thêm inference để lặp lại bằng chứng đã có; không sửa route đã publish, frontend, metrics/evaluation, `.env`, cấu hình router hoặc vendored skills; không tự commit/push/deploy. Sau khi nghiệm thu và bổ sung gói bàn giao, người dùng đã yêu cầu commit và push lên `main` (xem cập nhật cuối).

## Evidence kế thừa và giới hạn

`data/runtime/deepseek-demo-smoke-2026-09-22.json`: 6/6 HTTP 200, 5/6 ca đúng, p50 API 2.365 giây; mốc văn phòng bị false negative, ba ca âm tính bị từ chối đúng. `data/runtime/deepseek-office-diagnostic-2026-09-22.json` ghi nhận vấn đề đọc chữ biển. Hai artifact này ban đầu bị Git bỏ qua; theo yêu cầu bàn giao tiếp theo ngày 22/09, chúng đã được đưa vào danh sách ngoại lệ để chia sẻ cùng repo.

Đây là kiểm tra trên frame có sẵn, không phải một lượt đi tuyến mới. Chưa có bằng chứng hoàn tất tuyến thật trên thiết bị; cần khung hình văn phòng rõ hơn. Các lỗi active route, evaluation và metrics trong audit còn là backlog ngoài phạm vi tiếp tục này.

## Nghiệm thu và trạng thái tiếp tục

**Astra đã nghiệm thu phạm vi chuyển demo sang DeepSeek ngày 22/09/2026.** Đã đọc patch so với bản đối chiếu có sẵn và patch kế thừa, kiểm tra yêu cầu lẫn chất lượng/xử lý lỗi, đối chiếu artifacts AI và log kiểm thử. Một vòng chỉnh tài liệu đã hoàn tất để phân biệt rõ kết quả hiện tại với lịch sử MiMo/Windows. Không cần chạy lại toàn bộ test sau các chỉnh sửa văn bản.

- Worker bổ sung xử lý phản hồi HTTP 200 có `choices[0]` sai cấu trúc: trả lỗi provider đã làm sạch; không làm rò exception hoặc tự retry. Bổ sung bảy case response lỗi và một test tên/nhánh model.
- Lượt kiểm tra cục bộ trong phiên này: **51 backend**, lint sạch, **8 frontend**, build đạt, **14 mock E2E**, **4 real-build E2E**, `git diff --check` sạch. Logs ở `data/runtime/flash-finalization-logs/`; real-build vẫn mock `/replay`.
- Metadata child `01a0c6e8-0366-7200-83c3-0b5ccb32d6d5` ghi role `astra_flash_builder`, model `opencode-go/deepseek-v4.1-flash`. Usage log router trong lượt chạy ghi model đó, provider `opencode-go`, HTTP 200, effort `high`; root vẫn Astra. Log usage không có thread ID để quy chiếu chi phí riêng cho child, nên không tuyên bố mức tiết kiệm token/chi phí.
- Worker đã kết thúc và được gọi `interrupt_agent` sau mỗi completion. Báo cáo thực thi: `FLASH_REPORT.md`.
- Tại lúc nghiệm thu, thay đổi còn trong working tree, chưa commit/push. `.env` và nội dung tuyến đã publish không bị sửa trong phiên tiếp tục này. Không có inference mới của ứng dụng.

Không còn việc code trong gói đã duyệt. Bước tiếp theo để quay demo: restart server theo runbook, lấy khung hình mốc văn phòng rõ hơn và thử trọn tuyến trên thiết bị thật; ghi đúng manual override nếu có. Không suy diễn test tự động hoặc 5/6 case trên frame cũ thành bằng chứng tuyến thật đã hoàn tất. Active route, evaluation, metrics và kiểm chứng người dùng/thiết bị vẫn là các mục riêng chưa hoàn thành.

## Bổ sung bàn giao qua Git — 22/09/2026

Theo yêu cầu tiếp theo của người dùng, `.gitignore` cho phép đúng 15 file: `route.json`, `published.json`, 11 MP3 tổng hợp của tuyến demo và hai JSON kết quả DeepSeek. Nội dung các artifact được giữ nguyên; không gọi lại TTS/VLM. README/runbook/handoff được cập nhật để máy mới dùng sẵn tuyến khi clone/pull. Video/frame nguồn, draft, log, secrets và runtime ngoài danh sách tiếp tục bị bỏ qua.

Người dùng đã yêu cầu commit và push toàn bộ phần bàn giao lên `main`. Code, tài liệu, audit/checkpoint và 15 artifact demo được đưa vào cùng commit `Finalize DeepSeek demo and share reviewed demo assets`; xem Git history để lấy commit ID. Đã kiểm tra đúng 15 artifact được Git nhận, 12 đường dẫn nhạy cảm/ngoài phạm vi vẫn bị bỏ qua, route/review khớp fixture đã duyệt và đủ 11 audio theo metadata. Các bộ test đã đạt trước đó; các thay đổi sau kiểm thử chỉ là tài liệu và quy tắc chia sẻ artifact.
