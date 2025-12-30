
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('logo_v2.png')
$img.Save('logo_v3.png', [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
Write-Host "Conversion Done"
