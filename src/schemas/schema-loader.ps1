function Get-WFSLSchema {
    param(
        [Parameter(Mandatory)]
        [string] $Name
    )

    switch ($Name) {
        "licence" { return @{ version = "1.0" } }
        "revocation" { return @{ version = "1.0" } }
        default { return @{ version = "unknown" } }
    }
}
