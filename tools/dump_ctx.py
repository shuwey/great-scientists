#!/usr/bin/env python3
"""按 (站, 实验) 打印绘制函数里所有改色语句，附上前一行与变量名，供人工写图例标签。"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

def fn_bounds(src):
    out = []
    for m in re.finditer(r'^\s*function\s+([A-Za-z_$][\w$]*)\s*\(', src, re.M):
        start = m.start()
        # 从该行起做括号配平
        i = src.find('{', m.end() - 1)
        if i < 0:
            continue
        depth, j = 0, i
        while j < len(src):
            if src[j] == '{':
                depth += 1
            elif src[j] == '}':
                depth -= 1
                if depth == 0:
                    break
            j += 1
        out.append((m.group(1), start, j + 1))
    return out

def dump(sid, lab):
    p = ROOT / 'scientists' / sid / 'assets' / 'js' / 'site.js'
    src = p.read_text(encoding='utf-8')
    fns = fn_bounds(src)
    cand = [f for f in fns if re.sub(r'^lab', '', f[0]).lstrip('_').lower() == lab.lower()
            or lab.lower() in f[0].lower()]
    if not cand:
        print(f'!! 未找到 {sid}:{lab}')
        return
    name, a, b = cand[0]
    body = src[a:b]
    lines = body.split('\n')
    print(f'\n===== {sid}.{lab}  ({name}, 行 {src[:a].count(chr(10))+1}) =====')
    for i, ln in enumerate(lines):
        s = ln.strip()
        if re.search(r'(fillStyle|strokeStyle)\s*=', s) or 'fillText' in s:
            prev = lines[i - 1].strip() if i else ''
            print(f'  [{i}] {s[:150]}')
            if prev and len(prev) < 130 and not re.search(r'(fillStyle|strokeStyle)\s*=', prev):
                print(f'       ↳ 前一行: {prev[:130]}')

if __name__ == '__main__':
    args = sys.argv[1:]
    if args and ':' in args[0]:
        for a in args:
            sid, lab = a.split(':', 1)
            dump(sid, lab)
    else:
        print('用法: dump_ctx.py <站:实验> ...  例: dump_ctx.py curie:rays bohr:shells')
