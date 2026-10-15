// Player module. No unlicensed streaming provider is integrated: it shows the official TMDB-listed
// YouTube trailer and links to licensed "where to watch" pages. To add a licensed provider, return its embed URL from providerUrl().
import {Detail,Media,titleOf} from './tmdb';
import {h,href} from './ui';
const providerUrl=(_t:Media,_id:number,_s?:number,_e?:number):string|null=>null;
export function openPlayer(d:Detail,type:Media,ep?:{season:number;episode:number;name:string}){
 const prev=document.activeElement as HTMLElement|null;
 const trailer=d.videos?.results.find(v=>v.site==='YouTube'&&v.type==='Trailer')||d.videos?.results.find(v=>v.site==='YouTube');
 const url=providerUrl(type,d.id,ep?.season,ep?.episode)||(trailer?`https://www.youtube-nocookie.com/embed/${trailer.key}`:null);
 const watch=Object.values(d['watch/providers']?.results||{})[0]?.link;
 const close=()=>{ov.remove();document.removeEventListener('keydown',esc);prev?.focus()};const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')close()};
 const body=url?(()=>{const f=h('iframe',{src:url,title:`${titleOf(d)} player`,loading:'lazy',referrerpolicy:'no-referrer',allowfullscreen:'',class:'absolute inset-0 h-full w-full'});const w=h('div',{class:'relative aspect-video w-full bg-black'},h('p',{class:'absolute inset-0 flex items-center justify-center text-white'},'Loading player…'),f);return w})():h('p',{class:'p-6'},'No playable video is available for this title.');
 const closeBtn=h('button',{type:'button',class:'rounded bg-accent px-3 py-1 text-white'},'Close Player');closeBtn.onclick=close;
 const ov=h('div',{role:'dialog','aria-modal':'true','aria-label':'Player',class:'fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'},h('div',{class:'w-full max-w-3xl rounded-lg bg-white p-4 dark:bg-zinc-900'},
  h('div',{class:'mb-2 flex items-center justify-between gap-2'},h('h2',{class:'font-bold'},titleOf(d)+(ep?` — S${ep.season}E${ep.episode}: ${ep.name}`:'')),closeBtn),body,
  h('p',{class:'mt-2 text-sm text-zinc-500'},ep?'Episode playback requires a licensed provider; showing the series trailer. ':'Showing the official trailer. ',watch?h('a',{href:watch,target:'_blank',rel:'noopener',class:'text-accent underline'},'Where to watch (licensed services)'):'No streaming availability data from TMDB.',' ',h('a',{href:href(type,d.id),class:'text-accent underline'},'Back to details'))));
 document.body.append(ov);document.addEventListener('keydown',esc);closeBtn.focus()}
