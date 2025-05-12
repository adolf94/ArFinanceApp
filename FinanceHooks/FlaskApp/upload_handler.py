import datetime
import json
import tempfile
import os, uuid
from azure.identity import DefaultAzureCredential
from werkzeug.utils import secure_filename
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient,generate_blob_sas
from flask import Request, Response

from uuid_extensions import uuid7


account_url = "http://127.0.0.1:10000"  # e.g., "https://mydatalake.blob.core.windows.net"
container_name = "transact-screenshots" # Replace with your container name
connection_string =  "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"
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
        file = request.files['file']
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            return Response(json.dumps({"error":"no file name found"}) , 400, content_type="application/json")
        originalFileName = secure_filename(file.filename)  
        if not allowed_file(originalFileName):
            return Response(json.dumps({"error":"not allowed"}) , 400, content_type="application/json")
        
        file.save(local_file_path)  

    fileId = uuid7( as_type='str').replace("-","")
    fileType = originalFileName.split(".",1)[-1]
    blob_name = fileId + "." + fileType
        
    return upload_to_azure(local_file_path,blob_name)


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
        if connection_string:
            blob_service_client = BlobServiceClient.from_connection_string(connection_string)

        # Use DefaultAzureCredential - this will use whatever identity you've configured
        # (e.g., environment variables, managed identity, etc.)
        else:
            credential = DefaultAzureCredential()
            blob_service_client = BlobServiceClient(account_url=account_url, credential=credential)
            
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
        with open(file_path, "rb") as data:
            blob_client.upload_blob(data, overwrite=True)  # Overwrite if it exists

        sas_token = generate_blob_sas(
            account_name=blob_client.account_name,
            container_name=container_name,
            blob_name=blob_name,
            account_key=blob_client.credential.account_key if hasattr(blob_client.credential, 'account_key') else None, #important
            permission="r",  # Read permission
            expiry=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1),  # SAS expires in 1 hour
        )
        blob_url_with_sas = f"{blob_client.url}?{sas_token}"
        return {
            "url":blob_client.url,
            "sas":sas_token
        }


    except Exception as ex:
        print(ex)
        return Response(ex, 500)
        
