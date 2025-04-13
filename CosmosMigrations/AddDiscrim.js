
const fs = require("node:fs")


let jsonFile = "./backups/RESET_FinanceApp_2024031001/HookMessages.json"
let jsonText = fs.readFileSync(jsonFile);



let json = JSON.parse(jsonText)


let newJson = json.map(e=>{
  e.Discriminator = "HookMessage"
  return e
})


fs.writeFileSync(jsonFile, JSON.stringify(newJson));