# WFSL Licence Engine CE v1.0 – Create Licence
# Complete integrated generator: hashing, signing, validation, custody.

# Load dependencies
. "E:\CIC\WFSL-LICENCE-ENGINE\src\crypto\crypto-core.ps1"
. "E:\CIC\WFSL-LICENCE-ENGINE\src\schemas\licence-schema.json"
. "E:\CIC\WFSL-LICENCE-ENGINE\src\validation\licence-validation.ps1"
. "E:\CIC\WFSL-LICENCE-ENGINE\src\integrity\chain-of-custody.ps1"

function New-WFSLLicence {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Customer,

        [Parameter(Mandatory = $true)]
        [string]$Product,

        [Parameter(Mandatory = $true)]
        [ValidateSet("CE","PRO","ENT")]
        [string]$Edition,

        [Parameter(Mandatory = $false)]
        [int]$ExpiryDays
    )

    # Generate timestamps
    $issued = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    $expires = $null
    if ($ExpiryDays) {
        $expires = (Get-Date).AddDays($ExpiryDays).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    }

    # Generate identifiers
    $licenceId = [Guid]::NewGuid().ToString()
    $machineId = (Get-HardwareHash)  # from crypto-core.ps1

    # Base licence (unsigned, unhashed)
    $licence = [pscustomobject]@{
        schema     = "WFSL-Licence-CE-v1.0"
        version    = "1.0.0"
        licenceId  = $licenceId
        customer   = $Customer
        issuedAt   = $issued
        expiresAt  = $expires
        machineId  = $machineId
        product    = $Product
        edition    = $Edition
        metadata   = @{}
        hash       = ""
        signature  = ""
    }

    # Compute integrity hash
    $payloadJson = $licence | ConvertTo-Json -Depth 10
    $tamperHash  = Get-TamperHash -Content $payloadJson
    $licence.hash = $tamperHash

    # Sign licence
    $licence.signature = Sign-WFSLLicence -Content $tamperHash

    # Validate before issuing
    $result = Test-WFSLLicence -Licence $licence
    if (-not $result.valid) {
        throw "Licence failed internal validation: $($result.reason)"
    }

    # Chain-of-custody entry
    Add-WFSLChainEntry -Operation "CREATE" -Data $licence

    return $licence
}

Export-ModuleMember -Function New-WFSLLicence
