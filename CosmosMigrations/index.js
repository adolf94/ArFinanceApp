require("dotenv").config({ path: `.env.local`, override: true });
const moment = require("moment")
const { spawn } = require("node:child_process")
const fs = require("node:fs")
const os = require("node:os")



//variables 
let lastMigration = null






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
            "ConnectionString": process.env.connectionString,
            "Database":process.env.database
        }
    }

    let operations = metaData.map(e=>{
        return {
            "SinkSettings": {
                "FilePath": location + `/${e.Container}.json`
            },
            "SourceSettings": {
                "Container":e.Container,
                "Database": process.env.database
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
                "ConnectionString": process.env.connectionString,
                "Database":process.env.database,
                "Container":"__EfMigrations",
            },
            SinkSettings: {
                "FilePath": os.tmpdir() + "/_efMigrations.json"
            },
        }

        fs.writeFileSync(file, JSON.stringify(migrationJson));

        let proc = spawn("./cosmosMigrationTool/dmt.exe", [`--settings=${file}`])
            
        proc.stdout.pipe(process.stdout)
        proc.stderr.pipe(process.stderr)
        proc.on('exit', (code) => {
            console.log(code)
            //read generated file
            let text = fs.readFileSync(os.tmpdir() + "/_efMigrations.json", "utf-8");
            console.log(text)
            if(text !== "["){
                let migrations = JSON.parse(text)
                lastMigration = migrations.reduce((prev, cur, i)=>{
                    if(!!prev) return cur;
                    if(cur.Id > prev.Id) return cur
                    return prev
            },null)
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


    let migrationJson = {
        Source: "json",
        Sink: "cosmos-nosql",
        SinkSettings: {
            "ConnectionString": process.env.connectionString,
            "Database":process.env.database
        }
    }

    let metaData = dbConfigToApply.migrate.database
    
    let operations = metaData.map(e=>{
        return {
            "SourceSettings": {
                "FilePath":  `${__dirname}\\data\\${e.Container}.json`
            },
            "SinkSettings": {
                "Container":e.Container,
                "Database": process.env.database,
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

    proc.stdout.pipe(process.stdout)
    proc.stderr.pipe(process.stderr)
    proc.on('exit', (code) => {
    })
}

const applyBackup = async (dbConfigToApply)=>{
    
    let migrationJson = {
        Sink: "json",
        Source: "cosmos-nosql",
        SourceSettings: {
            "ConnectionString": process.env.connectionString,
            "Database":process.env.database
        }
    }

    let metaData = dbConfigToApply.migrate.database
    
    let operations = metaData.map(e=>{
        return {
            "SinkSettings": {
                "FilePath":  `${__dirname}\\data\\${e.Container}.json`
            },
            "SourceSettings": {
                "Container":e.Container,
                "Database": process.env.database,
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

    proc.stdout.pipe(process.stdout)
    proc.stderr.pipe(process.stderr)
    proc.on('exit', (code) => {
    })

}


const OnDemandBackup = async ()=>{

    const migrationNow = await getCurrentMigrationData()

    const migrationsData = await readMigrationsConfig();

    const migrationKeys= Object.keys(migrationsData).sort((a,b)=>(a>b?0:1))

    //start process
    //NOTE : if may data na, fetchData muna
        if(!fs.existsSync(".\\data")) fs.mkdirSync(".\\data")
        let migrationIndex = -1;
    if(migrationNow === null){
        // create empty data for first migration array
        let theIndexFinal = migrationKeys.length - 1
        let firstMigration = migrationsData[theIndexFinal].default;
        for( var i in firstMigration.migrate.database) {
            let table =  firstMigration.migrate.database[i]
            // console.log(firstMigration)
            fs.writeFileSync(`${__dirname}\\data\\${table.Container}.json`, "[]")
            console.debug(`${table.Container}.json written with []`)
        }
    }else{
        let migration = migrationsData[migrationNow.Id].default;
        applyBackup(migration);
    }
    migrationIndex = migrationKeys.indexOf(migrationNow.Id);
    
    //perform transform
    for (let i = migrationIndex+1; i<migrationKeys;i++){
        let transformMigration = migrationsData[migrationKeys[i]]
        let tables = transformMigration.migrate.database
        tables.forEach((conf)=>{
            let jsonText = fs.readFileSync(`${__dirname}\\data\\${table.Container}.json`);
            let jsonArr = JSON.parse(jsonText);

            jsonArr = jsonArr.map(conf.mapper)

            fs.writeFileSync(`${__dirname}\\data\\${table.Container}.json`, JSON.stringify(jsonArr));
        })
    }



}


(async ()=>{
    
    const migrationsData = await readMigrationsConfig();
    const migrationKeys= Object.keys(migrationsData).sort((a,b)=>(a>b?0:1))
    let firstMigration = migrationsData[migrationKeys[0]].default;
    applyRestore(firstMigration)
})()


// doBackupFirst()