import Dexie from "dexie";
import AppDB from "./AppDb.js";



//
// let db = new Dexie("FinanceApp") as FinanceDexie;
//
// db.version(1).stores({
//   accounts: "&id, name, enabled, accountGroupId, balance",
//   accountGroups: "&id, name, enabled, accountTypeId",
//   accountTypes: "&id, name, enabled",
//   vendors: "&id, name, accountTypeId, enabled",
//   users: "&id, userName,azureId",
//   transactions:"&id, creditId, debitId, isSaved,  addedByUserId, vendorId",
// });
let db = new AppDB();
export default db;
