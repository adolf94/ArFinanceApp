import re



#AppName
    #bpi_
    #vybe_
    #gcash_

#transactionType
    #_receive = Receive from same Bank
    #_receive_from_bank = Receive from Other Bank
    #_pay = Paid via QR
    #_cashin = Cash in




def handle_notif(jsonBody : dict):
    

    match jsonBody["notif_pkg"]:
        case "com.globe.gcash.android": 
            #GCash App
            return handle_gcash_notif(jsonBody)
        case "com.bpi.ng.app": 
            #BPI Bank App
            return handle_bpi_notif(jsonBody)
        case "com.indivara.bpi": 
            #Vybe by BPI
            return handle_vybe_notif(jsonBody)
        
        

        case _:
            return {
                "matchedConfig":"notif",
                "success": False
            }
            



def handle_bpi_notif(data:dict):
    #Your account XXXXXXXXXXX642 has been credited Php 1,590.00.
    reg = "(Your account (X+[0-9]*) has been credited Php ([0-9,\.]*).)"
    searc = re.search(reg, data["notif_msg"])
    if(searc):
        match = re.findall(reg, data["notif_msg"])
        if(len(match) == 0):
            return {
                "matchedConfig" : "notif_bpi",
                "success" : False
            }
        return {
            "matchedConfig" : "notif_bpi_receive_from_bpi",
            "success" : True,
            "ownAcct": match[0][1],
            "amount": match[0][2]
        }
    



def handle_vybe_notif(data:dict):



    match(data["notif_title"]):
        case "Bank Transfer Successful":
            #You have transferred Php 500.00 to WISE PILIPINAS, INC. account ending in XXXXXX7612. Your new balance is Php 9,851.00. Ref. No. IB00325c75188e1
            reg = "(You have transferred Php ([0-9\.,]*) to ([A-Z,\. ]+) account ending in (X+[0-9]+). Your new balance is Php ([0-9\.,]+). Ref. No. ([a-zA-Z0-9]+))"
            match = re.findall(reg, data["notif_msg"])

            if(len(match) == 0):
                return {
                    "matchedConfig" : "notif_vybe_transfer_bank",
                    "success" : False
                }
            return {
                "matchedConfig" : "notif_vybe_transfer_bank",
                "success" : True,
                "reference":match[0][5],
                "recipientBank":match[0][2],
                "recipientAcct": match[0][3],
                "newBalance": match[0][4],
                "amount": match[0][1]
            }
        

        case "Pay Merchant" :
            #Hi ADOLF REY ABAD ALONG, your payment to Andoks 1113 of PHP 399.00 has been successfully posted Ref.no. 005389414087335.
            reg = '(Hi ([A-Z ]+), your payment to ([A-Za-z0-9 ]+) of PHP ([0-9,\.]+) has been successfully posted Ref.no. ([0-9]+).)'
            match = re.findall(reg, data["notif_msg"])

            if(len(match) == 0):
                return {
                    "matchedConfig" : "notif_vybe_pay",
                    "success" : False
                }
            return {
                "matchedConfig" : "notif_vybe_pay",
                "success" : True,
                #2 : Name
                "recipientName": match[0][2],
                "reference": match[0][4],
                "amount": match[0][3]
            }
        
        case "Top Up":
            #You have received Php 20,000.00 from BPI Online on 2024/12/28 07:21:49 PM. Your new wallet balance is Php 20,351.00. Ref. no. 1735384905620.
            reg = "(You have received Php ([0-9\.,]+) from ([A-Za-z ]+) on *([0-9PMAMN\/ :]+). Your new wallet balance is Php ([0-9,\.]+). Ref. no. ([0-9]+).)"
            match = re.findall(reg, data["notif_msg"])
            if(len(match) == 0):
                return {
                    "matchedConfig" : "notif_vybe_cashin",
                    "success" : False
                }
            return {
                "matchedConfig" : "notif_vybe_cashin",
                "success" : True,
                #2 : Name
                "dateTime": match[0][3],
                "newBalance": match[0][4],
                "reference": match[0][5],
                "senderBank":match[0][2],
                "amount": match[0][1]
            }
        

        case _:
            return {
                "matchedConfig":"notif_vybe",
                "success": False
            }



def handle_gcash_notif(data : dict):

    #You have received PHP 10000.00 of GCash from LE****D V. 09298701555.
    if(data["notif_title"] == "You have received money in GCash!"):
        reg = "(You have received PHP ([0-9\.]+) of GCash from ([A-Z\*\ \.]+) ([0-9]*)\.)"
        match = re.findall(reg, data["notif_msg"])
        if(len(match) == 0):
            return {
                "matchedConfig" : "notif_gcash_receive",
                "success" : False
            }
        
        return {
            "matchedConfig" : "notif_gcash_receive",
            "success" : True,
            "senderName": match[0][2],
            "senderAcct": match[0][3],
            "amount": match[0][1]
        }
    else:   
        return {
            "matchedConfig":"notif_gcash",
            "success": False
        }