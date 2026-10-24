import assert from 'node:assert/strict';
import { test } from 'node:test';
import { localSemanticWasmPaths, SEMANTIC_WASM_FACTORIES } from './semantic-wasm-policy.ts';
test('both Safari and asyncify factories load from Alice while binary URLs are preserved',()=>{
 for(const file of SEMANTIC_WASM_FACTORIES){
   const wasm='https://cdn.example/runtime/'+file.replace('.mjs','.wasm');
   assert.deepEqual(localSemanticWasmPaths({mjs:'https://cdn.example/runtime/'+file,wasm}),{mjs:'/semantic-runtime/'+file,wasm});
 }
});
test('unexpected runtime layout cannot silently authorize remote JavaScript',()=>{
 assert.throws(()=>localSemanticWasmPaths('https://cdn.example/'),/Unsupported/);
 assert.throws(()=>localSemanticWasmPaths({mjs:'https://cdn.example/new.mjs',wasm:'https://cdn.example/a.wasm'}),/Unsupported/);
});
