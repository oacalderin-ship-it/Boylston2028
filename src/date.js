export const TZ = 'America/New_York';
export function dateParts(date, timeZone=TZ) {
  const p = new Intl.DateTimeFormat('en-US', {timeZone, year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(date);
  const m = Object.fromEntries(p.map(x=>[x.type,x.value]));
  return `${m.year}-${m.month}-${m.day}`;
}
export function today(timeZone=TZ) { return dateParts(new Date(),timeZone); }
export function utcDate(iso) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(iso||'')) throw new Error('Invalid date');
  const d=new Date(iso+'T12:00:00.000Z');
  if(Number.isNaN(d.getTime()) || d.toISOString().slice(0,10)!==iso) throw new Error('Invalid calendar date');
  return d;
}
export function addDays(iso,n) { const d=utcDate(iso); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); }
export function daysBetween(a,b) { return Math.round((utcDate(b).getTime()-utcDate(a).getTime())/86400000); }
export function mondayOf(iso) { const day=utcDate(iso).getUTCDay(); return addDays(iso,-((day+6)%7)); }
export function monthStart(iso) { return iso.slice(0,7)+'-01'; }
export function monthShift(iso,months) { const [y,m]=iso.split('-').map(Number); const d=new Date(Date.UTC(y,m-1+months,1,12)); return d.toISOString().slice(0,10); }
export function monthDays(iso) { const [y,m]=iso.split('-').map(Number); return new Date(Date.UTC(y,m,0)).getUTCDate(); }
export function dateLabel(iso, options={month:'short',day:'numeric',year:'numeric'}) { return new Intl.DateTimeFormat('en-US',{...options,timeZone:'UTC'}).format(utcDate(iso)); }
export function weekday(iso) { return new Intl.DateTimeFormat('en-US',{weekday:'long',timeZone:'UTC'}).format(utcDate(iso)); }
export function dayIndex(iso) { return utcDate(iso).getUTCDay(); }
export function niceNumber(n,d=1) { return Number(n||0).toLocaleString('en-US',{maximumFractionDigits:d}); }
export function safeDate(iso,fallback) { try{utcDate(iso);return iso;}catch{return fallback;} }
