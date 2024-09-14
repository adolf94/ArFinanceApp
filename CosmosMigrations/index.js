require("dotenv").config({ path: `.env.local`, override: true });
const moment = require("moment")
const { spawn } = require("node:child_process")
const fs = require("node:fs")


const autoBackUpFolder = __dirname + "/autoBackUp/" + moment().format("YYYYMMDDHHmm")


const doBackupFirst = ()=>{
    // do backup to get table data
    return new Promise((res)=>{
        let file = GenMigrationBJson();
    
        let proc = spawn("./cosmosMigrationTool/dmt.exe", [`--settings=${__dirname}\\tmpSettings.json`])
        
        proc.stdout.pipe(process.stdout)
        proc.stderr.pipe(process.stderr)
        proc.on('exit', (code) => {
            console.log(`Child exited with code ${code}`);
            res("")
        }); 
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


doBackupFirst()