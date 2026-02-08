$url = "https://www.extremerate.com/collections/game-boy-color/products.json?limit=250"
$response = Invoke-WebRequest -Uri $url -UseBasicParsing
$data = $response.Content | ConvertFrom-Json

$mapping = @{
    "VAR_SHELL_GBC_EXR_GLACIER_BLUE" = "Clear Glacier Blue"
}

$destDir = "assets/images/shells"

foreach ($key in $mapping.Keys) {
    $keyword = $mapping[$key]
    Write-Host "Looking for '$keyword'..."
    $product = $data.products | Where-Object { $_.title -match "$keyword" } | Select-Object -First 1

    if ($product) {
        $imageUrl = $product.images[0].src
        if ($imageUrl) {
            if ($imageUrl -match "\?") { $imageUrl = $imageUrl.Split("?")[0] }
            $destFile = "$destDir/$key.jpg"
            Write-Host "  -> Found! Downloading to $destFile"
            Invoke-WebRequest -Uri $imageUrl -OutFile $destFile
        }
    } else {
        Write-Warning "Product not found: $keyword"
    }
}
