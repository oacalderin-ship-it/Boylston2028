import {initialState} from './training.js';
import {utcDate} from './date.js';
const DB_NAME='road-to-boylston-db';const DB_VERSION=1;const STORE='app-state';
function openDB(){return new Promise((resolve,reject)=>{
 if(!('indexedDB' in globalThis)){reject(new Error('IndexedDB is unavailable. Use a modern browser with site storage enabled.'));return;}
 const request=indexedDB.open(DB_NAME,DB_VERSION);
 request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE)};
 request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
 });}
async function transact(mode,fn){const db=await openDB();return new Promise((resolve,reject)=>{
 const tx=db.transaction(STORE,mode),store=tx.objectStore(STORE);let result;
 tx.oncomplete=()=>{db.close();resolve(result)};tx.onerror=()=>{db.close();reject(tx.error)};tx.onabort=()=>{db.close();reject(tx.error||new Error('Database operation aborted'))};
 try{const req=fn(store);if(req){req.onsuccess=()=>{result=req.result};}}catch(e){tx.abort();reject(e)}
 });}
export async function loadState(){return (await transact('readonly',store=>store.get('root')))||initialState();}
export async function saveState(state){await transact('readwrite',store=>store.put(state,'root'));}
export function validateBackup(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Backup must contain a JSON object.');
 if(raw.schemaVersion!==1)throw new Error('Unsupported backup schema version. Only version 1 is supported.');
 if(!raw.settings||typeof raw.settings!=='object'||!Array.isArray(raw.workouts)||!Array.isArray(raw.plans)||!Array.isArray(raw.races)||!Array.isArray(raw.charities)||!Array.isArray(raw.donations)||!Array.isArray(raw.blocks))throw new Error('Backup is missing required data collections.');
 if(raw.workouts.length>100000||raw.plans.length>100000||raw.donations.length>100000)throw new Error('Backup is unexpectedly large.');
 for(const listName of ['workouts','plans','races','charities','donations','blocks']){
  const ids=new Set();for(const row of raw[listName]){if(!row||typeof row!=='object'||typeof row.id!=='string'||!row.id||ids.has(row.id))throw new Error(`Invalid or duplicate IDs in ${listName}.`);ids.add(row.id);
   if(row.date)utcDate(row.date);
  }
 }
 for(const w of raw.workouts){if(!w.date||!(Number(w.durationMin)>=0)||!Number.isFinite(Number(w.durationMin))||!(Number(w.distanceMiles)>=0)||!Number.isFinite(Number(w.distanceMiles)))throw new Error('Backup contains an invalid workout.');}
 return raw;
}
export function mergeStates(current,imported){const next=structuredClone(current);
 for(const key of ['workouts','plans','races','charities','donations','blocks','shoes','reflections']){
  const old=Array.isArray(next[key])?next[key]:[], incoming=Array.isArray(imported[key])?imported[key]:[];
  const byId=new Map(old.map(item=>[item.id,item])); for(const item of incoming)if(!byId.has(item.id))byId.set(item.id,item);
  next[key]=[...byId.values()];
 }
 return next;
}
export function sanitizeState(raw) {const base=initialState();return {...base,...raw,settings:{...base.settings,...raw.settings},boston:{...base.boston,...raw.boston},shoes:raw.shoes||[],reflections:raw.reflections||[]};}
