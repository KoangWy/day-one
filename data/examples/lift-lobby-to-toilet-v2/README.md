# Lift lobby → Toilet (v2, replay realtime)

Cùng tuyến 2 checkpoint với `lift-lobby-to-toilet-v1`. Mọi hướng dẫn và bằng chứng nhận diện (`description`, `required_text`, `required_features`) giữ nguyên bản người dùng đã duyệt ngày 21/09/2026. v2 chỉ thêm các trường mà schema realtime cần và bỏ câu hỏi Yes/No:

| Checkpoint | `short_name` | `expected_seconds` | Cơ sở (`IMG_7546.MOV`) |
|---|---|---|---|
| Origin | `floor number 3` | — | Origin khoảng giây 12 |
| s0 | `office sign` | 8 | Biển văn phòng khoảng giây 20 |
| s1 | `toilet entrance` | 10 | Cửa toilet khoảng giây 25–32 |

`short_name` được ghép vào câu mẫu (ví dụ "Office sign reached."). `expected_seconds` đặt ngân sách thời gian của bước: `max(3 × expected_seconds, 30 s)`, tính từ lúc đọc xong hướng dẫn. Hai số này chỉnh lại sau lượt thử thật.

Bundle v1 vẫn giữ trong repo làm nguồn gốc, nhưng dùng schema cũ nên không publish được trên branch `feat/realtime-replay`. Publish v2:

```bash
cd apps/server
uv run python -m navigation.prepare ../../data/examples/lift-lobby-to-toilet-v2 \
  --reviewer "Team Offixed" --reviewed
```

Lệnh tạo 53 MP3 Edge-TTS, mỗi câu trong `assets.phrases` một file. Không có ảnh, video hay dữ liệu nhận dạng cá nhân trong fixture.
