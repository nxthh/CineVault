import {Item,Media,api,img,titleOf,yearOf,hasToken} from './tmdb';
type K=Node|string|null|false;
export const h=(t:string,a:Record<string,string>={},...c:K[])=>{const e=document.createElement(t);for(const[k,v]of Object.entries(a))k==='class'?e.className=v:e.setAttribute(k,v);e.append(...c.filter((x):x is Node|string=>!!x));return e};
export const $=(s:string)=>document.querySelector<HTMLElement>(s)!;
export const mount=(s:string,...n:Node[])=>{$(s).replaceChildren(...n)};
// storage
interface Saved{type:Media;id:number}
const KEY='cv-list';
export const getList=():Saved[]=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
export const inList=(t:Media,id:number)=>getList().some(x=>x.type===t&&x.id===id);
export function toggleList(t:Media,id:number){let l=getList();l=inList(t,id)?l.filter(x=>!(x.type===t&&x.id===id)):[...l,{type:t,id}];localStorage.setItem(KEY,JSON.stringify(l));document.dispatchEvent(new Event('cv-list'));toast(inList(t,id)?'Added to My List':'Removed from My List')}
export function toast(m:string){const t=h('div',{role:'status',class:'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-accent px-4 py-2 text-white shadow'},m);document.body.append(t);setTimeout(()=>t.remove(),2200)}
// ui bits
export const skeletons=(n=6)=>h('div',{class:'flex gap-4'},...Array.from({length:n},()=>h('div',{class:'skeleton h-64 w-40 shrink-0'})));
export const errorBox=(e:unknown)=>h('p',{role:'alert',class:'rounded-lg border border-red-500/40 p-4 text-red-500'},hasToken()?`Couldn't load data: ${(e as Error).message}`:'No TMDB token configured. Copy .env.example to .env, add your token and run npm run build.');
export async function load(sel:string,fn:()=>Promise<Node>){mount(sel,skeletons());try{mount(sel,await fn())}catch(e){mount(sel,errorBox(e))}}
export const href=(t:Media,id:number)=>`details.html?type=${t}&id=${id}`;
export function card(i:Item,fallback:Media,rank?:number){
 const t=(i.media_type==='tv'||i.media_type==='movie'?i.media_type:fallback) as Media;const src=img(i.poster_path);
 const poster=src?h('img',{src,alt:`${titleOf(i)} poster`,loading:'lazy',class:'aspect-[2/3] w-full rounded-lg object-cover'}):h('div',{class:'flex aspect-[2/3] items-center justify-center rounded-lg bg-zinc-300 p-2 text-center text-sm dark:bg-zinc-800'},titleOf(i));
 const btn=h('button',{type:'button',class:'mt-1 text-xs text-accent hover:underline'});const sync=()=>{btn.textContent=inList(t,i.id)?'✓ In My List':'+ My List';btn.setAttribute('aria-label',`${btn.textContent} ${titleOf(i)}`)};sync();
 btn.onclick=()=>{toggleList(t,i.id);sync()};document.addEventListener('cv-list',sync);
 return h('article',{class:'w-40 shrink-0 '+(rank?'relative pl-6':'')},rank?h('span',{class:'absolute -left-1 bottom-12 text-7xl font-black text-accent/80','aria-hidden':'true'},String(rank)):null,
  h('a',{href:href(t,i.id),class:'block'},poster,h('h3',{class:'mt-2 truncate text-sm font-semibold'},titleOf(i)),h('p',{class:'text-xs text-zinc-500'},`${yearOf(i)} · ${t==='tv'?'TV':'Movie'} · ★ ${i.vote_average?i.vote_average.toFixed(1):'N/A'}`)),btn)}
export const row=(items:Item[],fb:Media)=>items.length?h('div',{class:'scroller flex gap-4 overflow-x-auto pb-3'},...items.map(i=>card(i,fb))):h('p',{class:'text-zinc-500'},'Nothing to show.');
export const grid=(items:Item[],fb:Media)=>items.length?h('div',{class:'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 [&>*]:w-full'},...items.map(i=>card(i,fb))):h('p',{class:'text-zinc-500'},'No results found.');
// theme, nav, footer
export function initChrome(){
 const root=document.documentElement;
 const themeBtn=h('button',{type:'button',class:'rounded-lg border border-zinc-500/40 px-2 py-1'});const sync=()=>{const d=root.classList.contains('dark');themeBtn.textContent=d?'☀️':'🌙';themeBtn.setAttribute('aria-label',d?'Switch to light theme':'Switch to dark theme')};sync();
 themeBtn.onclick=()=>{root.classList.toggle('dark');try{localStorage.setItem('cv-theme',root.classList.contains('dark')?'dark':'light')}catch{};sync()};
 const count=h('span',{class:'ml-1 rounded-full bg-accent px-1.5 text-xs text-white'});const upd=()=>{count.textContent=String(getList().length)};upd();document.addEventListener('cv-list',upd);
 const links=[['index.html','Home'],['movies.html','Movies'],['tv-shows.html','TV Shows']].map(([u,l])=>h('a',{href:u,class:'hover:text-accent'},l));
 const input=h('input',{type:'search',placeholder:'Search…','aria-label':'Search movies and TV shows',class:'w-32 rounded-lg border border-zinc-500/40 bg-transparent px-2 py-1 sm:w-56'}) as HTMLInputElement;
 const dd=h('ul',{class:'absolute right-0 top-full z-50 mt-1 hidden max-h-80 w-72 overflow-auto rounded-lg border border-zinc-500/40 bg-white text-sm dark:bg-zinc-900',role:'listbox'});
 let tm=0;input.oninput=()=>{clearTimeout(tm);const q=input.value.trim();if(!q){dd.classList.add('hidden');return}
  tm=window.setTimeout(async()=>{try{const r=await api<{results:Item[]}>('/search/multi',{query:q});const res=r.results.filter(x=>x.media_type==='movie'||x.media_type==='tv').slice(0,8);dd.replaceChildren(...(res.length?res.map(x=>h('li',{role:'option'},h('a',{href:href(x.media_type as Media,x.id),class:'block px-3 py-2 hover:bg-accent/20 focus:bg-accent/20'},`${titleOf(x)} (${yearOf(x)})`))):[h('li',{class:'px-3 py-2'},'No results')]))}catch(e){dd.replaceChildren(h('li',{class:'px-3 py-2'},(e as Error).message))}dd.classList.remove('hidden')},350)};
 input.onkeydown=e=>{if(e.key==='ArrowDown')(dd.querySelector('a') as HTMLElement|null)?.focus();if(e.key==='Escape')dd.classList.add('hidden')};
 dd.onkeydown=e=>{const a=document.activeElement as HTMLElement;if(e.key==='ArrowDown'){e.preventDefault();(a.closest('li')?.nextElementSibling?.querySelector('a') as HTMLElement|null)?.focus()}if(e.key==='ArrowUp'){e.preventDefault();((a.closest('li')?.previousElementSibling?.querySelector('a')||input) as HTMLElement).focus()}};
 mount('#nav',h('nav',{class:'sticky top-0 z-40 border-b border-zinc-500/30 bg-zinc-50/95 dark:bg-zinc-950/95','aria-label':'Main'},h('div',{class:'mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm'},
  h('a',{href:'index.html',class:'text-xl font-black tracking-widest'},'CINE',h('span',{class:'text-accent'},'VAULT')),...links,h('a',{href:'my-list.html',class:'hover:text-accent'},'My List',count),h('div',{class:'relative ml-auto flex items-center gap-2'},input,dd,themeBtn))));
 mount('#footer',h('div',{class:'mt-12 border-t border-zinc-500/30 px-4 py-8 text-center text-sm text-zinc-500'},h('p',{},'CineVault — a digital vault for discovering movies and series.'),h('p',{class:'mt-2'},'This product uses the TMDB API but is not endorsed or certified by TMDB.'),h('p',{class:'mt-2 space-x-3'},h('a',{href:'index.html'},'Home'),h('a',{href:'movies.html'},'Movies'),h('a',{href:'tv-shows.html'},'TV Shows'),h('a',{href:'my-list.html'},'My List'))))}
