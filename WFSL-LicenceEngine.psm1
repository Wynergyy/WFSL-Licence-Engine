# ===================================================================
# WFSL Licence Engine – Production Module Loader
# ===================================================================

# Ensure $root always resolves correctly
$root = Split-Path -Parent $PSCommandPath

# -------------------------
# Load core config
# -------------------------
. "$root\engine-config.ps1"

# -------------------------
# Load internal components
# -------------------------
. "$root\src\schemas\schema-loader.ps1"
. "$root\src\integrity\chain-of-custody.ps1"
. "$root\src\validation\revocation-engine.ps1"
. "$root\src\validation\local-validator.ps1"
. "$root\src\validation\licence-validation.ps1"
. "$root\src\cloud\cloud-client.ps1"
. "$root\src\licence\create-licence.ps1"

# -------------------------
# Public API Exports
# -------------------------
Export-ModuleMember -Function `
    New-WFSLLicence, `
    Test-WFSLLicence, `
    Add-WFSLRevocation, `
    Get-WFSLRevocationList
