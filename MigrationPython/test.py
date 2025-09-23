

import os
import pathlib
from dateutil.parser import parse
import pytz

tz = pytz.timezone("Asia/Manila")
daaate = parse("2025-02-28T20:00:00Z").astimezone(tz).strftime("%Y-%m-01")
print(daaate)