# WFSL Bulk Header Insertion Script
# Scans all .ts files and inserts the proprietary header when missing.

$header = @"
/**
 * WFSL Licence Engine — Proprietary Software
 * Copyright (c) Wynergy Fibre Solutions Ltd.
 * All rights reserved.
 *
 * This source code is licensed under the WFSL Proprietary Software Licence v1.0.
 * Unauthorised use, copying, modification, distribution, or hosting is prohibited.
 *
 * For licensing or commercial enquiries, contact:
 * legal@wynergy.co.uk
 */
"@

$root = "E:\CIC\WFSL-LICENCE-ENGINE"

$files = Get-ChildItem -Path $root -Recurse -Filter *.ts

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Skip if header already exists
    if ($content -match "WFSL Licence Engine — Proprietary Software") {
        Write-Host "Header exists: $($file.FullName)"
        continue
    }

    # Insert header
    $newContent = $header + "`r`n" + $content
    Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8

    Write-Host "Inserted header: $($file.Name)"
}

Write-Host "`n=== WFSL Header Injection Complete ==="
