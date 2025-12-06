function Invoke-WFSLCloudVerify {
    param(
        [Parameter(Mandatory)]
        [psobject]$Licence
    )

    $url = "https://wfsl-licence-verify.paul-wynn.workers.dev/verify"

    $body = @{
        licenceId = $Licence.licenceId
        machineId = $Licence.machineId
        product   = $Licence.product
        hash      = $Licence.hash
        signature = $Licence.signature
    } | ConvertTo-Json -Depth 5

    try {
        $resp = Invoke-RestMethod -Method Post -Uri $url -Body $body -ContentType "application/json"
        return $resp
    }
    catch {
        return $null   # fallback to local validation
    }
}
