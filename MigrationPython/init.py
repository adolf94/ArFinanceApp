
from datetime import datetime
from dateutil.parser import parse
from functools import reduce
import json
from dotenv import load_dotenv, dotenv_values
from InquirerPy import inquirer
from azure.cosmos import CosmosClient, PartitionKey
from azure.identity import ClientSecretCredential, DefaultAzureCredential
from pathlib import Path
import importlib.util

import os

load_dotenv()  
dotenv_vars = dotenv_values()

env_s = []
for key, value in dotenv_vars.items():
    if(key.startswith("ENDPOINT_")):
        
        env_s.append(key[9:])
to_do = inquirer.select(
    message="What do you want to do?",
    choices=["Backup","Restore", "Migrate","Reset"],
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
            message="Name the new db"
        )

    return which_db



def export_data():
    exportPath = "data/" + backupname + "/"
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

    
def import_data(container_data, migration):
    table_data = migration.table_metadata()

    for con in table_data:
        conDict = dict(con)
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
        
        
        if conDict["Container"] in container_data:
            rows = container_data[conDict["Container"]]
            for row in rows:
                container.upsert_item(row)
        print(f"Completed insert in {conDict["Container"]}")




def load_config_from_file(name):
    file_path = "./migrations/" + name + ".py"
    module_name = "migrate_script"
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def current_version_file():
    file  = "data/" + backupname + "/__EfMigrations.json"
    data = open(file, mode="r", encoding="utf8")
    history = json.load(data)
    migration = reduce(lambda x,y: x if x["id"] > y["id"] else y, history)
    return migration

def select_data_dir():

    dir = os.listdir("./data")
    return inquirer.select(
        message="Select a folder to restore",
        choices=dir,
    ).execute()

def loadFiles(): 
    backupfolder = "./data/" + backupname 
    dir = os.listdir(backupfolder)
    containers = {}
    for file in dir:
        container = file.split(".")[0]
        print(container)
        stringJson = open(backupfolder + "/" + file, mode="r", encoding="utf8")
        containers[container] = json.load(stringJson)

    return containers





if to_do == "Restore":
    
    which_db = get_db_list(True) 
    dir = os.listdir("./data")
    backupname = inquirer.select(
        message="Select a folder to restore",
        choices=dir,
    ).execute()
    
    db = loadFiles()
    migration_name = current_version_file()["id"]
    migration = load_config_from_file(migration_name)
    import_data(db, migration)



elif to_do == "Backup":
    which_db = get_db_list()
    backupname = inquirer.text(message="Name your backup:", default=which_env + "_" + which_db + "_" + datetime.now().strftime("%Y%m%d%H%M%S")).execute()
    export_data()

elif to_do == "Merge with Pesistent":

    
    which_db = get_db_list(text="Select Source Db (Persistent)")

    destination = inquirer.select(
        message="Data Source?",
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
        dest_db = get_db_list(text="Select destination database", client= dest_client)


        shouldUpload = inquirer.select(
            message="Update the source data?",
            choices=["Yes", "No"],
        ).execute()
        
        source_db = dest_client.get_database_client(which_db)
        source_hooks = source_db.get_container_client("HookMessages")




        source_hooks = source_db.get_container_client("HookMessages")
        

    # source_env = inquirer.select(
    #     message="SOURCE: Select env",
    #     choices=env_s,
    # ).execute()
    
    # s_client = CosmosClient(os.environ["ENDPOINT_" + source_env], credential=os.environ["KEY_" + source_env])

    # source_db = get_db_list(False, "Select Source Db (Persistent)", s_client)

    
    
        


else:   
    source = inquirer.select(
        message="Data Source?",
        choices=["Database", "Folder"],
    ).execute()

    if source == "Folder":
        backupname = select_data_dir()
        which_db = get_db_list(True) 
        db = loadFiles()
        migration_name = current_version_file()["id"]
        migration = load_config_from_file(migration_name)
        db = migration.reset_ledgers(db)
        import_data(db, migration)
    else:
        which_db = get_db_list(False) 
        backupname = "temp"
        dir = os.listdir("./data")
        if(dir != None):
            for file in dir:
                os.remove(file)
        export_data()
        db = loadFiles()
        migration_name = current_version_file()["id"]
        migration = load_config_from_file(migration_name)
        db = migration.reset_ledgers(db)
        import_data(db, migration)

        
