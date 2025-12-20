import datetime
import email
from email.policy import default
from email.utils import parsedate_to_datetime
import json
from google import genai
from google.genai import types
from google.genai.errors import APIError
import pytz
from uuid_extensions import uuid7
import time as t
import imaplib
import logging
import os
import re
import bleach
from bleach.css_sanitizer import CSSSanitizer

from bs4 import BeautifulSoup

from cosmos_modules import add_to_app, add_to_persist # <-- New Import

GMAIL_USER =  os.environ.get("SECONDARY_EMAIL","")
GMAIL_APP_PASSWORD = os.environ.get("SECONDARY_EMAIL_PW","")
IMAP_SERVER = 'imap.gmail.com'
max_retries = 3
tz_default = pytz.timezone(os.environ["TIMEZONE"])
PRIMARY_ACCOUNTS = os.environ.get("PRIMARY_EMAILS",[])
GOOGLE_GENAI_USE_VERTEXAI=True

def process_with_ai(item):
    client = genai.Client(api_key=os.environ['GEMINI_API_KEY'], vertexai=True)
    
    prompt = f"""
        I am providing an email, it may or may not be a financial transaction email. if it is not, provide a description on the output of the current content and type to be "non_transaction", you may keep other fields blank. 

        Subject: {item["subject"]}
        From: {item["sender"]}
        DateTime Sent: {item["timestamp"]}

    `````````
        {item["default"]}

    `````````


        I would expect the following keys in JSON format
        ```````
        - transactionType  : string -  the transaction executed (Samples: "bills_pay", "pay_merchant", "transfer", "transfer_via_instapay", "transfer_via_pesonet"). If it shows transfer to other bank use  "transfer_via_instapay"
        - app: string - Use gmail since the source application is gmail
        - description : string - description for the transaction, include a summary, recipient name for the transaction. Be more concise on the text. Make it at least 60 characters.
        - reference : string - the reference number that can be used in later time. for record purposes
        - datetime : datetime- the date and time the transaction was executed in the format of "YYYY-MM-DDTHH:mm:ssZ". Convert from GMT +8:00 if it was not provided
        - senderAcct  : string - (source account) the account number used to send / pay as mentioned in the screenshot
        - success: bool - if the email is a financial transaction or not.
        - senderBank  : string - (source bank) the bank of the account used to send / pay as mentioned in the screenshot
        - senderName  : string - the name or nickname used to send / pay as mentioned in the screenshot
        - recipientAcct  : string - the destination account number of the transfer.
        - recipientBank  : string - the bank of the account of the recipient
        - recipientName  : string - the name or nickname of the recipient account as shown in the image. For Bills pay, this is the type of bill paid. It can be the merchant name
        - amount : decimal - the paid/transfered amount, always make this a positive number even if the picture indicates a negative number
        - transactionFee : decimal - the fee for the transaction (default value:0.00)
        - currency : string - the payment currency (default value: PHP)
        - otherData : json_object - key-value pairs of details that are not yet captured but can be used for referencing the transaction
        ```````

    """
    config = types.GenerateContentConfig(
        response_mime_type="application/json"
    )
    for attempt in range(max_retries):
        try:
            logging.info(f"Attempt {attempt + 1}...")
            response = client.models.generate_content(model="gemini-2.5-flash",
                                                    contents=[prompt],
                                                    config=config
                                                )
            
            return response
        except APIError as e:
            # Check for 503 (Service Unavailable/Overloaded) or 429 (Rate Limit)
            if e.code == 503 or e.code == 429:
                # Calculate exponential backoff delay
                wait_time = 2 ** attempt  # e.g., 1, 2, 4, 8, 16 seconds
                
                if attempt < max_retries - 1:
                    logging.warning(f"Error {e.code}: Model overloaded/rate limited. Retrying in {wait_time}s...")
                    t.sleep(wait_time)
                else:
                    # Last attempt failed, raise the final error
                    logging.error(f"Error {e.code}: Failed after {max_retries} attempts.")
                    raise e
            else:
                # Handle other unexpected API errors immediately
                logging.error(f"An unrecoverable API error occurred (Code {e.code}): {e}")
                raise e
        
        except Exception as e:
            # Catch other potential errors (e.g., network issues)
            logging.error(f"An unexpected error occurred: {e}")
            raise e

    return None # Should not be reached if max_retries is > 0

def process_unread_emails():
    """Connects to Gmail, fetches unread emails, analyzes, and marks them as read."""
    if(GMAIL_USER == ""):
        print(f"Gmail user is blank, skipping")
        return
    mail = imaplib.IMAP4_SSL(IMAP_SERVER)
    
    try:
        mail.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        print("Login successful.")

        # Select the Inbox for reading
        mail.select('inbox')

        # Search for UNSEEN (unread) emails.
        status, messages = mail.search(None, 'UNSEEN') 
        email_ids = messages[0].split()
        
        if not email_ids:
            print("No unread emails found.")
            return []
        print(f"Found {len(email_ids)} unread emails. Starting analysis...")


        output = []

        for e_id in email_ids:
            e_id_str = e_id.decode()
            
            # Fetch the full email content (RFC822)
            status, msg_data = mail.fetch(e_id, '(RFC822)') 
            
            if status != 'OK':
                print(f"Error fetching email ID {e_id_str}. Status: {status}")
                continue

            raw_email = msg_data[0][1]
            msg = email.message_from_bytes(raw_email, policy=default)
            if(is_validated_forward(msg) == False):
                continue
            subject = msg['subject'] if msg['subject'] else "[No Subject]"
            sender = msg['from']
            body = get_ai_ready_body(msg)

            body["subject"] = subject
            body["sender"] = sender
            body["action"] = "email_received"
            body["emailId"] = f"{e_id_str}|{GMAIL_USER}"
            body["timestamp"] = get_original_sent_time(msg).strftime("%Y-%m-%dT%H:%M:%SZ")
            
                    
            data = process_with_ai(body)

            output = json.loads(data.text)
            output["matchedConfig"] = "email_default"

            
            utc_aware_dt = datetime.datetime.now(datetime.UTC)
            id=uuid7( as_type='str')
            newItem = { 
                "Id" : id,
                "id": id,  
                "Date": datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "JsonData": body,
                "ExtractedData": output,
                "Location": {},
                "RawMsg":output["description"],
                "Type":"notif",
                "MonthKey": utc_aware_dt.astimezone(tz_default).strftime("%Y-%m-01"),
                "PartitionKey":"default",
                "$type": "HookMessage",
                "_ttl": 60*24*60*60,
                "IsHtml":False
            }

            add_to_app("HookMessages", newItem)
            add_to_persist("HookMessages", newItem)
            output.append(newItem)
    except imaplib.IMAP4.error as e:
        print(f"\nIMAP Login Error: {e}")
        print("Please check your email address, ensure IMAP is enabled in Gmail settings, and verify the 16-character App Password is correct.")
    except Exception as ex:
        mail.uid('STORE', e_id, '-FLAGS (\\Seen)'.encode("utf-8"))
        raise ex
    finally:
        # Close connection gracefully
        try:
            mail.close()
            mail.logout()
            print("\nIMAP connection closed.")
        except:
            pass # Ignore if connection was never established
    
        return output
# --- MAIN EXTRACTION FUNCTION (Prioritizing HTML) ---
def get_ai_ready_body(msg):
    """
    Extracts the best text content for AI analysis, prioritizing HTML conversion
    to capture structural data like tables in Markdown format.
    """
    output = {
        "plain_text": None,
        "html_content":None,
        "default": None
    }

    # Step 1: Walk the email to find text/plain and text/html parts
    for part in msg.walk():
        ctype = part.get_content_type()
        cdispo = str(part.get('Content-Disposition'))

        if 'attachment' in cdispo:
            continue

        try:
            charset = part.get_content_charset() or 'utf-8'
            # 'replace' handles characters not found in the target encoding
            payload = part.get_payload(decode=True).decode(charset, 'replace') 
        except Exception:
            continue

        if ctype == 'text/plain':
            output["plain_text"] = payload
        elif ctype == 'text/html':
            output["html_content"] = payload

    # --- HTML-FIRST PROCESSING ---
    if output["html_content"] :
        print("Processing text/html content (Priority 1: HTML-to-Markdown).")
        try:
            soup = BeautifulSoup(output["html_content"] , 'html.parser')
            
            # A. Targeted Table Conversion: Replace <table> tags with Markdown
            for table in soup.find_all('table'):
                markdown = html_to_markdown_table(table)
                
                # Create a placeholder element to replace the table
                markdown_div = soup.new_tag("div")
                # Use clear markers for the AI
                markdown_marker = f"\n---\nTRANSACTION TABLE START:\n{markdown}\nTRANSACTION TABLE END:\n---\n"
                markdown_div.string = markdown_marker
                table.replace_with(markdown_div)
            
            # B. Clean Text Extraction: Get the remaining text
            clean_text = soup.get_text(separator='\n', strip=True)
            
            # C. Final cleanup of excessive blank lines/whitespace
            final_text = re.sub(r'\n\s*\n', '\n\n', clean_text).strip()
            
            output["default"] = final_text
            return output
        
        except Exception as e:
            # Fall through to plain text if HTML parsing fails unexpectedly
            print(f"Warning: HTML parsing failed ({e}). Falling back to plain text.")
        
        output["html_content"] = sanitize_html(output["html_content"])

    # --- PLAIN TEXT FALLBACK ---
    if output["plain_text"] and len(output["plain_text"].strip()) > 50:
        print("Using text/plain content (Fallback).")
        output["default"] = output["plain_text"]
        return output
    
    # --- FINAL FALLBACK ---
    output["default"] = "[Email body is empty or unreadable]"
    return output

def get_original_sent_time(msg):
    """
    Attempts to retrieve the original sent time from custom headers 
    and falls back to the standard 'Date' header.
    
    Args:
        msg (email.message): The parsed email message object.
        
    Returns:
        datetime.datetime or None: The parsed original sent time, or None on failure.
    """
    
    # 1. CHECK FOR ORIGINAL DATE HEADERS (Highest Priority for Forwarded Mail)
    
    # Common headers used to preserve original send time
    original_date_headers = ['X-Original-Date', 'Original-Date', 'X-Forwarded-Date']
    
    original_date_str = None
    for header in original_date_headers:
        if msg.get(header):
            original_date_str = msg.get(header)
            print(f"  -> Found original date in: {header}")
            break
            
    if original_date_str:
        # Attempt to parse the found original date string
        try:
            # The email.utils.parsedate_to_datetime handles various RFC date formats
            return parsedate_to_datetime(original_date_str)
        except (TypeError, ValueError):
            print(f"  -> WARNING: Failed to parse original date string: {original_date_str}")
            # Fall through to the standard 'Date' header check

    # 2. FALLBACK TO STANDARD 'Date' HEADER
    
    standard_date_str = msg.get('Date')
    if standard_date_str:
        print("  -> Falling back to standard 'Date' header.")
        try:
            return parsedate_to_datetime(standard_date_str)
        except (TypeError, ValueError):
            print(f"  -> ERROR: Failed to parse standard 'Date' header: {standard_date_str}")
            return None
    
    # 3. FINAL FAILURE
    print("  -> ERROR: No recognizable date headers found.")
    return None

# --- REQUIRED HELPER FUNCTION (Assuming this is already defined) ---
def html_to_markdown_table(table_tag):
    """Converts a BeautifulSoup table tag into a clean Markdown table string."""
    # ... (Keep the exact implementation of this function from the previous response) ...
    table_markdown = []
    rows = table_tag.find_all('tr')
    
    data_rows = []
    for row in rows:
        cells = row.find_all(['th', 'td'])
        row_data = [re.sub(r'\s+', ' ', cell.get_text(strip=True)) for cell in cells]
        if row_data:
            data_rows.append(row_data)

    if not data_rows:
        return ""

    header = data_rows[0]
    if not header: return "" # Handle empty table

    # Generate Markdown format
    table_markdown.append("| " + " | ".join(header) + " |")
    separator = ["---"] * len(header)
    table_markdown.append("| " + " | ".join(separator) + " |")
    
    for data_row in data_rows[1:]:
        padded_row = data_row + [''] * (len(header) - len(data_row))
        table_markdown.append("| " + " | ".join(padded_row) + " |")
    
    return "\n" + "\n".join(table_markdown) + "\n"

def is_validated_forward(msg):
    """
    Performs comprehensive validation on a parsed email message (msg) 
    to confirm it originated from the primary email account via a Gmail server.
    
    Args:
        msg (email.message): The parsed email message object.
        primary_email (str): The primary Gmail address.
        secondary_email (str): The secondary Gmail address.
        
    Returns:
        bool: True if validation passes, False otherwise.
    """
    
    # Define GOOGLE_SERVER_PATTERN locally or ensure it's globally accessible
    GOOGLE_SERVER_PATTERN = re.compile(r'(google\.com|smtp\.gmail\.com|mail-by\d+\.google\.com|2002:a05|2002:a17|smtp id)', re.IGNORECASE)
    
    # =========================================================================
    # PART 1: SOURCE VALIDATION (Checking who initiated the delivery)
    # =========================================================================
    
    # Check for AUTOMATIC FORWARDING headers
    forwarded_to = msg.get('X-Forwarded-To', None)
    forwarded_for = msg.get('X-Forwarded-For', '')
    is_source_validated = False
    
    # Condition A: X-Forwarded-To exists and matches the secondary address (Always valid for auto-forward)
    if forwarded_to and forwarded_to.lower() == GMAIL_USER.lower():
        print("    --> Auto-Forward: 'X-Forwarded-To' matched (Source is valid).")
        is_source_validated = True
    
    # Condition B & C: Check if any primary email is the source (via X-* or From header)
    if not is_source_validated:
        
        # Check X-Forwarded-For header (Auto-forward fallback)
        for p_email in PRIMARY_ACCOUNTS:
            if re.search(re.escape(p_email), forwarded_for, re.IGNORECASE):
                print(f"    --> Auto-Forward: Primary address '{p_email}' found in 'X-Forwarded-For'.")
                is_source_validated = True
                break
        
        # Check 'From' header (Manual send)
        if not is_source_validated:
            from_header = msg.get('From', '')
            for p_email in PRIMARY_ACCOUNTS:
                if re.search(re.escape(p_email), from_header, re.IGNORECASE):
                    print(f"    --> Manual-Send: 'From' header is primary address '{p_email}'.")
                    is_source_validated = True
                    break

    if not is_source_validated:
        from_header = msg.get('From', '')
        print(f"❌ FAILED PART 1: Source is not a validated primary address. (From: {from_header})")
        return False

    # =========================================================================
    # PART 2: SERVER VALIDATION (Checking the delivery route via Gmail)
    # =========================================================================

    received_headers = msg.get_all('Received')
    
    if received_headers:
        # Check the TOP-MOST Received header (the last hop) for Google's server reference
        top_received = received_headers[0]
        
        if GOOGLE_SERVER_PATTERN.search(top_received):
            print(" VALIDATED PART 2: Top 'Received' header confirms Google server delivery.")
            return True
        else:
            print(" FAILED PART 2: Top 'Received' header does NOT confirm Google delivery.")
            print(f"    Header snippet: {top_received[:100]}...")
            return False
    else:
        print("❌ FAILED PART 2: No 'Received' headers found (Critical error).")
        return False
        
    # Should be unreachable if logic is sound, but included for safety
    return False


def sanitize_html(html_content: str) -> str:
    """
    Cleans and sanitizes HTML content to prevent XSS (Cross-Site Scripting) and 
    other script injection vulnerabilities.
    
    Args:
        html_content: The raw HTML content from the email.
        
    Returns:
        The cleaned and sanitized HTML content.
    """
    
    # --------------------------------------------------------------------------
    # 1. Define Whitelists (Allowed Tags, Attributes, and Styles)
    # --------------------------------------------------------------------------
    
    # Allowed HTML tags (e.g., structural and basic text formatting)
    ALLOWED_TAGS = [
        'a', 'abbr', 'acronym', 'b', 'blockquote', 'code', 'em', 'i', 'li', 'ol', 
        'p', 'strong', 'ul', 'br', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'table', 'tbody', 'thead', 'tr', 'td', 'th', 'img', 'center', 'font' # Added 'center' and 'font' to support the legacy email structure
    ]

    # Allowed attributes for ANY tag (e.g., global attributes)
    ALLOWED_ATTRIBUTES = {
        '*': ['class', 'id', 'style'], # Allowing 'style' here because we are using a CSS Sanitizer
        'a': ['href', 'title', 'target'], 
        'img': ['src', 'alt', 'width', 'height'],
        'font': ['color', 'face'] # Added 'color' and 'face' for the legacy <font> tag in the sample
    }

    # Allowed CSS properties (e.g., for inline 'style' attributes)
    ALLOWED_CSS_PROPERTIES = [
        'color', 'background-color', 'font-size', 'font-weight', 'text-align', 
        'margin', 'padding', 'border', 'line-height', 'border-collapse' # Added specific table styles
    ]

    # Initialize the CSS Sanitizer
    css_sanitizer = CSSSanitizer(allowed_css_properties=ALLOWED_CSS_PROPERTIES)

    # --------------------------------------------------------------------------
    # 2. Perform Sanitization
    # --------------------------------------------------------------------------
    
    cleaned_html = bleach.clean(
        html_content,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        css_sanitizer=css_sanitizer,
        strip=False # Removes disallowed tags instead of escaping them
    )
    
    return cleaned_html