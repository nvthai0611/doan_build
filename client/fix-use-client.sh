#!/bin/bash

# Script to remove "use client" directives from all TypeScript/React files
echo "Removing 'use client' directives from all files..."

# Find all .tsx and .ts files and remove "use client" directive
find src -name "*.tsx" -o -name "*.ts" | while read file; do
    if grep -q '"use client"' "$file"; then
        echo "Processing: $file"
        # Remove "use client" line and the empty line after it
        sed -i '/^"use client"$/d' "$file"
        sed -i '/^'\''use client'\'';$/d' "$file"
        # Remove empty line after "use client" if it exists
        sed -i '/^$/N;/^\n$/d' "$file"
    fi
done

echo "Done! All 'use client' directives have been removed."
