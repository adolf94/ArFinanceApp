import { MakeOptional } from '@mui/x-date-pickers/internals';
import Dexie, {  EntityTable } from 'dexie';
import { Account as ApiAccount, AccountBalance as AccountBalanceApi, HookMessage, MonthlyTransaction as MTransactionFromApi,  Transaction as ApiTransaction, Tag} from 'FinanceApi';



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

export interface Image {
  id:string,
  data: string
}

export interface Account extends MakeOptional<ApiAccount & {
  type : string
}, 'type'> {

}


export interface Transaction extends MakeOptional<ApiTransaction & {
  dateUpdated : Date,
  debit: Account,
  credit: Account
}, 'dateUpdated'> {

}


interface FinanceAppDb extends Dexie {
  transactions: EntityTable<Transaction, 'id'>,
  monthTransactions: EntityTable<MonthlyTransaction & {dateUpdated : Date}, 'monthKey'>,
  accountBalances: EntityTable<  AccountBalance & { dateUpdated: Date }, 'id'>,
  accounts: EntityTable<Account & { dateUpdated: Date }, 'id'>,
  hookMessages: EntityTable<HookMessage, 'id'>,
  tags : EntityTable<Tag, "value">,
  images: EntityTable<Image, 'id'>,
}; 

var db : FinanceAppDb;


export const initializeDb = ()=>{

  let dbInternal = new Dexie('FinanceApp') as FinanceAppDb
  
  // Schema declaration:
  dbInternal.version(1).stores({
    transactions: '&id, monthKey',
    monthTransactions: '&monthKey',
      accountBalances: '&id,accountId, dateStart',
    accounts: '&id, type, accountGroupId',
    tags: "&value",
    hookMessages: '&id,monthKey,transactionId,jsonData.imageId',
    images:"&id"
  });

  db = dbInternal;

}

initializeDb();

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