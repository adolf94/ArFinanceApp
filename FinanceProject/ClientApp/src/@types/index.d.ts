declare module 'FinanceApi' {
    // ..\Models\Account.cs
    export interface Account {
        id: string;
        name?: string;
        enabled: boolean;
        accountGroupId?: string;
        accountGroup?: AccountGroup;
        foreignExchange: number;
        balance: number;
        currBalance: number;
        periodStartDay: number;
        resetEndOfPeriod: boolean;
    }

    // ..\Models\AccountBalance.cs
    export interface AccountBalance {
        accountId: string;
        month: string;
        balance: number;
    }

    // ..\Models\AccountGroup.cs
    export interface AccountGroup {
        id: string;
        name?: string;
        isCredit: boolean;
        enabled: boolean;
        accountTypeId: string;
        accountType?: AccountType;
        accounts?: Account[];
    }

    // ..\Models\AccountType.cs
    export interface AccountType {
        id: string;
        name?: string;
        enabled: boolean;
    }

    // ..\Models\AppConfig.cs
    export interface AppConfig {
        cosmosEndpoint: string;
        cosmosKey: string;
    }

    // ..\Models\Currency.cs
    export interface Currency {
        currencyId: number;
        currencyName: string;
        currencyCode: string;
    }

    // ..\Models\ScheduledTransactions.cs
    export interface ScheduledTransactions {
        id: string;
        cronExpression: string;
        cronId: string;
        lastTransactionId?: string;
        lastTransaction?: Transaction;
        endDate: string;
        dateCreated: string;
        enabled: boolean;
    }

    // ..\Models\Transaction.cs
    export interface Transaction {
        id: string;
        creditId: string;
        credit?: Account;
        type: string;
        debitId: string;
        debit?: Account;
        amount: number;
        addByUserId?: string;
        addByUser?: User;
        vendorId?: string;
        vendor?: Vendor;
        date: string;
        dateAdded: string;
        scheduleId?: string;
        schedule?: ScheduledTransactions;
        asLastTransaction?: ScheduledTransactions;
        description: string;
    }

    // ..\Models\User.cs
    export interface User {
        id: string;
        userName?: string;
        azureId?: string;
    }

    // ..\Models\Vendor.cs
    export interface Vendor {
        id: string;
        name?: string;
        enabled: boolean;
    }

    // ..\Models\WeeklyBalance.cs
    export interface WeeklyBalance {
        accountId: string;
        account?: Account;
        startDate: string;
        startBalance: number;
        endBalance: number;
    }

    // ..\Dto\AppProfile.cs
    export interface AppProfile extends Profile {
    }

    // ..\Dto\CreateTransactionDto.cs
    export interface CreateTransactionDto {
        id: string;
        creditId: string;
        vendorId?: string;
        debitId: string;
        amount: number;
        date: string;
        type: string;
        description: string;
    }

    // ..\Dto\NewTransactionResponseDto.cs
    export interface NewTransactionResponseDto {
        transaction?: Transaction;
        accounts: Account[];
        balances: AccountBalance[];
    }

}