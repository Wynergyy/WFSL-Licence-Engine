# WFSL Licence Engine Module Loader

# Config
. "E:\CIC\WFSL-LICENCE-ENGINE\engine-config.ps1"

# Crypto
. "E:\CIC\WFSL-LICENCE-ENGINE\src\crypto\crypto-core.ps1"

# Schemas
. "E:\CIC\WFSL-LICENCE-ENGINE\src\schemas\schema-loader.ps1"

# Integrity
. "E:\CIC\WFSL-LICENCE-ENGINE\src\integrity\chain-of-custody.ps1"
. "E:\CIC\WFSL-LICENCE-ENGINE\src\integrity\integrity-hasher.ps1"
. "E:\CIC\WFSL-LICENCE-ENGINE\src\integrity\integrity-verify.ps1"

# Licence creation
. "E:\CIC\WFSL-LICENCE-ENGINE\src\licence\create-licence.ps1"

# Validation (local + cloud)
. "E:\CIC\WFSL-LICENCE-ENGINE\src\cloud\cloud-client.ps1"
. "E:\CIC\WFSL-LICENCE-ENGINE\src\validation\local-validator.ps1"
. "E:\CIC\WFSL-LICENCE-ENGINE\src\validation\revocation-engine.ps1"
. "E:\CIC\WFSL-LICENCE-ENGINE\src\validation\licence-validation.ps1"

# Export
Export-ModuleMember -Function *-WFSLLicence, Add-WFSLRevocation, Get-WFSLRevocationList
