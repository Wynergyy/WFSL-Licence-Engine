function Test-WFSLIntegrity {
    param(
        [Parameter(Mandatory)][string] $InputString,
        [Parameter(Mandatory)][string] $ExpectedHash
    )

    $calc = Invoke-WFSLHash -InputString $InputString

    return @{
        valid  = ($calc -eq $ExpectedHash)
        reason = if ($calc -eq $ExpectedHash) { "match" } else { "mismatch" }
    }
}
