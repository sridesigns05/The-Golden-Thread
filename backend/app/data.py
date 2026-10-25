"""LEGACY dataset (the frontend mock data, 4 stories, pairwise comparisons) from data/legacy/*.json.
The curated 15-story catalog lives in catalog.py."""
import json
from functools import lru_cache
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
LEGACY_DIR = DATA_DIR / "legacy"


@lru_cache(maxsize=None)
def _load(name: str) -> Any:
    with open(LEGACY_DIR / f"{name}.json", encoding="utf-8") as f:
        return json.load(f)


def stories() -> list[dict]:
    return _load("stories")


def story_ids() -> set[str]:
    return {s["id"] for s in stories()}


def motifs() -> dict[str, dict]:
    return _load("motifs")


def comparisons() -> list[dict]:
    return _load("comparisons")


def find_comparison(a: str, b: str, motif: str) -> dict | None:
    """Order-insensitive lookup of the comparison for a story pair and motif."""
    pair = {a, b}
    for c in comparisons():
        if {c["storyAId"], c["storyBId"]} == pair and c["sharedMotif"] == motif:
            return c
    return None
