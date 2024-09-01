import Dexie from 'dexie'


var db = new Dexie("FinanceApp")

db.version(1).stores({
  accounts: '&id, name, enabled, accountGroupId, balance',
  accountGroups: "&id, name, enabled, accountTypeId",
  accountTypes: "&id, name, enabled",
  vendors: '&id, name, accountTypeId, enabled',
  users: '&id, userName,azureId',
  transactions: '&id, creditId, debitId, isSaved, dateAdded, date, addedByUserId, vendorId'
})



export default db;