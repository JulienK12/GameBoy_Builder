$jsonContent = @'
{"product":{"id":6580698087485,"title":"GBC Retro Pixel Laminated Custom Shell - No USB-C port","variants":[{"id":39333900550205,"title":"Clear green","image_id":28135869579325},{"id":39333901664317,"title":"Atomic purple","image_id":28135869317181},{"id":39333903138877,"title":"Clear deep red","image_id":28135869513789},{"id":39333904416829,"title":"Clear yellow","image_id":28135869284413},{"id":39333904646205,"title":"Clear","image_id":28135869349949},{"id":39333906087997,"title":"Orange","image_id":28135869251645},{"id":39335018987581,"title":"Clear royal blue","image_id":28135869382717},{"id":39377483366461,"title":"Clear orange","image_id":28294107594813},{"id":39377483825213,"title":"GB grey","image_id":28294106808381},{"id":40429550600253,"title":"Clear purple","image_id":30252336480317},{"id":39424011108413,"title":"Clear luminous blue","image_id":28394733568061},{"id":39333905662013,"title":"pure white","image_id":28135869186109},{"id":39333902549053,"title":"Clear Black","image_id":28135869120573},{"id":39333899796541,"title":"BLACK","image_id":28135869448253},{"id":39424010879037,"title":"PINK","image_id":28394733502525},{"id":39914587815997,"title":"Fluorescent yellow","image_id":28962953625661},{"id":39333905203261,"title":"earthy yellow","image_id":30341889196093},{"id":39333903990845,"title":"Mint green","image_id":28135869153341},{"id":39333902155837,"title":"BABY green","image_id":28135869218877},{"id":39424011042877,"title":"purple","image_id":28394733535293}],"images":[{"id":28135869382717,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/navyblue.jpg?v=1672633209"},{"id":28135869317181,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/atomicpurple.jpg?v=1672633209"},{"id":28962953625661,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/DPP_513.jpg?v=1672633209"},{"id":28394733568061,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/Clearluminousblue.jpg?v=1672633209"},{"id":28394733502525,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/pink_abfd9f02-2fc8-4002-9fb5-d27dbbcad9c4.jpg?v=1672633209"},{"id":28394733535293,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/purple.jpg?v=1672633209"},{"id":28135869349949,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/Clear.jpg?v=1671075435"},{"id":28135869579325,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/atomicgreen.jpg?v=1671075435"},{"id":28135869218877,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/BABYBLUE.jpg?v=1653468947"},{"id":28135869448253,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/Black_52ec0cc7-3f4d-4f98-a585-24559cd15aa8.jpg?v=1653468947"},{"id":28135869120573,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/ClearBlack_3b2cfa1b-88fe-4d6e-977e-b84bb1da2162.jpg?v=1653468947"},{"id":28135869513789,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/Cleardeepred_b1dad986-471f-43db-b487-70511ee7d445.jpg?v=1653468947"},{"id":28135869153341,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/Clearlightblue.jpg?v=1653468947"},{"id":28135869284413,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/Clearyellow_074fc6b6-a870-472d-8a6c-39a9ad7ba5f9.jpg?v=1653468947"},{"id":28135869251645,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/orange_4caeb65c-fabc-45e7-93eb-046fcb0b17df.jpg?v=1653468947"},{"id":28135869186109,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/purewhite_8ca19c51-a601-409d-9115-e9fc0bb5f58d.jpg?v=1653468947"},{"id":28294106808381,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/DPP_544_1add7859-be2c-48ad-b3c8-d8d85d557f41.jpg?v=1653468947"},{"id":28294107594813,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/DPP_536_87daa5f7-a660-4418-abb8-473b0c0cc755.jpg?v=1653468947"},{"id":30252336480317,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/5269.jpg?v=1671006318"},{"id":30341889196093,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/2481\/6766\/products\/QQ_20230109104737.png?v=1673232511"}]}
'@

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
    # "VAR_SHELL_GBC_FP_CLEAR_LIGHT_BLUE" -> Not found in JSON directly as such, maybe check?
}

$data = $jsonContent | ConvertFrom-Json
$images = @{}
foreach ($img in $data.product.images) {
    if ($img.id) {
        $images[$img.id] = $img.src
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
