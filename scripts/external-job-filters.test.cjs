const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const file=path.resolve(__dirname,'../lib/external-job-filters.ts'),loaded=new Module(file,module);loaded.filename=file;
loaded._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,file);
const {externalJobQuery}=loaded.exports;
assert.equal(externalJobQuery(), '');
for(const sourceRelationship of ['curated_external','employer_connected'])for(const benefit of ['Visa Sponsorship','Relocation Support','Cross-border Remote Allowed']){
 const query=new URLSearchParams(externalJobQuery({q:'  ingénieur & developer  ',location:' Germany ',benefit,sourceRelationship,page:2,perPage:25}));
 assert.equal(query.get('q'),'ingénieur & developer');assert.equal(query.get('location'),'Germany');assert.equal(query.get('benefit'),benefit);
 assert.equal(query.get('sourceRelationship'),sourceRelationship);assert.equal(query.get('page'),'2');assert.equal(query.get('perPage'),'25');
 assert.equal(query.size,6);
}
assert.equal(externalJobQuery({q:' ',location:'',benefit:' '}),'');
console.log('Passed external query separation, canonical mobility values, encoding, pagination and empty filters.');
