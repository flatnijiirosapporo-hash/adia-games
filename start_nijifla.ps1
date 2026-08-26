$ErrorActionPreference = 'Stop'
$Root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$Port = 8765
$Listener = $null

function Get-ContentType([string]$Path) {
    switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        '.html' { 'text/html; charset=utf-8' }
        '.htm'  { 'text/html; charset=utf-8' }
        '.js'   { 'text/javascript; charset=utf-8' }
        '.css'  { 'text/css; charset=utf-8' }
        '.json' { 'application/json; charset=utf-8' }
        '.png'  { 'image/png' }
        '.jpg'  { 'image/jpeg' }
        '.jpeg' { 'image/jpeg' }
        '.svg'  { 'image/svg+xml' }
        '.ico'  { 'image/x-icon' }
        default { 'application/octet-stream' }
    }
}

for ($p = $Port; $p -lt ($Port + 20); $p++) {
    try {
        $candidate = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $p)
        $candidate.Start()
        $Listener = $candidate
        $Port = $p
        break
    } catch {
        if ($candidate) { try { $candidate.Stop() } catch {} }
    }
}
if (-not $Listener) { throw 'ローカルサーバーを起動できませんでした。8765-8784番ポートを確認してください。' }

$Url = "http://127.0.0.1:$Port/index.html"
Write-Host ''
Write-Host '==============================================' -ForegroundColor Cyan
Write-Host ' にじフラ チャレンジを起動しました' -ForegroundColor Cyan
Write-Host " $Url"
Write-Host ' この画面を閉じると終了します。' -ForegroundColor Yellow
Write-Host '==============================================' -ForegroundColor Cyan
Write-Host ''
Start-Process $Url

try {
    while ($true) {
        $Client = $Listener.AcceptTcpClient()
        try {
            $Stream = $Client.GetStream()
            $Reader = [System.IO.StreamReader]::new($Stream, [System.Text.Encoding]::ASCII, $false, 4096, $true)
            $RequestLine = $Reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($RequestLine)) { continue }
            while ($true) { $line = $Reader.ReadLine(); if ([string]::IsNullOrEmpty($line)) { break } }
            $Parts = $RequestLine.Split(' ')
            if ($Parts.Length -lt 2) { continue }
            $Method = $Parts[0].ToUpperInvariant()
            $RawTarget = $Parts[1]
            if ($Method -ne 'GET' -and $Method -ne 'HEAD') {
                $Body = [System.Text.Encoding]::UTF8.GetBytes('Method Not Allowed')
                $Header = [System.Text.Encoding]::ASCII.GetBytes("HTTP/1.1 405 Method Not Allowed`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`n`r`n")
                $Stream.Write($Header,0,$Header.Length); if($Method -ne 'HEAD'){$Stream.Write($Body,0,$Body.Length)}; continue
            }
            $PathPart = $RawTarget.Split('?')[0].Split('#')[0]
            $PathPart = [System.Uri]::UnescapeDataString($PathPart).TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($PathPart)) { $PathPart = 'index.html' }
            $LocalPath = [System.IO.Path]::GetFullPath((Join-Path $Root ($PathPart.Replace('/', [System.IO.Path]::DirectorySeparatorChar))))
            if (-not $LocalPath.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
                $Body = [System.Text.Encoding]::UTF8.GetBytes('Forbidden')
                $Header = [System.Text.Encoding]::ASCII.GetBytes("HTTP/1.1 403 Forbidden`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`n`r`n")
                $Stream.Write($Header,0,$Header.Length); if($Method -ne 'HEAD'){$Stream.Write($Body,0,$Body.Length)}; continue
            }
            if ((Test-Path $LocalPath -PathType Container)) { $LocalPath = Join-Path $LocalPath 'index.html' }
            if (-not (Test-Path $LocalPath -PathType Leaf)) {
                $Body = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
                $Header = [System.Text.Encoding]::ASCII.GetBytes("HTTP/1.1 404 Not Found`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`n`r`n")
                $Stream.Write($Header,0,$Header.Length); if($Method -ne 'HEAD'){$Stream.Write($Body,0,$Body.Length)}; continue
            }
            $Body = [System.IO.File]::ReadAllBytes($LocalPath)
            $Type = Get-ContentType $LocalPath
            $HeaderText = "HTTP/1.1 200 OK`r`nContent-Type: $Type`r`nContent-Length: $($Body.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
            $Header = [System.Text.Encoding]::ASCII.GetBytes($HeaderText)
            $Stream.Write($Header,0,$Header.Length)
            if ($Method -ne 'HEAD') { $Stream.Write($Body,0,$Body.Length) }
        } catch {
            Write-Host "Request error: $($_.Exception.Message)" -ForegroundColor DarkYellow
        } finally {
            if ($Reader) { $Reader.Dispose() }
            if ($Stream) { $Stream.Dispose() }
            $Client.Close()
        }
    }
} finally {
    if ($Listener) { $Listener.Stop() }
}
