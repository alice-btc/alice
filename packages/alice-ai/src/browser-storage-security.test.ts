import assert from 'node:assert/strict';
import { test } from 'node:test';
import { webcrypto } from 'node:crypto';
import { createWebCryptoLocalCipher } from './local-cipher.ts';
import { createProtectedBrowserValue } from './browser-storage-security.ts';
const cipher = () => {
  let key:CryptoKey|null = null;
  return createWebCryptoLocalCipher(webcrypto.subtle as unknown as SubtleCrypto,
    {get:async()=>key, getOrAdd:async(k:CryptoKey)=>{key ??= k; return key;}},
    n => webcrypto.getRandomValues(new Uint8Array(n)));
};
function backing(initial:string|null=null) {
  let value=initial;
  return {getItem:()=>value, setItem:(_k:string,v:string)=>{value=v;}, removeItem:()=>{value=null;}};
}
test('without a cipher reads and writes stay in memory and leave persisted ciphertext untouched',async()=>{
  const disk=backing('v1:existing');
  const store=createProtectedBrowserValue('k','k',()=>disk,()=>null,()=>{});
  assert.equal(await store.read(),null);
  await store.write('private');
  assert.equal(await store.read(),'private');
  assert.equal(disk.getItem(),'v1:existing');
});
test('an explicit remove deletes the stored value even without a cipher',async()=>{
  for(const stored of ['legacy plaintext','v1:unreadable']){
    const disk=backing(stored);const issues:string[]=[];
    const store=createProtectedBrowserValue('k','k',()=>disk,()=>null,i=>{issues.push(i);});
    await store.write('session only');
    await store.remove();
    assert.equal(disk.getItem(),null);
    assert.equal(await store.read(),null);
    assert.ok(!issues.includes('write-failed'));
  }
});
test('an explicit remove deletes an unreadable value when a cipher exists',async()=>{
  const disk=backing('v1:broken');
  const store=createProtectedBrowserValue('k','k',()=>disk,cipher,()=>{});
  await assert.rejects(store.read());
  assert.equal(disk.getItem(),'v1:broken');
  await store.remove();
  assert.equal(disk.getItem(),null);
});
test('a remove that cannot reach storage rejects and reports instead of claiming success',async()=>{
  for(const getCipher of [()=>null,cipher]){
    const issues:string[]=[];
    const unavailable=createProtectedBrowserValue('k','k',()=>null,getCipher,i=>{issues.push(i);});
    await assert.rejects(unavailable.remove(),/unavailable/);
    assert.ok(issues.includes('write-failed'));
    const disk=backing('old');
    const failing=createProtectedBrowserValue('k','k',()=>({...disk,removeItem:()=>{throw new Error('denied');}}),getCipher,()=>{});
    await assert.rejects(failing.remove(),/denied/);
    assert.equal(disk.getItem(),'old');
  }
});
test('a write before a read cannot overwrite an unreadable existing record',async()=>{
  const disk=backing('v1:broken');
  const store=createProtectedBrowserValue('k','k',()=>disk,cipher,()=>{});
  await assert.rejects(store.write('replacement'));
  assert.equal(disk.getItem(),'v1:broken');
});
test('legacy plaintext is encrypted on write and persists across store instances',async()=>{
  const disk=backing('old');const c=cipher();
  const store=createProtectedBrowserValue('k','k',()=>disk,()=>c,()=>{});
  assert.equal(await store.read(),'old');
  await store.write('new');
  assert.ok(disk.getItem()?.startsWith('v1:'));
  assert.equal(await createProtectedBrowserValue('k','k',()=>disk,()=>c,()=>{}).read(),'new');
});
test('concurrent writes are serialized and disk failures reject',async()=>{
  const disk=backing();const c=cipher();
  const store=createProtectedBrowserValue('k','k',()=>disk,()=>c,()=>{});
  await Promise.all([store.write('first'),store.write('second')]);
  assert.equal(await store.read(),'second');
  const failing=createProtectedBrowserValue('k','k',()=>({...disk,setItem:()=>{throw new Error('quota');}}),()=>c,()=>{});
  await assert.rejects(failing.write('lost'),/quota/);
  assert.equal(await store.read(),'second');
});
test('a record changed by another tab while encrypting is checked before replacement',async()=>{
  const disk=backing();const c=cipher();
  let entered!:()=>void;const started=new Promise<void>(r=>{entered=r;});
  let release!:()=>void;const held=new Promise<void>(r=>{release=r;});
  const slow={decrypt:c.decrypt, encrypt:async(value:string,context:string)=>{entered();await held;return c.encrypt(value,context);}};
  const store=createProtectedBrowserValue('k','k',()=>disk,()=>slow,()=>{});
  const writing=store.write('replacement');
  await started;
  disk.setItem('k','v1:unreadable-from-another-tab');
  release();
  await assert.rejects(writing);
  assert.equal(disk.getItem(),'v1:unreadable-from-another-tab');
});
