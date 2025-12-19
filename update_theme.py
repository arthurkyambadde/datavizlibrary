#!/usr/bin/env python3
"""
Script to apply green theme and Iconify icons to all Pulse Analytics pages
"""

import re

# Color replacements
COLOR_REPLACEMENTS = {
    '#4F46E5': '#10B981',  # Purple to Green
    '#7C3AED': '#059669',  # Purple to Dark Green
    '#60A5FA': '#10B981',  # Blue to Green
    '#A78BFA': '#059669',  # Light purple to Dark Green
    'rgba(79, 70, 229, 0.2)': 'rgba(16, 185, 129, 0.2)',  # Purple hover to Green hover
    'rgba(96, 165, 250, 0.6)': 'rgba(16, 185, 129, 0.6)',  # Blue gradient to Green
    'rgba(96, 165, 250, 0.5)': 'rgba(16, 185, 129, 0.5)',
    'rgba(96, 165, 250, 0.3)': 'rgba(16, 185, 129, 0.3)',
    'rgba(96, 165, 250, 0.05)': 'rgba(16, 185, 129, 0.05)',
}

# Emoji to Iconify icon replacements
ICON_REPLACEMENTS = {
    '📊': '<span class="iconify" data-icon="ri:dashboard-line" data-width="20"></span>',
    '📈': '<span class="iconify" data-icon="ri:bar-chart-line" data-width="20"></span>',
    '🔌': '<span class="iconify" data-icon="ri:database-2-line" data-width="20"></span>',
    '🤖': '<span class="iconify" data-icon="ri:brain-line" data-width="20"></span>',
    '📝': '<span class="iconify" data-icon="ri:file-chart-line" data-width="20"></span>',
    '⚙️': '<span class="iconify" data-icon="ri:settings-3-line" data-width="20"></span>',
    '💰': '<span class="iconify" data-icon="ri:money-dollar-circle-line" data-width="24" style="color: white;"></span>',
    '👥': '<span class="iconify" data-icon="ri:group-line" data-width="24" style="color: white;"></span>',
    '⏱️': '<span class="iconify" data-icon="ri:time-line" data-width="24" style="color: white;"></span>',
    '🎯': '<span class="iconify" data-icon="ri:target-line" data-width="24" style="color: white;"></span>',
    '📤': '<span class="iconify" data-icon="ri:upload-cloud-line" data-width="32" style="color: white;"></span>',
    '📉': '<span class="iconify" data-icon="ri:line-chart-line" data-width="24"></span>',
    '📢': '<span class="iconify" data-icon="ri:megaphone-line" data-width="24"></span>',
}

FILES_TO_UPDATE = [
    'analytics.html',
    'data-sources.html',
    'ai-insights.html',
    'reports.html',
    'settings.html',
]

def update_file(filepath):
    """Update a single file with theme changes"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Add Iconify CDN if not present
        if 'iconify' not in content:
            content = content.replace(
                '<link rel="icon" type="image/png" href="favicon.png">',
                '<link rel="icon" type="image/png" href="favicon.png">\n  <script src="https://code.iconify.design/3/3.1.0/iconify.min.js"></script>'
            )
        
        # Replace colors
        for old_color, new_color in COLOR_REPLACEMENTS.items():
            content = content.replace(old_color, new_color)
        
        # Replace emojis with icons
        for emoji, icon_html in ICON_REPLACEMENTS.items():
            content = content.replace(f'<span>{emoji}</span>', icon_html)
            content = content.replace(f'>{emoji}<', f'>{icon_html}<')
        
        # Add text-decoration: none to nav items
        content = re.sub(
            r'(\.nav-item\s*\{[^}]*color:\s*#[A-F0-9]+;)',
            r'\1\n      text-decoration: none;',
            content
        )
        
        # Update nav hover
        content = re.sub(
            r'\.nav-item:hover,\s*\.nav-item\.active\s*\{',
            '.nav-item:hover {',
            content
        )
        
        # Add separate active state
        if '.nav-item.active {' not in content:
            content = re.sub(
                r'(\.nav-item:hover\s*\{[^}]*\})',
                r'\1\n\n    .nav-item.active {\n      background: linear-gradient(135deg, #10B981, #059669);\n      color: white;\n      text-decoration: none;\n    }',
                content
            )
        
        # Only write if changes were made
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Updated {filepath}")
            return True
        else:
            print(f"⏭️  No changes needed for {filepath}")
            return False
            
    except Exception as e:
        print(f"❌ Error updating {filepath}: {e}")
        return False

if __name__ == '__main__':
    print("🎨 Applying Green Theme to Pulse Analytics Pages...\n")
    
    updated_count = 0
    for filename in FILES_TO_UPDATE:
        if update_file(filename):
            updated_count += 1
    
    print(f"\n✨ Complete! Updated {updated_count}/{len(FILES_TO_UPDATE)} files")
