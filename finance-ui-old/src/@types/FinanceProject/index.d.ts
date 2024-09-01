declare module 'FinanceProject' {
    // ..\FinanceProject\Models\Account.cs
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

    // ..\FinanceProject\Models\AccountGroup.cs
    export interface AccountGroup {
        id: string;
        name?: string;
        isCredit: boolean;
        enabled: boolean;
        accountTypeId: string;
        accountType?: AccountType;
        accounts?: Account[];
    }

    // ..\FinanceProject\Models\AccountType.cs
    export interface AccountType {
        id: string;
        name?: string;
        enabled: boolean;
    }

    // ..\FinanceProject\Models\AppConfig.cs
    export interface AppConfig {
        cosmosEndpoint: string;
        cosmosKey: string;
    }

    // ..\FinanceProject\Models\Currency.cs
    export interface Currency {
        currencyId: number;
        currencyName: string;
        currencyCode: string;
    }

    // ..\FinanceProject\Models\Transaction.cs
    export interface Transaction {
        id: string;
        creditId: string;
        credit?: Account;
        debitId: string;
        debit?: Account;
        amount: number;
        currAmount: number;
        addByUserId?: string;
        addByUser?: User;
        vendorId?: string;
        vendor?: Vendor;
        date: string;
        dateAdded: string;
    }

    // ..\FinanceProject\Models\User.cs
    export interface User {
        id: string;
        userName?: string;
        azureId: number;
    }

    // ..\FinanceProject\Models\Vendor.cs
    export interface Vendor {
        id: string;
        name?: string;
        accountTypeId: string;
        accountType?: AccountType;
        enabled: boolean;
    }

    // ..\FinanceProject\Models\WeeklyBalance.cs
    export interface WeeklyBalance {
        accountId: string;
        account?: Account;
        startDate: string;
        startBalance: number;
        endBalance: number;
    }

}