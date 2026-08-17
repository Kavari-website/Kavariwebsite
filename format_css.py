#!/usr/bin/env python3
"""
Script para formatear archivos CSS al formato vertical (legible).
Convierte CSS compacto/minificado a un formato donde cada regla ocupa
varias líneas y cada propiedad se escribe en su propia línea con sangría.

Uso:
    python format_css.py                 # formatea todos los CSS en css/
    python format_css.py css/archivo.css # formatea un solo archivo
"""

import os
import sys


def parse_level(s):
    """Divide el contenido en items: ('comment', texto), ('rule', header, inner), ('atrule', header, inner), ('raw', texto)."""
    items = []
    i = 0
    n = len(s)
    while i < n:
        ch = s[i]
        if s.startswith('/*', i):
            j = s.find('*/', i + 2)
            j = n if j == -1 else j + 2
            items.append(('comment', s[i:j]))
            i = j
            continue
        if ch in ' \t\r\n':
            i += 1
            continue

        j = i
        q = None
        paren = 0
        while j < n:
            c = s[j]
            if q:
                if c == '\\':
                    j += 2
                    continue
                if c == q:
                    q = None
            elif c in '"\'':
                q = c
            elif c == '(':
                paren += 1
            elif c == ')' and paren > 0:
                paren -= 1
            elif c == '{' and paren == 0:
                break
            elif c == '}' and paren == 0:
                break
            j += 1

        if j >= n:
            header = s[i:j].strip()
            if header:
                items.append(('raw', header))
            break

        c = s[j]
        header = s[i:j].strip()
        if c == '{':
            jj = j + 1
            depth = 1
            q = None
            paren = 0
            while jj < n and depth > 0:
                cc = s[jj]
                if q:
                    if cc == '\\':
                        jj += 2
                        continue
                    if cc == q:
                        q = None
                elif cc in '"\'':
                    q = cc
                elif cc == '(':
                    paren += 1
                elif cc == ')':
                    paren -= 1
                elif cc == '{' and paren == 0:
                    depth += 1
                elif cc == '}' and paren == 0:
                    depth -= 1
                jj += 1
            inner = s[j + 1:jj - 1] if depth == 0 else s[j + 1:jj]
            if header.startswith('@'):
                items.append(('atrule', header, inner))
            else:
                items.append(('rule', header, inner))
            i = jj
        else:
            if header:
                items.append(('raw', header))
            i = j + 1
    return items


def has_top_level_open_brace(s):
    i = 0
    n = len(s)
    q = None
    paren = 0
    while i < n:
        c = s[i]
        if q:
            if c == '\\':
                i += 2
                continue
            if c == q:
                q = None
        elif c in '"\'':
            q = c
        elif c == '(':
            paren += 1
        elif c == ')':
            paren -= 1
        elif c == '{' and paren == 0:
            return True
        i += 1
    return False


def split_declarations(block, indent):
    out = []
    pad = '  ' * indent
    buf = []
    i = 0
    n = len(block)
    q = None
    paren = 0

    def flush():
        text = ''.join(buf).strip()
        if text:
            out.append(pad + text + ';')
        buf[:] = []

    while i < n:
        c = block[i]
        if block.startswith('/*', i):
            j = block.find('*/', i + 2)
            j = n if j == -1 else j + 2
            comment = block[i:j]
            if not ''.join(buf).strip():
                if comment.strip():
                    out.append(pad + comment)
            else:
                buf.append(comment)
            i = j
            continue
        if q:
            buf.append(c)
            if c == '\\' and i + 1 < n:
                buf.append(block[i + 1])
                i += 2
                continue
            if c == q:
                q = None
            i += 1
            continue
        if c in '"\'':
            q = c
            buf.append(c)
            i += 1
            continue
        if c == '(':
            paren += 1
            buf.append(c)
            i += 1
            continue
        if c == ')':
            if paren > 0:
                paren -= 1
            buf.append(c)
            i += 1
            continue
        if c == ';' and paren == 0:
            flush()
            i += 1
            continue
        buf.append(c)
        i += 1
    flush()
    return out


def format_items(items, indent=0):
    lines = []
    pad = '  ' * indent
    for item in items:
        kind = item[0]
        if kind == 'comment':
            lines.append(pad + item[1])
        elif kind == 'raw':
            lines.append(pad + item[1])
        elif kind == 'rule':
            lines.append(pad + item[1] + ' {')
            decls = split_declarations(item[2], indent + 1)
            if decls:
                lines.extend(decls)
            lines.append(pad + '}')
        else:  # atrule
            if has_top_level_open_brace(item[2]):
                lines.append(pad + item[1] + ' {')
                lines.extend(format_items(parse_level(item[2]), indent + 1))
                lines.append(pad + '}')
            else:
                lines.append(pad + item[1] + ' {')
                decls = split_declarations(item[2], indent + 1)
                if decls:
                    lines.extend(decls)
                lines.append(pad + '}')
    return lines


def format_css(css_content):
    lines = format_items(parse_level(css_content), 0)
    return '\n'.join(lines) + '\n'


def process_file(filepath, check_only=False):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            original = f.read()
    except (OSError, UnicodeDecodeError) as e:
        print(f'  ERROR leyendo {filepath}: {e}')
        return False
    formatted = format_css(original)
    if formatted != original:
        if check_only:
            print(f'  {os.path.basename(filepath)}: cambiaría el formato')
        else:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(formatted)
            print(f'  Formateado: {os.path.basename(filepath)}')
    else:
        print(f'  Sin cambios: {os.path.basename(filepath)}')
    return True


def main():
    args = sys.argv[1:]
    check_only = '--check' in args
    paths = [a for a in args if a != '--check']
    if not paths:
        css_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'css')
        paths = sorted(os.path.join(css_dir, f) for f in os.listdir(css_dir) if f.endswith('.css'))
    ok = True
    for p in paths:
        if os.path.isfile(p):
            ok = process_file(p, check_only) and ok
        else:
            print(f'  No existe: {p}')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())