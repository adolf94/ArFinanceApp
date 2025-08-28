import datetime
import pytz


def utcstr_to_datetime(str):
    if not str.endswith('Z'):
        str = str + "Z"


    try:
            # It's a UTC timestamp
            naive_dt = datetime.datetime.strptime(str, "%Y-%m-%dT%H:%M:%SZ")
            utc_aware_dt = pytz.utc.localize(naive_dt)
            return utc_aware_dt
            # It's a non-UTC timestamp
    except ValueError:
        # Catch any malformed strings that don't match either format
        
        return pytz.utc.localize(datetime.datetime(datetime.UTC))
