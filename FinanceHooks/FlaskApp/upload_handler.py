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
from FlaskApp.ai_modules.image_functions import read_from_filename, read_screenshot
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
            return {
                "error": True,
                "message": "no file found"
            }
        if 'original_filepath' not in request.headers:
            return {
                "error": True,
                "message": "no file name found"
            }
        originalFilepath = request.headers["original_filepath"] 
        originalFileName = secure_filename(originalFilepath)
        if not allowed_file(originalFileName):
            return {
                "error": True,
                "message": "not allowed"
            }
        with open(local_file_path, 'wb') as f:
            f.write(request.data)

    else:

        if 'file' not in request.files:
            return {
                "error": True,
                "message": "no file found"
            }

        file = request.files['file']
        logging.info("found " + file.filename)

        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            return {
                "error": True,
                "message": "no file name found"
            }
        originalFileName = secure_filename(file.filename)  
        if not allowed_file(originalFileName):
            return {
                "error": True,
                "message": "not allowed"
            }
        file.save(local_file_path)  

        logging.info("file saved ")
    fileId = id.replace("-","")
    fileType = originalFileName.split(".",1)[-1]
    blob_name = fileId + "." + fileType
    logging.info("start upload to azure ")
    upload_to_azure(local_file_path,blob_name)


    #TODO: Create function to use existing file in Azure. instead of being reuploaded
    # image_extract = extract_from_ia(local_file_path)

    app = read_from_filename(originalFileName)
    record = {
        "id":id,
        "Container": container_name,
        "PartitionKey":"default",
        "Service": "blob",
        "OriginalFileName":originalFileName,
        "MimeType": file.mimetype ,
        "FileKey": blob_name,
        "Lines": [],
        "$type": "BlobFile",
        "App":app,
        "DateCreated": datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "Status":"Active"
    }
    add_to_app("Files", record)
    return {
        "error" : False,
        "file" : file,
        "image_extract": None,
        "local_file_path" : local_file_path,
        "original_file_name" : originalFileName,
        "record": record
    }
    


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
        
