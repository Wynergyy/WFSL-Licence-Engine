function New-WFSLLicence {
    param(
        [Parameter(Mandatory)][string] $Customer,
        [Parameter(Mandatory)][string] $Product
    )

    $licence = @{
        licenceId = [guid]::NewGuid().ToString()
        customer  = $Customer
        issuedAt  = (Get-Date).ToString("o")
        expiresAt = $null
        machineId = (Get-Random -Minimum 10000000 -Maximum 99999999).ToString()
        product   = $Product
        edition   = "CE"
        metadata  = @{}
    }

    # Canonical string (sorted keys)
    $canonical = ($licence.Keys | Sort-Object | ForEach-Object {
        "$_=$($licence[$_])"
    }) -join ";"

    $sha = New-Object System.Security.Cryptography.SHA256Managed
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($canonical)
    $calc = $sha.ComputeHash($bytes)
    $hex  = ($calc | ForEach-Object { $_.ToString("x2") }) -join ""

    $licence.hash = $hex
    $licence.signature = "unsigned-ce-v1.0"

    return $licence
}
