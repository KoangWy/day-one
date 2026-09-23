"""Every sentence the replay app can say. The VLM only returns structured data."""
from .models import Hazard, Review, Route

FAR = {"left": "ahead, slightly left", "ahead": "straight ahead", "right": "ahead, slightly right"}
NEAR = {"left": "slightly left", "ahead": "straight ahead", "right": "slightly right"}


def capitalize(text):
    return text[:1].upper() + text[1:]


def hints(prefix, short):
    """Where the landmark sits in the camera frame. Never a turn instruction."""
    phrases = {}
    for position in FAR:
        phrases[f"{prefix}-hint-candidate-{position}-far"] = f"Possible {short}, {FAR[position]}."
        phrases[f"{prefix}-hint-candidate-{position}-near"] = (
            f"Possible {short} close, {NEAR[position]}.")
        phrases[f"{prefix}-hint-matched-{position}-far"] = f"{capitalize(short)}, {FAR[position]}."
        phrases[f"{prefix}-hint-matched-{position}-near"] = (
            f"{capitalize(short)} close, {NEAR[position]}.")
    return phrases


KIND = {"glass-door": "a glass door", "automatic-door": "an automatic door", "door": "a door",
        "stairs": "stairs", "step": "a step", "narrow": "a narrow passage"}

# Sentences that belong to the app, not to a route: phone setup, obstacle alerts and teaching.
APP_PHRASES = {
    "setup-1": "Before you start, hang your phone at chest height.",
    "setup-2": "Keep the camera facing forward, and uncovered.",
    "setup-3": "Turn the sound on, and keep one ear free.",
    "setup-4": "And keep using your cane.",
    "obstacle-person": "Be careful. Someone is in front of you.",
    "obstacle-object": "Be careful. Something is in your path.",
    "teach-recording": "Recording started.",
    "teach-learning": "Learning.",
    "teach-learned": "Route learned.",
    "teach-failed": "The route could not be learned. Check the screen for details.",
}


def hazard_name(hazard: Hazard) -> str:
    return KIND.get(hazard.kind) or hazard.features[0][:1].lower() + hazard.features[0][1:]


def listing(items):
    return items[0] if len(items) == 1 else ", ".join(items[:-1]) + " and " + items[-1]


def build_phrases(route: Route, review: Review) -> dict[str, str]:
    phrases = {
        "origin-instruction": review.origin_instruction,
        "origin-found": f"{review.origin_label} found. Tap Next or say next for the first direction.",
        "origin-retry": review.origin_retry,
        **hints("origin", review.origin.short_name),
    }
    last = len(route.steps) - 1
    for i, (step, checkpoint) in enumerate(zip(route.steps, review.checkpoints)):
        short = checkpoint.short_name
        previous = review.origin_label if i == 0 else review.checkpoints[i - 1].short_name
        cue = f' Guide said: "{step.voice_cue}".' if step.voice_cue else ""
        phrases[f"s{i}-instruction"] = step.instruction + cue
        if i != last:
            phrases[f"s{i}-reached"] = f"{capitalize(short)} reached. Tap Next or say next when ready."
        phrases[f"s{i}-lost"] = (
            f"I haven't found the {short} yet. Stop and turn slowly. Last passed: {previous}.")
        phrases[f"s{i}-where"] = f"Last passed: {previous}. Heading to: {short}."
        phrases[f"s{i}-override"] = (
            f"Continue using saved directions without the camera finding the {short}?")
        phrases.update(hints(f"s{i}", short))
        if checkpoint.hazards:
            names = [hazard_name(h) for h in checkpoint.hazards]
            phrases[f"s{i}-watch"] = f"On the way: {listing(names)}."
        for h, hazard in enumerate(checkpoint.hazards):
            phrases[f"s{i}-hazard-{h}"] = hazard.warning
            if hazard.action.strip():
                phrases[f"s{i}-hazard-{h}-action"] = hazard.action
    phrases.update({
        "arrival": review.arrival,
        "arrival-unverified": ("Saved route finished. The camera did not confirm the destination. "
                               "Camera stopped."),
        "vision-down": ("Camera check is unavailable. Stop, or say next to continue with saved "
                        "directions."),
        "vision-down-origin": "Camera check is unavailable. Check the connection, or stop the route.",
        "vision-back": "Camera check is back.",
    })
    return phrases
