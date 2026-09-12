// Copy the website's current English guides into the app without dropping structured sections.
// node scripts/sync-editorial-guides.cjs ../frontend [--check]
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),assert=require('node:assert/strict');
const frontend=path.resolve(process.argv[2]||'../frontend');
const ts=require(require.resolve('typescript',{paths:[frontend]}));
const resolve=Module._resolveFilename, extension=require.extensions['.ts'];
Module._resolveFilename=function(name,...args){return resolve.call(this,name.startsWith('@/')?path.join(frontend,'src',name.slice(2)):name,...args)};
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,file);
const heading=s=>s?`**${s}**\n\n`:'';
const items=(rows,numbered=false)=>rows.map((r,i)=>`${numbered?`${i+1}.`:'-'} ${r.label?`**${r.label}** — `:''}${r.text}`).join('\n');
const table=t=>heading(t.caption)+t.rows.map(row=>row.map((cell,i)=>`**${t.columns[i]}:** ${cell}`).join('\n\n')).join('\n\n---\n\n');
function block(b,route){
 switch(b.type){
  case 'prose':return b.body;
  case 'steps':return heading(b.title)+items(b.items,true);
  case 'bullets':case 'checklist':return heading(b.title)+items(b.items);
  case 'stats':return heading(b.title)+b.items.map(s=>`**${s.value} — ${s.label}**${s.detail?`\n\n${s.detail}`:''}`).join('\n\n');
  case 'table':return table(b.table);
  case 'comparison':return heading(b.comparison.positiveTitle||'Benefits')+items(b.comparison.positive.map(text=>({text})))+'\n\n'+heading(b.comparison.negativeTitle||'Limitations')+items(b.comparison.negative.map(text=>({text})));
  case 'callout':return heading(b.callout.title)+b.callout.body;
  case 'figure':return heading(b.figure.caption)+`[${b.figure.alt}](${b.figure.src.startsWith('/')?'https://globalsponsorhub.com':''}${b.figure.src})`+(b.figure.credit?`\n\n${b.figure.credit}`:'');
  case 'embed':throw Error(`Interactive block ${b.key} in ${route} needs an explicit app equivalent.`);
  default:throw Error(`Unrecognised editorial block ${b.type} in ${route}`);
 }
}
function section(s,route){
 if(s.embed)throw Error(`Interactive section ${s.embed} in ${route} needs an explicit app equivalent.`);
 const parts=s.blocks?s.blocks.map(b=>block(b,route)):[s.body,s.steps?.length?items(s.steps,true):null,s.bullets?.length?items(s.bullets):null,s.table?table(s.table):null,s.prosCons?block({type:'comparison',comparison:{positive:s.prosCons.pros,negative:s.prosCons.cons,positiveTitle:s.prosCons.prosTitle,negativeTitle:s.prosCons.consTitle}},route):null,...(s.callouts||[]).map(callout=>block({type:'callout',callout},route))];
 if(s.factRefs?.length){
  const facts=require(path.join(frontend,'src/data/mobilityFacts'));
  for(const id of s.factRefs){
   const fact=facts.getMobilityFact(id,{includeExpired:true});assert(fact,`Missing fact ${id}`);
   const sources=facts.getMobilityFactSources(fact);assert(sources.length,`Missing sources for ${id}`);
   parts.push(heading(fact.label)+facts.formatMobilityFactValue(fact)+'\n\n'+`Effective from ${fact.effectiveFrom}${fact.effectiveTo?`; until ${fact.effectiveTo}, not including that date`:''}. Source checked ${fact.checkedAt}. Review due ${fact.reviewDueAt}.`+(fact.note?`\n\n${fact.note}`:'')+'\n\n'+sources.map(source=>`[${source.publisher} — ${source.title}](${source.url})`).join('\n\n'));
  }
 }
 const body=parts.filter(Boolean).join('\n\n');assert(body.trim(),`Empty app section in ${route}: ${s.h2}`);return{h2:s.h2,body};
}
try{
 const pillars=require(path.join(frontend,'src/data/seoPillarPages.ts')),spokes=require(path.join(frontend,'src/data/relocationSpokePages.ts'));
 const retired=require(path.join(frontend,'src/config/retiredPublicRoutes.ts'));
 const groups={pillars:pillars.ALL_SEO_PILLAR_PAGES,relocation:spokes.ALL_RELOCATION_GUIDE_PAGES};
 const redirects=Object.fromEntries(Object.values(groups).flat().filter(p=>retired.resolveRetiredPublicPath(p.path)).map(p=>[p.path,retired.resolveRetiredPublicPath(p.path)]));
 const output={...Object.fromEntries(Object.entries(groups).map(([key,entries])=>[key,entries.filter(p=>!redirects[p.path]).map(p=>{const normalized=pillars.seoPillarHubProps(p);const {visualPath,...rest}=normalized;return{path:visualPath,metaTitle:p.metaTitle,metaDescription:p.metaDescription,...rest,sections:rest.sections.map(s=>section(s,p.path))}})])),redirects};
 const content=JSON.stringify(output,null,2)+'\n',target=path.resolve(__dirname,'../data/editorialGuides.en.json');
 if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8'),content,'App English guides differ from the website. Run the sync command.');else {fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content);}
 console.log(`${output.pillars.length+output.relocation.length} English guides synced; structured content preserved.`);
}finally{Module._resolveFilename=resolve;if(extension)require.extensions['.ts']=extension;else delete require.extensions['.ts'];}
