import datetime
import json
import logging
import os
import azure.functions as func
import pytz

from ai_modules import extract_from_ia
from ai_modules.image_ai import identify_img_transact_ai, perform_conditions
from ai_modules.image_functions import read_from_filename, read_screenshot
from cosmos_modules import add_to_app, add_to_persist, get_record
from notif_modules.handler import check_duplicate_notif, handle_notif
from regex_utility import substitute_text
from sms_handler2.handler import handle_sms
from upload_handler import get_azure_file, handle_upload
from utils import utcstr_to_datetime
from uuid_extensions import uuid7
from google.genai.errors import APIError


app = func.FunctionApp()

endpoint = os.environ["COSMOS_ENDPOINT"]
key = os.environ["COSMOS_KEY"]
dbName = os.environ["COSMOS_DB"]
apiKey = os.environ["API_KEY"]
tz_default = pytz.timezone(os.environ["TIMEZONE"])

@app.timer_trigger(schedule="0 1/32 2 * * *", arg_name="myTimer", run_on_startup=False,
              use_monitor=False) 
def timer_trigger(myTimer: func.TimerRequest) -> None:
    if myTimer.past_due:
        logging.info('The timer is past due!')
    
    logging.info('Python timer trigger function executed.')

@app.route(route="index", auth_level=func.AuthLevel.ANONYMOUS)
def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    name = req.params.get('name')
    if not name:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            name = req_body.get('name')

    if name:
        return func.HttpResponse(f"Hello, {name}. This HTTP triggered function executed successfully.")
    else:
        return func.HttpResponse(
             "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
             status_code=200
        )
    


@app.route(route="phone_hook", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def phone_hook(req: func.HttpRequest) -> func.HttpResponse:
    request = req

    id=uuid7( as_type='str')
    headeApiKey = request.headers.get("x-api-key", "")
    if(headeApiKey == None or headeApiKey != apiKey ): return func.HttpResponse(status_code=401)

    data = request.get_json()

    if data["action"] == "notif_post":
        if(data["notif_msg"] == None):
            data["error"] = "No notif content"
            logging.info(json.dumps(data))
            return func.HttpResponse( {"message" : "No notif content" }, status_code= 400, mimetype="application/json" )
        
        allow_duplicate = request.headers.get("x-allow-dup", "")

        if(allow_duplicate is None):
            exist_notif = check_duplicate_notif(data)
            if( exist_notif is not None ):
                return func.HttpResponse( json.dumps({"message" : "Notif already exists", "hookId":exist_notif["id"]}) , status_code=409, mimetype="application/json" )

        extracted = handle_notif(data)
        timestamp = utcstr_to_datetime(data["timestamp"])
        raw = data["notif_msg"]
    elif data["action"] == "sms_receive":
        extracted = handle_sms(data) 
        timestamp = utcstr_to_datetime(data["timestamp"])
        raw = data["sms_rcv_sender"] + ": " + data["sms_rcv_msg"]
         

        



    elif data["action"] == "image_upload":
        item = get_record("Files", data["imageId"])
        if(item == None): return func.HttpResponse(status=404)

        if "app" not in data or data["app"] == "" :
            data["app"] = item["App"]
 

        timestamp = utcstr_to_datetime(data["timestamp"])
        lines = []
        for line in item["Lines"]:
            lines.append(line["text"]) 
        extracted = {}
        extracted["data"] = read_screenshot(data["app"], lines)
        extracted["location"] = item["Lines"]
        raw =  item["OriginalFileName"] + " image upload"
        data = item

    # elif data["action"] == "image_ai_upload":
    #     item = get_record("Files", data["imageId"])
    #     if(item == None): return Response(status=404)


    newItem = {
        "Id" : id,
        "id": id,  
        "Date": datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "JsonData": data,
        "ExtractedData": extracted["data"],
        "Location": extracted["location"] if "location" in extracted else {},
        "RawMsg":raw,
        "Type":"notif",
        "MonthKey": timestamp.astimezone(tz_default).strftime("%Y-%m-01"),
        "PartitionKey":"default",
        "$type": "HookMessage",
        "_ttl": 60*24*60*60,
        "IsHtml":False
    }


    if("matched_config" in extracted and extracted["matched_config"] is not None   
       and "DisplayText" in extracted["matched_config"] and extracted["matched_config"]["DisplayText"] is not None and extracted["matched_config"]["DisplayText"] != "") :
        newItem["RawMsg"] = substitute_text(extracted["matched_config"]["DisplayText"], newItem)

    add_to_app("HookMessages", newItem)
    
    add_to_persist("HookMessages", newItem)

    return func.HttpResponse( json.dumps( newItem ),status_code=201, mimetype="application/json")


@app.route(route="image_ai_hook/{id}", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
def image_ai_hook_reprocess(req: func.HttpRequest) -> func.HttpResponse:
    request = req
    headeApiKey = request.headers.get("x-api-key", "")
    if(headeApiKey == None or headeApiKey != apiKey ): return func.HttpResponse(status_code=401)  
    id = request.route_params.get('id')
    record = get_record("Files", id)
    filePath = get_azure_file(record)
    
    
    #do ai stuff here?
    try:
        image_output = identify_img_transact_ai(filePath, record)
    except APIError as err:
        if(err.code == 503):
            logging.log(f"Err with AI model:{err}")
            add_to_app("Files", record)

            return func.HttpResponse(json.dumps( {"message" : "AI Too Busy", "fileId": id}), status_code= 503 , mimetype="application/json")
                                     

    output = json.loads(image_output.text)
    
    record["AiData"] = output
    record["AiReviewed"] = False
    add_to_app("Files", record)


    return func.HttpResponse( json.dumps(output) ,status_code=200, mimetype="application/json")



@app.route(route="file_hook", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def file_hook_handler(req: func.HttpRequest) -> func.HttpResponse:
    request = req
    headeApiKey = request.headers.get("x-api-key", "")
    if(headeApiKey == None or headeApiKey != apiKey ): return func.HttpResponse(status=401)  
    upload_result = handle_upload(request)

    if(upload_result["error"] == True):
        return func.HttpResponse(json.dumps( {"message" : upload_result["message"]} ), status_code=400, mimetype="application/json")

    
    image_extract = extract_from_ia(upload_result["local_file_path"])

    upload_result["record"]["Lines"] = image_extract["data"]

    add_to_app("Files", upload_result["record"])


    app = read_from_filename(upload_result["original_file_name"])
    if app == "" :
        return func.HttpResponse( json.dumps({"message": "App not parsed" , 
                                     "imageId" : upload_result["record"]["id"] }),status_code= 400, mimetype="application/json")


    try:
        data = read_screenshot(app, upload_result["image_extract"]["lines"])
    except Exception as e:
        logging.exception("Uploaded image file but was not processed")
        return func.HttpResponse( json.dumps({"message": "Uploaded image file but was not processed" , 
                                     "imageId" : upload_result["record"]["id"] }), 400, mimetype="application/json")
        
    

    if(data["success"] == False): 
        return func.HttpResponse( json.dumps({"message": "No matching config.", 
                                     "imageId" : upload_result["record"]["id"] }), 400, mimetype="application/json")



    utc_aware_dt = datetime.datetime.now(datetime.UTC)



    id=uuid7( as_type='str')
    newItem = { 
        "Id" : id,
        "id": id,  
        "Date": datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "JsonData": {
            "lines":image_extract["lines"],
            "action":"image_upload",
            "imageId": upload_result["record"]["id"],
            "fileName":upload_result["original_file_name"],
            "timestamp": datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ") 
        },
        "ExtractedData": data,
        "Location": image_extract["data"],
        "RawMsg":upload_result["original_file_name"] + " image upload",
        "Type":"notif",
        "MonthKey": utc_aware_dt.astimezone(tz_default).strftime("%Y-%m-01"),
        "PartitionKey":"default",
        "$type": "HookMessage",
        "_ttl": 60*24*60*60,
        "IsHtml":False
    }

    add_to_app("HookMessages", newItem)
    add_to_persist("HookMessages", newItem)

    return func.HttpResponse( json.dumps(newItem) ,status_code=201, mimetype="application/json")
 

@app.route(route="image_ai_hook", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def image_ai_hook(req: func.HttpRequest) -> func.HttpResponse:
    request = req
    headeApiKey = request.headers.get("x-api-key", "")
    if(headeApiKey == None or headeApiKey != apiKey ): return func.HttpResponse(status_code=401)  
    upload_result = handle_upload(request)



    if(upload_result["error"] == True):
        return func.HttpResponse(json.dumps( {"message" : upload_result["message"]} ), status_code=400, mimetype="application/json")

    #do ai stuff here?
    try:
        image_output = identify_img_transact_ai(upload_result["local_file_path"],  upload_result["record"])
    except APIError as err:
        if(err.code == 503):
            logging.log(f"Err with AI model:{err}")
            add_to_app("Files", upload_result["record"])

            return func.HttpResponse(json.dumps( {"message" : "AI Too Busy", "fileId": upload_result["record"]["id"]}), 503 , mimetype="application/json")
                                     
    utc_aware_dt = datetime.datetime.now(datetime.UTC)

    output = json.loads(image_output.text)
    if output["app"] is None:
        output["app"] = ""
    if(len(output["otherData"]) == 0):
        output["otherData"] = {  
            "info":"nothing here"
        }
    upload_result["record"]["AiData"] = output

    output["matchedConfig"] = "imgai_default"

    matched_config = perform_conditions(output)
    if(matched_config is not None):
        output["matchedConfig"] = matched_config["id"]


    output["success"] = True

    id=uuid7( as_type='str')
    upload_result["record"]["hookId"] = id
    newItem = { 
        "Id" : id,
        "id": id,  
        "Date": datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "JsonData": {
            "action":"image_ai_upload",
            "imageId": upload_result["record"]["id"],
            "fileName":upload_result["original_file_name"],
            "timestamp": datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ") 
        },
        "ExtractedData": output,
        "Location": {},
        "RawMsg":output["description"],
        "Type":"notif",
        "MonthKey": utc_aware_dt.astimezone(tz_default).strftime("%Y-%m-01"),
        "PartitionKey":"default",
        "$type": "HookMessage",
        "_ttl": 60*24*60*60,
        "IsHtml":False
    }

    add_to_app("HookMessages", newItem)
    add_to_persist("HookMessages", newItem)
    add_to_app("Files",upload_result["record"])


    return func.HttpResponse(json.dumps(newItem),status_code=201, mimetype="application/json")
