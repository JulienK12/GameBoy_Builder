
# Configurations
$csvDir = "data"
$assetsDir = "assets/images"
$dbName = "gameboy_configurator"
$dbUser = "postgres"
$env:PGPASSWORD = 'admin'
$psqlPath = 'C:\Program Files\PostgreSQL\17\bin\psql.exe'

# Helper function to get DB IDs
function Get-DbIds ($tableName) {
    $cmd = "& '$psqlPath' -U $dbUser -d $dbName -t -c 'SELECT id FROM $tableName'"
    $output = Invoke-Expression $cmd
    return $output -split "`r`n" | Where-Object { $_ -match "\S" } | ForEach-Object { $_.Trim() }
}

# Helper function to restore row (Mockup - in reality we need the full insert, assuming we can get it from CSV)
# For now, we will just list them.

# 1. Audit Shells
Write-Host "--- Auditing Shells ---"
$shellCsv = Import-Csv "$csvDir/Shell_Variants.csv" -Delimiter ";"
$dbShells = Get-DbIds "shell_variants"
$localShells = Get-ChildItem "$assetsDir/shells" -File | Select-Object -ExpandProperty BaseName

$missingInDb = @()
$missingImages = @()

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
$missingInDb | Format-Table id, variant_name -AutoSize

Write-Host "Shells missing images: $($missingImages.Count)"
$missingImages | Format-Table id, variant_name -AutoSize


# 2. Audit Screens
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
$missingInDbScreens | Format-Table id, variant_name -AutoSize

Write-Host "Screens missing images: $($missingImagesScreens.Count)"
$missingImagesScreens | Format-Table id, variant_name -AutoSize

# 3. Generate Restoration SQL
$restoreSql = "scripts/restore_deleted_variants.sql"
New-Item -ItemType File -Force -Path $restoreSql | Out-Null

if ($missingInDb.Count -gt 0) {
    "-- Restoring Shells" | Out-File -Append $restoreSql
    foreach ($row in $missingInDb) {
        $name = $row.variant_name -replace "'", "''"
        $url = $row.image_url
        $sql = "INSERT INTO shell_variants (id, shell_id, variant_name, image_url) VALUES ('$($row.id)', '$($row.shell_id)', '$name', '$url') ON CONFLICT (id) DO NOTHING;"
        $sql | Out-File -Append $restoreSql
    }
}

if ($missingInDbScreens.Count -gt 0) {
    "`n-- Restoring Screens" | Out-File -Append $restoreSql
    foreach ($row in $missingInDbScreens) {
        $name = $row.variant_name -replace "'", "''"
        $url = $row.image_url
        $sql = "INSERT INTO screen_variants (id, screen_id, variant_name, image_url) VALUES ('$($row.id)', '$($row.screen_id)', '$name', '$url') ON CONFLICT (id) DO NOTHING;"
        $sql | Out-File -Append $restoreSql
    }
}

Write-Host "`nGenerated restoration script: $restoreSql"
if (($missingInDb.Count + $missingInDbScreens.Count) -gt 0) {
    Write-Host "Executing restoration..."
    & $psqlPath -U $dbUser -d $dbName -f $restoreSql
} else {
    Write-Host "Nothing to restore."
}
