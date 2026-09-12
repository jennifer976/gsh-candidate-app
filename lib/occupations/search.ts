import catalogue from "./catalogue.json";
export const OCCUPATION_VERSION = catalogue.version;
export type OccupationChoice = { scheme: string; code?: string; label: string; schemeVersion?: string };
export type RoleSuggestion = { code:string; label:string; reason:"exact"|"contains"|"spelling" };
export const normaliseRoleText=(value:string)=>value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^\p{L}\p{N}+#]+/gu," ").trim().replace(/\s+/g," ");
const roles=catalogue.roles.map(r=>({...r,terms:Array.from(new Set([r.label,...r.aliases].map(normaliseRoleText)))}));
const byCode=new Map(roles.map(r=>[r.code,r]));
const exact=new Map<string,Set<string>>();
const spellingBuckets=new Map<string,{code:string;term:string}[]>();
for(const r of roles)for(const term of r.terms){const codes=exact.get(term)||new Set<string>();codes.add(r.code);exact.set(term,codes);const bucketKey=`${term[0]}:${term.length}`;const bucket=spellingBuckets.get(bucketKey)||[];bucket.push({code:r.code,term});spellingBuckets.set(bucketKey,bucket);}
function close(a:string,b:string){
 if(Math.abs(a.length-b.length)>2)return false;
 let prev=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){const next=[i];let min=i;for(let j=1;j<=b.length;j++){next[j]=Math.min(next[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));min=Math.min(min,next[j]);}if(min>2)return false;prev=next;}return prev[b.length]<=2;
}
export function roleSuggestions(input:string,limit=8):RoleSuggestion[]{
 const q=normaliseRoleText(input.slice(0,240));if(q.length<2)return [];
 const results:RoleSuggestion[]=[];const seen=new Set<string>();
 const add=(code:string,reason:RoleSuggestion['reason'])=>{if(!seen.has(code)){const role=byCode.get(code)!;seen.add(code);results.push({code,label:role.label,reason});}};
 for(const code of exact.get(q)||[])add(code,"exact");
 for(const r of roles)if(r.terms.some(t=>t.includes(q)))add(r.code,"contains");
 if(results.length<limit&&q.length>=5){
   // Shortlists avoid a full edit-distance scan on every keystroke. Unknown
   // scripts and initial-letter typos remain free text rather than guessed.
   for(const first of new Set(q.slice(0,2)))for(let length=q.length-2;length<=q.length+2;length++)for(const item of spellingBuckets.get(`${first}:${length}`)||[])if(close(q,item.term))add(item.code,"spelling");
 }
 if(!results.length){
   const withoutSeniority=q.replace(/^(senior|junior|lead|principal|sr|jr) /,"");
   if(withoutSeniority!==q)for(const code of exact.get(withoutSeniority)||[])add(code,"contains");
 }
 return results.slice(0,Math.max(1,Math.min(limit,20)));
}
export function catalogueLabel(value:OccupationChoice){return value.scheme==="ONET"&&value.schemeVersion===OCCUPATION_VERSION?byCode.get(value.code||"")?.label:undefined;}
export function validateCatalogueChoice(value:OccupationChoice,existing:OccupationChoice[]=[]){
 if(value.scheme==="free_text") { if(value.code)throw new Error("A free-text title cannot contain a catalogue code."); return; }
 if(value.scheme!=="ONET") {
   if(existing.some(item=>item.scheme===value.scheme&&item.code===value.code&&item.schemeVersion===value.schemeVersion&&item.label===value.label))return;
   throw new Error("This catalogue is not supported for new role mappings. Keep your own title or select a suggested role.");
 }
 if(value.schemeVersion!==OCCUPATION_VERSION||!byCode.has(value.code||""))throw new Error("Choose a role from the current catalogue or save your own title.");
}
/** Exact labels may be proposed for review. Nothing is silently assigned. */
export function auditRole(input:string){
 const codes=[...(exact.get(normaliseRoleText(input))||[])];
 return {original:input,status:codes.length===1?"exact_unique":codes.length>1?"ambiguous":"unmapped",proposals:codes.map(code=>({scheme:"ONET",code,label:input,schemeVersion:OCCUPATION_VERSION})),suggestions:codes.length?[]:roleSuggestions(input,5)};
}
