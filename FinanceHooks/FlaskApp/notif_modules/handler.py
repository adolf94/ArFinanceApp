

import json
import os
from pathlib import Path
import re

from FlaskApp.regex_utility import get_regex_match, regex_matches_tolist


def handle_notif(data):
    current_directory = Path(os.path.dirname(os.path.abspath(__file__)))
    config_path = os.path.join(current_directory.parent, 'config.json')
    # Path to the JSON file in the same directory
    configFile = open(config_path, 'r')

    config = json.load(configFile)

    notif_config = config["notification"]

    output = {
        "data":{
            "matchedConfig" : "notif",
            "success" : False
            
        },
        "location":{}
    }
    
    conf_to_use = filter(lambda c: c["app"] == data["notif_pkg"], notif_config)

    current_reg = None
    for reg in conf_to_use:
        searc = None
        current_reg = reg

        if run_conditions(data, reg["conditions"]) == False:
            break

        if "regex" in reg:
            searc = get_regex_match(reg, data["notif_msg"])
        if "success" in reg and reg["success"] == False:
            break
        if searc is not None:
            break
     
    if  "success" in reg and current_reg["success"] == False: 
        output["data"]["matchedConfig"] = current_reg["name"]
        output["data"]["success"] = False
        return output
    
    if searc is None: return output

    output["data"]["success"] = True
    values = regex_matches_tolist(searc)
    for pi, prop in enumerate(conf_to_use["properties"]):
        name = prop["name"]
        value = ""
        loc = None
        if "regexIndex" in prop:
            index = int(prop["regexIndex"])
            value = values[index]['group']
            loc = values[index]['span']
            
        if "extractRegex" in prop:
            if "getMatch" in prop:
                match = re.search(prop["extractRegex"], value)
                value = match.group(int(prop["getMatch"]))
            else:
                property = prop['property']
                print(f"getMatch is required when using extractRegex. conf:{name}, prop:{property} ")
                
        
        if "removeRegex" in prop:
            for string in list(prop["removeRegex"]):
                value = value.replace(string,"")

                
        if "replaceRegex" in prop:
            for r in list(prop["replaceRegex"]):
                value = value.replace(r["f"],r["t"])
    
        output["data"][prop["property"]] = value
        output["location"][prop["property"]] = loc

    return output

def run_conditions(data, condition):
    # if list of dict, do and
    if len(condition) == 0:
        return True
    if all(isinstance(item, dict) for item in condition):
        return all(run_and_condition(data, conditionItem) for conditionItem in condition)
    # else:

    
def run_and_condition(data, condition):

    if "operation" in condition:
        if condition["operation"] in ["eq","equals","equal", "=", "=="]:
            return data[condition["property"]] == condition["value"]
    else: 
        return False
        

        