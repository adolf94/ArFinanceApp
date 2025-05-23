const migrationinfo = require('./migrations/7_restructure');
const lastMigrate = require('./migrations/8_newhookreference');
const fs = require("node:fs");
const os = require("node:os");
const {spawn} = require("node:child_process");
const path = require("node:path");
require("dotenv").config({ path: `.env.local`, override: true });

let tables = migrationinfo.migrate.database


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

  tableData = migrationinfo.dataMigration(tableData)

  tables.forEach((table)=>{
	fs.writeFileSync(`${__dirname}\\data\\${table.Container}.json`, JSON.stringify(tableData[table.Container]));
  })

  let output = ".\\data"

  return new Promise( async res=>{

	let migrationJson = {
	  Source: "json",
	  Sink: "cosmos-nosql",
	  SinkSettings: {
		"ConnectionString": process.env.TMP_CONN,
		"Database":process.env.TMP_DB
	  }
	}

	let metaData = lastMigrate.migrate.database

	let operations = metaData.map(e=>{
	  return {
		"SourceSettings": {
		  "FilePath":  `${output}\\${e.Container}.json`
		},
		"SinkSettings": {
		  "Container":e.Container,
		  "Database": process.env.TMP_DB,
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