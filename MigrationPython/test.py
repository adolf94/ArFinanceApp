
import json
from dotenv import load_dotenv, dotenv_values

from azure.cosmos import CosmosClient, PartitionKey
import os

load_dotenv()
dotenv_vars = dotenv_values()

client = CosmosClient(os.environ["ENDPOINT_LOCAL"], credential=os.environ["KEY_LOCAL"])

db = client.get_database_client("FinanceAppLocal")
    
data = open("./restore/1.json", mode="r", encoding="utf8")
history = json.load(data)


for item in history:
    container = db.get_container_client(item["container"])

    match item["action"]:
        case "delete":
            row = container.query_items("SELECT TOP 1 * from c where c.id=@id", enable_cross_partition_query=True, parameters=[
                {"name":"@id", "value":item["data"]}
            ])
            nextRow = next(row, None)
            print(nextRow)
            if(nextRow == None):
                print(f"Not found: Not Deleted")
                continue
            container.delete_item(item=item["data"], partition_key=item["partition_key"])
            print(f"Deleted item ")
            continue
        case "put":
            container.upsert_item(item["data"])
            print(f"Put item ")
            continue

        