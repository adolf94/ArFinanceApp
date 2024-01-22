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

}