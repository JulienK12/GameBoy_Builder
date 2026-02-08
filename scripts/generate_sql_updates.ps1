$baseDir = "c:\Users\Julien\OneDrive\Rayboy\dev\gameboy_builder\assets\images"
$categories = @("shells", "screens", "lenses")
$sqlFile = "scripts/update_image_paths.sql"
$queries = @()

foreach ($cat in $categories) {
    if (Test-Path "$baseDir/$cat") {
        $files = Get-ChildItem "$baseDir/$cat" -File
        foreach ($file in $files) {
            $id = $file.BaseName
            $path = "/assets/images/$cat/$($file.Name)"
            $table = switch ($cat) {
                "shells" { "shell_variants" }
                "screens" { "screen_variants" }
                "lenses" { "lens_variants" }
            }
            $queries += "UPDATE $table SET image_url = '$path' WHERE id = '$id';"
        }
    }
}

$queries | Out-File -FilePath $sqlFile -Encoding utf8
Write-Host "Generated $($queries.Count) update queries in $sqlFile"
