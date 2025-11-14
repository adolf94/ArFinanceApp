declare module 'FinanceApi' {
    // ..\FinanceFunction\Models\Account.cs
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

    // ..\FinanceFunction\Models\AccountBalance.cs
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

    // ..\FinanceFunction\Models\AccountGroup.cs
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

    // ..\FinanceFunction\Models\AccountType.cs
    export interface AccountType {
        id: string;
        name?: string;
        enabled: boolean;
        shouldResetPeriodically: boolean;
        partitionKey: string;
    }

    // ..\FinanceFunction\Models\AppConfig.cs
    export interface AppConfig {
        cosmosEndpoint: string;
        cosmosKey: string;
        databaseName: string;
        persistDb: string;
        dataImplementation: string;
        authConfig: GoogleConfig;
        jwtConfig: AppJwtConfig;
        smsConfig: SmsConfiguration;
        financeHook: AppHookConfig;
        apps: Application[];
        blobClient: BlobClientConfig;
    }

    // ..\FinanceFunction\Models\BlobFile.cs
    export interface BlobFile {
        id: string;
        container: string;
        partitionKey: string;
        service: string;
        originalFileName: string;
        mimeType: string;
        fileKey: string;
        dateCreated: string;
        status: string;
    }

    // ..\FinanceFunction\Models\CoopOption.cs
    export interface CoopOption {
        appId: string;
        year: number;
        initialAmount: number;
        firstInstallment: string;
        frequency: CoopOptionFrequency;
        increments: number;
        installmentCount: number;
    }

    // ..\FinanceFunction\Models\CoopOption.cs
    export interface FrequencyOptions {
    }

    // ..\FinanceFunction\Models\CoopOption.cs
    export interface CoopOptionFrequency {
        name: string;
        cron: string;
    }

    // ..\FinanceFunction\Models\Currency.cs
    export interface Currency {
        currencyId: number;
        currencyName: string;
        currencyCode: string;
    }

    // ..\FinanceFunction\Models\HookConfig.cs
    export interface HookConfig {
        nameKey: string;
        name: string;
        app: string;
        regex: string;
        type: string;
        displayText: string;
        priorityOrder: number;
        conditions: Condition[];
        properties: ExtractProperty[];
        subConfigs: SubHookConfig[];
        enabled: boolean;
        success: boolean;
    }

    // ..\FinanceFunction\Models\HookMessage.cs
    export interface HookMessage {
        id: string;
        date: string;
        type: string;
        rawMsg: string;
        partitionKey: string;
        jsonData?: JsonDataModel;
        extractedData?: ExtractedDataModel;
        isHtml: boolean;
        status?: string;
        transactionId?: string;
        monthKey: string;
        timeToLive?: number;
    }

    // ..\FinanceFunction\Models\HookReference.cs
    export interface HookReference {
        id: string;
        referenceName: string;
        vendorId?: string;
        type: string;
        accountId?: string;
        hits: number;
        partitionKey: string;
        configHits: Record<string, number>;
    }

    // ..\FinanceFunction\Models\InputLogs.cs
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

    // ..\FinanceFunction\Models\LedgerAccounts.cs
    export interface LedgerAccount {
        ledgerAcctId: string;
        dateAdded: string;
        addedBy: string;
        name: string;
        section: string;
        balance: number;
        partitionKey: string;
    }

    // ..\FinanceFunction\Models\LedgerEntry.cs
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

    // ..\FinanceFunction\Models\Loan.cs
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

    // ..\FinanceFunction\Models\Loan.cs
    export interface NoNavigationLoanProfile extends LoanProfile {
    }

    // ..\FinanceFunction\Models\LoanPayment.cs
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

    // ..\FinanceFunction\Models\LoanProfile.cs
    export interface LoanProfile {
        profileId: string;
        appId: string;
        loanProfileName: string;
        interestPerMonth: number;
        computePerDay: boolean;
        interestFactor: string;
    }

    // ..\FinanceFunction\Models\MemberProfile.cs
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

    // ..\FinanceFunction\Models\MonthlyTransaction.cs
    export interface MonthlyTransaction {
        monthKey: string;
        partitionKey: string;
        transactions: TransactionRef[];
    }

    // ..\FinanceFunction\Models\PaymentRecord.cs
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

    // ..\FinanceFunction\Models\Role.cs
    export interface Role {
        roleName: string;
        partitionKey: string;
    }

    // ..\FinanceFunction\Models\ScheduledTransactions.cs
    export interface ScheduledTransactions {
        id: string;
        cronExpression: string;
        cronId: string;
        dateCreated: string;
        totalOccurence: number;
        endDate: string;
        lastTransactionDate: string;
        lastTransactionIndex: number;
        iterations: number;
        nextTransactionDate: string;
        enabled: boolean;
        lastTransactionId?: string;
        lastTransaction?: Transaction;
        transactionIds: string[];
        description: string;
        partitionKey: string;
    }

    // ..\FinanceFunction\Models\Tag.cs
    export interface Tag {
        value: string;
        count: number;
        partitionKey: string;
    }

    // ..\FinanceFunction\Models\Transaction.cs
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
        audited: boolean;
        date: string;
        dateOlder: string;
        reference: string;
        dateAdded: string;
        scheduleId?: string;
        description: string;
        monthKey: string;
        notifications: string[];
        tags: string[];
        partitionKey: string;
        balanceRefs: BalanceAccount[];
    }

    // ..\FinanceFunction\Models\Transaction.cs
    export interface BalanceAccount {
        accountBalanceKey: string;
        accountId: string;
        isDebit: boolean;
    }

    // ..\FinanceFunction\Models\User.cs
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

    // ..\FinanceFunction\Models\Vendor.cs
    export interface Vendor {
        id: string;
        name?: string;
        enabled: boolean;
        partitionKey: string;
    }

    // ..\FinanceFunction\Models\WeeklyBalance.cs
    export interface WeeklyBalance {
        accountId: string;
        account?: Account;
        startDate: string;
        startBalance: number;
        endBalance: number;
        partitionKey: string;
    }

}