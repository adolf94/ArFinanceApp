declare module 'FinanceApi' {

    export interface LoanInterest {
        dateCreated: string,
        dateStart: string,
        dateEnd: string,
        amount: number,
        totalPercentage: number,

    }
}