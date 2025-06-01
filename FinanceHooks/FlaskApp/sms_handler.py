




from FlaskApp.regex_utility import get_regex_match, regex_matches_tolist


def handle_sms(jsonBody : dict):
    match(jsonBody["sms_rcv_sender"]):

        case "BPI":
           return handle_bpi_sms(jsonBody)

        case "Unionbank":
           return handle_unionbank_sms(jsonBody)
        
        case "HSBC":
           return handle_unionbank_sms(jsonBody)
        
        case "MaybankPH":
           return handle_maybank_sms(jsonBody)

        case _:
            return {"data":{
                "matchedConfig":"sms",
                "success":False
            }}

def handle_bpi_sms(data):
    #[BPI] DO NOT SHARE: Use your SECRET one-time PIN 930765 to complete your Cardless Withdrawal of PHP 5,000. For the Order ID, go to your BPI app's inbox.
    reg = r"(\[BPI\] DO NOT SHARE: Use your SECRET one-time PIN [0-9]+ to complete your Cardless Withdrawal of PHP ([0-9,]+). For the Order ID, go to your BPI app's inbox.)"
    
    searc = get_regex_match(reg, data["sms_rcv_msg"])
    if searc != None:
        output = regex_matches_tolist(searc)
        return {"data":{
            "matchedConfig":"sms_bpi_cashless_incomplete",
            "success" : True,
            "amount": output[1]['group']
        }, "location": {
            "amount": output[1]['group']
        }}
    
    
    return {data:{
        "matchedConfig" : "sms_bpi",
        "success" : False,
    }}
    

def handle_unionbank_sms(data):
    #You paid P28,000.00 to Cherry Ann Florencio using your UnionBank Credit Card ending in 1220. Reference No.: CFT3109336.1. Thank you for using UnionBank PayDirect!

    reg = r"(You paid P([0-9\.,]+) to ([A-Za-z\ ]+) using your UnionBank Credit Card ending in ([0-9]+). Reference No.: ([\.A-Z0-9]+). Thank you for using UnionBank PayDirect!)"
    searc = get_regex_match(reg, data["sms_rcv_msg"])
    if searc != None:
        output = regex_matches_tolist(searc)
        return {"data":{
            "matchedConfig":"sms_unionbank_paydirect",
            "success" : True,
            "amount": output[1]['group'],
            "recipientName": output[2]['group'],
            "ownAcct":output[3]['group'],
            "reference":output[4]['group'],
        }, "location": {
            "amount": output[1]['span'],
            "recipientName": output[2]['span'],
            "ownAcct":output[3]['span'],
            "reference":output[4]['span'],
        }}
    


    reg = r"(Thank you for using your UnionBank Credit card ending in ([0-9]+) for the amount PHP ([\.0-9,]+) at ([A-Za-z0-9 ]+). For inquiries call \+632-8841-8600. Ref# ([0-9]+))"
    searc = get_regex_match(reg, data["sms_rcv_msg"])
    if searc != None:
        output = regex_matches_tolist(searc)
        return  {"data":{
            "matchedConfig":"sms_unionbank_paydirect",
            "success" : True,
            "amount": output[2]['group'],
            "recipientName": output[3]['group'],
            "ownAcct":output[1]['group'],
            "reference":output[4]['group'],
        }, "location": {
            "amount": output[2]['span'],
            "recipientName": output[3]['span'],
            "ownAcct":output[1]['span'],
            "reference":output[4]['span'],
        }}

    return {"data":{
        "matchedConfig" : "sms_unionbank",
        "success" : False,
    }}

def handle_maybank_sms(data):
    #PHP 10,018.00 was withdrawn from XXXXXXX0518 on 26-MAY-2025/11:39:14 at TERMINAL 9888. For inquiries, please call (02)85883888. Maybank is regulated by the BSP
    reg = r'PHP ([0-9,\.]+) was withdrawn from ([0-9X]+) on ([0-9A-Z\-\/:]+) at TERMINAL [0-9]+. For inquiries, please call [\()0-9]+. Maybank is regulated by the BSP'
    
    searc = get_regex_match(reg, data["sms_rcv_msg"])
    if searc != None:
        output = regex_matches_tolist(searc)
        return  {"data":{
            "matchedConfig":"sms_maybank_withdrawal",
            "success" : True,
            "amount": output[0]['group'],
            "ownAcct":output[1]['group'],
        }, "location": {
            "amount": output[0]['span'],
            "ownAcct":output[1]['span'],
        }}
    

    return {data:{
        "matchedConfig":"sms_maybank",
        "success":False
    }}

def handle_hsbc_sms(data):
    #YOUR HSBC CARD ENDING IN *** 7187 WAS USED AT SHINSEN SUSHI BAR ON 10/05/2025 AT 20:31 IN THE AMOUNT OF PHP3174.08. PLS CALL 0279768000 FOR ANY CONCERNS.
    reg = r'(YOUR HSBC CARD ENDING IN [\*]* ([0-9]+) WAS USED AT ([A-Z ]+) ON ([0-9\/]+ AT [0-9\:]+) IN THE AMOUNT OF PHP([0-9\.,]+). PLS CALL 0279768000 FOR ANY CONCERNS.)'
    
    searc = get_regex_match(reg, data["sms_rcv_msg"])
    if searc != None:
        output = regex_matches_tolist(searc)
        return  {"data":{
            "matchedConfig":"sms_hsbc_cardused",
            "success" : True,
            "amount": output[4]['group'],
            "recipientName": output[2]['group'],
            "ownAcct":output[1]['group'],
        }, "location": {
            "amount": output[4]['span'],
            "recipientName": output[2]['span'],
            "ownAcct":output[1]['span'],
        }}
    

    return {data:{
        "matchedConfig":"sms_hsbc",
        "success":False
    }}