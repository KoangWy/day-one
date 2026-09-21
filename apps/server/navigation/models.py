import base64
import binascii
import io
import re
from typing import Annotated

from PIL import Image
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

Identifier = Annotated[str, Field(pattern=r"^[a-z0-9][a-z0-9-]{0,63}$")]
Text = Annotated[str, Field(min_length=1, max_length=1000)]


class Model(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)


class Step(Model):
    id: Identifier
    instruction: Text
    landmark: Text
    voice_cue: Annotated[str, Field(max_length=1000)]


class Route(Model):
    route_id: Identifier
    steps: Annotated[list[Step], Field(min_length=2, max_length=5)]

    @model_validator(mode="after")
    def unique_steps(self):
        if len({s.id for s in self.steps}) != len(self.steps):
            raise ValueError("Step IDs must be unique")
        return self


class Checkpoint(Model):
    description: Text
    required_text: Annotated[list[Text], Field(max_length=5)]
    required_features: Annotated[list[Text], Field(max_length=5)] = []
    question: Text

    @model_validator(mode="after")
    def needs_distinctive_evidence(self):
        if not self.required_text and not self.required_features:
            raise ValueError("Checkpoint needs reviewed sign text or distinctive visual features")
        if any(not re.search(r"\w", text) for text in self.required_text):
            raise ValueError("Required text must contain readable characters")
        return self


class Review(Model):
    origin_label: Text = "Office entrance"
    origin_instruction: Text = "Stand at the office entrance. Point the rear camera toward the office sign."
    origin_retry: Text = "I only know the office route. Please check the office again."
    origin: Checkpoint
    checkpoints: list[Checkpoint]
    arrival: Text
    destination_is_exterior: bool
    sample: bool = False


class AudioStep(Model):
    instruction: str
    question: str


class Assets(Model):
    origin_label: str = "Office entrance"
    origin_instruction: str = "Stand at the office entrance. Point the rear camera toward the office sign."
    origin_retry: str = "I only know the office route. Please check the office again."
    origin: Checkpoint
    origin_audio: str
    origin_retry_audio: str
    steps: list[AudioStep]
    checkpoint_questions: list[str]
    arrival: str
    arrival_audio: str
    fallback_audio: dict[str, str]
    override_audio: str
    sample: bool


class Published(Model):
    route: Route
    review: Review
    assets: Assets
    reviewer: Text
    approved_at: str


class ReplayRequest(Model):
    route_id: Identifier
    step_index: Annotated[int, Field(ge=-1, le=4)]
    image_jpeg_640: Annotated[str, Field(min_length=4, max_length=800_000)]

    @field_validator("image_jpeg_640")
    @classmethod
    def jpeg_only(cls, value):
        try:
            raw = base64.b64decode(value, validate=True)
            with Image.open(io.BytesIO(raw)) as im:
                if im.format != "JPEG" or max(im.size) > 640 or min(im.size) < 16:
                    raise ValueError("Expected JPEG with longest edge at most 640 pixels")
                im.verify()
        except (binascii.Error, OSError, ValueError, Image.DecompressionBombError) as exc:
            raise ValueError("Invalid JPEG; longest edge must be at most 640 pixels") from exc
        return value


class ReplayResponse(Model):
    matched: bool
    instruction: str
    checkpoint_question: str
    audio_url: str


class Evidence(Model):
    matched: bool
    observed_text: Annotated[str, Field(max_length=2000)]
    observed_features: Annotated[str, Field(max_length=2000)]
    text_readable: bool
    contradictory: bool
    matched_features: Annotated[list[str], Field(max_length=5)]

    def supports(self, checkpoint: Checkpoint) -> bool:
        def normalize(text):
            return " ".join(re.findall(r"\w+", text.casefold()))

        observed = f" {normalize(self.observed_text)} "
        return bool(
            self.matched and (self.text_readable or not checkpoint.required_text)
            and not self.contradictory
            and self.observed_features.strip()
            and all(f"f{i}" in self.matched_features for i in range(len(checkpoint.required_features)))
            and all(f" {normalize(t)} " in observed for t in checkpoint.required_text)
        )
