import {LoanProfile} from "FinanceApi";

interface ComputeInterestVars {
    date: moment.Moment,
    totalInterestPercent: number,
    balance:number, //overall balance
    principal: number, //principal balance
    interest: number //interest balance
}
export const generateCompute = (form:{date:moment.Moment, principal: number, readonly?: boolean , months?: number}, loanProfile: LoanProfile) => {

    return (lastInterest: moment.Moment, balance: ComputeInterestVars) => {
        const createDate = form.date;
        const days = lastInterest.diff(createDate, 'day')
        let totalInterest: number;
        let nextDate;
        //check fixedConditions 
        const sort = loanProfile.fixed!.sort((a, b) => a.maxDays - b.maxDays)
        const useIndex = sort.findIndex(e => e.maxDays > (days));
        let interestPercent: number;
        if (useIndex > -1) {
            if (useIndex == 0) {
                interestPercent = sort[useIndex].interest
            } else {
                interestPercent = sort[useIndex].interest - sort[useIndex - 1].interest

            }
            nextDate = createDate.clone().add(sort[useIndex].maxDays, 'days');
            totalInterest = sort[useIndex].interest;
        } else {
            nextDate = createDate.clone().add(1, 'month');
            totalInterest = loanProfile.interestPerMonth!;

            while (nextDate.isSameOrBefore(lastInterest)) {
                nextDate.add(1, 'month')
                totalInterest = totalInterest + loanProfile.interestPerMonth!;
            }

            if (loanProfile.computePerDay && balance.date.isBefore(nextDate)) {
                //const curDaysInMonth = nextDate.daysInMonth()
                const noOfDaysInMonth = nextDate.clone().add(-1,'month').daysInMonth();
                const rebateDays = nextDate.clone().diff(balance.date.clone(), 'day');
                const percent = (rebateDays / noOfDaysInMonth) * loanProfile.interestPerMonth!
                totalInterest = totalInterest - percent
                nextDate = balance.date.clone()
            }


            interestPercent = totalInterest - balance.totalInterestPercent
            if (interestPercent <= 0) interestPercent = 0

        }
        //compute interestFactor

        //{ value: 'principalBalance', label: 'Principal Balance' },
        //{ value: 'principalTotal', label: 'Principal Total' },
        //{ value: 'totalBalance', label: 'Total Balance' },
        let interest = -0;
        switch (loanProfile.interestFactor) {
            case "principalBalance":
                interest = balance.principal * (interestPercent / 100)
                break;
            case "principalTotal":
                interest = form.principal * (interestPercent / 100)
                break;
            case "totalBalance":
                interest = balance.balance * (interestPercent / 100)
                break;
        }


        return {
            date: lastInterest!,
            amount: -interest,
            type: 'interest',
            principalBalance: balance.principal,
            balance: balance.balance + interest,
            interestBalance: balance.interest + interest,
            minimumDate: lastInterest!,
            nextInterest: nextDate!,
            totalInterestPercent: totalInterest
        };
    }

}