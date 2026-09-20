# OFFIXED — 60 Ý TƯỞNG CHO ADC HACKATHON 2026
### Nhóm khuyết tật: Visual Impairment (khiếm thị) · Chủ đề: AI & Employability

*Tổng hợp ngày 20/09/2026 — chạy song song 3 luồng nghiên cứu (Attitudinal & Communication · Technological · Architectural/Industrial), ~58 truy vấn nghiên cứu, nguồn dẫn ở cuối mỗi phần.*

---

## 0. BỐN KẾT LUẬN CHIẾN LƯỢC (đọc trước khi chọn ý tưởng)

**0.1 — Đất trống nằm ở "sửa nơi làm việc", không phải "sửa người khiếm thị".**
Thị trường công cụ mô tả màn hình/ảnh cho người khiếm thị đã bão hoà: Be My Eyes + **Be My Eyes Workplace (ra mắt 11/02/2026 — đối thủ trực diện nhất)**, Seeing AI, Envision, Google Lookout, OrCam, Ray-Ban Meta, ChatGPT voice, Copilot auto alt-text. Tất cả đều là **thông dịch một chiều ở phía người nhận**. Nếu Offixed làm thêm một app mô tả ảnh nữa là chết. Ba khoảng đất còn trống: **(1) hành vi của tổ chức/đồng nghiệp, (2) tiếng Việt + phần mềm Việt + giá SME Việt, (3) sửa từ nguồn thay vì phiên dịch mãi mãi.**

**0.2 — Đừng làm "VR bịt mắt cho quản lý thấu cảm".** Đây là ý tưởng đầu tiên ai cũng nghĩ ra, và **nghiên cứu chứng minh nó phản tác dụng**: người tham gia mô phỏng thấy bối rối, bất lực, và **khó chịu hơn khi tương tác với người khuyết tật sau đó** (NFB — *"The Perils of Playing Blind"*). Cái thực sự hiệu quả là **thành thạo kỹ năng** và **tương tác có ý nghĩa với người khuyết tật thật**. Nói câu này trên sân khấu là đánh bại mọi đội làm VR empathy.

**0.3 — Đừng hứa "AI làm hộ tất cả".** Nghiên cứu EMNLP 2026 (arXiv 2609.00524; diary study 3 tuần, 8 người mù, 1.258 lệnh, 12 ứng dụng desktop): computer-use agent tốt nhất chỉ **thành công 52,5%**. Kết luận của chính nhóm tác giả: người lao động khiếm thị cần **cộng tác người–AI, không phải tự động hoá hoàn toàn**. Hứa khiêm tốn + có bằng chứng = ghi điểm Feasibility.

**0.4 — AI đang làm rào cản TĂNG, không giảm.** WebAIM Million 2026: **95,9% trang có lỗi WCAG** (tăng từ 94,8%), **56,1 lỗi/trang (+10,1%)**, **53,1% ảnh thiếu alt text** — **năm đầu tiên từ 2020 chỉ số đi lùi**, vì AI sinh nội dung nhanh hơn tốc độ làm nó accessible. Và AI code completion dạng "ghost text" xám khiến lập trình **kém accessible hơn trước**. Đây là luận điểm mở deck rất mạnh.

---

## 1. KHO ĐẠN SỐ LIỆU CHO PITCH (dùng chung cho mọi ý tưởng)

| Con số | Ý nghĩa | Nguồn |
|---|---|---|
| **~94%** người mù ở Việt Nam thất nghiệp | Con số mở slide mạnh nhất | NV Access × Sao Mai Center |
| **Việt Nam mất ~3% GDP** vì loại trừ NKT khỏi thị trường lao động | Biến vấn đề đạo đức thành vấn đề kinh tế | ILO |
| Tỷ lệ tham gia lao động của NKT VN **giảm 31,7% (2016) → 23,9% (2023)** | Đang tụt lại, không phải đang tiến lên | Tạp chí Kinh tế Tài chính |
| **82,3%** nhà tuyển dụng **không biết** người khiếm thị sẽ làm việc bằng cách nào | Vấn đề là **thiếu hình dung**, không phải thiếu thiện chí | Frontiers 2024 |
| **94%** lo bộ phận hành chính không biết giao tiếp thế nào; **81%** lo đồng nghiệp gặp vấn đề giao tiếp | Nỗi sợ số 1 là **GIAO TIẾP**, không phải công nghệ | Frontiers 2024 |
| Tiếp xúc với chuyên gia phục hồi chức năng nghề nghiệp → **odds tuyển dụng cao gấp 24,1 lần** | Chỉ ra đúng đòn bẩy cần thiết kế | Frontiers 2024 |
| **67% PDF** không đọc được một phần hoặc hoàn toàn | Rào cản hằng ngày của kế toán/hành chính khiếm thị | Equidox × NFB |
| **95,9%** trang web có lỗi WCAG · **83,9%** lỗi low contrast | Quy mô vấn đề + nhóm low vision bị bỏ quên | WebAIM Million 2026 |
| Người dùng screen reader thạo nghe **300–600 wpm** (gấp 2–2,5× đọc mắt) | **Lợi thế** đo được, không phải an ủi | Nghiên cứu AT |
| **~8% nam giới** mù màu đỏ-lục | Nhóm đông nhất trong "visual impairment" nhưng ít ai làm | — |
| Người mới cần **3–6 tháng** (có nền: 3–4 tuần) để thạo một tuyến di chuyển | Lý do ngầm khiến HR ngại tuyển | WMU |
| Doanh nghiệp có **≥30% lao động là NKT được miễn thuế TNDN** (hiệu lực 01/10/2025) | Hầu hết HR SME Việt **không biết** → cơ hội sản phẩm | Luật NKT 2010 + Luật Thuế TNDN 2025 |
| **QCVN 10:2014/BXD** hiệu lực từ 1/7/2015 nhưng tactile paving TP.HCM bị tủ điện, xe máy, hàng quán chặn | *"Việt Nam không thiếu quy chuẩn — thiếu thực thi"* | Tuổi Trẻ |
| **Metro số 1** có tactile paving + Braille + thang máy, nhưng nối với vỉa hè không tiếp cận | **"Ốc đảo tiếp cận"** — thiếu lớp kết nối | — |

**Lợi thế sân nhà phải khai thác ngay Ngày 1:** **Sao Mai Center** (Q. Tân Phú, TP.HCM — cách RMIT Nam Sài Gòn ~40 phút): 400+ người dùng NVDA tiếng Việt, đã đưa 32 người vào việc làm, **đang tuyển 17 nhân sự khiếm thị**. Một buổi test 45 phút + một clip 20 giây người dùng thật nói về nỗi đau của họ = gần như chắc điểm tối đa tiêu chí **User-Centered Design**. Hầu hết các đội sẽ bỏ qua điều này.

---

## 2. MỤC LỤC 60 Ý TƯỞNG

### HƯỚNG 1 — ATTITUDINAL & COMMUNICATION (20 ý tưởng)
*Thái độ, định kiến, chính sách HR, tuyển dụng, văn hoá và hành vi tổ chức.*

| # | Tên | Một dòng |
|---|---|---|
| A1 | **EchoMeet** | Không ai phải nói "như các bạn thấy" nữa — nhắc hành vi họp hoà nhập theo thời gian thực |
| A2 | **Minh — Đồng nghiệp ảo** | Tập nói chuyện với người khiếm thị, trước khi nói sai với người thật |
| A3 | **The Invisible Hour / Access Tax Meter** | Đo "thuế truy cập": công ty đang bắt nhân viên khiếm thị làm không công ~6 giờ/tuần |
| A4 | **VoiceProof / Blind Audition** | Tuyển bằng năng lực nghe được, không bằng ánh mắt nhìn vào camera |
| A5 | **Team Access Score** | Không chấm điểm người khiếm thị — chấm điểm cái đội xung quanh họ |
| A6 | **First Voice** | Ngày đầu đi làm, không cần ai dắt tay: onboarding bằng giọng nói |
| B1 | **HireReady — Công ty bị phỏng vấn** | Trước khi bạn chấm ứng viên khiếm thị, để chúng tôi chấm bạn (agent tự test ATS) |
| B2 | **AdvocateBot / Trợ lý đòi quyền** | Đừng bắt người khiếm thị phải đi xin tử tế mỗi ngày — AI gánh việc tự vận động |
| B3 | **FairTask / Chống bỏ đói nhiệm vụ** | Không ai bị tước việc khó một cách tử tế — phát hiện "task starvation" |
| B4 | **Straight Talk / Nói thẳng** | Sự tử tế đang giết chết sự nghiệp của họ — sửa phản hồi hiệu suất bị lệch |
| B5 | **Access Passport** | Xin điều chỉnh một lần, dùng cả đời đi làm |
| B6 | **EarFirst / Audio song sinh** | Nếu ai cũng nghe tài liệu, thì không ai bị bỏ lại |
| B7 | **Not Your Inspiration** | Công ty bạn đang khen họ, hay đang hạ thấp họ? |
| C1 | **JD Doctor VN** | Sửa 1 dòng trong tin tuyển dụng, mở ra 8 triệu ứng viên |
| C2 | **HR Law Copilot VN** | Tuyển 30% lao động khuyết tật được miễn thuế TNDN — bạn biết chưa? (RAG pháp lý) |
| C3 | **Sếp 5 Phút** | Mỗi tuần 5 phút huấn luyện quản lý, hiệu quả giữ được 4 tháng |
| C4 | **AltBot VN** | Mô tả ảnh tiếng Việt, ngay trong Zalo và Google Chat |
| C5 | **Buddy Match** | Thứ duy nhất được chứng minh hiệu quả: quen một người thật |
| C6 | **Meeting Norms Bot** | Quy tắc họp hoà nhập, tự chèn vào mọi lời mời |
| C7 | **Skill Signal / Chợ kỹ năng ngược** | Đừng hỏi người khiếm thị làm được gì — hỏi công việc nào đã sẵn sàng |

### HƯỚNG 2 — TECHNOLOGICAL (22 ý tưởng)
*AI, tự động hoá, remote/hybrid work accessibility, công cụ làm việc hằng ngày.*

| # | Tên | Một dòng |
|---|---|---|
| A1 | **EchoSheet** | Nghe được cả bảng tính, không chỉ từng ô (merged cell, màu, sonification) |
| A2 | **ChartLens** | Mọi biểu đồ đều có phiên bản nghe được — và nó nói sự thật (có nhãn độ tin cậy) |
| A3 | **MeetMate VN** | Nghe được cả cái người ta đang chỉ tay + tín hiệu phi ngôn ngữ |
| A4 | **DeckTalk** | Người khiếm thị không chỉ nghe slide — họ tự làm ra slide đẹp |
| A5 | **BoardEar** | Bảng Kanban (Jira/Trello) biến thành đài phát thanh dự án |
| A6 | **DesignEar** | Người khiếm thị làm Design QA — và làm tốt hơn |
| A7 | **TouchChart** | Biểu đồ in ra sờ được, trong 60 giây, ngay tại văn phòng |
| B1 | **BlindSpot** | Doanh nghiệp tuyển bạn vì bạn phát hiện được thứ họ không thấy (accessibility auditor) |
| B2 | **EarSense QA** | Test phần mềm bằng tai — bắt lỗi mà mắt bỏ qua |
| B3 | **AudioFirst Workspace** | Công cụ làm cho người mù, hoá ra ai cũng muốn dùng (curb-cut effect) |
| B4 | **FixAtSource** | Chặn tài liệu xấu ngay từ người gửi, thay vì phiên dịch mãi mãi |
| B5 | **ProxyHands** | AI là đôi tay. Bạn vẫn là người ra quyết định |
| B6 | **DeepFocus** | Họ nghe 500 từ/phút — hãy trả tiền cho tốc độ đó |
| B7 | **SightShare** | Người khiếm thị dạy cả công ty cách làm tài liệu tử tế |
| B8 | **KPI Radio** | Doanh nghiệp nghe báo cáo, không nhìn báo cáo |
| C1 | **AltBot VN** | Gửi ảnh vào chat, 5 giây sau có mô tả tiếng Việt |
| C2 | **TabTalk** | Hỏi bất kỳ trang web/CRM nội bộ nào bằng tiếng Việt |
| C3 | **CallSight** | Tổng đài viên khiếm thị nghe được cả màn hình lẫn khách hàng |
| C4 | **DocPipe VN** | Mọi PDF scan tiếng Việt trở thành tài liệu đọc được, tự động |
| C5 | **CodeEar** | IDE nói được cấu trúc, và AI không còn thì thầm sau lưng bạn |
| C6 | **ColorGuard** | Màu sắc trong công việc phải nói được thành lời (nhóm mù màu/low vision) |
| C7 | **HireFair** | Rào cản lớn nhất không phải công việc — mà là vòng tuyển dụng |
| C8 | **ZaloWork Reader** | Vì ở Việt Nam, công việc chạy trên Zalo |

### HƯỚNG 3 — ARCHITECTURAL / INDUSTRIAL (18 ý tưởng)
*Không gian, sản phẩm vật lý, wayfinding, an toàn, bền vững.*

| # | Tên | Một dòng |
|---|---|---|
| A1 | **SoundMark** | Mỗi căn phòng có một giọng riêng (âm học làm bản đồ) |
| A2 | **ClearPath** | Camera an ninh của toà nhà đã thấy cái thùng carton đó — giờ nó sẽ nói |
| A3 | **Aura Room** | Trong phòng họp, ai đang nói và họ ngồi ở đâu |
| A4 | **SafeCell** | Vùng an toàn biết trước cú va chạm (nhà máy) |
| A5 | **EvacTwin** | Khi còi báo cháy kêu, không ai bị bỏ lại trong bóng tối |
| A6 | **TouchLine** | Một đường ray bạn đọc bằng tay (trail rail kiểu Hazelwood School) |
| B1 | **RouteCoach** | Huấn luyện viên định hướng trong túi quần — rút 3–4 tuần làm quen xuống vài ngày |
| B2 | **ScentMap & WindMark** | Định hướng bằng mũi và bằng da |
| B3 | **EarQC** | Đôi tai tốt nhất trong nhà máy thuộc về người không nhìn |
| B4 | **FeelCheck** | Kiểm toán viên tiếp cận: nghề mới cho người khiếm thị |
| B5 | **GlareGuard** | Văn phòng tự điều chỉnh ánh sáng cho từng đôi mắt (low vision/nhạy sáng) |
| B6 | **DeskPulse** | Hot-desk mà người mù vẫn tìm được bàn của mình |
| C1 | **TagPath** | Bản đồ toà nhà in trên giấy A4, 2.000đ/điểm (NaviLens-style) |
| C2 | **LiftEar** | Chiếc hộp 300.000đ khiến mọi thang máy cũ biết nói |
| C3 | **PantrySkin** | Lớp da xúc giác cho mọi thiết bị cảm ứng trong văn phòng |
| C4 | **CaneClip** | Nâng cấp cây gậy trắng đang có, giá 400.000đ |
| C5 | **DropPoint** | Điểm đón xe có tên, có mã, có giọng nói |
| C6 | **TactileKit Vietnam** | Bộ kit tiếp cận: 5 triệu đồng, lắp trong một tuần, làm từ rác |

---

## 3. TOP 5 CỦA TỪNG HƯỚNG

| Hạng | Hướng 1 — Attitudinal | Hướng 2 — Technological | Hướng 3 — Architectural |
|---|---|---|---|
| 1 | **AdvocateBot** (19/20) | **ChartLens** (19/20) | **RouteCoach** (20/20) |
| 2 | **HireReady** (18,5) | **EchoSheet** (19/20) | **FeelCheck** (19/20) |
| 3 | **Minh — Đồng nghiệp ảo** (18,5) | **FixAtSource** (18/20) | **ClearPath** (19/20) |
| 4 | **EchoMeet** (18,5) | **BlindSpot** (18/20) | **DeskPulse** (18/20) |
| 5 | **Skill Signal** (17/20) | **MeetMate VN** (18/20) | **SoundMark** (18/20) |

---

## 4. BA GÓI GIẢI PHÁP GỢI Ý (nếu muốn ghép nhiều ý tưởng thành 1 sản phẩm)

Cả ba luồng độc lập đều đi tới cùng một kết luận: **đừng pitch một tính năng đơn lẻ — giám khảo nhớ hệ thống, không nhớ tính năng.** Ba cách đóng gói:

**GÓI A — "Chúng tôi không sửa người khiếm thị. Chúng tôi sửa nơi làm việc."** *(mạnh nhất về Innovation & Impact)*
HireReady (chấm điểm công ty, không chấm ứng viên) → AdvocateBot (AI gánh việc đòi quyền) → Access Tax Meter (biến bất công thành con số tài chính cho lãnh đạo). Ba module nối thành vòng lặp khép kín: **đo rào cản → hành động → chứng minh tiết kiệm → lãnh đạo chi tiền → sửa hệ thống.** Đây là thứ biến demo thành sản phẩm có mô hình kinh doanh.

**GÓI B — "Bộ công cụ AI cho nơi làm việc không cần nhìn"** *(mạnh nhất về Utilization of AI)*
Lõi làm thật: **EchoSheet + ChartLens** (chung engine sonification/TTS/narrative → chi phí kỹ thuật của một module nhưng kể được chuyện của hai). Module khác biệt: **FixAtSource** — trả lời câu "khác gì Be My Eyes Workplace?" bằng một câu: *"Họ dịch tài liệu xấu. Chúng tôi xoá tài liệu xấu."* Tầm nhìn chỉ để trên slide: **BlindSpot** — từ "được trợ giúp" sang "có nghề có vị thế".

**GÓI C — "Ngày làm việc đầu tiên"** *(mạnh nhất về cảm xúc & video)*
Kể theo dòng thời gian một ngày: 07:30 DropPoint (ra khỏi nhà) → 08:15 RouteCoach + TagPath + LiftEar (tự đi tới bàn ngày đầu tiên, không cần ai dẫn) → 09:00 DeskPulse (tìm bàn) → cả ngày ClearPath + SoundMark → 14:00 Aura Room (họp) → bất cứ lúc nào EvacTwin (khẩn cấp). Nền tảng kinh doanh: FeelCheck + TactileKit.

---

## 5. BA CÂU HỎI GIÁM KHẢO CHẮC CHẮN HỎI — VÀ CÂU TRẢ LỜI

1. **"AI mô tả sai số liệu thì sao?"** → *"Chúng tôi không để AI nhìn số. Số lấy từ API. AI chỉ diễn giải, và mọi câu trả lời đều kèm địa chỉ ô để người dùng tự kiểm chứng."* (AFB gọi rủi ro này là **"illusion of access"** — ảo giác về sự tiếp cận: người dùng không thể tự kiểm chứng nên tin luôn.)
2. **"Khác gì Be My Eyes Workplace ra mắt 02/2026?"** → *"Ba điều: tiếng Việt và phần mềm Việt; đọc ngữ nghĩa dữ liệu chứ không mô tả ảnh màn hình; và sửa từ nguồn thay vì phiên dịch mãi mãi."*
3. **"AI agent làm thay được hết không?"** → *"Không, và chúng tôi không hứa thế. EMNLP 2026: agent tốt nhất chỉ đạt 52,5% trên tác vụ desktop của người dùng mù. Chúng tôi thiết kế theo hướng cộng tác: AI làm thao tác, con người giữ quyền quyết định."*

**Bẫy tự sát cần tránh:** làm sản phẩm accessibility mà chính prototype của mình không accessible. Phải test bằng **NVDA thật** (miễn phí, có giọng Việt), quay màn hình, và ghi trên slide: **đạt WCAG 2.2 AA / ISO/IEC 40500:2025**.

**Lưu ý trùng tên:** "AltBot VN" xuất hiện ở cả Hướng 1 (C4) và Hướng 2 (C1) — cùng một ý tưởng được hai luồng độc lập tìm ra. Tín hiệu cho thấy nhu cầu rất rõ ràng, nhưng cũng là ý tưởng dễ bị nhiều đội khác làm trùng.

---
---

Đã xong phần nghiên cứu (12 truy vấn + 4 lần đọc nguồn gốc). Dưới đây là toàn bộ kết quả.

---

# HƯỚNG 1: ATTITUDINAL & COMMUNICATION — Nghiên cứu & 20 ý tưởng cho Offixed

## PHẦN I — NỀN TẢNG NGHIÊN CỨU (dùng làm "đạn" cho pitch deck)

### 1.1. Rào cản thái độ: con số để đập vào slide đầu tiên

**Thái độ tường minh của nhà tuyển dụng là "trung tính đến tiêu cực", nhưng thái độ NGẦM thì tiêu cực mạnh.** Tổng quan hệ thống 2024 (Frontiers in Rehabilitation Sciences) cho thấy nhà tuyển dụng có "liên tưởng tự động mạnh" giữa *năng lực = người sáng mắt* và *thiếu năng lực = người mù*. Đây là mấu chốt: **không thể sửa bằng cách bắt người ta ký cam kết DEI — phải sửa bằng trải nghiệm và thói quen hằng ngày.**

Các con số đáng giá nhất:
- Tỷ lệ có việc làm của người khiếm thị (UK): **42,4%** vs **82,5%** người không khuyết tật. Người khiếm thị thua cả người khiếm thính (67,7%) và người khuyết tật tay (60%) → **khiếm thị là nhóm bị loại trừ nặng nhất về việc làm.**
- **82,3%** nhà tuyển dụng *không biết* người khiếm thị sẽ làm các đầu việc trong JD bằng cách nào.
- **81%** lo "đồng nghiệp sẽ gặp vấn đề giao tiếp"; **94%** lo bộ phận hành chính không biết giao tiếp thế nào → **nỗi sợ số 1 không phải công nghệ, mà là GIAO TIẾP.**
- **74,8%** phản đối tuyển toàn thời gian (chỉ chấp nhận bán thời gian).
- Gần một nửa hiring manager nói "công ty tôi có rất ít vị trí người mù làm được", và phần lớn nghĩ họ chỉ hợp làm **chăm sóc khách hàng**; đã tuyển rồi thì **không coi là ứng viên cho thăng tiến** (NFB/AFB).
- Khuôn mẫu "**high warmth, low competence**": quản lý *quý* người khuyết tật nhưng *không thấy họ đáng tuyển*.

**Yếu tố nào THỰC SỰ thay đổi thái độ** (đây là kim chỉ nam thiết kế sản phẩm):
| Can thiệp | Hiệu ứng |
|---|---|
| Từng tuyển người khiếm thị trước đó | Yếu tố dự báo mạnh nhất |
| Có liên hệ với chuyên gia phục hồi chức năng nghề nghiệp | **Odds cao gấp 24,1 lần** |
| Công ty có chính sách tuyển dụng khuyết tật thành văn | **Gấp 3,80 lần** (mạnh hơn ở SME) |
| Có quen biết cá nhân một người khiếm thị | **Gấp 3,37 lần** |
| Can thiệp giáo dục chỉ **1 giờ** | Cải thiện thái độ + ý định tuyển, giữ được sau **4 tháng** |

→ **Insight vàng:** một khoá học 1 giờ đúng cách có tác dụng đo được. Và "tiếp xúc có cấu trúc" > mọi bài giảng. Đây là chỗ AI vào được.

### 1.2. Rào cản trong TUYỂN DỤNG (AI đang làm tệ hơn, không tốt hơn)

- **70% công ty và 99% Fortune 500** dùng AI trong tuyển dụng.
- HireVue và các hệ phỏng vấn video AI **chấm điểm thấp hơn** cho người mù, người khiếm thính, người nói khó — vì mô hình được huấn luyện trên người không khuyết tật. Có ca thực tế: ép một cử nhân khiếm thị "nhìn thẳng vào camera" mà cô ấy không thể nhìn thấy.
- **ATS hết giờ (time-out)** trước khi người dùng screen reader kịp điền xong. Nguyên tắc thực tế: **form mất hơn 15 phút với bàn phím + screen reader = coi như không thể tiếp cận**, dù từng nút có "pass audit".
- **Thế lưỡng nan tiết lộ (disclosure dilemma)**: tiết lộ sớm → bị thuật toán/con người lọc; giấu → mất lòng tin và rắc rối hậu cần. Trích từ nghiên cứu 2026: *"I don't know when to tell them"*.
- Số liệu tiết lộ: **70,7%** đã tiết lộ với chủ lao động hiện tại nhưng chỉ **57,0%** tiết lộ khi ứng tuyển; **69,2%** sợ ảnh hưởng cơ hội trúng tuyển; **68,4%** sợ ảnh hưởng đánh giá; **47,4%** sợ bị đối xử khác. Trong số người đã xin điều chỉnh (44,9%), **30,7%** vật lộn với câu hỏi "xin lúc nào".

### 1.3. Rào cản KHI ĐÃ ĐI LÀM (đây là mỏ vàng ý tưởng — ít ai đụng tới)

- **Họp hành dựa vào thị giác nhiều hơn người ta tưởng**: "như các bạn thấy ở đây", chia sẻ màn hình mà không gửi file, bảng trắng số không đọc được bằng screen reader, chart không alt text. Người khiếm thị phải **chọn giữa cắt ngang cuộc họp hoặc góp ý với thông tin thiếu**.
- **Phân biệt đối xử tinh vi**: bị loại khỏi các cuộc tụ tập không chính thức, bị lờ đi trong cuộc họp.
- **"Bỏ đói nhiệm vụ" (task starvation)**: khi đồng nghiệp biết bạn khiếm thị, họ *tự ý lấy bớt* những việc họ cho là khó → mất cơ hội chứng minh năng lực. Lập trình viên khiếm thị: *"people really do have very low expectations of blind people"*.
- **Lao động ẩn (hidden labor / "thuế khuyết tật")**: chạy OCR, sửa cấu trúc tài liệu, tự test workaround — "**mỗi việc nhìn nhỏ, cộng lại lấy đi hàng giờ mỗi tuần**". Không ai trả tiền cho phần việc này và **nó không xuất hiện trong đánh giá hiệu suất**.
- **Mất riêng tư**: hệ thống lương, phúc lợi, hoàn ứng không accessible → phải nhờ đồng nghiệp đọc hộ bảng lương.
- **Đánh giá hiệu suất lệch vì "norm to be kind"**: quản lý ngại nói thẳng (sợ vi phạm luật, sợ bị coi là kỳ thị) → nhân viên khiếm thị **không nhận được phản hồi thật** → không cải thiện → không thăng tiến. Đồng thời họ bị **chấm theo thành tích đã có**, trong khi đồng nghiệp được chấm theo **tiềm năng**.

### 1.4. CẢNH BÁO THIẾT KẾ QUAN TRỌNG NHẤT: đừng làm "simulation bịt mắt"

Ý tưởng đầu tiên ai cũng nghĩ ra là "cho quản lý đeo bịt mắt/VR để thấu cảm". **Bằng chứng nói ngược lại:**
- Người tham gia simulation cảm thấy **bối rối, xấu hổ, bất lực** và **KHÓ CHỊU HƠN khi tương tác với người khuyết tật sau đó**.
- Simulation phản ánh **cú sốc mới mù**, không phản ánh **thực tế sống chung với mù** — người mô phỏng có thể tháo bịt mắt bất cứ lúc nào.
- NFB gọi thẳng là "The Perils of Playing Blind".
- Cái hiệu quả: **thành thạo kỹ năng (skill mastery)** và **tương tác có ý nghĩa với người khuyết tật thật**.

→ **Đây là "điểm khác biệt trí tuệ" cực mạnh khi pitch:** đội nào cũng sẽ làm VR empathy; Offixed nói "chúng tôi đã đọc nghiên cứu, cái đó phản tác dụng, và đây là cái thay thế".

### 1.5. Bối cảnh Việt Nam (phần này quyết định điểm Feasibility)

- **Hơn 8 triệu người khuyết tật** (~6,11–7,2% dân số từ 2 tuổi trở lên, số liệu Cục Bảo trợ Xã hội/Bộ Y tế 2024–2025).
- Tỷ lệ người khuyết tật **có việc làm chỉ ~35,63%**.
- **Việt Nam mất ~3% GDP** vì loại trừ người khuyết tật khỏi thị trường lao động (ILO). → **Slide pitch: "3% GDP".**
- Nghề của người khiếm thị vẫn tập trung ở **tẩm quất/massage** (thu nhập 7–10 triệu), thủ công (tăm, hương, kết cườm — 2,5–3,5 triệu). Khoảng **3.700 người** sống bằng các mô hình truyền thống này; riêng 7/2025 đến nay Hội Người mù lập thêm 6 HTX + 70 cơ sở massage, tạo việc cho gần 1.000 lao động.
- Mô hình mới: **Cafe More** (Hà Nội, 12 nhân sự khiếm thị), đào tạo kỹ năng số: CSKH từ xa, hỗ trợ kỹ thuật, gán nhãn dữ liệu, **kiểm thử khả năng tiếp cận web**.
- **Khoảng trống kỹ năng–thị trường**: báo cáo của Sao Mai Center chỉ rõ "gap giữa kỹ năng hiện có và nhu cầu thật của thị trường lao động" + "doanh nghiệp e dè".
- Internet access của người khuyết tật VN: **38,9% (2023) → 42,5% (2024)** — vẫn dưới 50%.
- **Ưu đãi pháp lý**: cơ sở sử dụng **từ 30% lao động là NKT** được **miễn thuế TNDN**, hỗ trợ cải tạo môi trường làm việc, vay ưu đãi, ưu tiên thuê đất (Luật NKT 2010; Luật Thuế TNDN mới hiệu lực 01/10/2025). **Hầu hết HR SME Việt Nam KHÔNG BIẾT điều này** → cơ hội cho một sản phẩm RAG pháp lý.
- TP.HCM 9/2025: sàn giao dịch việc làm 56 DN, **3.127 vị trí, 522 vị trí ưu tiên NKT** → có sẵn kênh triển khai pilot thật.

### 1.6. Chuẩn quốc tế (để ghi điểm "Feasibility & Practicality" và làm khung đo)

- **WCAG 2.2** đã trở thành chuẩn ISO: **ISO/IEC 40500:2025**.
- **EN 301 549 v4.1.1** (châu Âu) nhúng toàn văn WCAG 2.2; **European Accessibility Act có hiệu lực cưỡng chế 28/6/2025** → doanh nghiệp VN xuất khẩu dịch vụ/phần mềm sang EU **bắt buộc** quan tâm. Đây là **đòn bẩy thương mại**, không phải từ thiện.
- **ISO 30415** (Diversity & Inclusion in HR) — khung trách nhiệm D&I theo từng vai trò, dùng làm cấu trúc chấm điểm.
- **UN CRPD Điều 27** (Việt Nam đã phê chuẩn 2015) — quyền làm việc + **"điều chỉnh hợp lý"**.
- **Disability Equality Index (Disability:IN)** — bộ chỉ số benchmark doanh nghiệp, mô hình để "bản địa hoá" cho VN.

### 1.7. Bản đồ cạnh tranh — và KHOẢNG TRỐNG của chúng ta

| Công cụ | Làm gì | Khoảng trống |
|---|---|---|
| **Textio** | Viết lại JD/nội dung tuyển dụng, bắt ngôn ngữ thiên kiến (giới, tuổi, khuyết tật) | **Chỉ tiếng Anh**, giá enterprise, chỉ chạm JD — không chạm phỏng vấn/onboarding/họp |
| **Applied** | Tuyển dụng ẩn danh, chấm theo cấu trúc | Không xử lý khiếm thị cụ thể; không có tiếng Việt |
| **Inclusively** | Marketplace "success enablers"/điều chỉnh hợp lý | Thị trường Mỹ, cần hệ sinh thái VR lớn |
| **Disability:IN / DEI training** | Đào tạo quản lý, benchmark | Nội dung tĩnh, không cá nhân hoá, không đo hành vi thực tế |
| **Microsoft Inclusive Hiring** | Accommodations trong quy trình tuyển | Nội bộ MSFT, không bán cho SME Việt |
| **Be My Eyes Workplace (ra mắt 02/2026)**, Be My AI, Seeing AI, Envision Ally, Copilot auto alt-text | **Mô tả màn hình/ảnh cho người khiếm thị** | **TẤT CẢ đều "sửa người khiếm thị cho vừa công sở"** — hỗ trợ cá nhân, không thay đổi hành vi của đồng nghiệp/quản lý/tổ chức |

> **LUẬN ĐIỂM TRUNG TÂM CỦA OFFIXED:**
> Thị trường đã bão hoà công cụ **"cho người khiếm thị nhìn thấy công sở"**. Chưa ai làm công cụ **"cho công sở nhìn thấy người khiếm thị"**.
> Be My Eyes Workplace ra tháng 2/2026 đã chiếm chỗ mảng assistive. Đi vào đó là chết. **Đi vào mảng hành vi tổ chức + tiếng Việt + SME là đất trống.**

---

## PHẦN II — 20 Ý TƯỞNG

# NHÓM A — "HAY HO / WOW" (gây cảm xúc mạnh khi pitch)

---

### A1. **EchoMeet** — *"Không ai phải nói 'như các bạn thấy' nữa."*

**2. Insight/Nỗi đau:** Họp là nơi loại trừ diễn ra trắng trợn nhất và lịch sự nhất. "As you can see here", chia sẻ màn hình không gửi file, bảng trắng số không đọc được. Người khiếm thị phải chọn: **cắt ngang cuộc họp để xin mô tả, hay im lặng góp ý với thông tin thiếu**. Nghiên cứu ghi nhận chính tình thế này. 81% nhà tuyển dụng nêu "giao tiếp với đồng nghiệp" là lo ngại số 1.

**3. Ai dùng:** Người khiếm thị (nhận mô tả) **+ chủ toạ và toàn bộ người dự họp sáng mắt** (nhận nhắc nhở). Đây là điểm khác biệt — sản phẩm dùng cho cả phòng họp, không chỉ một người.

**4. Cách hoạt động:**
1. Bot vào Teams/Meet/Zoom như một người dự họp.
2. Computer vision đọc luồng screen-share + speech-to-text đọc lời nói.
3. Khi phát hiện **"deixis không được mô tả"** (người nói dùng "cái này", "chỗ đây", "như trên màn hình" trong khi màn hình vừa đổi nội dung), bot gửi **nudge riêng tư cho người nói**: *"Anh Nam ơi, mô tả nhanh biểu đồ giúp Linh nhé."*
4. Song song, bot đọc mô tả ngắn (≤12 giây) qua **kênh audio riêng** vào tai nghe người khiếm thị — không cắt ngang cuộc họp.
5. Sau họp: biên bản có **mô tả văn bản của mọi hình ảnh**, gửi cho cả đội; kèm "Điểm mô tả" của cuộc họp.

**5. AI dùng ở đâu:** (a) VLM/computer vision mô tả slide, biểu đồ, bảng, code trên màn hình chia sẻ; (b) ASR đa ngôn ngữ Việt–Anh (code-switching là chuẩn mực ở DN VN); (c) LLM phát hiện mẫu ngôn ngữ deixis thiếu mô tả và sinh nudge theo văn phong lịch sự tiếng Việt; (d) TTS giọng Việt tốc độ cao (người dùng screen reader nghe ở 300–500 wpm, đừng đọc chậm); (e) tóm tắt đa phương thức ghép lời nói + hình ảnh vào một biên bản.

**6. Điểm khác biệt:** Copilot đã sinh alt-text **khi chèn ảnh vào Word/PowerPoint** (trên Copilot+ PC) và tóm tắt cuộc họp. **Nhưng không ai nhắc người nói thay đổi hành vi.** EchoMeet là công cụ **thay đổi văn hoá họp**, mô tả chỉ là sản phẩm phụ. Thêm: tiếng Việt, và hỗ trợ code-switching Việt–Anh.

**7. Prototype 3 ngày:** Web app "Meeting Room" mô phỏng: upload một video họp có sẵn (tự quay) → hệ thống phát lại kèm 2 track: track "người sáng mắt" hiện popup nudge, track "người khiếm thị" phát mô tả audio. Bản thật: bot Teams qua Graph API. Demo video: quay 60 giây một cuộc họp thật của đội, có bạn bịt màn hình dùng NVDA — cho khán giả **nghe** cuộc họp trước và sau khi bật EchoMeet.

**8. Tác động đo được:** Giảm số lần phải cắt ngang xin mô tả (mục tiêu −80%); % hình ảnh trong họp có mô tả (0% → >90%); thời gian chờ để hiểu một slide (từ "sau cuộc họp" → <15 giây); tỷ lệ phát biểu của nhân viên khiếm thị trong họp (chỉ số hoà nhập thực chất).

**9. Rủi ro / phản biện:**
- *"Microsoft sẽ làm cái này"* → Trả lời: họ đã làm phần mô tả, **không làm phần thay đổi hành vi**, và không làm tiếng Việt cho Zalo/Google Meet của SME VN. Chúng tôi là lớp hành vi, tích hợp lên trên họ.
- *"Nhắc nhiều gây khó chịu, bị tắt"* → Nudge riêng tư, tối đa 1 lần/5 phút, tự giảm dần khi người nói cải thiện (đo được → cũng là số liệu impact).
- *"Riêng tư dữ liệu họp"* → Mô tả xử lý on-device/on-premise cho chart nhạy cảm; không lưu nội dung, chỉ lưu metric.
- *"Mô tả AI sai chart thì sao?"* → Luôn gắn nhãn độ tin cậy + cho người khiếm thị hỏi lại bot ("đọc lại cột 3").

**10. Chấm 4 tiêu chí:** Innovation & Impact **5** · User-Centered & Accessibility **5** · Feasibility **3,5** · AI **5**

---

### A2. **Minh — Đồng nghiệp ảo** (*Colleague Coach*) — *"Tập nói chuyện với người khiếm thị, trước khi nói sai với người thật."*

**2. Insight/Nỗi đau:** 94% nhà tuyển dụng lo nhân viên hành chính không biết giao tiếp thế nào; 81% lo đồng nghiệp. Người ta không kỳ thị — người ta **sợ nói sai nên né luôn** → "phân biệt đối xử tinh vi": bị loại khỏi bữa trưa, bị lờ trong họp. Và **giải pháp phổ biến (bịt mắt/VR) đã được chứng minh phản tác dụng**: người tham gia thấy bất lực, xấu hổ và **khó chịu hơn** khi gặp người khuyết tật thật.

**3. Ai dùng:** Đồng nghiệp sáng mắt, quản lý trực tiếp, lễ tân/hành chính, nhân sự — trước ngày nhân viên khiếm thị vào làm.

**4. Cách hoạt động:**
1. Người học chọn tình huống: *"Ngày đầu tiên gặp đồng nghiệp mới"*, *"Trình bày biểu đồ doanh số"*, *"Mời đi ăn trưa"*, *"Đưa phản hồi hiệu suất"*, *"Dẫn khách tham quan văn phòng"*.
2. Nói chuyện **bằng giọng nói** với "Minh" — một persona nhân viên khiếm thị (LLM + TTS), có tính cách, có công việc, có deadline, **không phải nạn nhân cần thương hại**.
3. Minh phản ứng thật: nếu bạn nói "để tôi dắt bạn đi" mà không hỏi → Minh hơi khựng lại, trả lời theo cách người thật sẽ trả lời.
4. Cuối phiên: "Bảng điểm giao tiếp" — không phải điểm đạo đức, mà là **hành vi cụ thể**: bạn có xưng tên khi bắt đầu nói không? Có mô tả hình ảnh không? Có nói với Minh hay nói với người đi cùng Minh không? (lỗi kinh điển).
5. 5 phút/tuần, đẩy qua Zalo/Teams.

**5. AI dùng ở đâu:** (a) LLM đóng vai với **system prompt xây từ corpus trải nghiệm thật** (phỏng vấn hội viên Hội Người mù + trích dẫn nghiên cứu, RAG để trả lời nhất quán); (b) STT + TTS để cuộc hội thoại diễn ra bằng giọng nói (quan trọng: học giao tiếp phải bằng nói, không phải gõ); (c) LLM-as-judge chấm theo rubric hành vi có sẵn; (d) prosody analysis phát hiện giọng "nói với trẻ con" (infantilizing tone) — một dạng ableism rất phổ biến mà người nói không tự nhận ra.

**6. Điểm khác biệt:** Các nền tảng DEI training bán **video + quiz** (nội dung tĩnh, không đo hành vi). Các đội hackathon khác sẽ làm **VR simulation bịt mắt** — và chúng ta có nghiên cứu chứng minh cái đó có hại. Đây là **tiếp xúc có cấu trúc** (yếu tố duy nhất được chứng minh hiệu quả: quen biết cá nhân → odds tuyển dụng ×3,37) được **nhân bản bằng AI** cho những công ty chưa có ai khiếm thị để tiếp xúc.

**7. Prototype 3 ngày:** Web app 1 trang, nút "Nói chuyện với Minh", dùng Realtime voice API. 3 kịch bản. Bảng điểm cuối phiên. Demo video: cho **một giám khảo hoặc MC thật** nói chuyện với Minh trong 60 giây, rồi hiện bảng điểm — cực kỳ "wow" và không dàn dựng được.

**8. Tác động đo được:** Nghiên cứu cho thấy **can thiệp 1 giờ cải thiện thái độ + ý định tuyển và giữ được sau 4 tháng** → chúng ta hứa đúng cái đã được chứng minh. Đo: điểm thái độ trước/sau (thang EABES rút gọn), % quản lý tự tin "biết cách làm việc với đồng nghiệp khiếm thị" (mục tiêu 40% → 85%), thời gian đến lần tương tác xã hội đầu tiên của nhân viên mới.

**9. Rủi ro / phản biện:**
- *"AI đóng giả người khuyết tật = chiếm dụng tiếng nói (disability cosplay)"* → **Đây là câu hỏi giám khảo CHẮC CHẮN hỏi.** Trả lời: persona được **đồng thiết kế và cấp phép bởi người khiếm thị thật**, có credit và chia doanh thu; Minh luôn tự giới thiệu là AI; sản phẩm **kết thúc bằng việc giới thiệu gặp người thật** (module Buddy — ý tưởng C6), AI chỉ là bánh xe phụ, không thay thế.
- *"Học xong có áp dụng không?"* → Gắn với EchoMeet: hành vi trong họp thật được đo, vòng lặp khép kín.
- *"Mỗi người khiếm thị một khác"* → Có 3 persona: mù bẩm sinh thạo screen reader; nhìn kém dùng phóng to; **mất thị lực muộn, chưa thạo công nghệ** (nhóm bị bỏ quên nhất).

**10. Chấm:** Innovation & Impact **5** · User-Centered **4,5** · Feasibility **5** · AI **4,5**

---

### A3. **The Invisible Hour / Access Tax Meter** — *"Công ty bạn đang bắt nhân viên khiếm thị làm không công 6 giờ mỗi tuần."*

**2. Insight/Nỗi đau:** "Lao động ẩn": chạy OCR file scan, sửa cấu trúc Word, tự test workaround, chờ người gửi lại file. *"Mỗi việc nhìn nhỏ, cộng lại lấy đi hàng giờ mỗi tuần"*. Không ai trả tiền, **không xuất hiện trong đánh giá hiệu suất**, và chính nó là lý do nhân viên khiếm thị bị coi là "chậm hơn".

**3. Ai dùng:** Người khiếm thị (ghi nhận tự động, không phải kể khổ) → HR/C-level (nhận báo cáo tài chính) → phòng IT/mua sắm (biết phần mềm nào là thủ phạm).

**4. Cách hoạt động:**
1. Agent nền chạy trên máy nhân viên khiếm thị (opt-in, có công tắc tắt).
2. Phát hiện các "sự kiện ma sát": screen reader gặp ảnh không alt text, PDF scan, nút không nhãn, bảng merge cell, thời gian im lặng bất thường của screen reader trên một app.
3. Quy đổi thành **giờ × mức lương theo giờ = tiền**.
4. Dashboard cho lãnh đạo: *"Quý này công ty tiêu tốn 187 giờ và 94 triệu đồng vì tài liệu không tiếp cận được. 63% đến từ ERP Fast; 21% từ file PDF scan của phòng Kế toán."*
5. Sinh **phiếu hành động** gửi đúng người tạo ra file lỗi.

**5. AI dùng ở đâu:** (a) accessibility-tree parsing + heuristics phát hiện lỗi; (b) ML phân loại sự kiện ma sát vs thao tác bình thường (tránh false positive); (c) LLM cụm nguyên nhân gốc và viết báo cáo cho lãnh đạo bằng ngôn ngữ tài chính; (d) LLM sinh email nhắc nhở lịch sự theo văn hoá công sở VN.

**6. Điểm khác biệt:** Mọi công cụ a11y hiện tại **đo website/tài liệu**. Chưa ai **đo con người phải trả giá bao nhiêu**. Đây là cú lật khung: chuyển accessibility từ "chi phí từ thiện" thành "**khoản thất thoát đang diễn ra**".

**7. Prototype 3 ngày:** Không cần agent thật. Dựng **Chrome extension** đơn giản đếm sự kiện ma sát trên một bộ tài liệu demo (Google Drive giả lập của "Công ty ABC") + dashboard React hiển thị đồng hồ tiền chạy. Demo video: đặt đồng hồ chạy theo thời gian thực trong lúc người dùng NVDA cố mở một PDF scan — **khán giả nhìn tiền trôi**.

**8. Tác động đo được:** Giờ ẩn/tuần/người (baseline ~4–8h); tiền thất thoát/năm; thời gian trung bình từ khi báo lỗi đến khi sửa; % tài liệu tuân thủ WCAG 2.2 / ISO 40500 nội bộ.

**9. Rủi ro / phản biện:**
- *"Giám sát nhân viên (surveillance)?"* → **Dữ liệu thuộc về nhân viên khiếm thị**, họ quyết định chia sẻ hay không, báo cáo gửi lên là **tổng hợp ẩn danh**; không log nội dung, chỉ log sự kiện ma sát. Nói thẳng điều này trên slide — giám khảo sẽ nể.
- *"Công ty chỉ có 1 người khiếm thị thì ẩn danh kiểu gì?"* → Ở quy mô đó, báo cáo phát theo **hệ thống bị lỗi**, không theo người.
- *"Con số có đáng tin không?"* → Công bố phương pháp, cho phép hiệu chỉnh; dùng khoảng ước lượng, không dùng con số giả chính xác.

**10. Chấm:** Innovation & Impact **5** · User-Centered **4** · Feasibility **4** · AI **3,5**
*(Ghi chú chiến lược: đây là **module đo lường nên gắn vào bất kỳ ý tưởng nào thắng** — nó chính là slide "impact" của pitch.)*

---

### A4. **VoiceProof / Blind Audition** — *"Tuyển bằng năng lực nghe được, không bằng ánh mắt nhìn vào camera."*

**2. Insight/Nỗi đau:** Hệ phỏng vấn video AI **trừ điểm** người mù vì không nhìn vào camera, biểu cảm khuôn mặt "bất thường"; có case ép ứng viên khiếm thị nhìn thẳng camera. Đồng thời 82,3% nhà tuyển dụng **không hình dung nổi** người khiếm thị làm việc ra sao → cách chữa nhanh nhất không phải giải thích, mà là **cho họ xem/nghe bằng chứng làm việc**.

**3. Ai dùng:** Ứng viên khiếm thị + HR/hiring manager.

**4. Cách hoạt động:**
1. Ứng viên chọn 1 bài thử việc thật (viết email khách hàng, phân tích bảng số, sửa bug, xử lý cuộc gọi CSKH).
2. Làm bài **trên máy của chính mình, với công cụ của chính mình**, màn hình + audio được ghi lại.
3. AI tạo **"Hồ sơ bằng chứng năng lực"**: transcript, tóm tắt cách tiếp cận, chấm theo rubric do HR đặt ra — **không chấm giọng nói, không chấm khuôn mặt, không chấm tốc độ gõ**.
4. HR nhận hồ sơ **ẩn danh** ở vòng 1 (không biết ứng viên khiếm thị) → chống thiên kiến ngầm.
5. Vòng 2, khi HR đã thấy năng lực, mới mở thông tin + **kèm đoạn 40 giây ghi màn hình cho thấy ứng viên dùng screen reader tốc độ 400 wpm** → khoảnh khắc "ồ" kinh điển, đánh sập đúng định kiến "low competence".

**5. AI dùng ở đâu:** (a) LLM chấm theo rubric có căn cứ trích dẫn (evidence-grounded scoring, luôn trích đoạn transcript làm bằng chứng); (b) ASR; (c) **debias layer**: tự động loại bỏ mọi tín hiệu phi năng lực khỏi input của mô hình (tốc độ, độ trễ, ngữ điệu, số lần sửa); (d) LLM sinh bản tóm tắt "ứng viên này làm việc bằng cách nào" cho manager — chính là thứ 82,3% nhà tuyển dụng đang thiếu.

**6. Điểm khác biệt:** Applied làm ẩn danh nhưng bằng **văn bản** (vẫn là chữ, vẫn cần form accessible). HireVue làm video (có hại). Chúng ta làm **work-sample audio-first**, và biến chính assistive tech thành **bằng chứng năng lực thay vì lý do bị loại**.

**7. Prototype 3 ngày:** Web app 2 màn hình (ứng viên / HR), 1 bài thử mẫu, rubric cứng, trang kết quả có trích dẫn bằng chứng. Demo video: phát song song 2 "hồ sơ" — HR chấm trước khi biết, và phản ứng sau khi biết.

**8. Tác động đo được:** Tỷ lệ qua vòng 1 của ứng viên khiếm thị (baseline gần 0 ở ATS hiện tại); thời gian tuyển; % hiring manager nói "tôi hình dung được cách họ làm việc" (mục tiêu 18% → 80%).

**9. Rủi ro / phản biện:**
- *"AI chấm người thì cũng thiên kiến"* → Chúng tôi **không dùng AI để quyết định loại ai**; AI chỉ **trích xuất bằng chứng**, con người quyết định. Đúng với mong muốn của chính người khiếm thị trong nghiên cứu: *"AI assist, not replace"*.
- *"Doanh nghiệp VN ngại quy trình mới"* → Đóng gói như một "vòng bài test" bổ sung, không thay ATS.
- *"Bài thử việc không trả tiền = bóc lột"* → Giới hạn 45 phút, và có tuỳ chọn trả phí — nêu thẳng trên slide đạo đức.

**10. Chấm:** Innovation & Impact **4,5** · User-Centered **5** · Feasibility **4** · AI **4**

---

### A5. **Team Access Score** — *"Chúng tôi không chấm điểm người khiếm thị. Chúng tôi chấm điểm cái đội xung quanh họ."*

**2. Insight/Nỗi đau:** Mọi thứ ở công sở đo *người khuyết tật* (họ làm được bao nhiêu %, cần hỗ trợ gì). Không ai đo *môi trường*. Trong khi bằng chứng nói **chính sách công ty thành văn tăng 3,80 lần khả năng tuyển người khiếm thị** — tức là môi trường mới là biến số.

**3. Ai dùng:** Trưởng nhóm, HR, ban lãnh đạo (leaderboard giữa các phòng ban).

**4. Cách hoạt động:**
1. Kết nối Google Workspace/M365/Slack/Zalo OA (chỉ metadata).
2. Đo 6 chỉ số hành vi: % ảnh có alt text; % file chia sẻ là PDF scan; % cuộc họp có gửi tài liệu trước; thời gian phản hồi yêu cầu điều chỉnh hợp lý; % video nội bộ có phụ đề; tỷ lệ tham gia phát biểu của nhân viên khuyết tật.
3. Sinh **"Thẻ điểm hoà nhập"** hàng tháng theo phòng ban, có xếp hạng nội bộ.
4. AI đề xuất **1 hành động nhỏ nhất tuần này** cho từng trưởng nhóm (không phải 20 khuyến nghị).
5. Ánh xạ sang **ISO 30415 + WCAG 2.2/ISO 40500 + EN 301 549** → xuất báo cáo dùng được cho ESG/đấu thầu EU.

**5. AI dùng ở đâu:** (a) VLM kiểm tra chất lượng alt text (phát hiện alt text rác kiểu "image1.png" hoặc AI-generated vô nghĩa); (b) LLM phân tích transcript họp đo thời lượng phát biểu và tần suất bị ngắt lời theo nhóm; (c) mô hình gợi ý hành động (contextual bandit) — chọn can thiệp nhỏ có xác suất được thực hiện cao nhất; (d) RAG ánh xạ chỉ số ↔ điều khoản chuẩn quốc tế.

**6. Điểm khác biệt:** Disability Equality Index chấm **mỗi năm một lần, mức tập đoàn, bằng bảng hỏi tự khai**. Chúng ta chấm **hàng tuần, mức từng đội, bằng hành vi thật**. Và bản địa hoá cho VN (Zalo, tiếng Việt, SME).

**7. Prototype 3 ngày:** Dashboard React + dữ liệu mock từ một Google Drive thật của đội. Quét thật một thư mục → ra điểm thật. Demo: quét thư mục tài liệu của chính RMIT/ban tổ chức (xin phép trước) → **cực kỳ ấn tượng nếu điểm thấp**.

**8. Tác động đo được:** Điểm hoà nhập theo tháng; % alt text (thường 5% → 70%); thời gian phản hồi accommodation (tuần → ngày); có báo cáo sẵn dùng cho khách hàng EU.

**9. Rủi ro:** *"Gamification biến hoà nhập thành hình thức"* → Chỉ số đo **hành vi có ích thật**, không đo số giờ đào tạo. *"Quyền riêng tư"* → chỉ metadata, không đọc nội dung, số liệu theo phòng ban ≥5 người.

**10. Chấm:** Innovation & Impact **4** · User-Centered **4** · Feasibility **4,5** · AI **3,5**

---

### A6. **First Voice** — *"Ngày đầu tiên đi làm, không cần ai dắt tay."*

**2. Insight/Nỗi đau:** Onboarding là lúc định kiến đóng khuôn: người mới khiếm thị được dắt đi, được giới thiệu bằng câu "đây là bạn Linh, bạn ấy bị khiếm thị nên mọi người giúp đỡ nhé" — câu này giết chết vị thế đồng nghiệp ngay ngày đầu. Đồng thời tài liệu onboarding (PDF scan, video không phụ đề, sơ đồ tổ chức dạng ảnh) không đọc được.

**3. Ai dùng:** Nhân viên khiếm thị mới + quản lý trực tiếp + HR.

**4. Cách hoạt động:**
1. HR đổ toàn bộ tài liệu onboarding vào hệ thống.
2. AI sinh **"gói ngày đầu"**: bản audio có cấu trúc (mục lục điều hướng được), sơ đồ tổ chức dạng **cây văn bản** thay vì ảnh, "danh bạ giọng nói" (mỗi đồng nghiệp ghi 10 giây tự giới thiệu → giúp người khiếm thị nhận diện giọng).
3. **Bản đồ âm thanh văn phòng**: hướng dẫn đi từ thang máy đến bàn làm việc, đến toilet, đến pantry — bằng mốc âm thanh và số bước.
4. Quản lý nhận **"kịch bản ngày đầu"**: nên giới thiệu thế nào (giới thiệu vai trò và chuyên môn, không giới thiệu khuyết tật), nên hỏi gì, tuyệt đối không nên làm gì.
5. Ngày 7 và ngày 30: AI hỏi nhanh 3 câu cho cả hai phía, phát hiện lệch pha sớm.

**5. AI dùng ở đâu:** (a) OCR + LLM tái cấu trúc tài liệu thành dạng nghe được có phân cấp heading; (b) TTS tiếng Việt chất lượng cao, tốc độ điều chỉnh; (c) RAG để người mới hỏi bất cứ gì về nội quy công ty bằng giọng nói; (d) LLM sinh kịch bản cho quản lý theo ngữ cảnh ngành/công ty cụ thể.

**6. Điểm khác biệt:** "First 48-hour kit" đang là khuyến nghị thủ công trong tài liệu ngành. Chưa ai tự động hoá. Và phần **"danh bạ giọng nói"** + **kịch bản cho quản lý** là thứ chưa có sản phẩm nào làm.

**7. Prototype 3 ngày:** Web app: upload 3 file onboarding thật → ra gói audio + sơ đồ text + kịch bản quản lý. Demo: phát 20 giây "danh bạ giọng nói" — rất giàu cảm xúc trong video pitch.

**8. Tác động đo được:** Thời gian onboarding đến "năng suất đầy đủ" (giảm 30–50%); số câu phải hỏi nhờ đồng nghiệp trong tuần 1; tỷ lệ nghỉ việc trong 90 ngày đầu.

**9. Rủi ro:** *"Bản đồ âm thanh cần đo thực địa từng văn phòng"* → v1 dùng mô tả do HR nhập + AI cấu trúc hoá; không hứa định vị trong nhà. *"Nghe giống app điều hướng"* → nhấn mạnh phần văn hoá (kịch bản quản lý) mới là lõi.

**10. Chấm:** Innovation & Impact **3,5** · User-Centered **5** · Feasibility **5** · AI **3,5**

---

# NHÓM B — "SÁNG TẠO / ĐỘT PHÁ" (đảo ngược vấn đề)

---

### B1. **HireReady — Công ty bị phỏng vấn** — *"Trước khi bạn chấm ứng viên khiếm thị, để chúng tôi chấm bạn."*

**2. Insight/Nỗi đau:** Toàn bộ ngành đang tối ưu **ứng viên khuyết tật cho vừa quy trình**: viết CV chuẩn ATS, luyện phỏng vấn, học cách tiết lộ. Đảo ngược: **quy trình mới là thứ hỏng**. ATS hết giờ, form >15 phút = không tiếp cận được, phỏng vấn video AI trừ điểm người mù. 57% không dám tiết lộ khi ứng tuyển vì sợ bị loại.

**3. Ai dùng:** (chính) Doanh nghiệp/HR muốn tự kiểm; (phụ) người khiếm thị tra cứu "công ty này có đáng nộp đơn không"; (xã hội) bảng xếp hạng công khai.

**4. Cách hoạt động:**
1. Nhập URL trang tuyển dụng của công ty.
2. Agent AI **tự đi nộp một hồ sơ giả bằng bàn phím + screen reader mô phỏng**, ghi lại: số bước, thời gian, số bẫy (captcha hình ảnh, upload CV không nhãn, time-out, trường bắt buộc không có label).
3. LLM đọc JD và chấm ngôn ngữ loại trừ (yêu cầu thị giác không cần thiết, "ngoại hình ưa nhìn", "năng động nhanh nhẹn", "có xe máy").
4. Xuất **"Thẻ điểm sẵn sàng tuyển dụng hoà nhập"** A–F + **danh sách 5 lỗi sửa được trong 1 ngày**.
5. Công ty đạt chuẩn được cấp **huy hiệu** gắn lên tin tuyển dụng → người khiếm thị biết nộp vào đâu.

**5. AI dùng ở đâu:** (a) **Browser-use agent** điều khiển trình duyệt bằng accessibility tree (không dùng toạ độ pixel — chính là cách screen reader "nhìn"); (b) LLM phân loại lỗi WCAG 2.2 và ánh xạ tiêu chí; (c) LLM viết lại JD tiếng Việt; (d) RAG so chiếu Luật NKT VN + EN 301 549.

**6. Điểm khác biệt:** Các công cụ audit a11y (axe, WAVE) chỉ **quét kỹ thuật một trang**. Không ai **đi hết hành trình nộp đơn như một con người dùng screen reader**, và không ai gộp **kỹ thuật + ngôn ngữ + thái độ** vào một điểm số. Đây cũng là đảo ngược quyền lực: ứng viên trở thành người chấm điểm.

**7. Prototype 3 ngày:** Web app: dán URL → chạy agent thật trên 3–5 trang tuyển dụng có thật của DN Việt Nam → ra thẻ điểm. **Dữ liệu thật, kết quả thật, không mock** → ghi điểm Feasibility rất mạnh. Demo: chấm live một trang tuyển dụng ngay trong video.

**8. Tác động đo được:** Số trang tuyển dụng được sửa; thời gian hoàn thành form với screen reader (mục tiêu <8 phút); tỷ lệ ứng viên khiếm thị hoàn tất nộp đơn (thường <20% → >80%).

**9. Rủi ro:**
- *"Bêu tên doanh nghiệp thì họ ghét"* → v1 **báo cáo riêng tư**, chỉ công khai khi công ty đồng ý (mô hình "opt-in badge", giống chứng chỉ xanh).
- *"Agent nộp đơn giả = spam/pháp lý"* → chạy chế độ sandbox, dừng trước bước submit cuối; có cơ chế xin phép.
- *"Screen reader mô phỏng ≠ screen reader thật"* → nêu rõ giới hạn; kết quả được người dùng NVDA thật kiểm chứng chéo (đội có thể phỏng vấn 1–2 người thật trong 3 ngày → cực kỳ ghi điểm User-Centered).

**10. Chấm:** Innovation & Impact **5** · User-Centered **4,5** · Feasibility **4,5** · AI **4,5**

---

### B2. **AdvocateBot / Trợ lý đòi quyền** — *"Đừng bắt người khiếm thị phải đi xin tử tế mỗi ngày."*

**2. Insight/Nỗi đau:** Đây là nỗi đau **cảm xúc** sâu nhất trong toàn bộ nghiên cứu. Mỗi ngày, người khiếm thị phải: xin file thay vì ảnh chụp màn hình, xin mô tả biểu đồ, nhắc gửi tài liệu trước họp — **mà phải nhắc thật khéo để không bị coi là khó tính, đòi hỏi, "lại bắt đầu rồi"**. Nghiên cứu gọi là *hidden labor* và *repeated requests break the flow*. 31,4% ngại chia sẻ, 30,7% không biết xin lúc nào.

**3. Ai dùng:** Người khiếm thị (uỷ quyền), người gửi file (nhận yêu cầu), HR (thấy tổng hợp).

**4. Cách hoạt động:**
1. Nhân viên khiếm thị bật AdvocateBot một lần, đặt "ngưỡng tự động".
2. Bot theo dõi hộp thư/kênh chat của **chính người đó**. Thấy ảnh chụp màn hình không mô tả, PDF scan, lời mời họp không đính tài liệu → **tự động** gửi tin nhắn thay mặt: *"Chào anh Hùng, Linh dùng phần mềm đọc màn hình nên không đọc được ảnh này. Anh gửi giúp bản Excel gốc nhé. Cảm ơn anh!"*
3. Nếu không có phản hồi trong X giờ → bot tự OCR/mô tả tạm bằng AI để người dùng không bị kẹt, **đồng thời ghi nhận sự cố**.
4. Bot học văn phong của từng mối quan hệ (sếp / đồng nghiệp thân / phòng khác) để giữ vốn xã hội.
5. Mỗi tháng: báo cáo "ai là nguồn gây ma sát lớn nhất" → gửi HR dưới dạng **hệ thống**, không phải tố cáo cá nhân.

**5. AI dùng ở đâu:** (a) Agent có quyền hành động (gửi mail/chat thay mặt, có hàng rào phê duyệt); (b) VLM + OCR mô tả tạm; (c) LLM cá nhân hoá văn phong theo quan hệ và theo chuẩn mực lịch sự tiếng Việt (xưng hô anh/chị/em — thứ mà công cụ nước ngoài không làm được); (d) phân tích mẫu để tìm nguyên nhân gốc.

**6. Điểm khác biệt:** Be My Eyes Workplace (02/2026) mô tả màn hình **cho người khiếm thị** — tức vẫn để gánh nặng trên vai họ. AdvocateBot **chuyển gánh nặng ngược lại phía người tạo ra rào cản**, và **gỡ bỏ chi phí cảm xúc của việc tự vận động (self-advocacy)**. Đây là insight sắc nhất trong cả bộ ý tưởng.

**7. Prototype 3 ngày:** Bot Slack (hoặc Gmail add-on): thả một ảnh chụp màn hình vào kênh → bot tự trả lời công khai/riêng tư yêu cầu file gốc, đồng thời gửi mô tả tạm cho người dùng. Demo video 45 giây, rất dễ hiểu.

**8. Tác động đo được:** Số yêu cầu tự vận động nhân viên phải tự viết (mục tiêu giảm 90%); thời gian chờ nhận tài liệu tiếp cận được; **thay đổi hành vi người gửi** (sau 4 tuần, % người tự gửi file gốc ngay lần đầu) — đây mới là impact thật.

**9. Rủi ro:**
- *"Bot gửi mail thay tôi, lỡ sai văn phong với sếp thì sao?"* → Chế độ "review trước khi gửi" mặc định bật cho quan hệ cấp trên; tự động hoàn toàn chỉ với quan hệ ngang cấp.
- *"Làm đồng nghiệp bực"* → Đo và báo cáo: nếu tỷ lệ phản hồi giảm, hệ thống tự hạ tần suất. Tone luôn "cảm ơn", không bao giờ trách.
- *"Tại sao không sửa gốc bằng chính sách?"* → Có: báo cáo tháng chính là đầu vào cho chính sách. Bot là giải pháp ngắn hạn, dữ liệu là giải pháp dài hạn.

**10. Chấm:** Innovation & Impact **5** · User-Centered **5** · Feasibility **4,5** · AI **4,5**

---

### B3. **FairTask / Chống bỏ đói nhiệm vụ** — *"Không ai bị tước việc khó một cách tử tế."*

**2. Insight/Nỗi đau:** Bằng chứng trực tiếp: *"khi đồng nghiệp biết về khiếm thị, họ lấy đi những việc họ nghĩ là khó, làm giảm cơ hội thể hiện năng lực"*. Đây là **kỳ thị dưới vỏ bọc tử tế** — không ai cố ý, không ai bị kiện, nhưng sự nghiệp bị chặn. Kết hợp với "high warmth, low competence" → nhân viên khiếm thị vĩnh viễn ở vị trí cũ.

**3. Ai dùng:** Quản lý trực tiếp (nhận cảnh báo), HR (nhận xu hướng), nhân viên khiếm thị (thấy dữ liệu của mình).

**4. Cách hoạt động:**
1. Kết nối Jira/Asana/Trello/Notion (chỉ metadata task).
2. AI phân loại độ phức tạp, độ hiển thị (visibility), và giá trị sự nghiệp của từng task (task hướng khách hàng, task thuyết trình, task dẫn dắt).
3. So sánh **phân bổ** giữa nhân viên khiếm thị và đồng nghiệp cùng cấp/cùng thâm niên.
4. Khi lệch quá ngưỡng: gửi riêng cho quản lý — *"Trong 8 tuần qua, Linh nhận 0 task hướng khách hàng, trong khi trung bình nhóm là 4. Có phải do phân công không? 3 task sắp tới phù hợp: ..."*
5. Trước kỳ đánh giá: sinh "báo cáo cơ hội công bằng".

**5. AI dùng ở đâu:** (a) LLM phân loại & chấm điểm task theo độ phức tạp/hiển thị từ tiêu đề + mô tả; (b) phát hiện bất thường thống kê có kiểm soát nhiễu (thâm niên, vai trò, khối lượng); (c) LLM sinh thông điệp cho quản lý theo hướng **tò mò, không buộc tội** (quan trọng: buộc tội sẽ khiến quản lý phòng thủ và né tuyển người khuyết tật lần sau); (d) gợi ý task phù hợp.

**6. Điểm khác biệt:** People analytics hiện có đo **năng suất** (đo nhân viên). Đây là công cụ đầu tiên đo **cơ hội** (đo quản lý). Áp dụng được cho cả giới, tuổi, người mới — nhưng vào thị trường bằng cánh cửa khuyết tật.

**7. Prototype 3 ngày:** Dashboard đọc dữ liệu Jira mock/export CSV của một đội 8 người trong 3 tháng → biểu đồ phân bổ + cảnh báo. Demo: hiện "bức tranh tử tế mà tàn nhẫn" — nhân viên khiếm thị có nhiều task nhất nhưng toàn task giá trị thấp.

**8. Tác động đo được:** Chỉ số công bằng phân công (Gini của task giá trị cao); tỷ lệ thăng tiến; thời gian đến lần đầu dẫn dắt dự án.

**9. Rủi ro:**
- *"Đôi khi task bị lấy đi vì lý do chính đáng (công cụ thật sự không accessible)"* → Hệ thống phân biệt 2 nguyên nhân và nếu là công cụ → đẩy sang phiếu cho IT (nối với A3). Đây chính là câu trả lời mạnh nhất.
- *"Giám sát quản lý"* → Cảnh báo gửi riêng cho quản lý trước, HR chỉ thấy tổng hợp sau 2 chu kỳ không cải thiện.
- *"Công ty VN không dùng Jira"* → Bản SME đọc từ **Google Sheet phân công** hoặc kênh Zalo nhóm.

**10. Chấm:** Innovation & Impact **5** · User-Centered **4** · Feasibility **3,5** · AI **4**

---

### B4. **Straight Talk / Nói thẳng** — *"Sự tử tế đang giết chết sự nghiệp của họ."*

**2. Insight/Nỗi đau:** "**Norm to be kind**": quản lý không dám phản hồi thật với nhân viên khuyết tật (sợ vô cảm, sợ pháp lý, sợ nước mắt) → nhân viên **không nhận được thông tin để cải thiện** → bị đánh giá thấp âm thầm. Cộng thêm: nhóm bị định kiến "kém năng lực" bị chấm theo **thành tích đã có**, còn đa số được chấm theo **tiềm năng**.

**3. Ai dùng:** Quản lý trực tiếp (chính), HR (giám sát chất lượng), nhân viên khiếm thị (nhận feedback tốt hơn).

**4. Cách hoạt động:**
1. Quản lý dán bản nháp đánh giá hiệu suất vào công cụ.
2. AI so sánh **đặc tính ngôn ngữ** của các bản đánh giá trong cùng đội: độ cụ thể, tỷ lệ khen chung chung ("nhiệt tình", "cố gắng", "hoà đồng") vs phản hồi hành động được, ngôn ngữ **thành tích vs tiềm năng**.
3. Cảnh báo: *"Đánh giá của Linh có 80% là tính cách, 20% là kết quả. Trung bình đội ngược lại. 3 câu này nên viết lại cụ thể hơn: ..."*
4. Kiểm tra **ngôn ngữ ableist ngầm**: "dù bị khiếm thị nhưng vẫn...", "truyền cảm hứng cho cả nhóm" (inspiration porn trong đánh giá là có thật).
5. Kiểm tra: đánh giá có tính **lao động ẩn** (từ A3) vào KPI không?

**5. AI dùng ở đâu:** (a) LLM phân tích văn bản theo rubric có sẵn (specificity, actionability, achievement-vs-potential framing); (b) so sánh thống kê trong cùng đội (ẩn danh hoá); (c) LLM viết lại câu feedback cụ thể hơn, giữ giọng của quản lý; (d) phát hiện ngôn ngữ ableism tiếng Việt (cần từ điển tự xây — tài sản riêng của đội).

**6. Điểm khác biệt:** Textio có sản phẩm cho feedback nhưng **tiếng Anh, tập trung giới tính**, và **không xử lý "norm to be kind"** — hiện tượng đặc thù của khuyết tật. Chúng ta đặt tên và đo được một dạng thiên kiến mà chưa sản phẩm nào gọi tên.

**7. Prototype 3 ngày:** Web app một ô text, dán đánh giá → ra bảng phân tích + bản viết lại. Cực nhanh, cực dễ demo. Demo: dán 2 bản đánh giá thật (ẩn danh) cạnh nhau, chỉ ra sự khác biệt mà mắt thường không thấy.

**8. Tác động đo được:** % feedback có thể hành động; khoảng cách điểm đánh giá giữa nhân viên khuyết tật và đồng nghiệp; tỷ lệ thăng tiến sau 2 chu kỳ.

**9. Rủi ro:** *"Dữ liệu đánh giá cực nhạy cảm"* → chạy on-premise/local model, không lưu; *"Mẫu nhỏ, thống kê yếu"* → v1 chỉ so trong cùng đội và chỉ nêu cảnh báo định tính, không phán quyết.

**10. Chấm:** Innovation & Impact **4,5** · User-Centered **3,5** · Feasibility **5** · AI **4**

---

### B5. **Access Passport / Hộ chiếu điều chỉnh** — *"Xin một lần, dùng cả đời đi làm."*

**2. Insight/Nỗi đau:** Mỗi lần đổi quản lý, đổi phòng, đổi công ty → **phải kể lại từ đầu, phải chứng minh lại, phải xin lại**. 30,7% vật lộn với "xin lúc nào"; 31,4% ngại chia sẻ thông tin y tế. Và việc phải kể về khuyết tật của mình nhiều lần chính là **thuế cảm xúc**.

**3. Ai dùng:** Người khiếm thị (sở hữu), quản lý mới/HR (nhận bản phù hợp), nhà tuyển dụng (nhận bản tối giản).

**4. Cách hoạt động:**
1. AI phỏng vấn người dùng **bằng giọng nói, một lần, 15 phút**: bạn làm việc thế nào, cần gì, không cần gì, thích được hỗ trợ ra sao, điều gì khiến bạn khó chịu.
2. Sinh **hộ chiếu 3 tầng**: (i) bản công khai cho đồng nghiệp — *"tôi làm việc thế nào"*, không có thông tin y tế; (ii) bản cho quản lý — cách giao việc, cách họp, cách phản hồi; (iii) bản cho IT/HR — cấu hình kỹ thuật, yêu cầu pháp lý.
3. Người dùng **kiểm soát ai thấy tầng nào** — không bao giờ tự động tiết lộ.
4. Khi đổi quản lý: chia sẻ 1 link, quản lý mới nhận bản tóm tắt 90 giây + 3 việc nên làm trong tuần đầu.
5. **"Cố vấn tiết lộ"**: AI tư vấn nên tiết lộ ở giai đoạn nào của quy trình tuyển dụng công ty X, dựa trên thẻ điểm HireReady (B1) của chính công ty đó.

**5. AI dùng ở đâu:** (a) LLM phỏng vấn thích ứng bằng giọng nói (voice-first, không form); (b) LLM sinh 3 phiên bản tài liệu với mức tiết lộ khác nhau từ cùng một nguồn; (c) RAG luật VN + chính sách công ty để tư vấn quyền lợi; (d) **agent kết nối** với thẻ điểm B1 để ra khuyến nghị tiết lộ dựa trên dữ liệu chứ không dựa trên cảm tính.

**6. Điểm khác biệt:** "Workplace Passport" đã tồn tại ở Anh nhưng là **mẫu Word tự điền**. Inclusively làm marketplace nhưng ở Mỹ. Chưa ai làm **phân tầng tiết lộ + cố vấn thời điểm tiết lộ dựa trên dữ liệu về công ty cụ thể**. Đó là cú giải quyết trực diện "disclosure dilemma".

**7. Prototype 3 ngày:** Voice interview → 3 tài liệu xuất ra + trang chia sẻ có phân quyền. Demo: nghe 30 giây AI phỏng vấn, rồi lật ra 3 phiên bản khác nhau trên màn hình.

**8. Tác động đo được:** Thời gian từ khi có quản lý mới đến khi điều chỉnh sẵn sàng (tuần → giờ); số lần phải kể lại (giảm 90%); tỷ lệ người dám tiết lộ khi ứng tuyển (57% → mục tiêu 75%).

**9. Rủi ro:** *"Dữ liệu sức khoẻ nhạy cảm"* → dữ liệu thuộc về cá nhân, mã hoá, có thể thu hồi quyền xem bất cứ lúc nào, không lưu chẩn đoán y tế mà lưu **nhu cầu chức năng**. *"Chuẩn hoá con người"* → mọi trường đều do người dùng sửa được, AI chỉ gợi ý.

**10. Chấm:** Innovation & Impact **4** · User-Centered **5** · Feasibility **4,5** · AI **3,5**

---

### B6. **EarFirst / Audio song sinh** — *"Nếu ai cũng nghe tài liệu, thì không ai bị bỏ lại."*

**2. Insight/Nỗi đau:** Accessibility luôn bị coi là **đặc ân cho thiểu số** → luôn bị cắt ngân sách, luôn làm sau cùng. Đảo ngược: biến nó thành **tiện ích cho đa số**. Ở TP.HCM, hàng triệu người đi xe máy 60–90 phút/ngày và không thể đọc tài liệu.

**3. Ai dùng:** **Toàn bộ nhân viên** (đó chính là điểm đột phá), đặc biệt nhân viên khiếm thị.

**4. Cách hoạt động:**
1. Mọi tài liệu nội bộ được đẩy vào hệ thống đều tự sinh **"audio twin"** — bản nghe có cấu trúc, điều hướng theo chương, tốc độ tuỳ chỉnh.
2. Nhân viên nghe tài liệu công ty trên đường đi làm như nghe podcast; có thể **hỏi lại bằng giọng nói** ("tóm tắt phần ngân sách").
3. Vì bản audio sinh từ **cấu trúc heading**, hệ thống **buộc** tài liệu gốc phải có cấu trúc đúng → và đó chính là điều kiện để screen reader đọc được.
4. Bảng xếp hạng "tài liệu được nghe nhiều nhất" → tạo động lực viết tài liệu có cấu trúc.
5. Kết quả phụ: công ty đạt chuẩn WCAG nội bộ **mà không ai phải nói chữ "khuyết tật"**.

**5. AI dùng ở đâu:** (a) LLM tái cấu trúc tài liệu lộn xộn thành phân cấp heading hợp lệ; (b) VLM mô tả biểu đồ thành lời kể; (c) TTS tiếng Việt đa giọng, phân vai cho hội thoại/bảng biểu; (d) RAG hỏi đáp bằng giọng nói trên kho tài liệu.

**6. Điểm khác biệt:** Đây là **chiến lược "Trojan horse" của Universal Design**: không bán accessibility, bán năng suất — và accessibility là tác dụng phụ bắt buộc. Cực mạnh trước giám khảo doanh nghiệp (P&G, Katalon), vì nó giải bài toán "ai trả tiền".

**7. Prototype 3 ngày:** Web app upload PDF/Docx → audio twin có mục lục + chat hỏi đáp bằng giọng nói. Demo: bật audio twin của một tài liệu nội quy khô khan → khán giả thấy ngay giá trị cho chính họ.

**8. Tác động đo được:** % tài liệu nội bộ có cấu trúc hợp lệ (đo được, thường <20% → >80%); số phút nghe/nhân viên/tuần; tỷ lệ tài liệu người khiếm thị đọc được ngay lần đầu.

**9. Rủi ro:** *"TTS đọc tài liệu = tính năng có sẵn"* → Khác biệt nằm ở **tái cấu trúc + mô tả biểu đồ + hỏi đáp**, không phải đọc thô. *"Không trực tiếp giải bài toán thái độ"* → Trả lời: nó giải bằng cách **xoá bỏ sự khác biệt giữa "cách của người khiếm thị" và "cách của mọi người"** — đó chính là thay đổi thái độ ở tầng sâu nhất.

**10. Chấm:** Innovation & Impact **4,5** · User-Centered **4** · Feasibility **4,5** · AI **4**

---

### B7. **Không-Phải-Truyền-Cảm-Hứng (*Not Your Inspiration*)** — *"Công ty bạn đang khen họ, hay đang hạ thấp họ?"*

**2. Insight/Nỗi đau:** Doanh nghiệp VN rất hay làm truyền thông nội bộ kiểu "**tấm gương vượt khó**", "dù khiếm khuyết nhưng vẫn nỗ lực". Đó chính là *inspiration porn* — khen nhưng củng cố đúng khuôn mẫu "high warmth, low competence" và làm nhân viên khiếm thị bị xem là biểu tượng thay vì đồng nghiệp.

**3. Ai dùng:** Phòng truyền thông nội bộ, HR employer branding, marketing.

**4. Cách hoạt động:**
1. Dán bài đăng nội bộ/bài tuyển dụng/caption Facebook công ty.
2. AI chấm theo 4 trục: **inspiration porn**, **ngôn ngữ y tế hoá** ("bị mù", "khiếm khuyết", "bệnh nhân"), **tước quyền chủ thể** (nói về họ, không để họ nói), **tokenism** (chỉ xuất hiện vào ngày 3/12 và 18/4).
3. Viết lại theo chuẩn: người trước, khuyết tật sau; nói về **công việc**, không nói về **nghị lực**.
4. Từ điển ngôn ngữ hoà nhập tiếng Việt, có ghi nguồn từ chính cộng đồng người khiếm thị VN (không bê nguyên từ tiếng Anh).
5. Tính "chỉ số tokenism" theo lịch: bao nhiêu % nội dung về khuyết tật rơi vào 2 ngày lễ trong năm.

**5. AI dùng ở đâu:** (a) LLM fine-tune/few-shot trên corpus do cộng đồng gán nhãn (đội có thể gán 200 mẫu trong 1 ngày); (b) LLM viết lại giữ giọng thương hiệu; (c) phân tích chuỗi thời gian phát hiện tokenism theo mùa.

**6. Điểm khác biệt:** Textio bắt thiên kiến trong **JD tiếng Anh**. Chưa ai bắt **inspiration porn tiếng Việt trong truyền thông nội bộ** — một hiện tượng cực phổ biến và cực đau ở VN. Đây là ý tưởng "bản địa" nhất trong bộ.

**7. Prototype 3 ngày:** Web app + Chrome extension. Demo cực mạnh: **chấm live một bài đăng thật của một doanh nghiệp lớn** (ẩn tên) và viết lại — khán giả Việt Nam sẽ cười và gật đầu ngay.

**8. Tác động đo được:** Điểm ngôn ngữ hoà nhập của kênh nội bộ; % nội dung nói về năng lực thay vì nghị lực; chỉ số tokenism theo tháng.

**9. Rủi ro:** *"Quá nhỏ để thành sản phẩm"* → Đúng — nên là **module trong nền tảng**, không phải sản phẩm độc lập. *"Ai quyết định thế nào là đúng?"* → Từ điển do cộng đồng người khiếm thị VN duyệt, công khai nguồn, cho phép công ty tuỳ chỉnh.

**10. Chấm:** Innovation & Impact **3,5** · User-Centered **4,5** · Feasibility **5** · AI **3**

---

# NHÓM C — "THỰC TẾ / TRIỂN KHAI ĐƯỢC NGAY TẠI VIỆT NAM"

---

### C1. **JD Doctor VN** — *"Sửa 1 dòng trong tin tuyển dụng, mở ra 8 triệu ứng viên."*

**2. Insight/Nỗi đau:** Tin tuyển dụng Việt Nam đầy rào cản vô nghĩa: "ngoại hình ưa nhìn", "nhanh nhẹn", "có xe máy", "thành thạo Excel" (không nói là bằng chuột hay bàn phím), "sức khoẻ tốt". Mỗi dòng này **loại người khiếm thị trước khi họ kịp đọc**. 82,3% nhà tuyển dụng không biết người khiếm thị làm việc thế nào → họ viết JD theo *cách họ hình dung công việc*, không theo *kết quả cần đạt*.

**3. Ai dùng:** HR/recruiter SME Việt Nam (chính), agency tuyển dụng, nền tảng như TopCV/VietnamWorks (B2B2C).

**4. Cách hoạt động:**
1. Dán JD tiếng Việt (hoặc URL tin tuyển dụng).
2. AI gắn cờ từng yêu cầu: **thiết yếu cho kết quả** vs **giả định về cách làm**. Ví dụ: "lái xe giao hàng" (thiết yếu) vs "có bằng lái" cho vị trí kế toán (giả định).
3. Viết lại theo **outcome-based**: thay "thành thạo Excel" → "phân tích được dữ liệu bán hàng và xuất báo cáo hàng tuần".
4. Tự động chèn **câu mời điều chỉnh hợp lý** đúng luật VN + thông tin liên hệ accessible.
5. Kiểm tra luôn: form nộp đơn có accessible không (nối B1), có captcha hình ảnh không.
6. Xuất bản JD kèm **huy hiệu "Tin tuyển dụng hoà nhập"**.

**5. AI dùng ở đâu:** (a) LLM phân loại yêu cầu thiết yếu/không thiết yếu, có giải thích lý do; (b) LLM viết lại tiếng Việt giữ đúng văn phong ngành; (c) RAG **Luật Người khuyết tật 2010 + Bộ luật Lao động 2019** để đảm bảo câu chữ đúng luật; (d) classifier phát hiện ngôn ngữ phân biệt (ngoại hình, tuổi, giới, sức khoẻ).

**6. Điểm khác biệt:** Textio = tiếng Anh + giá enterprise + tập trung giới tính. **Chưa có công cụ tiếng Việt nào**, và chưa ai kết hợp **viết lại JD + kiểm tra form + trích dẫn luật VN**. Miễn phí cho SME <50 người → chiến lược lan toả.

**7. Prototype 3 ngày:** Web app + Chrome extension chạy trên TopCV/VietnamWorks. Demo: lấy 1 tin tuyển dụng thật, chấm, viết lại, hiện diff — **nhanh, sạch, không thể cãi**.

**8. Tác động đo được:** Số yêu cầu loại trừ bị gỡ/JD (trung bình 3–5); tỷ lệ ứng viên khuyết tật ứng tuyển; số JD được xử lý (chỉ số lan toả); thời gian xử lý: 30 giây/JD vs 1 giờ nếu thuê tư vấn.

**9. Rủi ro:** *"Quá đơn giản cho hackathon"* → Đúng — mạnh về Feasibility, yếu về Innovation → **phải đi kèm ý tưởng khác**. *"HR không dùng thêm tool"* → Vì vậy làm Chrome extension chạy **ngay trên công cụ họ đang dùng**, không bắt đổi quy trình.

**10. Chấm:** Innovation & Impact **3** · User-Centered **4** · Feasibility **5** · AI **3,5**

---

### C2. **HR Law Copilot VN** — *"Tuyển 30% lao động khuyết tật, miễn thuế TNDN. Bạn biết chưa?"*

**2. Insight/Nỗi đau:** Rào cản lớn nhất của SME Việt không phải ác ý, mà là **hoàn toàn không biết bắt đầu từ đâu**: tuyển người khuyết tật có bắt buộc không? Được ưu đãi gì? Hồ sơ miễn thuế làm sao? Có được sa thải không? Phải sửa văn phòng thế nào? Không ai đủ ngân sách thuê luật sư để hỏi.

**3. Ai dùng:** HR/chủ SME Việt Nam, kế toán, phòng pháp chế.

**4. Cách hoạt động:**
1. Chat/gọi thoại bằng tiếng Việt: *"Công ty em 40 người, tuyển 2 bạn khiếm thị thì được gì?"*
2. RAG trên kho văn bản: **Luật NKT 2010, Bộ luật Lao động 2019, Luật Thuế TNDN (hiệu lực 01/10/2025), Nghị định 20/2021, Nghị định 76/2024, Luật Đất đai 2024, CRPD**.
3. Trả lời **kèm trích dẫn điều khoản + link văn bản gốc** (chống ảo giác).
4. Sinh **checklist hành động + mẫu hồ sơ** (đơn xin miễn thuế, mẫu chính sách tuyển dụng hoà nhập — chính sách thành văn tăng 3,80 lần khả năng tuyển).
5. Ước tính **giá trị ưu đãi bằng tiền** cho chính công ty đó.

**5. AI dùng ở đâu:** (a) RAG với kho văn bản pháp luật có versioning theo ngày hiệu lực (rất quan trọng — luật VN sửa liên tục); (b) LLM sinh văn bản hành chính theo mẫu; (c) tính toán ưu đãi; (d) guardrail bắt buộc trích dẫn, từ chối trả lời khi không tìm được căn cứ.

**6. Điểm khác biệt:** Không có sản phẩm nào tương đương ở VN. Và nó đánh trúng động cơ **kinh tế** thay vì đạo đức — thứ duy nhất khiến SME hành động trong 6 tháng.

**7. Prototype 3 ngày:** Chatbot web, kho văn bản ~15 tài liệu, có trích dẫn. Demo: hỏi 3 câu HR hay hỏi nhất, ra câu trả lời có điều khoản. **Rất dễ dựng, rất dễ tin.**

**8. Tác động đo được:** % HR biết về ưu đãi thuế (trước/sau khảo sát); số công ty ban hành chính sách tuyển dụng khuyết tật thành văn; giá trị ưu đãi được kích hoạt (VNĐ).

**9. Rủi ro:** *"AI tư vấn pháp luật sai thì chịu trách nhiệm ai?"* → Định vị là **công cụ tra cứu có trích dẫn**, không phải tư vấn pháp lý; mọi câu trả lời kèm điều khoản gốc để người dùng tự kiểm; có disclaimer. *"Luật thay đổi"* → pipeline cập nhật văn bản + hiển thị ngày hiệu lực.

**10. Chấm:** Innovation & Impact **3** · User-Centered **3,5** · Feasibility **5** · AI **4**

---

### C3. **Sếp 5 Phút (*Manager Micro-Coach*)** — *"Mỗi tuần 5 phút, sau 4 tháng vẫn còn tác dụng."*

**2. Insight/Nỗi đau:** Bằng chứng: **can thiệp giáo dục 1 giờ cải thiện thái độ, kiến thức và ý định tuyển dụng, và hiệu quả còn giữ sau 4 tháng**. Nhưng không quản lý Việt Nam nào ngồi học e-learning 1 giờ. → Chia nhỏ thành 12 lát 5 phút, đẩy qua **Zalo** (kênh duy nhất ai cũng mở).

**3. Ai dùng:** Quản lý trực tiếp, trưởng nhóm — nhóm có ảnh hưởng lớn nhất đến trải nghiệm hằng ngày nhưng ít được đào tạo nhất.

**4. Cách hoạt động:**
1. Mỗi thứ Ba 9h, Zalo/Teams gửi 1 tình huống thật: *"Linh (khiếm thị) vừa bị khách hàng nói 'cho tôi gặp người khác'. Bạn xử lý thế nào?"* — 3 lựa chọn.
2. Quản lý chọn → AI phản hồi theo lựa chọn, có bằng chứng và hệ quả.
3. Nội dung **cá nhân hoá theo phòng ban** (sales, kỹ thuật, kế toán có tình huống khác nhau) và theo lỗi thực tế đã phát hiện ở A5/B4.
4. Sau 12 tuần: bảng điểm cá nhân + chứng chỉ ánh xạ **ISO 30415**.
5. Đo lại thái độ bằng thang rút gọn ở tuần 1 và tuần 16 → **có dữ liệu thật để pitch**.

**5. AI dùng ở đâu:** (a) LLM sinh tình huống theo ngành/vai trò từ ngân hàng ca thật; (b) adaptive learning chọn bài tiếp theo dựa trên lỗi; (c) LLM chấm câu trả lời tự do; (d) đo thay đổi thái độ qua ngôn ngữ trong câu trả lời tự do (không chỉ dựa trên trắc nghiệm).

**6. Điểm khác biệt:** DEI training hiện tại = video dài + quiz + chứng chỉ, không ai nhớ. Chúng ta bám đúng **liều lượng đã được chứng minh hiệu quả** và **đúng kênh người Việt dùng (Zalo)**.

**7. Prototype 3 ngày:** Bot Zalo OA hoặc Telegram (dễ hơn) + 6 tình huống + trang thống kê. Demo: cho giám khảo quét QR, nhận 1 tình huống ngay tại chỗ → **tương tác trực tiếp với ban giám khảo là điểm cộng lớn**.

**8. Tác động đo được:** Điểm thái độ trước/sau (thang EABES rút gọn); tỷ lệ hoàn thành (micro-learning thường 70–85% vs e-learning 20%); ý định tuyển người khuyết tật.

**9. Rủi ro:** *"Micro-learning đầy rẫy rồi"* → Khác ở **nội dung khiếm thị cụ thể + tiếng Việt + dữ liệu vòng lặp từ hành vi thật trong hệ thống**. *"Học xong quên"* → Chính vì thế gắn với đo hành vi (A5), không chỉ đo bài kiểm tra.

**10. Chấm:** Innovation & Impact **3** · User-Centered **4** · Feasibility **5** · AI **3,5**

---

### C4. **AltBot VN** — *"Mô tả ảnh tiếng Việt, ngay trong Zalo và Google Chat."*

**2. Insight/Nỗi đau:** Công sở Việt Nam chạy trên **ảnh chụp màn hình gửi qua Zalo**: bảng lương chụp màn hình, biểu đồ doanh số chụp màn hình, file ERP chụp màn hình. Toàn bộ là vùng tối với screen reader. Copilot chỉ sinh alt text **trong Word/PowerPoint trên Copilot+ PC** — vô nghĩa với SME Việt.

**3. Ai dùng:** Nhân viên khiếm thị (nhận mô tả) + cả nhóm chat (thấy mô tả công khai → dần hình thành thói quen).

**4. Cách hoạt động:**
1. Thêm bot vào nhóm Zalo/Google Chat/Slack của phòng.
2. Ai gửi ảnh → bot tự trả lời mô tả **tiếng Việt, có ngữ cảnh công việc**: nhận diện đây là chart doanh số → đọc số liệu chính + xu hướng; nhận diện bảng → đọc theo hàng/cột; nhận diện màn hình phần mềm → đọc nhãn nút.
3. Người khiếm thị có thể hỏi tiếp: *"cột tháng 8 bao nhiêu?"*.
4. Bot **nhắc nhẹ người gửi**: *"lần sau gửi kèm file Excel sẽ nhanh hơn cho cả nhóm nhé"* → thay đổi hành vi dần (nối B2).
5. Thống kê tháng: nhóm nào gửi ảnh nhiều nhất.

**5. AI dùng ở đâu:** (a) VLM mô tả ảnh có nhận biết loại nội dung (chart/bảng/UI/tài liệu scan) — **prompt khác nhau cho từng loại**, đây là chỗ kỹ thuật thật sự; (b) OCR tiếng Việt có dấu (khó, là rào cản kỹ thuật thật); (c) LLM chuyển số liệu chart thành câu kể có ý nghĩa thay vì đọc từng điểm; (d) hỏi đáp tiếp trên cùng ảnh.

**6. Điểm khác biệt:** Be My AI/Seeing AI là **app cá nhân, dùng camera điện thoại, tiếng Anh là chính**. Đây là bot **trong luồng làm việc nhóm, tiếng Việt, trên Zalo** — và quan trọng: mô tả **hiển thị cho cả nhóm**, biến accessibility thành hành vi tập thể chứ không phải phụ kiện cá nhân.

**7. Prototype 3 ngày:** Bot Slack/Telegram (Zalo OA cần duyệt, để lộ trình). Demo: thả 3 loại ảnh (chart, bảng lương, màn hình ERP) → 3 mô tả chất lượng khác nhau. Rất chắc ăn.

**8. Tác động đo được:** % ảnh có mô tả trong 24h (0% → ~100%); thời gian chờ hiểu nội dung (giờ → giây); **% người gửi tự đính kèm file gốc sau 8 tuần** (chỉ số thay đổi hành vi).

**9. Rủi ro:** *"Mô tả AI sai số liệu tài chính"* → luôn gắn cảnh báo độ tin cậy; với bảng số quan trọng, bot **yêu cầu file gốc thay vì đoán**. *"Đã có nhiều công cụ"* → khác ở tiếng Việt + Zalo + mô tả cho cả nhóm + nhắc hành vi.

**10. Chấm:** Innovation & Impact **3** · User-Centered **4,5** · Feasibility **5** · AI **4**

---

### C5. **Buddy Match** — *"Thứ duy nhất được chứng minh là hiệu quả: quen một người thật."*

**2. Insight/Nỗi đau:** Bằng chứng mạnh nhất trong toàn bộ tổng quan: **quen biết cá nhân với người khiếm thị → odds tuyển dụng ×3,37; từng tuyển rồi → yếu tố dự báo mạnh nhất; liên hệ với chuyên gia phục hồi chức năng nghề nghiệp → ×24,1**. Tức là: **kết nối con người đánh bại mọi công nghệ**. Nhưng ở VN, mạng lưới này nằm rải rác trong Hội Người mù và không ai điều phối.

**3. Ai dùng:** Ứng viên/nhân viên khiếm thị, quản lý sáng mắt, Hội Người mù/Sao Mai/trung tâm dạy nghề, doanh nghiệp.

**4. Cách hoạt động:**
1. Ghép 3 loại cặp: (i) nhân viên khiếm thị mới ↔ **mentor khiếm thị đang đi làm**; (ii) quản lý mới ↔ **quản lý đã từng quản lý nhân viên khiếm thị**; (iii) lãnh đạo cấp cao ↔ **reverse mentor khiếm thị** (được trả phí).
2. AI ghép theo ngành, công cụ, tính cách, ngôn ngữ, múi giờ.
3. Trước mỗi buổi, AI gửi cho cả hai bên **"cheat sheet"**: nên hỏi gì, tránh gì, 3 câu mở đầu.
4. Sau buổi, AI trích xuất bài học **ẩn danh** → nạp vào kho tri thức, làm giàu cho Minh (A2) và Sếp 5 Phút (C3).
5. Reverse mentor **được trả tiền** — biến trải nghiệm sống thành thu nhập, không phải cống hiến miễn phí.

**5. AI dùng ở đâu:** (a) embedding matching đa tiêu chí; (b) LLM sinh chương trình buổi gặp cá nhân hoá; (c) tóm tắt + ẩn danh hoá cuộc gặp thành tri thức tái sử dụng; (d) phát hiện cặp không hợp sớm.

**6. Điểm khác biệt:** Reverse mentoring về khuyết tật đang là xu hướng ở Anh nhưng **hoàn toàn thủ công**. Ở VN chưa có. Và điểm sắc: **trả tiền cho reverse mentor** → giải bài toán "đừng bắt người khuyết tật giáo dục người khác miễn phí" — một lập luận đạo đức mà giám khảo sẽ đánh giá rất cao.

**7. Prototype 3 ngày:** Web app đăng ký + thuật toán ghép + trang chuẩn bị buổi gặp. Demo: ghép thật 2 người trong đội/cộng đồng và quay 20 giây cuộc gặp thật.

**8. Tác động đo được:** Số cặp được ghép; điểm thái độ của quản lý sau 3 buổi; tỷ lệ giữ chân nhân viên khiếm thị 12 tháng; thu nhập tạo ra cho reverse mentor.

**9. Rủi ro:** *"Ít AI quá"* → Đúng, AI ở đây là lớp ghép cặp và chưng cất tri thức, không phải lõi → **nên là module, không nên là sản phẩm chính**. *"Cung mentor hạn chế"* → hợp tác Hội Người mù + Sao Mai; bắt đầu 20 mentor cho TP.HCM là đủ.

**10. Chấm:** Innovation & Impact **3,5** · User-Centered **5** · Feasibility **4** · AI **2,5**

---

### C6. **Meeting Norms Bot** — *"Quy tắc họp hoà nhập, tự chèn vào mọi lời mời."*

**2. Insight/Nỗi đau:** Phiên bản "nghèo" nhưng cực khả thi của A1. Ai cũng biết nên gửi tài liệu trước họp, nên xưng tên khi phát biểu, nên mô tả slide — nhưng không ai nhớ. Cần **hệ thống nhắc, không cần con người nhớ**.

**3. Ai dùng:** Chủ toạ cuộc họp, toàn bộ người dự.

**4. Cách hoạt động:**
1. Tích hợp Google Calendar/Outlook.
2. Khi cuộc họp có người tham dự đã bật hồ sơ tiếp cận (từ B5): tự chèn vào mô tả lịch **5 quy tắc** + nhắc đính kèm tài liệu trước 24h.
3. Nếu 2 giờ trước họp chưa có tài liệu → nhắc riêng chủ toạ.
4. Mở đầu họp, bot đọc 1 câu: *"Cuộc họp này có người dùng phần mềm đọc màn hình. Xin xưng tên trước khi phát biểu và mô tả nội dung hình ảnh."*
5. Cuối tháng: % cuộc họp tuân thủ.

**5. AI dùng ở đâu:** (a) LLM phân loại cuộc họp có cần tài liệu trước không (tránh spam cho cuộc 1-1); (b) kiểm tra file đính kèm có accessible không (PDF scan → cảnh báo); (c) sinh lời nhắc theo ngữ cảnh và quan hệ cấp bậc.

**6. Điểm khác biệt:** Đơn giản đến mức **ai cũng triển khai được tuần sau**. Đây là "ý tưởng bảo hiểm" — nếu prototype lớn hỏng, cái này vẫn chạy.

**7. Prototype 3 ngày:** Google Apps Script + Calendar API. Dựng trong nửa ngày.

**8. Tác động đo được:** % cuộc họp gửi tài liệu trước (thường <30% → >85%); % cuộc họp có tài liệu tiếp cận được.

**9. Rủi ro:** *"Quá nhỏ"* → là tính năng, không phải sản phẩm. *"Tiết lộ khuyết tật của người tham dự"* → Giải pháp: **bật quy tắc cho TẤT CẢ cuộc họp**, không chỉ cuộc có người khiếm thị → không ai bị lộ, và văn hoá thay đổi toàn diện. (Đây là chi tiết thiết kế khiến giám khảo gật đầu.)

**10. Chấm:** Innovation & Impact **2,5** · User-Centered **4,5** · Feasibility **5** · AI **2,5**

---

### C7. **Skill Signal / Chợ kỹ năng ngược** — *"Đừng hỏi người khiếm thị làm được gì. Hỏi công việc nào đã sẵn sàng."*

**2. Insight/Nỗi đau:** Ở VN, người khiếm thị bị đẩy vào massage/thủ công không phải vì thiếu năng lực mà vì **khoảng trống kỹ năng–thị trường** (Sao Mai chỉ rõ) và vì không ai biết **công việc nào thực sự làm được không cần thị giác**. Đồng thời có nhu cầu thật đang tăng: CSKH từ xa, hỗ trợ kỹ thuật, gán nhãn dữ liệu, **kiểm thử khả năng tiếp cận** (chính Katalon — nhà tài trợ — là công ty kiểm thử phần mềm!).

**3. Ai dùng:** Doanh nghiệp (đăng việc), trung tâm dạy nghề/Hội Người mù (định hướng đào tạo), người khiếm thị.

**4. Cách hoạt động:**
1. Doanh nghiệp dán JD bất kỳ.
2. AI **phân rã JD thành các nhiệm vụ nguyên tử** và chấm từng nhiệm vụ: cần thị giác thật sự / thay thế được bằng công nghệ / không liên quan thị giác.
3. Ra kết quả: *"Vị trí này 87% nhiệm vụ không cần thị giác. 2 nhiệm vụ còn lại có thể tái phân công hoặc thay bằng công cụ X."* → đánh trúng 82,3% nhà tuyển dụng "không biết họ làm thế nào".
4. Tổng hợp toàn thị trường → **bản đồ nghề nghiệp**: ngành nào đang mở nhất cho người khiếm thị ở TP.HCM.
5. Gửi tín hiệu ngược cho trung tâm dạy nghề: **nên dạy gì trong 6 tháng tới**.

**5. AI dùng ở đâu:** (a) LLM phân rã JD thành task graph; (b) RAG trên thư viện điều chỉnh hợp lý (JAN/AskJAN + case VN) để gợi ý giải pháp cho từng nhiệm vụ; (c) phân tích cụm trên hàng ngàn JD để ra bản đồ nghề; (d) dự báo nhu cầu kỹ năng.

**6. Điểm khác biệt:** Mọi nền tảng việc làm cho người khuyết tật ở VN đều là **bảng tin việc làm**. Đây là **công cụ phân tích khả thi hoá công việc** — trả lời đúng câu hỏi khiến nhà tuyển dụng từ chối. Và nó tạo ra **dữ liệu định hướng đào tạo cấp quốc gia**, thứ Hội Người mù đang thiếu.

**7. Prototype 3 ngày:** Web app: dán JD → task graph trực quan + điểm khả thi + gợi ý điều chỉnh. Demo: chạy trên một JD thật của **Katalon hoặc P&G** (nhà tài trợ) → cực kỳ ấn tượng và cá nhân hoá cho giám khảo.

**8. Tác động đo được:** Số vị trí được "mở khoá"; % nhà tuyển dụng đổi ý sau khi xem phân tích; độ khớp giữa chương trình đào tạo và nhu cầu thị trường.

**9. Rủi ro:** *"AI khẳng định người mù làm được việc mà thực tế không làm được"* → Kết quả luôn kèm **mức độ chắc chắn + case tham chiếu thật**, và có vòng xác nhận từ người khiếm thị đang làm nghề đó. *"Nghe như hạ thấp công việc"* → Ngôn ngữ luôn là "tái thiết kế công việc", không phải "giảm yêu cầu".

**10. Chấm:** Innovation & Impact **4,5** · User-Centered **4** · Feasibility **4** · AI **4,5**

---

## PHẦN III — TOP 5 MẠNH NHẤT

### 🥇 1. **AdvocateBot / Trợ lý đòi quyền** (B2) — *tổng 19/20*
**Vì sao số 1:** Đây là ý tưởng duy nhất chạm vào **nỗi đau cảm xúc sâu nhất và chưa ai chạm tới**: người khiếm thị phải đi xin, ngày này qua ngày khác, và phải xin thật khéo. Nó **đảo chiều gánh nặng** — đúng tinh thần "sửa công sở, không sửa người". Kỹ thuật vừa tầm 3 ngày (bot chat + VLM + LLM viết tiếng Việt), demo 45 giây là hiểu, và có **chỉ số impact thật sự thuyết phục** (không phải "số mô tả được sinh ra" mà "% đồng nghiệp tự thay đổi hành vi sau 8 tuần"). Khác biệt rõ ràng với Be My Eyes Workplace vừa ra mắt 02/2026.

### 🥈 2. **HireReady — Công ty bị phỏng vấn** (B1) — *18,5/20*
**Vì sao:** Cú đảo ngược quyền lực sắc nhất, và là ý tưởng **chạy được trên dữ liệu thật ngay trong hackathon** (chấm live trang tuyển dụng của doanh nghiệp Việt → không ai cãi được về tính khả thi). Dùng browser-use agent điều khiển qua accessibility tree là điểm kỹ thuật "xịn" mà giám khảo kỹ thuật (Katalon) sẽ thích. Giải quyết trực diện rào cản đầu tiên: người khiếm thị **không nộp nổi hồ sơ**, chứ chưa nói đến bị từ chối.

### 🥉 3. **Minh — Đồng nghiệp ảo** (A2) — *18,5/20*
**Vì sao:** Ghi điểm cảm xúc cao nhất khi pitch (mời giám khảo nói chuyện với Minh ngay trên sân khấu), và có **lập luận học thuật đánh bại mọi đội khác**: "chúng tôi KHÔNG làm VR bịt mắt, vì nghiên cứu chứng minh nó khiến người ta khó chịu hơn với người khuyết tật". Bám đúng liều lượng can thiệp đã được chứng minh (1 giờ → hiệu quả giữ 4 tháng). Rủi ro duy nhất — "AI đóng giả người khuyết tật" — là rủi ro **trả lời được bằng đồng thiết kế + chia doanh thu**, và chính câu trả lời đó lại ghi điểm.

### 4. **EchoMeet** (A1) — *18,5/20*
**Vì sao:** Nỗi đau hằng ngày rõ nhất, AI dày nhất (VLM + ASR + LLM + TTS), và demo có sức nặng giác quan (cho khán giả **nghe** cuộc họp qua tai người khiếm thị). Trừ điểm vì **rủi ro cạnh tranh với Microsoft/Zoom** và độ khó kỹ thuật trong 3 ngày cao nhất bộ. Nếu chọn, phải chốt sớm phạm vi: chỉ làm phần **nudge hành vi**, không cố làm mô tả real-time hoàn hảo.

### 5. **Skill Signal** (C7) — *17/20*
**Vì sao:** Đánh trúng con số đau nhất (**82,3% nhà tuyển dụng không biết người khiếm thị làm việc bằng cách nào**) bằng một cơ chế thông minh: phân rã JD thành nhiệm vụ nguyên tử. Rất hợp bối cảnh VN (khoảng trống kỹ năng–thị trường), và có thể demo trực tiếp trên JD của chính nhà tài trợ. Đồng thời tạo ra dữ liệu công ích cho Hội Người mù.

---

## PHẦN IV — KHUYẾN NGHỊ CHIẾN LƯỢC CHO 3 NGÀY

**1. Đừng làm 1 ý tưởng đơn lẻ — hãy làm 1 nền tảng với 3 module có câu chuyện chung.**
Đề xuất kiến trúc thắng giải:

> **Offixed — "Chúng tôi không sửa người khiếm thị. Chúng tôi sửa nơi làm việc."**
> - **Trước khi vào làm:** HireReady (B1) — chấm điểm công ty, không chấm ứng viên.
> - **Khi đã vào làm:** AdvocateBot (B2) — chuyển gánh nặng tự vận động sang AI.
> - **Cả tổ chức:** Access Tax Meter (A3) — biến bất công thành con số tài chính cho lãnh đạo.
> - *(Dự phòng nếu dư thời gian:)* Minh (A2) làm phần "wow" mở đầu video.

Ba module này nối thành **một vòng lặp dữ liệu khép kín**: đo rào cản → hành động → chứng minh tiết kiệm → lãnh đạo chi tiền → sửa hệ thống. Đó là thứ biến một demo thành một sản phẩm có mô hình kinh doanh.

**2. Ba "vũ khí pitch" bắt buộc đưa vào deck:**
- **"Việt Nam mất 3% GDP"** (ILO) — slide vấn đề.
- **"82,3% nhà tuyển dụng không biết người khiếm thị làm việc bằng cách nào"** — slide insight (vấn đề là **thiếu hình dung**, không phải thiếu thiện chí).
- **"Nghiên cứu chứng minh mô phỏng bịt mắt khiến người ta khó chịu hơn với người khuyết tật"** — slide khác biệt (đánh bại mọi đội làm VR empathy).

**3. Ba việc làm ngay trong ngày 1 để ăn điểm User-Centered Design:**
- Phỏng vấn **ít nhất 2 người khiếm thị đang đi làm** (qua Hội Người mù TP.HCM hoặc Sao Mai Center) và quay lại — video pitch có tiếng nói người dùng thật thắng mọi slide đẹp.
- Test prototype bằng **NVDA thật** (miễn phí, có giọng Việt) và quay màn hình — chứng minh sản phẩm của chính mình accessible.
- Ghi rõ trên slide: **prototype của chúng tôi đạt WCAG 2.2 AA / ISO/IEC 40500:2025** — đội nào làm sản phẩm accessibility mà website không accessible sẽ bị giám khảo hỏi ngay.

**4. Cạm bẫy phải tránh:** đừng làm thêm một app mô tả ảnh cho người khiếm thị. Be My Eyes Workplace ra mắt 02/2026, Envision Ally, Seeing AI, Copilot alt-text đã chiếm hết chỗ đó. **Đất trống nằm ở hành vi tổ chức, tiếng Việt, và SME.**

---

**Nguồn:**
- [Attitudes of employers towards people with visual impairment: a scoping review (Frontiers/PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11611842/)
- [AI-Mediated Hiring and the Job Search of Blind and Low-Vision Individuals (arXiv)](https://arxiv.org/pdf/2601.11884)
- [Understanding the Career Mobility of Blind and Low Vision Software Professionals (arXiv)](https://arxiv.org/pdf/2404.17036)
- [The Accessibility Paradox: Blind and Low Vision Employees in Tech (arXiv)](https://arxiv.org/pdf/2508.18492)
- [Employer Bias Thwarts Many Blind Workers (NFB)](https://nfb.org/employer-bias-thwarts-many-blind-workers)
- [Disability Employment Research: Key Takeaways (AFB)](https://afb.org/research-and-initiatives/employment/reviewing-disability-employment-research-people-blind-visually)
- [The Most Common Workplace Barriers for Blind Employees (Be My Eyes)](https://www.bemyeyes.com/business/blog/most-common-workplace-barriers-for-blind-employees/)
- [Be My Eyes Announces New Workplace Accessibility Tools](https://www.bemyeyes.com/business/news/be-my-eyes-announces-new-workplace-accessibility-tools/)
- [The hidden disability bias in AI-powered recruitment (IHRB)](https://www.ihrb.org/latest/the-hidden-disability-bias-in-ai-powered-recruitment)
- [AI is causing massive hiring discrimination based on disability (The Hill)](https://thehill.com/opinion/technology/4576649-ai-is-causing-massive-hiring-discrimination-based-on-disability/)
- [Job Application Forms: The Accessibility Failures That Quietly Cost You Disabled Candidates](https://dev.to/agentkit/job-application-forms-the-accessibility-failures-that-quietly-cost-you-disabled-candidates-4mg1)
- [The Perils of Playing Blind (NFB Journal of Blindness Innovation and Research)](https://nfb.org/perils-playing-blind-problems-blindness-simulation-and-better-way-teach-about-blindness)
- ["Sympathy" vs. "Empathy": Comparing I2Audits and disability simulations (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9483208/)
- [Insights on Disclosure and Accommodations for Employees (Signal49, 10/2025)](https://www.signal49.ca/in-fact/insights-on-disclosure-and-accommodations-for-employees_oct2025/)
- [Applying Performance and Conduct Standards to Employees with Disabilities (EEOC)](https://www.eeoc.gov/laws/guidance/applying-performance-and-conduct-standards-employees-disabilities)
- [Employment support models for people with visual impairments in Vietnam (Sao Mai Center)](https://saomaicenter.org/en/news/general-news/employment-support-models-people-visual-impairments)
- [Cả nước có khoảng 6,2 triệu người khuyết tật (MOLISA)](https://www.molisa.gov.vn/baiviet/29543?tintucID=29543)
- [Inclusion of People with Disabilities in Viet Nam (ILO)](https://www.ilo.org/publications/inclusion-people-disabilities-viet-nam)
- [Report on Improving Employment Opportunities for Persons with Disabilities in Viet Nam (UNDP)](https://www.undp.org/vietnam/publications/report-improving-employment-opportunities-persons-disabilities-viet-nam)
- [Từ 01/10/2025, doanh nghiệp có từ 30% lao động là người khuyết tật được miễn thuế TNDN](https://thuvienphapluat.vn/ma-so-thue/phap-luat-thue/tu-01102025-doanh-nghiep-co-tu-30-so-lao-dong-la-nguoi-khuyet-tat-duoc-mien-thue-tndn-208170.html)
- [TP HCM tuyển dụng hơn 3.000 vị trí, mở rộng cơ hội cho người khuyết tật (NLĐ, 9/2025)](https://nld.com.vn/tp-hcm-tuyen-dung-hon-3000-vi-tri-mo-rong-co-hoi-cho-nguoi-khuyet-tat-196250918160910264.htm)
- [Gần 1.000 lao động khiếm thị có việc làm từ nghề tẩm quất](https://baohaiphong.vn/gan-1-000-lao-dong-khiem-thi-co-viec-lam-tu-nghe-tam-quat-548173.html)
- [New ISO Standards and Their Impact on WCAG 2.2 Conformance (ISO/IEC 40500:2025)](https://accessibleweb.com/disability-law/iso-standards-wcag-2-2-conformance/)
- [EN 301 549 – European accessibility standard](https://www.wcag.com/compliance/en-301-549/)
- [ISO 30415 Diversity & Inclusion (TÜV SÜD)](https://www.tuvsud.com/en-us/services/auditing-and-system-certification/iso-30415)
- [Textio Recruiting](https://textio.com/products/recruiting)
- [Accessible Hiring | Microsoft Accessibility](https://www.microsoft.com/en-us/diversity/inside-microsoft/cross-disability/hiring)
- [Disability Fundamentals Training for Managers (Disability:IN)](https://www.disabilityin.org/resource/disability-fundamentals-training-for-managers)
- [Automatic alt text generation in Word and PowerPoint on Copilot+ PCs (Microsoft)](https://techcommunity.microsoft.com/blog/microsoft365insiderblog/automatic-alt-text-generation-in-word-and-powerpoint-on-copilot-pcs/4479186)
- [The Value of Reverse Mentoring (Disability Connect)](https://disabilityconnect.org.uk/f/the-value-of-reverse-mentoring)
agentId: a2d14813cbab5b7db (use SendMessage with to: 'a2d14813cbab5b7db', summary: '<5-10 word recap>' to continue this agent)
<usage>subagent_tokens: 138674
tool_uses: 25
duration_ms: 717583</usage>Đã xong nghiên cứu (14 truy vấn/fetch) và bộ ý tưởng. Toàn bộ nội dung bên dưới.

---

# HƯỚNG 2 — TECHNOLOGICAL: AI cho người khiếm thị tại nơi làm việc
**Đội Offixed | ADC Hackathon 2026 | RMIT Việt Nam**

---

## PHẦN I — NGHIÊN CỨU NỀN (dùng để pitch, có nguồn)

### 1.1 Bối cảnh Việt Nam — con số để mở slide

| Chỉ số | Số liệu | Nguồn |
|---|---|---|
| Tỷ lệ thất nghiệp của người mù tại Việt Nam | **~94%** | NV Access (báo cáo hợp tác với Sao Mai Center) |
| Người khuyết tật Việt Nam | >8 triệu, ~7,2% dân số từ 2 tuổi | Bộ Y tế 2025 |
| Tỷ lệ tham gia lực lượng lao động của NKT | **giảm từ 31,7% (2016) → 23,9% (2023)** | Tạp chí Kinh tế Tài chính |
| Khoảng cách tham gia LĐ giữa NKT và người không KT | tăng từ 50,4 → **53,5 điểm %** | như trên |
| NKT qua đào tạo nghề có chứng chỉ | **8,8%** so với 29,2% của lực lượng lao động chung | như trên |
| Thất nghiệp chung VN (9 tháng 2025) | 2,22% | Tổng cục Thống kê |

**Câu chốt cho pitch:** thị trường lao động Việt Nam đang tốt lên (thất nghiệp 2,22%) nhưng người khuyết tật đang **rơi lại phía sau nhanh hơn** — tỷ lệ tham gia lao động giảm 8 điểm % trong 7 năm. Đây không phải vấn đề thiếu việc, mà là vấn đề **không tiếp cận được công cụ làm việc số**.

Bối cảnh hạ tầng: lương trung bình VN <1.800 USD/năm, trong khi JAWS có giá gần bằng cả năm lương → **NVDA (miễn phí) là screen reader thống trị ở VN**. Sao Mai Center (Q. Tân Phú, TP.HCM, thành lập 2001) đã dịch bộ tài liệu NVDA chính thức sang tiếng Việt, 400+ người dùng, đưa 32 người vào việc làm sau khóa NVDA + MS Office, và chính Sao Mai đang tuyển dụng 17 nhân sự khiếm thị. **Đây là đối tác thử nghiệm người dùng thật, cách RMIT Nam Sài Gòn ~40 phút — dùng để ghi điểm mạnh tiêu chí User-Centered Design.**

### 1.2 Người khiếm thị làm việc trên máy tính bằng gì

- **Screen reader** (NVDA, JAWS, VoiceOver, Narrator, TalkBack): đọc nội dung màn hình thành giọng nói theo **luồng tuyến tính một chiều**. **95% nhân viên khiếm thị dùng screen reader bên thứ ba tại nơi làm việc** (NRTC on Blindness and Low Vision).
- **Refreshable braille display**: đọc bằng ngón tay, thường 40 ô — chỉ thấy ~1 dòng tại một thời điểm. Giá rất cao ở VN.
- **Phím tắt**: toàn bộ thao tác bằng bàn phím, không chuột. Người dùng thạo nghe TTS ở **300–600 từ/phút** (người sáng mắt đọc ~250 wpm).
- **Magnifier** (ZoomText, Fusion, Windows Magnifier): cho nhóm low vision — nhưng ở mức phóng 200%+ thì layout vỡ, focus nhảy, **mỏi mắt và năng suất giảm mạnh**.
- **Tiếng Việt**: NVDA có giao diện tiếng Việt, nhưng giọng TTS tiếng Việt chất lượng cao vẫn hạn chế; **code-switching Việt–Anh** (rất phổ biến trong văn phòng VN: "deadline", "meeting", "KPI", "báo cáo Q3") khiến bộ đọc phát âm sai và gây mệt. Nội dung không gắn thẻ ngôn ngữ (`lang`) làm screen reader đọc tiếng Việt bằng giọng Anh → gần như không hiểu được.

### 1.3 Những tác vụ công sở KHÓ NHẤT với screen reader (xếp theo mức độ chặn)

**Mức 1 — Chặn hoàn toàn (screen reader trả về trống hoặc vô nghĩa):**
1. **Biểu đồ và dashboard**: "Screen reader không diễn giải được visual phức tạp (bản đồ, scatter plot, chart dày đặc) nếu không có biểu diễn tương đương của dữ liệu" (Tableau). **Tableau không hỗ trợ bàn phím/screen reader cho bất kỳ tương tác nào với marks, tooltip.** Power BI khá hơn (Ctrl+Shift+F11 = Show Visuals as Table) nhưng vẫn phải người tạo báo cáo bật đúng.
2. **PDF scan không OCR**: **67% PDF không đọc được một phần hoặc hoàn toàn** (Equidox + NFB); **41% người dùng AT ở 14 quốc gia nói hơn một nửa PDF họ gặp không được tag đúng**. Mô tả kinh điển: *nhân viên khiếm thị đọc đến trang 1 mới phát hiện file là scan, phải tự chạy OCR, kiểm tra thứ tự đọc, đoán xem bảng biểu đi đâu — đến giờ họp thì cả nhóm đã đọc xong báo cáo còn họ vẫn đang sửa file.*
3. **Whiteboard online**: Zoom Whiteboard **không truy cập được bằng screen reader và bàn phím — tương đương một tấm ảnh không alt text**. Khảo sát ASSETS 2025 (ACM SIGACCESS): người lao động khiếm thị chấm Zoom Whiteboard 4,37/5, Microsoft Whiteboard 4,1, Stormboard 3,13, **Miro 2,75/5** — và **nhìn chung đều không hài lòng với tất cả**.
4. **Sơ đồ, SmartArt, ảnh chụp màn hình dán vào slide**: slide deck "làm phẳng thông tin thành screenshot và sơ đồ không tag".

**Mức 2 — Dùng được nhưng cực kỳ tốn sức:**
5. **Excel phức tạp**: **merged cell là rào cản lớn nhất** — screen reader không hiểu lưới, bỏ qua nội dung. Ô trống làm đứt mạch logic. Tên sheet không nhãn. **Conditional formatting đỏ/vàng/xanh = thông tin chỉ mã hóa bằng màu → mất trắng với người khiếm thị VÀ người mù màu.** Ribbon và floating toolbar cản trở điều hướng.
6. **Kanban / Jira / Trello**: Bloomberg (9/2025) có hẳn bài *"PowerPoint, Jira Still Have Accessibility Obstacles for Blind Workers"*. Trello kéo-thả với NVDA có lúc **đọc ra một chuỗi số và ký tự vô nghĩa**. Bản chất Kanban là quan hệ KHÔNG GIAN hai chiều (cột × thẻ × swimlane) — screen reader chỉ đọc tuyến tính.
7. **Bảng dữ liệu lồng nhau, form nội bộ**: 51% trang web thiếu form label, 46,3% có empty link, 30,6% empty button (WebAIM Million 2026).
8. **IDE / lập trình**: lập trình viên khiếm thị "không hài lòng với độ tiếp cận của hầu hết IDE do lạm dụng trừu tượng hóa thị giác"; khó điều hướng vào/ra cấu trúc lồng nhau. **Mới 2025: AI code completion hiện gợi ý dưới dạng "ghost text" xám — screen reader user không có cách nào kiểm tra gợi ý trước khi chấp nhận → dẫn tới sửa code ngoài ý muốn.**
9. **Figma/Canva**: canvas thị giác thuần, gần như không có đường vào.

**Mức 3 — Họp và làm việc từ xa:**
10. Nghiên cứu so sánh Zoom / Teams / Google Meet / Skype: **Zoom accessible hơn Teams cho người mù, nhưng cả hai đều còn rào cản**. Share Screen **chỉ accessible với chính người đang chia sẻ**. Chat trong lúc có người nói = rào cản, thực tế phải cử "chat-wrangler" đọc chat hộ.
11. **Ngôn ngữ cơ thể**: người khiếm thị mất hoàn toàn eye contact, gật/lắc đầu, ai đang giơ tay, ai đang nhíu mày khi mình nói. Nghiên cứu ASSETS 2024 và UMD đang thiết kế "accessible nonverbal cues" bằng audio + haptic cho 3 hành vi: eye contact, lắc đầu, gật đầu.
12. Câu nói giết chết cuộc họp: **"Như các bạn thấy ở đây…"** trong khi chia sẻ màn hình.

**Mức 4 — Nhóm mù màu và low vision (thường bị bỏ quên):**
13. **~8% nam giới và 0,5% nữ giới** có rối loạn sắc giác, chủ yếu đỏ-lục (deuteranopia/protanopia). Bảng màu Conditional Formatting đỏ/vàng/xanh mặc định của Excel và heatmap trong dashboard là **cái bẫy hằng ngày**. **83,9% trang web có lỗi low contrast** — lỗi phổ biến nhất WebAIM Million 2026.

### 1.4 Bối cảnh web/tài liệu chung đang XẤU ĐI

WebAIM Million 2026 (top 1.000.000 trang chủ): **95,9% trang có lỗi WCAG 2 phát hiện được** (tăng từ 94,8%), **56,1 lỗi/trang** (+10,1% so với 2025), **53,1% trang thiếu alt text**, trung bình 66,6 ảnh/trang và **hơn 1/4 ảnh có alt text thiếu, trùng lặp hoặc vô nghĩa**. Đây là **năm đầu tiên từ 2020 chỉ số đi lùi** — vì AI đang sinh ra nội dung nhanh hơn tốc độ ai đó làm nó accessible.

**Luận điểm pitch cực mạnh:** AI đang làm rào cản TĂNG chứ không giảm. Giải pháp phải đi ngược dòng đó.

### 1.5 Công cụ ĐÃ CÓ — và CÁI GÌ CÒN THIẾU

| Công cụ | Mạnh ở | Yếu ở bối cảnh CÔNG VIỆC |
|---|---|---|
| **Be My Eyes / Be My AI** | Mô tả ảnh, kết nối tình nguyện viên sáng mắt | Sinh hoạt hằng ngày; tình nguyện viên **không được xem dữ liệu công ty** |
| **Be My Eyes Workplace** (ra mắt 11/02/2026 — đối thủ trực diện nhất) | Workplace AI (mô tả màn hình), Workplace Reader (PDF/ảnh/graph), Workplace Connect (đồng nghiệp sáng mắt điều khiển từ xa); SSO SAML, SOC 2, Win/macOS, tích hợp kính Meta AI | **Tiếng Anh, giá enterprise, mô tả chung chung theo ảnh**. Không hiểu ngữ nghĩa Excel/công thức. Không sửa nguồn. Không có tiếng Việt, không tích hợp MISA/Base.vn/KiotViet/Zalo OA. Doanh nghiệp SME Việt không mua nổi |
| **Microsoft Seeing AI** | Đọc chữ, tiền, màu, cảnh | Đời sống; không đi vào workflow công sở |
| **Envision AI / Glasses, Google Lookout, OrCam MyEye, Ray-Ban Meta** | Camera đeo, đọc thế giới vật lý | Hướng ra **thế giới thật**, không phải **màn hình công việc**; phần cứng đắt |
| **Aira** | Agent người thật qua camera | Chi phí theo phút; rủi ro lộ dữ liệu doanh nghiệp |
| **ChatGPT voice / Claude** | Hỏi đáp linh hoạt | **Không nằm trong ứng dụng đang làm việc**, phải copy-paste thủ công; không có ngữ cảnh file/hệ thống nội bộ |
| **VoiceOver Image Descriptions, NVDA AI add-ons** | Mô tả ảnh nhanh tại chỗ | Một câu ngắn; **không mô tả được cấu trúc dữ liệu, biểu đồ có số, bảng lồng nhau** |
| **Sullivan+** | Phổ biến ở Hàn/Đông Nam Á | Đời sống |

**KHOẢNG TRỐNG (gap statement để đưa thẳng vào deck):**
> Gần như toàn bộ công cụ AI cho người khiếm thị hiện nay giải bài toán **"mô tả thế giới vật lý"**. Rất ít công cụ giải bài toán **"hoàn thành một tác vụ công sở chuyên sâu"**. Và **gần như không có gì** cho **tiếng Việt, phần mềm doanh nghiệp Việt, và mức giá SME Việt Nam**.
>
> Thêm nữa: mọi công cụ hiện có đều là **thông dịch một chiều** — chúng dịch nội dung xấu thành âm thanh, nhưng **không sửa nguồn**. Người khiếm thị phải trả "thuế truy cập" mỗi ngày cho lỗi của người khác.

### 1.6 Năng lực kỹ thuật khả dụng năm 2026 (để chứng minh Feasibility + AI Utilization)

- **Multimodal LLM** (Claude / GPT-5 / Gemini): đọc ảnh, biểu đồ, screenshot, sơ đồ; đủ tốt cho mô tả cấu trúc — nhưng **không nên tin số liệu đọc từ ảnh**.
- **ASR tiếng Việt**: **PhoWhisper (VinAI)** — open source, fine-tune Whisper trên **844 giờ** giọng Việt đa vùng miền, SOTA trên benchmark ASR tiếng Việt. Có thêm nghiên cứu **TSPC** cho code-switching Việt–Anh — rất đúng bối cảnh văn phòng VN.
- **TTS tiếng Việt**: XTTS/viXTTS, FPT.AI, Zalo AI, VBee — có thể tạo **nhiều giọng khác nhau cho các vai khác nhau** (đây là chìa khóa UX phi thị giác).
- **Computer-use agent**: đã dùng được nhưng **chưa tin được hoàn toàn**. Nghiên cứu EMNLP 2026 (arXiv 2609.00524) — diary study 3 tuần, 8 người mù, **1.258 lệnh trên 12 ứng dụng desktop** với prototype OLLA: **GPT-5 đạt tỷ lệ thành công cao nhất chỉ 52,5%**. Bốn nhóm lỗi: **grounding, planning, constraint-tracking, termination**. Kết luận then chốt của nhóm tác giả: người lao động khiếm thị cần **cộng tác người–AI, không phải tự động hóa hoàn toàn**.
  → **Đây là luận điểm thiết kế đắt giá nhất cho đội: đừng hứa "AI làm hộ tất cả". Hứa "AI làm phần thao tác, con người giữ quyền quyết định và kiểm chứng". Giám khảo sẽ rất thích vì nó vừa khiêm tốn vừa có bằng chứng.**
- **Accessibility API**: UI Automation (Windows), AT-SPI (Linux), AXAPI (macOS), **Accessibility Object Model (AOM) + DOM** trên web. Nghiên cứu "Screen Reader AI" (2025) xây **live semantic scene graph** từ DOM + AOM — hướng kỹ thuật đúng: **đọc cây accessibility, không đọc pixel**, vì vừa chính xác hơn vừa rẻ hơn vừa nhanh hơn.
- **Sonification**: đã có nền tảng chín — **Highcharts Sonification Studio** (Highsoft × Georgia Tech Sonification Lab), grammar khai báo **Erie**. Người dùng khiếm thị thấy sonification hữu ích để nắm **tổng quan, xu hướng, outlier**; nhưng nghiên cứu cũng cảnh báo **thiếu kinh nghiệm nghe có thể dẫn tới diễn giải sai** → phải luôn đi kèm lời mô tả.
- **WCAG 2.2 / ARIA**: khung chuẩn để chấm điểm tài liệu và giao diện tự động.
- **Rủi ro nền:** AI mô tả ảnh dễ **hallucination** — "tự tin khẳng định chi tiết không có thật". AFB gọi đây là *"ảo giác về sự tiếp cận"* (illusion of access): người dùng không thể tự kiểm chứng nên tin luôn. **Mọi ý tưởng dưới đây đều phải trả lời được câu hỏi này.**

---

## PHẦN II — 22 Ý TƯỞNG

> Quy ước chấm điểm: **IN** = Innovation & Impact, **UX** = User-Centered Design & Accessibility, **FE** = Feasibility & Practicality, **AI** = Utilization of AI. Thang 1–5.

---

# NHÓM A — "HAY HO / WOW"
*Demo lên là giám khảo trầm trồ*

---

## A1. EchoSheet
**"Nghe được cả bảng tính, không chỉ từng ô."**

**2. Insight / nỗi đau thật**
Kế toán khiếm thị mở file `BaoCao_DoanhThu_Q3.xlsx`: 14 sheet, merged cell ở header, 3 dòng trống ngăn vùng, conditional formatting đỏ/xanh. Screen reader đọc tuần tự: "A1, trống. B1, trống. C1, Tháng…". Để biết "doanh thu chi nhánh nào giảm mạnh nhất", người sáng mắt liếc 2 giây; người khiếm thị mất 40 phút mũi tên. **Merged cell được ghi nhận là rào cản accessibility lớn nhất trong Excel**, và **thông tin mã hóa bằng màu bị mất hoàn toàn** — với cả người khiếm thị lẫn 8% nam giới mù màu.

**3. Ai dùng**
Kế toán, nhân viên tài chính, admin, nhân viên kho, chuyên viên phân tích, trợ lý dự án — **nhóm nghề mà người khiếm thị ở VN được đào tạo nhiều nhất** (Sao Mai đào tạo NVDA + MS Office).

**4. Cách hoạt động (5 bước, trải nghiệm âm thanh)**
1. Mở file → phím tắt `Ctrl+Shift+E`. Giọng nam trầm đọc **"Bản đồ file"**: *"14 sheet. Sheet đang mở: Doanh thu Q3. Vùng dữ liệu chính A3 đến M48. 3 vùng phụ. 12 công thức. 4 ô lỗi. 1 sheet ẩn tên 'Nhap lieu'."* — **thứ mà screen reader hôm nay không bao giờ nói được.**
2. **Chế độ radar không gian**: dùng mũi tên di chuyển, EchoSheet phát **earcon panning trái–phải theo vị trí cột** và **pitch theo độ lớn giá trị** (cao = lớn). Lướt một dòng 12 tháng trong 3 giây và **nghe ra** tháng nào tụt.
3. **Nghe vùng**: `Ctrl+Shift+S` trên vùng đang chọn → sonification 12 nốt + câu chốt: *"Xu hướng giảm từ tháng 7. Đáy tháng 9, thấp hơn đỉnh 31%. Một điểm bất thường tháng 4 cao gấp đôi trung bình."*
4. **Hỏi bằng tiếng Việt**: *"Chi nhánh nào giảm mạnh nhất quý này?"* → agent **không nhìn ảnh** mà đọc trực tiếp giá trị ô qua Office.js/COM, tự sinh truy vấn, **trả lời kèm địa chỉ ô để tự kiểm chứng**: *"Chi nhánh Đà Nẵng, giảm 31%. Ô D27 đến D30. Nhấn Enter để nhảy tới."*
5. **Giải mã màu**: `Ctrl+Shift+C` → *"Ô này đang tô đỏ theo quy tắc: giá trị nhỏ hơn 80% chỉ tiêu."* — **biến màu thành ngữ nghĩa**.

**5. AI dùng ở đâu (cụ thể)**
- **LLM text-to-formula/query**: câu hỏi tiếng Việt → truy vấn trên dữ liệu ô thật (không phải trên ảnh) → **hallucination về số gần như bằng 0**.
- **ASR PhoWhisper** cho chế độ hỏi bằng giọng nói, chịu được code-switching Việt–Anh ("doanh thu quý ba branch Đà Nẵng").
- **TTS tiếng Việt đa giọng**: giọng A = dữ liệu, giọng B = nhận định của AI, giọng C = cảnh báo. **Người dùng luôn phân biệt được đâu là SỰ THẬT, đâu là SUY ĐOÁN — chỉ bằng cách nghe.** Đây là điểm thiết kế UX ăn tiền nhất.
- **Sonification engine** (Web Audio API / Tone.js): map giá trị → pitch, cột → panning stereo, outlier → timbre khác.
- **LLM phát hiện cấu trúc**: tự nhận diện header thật kể cả khi bị merge, đoán ý nghĩa cột từ nội dung.

**6. Điểm khác biệt**
Be My AI / Seeing AI / ChatGPT **chụp ảnh màn hình rồi mô tả** → sai số, không thao tác được, không biết công thức, không biết ô nào đang tô màu vì lý do gì. EchoSheet **sống bên trong Excel, đọc mô hình dữ liệu**. Và **chưa có công cụ nào trên thị trường làm sonification tích hợp thẳng trong Excel bằng tiếng Việt**.

**7. Prototype 3 ngày**
Excel Add-in (Office.js, TypeScript) hoặc Google Sheets Apps Script (nhanh hơn, demo trình duyệt mượt hơn). Ngày 1: đọc range + "bản đồ file" + TTS. Ngày 2: sonification + Q&A qua API LLM. Ngày 3: giải mã conditional formatting + polish âm thanh.
**Kịch bản video 5 phút:** tắt màn hình (hoặc che bằng overlay đen) → chỉ nghe. Bắt đầu bằng 20 giây NVDA đọc file thật ("A1 trống, B1 trống…") cho giám khảo **cảm nhận sự tra tấn** → bật EchoSheet → 45 giây sau đã trả lời được câu hỏi kinh doanh. **Khoảnh khắc WOW: nghe ra đường cong doanh thu.**

**8. Tác động đo được**
Thời gian hoàn thành tác vụ "tìm bất thường trong bảng 500 dòng": từ ~40 phút → <3 phút (**giảm ~93%**). Số phím bấm: từ ~2.000 → ~15. Mở thêm nhóm nghề kế toán/phân tích — nhóm có nhu cầu tuyển lớn tại VN.

**9. Rủi ro và cách trả lời**
- *"AI đọc sai số?"* → **Không đọc số từ ảnh.** Số lấy từ API ô. AI chỉ diễn giải. Mọi câu trả lời kèm địa chỉ ô để tự kiểm tra.
- *"Dữ liệu tài chính gửi lên cloud?"* → Chế độ local: sonification + bản đồ file chạy hoàn toàn offline; chỉ phần ngôn ngữ mới gọi API, có tùy chọn on-prem/Azure OpenAI khu vực, và **chế độ ẩn danh hóa** (gửi schema + thống kê, không gửi giá trị thô).
- *"Người dùng có hiểu sonification không?"* → Nghiên cứu ICAD cảnh báo đúng điều này, nên **luôn có lời mô tả đi kèm**, có onboarding 3 phút, tốc độ và thang âm tùy chỉnh.
- *"Chi phí API?"* → Q&A chỉ gửi vùng liên quan, ~200–600 token/câu, <100 VNĐ/lượt.

**10. Điểm:** IN **5** / UX **5** / FE **4** / AI **5** = **19/20**

---

## A2. ChartLens
**"Mọi biểu đồ đều có phiên bản nghe được — và nó nói sự thật."**

**2. Insight**
Nhân viên khiếm thị nhận link Power BI/Tableau hoặc ảnh chart dán trong email. Với Tableau, **không có hỗ trợ bàn phím/screen reader cho bất kỳ tương tác nào với marks và tooltip**. Với ảnh chart, **53,1% ảnh trên web thiếu alt text** và trong số có alt text thì hơn 1/4 là vô nghĩa. Người khiếm thị hoặc phải nhờ đồng nghiệp đọc hộ (mất riêng tư, mất chủ động), hoặc bỏ qua.

**3. Ai dùng**
Chuyên viên phân tích, marketing, sales ops, kế toán quản trị, quản lý cấp trung — bất kỳ ai phải đọc dashboard hằng tuần.

**4. Cách hoạt động**
1. Extension Chrome / add-in Power BI. Phát hiện chart trên trang → **earcon "ting" nhẹ**: *"Có 4 biểu đồ trên trang."*
2. `Alt+1..4` nhảy vào từng chart. Nghe **"tóm tắt 3 tầng"**: **Tầng 1 (1 câu)** *"Cột kép, doanh thu 6 chi nhánh, quý 3 2026."* → **Tầng 2 (kết luận)** *"HCM dẫn đầu 4,2 tỷ. Đà Nẵng giảm mạnh nhất, âm 31%."* → **Tầng 3 (dữ liệu chi tiết)** bảng điều hướng bằng mũi tên.
3. **Audio chart**: `Space` → nghe 12 điểm dữ liệu thành giai điệu 4 giây. `→` di từng điểm, nghe *"Tháng 7, 3,1 tỷ"* kèm nốt cao thấp.
4. **Hỏi sâu**: *"So Đà Nẵng với Hải Phòng"* → AI chỉ tính trên **bảng dữ liệu đã trích xuất**, không suy đoán.
5. **Nhãn tin cậy bắt buộc**: nếu lấy được dữ liệu gốc (JSON/SVG/DOM/API) → giọng nói bình thường + *"Dữ liệu gốc"*. Nếu chỉ có ảnh raster → **giọng đổi sang tông cảnh báo** + *"Ước lượng từ ảnh, độ tin cậy trung bình, nên xác nhận lại."*

**5. AI dùng ở đâu**
- **Trích xuất ưu tiên phi-AI**: parse SVG `<path>`/`<rect>`, Chart.js/ECharts/Highcharts data object, Power BI REST API, bảng HTML ẩn. Chỉ **fallback** sang vision-language model khi là ảnh bitmap.
- **VLM (Claude/GPT-5 vision)**: đọc chart ảnh, trả về **cấu trúc JSON** (loại chart, trục, đơn vị, series, giá trị ước lượng + confidence per-series).
- **LLM sinh narrative 3 tầng** theo cấu trúc "overview → insight → detail" (đúng khuyến nghị của Tableau về accessible dashboard).
- **Sonification engine** theo mô hình Highcharts Sonification / grammar Erie.
- **TTS tiếng Việt** với **ngữ điệu mã hóa độ tin cậy** — giọng chắc chắn vs giọng dè dặt.

**6. Điểm khác biệt**
Đây là điểm ăn tiền nhất với giám khảo: **Be My AI và ChatGPT vision sẽ đọc số trên chart và bịa** — và người khiếm thị **không có cách nào biết**. AFB gọi đó là *"ảo giác về sự tiếp cận"*. ChartLens là công cụ đầu tiên coi **độ tin cậy là thành phần bắt buộc của trải nghiệm âm thanh**, và luôn ưu tiên dữ liệu gốc trước khi dùng AI nhìn ảnh.

**7. Prototype 3 ngày**
Chrome Extension (Manifest V3) + Web Audio API. Ngày 1: phát hiện + parse SVG/Chart.js → JSON. Ngày 2: narrative 3 tầng + TTS + audio chart. Ngày 3: fallback VLM cho ảnh + hệ thống nhãn tin cậy.
**Demo:** mở dashboard công khai thật (ví dụ dashboard công bố của một doanh nghiệp VN) → nghe → trả lời đúng câu hỏi của giám khảo. Rồi **cố tình đưa ảnh chart mờ** để show cơ chế cảnh báo tin cậy — **chủ động thừa nhận giới hạn của AI là cách ghi điểm, không phải mất điểm.**

**8. Tác động đo được**
% dashboard nội bộ tiếp cận được: từ ~0% → >80%. Thời gian hiểu 1 dashboard 6 chart: 25 phút (nhờ người) → 4 phút (tự lực). Tỷ lệ phụ thuộc đồng nghiệp: đo bằng "số lần phải nhờ/tuần".

**9. Rủi ro**
- *"VLM đọc sai giá trị?"* → đã trả lời bằng kiến trúc ưu tiên dữ liệu gốc + nhãn tin cậy.
- *"Site nội bộ có auth?"* → extension chạy trong phiên đăng nhập của chính người dùng, không proxy dữ liệu ra ngoài.
- *"Dashboard đóng như Tableau Public?"* → dùng tầng ảnh + nêu rõ giới hạn; đồng thời đây là lý do cần ý tưởng B4 (sửa từ nguồn).

**10. Điểm:** IN **5** / UX **5** / FE **4** / AI **5** = **19/20**

---

## A3. MeetMate VN
**"Trợ lý họp cho người không nhìn màn hình — nghe được cả cái người ta đang chỉ tay."**

**2. Insight**
"Như các bạn thấy ở đây…" là câu giết chết cuộc họp. **Share Screen trong Zoom chỉ accessible với chính người chia sẻ.** Chat chạy song song trong lúc có người nói tạo rào cản, đến mức thực hành khuyến nghị là **cử một "chat-wrangler" đọc hộ** — tức là giải pháp hiện tại là *thuê người*. Nghiên cứu so sánh 4 nền tảng: Zoom accessible hơn Teams nhưng **cả hai đều còn rào cản**. Và người khiếm thị mất hoàn toàn **tín hiệu phi ngôn ngữ**: ai gật, ai giơ tay, ai đang nhíu mày khi mình nói.

**3. Ai dùng**
Mọi vị trí phải họp: PM, sales, tư vấn, nhân sự, dev. Đặc biệt quan trọng cho **hybrid work** — hướng mà chủ đề "employability" nhấn mạnh.

**4. Cách hoạt động**
1. Bot vào phòng Zoom/Teams/Meet như một participant, hoặc chạy local capture.
2. **Lớp màn hình chia sẻ**: mỗi khi slide đổi → **earcon "lật trang"** + mô tả 1 câu: *"Slide 5: biểu đồ cột, doanh thu 3 quý."* Khi người nói chỉ vào vùng nào (theo con trỏ chuột của họ) → *"Đang nói về cột quý 3."* Phím `Alt+D` = mô tả chi tiết ngay.
3. **Lớp tín hiệu phi ngôn ngữ (earcon, không phải giọng nói — để không cắt lời người đang nói)**: tiếng "tick" nhẹ bên phải = có người gật đầu đồng ý; hai tick = nhiều người gật; tiếng chuông = có người giơ tay; tiếng gõ nhẹ = tin nhắn chat mới (tên người + ưu tiên).
4. **Lớp điều hướng phát biểu**: `Alt+Q` → *"Hiện có 8 người, 3 người bật camera. Anh Minh đang nói được 2 phút. Chị Lan vừa giơ tay trước bạn."* — **giúp người khiếm thị biết khi nào chen vào là hợp lý**, thứ mà người sáng mắt làm bằng ánh mắt.
5. Sau họp: biên bản tiếng Việt + danh sách action item + **mô tả lại toàn bộ nội dung trực quan** đã xuất hiện, gửi dạng văn bản có cấu trúc heading.

**5. AI dùng ở đâu**
- **ASR PhoWhisper** + diarization (pyannote) → ai nói gì, khi nào, tiếng Việt lẫn tiếng Anh.
- **VLM chạy theo nhịp keyframe** trên luồng share screen: chỉ gọi khi phát hiện thay đổi >15% pixel → **kiểm soát chi phí và độ trễ**.
- **Computer vision nhẹ** (MediaPipe FaceMesh / head pose) trên tile camera: phát hiện gật/lắc/giơ tay → chuyển thành earcon. Chạy **local, không gửi khuôn mặt lên cloud** → trả lời thẳng câu hỏi quyền riêng tư.
- **LLM tóm tắt + trích action item**, ghép audio timeline với visual timeline.
- **TTS tiếng Việt giọng thì thầm (ducking)**: mô tả được phát nhỏ hơn và **tự hạ âm lượng khi có người đang nói** — chi tiết UX rất thuyết phục.

**6. Điểm khác biệt**
Be My AI không vào được cuộc họp. Otter/Teams Copilot tóm tắt **lời nói** nhưng mù hoàn toàn với **nội dung hình ảnh và ngôn ngữ cơ thể**. MeetMate là công cụ đầu tiên hợp nhất **3 luồng: lời nói + hình ảnh + phi ngôn ngữ** cho người dùng phi thị giác, bằng tiếng Việt.

**7. Prototype 3 ngày**
Electron app capture màn hình + mic local (**dễ hơn nhiều so với viết bot Zoom SDK — chọn đường này**). Ngày 1: capture + keyframe + VLM mô tả + TTS ducking. Ngày 2: earcon layer + `Alt+Q` roster. Ngày 3: head-pose detection + biên bản sau họp.
**Demo:** dựng một cuộc họp giả 90 giây, một thành viên đội đóng vai người khiếm thị đeo tai nghe, đội chia sẻ slide và cố tình nói "như các bạn thấy ở đây" — người khiếm thị **vẫn trả lời đúng**. Khoảnh khắc WOW: bạn ấy nói *"Khoan, hình như anh Nam vừa lắc đầu"* — và đúng.

**8. Tác động đo được**
Tỷ lệ phát biểu của nhân viên khiếm thị trong họp (đo trước/sau). Số lần phải nhờ người mô tả: →0. Thời gian bắt kịp nội dung sau họp: 30 phút → 0.

**9. Rủi ro**
- *"Phân tích khuôn mặt đồng nghiệp — có xâm phạm không?"* → Chỉ phân tích **head pose và hand raise**, không nhận diện danh tính, **xử lý local, không lưu frame**, có banner thông báo trong phòng họp và cơ chế opt-out. Trả lời tốt câu này là ghi điểm lớn ở tiêu chí ethics.
- *"Độ trễ?"* → Earcon là local, gần như 0ms. Mô tả VLM 1,5–3s — chấp nhận được vì bám theo slide chứ không theo từng giây.
- *"Chi phí?"* → keyframe-based: họp 60 phút ≈ 20–40 lần gọi VLM.

**10. Điểm:** IN **4** / UX **5** / FE **4** / AI **5** = **18/20**

---

## A4. DeckTalk
**"Người khiếm thị không chỉ nghe được slide — họ tự làm ra slide đẹp."**

**2. Insight**
Bloomberg 9/2025 nêu đích danh **PowerPoint vẫn còn rào cản cho nhân viên khiếm thị**. Slide deck "làm phẳng thông tin thành screenshot và sơ đồ không tag". Nhưng nỗi đau sâu hơn: **người khiếm thị bị loại khỏi việc TẠO nội dung trực quan** → bị đẩy khỏi các vị trí cần thuyết trình (sales, marketing, quản lý) → trần nghề nghiệp.

**3. Ai dùng**
Marketing, sales, PM, giảng viên, chuyên viên đào tạo nội bộ, sinh viên khiếm thị sắp đi làm.

**4. Cách hoạt động — hai chiều**
*Chiều ĐỌC:*
1. `Ctrl+Alt+R` → *"Deck 24 slide. Slide 7: tiêu đề 'Chiến lược Q4', 1 sơ đồ luồng 5 bước, 2 ảnh không alt text."*
2. Mô tả sơ đồ **theo cấu trúc quan hệ**, không theo pixel: *"Luồng 5 bước: Tiếp nhận → Thẩm định → Duyệt → Giải ngân → Hậu kiểm. Bước Thẩm định có nhánh phụ quay lại Tiếp nhận."*

*Chiều TẠO (phần WOW):*
3. Người dùng đọc: *"Slide mới, tiêu đề Doanh thu Q3, ba ý chính, kèm biểu đồ cột từ bảng A1 đến D13 của file Excel đang mở."*
4. AI dựng slide đúng **template thương hiệu công ty**, canh lề chuẩn, **tự sinh alt text đúng chuẩn cho chính nó**, kiểm tra tương phản màu.
5. `Ctrl+Alt+V` → **"Kiểm tra thị giác"**: *"Slide này ổn. Cảnh báo: chữ trên nền xanh đạt tương phản 3,1:1, dưới chuẩn WCAG 4,5:1. Có muốn đổi sang nền đậm hơn không?"* — **người khiếm thị kiểm soát được chất lượng thị giác mà không cần nhìn.**

**5. AI dùng ở đâu**
- **VLM đọc sơ đồ → graph có cấu trúc** (node + edge), không mô tả kiểu "có một hình chữ nhật màu xanh".
- **LLM + Office.js/python-pptx** sinh layout từ lệnh giọng nói, ràng buộc bằng template công ty.
- **ASR PhoWhisper** nhận lệnh tiếng Việt.
- **Bộ kiểm tra WCAG thuật toán** (contrast ratio, font size, reading order) — **không dùng AI cho phần này vì cần chính xác tuyệt đối**; đây là điểm kỹ thuật tinh tế đáng nói trong pitch.

**6. Điểm khác biệt**
Be My AI/Seeing AI chỉ **đọc**. Copilot trong PowerPoint tạo slide nhưng **giao diện điều khiển lại là thị giác** và không cho người khiếm thị **xác nhận kết quả bằng phi thị giác**. DeckTalk đóng vòng lặp: tạo → kiểm chứng → sửa, tất cả bằng tai.

**7. Prototype 3 ngày**
Web app + python-pptx (nhanh nhất) hoặc PowerPoint add-in. Ngày 1: đọc & mô tả .pptx. Ngày 2: tạo slide bằng giọng nói. Ngày 3: WCAG checker + TTS.
**Demo:** trong 90 giây, người khiếm thị tạo 3 slide có biểu đồ thật từ Excel, rồi **mở ra cho giám khảo xem — slide đẹp**. Sức nặng cảm xúc rất lớn.

**8. Tác động đo được**
Số vị trí công việc mở ra (những JD yêu cầu "kỹ năng thuyết trình"). Thời gian tạo 1 deck 10 slide: 4 giờ → 25 phút. **100% slide tạo ra có alt text đạt chuẩn** — tức là công cụ này còn cải thiện accessibility cho cả tổ chức.

**9. Rủi ro**
- *"Slide AI tạo có xấu không?"* → ràng buộc template, không để AI tự do bố cục.
- *"Mô tả sơ đồ sai?"* → cho phép "nghe lại theo từng nhánh", và người dùng có thể sửa mô tả, lưu lại thành alt text chính thức.

**10. Điểm:** IN **4** / UX **4** / FE **4** / AI **4** = **16/20**

---

## A5. BoardEar
**"Bảng Kanban biến thành đài phát thanh dự án."**

**2. Insight**
Bản chất Jira/Trello là **quan hệ không gian 2 chiều** (cột × thẻ × swimlane × màu nhãn), còn screen reader đọc **tuyến tính 1 chiều**. Trello kéo-thả với NVDA có lúc **đọc ra chuỗi số và ký tự vô nghĩa**; Jira bị nêu đích danh trên Bloomberg. Kết quả: PM/dev khiếm thị **bị loại khỏi quy trình Agile** — mà Agile là chuẩn của gần như mọi công ty công nghệ ở TP.HCM.

**3. Ai dùng** PM, scrum master, dev, QA, business analyst khiếm thị.

**4. Cách hoạt động**
1. `Alt+B` → **"bản tin sprint"** 20 giây: *"Sprint 14, còn 3 ngày. 24 thẻ. To Do 6, Doing 9, Review 4, Done 5. Cảnh báo: 3 thẻ ở Doing quá 5 ngày. 1 thẻ blocked. 2 thẻ gán cho bạn."*
2. Điều hướng **theo ngữ nghĩa thay vì không gian**: `1-4` nhảy cột, `J/K` lướt thẻ, mỗi thẻ đọc dạng có nhịp: *"[Ưu tiên cao] Sửa lỗi đăng nhập — Minh — 3 điểm — quá hạn 2 ngày"* (earcon báo mức ưu tiên thay vì đọc "màu đỏ").
3. **Di chuyển thẻ bằng lệnh, không kéo-thả**: *"Chuyển thẻ này sang Review và gán cho Lan"* → xong, xác nhận bằng audio.
4. **Radar thay đổi**: mỗi sáng 8h, bot Teams/Slack gửi audio 40 giây: *"Từ hôm qua: 4 thẻ chuyển trạng thái, 1 thẻ mới gán cho bạn, Nam comment trong thẻ của bạn."*
5. Hỏi tự do: *"Ai đang bị nghẽn?"* → trả lời từ API Jira.

**5. AI dùng ở đâu**
- **LLM đọc Jira/Trello REST API → sinh narrative ưu tiên hóa** (không phải liệt kê 24 thẻ, mà nói 3 điều đáng lo nhất trước — đây là "AI biên tập", giá trị thật).
- **NLU tiếng Việt** map lệnh giọng nói → API call, có bước xác nhận trước khi ghi.
- **Anomaly detection**: thẻ tồn lâu bất thường, workload lệch.
- **TTS + earcon design** cho metadata.

**6. Điểm khác biệt**
Không có công cụ AI nào hiện nay đụng tới **project management cho người khiếm thị**. Đây là khoảng trống rõ ràng. Và điểm hay: BoardEar **không cố làm Kanban accessible — nó thay thế ẩn dụ không gian bằng ẩn dụ thời gian/ưu tiên**, tức là **thiết kế lại cho phi thị giác thay vì vá víu**.

**7. Prototype 3 ngày**
Web app + Jira Cloud REST API (có free tier, tạo sample board trong 20 phút) hoặc Trello API. Ngày 1: fetch + narrative. Ngày 2: điều hướng bàn phím + earcon. Ngày 3: lệnh giọng nói ghi ngược lên API + bot Slack.

**8. Tác động** Thời gian nắm tình hình sprint: 20 phút → 40 giây. Mở đường cho vị trí PM — vị trí lương cao, ít bị nghĩ là "phù hợp người khiếm thị".

**9. Rủi ro** Agent ghi sai dữ liệu dự án → **mọi thao tác ghi đều phải xác nhận bằng giọng nói + có undo**. Đây đúng theo khuyến nghị "human-AI collaboration, không phải tự động hóa hoàn toàn" của nghiên cứu EMNLP 2026.

**10. Điểm:** IN **4** / UX **4** / FE **3** / AI **4** = **15/20**

---

## A6. DesignEar
**"Người khiếm thị làm được Design QA — và làm tốt hơn."**

**2. Insight**
Figma/Canva là canvas thị giác thuần → tường chắn tuyệt đối. Nhưng nhìn kỹ: **rất nhiều công việc quanh thiết kế lại KHÔNG cần mắt** — kiểm tra hệ thống design token có nhất quán không, spacing có theo grid 8px không, tương phản có đạt WCAG không, layer có đặt tên đúng không, component có bị detach không, copy có nhất quán không. Người sáng mắt làm việc này **chán và hay bỏ sót**.

**3. Ai dùng** Design QA, design ops, content designer, accessibility specialist khiếm thị trong agency/product team.

**4. Cách hoạt động**
1. Plugin Figma → `Alt+L` đọc **"bản đồ không gian có cấu trúc"**: *"Frame Trang chủ, 1440×900. 4 vùng: Header trên cùng cao 80. Hero dưới header cao 520. Grid sản phẩm 3 cột. Footer."* — mô tả theo **quan hệ vị trí chứ không theo tọa độ pixel rời rạc**.
2. `Alt+A` → **báo cáo audit**: *"12 vấn đề. 3 nghiêm trọng: nút Đặt hàng tương phản 2,8:1, dưới chuẩn. Chữ chú thích 10px, dưới ngưỡng 12. Biểu tượng cảnh báo chỉ dùng màu đỏ để phân biệt."*
3. Người khiếm thị **để lại comment trực tiếp lên node Figma** bằng giọng nói → designer sáng mắt nhận được.
4. `Alt+C` mô phỏng: *"Với người mù màu deuteranopia, hai chuỗi trong biểu đồ này gần như cùng một màu."*
5. Chế độ **"đọc như screen reader sẽ đọc"**: mô phỏng trải nghiệm người dùng cuối khiếm thị của chính sản phẩm đang thiết kế.

**5. AI dùng ở đâu**
- **Figma Plugin API** cho cấu trúc chính xác (không đoán từ ảnh).
- **LLM chuyển cây node → mô tả không gian mạch lạc bằng tiếng Việt** — đây là việc khó và đúng chất AI.
- **Thuật toán WCAG 2.2** cho contrast/size (chính xác tuyệt đối).
- **Mô phỏng色 giác** bằng ma trận chuyển đổi (Brettel/Viénot) — không cần AI.
- **VLM** chỉ dùng cho phần đánh giá thẩm mỹ/hierarchy tổng thể.

**6. Điểm khác biệt**
Đây là **lật ngược thế trận**: thay vì hỏi "làm sao cho người khiếm thị nhìn được Figma", hỏi **"phần nào của công việc thiết kế vốn không cần mắt, và ta trao lại nó cho ai?"**. Không một công cụ nào trong danh sách Be My AI/Seeing AI/Envision đi theo hướng này.

**7. Prototype 3 ngày** Figma Plugin (TypeScript, dev nhanh, demo đẹp). Ngày 1: đọc cây node → mô tả. Ngày 2: WCAG audit + comment bằng giọng. Ngày 3: mô phỏng mù màu + TTS.

**8. Tác động** Mở nghề "Accessibility/Design QA specialist" — nghề đang thiếu người trên toàn cầu. Số lỗi a11y bắt được trước khi release. Lương vị trí này ở VN ~15–30 triệu/tháng.

**9. Rủi ro** Mô tả không gian phức tạp vẫn khó hiểu → giới hạn phạm vi vào QA có thể kiểm chứng bằng số, đừng cố "làm cho người mù thấy được thiết kế".

**10. Điểm:** IN **5** / UX **3** / FE **3** / AI **4** = **15/20**

---

## A7. TouchChart
**"Biểu đồ in ra sờ được, trong 60 giây, ngay tại văn phòng."**

**2. Insight**
Sonification tốt cho xu hướng nhưng **kém cho quan hệ không gian phức tạp**: sơ đồ tổ chức, flowchart quy trình, bản đồ kho, sơ đồ mạng. Với những thứ này, **xúc giác vẫn vượt trội âm thanh**. Người khiếm thị VN gần như không có đường tiếp cận đồ họa nổi tại nơi làm việc.

**3. Ai dùng** Vận hành, logistics, kỹ thuật, đào tạo nội bộ, giáo dục nghề.

**4. Cách hoạt động**
1. Chọn biểu đồ/sơ đồ bất kỳ → `Ctrl+P+T`.
2. AI chuyển thành **tactile graphic** đúng nguyên tắc đồ họa nổi (đơn giản hóa, tách lớp, chuyển nhãn sang Braille tiếng Việt, loại bỏ chi tiết trang trí) — **đây là bước AI thực sự khó và có giá trị: không phải in nguyên hình, mà "biên dịch thị giác → xúc giác"**.
3. In ra: giấy swell/microcapsule + máy sấy (rẻ), hoặc máy in nổi, hoặc **in 3D nhanh**.
4. Dán bản in lên tablet/điện thoại có **lớp audio đồng bộ**: chạm vào vùng nào → nghe giá trị vùng đó (dùng camera hoặc lớp tọa độ định trước).
5. Kết hợp A2: sờ để nắm hình dạng, nghe để lấy số.

**5. AI dùng ở đâu** VLM trích cấu trúc; **LLM + rule engine tối giản hóa đồ họa theo chuẩn BANA/Braille Authority**; dịch nhãn sang Braille tiếng Việt (có dấu — bài toán riêng thú vị); alignment tọa độ chạm ↔ dữ liệu.

**6. Điểm khác biệt** Đa phương thức (multimodal) thật sự — không tool nào trong danh sách làm. Rất "wow" trên video vì **có hiện vật vật lý cầm được**.

**7. Prototype 3 ngày** Sinh file SVG/STL tactile + in 3D một mẫu (nếu RMIT có xưởng in 3D/FabLab — **kiểm tra ngay, đây là lợi thế sân nhà**) + demo lớp audio trên tablet. Nếu không kịp in: in trên giấy dày + dán vật liệu nổi thủ công cũng đủ để demo.

**8. Tác động** Tỷ lệ hiểu đúng sơ đồ quy trình: đo bằng bài test. Dùng được trong đào tạo nội bộ — mở rộng sang giáo dục.

**9. Rủi ro** Phụ thuộc phần cứng, chi phí, không scale bằng phần mềm. → Định vị là **module bổ sung**, không phải sản phẩm chính.

**10. Điểm:** IN **5** / UX **4** / FE **2** / AI **3** = **14/20**

---

# NHÓM B — "SÁNG TẠO / ĐỘT PHÁ"
*Góc nhìn mới: biến khiếm thị thành lợi thế, hoặc giải pháp hai chiều*

---

## B1. BlindSpot
**"Doanh nghiệp không tuyển bạn vì thương. Họ tuyển vì bạn phát hiện được thứ họ không thấy."**

**2. Insight — đây là insight mạnh nhất của cả hướng**
Từ 2025–2026, **accessibility trở thành nghĩa vụ pháp lý và thương mại**: European Accessibility Act có hiệu lực, các tập đoàn đa quốc gia ở VN (RMIT, Intel, Samsung, Bosch, các công ty outsourcing làm cho khách EU/Mỹ) **bắt buộc phải audit sản phẩm số**. Trong khi đó **95,9% trang web có lỗi WCAG** và tình hình đang tệ đi. Nghề "accessibility auditor" đang thiếu người trầm trọng.

**Và người thạo screen reader chính là kiểm định viên giỏi nhất thế giới** — họ phát hiện lỗi mà công cụ tự động không bắt được (empty link có "đọc thành gì", thứ tự focus có logic không, ARIA label có nghĩa không). Automated tools chỉ bắt được ~30% lỗi WCAG.

**Đây không phải "giúp người khiếm thị làm được việc". Đây là "người khiếm thị làm được việc mà người sáng mắt làm dở hơn".** Đúng tinh thần "employability" hơn bất kỳ ý tưởng nào.

**3. Ai dùng** Người khiếm thị trở thành **Accessibility Auditor / QA Specialist** — freelancer hoặc nhân viên; khách hàng là doanh nghiệp VN + công ty outsourcing.

**4. Cách hoạt động**
1. Auditor khiếm thị nhập URL/app cần kiểm → **AI quét tự động trước** (axe-core, Lighthouse, WCAG 2.2) → ra danh sách lỗi máy bắt được, phân loại và **đọc thành báo cáo audio có cấu trúc**.
2. Auditor **đi thật** bằng NVDA qua các luồng quan trọng (đăng ký, thanh toán, tìm kiếm). Chỉ cần **nói ra bằng tiếng Việt**: *"Nút này đọc thành 'button' không có tên"*, *"Focus nhảy ngược lên đầu trang sau khi submit"*.
3. **AI là thư ký, không phải chuyên gia**: PhoWhisper ghi lời, LLM tự động map sang **tiêu chí WCAG 2.2 cụ thể (VD 4.1.2 Name Role Value, Level A)**, gắn selector DOM, mức nghiêm trọng, **và sinh luôn đoạn code sửa**.
4. Xuất **báo cáo PDF chuyên nghiệp song ngữ Việt–Anh** có screenshot minh họa (AI tự chụp và khoanh vùng — auditor không cần nhìn).
5. Doanh nghiệp nhận báo cáo, sửa, **tái kiểm** → tạo doanh thu định kỳ.

**5. AI dùng ở đâu**
- **Quét tự động** (axe-core + LLM phân loại/ưu tiên).
- **ASR PhoWhisper** ghi nhận xét thời gian thực khi đang thao tác.
- **LLM mapping** nhận xét đời thường → điều khoản WCAG + sinh code fix (React/HTML/ARIA).
- **VLM** chụp và khoanh vùng lỗi trên ảnh để báo cáo có tính thuyết phục với dev sáng mắt.
- **Agent** tự chạy lại kịch bản kiểm thử sau khi dev sửa (regression).

**6. Điểm khác biệt**
Toàn bộ các tool hiện có đặt người khiếm thị ở vai **người nhận trợ giúp**. BlindSpot đặt họ ở vai **người cung cấp dịch vụ có chuyên môn cao**. Đây là **framing đảo ngược** mà giám khảo hackathon rất thích vì nó nói đúng vấn đề gốc của employability: không phải thiếu công cụ, mà thiếu **vị thế kinh tế**.

**7. Prototype 3 ngày**
Web app: nhập URL → chạy axe-core → dashboard audio-first → ghi âm nhận xét → LLM sinh báo cáo PDF. Rất khả thi. Ngày 1: quét + đọc kết quả. Ngày 2: ghi âm + mapping WCAG. Ngày 3: sinh báo cáo + code fix.
**Demo:** audit **website thật của một doanh nghiệp Việt** (chọn một site có lỗi rõ ràng) ngay trên sân khấu, xuất báo cáo trong 3 phút. **Giám khảo thấy ngay giá trị thương mại.**

**8. Tác động đo được**
Thu nhập auditor: freelance a11y audit ở VN ~5–15 triệu/dự án, thị trường quốc tế 50–150 USD/giờ. Số lỗi WCAG được sửa. Số doanh nghiệp đạt chuẩn. **Mô hình kinh doanh rõ → ghi điểm Feasibility.**

**9. Rủi ro**
- *"Thị trường VN có sẵn sàng trả tiền không?"* → Nhắm trước vào công ty outsourcing phục vụ khách EU/Mỹ (bắt buộc tuân thủ EAA) và tập đoàn đa quốc gia tại TP.HCM. Đây là phân khúc đã có ngân sách.
- *"Cần đào tạo chuyên môn WCAG?"* → Đúng, nên sản phẩm có **module học tích hợp**: AI dạy WCAG ngay trong lúc làm. Phối hợp Sao Mai Center làm kênh đào tạo.
- *"AI thay được auditor luôn thì sao?"* → Không: automated tool chỉ bắt ~30% lỗi; phần còn lại cần trải nghiệm người dùng thật. AI khuếch đại chứ không thay thế.

**10. Điểm:** IN **5** / UX **5** / FE **4** / AI **4** = **18/20**

---

## B2. EarSense QA
**"Test phần mềm bằng tai — bắt được lỗi mà mắt bỏ qua."**

**2. Insight** Mở rộng B1 sang QA tổng quát. Người điều hướng bằng bàn phím + screen reader đi qua luồng ứng dụng theo cách **hoàn toàn khác** người sáng mắt → phát hiện lỗi luồng, lỗi trạng thái, lỗi thông báo lỗi không hiện ra cho AT. Ngoài ra, dùng **sonification cho log và performance**: nghe ra spike latency nhanh hơn nhìn biểu đồ.

**3. Ai dùng** QA engineer, tester khiếm thị trong công ty phần mềm (ngành rất lớn ở TP.HCM).

**4. Cách hoạt động**
1. Nhận test case dạng văn bản → app đọc từng bước.
2. Tester thao tác thật bằng bàn phím; hệ thống **ghi lại toàn bộ trace** (DOM, network, console).
3. Tester nói lỗi → AI viết bug report chuẩn (steps to reproduce, expected/actual, severity) + đính kèm trace và screenshot.
4. **Chế độ nghe log**: stream log server thành âm thanh — lỗi 500 = tiếng trầm, latency cao = pitch tăng dần. Nghe 30 giây thay vì đọc 3.000 dòng.
5. Tự động tạo ticket lên Jira.

**5. AI dùng ở đâu** ASR tiếng Việt; LLM viết bug report chuẩn từ lời nói tự nhiên; **sonification mapping log stream**; LLM phân cụm bug trùng lặp; agent replay để verify.

**6. Điểm khác biệt** Định vị người khiếm thị là **QA chuyên nghiệp**, không phải "tester accessibility phụ". Nghe log là ý tưởng lạ và thực sự có cơ sở khoa học (sonification tốt cho phát hiện outlier).

**7. Prototype 3 ngày** Electron/web app + Playwright ghi trace + sonification log demo. Demo nghe log: rất ấn tượng trên video.

**8. Tác động** Mở nghề QA — nghề tuyển nhiều, lương khởi điểm 10–18 triệu ở TP.HCM, và **không đòi hỏi bằng cấp cao**, phù hợp với thực tế 8,8% NKT có chứng chỉ nghề.

**9. Rủi ro** Nhiều loại QA vẫn cần nhìn (visual regression) → định vị đúng: **functional QA + accessibility QA + log monitoring**, không nhận visual QA.

**10. Điểm:** IN **4** / UX **4** / FE **3** / AI **3** = **14/20**

---

## B3. AudioFirst Workspace
**"Công cụ làm cho người mù, hóa ra ai cũng muốn dùng."**

**2. Insight — giải pháp hai chiều**
Đảo ngược mặc định: thay vì "giao diện thị giác + bản accessible đi kèm", xây **giao diện audio-first**, rồi bổ sung lớp thị giác. Lý do thương mại: **người sáng mắt cũng cần audio-first** khi lái xe, đi đường, chạy bộ, nấu ăn, mắt mỏi. Đây là **"curb-cut effect"** — vỉa hè hạ thấp làm cho xe lăn, nhưng người đẩy xe đẩy, kéo vali, giao hàng đều hưởng lợi.

**3. Ai dùng** Toàn bộ nhân viên công ty. Người khiếm thị là người dùng chính; người sáng mắt là người dùng theo ngữ cảnh.

**4. Cách hoạt động**
1. Mỗi sáng: **"bản tin công việc"** 90 giây — email quan trọng, lịch họp, task đến hạn, thay đổi trong dự án — nghe khi đi xe máy tới công ty (rất Việt Nam).
2. Trả lời bằng giọng nói: *"Trả lời chị Lan: em xác nhận họp 2h chiều"* → AI soạn, **đọc lại để duyệt**, rồi gửi.
3. **Nghe Excel/báo cáo** khi đang di chuyển (tích hợp A1/A2).
4. Earcon thống nhất toàn hệ thống — học một lần dùng mọi nơi.
5. Bản web/thị giác chỉ là "view thứ hai" của cùng một mô hình dữ liệu.

**5. AI dùng ở đâu** LLM ưu tiên hóa thông tin (cái gì đáng nói trong 90 giây); ASR tiếng Việt; TTS đa giọng phân vai; RAG trên email/lịch/tài liệu nội bộ; "audio UX grammar" do LLM sinh theo ngữ cảnh.

**6. Điểm khác biệt** Không phải phụ kiện accessibility — là **sản phẩm chính có thị trường đại chúng**, trong đó người khiếm thị là **người dùng tham chiếu**. Lập luận pitch: *"Chúng tôi không xin doanh nghiệp làm từ thiện. Chúng tôi bán cho họ một sản phẩm tốt hơn, và nó vô tình mở cửa cho người khiếm thị."*

**7. Prototype 3 ngày** PWA + Gmail/Google Calendar API + TTS. Demo: một thành viên đội đeo tai nghe **đi bộ quanh khuôn viên RMIT** và xử lý xong buổi sáng làm việc — quay video rất đẹp.

**8. Tác động** DAU của cả nhân viên sáng mắt (chứng minh tính bền vững thương mại). Tỷ lệ người khiếm thị hoàn thành task hành chính độc lập.

**9. Rủi ro** Quá rộng, dễ nhạt. → Chọn 1 luồng sâu (email + lịch + task) thay vì làm hết.

**10. Điểm:** IN **4** / UX **4** / FE **3** / AI **4** = **15/20**

---

## B4. FixAtSource
**"Đừng bắt người khiếm thị phiên dịch tài liệu xấu. Hãy chặn tài liệu xấu ngay từ người gửi."**

**2. Insight — insight cấu trúc, rất mạnh**
Mọi công cụ hiện có (Be My AI, Seeing AI, ChatGPT, kể cả Be My Eyes Workplace) đều là **thông dịch một chiều ở phía người nhận**. Người khiếm thị trả **"thuế truy cập"** hằng ngày cho lỗi của người khác: tự chạy OCR, tự đoán bảng, tự sửa file. **67% PDF không đọc được**, **53,1% ảnh thiếu alt text**, và **con số đang xấu đi**.

Nhưng chi phí sửa ở phía người gửi là **gần bằng 0 nếu tự động**. Đây là bài toán kinh tế học: chuyển chi phí từ người yếu thế sang hệ thống.

**3. Ai dùng** **Người dùng trực tiếp là nhân viên SÁNG MẮT** (và IT admin). Người hưởng lợi là nhân viên khiếm thị. Đây chính là điểm sáng tạo.

**4. Cách hoạt động**
1. Cài add-in vào Outlook/Teams/Google Workspace/SharePoint.
2. Nhân viên A (sáng mắt) đính kèm `baocao.pdf` → **trước khi gửi**, add-in quét: *"File này là ảnh scan, chưa OCR. 3 ảnh thiếu alt text. Bảng ở trang 4 thiếu header."*
3. Một nút **"Sửa giúp tôi"** → AI OCR, tag cấu trúc PDF/UA, sinh alt text, gắn header bảng, thêm `lang="vi"`, chuyển conditional formatting thành nhãn text. Mất 8 giây. **Nhân viên A không cần hiểu gì về accessibility.**
4. File gửi đi là bản đã chuẩn. Người khiếm thị mở ra **dùng được ngay** — không biết là đã có ai sửa.
5. **Dashboard "Nợ tiếp cận" (Accessibility Debt)** cho ban lãnh đạo: bao nhiêu file không chuẩn theo phòng ban, xu hướng theo tháng, ước tính số giờ nhân viên khiếm thị phải bỏ ra để tự sửa → **biến accessibility thành chỉ số quản trị có thể đo**. Chính báo cáo Be My Eyes chỉ ra nguyên nhân rào cản tồn tại là **"không ai đo thời gian nhân viên phải chữa cháy"**.

**5. AI dùng ở đâu**
- **OCR tiếng Việt có dấu** (VietOCR / PaddleOCR fine-tune) + phục hồi **reading order** bằng layout model (LayoutLM/DocLayout).
- **VLM sinh alt text theo ngữ cảnh tài liệu** — không phải "một tấm ảnh" mà *"Biểu đồ cột doanh thu 6 chi nhánh quý 3, HCM cao nhất"*, vì LLM đọc cả văn bản xung quanh.
- **LLM phân tích cấu trúc Excel/Word/PPT** → đề xuất sửa merged cell, đặt tên sheet, thêm heading.
- **Rule engine WCAG 2.2 / PDF-UA** cho phần kiểm tra chính xác.
- **Agent chạy nền** quét kho tài liệu cũ (SharePoint/Drive) và sửa hàng loạt.

**6. Điểm khác biệt**
Đây là **điểm khác biệt sắc nhất so với Be My Eyes Workplace** — sản phẩm đó (ra mắt 02/2026) làm Workplace Reader để **dịch file xấu cho người khiếm thị đọc**. FixAtSource làm điều ngược lại: **xóa file xấu khỏi tổ chức**. Một bên chữa triệu chứng, một bên chữa nguyên nhân. Lập luận này trên sân khấu rất sắc.

**7. Prototype 3 ngày**
Outlook Web Add-in hoặc Chrome extension chặn lúc upload lên Drive/Gmail. Ngày 1: phát hiện file không chuẩn + báo cáo. Ngày 2: OCR + tag + sinh alt text. Ngày 3: dashboard nợ tiếp cận.
**Demo:** hai màn hình cạnh nhau. Trái: nhân viên sáng mắt gửi file scan như bình thường. Phải: NVDA đọc — im lặng hoàn toàn. Rồi bật FixAtSource, gửi lại → NVDA đọc trơn tru. **Tương phản này cực mạnh trên video.**

**8. Tác động đo được**
% tài liệu nội bộ đạt chuẩn: 33% → >90%. Số giờ "thuế truy cập" tiết kiệm mỗi nhân viên khiếm thị/tuần (ước tính 5–8 giờ). **Và quan trọng: giảm rào cản TUYỂN DỤNG** — công ty có thể tự tin tuyển người khiếm thị vì môi trường tài liệu đã sạch.

**9. Rủi ro**
- *"OCR tiếng Việt có dấu sai?"* → dùng model fine-tune tiếng Việt, hiển thị confidence, cho phép người gửi xem lại; file gốc luôn được giữ.
- *"Nhân viên lười, không bấm nút?"* → chế độ **tự động im lặng** (auto-fix on send) + chính sách IT; dashboard tạo áp lực xã hội lành mạnh giữa các phòng ban.
- *"Alt text AI sinh sai?"* → alt text luôn ghi rõ nguồn "sinh tự động", người khiếm thị có thể yêu cầu mô tả chi tiết hơn; không dùng AI cho ảnh có ý nghĩa pháp lý.

**10. Điểm:** IN **5** / UX **5** / FE **4** / AI **4** = **18/20**

---

## B5. ProxyHands
**"AI là đôi tay. Bạn vẫn là người ra quyết định."**

**2. Insight — dựa trực tiếp trên nghiên cứu mới nhất**
Nghiên cứu EMNLP 2026 (arXiv 2609.00524): 8 người mù, 1.258 lệnh, 12 ứng dụng desktop — **computer-use agent tốt nhất (GPT-5) chỉ thành công 52,5%**, với 4 nhóm lỗi grounding/planning/constraint-tracking/termination. **Kết luận của chính nhóm nghiên cứu: người lao động khiếm thị cần cộng tác người–AI, không phải tự động hóa hoàn toàn.**

Nghĩa là: **hứa "AI tự làm hết" là sai cả về kỹ thuật lẫn đạo đức.** Nhưng có một vùng vàng: những thao tác **chỉ khó vì phải dùng chuột trên UI không accessible** — kéo-thả, click vào canvas, chọn vùng, thao tác trên app nội bộ cũ (ERP Java, phần mềm kế toán desktop VN như MISA, Fast, Bravo) — mà **logic thì người khiếm thị hoàn toàn nắm được**.

**3. Ai dùng** Bất kỳ ai phải dùng phần mềm nội bộ legacy — rất phổ biến ở doanh nghiệp Việt (ERP cũ, phần mềm kế toán desktop, hệ thống ngân hàng nội bộ).

**4. Cách hoạt động — thiết kế "người giữ vô-lăng"**
1. Người dùng mô tả mục tiêu bằng tiếng Việt: *"Nhập phiếu chi 2 triệu cho nhà cung cấp Minh Phát vào MISA."*
2. Agent đọc **cây UI Automation (không phải pixel)**, lập kế hoạch, rồi **ĐỌC KẾ HOẠCH RA TRƯỚC KHI LÀM**: *"Tôi sẽ: mở Kế toán tiền mặt, tạo phiếu chi mới, chọn nhà cung cấp Minh Phát, nhập số tiền 2.000.000, chưa lưu. Đồng ý?"*
3. Thực hiện từng bước, **tường thuật liên tục** bằng giọng khác: *"Đã mở form. Đang chọn nhà cung cấp… đã chọn Minh Phát, mã NCC001."*
4. **Dừng bắt buộc trước mọi hành động không hoàn tác được** (Lưu, Gửi, Xóa, Duyệt) → chờ xác nhận bằng giọng nói.
5. **Chế độ "đọc lại kết quả từ nguồn khác"**: sau khi làm, agent đọc lại dữ liệu vừa nhập **từ database/API chứ không từ màn hình nó vừa gõ** → chống lỗi "agent tưởng mình làm đúng". Đây là thiết kế trực tiếp giải quyết lỗi **termination failure** mà nghiên cứu nêu.

**5. AI dùng ở đâu**
- **Computer-use agent** (Claude computer use / OmniParser) trên **UIA tree ưu tiên, vision fallback** — chính xác hơn và rẻ hơn.
- **LLM planning + constraint tracking**, có state machine tường minh để giảm lỗi constraint-tracking.
- **ASR/TTS tiếng Việt** cho vòng lặp lệnh–xác nhận.
- **Verification model độc lập** đọc lại kết quả từ nguồn khác (chống self-confirmation bias của agent).

**6. Điểm khác biệt**
Mọi demo computer-use agent hiện nay đều bán giấc mơ "AI làm hộ". ProxyHands bán **sự kiểm soát**: AI làm phần cơ học, con người giữ phần phán đoán. **Và đội có thể trích dẫn số 52,5% ngay trên slide** để chứng minh mình hiểu giới hạn — cực kỳ ghi điểm với giám khảo kỹ thuật.

**7. Prototype 3 ngày** Python + pywinauto/UIA + LLM + TTS, demo trên một web app nội bộ tự dựng hoặc một phần mềm desktop cũ. Ngày 1: đọc UIA tree + tường thuật. Ngày 2: planning + thực thi. Ngày 3: cơ chế xác nhận + verification.

**8. Tác động** Số ứng dụng nội bộ "không accessible" mà nhân viên khiếm thị vẫn dùng được. Thời gian hoàn thành tác vụ nhập liệu. Tỷ lệ lỗi.

**9. Rủi ro** — và đây là ý tưởng phải trả lời rủi ro giỏi nhất:
- *"52,5% thành công là quá thấp để dùng thật."* → Đúng, nên ProxyHands **không tự động hóa hoàn toàn**: mỗi bước đều tường thuật và mỗi hành động ghi đều xác nhận. Tỷ lệ thành công của **quy trình người + AI** cao hơn nhiều so với agent độc lập, vì người phát hiện lỗi ngay khi nghe.
- *"Agent nhập sai số tiền vào phần mềm kế toán?"* → dừng bắt buộc + đọc lại từ DB + audit log đầy đủ + giới hạn quyền tài khoản.
- *"Chi phí/độ trễ?"* → UIA tree rẻ hơn screenshot nhiều lần.

**10. Điểm:** IN **5** / UX **4** / FE **3** / AI **5** = **17/20**

---

## B6. DeepFocus
**"Họ nghe 500 từ/phút. Hãy trả tiền cho tốc độ đó."**

**2. Insight — lợi thế thật, không phải an ủi**
Người dùng screen reader thành thạo nghe TTS ở **300–600 wpm**, gấp 2–2,5 lần tốc độ đọc mắt trung bình (~250 wpm), và **không bị mỏi mắt** nên duy trì được lâu hơn. Với các công việc **quét khối lượng văn bản lớn để tìm mẫu** — rà soát hợp đồng, sàng lọc CV, kiểm tra tuân thủ, đọc phản hồi khách hàng, review tài liệu pháp lý — đây là **lợi thế năng suất đo được**.

Vấn đề: tốc độ đó chỉ phát huy khi **văn bản được cấu trúc đúng** và **có hệ thống đánh dấu phi thị giác** để "quay lại chỗ vừa nghe".

**3. Ai dùng** Pháp chế, tuân thủ, nhân sự (sàng lọc CV), nghiên cứu thị trường, biên tập, kiểm toán nội bộ, phân tích phản hồi khách hàng.

**4. Cách hoạt động**
1. Nạp 200 CV / 50 hợp đồng / 3.000 phản hồi khách hàng.
2. **AI chuẩn bị "đường chạy"**: chuẩn hóa cấu trúc, loại bỏ boilerplate, gộp phần trùng, gắn heading, **đánh dấu sẵn các đoạn AI nghi ngờ bất thường bằng earcon** (không thay người quyết định, chỉ gợi chú ý).
3. Người dùng nghe ở tốc độ tự chọn (400–600 wpm), **bấm một phím để "cắm cờ"** đoạn đáng chú ý — không cần dừng.
4. Sau lượt quét: quay lại các cờ ở tốc độ chậm, nói nhận xét → AI ghi thành báo cáo có cấu trúc.
5. **Bảng đo năng suất so sánh** hiển thị cho quản lý: X tài liệu/giờ so với mức trung bình của đội.

**5. AI dùng ở đâu** LLM tiền xử lý & chuẩn hóa cấu trúc văn bản (đây là việc làm cho tốc độ nghe cao khả thi); embedding + anomaly detection đánh dấu đoạn khả nghi; TTS tiếng Việt chất lượng cao **giữ được rõ ràng ở tốc độ cao** (bài toán kỹ thuật thật: phần lớn TTS tiếng Việt vỡ tiếng ở >2x — đây là điểm R&D hay); ASR ghi nhận xét; LLM tổng hợp báo cáo.

**6. Điểm khác biệt** Đây là ý tưởng duy nhất trong danh sách **không cố bù đắp khiếm khuyết mà khuếch đại một năng lực vốn có**. Không một công cụ nào (Be My AI, Seeing AI, Envision) có khái niệm "năng suất vượt trội".

**7. Prototype 3 ngày** Web app: upload bộ CV/hợp đồng mẫu → chuẩn hóa → nghe tốc độ cao → cắm cờ → báo cáo.
**Demo cực mạnh:** **so kè trực tiếp trên sân khấu.** Một thành viên sáng mắt đọc mắt 20 CV, một thành viên bịt mắt dùng DeepFocus. **Bấm giờ.** Nếu bên khiếm thị thắng — giám khảo sẽ nhớ mãi. (Lưu ý: tập trước để chắc chắn thắng, và nói rõ đây là minh họa nguyên lý, người khiếm thị thật sẽ còn nhanh hơn vì thạo TTS hơn.)

**8. Tác động** Số CV sàng lọc/giờ. Điều quan trọng nhất về impact: **chuyển câu chuyện tuyển dụng từ "chi phí hòa nhập" sang "lợi thế cạnh tranh"** — đây mới là thứ thay đổi hành vi nhà tuyển dụng Việt Nam.

**9. Rủi ro**
- *"Lợi thế này có thật không hay là đang lãng mạn hóa?"* → Phải đo thật trong hackathon; chọn đúng loại tác vụ (quét tuyến tính), không khẳng định cho mọi tác vụ.
- *"Thiên kiến AI khi đánh dấu CV?"* → AI chỉ đánh dấu để gây chú ý, **không chấm điểm ứng viên**; có kiểm tra bias.
- *"TTS tiếng Việt ở 500wpm nghe được không?"* → cần thử nghiệm sớm; dự phòng bằng cách dùng giọng chất lượng cao + tinh chỉnh prosody.

**10. Điểm:** IN **5** / UX **4** / FE **4** / AI **4** = **17/20**

---

## B7. SightShare
**"Người khiếm thị dạy cả công ty cách làm tài liệu tử tế."**

**2. Insight** Rào cản tồn tại vì **thiếu kiến thức và thiếu trách nhiệm giải trình**, chứ không phải thiếu công nghệ: "người tạo tài liệu không hiểu cấu trúc đúng", "việc tiếp cận phụ thuộc vào thiện chí từng đồng nghiệp thay vì chuẩn mực tổ chức". Nhưng khi đào tạo do người sáng mắt dạy thì nó là lý thuyết; **khi do chính đồng nghiệp khiếm thị dạy, nó là trải nghiệm** — và hiệu quả thay đổi hành vi cao hơn nhiều.

**3. Ai dùng** Nhân viên khiếm thị làm **reverse mentor / a11y champion** nội bộ; học viên là toàn bộ nhân viên.

**4. Cách hoạt động**
1. Hệ thống chấm điểm tài liệu tự động theo phòng ban → **bảng xếp hạng "Phòng làm tài liệu tử tế nhất tháng"**.
2. Mỗi khi ai đó tạo file điểm thấp → nhận **một clip audio 30 giây do chính đồng nghiệp khiếm thị ghi**: *"Đây là file của bạn khi mình mở bằng NVDA."* — rồi phát **âm thanh thật của screen reader vật lộn với file đó**.
3. AI biến trải nghiệm đó thành bài học ngắn 2 phút, cá nhân hóa theo đúng lỗi họ mắc.
4. Người khiếm thị được ghi nhận vai trò chính thức, có KPI và phụ cấp.
5. Doanh nghiệp có báo cáo ESG/DEI xuất ra được.

**5. AI dùng ở đâu** Rule engine + LLM chấm điểm tài liệu; **mô phỏng screen reader tự động** sinh audio "đây là file của bạn khi bị đọc"; LLM sinh micro-lesson cá nhân hóa; phân tích xu hướng hành vi theo phòng ban.

**6. Điểm khác biệt** Chuyển người khiếm thị từ **người thụ hưởng** thành **người có quyền lực văn hóa trong tổ chức**. Không tool nào làm. Kết hợp cực tốt với B4 (FixAtSource sửa máy móc, SightShare sửa con người).

**7. Prototype 3 ngày** Web app chấm điểm + sinh audio mô phỏng screen reader + leaderboard + bot Teams. Khả thi cao.

**8. Tác động** Điểm tài liệu trung bình theo tháng. Tỷ lệ nhân viên hoàn thành micro-lesson. **Chỉ số hòa nhập có thể đưa vào báo cáo ESG** — thứ doanh nghiệp đa quốc gia ở VN đang cần.

**9. Rủi ro** Gamification có thể gây phản cảm nếu làm như "bêu tên". → Khen phòng tốt thay vì phạt phòng xấu; phản hồi riêng tư.

**10. Điểm:** IN **4** / UX **4** / FE **4** / AI **3** = **15/20**

---

## B8. KPI Radio
**"Doanh nghiệp nghe báo cáo, không nhìn báo cáo."**

**2. Insight** Phần lớn báo cáo nội bộ được *lướt qua* chứ không đọc kỹ. Nếu biến báo cáo thành **bản tin audio 3 phút cá nhân hóa**, người khiếm thị tiếp cận bình đẳng **và** sếp sáng mắt cũng nghe trên đường đi làm — sản phẩm tự bán được.

**3. Ai dùng** Quản lý, sales, vận hành; người khiếm thị ở mọi vị trí.

**4. Cách hoạt động**
1. Kết nối nguồn dữ liệu (Google Sheets, Power BI, CRM, ERP).
2. Mỗi 7h sáng sinh **"bản tin"** riêng cho từng người theo vai trò: *"Sáng nay, doanh thu tuần đạt 82% chỉ tiêu. Ba điều đáng chú ý…"*
3. Xen **sonification** cho xu hướng, earcon cho cảnh báo.
4. Nghe xong có thể hỏi lại bằng giọng nói: *"Vì sao chi nhánh Đà Nẵng giảm?"*
5. Phát qua Zalo voice message / Teams / podcast feed riêng tư — **kênh rất phù hợp thói quen Việt Nam**.

**5. AI dùng ở đâu** LLM sinh narrative từ dữ liệu số thật (không từ ảnh); LLM ưu tiên hóa theo vai trò; anomaly detection chọn "điều đáng chú ý"; TTS tiếng Việt tự nhiên; sonification; RAG để trả lời câu hỏi đào sâu.

**6. Điểm khác biệt** Định vị thương mại: bán cho doanh nghiệp như sản phẩm **năng suất**, accessibility là thuộc tính mặc định. Đây là câu trả lời cho câu hỏi khó nhất của hackathon: *"Ai trả tiền?"*

**7. Prototype 3 ngày** Rất khả thi: Google Sheets API + LLM + TTS + gửi file audio qua Zalo/Telegram bot. Có thể xong ngày 2, dành ngày 3 polish.

**8. Tác động** Tỷ lệ mở/nghe bản tin so với tỷ lệ mở báo cáo email (dự kiến cao hơn nhiều). Người khiếm thị lần đầu nhận được báo cáo ở **cùng thời điểm và cùng chất lượng** như đồng nghiệp.

**9. Rủi ro** LLM diễn giải sai nguyên nhân → phân tách rõ "số liệu" (giọng A) và "giả thuyết" (giọng B, có câu rào). Bảo mật dữ liệu kinh doanh → triển khai on-prem/VPC.

**10. Điểm:** IN **4** / UX **4** / FE **5** / AI **4** = **17/20**

---

# NHÓM C — "THỰC TẾ / DÙNG NGAY ĐƯỢC"
*Cắm vào Excel/Teams/Slack/trình duyệt là chạy*

---

## C1. AltBot VN
**"Gửi ảnh vào chat, 5 giây sau có mô tả tiếng Việt."**

**2. Insight** Đồng nghiệp dán screenshot vào nhóm Teams/Slack/Zalo suốt ngày ("lỗi này là gì vậy mọi người?"). Với người khiếm thị, đó là **khoảng trắng tuyệt đối** giữa dòng hội thoại. **53,1% ảnh thiếu alt text**, và trong chat nội bộ thì gần như 100%.

**3. Ai dùng** Mọi nhân viên khiếm thị trong doanh nghiệp dùng Teams/Slack/Zalo/Google Chat.

**4. Cách hoạt động**
1. Bot được thêm vào workspace.
2. Mỗi khi có ảnh/screenshot/file được đăng → bot **tự động trả lời trong thread** bằng mô tả tiếng Việt có cấu trúc: *"Ảnh chụp màn hình lỗi. Hộp thoại đỏ: 'Không thể kết nối máy chủ, mã lỗi 503'. Bên dưới có nút Thử lại và Hủy."*
3. Với bảng/biểu đồ: mô tả + **trích xuất thành bảng markdown đọc được**.
4. Người khiếm thị có thể reply `@altbot chi tiết hơn` hoặc hỏi tiếp về ảnh đó.
5. Chế độ riêng tư: chỉ người bật mới thấy mô tả (tránh làm loãng kênh chung) — hoặc chế độ công khai để cả nhóm hưởng lợi.

**5. AI dùng ở đâu** VLM (Claude/GPT-5 vision) sinh mô tả **theo ngữ cảnh cuộc hội thoại** chứ không mô tả trơ trọi — đây là giá trị thật, vì bot đọc được cả các tin nhắn trước đó; **OCR tiếng Việt có dấu** cho screenshot chứa chữ; LLM phân loại ảnh (ảnh lỗi / bảng / biểu đồ / meme / tài liệu) để chọn khuôn mô tả phù hợp; TTS tùy chọn.

**6. Điểm khác biệt** Be My AI cần người dùng **chủ động chụp/tải ảnh lên app khác** — mất mạch làm việc và mất riêng tư. AltBot **sống trong kênh chat**, tự động, tiếng Việt, và **hiểu ngữ cảnh cuộc trò chuyện**.

**7. Prototype 3 ngày** Rất khả thi — Slack Bolt hoặc Teams Bot Framework hoặc Zalo OA webhook. Có thể xong trong 1,5 ngày. **Đây là "an toàn" của đội: nếu ý tưởng chính trục trặc, cái này chắc chắn chạy được trên sân khấu.**

**8. Tác động** % tin nhắn có ảnh mà người khiếm thị hiểu được: ~0% → >90%. Độ trễ tham gia hội thoại. Rất dễ đo bằng log.

**9. Rủi ro** Mô tả sai/hallucination → gắn nhãn "mô tả tự động"; ảnh nhạy cảm (lương, hợp đồng) → tùy chọn xử lý on-prem hoặc chỉ OCR không gửi cloud; chi phí → cache theo hash ảnh, ảnh trùng không gọi lại API.

**10. Điểm:** IN **3** / UX **5** / FE **5** / AI **3** = **16/20**

---

## C2. TabTalk
**"Hỏi bất kỳ trang web nội bộ nào bằng tiếng Việt."**

**2. Insight** CRM, ERP, HRM nội bộ của doanh nghiệp Việt (Base.vn, MISA AMIS, KiotViet, phần mềm tự viết) **hầu như không ai test với screen reader**. WebAIM Million 2026: 51% thiếu form label, 46,3% empty link, 30,6% empty button — và đó là trang chủ công khai của công ty lớn; hệ thống nội bộ còn tệ hơn.

**3. Ai dùng** Nhân viên văn phòng khiếm thị ở mọi vị trí dùng phần mềm web nội bộ.

**4. Cách hoạt động**
1. Chrome extension. `Alt+T` → **"tóm tắt cấu trúc trang"**: *"Trang Danh sách đơn hàng. 1 thanh tìm kiếm, 4 bộ lọc, bảng 120 dòng 8 cột, phân trang 6 trang."* — thứ screen reader không nói được.
2. `Alt+H` → hỏi bằng tiếng Việt: *"Đơn nào đang quá hạn giao?"* → extension **đọc DOM + AOM**, lọc, trả lời, và **nhảy focus tới đúng dòng**.
3. **Vá nhãn tức thời**: phát hiện nút không tên → AI suy ra chức năng từ ngữ cảnh (icon, vị trí, DOM lân cận) và **gán ARIA label ngay trong phiên**, có lưu lại để lần sau không cần gọi AI (**"vá cộng đồng"**: người dùng khác ở cùng công ty hưởng lợi ngay).
4. **Bảng lồng nhau**: chuyển thành cấu trúc phẳng điều hướng được bằng phím.
5. **Điền form bằng giọng nói** với xác nhận từng trường trước khi submit.

**5. AI dùng ở đâu** **Live semantic scene graph từ DOM + AOM** (đúng hướng nghiên cứu "Screen Reader AI" 2025 — nêu được điều này trong pitch là ghi điểm học thuật); LLM suy luận chức năng của element vô danh; LLM query engine trên dữ liệu bảng đã trích; ASR tiếng Việt; **cache nhãn theo domain** để giảm chi phí về gần 0 sau vài lần dùng.

**6. Điểm khác biệt** ChatGPT không nằm trong trang; Be My AI không thao tác được. TabTalk vừa **đọc hiểu** vừa **vá giao diện** vừa **học tích lũy theo tổ chức** — càng dùng càng rẻ và càng chính xác.

**7. Prototype 3 ngày** Chrome Extension MV3. Ngày 1: tóm tắt cấu trúc + AOM parsing. Ngày 2: Q&A + jump focus. Ngày 3: vá ARIA label + cache. Demo trên một web app nội bộ tự dựng có lỗi cố ý.

**8. Tác động** Số thao tác để hoàn thành tác vụ CRM. Số phần mềm nội bộ "dùng được". Tỷ lệ nhãn được vá tự động.

**9. Rủi ro** Bảo mật (extension đọc nội dung trang) → xử lý local tối đa, chỉ gửi text đã ẩn danh, có chế độ allowlist domain do IT cấu hình. SPA thay đổi DOM liên tục → dùng MutationObserver có debounce.

**10. Điểm:** IN **4** / UX **5** / FE **4** / AI **4** = **17/20**

---

## C3. CallSight
**"Tổng đài viên khiếm thị nghe được cả màn hình lẫn khách hàng."**

**2. Insight** CSKH/telesales là **cánh cửa việc làm thực tế nhất** cho người khiếm thị ở VN: công việc chủ yếu bằng giọng nói, không cần di chuyển, tuyển số lượng lớn, đào tạo ngắn. Nhưng bị chặn bởi một thứ: **phần mềm CRM**. Tổng đài viên phải vừa nghe khách vừa đọc lịch sử khách hàng vừa gõ ghi chú — với screen reader thì **hai luồng âm thanh chồng nhau**, không thể làm nổi.

**3. Ai dùng** Tổng đài viên, telesales, chăm sóc khách hàng, hỗ trợ kỹ thuật — nhóm nghề có nhu cầu tuyển lớn nhất ở TP.HCM.

**4. Cách hoạt động — thiết kế xoay quanh "hai tai một não"**
1. Cuộc gọi đến → **trước khi nhận máy 3 giây**, tai trái nghe **thẻ khách hàng nén**: *"Chị Lan, khách VIP, 3 đơn, lần gần nhất khiếu nại giao chậm."* Tai phải sẽ dành cho khách.
2. Trong cuộc gọi, **không dùng giọng nói để cung cấp thông tin** (sẽ chồng tiếng) mà dùng **earcon + braille display**: thông tin mới hiện trên braille display 40 ô, hoặc earcon rất ngắn báo cảnh báo (khách đang tức giận, có khuyến mãi phù hợp).
3. **Ghi chú tự động**: AI nghe cuộc gọi, tự điền form CRM (lý do gọi, hướng xử lý, kết quả) → tổng đài viên chỉ **xác nhận bằng một phím**, không phải gõ trong lúc nghe.
4. **Gợi ý câu trả lời từ RAG trên tài liệu nội bộ** hiện trên braille display, không đọc thành tiếng.
5. Sau cuộc gọi: tóm tắt audio 10 giây + ticket đã tạo sẵn.

**5. AI dùng ở đâu** **ASR PhoWhisper realtime** trên luồng khách hàng; **RAG trên kho tri thức nội bộ** (chính sách, giá, quy trình) để gợi ý; LLM tự điền CRM từ hội thoại; **phân tích cảm xúc giọng nói** (khách đang bực) → earcon; **thiết kế trình bày ưu tiên braille + earcon thay vì TTS** — đây là điểm UX tinh tế nhất và cho thấy đội thật sự hiểu trải nghiệm phi thị giác.

**6. Điểm khác biệt** Không tool nào giải bài toán **xung đột kênh thính giác** — vấn đề đặc thù và quyết định của nghề CSKH. Be My AI/ChatGPT voice **làm vấn đề tệ hơn** vì chúng cũng nói.

**7. Prototype 3 ngày** Web app CRM giả lập + WebRTC + ASR realtime + earcon + auto-fill. Ngày 1: CRM giả + thẻ khách hàng. Ngày 2: ASR + auto-fill. Ngày 3: earcon + RAG.
**Demo:** mô phỏng một cuộc gọi khách hàng thật bằng tiếng Việt, giám khảo đóng vai khách.

**8. Tác động** AHT (average handle time) so với tổng đài viên sáng mắt — **mục tiêu ngang bằng, đây là điểm chốt: chứng minh không cần ưu ái**. Số vị trí CSKH mở cho người khiếm thị. Đây là ý tưởng có **đường đi tới việc làm thật ngắn nhất**.

**9. Rủi ro** Dữ liệu khách hàng (PII) gửi cloud → ASR on-prem (PhoWhisper chạy local được), ẩn danh hóa trước khi gọi LLM, tuân thủ Nghị định 13/2023 về bảo vệ dữ liệu cá nhân — **nêu được nghị định này rất ghi điểm bối cảnh VN**. Braille display đắt → có chế độ dự phòng dùng earcon + TTS thì thầm khi khách đang im lặng.

**10. Điểm:** IN **4** / UX **4** / FE **4** / AI **4** = **16/20**

---

## C4. DocPipe VN
**"Mọi PDF scan tiếng Việt trở thành tài liệu đọc được, tự động."**

**2. Insight** **67% PDF không đọc được một phần hoặc hoàn toàn.** Ở Việt Nam còn nặng hơn: hóa đơn scan, công văn có dấu mộc đỏ, hợp đồng ký tay scan lại, biểu mẫu thuế, sao kê ngân hàng — **và OCR tiếng Việt có dấu khó hơn tiếng Anh đáng kể** (dấu thanh, dấu mũ, chữ đ). Với kế toán/hành chính khiếm thị, đây là rào cản số một.

**3. Ai dùng** Kế toán, hành chính nhân sự, pháp chế, ngân hàng, bảo hiểm.

**4. Cách hoạt động**
1. Thả file vào thư mục theo dõi (hoặc forward email tới địa chỉ riêng).
2. Pipeline: phát hiện scan → khử nghiêng/khử nhiễu → **OCR tiếng Việt** → **phục hồi thứ tự đọc** (cột, sidebar, footnote) → nhận diện bảng → gắn thẻ cấu trúc PDF/UA (heading, list, table header) → gắn `lang="vi"` → sinh alt text cho con dấu/chữ ký/logo.
3. Trả về **3 bản**: PDF đã tag, bản Word/HTML có heading điều hướng bằng phím, và **bản tóm tắt audio 60 giây**.
4. Thông báo: *"Đã xử lý. Hợp đồng 12 trang, 3 bảng, 2 chữ ký, 1 con dấu. Điều khoản thanh toán ở mục 4.2. Nhấn 1 để nghe tóm tắt."*
5. Chế độ hàng loạt: quét cả kho tài liệu cũ qua đêm.

**5. AI dùng ở đâu** **OCR tiếng Việt** (PaddleOCR/VietOCR fine-tune) — nêu rõ đây là **bài toán tiếng Việt riêng biệt, không dùng được giải pháp tiếng Anh**, rất ghi điểm bản địa hóa; **layout model** (LayoutLMv3/DocLayout-YOLO) phục hồi reading order; **table structure recognition**; **VLM** mô tả con dấu, chữ ký, biểu đồ nhúng; **LLM** sinh tóm tắt và phát hiện điều khoản quan trọng; TTS.

**6. Điểm khác biệt** Be My Eyes Workplace Reader làm việc tương tự nhưng **tiếng Anh, giá enterprise**. DocPipe VN tối ưu cho **văn bản hành chính Việt Nam** (mẫu công văn, hóa đơn GTGT, con dấu tròn đỏ) và triển khai được **on-premise** — điều kiện bắt buộc với ngân hàng/bảo hiểm VN.

**7. Prototype 3 ngày** Python + PaddleOCR + pikepdf/ocrmypdf + LLM. Rất khả thi, có thể chạy hoàn toàn local → **demo không cần internet, chống rủi ro wifi hội trường**.
**Demo:** lấy một công văn scan thật có dấu đỏ → NVDA đọc: im lặng → chạy DocPipe 10 giây → NVDA đọc trơn tru. Tương phản rõ ràng.

**8. Tác động** Thời gian xử lý 1 tài liệu: 45 phút (tự OCR, tự sửa) → 15 giây. Số tài liệu tồn kho được mở khóa. Độ chính xác OCR tiếng Việt (đo bằng CER) — **có con số cụ thể để đưa lên slide**.

**9. Rủi ro** OCR sai dấu → hiển thị confidence, đánh dấu đoạn độ tin cậy thấp để người dùng biết cần xác minh, **không tự sửa im lặng**. Tài liệu mật → chạy on-prem hoàn toàn.

**10. Điểm:** IN **3** / UX **5** / FE **5** / AI **4** = **17/20**

---

## C5. CodeEar
**"IDE nói được cấu trúc, và AI không còn thì thầm sau lưng bạn."**

**2. Insight** Lập trình viên khiếm thị "không hài lòng với accessibility của hầu hết IDE do lạm dụng trừu tượng hóa thị giác"; khó điều hướng vào/ra cấu trúc lồng nhau; syntax highlighting, autocomplete, linting, breakpoint đều **bị bỏ phí ngay cả với dev khiếm thị giàu kinh nghiệm**. Và **vấn đề mới của 2025–2026: AI code completion hiện gợi ý dưới dạng "ghost text" xám — screen reader user không có cách kiểm tra trước khi chấp nhận, dẫn tới sửa code ngoài ý muốn và quá tải thông tin.** Nghịch lý: **AI đang làm lập trình kém accessible hơn.**

**3. Ai dùng** Dev, data engineer khiếm thị — nghề lương cao, remote được, rất phù hợp, và ngành CNTT VN đang khát nhân lực.

**4. Cách hoạt động**
1. VS Code extension. `Alt+O` → **"bản đồ file"**: *"file auth.ts, 340 dòng. 3 class, 12 function. Đang ở function login, dòng 88, trong khối if lồng cấp 2."* — trả lời câu hỏi "tôi đang ở đâu" mà dev khiếm thị hỏi liên tục.
2. **Earcon độ sâu lồng**: pitch tăng theo cấp indent → nghe ra mình đang lồng sâu bao nhiêu mà không cần đếm.
3. **Sửa "ghost text"**: AI suggestion **không tự đọc ra**, thay vào đó phát một earcon rất nhẹ. `Alt+G` → *"Gợi ý 8 dòng: tạo hàm validateToken, có try-catch, gọi jwt.verify."* — **tóm tắt trước, chi tiết sau, chấp nhận sau cùng**. Giải quyết đúng vấn đề nghiên cứu 2025 nêu.
4. **Đọc diff thông minh**: không đọc "+++, ---" mà nói *"3 thay đổi: thêm kiểm tra null ở dòng 45, đổi tên biến user thành currentUser ở 12 chỗ, xóa hàm cũ deprecated."*
5. **Đọc lỗi build/test**: gom nhóm, đọc nguyên nhân gốc trước thay vì 200 dòng stack trace.

**5. AI dùng ở đâu** LLM tóm tắt AST/cấu trúc code; LLM tóm tắt diff theo ngữ nghĩa; LLM phân tích stack trace → nguyên nhân gốc; **thiết kế lại UX của AI completion cho screen reader** (đây là đóng góp gốc, không phải wrapper); TTS + earcon.

**6. Điểm khác biệt** Copilot/Cursor **làm cho vấn đề tệ hơn** với người khiếm thị. CodeEar là công cụ đầu tiên coi "AI assistant phải accessible" là bài toán cần giải, có căn cứ nghiên cứu ASSETS 2025.

**7. Prototype 3 ngày** VS Code Extension (TypeScript) — dev nhanh, demo rõ. Ngày 1: bản đồ file + earcon indent. Ngày 2: ghost text handler. Ngày 3: diff + error summary.

**8. Tác động** Thời gian định vị trong codebase lạ. Tỷ lệ dev khiếm thị dùng được AI coding tool: hiện ~0 → khả dụng. Mở nghề lương cao nhất trong danh sách.

**9. Rủi ro** Phạm vi rộng, dễ làm hời hợt → chọn **chỉ 2 tính năng làm thật sâu**: bản đồ file + ghost text. Gửi code lên LLM → dùng model local hoặc chế độ chỉ gửi AST/signature.

**10. Điểm:** IN **4** / UX **4** / FE **3** / AI **4** = **15/20**

---

## C6. ColorGuard
**"Màu sắc trong công việc phải nói được thành lời."**

**2. Insight — nhóm bị bỏ quên nhất**
**~8% nam giới và 0,5% nữ giới mù màu**, chủ yếu đỏ-lục. Bảng conditional formatting **đỏ/vàng/xanh mặc định của Excel** và heatmap dashboard là cái bẫy hằng ngày: *"so sánh đỏ-lục có thể trông như hai sắc độ của cùng một màu."* Thêm nữa **83,9% trang web có lỗi low contrast** — lỗi phổ biến nhất WebAIM Million 2026, ảnh hưởng trực tiếp nhóm low vision. **Đây là nhóm đông nhất trong "visual impairment" nhưng ít ai làm giải pháp, vì nó không "cảm động".** Làm cái này cho thấy đội hiểu rằng khiếm thị là một phổ, không phải một trạng thái — **ghi điểm mạnh tiêu chí User-Centered Design.**

**3. Ai dùng** Nhân viên mù màu (~1 trong 12 nam giới trong mọi công ty — nghĩa là **gần như công ty nào cũng có**), nhân viên low vision.

**4. Cách hoạt động**
1. Extension + Excel add-in. **Chế độ "màu thành chữ"**: mọi ô/phần tử mã hóa bằng màu được **thêm nhãn text hoặc ký hiệu**: ô đỏ → thêm "▼ Dưới chỉ tiêu"; chuỗi biểu đồ → thêm pattern (sọc/chấm) thay vì chỉ màu.
2. **Đọc màu theo yêu cầu**: hover/focus → *"Ô này màu đỏ nhạt, đang cảnh báo."*
3. **Đổi bảng màu an toàn tự động**: thay palette đỏ-lục bằng **xanh dương–cam** (cặp phân biệt được với mọi dạng mù màu phổ biến) hoặc palette 7 màu chuẩn cartography; áp dụng cho cả Excel, Power BI, web.
4. **Kiểm tra tương phản thời gian thực** với cảnh báo WCAG, và chế độ tăng tương phản cục bộ cho low vision **không làm vỡ layout** (vấn đề lớn của magnifier ở 200%).
5. **Chế độ cho người tạo nội dung**: cảnh báo ngay khi ai đó dùng màu đơn lẻ để truyền đạt thông tin.

**5. AI dùng ở đâu** Thuật toán mô phỏng sắc giác (ma trận Brettel/Viénot) — **chính xác, không dùng AI**; **LLM suy ra Ý NGHĨA của màu từ ngữ cảnh** (ô đỏ này nghĩa là gì? đọc rule conditional formatting, đọc legend, đọc các ô xung quanh) → đây mới là phần AI thật sự khó và giá trị; LLM đề xuất palette thay thế giữ nguyên tính thẩm mỹ; VLM cho ảnh raster không có dữ liệu.

**6. Điểm khác biệt** Các app mù màu hiện có chỉ **filter màu màn hình**. ColorGuard **chuyển màu thành ngữ nghĩa** — biết ô đỏ này nghĩa là "dưới chỉ tiêu" chứ không chỉ nói "màu đỏ". Và nó **phục vụ cả người tạo lẫn người đọc** (hai chiều).

**7. Prototype 3 ngày** Chrome extension + Office.js. Rất khả thi. Demo: dashboard trước/sau qua bộ lọc mô phỏng deuteranopia — **cực kỳ dễ hiểu trên video, giám khảo thấy ngay bằng mắt mình**.

**8. Tác động** % thông tin mã hóa bằng màu được chuyển thành text. Tỷ lệ đọc đúng dashboard của người mù màu (test A/B đo được ngay trong hackathon). **Số người hưởng lợi rất lớn: ~4% tổng nhân sự của mọi công ty.**

**9. Rủi ro** Thêm nhãn làm rối giao diện → cho bật/tắt, chỉ áp dụng khi cần. AI hiểu sai ngữ nghĩa màu → đọc rule conditional formatting thật thay vì đoán.

**10. Điểm:** IN **3** / UX **5** / FE **5** / AI **3** = **16/20**

---

## C7. HireFair
**"Rào cản lớn nhất không phải công việc — mà là vòng tuyển dụng."**

**2. Insight** Người khiếm thị bị loại **trước khi được thử việc**: hệ thống ATS có CAPTCHA, form không label, bài test online dạng kéo-thả hoặc có giới hạn thời gian không cho phép điều chỉnh, phỏng vấn video có bài tập trên màn hình chia sẻ. Với **8,8% NKT có chứng chỉ nghề** (so với 29,2% chung), mỗi vòng loại bất công đều đắt.

**3. Ai dùng** Ứng viên khiếm thị + bộ phận tuyển dụng của doanh nghiệp.

**4. Cách hoạt động — hai phía**
*Phía ứng viên:*
1. Extension hỗ trợ điền form tuyển dụng, đọc cấu trúc JD, cảnh báo CAPTCHA và **gợi ý kênh liên hệ thay thế** (không tự giải CAPTCHA — vấn đề đạo đức/điều khoản dịch vụ).
2. **Luyện phỏng vấn**: AI đóng vai nhà tuyển dụng bằng giọng Việt, hỏi câu hỏi theo JD, phản hồi về nội dung + tốc độ nói + từ đệm. Hữu ích đặc biệt cho người **mất thị lực muộn** đang chuyển nghề.
3. Chuẩn bị CV đúng định dạng ATS đọc được.

*Phía doanh nghiệp:*
4. **Kiểm tra vòng tuyển dụng của chính công ty**: quét trang tuyển dụng + form + bài test → báo cáo "vòng tuyển dụng của bạn loại bỏ ai".
5. Sinh **phiên bản accessible của bài test** và checklist phỏng vấn hòa nhập.

**5. AI dùng ở đâu** LLM đóng vai phỏng vấn + phản hồi; ASR PhoWhisper phân tích cách trả lời; quét a11y form tuyển dụng (axe-core + LLM); LLM chuyển bài test thị giác → bài test tương đương phi thị giác **giữ nguyên độ khó** (bài toán thú vị: đo cùng năng lực bằng phương thức khác).

**6. Điểm khác biệt** Đánh vào **điểm nghẽn thượng nguồn** — không công cụ nào trong danh sách chạm tới tuyển dụng. Đúng trọng tâm "employability" của đề bài.

**7. Prototype 3 ngày** Web app luyện phỏng vấn (nhanh, demo cảm xúc tốt) + module quét trang tuyển dụng của 3 công ty VN thật (kết quả chắc chắn có lỗi → tạo cú sốc trên sân khấu).

**8. Tác động** Tỷ lệ ứng viên khiếm thị qua vòng nộp hồ sơ. Số công ty sửa quy trình tuyển dụng. Kết nối trực tiếp với con số 94% thất nghiệp và tỷ lệ tham gia LĐ 23,9%.

**9. Rủi ro** Không được tự động giải CAPTCHA (vi phạm ToS và rủi ro pháp lý) → chỉ phát hiện và đề xuất kênh thay thế + vận động doanh nghiệp bỏ CAPTCHA. Doanh nghiệp có chịu sửa không → gắn với nghĩa vụ báo cáo ESG/DEI.

**10. Điểm:** IN **4** / UX **4** / FE **4** / AI **3** = **15/20**

---

## C8. ZaloWork Reader
**"Vì ở Việt Nam, công việc chạy trên Zalo."**

**2. Insight** Đây là insight **không một công ty nước ngoài nào có**: ở Việt Nam, một tỷ lệ rất lớn giao tiếp công việc thực tế diễn ra trên **Zalo** — nhóm phòng ban, Zalo OA chăm sóc khách hàng, gửi hóa đơn/báo giá bằng **ảnh chụp**, chốt đơn bằng tin nhắn thoại, gửi file Excel qua Zalo PC. Toàn bộ Be My Eyes / Seeing AI / Envision **không biết Zalo tồn tại**.

**3. Ai dùng** Nhân viên bán hàng, CSKH, kế toán, admin ở SME Việt Nam — **nhóm doanh nghiệp đông nhất và ít nguồn lực accessibility nhất**.

**4. Cách hoạt động**
1. App companion chạy cùng Zalo PC (đọc qua UIA) hoặc bot trên Zalo OA.
2. Ảnh gửi vào nhóm → tự động mô tả tiếng Việt + OCR (báo giá, hóa đơn, biên lai chuyển khoản → **trích thành số liệu có cấu trúc**).
3. Tin nhắn thoại → tự chuyển thành văn bản (PhoWhisper) để đọc bằng screen reader ở tốc độ cao thay vì phải nghe từng cái.
4. Tóm tắt nhóm chat: *"Nhóm Kinh doanh HCM có 87 tin từ sáng. 3 điều liên quan đến bạn."*
5. Soạn và gửi trả lời bằng giọng nói.

**5. AI dùng ở đâu** VLM + OCR tiếng Việt cho ảnh hóa đơn/báo giá (trích số tiền, mã đơn, tên khách); PhoWhisper cho voice message; LLM tóm tắt và lọc theo mức liên quan; UIA để đọc cửa sổ Zalo PC.

**6. Điểm khác biệt** **Tính bản địa tuyệt đối.** Đây là ý tưởng mà một đội ở RMIT Việt Nam làm được còn một startup Mỹ thì không. Rất đáng đưa vào ít nhất một slide dù không chọn làm sản phẩm chính.

**7. Prototype 3 ngày** Zalo OA webhook là con đường dễ nhất (có API chính thức). Hoặc mô phỏng giao diện chat nếu API hạn chế.

**8. Tác động** Số SME có thể tuyển nhân viên khiếm thị mà không cần đổi toàn bộ công cụ. Tỷ lệ tin nhắn công việc tiếp cận được.

**9. Rủi ro** Zalo API hạn chế cho client PC → tập trung vào Zalo OA (dành cho doanh nghiệp, có API) và dùng UIA cho bản PC. Quyền riêng tư tin nhắn → xử lý local.

**10. Điểm:** IN **3** / UX **4** / FE **4** / AI **3** = **14/20**

---

# PHẦN III — XẾP HẠNG TOP 5

| Hạng | Ý tưởng | Tổng | IN | UX | FE | AI | Lý do ngắn |
|---|---|---|---|---|---|---|---|
| **1** | **A2. ChartLens** | **19** | 5 | 5 | 4 | 5 | Nỗi đau rõ ràng nhất và chưa ai giải; cực kỳ demo-able; và **cơ chế nhãn độ tin cậy là câu trả lời đạo đức cho rủi ro lớn nhất của AI** — giám khảo sẽ nhớ |
| **2** | **A1. EchoSheet** | **19** | 5 | 5 | 4 | 5 | Đánh trúng nghề mà người khiếm thị VN được đào tạo nhiều nhất; sonification + spatial audio tạo khoảnh khắc WOW thật; đọc dữ liệu thật nên chống hallucination |
| **3** | **B4. FixAtSource** | **18** | 5 | 5 | 4 | 4 | Insight cấu trúc sắc nhất: **sửa nguồn thay vì phiên dịch**. Khác biệt rõ nhất so với Be My Eyes Workplace. Demo tương phản cực mạnh |
| **4** | **B1. BlindSpot** | **18** | 5 | 5 | 4 | 4 | Framing đảo ngược: người khiếm thị là **nhà cung cấp dịch vụ chuyên môn**, không phải người thụ hưởng. Có mô hình doanh thu thật → ghi điểm Feasibility và Impact |
| **5** | **A3. MeetMate VN** | **18** | 4 | 5 | 4 | 5 | Họp hybrid là trung tâm của "workplace inclusion" hiện đại; hợp nhất 3 luồng lời nói + hình ảnh + phi ngôn ngữ, chưa ai làm; demo giàu cảm xúc |

**Sát nút (đáng giữ làm dự phòng hoặc module phụ):** B5 ProxyHands (17), B6 DeepFocus (17), B8 KPI Radio (17), C2 TabTalk (17), C4 DocPipe VN (17).

---

## Khuyến nghị chiến lược cho đội

**1. Đừng làm 5 thứ. Làm 1 sản phẩm, 3 module.**
Đề xuất: đặt tên chung **Offixed** — *"Bộ công cụ AI cho nơi làm việc không cần nhìn"*, gồm:
- **Lõi (bắt buộc làm thật, demo kỹ):** **EchoSheet + ChartLens** — cùng thuộc bài toán "dữ liệu phi thị giác", chia sẻ chung engine sonification, TTS, narrative → **chi phí kỹ thuật gần như của một module nhưng kể được câu chuyện của hai**.
- **Module khác biệt (làm mức demo được):** **FixAtSource** — để trả lời câu hỏi *"khác gì Be My Eyes Workplace?"* bằng một câu: **"Họ dịch tài liệu xấu. Chúng tôi xóa tài liệu xấu."**
- **Tầm nhìn (chỉ trên slide, không code):** **BlindSpot** — lộ trình từ "công cụ trợ giúp" sang "nghề nghiệp có vị thế".

**2. Ba câu quyết định thắng thua, chuẩn bị sẵn:**
- *"AI mô tả sai số liệu thì sao?"* → **"Chúng tôi không để AI nhìn số. Số lấy từ API. AI chỉ diễn giải, và mọi câu trả lời đều kèm địa chỉ ô để người dùng tự kiểm chứng."**
- *"Khác gì Be My Eyes Workplace ra mắt tháng 2/2026?"* → **"Ba điều: tiếng Việt và phần mềm Việt; đọc ngữ nghĩa dữ liệu chứ không mô tả ảnh màn hình; và sửa từ nguồn thay vì phiên dịch mãi mãi."**
- *"AI agent có làm thay được hết không?"* → **"Không, và chúng tôi không hứa thế. Nghiên cứu EMNLP 2026 cho thấy agent tốt nhất chỉ đạt 52,5% trên tác vụ desktop của người dùng mù. Chúng tôi thiết kế theo hướng cộng tác: AI làm thao tác, con người giữ quyền quyết định."**

**3. Đặt lịch gặp Sao Mai Center (Q. Tân Phú) trong ngày 1.** Chỉ cần **một buổi test 45 phút với 2–3 người dùng thật** và **một video clip 20 giây họ nói về nỗi đau của họ** là tiêu chí User-Centered Design gần như chắc điểm tối đa. Đây là lợi thế lớn nhất mà một đội ở TP.HCM có thể khai thác, và hầu hết các đội sẽ bỏ qua.

**4. Cấu trúc video 5 phút gợi ý:** 0:00–0:30 con số 94% thất nghiệp + tiếng NVDA vật lộn với file Excel thật (để im 10 giây — sự im lặng đó chính là thông điệp) → 0:30–1:00 gap statement (tất cả AI hiện có đều mô tả thế giới, không ai giúp làm việc) → 1:00–3:30 demo live EchoSheet + ChartLens, màn hình tắt → 3:30–4:15 FixAtSource (tương phản trước/sau) → 4:15–4:45 người dùng thật ở Sao Mai nói một câu → 4:45–5:00 tầm nhìn BlindSpot + kêu gọi.

---

## Nguồn

- [Vietnam: Closing the gap — NV Access](https://www.nvaccess.org/post/closing_the_gap_in_vietnam/)
- [Sao Mai Center for the Blind (SMCB)](https://saomaicenter.org/en)
- [Việc làm cho người khuyết tật trong bối cảnh kinh tế số tại Việt Nam](https://nghiencuu.tapchikinhtetaichinh.vn/viec-lam-cho-nguoi-khuyet-tat-trong-boi-canh-kinh-te-so-tai-viet-nam-160365.html)
- [Tổng cục Thống kê — Lao động việc làm quý III và 9 tháng 2025](https://www.nso.gov.vn/du-lieu-va-so-lieu-thong-ke/2025/10/thong-cao-bao-chi-ve-tinh-hinh-lao-dong-viec-lam-quy-iii-va-9-thang-nam-2025/)
- [The Most Common Workplace Barriers for Blind Employees — Be My Eyes](https://www.bemyeyes.com/business/blog/most-common-workplace-barriers-for-blind-employees/)
- [Be My Eyes Announces New Workplace Accessibility Tools](https://www.bemyeyes.com/business/news/be-my-eyes-announces-new-workplace-accessibility-tools/)
- [Are We There Yet? Assessing Computer-Use Agents for Blind Users (arXiv 2609.00524, EMNLP 2026)](https://arxiv.org/abs/2609.00524)
- [Beyond Accessibility: Digital Collaboration Tools for Blind and Low Vision Workers — ACM ASSETS 2025](https://dl.acm.org/doi/10.1145/3663547.3746332)
- [A comparative study of disabled people's experiences with Zoom, MS Teams, Google Meet and Skype](https://www.tandfonline.com/doi/full/10.1080/0144929X.2023.2286533)
- [Zoom Accessibility — DLF Wiki](https://wiki.diglib.org/Zoom_Accessibility)
- [WebAIM Million 2026](https://webaim.org/projects/million/)
- [PDF accessibility survey — Equidox / NFB](https://equidox.co/blog/pdf-accessibility-survey-says-67-of-pdfs-will-get-you-sued/)
- [Designing Accessible Dashboards for Screen Reader Users — Tableau](https://www.tableau.com/blog/designing-accessible-dashboards-screen-reader-users)
- [Accessible Power BI vs Accessible Tableau Dashboard](https://anyonconsulting.com/business_intelligence/accessibility-power-bi-vs-tableau/)
- [Accessibility best practices with Excel spreadsheets — Microsoft](https://support.microsoft.com/en-us/office/accessibility-best-practices-with-excel-spreadsheets-6cc05fc5-1314-48b5-8eb3-683e49b3e593)
- [PowerPoint, Jira Still Have Accessibility Obstacles for Blind Workers — Bloomberg](https://www.bloomberg.com/news/features/2025-09-12/powerpoint-jira-still-have-accessibility-obstacles-for-blind-workers)
- [Accessibility Heuristics for Vibe Coding Interfaces — ACM ASSETS 2025](https://dl.acm.org/doi/10.1145/3663547.3759729)
- [Interviews and Observation of Blind Software Developers at Work — ACM ASSETS](https://dl.acm.org/doi/10.1145/3132525.3132550)
- [Sonification — Highcharts](https://www.highcharts.com/docs/accessibility/sonification)
- [Highcharts Sonification Studio — Georgia Tech / ICAD 2021](https://repository.gatech.edu/bitstreams/eec8f48f-828a-4ced-b86d-af500c812ede/download)
- [PhoWhisper: Automatic Speech Recognition for Vietnamese (VinAI)](https://arxiv.org/abs/2406.02555)
- [Beyond Alt Text: Rethinking Visual Description in the Age of AI — AFB](https://afb.org/blog/entry/alt-text-age-ai)
- [Accessible Nonverbal Cues to Support Conversations — ACM ASSETS 2024](https://dl.acm.org/doi/10.1145/3663548.3675663)
- [Embodied AI Can Close the Nonverbal Communication Gap for Blind Individuals — UMD](https://cmns.umd.edu/news-events/news/embodied-ai-can-close-nonverbal-communication-gap-blind-individuals)
- [A Guide To Creating Data Charts For Color Blindness — Sigma](https://www.sigmacomputing.com/blog/data-charts-color-blindness)
- [ZoomText / Fusion — Vispero](https://vispero.com/zoomtext-screen-magnifier-software/)
- [AI in the Workplace: Assisting Blind and Low Vision Professionals — APH ConnectCenter](https://aphconnectcenter.org/careerconnect/professionals-with-vision-or-career-changes/employment-skills/ai-in-the-workplace-assisting-blind-and-low-vision-professionals/)
agentId: af67bec48817fa959 (use SendMessage with to: 'af67bec48817fa959', summary: '<5-10 word recap>' to continue this agent)
<usage>subagent_tokens: 139022
tool_uses: 23
duration_ms: 778075</usage>Đã xong phần nghiên cứu (19 truy vấn/fetch). Dưới đây là toàn bộ kết quả.

---

# HƯỚNG 3: ARCHITECTURAL / INDUSTRIAL — KHÔNG GIAN & SẢN PHẨM VẬT LÝ TIẾP CẬN CHO NGƯỜI KHIẾM THỊ

## PHẦN 0 — NỀN NGHIÊN CỨU (dùng làm "đạn" cho pitch deck)

### 0.1. Rào cản vật lý thật tại nơi làm việc

| Điểm đau | Dẫn chứng |
|---|---|
| Lối đi bị vật cản **di động** (ghế kéo ra, thùng carton, xe đẩy lau nhà, ba lô) | Khuyến nghị số 1 của mọi guideline là "keep walkways clear" và "giữ đồ vật ở vị trí cố định" — nghĩa là vi phạm xảy ra liên tục (Be My Eyes, APH ConnectCenter) |
| **Hot-desking / bàn linh hoạt** | Nguyên tắc sống còn của người mù là *consistent layout*; hot-desk phá huỷ chính xác điều đó. Đây là mâu thuẫn trực diện giữa xu hướng văn phòng hiện đại và khả năng tiếp cận |
| **Thiết bị dùng chung có màn hình cảm ứng phẳng** (máy photocopy, lò vi sóng, máy pha cà phê, máy chấm công) | "Đại đa số máy photocopy đa chức năng gây rào cản nghiêm trọng vì giao diện cảm ứng và không có speech output" — AFB AccessWorld. NFB Mỹ phải vận động cả một đạo luật riêng (Home Appliance Accessibility Act) |
| **Làm quen không gian mới tốn rất nhiều thời gian** | Người chưa từng học O&M cần **3–6 tháng**; người đã có nền cần **3–4 tuần** chỉ để thạo một tuyến (WMU, World Services for the Blind) → đây là lý do ngầm khiến HR ngại tuyển |
| **Sơ tán khẩn cấp** | Cần PEEP (Personal Emergency Evacuation Plan) riêng, bản đồ thoát hiểm dạng xúc giác, người hỗ trợ được phân công — hầu như không có ở VN |
| **Phòng họp** | "As you can see here…" — thông tin thị giác không được mô tả; không biết ai ngồi đâu, ai đang nói |

### 0.2. Bối cảnh Việt Nam (điểm mạnh nhất của pitch)

- **~7 triệu NKT (~7% dân số ≥2 tuổi)**; 61% trong độ tuổi lao động, chỉ **40% còn khả năng lao động** (Bộ LĐ-TB&XH).
- Khảo sát Hội Người mù VN: **~30% mất việc, ~50% giảm giờ làm, ~60% bị cắt lương**.
- **Nghề nghiệp bị đóng khung**: riêng Hải Phòng, gần **1.000 lao động khiếm thị** sống bằng nghề tẩm quất/massage. Đây là "trần nghề nghiệp" — không phải trần năng lực.
- **Tactile paving ở TP.HCM gần như vô dụng**: Tuổi Trẻ ghi nhận trên Phạm Văn Đồng (Thủ Đức), Lý Chính Thắng & Nguyễn Văn Trỗi (Q.3), Hai Bà Trưng (Q.1) — gạch dẫn đường bị **tủ điện, cây lớn, đống cát công trình, xe máy đậu, hàng quán lấn chiếm** chặn hoàn toàn. Anh Hoàng (bán vé số, khiếm thị): *"Chúng tôi đi bằng linh cảm, bằng gậy và bằng tai."*
- **Metro số 1** (vận hành 22/12/2024) **đã có** tactile paving, biển Braille, thang máy, platform screen door → **hạ tầng tốt tồn tại nhưng bị cô lập**: "ốc đảo tiếp cận" nối với vỉa hè không tiếp cận. → Insight vàng: **vấn đề không phải thiếu hạ tầng, mà là thiếu "lớp kết nối" giữa các mảnh hạ tầng**.
- **Chuẩn có sẵn nhưng không được thực thi**: QCVN 10:2014/BXD (hiệu lực 1/7/2015) đã quy định đầy đủ, ISO 21542:2021 là chuẩn quốc tế. → Khoảng trống là **công cụ kiểm tra & vận hành**, không phải văn bản.

### 0.3. Bản đồ công nghệ (để biết mình khác gì)

| Công nghệ | Độ chính xác | Chi phí/rào cản |
|---|---|---|
| BLE beacon | ~5 m (BLE 5.1 AoA <1 m) | Rẻ, pin lâu, nhiễu nhiều |
| UWB | 10–30 cm | Anchor mỗi 5–10 m, đắt → không khả thi cho văn phòng VN |
| GoodMaps | Tốt | **Phải quét LiDAR rig chuyên dụng trước** → rào cản lớn |
| NaviLens (QR tiếp cận) | Quét xa ~12 m, góc rộng, không cần ngắm chuẩn | **Chỉ là in giấy/decal — gần như miễn phí**. Barcelona: 159 ga metro + 2.400 điểm bus. VIA (Mỹ): ~6.000 biển. Tạo mã miễn phí trên navilens.com |
| Apple Door Detection (LiDAR + on-device ML) | Nhận cửa, khoảng cách, mở/đóng, đẩy/kéo/xoay, **đọc cả số phòng** | Chỉ iPhone Pro có LiDAR |
| Be My Eyes × Meta Ray-Ban (3/2026) | Gọi video rảnh tay tới người thân/hãng | Meta đang phát **15.000 kính miễn phí** cho người mù Ireland → xu hướng kính AI là thật |
| Haptic (Virtual Whiskers 2025, vest/belt rung) | Depth camera → cường độ rung theo khoảng cách | Giảm thời gian do dự & số lần gậy va chạm |
| Kiến trúc đa giác quan (Hazelwood School, Glasgow) | "Trail rail" bọc **bần (cork)** chạy suốt xương sống toà nhà; texture/nhiệt/âm/mùi **là thông tin, không phải trang trí** | Chi phí thấp, không cần điện |

### 0.4. BỐN KHOẢNG TRỐNG ĐỂ ĐÁNH (white space)

1. **Vật cản động, không phải vật cản tĩnh.** Mọi giải pháp hiện có (tactile paving, beacon, bản đồ) đều giả định thế giới đứng yên. Văn phòng/vỉa hè VN thì không.
2. **Lớp kết nối giữa các mảnh hạ tầng tốt** (metro ↔ vỉa hè ↔ sảnh ↔ thang máy ↔ bàn làm việc).
3. **Biến đặc tính khiếm thị thành lợi thế nghề nghiệp**, thay vì chỉ "bù trừ thiếu hụt".
4. **Low vision / nhạy sáng / thị trường thu hẹp bị bỏ quên** — 90% giải pháp chỉ nhắm người mù hoàn toàn, trong khi nhóm nhìn kém đông hơn nhiều.

---

# PHẦN 1 — 18 Ý TƯỞNG

---

## NHÓM A — "HAY HO / WOW" (quay video demo cực đẹp)

---

### A1. **SoundMark** — *"Mỗi căn phòng có một giọng riêng."*

**1. Tagline:** Biến toà nhà thành một bản nhạc mà bạn có thể đi vào trong đó.

**2. Insight:** Người khiếm thị định vị bằng *landmark âm thanh* (tiếng máy lạnh, tiếng cửa, tiếng bước chân đổi vật liệu sàn). Nhưng văn phòng mở hiện đại được thiết kế để **triệt tiêu âm thanh** (thảm, vách acoustic, trần tiêu âm) → vô tình xoá sạch bản đồ định hướng của người mù. Văn phòng càng "sang", càng khó đi.

**3. Ai dùng:** Nhân viên khiếm thị (chính); quản lý toà nhà; khách đến làm việc.

**4. Cách hoạt động:**
1. Mỗi nút giao quan trọng (cửa pantry, WC, thang máy, lối thoát hiểm, đầu dãy bàn) gắn một loa nhỏ ESP32 + micro.
2. AI tổng hợp cho mỗi địa điểm một **"signature sound"** riêng — không phải tiếng bíp, mà âm sắc có nghĩa: pantry = tiếng nước rót nhỏ; WC = âm trầm ấm; thang máy = hợp âm dâng lên; lối thoát hiểm = nhịp đôi cấp bách.
3. Âm phát **cực nhỏ, dưới ngưỡng gây phiền** (~35 dB), và **âm lượng/cao độ biến thiên theo khoảng cách** người dùng — càng gần, âm càng "mở ra".
4. Hệ thống nghe tiếng ồn nền theo thời gian thực và **tự nâng/hạ** để không bị nuốt lúc đông người, tự tắt khi có cuộc họp gần đó.
5. Tai nghe dẫn truyền xương (tuỳ chọn) nhận thêm lớp spatial audio riêng tư cho thông tin cá nhân ("bàn bạn ở hướng 2 giờ, 6 bước").

**5. AI ở đâu (cụ thể):**
- **Mô hình tổng hợp âm thanh có điều kiện** (audio synthesis) sinh signature sound tối ưu hoá theo 3 ràng buộc: dễ phân biệt với nhau, dễ học thuộc, không gây khó chịu cho người sáng mắt.
- **Adaptive gain bằng ML**: mô hình phân loại tiếng ồn nền (họp / vắng / máy hút bụi) điều chỉnh âm lượng.
- **Binaural rendering / HRTF cá nhân hoá**: AI tạo hàm truyền tai riêng từ ảnh chụp tai bằng điện thoại (Microsoft từng scan tai bằng Kinect cho đúng mục đích này) → âm thật sự "đến từ hướng đó".
- **Học thói quen**: sau 2 tuần, hệ thống biết bạn hay đi tuyến nào lúc mấy giờ, giảm dần gợi ý ở tuyến đã thuộc (fading scaffolding) để không gây phụ thuộc.

**6. Bền vững:** Loa + ESP32 ~150–250k VNĐ/điểm; một tầng 20 điểm ≈ 5 triệu. Vỏ loa in 3D từ **nhựa PET tái chế / gỗ ép tre**. Không đục phá kết cấu, tháo ra mang đi nơi khác được (retrofit thuần). Tiêu thụ điện < 1W/điểm, có thể chạy PoE từ hệ thống mạng sẵn có.

**7. Khác biệt:** Tactile paving chỉ nói "có đường ở đây"; beacon chỉ nói toạ độ. SoundMark tạo **bản đồ nhận thức (cognitive map) học được một lần, dùng mãi, không cần cầm điện thoại, không cần pin, không cần app**. Khác Microsoft Soundscape ở chỗ: Soundscape phát trong tai nghe (cá nhân, cần thiết bị); SoundMark nằm **trong chính kiến trúc** (dùng chung, khách vãng lai cũng hưởng).

**8. Prototype 3 ngày:**
- Ngày 1: chọn 1 hành lang thật ở RMIT (VD tầng 2 toà B). Đo, vẽ sơ đồ.
- Ngày 2: 5–6 loa Bluetooth mini/điện thoại cũ giấu sau chậu cây + Raspberry Pi hoặc đơn giản là **5 điện thoại Android phát file âm thanh đồng bộ**. Sinh signature sound bằng AI audio (ElevenLabs SFX / Stable Audio) — có thể làm sẵn.
- Ngày 3: quay video. **Kịch bản 5 phút:** (a) 40 giây: người bịt mắt đi hành lang không có SoundMark — va, dừng, mất phương hướng, quay camera góc thấp, âm thanh thật. (b) Bật SoundMark, cùng người đó, cùng đoạn đường — đi thẳng tới pantry. (c) Overlay đồ hoạ: sóng âm lan ra từ từng điểm. (d) Phỏng vấn người thử. (e) Giải thích AI bằng 3 slide.
- Bổ sung: một **mô hình bìa foam 1:20** của tầng, cắm LED ở các điểm SoundMark để quay cận cảnh.

**9. Tác động đo được:** Thời gian đi từ cửa thang máy đến bàn (giây); số lần va chạm/dừng lưỡng lự; **thời gian làm quen văn phòng mới** (mục tiêu: từ 3–4 tuần O&M xuống < 3 ngày); điểm tự tin di chuyển (scale 1–10) trước/sau.

**10. Rủi ro & trả lời:**
- *"Đồng nghiệp sáng mắt sẽ phát điên vì tiếng ồn."* → Âm dưới ngưỡng chú ý, đo bằng máy đo dB, có chế độ "chỉ phát khi phát hiện thiết bị của nhân viên khiếm thị ở gần" (BLE proximity). Đã có tiền lệ: nhạc nền văn phòng.
- *"Ai trả tiền?"* → 5 triệu/tầng rẻ hơn 1 tháng lương; và theo QCVN 10:2014/BXD, công trình công cộng **đã có nghĩa vụ pháp lý** — đây là cách rẻ nhất để tuân thủ.
- *"Văn phòng ồn thì sao?"* → Đó là lý do có adaptive gain + lớp tai nghe dự phòng.
- *"Người điếc-mù?"* → Kết hợp với ý tưởng C4 (rung).

**11. Chấm điểm:** Innovation & Impact **5** | UCD & Accessibility **5** | Feasibility **4** | AI Utilization **4** → **18/20**

---

### A2. **ClearPath** — *"Camera an ninh của toà nhà đã nhìn thấy cái thùng carton đó. Giờ nó sẽ nói."*

**1. Tagline:** Không lắp thêm gì cả — chỉ dạy hệ thống camera sẵn có biết quan tâm đến người mù.

**2. Insight:** Vật cản giết chết khả năng đi lại độc lập không phải là tường (tường đứng yên, học một lần là thuộc) mà là **vật cản mới xuất hiện**: ghế bị kéo ra giữa lối đi, thùng hàng giao đặt tạm, xe đẩy lau nhà, biển "sàn trơn", ba lô, cửa kính mở hé. Tuổi Trẻ ghi nhận chính xác điều này ở quy mô đô thị: gạch dẫn đường TP.HCM vô dụng vì **tủ điện, cát, xe máy** — tất cả đều là vật cản xuất hiện sau khi hạ tầng đã xây.

**3. Ai dùng:** Nhân viên khiếm thị (nhận cảnh báo); **bảo vệ/lễ tân/tạp vụ** (nhận lệnh dọn); quản lý toà nhà (nhận báo cáo tuần).

**4. Cách hoạt động:**
1. Hệ thống chụp ảnh **"trạng thái sạch"** của từng hành lang một lần (baseline).
2. Camera CCTV sẵn có stream về một máy tính nhỏ (Jetson Nano / PC cũ). Mô hình thị giác so sánh khung hình hiện tại với baseline → phát hiện **vật thể lạ nằm trong vùng lối đi**.
3. Nếu nhân viên khiếm thị đang tiến tới (định vị thô bằng BLE/Wi-Fi trên điện thoại họ): **tai nghe thì thầm** — *"Có thùng hàng ở giữa lối đi, cách 5 bước, đi lệch sang phải."* + rung tăng dần.
4. Đồng thời gửi thông báo cho tạp vụ: *"Hành lang B2, vật cản, 4 phút."* — **cơ chế tự dọn dẹp**.
5. Cuối tuần: dashboard "**Bản đồ nhiệt vật cản**" — chỗ nào hay bị chắn nhất → gợi ý sửa thiết kế (thêm kệ, dời máy in, đổi hướng mở cửa). Đây là dữ liệu kiến trúc mà chưa ai từng có.

**5. AI ở đâu (cụ thể):**
- **Object detection + background subtraction** (YOLO/RT-DETR + so sánh baseline) để phát hiện vật thể lạ trên vùng đi lại đã khoanh sẵn.
- **VLM (vision-language model)** sinh **mô tả bằng lời tự nhiên, có hướng dẫn hành động** — điểm mấu chốt: không nói "phát hiện object class 41", mà nói "thùng carton, cao ngang gối, lệch trái, đi vòng bên phải sát tường".
- **Dự đoán va chạm**: ghép quỹ đạo người dùng (từ định vị + hướng) với vị trí vật cản → cảnh báo *trước* 4–6 bước chứ không phải lúc đã tới.
- **Học mẫu theo thời gian**: mô hình chuỗi thời gian học "9h sáng thứ 2 khu vực giao hàng luôn có thùng" → cảnh báo chủ động.

**6. Bền vững:** **Zero hardware mới** — tái sử dụng 100% camera an ninh đã lắp (mọi toà nhà VN đều có). Chỉ cần 1 máy tính biên ~8–15 triệu dùng chung cả toà. Không rác thải điện tử, không thi công. Đây là lập luận sustainability mạnh nhất trong toàn bộ 18 ý tưởng: *giải pháp bền vững nhất là giải pháp không sản xuất thêm vật gì.*

**7. Khác biệt:** Gậy thông minh (WeWALK ~$599) và Glide ($1.500) phát hiện vật cản **khi đã tới sát**, từ góc nhìn ngang tầm người, và chỉ người mua mới có. ClearPath nhìn **từ trên xuống, thấy trước, thấy toàn cục**, phục vụ mọi người trong toà nhà, và **sửa nguyên nhân** (bắt người dọn) chứ không chỉ né hậu quả. Tactile paving không bao giờ biết mình đang bị chặn.

**8. Prototype 3 ngày:**
- Ngày 1: quay 1 hành lang RMIT bằng điện thoại đặt trên giá cao (giả lập CCTV). Thu baseline + 10 kịch bản vật cản (ghế, thùng, ba lô, xe đẩy, cửa mở hé).
- Ngày 2: chạy YOLO pretrained + so sánh khung hình (không cần train). Nối GPT-4o/Gemini vision sinh câu mô tả → TTS tiếng Việt.
- Ngày 3: demo trực tiếp trên sân khấu — đặt cái ghế vào khung hình, 2 giây sau loa đọc cảnh báo tiếng Việt. **Đây là demo sân khấu mạnh nhất có thể có trong 3 ngày.** Kèm dashboard heatmap bằng Figma.

**9. Tác động đo được:** Số vật cản phát hiện/tuần; **thời gian tồn tại trung bình của một vật cản** (trước: nhiều giờ → sau: < 10 phút); số va chạm; tỷ lệ hành lang "sạch" theo giờ.

**10. Rủi ro & trả lời:**
- *"Quyền riêng tư — camera theo dõi nhân viên?"* → Xử lý **hoàn toàn trên thiết bị biên, không lưu video, không nhận diện khuôn mặt**, chỉ xuất toạ độ vật thể. Có thể chạy trên ảnh độ phân giải thấp / ảnh nhiệt. Phải nói trước điều này trong pitch, giám khảo chắc chắn hỏi.
- *"Định vị người dùng chính xác không?"* → Không cần chính xác cao: chỉ cần biết "đang ở hành lang B2, hướng Bắc" (BLE zone-level ~5 m là đủ) vì cảnh báo mang tính vùng.
- *"Camera cũ mờ?"* → Hệ chỉ cần phát hiện khối lớn ≥30 cm, không cần nhận diện chi tiết.
- *"Ai bảo trì?"* → Chạy trên hạ tầng CCTV do bảo vệ vận hành sẵn; thêm 1 tab trong phần mềm họ đã dùng.

**11. Chấm điểm:** Innovation **4** | UCD **5** | Feasibility **5** | AI **5** → **19/20**

---

### A3. **Aura Room** — *"Trong phòng họp, ai đang nói và họ ngồi ở đâu."*

**1. Tagline:** Trả lại cho người khiếm thị thứ mà phòng họp lấy đi: bản đồ xã hội.

**2. Insight:** Rào cản lớn nhất trong họp không phải nghe không rõ, mà là **mất hoàn toàn thông tin không gian xã hội**: ai đã vào phòng, ai ngồi cạnh, ai đang giơ tay, ai gật đầu, "as you can see here" chỉ vào đâu trên màn hình. Người khiếm thị phải chọn giữa **ngắt lời để hỏi** (bị coi là phiền) hoặc **im lặng và mất ngữ cảnh** (bị coi là thụ động) — cả hai đều làm hỏng đánh giá hiệu suất.

**3. Ai dùng:** Nhân viên khiếm thị; người chủ trì họp; đồng nghiệp.

**4. Cách hoạt động:**
1. Phòng họp gắn một **dàn micro 4 hướng** (mic array) + 1 camera góc rộng ở giữa bàn (hoặc dùng luôn thiết bị hội nghị có sẵn như Poly/Logitech Rally).
2. Khi người khiếm thị vào phòng, tai nghe đọc **"bản đồ chỗ ngồi"** 1 lần: *"7 người. Chị Lan 10 giờ, anh Tuấn 12 giờ, ghế trống 2 giờ, anh Minh 4 giờ…"*
3. Trong lúc họp: mỗi khi có người bắt đầu nói, một **âm nhỏ 0,3 giây định vị đúng hướng người đó** vang lên trong tai nghe (spatial audio) + tên thì thầm. Không cần nhìn vẫn biết ai đang nói và ở đâu.
4. Khi ai đó chia sẻ màn hình / chỉ vào slide: AI **mô tả nội dung thị giác theo thời gian thực** vào tai nghe (*"Biểu đồ cột, quý 4 cao nhất, nhãn 42%"*) — đúng cái khoảnh khắc "as you can see here".
5. Cử chỉ: AI phát hiện giơ tay → *"Chị Lan đang giơ tay."* Người khiếm thị lần đầu có thể **nhường lời đúng lúc** — một hành vi xã hội tưởng nhỏ nhưng quyết định việc bạn được coi là "người dễ làm việc cùng" hay không.

**5. AI ở đâu:**
- **Speaker diarization + sound source localization** (mic array + beamforming) → ai đang nói + hướng nào.
- **Speaker ID** khớp giọng với danh bạ nội bộ → gọi đúng tên.
- **VLM mô tả slide/màn hình chia sẻ theo thời gian thực**, ưu tiên nén thông tin (không đọc hết, chỉ đọc cái đang được trỏ vào — AI phải quyết định *cái gì đáng nói*).
- **Pose/gesture detection** cho giơ tay, gật/lắc đầu.
- **LLM tóm tắt ngữ cảnh**: khi người dùng chạm nút, đọc lại 20 giây vừa rồi dưới dạng cô đọng (không bỏ lỡ khi mất tập trung).

**6. Bền vững:** Dùng lại thiết bị hội nghị đã có trong 90% phòng họp; phần còn lại là phần mềm. Nếu cần: mic array USB ~2 triệu, dùng chung mọi phòng. Vỏ in 3D nhựa tái chế. Vòng đời ≥ 5 năm, nâng cấp bằng phần mềm.

**7. Khác biệt:** Các app mô tả ảnh (Be My AI, Seeing AI) hoạt động theo **yêu cầu từng lần** — bạn phải chủ động hỏi, và trong cuộc họp thì không kịp. Aura Room là **môi trường chủ động mô tả chính nó**, liên tục, không cần hỏi. Không có sản phẩm nào trên thị trường làm "bản đồ xã hội theo thời gian thực" cho phòng họp.

**8. Prototype 3 ngày:**
- Ngày 1: dựng phòng họp giả tại RMIT, 5 người. Ghi âm 2 kênh bằng 2 điện thoại đặt 2 góc (đủ để tính hướng thô).
- Ngày 2: dùng pyannote/WhisperX cho diarization + gán tên thủ công; nối VLM đọc slide. Xuất spatial audio bằng thư viện HRTF có sẵn.
- Ngày 3: **quay demo POV** — camera đeo đầu người bịt mắt, khán giả nghe đúng thứ người đó nghe (binaural, khuyến khích giám khảo đeo tai nghe khi xem video — cực kỳ ấn tượng). Bản demo có thể là bản ghi sẵn (pre-recorded), hợp lệ hoàn toàn.

**9. Tác động:** Số lần phải ngắt lời để hỏi (giảm); **số lượt phát biểu của nhân viên khiếm thị trong cuộc họp** (tăng — đây là chỉ số hoà nhập thật, không phải chỉ số tiện ích); điểm tự đánh giá "tôi nắm được diễn biến cuộc họp" 1–10.

**10. Rủi ro & trả lời:**
- *"Ghi âm cuộc họp — pháp lý/riêng tư?"* → Xử lý on-device, **không lưu**, chỉ tạo tín hiệu tạm thời; cần thông báo & đồng thuận trong phòng (giống như thông báo đang ghi hình).
- *"Quá tải thông tin vào tai?"* → Thiết kế phân tầng: mặc định chỉ có âm định vị 0,3 s; mô tả chi tiết chỉ khi bấm nút. Người dùng điều khiển băng thông.
- *"Độ trễ?"* → Diarization streaming đạt <1 s; mô tả slide có thể trễ 2 s vẫn chấp nhận được.

**11. Chấm điểm:** Innovation **5** | UCD **5** | Feasibility **3** | AI **5** → **18/20**

---

### A4. **SafeCell** — *"Vùng an toàn biết trước cú va chạm."*

**1. Tagline:** Đưa người khiếm thị vào nhà máy — bằng cách làm nhà máy tự biết có người khiếm thị trong đó.

**2. Insight:** Người khiếm thị *đã và đang* làm việc trong sản xuất (IFB Solutions ở Mỹ gần như toàn bộ công nhân là người mù/nhìn kém), bằng **jig & fixture xúc giác**, tương phản màu, speech output trên máy. Nhưng rào cản thật ở nhà máy VN là **xe nâng, xe đẩy, pallet di động, vùng máy đang chạy** — những mối nguy **di chuyển**. Nghiên cứu an toàn lao động cũng cảnh báo: công nghệ hỗ trợ lắp sai còn nguy hiểm hơn không lắp.

**3. Ai dùng:** Công nhân khiếm thị; quản đốc; bộ phận an toàn lao động (HSE); tài xế xe nâng.

**4. Cách hoạt động:**
1. Công nhân khiếm thị đeo **vòng tay/đai lưng rung** (4–6 motor rung quanh thắt lưng — hướng rung = hướng nguy hiểm, cường độ = khoảng cách).
2. Trần xưởng gắn camera/LiDAR giá rẻ phủ khu vực; hệ thống theo dõi **vị trí xe nâng, robot, người**.
3. AI **dự đoán quỹ đạo 3 giây tới**. Nếu quỹ đạo xe nâng và người giao nhau → đai rung phía tương ứng + còi ở xe nâng + đèn cảnh báo cho tài xế.
4. Ranh giới vùng an toàn được "vẽ" bằng **vật liệu xúc giác dưới chân** (thảm cao su tái chế có gân nổi, khác hẳn nền bê tông) — an toàn không phụ thuộc vào điện: **mất điện vẫn còn xúc giác**. Đây là nguyên tắc *fail-safe* mà giám khảo kỹ thuật sẽ rất thích.
5. Trạm làm việc: jig in 3D ôm đúng chi tiết + đánh dấu Braille; máy phát **tiếng "đúng/sai" khác nhau** khi lắp đạt/không đạt.

**5. AI ở đâu:**
- **Multi-object tracking + trajectory prediction** (Kalman/Transformer) dự đoán va chạm trước 2–3 giây.
- **Phân vùng ngữ nghĩa sàn xưởng** (semantic segmentation) để tự động sinh bản đồ vùng nguy hiểm thay vì vẽ tay.
- **Haptic encoding do AI tối ưu**: mô hình học mẫu rung nào được phản ứng nhanh nhất bởi chính người đó (cá nhân hoá ngưỡng cảm nhận).
- **Phát hiện bất thường âm thanh máy** (anomaly detection) — máy sắp hỏng/kẹt sẽ được báo bằng âm thanh trước khi thành tai nạn.

**6. Bền vững:** Thảm xúc giác từ **lốp xe tái chế** (VN có nguồn dồi dào, rẻ, bền, chống trượt). Jig in 3D bằng nhựa tái chế, **thay đổi theo đơn hàng chỉ bằng in lại** → không phải gia công cơ khí mới mỗi lần đổi sản phẩm (giảm rác thải khuôn mẫu). Đai rung sạc lại, vòng đời 5 năm.

**7. Khác biệt:** Thiết bị an toàn công nghiệp hiện có (cảm biến tiệm cận trên xe nâng) cảnh báo **tài xế**, không cảnh báo **người đi bộ**, và hoàn toàn bằng tín hiệu **thị giác/âm thanh lớn** (vô dụng trong xưởng ồn 90 dB). SafeCell là hệ đầu tiên đặt người khiếm thị làm trung tâm và dùng **kênh xúc giác — kênh duy nhất không bị nhiễu trong nhà máy**.

**8. Prototype 3 ngày:**
- Ngày 1: dựng "xưởng mini" trong phòng học RMIT: băng dính chia vùng, 1 xe đẩy văn phòng đóng vai xe nâng, 1 camera trên cao.
- Ngày 2: đai rung làm từ **4 motor rung điện thoại + Arduino + dây đai vải** (linh kiện Nhật Tảo, tổng <400k). Tracking bằng YOLO + dự đoán tuyến tính đơn giản.
- Ngày 3: demo: người bịt mắt đứng trong xưởng mini, xe đẩy lao tới từ phía sau → đai rung bên phải → người bước tránh. Quay slow-motion. **Cực kỳ "điện ảnh".** Thêm bản in 3D một cái jig để cầm tay giám khảo sờ.

**9. Tác động:** Số sự cố suýt va chạm (near-miss) giảm; **số vị trí công việc trong nhà máy mở ra cho người khiếm thị** (chỉ số employability trực tiếp); thời gian đào tạo an toàn; tốc độ/độ chính xác lắp ráp so với chuẩn.

**10. Rủi ro & trả lời:**
- *"An toàn lao động mà sai 1 lần là chết người."* → Trả lời thẳng: **hệ thống điện tử là lớp thứ 2, không phải lớp duy nhất**. Lớp 1 là xúc giác vật lý (thảm gân) + quy trình + phân luồng giao thông xưởng. AI chỉ bổ sung, không thay thế — đây là câu trả lời an toàn và đúng chuẩn HSE.
- *"Doanh nghiệp VN có chịu chi?"* → Chi phí một tai nạn lao động lớn hơn rất nhiều; và hệ thống tracking xe nâng có lợi ích kép (năng suất, chống trộm).
- *"Xưởng bụi/ồn/nóng?"* → Camera trong vỏ IP65; xúc giác không bị ảnh hưởng bởi ồn.

**11. Chấm điểm:** Innovation **5** | UCD **4** | Feasibility **3** | AI **4** → **16/20**

---

### A5. **EvacTwin** — *"Khi còi báo cháy kêu, không ai bị bỏ lại trong bóng tối."*

**1. Tagline:** Bản sao số của toà nhà dẫn bạn ra ngoài bằng giọng nói và rung, kể cả khi mất điện.

**2. Insight:** Trong sơ tán, **người sáng mắt cũng mất thị giác** (khói, mất điện, đèn khẩn cấp yếu). Người khiếm thị vốn đã thạo tuyến hằng ngày, nhưng tuyến thoát hiểm thì **không bao giờ được đi**, thang máy bị cấm, thang bộ lạ. Chuẩn quốc tế yêu cầu PEEP (kế hoạch sơ tán cá nhân) + bản đồ thoát hiểm dạng xúc giác — ở VN gần như không tồn tại. Đây là rủi ro pháp lý và đạo đức mà mọi HR đều sợ, và là **lý do ngầm khiến họ không tuyển người khiếm thị**.

**3. Ai dùng:** Toàn bộ nhân viên (không chỉ khiếm thị); ban quản lý toà nhà; PCCC.

**4. Cách hoạt động:**
1. Xây **digital twin** của toà nhà từ bản vẽ mặt bằng (AI đọc bản vẽ → đồ thị không gian).
2. Khi báo cháy: hệ thống nhận vị trí đám cháy từ đầu báo, **tính lại tuyến thoát an toàn theo thời gian thực**, tránh khu vực nguy hiểm.
3. Hướng dẫn 3 lớp đồng thời: (a) **loa định hướng** gắn ở mỗi cửa thoát hiểm phát tiếng "sonic beacon" xung nhịp — nghiên cứu PCCC đã chứng minh con người tìm cửa bằng âm nhanh hơn bằng đèn trong khói; (b) **giọng nói trong tai nghe/điện thoại** theo từng bước; (c) **rung** báo rẽ.
4. Dọc tuyến thoát có **tay vịn xúc giác** với ký hiệu nổi: số tầng, hướng ra, khoảng cách còn lại — **hoạt động khi mất hết điện**.
5. Sau sự kiện: hệ thống điểm danh ai đã ra, ai còn kẹt, ở đâu → gửi cho lực lượng cứu hộ.

**5. AI ở đâu:**
- **LLM đọc bản vẽ mặt bằng** (như hướng nghiên cứu Floorplan2Guide 2025 — LLM phân tích floorplan thành chỉ dẫn điều hướng cho người khiếm thị) → tự sinh đồ thị tuyến thoát, không cần kỹ sư nhập tay.
- **Định tuyến động** (dynamic pathfinding) né vùng cháy/khói theo dữ liệu cảm biến.
- **Mô phỏng đám đông** (agent-based) để dự đoán nghẽn cổ chai và phân luồng người khiếm thị tránh dòng người chạy.
- **LLM sinh PEEP cá nhân hoá tự động** cho từng nhân viên (hiện là việc thủ công, tốn công, nên không ai làm).

**6. Bền vững:** Tái dùng hệ thống báo cháy + loa thông báo **đã bắt buộc có theo luật PCCC Việt Nam**. Chỉ thêm phần mềm + vài loa định hướng. Tay vịn làm từ **gỗ tái chế/tre** — vật liệu địa phương, không phát thải, không cần bảo trì. Chi phí biên rất thấp vì hạ tầng đã tồn tại.

**7. Khác biệt:** Biển EXIT phát sáng = 100% thị giác. Hệ thống hiện tại giả định ai cũng nhìn thấy. EvacTwin là hệ **đa kênh, hoạt động khi thị giác bằng 0 — cho tất cả mọi người**, đúng tinh thần Universal Design nguyên tắc 4 ("Perceptible Information — dùng nhiều kênh dư thừa"). Đây là ý tưởng dễ thuyết phục nhất về mặt "không chỉ dành cho người khuyết tật".

**8. Prototype 3 ngày:**
- Ngày 1: lấy bản vẽ 1 tầng RMIT (hoặc vẽ lại), dựng **digital twin đơn giản trong Blender/Unity/Twinmotion**.
- Ngày 2: cho LLM đọc bản vẽ → sinh chỉ dẫn tiếng Việt → TTS. Làm mô phỏng "cháy ở phòng X → tuyến đổi sang hướng Y" chạy được trên màn hình.
- Ngày 3: quay demo trong phòng tối/có khói (máy tạo khói sân khấu), 2 loa phát sonic beacon, người bịt mắt tìm ra cửa. **Hình ảnh khói + ánh sáng đỏ + người lần theo âm thanh — video rất mạnh.** Kèm mô hình bìa cứng có tay vịn xúc giác để giám khảo sờ.

**9. Tác động:** Thời gian sơ tán của người khiếm thị (giây); tỷ lệ tìm đúng cửa thoát trong điều kiện mù; **số toà nhà có PEEP hợp lệ** (hiện gần 0); tỷ lệ nhân viên (mọi người) sơ tán đúng tuyến.

**10. Rủi ro & trả lời:**
- *"Phụ thuộc điện/mạng trong lúc cháy?"* → Lớp tay vịn xúc giác + loa chạy pin dự phòng là lớp không phụ thuộc. Thiết kế **degradation có kiểm soát**.
- *"Pháp lý PCCC có cho lắp thêm?"* → Đây là bổ sung, không can thiệp hệ thống bắt buộc; cần phối hợp với cơ quan PCCC — nêu luôn trong roadmap sẽ ghi điểm Feasibility.
- *"3 ngày sao dựng được digital twin?"* → Chỉ 1 tầng, mức độ chi tiết thấp, mục tiêu là chứng minh nguyên lý.

**11. Chấm điểm:** Innovation **4** | UCD **5** | Feasibility **4** | AI **4** → **17/20**

---

### A6. **TouchLine** — *"Một đường ray bạn đọc bằng tay."*

**1. Tagline:** Tay vịn liên tục chạy suốt văn phòng — vừa là lan can, vừa là bản đồ, vừa là mạng dữ liệu.

**2. Insight:** Trường Hazelwood (Glasgow) đã chứng minh: một **"trail rail"** bọc bần chạy suốt xương sống toà nhà, với thay đổi texture, hốc lõm và ký hiệu nổi, khiến trẻ vừa mù vừa điếc đọc được cả toà nhà bằng tay — *texture, hơi ấm, âm thanh và mùi không phải trang trí, chúng là thông tin*. Trong khi đó văn phòng hiện đại: tường trơn, kính, không có gì để bám, không có gì để đọc.

**3. Ai dùng:** Nhân viên khiếm thị; người cao tuổi; người mới; khách.

**4. Cách hoạt động:**
1. Một thanh tay vịn (cao 90 cm) chạy liên tục từ cửa thang máy → qua các nút giao → tới từng khu vực. Người dùng **trailing**: đặt nhẹ bàn tay lên và đi.
2. **Texture mã hoá ý nghĩa**: đoạn tre nhẵn = hành lang chính; đoạn quấn thừng = rẽ; đoạn cork mềm = khu vực yên tĩnh; đoạn kim loại lạnh = pantry/nước; gờ răng cưa = **cảnh báo sắp có cầu thang/bậc**.
3. Tại mỗi nút giao có một **"nốt" nổi + NFC tag** (~3.000đ/cái). Chạm điện thoại (hoặc nhẫn NFC) → AI đọc mô tả không gian phía trước.
4. Ký hiệu nổi + Braille + **chữ in nổi cỡ lớn tương phản cao** (phục vụ luôn nhóm low vision — 80% người "khiếm thị" còn thị lực chức năng).
5. Mở rộng: LED dải dọc tay vịn đổi màu/độ sáng cho người nhìn kém (dẫn sáng), tắt cho người nhạy sáng.

**5. AI ở đâu:**
- **LLM sinh mô tả không gian theo ngữ cảnh** khi chạm NFC: không đọc văn bản cố định mà tổng hợp từ lịch phòng họp + dữ liệu toà nhà: *"Phía trước là phòng Sunrise, đang có họp đến 3 giờ. Bên phải 4 bước là máy in. Nhà vệ sinh thẳng 12 bước."*
- **Tối ưu vị trí đặt nốt bằng AI**: mô hình đọc mặt bằng + dữ liệu di chuyển thực tế → đề xuất đặt bao nhiêu nốt, ở đâu để chi phí thấp nhất mà độ phủ cao nhất (bài toán set-covering).
- **Cá nhân hoá độ chi tiết**: AI học người dùng đã thạo đoạn nào → rút ngắn mô tả (tuần 1 nói dài, tuần 4 chỉ nói tên phòng).
- **AI thiết kế bảng mã texture**: tối ưu để các texture phân biệt tối đa bằng ngón tay (dựa trên dữ liệu ngưỡng cảm nhận xúc giác).

**6. Bền vững:** **Tre, cork, thừng đay, gỗ tái chế** — tất cả đều có sẵn ở VN, giá rẻ, carbon thấp, và đẹp (quan trọng: ban giám đốc sẽ đồng ý vì nó **làm đẹp văn phòng**, không phải "thiết bị y tế gắn lên tường"). Không dùng điện. Tuổi thọ 10+ năm. NFC tag không cần pin, dùng 10 năm. Tháo lắp module, mang theo khi chuyển văn phòng.

**7. Khác biệt:** Tactile paving đặt **dưới sàn** — nơi bị xe máy, thùng hàng, ghế chặn (như Tuổi Trẻ ghi nhận). TouchLine đặt **ở độ cao 90 cm — vùng gần như không bao giờ bị chặn**. Đây là insight thiết kế đơn giản nhưng cực sắc, dễ trình bày: *"Chúng tôi không sửa sàn nhà. Chúng tôi chuyển bản đồ lên độ cao mà không ai chiếm được."*

**8. Prototype 3 ngày:**
- Ngày 1: mua ống nhựa PVC/tre 6 m + các vật liệu quấn (thừng, cork, giấy nhám, vải nhung, foam). Thiết kế bảng mã texture.
- Ngày 2: lắp đoạn tay vịn dài 6–8 m thật trong hành lang RMIT (dùng kẹp, không khoan). Dán NFC tag. Viết app đọc tag → gọi LLM → TTS.
- Ngày 3: **test với người thật bịt mắt, chưa từng thấy hành lang** → đo thời gian tìm tới "pantry". Quay cận cảnh ngón tay lướt qua từng texture (hình ảnh rất đẹp, rất "kiến trúc"). Kèm mô hình 1:20 và bảng mẫu vật liệu (material board) cho giám khảo sờ trực tiếp tại pitch — **cầm được là ăn điểm**.

**9. Tác động:** Thời gian làm quen không gian mới (mục tiêu giảm từ hàng tuần xuống < 1 giờ); % tuyến đi được độc lập không cần người dẫn; chi phí/m dài; tỷ lệ người sáng mắt cũng dùng (chỉ số universal design).

**10. Rủi ro & trả lời:**
- *"Vệ sinh, tay bẩn?"* → Chọn vật liệu lau được, phủ sáp tự nhiên; đây cũng là lý do dùng vật liệu kháng khuẩn tự nhiên (tre).
- *"Kiến trúc sư/chủ nhà không cho khoan tường?"* → Hệ kẹp không khoan, hoặc tích hợp vào phào/nẹp có sẵn.
- *"Không có AI đủ mạnh, chỉ là đồ gỗ?"* → Đây là điểm yếu lớn nhất — **phải đẩy mạnh lớp AI** (LLM mô tả ngữ cảnh + tối ưu vị trí nốt + cá nhân hoá). Nên **ghép TouchLine với A2 (ClearPath) hoặc A1 (SoundMark)** để có "thân xác + bộ não".

**11. Chấm điểm:** Innovation **4** | UCD **5** | Feasibility **5** | AI **3** → **17/20**

---

## NHÓM B — "SÁNG TẠO / ĐỘT PHÁ" (góc nhìn mới lạ)

---

### B1. **RouteCoach** — *"Huấn luyện viên định hướng trong túi quần."*

**1. Tagline:** AI biến một video quay 5 phút thành 4 tuần huấn luyện O&M.

**2. Insight (rất mạnh):** Nút thắt thật của employability không phải công nghệ mà là **thời gian làm quen**: người chưa học O&M cần **3–6 tháng**, người có nền cần **3–4 tuần** để thạo một môi trường mới. HR tính nhẩm: "tuyển bạn này, mất 1 tháng bạn mới đi lại được trong văn phòng" → loại hồ sơ. Việt Nam có rất ít chuyên viên O&M, và họ không thể đến từng văn phòng.

**3. Ai dùng:** Nhân viên/ứng viên khiếm thị; HR (để dám tuyển); chuyên viên O&M (nhân rộng năng lực).

**4. Cách hoạt động:**
1. **Bất kỳ ai** (đồng nghiệp, HR, bảo vệ) cầm điện thoại đi một vòng văn phòng và quay video 5 phút theo tuyến: cổng → thang máy → bàn → pantry → WC → phòng họp → lối thoát hiểm.
2. AI phân tích video và **trích xuất landmark PHI THỊ GIÁC** — đây là điểm đột phá: không phải "rẽ trái ở tấm poster xanh" (vô nghĩa với người mù) mà là:
   - **Âm thanh**: "khi nghe tiếng máy lạnh to lên bên trái, bạn đã qua phòng server"
   - **Xúc giác dưới chân**: "sàn đổi từ gạch sang thảm — đó là ranh giới khu làm việc"
   - **Mùi**: "mùi cà phê = pantry bên phải"
   - **Luồng gió**: "có gió thổi ngang mặt = cửa kính ra ban công"
   - **Vang âm**: "trần cao lên, tiếng bước chân vang hơn = bạn vào sảnh"
   - **Nhiệt**: "ấm lên = gần cửa sổ hướng Tây"
3. AI sinh **"kịch bản tuyến" bằng lời** + đếm bước chân (hiệu chỉnh theo sải chân người dùng) + bản đồ nổi in 3D tự động.
4. Người dùng luyện tuyến tại nhà bằng **mô phỏng âm thanh 3D** (đi trong đầu trước khi đi bằng chân) — giống phi công luyện simulator.
5. Đi thật: app dùng cảm biến quán tính (đếm bước, la bàn) + micro nghe landmark âm thanh để xác nhận *"bạn đang đúng tuyến"*, và **giảm dần hướng dẫn** khi bạn đã thuộc.

**5. AI ở đâu:**
- **Video understanding + VLM** phân tích không gian từ video thường (không cần LiDAR rig đắt tiền như GoodMaps).
- **Audio event detection** nhận diện nguồn âm cố định (máy lạnh, máy in, tiếng nước, thang máy) làm landmark.
- **LLM chuyển không gian thành chỉ dẫn phi thị giác** — bước dịch quan trọng nhất, cần prompt/fine-tune theo giáo trình O&M.
- **Dead-reckoning bằng IMU điện thoại trong túi** (đã có nghiên cứu "phone-in-pocket wayfinding & backtracking cho người mù", arXiv 2024) — không cần beacon, không cần hạ tầng.
- **Mô hình học tiến bộ người dùng** (learner model) quyết định khi nào rút bớt hướng dẫn — chống phụ thuộc.

**6. Bền vững:** **Không lắp gì cả — zero hardware, zero rác thải, zero thi công.** Chỉ cần điện thoại. Có thể triển khai cho 10.000 văn phòng trong 1 tháng. Đây là lập luận scalability mạnh nhất trong 18 ý tưởng.

**7. Khác biệt:** Google Maps/Lazarillo chỉ dẫn ngoài trời bằng GPS và bằng **mốc thị giác**. GoodMaps cần quét LiDAR chuyên dụng. NaviLens cần dán mã. RouteCoach là hệ duy nhất (a) **không cần hạ tầng**, (b) **tạo ra tri thức mà người dùng giữ lại được trong đầu** thay vì phụ thuộc thiết bị mãi mãi, (c) **dùng landmark phi thị giác** — điều mà chuyên viên O&M làm, nhưng chưa AI nào làm.

**8. Prototype 3 ngày:**
- Ngày 1: quay 3 video tuyến thật tại RMIT bằng điện thoại.
- Ngày 2: đưa vào Gemini/GPT-4o video + audio → prompt sinh "kịch bản tuyến phi thị giác" tiếng Việt. In bản đồ nổi bằng máy in 3D của RMIT (hoặc cắt bìa nhiều lớp nếu không kịp).
- Ngày 3: **thử nghiệm A/B trên sân khấu**: 2 tình nguyện viên bịt mắt, 1 người được chỉ dẫn kiểu cũ ("đi thẳng 20m rẽ trái"), 1 người dùng RouteCoach. Bấm giờ. **So sánh trực tiếp trước mặt giám khảo là bằng chứng mạnh nhất có thể có.**

**9. Tác động:** **Thời gian làm quen giảm từ 3–4 tuần → 2–3 ngày** (đây là con số headline cho pitch deck); số tuyến đi độc lập sau 1 tuần; tỷ lệ HR sẵn sàng tuyển (khảo sát trước/sau); chi phí trên mỗi nhân viên (gần 0 so với thuê chuyên viên O&M).

**10. Rủi ro & trả lời:**
- *"AI mô tả sai thì người ta đi vào cột."* → Hệ thống là **công cụ chuẩn bị & luyện tập**, không phải điều hướng thời gian thực thay gậy. Gậy trắng vẫn là lớp an toàn chính. Có bước **con người xác nhận** (đồng nghiệp/chuyên viên duyệt kịch bản tuyến trước khi dùng).
- *"Landmark thay đổi (máy in dời chỗ)?"* → Cập nhật bằng cách quay lại video 5 phút — rẻ đến mức có thể làm hằng tháng.
- *"Dead-reckoning trôi (drift)?"* → Dùng landmark âm thanh/NFC để neo lại định kỳ.

**11. Chấm điểm:** Innovation **5** | UCD **5** | Feasibility **5** | AI **5** → **20/20**

---

### B2. **ScentMap & WindMark** — *"Định hướng bằng mũi và bằng da."*

**1. Tagline:** Hai giác quan chưa ai dùng để làm bản đồ.

**2. Insight:** Hazelwood School đã dùng mùi và hơi ấm như thông tin kiến trúc. Nhưng chưa có hệ thống nào **chủ động thiết kế mùi và luồng khí** làm hệ định hướng. Trong khi đó, khứu giác là giác quan **duy nhất đi thẳng vào vùng trí nhớ (hippocampus/amygdala) không qua đồi thị** → ghi nhớ nhanh nhất, lâu nhất, không cần luyện tập. Và ở văn phòng VN, điều hoà + quạt trần tạo **luồng khí có cấu trúc** mà ai cũng cảm nhận được trên da mặt nhưng chưa ai khai thác.

**3. Ai dùng:** Nhân viên khiếm thị; thực ra là **tất cả mọi người** (dễ nhớ đường hơn).

**4. Cách hoạt động:**
1. Chia văn phòng thành 4–6 "quận". Mỗi quận có một **mùi ký hiệu** rất nhạt, khuếch tán thụ động (sả chanh = khu kỹ thuật; bạc hà = khu họp; cà phê tự nhiên = pantry; gỗ tuyết tùng = khu yên tĩnh; không mùi = lối thoát hiểm).
2. Mùi phát tán bằng **bấc gỗ ngâm tinh dầu** — không điện, không pin, thay 1 lần/tháng, chi phí ~20.000đ/điểm.
3. **WindMark**: hướng quạt/miệng gió điều hoà được **tính toán để tạo "dòng sông khí"** dọc hành lang chính — đi ngược gió = đang đi vào trong; đi xuôi gió = đang đi ra cửa. Da mặt cảm nhận tức thì, không cần học.
4. AI mô phỏng và tối ưu: mùi không được lẫn vào nhau, gió không gây khó chịu, và **phải đúng với người dị ứng**.
5. Kết hợp **nhiệt**: vùng gần cửa sổ ấm hơn tự nhiên → dùng làm mốc "bạn đang ở rìa toà nhà" (miễn phí hoàn toàn).

**5. AI ở đâu:**
- **Mô phỏng CFD (computational fluid dynamics) tăng tốc bằng surrogate model học máy**: AI dự đoán trường khuếch tán mùi và luồng khí trong mặt bằng chỉ trong vài giây thay vì vài giờ, để tối ưu vị trí đặt bấc và hướng miệng gió. Đây là ứng dụng AI **rất "kiến trúc/công nghiệp"** — giám khảo ngành xây dựng sẽ rất thích.
- **Tối ưu đa mục tiêu**: mùi phân biệt được tối đa × nồng độ tối thiểu × không xung đột × chi phí thấp nhất.
- **Cảm biến VOC + hiệu chỉnh**: mạng cảm biến rẻ đo nồng độ thực tế, mô hình học để tự điều chỉnh lịch thay bấc.
- **Cá nhân hoá y tế**: LLM đối chiếu hồ sơ dị ứng/hen suyễn của nhân viên để chọn bộ mùi an toàn.

**6. Bền vững:** Tinh dầu **sả, quế, bạc hà, tràm — nông sản Việt Nam**, hỗ trợ chuỗi cung ứng địa phương. Bấc gỗ tái sử dụng. **Không điện, không pin, không rác điện tử.** WindMark thực chất **tối ưu hoá luồng khí có sẵn → còn giúp giảm điện điều hoà** (lợi ích kép về năng lượng — một lập luận sustainability cực đẹp: *giải pháp tiếp cận của chúng tôi làm giảm hoá đơn điện*).

**7. Khác biệt:** Đây là hệ định hướng **đầu tiên không dùng thị giác, không dùng thính giác, không dùng xúc giác chủ động, không dùng điện tử**. Nó hoạt động cả khi văn phòng ồn (khác SoundMark), cả khi tay đang bận bê đồ (khác TouchLine), cả khi điện thoại hết pin (khác mọi app). **Đây là ý tưởng "lạ" nhất, đáng để đưa vào pitch dù chỉ như một lớp bổ sung — nó sẽ khiến giám khảo nhớ đội bạn.**

**8. Prototype 3 ngày:**
- Ngày 1: mua 5 loại tinh dầu + bấc gỗ (chợ Bà Chiểu/Shopee, <300k tổng). Dựng mô hình CFD đơn giản một tầng bằng Blender/phần mềm miễn phí.
- Ngày 2: bố trí thật trong 4 khu vực của một phòng lớn ở RMIT. Cho 6 người bịt mắt **học 10 phút** rồi test: thả vào vị trí ngẫu nhiên, hỏi "bạn đang ở khu nào?"
- Ngày 3: **đo tỷ lệ đúng** (dự kiến rất cao — đây là số liệu gây sốc cho giám khảo). Quay video + biểu đồ mô phỏng khuếch tán mùi (hình ảnh CFD rất đẹp mắt trên slide). **Tại buổi pitch: mang 3 lọ mùi cho giám khảo ngửi và đoán — trải nghiệm đa giác quan ngay trên sân khấu.**

**9. Tác động:** Tỷ lệ xác định đúng khu vực sau 10 phút học; thời gian định hướng lại sau khi bị mất phương hướng; chi phí/m² (cực thấp); điện năng điều hoà tiết kiệm.

**10. Rủi ro & trả lời:**
- *"Dị ứng, hen suyễn, phụ nữ mang thai."* → Nồng độ cực thấp, danh sách mùi được sàng lọc y tế, có chế độ "vùng không mùi", và cho phép nhân viên veto. Nói trước điều này là ghi điểm UCD.
- *"Khứu giác thích nghi (nose blindness) — ngửi mãi sẽ không thấy nữa."* → Thừa nhận thẳng. Giải pháp: mùi chỉ dùng cho **ranh giới vùng** (chuyển tiếp mới kích hoạt cảm nhận), không dùng cho điều hướng liên tục. Đây là lớp bổ trợ, không phải lớp chính.
- *"Người mất khứu giác (hậu COVID)?"* → Vì thế phải đi kèm WindMark + một lớp khác. Nguyên tắc UD #4: thông tin dư thừa qua nhiều kênh.

**11. Chấm điểm:** Innovation **5** | UCD **4** | Feasibility **4** | AI **3** → **16/20** *(Giá trị lớn nhất: làm lớp "gia vị" cho một ý tưởng khác — cực kỳ đáng nhớ trong pitch)*

---

### B3. **EarQC** — *"Đôi tai tốt nhất trong nhà máy thuộc về người không nhìn."*

**1. Tagline:** Không phải hỗ trợ người khiếm thị làm việc — mà tạo ra công việc chỉ họ làm tốt nhất.

**2. Insight (đột phá nhất về mặt employability):** Toàn bộ ngành assistive tech đặt giả định: *người khiếm thị thiếu hụt, cần bù trừ*. Nhưng ở Việt Nam, gần **1.000 lao động khiếm thị chỉ ở Hải Phòng sống bằng nghề tẩm quất** — xã hội đã công nhận một lợi thế xúc giác, nhưng đóng khung nó vào đúng một nghề lương thấp. Trong khi đó, **kiểm tra chất lượng bằng âm thanh và xúc giác** là kỹ năng công nghiệp có giá trị cao: nghe tiếng vòng bi, gõ để tìm bọng khí trong vật đúc, sờ để tìm xước bề mặt, nghe tiếng động cơ để đoán hỏng hóc. Người khiếm thị có lợi thế thật sự đã được chứng minh (vỏ não thị giác tái phân bổ cho xử lý thính giác/xúc giác).

**3. Ai dùng:** Người khiếm thị (như **kỹ thuật viên QC/bảo trì dự đoán**, không phải "người được giúp đỡ"); nhà máy; trung tâm dạy nghề; Hội Người mù.

**4. Cách hoạt động:**
1. Một **trạm QC thích ứng**: sản phẩm đi qua băng chuyền, dừng tại vị trí cố định, jig xúc giác in 3D giữ đúng hướng để người kiểm tra sờ/gõ theo quy trình chuẩn.
2. **Micro tiếp xúc (contact mic) + tai nghe**: khuếch đại âm thanh gõ/vận hành lên dải mà tai người nghe tốt nhất; AI lọc ồn nền nhà máy.
3. Kỹ thuật viên khiếm thị đánh giá: đạt/không đạt/nghi ngờ → nói vào mic hoặc bấm nút.
4. **AI học từ chính họ**: mỗi phán đoán được ghi lại cùng tín hiệu âm thanh → dần hình thành mô hình phát hiện lỗi. **Người khiếm thị trở thành người dạy AI** — vai trò có giá trị kinh tế cao và được trả lương cao (data annotation chuyên môn).
5. Sau vài tháng: AI làm lớp sàng lọc thô, con người xử lý ca khó → **năng suất tăng, vị thế nghề nghiệp tăng** (từ "công nhân" thành "chuyên gia kiểm định & huấn luyện AI").

**5. AI ở đâu:**
- **Acoustic anomaly detection** (autoencoder/spectrogram-CNN) học "chữ ký âm thanh" của sản phẩm đạt chuẩn — bộ dữ liệu MIMII/ToyADMOS đã chứng minh khả thi.
- **Active learning**: AI chủ động hỏi người khiếm thị đúng những mẫu nó không chắc → tối đa hoá giá trị mỗi phút lao động của họ.
- **Khuếch đại/biến đổi âm thanh bằng AI**: dịch chuyển tần số siêu âm (vượt ngưỡng nghe) xuống dải nghe được → **con người nghe được thứ mà trước đây không ai nghe được** — nghĩa là người khiếm thị + AI giỏi hơn người sáng mắt + AI.
- **Haptic rendering**: chuyển phổ âm thành mẫu rung trên đầu ngón tay cho người vừa mù vừa nghe kém.

**6. Bền vững:** Jig in 3D bằng **nhựa tái chế**, thay đổi theo sản phẩm chỉ bằng in lại (không cần gia công cơ khí → giảm mạnh rác khuôn mẫu). Bền vững **xã hội**: chuyển dịch cơ cấu nghề nghiệp của cả một cộng đồng khỏi bẫy thu nhập thấp. Bền vững **kinh tế**: doanh nghiệp không làm từ thiện, họ mua năng lực.

**7. Khác biệt:** Mọi giải pháp khác hỏi *"làm sao giúp người mù làm được việc của người sáng mắt?"*. EarQC hỏi *"việc gì người mù làm tốt hơn người sáng mắt, và làm sao đưa nó vào chuỗi giá trị công nghiệp?"* — đảo ngược hoàn toàn khung bài toán. **Đây là ý tưởng duy nhất trong 18 cái trực tiếp nâng mức lương, chứ không chỉ nâng khả năng tiếp cận.**

**8. Prototype 3 ngày:**
- Ngày 1: chọn "sản phẩm": ly sứ/gạch men (gõ để phát hiện nứt — nguyên lý thật, dùng trong ngành gốm hàng trăm năm). Mua 20 cái, đập nứt 10 cái (nứt ẩn, nhìn không thấy).
- Ngày 2: contact mic ~200k + điện thoại ghi âm. Train mô hình phân loại đơn giản trên spectrogram (vài chục mẫu là đủ để demo).
- Ngày 3: **test trên sân khấu — mời giám khảo tham gia**: giám khảo (sáng mắt) đoán ly nào nứt bằng mắt → sai. Người bịt mắt gõ và nghe → đúng. AI xác nhận. **Đây là khoảnh khắc "wow" thuyết phục nhất có thể dựng trong 3 ngày, và nó chứng minh luận điểm cốt lõi ngay trước mắt giám khảo.**
- Kèm jig in 3D thật để giám khảo cầm.

**9. Tác động:** Độ chính xác QC (người khiếm thị vs người sáng mắt vs AI vs kết hợp); **mức lương trung bình** trước/sau (chỉ số employability thật); số vị trí việc làm mới tạo ra; số mẫu dữ liệu được gán nhãn/giờ.

**10. Rủi ro & trả lời:**
- *"AI rồi sẽ thay thế chính họ."* → Thiết kế mô hình **human-in-the-loop vĩnh viễn**: AI xử lý ca dễ, người xử lý ca khó và liên tục huấn luyện lại khi đổi sản phẩm. Hợp đồng lao động gắn với vai trò "AI trainer" — càng nhiều AI, càng cần họ. Phải chuẩn bị kỹ câu này, giám khảo chắc chắn hỏi.
- *"An toàn trong nhà máy?"* → Ghép với A4 (SafeCell).
- *"Có bằng chứng người mù nghe tốt hơn không?"* → Có nghiên cứu về tái tổ chức vỏ não và về khả năng phân loại bằng xúc giác của người mù bẩm sinh biết Braille; nhưng nên trình bày cẩn trọng: **lợi thế đến từ sự tập trung và huấn luyện, được AI khuếch đại** — an toàn hơn về mặt học thuật.

**11. Chấm điểm:** Innovation **5** | UCD **4** | Feasibility **4** | AI **4** → **17/20**

---

### B4. **FeelCheck** — *"Kiểm toán viên tiếp cận: nghề mới cho người khiếm thị."*

**1. Tagline:** QCVN 10:2014 tồn tại 11 năm mà không ai kiểm tra. Giờ thì có người kiểm — và họ là người khiếm thị.

**2. Insight:** Việt Nam **đã có** QCVN 10:2014/BXD (hiệu lực 1/7/2015) quy định đầy đủ về công trình tiếp cận. Nhưng thực tế: gạch dẫn đường bị tủ điện, cây, cát, xe máy chặn khắp TP.HCM. **Khoảng trống không nằm ở luật mà ở khâu kiểm tra & thực thi** — và không ai đủ tư cách kiểm tra bằng chính người sử dụng. Đồng thời: một nghề mới, có chuyên môn, có thù lao, phù hợp tuyệt đối.

**3. Ai dùng:** Người khiếm thị (**với tư cách kiểm toán viên được trả phí**); chủ đầu tư/BQL toà nhà; kiến trúc sư; cơ quan quản lý xây dựng; doanh nghiệp làm báo cáo ESG.

**4. Cách hoạt động:**
1. Kiểm toán viên khiếm thị được trang bị **bộ kit đeo**: điện thoại (camera + LiDAR nếu iPhone Pro) gắn ngực, micro nhị nhĩ (binaural), cảm biến ánh sáng, gậy có IMU.
2. Họ **đi một vòng toà nhà như bình thường** — không cần làm gì khác. Toàn bộ hành trình được ghi.
3. AI phân tích đa phương thức và tự động xuất **báo cáo đối chiếu QCVN 10:2014 / ISO 21542**: độ dốc dốc, chiều cao bậc, độ rộng lối đi, có/không Braille trên nút thang máy, có/không tín hiệu âm ở thang máy, độ tương phản biển báo, độ chói cửa kính, mức ồn nền, vật cản.
4. **Dữ liệu chủ quan ghép với dữ liệu khách quan**: kiểm toán viên nói vào mic *"chỗ này tôi không biết rẽ hướng nào"* → AI gắn nhận xét đó vào toạ độ + ảnh + số đo → **bằng chứng có sức nặng pháp lý và cảm xúc**.
5. Xuất **bản đồ 3D "điểm nóng bất tiếp cận"** + danh sách khắc phục xếp theo **chi phí/tác động** (*"dán 12 nhãn Braille lên nút thang máy: 200.000đ, giải quyết 34% vấn đề"*).

**5. AI ở đâu:**
- **VLM đo đạc từ ảnh/LiDAR**: tự động ước lượng chiều rộng, chiều cao, độ dốc, phát hiện tay vịn/bậc/cửa.
- **OCR + kiểm tra tương phản** theo ngưỡng WCAG/ISO cho biển báo; phát hiện thiếu Braille.
- **Phân tích âm học từ ghi âm binaural**: đo reverb, mức ồn, phát hiện thiếu tín hiệu âm ở thang máy/lối băng qua đường.
- **LLM sinh báo cáo tuân thủ**: đối chiếu phát hiện với điều khoản cụ thể của QCVN 10:2014 và đề xuất biện pháp khắc phục kèm dự toán.
- **Phân tích dáng đi/lưỡng lự từ IMU**: chỗ nào người dùng dừng lại lâu, quay đầu nhiều = **điểm khó hiểu về mặt không gian** — chỉ số khách quan cho một thứ trước nay chỉ có cảm tính.

**6. Bền vững:** Không xây gì, chỉ **tạo dữ liệu để sửa đúng chỗ** → tránh lãng phí xây dựng sai (như việc lát tactile paving rồi để tủ điện chặn — tiền đã đổ xuống sông). Bền vững xã hội: tạo nghề tri thức. Bộ kit dùng chung, luân chuyển giữa các kiểm toán viên. Kết quả tích luỹ thành **bộ dữ liệu mở về tiếp cận của TP.HCM** — tài sản công.

**7. Khác biệt:** Kiểm toán tiếp cận hiện nay do người sáng mắt làm bằng thước dây và checklist → chỉ bắt được lỗi *hình học*, không bắt được lỗi *trải nghiệm* (tủ điện đặt đúng khoảng cách nhưng vẫn chặn đường). FeelCheck là công cụ duy nhất **ghi lại trải nghiệm thật + số đo khách quan cùng lúc**, và đặt người khuyết tật ở vị trí **chuyên gia được trả tiền**, không phải đối tượng khảo sát.

**8. Prototype 3 ngày:**
- Ngày 1: đi bộ quay thật 1 tuyến ở RMIT (hoặc đoạn vỉa hè gần trường) bằng điện thoại gắn ngực + ghi âm.
- Ngày 2: chạy VLM phân tích → xuất bảng phát hiện; viết prompt đối chiếu QCVN 10:2014 (tải PDF làm ngữ cảnh). Dựng báo cáo mẫu trong Figma/Canva.
- Ngày 3: demo: chiếu video hành trình, bên cạnh là báo cáo tự sinh cuộn theo. **Thêm một đoạn cực mạnh: quay chính đoạn vỉa hè có gạch dẫn đường bị xe máy đậu chặn — hình ảnh này ở TP.HCM lấy được trong 10 phút và nó tự nói lên tất cả.**

**9. Tác động:** Số toà nhà được kiểm toán; số lỗi khắc phục thực tế; **số giờ công có trả lương cho người khiếm thị**; chi phí kiểm toán so với đơn vị tư vấn truyền thống (rẻ hơn nhiều lần); tỷ lệ tuân thủ QCVN.

**10. Rủi ro & trả lời:**
- *"Ai trả tiền cho kiểm toán?"* → Ba nguồn: (1) doanh nghiệp FDI/niêm yết cần báo cáo **ESG — chữ S (Social)** đang bị bỏ trống, đây là thứ họ đang tìm; (2) chủ đầu tư muốn cho thuê được cho khách quốc tế; (3) cơ quan quản lý xây dựng.
- *"AI đo sai kích thước?"* → LiDAR iPhone sai số vài cm, đủ cho sàng lọc; các điểm nghi ngờ được đo lại thủ công. Vị thế sản phẩm là **công cụ sàng lọc quy mô lớn**, không thay thế kiểm định pháp lý.
- *"Đây có phải giải pháp kiến trúc không, hay chỉ là app?"* → Đầu ra là **quyết định kiến trúc**: sửa gì, ở đâu, hết bao nhiêu. Cần trình bày bằng bản vẽ/mô hình 3D để giữ chất "architectural".

**11. Chấm điểm:** Innovation **5** | UCD **5** | Feasibility **5** | AI **4** → **19/20**

---

### B5. **GlareGuard** — *"Văn phòng tự điều chỉnh ánh sáng cho từng đôi mắt."*

**1. Tagline:** 80% người "khiếm thị" vẫn còn nhìn được. Không ai thiết kế cho họ.

**2. Insight (khoảng trống lớn bị bỏ quên):** Đội có nhóm mục tiêu gồm **low vision, tunnel vision, nhạy sáng (photophobia)** — nhưng gần như 100% sản phẩm assistive tech chỉ nhắm người mù hoàn toàn. Thực tế văn phòng VN: kính mặt tiền lớn (nhà phố cải tạo, toà văn phòng), nắng gắt, đèn huỳnh quang nhấp nháy, màn hình phản chiếu → với người nhạy sáng đây là **đau đầu, chảy nước mắt, buộc phải nghỉ việc**; với người tunnel vision, vùng chói nuốt mất phần thị trường ít ỏi còn lại. Đây là lý do **mất việc** rất thật nhưng vô hình — không ai đo được, nên không ai sửa.

**3. Ai dùng:** Nhân viên low vision/nhạy sáng/tunnel vision; nhân viên đau nửa đầu, tự kỷ nhạy cảm cảm giác (nhóm hưởng lợi kèm rất đông); quản lý cơ sở vật chất.

**4. Cách hoạt động:**
1. Cảm biến ánh sáng rẻ (~50k/cái) rải quanh văn phòng + cảm biến trên bàn từng người. Đo **lux, độ chói (glare), nhiệt độ màu, nhấp nháy (flicker)**.
2. Mỗi nhân viên có **"hồ sơ thị giác"**: ngưỡng chói chịu được, dải nhiệt độ màu dễ chịu, độ tương phản cần thiết.
3. AI điều khiển **rèm tự động (motor rèm ~1,5 triệu, lắp vào rèm có sẵn) + đèn LED điều chỉnh được + phim dán kính**, tối ưu theo thời gian thực cho tổ hợp người đang có mặt.
4. **Bản đồ chói (glare map)** của văn phòng, cập nhật theo giờ và mùa: app nói *"11h–14h khu cửa sổ Tây rất chói, bàn 14 và 15 nên tránh"* → tích hợp vào hệ thống đặt bàn (nối với B6).
5. Với người tunnel vision: điện thoại/kính báo **vật cản nằm ngoài vùng nhìn còn lại** — AI biết chính xác trường nhìn còn bao nhiêu độ và chỉ báo những gì ngoài vùng đó.

**5. AI ở đâu:**
- **Dự báo ánh sáng tự nhiên** bằng mô hình học máy kết hợp vị trí mặt trời + dữ liệu thời tiết + hình học toà nhà → điều chỉnh **trước** khi chói xảy ra, không phải phản ứng sau.
- **Tối ưu đa mục tiêu, đa người dùng**: cân bằng nhu cầu trái ngược (người cần sáng vs người sợ sáng) trong cùng không gian mở — bài toán tối ưu thật, có ràng buộc, rất thuyết phục về mặt kỹ thuật.
- **Học sở thích ngầm**: người dùng chỉnh tay → AI học dần, không cần điền form.
- **CV đánh giá vùng thị trường còn lại** qua bài test đơn giản trên điện thoại → cá nhân hoá cảnh báo cho tunnel vision.
- **Phát hiện flicker** từ camera điện thoại (đèn huỳnh quang cũ nhấp nháy gây đau đầu — nguyên nhân phổ biến mà không ai chẩn đoán được).

**6. Bền vững:** **Tiết kiệm điện là hệ quả trực tiếp** — điều khiển rèm + đèn thông minh giảm 20–30% điện chiếu sáng/điều hoà. Đây là ý tưởng duy nhất trong 18 cái mà **doanh nghiệp có ROI tài chính dương rõ ràng** kể cả khi không có nhân viên khuyết tật nào → cực dễ bán. Phim dán kính thay vì thay kính (retrofit). Cảm biến tuổi thọ 5–10 năm, pin nút.

**7. Khác biệt:** Nhà thông minh hiện có điều khiển ánh sáng theo **tiết kiệm năng lượng** hoặc **thẩm mỹ**. Chưa hệ nào lấy **ngưỡng thị giác bệnh lý của con người cụ thể** làm hàm mục tiêu. Và không có sản phẩm assistive nào phục vụ nhóm nhạy sáng — nhóm này hiện chỉ được "hỗ trợ" bằng lời khuyên "đeo kính râm".

**8. Prototype 3 ngày:**
- Ngày 1: đo thật bằng app lux meter trên điện thoại quanh một phòng ở RMIT theo 3 mốc giờ → vẽ **bản đồ chói thật**.
- Ngày 2: dựng mô phỏng: mô hình phòng trong Blender/Twinmotion với ánh sáng mặt trời theo giờ; demo rèm đóng/mở tự động (có thể dùng 1 motor servo + rèm mini trên mô hình bìa 1:20 — **mô hình vật lý có rèm tự chạy rất ăn ảnh**).
- Ngày 3: demo "kính mô phỏng": làm 2 cặp kính giấy mô phỏng tunnel vision và photophobia cho giám khảo đeo → cho họ tự trải nghiệm văn phòng chói. **Đồng cảm trực tiếp = điểm UCD tối đa.** Kèm dashboard Figma.

**9. Tác động:** Giờ làm việc thoải mái/ngày (tăng); số ngày nghỉ do đau đầu/mỏi mắt (giảm); tốc độ đọc màn hình của người low vision trước/sau; **kWh tiết kiệm** (chỉ số bền vững có tiền).

**10. Rủi ro & trả lời:**
- *"Xung đột giữa các nhân viên trong không gian mở."* → Giải bằng **phân vùng** (zoning) — tạo "vùng dịu sáng" và "vùng sáng" thay vì ép cả phòng; đây chính là quyết định kiến trúc.
- *"Đây là smart building, không phải giải pháp cho người khuyết tật."* → Ngược lại: đây là ví dụ hoàn hảo của Universal Design — thiết kế cho biên độ cực đoan, cả tập thể hưởng lợi.
- *"Chi phí motor rèm?"* → Có bản zero-cost: chỉ cần bản đồ chói + chính sách xếp chỗ ngồi + phim dán kính.

**11. Chấm điểm:** Innovation **4** | UCD **5** | Feasibility **5** | AI **4** → **18/20**

---

### B6. **DeskPulse** — *"Hot-desk mà người mù vẫn tìm được bàn của mình."*

**1. Tagline:** Không cấm bàn linh hoạt — dạy bàn tự gọi chủ nhân.

**2. Insight:** Hot-desking là xu hướng không thể đảo ngược (coworking, hybrid, tiết kiệm mặt bằng — đặc biệt ở TP.HCM nơi giá thuê cao). Nhưng nguyên tắc cốt lõi để người mù làm việc độc lập là **bố cục nhất quán, đồ vật ở vị trí cố định**. Hai điều này **xung đột trực diện**. Kết quả thực tế: công ty chuyển sang hot-desk → nhân viên khiếm thị mất khả năng làm việc độc lập → nghỉ việc. Chưa ai giải bài này.

**3. Ai dùng:** Nhân viên khiếm thị; HR/quản lý văn phòng; coworking space (thị trường lớn ở TP.HCM).

**4. Cách hoạt động:**
1. Nhân viên đặt bàn qua app (giọng nói). Nhưng **AI không đưa danh sách bàn trống — AI chọn bàn tốt nhất** dựa trên: khoảng cách tới WC/pantry/thang máy, số lần rẽ trên tuyến, mức chói (dữ liệu từ GlareGuard), mức ồn, và **độ tương đồng với những bàn bạn đã quen**.
2. **Nguyên tắc "neo bất biến"**: AI luôn ưu tiên giữ bạn trong một **cụm bàn cố định** (VD luôn ở dãy A, hàng 2) → tuyến đi gần như không đổi dù bàn cụ thể đổi. Linh hoạt cho công ty, ổn định cho người dùng — **đây là lời giải kiến trúc cho một mâu thuẫn tưởng không giải được**.
3. Khi tới nơi: bàn được đặt phát **tín hiệu gọi**: âm thanh rất nhỏ + đèn (cho low vision) + có thể rung nhẹ mặt bàn. Người dùng đi thẳng tới, không hỏi ai.
4. Tới bàn: điện thoại/kính đọc **"bản đồ mặt bàn"**: *"Màn hình chính giữa, dock bên trái, ổ cắm mép phải sau 20 cm, bàn bên phải có người đang ngồi."*
5. **Ghế và đồ đạc**: cảm biến rẻ báo ghế bên cạnh có người hay không, tránh tình huống ngượng ngập ngồi nhầm/va vào người.

**5. AI ở đâu:**
- **Bài toán gán tối ưu (assignment problem)** có trọng số đa tiêu chí — tối ưu đồng thời cho cả người khiếm thị lẫn hiệu suất sử dụng mặt bằng của công ty (để phòng nhân sự thấy mình không mất gì).
- **Học sở thích cá nhân** từ lịch sử (bàn nào bạn ở lại lâu, bàn nào bạn đổi sớm = tín hiệu ngầm).
- **VLM mô tả mặt bàn theo thời gian thực** (đồ đạc mỗi ngày mỗi khác — đây là thứ chỉ AI làm được, không thể lập trình cứng).
- **Dự báo nhu cầu chỗ ngồi** để giữ chỗ trong cụm neo trước khi bị người khác đặt mất.

**6. Bền vững:** **Tăng hiệu suất sử dụng mặt bằng** → công ty cần ít m² hơn → **giảm phát thải xây dựng và vận hành** (lập luận sustainability rất mạnh và rất "industrial"). Phần cứng: 1 module nhỏ/bàn (ESP32 + LED + buzzer, ~120k), in vỏ nhựa tái chế, gắn nam châm — tháo ra dùng lại khi đổi bàn.

**7. Khác biệt:** Các app đặt bàn (Robin, Envoy, OfficeSpace) đều tối ưu cho **công ty**, hiển thị bằng **sơ đồ trực quan** (bản đồ mặt bằng = rào cản tuyệt đối với người mù). DeskPulse là hệ đầu tiên lấy **tính ổn định nhận thức của người khiếm thị làm ràng buộc tối ưu** và thay bản đồ thị giác bằng dẫn đường đa giác quan.

**8. Prototype 3 ngày:**
- Ngày 1: dựng "văn phòng hot-desk" 12 bàn trong 1 phòng RMIT, đánh số.
- Ngày 2: 3 module thật (ESP32 + buzzer + LED, ~400k tổng) trên 3 bàn; app đặt bàn bằng giọng nói (có thể là web đơn giản); thuật toán gán viết bằng vài chục dòng.
- Ngày 3: demo: người bịt mắt nói *"đặt bàn cho tôi 9 giờ sáng mai"* → AI đọc lý do chọn → tới nơi, bàn kêu → đi thẳng tới → VLM đọc mặt bàn. Quay **một cú máy liền mạch (one-take)** — rất thuyết phục.

**9. Tác động:** Thời gian tìm bàn (từ "phải nhờ người" → < 60 giây); **tỷ lệ nhân viên khiếm thị giữ được việc sau khi công ty chuyển sang hot-desk** (chỉ số employability trực diện); hiệu suất sử dụng bàn của công ty (không giảm — điều kiện để được duyệt).

**10. Rủi ro & trả lời:**
- *"Sao không cứ cho họ một bàn cố định là xong?"* → Câu hỏi hay nhất và phải trả lời thẳng: (a) bàn cố định = **bị đánh dấu khác biệt**, nhiều người khiếm thị không muốn; (b) nhiều công ty không còn chỗ cố định để cho; (c) DeskPulse vẫn hỗ trợ chế độ cố định — nó chỉ mở rộng lựa chọn. Và (d) **cụm neo chính là bàn cố định "mềm"**, có được lợi ích của cả hai.
- *"Bàn phát tiếng thì cả phòng nghe?"* → Âm rất nhỏ + hướng; hoặc chỉ rung/đèn.
- *"Chi phí module × 200 bàn?"* → 24 triệu cho cả văn phòng, và chỉ cần trang bị cụm neo (20–30 bàn) là đủ.

**11. Chấm điểm:** Innovation **5** | UCD **5** | Feasibility **4** | AI **4** → **18/20**

---

## NHÓM C — "THỰC TẾ / RẺ / LẮP ĐƯỢC TRONG 1 TUẦN"

---

### C1. **TagPath** — *"Bản đồ toà nhà, in trên giấy A4, giá 2.000 đồng một điểm."*

**1. Tagline:** Không beacon, không pin, không thi công — chỉ là những ô màu dán trên tường.

**2. Insight:** Định vị trong nhà tưởng phải đắt: UWB chính xác 10–30 cm nhưng cần anchor mỗi 5–10 m và tag đắt; BLE rẻ hơn nhưng sai số ~5 m, cần thay pin hàng trăm điểm; GoodMaps phải quét bằng rig LiDAR chuyên dụng. **Trong khi NaviLens chứng minh: chỉ cần in ra.** Barcelona phủ 159 ga metro + 2.400 điểm bus; VIA (Mỹ) lắp ~6.000 biển. Điện thoại quét được từ ~12 m, góc rất rộng, **không cần ngắm chuẩn** — điều then chốt vì người mù không thể "ngắm" QR thường.

**3. Ai dùng:** Mọi toà nhà VN có ngân sách gần bằng 0: nhà phố cải tạo, coworking, trường học, UBND phường, bệnh viện.

**4. Cách hoạt động:**
1. AI đọc bản vẽ mặt bằng (hoặc người dùng chụp ảnh từng khu) → **tự sinh sơ đồ vị trí dán mã** tối ưu: bao nhiêu mã, ở đâu, cao bao nhiêu.
2. In mã trên **giấy decal A5** (hoặc in lên tấm tre/gỗ tái chế cho bền), dán ở độ cao 1,4–1,6 m tại: cửa mỗi phòng, đầu/cuối hành lang, cạnh thang máy, cạnh cầu thang, cửa WC, pantry.
3. Người dùng **chỉ cần cầm điện thoại quét ngang trước mặt khi đi** (không cần dừng, không cần ngắm) → app đọc: *"Phòng họp Mekong, bên phải bạn, 2 bước. Hành lang tiếp tục thẳng 15 m tới thang máy."*
4. Mã **kép**: mã màu cho app + **Braille + chữ nổi tương phản cao ngay bên cạnh** → người không dùng smartphone vẫn đọc được, người low vision đọc bằng mắt. Ba tầng thông tin trên cùng một tấm.
5. Khi bố cục đổi: **in lại, dán lại — chi phí gần bằng 0.** Đây là ưu thế quyết định so với mọi hạ tầng cứng.

**5. AI ở đâu:**
- **LLM/VLM đọc bản vẽ mặt bằng → sinh đồ thị không gian và nội dung cho từng mã tự động** (hiện nay việc này làm tay, tốn hàng chục giờ/toà nhà → đây là nút thắt khiến NaviLens khó nhân rộng, và là chỗ AI tạo giá trị thật).
- **Thuật toán set-covering tối ưu vị trí dán** — ít mã nhất mà phủ hết mọi điểm quyết định.
- **LLM sinh chỉ dẫn theo ngữ cảnh thời gian thực**: gộp dữ liệu mã + lịch phòng họp + vị trí người dùng → *"Phòng này đang họp, phòng trống gần nhất là Sài Gòn, thẳng 8 m bên trái."*
- **Ước lượng vị trí bằng CV**: từ kích thước và góc nghiêng của mã trong khung hình → ước lượng khoảng cách và hướng (không cần beacon).

**6. Bền vững:** **Rẻ nhất trong 18 ý tưởng.** ~2.000–20.000đ/điểm. **Không pin → không rác pin** (so với BLE beacon: hàng trăm viên pin lithium phải thay mỗi 1–2 năm — đây là lập luận bền vững rất sắc mà ít ai nghĩ tới). In trên **giấy tái chế / tấm tre ép**. Khi hỏng: thay tờ giấy.

**7. Khác biệt:** So với NaviLens gốc: TagPath thêm **lớp AI tự sinh nội dung và tự tối ưu vị trí** (giải nút thắt triển khai), thêm **lớp Braille/chữ nổi vật lý** (không loại trừ người không có smartphone — điểm phê bình chính của TransLink về NaviLens), và **bản địa hoá tiếng Việt**. So với BLE: rẻ hơn 10 lần, không pin, không nhiễu.

**8. Prototype 3 ngày:**
- Ngày 1: tạo mã miễn phí trên navilens.com (hoặc tự làm marker màu + OpenCV nếu muốn tự chủ). Lấy bản vẽ 1 tầng RMIT.
- Ngày 2: cho LLM sinh nội dung cho 15 điểm → in decal tại tiệm photo (~50k) → **dán thật lên hành lang RMIT**. Thêm nhãn Braille (dùng máy dập Braille của Hội Người mù hoặc in 3D).
- Ngày 3: test thật: người bịt mắt đi từ thang máy tới phòng cụ thể. **Đây là prototype duy nhất trong 18 cái có thể đưa cho giám khảo tự cầm điện thoại quét ngay tại chỗ pitch.** Dán 3 mã quanh khu vực pitch → mời giám khảo trải nghiệm. Cực mạnh.

**9. Tác động:** Chi phí/m² (so sánh với BLE và UWB — biểu đồ cột rất thuyết phục); thời gian triển khai (1 tầng < 1 ngày); tỷ lệ tìm đúng phòng; số toà nhà phủ được với 100 triệu VNĐ (con số này sẽ gây ấn tượng: hàng trăm).

**10. Rủi ro & trả lời:**
- *"Phải có smartphone."* → Vì thế có lớp Braille/chữ nổi song song. Và tỷ lệ smartphone ở VN rất cao, kể cả trong cộng đồng khiếm thị (họ dùng TalkBack/VoiceOver hàng ngày).
- *"Giấy bẩn, rách, bị bóc."* → Bản cao cấp in trên tấm tre/nhôm tái chế; chi phí vẫn rất thấp; và thay thế dễ.
- *"Phụ thuộc NaviLens (công ty nước ngoài)?"* → Nêu roadmap tự phát triển marker mở (ArUco/AprilTag cải tiến) — thể hiện tư duy chủ quyền công nghệ, ghi điểm Feasibility.
- *"Quá đơn giản, ít AI?"* → Nhấn mạnh phần LLM tự sinh nội dung & tối ưu vị trí — đó mới là sản phẩm, mã dán chỉ là giao diện.

**11. Chấm điểm:** Innovation **3** | UCD **5** | Feasibility **5** | AI **4** → **17/20**

---

### C2. **LiftEar** — *"Chiếc hộp 300.000 đồng khiến mọi thang máy cũ biết nói."*

**1. Tagline:** Không thay thang máy. Chỉ dạy nó nói tiếng Việt.

**2. Insight (rất Việt Nam):** Thang máy ở đa số nhà phố cải tạo, toà nhà cũ, chung cư cũ tại TP.HCM: **nút bấm phẳng không Braille, không báo tầng bằng giọng nói, chỉ có đèn số**. Người khiếm thị vào thang máy thì hoàn toàn mù thông tin: không biết đang ở tầng mấy, cửa mở tầng nào. Phải hỏi người lạ mỗi lần, mỗi ngày. Thay thang máy hoặc nâng cấp bảng điều khiển = hàng trăm triệu, không ai làm. Đây là **rào cản nhỏ nhất về kỹ thuật nhưng lớn nhất về tần suất** — xảy ra 4–10 lần/ngày/người.

**3. Ai dùng:** Nhân viên khiếm thị; người cao tuổi; người mắt kém; **ban quản lý toà nhà cũ muốn tuân thủ QCVN 10 mà không đủ tiền cải tạo**.

**4. Cách hoạt động:**
1. Một hộp nhỏ gắn nam châm/băng keo vào **góc trần cabin thang máy** (không đấu nối điện thang máy — cực kỳ quan trọng về pháp lý và an toàn).
2. Trong hộp: camera nhỏ hướng về **màn hình hiển thị số tầng** + áp kế (barometer) + gia tốc kế + loa + pin sạc.
3. AI đọc số tầng từ camera **và/hoặc** suy ra tầng từ thay đổi áp suất + gia tốc (dự phòng kép, hoạt động cả khi màn hình mờ).
4. Loa đọc: *"Tầng 5. Cửa đang mở."* — tiếng Việt, âm lượng vừa đủ trong cabin.
5. **Bộ nhãn Braille + nút nổi tương phản** dán lên bảng nút bấm (in 3D, ~2.000đ/nút) → biết bấm nút nào. Hoàn chỉnh trải nghiệm: biết bấm gì, biết đang ở đâu.
6. Mở rộng: app ghi nhớ "tầng công ty bạn là 7" → nhắc trước khi tới.

**5. AI ở đâu:**
- **OCR/CNN nhận diện ký tự 7 đoạn (seven-segment)** trên mọi kiểu màn hình thang máy — đa dạng khủng khiếp, không thể lập trình cứng, phải học.
- **Sensor fusion** áp kế + gia tốc kế → mô hình suy tầng khi camera thất bại (tối, chói, màn hình hỏng); tự hiệu chuẩn theo chiều cao tầng của từng toà nhà.
- **Tự học sơ đồ toà nhà**: sau vài ngày, hệ tự biết toà này có bao nhiêu tầng, cao bao nhiêu, mà không cần ai nhập.
- **Phát hiện sự cố**: rung bất thường/kẹt → cảnh báo (giá trị cộng thêm cho BQL, giúp bán được hàng).

**6. Bền vững:** **Retrofit thuần khiết — đây là hình mẫu của "bền vững" mà đề bài nhắc tới**: không thay thiết bị, không phá dỡ, không rác thải. Vỏ hộp in 3D nhựa tái chế. Pin sạc 6 tháng/lần hoặc lấy điện từ đèn cabin. Chi phí ~300–500k so với **hàng trăm triệu** để nâng cấp thang máy → **tỷ lệ 1:1000**. Tháo ra mang sang thang máy khác.

**7. Khác biệt:** Giải pháp hiện tại duy nhất là **thay/nâng cấp bảng điều khiển thang máy** — đắt, phải xin phép, phải dừng thang. LiftEar là **thiết bị ký sinh (parasitic device)**: không can thiệp hệ thống, không cần giấy phép, lắp trong 10 phút. Nguyên lý "ký sinh không xâm lấn" này có thể nhân rộng cho mọi thiết bị cũ (máy chấm công, máy photocopy, máy nước nóng).

**8. Prototype 3 ngày:**
- Ngày 1: quay video màn hình thang máy thật ở RMIT/chung cư, nhiều điều kiện sáng.
- Ngày 2: chạy OCR (Tesseract/mô hình nhỏ) + TTS tiếng Việt. Dựng hộp: **điện thoại Android cũ đã là đủ** (có camera, loa, gia tốc kế, pin) → chi phí prototype = 0. In 3D vỏ hộp + nhãn Braille cho nút.
- Ngày 3: **lắp thật vào một thang máy ở RMIT, quay demo đi lên đi xuống, loa đọc tầng.** Demo chạy thật trong môi trường thật — mạnh hơn mọi hoạt cảnh dàn dựng.

**9. Tác động:** Số lần phải hỏi người lạ/ngày (từ ~6 xuống 0); **tỷ lệ thang máy trong toà nhà cũ đạt yêu cầu thông tin của QCVN 10** với chi phí < 500k; thời gian lắp (10 phút); số thang máy phủ được với 100 triệu (≈250 thang).

**10. Rủi ro & trả lời:**
- *"Camera trong thang máy — riêng tư?"* → Camera hướng **lên màn hình tầng, không hướng vào người**; xử lý on-device, không lưu ảnh. Phải nói rõ và thiết kế hình học chứng minh (góc nhìn hẹp, chĩa lên).
- *"BQL không cho lắp?"* → Không đấu nối vào thang, tháo ra trong 1 phút, có thể xin phép như lắp gương/biển quảng cáo. Có thể bắt đầu từ chính các toà nhà đã cam kết ESG.
- *"Nếu AI đọc sai tầng thì nguy hiểm?"* → Dự phòng kép (camera + áp kế); khi hai nguồn mâu thuẫn thì **im lặng thay vì nói sai** — nguyên tắc fail-silent, giám khảo kỹ thuật sẽ đánh giá cao.

**11. Chấm điểm:** Innovation **3** | UCD **5** | Feasibility **5** | AI **4** → **17/20**

---

### C3. **PantrySkin** — *"Lớp da xúc giác cho mọi thiết bị cảm ứng trong văn phòng."*

**1. Tagline:** Lò vi sóng, máy pha cà phê, máy photocopy — ba thứ khiến bạn phải nhờ người khác mỗi ngày.

**2. Insight:** AFB kết luận thẳng: *đại đa số máy photocopy đa chức năng gây rào cản nghiêm trọng vì giao diện cảm ứng và không có speech output*; đa số lò vi sóng dùng **tấm cảm ứng phẳng**, "kể cả khi dán nhãn xúc giác thì các chức năng nâng cao và thời gian còn lại vẫn không tiếp cận được ở bất kỳ máy nào bán sẵn". NFB Mỹ phải vận động cả một đạo luật riêng. Ở Việt Nam: pantry chung, máy in chung, máy chấm công — **mỗi lần dùng là một lần phải nhờ**, và nhờ vả liên tục là thứ bào mòn phẩm giá và vị thế nghề nghiệp nhanh nhất.

**3. Ai dùng:** Nhân viên khiếm thị; người cao tuổi; bất kỳ ai gặp giao diện lạ.

**4. Cách hoạt động:**
1. Chụp ảnh bảng điều khiển của thiết bị → gửi lên hệ thống.
2. AI **nhận diện bố cục nút bấm** và tự sinh file in 3D cho một **overlay (lớp phủ) silicon/nhựa dẻo** khớp chính xác với thiết bị đó: khoét lỗ đúng vị trí nút hay dùng, có gờ định vị, có ký hiệu nổi + Braille.
3. Dán overlay lên máy (nam châm/keo dán lại được) → ngón tay tìm được nút mà **không cần nhìn, không cần nhớ**.
4. Với chức năng phức tạp (máy photocopy nhiều menu): hướng camera điện thoại vào màn hình → **AI đọc màn hình hiện tại và hướng dẫn từng bước**: *"Đang ở menu Copy. Nút Scan ở hàng 2, thứ 3 từ trái — trên overlay là ký hiệu hình tam giác."*
5. Thư viện mở: một người tạo overlay cho model máy X → **cả cộng đồng tải về in**. Hiệu ứng mạng.

**5. AI ở đâu:**
- **CV phát hiện và phân loại nút bấm** từ ảnh chụp → tự sinh hình học overlay (generative CAD) — thay cho việc thuê người thiết kế từng cái.
- **VLM đọc màn hình theo thời gian thực** và **ánh xạ vị trí trên màn hình ↔ vị trí trên overlay** — đây là điểm then chốt: nối thế giới số với thế giới xúc giác.
- **Hướng dẫn theo trạng thái**: LLM hiểu máy đang ở bước nào trong quy trình và chỉ nói điều cần cho bước đó.
- Kế thừa hướng nghiên cứu **VizLens/Facade (CMU)** nhưng thêm lớp **tự động sinh overlay vật lý**.

**6. Bền vững:** In 3D bằng **nhựa PLA từ tinh bột (phân huỷ sinh học)** hoặc silicon tái chế; 1 overlay ~15.000–40.000đ. **Kéo dài tuổi thọ thiết bị cũ** thay vì mua máy mới "có accessibility" (giảm rác điện tử — lập luận mạnh). Thư viện file mở = **sản xuất phân tán, không vận chuyển, không tồn kho**.

**7. Khác biệt:** Giải pháp hiện tại là dán chấm nổi bằng tay (bump dots) — thủ công, không chuẩn, chỉ giải quyết 3–4 nút cơ bản, hoàn toàn bó tay với màn hình cảm ứng nhiều lớp menu. PantrySkin **tự động hoá việc tạo overlay** và **ghép nó với AI đọc màn hình** → giải cả phần cứng lẫn phần mềm.

**8. Prototype 3 ngày:**
- Ngày 1: chọn 2 thiết bị thật ở RMIT (máy pha cà phê + máy photocopy). Chụp ảnh bảng điều khiển.
- Ngày 2: VLM phân tích → xuất SVG → in 3D overlay (RMIT có xưởng in 3D). Nếu không kịp: **cắt bìa/foam + dán nút nổi** — vẫn chứng minh được nguyên lý.
- Ngày 3: demo: người bịt mắt pha một ly cà phê bằng máy, từ đầu đến cuối, không nhờ ai. **Rất đời thường, rất dễ đồng cảm, ai cũng hiểu ngay.** Đưa overlay cho giám khảo sờ.

**9. Tác động:** Số lần phải nhờ đồng nghiệp/ngày (giảm về gần 0); thời gian hoàn thành tác vụ (pha cà phê, photo 2 mặt); số model thiết bị trong thư viện; **chỉ số tự chủ** tự đánh giá.

**10. Rủi ro & trả lời:**
- *"Mỗi máy một kiểu, không nhân rộng được."* → Đó chính là lý do phải có AI tự sinh: chi phí biên cho một model mới ≈ 1 tấm ảnh. Và thư viện cộng đồng biến vấn đề thành lợi thế.
- *"Overlay che mất nút với người sáng mắt."* → Thiết kế khoét lỗ, trong suốt, hoặc gắn nam châm tháo ra trong 2 giây.
- *"Nhỏ nhặt quá, không đủ tầm hackathon?"* → Trả lời bằng tần suất: một nhân viên chạm vào thiết bị dùng chung 10–20 lần/ngày. **Phẩm giá không nằm ở những khoảnh khắc lớn.** Nên **đóng gói PantrySkin như một module trong giải pháp tổng**, không pitch riêng.

**11. Chấm điểm:** Innovation **3** | UCD **5** | Feasibility **5** | AI **4** → **17/20**

---

### C4. **CaneClip** — *"Nâng cấp cây gậy trắng đang có, giá 400.000 đồng."*

**1. Tagline:** Không bán gậy mới. Bán bộ não gắn vào gậy cũ.

**2. Insight:** WeWALK 2 giá ~$599 (≈15 triệu VNĐ), Glide $1.500 (≈38 triệu). Với thu nhập của lao động khiếm thị Việt Nam, đây là con số phi thực tế. Nhưng **ai cũng đã có một cây gậy trắng** — thứ bền, rẻ, đáng tin cậy, không bao giờ hết pin. Nghiên cứu 2025 ("Virtual Whiskers") cho thấy phản hồi rung theo khoảng cách **giảm thời gian do dự và số lần gậy va chạm** — lợi ích thật, nhưng không nhất thiết phải nằm trong cây gậy đắt tiền.

**3. Ai dùng:** Lao động khiếm thị Việt Nam (phân khúc thu nhập thấp — tức đa số); Hội Người mù; trung tâm dạy nghề.

**4. Cách hoạt động:**
1. Một module nhỏ (~60 g) **kẹp vào bất kỳ cây gậy trắng nào**, ngay dưới tay cầm.
2. Bên trong: cảm biến ToF/siêu âm hướng lên (phát hiện **vật cản ngang tầm ngực và đầu** — thứ gậy hoàn toàn không phát hiện được: cành cây, biển hiệu, bảng quảng cáo, gương chiếu hậu ô tô, cửa kính mở hé; đây là nguyên nhân chấn thương đầu/mặt phổ biến nhất), motor rung, IMU, Bluetooth, pin sạc USB-C.
3. Rung theo cường độ tăng dần khi vật cản gần → **bàn tay đang cầm gậy cảm nhận trực tiếp**, không cần tai nghe (tai phải để nghe giao thông — cực kỳ quan trọng ở TP.HCM).
4. Kết nối điện thoại: chia sẻ dữ liệu với RouteCoach (B1) / TagPath (C1); IMU đếm bước chính xác để neo định vị.
5. Nút bấm trên module: gọi nhanh Be My Eyes / gửi vị trí khẩn cấp cho người thân.

**5. AI ở đâu:**
- **Phân loại vật cản bằng chuỗi tín hiệu cảm biến** (TinyML trên vi điều khiển): phân biệt tường / người đang đi tới / vật treo / khoảng trống → mẫu rung khác nhau, tránh "báo động giả" (nguyên nhân số 1 khiến người dùng vứt bỏ thiết bị hỗ trợ).
- **Phân tích dáng đi từ IMU**: phát hiện lưỡng lự, đi lệch, gần ngã → dữ liệu cho huấn luyện viên O&M từ xa.
- **Cá nhân hoá ngưỡng rung** bằng học từ phản hồi thực tế.
- **Dead-reckoning bằng IMU** hỗ trợ định vị trong nhà mà không cần hạ tầng.

**6. Bền vững:** **Kéo dài vòng đời cây gậy đang có thay vì bán thiết bị mới** — nguyên lý bền vững cốt lõi. Vỏ in 3D nhựa tái chế, **sửa được, thay pin được, thay cảm biến được** (thiết kế chống lỗi thời có chủ đích, ngược với mô hình thiết bị đóng kín). Linh kiện mua ở chợ Nhật Tảo → chuỗi cung ứng nội địa, sửa chữa nội địa. Giá mục tiêu 400–600k = **1/30 WeWALK**.

**7. Khác biệt:** WeWALK/Glide là **sản phẩm thay thế** (phải mua cả cây gậy/cả thiết bị, phải bỏ cái cũ, phụ thuộc nhà sản xuất nước ngoài, hỏng là hết). CaneClip là **phụ kiện**: giá rẻ, không thay đổi thói quen, không bỏ đi thứ đang dùng, sửa được tại chỗ. Về mặt chiến lược sản phẩm cho thị trường đang phát triển, đây là lựa chọn đúng.

**8. Prototype 3 ngày:**
- Ngày 1: mua linh kiện (cảm biến siêu âm HC-SR04 hoặc VL53L0X, Arduino Nano/ESP32, motor rung, pin — tổng <350k). Thiết kế kẹp.
- Ngày 2: lắp ráp + code rung theo khoảng cách (~50 dòng). In 3D vỏ kẹp.
- Ngày 3: **test thật ngoài hành lang/sân RMIT**, có treo vật cản ngang tầm đầu. Quay slow-motion cảnh gậy đi qua dưới một tấm biển mà gậy không chạm tới nhưng module rung cảnh báo. **Đưa cho giám khảo cầm và cảm nhận rung — vật thể cầm tay được luôn ăn điểm.**

**9. Tác động:** Số va chạm vùng đầu/ngực (giảm); tốc độ đi bộ (tăng — chỉ số tự tin khách quan); **chi phí so với thiết bị nhập khẩu (1/30)**; số người tiếp cận được với cùng ngân sách.

**10. Rủi ro & trả lời:**
- *"Đã có WeWALK rồi, sao phải làm lại?"* → Vấn đề không phải công nghệ mà là **giá và chuỗi cung ứng**. 15 triệu VNĐ ≈ 2–3 tháng thu nhập của lao động khiếm thị VN. Đây là đổi mới về **khả năng chi trả**, và đó là đổi mới hợp pháp.
- *"Pin hết giữa đường?"* → Gậy vẫn là gậy. **Suy giảm an toàn (graceful degradation)** — hệ phụ trợ hỏng không làm mất chức năng chính. Đây là câu trả lời thiết kế rất mạnh.
- *"Báo động giả gây phiền?"* → Chính là lý do có TinyML phân loại + ngưỡng cá nhân hoá; và cho phép tắt nhanh bằng 1 nút.

**11. Chấm điểm:** Innovation **3** | UCD **5** | Feasibility **5** | AI **3** → **16/20**

---

### C5. **DropPoint** — *"Điểm đón có tên, có mã, có giọng nói."*

**1. Tagline:** Khoảng cách 20 mét từ cổng công ty ra tới chỗ tài xế Grab đứng — đó là đoạn khó nhất trong ngày.

**2. Insight:** Hành trình đi làm ở TP.HCM là chuỗi điểm gãy: vỉa hè bị chiếm (Tuổi Trẻ: tủ điện, cát, xe máy, hàng quán chặn hết gạch dẫn đường), không có tín hiệu âm ở đèn giao thông, xe máy không nhường người đi bộ. Grab là phương tiện khả dĩ nhất (rẻ, phổ biến, đặt bằng app có screen reader) nhưng **"khoảnh khắc gặp nhau" lại hoàn toàn thị giác**: tài xế tìm khách bằng mắt, khách tìm xe bằng mắt, cả hai đứng cách nhau 15 m và gọi điện chỉ đường bằng "chỗ cái cây kia". Metro số 1 đã có tactile paving và biển Braille trong ga, nhưng **từ cửa ga ra tới văn phòng thì trống rỗng** — hạ tầng tốt bị cô lập.

**3. Ai dùng:** Nhân viên khiếm thị; tài xế Grab/xe ôm; lễ tân toà nhà; ban quản lý.

**4. Cách hoạt động:**
1. Mỗi toà nhà/ga metro có một hoặc vài **DropPoint** được "đăng ký": một điểm vật lý cụ thể, có **cột/tấm đánh dấu xúc giác dưới chân + mã TagPath + biển Braille**, đặt ở chỗ **thực sự đỗ được** (không phải toạ độ GPS giữa lòng đường như hiện nay).
2. Khi đặt xe, app tự chọn DropPoint gần nhất và **gửi cho tài xế mô tả rất cụ thể bằng tiếng Việt**: *"Đón tại cột vàng trước số 27, sau cây me, ngay bên phải cổng bảo vệ. Khách khiếm thị — vui lòng tới sát và nói to tên khách."*
3. Khách được dẫn từ bàn làm việc ra đúng DropPoint bằng TagPath/SoundMark (nối liền chuỗi trong nhà ↔ ngoài trời).
4. Khi xe tới: điện thoại khách **rung + đọc**: *"Xe biển 59-X1 234, màu đỏ, đang cách 10 m bên trái bạn."* Đồng thời điện thoại tài xế phát âm thanh để khách định vị (hoặc tài xế bấm nút "tôi đã tới" → loa điện thoại khách phát tín hiệu hướng).
5. **Tài xế được "chứng nhận"**: module đào tạo 5 phút trong app (cách hướng dẫn người khiếm thị lên xe, không kéo tay, mô tả bằng lời) → huy hiệu + ưu tiên nhận cuốc.

**5. AI ở đâu:**
- **VLM sinh mô tả điểm đón từ ảnh chụp thực địa** — biến toạ độ GPS vô hồn thành chỉ dẫn con người hiểu được (*"sau cây me, bên phải cổng bảo vệ"*), tự động cho hàng nghìn điểm.
- **Ghép cặp tài xế bằng ML**: ưu tiên tài xế đã có huy hiệu, đã từng đón khách khiếm thị thành công, đánh giá tốt về mô tả bằng lời.
- **CV nhận diện xe đang tới** qua camera điện thoại của khách (biển số/màu) → xác nhận đúng xe, chống lên nhầm xe (rủi ro an toàn thật, đặc biệt với phụ nữ khiếm thị).
- **Chọn DropPoint tối ưu theo thời gian thực**: mô hình học chỗ nào giờ này hay bị chiếm dụng (dữ liệu từ FeelCheck/ClearPath) → tránh điểm đang bị chặn.

**6. Bền vững:** Cột đánh dấu làm từ **vật liệu tái chế / bê tông tái chế / tre**, hoặc đơn giản là **sơn + gờ xúc giác dán trên vỉa hè có sẵn** (~200k/điểm). Không xây mới. **Tái sử dụng chính hạ tầng đang bị lãng phí** — chỗ tactile paving đã lát nhưng vô dụng thì DropPoint gắn vào đúng đó, biến nó thành điểm neo có giá trị.

**7. Khác biệt:** Grab và các app gọi xe hiện chưa có tính năng tiếp cận nào dành riêng cho người khiếm thị ở VN. Các nỗ lực quốc tế (Waymo) tập trung vào xe tự lái — không liên quan bối cảnh xe máy VN. DropPoint là giải pháp đầu tiên thiết kế cho **văn hoá giao thông xe máy**, và quan trọng nhất: nó **nối được ba mảnh hạ tầng rời rạc** (toà nhà ↔ vỉa hè ↔ phương tiện) — đúng khoảng trống số 2 đã xác định.

**8. Prototype 3 ngày:**
- Ngày 1: chọn 2 điểm thật (cổng RMIT + một ga metro). Chụp ảnh, quay video thực trạng (có xe máy đậu — tư liệu vàng).
- Ngày 2: VLM sinh mô tả điểm đón; dựng mock-up app 2 màn hình (khách + tài xế) trong Figma; làm cột đánh dấu bằng ống nhựa + sơn + gờ dán.
- Ngày 3: **diễn lại thật**: người bịt mắt đặt xe, đi ra DropPoint, một bạn đóng vai tài xế Grab tới. Quay từ 2 góc. Đối chiếu với cảnh "trước đây" (đi lòng vòng, gọi điện, không tìm thấy nhau). **Cảnh "trước" quay ở vỉa hè thật TP.HCM sẽ là đoạn cảm xúc nhất của video 5 phút.**

**9. Tác động:** Thời gian từ khi xe tới đến khi lên xe (giảm từ vài phút xuống <30 giây); tỷ lệ huỷ chuyến (tài xế huỷ vì không tìm thấy khách — chỉ số rất thực); **số chuyến đi làm độc lập/tuần**; số tài xế được chứng nhận.

**10. Rủi ro & trả lời:**
- *"Phải hợp tác với Grab — quá tham vọng cho hackathon?"* → Bản v1 **không cần Grab**: DropPoint hoạt động như một hệ thống điểm đón độc lập có mã, khách gửi mô tả cho tài xế qua chat có sẵn. Tích hợp API là roadmap giai đoạn 2. Nói rõ lộ trình sẽ nâng điểm Feasibility thay vì hạ.
- *"Cột bị xe máy đậu chặn (chính vấn đề bạn nêu)?"* → Đặt cột **sát mép công trình**, không giữa vỉa hè; và ClearPath/camera có thể giám sát; và có nhiều DropPoint dự phòng để AI chọn cái đang trống.
- *"An toàn cá nhân?"* → Tính năng xác minh biển số + chia sẻ hành trình với người thân là lõi, không phải tuỳ chọn.

**11. Chấm điểm:** Innovation **4** | UCD **5** | Feasibility **4** | AI **4** → **17/20**

---

### C6. **TactileKit Vietnam** — *"Bộ kit tiếp cận: 5 triệu đồng, lắp trong một tuần, làm từ rác."*

**1. Tagline:** Đóng gói toàn bộ tiếp cận vật lý thành một sản phẩm doanh nghiệp mua được như mua bàn ghế.

**2. Insight:** QCVN 10:2014 tồn tại từ 2015, nhưng doanh nghiệp VN không tuân thủ không phải vì không muốn mà vì **không biết phải làm gì, mua ở đâu, tốn bao nhiêu**. Không có nhà cung cấp, không có bảng giá, không có quy trình. Kiến trúc sư nói "cần Braille signage" — không ai biết mua ở đâu tại TP.HCM. Rào cản là **thiếu chuỗi cung ứng và thiếu sản phẩm đóng gói**, không phải thiếu ý chí.

**3. Ai dùng:** HR/hành chính doanh nghiệp vừa và nhỏ; coworking; trường học; UBND phường.

**4. Cách hoạt động:**
1. HR trả lời 10 câu hỏi trong app + **chụp 20 tấm ảnh văn phòng**.
2. AI phân tích ảnh → xuất **"Đơn thuốc tiếp cận"**: danh sách chính xác cần gì, đặt ở đâu, giá bao nhiêu, ai lắp, mất bao lâu — kèm bản vẽ mặt bằng đánh dấu vị trí.
3. Kit gửi tới gồm: biển Braille + chữ nổi tương phản cho từng phòng (in 3D theo đúng tên phòng của họ), nhãn Braille cho nút thang máy, băng gờ xúc giác dán sàn tại điểm nguy hiểm (đầu cầu thang, bậc hụt), **dải tương phản dán cửa kính** (chống va vào cửa kính — tai nạn phổ biến với cả người sáng mắt), tay vịn TouchLine module, decal TagPath, overlay PantrySkin cho thiết bị pantry.
4. **Video hướng dẫn lắp đặt bằng tiếng Việt**, không cần thợ — nhân viên hành chính tự lắp trong 1 tuần.
5. Sau khi lắp: dùng **FeelCheck (B4)** để kiểm tra và cấp **chứng nhận "Văn phòng tiếp cận"** — thứ HR có thể đưa vào báo cáo ESG và tin tuyển dụng.

**5. AI ở đâu:**
- **VLM phân tích ảnh văn phòng → tự sinh đơn hàng và bản vẽ vị trí lắp đặt** (thay thế một buổi khảo sát của chuyên gia tư vấn).
- **Sinh file in 3D tự động** cho biển tên phòng riêng của từng công ty (Braille + chữ nổi đúng chuẩn kích thước/khoảng cách chấm) — tự động hoá hoàn toàn khâu thiết kế.
- **LLM đối chiếu QCVN 10:2014** để đảm bảo kit đủ điều kiện tuân thủ và sinh hồ sơ chứng minh.
- **Tối ưu chi phí**: AI xếp hạng hạng mục theo tỷ lệ tác động/chi phí để công ty ngân sách nhỏ biết làm gì trước.

**6. Bền vững:** Biển báo in 3D từ **nhựa tái chế thu gom tại địa phương** (VN có nguồn nhựa tái chế dồi dào và giá rẻ); tay vịn từ **tre** (cây trồng nhanh, hấp thụ CO₂, có sẵn, đẹp); gờ xúc giác từ **cao su lốp xe tái chế**. Sản xuất tại VN bởi **chính các cơ sở của Hội Người mù** → vừa tạo việc làm vừa cung cấp sản phẩm (vòng tròn khép kín — ý tưởng này ghi điểm sustainability và impact cùng lúc). Không thi công, tháo lắp được, mang theo khi chuyển văn phòng.

**7. Khác biệt:** Hiện nay muốn làm văn phòng tiếp cận ở VN phải thuê tư vấn (đắt, chậm) hoặc nhập khẩu (đắt hơn, chờ lâu). TactileKit biến nó thành **một đơn hàng, một tuần, năm triệu** — hạ rào cản hành động xuống mức HR có thể tự quyết mà không cần xin ngân sách lớn. **Đây không phải phát minh công nghệ, đây là phát minh mô hình phân phối** — và đó thường là thứ thật sự tạo ra tác động quy mô.

**8. Prototype 3 ngày:**
- Ngày 1: chụp 20 ảnh một khu vực RMIT; viết prompt VLM → xuất "đơn thuốc tiếp cận" mẫu.
- Ngày 2: **in 3D thật** 5–8 biển Braille tên phòng + vài nhãn nút thang máy + cắt dải tương phản. Dựng một hộp kit thật (bao bì giấy tái chế, có hướng dẫn).
- Ngày 3: **lắp thật lên 1 hành lang RMIT trong 2 giờ, quay time-lapse "trước → sau"**. Mang nguyên chiếc hộp kit lên sân khấu pitch, mở ra, đưa từng món cho giám khảo. **Đây là prototype "cầm nắm được" nhất — cực kỳ mạnh cho tiêu chí Feasibility.**

**9. Tác động:** Số văn phòng trang bị được với 1 tỷ VNĐ (≈200); thời gian từ quyết định tới hoàn thành (1 tuần vs 6 tháng); % hạng mục QCVN 10 đạt sau khi lắp; **số giờ việc làm tạo ra tại cơ sở sản xuất của Hội Người mù**.

**10. Rủi ro & trả lời:**
- *"Đây là bán hàng, không phải đổi mới."* → Lớp AI (phân tích ảnh → đơn thuốc → sinh file in 3D → đối chiếu quy chuẩn) chính là đổi mới: nó loại bỏ chuyên gia tư vấn khỏi quy trình, giảm chi phí 90%. Đó là lý do việc này chưa ai làm được ở quy mô.
- *"Chất lượng in 3D có đạt chuẩn Braille?"* → Chuẩn kích thước chấm/khoảng cách được mã hoá trong bộ sinh file; cần kiểm định bởi Hội Người mù — nêu rõ bước này.
- *"AI đọc ảnh sai, kê đơn thiếu?"* → Có bước con người duyệt (kiểm toán viên FeelCheck), và bản thân kit có thể bổ sung theo module.

**11. Chấm điểm:** Innovation **3** | UCD **5** | Feasibility **5** | AI **3** → **16/20**

---

# PHẦN 2 — XẾP HẠNG TOP 5

| # | Ý tưởng | Điểm | Lý do chọn |
|---|---|---|---|
| **1** | **B1. RouteCoach** | **20/20** | **Đánh trúng nút thắt employability thật**: thời gian làm quen 3–4 tuần là lý do HR từ chối tuyển. Zero hardware → Feasibility tuyệt đối, prototype 3 ngày chắc chắn xong. AI là *trái tim*, không phải lớp sơn: chuyển không gian thành landmark phi thị giác (mùi, gió, vang âm, đổi sàn) là việc chưa AI nào làm và là insight khiến giám khảo phải ghi nhớ. Demo A/B bấm giờ trên sân khấu là bằng chứng không thể phản bác. Điểm yếu duy nhất: "chỉ là app" — khắc phục bằng cách trình bày đầu ra dưới dạng **bản đồ xúc giác in 3D + mô hình không gian**, giữ chất architectural. |
| **2** | **B4. FeelCheck** | **19/20** | Câu chuyện Việt Nam mạnh nhất: QCVN 10:2014 tồn tại 11 năm, tactile paving TP.HCM bị tủ điện và xe máy chặn — **luật có, thực thi không**. Biến người khiếm thị thành **kiểm toán viên được trả lương** → vừa giải bài tiếp cận vừa giải bài việc làm bằng một mũi tên. Có mô hình doanh thu rõ ràng (ESG chữ S). AI đa phương thức sâu. Đầu ra là quyết định kiến trúc thật. Tư liệu quay video có sẵn ngoài đường. |
| **3** | **A2. ClearPath** | **19/20** | Đánh đúng khoảng trống số 1: **vật cản động** — thứ mọi giải pháp hiện có đều bỏ qua. Lập luận bền vững mạnh nhất: **không sản xuất thêm gì**, dùng lại camera đã có. Demo sân khấu ấn tượng nhất (đặt cái ghế → 2 giây sau loa cảnh báo tiếng Việt). Có **vòng lặp sửa nguyên nhân** (bắt tạp vụ dọn) chứ không chỉ né hậu quả — đây là tư duy hệ thống mà giám khảo đánh giá cao. Phải chuẩn bị kỹ câu trả lời về quyền riêng tư. |
| **4** | **B6. DeskPulse** | **18/20** | Giải một **mâu thuẫn ai cũng thấy mà chưa ai giải**: hot-desking vs nhu cầu ổn định không gian. Lời giải "cụm neo bất biến" là tư duy kiến trúc thuần tuý, rất thanh lịch, rất dễ vẽ trên slide. AI là bài toán tối ưu thật có ràng buộc. Cân bằng lợi ích công ty (hiệu suất mặt bằng) và người dùng → dễ bán. Demo one-take rất đẹp. |
| **5** | **A1. SoundMark** | **18/20** | Ý tưởng **kiến trúc nhất** trong danh sách — nó thay đổi *bản thân không gian*, không chỉ thêm thiết bị. Insight đảo ngược cực sắc: *văn phòng càng "sang", càng tiêu âm, càng xoá bản đồ của người mù* — câu này một mình đã đáng giá một slide. Tạo tri thức lưu trong đầu người dùng (không gây phụ thuộc thiết bị). Video có lớp âm thanh riêng biệt, nghe bằng tai nghe rất ám ảnh. Rẻ, retrofit, không phá dỡ. |

### Khuyến nghị chiến lược đóng gói (quan trọng)

**Đừng pitch một ý tưởng đơn lẻ.** Ba lý do: (1) hướng kiến trúc/công nghiệp dễ bị chê "AI mỏng"; (2) một điểm chạm không đủ kể câu chuyện employability trọn vẹn; (3) giám khảo nhớ *hệ thống*, không nhớ *tính năng*.

**Gợi ý gói thắng cuộc — "Ngày làm việc đầu tiên"**, kể theo dòng thời gian một ngày:

- **07:30 — Ra khỏi nhà:** DropPoint (C5) → đi làm được.
- **08:15 — Vào toà nhà lạ:** RouteCoach (B1) đã dạy tuyến từ hôm qua + TagPath (C1) dán sẵn + LiftEar (C2) trong thang máy → **tự đi tới bàn trong ngày đầu tiên, không cần ai dẫn.**
- **09:00 — Tìm bàn:** DeskPulse (B6).
- **Cả ngày — Di chuyển trong văn phòng:** ClearPath (A2) cảnh báo vật cản + SoundMark (A1) làm bản đồ nền.
- **14:00 — Họp:** Aura Room (A3).
- **Bất cứ lúc nào — Khẩn cấp:** EvacTwin (A5).
- **Nền tảng:** FeelCheck (B4) kiểm toán + TactileKit (C6) lắp đặt → **mô hình kinh doanh và con đường nhân rộng.**

**Lõi pitch nên là B1 + A2 + B4** (AI mạnh, khả thi, câu chuyện VN sắc), **thân xác vật lý là A6 TouchLine + C6 TactileKit** (để giám khảo sờ được, giữ đúng chất architectural/industrial), và **gia vị gây nhớ là B2 ScentMap** (mang 3 lọ tinh dầu lên sân khấu cho giám khảo ngửi — 30 giây đó sẽ là thứ họ kể lại cho nhau sau cuộc thi).

**Câu chốt cho pitch deck:** *"Việt Nam không thiếu quy chuẩn. QCVN 10 đã có từ 2015. Chúng tôi lát gạch dẫn đường rồi đặt tủ điện lên trên. Vấn đề không phải xây thêm — mà là làm cho những gì đã xây thật sự hoạt động. Đó là việc của AI."*

---

## Nguồn tham khảo

- [The Most Common Workplace Barriers for Blind Employees — Be My Eyes](https://www.bemyeyes.com/business/blog/most-common-workplace-barriers-for-blind-employees/)
- [Employer's Guide to Accommodations for Blind and Low Vision Employees — APH ConnectCenter](https://aphconnectcenter.org/careerconnect/employers/employers-guide-to-accommodations-for-blind-and-low-vision-employees/)
- [Tactile paving of little help on obstructed pavements in Ho Chi Minh City — Tuổi Trẻ News](https://news.tuoitre.vn/tactile-paving-of-little-help-on-obstructed-pavements-in-ho-chi-minh-city-10349989.htm)
- [QCVN 10:2014/BXD — Xây dựng công trình đảm bảo người khuyết tật tiếp cận sử dụng](https://thuvienphapluat.vn/TCVN/Xay-dung/QCVN-10-2014-BXD-Xay-dung-cong-trinh-dam-bao-nguoi-khuyet-tat-tiep-can-su-dung-912606.aspx)
- [ISO 21542 — Accessibility and usability of the built environment](https://certbetter.com/blog/iso-21542-a-comprehensive-guide-to-accessibility-and-usability-of-the-built-environment)
- [What Is Universal Design? The 7 Principles Explained](https://scienceinsights.org/what-is-universal-design-the-7-principles-explained/)
- [Line 1, Ho Chi Minh City Metro — Wikipedia](https://en.wikipedia.org/wiki/Line_1,_Ho_Chi_Minh_City_Metro)
- [Gần 1.000 lao động khiếm thị có việc làm từ nghề tẩm quất — Báo Hải Phòng](https://baohaiphong.vn/gan-1-000-lao-dong-khiem-thi-co-viec-lam-tu-nghe-tam-quat-548173.html)
- [Người khuyết tật khó tiếp cận việc làm, vì đâu? — VOV](https://vov.gov.vn/nguoi-khuyet-tat-kho-tiep-can-viec-lam-vi-dau-dtnew-344938)
- [BLE Beacon vs UWB: Accuracy, Cost — Ariadne](https://www.ariadne.inc/resources/blogs/ble-beacon-vs-uwb/)
- [Evaluating the efficacy of UNav (so sánh GoodMaps, NaviLens, NavCog) — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11822047/)
- [NaviLens — Accessible QR code](https://www.navilens.com/en/accessible-qr-code)
- [An App That Helps Riders With Vision Loss Navigate Complex Transit Systems — Next City](https://nextcity.org/urbanist-news/an-app-that-helps-riders-with-vision-loss-navigate-complex-transit-systems)
- [Detect doors, people, and furniture using Magnifier on iPhone — Apple Support](https://support.apple.com/guide/iphone/detect-doors-around-you-iph35c335575/ios)
- [Be My Eyes and Meta Launch New Accessibility Functions on Ray-Ban Meta glasses](https://www.bemyeyes.com/news/be-my-eyes-and-meta-launch-new-accessibility-functions/)
- [Efficacy of electronic travel aids for the blind and visually impaired during wayfinding — Scientific Reports](https://www.nature.com/articles/s41598-026-37578-9)
- [Haptics-based sensory substitution: Virtual Whiskers (2025)](https://www.tandfonline.com/doi/full/10.1080/17483107.2025.2458112)
- [Floorplan2Guide: LLM-Guided Floorplan Parsing for BLV Indoor Navigation — arXiv](https://arxiv.org/pdf/2512.12177)
- [All the Way There and Back: Phone-in-Pocket Indoor Wayfinding for Blind Travelers — arXiv](https://arxiv.org/pdf/2401.08021)
- [Microsoft Soundscape — TechCrunch](https://techcrunch.com/2018/03/01/microsoft-soundscape-helps-the-visually-impaired-navigate-cities/)
- [Hazelwood School: A Building You Read with Your Hands — Studio Matrx](https://www.studiomatrx.org/guides/hazelwood-school-for-the-sensory-impaired)
- [Manufacturing Opportunities for the Blind — AMT](https://www.amtonline.org/article/manufacturing-opportunities-for-the-blind)
- [The impact of new assistive technologies on specific occupational risks for blind people — MATEC](https://doi.org/10.1051/matecconf/202030500079)
- [VizLens and HALOS: Making Touchscreen Appliances More Blind Friendly — AFB AccessWorld](https://afb.org/aw/18/1/15282)
- [Man versus Machine: A Review of Multifunctional Desktop Copiers — AFB AccessWorld](https://www.afb.org/aw/7/3/14496)
- [PEEP for Blind and Partially Sighted People — Visualise](https://visualisetrainingandconsultancy.com/resources/peep/)
- [Orientation and Mobility for Working-Age Adults — Western Michigan University](https://wmich.edu/visionstudies/academics/orientation)
- [Co-designing a 3D-Printed Tactile Campus Map With Blind and Low Vision Students — NSF](https://par.nsf.gov/servlets/purl/10590864)
- [Vietnam for travelers with disabilities: accessibility on the ground](https://www.vietnamtourism.com/en/vietnam-for-travelers-with-disabilities-accessibility-on-the-ground)
agentId: a6894bfa4a0c84413 (use SendMessage with to: 'a6894bfa4a0c84413', summary: '<5-10 word recap>' to continue this agent)
<usage>subagent_tokens: 150923
tool_uses: 27
duration_ms: 813871</usage>