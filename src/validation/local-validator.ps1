function Test-WFSLLicenceLocal {
    param(
        [Parameter(Mandatory)]
        [psobject]$Licence
    )

    if (-not $Licence.licenceId) { return @{ valid = $false; reason = "Missing licenceId" } }
    if (-not $Licence.machineId) { return @{ valid = $false; reason = "Missing machineId" } }

    $revokedIds = Get-WFSLRevocationList
    if ($revokedIds -and $revokedIds -contains $Licence.licenceId) {
        return @{ valid = $false; reason = "Licence revoked" }
    }

    return @{ valid = $true; reason = "Local valid" }
}
