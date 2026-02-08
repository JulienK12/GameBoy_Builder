$jsonContent = Get-Content -Raw -Path "scripts/fp_data.json"
$data = $jsonContent | ConvertFrom-Json

# Mapping between local IDs and FunnyPlaying variant titles
$mapping = @{
    "VAR_SHELL_GBC_FP_CLEAR_GREEN" = "Clear green"
    "VAR_SHELL_GBC_FP_ATOMIC_PURPLE" = "Atomic purple"
    "VAR_SHELL_GBC_FP_CLEAR_DEEP_RED" = "Clear deep red"
    "VAR_SHELL_GBC_FP_CLEAR_YELLOW" = "Clear yellow"
    "VAR_SHELL_GBC_FP_CLEAR" = "Clear"
    "VAR_SHELL_GBC_FP_ORANGE" = "Orange"
    "VAR_SHELL_GBC_FP_CLEAR_ROYAL_BLUE" = "Clear royal blue"
    "VAR_SHELL_GBC_FP_CLEAR_ORANGE" = "Clear orange"
    "VAR_SHELL_GBC_FP_GB_GREY" = "GB grey"
    "VAR_SHELL_GBC_FP_CLEAR_PURPLE" = "Clear purple"
    "VAR_SHELL_GBC_FP_CLEAR_LUMINOUS_BLUE" = "Clear luminous blue"
    "VAR_SHELL_GBC_FP_PURE_WHITE" = "pure white"
    "VAR_SHELL_GBC_FP_CLEAR_BLACK" = "Clear Black"
    "VAR_SHELL_GBC_FP_BLACK" = "BLACK"
    "VAR_SHELL_GBC_FP_PINK" = "PINK"
    "VAR_SHELL_GBC_FP_FLUORESCENT_YELLOW" = "Fluorescent yellow"
    "VAR_SHELL_GBC_FP_EARTHY_YELLOW" = "earthy yellow"
    "VAR_SHELL_GBC_FP_MINT_GREEN" = "Mint green"
    "VAR_SHELL_GBC_FP_BABY_GREEN" = "BABY green"
    "VAR_SHELL_GBC_FP_purple" = "purple"
}

$images = @{}
foreach ($img in $data.product.images) {
    if ($img.id) {
        $images["$($img.id)"] = $img.src
    }
}

foreach ($key in $mapping.Keys) {
    $title = $mapping[$key]
    $variant = $data.product.variants | Where-Object { $_.title -eq $title }
    if ($variant) {
        $imgId = $variant.image_id
        if ($imgId) {
            $url = $images["$imgId"]
            if ($url) {
                # Clean URL (remove query params)
                if ($url -match "\?") { $url = $url.Split("?")[0] }
                
                $dest = "assets/images/shells/$key.jpg"
                if (!(Test-Path "assets/images/shells")) { New-Item -ItemType Directory -Force -Path "assets/images/shells" }
                
                Write-Host "Recovering $key from $url..."
                try {
                   Invoke-WebRequest -Uri $url -OutFile $dest -ErrorAction Stop
                } catch {
                   Write-Warning "Failed to dl $url"
                }
            } else {
                Write-Warning "No image URL found for image ID $imgId ($title)"
            }
        }
    } else {
        Write-Warning "Variant not found: $title"
    }
}
