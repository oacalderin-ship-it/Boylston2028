import test from 'node:test';import assert from 'node:assert/strict';
import {initialState,generateBlock} from '../src/training.js';

// Smoke-test rendering of the actual app entrypoint with a lightweight DOM and IndexedDB shim.
// This is NOT a replacement for testing layout on real Safari/Chrome.
test('entrypoint renders all five tabs and key dialogs with existing data', async()=>{
 const seeded=initialState();seeded.settings.completed=true;seeded.settings.name='Runner';const b=generateBlock(seeded.settings,[],seeded.settings.startDate);seeded.blocks=[b.block];seeded.plans=b.plans;
 seeded.workouts=[{id:'sample-workout',date:seeded.settings.startDate,type:'runwalk',distanceMiles:1.2,durationMin:30,rpe:3,energy:4,notes:'easy',plannedId:null}];
 const listeners={};const el={innerHTML:'',addEventListener(type,callback){listeners[type]=callback},insertAdjacentHTML(where,html){this.innerHTML+=html}};
 const doc={querySelector(selector){if(selector==='#app')return el;return null},body:{classList:{toggle(){}}}};
 const win={addEventListener(type,callback){listeners[type]=callback},scrollTo(){}};
 const loc={hash:'#/today',protocol:'http:',hostname:'example.test'};
 const fake={objectStoreNames:{contains:()=>true},createObjectStore(){},close(){},transaction(){let tx={oncomplete:null,onerror:null,onabort:null,objectStore(){return {get(){const req={};setTimeout(()=>{req.result=seeded;req.onsuccess?.();setTimeout(()=>tx.oncomplete?.(),0)},0);return req},put(){const req={};setTimeout(()=>{req.onsuccess?.();setTimeout(()=>tx.oncomplete?.(),0)},0);return req}}}};return tx}};
 const indexedDB={open(){const req={};setTimeout(()=>{req.result=fake;req.onsuccess?.()},0);return req}};
 Object.defineProperties(globalThis,{document:{value:doc,configurable:true},window:{value:win,configurable:true},location:{value:loc,configurable:true},indexedDB:{value:indexedDB,configurable:true},navigator:{value:{onLine:true},configurable:true}});
 await import('../src/app.js');
 await new Promise(r=>setTimeout(r,40));
 assert.match(el.innerHTML,/Good (morning|afternoon|evening), Runner/);
 for(const [route,expected] of [['calendar','Training calendar'],['progress','Progress &amp; performance'],['boston','Boston 2028'],['settings','Settings &amp; training plan']]){
  loc.hash='#/'+route;listeners.hashchange();assert.ok(el.innerHTML.includes(expected),`${route} rendered`);
 }
 loc.hash='#/boston';listeners.hashchange();
 listeners.click({target:{closest(){return {dataset:{action:'boston-tab',tab:'charities'}}}}});
 assert.match(el.innerHTML,/Charity applications/);
 listeners.click({target:{closest(){return {dataset:{action:'boston-tab',tab:'fundraising'}}}}});
 assert.match(el.innerHTML,/Donation ledger/);
 listeners.click({target:{closest(){return {dataset:{action:'boston-tab',tab:'mywhy'}}}}});
 assert.match(el.innerHTML,/THE REASON BEHIND THE MILES/);
 listeners.click({target:{closest(){return {dataset:{action:'new-log'}}}}});
 assert.match(el.innerHTML,/id="log-form"/);
 loc.hash='#/progress';listeners.hashchange();
 assert.match(el.innerHTML,/Lifetime distance trend/);
 assert.match(el.innerHTML,/Average pace trend/);
 });
