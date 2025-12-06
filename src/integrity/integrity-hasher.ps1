function Invoke-WFSLHash {
    param([Parameter(Mandatory)][string] $InputString)

    $bytes = [System.Text.Encoding]::UTF8.GetBytes($InputString)
    $sha   = New-Object System.Security.Cryptography.SHA256Managed
    $hash  = $sha.ComputeHash($bytes)

    return ($hash | ForEach-Object { $_.ToString("x2") }) -join ""
}
