#!/usr/bin/env python3
"""Ay Yıldız — derleme sırasında JS yorumlarını ve girintileri kaldırır (V2.25). Metin, şablon ve düzenli ifade (regex)
değişmezlerine dokunmaz; sonuç tests/ ve tools/browser-check.js ile sınanır. Kaynak dosyalar yorumlu kalır."""
import re
def strip_js(s):
    """Removes comments (and lines left empty) from JS, keeping strings, template literals and regex literals intact."""
    out=[]; i=0; n=len(s); last_sig=''
    def regex_ok(j):
        k=j-1
        while k>=0 and s[k] in ' \t\n\r': k-=1
        if k<0: return True
        c=s[k]
        if c in '(,=:[!&|?{};+-*%<>~^': return True
        m=re.search(r'([A-Za-z_$]+)$',s[max(0,k-10):k+1])
        return bool(m and m.group(1) in ('return','typeof','case','in','of','void','delete','throw','else','new'))
    while i<n:
        c=s[i]
        if c in '"\'':
            j=i+1
            while s[j]!=c:
                if s[j]=='\\': j+=1
                j+=1
            out.append(s[i:j+1]); i=j+1; continue
        if c=='`':
            j=i+1; depth=0
            while True:
                ch=s[j]
                if ch=='\\': j+=2; continue
                if ch=='`' and depth==0: break
                if ch=='$' and s[j+1]=='{': depth+=1; j+=2; continue
                if ch=='}' and depth>0: depth-=1
                j+=1
            out.append(s[i:j+1]); i=j+1; continue
        if c=='/' and s[i+1:i+2]=='/':
            j=s.find('\n',i); j=n if j<0 else j; i=j; continue
        if c=='/' and s[i+1:i+2]=='*':
            j=s.index('*/',i+2); seg=s[i:j+2]
            if '\n' in seg:
                if not out or out[-1]!='\n': out.append('\n')
            else: out.append(' ')
            i=j+2; continue
        if c=='/' and regex_ok(i):
            j=i+1; cls=False
            while True:
                ch=s[j]
                if ch=='\\': j+=2; continue
                if ch=='[': cls=True
                elif ch==']': cls=False
                elif ch=='/' and not cls: break
                elif ch=='\n': raise Exception('regex at %d: %r'%(i,s[i-30:i+30]))
                j+=1
            j+=1
            while j<n and (s[j].isalpha()): j+=1
            out.append(s[i:j]); i=j; continue
        if c=='\n':
            if not out or out[-1]!='\n': out.append('\n')
            i+=1
            while i<n and s[i] in ' \t': i+=1      # indentation (outside strings and templates only)
            continue
        out.append(c); i+=1
    return ''.join(out)
