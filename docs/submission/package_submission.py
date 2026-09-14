"""Build the submission bundle from a pinned Git revision and checked artifacts."""
from pathlib import Path
import hashlib, io, json, re, subprocess, tarfile, zipfile

root = Path.cwd()
out = root / 'output/submission'
out.mkdir(parents=True, exist_ok=True)
release = json.loads((root / 'verification/TASK-028/release.json').read_text(encoding='utf-8-sig'))
commit = release['sourceCommit']
archive = subprocess.check_output(['git', 'archive', '--format=tar', commit], cwd=root)
allowed_dirs = {'src', 'data', 'scripts', 'tests', 'public', 'docs', 'tasks', '.github', 'verification'}
editable_plan_images = {'output/playwright/TASK-028/home-1440.png', 'output/playwright/TASK-028/blackboard-detail.png'}
excluded_dirs = {'node_modules', '.next', '.vercel', '.git', '.playwright-cli', '__pycache__'}
secret_pattern = re.compile(rb'sk-[a-f0-9]{24,}')
local_secret_values = []
env_path = root / '.env.local'
if env_path.exists():
    for line in env_path.read_text(encoding='utf-8-sig').splitlines():
        key, separator, value = line.partition('=')
        value = value.strip().strip('\"\'')
        if separator and (key.endswith('API_KEY') or key.endswith('SECRET')) and len(value) >= 24:
            local_secret_values.append(value.encode('utf-8'))
files = {}
with tarfile.open(fileobj=io.BytesIO(archive)) as tar:
    for member in tar.getmembers():
        if not member.isfile():
            continue
        path = Path(member.name)
        if len(path.parts) > 1 and path.parts[0] not in allowed_dirs and member.name not in editable_plan_images:
            continue
        if path.parts[0] == 'verification' and (len(path.parts) < 2 or path.parts[1] != 'TASK-028'):
            continue
        if set(path.parts) & excluded_dirs:
            raise RuntimeError(f'Unexpected excluded directory: {path}')
        if path.name.startswith('.env') and path.name != '.env.example':
            raise RuntimeError(f'Unexpected environment file: {path}')
        payload = tar.extractfile(member).read()
        if secret_pattern.search(payload) or any(value in payload for value in local_secret_values):
            raise RuntimeError(f'Credential pattern in source file: {path}')
        files[member.name] = payload

required = ['package.json', 'package-lock.json', '.env.example', 'README.md',
            'src/app/page.tsx', 'data/classrooms/catalog.ts',
            'data/classrooms/synthetic-lessons.ts', 'data/snapshots/active.json',
            'src/domain/schemas/contribution.ts', 'src/features/contribution/contribution-machine.ts',
            'src/features/contribution/ContributionPanel.tsx', 'data/contributions/invitations.ts']
assert all(name in files for name in required), 'Missing reproducibility files'
assert files['public/product-plan.pdf'] == (root / 'public/product-plan.pdf').read_bytes()
assert files['public/demo.webm'] == (root / 'public/demo.webm').read_bytes()

def make_zip(path, entries):
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for name, payload in sorted(entries.items()):
            z.writestr(name, payload)
    with zipfile.ZipFile(path) as z:
        assert z.testzip() is None, f'Invalid archive: {path}'
        assert set(z.namelist()) == set(entries), 'Archive file list mismatch'

source = out / '知遇一席_参赛代码.zip'
source_entries = {f'Zhiyu/{name}': payload for name, payload in files.items()}
source_entries['Zhiyu/SOURCE_VERSION.json'] = json.dumps({
    'commit': commit, 'branch': release['branch'], 'deploymentId': release['deploymentId'],
    'note': '与部署相同的 Git 代码和公开附件。最新公网验收见总包 10_验收报告.md。'
}, ensure_ascii=False, indent=2).encode('utf-8')
make_zip(source, source_entries)

entries = {}
def add(name, path):
    entries[name] = (root / path).read_bytes()

add('01_产品说明书.pdf', 'public/product-plan.pdf')
add('02_经验入席演示.webm', 'public/demo.webm')
add('03_图标.png', 'docs/submission/icon.png')
add('04_三教室封面.png', 'docs/submission/cover.png')
add('05_演示讲稿.md', 'docs/submission/DEMO_SCRIPT.md')
add('06_提交信息.md', 'docs/submission/SUBMISSION_FIELDS.md')
entries['07_参赛代码.zip'] = source.read_bytes()
for number in ('101', '102', '103'):
    add(f'08_截图/{number}_课堂.png', f'output/playwright/TASK-028/{number}-ready-1440.png')
    add(f'08_截图/{number}_完成一课.png', f'output/playwright/TASK-028/{number}-seated-1440.png')
    add(f'08_截图/{number}_确认贡献.png', f'output/playwright/TASK-028/{number}-contributed-1440.png')
    add(f'09_课堂产物/{number}_笔记.md', f'output/playwright/TASK-028/{number}-classnote-1440.md')
    add(f'09_课堂产物/{number}_贡献卡.md', f'output/playwright/TASK-028/{number}-contribution-1440.md')
    add(f'13_邀请图/{number}_邀请.png', f'output/playwright/TASK-028/{number}-invite-1440.png')
add('08_截图/首页_三间教室.png', 'output/playwright/TASK-028/home-1440.png')
add('08_截图/黑板新增材料.png', 'output/playwright/TASK-028/blackboard-detail.png')
add('08_截图/103_手机贡献全流程.png', 'output/playwright/TASK-028/103-contributed-390.png')
add('09_课堂产物/102_录屏实际AI贡献卡.md', 'output/playwright/TASK-028/video-102-contribution.md')
add('10_验收报告.md', 'verification/TASK-028/report.md')
add('11_Agent学习与求职说明.md', 'docs/operations/AGENT_LEARNING_AND_RESUME.md')
add('12_产品说明书可编辑稿.md', 'docs/submission/PRODUCT_PLAN.md')
add('14_人气奖行动与邀请文案.md', 'docs/submission/POPULARITY_PLAN.md')
# Keep editable Markdown images resolvable after moving the document to the package root.
entries['12_产品说明书可编辑稿.md'] = entries['12_产品说明书可编辑稿.md'].replace(
    b'../../output/playwright/TASK-028/home-1440.png', '08_截图/首页_三间教室.png'.encode()).replace(
    b'../../output/playwright/TASK-028/blackboard-detail.png', '08_截图/黑板新增材料.png'.encode())
entries['00_先读我.md'] = f'''# 知遇·一席｜经验入席版提交包

团队：知乎有你一席 · 杨骐瑞 · 湖北师范大学
截止：2026-09-15 10:00（北京时间）。本包不代表已在知乎完成投稿。

1. 先看 06_提交信息.md，将 Demo 链接与作品介绍填入官方提交页。
2. 上传 01_产品说明书.pdf；需要时用 03_图标.png、04_三教室封面.png。
3. 02_经验入席演示.webm 为 {release['video']['seconds']} 秒、1366×768 无旁白录屏，含 101 原有示例、102 实际模型整理虚构经历、103 明确人工整理。
4. 源码链接指向 TASK-028 新版分支；07_参赛代码.zip 可独立解压运行。
5. 09_课堂产物/ 为浏览器实际下载的示例产物，13_邀请图/ 可与公开课堂链接一起分享。
6. 完成最终提交，保存成功回执；此前三教室材料已被本包替代，后续按 14_人气奖行动与邀请文案.md 邀请真实体验者。

## 运行代码

解压 07_参赛代码.zip，进入 Zhiyu。安装 Node.js 24，然后执行：

    npm ci
    Copy-Item .env.example .env.local

在 .env.local 填写独立随机的 LEARNING_SESSION_SECRET（至少 32 字符）。
原有精确示例无需模型凭证；自己的观点和经验追问需要 STRUCTURED_OUTPUT_API_KEY。
经验的“先由我自己整理”路径不依赖模型，不能把它称为 AI 成功。
生产模型为 deepseek-v4-pro，地址为 https://api.deepseek.com。
随后执行 npm run dev，打开 http://localhost:3000。
部署前执行 npm run build；其预检会校验真实 Snapshot 和合成目录。

## 版本和真实范围

源码版本：{commit}
生产部署：{release['deploymentId']}
101 是 12 条真实知乎摘要；102/103 各 24 条合成材料，不代表真实知乎讨论。
PDF 6 页；贡献当前会话保存，自述与虚构示例持续标记。源码中的 Task 状态记录提交时点，最新公网及材料验收看 10_验收报告.md。
SHA256SUMS.txt 可核对包内文件；RELEASE.json 记录 Git、部署和附件校验和。
密钥、环境配置、依赖缓存及用户个人输入未包含在源码或材料包中。
'''.encode('utf-8')
release['packageFiles'] = [{
    'path': name, 'bytes': len(payload), 'sha256': hashlib.sha256(payload).hexdigest()
} for name, payload in sorted(entries.items())]
release['sourceFileCount'] = len(source_entries)
entries['RELEASE.json'] = json.dumps(release, ensure_ascii=False, indent=2).encode('utf-8')
entries['SHA256SUMS.txt'] = ''.join(
    f'{hashlib.sha256(payload).hexdigest()}  {name}\n' for name, payload in sorted(entries.items())
).encode('utf-8')
package = root / 'docs/submission/知遇一席_经验入席版_提交材料包.zip'
make_zip(package, entries)
# Replace the earlier stable handoff name as well, so it cannot serve the stale single-room package.
stable = root / 'docs/submission/知遇一席_提交材料包.zip'
stable.write_bytes(package.read_bytes())
result = {
    'sourceCommit': commit, 'sourceFileCount': len(source_entries),
    'packageFileCount': len(entries), 'sourceBytes': source.stat().st_size,
    'packageBytes': package.stat().st_size,
    'packageSha256': hashlib.sha256(package.read_bytes()).hexdigest(),
    'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'zipIntegrity': 'PASS', 'credentialScan': 'PASS', 'requiredFiles': 'PASS',
    'gitPublicAssetsMatchWorkingFiles': True,
}
(root / 'verification/TASK-028/package-check.json').write_text(
    json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(result, ensure_ascii=False))
