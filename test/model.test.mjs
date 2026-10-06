import { test } from 'node:test';
import assert from 'node:assert/strict';
import { series } from '../web/model.js';
const snapshot = (time, value) => ({time, members: value===null ? {} : {a:{contributions:{1:value}}}});
test('daily rates account for multi-day and sub-day intervals',()=>{
  const data=[snapshot('2026-01-01T00:00:00',100),snapshot('2026-01-03T00:00:00',160),snapshot('2026-01-03T12:00:00',180)];
  assert.deepEqual(series(data,'a','1','daily'),[null,30,40]);
  assert.deepEqual(series(data,'a','1','cumulative'),[100,160,180]);
});
test('missing members, rejoining, and counter resets cannot fabricate daily contributions',()=>{
  const data=[snapshot('2026-01-01T00:00:00',100),snapshot('2026-01-02T00:00:00',null),snapshot('2026-01-03T00:00:00',180),snapshot('2026-01-04T00:00:00',10),snapshot('2026-01-05T00:00:00',20)];
  assert.deepEqual(series(data,'a','1','daily'),[null,null,null,null,10]);
});
