

import json
import os
from pathlib import Path
import re

from FlaskApp.cosmos_modules import get_all_records_by_partition
from FlaskApp.regex_utility import get_regex_match, regex_matches_tolist


 


def handle_sms(data):
    # Path to the JSON file in the same directory

    notif_config = get_all_records_by_partition("HookConfigs", "sms_")

    output = {
        "data":{
            "matchedConfig" : "sms",
            "success" : False
            
        },
        "location":{}
    }
    
    conf_to_use = filter(lambda c: c["App"].lower() == data["sms_rcv_sender"].lower(), notif_config)
    conf_to_use = sorted(conf_to_use,key=lambda item: item["PriorityOrder"])

    current_reg = None
    for reg in conf_to_use:
        searc = None
        current_reg = reg

        if run_conditions(data, reg["Conditions"]) == False:
            break

        if "Regex" in reg:
            searc = get_regex_match(reg["Regex"], data["sms_rcv_msg"])
        if "success" in reg and reg["Success"] == False:
            break
        if searc is not None:
            break
     
    if current_reg == None:
        output["data"]["success"] = False
        output["data"]["matchedConfig"] = "sms"
        return output


    if  "Success" in reg and current_reg["Success"] == False: 
        output["data"]["matchedConfig"] = current_reg["id"]
        output["data"]["success"] = False
        return output
     
    if searc is None: return output

    output["data"]["success"] = True
    values = regex_matches_tolist(searc)
    name = current_reg["id"]
    
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
        

        