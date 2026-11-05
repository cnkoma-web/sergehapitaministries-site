import test from "node:test";
import assert from "node:assert/strict";
import {readyInvocation} from "../src/lib/editorial/readyReplay.ts";
const clock={date:"2026-10-31",due:false};
const call=(body,more={})=>readyInvocation({method:"POST",url:"https://example.org/api/cron/ready",body,clock,...more});
test("reprise explicite du 29 hors fenêtre, sans glissement au 31",()=>{
 assert.deepEqual(call({action:"replay",date:"2026-10-29"}),{mode:"replay",date:"2026-10-29"});
});
test("le passage régulier conserve la fenêtre de 23h et J+1",()=>{
 assert.equal(readyInvocation({method:"GET",url:"https://example.org/api/cron/ready",clock}),null);
 assert.deepEqual(readyInvocation({method:"GET",url:"https://example.org/api/cron/ready",clock:{...clock,due:true}}),{mode:"scheduled",date:"2026-10-31"});
});
test("une date en GET ne déclenche jamais un rattrapage implicite",()=>{
 assert.throws(()=>readyInvocation({method:"GET",url:"https://example.org/api/cron/ready?date=2026-10-29",clock}));
 assert.deepEqual(readyInvocation({method:"GET",url:"https://example.org/api/cron/ready?check=1&date=2026-10-29",clock}),{mode:"check",date:"2026-10-29"});
});
test("refuse dates futures, anciennes hors circuit, invalides et actions implicites",()=>{
 for(const date of ["2026-10-31","2026-11-01","2026-10-27","2026-02-30","2026-13-29","29/10/2026",""])assert.throws(()=>call({action:"replay",date}));
 assert.throws(()=>call({date:"2026-10-29"}));
});
test("les changements d’heure ne déplacent pas la date fournie pour la reprise",()=>{
 for(const current of [{date:"2027-03-29",due:false},{date:"2027-11-01",due:true}])
 assert.deepEqual(call({action:"replay",date:"2026-10-29"},{clock:current}),{mode:"replay",date:"2026-10-29"});
});

