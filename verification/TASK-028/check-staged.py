"""Check the exact staged payload without printing credentials."""
from pathlib import Path
import re, subprocess

paths = subprocess.check_output(['git', 'diff', '--cached', '--name-only', '-z']).decode().split('\0')
paths = [p for p in paths if p]
assert 'AGENTS.md' not in paths and 'next-env.d.ts' not in paths
secrets = []
for line in Path('.env.local').read_text(encoding='utf-8-sig').splitlines():
    key, separator, value = line.partition('=')
    value = value.strip().strip('"\'')
    if separator and (key.endswith('API_KEY') or key.endswith('SECRET')) and len(value) >= 24:
        secrets.append(value.encode())
for path in paths:
    assert not any(part in {'.git', '.next', '.vercel', 'node_modules'} for part in Path(path).parts), path
    assert not Path(path).name.startswith('.env'), path
    data = subprocess.check_output(['git', 'show', ':' + path])
    assert not re.search(rb'sk-[a-f0-9]{24,}', data), path
    assert not any(secret in data for secret in secrets), path
print({'stagedFiles': len(paths), 'credentialScan': 'PASS', 'userFilesExcluded': True})
