$jsonContent = Get-Content -Raw -Path "scripts/fp_screens.json"
$data = $jsonContent | ConvertFrom-Json

$destDir = "assets/images/screens"
if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Force -Path $destDir }

# 1. Map by Variant Title
$variantMapping = @{
    "VAR_SCR_GBC_FP_RP20_BLACK"  = "GBC RETRO PIXEL 2.0 Black Laminated"
    "VAR_SCR_GBC_FP_RP20_WHITE"  = "GBC RETRO PIXEL 2.0 White Laminated"
    "VAR_SCR_GBC_FP_RP20_GREY"   = "GBC RETRO PIXEL 2.0 LAMINATED GB COLOR"
    "VAR_SCR_GBC_FP_RP20_GREEN"  = "GBC RETRO PIXEL 2.0 LAMINATED GREEN"
    "VAR_SCR_GBC_FP_RP20_BLUE"   = "GBC RETRO PIXEL 2.0 LAMINATED BLUE"
    "VAR_SCR_GBC_FP_RP20_RED"    = "GBC RETRO PIXEL 2.0 LAMINATED RED"
    # Orange is tricky, let's map generic Orange to generic Orange variant
    # "VAR_SCR_GBC_FP_RP20_ORANGE" = "GBC RETRO PIXEL 2.0 LAMINATED ORANGE"
}

# 2. Map by Image URL Keyword (for non-variant images)
$keywordMapping = @{
    "VAR_SCR_GBC_FP_RP20_YELLOW" = "YELLOW"
    "VAR_SCR_GBC_FP_RP20_PURPLE" = "PURPLE"
}

# Process Variants
foreach ($key in $variantMapping.Keys) {
    $title = $variantMapping[$key]
    Write-Host "Looking for variant: $title"
    $variant = $data.product.variants | Where-Object { $_.title -eq $title }
    
    if ($variant) {
        $imgId = $variant.image_id
        # Find image object by ID
        $imageObj = $data.product.images | Where-Object { $_.id -eq $imgId }
        
        if ($imageObj) {
            $url = $imageObj.src
            if ($url -match "\?") { $url = $url.Split("?")[0] }
            $dest = "$destDir/$key.jpg"
            Write-Host "  -> Found! Downloading to $dest"
            try { Invoke-WebRequest -Uri $url -OutFile $dest -ErrorAction Stop } catch { Write-Warning "Failed to dl $url" }
        } else {
            Write-Warning "  -> No image found for variant $title"
        }
    } else {
        Write-Warning "  -> Variant not found: $title"
    }
}

# Process Keywords (Fallback for missing variants)
foreach ($key in $keywordMapping.Keys) {
    $keyword = $keywordMapping[$key]
    Write-Host "Looking for image with keyword: $keyword"
    
    $imageObj = $data.product.images | Where-Object { $_.src -match "$keyword" } | Select-Object -First 1
    
    if ($imageObj) {
        $url = $imageObj.src
        if ($url -match "\?") { $url = $url.Split("?")[0] }
        $dest = "$destDir/$key.jpg"
        Write-Host "  -> Found! Downloading to $dest"
        try { Invoke-WebRequest -Uri $url -OutFile $dest -ErrorAction Stop } catch { Write-Warning "Failed to dl $url" }
    } else {
        Write-Warning "  -> No image found for keyword $keyword"
    }
}
