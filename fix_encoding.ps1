$files = @(
    "C:\Users\USUARIO\Downloads\Kavariwebsite\destino.html",
    "C:\Users\USUARIO\Downloads\Kavariwebsite\planes.html",
    "C:\Users\USUARIO\Downloads\Kavariwebsite\perfil.html"
)

$dot = [string][char]0x00B7
$copy = [string][char]0x00A9
$iacute = [string][char]0x00ED
$Iacute = [string][char]0x00CD
$oacute = [string][char]0x00F3
$Oacute = [string][char]0x00D3
$aacute = [string][char]0x00E1
$Aacute = [string][char]0x00C1
$eacute = [string][char]0x00E9
$uacute = [string][char]0x00FA
$Uacute = [string][char]0x00DA

$replacementChar = [string][char]0xFFFD

foreach ($file in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $content = [System.Text.Encoding]::UTF8.GetString($bytes)
    
    # Phase 1: Fix literal u{XXXX} text from previous broken script run
    $content = $content.Replace("u{00ED}", $iacute)
    $content = $content.Replace("u{00CD}", $Iacute)
    $content = $content.Replace("u{00F3}", $oacute)
    $content = $content.Replace("u{00D3}", $Oacute)
    $content = $content.Replace("u{00E1}", $aacute)
    $content = $content.Replace("u{00C1}", $Aacute)
    $content = $content.Replace("u{00E9}", $eacute)
    $content = $content.Replace("u{00FA}", $uacute)
    $content = $content.Replace("u{00DA}", $Uacute)
    $content = $content.Replace("u{00B7}", $dot)
    $content = $content.Replace("u{00A9}", $copy)
    
    # Phase 2: Fix any remaining U+FFFD (replacement char) using context patterns
    # Build search with U+FFFD
    function MkSearch($pattern) {
        return $pattern -replace [regex]::Escape("?"), $replacementChar
    }
    
    $content = $content.Replace((MkSearch "Identidad ? Tradici?n ? Historia"), "Identidad $dot Tradici${oacute}n $dot Historia")
    $content = $content.Replace((MkSearch "Sabores ? Tradici?n"), "Sabores $dot Tradici${oacute}n")
    $content = $content.Replace((MkSearch "Destinos ? Maravillas"), "Destinos $dot Maravillas")
    $content = $content.Replace((MkSearch "Vuelos ? Conexiones"), "Vuelos $dot Conexiones")
    $content = $content.Replace((MkSearch "Columna 1 ? Marca"), "Columna 1 $dot Marca")
    $content = $content.Replace((MkSearch "Columna 2 ? Enlaces"), "Columna 2 $dot Enlaces")
    $content = $content.Replace((MkSearch "Columna 3 ? Newsletter"), "Columna 3 $dot Newsletter")
    $content = $content.Replace((MkSearch "Destino ? KAVARI"), "Destino $dot KAVARI")
    $content = $content.Replace((MkSearch "MEN? DESPLEGABLE"), "MEN${uacute} DESPLEGABLE")
    $content = $content.Replace((MkSearch "GU?AS TUR?STICOS"), "GU${Iacute}AS TUR${Iacute}STICOS")
    $content = $content.Replace((MkSearch "Gu?as Tur?sticos"), "Gu${iacute}as Tur${iacute}sticos")
    $content = $content.Replace((MkSearch "OPTIMIZACI?N"), "OPTIMIZACI${Oacute}N")
    $content = $content.Replace((MkSearch "GASTRONOM?A"), "GASTRONOM${Iacute}A")
    $content = $content.Replace((MkSearch "AEROL?NEAS"), "AEROL${Iacute}NEAS")
    $content = $content.Replace((MkSearch "PR?CTICA"), "PR${Aacute}CTICA")
    $content = $content.Replace((MkSearch "Informaci?n Pr?ctica"), "Informaci${oacute}n Pr${aacute}ctica")
    $content = $content.Replace((MkSearch "? 2026 Kavari ? Todos"), "${copy} 2026 Kavari $dot Todos")
    $content = $content.Replace((MkSearch "a aqu?"), "a aqu${iacute}")
    $content = $content.Replace((MkSearch "Enlaces r?pidos"), "Enlaces r${aacute}pidos")
    $content = $content.Replace((MkSearch "Pa?ses"), "Pa${iacute}ses")
    $content = $content.Replace((MkSearch "pa?s?"), "pa${iacute}s")
    $content = $content.Replace((MkSearch "pa?s"), "pa${iacute}s")
    $content = $content.Replace((MkSearch "Pa?s"), "Pa${iacute}s")
    $content = $content.Replace((MkSearch "tur?sticos"), "tur${iacute}sticos")
    $content = $content.Replace((MkSearch "tur?stico"), "tur${iacute}stico")
    $content = $content.Replace((MkSearch "Gastronom?a"), "Gastronom${iacute}a")
    $content = $content.Replace((MkSearch "gastronom?a"), "gastronom${iacute}a")
    $content = $content.Replace((MkSearch "Aerol?neas"), "Aerol${iacute}neas")
    $content = $content.Replace((MkSearch "aerol?neas"), "aerol${iacute}neas")
    $content = $content.Replace((MkSearch "Gu?as"), "Gu${iacute}as")
    $content = $content.Replace((MkSearch "gu?as"), "gu${iacute}as")
    $content = $content.Replace((MkSearch "Pr?ctica"), "Pr${aacute}ctica")
    $content = $content.Replace((MkSearch "pr?ctica"), "pr${aacute}ctica")
    $content = $content.Replace((MkSearch "Valoraci?n"), "Valoraci${oacute}n")
    $content = $content.Replace((MkSearch "Informaci?n"), "Informaci${oacute}n")
    $content = $content.Replace((MkSearch "Selecci?n"), "Selecci${oacute}n")
    $content = $content.Replace((MkSearch "Tradici?n"), "Tradici${oacute}n")
    $content = $content.Replace((MkSearch "inversi?n"), "inversi${oacute}n")
    $content = $content.Replace((MkSearch "expresi?n"), "expresi${oacute}n")
    $content = $content.Replace((MkSearch "econ?mica"), "econ${oacute}mica")
    $content = $content.Replace((MkSearch "electr?nico"), "electr${oacute}nico")
    $content = $content.Replace((MkSearch "Pol?tica"), "Pol${iacute}tica")
    $content = $content.Replace((MkSearch "T?rminos"), "T${eacute}rminos")
    $content = $content.Replace((MkSearch "din?micamente"), "din${aacute}micamente")
    $content = $content.Replace((MkSearch "m?vil"), "m${oacute}vil")
    $content = $content.Replace((MkSearch "pr?ximo"), "pr${oacute}ximo")
    $content = $content.Replace((MkSearch "rinc?n"), "rinc${oacute}n")
    $content = $content.Replace((MkSearch "Men?"), "Men${uacute}")
    $content = $content.Replace((MkSearch "?nica"), "${uacute}nica")
    $content = $content.Replace((MkSearch "?nicas"), "${uacute}nicas")
    $content = $content.Replace((MkSearch "?conos"), "${Iacute}conos")
    $content = $content.Replace((MkSearch " m?s "), " m${aacute}s ")
    $content = $content.Replace((MkSearch " m?s."), " m${aacute}s.")
    $content = $content.Replace((MkSearch " m?s,"), " m${aacute}s,")
    $content = $content.Replace((MkSearch " m?s!"), " m${aacute}s!")
    $content = $content.Replace((MkSearch " m?s;"), " m${aacute}s;")
    $content = $content.Replace((MkSearch " m?s<"), " m${aacute}s<")
    
    # Write back as UTF-8 without BOM
    $utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($file, $content, $utf8NoBOM)
    
    Write-Host "Fixed: $(Split-Path $file -Leaf)"
}

Write-Host "Done."
