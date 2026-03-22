# Script para corregir encoding de nombres en mx.json

$filePath = "src\assets\mx.json"
$backupPath = "src\assets\mx.json.backup"

Write-Host "Creando backup en $backupPath..."
Copy-Item $filePath $backupPath -Force

Write-Host "Leyendo archivo..."
$content = Get-Content $filePath -Raw -Encoding UTF8

Write-Host "Aplicando correcciones de nombres..."

# Correcciones de encoding - usar comillas simples para evitar problemas
$content = $content -replace '"name": "Nuevo Le.{2}n"', '"name": "Nuevo León"'
$content = $content -replace '"name": "Yucat.{2}n"', '"name": "Yucatán"'
$content = $content -replace '"name": "Michoac.{2}n"', '"name": "Michoacán"'
$content = $content -replace '"name": "M.{2}xico"', '"name": "México"'
$content = $content -replace '"name": "Quer.{2}taro"', '"name": "Querétaro"'
$content = $content -replace '"name": "San Luis Potos.{2}"', '"name": "San Luis Potosí"'
$content = $content -replace '"name": "Ciudad de M.{2}xico"', '"name": "Ciudad de México"'

Write-Host "Guardando archivo corregido..."
$content | Out-File $filePath -Encoding UTF8 -NoNewline

Write-Host "Correccion completada. Backup guardado en: $backupPath"
Write-Host ""
Write-Host "Verificando correcciones..."
Get-Content $filePath | Select-String '"name"' | Select-Object -First 35
