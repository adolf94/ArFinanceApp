declare module 'FinanceApi' {
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
        periodStartDay: number;
        resetEndOfPeriod: boolean;
    }

    // ..\FinanceProject\Models\AccountBalance.cs
    export interface AccountBalance {
        accountId: string;
        month: string;
        balance: number;
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

    // ..\FinanceProject\Models\ScheduledTransactions.cs
    export interface ScheduledTransactions {
        id: string;
        cronExpression: string;
        cronId: string;
        dateCreated: string;
        totalOccurence: number;
        endDate: string;
        lastTransactionDate: string;
        lastTransactionIndex: number;
        nextTransactionDate: string;
        enabled: boolean;
        lastTransactionId?: string;
        lastTransaction?: Transaction;
    }

    // ..\FinanceProject\Models\Transaction.cs
    export interface Transaction {
        id: string;
        type: string;
        creditId: string;
        credit?: Account;
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

    // ..\FinanceProject\Models\User.cs
    export interface User {
        id: string;
        userName?: string;
        azureId?: string;
        mobileNumber: string;
        emailAddress: string;
    }

    // ..\FinanceProject\Models\Vendor.cs
    export interface Vendor {
        id: string;
        name?: string;
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

    // ..\FinanceProject\Dto\AppProfile.cs
    export interface AppProfile extends Profile {
    }

    // ..\FinanceProject\Dto\CreateTransactionDto.cs
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

    // ..\FinanceProject\Dto\NewTransactionResponseDto.cs
    export interface NewTransactionResponseDto {
        transaction?: Transaction;
        accounts: Account[];
        balances: AccountBalance[];
    }

}