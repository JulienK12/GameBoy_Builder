$url = "https://www.extremerate.com/collections/game-boy-color/products.json?limit=250"
Write-Host "Fetching products from $url..."
$response = Invoke-WebRequest -Uri $url -UseBasicParsing
$data = $response.Content | ConvertFrom-Json

# Mapping ID -> Title Keyword(s) to match
$mapping = @{
    "VAR_SHELL_GBC_EXR_CLEAR" = "Transparent Clear"
    "VAR_SHELL_GBC_EXR_CLEAR_RED" = "Clear Red"
    "VAR_SHELL_GBC_EXR_CLEAR_BLUE" = "Clear Blue"
    "VAR_SHELL_GBC_EXR_CLEAR_PURPLE" = "Clear Atomic Purple"
    "VAR_SHELL_GBC_EXR_CLEAR_GREEN" = "Clear Green"
    "VAR_SHELL_GBC_EXR_BLACK" = "Black"
    "VAR_SHELL_GBC_EXR_WHITE" = "White"
    "VAR_SHELL_GBC_EXR_CLASSIC_GRAY" = "Classic Gray"
    "VAR_SHELL_GBC_EXR_SCARLET_RED" = "Scarlet Red"
    "VAR_SHELL_GBC_EXR_CHERRY_PINK" = "Cherry Blossoms Pink"
    "VAR_SHELL_GBC_EXR_CHAMELEON_PURPLE_BLUE" = "Chameleon Purple Blue"
    "VAR_SHELL_GBC_EXR_GLOW_BLUE" = "Glow in Dark - Blue"
    "VAR_SHELL_GBC_EXR_GREAT_WAVE" = "The Great Wave"
    "VAR_SHELL_GBC_EXR_NES_CLASSIC" = "Classics NES Style"
    "VAR_SHELL_GBC_EXR_WOOD_GRAIN" = "Wood Grain"
    # "VAR_SHELL_GBC_EXR_GLACIER_BLUE" -> "Glacier Blue" (Not in original missing list but good to have)
}

$destDir = "assets/images/shells"
if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force }

foreach ($key in $mapping.Keys) {
    $keyword = $mapping[$key]
    Write-Host "Looking for '$keyword'..."
    
    # Filter products that contain the keyword in the title AND are "Shells" (to avoid buttons if possible, though title usually clarifies)
    # The titles are like "eXtremeRate ... - [Color]"
    $product = $data.products | Where-Object { 
        $_.title -match " - $keyword" -or $_.title -match "- $keyword" 
    } | Select-Object -First 1

    if ($product) {
        $imageUrl = $product.images[0].src
        if ($imageUrl) {
             # Clean URL
            if ($imageUrl -match "\?") { $imageUrl = $imageUrl.Split("?")[0] }
            
            $destFile = "$destDir/$key.jpg"
            Write-Host "  -> Found! Downloading to $destFile"
            try {
                Invoke-WebRequest -Uri $imageUrl -OutFile $destFile -ErrorAction Stop
            } catch {
                Write-Warning "  -> Failed to download $imageUrl"
            }
        } else {
            Write-Warning "  -> Product found but no image src?"
        }
    } else {
        Write-Warning "  -> Product NOT found for '$keyword'"
    }
}
