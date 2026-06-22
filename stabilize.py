import os
import re

directories = [
    'frontend/app/admin/admissions/page.tsx',
    'frontend/app/admin/classes/page.tsx',
    'frontend/app/admin/notifications/page.tsx',
    'frontend/app/admin/settings/page.tsx',
    'frontend/app/admin/users/page.tsx'
]

for filepath in directories:
    if not os.path.exists(filepath):
        print(f"Skipping {filepath}, does not exist.")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We find all buttons
    # Regex to match <button ...>...</button>
    
    def replacer(match):
        button_tag_start = match.group(1)
        inner_content = match.group(2)
        
        # If it has onClick, type="submit" or is already disabled, leave it
        if 'onClick' in button_tag_start or 'type="submit"' in button_tag_start or 'disabled' in button_tag_start:
            return match.group(0)
            
        # Add disabled to tag
        new_tag_start = button_tag_start.replace('<button ', '<button disabled ')
        new_tag_start = new_tag_start.replace("cursor: 'pointer'", "cursor: 'not-allowed', opacity: 0.5")
        
        # Add (Soon) to text. The inner content might be " <Filter size={16} /> Filter "
        # We can just append " (Soon)" before the closing tag, or try to replace the last word.
        # A simple way is to just append it if not already there.
        if '(Soon)' not in inner_content:
            inner_content = inner_content.rstrip() + " (Soon)"
            
        return f"{new_tag_start}>{inner_content}</button>"

    # Pattern matches <button [anything but >]> [anything but </button>] </button>
    new_content = re.sub(r'(<button[^>]*>)((?:(?!</button>).)*?)</button>', replacer, content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

print('Done!')
