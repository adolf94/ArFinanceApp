

import json
import os
from pathlib import Path
import re

from FlaskApp.cosmos_modules import get_all_records_by_partition
from FlaskApp.regex_utility import get_regex_match, regex_matches_tolist


def handle_notif(data):
    current_directory = Path(os.path.dirname(os.path.abspath(__file__)))
    config_path = os.path.join(current_directory.parent, 'config.json')
    # Path to the JSON file in the same directory
    configFile = open(config_path, 'r')


    notif_config = get_all_records_by_partition("HookConfigs", "notif_")

    output = {
        "data":{
            "matchedConfig" : "notif",
            "success" : False
            
        },
        "location":{}
    }
    
    conf_to_use = filter(lambda c: c["App"] == data["notif_pkg"], notif_config)

    current_reg = None
    for reg in conf_to_use:
        searc = None
        current_reg = reg

        if run_conditions(data, reg["Conditions"]) == False:
            continue

        if "Regex" in reg:
            searc = get_regex_match(reg["Regex"], data["notif_msg"])
        if "Success" in reg and reg["Success"] == False:
            break
        if searc is not None:
            break
     
    if current_reg == None:
        output["data"]["success"] = False
        output["data"]["matchedConfig"] = "notif"
        return output


    if  "Success" in reg and current_reg["Success"] == False: 
        output["data"]["matchedConfig"] = current_reg["Name"]
        output["data"]["success"] = False
        return output
     
    if searc is None: return output

    output["data"]["success"] = True
    values = regex_matches_tolist(searc)
    name = current_reg["NameKey"]
    for pi, prop in enumerate(current_reg["Properties"]):
        value = ""
        loc = None
        if prop["RegexIndex"] is not None:
            index = int(prop["RegexIndex"])
            value = values[index]['group']
            loc = values[index]['span']
            
        if prop["ExtractRegex"] is not None:
            if "GetMatch" in prop:
                match = re.search(prop["ExtractRegex"], value)
                value = match.group(int(prop["GetMatch"]))
            else:
                property = prop['Property']
                print(f"getMatch is required when using extractRegex. conf:{name}, prop:{property} ")
                
        
        if prop["RemoveRegex"] is not None:
            for string in list(prop["RemoveRegex"]):
                value = value.replace(string,"")

                
        if prop["ReplaceRegex"] is not None:
            for r in list(prop["ReplaceRegex"]):
                value = value.replace(r["F"],r["T"])
    
        output["data"][prop["Property"]] = value
        output["location"][prop["Property"]] = loc
    output["data"]["matchedConfig"] = name
    return output

def run_conditions(data, condition):
    # if list of dict, do and
    if len(condition) == 0:
        return True
    if all(isinstance(item, dict) for item in condition):
        return all(run_and_condition(data, conditionItem) for conditionItem in condition)
    # else:

    
def run_and_condition(data, condition):

    if condition["Operation"] is not None:
        if condition["Operation"] in ["eq","equals","equal", "=", "=="]:
            return data[condition["Property"]] == condition["Value"]
    else: 
        return False
        

        