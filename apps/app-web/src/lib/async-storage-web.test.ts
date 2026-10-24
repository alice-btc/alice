import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import AsyncStorage from './async-storage-web.ts';
import { getWebStorageCipher } from './storage-cipher.ts';
import { createWebCryptoLocalCipher } from '../../../../packages/alice-ai/src/local-cipher.ts';
import { webcrypto } from 'node:crypto';
import { getLocalCipher, resetLocalCipherForTests } from '../../../../packages/alice-ai/src/local-cipher.ts';
import {
  cleanupSessions,
  deleteSession,
  listSessions,
  loadSession,
  saveSession,
  setChatStorageBackendForTests,
} from '../../../../packages/alice-ai/src/chat-storage.ts';
import { browserStorageIssues } from '../../../../packages/alice-ai/src/browser-storage-security.ts';
const originalWindow=Object.getOwnPropertyDescriptor(globalThis,'window');
const originalDb=Object.getOwnPropertyDescriptor(globalThis,'indexedDB');
const originalStorage=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
const INDEX='alice_chat_sessions';
const body=(id:string)=>`alice_chat_session_${id}`;
// Well-formed envelope and cipher prefix, but no valid authentication tag.
const CORRUPT='alice-chat-encrypted:v1:v1:'+Buffer.alloc(40,7).toString('base64');
afterEach(()=>{
  for(const [name,descriptor] of [['window',originalWindow],['indexedDB',originalDb],['localStorage',originalStorage]] as const){
    if(descriptor) Object.defineProperty(globalThis,name,descriptor); else Reflect.deleteProperty(globalThis,name);
  }
  resetLocalCipherForTests();
  setChatStorageBackendForTests(null);
});
type Req={result?:unknown;onsuccess?:()=>void};
type Tx={oncomplete?:()=>void;objectStore?:()=>{get:()=>Req;add:(value:unknown)=>Req}};
/** Just enough IndexedDB for the local cipher's key store. */
function fakeIndexedDb(){
  let stored:unknown;
  const later=(run:()=>void)=>{setTimeout(run,0);};
  const transaction=()=>{
    const tx:Tx={};let pending=0;
    const request=(run:()=>unknown)=>{
      const req:Req={};pending++;
      later(()=>{req.result=run();req.onsuccess?.();if(--pending===0) later(()=>tx.oncomplete?.());});
      return req;
    };
    tx.objectStore=()=>({get:()=>request(()=>stored),add:(value:unknown)=>request(()=>{stored=value;return undefined;})});
    return tx;
  };
  return {open:()=>{const req:Req={};later(()=>{req.result={transaction,close(){}};req.onsuccess?.();});return req;}};
}
function setup(withCipher:boolean){
  const disk=new Map<string,string>();
  const control:{afterGet?:(key:string)=>void;failRemove?:boolean}={};
  Object.defineProperty(globalThis,'window',{configurable:true,value:{}});
  Object.defineProperty(globalThis,'indexedDB',{configurable:true,value:withCipher ? fakeIndexedDb() : undefined});
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{
    // afterGet runs once the value is read: a write another tab makes next.
    getItem:(k:string)=>{const value=disk.get(k)??null;control.afterGet?.(k);return value;},
    setItem:(k:string,v:string)=>disk.set(k,v),
    removeItem:(k:string)=>{if(control.failRemove) throw new Error('denied');disk.delete(k);},
    key:(i:number)=>[...disk.keys()][i]??null,
    get length(){return disk.size;},
  }});
  resetLocalCipherForTests();setChatStorageBackendForTests(AsyncStorage);
  return {disk,control};
}
const conversation=(text:string)=>[{id:`m-${text}`,role:'user' as const,content:text,time:new Date('2026-01-01T00:00:00Z')}];
test('without a cipher chat reads and writes stay in memory and keep stored values',async()=>{
  const {disk}=setup(false);const key='alice_chat_session_temporary';
  disk.set(key,'alice-chat-encrypted:v1:v1:existing');
  assert.equal(await AsyncStorage.getItem(key),null);
  await AsyncStorage.setItem(key,'new private text');
  assert.equal(await AsyncStorage.getItem(key),'new private text');
  assert.equal(disk.get(key),'alice-chat-encrypted:v1:v1:existing');
  // An explicit delete reaches the stored value too.
  await AsyncStorage.multiRemove([key]);
  assert.equal(disk.has(key),false);
  assert.equal(await AsyncStorage.getItem(key),null);
});
test('without a cipher deleting all chats removes the hidden stored history and nothing else',async()=>{
  const {disk}=setup(false);
  disk.set(INDEX,JSON.stringify([{id:'legacy',title:'Legacy title',createdAt:1,updatedAt:1,messageCount:1}]));
  disk.set(body('legacy'),'[{"content":"legacy plaintext"}]');
  disk.set(body('sealed'),CORRUPT);
  disk.set('alice_personal_memory_v1','v1:memory');
  disk.set('alice_theme_mode','dark');
  const id=(await saveSession(conversation('this page only'),null))!;
  assert.equal(disk.has(body(id)),false);
  // The stored legacy index is hidden from the in-memory session list.
  assert.deepEqual((await listSessions()).map(s=>s.id),[id]);
  const result=await cleanupSessions('all');
  assert.deepEqual(result.deletedIds.sort(),[id,'legacy','sealed'].sort());
  assert.deepEqual([...disk.keys()].sort(),['alice_personal_memory_v1','alice_theme_mode']);
  assert.deepEqual(await listSessions(),[]);
});
test('without a cipher a chat delete that cannot reach storage rejects',async()=>{
  const {disk,control}=setup(false);
  disk.set(INDEX,'[]');disk.set(body('legacy'),'[]');
  control.failRemove=true;
  await assert.rejects(AsyncStorage.removeItem(body('legacy')),/denied/);
  await assert.rejects(cleanupSessions('all'),/denied/);
  assert.deepEqual([...disk.keys()].sort(),[INDEX,body('legacy')].sort());
});
test('a missing cipher argument cannot persist a plaintext chat on a capable browser',async()=>{
  const {disk}=setup(true);
  await assert.rejects(AsyncStorage.setItem('alice_chat_sessions','private title'),/requires encryption/);
  await assert.rejects(AsyncStorage.setItem('alice_chat_sessions',CORRUPT));
  assert.equal(disk.size,0);
  await AsyncStorage.setItem('alice_theme_mode','dark');
  assert.equal(disk.get('alice_theme_mode'),'dark');
});
test('a conversation round-trips through the browser cipher without plaintext on disk',async()=>{
  const {disk}=setup(true);const cipher=getLocalCipher()!;
  const id=(await saveSession(conversation('private words'),null,cipher))!;
  assert.deepEqual((await loadSession(id,cipher)).map(m=>m.content),['private words']);
  assert.deepEqual([...disk.keys()].sort(),[INDEX,body(id)].sort());
  for(const value of disk.values()){
    assert.ok(value.startsWith('alice-chat-encrypted:v1:v1:'));
    assert.ok(!value.includes('private words'));
  }
});
test('an unreadable conversation under a readable index is kept, and can be deleted explicitly',async()=>{
  const {disk}=setup(true);const cipher=getLocalCipher()!;
  const id=(await saveSession(conversation('first'),null,cipher))!;
  disk.set(body(id),CORRUPT);const index=disk.get(INDEX);
  await assert.rejects(saveSession(conversation('replacement'),id,cipher));
  assert.equal(disk.get(body(id)),CORRUPT);
  assert.ok(browserStorageIssues().includes('unreadable'));
  assert.equal(disk.get(INDEX),index);
  await deleteSession(id,cipher);
  assert.equal(disk.has(body(id)),false);
  assert.deepEqual(await listSessions(cipher),[]);
});
test('a conversation another tab replaces during a save is not overwritten',async()=>{
  const {disk,control}=setup(true);const cipher=getLocalCipher()!;
  const id=(await saveSession(conversation('first'),null,cipher))!;
  const original=disk.get(body(id))!;const index=disk.get(INDEX);
  // Read 1 is the shared check before encrypting; read 2 is the adapter's
  // own check, which the synchronous final reread must catch.
  for(const replaceAfterRead of [1,2]){
    disk.set(body(id),original);let reads=0;
    control.afterGet=key=>{if(key===body(id)&&++reads===replaceAfterRead) disk.set(key,CORRUPT);};
    await assert.rejects(saveSession(conversation('replacement'),id,cipher));
    control.afterGet=undefined;
    assert.equal(disk.get(body(id)),CORRUPT,`replaced after read ${replaceAfterRead}`);
    assert.equal(disk.get(INDEX),index);
  }
});


test('the Tauri reporting wrapper and web adapter use the same native cipher commands', async () => {
  const {disk}=setup(false);
  let key:CryptoKey|null=null;
  const nativeCipher=createWebCryptoLocalCipher(webcrypto.subtle as unknown as SubtleCrypto,
    {get:async()=>key,getOrAdd:async(candidate:CryptoKey)=>{key??=candidate;return key;}},
    n=>webcrypto.getRandomValues(new Uint8Array(n)));
  const calls:string[]=[];
  Object.defineProperty(globalThis,'window',{configurable:true,value:{__TAURI_INTERNALS__:{
    invoke:async(command:string,args:Record<string,string>)=>{
      calls.push(command);
      if(command==='chat_storage_encrypt')return nativeCipher.encrypt(args.plaintext,args.context);
      if(command==='chat_storage_decrypt')return nativeCipher.decrypt(args.ciphertext,args.context);
      throw new Error('Unexpected native command');
    },
  }}});
  resetLocalCipherForTests();
  const reporting=getWebStorageCipher()!;
  assert.notEqual(reporting,getLocalCipher());
  const id=(await saveSession(conversation('native fixture'),null,reporting))!;
  assert.deepEqual((await loadSession(id,reporting)).map(m=>m.content),['native fixture']);
  await saveSession(conversation('native update'),id,reporting);
  assert.deepEqual((await loadSession(id,reporting)).map(m=>m.content),['native update']);
  assert.ok(calls.includes('chat_storage_encrypt'));
  assert.ok(calls.filter(command=>command==='chat_storage_decrypt').length>2);
  assert.ok(disk.get(body(id))?.startsWith('alice-chat-encrypted:v1:v1:'));
});
