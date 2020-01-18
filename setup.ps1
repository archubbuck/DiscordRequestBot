### SYSTEM REQUIREMENTS ###

Write-Host "`nSatisfying system requirements..." -NoNewline -ForegroundColor Cyan
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
   Write-Host "FAIL" -ForegroundColor Red
   Write-Error "This setup needs admin permissions. Please run this file as admin."     
   break
}
Write-Host "PASS`n" -ForegroundColor Green

### NODE INSTALLER ###

$node_js_version = "v13.6.0-x64"
$node_js_major_version = $node_js_version.Substring($node_js_version.IndexOf("v"), $node_js_version.IndexOf("."))
$node_msi = "node-$node_js_version.msi"
$node_js_url = "https://nodejs.org/dist/latest-$node_js_major_version.x/$node_msi"

if (Get-Command node -errorAction SilentlyContinue) {
    $current_version = (node -v)
}

Write-Information "`n[NODE INSTALLER]`n"
if ($current_version) {
    Write-Information "Current:  $current_version"
}
Write-Information "Install:  $node_js_version"
Write-Information "Download: $node_js_url"

$install_node = $true
if ($current_version) {
    write-host "[NODE] nodejs $current_version is already installed."
    $confirmation = read-host "Are you sure you want to replace this version? [y/n]"
    if ($confirmation -ne "y") {
        $install_node = $false
    }
}

if ($install_node) {
    $node_msi_path = "$PSScriptRoot\$node_msi"

    ### NODE JS DOWNLOAD

    write-host "[NODE] Downloading $node_msi..."
    $start_time = Get-Date
    $wc = New-Object System.Net.WebClient
    $wc.DownloadFile($node_js_url, $node_msi_path)
    write-Output "$node_msi has been downloaded."
    write-Output "Time taken: $((Get-Date).Subtract($start_time).Seconds) second(s)."

    ### NODE JS INSTALL
    
    write-host "[NODE] Installing $node_msi..."
    # Start-Process $node_msi_path -Wait
    $node_install_log = "$PSScriptRoot\node-install-{0}.log" -f $(get-date -Format yyyyMMddTHHmmss)
    Write-Host "[NODE] Logging to $node_install_log..."
    Start-Process "msiexec.exe" -ArgumentList @("/i", ('"{0}"' -f $node_msi_path), "/qn", "/norestart", "/L*v", $node_install_log) -Wait -NoNewWindow
    Write-Host "Done." -ForegroundColor Green
    
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User") 
}

### GIT INSTALLER ###

$git_version = "2.25.0"
$git_exe = "Git-$git_version-64-bit.exe"
$git_url = "https://github.com/git-for-windows/git/releases/download/v$git_version.windows.1/$git_exe"

if (Get-Command git -errorAction SilentlyContinue) {
    $git_current_version = (git --version)
}

Write-Information "`n[GIT INSTALLER]`n"
if ($git_current_version) {
    Write-Information "Current:  $git_current_version"
}
Write-Information "Install:  $git_version"
Write-Information "Download: $git_url"

$install_git = $true
if ($git_current_version) {
    write-host "[GIT] $git_current_version is already installed."
    $confirmation = read-host "Are you sure you want to replace this version? [y/n]"
    if ($confirmation -ne "y") {
        $install_git = $false
    }
}

if ($install_git) {
    $git_exe_path = "$PSScriptRoot\$git_exe"
    Write-Host "[GIT] Downloading $git_exe..."

    ### GIT DOWNLOAD ###

    $start_time = Get-Date
    $wc = New-Object System.Net.WebClient
    $wc.DownloadFile($git_url, $git_exe_path)
    write-Output "$git_exe has been downloaded."
    write-Output "Time taken: $((Get-Date).Subtract($start_time).Seconds) second(s)"
    
    ### GIT INSTALL ###

    write-host "[GIT] Installing $git_exe..."
    $git_install_log = "$PSScriptRoot\git-install-{0}.log" -f $(get-date -Format yyyyMMddTHHmmss)
    Write-Host "[GIT] Logging to $git_install_log..."
    Start-Process $git_exe_path -Wait -ArgumentList $('/SP- /VERYSILENT /SUPPRESSMSGBOXES /FORCECLOSEAPPLICATIONS /LOG="' + $git_install_log + '"')
    Write-Host "Done." -ForegroundColor Green
}