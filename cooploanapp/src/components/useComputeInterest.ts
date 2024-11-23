import {Loan, LoanInterest, LoanProfile} from "FinanceApi";
import moment from "moment";

interface ComputeInterestVars {
    date: moment.Moment,
    totalInterestPercent: number,
    balance:number, //overall balance
    principal: number, //principal balance
    interest: number //interest balance
}


interface LoanInfo {
    date: moment.Moment,
    principal: number,
    readonly?: boolean,
    months?: number, 
    nextInterestDate?:moment.Moment,
    interestRecords?: LoanInterest[]
}

export const generateCompute = (form:LoanInfo, loanProfile: LoanProfile) => {

    const computeInterest = (nextInterest: moment.Moment, balance: ComputeInterestVars) => {
        const createDate = moment(form.date);
        const days = nextInterest.diff(createDate, 'day')
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

            while (nextDate.isSameOrBefore(nextInterest)) {
                nextDate.add(1, 'month')
                totalInterest = totalInterest + loanProfile.interestPerMonth!;
            }

            if (loanProfile.computePerDay && balance.date.isBefore(nextDate)) {
                //const curDaysInMonth = nextDate.daysInMonth()
                const noOfDaysInMonth = nextDate.clone().add(-1,'month').daysInMonth();
                const rebateDays = nextDate.clone().diff(balance.date.clone().startOf('day'), 'day');
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
            date: nextInterest!,
            amount: -interest,
            type: 'interest',
            principalBalance: balance.principal,
            balance: balance.balance + interest,
            interestBalance: balance.interest + interest,
            minimumDate: nextInterest!,
            nextInterest: nextDate!,
            totalInterestPercent: totalInterest
        };
    }
    computeInterest.computeDiscount = (_: moment.Moment, __: ComputeInterestVars)  => ({ discountAmount:0})
    if(form.interestRecords != undefined && form.interestRecords!.length != 0 && moment().isBefore(form.nextInterestDate)){

        computeInterest.computeDiscount   =  (currentDate: moment.Moment, balance: ComputeInterestVars)  =>{
            //const curDaysInMonth = nextDate.daysInMonth()
            let nextInterest = moment(form.nextInterestDate);
            const noOfDaysInMonth = nextInterest.clone().add(-1,'month').daysInMonth();
            const rebateDays = nextInterest.clone().diff(currentDate.clone().startOf('day'), 'day');
            const percent = (rebateDays / noOfDaysInMonth) * loanProfile.interestPerMonth!
            // let interestPercent= balance.totalInterestPercent - percent
            let interestDiscount = -0;

            switch (loanProfile.interestFactor) {
                case "principalBalance":
                    interestDiscount = balance.principal * (percent / 100)
                    break;
                case "principalTotal":
                    interestDiscount = form.principal * (percent / 100)
                    break;
                case "totalBalance":
                    interestDiscount = balance.balance * (percent / 100)
                    break;
            }

            let lastInterest = form.interestRecords!.reduce((p :  {index: number , dateEnd:string,dateStart:string } | null,v: LoanInterest, index:number)=>{
                if(p == null) return {index, dateEnd:v.dateEnd,dateStart:v.dateStart}
                if(moment(p.dateEnd).isSameOrBefore(v.dateEnd)){
                    return moment(p.dateStart).isBefore(v.dateStart) ? {index, dateEnd:v.dateEnd,dateStart:v.dateStart}  : p;
                }
                return moment(p.dateEnd).isBefore(v.dateEnd) ?  {index, dateEnd:v.dateEnd,dateStart:v.dateStart} : p;
            }, null  )
            if(lastInterest == null ) return {
                discountAmount : 0
            }
            form.interestRecords![lastInterest.index].amount =  form.interestRecords![lastInterest.index].amount - interestDiscount;
            form.interestRecords![lastInterest.index].dateEnd =  currentDate.format("YYYY-MM-DD");
            return {
                discountAmount : interestDiscount
            }
        }
    }
    
    return computeInterest;
}