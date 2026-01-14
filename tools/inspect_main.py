from pathlib import Path
p=Path('d:/projects/Ramzan/ramzan-calendar/assets/js/main.js')
s=p.read_text()
print('len',len(s))
# find mismatches
pairs={'(':')','[':']','{':'}'}
stack=[]
for i,ch in enumerate(s):
    if ch in '([{': stack.append((ch,i))
    elif ch in ')]}':
        if not stack:
            print('Unmatched closer',ch,'at',i)
            break
        last,idx=stack.pop()
        if pairs[last]!=ch:
            print('Mismatched',last,'at',idx,'with',ch,'at',i)
            # show context
            start=max(0,idx-40)
            end=min(len(s),i+40)
            print('context:',repr(s[start:end]))
            # show line number
            ln=s[:idx].count('\n')+1
            print('open at line',ln)
            ln2=s[:i].count('\n')+1
            print('close at line',ln2)
            break
else:
    print('All balanced')

# print lines 1..120 to inspect
lines=s.splitlines()
for n in range(1,121):
    if n<=len(lines):
        print(f'{n:03}: {lines[n-1]}')
