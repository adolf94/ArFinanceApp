import Dexie, {  EntityTable } from 'dexie';
import { Account, AccountBalance as AccountBalanceApi, MonthlyTransaction as MTransactionFromApi, Transaction } from 'FinanceApi';



export interface MonthlyTransaction extends MTransactionFromApi {
    transactions: {
        id: string,
        epochUpdated: Number
    }[]
}

export interface AccountBalance extends AccountBalanceApi {
    transactions: {
        transactionId: string,
        epochUpdated: Number
    }[]
}



const db = new Dexie('FinanceApp') as Dexie & {
    transactions: EntityTable<Transaction, 'id'>,
    monthTransactions: EntityTable<MonthlyTransaction & {dateUpdated : Date}, 'monthKey'>,
    accountBalances: EntityTable<  AccountBalance & { dateUpdated: Date }, 'id'>,
    accounts: EntityTable<Account & { dateUpdated: Date }, 'id'>
  };
  
  // Schema declaration:
  db.version(1).stores({
    transactions: '&id, monthKey',
    monthTransactions: '&monthKey',
      accountBalances: '&id, accountId',
    accounts: '&id, type'
  });




// export default class AppDB extends Dexie {
//     transactions!: EntityTable<Transaction, 'id'>;

//     constructor() {
//         super('FinanceApp');
//         this.version(1).stores({
//             transactions: 
//         });
//     }
// }

export default db