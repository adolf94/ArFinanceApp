import os
import json
import datetime
import logging
from flask import Flask, request, Response, redirect, url_for,app
from azure.cosmos  import CosmosClient, DatabaseProxy
from uuid_extensions import uuid7
from FlaskApp.notif_handler import handle_notif

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
    print(headeApiKey)
    # headeApiKey = request.headers.get("x-api-key", type=str)
    # if(headeApiKey == None or headeApiKey != apiKey ): return Response(status=401)

    data = request.get_json()
    print(data)

    db = open_db()
    container = db.get_container_client("HookMessages")

    extracted = handle_notif(data)
    newItem = {
        "Id" : id,
        "id": "HookMessage|" + id,  
        "Date": datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "JsonData": data,
        "ExtractedData": extracted,
        "RawMsg":data["notif_msg"],
        "Type":"notif",
        "PartitionKey":"default",
        "Discriminator": "HookMessage"
        "IsHtml":False
    }

    container.upsert_item(newItem)


    return Response( json.dumps( newItem ), 201, content_type="application/json")


def open_db() -> DatabaseProxy:

    client = CosmosClient(endpoint, credential=key)
    db = client.get_database_client(database=dbName)
    
    return db

if __name__ == "__main__":
    app.run()