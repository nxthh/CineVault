import {build,context} from 'esbuild';import fs from 'fs';
const env=fs.existsSync('.env')?Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>l.split(/=(.*)/s).slice(0,2))):{};
const o={entryPoints:['src/main.ts'],bundle:true,outfile:'dist/main.js',minify:true,define:{__TMDB_TOKEN__:JSON.stringify(env.TMDB_READ_TOKEN||process.env.TMDB_READ_TOKEN||'')}};
if(process.argv.includes('--watch')){(await context(o)).watch()}else await build(o);
