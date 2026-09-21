# Ý tưởng: Dẫn đường cho người khiếm thị từ sảnh tới văn phòng

**Nhóm:** Offixed · **Cuộc thi:** ADC Hackathon 2026 (AI & Employability, nhóm khuyết tật: Visual Impairment)
**Ngày:** 21/09/2026 · **Trạng thái:** Ý tưởng đã chốt qua brainstorming, chưa chọn công nghệ triển khai
**Hướng giải pháp:** Technological (AI, tự động hóa)

---

## 1. Vấn đề

Người khiếm thị đi làm hằng ngày vẫn rất dễ lạc trong chính tòa nhà văn phòng của mình. Kể cả khi đã đi tuyến đó nhiều lần, họ vẫn có thể lạc:

- **Sảnh rộng, trống:** không có tường để men theo nên dễ đi lệch hướng.
- **Sảnh đông người:** phải vòng tránh người, và sau khi vòng tránh thì mất hướng tới thang máy.
- **Vật cản cố định:** cột, quầy, chậu cây, biển quảng cáo đặt giữa lối.
- **Tòa nhà văn phòng lớn:** đường từ sảnh tới văn phòng dài và nhiều bước (sảnh → thang máy → đúng tầng → hành lang → đúng cửa công ty).

Hiện họ phải hỏi người khác, chờ được dắt đi, hoặc tự học thuộc tuyến. Tất cả đều làm giảm sự độc lập ở nơi làm việc.

## 2. Giải pháp

Người khiếm thị **đeo điện thoại trước ngực**, camera hướng ra trước. **Camera nhìn thay họ và chỉ đường** bằng giọng nói tiếng Việt kèm rung, từ sảnh tới văn phòng.

Mô hình gồm hai vai:

1. **Công ty chuẩn bị bản đồ trước (một lần):** quay video tuyến từ cửa tòa nhà tới văn phòng. AI biến video thành *bản đồ tuyến*. Người của công ty xem lại và duyệt.
2. **Người khiếm thị dùng hằng ngày:** app so camera với bản đồ để biết mình đang ở đâu, phát hiện người và vật cản phía trước, rồi chỉ hướng đi tránh **mà vẫn giữ đúng hướng tới đích**.

**Lõi của ý tưởng là "đi tới đúng đích", còn tránh vật cản chỉ là phần phụ.** Các app mô tả hình ảnh (Seeing AI, Be My Eyes, Envision) cho biết *trước mặt có gì*. Hệ thống này cho biết *đi hướng nào để tới thang máy khi trước mặt có người và cột*.

**Gậy trắng vẫn là lớp an toàn chính.** App không thay gậy.

## 3. Cách hệ thống hoạt động

### 3.1. Bản đồ tuyến = chuỗi mốc theo thứ tự

Ví dụ: `Cửa vào → Quầy lễ tân → Cột lớn → Thang máy`

Mỗi mốc gồm:
- **Khung hình mẫu** cắt ra từ video quét.
- **Cách nhận ra mốc:** vật thể (quầy, cột, cửa thang máy) hoặc chữ trên biển ("Elevator", "Thang máy", "Lễ tân").
- **Hướng đi tiếp khi tới mốc,** ví dụ "tới quầy lễ tân thì rẽ phải".
- **Câu chỉ dẫn** do AI viết sẵn và người duyệt.

### 3.2. Khi đang đi, mỗi khung hình trải qua ba bước

1. **Nhận diện mốc để biết đang ở đâu:** so khung hình hiện tại với khung hình mẫu của mốc tiếp theo, kèm đọc chữ (OCR). Khi khớp thì chuyển sang đoạn tiếp theo của tuyến.
2. **Phát hiện vật cản:**
   - *Người* dùng mô hình nhận diện vật thể (ví dụ YOLO).
   - *Cột, tường, đồ vật* dùng AI ước lượng độ sâu (ví dụ Depth Anything). Thứ gì ở quá gần phía trước đều tính là vật cản, không cần biết nó là gì. Cách này cần thiết vì YOLO không có lớp "cột".
   - Chia khung hình thành 3 vùng **trái / giữa / phải**. Vùng không có vật cản gần là lối đi được.
3. **Ra chỉ dẫn:** lấy hướng tới mốc tiếp theo, chỉnh theo lối trống, rồi đọc thành câu ngắn và rung.

Ví dụ câu chỉ dẫn:
- "Đường trống, đi thẳng."
- "Có người phía trước, lệch sang phải."
- "Cột trước mặt, sang trái."
- "Dừng lại."
- "Tới quầy lễ tân, rẽ phải."
- "Thang máy ở trước mặt."

### 3.3. Khi bị lạc

- **Không nhận ra mốc nào trong một lúc:** app nói "Không nhận ra vị trí, hãy xoay chậm sang trái hoặc phải."
- **Nút "Tôi bị lạc":** app đọc lại mốc cuối cùng đã nhận ra (ví dụ "Bạn vừa qua quầy lễ tân") và gửi tin cho một đồng nghiệp đã đăng ký sẵn.

## 4. Phạm vi demo cho cuộc thi

**Tầm nhìn sản phẩm:** dẫn từ cửa tòa nhà tới tận văn phòng. **Demo** chỉ mô phỏng **một đoạn: từ cửa vào tới thang máy** của sảnh nơi thi.

### Video 1: "Quét bản đồ" (vai công ty)
- Quay một lượt từ cửa vào tới thang máy, lúc sảnh vắng, đi chậm, camera ngang ngực.
- AI xử lý video thành file bản đồ tuyến: các mốc, thứ tự, hướng rẽ, câu chỉ dẫn.
- Người xem lại và sửa bản đồ. Đây là khâu duyệt của con người.

### Video 2: "Người khiếm thị đi hằng ngày"
- Quay lại đúng tuyến đó, **có người đi qua**, và cố ý đi gần cột và đồ vật.
- Hệ thống đọc file bản đồ, xử lý từng khung hình (mục 3.2), rồi xuất chỉ dẫn bằng giọng nói kèm phụ đề.

### Màn hình cho giám khảo (chia đôi)

| Bên trái (to) | Bên phải (nhỏ) |
|---|---|
| Video 2 có khung bao quanh người và vật cản, mũi tên hướng đi, và phụ đề câu chỉ dẫn | Sơ đồ tuyến có chấm "bạn đang ở đây" nhảy theo mốc, kèm thanh tiến độ "Mốc 2/4" |

- Tiếng đọc chỉ dẫn bằng tiếng Việt, **phụ đề tiếng Anh** (vì bài nộp phải bằng tiếng Anh).
- Quay lại màn hình này để làm video nộp bài (dưới 5 phút, MP4/MOV, 16:9), hoặc chạy trực tiếp khi trình bày.

### Chuẩn bị khi quay
- Chọn tuyến có **3–5 mốc dễ nhận ra**, tốt nhất là mốc có chữ trên biển.
- Hai video quay trong **cùng điều kiện ánh sáng**.
- Video 2 phải có đủ ba tình huống: người đi qua, cột hoặc tường, và đồ vật trên lối đi.

## 5. Mở rộng lên toàn tuyến (chỉ trình bày trên slide)

Vẫn là chuỗi mốc, chỉ nối dài thêm:

`Sảnh → Thang máy → (áp kế điện thoại xác nhận đúng tầng) → Hành lang → Biển tên công ty ở cửa văn phòng`

Như vậy demo chính là một đoạn thật của hệ thống lớn, không phải một thứ làm riêng để trình diễn. Bản thật sẽ chạy trực tiếp trên điện thoại. Nếu cần định vị chính xác hơn, bản thật có thể kết hợp camera + ARCore (VPS/VSLAM), cách mà GoodMaps và Clew đã chứng minh là làm được.

## 6. Điểm khác biệt so với sản phẩm hiện có

| | GoodMaps | Clew | Seeing AI / Be My Eyes | **Ý tưởng này** |
|---|---|---|---|---|
| Không cần đội chuyên nghiệp quét tòa nhà | ❌ (quét LiDAR) | ✅ | — | ✅ công ty tự quay bằng điện thoại |
| Chạy trên Android | ✅ | ❌ (chỉ iPhone) | ✅ | ✅ |
| Dẫn tới đích **và** tránh người/vật cản | một phần | ❌ | ❌ (chỉ mô tả) | ✅ |
| Tiếng Việt | ❌ | ❌ | một phần | ✅ |
| Gắn với việc làm: công ty chuẩn bị môi trường cho nhân viên | ❌ | ❌ | ❌ | ✅ |

**Gắn với chủ đề AI & Employability:** trách nhiệm chuẩn bị bản đồ thuộc về *công ty*, không phải người khiếm thị. Đây là cách "sửa môi trường làm việc chứ không sửa người khiếm thị", đồng thời gỡ lo ngại của HR rằng nhân viên khiếm thị cần nhiều tuần mới tự đi lại được.

## 7. Nguyên tắc và ranh giới khi pitch

- **Nói rõ đây là xử lý trên video đã quay**, bản thật chạy trực tiếp trên điện thoại. Giám khảo tin một bản mô phỏng trung thực hơn một bản giả như đã chạy thật.
- **Không hứa tự động hoàn toàn:** có người duyệt bản đồ, gậy trắng là lớp an toàn chính, và có nút "Tôi bị lạc" gọi người thật.
- **Không demo bằng cách bịt mắt tình nguyện viên.** Nghiên cứu của nhóm ghi rõ cách này phản tác dụng.
- **Giao diện phải tiếp cận được:** dùng được hoàn toàn bằng TalkBack/NVDA, nút to, có nhãn. Ghi "WCAG 2.2 AA" trên slide.
- **Chỉ dẫn ngắn, ưu tiên rung.** Người khiếm thị cần nghe được âm thanh xung quanh.

## 8. Rủi ro và cách giảm

| Rủi ro | Cách giảm |
|---|---|
| So khớp mốc nhận sai | Ít mốc (3–5), ưu tiên mốc có chữ, quay cùng điều kiện ánh sáng |
| Ước lượng độ sâu báo nhầm vật cản | Chỉ xét vùng trung tâm phía dưới khung hình, đặt ngưỡng "quá gần" thận trọng |
| Không kịp làm phần so khớp mốc | Lùi về bản mô phỏng: chấm di chuyển trên sơ đồ theo thời gian, vẫn giữ phần phát hiện người và vật cản |
| Bị hỏi "gậy trắng đã tránh vật cản rồi" | Lõi là giữ đúng hướng tới đích khi phải vòng tránh, không phải tránh vật cản |

## 9. Quyết định để sau

- **Công nghệ và giao diện triển khai** (web, Flutter, Kotlin, hay script Python xuất video). Sẽ chốt ở bước lập kế hoạch.
- Mô hình AI cụ thể cho từng khâu: nhận diện vật thể, độ sâu, OCR, so khớp mốc, và viết câu chỉ dẫn.
- Có phỏng vấn người khiếm thị đang đi làm không (qua Trung tâm Sao Mai hoặc Hội Người mù TP.HCM) để đưa giọng thật vào video.
