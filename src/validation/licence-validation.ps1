function Test-WFSLLicence {
    param(
        [Parameter(Mandatory)]
        [psobject]$Licence
    )

    # Required fields
    if (-not $Licence.licenceId) { return @{ valid = $false; reason = "Missing licenceId" } }
    if (-not $Licence.machineId) { return @{ valid = $false; reason = "Missing machineId" } }

    # ---------------------------
    # 1. Cloud verification
    # ---------------------------
    $cloudResult = $null
    try {
        $cloudResult = Invoke-WFSLCloudVerify -Licence $Licence
    }
    catch {
        $cloudResult = $null
    }

    # Successful cloud verification
    if ($cloudResult -and $cloudResult.valid -eq $true) {
        Add-WFSLChainEvent -Type "cloud-verify" -Data $cloudResult
        return @{ valid = $true; reason = "Cloud-verified" }
    }

    # Cloud says revoked
    if ($cloudResult -and $cloudResult.reason -eq "Licence revoked") {
        Add-WFSLChainEvent -Type "cloud-revoked" -Data $cloudResult
        return @{ valid = $false; reason = "Revoked (cloud)" }
    }

    # ---------------------------
    # 2. Local fallback
    # ---------------------------
    $local = Test-WFSLLicenceLocal -Licence $Licence
    Add-WFSLChainEvent -Type "local-verify" -Data $local

    return $local
}
