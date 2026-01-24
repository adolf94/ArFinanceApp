

email_templates = {
    "shopee_default" : """
        I am providing an email, it may or may not be a financial transaction email. if it is not, provide a description on the output of the current content and type to be "non_transaction", you may keep other fields blank. 

        Subject: {subject}
        From: {sender}
        DateTime Sent: {timestamp}

    `````````
        {ai_content}

    `````````

        I would expect the following keys in JSON format
        ```````
        - transactionType  : string -  the transaction executed  (Use only these values: "bills_pay", "pay_merchant", "transfer", "transfer_via_instapay", "transfer_via_pesonet")
                    . If it shows transfer to other bank use  "transfer_via_instapay"  (add in otherData if the transaction is not any of the above values as "exactTransactionType" )
        - app: string - Use gmail since the source application is gmail
        - description : string - description for the transaction, include a summary, recipient name for the transaction. Be more concise on the text. Make it at least 60 characters.
        - reference : string - the reference number that can be used in later time for record purposes. other names are : confirmation number
        - datetime : datetime- the date and time the transaction was executed in the format of "YYYY-MM-DDTHH:mm:ssZ". Convert from GMT +8:00 if it was not provided
        - senderAcct  : string - (source account) the account number used to send / pay as mentioned in the email
        - success: bool - if the email is a financial transaction or not.
        - senderBank  : string - (source bank) the bank of the account used to send / pay as mentioned in the email
        - senderName  : string - the name or nickname used to send / pay as mentioned in the email
        - emailSender  : string - {sender}
        - recipientAcct  : string - the destination account number of the transfer.  other names are : "merchant reference number"
        - recipientBank  : string - the bank of the account of the recipient
        - recipientName  : string - the name or nickname of the recipient account as shown in the image. For Bills pay, this is the type of bill paid. It can be the merchant name
        - amount : decimal - the paid/transfered amount, always make this a positive number even if the picture indicates a negative number
        - transactionFee : decimal - the fee for the transaction (default value:0.00)
        - currency : string - the payment currency (default value: PHP)
        - items : Product[] - list of items that is referenced on the email
        - otherData : json_object - key-value pairs of details that are not yet captured but can be used for referencing the transaction
        ```````

        Product model
        ```````
        - Name : string - The name of the product
        - Variantion : string - the variant selected (if any) - if not found use "default"
        - Quantity : int - Count of the product
        - Subtotal : decimal - Total Product price 
        - Discount : decimal - Total Discount (if it is not explicitly indicated, use the calculate in proportion of the total receipt price and the subtotal of this product)
        - NetPrice : decimal - the subtotal minus the discount
        ```````

    """,
    "transaction_default": """

        I am providing an email, it may or may not be a financial transaction email. if it is not, provide a description on the output of the current content and type to be "non_transaction", you may keep other fields blank. 

        Subject: {subject}
        From: {sender}
        DateTime Sent: {timestamp}

    `````````
        {ai_content}

    `````````

        I would expect the following keys in JSON format
        ```````
        - transactionType  : string -  the transaction executed  (Use only these values: "bills_pay", "pay_merchant", "transfer", "transfer_via_instapay", "transfer_via_pesonet")
                    . If it shows transfer to other bank use  "transfer_via_instapay"  (add in otherData if the transaction is not any of the above values as "exactTransactionType" )
        - app: string - Use gmail since the source application is gmail
        - description : string - description for the transaction, include a summary, recipient name for the transaction. Be more concise on the text. Make it at least 60 characters.
        - reference : string - the reference number that can be used in later time for record purposes. other names are : confirmation number
        - datetime : datetime- the date and time the transaction was executed in the format of "YYYY-MM-DDTHH:mm:ssZ". Convert from GMT +8:00 if it was not provided
        - senderAcct  : string - (source account) the account number used to send / pay as mentioned in the email
        - success: bool - if the email is a financial transaction or not.
        - senderBank  : string - (source bank) the bank of the account used to send / pay as mentioned in the email
        - senderName  : string - the name or nickname used to send / pay as mentioned in the email
        - emailSender  : string - {sender}
        - recipientAcct  : string - the destination account number of the transfer.  other names are : "merchant reference number"
        - recipientBank  : string - the bank of the account of the recipient
        - recipientName  : string - the name or nickname of the recipient account as shown in the image. For Bills pay, this is the type of bill paid. It can be the merchant name
        - amount : decimal - the paid/transfered amount, always make this a positive number even if the picture indicates a negative number
        - transactionFee : decimal - the fee for the transaction (default value:0.00)
        - currency : string - the payment currency (default value: PHP)
        - otherData : json_object - key-value pairs of details that are not yet captured but can be used for referencing the transaction
        ```````

    """
}