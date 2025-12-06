# WFSL Licence Engine CE v1.0
# Cryptography Core Module
# Provides secure key generation, hashing, signing and verification.

Set-StrictMode -Version Latest

function Get-WFSLMachineID {
    $os = Get-CimInstance Win32_OperatingSystem | Select-Object -ExpandProperty SerialNumber
    $cpu = (Get-CimInstance Win32_Processor | Select-Object -ExpandProperty ProcessorId)
    $disk = (Get-Partition -DriveLetter C).AccessPaths[0]

    $raw = "$os-$cpu-$disk"
    return (Get-FileHash -InputStream ([IO.MemoryStream]::new([Text.Encoding]::UTF8.GetBytes($raw))) -Algorithm SHA256).Hash
}

function New-WFSLKeyPair {
    $rsa = [System.Security.Cryptography.RSA]::Create(4096)

    return @{
        public  = $rsa.ExportRSAPublicKey()
        private = $rsa.ExportRSAPrivateKey()
        created = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    }
}

function Save-WFSLKeyPair {
    param (
        [string] $Path,
        [byte[]] $PublicKey,
        [byte[]] $PrivateKey
    )

    $folder = Split-Path $Path -Parent
    if (-not (Test-Path $folder)) { New-Item -ItemType Directory -Path $folder -Force | Out-Null }

    [System.IO.File]::WriteAllBytes("$Path.public.pem", $PublicKey)
    [System.IO.File]::WriteAllBytes("$Path.private.pem", $PrivateKey)

    return "$Path keys saved"
}

function Get-WFSLHash {
    param ([string] $Input)

    $bytes = [Text.Encoding]::UTF8.GetBytes($Input)
    return (Get-FileHash -InputStream ([IO.MemoryStream]::new($bytes)) -Algorithm SHA256).Hash
}

function Sign-WFSLData {
    param (
        [string] $Data,
        [byte[]] $PrivateKey
    )

    $rsa = [System.Security.Cryptography.RSA]::Create()
    $rsa.ImportRSAPrivateKey($PrivateKey, [ref]0)

    $bytes = [Text.Encoding]::UTF8.GetBytes($Data)
    $signature = $rsa.SignData($bytes, [System.Security.Cryptography.HashAlgorithmName]::SHA256, [System.Security.Cryptography.RSASignaturePadding]::Pkcs1)

    return [Convert]::ToBase64String($signature)
}

function Verify-WFSLSignature {
    param (
        [string] $Data,
        [string] $Signature,
        [byte[]] $PublicKey
    )

    $rsa = [System.Security.Cryptography.RSA]::Create()
    $rsa.ImportRSAPublicKey($PublicKey, [ref]0)

    $bytes = [Text.Encoding]::UTF8.GetBytes($Data)
    $sigBytes = [Convert]::FromBase64String($Signature)

    return $rsa.VerifyData($bytes, $sigBytes, [System.Security.Cryptography.HashAlgorithmName]::SHA256, [System.Security.Cryptography.RSASignaturePadding]::Pkcs1)
}
