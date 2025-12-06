function Add-WFSLChainEvent {
    param(
        [Parameter(Mandatory)]
        [string]$Type,
        [Parameter(Mandatory)]
        [psobject]$Data
    )

    $path = "E:\CIC\WFSL-LICENCE-ENGINE\store\chain-of-custody.json"

    if (-not (Test-Path $path)) {
        "[]" | Set-Content $path
    }

    $raw = Get-Content $path -Raw

    try {
        $list = $raw | ConvertFrom-Json
    }
    catch {
        $list = @()
    }

    if (-not ($list -is [System.Collections.IEnumerable])) {
        $list = @()
    }

    $entry = [pscustomobject]@{
        id        = [guid]::NewGuid().ToString()
        type      = $Type
        timestamp = Get-Date -Format o
        data      = $Data
    }

    $new = @($list + $entry)
    $new | ConvertTo-Json -Depth 10 | Set-Content $path
}
