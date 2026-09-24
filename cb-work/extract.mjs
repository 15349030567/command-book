import { ALL_COMMANDS as linuxCommands } from "file:///C:/Users/WangSir/AppData/Local/Temp/cb-assets/index-CLXsIpXF.js";
import { ALL_RECIPES as linuxRecipes } from "file:///C:/Users/WangSir/AppData/Local/Temp/cb-assets/index-yjIX-GIz.js";
import { ALL_COMMANDS as redisCommands } from "file:///C:/Users/WangSir/AppData/Local/Temp/cb-assets/index-JLwnFS2w.js";
import { ALL_RECIPES as redisRecipes } from "file:///C:/Users/WangSir/AppData/Local/Temp/cb-assets/index-BRckO9lR.js";
import { ALL_COMMANDS as gitCommands } from "file:///C:/Users/WangSir/AppData/Local/Temp/cb-assets/index-CmOPzSCo.js";
import { ALL_RECIPES as gitRecipes } from "file:///C:/Users/WangSir/AppData/Local/Temp/cb-assets/index-Dmd78FCF.js";
import fs from "node:fs";

const data = {
  linux: { commands: linuxCommands, recipes: linuxRecipes },
  redis: { commands: redisCommands, recipes: redisRecipes },
  git: { commands: gitCommands, recipes: gitRecipes },
};

const stats = {};
for (const [k, v] of Object.entries(data)) {
  const cats = [...new Set(v.commands.map((c) => c.category))];
  const rc = [...new Set(v.recipes.map((c) => c.category))];
  stats[k] = {
    commands: v.commands.length,
    recipes: v.recipes.length,
    commandCategories: cats,
    recipeCategories: rc,
  };
}
console.log(JSON.stringify(stats, null, 2));

const fields = new Set();
data.linux.commands.forEach((c) => Object.keys(c).forEach((f) => fields.add(f)));
console.log("command fields:", [...fields].join(", "));

const rfields = new Set();
data.linux.recipes.forEach((c) => Object.keys(c).forEach((f) => rfields.add(f)));
console.log("recipe fields:", [...rfields].join(", "));

const levels = new Set();
Object.values(data).forEach((v) => v.commands.forEach((c) => levels.add(c.danger_level)));
console.log("danger levels:", [...levels].join(", "));

const types = new Set();
Object.values(data).forEach((v) => v.recipes.forEach((r) => types.add(r.type)));
console.log("recipe types:", [...types].join(", "));

fs.writeFileSync(new URL("./all-data.json", import.meta.url), JSON.stringify(data), "utf8");
console.log("saved all-data.json, size:", fs.statSync(new URL("./all-data.json", import.meta.url)).size);
