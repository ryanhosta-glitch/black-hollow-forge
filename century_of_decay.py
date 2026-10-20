"""Pass 6: regenerate deterministic room decay plan from room identity."""
from pathlib import Path
import runpy
if __name__ == '__main__':
    runpy.run_path(str(Path(__file__).resolve().parent / 'decay_plan_generator.py'), run_name='__main__')
