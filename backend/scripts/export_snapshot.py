"""Write the frontend's bundled fallback data: src/data/bootstrap.snapshot.json.

    python scripts/export_snapshot.py

The frontend loads /api/bootstrap from this backend at startup. If the backend is unreachable it uses
this snapshot instead, so the app never starts empty. Re-run after changing anything in backend/data
(a test fails while the snapshot is out of date).
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app.main import build_bootstrap  # noqa: E402

SNAPSHOT_PATH = ROOT.parent / "src" / "data" / "bootstrap.snapshot.json"


def snapshot_text() -> str:
    payload = build_bootstrap().model_dump(mode="json")
    return json.dumps(payload, ensure_ascii=False, indent=1, sort_keys=False) + "\n"


def main() -> int:
    text = snapshot_text()
    SNAPSHOT_PATH.write_text(text, encoding="utf-8", newline="\n")
    print(f"wrote {SNAPSHOT_PATH} ({len(text) // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
