import { CreateTransactionDto, HookMessage, ScheduledTransactions, Transaction } from "FinanceApi";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { useMutateSchedule } from "../../repositories/scheduledTasks";
import { getReferenceName } from "../Notifications/selectionByHook";
import { logReferenceInstance } from "../../repositories/hookReference";
import { useMutateTransaction } from "../../repositories/transactions";
import { useConfirm } from "material-ui-confirm";


interface UseSubmitTransactionParams {
  transaction: Partial<CreateTransactionDto>,
  schedule: ScheduledTransactions | null,
  transactionId: string,
  notification: HookMessage,
  hookConfig : any
}

export const useSaveMultipleTransaction =  ()=>{

      const mutateTransaction = useMutateTransaction()
      const newTransaction = (index, transaction, notification, conf)=>{
            const newItem: Partial<Transaction> = {
              id: transaction.id,
              addByUserId: "1668b555-9788-40ed-a6e8-feeabe9538f6",
              creditId: transaction.creditId,
              debitId: transaction.debitId,
              amount: transaction.amount,
                vendorId: transaction.vendorId,
              vendor:transaction.vendor,
              date: moment(transaction.date).toISOString(),
              dateAdded: moment().toISOString(),
              reference: transaction.reference,
              description: (transaction.description || ""),
              type: transaction.type,
              scheduleId: transaction.scheduleId,
              notifications:transaction.notifications,
              tags : transaction.tags
            };
          // newItem.notifications = [`${notification.monthKey}|${notification.id}`]
          

        if(conf && index == 0){

          const isCreditRefSameAsVendor = conf.vendor == conf.credit
          const isDebitRefSameAsVendor = conf.vendor == conf.debit
          let crediRef = {
            referenceName : getReferenceName(conf.credit, notification),
            accountId: transaction.creditId,
            vendorId: isCreditRefSameAsVendor ? transaction.vendorId : null,
            type:transaction.type,
            subConfig:conf.subConfig

          }

          let debitRef = {
            referenceName : getReferenceName(conf.debit, notification),
            accountId: transaction.debitId,
            vendorId: isDebitRefSameAsVendor ? transaction.vendorId : null,
            type:transaction.type,
            subConfig:conf.subConfig

          }

          let vendorRef = (!isCreditRefSameAsVendor && !isDebitRefSameAsVendor) ? {
              
            referenceName : getReferenceName(conf.vendor, notification),
            accountId: null,
            vendorId: transaction.vendorId ,
            type:transaction.type,
            subConfig:conf.subConfig
          }: null
          
          logReferenceInstance(crediRef)
          logReferenceInstance(debitRef)
          !!vendorRef && logReferenceInstance(vendorRef)
        }
        return mutateTransaction
            .create({ ...newItem })
      }

      const updateTransaction = (transaction)=>{
        const newItem: Partial<Transaction> = {
              id: transaction.id,
              addByUserId: "1668b555-9788-40ed-a6e8-feeabe9538f6",
              creditId: transaction.creditId,
              debitId: transaction.debitId,
              amount: transaction.amount,
                vendorId: transaction.vendorId,
              vendor:transaction.vendor,
              date: moment(transaction.date).toISOString(),
              dateAdded: moment().toISOString(),
              reference: transaction.reference,
              description: (transaction.description || ""),
              type: transaction.type,
              scheduleId: transaction.scheduleId,
              notifications:transaction.notifications,
              tags : transaction.tags
            };
        return mutateTransaction.update(newItem)
      }

      return {updateTransaction, newTransaction}
}


const useSubmitTransaction = ({transaction : formData,schedule , transactionId:transId, notification, hookConfig:conf} : UseSubmitTransactionParams)=>{
      const mutateSchedule = useMutateSchedule();
      const confirm = useConfirm();
        const mutateTransaction = useMutateTransaction()
  
      const submitTransaction = async (onWaiting:(props:any)=>any) => {
        
        return new Promise((res,rej)=>{

          const newItem: Partial<Transaction> = {
            id: formData.id,
            addByUserId: "1668b555-9788-40ed-a6e8-feeabe9538f6",
            creditId: formData.creditId,
            debitId: formData.debitId,
            amount: formData.amount,
              vendorId: formData.vendorId,
            vendor:formData.vendor,
            date: moment(formData.date).toISOString(),
            dateAdded: moment().toISOString(),
            reference: formData.reference,
            description: schedule.enabled? 
              `Installment 1 of ${schedule.iterations}\n${formData.description}`
              :(formData.description || ""),
            type: formData.type,
            scheduleId: formData.scheduleId,
            notifications:formData.notifications,
            tags : formData.tags
          };
      
          const confirmedTransaction = async ()=>{
            if (transId === "new") {
              let responseSched;
              if (schedule?.enabled) {
                responseSched = await mutateSchedule.create({...schedule, description: formData.description});
              }
      
      
              localStorage.setItem("stg_transaction", formData.id)
              console.log(newItem)
      
              if(conf){
                newItem.notifications = [`${notification.monthKey}|${notification.id}`]
                const isCreditRefSameAsVendor = conf.vendor == conf.credit
                const isDebitRefSameAsVendor = conf.vendor == conf.debit
      
                let crediRef = {
                  referenceName : getReferenceName(conf.credit, notification),
                  accountId: formData.creditId,
                  vendorId: isCreditRefSameAsVendor ? formData.vendorId : null,
                  type:formData.type,
                  subConfig:conf.subConfig
      
                }
      
                let debitRef = {
                  referenceName : getReferenceName(conf.debit, notification),
                  accountId: formData.debitId,
                  vendorId: isDebitRefSameAsVendor ? formData.vendorId : null,
                  type:formData.type,
                  subConfig:conf.subConfig
      
                }
      
                let vendorRef = (!isCreditRefSameAsVendor && !isDebitRefSameAsVendor) ? {
                    
                  referenceName : getReferenceName(conf.vendor, notification),
                  accountId: null,
                  vendorId: formData.vendorId ,
                  type:formData.type,
                  subConfig:conf.subConfig
                }: null
                
                logReferenceInstance(crediRef)
                logReferenceInstance(debitRef)
                !!vendorRef && logReferenceInstance(vendorRef)
              }
      
              onWaiting(newItem)
              return mutateTransaction
                  .create({ ...newItem, scheduleId: responseSched?.id })

      
            } else {
              onWaiting(newItem)
              return mutateTransaction.update(newItem)
            }
            
          }
      
      
          if(Number.parseInt(formData.amount) === 0) return confirm({description: "Are you sure you want to submit with no amount?"})
              .then(e=>{
                confirmedTransaction()
              })
      
          confirmedTransaction();
        })
      };

      return submitTransaction
}


export default useSubmitTransaction