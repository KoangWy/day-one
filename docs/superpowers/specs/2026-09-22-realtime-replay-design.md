# Thiết kế: Replay realtime — gửi ảnh liên tục, câu mẫu và Edge-TTS

**Ngày:** 22/09/2026 · **Branch:** `feat/realtime-replay` (tách từ `main` @ `3886202`)
**Trạng thái:** Thiết kế đã duyệt qua brainstorming, chưa có kế hoạch triển khai
**Thay thế:** luồng replay "bấm Check → chụp → hỏi Yes/No" hiện tại. `main` giữ nguyên luồng cũ và tuyến `lift-lobby-to-toilet-v1` cho bài nộp 7:00 23/09.

---

## 1. Mục tiêu và phạm vi

### 1.1. Vì sao đổi

- Câu hỏi xác nhận kiểu *"Are you beside the glass frontage…?"* bắt người mù kiểm chứng thứ chỉ camera thấy. Họ sẽ bấm Yes cho qua, nên bước Yes không chặn được nhận diện nhầm.
- Người dùng phải tự dừng và bấm Check ở từng checkpoint. App không hỗ trợ gì trong lúc đi.
- Nhóm muốn có nền để sau này thêm cảnh báo vật cản.

### 1.2. Các quyết định đã chốt

| Câu hỏi | Quyết định |
|---|---|
| Làm ở đâu | Branch riêng, thay hẳn luồng cũ trên branch này |
| App nói gì khi đang đi | Tự nhận mốc + **câu mẫu**. AI chỉ trả dữ liệu có cấu trúc, không tự viết câu |
| Khi tới checkpoint | Báo tới, **chờ người dùng bấm hoặc nói Next**. Next nghĩa là "tôi sẵn sàng", không phải "tôi đã kiểm chứng" |
| Khi nào coi là lạc | Quá thời gian dự kiến của bước, hoặc người dùng tự hỏi "where am I" |
| Kiến trúc | Hướng A: client chạy vòng lặp HTTP, server không giữ trạng thái, Edge-TTS có cache |

### 1.3. Ngoài phạm vi

Phát hiện vật cản (spec chỉ chừa mức ưu tiên P0 và vòng chụp ở client), câu do AI tự viết, giọng tiếng Việt, chọn nhiều tuyến, rung (iOS Safari không hỗ trợ `navigator.vibrate`), WebSocket, bật lại làm mờ khuôn mặt.

### 1.4. Ràng buộc đã biết

- DeepSeek V4.1 Flash qua OpenCode Go đo được **p50 ≈ 3,03 s mỗi ảnh** (`docs/PROTOTYPE_VERIFICATION.md` §1c). Thông lượng thực tế khoảng 1 kết quả mỗi 1,5–3 s khi có 2 request chạy song song.
- Vì vậy cảnh báo vật cản **không thể** chạy qua VLM trên cloud. Nó cần mô hình chạy trên máy (<300 ms). Nền cho tính năng đó là vòng chụp ở client và hàng đợi âm thanh có mức cắt ngang, không phải vòng gọi server.
- Edge-TTS cần internet và không phải API chính thức của Microsoft.

---

## 2. Kiến trúc

```
iPhone (PWA)                                        Laptop (FastAPI)
┌───────────────────────────────┐                 ┌──────────────────────────────────┐
│ frameLoop ── JPEG ≤640 ───────┼─ POST /observe ─▶ provider.observe (1 lần gọi VLM)  │
│   ▲  ≤2 request, cách ≥1 s    │◀─ {step_index, target, position, distance}          │
│   │                           │                 │  phân loại bằng Evidence.supports │
│ machine (hàm thuần)           │                 │                                  │
│   │  trạng thái + key câu nói │                 │                                  │
│ voice (hàng đợi P0/P1/P2) ────┼─ GET /speech/{route}/{key}.mp3 ─▶ file publish      │
│                               │                 │   hoặc Edge-TTS → tts-cache      │
└───────────────────────────────┘                 └──────────────────────────────────┘
```

### 2.1. Các đơn vị phía client (`apps/web/src/`)

| File | Trách nhiệm | Phụ thuộc |
|---|---|---|
| `frameLoop.ts` (mới) | Chụp khung hình từ `<video>`, gửi `/observe`, trả kết quả kèm `step_index` và `generation` lúc gửi. Tối đa 2 request cùng lúc, hai lần gửi cách nhau ≥1 s, giãn thời gian khi lỗi. `start(index)`, `pause()`, `stop()` (huỷ mọi request). Tách phần chụp khỏi phần gửi qua một hàm `consume(frame)`; hiện chỉ có consumer gửi `/observe`, sau này thêm consumer phát hiện vật cản trên máy. | `capture.ts`, `api.ts` |
| `machine.ts` (viết lại) | Hàm thuần `transition(state, event, route) → { state, say: {key, priority}[] }`. Không đụng DOM, không đụng thời gian thực. | không |
| `hints.ts` (mới) | Chọn key câu gợi ý từ kết quả nhận diện và áp giới hạn tần suất. Được `machine.ts` gọi. | không |
| `voice.ts` (mới) | Một thẻ `<audio>` và hàng đợi ưu tiên. Khi tắt App voice thì đẩy chữ vào vùng `aria-live`. Phát sự kiện `AUDIO_DONE`. | `api.ts` |
| `App.tsx` | Chỉ còn giao diện và phần nối các module. Gửi `TICK` mỗi 1 s. | tất cả |
| `capture.ts`, `speech.ts` | Giữ nguyên. | |
| `api.ts`, `types.ts`, `metrics.ts` | Cập nhật theo API và sự kiện mới. | |

### 2.2. Các đơn vị phía server (`apps/server/navigation/`)

| File | Thay đổi |
|---|---|
| `models.py` | Thêm `Observation`, `ObserveResponse`. `Checkpoint` và `OriginCheckpoint` thêm `short_name`, `expected_seconds`, bỏ `question`. `Assets` v2. |
| `provider.py` | Thêm `observe(jpeg, checkpoint) → Observation`, thay cho `match`. |
| `phrases.py` (mới) | `build_phrases(route, review) → dict[key, text]`. Là nguồn duy nhất của mọi câu nói. |
| `prepare.py` | Tạo `phrases` và sinh MP3 cho mọi key. |
| `speech.py` (mới) | Tìm file audio theo key, tạo mới bằng Edge-TTS khi thiếu, cache và khoá theo key. |
| `main.py` | `POST /observe`, `GET /speech/…`. Bỏ `/replay` và `/audio/…`. Giới hạn tải bằng semaphore. |
| `teach.py` | Khung `review.json` có `short_name: ""` và `expected_seconds: 0`, nên publish từ chối cho tới khi người duyệt điền. |
| `evaluate.py` | Chuyển sang `observe`. Báo riêng false positive, tỷ lệ `candidate`, độ trễ p50/p95. |

---

## 3. API

### 3.1. `POST /observe`

Request giữ nguyên hợp đồng của `/replay`, kể cả validator JPEG (cạnh dài ≤640 px, cạnh ngắn ≥16 px, base64 ≤800 000 ký tự):

```json
{ "route_id": "lift-lobby-to-toilet-v2", "step_index": 0, "image_jpeg_640": "<base64>" }
```

Response:

```json
{ "step_index": 0, "target": "candidate", "position": "left", "distance": "far" }
```

- `target`: `"matched" | "candidate" | "none"`. Cách phân loại ở mục 4.2.
- `position`: `"left" | "ahead" | "right" | null`. `distance`: `"near" | "far" | null`. Cả hai luôn là `null` khi `target = "none"`.
- `step_index = -1` là điểm xuất phát.
- Lỗi: 404 khi không có tuyến; 422 khi payload sai hoặc `step_index` ngoài phạm vi; 503 `"Visual check unavailable"` khi hết thời gian (10 s) hoặc provider lỗi; 503 `"Visual check busy"` khi đã có 4 request `/observe` đang chạy trên server.

### 3.2. `GET /speech/{route_id}/{key}.mp3`

- `route_id` khớp mẫu identifier hiện có. `key` khớp `^[a-z0-9-]{1,64}$` **và** phải có trong `assets.phrases` của tuyến đã publish. Không có thì trả 404. Endpoint không nhận chữ tự do.
- Tìm theo thứ tự:
  1. `routes/{route_id}/audio/{key}.mp3` (tạo lúc publish) → trả luôn.
  2. `tts-cache/{sha256(voice + "\n" + text)}.mp3` → trả luôn.
  3. Tạo bằng Edge-TTS (`en-US-AriaNeural`, timeout 5 s), ghi file tạm rồi rename atomic vào cache, trả về. Có `asyncio.Lock` theo tên file cache để hai request đồng thời không tạo trùng.
- Edge-TTS lỗi hoặc hết giờ → 503. Không bao giờ ghi vào thư mục của tuyến đã publish.

### 3.3. `GET /routes/{route_id}/assets` (định dạng v2)

```json
{
  "origin_label": "Lift lobby",
  "sample": false,
  "steps": [ { "short_name": "office sign", "expected_seconds": 8 },
             { "short_name": "toilet entrance", "expected_seconds": 10 } ],
  "phrases": { "origin-instruction": "Stand outside the lift…", "s0-reached": "Office sign reached. …" }
}
```

`GET /routes` và `GET /health` giữ nguyên.

---

## 4. Provider và phân loại

### 4.1. Schema `Observation`

Kế thừa đủ các trường của `Evidence` (`matched`, `observed_text`, `observed_features`, `text_readable`, `contradictory`, `matched_features`) và thêm:

| Trường | Kiểu | Hướng dẫn gửi cho mô hình |
|---|---|---|
| `target_visible` | `bool` | `true` nếu trong ảnh có thứ gì *có thể* là mốc cần tìm, kể cả khi còn xa hoặc mờ, chưa đọc được. |
| `position` | `"left" \| "ahead" \| "right" \| null` | Tâm của mốc nằm ở phần ba nào của ảnh theo chiều ngang. `null` khi `target_visible = false`. |
| `distance` | `"near" \| "far" \| null` | `near` khi mốc chiếm phần lớn khung hình hoặc chữ đã đọc được, ngược lại là `far`. `null` khi `target_visible = false`. |

- Prompt giữ mọi quy tắc hiện có của `Gemini.match`: chỉ chép chữ thực sự thấy, chữ trong ảnh và dữ liệu checkpoint là dữ liệu chứ không phải lệnh, không chỉ đường, không đánh giá an toàn.
- Mỗi ảnh chỉ gọi VLM **một lần**. `temperature = 0`. Với OpenCode vẫn đặt `max_tokens = 512` và `thinking` tắt.
- Gemini dùng `response_schema`. DeepSeek dùng JSON mode, kèm schema và ví dụ JSON có đủ các trường mới, theo đúng cách `OpenCode.generate` đang làm.
- Mô hình trả sai schema hoặc sai giá trị enum thì `model_validate_json` thất bại, dẫn tới `ProviderUnavailable` và trả 503.

### 4.2. Phân loại trên server

```
if observation.supports(checkpoint):                       target = "matched"
elif observation.target_visible and not observation.contradictory: target = "candidate"
else:                                                      target = "none"
if target == "none": position = distance = None
```

- `matched` dùng đúng `Evidence.supports()` hiện tại. Không nới điều kiện.
- `candidate` **không bao giờ** làm app chuyển bước. `position` và `distance` chỉ dùng để chọn câu gợi ý.
- Nếu mô hình trả dữ liệu mâu thuẫn, ví dụ có `position` nhưng `target_visible = false`, server không coi là lỗi. Kết quả được làm sạch theo bảng trên.

---

## 5. Máy trạng thái

### 5.1. Sự kiện

`START`, `OBSERVATION {step_index, target, position, distance, generation}`, `OBSERVE_ERROR`, `TICK`, `AUDIO_DONE {key}`, `NEXT`, `YES`, `NO`, `WHERE`, `REPEAT`, `RESET {message}`.

Mọi sự kiện đều mang `at` (mili giây), do `App.tsx` gắn vào lúc gửi. Nhờ vậy `machine.ts` vẫn là hàm thuần và test được bằng thời gian giả.

### 5.2. Trạng thái

| Trạng thái | Vòng chụp | Câu nói khi vào (mức P1) | Chuyển tiếp |
|---|---|---|---|
| `idle` | tắt | — | `START` → `origin` |
| `origin` | chạy, `step_index = -1` | `origin-instruction` | 2 trong 3 kết quả gần nhất là `matched` → `atOrigin` |
| `atOrigin` | tạm dừng | `origin-found` | `NEXT` → `walking(0)` |
| `walking(i)` | chạy, bước `i` | `s{i}-instruction` | 2/3 `matched` → `reached(i)`, hoặc `arrived` nếu `i` là bước cuối · hết giờ → `lost(i)` · `NEXT` khi `visionDown` → `override(i)` |
| `reached(i)` | tạm dừng | `s{i}-reached` | `NEXT` → `walking(i+1)` |
| `lost(i)` | chạy | `s{i}-lost` (một lần) | 2/3 `matched` → như `walking` · `NEXT` → `override(i)` |
| `override(i)` | tạm dừng | `s{i}-override` | `YES` → `walking(i+1)`, hoặc `arrived` không kiểm chứng nếu là bước cuối, ghi `manual_override` · `NO` → quay lại đúng trạng thái trước đó (`walking(i)` hoặc `lost(i)`), không nói lại câu khi vào, đồng hồ của bước chạy tiếp |
| `arrived` | tắt, camera tắt | `arrival`, hoặc `arrival-unverified` nếu bước cuối đi qua override | — |

### 5.3. Quy tắc

- **Cửa sổ nhận diện:** chỉ gồm tối đa 3 kết quả **thành công** gần nhất của bước hiện tại. Xoá khi đổi bước. Lỗi request không vào cửa sổ. Coi là đã tới khi cửa sổ có **ít nhất 2** kết quả `matched`, nên 2 kết quả đầu tiên đều khớp là đủ.
- **Kết quả cũ:** bỏ qua `OBSERVATION` nếu `step_index` khác bước đang quan sát, nếu trạng thái hiện tại không chạy vòng chụp, hoặc nếu `generation` khác với lúc gửi.
- **Đồng hồ của bước:** bắt đầu khi nhận `AUDIO_DONE` của `s{i}-instruction`. Nếu App voice tắt hoặc âm thanh lỗi, `voice.ts` phát `AUDIO_DONE` ngay. Ngân sách là `max(3 × expected_seconds, 30 s)`. Hết ngân sách mà chưa tới thì vào `lost(i)`.
- **Origin:** sau 30 s ở `origin` mà chưa tới thì nói `origin-retry` một lần và tiếp tục tìm. Ở origin **không có** override, kể cả khi `visionDown`.
- **`visionDown`:** là cờ, không phải trạng thái. Bật khi có 3 `OBSERVE_ERROR` liên tiếp; lúc đó nói `vision-down` (ở origin thì nói `vision-down-origin`). Tắt khi có một `OBSERVATION` thành công; lúc đó nói `vision-back`.
- **`WHERE`:** ở `walking` hoặc `lost` thì nói `s{i}-where`. Ở trạng thái khác thì giống `REPEAT`.
- **`REPEAT`:** phát lại câu P1 gần nhất. Không đổi trạng thái.
- **`RESET`:** gồm Stop, app bị ẩn, `pagehide`, mất track camera. Về `idle`, huỷ mọi request, xoá hàng đợi âm thanh. Giữ đúng các hành vi đang có trong `App.tsx`.
- Các sự kiện không hợp lệ ở trạng thái hiện tại không làm gì. Bấm đúp hay lệnh lặp lại không bao giờ làm chuyển bước hai lần.

### 5.4. Câu gợi ý (`hints.ts`)

- Chỉ xét khi trạng thái là `origin`, `walking` hoặc `lost`, khi `target` là `candidate` hoặc là `matched` nhưng chưa đủ 2/3, và khi cả `position` lẫn `distance` khác `null`.
- Nói khi đã qua ≥8 s kể từ câu gợi ý trước, **hoặc** khi `position` đổi so với câu gợi ý trước và đã qua ≥3 s.
- `target = "none"` thì im lặng.
- Câu gợi ý là mức P2. Hàng đợi sẽ bỏ nó nếu đang bận (mục 6.2).

### 5.5. Hằng số (chỉnh sau khi thử thật)

| Hằng số | Giá trị |
|---|---|
| Ngưỡng coi là đã tới | 2 `matched` trong 3 kết quả thành công gần nhất |
| Ngân sách mỗi bước | `max(3 × expected_seconds, 30 s)`, tính từ lúc đọc xong hướng dẫn |
| Nhắc lại ở origin | 30 s |
| Khoảng cách giữa hai câu gợi ý | 8 s, hoặc 3 s nếu vị trí đổi |
| Vòng chụp | ≤2 request cùng lúc, cách nhau ≥1 s |
| Giãn thời gian khi `visionDown` | 3 s → 5 s → 10 s (tối đa). Trở về 1 s sau lần thành công đầu tiên |
| Ngưỡng `visionDown` | 3 lỗi liên tiếp |
| Timeout client cho `/observe` | 12 s (server 10 s) |

---

## 6. Câu nói và âm thanh

### 6.1. Câu mẫu (`phrases.py`)

Ký hiệu: `{short}` là `short_name` của checkpoint đang tìm, `{Short}` là cùng chữ đó viết hoa chữ đầu. `{prev}` là nơi vừa đi qua: `origin_label` với bước 0, `short_name` của checkpoint `i-1` với các bước sau.

| Key | Nội dung |
|---|---|
| `origin-instruction` | `review.origin_instruction` |
| `origin-found` | `"{origin_label} found. Tap Next or say next for the first direction."` |
| `origin-retry` | `review.origin_retry` |
| `s{i}-instruction` | `step.instruction`, cộng thêm `' Guide said: "{voice_cue}".'` nếu có (giống `prepare.py` hiện tại) |
| `s{i}-reached` | `"{Short} reached. Tap Next or say next when ready."`. Không tạo cho bước cuối |
| `s{i}-lost` | `"I haven't found the {short} yet. Stop and turn slowly. Last passed: {prev}."` |
| `s{i}-where` | `"Last passed: {prev}. Heading to: {short}."` |
| `s{i}-override` | `"Continue using saved directions without the camera finding the {short}?"` |
| `arrival` | `review.arrival` |
| `arrival-unverified` | `"Saved route finished. The camera did not confirm the destination. Camera stopped."` |
| `vision-down` | `"Camera check is unavailable. Stop, or say next to continue with saved directions."` |
| `vision-down-origin` | `"Camera check is unavailable. Check the connection, or stop the route."` |
| `vision-back` | `"Camera check is back."` |

Câu gợi ý: `{p}-hint-{kind}-{position}-{distance}`, trong đó `{p}` là `origin` hoặc `s{i}`, `kind ∈ {candidate, matched}`, `position ∈ {left, ahead, right}`, `distance ∈ {far, near}`. Mỗi `{p}` có 12 câu. Với origin, `{Short}` lấy từ `short_name` của origin (tên của mốc, ví dụ "floor number 3").

| | `far` | `near` |
|---|---|---|
| `candidate` | `"Possible {short}, {far_pos}."` | `"Possible {short} close, {near_pos}."` |
| `matched` | `"{Short}, {far_pos}."` | `"{Short} close, {near_pos}."` |

- `far_pos`: `left` → "ahead, slightly left"; `ahead` → "straight ahead"; `right` → "ahead, slightly right".
- `near_pos`: `left` → "slightly left"; `ahead` → "straight ahead"; `right` → "slightly right".
- Câu chỉ nói mốc nằm ở đâu **trong khung hình camera**. Không bao giờ ra lệnh rẽ.

Tuyến 2 bước có 53 key: origin 15, bước 0 là 17, bước 1 là 16, câu chung 5.

### 6.2. Hàng đợi ưu tiên (`voice.ts`)

| Mức | Nguồn | Hành vi |
|---|---|---|
| P0 | Chừa cho cảnh báo vật cản. Chưa có nguồn nào | Dừng câu đang phát và phát ngay. Hàng đợi P1 được giữ và phát tiếp sau. |
| P1 | Mọi câu trong mục 6.1 trừ câu gợi ý | Xếp hàng FIFO, không bị bỏ. Nếu đang phát P2 thì dừng P2. |
| P2 | Câu gợi ý | Bỏ nếu đang phát câu khác, hàng đợi không rỗng, hoặc mic đang nghe. Không xếp hàng. |

- Dùng một thẻ `<audio>` được mở khoá bằng âm câm khi bấm Start (giữ cách làm hiện tại). Mở mic bằng push-to-talk thì dừng âm thanh, như hiện nay.
- `REPEAT` phát lại câu P1 gần nhất. `RESET` xoá sạch hàng đợi.
- **App voice tắt:** câu P1 đưa vào vùng `aria-live="polite"` chính. Câu gợi ý đưa vào một vùng `aria-live` riêng, cùng giới hạn tần suất. `AUDIO_DONE` phát ngay.
- **Âm thanh lỗi hoặc bị chặn:** hiện nút "Play instruction" (giữ nguyên), chữ vẫn hiện, và phát `AUDIO_DONE` để đồng hồ của bước vẫn chạy.

---

## 7. Điều khiển và trợ năng

- Nút **Next** rộng hết màn hình, cao ít nhất 88 px. Chỉ hiện ở `atOrigin`, `reached`, `lost`, hoặc ở `walking` khi đang `visionDown`.
- Khi vào `atOrigin`, `reached`, `lost` hoặc `override`, app chuyển focus vào nút chính (Next, hoặc Yes ở `override`). Với VoiceOver, người dùng chạm đúp ở bất kỳ đâu là kích hoạt được.
- Luôn có: Where am I, Repeat, Stop. Bỏ nút "Check checkpoint" và "Check starting point".
- Lệnh giọng nói giữ kiểu push-to-talk (`lang = en-US`). Các lệnh: `next`, `yes`, `no`, `repeat`, `where` (nhận cả "where am I"), `stop`. Ô gõ lệnh giữ nguyên.
- Giao diện hiện chữ của câu P1 gần nhất và tiến độ tuyến. Chạy axe ở mọi trạng thái.
- Giữ dòng *"Wayfinding aid, not a safety device."* Không nói app phát hiện vật cản.

---

## 8. Dữ liệu tuyến v2

### 8.1. Model

- `OriginCheckpoint`: `description`, `required_text`, `required_features`, `short_name` (1–40 ký tự). Kiểm tra "cần chữ hoặc feature" giữ như `Checkpoint` hiện tại.
- `Checkpoint`: như trên, thêm `expected_seconds` (số nguyên 1–600). Bỏ `question`.
- `Review` giữ nguyên các trường khác (`origin_label`, `origin_instruction`, `origin_retry`, `arrival`, `destination_is_exterior`, `sample`).
- `Assets` đổi theo mục 3.3. `Published` giữ nguyên cấu trúc cấp cao nhất.

### 8.2. Tuyến `lift-lobby-to-toilet-v2`

Lấy từ `data/examples/lift-lobby-to-toilet-v1/`, giữ nguyên mọi hướng dẫn và bằng chứng đã duyệt, chỉ thêm các trường mới:

| Checkpoint | `short_name` | `expected_seconds` | Cơ sở (`IMG_7546.MOV`) |
|---|---|---|---|
| Origin | `floor number 3` | — | Origin khoảng giây 12 |
| s0 | `office sign` | 8 | Biển văn phòng khoảng giây 20 |
| s1 | `toilet entrance` | 10 | Cửa toilet khoảng giây 25–32 |

- Bundle mới đặt ở `data/examples/lift-lobby-to-toilet-v2/` và publish bằng `navigation.prepare`.
- Trên branch này v2 thay v1 trong `data/runtime/routes/`, vì `extra="forbid"` làm `published.json` v1 không load được với model mới. `.gitignore` thay ngoại lệ v1 bằng `route.json`, `published.json` và thư mục `audio/` của v2 (53 MP3, khoảng 2 MB).
- `data/examples/office-to-toilet-sample/` được cập nhật theo schema v2 nếu có test dùng nó.

---

## 9. Xử lý lỗi

| Tình huống | Hành vi |
|---|---|
| Một `/observe` lỗi (mạng, 503, timeout) | `OBSERVE_ERROR`. Không vào cửa sổ nhận diện. |
| 3 lỗi liên tiếp, hoặc `navigator.onLine = false` | Bật `visionDown` và nói câu tương ứng. Vòng chụp giãn thời gian thử lại. Next mở `override` (trừ ở origin). Hiện banner mất kết nối như hiện tại. |
| Có kết quả thành công sau `visionDown` | Tắt cờ, nói `vision-back`, vòng chụp về nhịp thường. |
| `/speech` lỗi, hoặc Safari chặn autoplay | Chữ vẫn hiện, có nút "Play instruction", phát `AUDIO_DONE`. |
| Mất track camera, app bị ẩn, `pagehide` | `RESET` về `idle` và yêu cầu tìm lại origin, như hiện tại. |
| Kết quả về sau khi đã đổi bước hoặc reset | Bị bỏ (mục 5.3). |
| Không có camera hoặc không phải HTTPS | Giữ thông báo lỗi hiện tại của `start()`. |

---

## 10. Quyền riêng tư

- Thay khối "A photo only when you ask" bằng:
  > While a walk is active, the camera sends about one photo every 1–3 seconds to {provider} to find landmarks. Photos can include people nearby — use an agreed area. Photos are not saved by this app. The camera stops when you arrive, press Stop or leave the app.

  `{provider}` là `provider_label` lấy từ `GET /health`, giống cách làm hiện tại.
- Ô đồng ý đổi thành *"I agree to send photos continuously during the walk."*
- Vòng chụp tạm dừng ở `atOrigin`, `reached`, `override`. Tắt ở `idle` và `arrived`.
- Nhãn video: *"Rear camera; photos sent every few seconds during the walk"*.
- Server không log ảnh. Handler 422 không lặp lại payload. Cả hai giữ như hiện tại.
- **Rủi ro đã chấp nhận:** làm mờ khuôn mặt đã bị bỏ ngày 22/09 vì nó che mất biển văn phòng. Gửi ảnh liên tục làm tăng lượng ảnh người đi ngang lên cloud. Spec này không bật lại làm mờ.

---

## 11. Metrics

Không có ảnh hay âm thanh. Tải về dưới dạng JSON `kind: "offixed-replay-session", version: 2`.

- Sự kiện: `start`, `origin_found`, `reached`, `next`, `lost`, `where`, `manual_override`, `vision_down`, `vision_back`, `arrival`, `stop`. Mỗi sự kiện có `at`, `step`, `sample`.
- `step_summary` được ghi khi rời một bước: `frames_sent`, `errors`, `candidates`, `matches`, `time_to_reach_ms` (từ lúc đọc xong hướng dẫn tới `reached`), `hints_spoken`, `latency_p50_ms`.
- Cập nhật `scripts/metrics.py` để đọc định dạng v2.

---

## 12. Kiểm thử và tiêu chí nghiệm thu

### 12.1. Unit (vitest)

- `machine`: 2/3 ở origin và checkpoint; một `matched` lẻ không làm chuyển bước; `candidate` không bao giờ làm chuyển bước; bỏ kết quả của bước cũ và của `generation` cũ; đồng hồ bắt đầu từ `AUDIO_DONE`; ngân sách `max(3×, 30 s)`; `lost` → tìm thấy → `reached`; override Yes/No; bước cuối vào `arrived`; bước cuối qua override thì `arrival-unverified`; không có override ở origin; `visionDown` bật và tắt; `WHERE`/`REPEAT` không đổi trạng thái; `NEXT` lặp lại không chuyển bước hai lần.
- `hints`: giới hạn 8 s; đổi vị trí sau 3 s thì được nói; `none` im lặng; `position` null thì không nói.
- `voice`: P0 cắt ngang và giữ hàng đợi P1; P1 không bị bỏ và dừng P2; P2 bị bỏ khi bận hoặc mic đang nghe; App voice tắt thì đi vào `aria-live`; lỗi âm thanh vẫn phát `AUDIO_DONE`.
- `frameLoop` (fake timers): tối đa 2 request; cách nhau ≥1 s; `pause`, `start`, `stop` huỷ request; giãn thời gian khi lỗi rồi trở lại bình thường.

### 12.2. Backend (pytest)

- Phân loại `/observe`: `matched` chỉ khi `supports()`; `candidate`; `none`; `contradictory` thì `none`; làm sạch `position`/`distance`.
- Semaphore: request thứ 5 chạy đồng thời nhận 503 `busy`.
- `/speech`: key lạ → 404; key kiểu path traversal → 404; file publish được trả; thiếu file thì TTS giả được gọi **đúng một lần** khi có 2 request đồng thời và kết quả nằm trong cache; TTS lỗi → 503; không ghi vào thư mục tuyến.
- `prepare`: thiếu `short_name` hoặc `expected_seconds` thì từ chối; `phrases` có đủ 53 key cho tuyến 2 bước; mỗi key có một MP3.
- `provider`: JSON mode của OpenCode có đủ trường mới trong schema và ví dụ; enum sai → `ProviderUnavailable`.
- Test UTF-8 và các test bảo mật hiện có (cross-origin, giới hạn kích thước, `/ingest-video` chỉ cho localhost) vẫn đạt.

### 12.3. E2E (Playwright, mock `/observe` và `/speech`)

- Đi trọn tuyến: origin → Next → câu gợi ý → `reached` → Next → `arrived`, camera tắt. Chạy axe ở mọi trạng thái.
- Báo lạc bằng `page.clock`, rồi override Yes, được ghi là `manual_override`.
- `visionDown` sau 3 lỗi, rồi hồi phục.
- Bấm Stop khi request đang chạy thì kết quả về muộn bị bỏ. App xuống nền hoặc reload thì phải tìm lại origin.
- Không có request `/observe` nào trong lúc chờ Next.
- `npm run test:real` chạy với tuyến v2 và `/speech` thật (TTS từ file publish), chỉ mock `/observe`.

### 12.4. Thử thật (bắt buộc trước khi báo là xong)

iPhone Safari + VoiceOver trên tuyến lift lobby → toilet, provider DeepSeek. Đạt khi:

1. Tới cả 2 checkpoint mà không cần override.
2. Không có lần báo "reached" nào sai.
3. Báo "reached" trong ≤6 s kể từ khi mốc hiện rõ trong khung hình (đo từ video quay màn hình và metrics).
4. Có file metrics v2 của lượt đi, kèm ghi chú mọi override nếu có.

Thêm một lượt `evaluate.py` trên frame thật: ít nhất 3 ảnh mới cho mỗi mốc và 10 ảnh âm tính; báo riêng false positive, tỷ lệ `candidate` và độ trễ.

---

## 13. Rủi ro còn lại

| Rủi ro | Giảm thiểu |
|---|---|
| Báo tới trễ 3–6 s, người dùng có thể đi quá mốc | Câu gợi ý "close" khi `near`. Chỉnh ngưỡng và nhịp chụp sau khi thử thật. |
| `position` do VLM đoán có thể sai | Câu luôn có "Possible" cho `candidate`, chỉ nói vị trí trong khung hình, không ra lệnh rẽ, không làm chuyển bước. |
| Chi phí quota: khoảng 20–40 request mỗi phút khi đang đi | Vòng chụp tạm dừng khi chờ; semaphore 4 trên server; một lượt đi 1–2 phút chỉ tốn vài chục request. |
| Pin và nhiệt khi mã hoá JPEG mỗi giây | Theo dõi trong lượt thử thật; có thể giãn nhịp chụp. |
| Edge-TTS không phải API chính thức | Mọi câu được tạo sẵn lúc publish; khi đi đường chỉ gọi Edge-TTS nếu cache thiếu. |
| Khác biệt với đối thủ tự chuyển bước khi khớp | App chờ Next, và nói rõ Next nghĩa là sẵn sàng, không phải đã kiểm chứng. |
| Người đi ngang bị gửi ảnh lên cloud | Nêu trong thông báo đồng ý; dùng khu vực đã thống nhất. |

---

## 14. Tài liệu cần cập nhật trên branch

`README.md`, `docs/PROTOTYPE_RUNBOOK.md` (mục Replay và Teach), `docs/DEMO_HANDOFF.md` (tuyến v2 và các file đi kèm repo), `.env.example` nếu có biến mới. Không sửa tài liệu về bài nộp hay deck trên `main`.
