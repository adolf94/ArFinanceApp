import logging
import azure.functions as func
import os
import json
from datetime import datetime, timedelta
from azure.cosmos  import CosmosClient, DatabaseProxy
import requests
import logging
from functools import reduce

app = func.FunctionApp()
endpoint = os.environ["COSMOS_ENDPOINT"]
key = os.environ["COSMOS_KEY"]
dbName = os.environ["COSMOS_DB"]
SMS_KEY = os.environ["SMS_KEY"]
SMS_ENDPOINT = os.environ["SMS_ENDPOINT"]
SMS_ENABLED = os.environ["SMS_ENABLED"]







@app.timer_trigger(schedule="0 33 19 * * *", arg_name="myTimer", run_on_startup=True,
              use_monitor=False) 
def send_loan_reminder_3d(myTimer: func.TimerRequest) -> None:
    if myTimer.past_due:
        logging.info('The timer is past due!')
    db = open_db()
    container = db.get_container_client("Loans")
    threeDaysAfter = datetime.now() + timedelta(days=4)
    twoDaysAfter = datetime.now() + timedelta(days=3)
    today = datetime.now().strftime("%Y-%m-%d")
    dateString = threeDaysAfter.strftime("%Y-%m-%d")
    twoDaysString =  twoDaysAfter.strftime("%Y-%m-%d")

    #reminder with interest

    for loan in container.query(query="SELECT * from root c WHERE c.NextInterestDate  <= @threeDays AND  e.Date > @twoDays AND c.LastReminder<>@today", 
                                parameters=[
                                    dict(name="@threeDays",value=dateString),
                                    dict(name="@today",value=today),
                                    dict(name="@twoDays",value=twoDaysString)
                                ], enable_cross_partition_query=True):
        
        hasPlannedPayments = any(loan["ExpectedPayments"] > (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"))

        if(hasPlannedPayments):
            continue

        user = get_user_data(item["UserId"])
        if user == None:
            logging.warning("User was not found!")
            continue
        
        loanPayments = container.query(query="SELECT * from root c WHERE c.LoanId == @loanId", parameters=[dict(name="@loanId", value=item["Id"])], enable_cross_partition_query=True)


        principal = loan["Principal"] - reduce(lambda prev,cur : prev + cur.Amount, [x for x in loanPayments if x["AgainstPrincipal"] == True], 0.00)
        payments  = reduce(lambda prev,cur : prev + cur.Amount, loanPayments, 0.00)
        interests = reduce(lambda prev,cur: prev + cur.Amount, 0.00)
        dueDate = (threeDaysAfter + timedelta(days=-1)).strftime("%Y-%m-%d")
        balance = principal + payments + interests
        msg = f"This is a quick reminder on your loan balance of {balance} due on {dueDate} (in 3 days)."
        if(loan["LoanProfile"]["InterestPerMonth"] > 0):
            msg = " Failure of full payment shall incur interest charges. Payment of at more that {interests} shall reduce interest"


        isSuccess = send_sms(user.mobileNumber, msg)

        if(isSuccess):
            loan["LastReminder"] = today
            container.upsert_item(paymentToRemind)
            continue

        # Principal = loan.Principal - loan.Payment.Where(e => e.AgainstPrincipal == true).Sum(e => e.Amount),
		# 		Interests = loan.InterestRecords.Sum(e => e.Amount),
		# 		Payments = loan.Payment.Where(e => e.AgainstPrincipal == true).Sum(e => e.Amount),
		# 		Balance = loan.Principal + loan.Interests -
		# 		          loan.Payment.Where(e => e.AgainstPrincipal == true).Sum(e => e.Amount)
        



    
    for item in container.query_items(query="Select * from root c WHERE EXISTS(Select * from e IN c.ExpectedPayments WHERE e.Date <= @threeDays AND  e.Date > @twoDays ) and c.LastReminder<>@today", parameters=[
        dict(name="@threeDays",value=dateString),
        dict(name="@today",value=today),
        dict(name="@twoDays",value=twoDaysString)
    ],enable_cross_partition_query=True):
        user = get_user_data(item["UserId"])
        if user == None:
            logging.warning("User was not found!")
            continue
        paymentToRemind = next((x for x in item.ExpectedPayments if x.Date <= dateString & x.Date > twoDaysString), None)

        if paymentToRemind == None:
            continue
# send email and sms
        msg = f"This is a quick reminder on the planned payment of {paymentToRemind["Amount"]} due on {paymentToRemind["Date"]}"
        isSuccess = send_sms(user.mobileNumber, msg)
        if isSuccess:
            paymentToRemind["LastReminder"] = today
            container.upsert_item(paymentToRemind)
            continue
    logging.info('Python timer trigger function executed.')
    

def send_sms(recipient: str, message:str ) -> bool:
    
    headers = {
        "x-api-key": SMS_KEY
    }
    body = {
        "message": message,
        "recipients": [f'+63{recipient}']
    }

    if(not SMS_ENABLED):
        logging.info(f"SMS is disabled. Message not sent to {recipient} : {message}")
        return True
    response = requests.post(url=SMS_ENDPOINT, json=body, headers=headers)

    return response.ok


def open_db() -> DatabaseProxy:

    client = CosmosClient(endpoint, credential=key)
    db = client.get_database_client(database=dbName)
    
    return db

def get_user_data(guid : str) -> dict:
    db = open_db()
    users = db.get_container_client("User")


    item = next(users.query_items(query="Select * from root c WHERE Id=@Id", partition_key="default"),None)
    
    return item
