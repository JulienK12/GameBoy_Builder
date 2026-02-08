
# Configurations
$csvDir = "data"
$assetsDir = "assets/images"
$dbName = "gameboy_configurator"
$dbUser = "postgres"
$env:PGPASSWORD = 'admin'
$psqlPath = 'C:\Program Files\PostgreSQL\17\bin\psql.exe'

# Helper to write UTF8 no BOM
function Write-Utf8NoBom ($path, $content) {
    $enc = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllLines($path, $content, $enc)
}

# Helper to get DB IDs
function Get-DbIds ($tableName) {
    $cmdArgs = @("-U", $dbUser, "-d", $dbName, "-t", "-P", "pager=off", "-c", "SELECT id FROM $tableName")
    $output = & $psqlPath $cmdArgs
    return $output | Where-Object { $_ -match "\S" } | ForEach-Object { $_.Trim() }
}

Write-Host "--- Auditing Shells ---"
$shellCsv = Import-Csv "$csvDir/Shell_Variants.csv" -Delimiter ";"
$dbShells = Get-DbIds "shell_variants"
$localShells = Get-ChildItem "$assetsDir/shells" -File | Select-Object -ExpandProperty BaseName

$missingInDb = @()
$missingImages = @()

foreach ($row in $shellCsv) {
    $id = $row.Variant_ID
    if ($id -notin $dbShells) {
        $missingInDb += $row
    }
    if ($id -notin $localShells) {
        $missingImages += $row
    }
}

Write-Host "Total in CSV: $($shellCsv.Count)"
Write-Host "Total in DB:  $($dbShells.Count)"
Write-Host "Shells missing in DB (deleted): $($missingInDb.Count)"

Write-Host "`nShells missing images: $($missingImages.Count)"
if ($missingImages.Count -gt 0) {
    $missingImages | Select-Object Variant_ID, Name | Format-Table -AutoSize
}

Write-Host "`n--- Auditing Screens ---"
$screenCsv = Import-Csv "$csvDir/Screen_Variants.csv" -Delimiter ";"
$dbScreens = Get-DbIds "screen_variants"
$localScreens = Get-ChildItem "$assetsDir/screens" -File | Select-Object -ExpandProperty BaseName

$missingInDbScreens = @()
$missingImagesScreens = @()

foreach ($row in $screenCsv) {
    $id = $row.Variant_ID
    if ($id -notin $dbScreens) {
        $missingInDbScreens += $row
    }
    if ($id -notin $localScreens) {
        $missingImagesScreens += $row
    }
}

Write-Host "Total in CSV: $($screenCsv.Count)"
Write-Host "Total in DB:  $($dbScreens.Count)"
Write-Host "Screens missing in DB (deleted): $($missingInDbScreens.Count)"

Write-Host "`nScreens missing images: $($missingImagesScreens.Count)"
if ($missingImagesScreens.Count -gt 0) {
    $missingImagesScreens | Select-Object Variant_ID, Name | Format-Table -AutoSize
}


# Generate SQL
$sqlLines = @()

if ($missingInDb.Count -gt 0) {
    foreach ($row in $missingInDb) {
        $id = $row.Variant_ID
        $shellId = $row.Shell_ID
        $name = $row.Name -replace "'", "''"
        $supp = $row.Supplement -replace ",", "."
        $color = $row.Color_Hex
        $url = $row.Image_URL
        
        $sqlLines += "INSERT INTO shell_variants (id, shell_id, name, supplement, color_hex, image_url) VALUES ('$id', '$shellId', '$name', $supp, '$color', '$url') ON CONFLICT (id) DO NOTHING;"
    }
}
if ($missingInDbScreens.Count -gt 0) {
    foreach ($row in $missingInDbScreens) {
        $id = $row.Variant_ID
        $screenId = $row.Screen_ID
        $name = $row.Name -replace "'", "''"
        $supp = $row.Supplement -replace ",", "."
        $url = $row.Image_URL
        
        $sqlLines += "INSERT INTO screen_variants (id, screen_id, name, supplement, image_url) VALUES ('$id', '$screenId', '$name', $supp, '$url') ON CONFLICT (id) DO NOTHING;"
    }
}

if ($sqlLines.Count -gt 0) {
    $restoreSql = "scripts/restore_deleted_variants_v4.sql"
    Write-Utf8NoBom $restoreSql $sqlLines
    Write-Host "`nGenerated restoration script: $restoreSql ($($sqlLines.Count) queries)"
    
    Write-Host "Restoring entries to DB..."
    & $psqlPath -U $dbUser -d $dbName -f $restoreSql
} else {
    Write-Host "`nDB is in sync with CSV."
}
