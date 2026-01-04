

import json
import os
from pathlib import Path
import re

import pytz

from cosmos_modules import get_all_records_by_partition, open_db
from regex_utility import get_regex_match, regex_matches_tolist, substitute_text
from utils import utcstr_to_datetime

dbName = os.environ["COSMOS_DB"]

tz_default = pytz.timezone(os.environ["TIMEZONE"])

def check_duplicate_notif(data):
    db = open_db(dbName)
    container = db.get_container_client("HookMessages")
    partition = utcstr_to_datetime(data["timestamp"]).astimezone(tz_default).strftime("%y-%m-01")

    items = container.query_items("SELECT * from c where c.JsonData.notif_id = @notifId and c.MonthKey = @partition", parameters=[
            {"name": "@notifId","value": data["notif_id"]},
            {"name": "@partition","value": partition}
    ] , partition_key=partition )

    try:
        item = next(items)
        return item
    except StopIteration:
        return None


def handle_notif(data):

    notif_config = get_all_records_by_partition("HookConfigs", "notif_")
    titleSearc = None
    output = {
        "data":{
            "matchedConfig" : "notif",
            "success" : False
        },
        "location":{},
        "matched_config" : None
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
        if "TitleRegex" in reg and reg["TitleRegex"] is not None:
            titleSearc = get_regex_match(reg["TitleRegex"], data["notif_title"])
        if "Success" in reg and reg["Success"] == False:
            break
        if searc is not None:
            break
     
    if current_reg == None:
        output["data"]["success"] = False
        output["data"]["matchedConfig"] = "notif"
        return output


    if  "Success" in reg and current_reg["Success"] == False: 
        output["data"]["matchedConfig"] = current_reg["id"]
        output["data"]["success"] = False
        return output
     
    if searc is None and titleSearc is None: return output

    output["data"]["success"] = True

    notif_matches = [searc, titleSearc]
    for ii, searched in enumerate(notif_matches):
        if searched is not None and searched != "":    
            values = regex_matches_tolist(searched)
            name = current_reg["id"]
            frm = "regex" if ii == 0 else "titleRegex"
            props = filter(lambda p: p["For"] == frm, current_reg["Properties"])
            for pi, prop in enumerate(props):
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
    output["matched_config"] = current_reg
        
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
        current_val = data
        for i, v in enumerate(condition["Property"].split(".")):
            if(i == 0 and v == "$"): 
                current_val = data["ExtractedData"]
                continue
            if(i == 0 and v == "#"): 
                current_val = data["JsonData"]
                continue
            if(v in current_val):
                current_val = current_val[v]
                continue
        if condition["Operation"] in ["eq","equals","equal", "=", "=="]:
            return current_val == condition["Value"]
    else: 
        return False
        

        