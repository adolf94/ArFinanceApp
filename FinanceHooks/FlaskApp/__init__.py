import os
import json
import datetime
import logging
from flask import Flask, request, Response, redirect, url_for,app
from azure.cosmos  import CosmosClient, DatabaseProxy
from uuid_extensions import uuid7
from FlaskApp.cosmos_modules import add_to_app, add_to_persist
from FlaskApp.notif_modules.handler import handle_notif
from FlaskApp.sms_handler import handle_sms
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
    # if(headeApiKey == None or headeApiKey != apiKey ): return Response(status=401)
    resp = handle_upload(request)

    return Response( json.dumps(resp) , 201, content_type="application/json")
 

if __name__ == "__main__":
    app.run()