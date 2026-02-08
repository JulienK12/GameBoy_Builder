$url = "https://www.extremerate.com/collections/game-boy-color/products.json?limit=250"
$response = Invoke-WebRequest -Uri $url -UseBasicParsing
$data = $response.Content | ConvertFrom-Json
$data.products | Select-Object -ExpandProperty title | Out-File "scripts/exr_titles.txt"
Get-Content "scripts/exr_titles.txt" | Select-Object -First 50
