
import os
from azure.cosmos  import CosmosClient, DatabaseProxy

dbName = os.environ["COSMOS_DB"]
dbName2 = os.environ["COSMOS_DB2"]
endpoint = os.environ["COSMOS_ENDPOINT"]
key = os.environ["COSMOS_KEY"]

def add_to_app(container,record):
    db = open_db(dbName)

    container = db.get_container_client(container)
    container.upsert_item(record)
    return record



def add_to_persist(container,record):
    db = open_db(dbName2)

    container = db.get_container_client(container)
    container.upsert_item(record)
    return record





    

def open_db(dbName) -> DatabaseProxy:

    client = CosmosClient(endpoint, credential=key)
    db = client.get_database_client(database=dbName)
    
    return db