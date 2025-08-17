import os
from FlaskApp.ai_modules.image_functions import read_from_filename, read_screenshot
import json
import datetime
import logging
from flask import Flask, request, Response,app
from uuid_extensions import uuid7
from FlaskApp.cosmos_modules import add_to_app, add_to_persist, get_record
from FlaskApp.notif_modules.handler import handle_notif
from FlaskApp.sms_handler2.handler import handle_sms
from FlaskApp.upload_handler import handle_upload

# Always use relative import for custom module
from .package.module import MODULE_VALUE

app = Flask(__name__)


endpoint = os.environ["COSMOS_ENDPOINT"]
key = os.environ["COSMOS_KEY"]
dbName = os.environ["COSMOS_DB"]
apiKey = os.environ["API_KEY"]


@app.route("/")
def index():
    return (
        "Try /hello/Chris for parameterized Flask route.\n"
        "Try /module for module import guidance"
    )

@app.route("/hello/<name>", methods=['GET'])
def hello(name: str):
    return f"hello {name}"





@app.post("/phone_hook") 
def phone_hook(): 
    id=uuid7( as_type='str')
    headeApiKey = request.headers.get("x-api-key", type=str)
    if(headeApiKey == None or headeApiKey != apiKey ): return Response(status=401)

    data = request.get_json()

    if data["action"] == "notif_post":
        extracted = handle_notif(data)
        raw = data["notif_msg"]
    elif data["action"] == "sms_receive":
        extracted = handle_sms(data) 
        raw = data["sms_rcv_sender"] + ": " + data["sms_rcv_msg"]
         
    elif data["action"] == "image_upload":
        item = get_record("Files", data["imageId"])
        if(item == None): return Response(status=404)

        lines = []
        for line in item["Lines"]:
            lines.append(line["text"]) 
        extracted = {}
        extracted["data"] = read_screenshot(data["app"], lines)
        extracted["location"] = item["Lines"]
        raw =  item["OriginalFileName"] + " image upload"
        data = item


    newItem = {
        "Id" : id,
        "id": id,  
        "Date": datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "JsonData": data,
        "ExtractedData": extracted["data"],
        "Location": extracted["location"] if "location" in extracted else {},
        "RawMsg":raw,
        "Type":"notif",
        "MonthKey": datetime.datetime.now().strftime("%Y-%m-01"),
        "PartitionKey":"default",
        "$type": "HookMessage",
        "_ttl": 60*24*60*60,
        "IsHtml":False
    }
    add_to_app("HookMessages", newItem)
    
    add_to_persist("HookMessages", newItem)

    return Response( json.dumps( newItem ), 201, content_type="application/json")


@app.post("/file_hook")    
def file_hook_handler():
    headeApiKey = request.headers.get("x-api-key", type=str)
    if(headeApiKey == None or headeApiKey != apiKey ): return Response(status=401)  
    upload_result = handle_upload(request)

    if(upload_result["error"] == True):
        return Response(json.dumps( {"message" : upload_result["message"]} ), 400, content_type="application/json")

    app = read_from_filename(upload_result["original_file_name"])
    if app == "" :
        return Response( json.dumps({"message": "App not parsed" , 
                                     "imageId" : upload_result["record"]["id"] }), 400, content_type="application/json")

    data = read_screenshot(app, upload_result["image_extract"]["lines"])

    newItem = { 
        "Id" : id,
        "id": id,  
        "Date": datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "JsonData": {
            "lines":upload_result["image_extract"]["lines"],
            "action":"image_upload",
            "imageId": id,
            "fileName":upload_result["original_file_name"],
            "timestamp": datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ") 
        },
        "ExtractedData": data,
        "Location": upload_result["image_extract"]["data"],
        "RawMsg":upload_result["original_file_name"] + " image upload",
        "Type":"notif",
        "MonthKey": datetime.datetime.now().strftime("%Y-%m-01"),
        "PartitionKey":"default",
        "$type": "HookMessage",
        "_ttl": 60*24*60*60,
        "IsHtml":False
    }

    add_to_app("HookMessages", newItem)
    add_to_persist("HookMessages", newItem)

    return Response( json.dumps(newItem) , 201, content_type="application/json")
 




if __name__ == "__main__":
    app.run()