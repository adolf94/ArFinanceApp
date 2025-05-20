require("dotenv").config({ path: `.env.local`, override: true });
const moment = require("moment")
const { spawn } = require("node:child_process")
const fs = require("node:fs")
const os = require("node:os")
const {select, input}  = require("@inquirer/prompts")
const path = require("node:path");

//variables
let lastMigration = null
var connectionString = ""
var database = ""
var destination = ""




const autoBackUpFolder = __dirname + "/autoBackUp/" + moment().format("YYYYMMDDHHmm")


const doBackupFirst = ()=>{
    // do backup to get table data
    return new Promise((res)=>{
        let file = GenMigrationBJson();
        let proc = spawn("./cosmosMigrationTool/dmt.exe", [`--settings=${file}`])

        proc.stdout.pipe(process.stdout)
        proc.stderr.pipe(process.stderr)
        proc.on('exit', (code) => {
        })

    })


    //check last migrations
}


const GenMigrationBJson = (location)=>{
    if(!location) location = autoBackUpFolder;
    if(!fs.existsSync(location)) fs.mkdirSync(location,  { recursive: true })
    let metaData = require("./cosmosMetaData.json")
    let backupLocation = __dirname + "/restoreLocation/__EfMigrations.json"
    let migrationJson = {
        Sink: "json",
        Source: "cosmos-nosql",
        SourceSettings: {
            "ConnectionString": connectionString,
            "Database":database
        }
    }
    console.log(migrationJson)
    let operations = metaData.map(e=>{
        return {
            "SinkSettings": {
                "FilePath": location + `/${e.Container}.json`
            },
            "SourceSettings": {
                "Container":e.Container,
                "Database": database
            }
        }
    })
    migrationJson.Operations = operations
    fs.writeFileSync("./tmpSettings.json", JSON.stringify(migrationJson))
    return "./tmpSettings.json";
}

const getCurrentMigrationData = async ()=>{
    return new Promise(res=>{

        let file = os.tmpdir() + "\\tmp_dmtConfig.json"

        let migrationJson = {
            Sink: "json",
            Source: "cosmos-nosql",
            SourceSettings: {
                "ConnectionString": connectionString,
                "Database":database,
                "Container":"__EfMigrations",
            },
            SinkSettings: {
                "FilePath": os.tmpdir() + "/_efMigrations.json"
            },
        }
        fs.writeFileSync(file, JSON.stringify(migrationJson));

        let proc = spawn("./cosmosMigrationTool/dmt.exe", [`--settings=${file}`])

        proc.stdout.on("data", (data)=>{
            let output = data.toString();
            
            if(output.indexOf("Response status code does not indicate success: NotFound (404)") > 0){
                console.warn("WARN: __EfMigrations does not exist");
                return
            }
            
            
            
        })
        proc.stderr.on("data", (data)=>{
            console.log("ERR")
            console.log(data.toString())
        })
        // proc.on("err")
        proc.on('exit', (code) => {
            console.log(code)
            //read generated file
            let text = fs.readFileSync(os.tmpdir() + "/_efMigrations.json", "utf-8");
            if(text !== "["){
                let migrations = JSON.parse(text)
                lastMigration = migrations.reduce((prev, cur, i)=>{
                    if(!prev) return cur;
                    if(cur.id > prev.id) return cur
                    return prev
                },null)
            }else{
                res(false)
            }

            res(lastMigration)


        });
    })

}
// getCurrentMigrationData()

const readMigrationsConfig =()=>{
    return new Promise( async res=>{
        let files = fs.readdirSync(__dirname + "/migrations")

        let configs = {};
        for (let i in files)
        {

            let config = await import(  "./migrations/" + files[i]);

            configs[files[i].split(".")[0]] = config;

        }
        res(configs)
    })

}


const  applyRestore = async (dbConfigToApply)=>{
    let output = destination? `.\\backups\\${destination}` : ".\\data"

    return new Promise( async res=>{

        let migrationJson = {
            Source: "json",
            Sink: "cosmos-nosql",
            SinkSettings: {
                "ConnectionString": connectionString,
                "Database":database
            }
        }

        let metaData = dbConfigToApply.migrate.database

        let operations = metaData.map(e=>{
            return {
                "SourceSettings": {
                    "FilePath":  `${output}\\${e.Container}.json`
                },
                "SinkSettings": {
                    "Container":e.Container,
                    "Database": database,
                    "RecreateContainer" :true,
                    "PartitionKeyPath" : e.PartitionKeyPath ,
                    "PartitionKeyPaths" :e.PartitionKeyPaths
                }
            }
        })
        migrationJson.Operations = operations

        let file = os.tmpdir() + "\\tmp_dmtApply.json"

        console.log(migrationJson)
        fs.writeFileSync(file, JSON.stringify(migrationJson));
        console.log("runningRestore")
        let internalProc = spawn("./cosmosMigrationTool/dmt.exe", [`--settings=${file}`])

        internalProc.stdout.pipe(process.stdout)
        internalProc.stderr.pipe(process.stderr)
        internalProc.on('exit', (code) => {
            res(code)
        })
    })
}

const applyBackup = async (dbConfigToApply)=>{

    let output = destination? `.\\backups\\${destination}` : ".\\data"

    return new Promise((res=>{

        let migrationJson = {
            Sink: "json",
            Source: "cosmos-nosql",
            SourceSettings: {
                "ConnectionString": connectionString,
                "Database":database
            }
        }

        let metaData = dbConfigToApply.migrate.database

        let operations = metaData.map(e=>{
            return {
                "SinkSettings": {
                    "FilePath":  `${output}\\${e.Container}.json`
                },
                "SourceSettings": {
                    "Container":e.Container,
                    "Database": database,
                    "RecreateContainer" :true,
                    "PartitionKeyPath" : e.PartitionKeyPath ,
                    "PartitionKeyPaths" :e.PartitionKeyPaths
                }
            }
        })
        migrationJson.Operations = operations

        let file = os.tmpdir() + "\\tmp_dmtApply.json"
        fs.writeFileSync(file, JSON.stringify(migrationJson));
        console.log(migrationJson.Operations.map(e=>e.SinkSettings))
        let proc = spawn("./cosmosMigrationTool/dmt.exe", [`--settings=${file}`])
        let opIndex = 0
        proc.stdout.on("data", (data)=>{
            console.log(data.toString());
        })
        
        
        proc.stderr.pipe(process.stderr)
        proc.on('exit', async (code) => {
            res(code)

            let text = fs.readFileSync(`${output}\\__EfMigrations.json`, "utf-8");
            if(text === "[") {
                const migrationsData = await readMigrationsConfig();
                let keys= Object.keys(migrationsData).map(e=>({id:e, Id:e}))
                fs.writeFileSync(`${__dirname}\\data\\__EfMigrations.json`, JSON.stringify(keys));
            }
            
        })
    }))

}


const backupCurrent = async ()=>{
    const migrationNow = await getCurrentMigrationData()
    const migrationsData = await readMigrationsConfig();
    const migrationKeys= Object.keys(migrationsData).sort((a,b)=>(a>b?0:1))


}

const Migration = async ()=>{
    let output = destination? `.\\backups\\${destination}` : ".\\data"

    const migrationNow = await getCurrentMigrationData()

    const migrationsData = await readMigrationsConfig();

    const migrationKeys= Object.keys(migrationsData).sort((a,b)=>(a>b?0:1))
    
    //start process
    //NOTE : if may data na, fetchData muna
        if(!fs.existsSync(output)) fs.mkdirSync(output)
        let migrationIndex = -1;
    if(migrationNow === null){
        // create empty data for first migration array
        let theIndexFinal = migrationKeys.length - 1
        migrationIndex = migrationKeys.length - 1
        console.log(migrationKeys[theIndexFinal]);
        let firstMigration = migrationsData[migrationKeys[theIndexFinal]].default;
        for( var i in firstMigration.migrate.database) {
            let table =  firstMigration.migrate.database[i]
            // console.log(firstMigration)
            fs.writeFileSync(`${output}\\${table.Container}.json`, "[]")
            console.debug(`${table.Container}.json written with []`)
        }
        console.log("No Migration Exists")
       await applyBackup(firstMigration);

    }else{
        let migration = migrationsData[migrationNow.id].default;
        migrationIndex = migrationKeys.indexOf(migrationNow.id);
        console.log("current Migration:" + migrationNow.id)

        await applyBackup(migration);
    }
    // process.exit()
    //perform transform
    for (let i = migrationIndex+1; i<migrationKeys.length ;i++){
        let transformMigration = migrationsData[migrationKeys[i]]
        console.log(transformMigration)
        let tables = transformMigration.default.migrate.database
        console.log("migration: " + migrationKeys[i] );
        let tableData = {}
        tables.forEach((table)=>{
            console.log("container: " + table.Container)
            let jsonFile = `${__dirname}\\data\\${table.Container}.json`;
            if(!fs.existsSync(jsonFile)) {
                fs.writeFileSync(`${__dirname}\\data\\${table.Container}.json`, "[]");
            }
            let jsonText = fs.readFileSync(jsonFile);
            let jsonArr = JSON.parse(jsonText);
            console.log("item Count : " + jsonArr.length)

            jsonArr = jsonArr.map(table.mapper || ((e)=>e))



            tableData[table.Container] = jsonArr
        })
        if(!!transformMigration.default.dataMigration){
            console.log("run data migrations")
           tableData =   transformMigration.default.dataMigration(tableData)
            
        }
        
        console.log("Write data to json");
        tables.forEach((table)=>{
            fs.writeFileSync(`${__dirname}\\data\\${table.Container}.json`, JSON.stringify(tableData[table.Container]));
        })

        //addID 
        let jsonText = fs.readFileSync(`${__dirname}\\data\\__EfMigrations.json`);
        let jsonArr = JSON.parse(jsonText);
        console.log("item Count : " + jsonArr.length)

        jsonArr.push({id:migrationKeys[i]})
        
        fs.writeFileSync(`${__dirname}\\data\\__EfMigrations.json`, JSON.stringify(jsonArr));
    }


    console.log("Restoring")

    const lastMigration = migrationsData[migrationKeys[migrationKeys.length - 1]].default;

    // console.log(lastMigration.migrate.database.map(e=>e.Container))
    await applyRestore(lastMigration);





}


const BackUpNow = async ()=>{

    let output = destination? `.\\backups\\${destination}` : ".\\data"    
    
    const migrationNow = await getCurrentMigrationData()

    const migrationsData = await readMigrationsConfig();

    const migrationKeys= Object.keys(migrationsData).sort((a,b)=>(a>b?0:1))

    //start process
    //NOTE : if may data na, fetchData muna
        if(!fs.existsSync(output)) fs.mkdirSync(output)
        let migrationIndex = -1;
    if(migrationNow === false){
        // create empty data for first migration array
        let theIndexFinal = migrationKeys.length - 1
        migrationIndex = migrationKeys.length - 1

        let firstMigration = migrationsData[migrationKeys[theIndexFinal]].default;
        for( var i in firstMigration.migrate.database) {
            let table =  firstMigration.migrate.database[i]
            // console.log(firstMigration)
            fs.writeFileSync(path.join(output,`${table.Container}.json`), "[]")
            console.debug(`${table.Container}.json written with []`)
        }
        console.log("No Migration Exists")
    await applyBackup(firstMigration);

    }else{
        let migration = migrationsData[migrationNow.id].default;
        migrationIndex = migrationKeys.indexOf(migrationNow.id);
        console.log("current Migration:" + migrationNow.id)

        await applyBackup(migration);
    }
}

const getCurrentMigrationFromFile = ()=>{
    let output = destination? `.\\backups\\${destination}` : ".\\data"

    let text = fs.readFileSync(path.join(output, "__EfMigrations.json"))
    let lastMigration = null
    if(text !== "["){
        let migrations = JSON.parse(text)
        lastMigration = migrations.reduce((prev, cur, i)=>{
            console.log(cur)
            if(!prev) return cur;
            if(cur.id > prev.id) return cur
            return prev
        },null)
    }
    return lastMigration
}

const OnDemandRestore = async (type)=>{
    const migrationNow = await type == "file" ? getCurrentMigrationFromFile() : getCurrentMigrationData()
    const migrationsData = await readMigrationsConfig();
    const migrationKeys= Object.keys(migrationsData).sort((a,b)=>(a>b?0:1))

    let output = destination? `.\\backups\\${destination}` : ".\\data"
    //NOTE : if may data na, fetchData muna
    if(!fs.existsSync(output)) fs.mkdirSync(output)

    if(migrationNow === null){
        // create empty data for first migration array
        let theIndexFinal = migrationKeys.length - 1
        migrationIndex = migrationKeys.length - 1

        let firstMigration = migrationsData[migrationKeys[migrationIndex]].default;
        for( var i in firstMigration.migrate.database) {
            let table =  firstMigration.migrate.database[i]
            // console.log(firstMigration)
            fs.writeFileSync(path.join(output, "__EfMigrations.json"), "[]")
            console.debug(`${table.Container}.json written with []`)
        }
        applyRestore(firstMigration);

    }else{
        let migration = migrationsData[migrationNow.id].default;
        migrationIndex = migrationKeys.indexOf(migrationNow.id);
        console.log(migration)
        console.log(migrationNow.id)
        applyRestore(migration);
    }

}
// (async ()=>{

//     const migrationsData = await readMigrationsConfig();
//     const migrationKeys= Object.keys(migrationsData).sort((a,b)=>(a>b?0:1))
//     let firstMigration = migrationsData[migrationKeys[0]].default;
//     applyRestore(firstMigration)
// })()
// Migration()
// OnDemandRestore("file")
// OnDemandBackup()
// getCurrentMigrationData()

const start = async ()=>{

    const whatToDo = await select({
        message: 'What do you want to do',
        choices: [
          {
              value:'migrate',
              name: "Migration"
          },
            {
                value:'backup',
                name:"Backup only"
            },
            {
                value:'restore',
                name:"Restore"
            }
        ]
      })

    let connectionStrings = Object.keys(process.env).filter(opt=>{
        return opt.startsWith('connectionString_');
    }).map(opt=>({value:{value:process.env[opt],key:opt.substring('connectionString_'.length)}, name:opt.substring('connectionString_'.length)}))

    const whereToConnect = await select({
        message: 'Which connection?',
        choices: connectionStrings
    })
    
    connectionString = whereToConnect.value
    
    
    let databases = Object.keys(process.env).filter(opt=>{
        return opt.startsWith(`${whereToConnect.key}DB_`);
    }).map(opt=>({value:process.env[opt], name:process.env[opt]}))

    database = await select({
        message: 'Select a database',
        choices: databases
    })
    if(!fs.existsSync(".\\backups")) fs.mkdirSync(".\\backups")
    console.log(whereToConnect)

      
      switch(whatToDo){
        case "migrate":
                Migration()
            break;
          case "backup":
            
            destination = await input({
                message:"Name the backup:",
                default: `${whereToConnect.key}_${database}_${moment().format("yyyyMMDDHHmm")}`          
                
                
            })
            
            BackUpNow()
            break;
          case "restore":
              let listOfFolders = fs.readdirSync(__dirname + "/backups")
                .map(e=>({key:e,value:e}))
            destination = await select({
                message : "Select a source folder",
                choices: listOfFolders
            })
              OnDemandRestore("file")
              break;
      }
}
start()
