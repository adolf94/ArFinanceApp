import bs4
import re
from markdownify import markdownify as md

def smart_html_to_markdown(html_content):
    soup = bs4.BeautifulSoup(html_content, 'html.parser')

    # 1. Preliminary Cleaning
    for element in soup(["script", "style", "noscript", "header", "footer"]):
        element.decompose()

    # 2. DETECTOR: Is this a "Table Hell" layout?
    # We count <td> tags. Layout emails often have 50+ <td> tags for a single message.
    table_cells = soup.find_all('td')
    is_messy_layout = len(table_cells) > 40 

    if is_messy_layout:
        # FALLBACK: Flatten tables to prevent pipe bars
        # We replace table tags with simple line breaks
        for tag in soup.find_all(['table', 'tr', 'td', 'div']):
            tag.insert_before('\n')
            tag.insert_after('\n')
        
        # Convert to string and strip non-breaking spaces before Markdown conversion
        clean_html = str(soup).replace('\xa0', ' ')
    else:
        # KEEP STRUCTURE: Standard conversion
        clean_html = str(soup)

    # 3. Convert to Markdown
    markdown_text = md(
        clean_html, 
        heading_style="atx", 
        bullets="- ",
        strip=['img', 'a'] # Optional: removes links/images to keep it extra clean
    )

    # 4. POST-PROCESS: The "Pipe Scrubber"
    # Even with markdownify, some pipes might sneak in. Let's clean them.
    cleaned_lines = []
    for line in markdown_text.splitlines():
        stripped = line.strip()
        
        # Regex to detect lines that are JUST pipes, spaces, or dashes (Table artifacts)
        if re.match(r'^[| \-\xa0\t]+$', stripped):
            continue
            
        # Remove single stray pipes at the start/end of lines
        line = re.sub(r'^\|+|\|+$', '', line).strip()
        
        if line:
            cleaned_lines.append(line)

    return "\n".join(cleaned_lines)

# --- Usage ---
# html_input = """ [Your HTML Here] """
# print(smart_html_to_markdown(html_input))