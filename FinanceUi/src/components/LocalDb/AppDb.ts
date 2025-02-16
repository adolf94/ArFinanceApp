import Dexie, {  EntityTable } from 'dexie';


interface Transaction {
    
}

export default class AppDB extends Dexie {
    transactions!: EntityTable<Transaction, 'id'>;

    constructor() {
        super('FinanceApp');
        this.version(1).stores({
            transactions: '++id, name, age'
        });
    }
}