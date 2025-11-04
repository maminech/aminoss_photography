# PowerShell script to add dark mode classes to all TSX files

$files = Get-ChildItem -Path "src" -Recurse -Filter "*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    # Update common patterns
    $content = $content -replace 'className="([^"]*)\sbg-white(\s|")', 'className="$1 bg-white dark:bg-dark-900$2'
    $content = $content -replace 'className="([^"]*)\sbg-gray-50(\s|")', 'className="$1 bg-gray-50 dark:bg-dark-800$2'
    $content = $content -replace 'className="([^"]*)\sbg-gray-100(\s|")', 'className="$1 bg-gray-100 dark:bg-dark-700$2'
    $content = $content -replace 'className="([^"]*)\stext-gray-600(\s|")', 'className="$1 text-gray-600 dark:text-gray-400$2'
    $content = $content -replace 'className="([^"]*)\stext-gray-700(\s|")', 'className="$1 text-gray-700 dark:text-gray-300$2'
    $content = $content -replace 'className="([^"]*)\stext-gray-800(\s|")', 'className="$1 text-gray-800 dark:text-gray-200$2'
    $content = $content -replace 'className="([^"]*)\stext-gray-900(\s|")', 'className="$1 text-gray-900 dark:text-gray-100$2'
    $content = $content -replace 'className="([^"]*)\sborder-gray-200(\s|")', 'className="$1 border-gray-200 dark:border-gray-700$2'
    $content = $content -replace 'className="([^"]*)\sborder-gray-300(\s|")', 'className="$1 border-gray-300 dark:border-gray-600$2'
    
    # Only write if changed
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nDark mode classes added successfully!"
