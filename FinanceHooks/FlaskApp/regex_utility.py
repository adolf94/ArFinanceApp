import re


def get_regex_match(pattern, text):

    matches = re.finditer(pattern, text)
    for m in matches:
        return m
    return None


def regex_matches_tolist(match):
    output = []
    i = 1
    while i >= 0:
        try:
            output.append({
                'span': [match.start(i),match.end(i) ],
                "group" : match.group(i)
            })  
            i += 1   
        except:
            break
    return output



def substitute_text(template: str, hook: dict) -> str:
    """
    Substitutes variables in a template string with values from a hook message.
    Variables are in the format ${path.to.value}.
    - $ at the start of the path indicates the value is in hook['extractedData'].
    - # at the start of the path indicates the value is in hook['jsonData'].
    - Otherwise, the path is relative to the top level of the hook.
    """
    
    # Python equivalent for: template.match(/\$\{([$#\.a-zA-Z]+)\}/g)
    # Finds all occurrences of ${...}
    vars_to_substitute = re.findall(r'\$\{([$#\.a-zA-Z_]+)\}', template)
    
    current = template

    def get_data_from_hook(variable_path: str) -> str:
        """
        Retrieves the value from the hook dictionary based on the variable path.
        The variable_path is the content *inside* the ${...}, e.g., '$.field'.
        """
        
        # The JavaScript version extracts the path from ${path} by doing 
        # data.substring(2, data.length - 1) which is effectively removing the ${ and }.
        # In this Python implementation, `variable_path` is already the content inside the braces.
        
        props = variable_path.split('.')
        hook_item = hook  # Start at the root of the hook object

        for i, prop in enumerate(props):
            if i == 0 and prop == "$":
                # Check for "$" prefix - start from 'extractedData'
                if 'ExtractedData' in hook_item:
                    hook_item = hook_item['ExtractedData']
                else:
                    # Handle case where the path root doesn't exist
                    return f'${{{variable_path}}}'
            elif i == 0 and prop == "#":
                # Check for "#" prefix - start from 'jsonData'
                if 'JsonData' in hook_item:
                    hook_item = hook_item['JsonData']
                else:
                    # Handle case where the path root doesn't exist
                    return f'${{{variable_path}}}'
            else:
                # Regular property access
                if isinstance(hook_item, dict) and prop in hook_item:
                    hook_item = hook_item[prop]
                else:
                    # Property not found at this level - return the original template string
                    # for this variable (similar to the JS logic returning props[i])
                    # We'll return the original un-substituted variable as a fallback.
                    return f'${{{variable_path}}}'
                
                if i == len(props) - 1:
                    # Last property in the path, return the value as a string
                    return str(hook_item)
        
        # Should not be reached if props is not empty, but included as a safeguard.
        return f'${{{variable_path}}}'

    # Iterate over all found variables and replace them in the template
    for var_path in vars_to_substitute:
        # The var_path here is the content *inside* the ${...}, e.g., '$.field'
        replacement_value = get_data_from_hook(var_path)
        
        # Replace the full template variable string, e.g., ${$.field}
        current = current.replace(f'${{{var_path}}}', replacement_value)

    return current