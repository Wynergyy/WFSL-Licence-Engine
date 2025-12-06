$root = "E:\CIC\WFSL-LICENCE-ENGINE\store"

if (-not (Test-Path $root)) {
    New-Item -ItemType Directory $root -Force | Out-Null
}

$files = @(
    "revocation-list.json",
    "chain-of-custody.json"
)

foreach ($file in $files) {
    $path = Join-Path $root $file
    if (-not (Test-Path $path)) {
        "[]" | Set-Content $path
    }
}
