$missing = @{
    "assets/images/shells/VAR_SHELL_GBC_EXR_CLEAR.jpg" = "https://www.extremerate.com/cdn/shop/files/QCBM5001_01.jpg"
    "assets/images/shells/VAR_SHELL_GBC_EXR_CLEAR_RED.jpg" = "https://www.extremerate.com/cdn/shop/files/QCBM5002_01.jpg"
    "assets/images/shells/VAR_SHELL_GBC_EXR_CLEAR_BLUE.jpg" = "https://www.extremerate.com/cdn/shop/files/QCBM5003_01.jpg"
    "assets/images/shells/VAR_SHELL_GBC_EXR_CLEAR_PURPLE.jpg" = "https://www.extremerate.com/cdn/shop/files/QCBM5004_01.jpg"
    "assets/images/shells/VAR_SHELL_GBC_EXR_CLEAR_GREEN.jpg" = "https://www.extremerate.com/cdn/shop/files/QCBM5005_01.jpg"
    "assets/images/shells/VAR_SHELL_GBC_EXR_GLACIER_BLUE.jpg" = "https://www.extremerate.com/cdn/shop/files/QCBM5006_01.jpg"
    "assets/images/shells/VAR_SHELL_GBC_EXR_BLACK.jpg" = "https://www.extremerate.com/cdn/shop/files/Black_01_1.jpg"
    "assets/images/shells/VAR_SHELL_GBC_EXR_WHITE.jpg" = "https://www.extremerate.com/cdn/shop/files/White_01.jpg"
    "assets/images/shells/VAR_SHELL_GBC_EXR_CLASSIC_GRAY.jpg" = "https://www.extremerate.com/cdn/shop/files/ClassicGray_01.jpg"
    "assets/images/shells/VAR_SHELL_GBC_EXR_SCARLET_RED.jpg" = "https://www.extremerate.com/cdn/shop/files/ScarletRed_01.jpg"
    "assets/images/shells/VAR_SHELL_GBC_EXR_CHERRY_PINK.jpg" = "https://www.extremerate.com/cdn/shop/files/CherryBlossomsPink_01.jpg"
    "assets/images/shells/VAR_SHELL_GBC_EXR_CHAMELEON_PURPLE_BLUE.jpg" = "https://www.extremerate.com/cdn/shop/files/ChameleonPurpleBlue_01.jpg"
    "assets/images/shells/VAR_SHELL_GBC_EXR_GLOW_GREEN.jpg" = "https://www.extremerate.com/cdn/shop/files/GlowGreen_01.jpg"
    "assets/images/shells/VAR_SHELL_GBC_EXR_GLOW_BLUE.jpg" = "https://www.extremerate.com/cdn/shop/files/GlowBlue_01.jpg"
    "assets/images/shells/VAR_SHELL_GBC_EXR_GREAT_WAVE.jpg" = "https://www.extremerate.com/cdn/shop/files/QCBT1006_01.jpg"
    "assets/images/shells/VAR_SHELL_GBC_EXR_NES_CLASSIC.jpg" = "https://www.extremerate.com/cdn/shop/files/QCBT1037_01.jpg"
    "assets/images/shells/VAR_SHELL_GBC_EXR_WOOD_GRAIN.jpg" = "https://www.extremerate.com/cdn/shop/files/QCBS2001_01.jpg"
    
    "assets/images/screens/VAR_SCR_GBC_FP_RP20_BLACK.jpg" = "https://funnyplaying.com/cdn/shop/files/1_f780273e-5ee6-4a13-b8ac-f81b8a70e1ba.jpg"
    "assets/images/screens/VAR_SCR_GBC_FP_RP20_WHITE.jpg" = "https://funnyplaying.com/cdn/shop/files/2_73b39f35-f7c3-43d7-b9df-9e6ac56fdb54.jpg"
    "assets/images/screens/VAR_SCR_GBC_FP_RP20_GREY.jpg" = "https://funnyplaying.com/cdn/shop/files/4_810fbb4f-06cf-4a5b-a3d6-d5f08abdc04f.jpg"
    "assets/images/screens/VAR_SCR_GBC_FP_RP20_PURPLE.jpg" = "https://funnyplaying.com/cdn/shop/files/8_99098f6e-dfdb-431a-90a1-cc6eb3ed5d7b.jpg"
    "assets/images/screens/VAR_SCR_GBC_FP_RP20_BLUE.jpg" = "https://funnyplaying.com/cdn/shop/files/7_9de43419-68e5-4d22-bc80-5b3dfa37d4f9.jpg"
    "assets/images/screens/VAR_SCR_GBC_FP_RP20_YELLOW.jpg" = "https://funnyplaying.com/cdn/shop/files/5_55b2dd9c-c6c3-4c7f-8f91-74d5b1b8b5a1.jpg"
    "assets/images/screens/VAR_SCR_GBC_FP_RP20_GREEN.jpg" = "https://funnyplaying.com/cdn/shop/files/6_83b39f35-f7c3-43d7-b9df-9e6ac56fdb54.jpg"
    "assets/images/screens/VAR_SCR_GBC_FP_RP20_RED.jpg" = "https://funnyplaying.com/cdn/shop/files/9_12b39f35-f7c3-43d7-b9df-9e6ac56fdb54.jpg"
    
    "assets/images/screens/VAR_SCR_GBC_HI_Q5L_BLACK.jpg" = "https://ae-pic-a1.aliexpress-media.com/kf/S6c94e1f15fdd4d09a4bce3c4dfe82a4bx.jpg"
    "assets/images/screens/VAR_SCR_GBC_HI_Q5L_WHITE.jpg" = "https://ae-pic-a1.aliexpress-media.com/kf/Sb9d6e1f15fdd4d09a4bce3c4dfe82a4bx.jpg"
}

$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

foreach ($dest in $missing.Keys) {
    $url = $missing[$dest]
    Write-Host "Downloading $url to $dest using curl..."
    # Use curl.exe directly with User-Agent
    & curl.exe -L -H "User-Agent: $ua" -o $dest $url
}
