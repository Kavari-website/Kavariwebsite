import os

files = [
    r"C:\Users\USUARIO\Downloads\Kavariwebsite\destino.html",
    r"C:\Users\USUARIO\Downloads\Kavariwebsite\planes.html",
    r"C:\Users\USUARIO\Downloads\Kavariwebsite\perfil.html",
]

# Only patterns that actually appear in these files
replacements = [
    # Multi-word patterns (longest first)
    ("Identidad ? Tradici?n ? Historia", "Identidad \u00b7 Tradici\u00f3n \u00b7 Historia"),
    ("Sabores ? Tradici?n", "Sabores \u00b7 Tradici\u00f3n"),
    ("Destinos ? Maravillas", "Destinos \u00b7 Maravillas"),
    ("Vuelos ? Conexiones", "Vuelos \u00b7 Conexiones"),
    ("Columna 1 ? Marca", "Columna 1 \u00b7 Marca"),
    ("Columna 2 ? Enlaces", "Columna 2 \u00b7 Enlaces"),
    ("Columna 3 ? Newsletter", "Columna 3 \u00b7 Newsletter"),
    ("Destino ? KAVARI", "Destino \u00b7 KAVARI"),
    ("MEN? DESPLEGABLE", "MEN\u00da DESPLEGABLE"),
    ("GU?AS TUR?STICOS", "GU\u00cdAS TUR\u00cdSTICOS"),
    ("Gu?as Tur?sticos", "Gu\u00edas Tur\u00edsticos"),
    ("OPTIMIZACI?N", "OPTIMIZACI\u00d3N"),
    ("GASTRONOM?A", "GASTRONOM\u00cdA"),
    ("AEROL?NEAS", "AEROL\u00cdNEAS"),
    ("PR?CTICA", "PR\u00c1CTICA"),
    ("Informaci?n Pr?ctica", "Informaci\u00f3n Pr\u00e1ctica"),
    
    # Medium patterns
    ("? 2026 Kavari ? Todos", "\u00a9 2026 Kavari \u00b7 Todos"),
    ("a aqu?", "a aqu\u00ed"),
    ("Enlaces r?pidos", "Enlaces r\u00e1pidos"),
    
    # Two-char accent replacements
    ("Pa?ses", "Pa\u00edses"),
    ("pa?s?", "pa\u00eds"),
    ("pa?s", "pa\u00eds"),
    ("Pa?s", "Pa\u00eds"),
    ("tur?sticos", "tur\u00edsticos"),
    ("tur?stico", "tur\u00edstico"),
    ("Gastronom?a", "Gastronom\u00eda"),
    ("gastronom?a", "gastronom\u00eda"),
    ("Aerol?neas", "Aerol\u00edneas"),
    ("aerol?neas", "aerol\u00edneas"),
    ("Gu?as", "Gu\u00edas"),
    ("gu?as", "gu\u00edas"),
    ("Pr?ctica", "Pr\u00e1ctica"),
    ("pr?ctica", "pr\u00e1ctica"),
    ("Valoraci?n", "Valoraci\u00f3n"),
    ("Informaci?n", "Informaci\u00f3n"),
    ("Selecci?n", "Selecci\u00f3n"),
    ("Tradici?n", "Tradici\u00f3n"),
    ("inversi?n", "inversi\u00f3n"),
    ("expresi?n", "expresi\u00f3n"),
    ("econ?mica", "econ\u00f3mica"),
    ("electr?nico", "electr\u00f3nico"),
    ("Pol?tica", "Pol\u00edtica"),
    ("T?rminos", "T\u00e9rminos"),
    ("din?micamente", "din\u00e1micamente"),
    ("m?vil", "m\u00f3vil"),
    ("pr?ximo", "pr\u00f3ximo"),
    ("rinc?n", "rinc\u00f3n"),
    ("Men?", "Men\u00fa"),
    
    # Single-char accent replacements (word-start)
    ("?nica", "\u00fanica"),
    ("?nicas", "\u00fanicas"),
    ("?conos", "\u00cdconos"),
    
    # m?s -> m\u00e1s (appears at word boundaries only)
    (" m?s ", " m\u00e1s "),
]

for filepath in files:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"Fixed: {os.path.basename(filepath)}")

print("Done with all replacements.")
