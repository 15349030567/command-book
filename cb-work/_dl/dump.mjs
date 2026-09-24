import { ALL_COMMANDS as linuxC } from './mjs/index-CLXsIpXF.js.mjs';
import { ALL_RECIPES as linuxR } from './mjs/index-yjIX-GIz.js.mjs';
import { ALL_COMMANDS as redisC } from './mjs/index-JLwnFS2w.js.mjs';
import { ALL_RECIPES as redisR } from './mjs/index-BRckO9lR.js.mjs';
import { ALL_COMMANDS as gitC } from './mjs/index-CmOPzSCo.js.mjs';
import { ALL_RECIPES as gitR } from './mjs/index-Dmd78FCF.js.mjs';

const out = {
  linux: { commands: linuxC, recipes: linuxR },
  redis: { commands: redisC, recipes: redisR },
  git: { commands: gitC, recipes: gitR },
};

import { writeFileSync } from 'node:fs';
writeFileSync(new URL('./data.json', import.meta.url), JSON.stringify(out, null, 2), 'utf8');

const sum = (a) => (a || []).length;
console.log('linux commands:', sum(linuxC), 'recipes:', sum(linuxR));
console.log('redis commands:', sum(redisC), 'recipes:', sum(redisR));
console.log('git commands:', sum(gitC), 'recipes:', sum(gitR));