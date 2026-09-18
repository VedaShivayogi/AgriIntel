"""Convenience script at project root to generate the synthetic demo dataset."""
import sys
from pathlib import Path

# Add ml/ to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ml.data.demo_generator import main

if __name__ == "__main__":
    main()
