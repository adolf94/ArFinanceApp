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
        id: string;
        accountId: string;
        year: number;
        month: number;
        dateStart: string;
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
        shouldResetPeriodically: boolean;
    }

    // ..\FinanceProject\Models\AppConfig.cs
    export interface AppConfig {
        cosmosEndpoint: string;
        cosmosKey: string;
        dataImplementation: string;
        authConfig: GoogleConfig;
        jwtConfig: AppJwtConfig;
        smsConfig: SmsConfiguration;
        redirectUrl: AppRedirects[];
    }

    // ..\FinanceProject\Models\Currency.cs
    export interface Currency {
        currencyId: number;
        currencyName: string;
        currencyCode: string;
    }

    // ..\FinanceProject\Models\LoanProfile.cs
    export interface LoanProfile {
        profileId: string;
        appId: string;
        loanProfileName: string;
        interestPerMonth: number;
        computePerDay: boolean;
        interestFactor: string;
        fixed: FixedInterests[];
    }

    // ..\FinanceProject\Models\Loans.cs
    export interface Loans {
        id: string;
        appId: string;
        userId: string;
        coborrowerId: string;
        dateCreated: string;
        date: string;
        nextInterestDate: string;
        lastInterestDate: string;
        expectedPayments: string[];
        principal: number;
        interests: number;
        loanProfile: LoanProfile;
        payment: LoanPayment[];
        interestRecords: LoanInterest[];
        status: string;
    }

    // ..\FinanceProject\Models\Role.cs
    export interface Role {
        roleName: string;
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
        name?: string;
        azureId?: string;
        mobileNumber: string;
        emailAddress: string;
        roles: string[];
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

    // ..\FinanceProject\Models\SubModels\LoanProfile.cs
    export interface FixedInterests {
        maxDays: number;
        interest: number;
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

    // ..\FinanceProject\Dto\CreateUserDto.cs
    export interface CreateUserDto {
        id: string;
        userName?: string;
        name: string;
        mobileNumber: string;
        otpCode?: number;
        otpGuid?: string;
    }

    // ..\FinanceProject\Dto\GoogleIdTokenClaims.cs
    export interface GoogleIdTokenClaims {
        email: string;
        name: string;
        audience: string;
    }

    // ..\FinanceProject\Dto\NewTransactionResponseDto.cs
    export interface NewTransactionResponseDto {
        transaction?: Transaction;
        accounts: Account[];
        balances: AccountBalance[];
    }

    // ..\FinanceProject\Dto\UserWithClaims.cs
    export interface GoogleClaimResponse {
        accessToken: string;
        refreshToken: string;
        idToken: string;
        expiresIn: number;
        scope: string;
    }

}