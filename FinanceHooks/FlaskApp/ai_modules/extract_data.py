
from pathlib import Path
import re


def identify_from_filename(file_name, lines):
        

        fileName_withoutExt = file_name.split(".", 5)[0]
        pattern = r"Screenshot_([0-9]+)_([0-9]+)_([A-Za-z0-9]+)"
        match = re.search(pattern, fileName_withoutExt, re.IGNORECASE)

        

        if match:
            app = match.group(3).lower()
            print(app)
            if app == "gcash":
                return try_gcash(lines)
            elif app == "bpi":
                return
            

        else:
            # return extract_unsure_from_name(lines)
            return {
                "success" : False,
                "matchedConfig": "img"
            }


def try_gcash(lines):
    full_text = " ".join(lines)
    extracted_data = {}
    if re.search(r"BPI #MySaveUp", full_text, re.IGNORECASE):
        # GSave BPI
        # Note SMS can also be used
        extracted_data["source"] = "GSave_BPI"
        extracted_data["matchedConfig"] = "img_gsave_bpi"
        return {**output,"success":True}
        

    elif re.search(r"Express send", full_text, re.IGNORECASE):

        output =  extract_gcash_express(lines)
        return {**output,"success":True}
    

def extract_gcash_express(lines):
    """
    Extracts details from GCash transfer images.

    Args:
        lines (list): The lines of text extracted from the image.
        extracted_data (dict): The dictionary to store extracted information.

    Returns:
        dict: The updated dictionary with GCash-specific information.
    """
    # --- Attempt to find Recipient Name ---

    # --- Search for type 
    extracted_data = {}
    extracted_data["source"] = "GCash"

    recipient_patterns = [r"[A-Za-z \.\·]+\."]

    foundExpressSend = False

    for line in lines:
        if line.strip() == "Express Send":
            foundExpressSend = True
            next
        elif foundExpressSend == False:
            next
        else:
            if "recipientName" in extracted_data: break
            for pattern in recipient_patterns:
                match = re.search(pattern, line)
                if match: 
                    extracted_data["recipientName"] = match.group(0)
                break

        
        



    # for keyword in recipient_keywords:
    #     for line in lines:
    #         if keyword in line:
    #             parts = line.split(keyword, 1)
    #             if len(parts) > 1:
    #                 recipient_name = parts[1].strip()
    #                 if recipient_name:
    #                     extracted_data["recipient_name"] = recipient_name
    #                     break
    # if "recipient_name" in extracted_data:
    #     pass

    # --- Attempt to find Recipient Mobile Number ---
    mobile_number_patterns = [r"\+63( [0-9]+){3,4}"]
    for pattern in mobile_number_patterns:
        for line in lines:
            match = re.search(pattern, line)
            if match:
                extracted_data["recipientAcct"] = match.group(0).replace(" ", "")
                break
    if "recipientAcct" in extracted_data:
        pass

    # --- Attempt to find Reference Number ---
    reference_keywords = ["Ref No", "Reference No", "Reference Number"]
    reference_number_patterns = [r"\d{4}\s?\d{3}\s?\d{5,}", r"[A-Z0-9]{8,}"]
    for keyword in reference_keywords:
        for line in lines:
            if keyword in line:
                parts = line.split(keyword, 1)
                if len(parts) > 1:
                    ref_no_part = parts[1].strip()
                    for pattern in reference_number_patterns:
                        match = re.search(pattern, ref_no_part)
                        if match:
                            extracted_data["reference"] = match.group(0).replace(" ", "")
                            break
                    if "reference" in extracted_data:
                        break
    if "reference" in extracted_data:
        pass

    # --- Attempt to find Amount ---
    amount_patterns = r"([0-9.,]+)"
    foundAmount = False

    for line in lines:
        if line.strip() == "Amount":
            foundAmount = True
            next
        elif foundAmount == False:
            next
        else:
            if "amount" in extracted_data: break
            for pattern in recipient_patterns:
                match = re.search(amount_patterns, line)
                if match: 
                    extracted_data["amount"] = float(match.group(0).replace(",",""))
                break

            
    extracted_data["matchedConfig"] = "img_gcash_express"
        
    return extracted_data

