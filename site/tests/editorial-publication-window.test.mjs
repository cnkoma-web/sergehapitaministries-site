import test from 'node:test';import assert from 'node:assert/strict';
import {publicationWindow} from '../src/lib/editorial/publicationWindow.ts';
test('publication à minuit Paris, avec la date du lendemain',()=>{assert.deepEqual(publicationWindow(new Date('2026-10-27T22:59:59Z')),{date:'2026-10-27',due:false});assert.deepEqual(publicationWindow(new Date('2026-10-27T23:00:00Z')),{date:'2026-10-28',due:true});});
test('le passage heure été/hiver conserve minuit local',()=>{assert.deepEqual(publicationWindow(new Date('2026-07-01T22:00:00Z')),{date:'2026-07-02',due:true});assert.deepEqual(publicationWindow(new Date('2026-07-01T23:00:00Z')),{date:'2026-07-02',due:false});assert.deepEqual(publicationWindow(new Date('2026-12-01T23:00:00Z')),{date:'2026-12-02',due:true});});
