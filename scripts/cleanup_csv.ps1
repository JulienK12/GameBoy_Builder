# Suppression des variants introuvables des CSV

# 1. Shells
$shellCsv = Import-Csv "data/Shell_Variants.csv" -Delimiter ";"
$toRemoveShells = @('VAR_SHELL_GBC_EXR_CLEAR_BLUE', 'VAR_SHELL_GBC_EXR_CLEAR_GREEN', 'VAR_SHELL_GBC_EXR_GLOW_BLUE')
$filteredShells = $shellCsv | Where-Object { $_.Variant_ID -notin $toRemoveShells }

Write-Host "Shells avant: $($shellCsv.Count)"
Write-Host "Shells après: $($filteredShells.Count)"

$filteredShells | Export-Csv "data/Shell_Variants.csv" -Delimiter ";" -NoTypeInformation -Encoding UTF8

# 2. Screens
$screenCsv = Import-Csv "data/Screen_Variants.csv" -Delimiter ";"
$toRemoveScreens = @('VAR_SCR_GBC_FP_RP20_PURPLE')
$filteredScreens = $screenCsv | Where-Object { $_.Variant_ID -notin $toRemoveScreens }

Write-Host "Screens avant: $($screenCsv.Count)"
Write-Host "Screens après: $($filteredScreens.Count)"

$filteredScreens | Export-Csv "data/Screen_Variants.csv" -Delimiter ";" -NoTypeInformation -Encoding UTF8

Write-Host "`n✅ CSV mis à jour !" -ForegroundColor Green
