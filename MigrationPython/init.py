import asyncio
import queue
import random
import threading
from progress.bar import Bar
from progress.spinner import Spinner

from datetime import datetime
from dateutil.parser import parse
from dateutil.relativedelta import relativedelta
from functools import reduce
import json
from dotenv import load_dotenv, dotenv_values
from InquirerPy import inquirer
from azure.cosmos import CosmosClient, PartitionKey
from azure.identity import ClientSecretCredential, DefaultAzureCredential
from pathlib import Path
import importlib.util
import urllib3

import os

file_directory = Path(__file__).resolve().parent
app_directory = Path(__file__).resolve().parent
migration_path = ""
load_dotenv()
dotenv_vars = dotenv_values()

urllib3.disable_warnings()
env_s = []
for key, value in dotenv_vars.items():
    if(key.startswith("ENDPOINT_")):
        env_s.append(key[9:])
to_do = inquirer.select(
    message="What do you want to do?",
    choices=["Backup","Restore", "Migrate","Others"],
).execute()

if to_do == "Others":
    to_do = inquirer.select(
        message="Others?",
        choices=["Merge with Pesistent","Restore Persist","Reset Persist","Reset"],
    ).execute()




which_env = inquirer.select(
    message="Which env to use?",
    choices=env_s,
).execute()

client = CosmosClient(os.environ["ENDPOINT_" + which_env], credential=os.environ["KEY_" +which_env])



def get_db_list(allowNew = False, text = "Which database?", client = client):
    db_objs = client.list_databases()
    db_list = []
    for db in db_objs:
        db_list.append(db["id"])
    which_db = inquirer.select(
        message=text,
        choices=  (db_list +  ["new_db"]) if allowNew else db_list,
    ).execute()

    if(which_db == "new_db"):
        which_db = inquirer.text(
            message="Name the new db",
            default="FinanceApp"
        ).execute()
        client.create_database(which_db)

    return which_db



def export_data():
    exportPath = f"{file_directory}/data/" + backupname + "/"
    db = client.get_database_client(which_db)
    containers = db.list_containers()
    for cont in containers:
        items = []

        container = db.get_container_client(cont["id"],)
        for item in container.read_all_items():
            items.append(item)

        Path(exportPath).mkdir(parents=True,exist_ok=True)

        with open(exportPath + cont["id"] + ".json", 'w') as f:
            json.dump(items, f, indent=4)



async def import_data(container_data, migration, type = "restore"):
    table_data = migration.table_metadata()

    for con in table_data:
        conDict = dict(con)
        if("ResetOnMigration" in conDict and 
           conDict["ResetOnMigration"] == False and type == "migration") : continue
        if("ResetOnReset" in conDict and 
           conDict["ResetOnReset"] == False and type == "reset") : continue
        db = client.get_database_client(which_db)

        try:
            db.delete_container(conDict["Container"])
            print(f"Recreating {conDict["Container"]}")
        except Exception as e:
            print(f"Creating {conDict["Container"]}")

        container = db.create_container(
            id = conDict["Container"],
            partition_key = PartitionKey(path = conDict["PartitionKeyPath"]),
            default_ttl= conDict.get("DefaultTtl", None)
        )

        svc = queue.Queue(4)
        bar = None

        def upsert_worker():

            # spinner = Spinner(f'Loading {i}')
            

            while True:
                current_container = db.get_container_client(conDict["Container"])
                current_item = svc.get()
                ii = current_item["i"]
                
                current_container.upsert_item(current_item["item"])
                # print(f"complete {queue_num}: item {ii}")
                bar.next()
                svc.task_done()
                
                
        
        threading.Thread(target=upsert_worker, daemon=True).start()

        if conDict["Container"] in container_data:
            rows = container_data[conDict["Container"]]
            count = len(rows)
            bar = Bar(conDict["Container"], max=count, suffix='%(index)d/%(max)d %(avg)d/s %(elapsed)d')
            for i,row in enumerate(rows):                
                if "$type" not in row and "Discriminator" in row: 
                    row["$type"] = row["Discriminator"]       
                if "Id" in row and "id" in row: 
                    row["id"] = row["Id"]       
                svc.put({"item":row, "i":i})
                
            svc.join()
                
                # container.upsert_item(row)
                # bar.next()
        #     tasks = []
        #     for i in range(4):
        #         task = asyncio.create_task(upsert_worker(queue, conDict["Container"], bar, i))
        #         tasks.append(task)

        #     await queue.join()

            
        # # Cancel our worker tasks.
        #     for task in tasks:
        #         task.cancel()
        #     # Wait until all worker tasks are cancelled.
        #     await asyncio.gather(*tasks, return_exceptions=True)

            bar.finish()
            print(f"Completed insert in {conDict["Container"]}")




def load_config_from_file(name):
    file_path = f"{migration_path}/{name}.py" 
    module_name = "migrate_script"
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def current_version_file():
    file  = f"{file_directory}/data/" + backupname + "/__EfMigrations.json"
    data = open(file, mode="r", encoding="utf8")
    history = json.load(data)
    migration = reduce(lambda x,y: x if int(x["id"].split("_")[0]) > int(y["id"].split("_")[0]) else y, history)
    return migration

def select_migrations_folder():
    dir = os.listdir(f"{app_directory}/migrations")
    selected_path = inquirer.select(
        message="Select a db schema migrations",
        choices=dir,
    ).execute()
    return f"migrations/{selected_path}"


def get_latest_migration():
    files = []
    
    for file in  os.listdir(migration_path):
        if os.path.isfile(os.path.join(migration_path, file)):
            files = files + [file]
    out = sorted(files, key=lambda x: int(x.split("_")[0]))
    last = out[-1]
    return last.split(".")[0]


def select_data_dir(msg = "Select a folder to restore"):

    dir = os.listdir(f"{file_directory}/data")
    return inquirer.select(
        message=msg,
        choices=dir,
    ).execute()

def loadFiles():
    backupfolder = f"{file_directory}/data/" + backupname
    dir = os.listdir(backupfolder)
    containers = {}
    for file in dir:
        container = file.split(".")[0]
        stringJson = open(backupfolder + "/" + file, mode="r", encoding="utf8")
        containers[container] = json.load(stringJson)

    return containers


if to_do == "Restore":

    migration_path = select_migrations_folder()
    which_db = get_db_list(True)
    dir = os.listdir(f"{file_directory}/data")
    backupname = inquirer.select(
        message="Select a folder to restore",
        choices=dir,
    ).execute()

    db = loadFiles()
    migration_name = current_version_file()["id"]
    migration = load_config_from_file(migration_name)
    asyncio.run(import_data(db, migration, "restore"))



elif to_do == "Backup":
    which_db = get_db_list()
    backupname = inquirer.text(message="Name your backup:", default=which_env + "_" + which_db + "_" + datetime.now().strftime("%Y%m%d%H%M%S")).execute()
    export_data()

elif to_do == "Merge with Pesistent":


    which_db = get_db_list(text="Select Source Db (Persistent)")

    destination = inquirer.select(
        message="Data Destination?",
        choices=["Database", "Folder"],
    ).execute()

    if destination == "Folder":
        backupname = select_data_dir()
    else:
        dest_env = inquirer.select(
            message="Which env to use?",
            choices=env_s,
        ).execute()

        dest_client = CosmosClient(os.environ["ENDPOINT_" + dest_env], credential=os.environ["KEY_" +dest_env])
        dest_db_name = get_db_list(text="Select destination database", client= dest_client)
        dest_db = dest_client.get_database_client(dest_db_name)
        dest_hooks = dest_db.get_container_client("HookMessages")
        dest_transactions = dest_db.get_container_client("Transaction")
        lastMonth = (datetime.now() + relativedelta(months=-1)).strftime("%Y-%m-01")
        trx_dest_items = list(dest_transactions.query_items("SELECT * from c where c.Date>@monthKey",
                                 [{"name":"@monthKey", "value": lastMonth }],
                                  enable_cross_partition_query=True ))

        shouldUpload = inquirer.select(
            message="Update the source data?",
            choices=["Yes", "No"],
        ).execute()

        source_db = client.get_database_client(which_db)
        source_hooks = source_db.get_container_client("HookMessages")
        # source_transactions = source_db.get_container_client("HookMessages")

        thisMonth = datetime.now().strftime("%Y-%m-01")


        source_hooks_data = []
        items = source_hooks.query_items("SELECT * from c where c.MonthKey=@monthKey",
                                 [{"name":"@monthKey", "value": lastMonth }],
                                 partition_key= thisMonth,
                                  enable_cross_partition_query=False )
        source_hooks_data.extend(list(items))

        items = source_hooks.query_items("SELECT * from c where c.MonthKey=@monthKey",
                                 [{"name":"@monthKey", "value": thisMonth }],
                                 partition_key= thisMonth,
                                  enable_cross_partition_query=False )
        source_hooks_data.extend(list(items))



        dest_hooks_data = []
        items = source_hooks.query_items("SELECT * from c where c.MonthKey=@monthKey",
                                 [{"name":"@monthKey", "value": lastMonth }],
                                 partition_key= lastMonth,
                                  enable_cross_partition_query=False )
        dest_hooks_data.extend(list(items))

        items = source_hooks.query_items("SELECT * from c where c.MonthKey=@monthKey",
                                 [{"name":"@monthKey", "value": thisMonth }],
                                 partition_key= thisMonth,
                                  enable_cross_partition_query=False )
        dest_hooks_data.extend(list(items))


        #Safe to assume dest is synced with Transactions
        set_of_dest = {item["Id"]: item for item in dest_hooks_data} 

        upload_to_dest = []
        put_to_source = []

        for item in  source_hooks_data:
            if item["Id"] not in set_of_dest:
                upload_to_dest.append(item)
            elif set_of_dest[item["Id"]].get("TransactionId", None) != item.get("TransactionId", None):
                put_to_source.append(item)

    
        dest_dict = {item["Id"]: item for item in upload_to_dest}

        for tr in trx_dest_items:
            if "Notifications" in tr and len(tr["Notifications"]) > 0:
                for notifId in list(tr["Notifications"]):
                    if notifId in dest_dict:
                        dest_dict[notifId]["TransactionId"] = notifId
                        put_to_source.append(dest_dict[notifId])
        

        print("To Upload to DEST")
        for item in upload_to_dest:
            print(item.Id)


        print("To PUT to SOURCe")
        for item in put_to_source:
            print(item.Id)


elif to_do == "Reset Persist":

    which_db = get_db_list(text="Select Db")
    db = client.get_database_client(which_db)
    container = db.get_container_client("HookMessages")

    rows = container.query_items("select * from c", enable_cross_partition_query=True)
    items = []
    for row in rows:
        item = {**row,"Status": "New", "MonthKey":parse(row["Date"]).strftime("%Y-%m-01")}
        items.append(item)

    try:
        db.delete_container("HookMessages")
        print("Recreating")
    except:
        print("Created Container")

    container = db.create_container("HookMessages", partition_key=PartitionKey(path="/MonthKey") )

    count = len(items)
    bar = Bar("Inserting to HookMessages", max=count)
    for item in items:
        container.upsert_item(item)
        bar.next()
    bar.finish()

elif to_do == "Restore Persist":
    
    backupname = select_data_dir()
    migration_path = select_migrations_folder()
    which_db = get_db_list(True,text="Select Db")
    db = client.get_database_client(which_db)

    try:
        db.delete_container("HookMessages")
        print(f"Recreating HookMessages")
    except Exception as e:
        print(f"Creating HookMessages")

    container = db.create_container(
        id = "HookMessages",
        partition_key = PartitionKey(path = "/MonthKey")
    )

    with open(f"./data/{backupname}/HookMessages.json", "r", encoding="utf-8") as f:
        hooksData = json.load(f)
        rows = hooksData
        count = len(rows)
        bar = Bar("HookMessages", max=count)
        for row in rows:                        
            container.upsert_item(row)
            bar.next()
        bar.finish()
    print(f"Completed insert in HookMessages")


elif to_do == "Migrate":
    migration_path = select_migrations_folder()
    source = inquirer.select(
        message="Data Source?",
        choices=["Database", "Folder"],
    ).execute()

    if source == "Folder":
        backupname = select_data_dir()
        which_db = get_db_list(True)
        db = loadFiles()
        migration_name = current_version_file()["id"]
        latest_migration_name = get_latest_migration()
        migration = load_config_from_file(latest_migration_name)
        db = migration.up_migration(db)
        db["__EfMigrations"].append({"id": latest_migration_name })
        asyncio.run(import_data(db, migration, "migration"))
    else:
            which_db = get_db_list(False)
            backupname = "temp"
            # dir = os.listdir("./data/temp")
            # if(dir != None):
            #     for file in dir:
            #         os.remove(file)
            export_data()
            db = loadFiles()
            migration_name = get_latest_migration()
            migration = load_config_from_file(migration_name)
            db = migration.up_migration(db)
            db["__EfMigrations"].append({"id": migration_name })
            
            asyncio.run(import_data(db, migration, "migration"))

else:
    source = inquirer.select(
        message="Data Source?",
        choices=["Database", "Folder"],
    ).execute()
    migration_path = select_migrations_folder()

    if source == "Folder":
        backupname = select_data_dir()
        which_db = get_db_list(True)
        db = loadFiles()
        migration_name = current_version_file()["id"]
        migration = load_config_from_file(migration_name)
        print(migration_name)
        db = migration.reset_ledgers(db)
        asyncio.run(import_data(db, migration, "reset"))
    else:
        which_db = get_db_list(False)
        backupname = "temp"
        dir = os.listdir("./data/")
        # if(dir != None):
        #     for file in dir:
        #         os.remove(file)
        export_data()
        db = loadFiles()
        migration_name = current_version_file()["id"]
        migration = load_config_from_file(migration_name)
        db = migration.reset_ledgers(db)
        asyncio.run(import_data(db, migration, "reset"))


