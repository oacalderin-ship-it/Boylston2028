import {addDays,dayIndex,mondayOf,daysBetween,today} from './date.js';
export const PHASES={return:'Return to running','10k':'Build toward 10K',half:'Half marathon foundation',marathon:'First marathon preparation',boston:'Boston 2028 preparation'};
export const RUN_TYPES=['runwalk','run','walk','race'];
export const EARLY_STEPS=[
  {run:1,walk:4,repeat:6},{run:1,walk:4,repeat:6},
  {run:2,walk:3,repeat:6},{run:2,walk:3,repeat:6},
  {run:3,walk:2,repeat:6},{run:3,walk:2,repeat:6},
  {run:5,walk:2,repeat:5},{run:5,walk:2,repeat:5},
  {run:8,walk:2,repeat:4},{run:8,walk:2,repeat:4},
  {run:12,walk:2,repeat:3},{run:15,walk:2,repeat:2}
];
export const uuid=()=>globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
export function initialRaces(){return [
  {id:uuid(),name:'Return-to-running 5K',date:'2027-02-06',dateStatus:'tentative',distanceMiles:3.10686,location:'To be chosen',registration:'idea',preparation:'building',site:'',finishSeconds:null,officialResults:'',notes:''},
  {id:uuid(),name:'First 10K',date:'2027-04-17',dateStatus:'tentative',distanceMiles:6.21371,location:'To be chosen',registration:'idea',preparation:'not-started',site:'',finishSeconds:null,officialResults:'',notes:''},
  {id:uuid(),name:'First half marathon',date:'2027-07-17',dateStatus:'tentative',distanceMiles:13.1094,location:'To be chosen',registration:'idea',preparation:'not-started',site:'',finishSeconds:null,officialResults:'',notes:''},
  {id:uuid(),name:'First full marathon',date:'2027-12-04',dateStatus:'tentative',distanceMiles:26.2188,location:'To be chosen',registration:'idea',preparation:'not-started',site:'',finishSeconds:null,officialResults:'',notes:''},
  {id:uuid(),name:'Boston Marathon 2028',date:'2028-04-17',dateStatus:'confirmed',distanceMiles:26.2188,location:'Boston, Massachusetts',registration:'idea',preparation:'not-started',site:'https://www.baa.org/races/boston-marathon/',finishSeconds:null,officialResults:'',notes:'Official charity entry goal; earlier marathon is a personal preference, not a charity-entry prerequisite.'}
]}
export function initialCharities(){return ['Mass General Brigham','Beth Israel Lahey Health','American Heart Association'].map(name=>({id:uuid(),name,mission:'',website:'',applicationUrl:'',interestUrl:'',minimum:null,goal:null,openDate:'',deadline:'',status:'researching',appliedAt:'',followUp:'',notes:'Example organization; verify eligibility and 2028 program information directly.',outcome:'',agreement:false,lastVerified:'',verified:false}));}
export function initialState() { return {
  schemaVersion:1,createdAt:new Date().toISOString(),
  settings:{completed:false,name:'',startDate:today(),experience:'returning',continuousMin:0,walkMin:30,weeklyMiles:0,runDays:[1,3,6],longDay:6,units:'mi',weightUnit:'lb',timezone:'America/New_York',theme:'dark',intensity:'conservative',phase:'return',comfort:'',fundraisingGoal:12500,fundraisingStretch:15000,fundraisingDeadline:'2028-03-01'},
  workouts:[],plans:[],races:initialRaces(),charities:initialCharities(),donations:[],
  boston:{entryStatus:'researching',charityAccepted:false,agreementSigned:false,entryConfirmed:false,raceRegistered:false,notes:''},
  reflections:[],myWhy:'I want to return to Boylston Street in 2028 as a runner. Fifteen years after first seeing the race, I want to earn that finish line through steady training, meaningful fundraising, and the small steps that add up.',
  blocks:[],shoes:[]
}; }
export function runPlan(session,phase,date,blockId,isLong=false){
  const warmup='Walk comfortably for 5 minutes.'; const cooldown='Walk gently for 5 minutes; ease off if anything feels wrong.';
  if(phase==='return')return {
    id:uuid(),date,blockId,type:'runwalk',phase,durationMin:10+(session.run+session.walk)*session.repeat,distanceMiles:null,
    intensity:'Easy · conversational',warmup,main:`Jog ${session.run} min / walk ${session.walk} min · repeat ${session.repeat}×. Stay conversational.`,cooldown,purpose:'Rebuild an enjoyable running habit without chasing pace.',status:'planned',skipReason:''
  };
  const minutes=session.minutes+(isLong?(session.longExtra||0):0);
  return {id:uuid(),date,blockId,type:'run',phase,durationMin:minutes,distanceMiles:null,intensity:'Easy · conversational',warmup,
    main:`${minutes-10} minutes of easy running, using walk breaks as needed.`,cooldown,
    purpose:isLong?'Gradually establish a comfortable long-run routine.':'Build easy aerobic consistency.',status:'planned',skipReason:''};
}
export function generateBlock(settings,existing=[],startDate=null) {
  const phase=settings.phase||'return';
  const start=mondayOf(startDate || settings.startDate || today(settings.timezone));
  const blockIndex=existing.filter(b=>b.phase===phase).length;
  const blockId=uuid();const plans=[];
  const runDays=[...new Set((settings.runDays||[1,3,6]).map(Number))].filter(d=>d>=0&&d<=6);
  const safeRunDays=runDays.length?runDays:[1,3,6]; const longDay=safeRunDays.includes(Number(settings.longDay))?Number(settings.longDay):safeRunDays[safeRunDays.length-1];
  const allDays=new Set();
  for(let week=0;week<4;week++) {
    const step=EARLY_STEPS[Math.min(blockIndex*4+week,EARLY_STEPS.length-1)];
    for(let i=0;i<7;i++){
      const date=addDays(start,week*7+i);const d=dayIndex(date);
      // A new runner who starts midweek should not inherit "missed" runs from before onboarding.
      if(blockIndex===0 && startDate && date<settings.startDate){
        plans.push({id:uuid(),date,blockId,type:'rest',phase,durationMin:0,distanceMiles:null,intensity:'Before training start',warmup:'',main:'Your training plan starts on your selected date.',cooldown:'',purpose:'No workout was assigned before the start date.',status:'planned',optional:true,skipReason:''});
        continue;
      }
      if(safeRunDays.includes(d)){
        let session=step;
        if(phase!=='return'){
          const base={ '10k':24,half:28,marathon:32,boston:30}[phase]||24;
          // Every fourth week is reduced-load; progression remains time-based until readiness reviewed.
          const multiplier=week===3?.82:1;
          session={minutes:Math.round((base+Math.min(blockIndex,6)*4+week*2)*multiplier),longExtra:Math.round((10+Math.min(blockIndex,8)*6)*multiplier)};
        }
        plans.push(runPlan(session,phase,date,blockId,d===longDay));
      } else if([2,4].includes(d)){
        plans.push({id:uuid(),date,blockId,type:'strength',phase,durationMin:20,distanceMiles:null,intensity:'Optional · light',warmup:'Start with easy mobility.',main:'20 min of simple, comfortable lower-body and core strength; skip if not recovered.',cooldown:'Gentle mobility.',purpose:'Strength and resilience.',status:'planned',optional:true,skipReason:''});
      } else {
        plans.push({id:uuid(),date,blockId,type:'rest',phase,durationMin:0,distanceMiles:null,intensity:'Rest',warmup:'',main:'Rest or gentle mobility. Recovery is part of training.',cooldown:'',purpose:'Absorb training and recover.',status:'planned',skipReason:''});
      }
      allDays.add(date);
    }
  }
  return {block:{id:blockId,phase,startDate:start,endDate:addDays(start,27),approvedAt:new Date().toISOString(),label:`${PHASES[phase]} · Block ${blockIndex+1}`},plans};
}
export function suggestNextBlock(state) {
 const blocks=[...state.blocks].sort((a,b)=>a.startDate.localeCompare(b.startDate));const last=blocks.at(-1);
 if(!last)return {level:'good',text:'Choose your running days and create your first four-week block.',canAdvance:true};
 const considered=state.plans.filter(p=>p.blockId===last.id && p.type==='runwalk' || p.blockId===last.id && p.type==='run');
 const eligible=considered.filter(p=>p.date<today(state.settings.timezone));
 const complete=eligible.filter(p=>state.workouts.some(w=>w.plannedId===p.id));
 const recent=state.workouts.filter(w=>daysBetween(w.date,today(state.settings.timezone))<=21 && daysBetween(w.date,today(state.settings.timezone))>=0);
 const concerning=recent.some(w=>w.painFlag || Number(w.rpe)>=9 || Number(w.energy)<=1);
 if(concerning)return {level:'warn',text:'Recent pain, very high effort, or low energy was logged. Keep your next block easy and consider professional evaluation if symptoms persist.',canAdvance:false};
 if(eligible.length>=3 && complete.length/eligible.length<.67)return {level:'warn',text:'Several scheduled runs were missed. Repeat or reduce the previous block rather than catching up.',canAdvance:false};
 if(eligible.length<3)return {level:'neutral',text:'Your current block is still underway. Review how the easy sessions feel before approving the next block.',canAdvance:false};
 return {level:'good',text:'Consistency looks steady based on logged sessions. Review your recovery before approving another four-week block.',canAdvance:true};
}
export function nextBlockStart(state){const last=[...state.blocks].sort((a,b)=>a.endDate.localeCompare(b.endDate)).at(-1);return last?addDays(last.endDate,1):state.settings.startDate;}
export function normalizePlan(p) {return {...p,id:p.id||uuid(),status:p.status||'planned'};}
