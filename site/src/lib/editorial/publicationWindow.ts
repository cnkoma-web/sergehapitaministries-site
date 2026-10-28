export function publicationWindow(now=new Date()) {
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Paris",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",hourCycle:"h23"}).formatToParts(now);
  const part=(key:string)=>parts.find(p=>p.type===key)!.value;
  return {date:part("year")+"-"+part("month")+"-"+part("day"),due:part("hour")==="00"};
}
