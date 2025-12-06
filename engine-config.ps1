# Global, guaranteed shared paths for all engine components

$GLOBAL:WFSL_STORE_PATH = "E:\CIC\WFSL-LICENCE-ENGINE\store"
$GLOBAL:WFSL_REVOCATION_FILE = Join-Path $GLOBAL:WFSL_STORE_PATH "revocation-list.json"
$GLOBAL:WFSL_CHAIN_FILE = Join-Path $GLOBAL:WFSL_STORE_PATH "chain-of-custody.json"
