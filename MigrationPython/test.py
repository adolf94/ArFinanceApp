

import os
import pathlib

filepath = os.path.abspath(__file__)
print(__file__)
print(pathlib.Path(filepath).parent.parent)

