
import os
from azure.cosmos  import CosmosClient, DatabaseProxy,exceptions

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


def get_record(container, guid, partition = "default"):
    db = open_db(dbName)
    container = db.get_container_client(container)
    try:
        item = container.read_item(guid, partition_key=partition)
        return item
    except exceptions.CosmosResourceNotFoundError:
        return None


def get_all_records_by_partition(container, partition = "default"):
    db = open_db(dbName)
    container = db.get_container_client(container)
    try:
        item = container.query_items("Select * from c where c.Type=@partition",parameters=[
            {"name": "@partition","value": partition}
        ], partition_key=partition)
        return item
    except exceptions.CosmosResourceNotFoundError:
        return None

    

def open_db(dbName) -> DatabaseProxy:

    client = CosmosClient(endpoint, credential=key)
    db = client.get_database_client(database=dbName)
    
    return db