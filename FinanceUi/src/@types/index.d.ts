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
        minMonth: string;
        maxMonth: string;
        partitionKey: string;
    }

    // ..\FinanceProject\Models\AccountBalance.cs
    export interface AccountBalance {
        id: string;
        accountId: string;
        year: number;
        month: number;
        dateStart: string;
        dateEnd: string;
        endingBalance: number;
        balance: number;
        partitionKey: string;
        transactions: BalanceTransaction[];
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
        partitionKey: string;
    }

    // ..\FinanceProject\Models\AccountType.cs
    export interface AccountType {
        id: string;
        name?: string;
        enabled: boolean;
        shouldResetPeriodically: boolean;
        partitionKey: string;
    }

    // ..\FinanceProject\Models\AppConfig.cs
    export interface AppConfig {
        cosmosEndpoint: string;
        cosmosKey: string;
        dataImplementation: string;
        authConfig: GoogleConfig;
        jwtConfig: AppJwtConfig;
        smsConfig: SmsConfiguration;
        apps: Application[];
    }

    // ..\FinanceProject\Models\CoopOption.cs
    export interface CoopOption {
        appId: string;
        year: number;
        initialAmount: number;
        firstInstallment: string;
        frequency: CoopOptionFrequency;
        increments: number;
        installmentCount: number;
    }

    // ..\FinanceProject\Models\CoopOption.cs
    export interface FrequencyOptions {
    }

    // ..\FinanceProject\Models\CoopOption.cs
    export interface CoopOptionFrequency {
        name: string;
        cron: string;
    }

    // ..\FinanceProject\Models\Currency.cs
    export interface Currency {
        currencyId: number;
        currencyName: string;
        currencyCode: string;
    }

    // ..\FinanceProject\Models\HookMessage.cs
    export interface HookMessage {
        id: string;
        date: string;
        type: string;
        rawMsg: string;
        partitionKey: string;
        jsonData?: JObject;
        extractedData?: JObject;
        isHtml: boolean;
    }

    // ..\FinanceProject\Models\InputLogs.cs
    export interface InputLogs {
        guid: string;
        dateLogged: string;
        path: string;
        email: string;
        ipAddress: string;
        statusCode: string;
        userId?: string;
        partitionKey: string;
    }

    // ..\FinanceProject\Models\LedgerAccounts.cs
    export interface LedgerAccount {
        ledgerAcctId: string;
        dateAdded: string;
        addedBy: string;
        name: string;
        section: string;
        balance: number;
        partitionKey: string;
    }

    // ..\FinanceProject\Models\LedgerEntry.cs
    export interface LedgerEntry {
        entryId: string;
        entryGroupId: string;
        monthGroup: string;
        date: string;
        dateAdded: string;
        addedBy: string;
        debitId: string;
        creditId: string;
        relatedEntries: LedgerEntryTransaction[];
        description: string;
        amount: number;
    }

    // ..\FinanceProject\Models\Loan.cs
    export interface Loan {
        id: string;
        appId: string;
        userId: string;
        coborrowerId: string;
        createdBy: string;
        date: string;
        dateCreated: string;
        dateClosed?: string;
        nextInterestDate: string;
        lastInterestDate: string;
        nextComputeDate: string;
        expectedPayments: PaymentPlan[];
        disbursementAccount?: DisbursementAccount;
        principal: number;
        interests: number;
        totalInterestPercent: number;
        loanProfile: NoNavigationLoanProfile;
        payment: LoanPayment[];
        interestRecords: LoanInterest[];
        status: string;
        sourceAcctId: string;
        ledgerEntryId: string;
    }

    // ..\FinanceProject\Models\Loan.cs
    export interface NoNavigationLoanProfile extends LoanProfile {
    }

    // ..\FinanceProject\Models\LoanPayment.cs
    export interface LoanPayment {
        id: string;
        date: string;
        paymentId: string;
        loanId: string;
        appId: string;
        userId: string;
        amount: number;
        againstPrincipal: boolean;
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

    // ..\FinanceProject\Models\MemberProfile.cs
    export interface MemberProfile {
        appId: string;
        year: number;
        userId: string;
        id: string;
        initialAmount: number;
        increments: number;
        shares: number;
        installmentCount: number;
        firstInstallment: string;
        contributions: Contribution[];
    }

    // ..\FinanceProject\Models\MonthlyTransaction.cs
    export interface MonthlyTransaction {
        monthKey: string;
        partitionKey: string;
        transactions: TransactionRef[];
    }

    // ..\FinanceProject\Models\PaymentRecord.cs
    export interface PaymentRecord {
        id: string;
        appId: string;
        userId: string;
        date: string;
        dateAdded: string;
        addedBy?: string;
        method: string;
        referenceId?: string;
        amount: number;
        destinationAcctId: string;
        ledgerEntryId: string;
        loanPayments: LoanPayment[];
    }

    // ..\FinanceProject\Models\Role.cs
    export interface Role {
        roleName: string;
        partitionKey: string;
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
        partitionKey: string;
    }

    // ..\FinanceProject\Models\Transaction.cs
    export interface Transaction {
        id: string;
        epochUpdated: number;
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
        partitionKey: string;
        balanceRefs: BalanceAccount[];
    }

    // ..\FinanceProject\Models\Transaction.cs
    export interface BalanceAccount {
        accountBalanceKey: string;
        accountId: string;
        isDebit: boolean;
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
        hasActiveLoans: boolean;
        disbursementAccounts: DisbursementAccount[];
        loanProfile?: LoanProfile;
        googleName: string;
        acctReceivableId?: string;
        liabilitiesId?: string;
        acctEquityId?: string;
        partitionKey: string;
    }

    // ..\FinanceProject\Models\Vendor.cs
    export interface Vendor {
        id: string;
        name?: string;
        enabled: boolean;
        partitionKey: string;
    }

    // ..\FinanceProject\Models\WeeklyBalance.cs
    export interface WeeklyBalance {
        accountId: string;
        account?: Account;
        startDate: string;
        startBalance: number;
        endBalance: number;
        partitionKey: string;
    }

    // ..\FinanceProject\Dto\AccountCreateDto.cs
    export interface AccountCreateDto {
        name?: string;
        accountGroupId?: string;
        foreignExchange: number;
        balance: number;
        currBalance: number;
        periodStartDay: number;
        resetEndOfPeriod: boolean;
        minMonth: string;
        maxMonth: string;
    }

    // ..\FinanceProject\Dto\AppProfile.cs
    export interface AppProfile extends Profile {
    }

    // ..\FinanceProject\Dto\CreateLoanDto.cs
    export interface CreateLoanDto {
        userId: string;
        coborrowerId: string;
        date: string;
        expectedPayments: Loan.PaymentPlan[];
        sourceAcctId: string;
        loanProfile: NoNavigationLoanProfile;
        disbursementAccount?: DisbursementAccount;
        principal: number;
    }

    // ..\FinanceProject\Dto\CreateMemberProfileDto.cs
    export interface CreateMemberProfileDto {
        shares: number;
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
        googleName?: string;
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

    // ..\FinanceProject\Dto\LedgerProfile.cs
    export interface LedgerProfile extends Profile {
    }

    // ..\FinanceProject\Dto\LoansProfile.cs
    export interface LoansProfile extends Profile {
    }

    // ..\FinanceProject\Dto\NewContributionDto.cs
    export interface NewContributionDto extends MemberProfile.Contribution {
        destinationAccount: string;
    }

    // ..\FinanceProject\Dto\NewLedgerEntryDto.cs
    export interface NewLedgerEntryDto {
        date: string;
        debitId: string;
        creditId: string;
        description: string;
        amount: number;
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