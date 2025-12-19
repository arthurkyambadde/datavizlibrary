#!/bin/bash
# Quick script to update remaining pages with green theme

for file in ai-insights.html reports.html settings.html; do
  echo "Updating $file..."
  
  # Add Iconify CDN
  sed -i '' '/<link rel="icon" type="image\/png" href="favicon.png">/a\
  <script src="https://code.iconify.design/3/3.1.0/iconify.min.js"></script>' "$file"
  
  # Update colors
  sed -i '' 's/#4F46E5/#10B981/g' "$file"
  sed -i '' 's/#7C3AED/#059669/g' "$file"
  sed -i '' 's/#60A5FA/#10B981/g' "$file"
  sed -i '' 's/#A78BFA/#059669/g' "$file"
  sed -i '' 's/rgba(79, 70, 229, 0.2)/rgba(16, 185, 129, 0.2)/g' "$file"
  
  # Update navigation icons
  sed -i '' 's|<span>📊</span>|<span class="iconify" data-icon="ri:dashboard-line" data-width="20"></span>|g' "$file"
  sed -i '' 's|<span>📈</span>|<span class="iconify" data-icon="ri:bar-chart-line" data-width="20"></span>|g' "$file"
  sed -i '' 's|<span>🔌</span>|<span class="iconify" data-icon="ri:database-2-line" data-width="20"></span>|g' "$file"
  sed -i '' 's|<span>🤖</span>|<span class="iconify" data-icon="ri:brain-line" data-width="20"></span>|g' "$file"
  sed -i '' 's|<span>📝</span>|<span class="iconify" data-icon="ri:file-chart-line" data-width="20"></span>|g' "$file"
  sed -i '' 's|<span>⚙️</span>|<span class="iconify" data-icon="ri:settings-3-line" data-width="20"></span>|g' "$file"
  
  echo "✓ $file updated"
done

echo "All files updated!"
