$files = @(
    "C:\Users\USUARIO\Downloads\Kavariwebsite\destino.html",
    "C:\Users\USUARIO\Downloads\Kavariwebsite\planes.html",
    "C:\Users\USUARIO\Downloads\Kavariwebsite\perfil.html"
)

$ia = [string][char]0x00ED
$Ia = [string][char]0x00CD
$oa = [string][char]0x00F3
$Oa = [string][char]0x00D3
$aa = [string][char]0x00E1
$Aa = [string][char]0x00C1
$ea = [string][char]0x00E9
$ua = [string][char]0x00FA
$Ua = [string][char]0x00DA
$dot = [string][char]0x00B7
$copy = [string][char]0x00A9

foreach ($file in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $content = [System.Text.Encoding]::UTF8.GetString($bytes)
    
    # Current state: files have UPPERCASE accented chars everywhere (Í, Á, Ó, Ú)
    # Need to: lowercase them, but keep uppercase in ALL-CAPS sections
    
    # Step 1: Replace all uppercase accented with lowercase
    $content = $content.Replace($Ia, $ia)
    $content = $content.Replace($Aa, $aa)
    $content = $content.Replace($Oa, $oa)
    $content = $content.Replace($Ua, $ua)
    
    # Step 2: Fix ALL-CAPS words that need uppercase
    # AEROLÍNEAS -> AEROLÍNEAS
    $aerolineas = "AEROL" + $Ia + "NEAS"
    $aerolineasLower = "aerol" + $ia + "neas"
    $content = $content.Replace($aerolineasLower, $aerolineas)
    
    # GASTRONOMÍA -> GASTRONOMÍA
    $gastronomia = "GASTRONOM" + $Ia + "A"
    $gastronomiaLower = "gastronom" + $ia + "a"
    $content = $content.Replace($gastronomiaLower, $gastronomia)
    
    # OPTIMIZACIÓN -> OPTIMIZACIÓN
    $optimizacion = "OPTIMIZACI" + $Oa + "N"
    $optimizacionLower = "optimizaci" + $oa + "n"
    $content = $content.Replace($optimizacionLower, $optimizacion)
    
    # MENÚ -> MENÚ
    $menu = "MEN" + $Ua
    $menuLower = "men" + $ua
    $content = $content.Replace($menuLower, $menu)
    
    # PRÁCTICA -> PRÁCTICA
    $practica = "PR" + $Aa + "CTICA"
    $practicaLower = "pr" + $aa + "ctica"
    $content = $content.Replace($practicaLower, $practica)
    
    # GUÍAS TURÍSTICOS -> GUÍAS TURÍSTICOS
    $guias = "GU" + $Ia + "AS TUR" + $Ia + "STICOS"
    $guiasLower = "gu" + $ia + "as tur" + $ia + "sticos"
    $content = $content.Replace($guiasLower, $guias)
    
    # Íconos (start of sentence) -> Íconos
    $iconos = $Ia + "conos"
    $iconosLower = $ia + "conos"
    $content = $content.Replace($iconosLower, $iconos)
    
    # Única (start of sentence) -> Única
    $unica = $Ua + "nica"
    $unicaLower = $ua + "nica"
    $content = $content.Replace($unicaLower, $unica)
    
    # Write back as UTF-8 without BOM
    $utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($file, $content, $utf8NoBOM)
    
    Write-Host "Fixed case: $(Split-Path $file -Leaf)"
}

Write-Host "Done."
