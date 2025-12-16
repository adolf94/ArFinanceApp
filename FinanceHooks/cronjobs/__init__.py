import datetime
import azure.functions as func
import logging

from FlaskApp.email_modules import process_unread_emails

# Assuming your scheduled logic is in a reusable function, 
# for example, in a file named 'scheduled_tasks.py' at the root of your project
# from scheduled_tasks import run_my_scheduled_job 

def main(mytimer: func.TimerRequest) -> None:
    """
    This function is executed automatically on the schedule defined in function.json.
    """

    utc_timestamp = datetime.datetime.utcnow().isoformat()
    
    if mytimer.past_due:
        logging.info('The timer is running late! The last scheduled run was missed.')

    logging.info(f'Python Timer trigger function executed at {utc_timestamp}')

    # ➡️ CALL YOUR ACTUAL TIMER LOGIC HERE
    try:
        # Example: run_my_scheduled_job() 
        process_unread_emails()
        logging.info('Scheduled task successfully completed.')
    except Exception as e:
        logging.error(f'Error executing scheduled task: {e}')