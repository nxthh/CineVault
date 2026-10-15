import {Item,Detail,Episode,Page,Media,api,detail,img,titleOf,yearOf,hasToken} from './tmdb';
import {h,$,mount,load,row,grid,card,href,getList,toggleList,inList,errorBox,skeletons} from './ui';
import {openPlayer} from './player';

const btn=(label:string,fn:()=>void,primary=false)=>{const b=h('button',{type:'button',class:`rounded-lg px-4 py-2 text-sm font-semibold ${primary?'bg-accent text-white':'border border-white/60 text-white'}`},label);b.onclick=fn;return b};
const link=(label:string,u:string)=>h('a',{href:u,class:'rounded-lg border border-white/60 px-4 py-2 text-sm font-semibold text-white'},label);
const meta=(d:Detail,t:Media)=>[yearOf(d),`★ ${d.vote_average?d.vote_average.toFixed(1):'N/A'}`,d.genres.map(g=>g.name).join(', '),t==='movie'?(d.runtime?`${d.runtime} min`:''):(d.number_of_seasons?`${d.number_of_seasons} seasons`:''),d.status||''].filter(Boolean).join(' · ');
function hero(d:Detail,t:Media,watchLabel:string,withList=false){
 const bg=img(d.backdrop_path,'w1280');
 return h('div',{class:'relative flex min-h-[26rem] items-end bg-zinc-900 bg-cover bg-center',style:bg?`background-image:url(${bg})`:''},h('div',{class:'absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent'}),
  h('div',{class:'relative mx-auto flex w-full max-w-7xl gap-6 px-4 py-8 text-white'},d.poster_path?h('img',{src:img(d.poster_path),alt:`${titleOf(d)} poster`,class:'hidden w-40 rounded-lg md:block'}):null,
  h('div',{class:'max-w-2xl'},h('p',{class:'text-2xl font-black sm:text-4xl'},titleOf(d)),h('p',{class:'mt-2 text-sm text-zinc-300'},meta(d,t)),h('p',{class:'mt-3 line-clamp-4 text-sm sm:text-base'},d.overview||'No overview available.'),
  h('div',{class:'mt-4 flex flex-wrap gap-2'},btn(watchLabel,()=>openPlayer(d,t),true),withList?btn('',()=>{}):link('More Info',href(t,d.id)),(()=>{const b=btn('',()=>{toggleList(t,d.id);s()});const s=()=>{b.textContent=inList(t,d.id)?'✓ In My List':'+ Add to My List'};s();return b})())))) }
const heroFor=async(t:Media,id:number,label:string)=>hero(await detail(t,id),t,label);
const rec=async()=>{const l=getList().slice(-1)[0];if(l){const r=await api<Page<Item>>(`/${l.type}/${l.id}/recommendations`);if(r.results.length)return r.results}return(await api<Page<Item>>('/movie/popular')).results};

function home(){
 load('#c1',async()=>{const r=await api<Page<Item>>('/trending/all/week');const f=r.results.find(i=>i.backdrop_path)||r.results[0];return heroFor((f.media_type==='tv'?'tv':'movie'),f.id,'Watch Now')});
 load('#c2',async()=>row((await api<Page<Item>>('/trending/all/week')).results,'movie'));
 load('#c3',async()=>h('div',{},h('p',{class:'mb-2 text-sm text-zinc-500'},getList().length?'Based on your most recently saved title':'Popular right now'),row(await rec(),'movie')));
}
function movies(){
 load('#c1',async()=>heroFor('movie',(await api<Page<Item>>('/movie/popular')).results[0].id,'Watch Now'));
 load('#c2',async()=>h('div',{class:'scroller flex gap-4 overflow-x-auto pb-3'},...(await api<Page<Item>>('/movie/top_rated')).results.slice(0,10).map((m,i)=>card(m,'movie',i+1))));
 library();
}
async function library(){
 const root=$('#c3');const state={q:'',genre:'',year:'',rating:'0',sort:'popularity.desc',page:1};let items:Item[]=[];
 const sel=(label:string,opts:[string,string][])=>{const s=h('select',{'aria-label':label,class:'rounded border border-zinc-500/40 bg-transparent px-2 py-1 dark:bg-zinc-900'},...opts.map(([v,t])=>h('option',{value:v},t))) as HTMLSelectElement;return s};
 const q=h('input',{type:'search','aria-label':'Search library',placeholder:'Search movies…',class:'rounded border border-zinc-500/40 bg-transparent px-2 py-1'}) as HTMLInputElement;
 const g=sel('Genre',[['','All genres']]),y=sel('Year',[['','Any year'],...Array.from({length:30},(_,i)=>{const v=String(new Date().getFullYear()-i);return [v,v] as [string,string]})]);
 const r=sel('Minimum rating',[['0','Any rating'],['6','6+'],['7','7+'],['8','8+']]);
 const s=sel('Sort',[['popularity.desc','Popular'],['title','Title'],['date','Release date'],['rating','Rating']]);
 const clear=h('button',{type:'button',class:'rounded border border-zinc-500/40 px-2 py-1'},'Clear filters');
 const out=h('div'),more=h('button',{type:'button',class:'mx-auto mt-6 block rounded-lg bg-accent px-4 py-2 text-white'},'Load more');
 root.replaceChildren(h('div',{class:'mb-4 flex flex-wrap gap-2'},q,g,y,r,s,clear),out,more);
 try{(await api<{genres:{id:number;name:string}[]}>('/genre/movie/list')).genres.forEach(x=>g.append(h('option',{value:String(x.id)},x.name)))}catch{}
 const view=()=>{let l=[...items];if(state.q){l=l.filter(i=>(!state.year||yearOf(i)===state.year)&&(!state.genre||i.genre_ids?.includes(+state.genre))&&i.vote_average>=+state.rating)}
  if(state.sort==='title')l.sort((a,b)=>titleOf(a).localeCompare(titleOf(b)));if(state.sort==='date')l.sort((a,b)=>(b.release_date||'').localeCompare(a.release_date||''));if(state.sort==='rating')l.sort((a,b)=>b.vote_average-a.vote_average);
  out.replaceChildren(grid(l,'movie'))};
 const fetchPage=async(reset:boolean)=>{if(reset){state.page=1;items=[]}out.replaceChildren(skeletons());try{let p:Page<Item>;
  if(state.q)p=await api<Page<Item>>('/search/movie',{query:state.q,page:state.page});
  else{const sm:Record<string,string>={title:'original_title.asc',date:'primary_release_date.desc',rating:'vote_average.desc','popularity.desc':'popularity.desc'};
   const o:Record<string,string|number>={page:state.page,sort_by:sm[state.sort],'vote_average.gte':state.rating,'vote_count.gte':state.sort==='rating'?200:0};if(state.genre)o.with_genres=state.genre;if(state.year)o.primary_release_year=state.year;p=await api<Page<Item>>('/discover/movie',o)}
  items=items.concat(p.results);more.hidden=state.page>=p.total_pages;view()}catch(e){out.replaceChildren(errorBox(e))}};
 let tm=0;q.oninput=()=>{clearTimeout(tm);tm=window.setTimeout(()=>{state.q=q.value.trim();fetchPage(true)},400)};
 g.onchange=()=>{state.genre=g.value;fetchPage(true)};y.onchange=()=>{state.year=y.value;fetchPage(true)};r.onchange=()=>{state.rating=r.value;fetchPage(true)};s.onchange=()=>{state.sort=s.value;state.q?view():fetchPage(true)};
 clear.onclick=()=>{q.value='';g.value=y.value='';r.value='0';s.value='popularity.desc';Object.assign(state,{q:'',genre:'',year:'',rating:'0',sort:'popularity.desc'});fetchPage(true)};
 more.onclick=()=>{state.page++;fetchPage(false)};fetchPage(true)}
function tv(){
 load('#c1',async()=>heroFor('tv',(await api<Page<Item>>('/tv/popular')).results[0].id,'Watch Series'));
 const cols:[string,Record<string,string|number>][]=[['Crime Dramas',{with_genres:80}],['Sitcoms',{with_genres:35,with_origin_country:'US'}],['Sci-Fi & Fantasy',{with_genres:10765}],['Miniseries',{with_type:2}]];
 load('#c2',async()=>{const rs=await Promise.all(cols.map(([,p])=>api<Page<Item>>('/discover/tv',{...p,sort_by:'vote_average.desc','vote_count.gte':500})));return h('div',{class:'space-y-6'},...cols.map(([n],i)=>h('div',{},h('h3',{class:'mb-2 font-semibold'},n),row(rs[i].results,'tv'))))});
 load('#c3',async()=>{const shows=(await api<Page<Item>>('/tv/popular')).results.slice(0,15);const ss=h('select',{'aria-label':'Series',class:'rounded border border-zinc-500/40 bg-transparent px-2 py-1 dark:bg-zinc-900'},...shows.map(s=>h('option',{value:String(s.id)},titleOf(s)))) as HTMLSelectElement;
  const sn=h('select',{'aria-label':'Season',class:'rounded border border-zinc-500/40 bg-transparent px-2 py-1 dark:bg-zinc-900'}) as HTMLSelectElement;const list=h('div',{class:'mt-4 space-y-3'});let d:Detail;
  const eps=async()=>{list.replaceChildren(skeletons(2));try{const r=await api<{episodes:Episode[]}>(`/tv/${d.id}/season/${sn.value}`);list.replaceChildren(...(r.episodes.length?r.episodes.map(e=>{const b=h('button',{type:'button',class:'rounded bg-accent px-3 py-1 text-sm text-white'},'Play');b.onclick=()=>openPlayer(d,'tv',{season:+sn.value,episode:e.episode_number,name:e.name});
   return h('article',{class:'flex gap-3 rounded-lg border border-zinc-500/30 p-3'},e.still_path?h('img',{src:img(e.still_path,'w300'),alt:`Still from ${e.name}`,loading:'lazy',class:'hidden w-40 rounded sm:block'}):h('div',{class:'hidden w-40 items-center justify-center rounded bg-zinc-300 text-xs dark:bg-zinc-800 sm:flex'},'No image'),h('div',{class:'flex-1'},h('h4',{class:'font-semibold'},`${sn.value==='0'?'Special':'E'+e.episode_number}: ${e.name||'Untitled'}`),h('p',{class:'text-xs text-zinc-500'},e.air_date||'Air date unknown'),h('p',{class:'mt-1 text-sm'},e.overview||'No overview available.')),b)}):[h('p',{},'No episodes listed.')]))}catch(e){list.replaceChildren(errorBox(e))}};
  const seasons=async()=>{d=await detail('tv',+ss.value);sn.replaceChildren(...(d.seasons||[]).map(s=>h('option',{value:String(s.season_number)},s.season_number===0?'Specials':s.name)));if(sn.options.length)sn.value=(d.seasons!.find(s=>s.season_number===1)?'1':sn.options[0].value);eps()};
  ss.onchange=seasons;sn.onchange=eps;seasons();return h('div',{},h('div',{class:'flex flex-wrap gap-2'},ss,sn),list)});
}
function details(){
 const p=new URLSearchParams(location.search);const t=(p.get('type')==='tv'?'tv':'movie') as Media;const id=+(p.get('id')||0);
 if(!id){mount('#c1',errorBox(new Error('Missing title id.')));return}
 const cached=detail(t,id);
 load('#c1',async()=>{const d=await cached;document.title=`${titleOf(d)} (${yearOf(d)}) — CineVault`;document.querySelector('meta[name=description]')?.setAttribute('content',d.overview.slice(0,155));document.querySelector('meta[property="og:title"]')?.setAttribute('content',document.title);return hero(d,t,'Watch Now')});
 load('#c2',async()=>{const d=await cached;const c=d.credits;const people=(c?.cast||[]).slice(0,12).map(x=>h('div',{class:'w-28 shrink-0 text-xs'},x.profile_path?h('img',{src:img(x.profile_path,'w185'),alt:x.name,loading:'lazy',class:'aspect-[2/3] rounded object-cover'}):h('div',{class:'flex aspect-[2/3] items-center justify-center rounded bg-zinc-300 dark:bg-zinc-800'},'No photo'),h('p',{class:'mt-1 font-semibold'},x.name),h('p',{class:'text-zinc-500'},x.character)));
  const wrap=h('div',{});
  if(t==='movie'){const dir=(c?.crew||[]).filter(x=>x.job==='Director').map(x=>x.name).join(', ');const w=(c?.crew||[]).filter(x=>['Writer','Screenplay'].includes(x.job)).map(x=>x.name).join(', ');wrap.append(h('p',{class:'mb-3 text-sm'},`Director: ${dir||'Unknown'}${w?` · Writing: ${w}`:''}`))}
  else wrap.append(h('p',{class:'mb-3 text-sm'},`${d.number_of_seasons??'?'} seasons · ${d.status||''}`),h('p',{class:'mb-3 text-sm'},'Pick any episode: ',h('a',{href:'tv-shows.html',class:'text-accent underline'},'Episode Explorer')));
  wrap.append(people.length?h('div',{class:'scroller flex gap-3 overflow-x-auto'},...people):h('p',{},'No cast information available.'));return wrap});
 load('#c3',async()=>row(((await cached).recommendations?.results||[]),t));
}
function mylist(){
 const render=async()=>{const l=getList();let tab='all';const counts=(t:string)=>l.filter(x=>x.type===t).length;
  mount('#c1',h('div',{class:'rounded-lg border border-zinc-500/30 p-6'},h('p',{class:'text-3xl font-black'},`${l.length} saved`),h('p',{class:'text-zinc-500'},`${counts('movie')} movies · ${counts('tv')} TV shows. Your list is stored in this browser.`),(()=>{const b=h('button',{type:'button',class:'mt-3 rounded border border-zinc-500/40 px-3 py-1 text-sm'},'Clear list');b.onclick=()=>{if(l.length&&confirm('Remove all saved titles?')){localStorage.setItem('cv-list','[]');document.dispatchEvent(new Event('cv-list'));render()}};return b})()));
  const col=$('#c2');const body=h('div');const draw=async()=>{const sub=l.filter(x=>tab==='all'||x.type===tab);if(!sub.length){body.replaceChildren(h('div',{class:'py-8 text-center'},h('p',{},'Nothing here yet.'),h('a',{href:'index.html',class:'text-accent underline'},'Discover something to watch')));return}
   body.replaceChildren(skeletons());try{const ds=await Promise.all(sub.map(x=>detail(x.type,x.id)));body.replaceChildren(h('div',{class:'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5'},...ds.map((d,i)=>{const t=sub[i].type;const rm=h('button',{type:'button',class:'text-xs text-red-500'},'Remove');rm.onclick=()=>{toggleList(t,d.id);render()};const w=h('button',{type:'button',class:'text-xs text-accent'},'Watch Now');w.onclick=()=>openPlayer(d,t);
    return h('article',{},h('a',{href:href(t,d.id)},d.poster_path?h('img',{src:img(d.poster_path),alt:`${titleOf(d)} poster`,class:'aspect-[2/3] rounded-lg object-cover',loading:'lazy'}):h('div',{class:'flex aspect-[2/3] items-center justify-center rounded-lg bg-zinc-300 dark:bg-zinc-800'},titleOf(d)),h('h3',{class:'mt-1 truncate text-sm font-semibold'},titleOf(d))),h('div',{class:'flex gap-3'},h('a',{href:href(t,d.id),class:'text-xs underline'},'View Details'),w,rm))})))}catch(e){body.replaceChildren(errorBox(e))}};
  const tabs=h('div',{role:'tablist',class:'mb-4 flex gap-2'},...([['all','All'],['movie','Movies'],['tv','TV Shows']] as [string,string][]).map(([k,n])=>{const b=h('button',{type:'button',role:'tab','aria-selected':String(k===tab),class:'rounded-full border border-zinc-500/40 px-3 py-1 text-sm'},n);b.onclick=()=>{tab=k;tabs.querySelectorAll('button').forEach(x=>x.setAttribute('aria-selected',String(x===b)));draw()};return b}));
  col.replaceChildren(tabs,body);draw()};
 if(!hasToken()&&getList().length)mount('#c2',errorBox(new Error('')));else render();
 load('#c3',async()=>row((await api<Page<Item>>('/trending/all/week')).results,'movie'));
}
export const pages:Record<string,()=>void>={home,movies,tv,details,mylist};
