# Recuperation des ecrans Handheld Legend (AliExpress)

$screens = @{
    "VAR_SCR_GBC_HI_Q5L_BLACK" = "https://ae-pic-a1.aliexpress-media.com/kf/S9e29ab88af21423c98e1d8aa30735b84C.jpg"
    "VAR_SCR_GBC_HI_Q5L_WHITE" = "https://ae-pic-a1.aliexpress-media.com/kf/Sfcd1716e99794b797244dc69d7e0b384456a87e2.jpg"
    "VAR_SCR_GBC_HI_245L_BLACK" = "https://ae-pic-a1.aliexpress-media.com/kf/Sd35eb35b4bc749d43cd826c9ab748eb7ada4.jpg"
}

$destDir = "assets/images/screens"

foreach ($id in $screens.Keys) {
    $url = $screens[$id]
    $dest = "$destDir/$id.jpg"
    
    Write-Host "Downloading $id..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $dest -ErrorAction Stop
        Write-Host "  Success: $dest"
    } catch {
        Write-Warning "  Failed: $url"
    }
}
