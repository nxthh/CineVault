declare const __TMDB_TOKEN__: string;
export interface Item{id:number;media_type?:string;title?:string;name?:string;poster_path:string|null;backdrop_path:string|null;overview:string;release_date?:string;first_air_date?:string;vote_average:number;genre_ids?:number[]}
export interface Detail extends Item{genres:{id:number;name:string}[];runtime?:number;episode_run_time?:number[];number_of_seasons?:number;status?:string;seasons?:{season_number:number;name:string;episode_count:number}[];videos?:{results:{key:string;site:string;type:string}[]};credits?:{cast:{id:number;name:string;character:string;profile_path:string|null}[];crew:{name:string;job:string}[]};recommendations?:{results:Item[]};['watch/providers']?:{results:Record<string,{link?:string}>}}
export interface Episode{id:number;episode_number:number;name:string;overview:string;air_date:string|null;still_path:string|null}
export interface Page<T>{page:number;results:T[];total_pages:number}
export type Media='movie'|'tv';
const cache=new Map<string,Promise<unknown>>();
export const hasToken=()=>!!__TMDB_TOKEN__;
export function api<T>(path:string,params:Record<string,string|number>={}):Promise<T>{
 const q=new URLSearchParams(Object.entries(params).map(([k,v])=>[k,String(v)])).toString();const url=`https://api.themoviedb.org/3${path}?${q}`;
 if(!cache.has(url))cache.set(url,fetch(url,{headers:{Authorization:`Bearer ${__TMDB_TOKEN__}`}}).then(r=>{if(r.status===429)throw new Error('Rate limited, try again shortly.');if(!r.ok)throw new Error(`TMDB error ${r.status}`);return r.json()}).catch(e=>{cache.delete(url);throw e}));
 return cache.get(url) as Promise<T>;}
export const img=(p:string|null,size='w342')=>p?`https://image.tmdb.org/t/p/${size}${p}`:'';
export const titleOf=(i:Item)=>i.title??i.name??'Untitled';
export const yearOf=(i:Item)=>(i.release_date||i.first_air_date||'').slice(0,4)||'—';
export const detail=(t:Media,id:number)=>api<Detail>(`/${t}/${id}`,{append_to_response:'videos,credits,recommendations,watch/providers'});
