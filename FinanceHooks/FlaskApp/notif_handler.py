import re
from FlaskApp.regex_utility import regex_matches_tolist, get_regex_match


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
            print("run handle vybe")
            return handle_vybe_notif(jsonBody)
        
        

        case _:
            return {"data": {
                "matchedConfig":"notif",
                "success": False
            }}
            



def handle_bpi_notif(data:dict):
    #Your account XXXXXXXXXXX642 has been credited Php 1,590.00.
    reg = r"(Your account (X+[0-9]*) has been credited Php ([0-9,\.]*).)"
    searc = get_regex_match(reg, data["notif_msg"])
    if(searc == None):
        return { 
            "data" : {
                "matchedConfig" : "notif_bpi",
                "success" : False
            },
            "location": None 
        }
    
    output = regex_matches_tolist(searc)
    return {
        "data" :{
            "matchedConfig" : "notif_bpi_receive_from_bpi",
            "success" : True,
            "ownAcct": output[1]['group'],
            "amount": output[2]['group']
        },
        "location" : {
            "ownAcct": output[1]['span'],
            "amount": output[2]['span']
        }
    }
    



def handle_vybe_notif(data:dict):


    match(data["notif_title"]):
        case "Bank Transfer Successful":
            #You have transferred Php 500.00 to WISE PILIPINAS, INC. account ending in XXXXXX7612. Your new balance is Php 9,851.00. Ref. No. IB00325c75188e1
            reg = r"(You have transferred Php ([0-9\.,]*) to ([A-Za-z,\. ]+) account ending in (X+[0-9a-zA-Z]+). Your new balance is Php ([0-9\.,]+). Ref. No. ([a-zA-Z0-9]+))"
           
            match = get_regex_match(reg, data["notif_msg"])
            if(match == None):
                return {"data": {
                    "matchedConfig" : "notif_vybe_transfer_bank",
                    "success" : False
                }, "location": None}
            
            print(match)


            output = regex_matches_tolist(match)
            # print(output)
            return {"data" : {
                "matchedConfig" : "notif_vybe_transfer_bank",
                "success" : True,
                "reference":output[5]['group'],
                "recipientBank":output[2]['group'],
                "recipientAcct": output[3]['group'],
                "newBalance": output[4]['group'],
                "amount": output[1]['group']
            }, "location" : {
                "reference":output[5]['span'],
                "recipientBank":output[2]['span'],
                "recipientAcct": output[3]['span'],
                "newBalance": output[4]['span'],
                "amount": output[1]['span']
            }}
        

        case "Pay Merchant" :
            #Hi ADOLF REY ABAD ALONG, your payment to Andoks 1113 of PHP 399.00 has been successfully posted Ref.no. 005389414087335.
            reg = r'(Hi ([A-Z ]+), your payment to ([A-Za-z0-9 ]+) of PHP ([0-9,\.]+) has been successfully posted Ref.no. ([0-9]+).)'
            match = get_regex_match(reg, data["notif_msg"])

            if(match == None):
                return {"data": {
                    "matchedConfig" : "notif_vybe_pay",
                    "success" : False
                }, "location": None}
            


            output = regex_matches_tolist(match)
            return {"data": {
                "matchedConfig" : "notif_vybe_pay",
                "success" : True,
                #2 : Name
                "recipientName": output[2]['group'],
                "reference": output[4]['group'],
                "amount": output[3]['group']
            }, "location": {
                "recipientName": output[2]['span'],
                "reference": output[4]['span'],
                "amount": output[3]['span']
            }}
        
        case "Top Up":
            #You have received Php 20,000.00 from BPI Online on 2024/12/28 07:21:49 PM. Your new wallet balance is Php 20,351.00. Ref. no. 1735384905620.
            reg = r"(You have received Php ([0-9\.,]+) from ([A-Za-z ]+) on *([0-9PMAMN\/ :]+). Your new wallet balance is Php ([0-9,\.]+). Ref. no. ([0-9]+).)"
            match = get_regex_match(reg, data["notif_msg"])
            if(match == None):
                return {"data":{
                    "matchedConfig" : "notif_vybe_cashin",
                    "success" : False
                }, "location": None}
            
            output = regex_matches_tolist(match)
            return {"data":{
                "matchedConfig" : "notif_vybe_cashin",
                "success" : True,
                #2 : Name
                "dateTime": output[3]['group'],
                "newBalance": output[4]['group'],
                "reference": output[5]['group'],
                "senderBank":output[2]['group'],
                "amount": output[1]['group']
            }, "location": {
                "dateTime": output[3]['span'],
                "newBalance": output[4]['span'],
                "reference": output[5]['span'],
                "senderBank":output[2]['span'],
                "amount": output[1]['span']
            }}
        

        case _:
            return {"data":{
                "matchedConfig":"notif_vybe",
                "success" : False
            }, "location": None}


def handle_gcash_notif(data : dict):

    #You have received PHP 10000.00 of GCash from LE****D V. 09298701555.
    if(data["notif_title"] == "You have received money in GCash!"):
        reg = r"(You have received PHP ([0-9\.]+) of GCash from ([A-Z\*\ \.]+) ([0-9]*)\.)"
        match = get_regex_match(reg, data["notif_msg"])
        if(match == None):
            return {"data":{
                "matchedConfig" : "notif_gcash_receive",
                    "success" : False
                }, "location": None}
        
        output = regex_matches_tolist(match)
        return {"data":{
            "matchedConfig" : "notif_gcash_receive",
            "success" : True,
            "senderName": output[2]['group'],
            "senderAcct": output[3]['group'],
            "amount": output[1]['group']
        }, "location": {
            "senderName": output[2]['span'],
            "senderAcct": output[3]['span'],
            "amount": output[1]['span']
        }}
    else:   
        return {"data":{
            "matchedConfig":"notif_gcash",
                "success" : False
            }, "location": None}