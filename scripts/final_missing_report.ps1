$csv = Import-Csv "data/Shell_Variants.csv" -Delimiter ";"
$localShells = Get-ChildItem "assets/images/shells" -File | Select-Object -ExpandProperty BaseName
$missingShells = $csv | Where-Object { $_.Variant_ID -notin $localShells }

$csvScreens = Import-Csv "data/Screen_Variants.csv" -Delimiter ";"
$localScreens = Get-ChildItem "assets/images/screens" -File | Select-Object -ExpandProperty BaseName
$missingScreens = $csvScreens | Where-Object { $_.Variant_ID -notin $localScreens }

Write-Host "=== RAPPORT FINAL DES IMAGES MANQUANTES ===" -ForegroundColor Cyan
Write-Host "`nCOQUES MANQUANTES: $($missingShells.Count)" -ForegroundColor Yellow
$missingShells | Select-Object Variant_ID, Name, Image_URL | Format-Table -AutoSize

Write-Host "`nÉCRANS MANQUANTS: $($missingScreens.Count)" -ForegroundColor Yellow
$missingScreens | Select-Object Variant_ID, Name, Image_URL | Format-Table -AutoSize

Write-Host "`n=== RÉSUMÉ ===" -ForegroundColor Cyan
Write-Host "Total shells dans CSV: $($csv.Count)"
Write-Host "Total shells avec images: $($csv.Count - $missingShells.Count)"
Write-Host "Total shells SANS images: $($missingShells.Count)"
Write-Host "`nTotal écrans dans CSV: $($csvScreens.Count)"
Write-Host "Total écrans avec images: $($csvScreens.Count - $missingScreens.Count)"
Write-Host "Total écrans SANS images: $($missingScreens.Count)"
