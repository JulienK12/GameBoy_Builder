$json = Get-Content "scripts/fp_screens.json" -Raw | ConvertFrom-Json
$json.product.variants | Select-Object -Property title, id
