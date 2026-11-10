import {addDays,daysBetween,mondayOf,monthShift,today} from './date.js';
import {RUN_TYPES} from './training.js';
export const isRun=w=>['run','runwalk','race'].includes(w.type);
export function calculatePace(distanceMiles,durationMin,unit='mi') {
 const distance=Number(distanceMiles)||0, minutes=Number(durationMin)||0;
 if(distance<=0 || minutes<=0)return null;
 return minutes/(unit==='km'?distance*1.609344:distance);
}
export function formatPace(minutes){if(!Number.isFinite(minutes)||minutes<=0)return '—'; const secs=Math.round(minutes*60);return `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;}
export function durationLabel(minutes){const m=Math.round(Number(minutes)||0);return m>=60?`${Math.floor(m/60)}h ${m%60}m`:`${m} min`;}
export function formatRaceTime(seconds){if(!Number.isFinite(Number(seconds))||Number(seconds)<=0)return '—';let s=Math.round(seconds);return `${Math.floor(s/3600)?`${Math.floor(s/3600)}:`:''}${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
export function parseRaceTime(value){if(!value)return null;const parts=value.split(':').map(Number);if(parts.some(n=>!Number.isFinite(n)||n<0)||parts.length<2||parts.length>3)return null;return parts.length===2?parts[0]*60+parts[1]:parts[0]*3600+parts[1]*60+parts[2];}
export const milesToDisplay=(mi,unit)=>unit==='km'?Number(mi||0)*1.609344:Number(mi||0);
export const toMiles=(v,unit)=>unit==='km'?Number(v)/1.609344:Number(v);
export function weekBuckets(workouts,count=12,anchor=today()) {
 const end=mondayOf(anchor); const result=[];
 for(let i=count-1;i>=0;i--){let start=addDays(end,-7*i);let next=addDays(start,7);
   const rows=workouts.filter(w=>w.date>=start&&w.date<next);
   result.push({start,label:start.slice(5),miles:rows.filter(isRun).reduce((s,w)=>s+Number(w.distanceMiles||0),0),runs:rows.filter(isRun).length,minutes:rows.reduce((s,w)=>s+Number(w.durationMin||0),0)});
 }
 return result;
}
export function monthBuckets(workouts,count=6,anchor=today()){
 const result=[];const current=anchor.slice(0,7)+'-01';
 for(let i=count-1;i>=0;i--){const start=monthShift(current,-i),next=monthShift(start,1);const rows=workouts.filter(w=>w.date>=start&&w.date<next);
 result.push({start,label:new Intl.DateTimeFormat('en-US',{month:'short',timeZone:'UTC'}).format(new Date(start+'T12:00:00Z')),miles:rows.filter(isRun).reduce((s,w)=>s+Number(w.distanceMiles||0),0),runs:rows.filter(isRun).length});}
 return result;
}
export function stats(state,anchor=today(state.settings.timezone)){
 const {workouts,plans}=state;
 const week=mondayOf(anchor),weekEnd=addDays(week,7);
 const actual=workouts.filter(w=>w.date>=week&&w.date<weekEnd);
 const scheduled=plans.filter(p=>p.date>=week&&p.date<weekEnd&&['run','runwalk','walk','strength','rest'].includes(p.type));
 const required=scheduled.filter(p=>!p.optional&&p.date<=anchor);
 const successful=required.filter(p=>p.type==='rest'||actual.some(w=>w.plannedId===p.id));
 const runWorkouts=workouts.filter(isRun);
 const weekRun=actual.filter(isRun), allRuns=runWorkouts;
 const longest=Math.max(0,...allRuns.map(w=>Number(w.distanceMiles)||0));
 const weekTarget=scheduled.filter(p=>p.type==='run'||p.type==='runwalk').reduce((s,p)=>s+Number(p.distanceMiles||0),0);
 return {
  weekMiles:weekRun.reduce((s,w)=>s+Number(w.distanceMiles||0),0),weekTarget:weekTarget||null,
  completedWorkouts:actual.filter(w=>w.type!=='recovery').length,
  adherence:required.length?Math.round(successful.length/required.length*100):null,
  longest,totalMiles:allRuns.reduce((s,w)=>s+Number(w.distanceMiles||0),0),
  runHours:allRuns.reduce((s,w)=>s+Number(w.durationMin||0),0)/60,
  lastWorkout:[...workouts].sort((a,b)=>b.date.localeCompare(a.date))[0]||null,
  daysBoston:daysBetween(anchor,'2028-04-17'),
  nextRace:[...state.races].filter(r=>r.date>=anchor).sort((a,b)=>a.date.localeCompare(b.date))[0]||null,
  planned:scheduled.length,successful:successful.length
 };
}
export function donationsTotal(donations){const received=donations.filter(d=>d.status==='received').reduce((s,d)=>s+Number(d.amount||0),0);const pledged=donations.filter(d=>d.status==='pledged').reduce((s,d)=>s+Number(d.amount||0),0);return {received,pledged};}
export function fundraisingPerWeek(goal,received,deadline,anchor=today()) {const days=daysBetween(anchor,deadline);return days>0?Math.max(0,(goal-received)/(days/7)):null;}
export function records(state){let best={};for(const r of state.races){if(!r.finishSeconds)continue;let key=r.distanceMiles<4?'5K':r.distanceMiles<8?'10K':r.distanceMiles<17?'Half marathon':'Marathon';if(!best[key]||Number(r.finishSeconds)<best[key].finishSeconds)best[key]=r;}
 return best;
}
