import { readFileSync, writeFileSync } from 'node:fs';

const data = JSON.parse(readFileSync('f:/AI/命令大全/cb-work/_dl/data.json', 'utf8'));

const DANGER = { low:'低危', medium:'中危', high:'高危', critical:'极高危' };
const MODULES = { linux:{name:'Linux',icon:'🐧',lang:'bash'}, redis:{name:'Redis',icon:'🔴',lang:'redis'}, git:{name:'Git',icon:'🔀',lang:'bash'} };

let totalCmds=0, totalRecs=0;
const stats = {};
for (const m of ['linux','redis','git']) {
  for (const c of data[m].commands) { c._module = m; totalCmds++; }
  for (const r of data[m].recipes)  { r._module = m; totalRecs++; }
  stats[m] = { commands: data[m].commands.length, recipes: data[m].recipes.length };
}

/* ---------------- Markdown ---------------- */
const L = [];
L.push('# Command Book — 命令速查');
L.push('');
L.push('> 中文描述搜命令：Linux / Redis / Git 命令速查与配方，支持收藏、最近查看。');
L.push('> 数据来源：https://11052022.github.io/command-book-web/');
L.push(`> 共 ${totalCmds} 条命令 · ${totalRecs} 个配方（Linux ${stats.linux.commands}/${stats.linux.recipes}，Redis ${stats.redis.commands}/${stats.redis.recipes}，Git ${stats.git.commands}/${stats.git.recipes}）`);
L.push('');

function groupBy(items){
  const map = new Map();
  for (const it of items) {
    if (!map.has(it.category)) map.set(it.category, []);
    map.get(it.category).push(it);
  }
  return [...map.entries()];
}

function cmdBody(c) {
  const out = [];
  out.push(`**${c.name}**　\`${DANGER[c.danger_level] || '中危'}\``);
  out.push('');
  out.push(`> ${c.description}`);
  out.push('');
  out.push('**语法：**');
  out.push('');
  out.push('```' + (MODULES[c._module].lang || 'bash'));
  out.push(c.synopsis || '');
  out.push('```');
  if (c.common_options && c.common_options.length) {
    out.push('');
    out.push('**常用参数：**');
    for (const o of c.common_options) out.push(`- \`${o.name}\`：${o.description || ''}`);
  }
  if (c.examples && c.examples.length) {
    out.push('');
    out.push('**示例：**');
    c.examples.forEach((e, i) => {
      out.push('');
      out.push(`${i + 1}. ${e.description || ''}`);
      out.push('');
      out.push('   ```' + (MODULES[c._module].lang || 'bash'));
      out.push('   ' + String(e.code).replace(/\n/g, '\n   '));
      out.push('   ```');
    });
  }
  if (c.related && c.related.length) {
    out.push('');
    out.push('**相关命令：** ' + c.related.map(x => `\`${x}\``).join('、'));
  }
  if (c.tags && c.tags.length) {
    out.push('');
    out.push('**标签：** ' + c.tags.join('、'));
  }
  return out.join('\n');
}

function recipeBody(r) {
  const out = [];
  out.push(`**${r.name}**`);
  out.push('');
  out.push(`> ${r.description}`);
  out.push('');
  out.push('**一键执行：**');
  out.push('');
  out.push('```' + (r.lang || MODULES[r._module].lang || 'bash'));
  out.push(r.fullCommand);
  out.push('```');
  if (r.steps && r.steps.length) {
    out.push('');
    out.push('**步骤拆解：**');
    r.steps.forEach((s, i) => {
      out.push('');
      out.push(`${i + 1}. ${s.description || ''}`);
      out.push('');
      out.push('   ```' + (r.lang || MODULES[r._module].lang || 'bash'));
      out.push('   ' + s.code.replace(/\n/g, '\n   '));
      out.push('   ```');
    });
  }
  if (r.tags && r.tags.length) {
    out.push('');
    out.push('**标签：** ' + r.tags.join('、'));
  }
  return out.join('\n');
}

for (const m of ['linux','redis','git']) {
  const meta = MODULES[m];
  L.push('---');
  L.push('');
  L.push(`## ${meta.icon} ${meta.name}`);
  L.push('');
  L.push(`### 命令（${stats[m].commands} 条）`);
  L.push('');
  const catGroups = groupBy(data[m].commands);
  for (const [cat, items] of catGroups) {
    L.push(`#### ${cat}`);
    L.push('');
    for (const c of items) {
      L.push(cmdBody(c));
      L.push('');
      L.push('---');
      L.push('');
    }
  }
  if (data[m].recipes.length) {
    L.push(`### 配方（${stats[m].recipes} 个）`);
    L.push('');
    for (const r of data[m].recipes) {
      L.push(`#### 📋 配方 · ${r.name}`);
      L.push('');
      L.push(recipeBody(r));
      L.push('');
      L.push('---');
      L.push('');
    }
  }
}

writeFileSync('f:/AI/命令大全/cb-work/command-book.md', L.join('\n'), 'utf8');

/* ---------------- HTML ---------------- */
let html = readFileSync('f:/AI/命令大全/cb-work/template.html', 'utf8');
let json = JSON.stringify(data);
json = json.replace(/</g, '\\u003c'); // 避免 </script>
if (!html.includes('__DATA_PLACEHOLDER__')) throw new Error('template placeholder not found');
html = html.replace('__DATA_PLACEHOLDER__', json);
writeFileSync('f:/AI/命令大全/cb-work/command-book.html', html, 'utf8');

console.log('commands:', totalCmds, 'recipes:', totalRecs);
console.log('MD  ->', 'command-book.md', (L.join('\n').length) + ' chars');
console.log('HTML->', 'command-book.html', html.length + ' chars');