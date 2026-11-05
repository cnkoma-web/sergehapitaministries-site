export type ReadyInvocation = { mode: "scheduled" | "check" | "replay"; date: string };
export function readyInvocation(input: { method: string; url: string; body?: unknown; clock: { date: string; due: boolean } }): ReadyInvocation | null {
 const url=new URL(input.url);
 if(input.method==="POST"){
  const body=input.body as { action?: unknown; date?: unknown } | null;
  if(body?.action!=="replay" || typeof body.date!=="string")throw Error("Reprise explicite et date obligatoires.");
  const date=body.date;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date+"T12:00:00Z")) || new Date(date+"T12:00:00Z").toISOString().slice(0,10)!==date)throw Error("Date invalide.");
  if(date<"2026-10-28" || date>=input.clock.date)throw Error("La reprise est réservée aux dates antérieures à la cible J+1.");
  return {mode:"replay",date};
 }
 if(input.method!=="GET")throw Error("Méthode non autorisée.");
 if(url.searchParams.get("check")==="1"){
  const date=url.searchParams.get("date")??input.clock.date;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date+"T12:00:00Z")) || new Date(date+"T12:00:00Z").toISOString().slice(0,10)!==date)throw Error("Date invalide.");
  return {mode:"check",date};
 }
 if(url.searchParams.has("date"))throw Error("Une date explicite exige une simulation GET ou une reprise POST authentifiée.");
 return input.clock.due?{mode:"scheduled",date:input.clock.date}:null;
}

