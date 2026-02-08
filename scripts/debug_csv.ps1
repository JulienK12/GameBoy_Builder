$csv = Import-Csv "data/Shell_Variants.csv" -Delimiter ";"
$row = $csv | Where-Object { $_.Variant_ID -eq "VAR_SHELL_GBC_EXR_CLEAR_BLUE" }
$row | Select-Object *
Write-Host "Shell_ID: [$($row.Shell_ID)]"
Write-Host "Type: $($row.GetType().FullName)"
