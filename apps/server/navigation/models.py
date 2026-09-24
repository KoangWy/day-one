import base64
import binascii
import io
import re
from typing import Annotated, Literal

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


class OriginCheckpoint(Model):
    description: Text
    required_text: Annotated[list[Text], Field(max_length=5)]
    required_features: Annotated[list[Text], Field(max_length=5)] = []
    # Spoken name of the landmark in template phrases, e.g. "office sign".
    short_name: Annotated[str, Field(min_length=1, max_length=40)]

    @model_validator(mode="after")
    def needs_distinctive_evidence(self):
        if not self.required_text and not self.required_features:
            raise ValueError("Checkpoint needs reviewed sign text or distinctive visual features")
        if any(not re.search(r"\w", text) for text in self.required_text):
            raise ValueError("Required text must contain readable characters")
        if not re.search(r"\w", self.short_name):
            raise ValueError("Short name must contain readable characters")
        return self


HazardKind = Literal["glass-door", "automatic-door", "door", "stairs", "step", "narrow", "other"]
Label = Annotated[str, Field(min_length=1, max_length=60)]


class Hazard(Model):
    """Something the guide warned about on the way to a checkpoint, e.g. a glass door."""
    kind: HazardKind
    # Spoken with the warning chime when the camera sees the hazard close ahead.
    warning: Annotated[str, Field(min_length=1, max_length=200)]
    # Optional follow-up, e.g. "Push the door open and go through."
    action: Annotated[str, Field(max_length=200)] = ""
    # What the camera looks for. Data for the VLM, never spoken.
    features: Annotated[list[Text], Field(min_length=1, max_length=3)]

    @model_validator(mode="after")
    def readable(self):
        if not re.search(r"\w", self.warning):
            raise ValueError("Hazard warning must contain readable characters")
        return self


class Checkpoint(OriginCheckpoint):
    expected_seconds: Annotated[int, Field(ge=1, le=600)]
    # Hazards on the way from the previous point to this checkpoint.
    hazards: Annotated[list[Hazard], Field(max_length=3)] = []


class Review(Model):
    origin_label: Text = "Office entrance"
    origin_instruction: Text = "Stand at the office entrance. Point the rear camera toward the office sign."
    origin_retry: Text = "I only know the office route. Please check the office again."
    origin: OriginCheckpoint
    checkpoints: list[Checkpoint]
    # Shown in the route list; defaults to the last checkpoint's short name.
    destination_label: Label | None = None
    arrival: Text
    destination_is_exterior: bool
    sample: bool = False

    def destination(self) -> str:
        if self.destination_label:
            return self.destination_label
        last = self.checkpoints[-1].short_name if self.checkpoints else "Destination"
        return last[:1].upper() + last[1:]


class AssetStep(Model):
    short_name: str
    expected_seconds: int
    hazards: list[HazardKind] = []


class Assets(Model):
    origin_label: str
    destination_label: str = ""
    sample: bool
    steps: list[AssetStep]
    phrases: dict[str, str]


class Published(Model):
    route: Route
    review: Review
    assets: Assets
    reviewer: Text
    approved_at: str


class ObserveRequest(Model):
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


Position = Literal["left", "ahead", "right"]
Distance = Literal["near", "far"]


class Evidence(Model):
    matched: bool
    observed_text: Annotated[str, Field(max_length=2000)]
    observed_features: Annotated[str, Field(max_length=2000)]
    text_readable: bool
    contradictory: bool
    matched_features: Annotated[list[str], Field(max_length=5)]

    def supports(self, checkpoint: OriginCheckpoint) -> bool:
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


class Observation(Evidence):
    target_visible: bool
    position: Position | None
    distance: Distance | None
    # IDs (h0, h1, h2) of the step's hazards seen close ahead; always [] when it has none.
    hazards_visible: Annotated[list[str], Field(max_length=3)]


class ObserveResponse(Model):
    step_index: int
    target: Literal["matched", "candidate", "none"]
    position: Position | None
    distance: Distance | None
    hazards: list[int] = []

    @classmethod
    def classify(cls, step_index: int, observation: Observation, checkpoint: OriginCheckpoint):
        # "matched" keeps the exact evidence bar of the confirm flow; "candidate" never advances.
        if observation.supports(checkpoint):
            target = "matched"
        elif observation.target_visible and not observation.contradictory:
            target = "candidate"
        else:
            target = "none"
        visible = target != "none"
        # Only IDs of hazards the reviewer actually saved for this step; anything else is dropped.
        known = range(len(getattr(checkpoint, "hazards", [])))
        hazards = sorted({int(h[1]) for h in observation.hazards_visible
                          if re.fullmatch(r"h[0-2]", h) and int(h[1]) in known})
        return cls(step_index=step_index, target=target,
                   position=observation.position if visible else None,
                   distance=observation.distance if visible else None, hazards=hazards)


class RouteSummary(Model):
    """One saved route in the walker's list; places link routes into a longer journey."""
    route_id: Identifier
    origin_label: str
    destination_label: str
    origin_place: str
    destination_place: str
    steps: int
    hazards: int
    sample: bool


class Place(Model):
    name: Label
    at_second: Annotated[float, Field(ge=0, le=600)]


class Suggestion(Model):
    """The teach AI's reading of one landmark. A starting point for the reviewer, never published as is."""
    short_name: Annotated[str, Field(max_length=40)]
    description: Annotated[str, Field(max_length=300)]
    sign_text: Annotated[list[Annotated[str, Field(max_length=80)]], Field(max_length=5)]
    features: Annotated[list[Annotated[str, Field(max_length=200)]], Field(max_length=5)]
    seen_at_second: Annotated[float, Field(ge=0, le=600)]


class HazardSuggestion(Model):
    step_index: Annotated[int, Field(ge=0, le=4)]
    kind: HazardKind
    warning: Annotated[str, Field(max_length=200)]
    action: Annotated[str, Field(max_length=200)]
    features: Annotated[list[Annotated[str, Field(max_length=200)]], Field(max_length=3)]


class TeachDraft(Model):
    route: Route
    origin_label: Annotated[str, Field(max_length=60)]
    destination_label: Annotated[str, Field(max_length=60)]
    origin: Suggestion
    checkpoints: Annotated[list[Suggestion], Field(max_length=5)]
    hazards: Annotated[list[HazardSuggestion], Field(max_length=6)]
    places: Annotated[list[Place], Field(max_length=8)]
