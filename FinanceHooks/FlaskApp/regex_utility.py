import re


def get_regex_match(pattern, text):

    matches = re.finditer(pattern, text)
    for m in matches:
        return m
    return None


def regex_matches_tolist(match):
    output = []
    i = 1
    while i >= 0:
        try:
            output.append({
                'span': [match.start(i),match.end(i) ],
                "group" : match.group(i)
            })  
            i += 1   
        except:
            break
    return output

