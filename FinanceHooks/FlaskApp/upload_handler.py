import datetime
import json
import logging
import tempfile
import os, uuid
from azure.identity import DefaultAzureCredential
from werkzeug.utils import secure_filename
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient,generate_blob_sas
from flask import Request, Response

from uuid_extensions import uuid7

from FlaskApp.ai_modules import extract_from_ia
from FlaskApp.ai_modules.extract_data import identify_from_filename
from FlaskApp.ai_modules.image_functions import read_screenshot
from FlaskApp.cosmos_modules import add_to_app, add_to_persist


endpoint = os.getenv("COSMOS_ENDPOINT")
key = os.getenv("COSMOS_KEY")
dbName = os.getenv("COSMOS_DB")
dbName2 = os.getenv("COSMOS_DB2")
apiKey =os.getenv("API_KEY")
account_url = os.getenv("BLOB_SCREENSHOT_UPLOAD")  # e.g., "https://mydatalake.blob.core.windows.net"
connection_string = os.getenv("BLOB_CONNECTION_STRING", "")  # e.g., "https://mydatalake.blob.core.windows.net"
container_name = "transact-screenshots" # Replace with your container name
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}  # Allowed file types
            # if connection_string:
        #     blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        #     blob_client = blob_service_client.get_blob_client(container=container_name, blob_name=blob_name)

def allowed_file(filename):
    """Checks if the file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS




def handle_upload(request : Request):
    id=uuid7( as_type='str')
    logging.info("handle_upload starting")
    temp_file = tempfile.NamedTemporaryFile(delete=False)
    local_file_path = temp_file.name
    if request.content_type == "application/octet-stream":
    
        if not request.data:
            return Response(json.dumps({"error":"no file found"}) , 400, content_type="application/json")
        if 'original_filepath' not in request.headers:
            return Response(json.dumps({"error":"no file name found"}) , 400, content_type="application/json")
        originalFilepath = request.headers["original_filepath"] 
        originalFileName = secure_filename(originalFilepath)
        if not allowed_file(originalFileName):
            return Response(json.dumps({"error":"not allowed"}) , 400, content_type="application/json")
        
        with open(local_file_path, 'wb') as f:
            f.write(request.data)

    else:

        if 'file' not in request.files:
            return Response(json.dumps({"error":"no file found"}) , 400, content_type="application/json")
        
        logging.info("found file in files")

        file = request.files['file']
        logging.info("found " + file.filename)

        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            return Response(json.dumps({"error":"no file name found"}) , 400, content_type="application/json")
        originalFileName = secure_filename(file.filename)  
        if not allowed_file(originalFileName):
            return Response(json.dumps({"error":"not allowed"}) , 400, content_type="application/json")
        
        file.save(local_file_path)  

        logging.info("file saved ")
    fileId = id.replace("-","")
    fileType = originalFileName.split(".",1)[-1]
    blob_name = fileId + "." + fileType
        
    logging.info("start upload to azure ")
    upload_result = upload_to_azure(local_file_path,blob_name)
    logging.info(upload_result)
    record = {
        "id":id,
        "Container": container_name,
        "PartitionKey":"default",
        "Service": "blob",
        "OriginalFileName":originalFileName,
        "MimeType": file.mimetype ,
        "FileKey": blob_name,
        "$type": "BlobFile",
        "DateCreated": datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "Status":"Active"
    }
    add_to_app("Files", record)


    image_extract = extract_from_ia(local_file_path)

    output = read_screenshot(originalFileName, image_extract["lines"])

    newItem = { 
        "Id" : id,
        "id": id,  
        "Date": datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "JsonData": {
            "lines":image_extract["lines"],
            "action":"image_upload",
            "imageId": id,
            "fileName":originalFileName,
            "timestamp": datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ") 
        },
        "ExtractedData": output,
        "Location": image_extract["data"],
        "RawMsg":originalFileName + " image upload",
        "Type":"notif",
        "MonthKey": datetime.datetime.now().strftime("%Y-%m-01"),
        "PartitionKey":"default",
        "$type": "HookMessage",
        "_ttl": 60*24*60*60,
        "IsHtml":False
    }

    add_to_app("HookMessages", newItem)
    add_to_persist("HookMessages", newItem)


    return  newItem


def upload_to_azure(file_path, blob_name):
    """
    Uploads a file to Azure Blob Storage.
    Handles both connection string and Azure Identity authentication.

    Args:
        file_path (str): Path to the file to upload.
        blob_name (str): Name of the blob in Azure Blob Storage.

    Returns:
        str: URL of the uploaded blob if successful, None otherwise.
    """
    try:

        blob_service_client = None
        if connection_string != "":
            blob_service_client = BlobServiceClient.from_connection_string(connection_string)
            logging.info("found the connection string")

        # # Use DefaultAzureCredential - this will use whatever identity you've configured
        # # (e.g., environment variables, managed identity, etc.)
        else:
            credential = DefaultAzureCredential()
            blob_service_client = BlobServiceClient(account_url=account_url, credential=credential)
            logging.info("using default Credential")
            
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
        with open(file_path, "rb") as data:
            blob_client.upload_blob(data, overwrite=True)  # Overwrite if it exists
        logging.info("uploading blob")


                        
            # Get a user delegation key
        if connection_string == "":
            user_delegation_key = blob_service_client.get_user_delegation_key(
                key_start_time=datetime.datetime.now(datetime.timezone.utc) ,
                key_expiry_time=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)  # Key valid for 1 hour
            )


        sas_token = generate_blob_sas(
            account_name=blob_client.account_name,
            container_name=container_name,
            blob_name=blob_name,
            account_key=blob_client.credential.account_key if connection_string != "" else user_delegation_key, #important
            permission="r",  # Read permission
            expiry=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1),  # SAS expires in 1 hour
        )
        blob_url_with_sas = f"{blob_client.url}?{sas_token}"

        return {
            "url":blob_client.url,
            "fileId": blob_name,
            "sas":sas_token if sas_token != None else "" 
        }


    except Exception as ex:
        logging.error(ex)
        return Response(ex, 500)
        
