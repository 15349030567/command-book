import fs from "node:fs";

const data = JSON.parse(fs.readFileSync(new URL("./all-data.json", import.meta.url), "utf8"));

const DANGER = {
  low: { label: "低危", icon: "🟢" },
  medium: { label: "中危", icon: "🟡" },
  high: { label: "高危", icon: "🔴" },
  critical: { label: "极高危", icon: "⛔" },
};

const MODULES = [
  { id: "linux", name: "Linux", icon: "🐧" },
  { id: "redis", name: "Redis", icon: "🔴" },
  { id: "git", name: "Git", icon: "🔀" },
];

const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const strip = (s) => String(s ?? "").replace(/[*_`[\]]/g, (m) => "\\" + m);

function commandSection(cmd) {
  const d = DANGER[cmd.danger_level] || DANGER.medium;
  const lines = [];
  lines.push(`#### \`${strip(cmd.name)}\`  ${d.icon} ${d.label}`, "");
  lines.push(strip(cmd.description || ""), "");
  if (cmd.synopsis) {
    lines.push("```bash", cmd.synopsis, "```", "");
  }
  if (cmd.tags?.length) {
    lines.push(`**标签：** ${cmd.tags.map((t) => `\`${t}\``).join(" · ")}`, "");
  }
  if (cmd.builder_options) {
    const b = cmd.builder_options;
    const rows = [];
    (b.arguments || []).forEach((a) => {
      rows.push(`| \`${a.prefix ?? a.key}\` | ${esc(a.label)}${a.placeholder ? `（如 \`${a.placeholder}\`）` : ""} |`);
    });
    (b.groups || []).forEach((g) => {
      (g.options || []).forEach((o) => {
        rows.push(`| \`${o.flag}\` | ${esc(g.label)}：${esc(o.label)} |`);
      });
    });
    if (rows.length) {
      lines.push("**组合参数**", "", "| 参数 | 说明 |", "| --- | --- |", ...rows, "");
    }
  }
  if (cmd.common_options?.length) {
    lines.push("**常用参数**", "", "| 参数 | 说明 |", "| --- | --- |");
    cmd.common_options.forEach((o) => {
      lines.push(`| \`${esc(o.name)}\` | ${esc(o.description)} |`);
    });
    lines.push("");
  }
  if (cmd.examples?.length) {
    lines.push("**示例**", "");
    cmd.examples.forEach((ex) => {
      lines.push(`${strip(ex.description)}`, "", "```bash", ex.code, "```", "");
    });
  }
  if (cmd.related?.length) {
    lines.push(`**相关命令：** ${cmd.related.map((r) => `\`${r}\``).join(" · ")}`, "");
  }
  lines.push("---", "");
  return lines.join("\n");
}

function recipeSection(r) {
  const lines = [];
  lines.push(`#### \`${strip(r.name)}\`  📋 配方`, "");
  lines.push(strip(r.description), "");
  lines.push(`**📁 分类：** \`${r.category}\``, "");
  if (r.fullCommand) {
    lines.push("**一键执行：**", "", "```bash", r.fullCommand, "```", "");
  }
  if (r.steps?.length) {
    lines.push("**分步拆解**", "");
    r.steps.forEach((s, i) => {
      lines.push(`${i + 1}. ${strip(s.description)}`, "", "   ```bash", ...s.code.split("\n").map((l) => "   " + l), "   ```", "");
    });
  }
  if (r.tags?.length) {
    lines.push(`**标签：** ${r.tags.map((t) => `\`${t}\``).join(" · ")}`, "");
  }
  lines.push("---", "");
  return lines.join("\n");
}

let totalCmd = 0, totalRcp = 0;
for (const m of MODULES) totalCmd += data[m.id].commands.length, totalRcp += data[m.id].recipes.length;

const out = [];
out.push("# Command Book — 命令速查", "");
out.push(`> 数据来源：[https://11052022.github.io/command-book-web](https://11052022.github.io/command-book-web)`);
out.push(`> 共 **${totalCmd}** 条命令 · **${totalRcp}** 个配方（Linux ${data.linux.commands.length}+${data.linux.recipes.length} / Redis ${data.redis.commands.length}+${data.redis.recipes.length} / Git ${data.git.commands.length}+${data.git.recipes.length}）`, "");
out.push(`> 危险等级图例：🟢 低危 · 🟡 中危 · 🔴 高危 · ⛔ 极高危`, "");
out.push("## 目录", "");

for (const m of MODULES) {
  const cats = [...new Set(data[m.id].commands.map((c) => c.category))];
  out.push(`- ${m.icon} **${m.name}**（${data[m.id].commands.length} 条命令 · ${data[m.id].recipes.length} 个配方）`);
  cats.forEach((c) => out.push(`  - [${c}](#${m.id === "linux" ? "" : ""}${encodeURIComponent(`${m.id}-命令-${c}`.replace(/\s+/g, "-").toLowerCase())})`));
  out.push(`  - [${m.name} 配方](#${encodeURIComponent(`${m.id}-配方`)})`);
}
out.push("", "---", "");

for (const m of MODULES) {
  const { commands, recipes } = data[m.id];
  const cats = [...new Set(commands.map((c) => c.category))];
  out.push(`## ${m.icon} ${m.name}`, "");
  out.push(`${m.icon} **${m.name} 命令**（${commands.length} 条）`, "");
  for (const cat of cats) {
    const cmds = commands.filter((c) => c.category === cat);
    out.push(`### 📁 ${cat}（${cmds.length}）`, "");
    cmds.forEach((c) => out.push(commandSection(c)));
  }
  out.push(`### 📋 ${m.name} 配方（${recipes.length} 个）`, "");
  recipes.forEach((r) => out.push(recipeSection(r)));
  out.push("");
}

const md = out.join("\n");
fs.writeFileSync(new URL("../Command-Book-命令速查.md", import.meta.url), md, "utf8");
console.log("MD written:", md.length, "chars,", md.split("\n").length, "lines");
