# Uses shared engine config paths
. "E:\CIC\WFSL-LICENCE-ENGINE\engine-config.ps1"

function Get-WFSLRevocationList {

    if (-not (Test-Path $GLOBAL:WFSL_REVOCATION_FILE)) {
        "[]" | Set-Content $GLOBAL:WFSL_REVOCATION_FILE
    }

    $raw = Get-Content $GLOBAL:WFSL_REVOCATION_FILE -Raw
    if ([string]::IsNullOrWhiteSpace($raw)) {
        return @()
    }

    $json = $raw | ConvertFrom-Json

    if ($json -eq $null) { return @() }

    if ($json -is [System.Collections.IEnumerable]) {
        return @($json)
    }

    return @()
}

function Add-WFSLRevocation {
    param(
        [Parameter(Mandatory)][string] $LicenceId,
        [Parameter(Mandatory)][string] $Reason
    )

    $list = Get-WFSLRevocationList

    $entry = [ordered]@{
        licenceId = $LicenceId
        reason    = $Reason
        revokedAt = (Get-Date).ToString("o")
    }

    $updated = @()
    $updated += $list
    $updated += $entry

    $updated | ConvertTo-Json -Depth 10 | Set-Content $GLOBAL:WFSL_REVOCATION_FILE

    return $true
}
