



import json
import os
from pathlib import Path
import re


import io
from pathlib import Path
from azure.core.credentials import AzureKeyCredential
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.identity import DefaultAzureCredential


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

    if "includeText" in condition:
        match = re.search(condition["includeText"],allText)
        if match == None:
            return False
    if "hasLine" in condition:
        hasLine = False
        for line in lines:
            if line.strip() == condition["hasLine"]:
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



def read_screenshot(image_location, lines):
    current_directory = os.path.dirname(os.path.abspath(__file__))
    print(current_directory)
    config_path = os.path.join(current_directory, 'config.json')
    # Path to the JSON file in the same directory
    configFile = open(config_path, 'r')

    config = json.load(configFile)

    imageConfigs = config["image"]


    app = read_from_filename(image_location)


    confs_to_test = filter(lambda c: c["app"] == app, imageConfigs)


    conf_to_use = next(x for x in confs_to_test if run_conditions(x["conditions"], lines))

    extracted_data = {}

    for pi, prop in enumerate(conf_to_use["properties"]):

        indexForLook = -1
        if "lookFor" in prop:
            indexForLook = next((i for i, line in enumerate(lines) if line.strip() == prop["lookFor"]), -1)


        if "lookForRegex" in prop:
            indexForLook = next((i for i, line in enumerate(lines) if re.search(prop["lookForRegex"], line.strip()) != None and i > indexForLook), -1)

        indexToGet = indexForLook if "getValueAfter" not in prop else indexForLook + int(prop["getValueAfter"])
        value = lines[indexToGet].strip()


        if "extractRegex" in prop:
            if "getMatch" in prop:
                match = re.search(prop["extractRegex"], value)
                value = match.group(int(prop["getMatch"]))
            else:
                print(f"getMatch is required when using extractRegex. conf:{conf_to_use["name"]}, prop:{prop["property"]} ")
                
        
        if "removeRegex" in prop:
            for string in list(prop["removeRegex"]):
                value = value.replace(string,"")

                
        if "replaceRegex" in prop:
            for r in list(prop["replaceRegex"]):
                value = value.replace(r["f"],r["t"])

        extracted_data[prop["property"]] = value

    extracted_data["matchedConfig"] = f"img_{conf_to_use["name"]}"
    extracted_data["success"] = True

    return extracted_data