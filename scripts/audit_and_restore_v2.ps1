
# Configurations
$csvDir = "data"
$assetsDir = "assets/images"
$dbName = "gameboy_configurator"
$dbUser = "postgres"
$env:PGPASSWORD = 'admin'
$psqlPath = 'C:\Program Files\PostgreSQL\17\bin\psql.exe'

# Helper to write UTF8 no BOM
function Write-Utf8NoBom ($path, $content) {
    $enc = [System.Text.UTF8Encoding]::new($false) # false = no BOM
    [System.IO.File]::WriteAllLines($path, $content, $enc)
}

# Helper to get DB IDs
function Get-DbIds ($tableName) {
    # Ensure -P pager=off to avoid 'cat' error on Windows
    $cmdArgs = @("-U", $dbUser, "-d", $dbName, "-t", "-P", "pager=off", "-c", "SELECT id FROM $tableName")
    $output = & $psqlPath $cmdArgs
    # Filter empty lines
    return $output | Where-Object { $_ -match "\S" } | ForEach-Object { $_.Trim() }
}

Write-Host "--- Auditing Shells ---"
$shellCsv = Import-Csv "$csvDir/Shell_Variants.csv" -Delimiter ";"
$dbShells = Get-DbIds "shell_variants"
$localShells = Get-ChildItem "$assetsDir/shells" -File | Select-Object -ExpandProperty BaseName

$missingInDb = @()
$missingImages = @()
$csvIds = $shellCsv.id

Write-Host "Total Shells in CSV: $($shellCsv.Count)"
Write-Host "Total Shells in DB:  $($dbShells.Count)"

foreach ($row in $shellCsv) {
    $id = $row.id
    if ($id -notin $dbShells) {
        $missingInDb += $row
    }
    if ($id -notin $localShells) {
        $missingImages += $row
    }
}

Write-Host "Shells missing in DB (deleted): $($missingInDb.Count)"
if ($missingInDb.Count -gt 0) { $missingInDb | Select-Object id, variant_name }

Write-Host "`nShells missing images: $($missingImages.Count)"
if ($missingImages.Count -gt 0) {
    # Just show first 5 to avoid spam
    $missingImages | Select-Object -First 5 | Format-Table id, variant_name -AutoSize
}

Write-Host "`n--- Auditing Screens ---"
$screenCsv = Import-Csv "$csvDir/Screen_Variants.csv" -Delimiter ";"
$dbScreens = Get-DbIds "screen_variants"
$localScreens = Get-ChildItem "$assetsDir/screens" -File | Select-Object -ExpandProperty BaseName

$missingInDbScreens = @()
$missingImagesScreens = @()

foreach ($row in $screenCsv) {
    $id = $row.id
    if ($id -notin $dbScreens) {
        $missingInDbScreens += $row
    }
    if ($id -notin $localScreens) {
        $missingImagesScreens += $row
    }
}

Write-Host "Screens missing in DB (deleted): $($missingInDbScreens.Count)"
if ($missingInDbScreens.Count -gt 0) { $missingInDbScreens | Select-Object id, variant_name }

Write-Host "`nScreens missing images: $($missingImagesScreens.Count)"


# Generate SQL only if needed
$sqlLines = @()

if ($missingInDb.Count -gt 0) {
    foreach ($row in $missingInDb) {
        $name = $row.variant_name -replace "'", "''"
        $url = $row.image_url
        $sqlLines += "INSERT INTO shell_variants (id, shell_id, variant_name, image_url) VALUES ('$($row.id)', '$($row.shell_id)', '$name', '$url') ON CONFLICT (id) DO NOTHING;"
    }
}
if ($missingInDbScreens.Count -gt 0) {
    foreach ($row in $missingInDbScreens) {
        $name = $row.variant_name -replace "'", "''"
        $url = $row.image_url
        $sqlLines += "INSERT INTO screen_variants (id, screen_id, variant_name, image_url) VALUES ('$($row.id)', '$($row.screen_id)', '$name', '$url') ON CONFLICT (id) DO NOTHING;"
    }
}

if ($sqlLines.Count -gt 0) {
    $restoreSql = "scripts/restore_deleted_variants_v2.sql"
    Write-Utf8NoBom $restoreSql $sqlLines
    Write-Host "`nGenerated restoration script: $restoreSql ($($sqlLines.Count) queries)"
    
    # Auto-execute since user requested non-deletion
    Write-Host "Restoring entries to DB..."
    & $psqlPath -U $dbUser -d $dbName -f $restoreSql
} else {
    Write-Host "`nDB is in sync with CSV (no deletions found)."
}
