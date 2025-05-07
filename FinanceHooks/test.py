
import json
from azure.cosmos  import CosmosClient, DatabaseProxy
from uuid_extensions import uuid7
from FlaskApp.notif_handler import handle_notif
import os



endpoint = os.environ["COSMOS_ENDPOINT"]
key = os.environ["COSMOS_KEY"]
dbName = os.environ["COSMOS_DB"]



def open_db() -> DatabaseProxy:

    client = CosmosClient(endpoint, credential=key)
    db = client.get_database_client(database=dbName)
    
    return db




db = open_db()
container = db.get_container_client("HookMessages")


items =  container.query_items("select * from c", enable_cross_partition_query=True)


for item in items:
    output = handle_notif(item["JsonData"])

    item["ExtractedData"] = output["data"]
    item["Location"] = output["location"]

    container.upsert_item(item)

    print(json.dumps(output, indent=True))

