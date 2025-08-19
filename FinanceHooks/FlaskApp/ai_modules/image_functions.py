



import json
import logging
import os
import re


from pathlib import Path
from azure.core.credentials import AzureKeyCredential
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.identity import DefaultAzureCredential

from FlaskApp.cosmos_modules import get_all_records_by_partition


ENV = os.getenv("ENVIRONMENT")

SERVICE_ENDPOINT = os.getenv("AZ_IMG_ENDPOINT")
CREDENTIAL = DefaultAzureCredential() if  os.getenv("AZ_IMAGE_KEY") == None else AzureKeyCredential(os.environ.get("AZ_IMAGE_KEY"))
# CREDENTIAL = AzureKeyCredential(os.environ(["AZ_IMAGE_KEY"]))

# Initialize Image Analysis client
client = ImageAnalysisClient(SERVICE_ENDPOINT, CREDENTIAL)


def read_from_filename(filename):
    fileName_withoutExt = filename.split(".", 5)[0]
    pattern = r"Screenshot_([0-9]+)_([0-9]+)_([A-Za-z0-9]+)"
    match = re.search(pattern, fileName_withoutExt, re.IGNORECASE)
    if match == None: return ""
    app = match.group(3).lower()
    return app


def run_conditions(condition, lines):
    # if list of dict, do and
    if len(condition) == 0:
        return True
    if all(isinstance(item, dict) for item in condition):
        return all(run_and_condition(conditionItem, lines) for conditionItem in condition)
    # else:

    # Check if it's a dictionary
    # elif isinstance(condition, dict):

# def run_or_condition():
    
def run_and_condition(condition, lines):

    allText = "\n".join(lines)

    if condition["IncludeText"] is not None:
        match = re.search(condition["IncludeText"],allText)
        if match == None:
            return False
    if condition["HasLine"] is not None:
        hasLine = False
        for line in lines:
            if line.strip() == condition["HasLine"]:
                hasLine = True
                break
        return hasLine
        

        
def get_from_test_files(image_path):
    
        lines = [] 
        full_text = ""
        file_name = Path(image_path).name
        outputtxt = "./output/" + file_name + ".txt"
        with open(outputtxt, 'r') as file:
            for line in file:
                lines.append(line)
                full_text += line + " "
        return lines

# Initialize Image Analysis client



def read_screenshot(app, lines):
    current_directory = Path(os.path.dirname(os.path.abspath(__file__)))
    config_path = os.path.join(current_directory.parent, 'config.json')
    # Path to the JSON file in the same directory
    configFile = open(config_path, 'r')

    config = json.load(configFile)

    imageConfigs = get_all_records_by_partition("HookConfigs", "img_")


    confs_to_test = filter(lambda c: c["App"] == app.lower(), imageConfigs)

    extracted_data = {
        "matchedConfig" : "img",
        "success": False 
    }

    confs_to_test = list(confs_to_test)
    if len(confs_to_test) == 0:
        logging.error(f"No config associated with {app}")
        return extracted_data
    try:
        conf_to_use = next(x for x in confs_to_test if run_conditions(x["Conditions"], lines))
    except StopIteration:
        logging.error(f"No config that matches the image")
        return extracted_data

    name = conf_to_use['Name']
    for pi, prop in enumerate(conf_to_use["Properties"]):

        indexForLook = -1
        if prop["LookFor"] is not None:
            indexForLook = next((i for i, line in enumerate(lines) if line.strip() == prop["LookFor"]), -1)


        if prop["LookForRegex"] is not None:
            indexForLook = next((i for i, line in enumerate(lines) if re.search(prop["LookForRegex"], line.strip()) != None and i > indexForLook), -1)

        indexToGet = indexForLook if prop["GetValueAfter"] is None else indexForLook + int(prop["GetValueAfter"])
        value = lines[indexToGet].strip()


        if prop["ExtractRegex"] is not None:
            if prop["GetMatch"] is not None:
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

        extracted_data[prop["Property"]] = value

    extracted_data["matchedConfig"] = f"img_{name}"
    extracted_data["success"] = True

    return extracted_data