import { test } from 'node:test';
import assert from 'node:assert/strict';
import { series, formatNumber, contributionOptions, guildTotals } from '../web/model.js';
const snapshot = (time, value) => ({time, members: value===null ? {} : {a:{contributions:{1:value}}}});
test('guild totals retain former members and use only valid latest-interval rates',()=>{
  const data = [
    {time:'2026-01-01T00:00:00',members:{a:{contributions:{1:100}},b:{contributions:{1:200}},c:{contributions:{1:500}}}},
    {time:'2026-01-03T00:00:00',members:{a:{contributions:{1:160}},c:{contributions:{1:20}},d:{contributions:{1:300}}}},
  ];
  assert.deepEqual(guildTotals(data,'1'),{lifetime:680,daily:30,dailyMembers:1,members:4});
  assert.equal(guildTotals(data.slice(0,1),'1').daily,null);
});
test('daily rates account for multi-day and sub-day intervals',()=>{
  const data=[snapshot('2026-01-01T00:00:00',100),snapshot('2026-01-03T00:00:00',160),snapshot('2026-01-03T12:00:00',180)];
  assert.deepEqual(series(data,'a','1','daily'),[null,30,40]);
  assert.deepEqual(series(data,'a','1','cumulative'),[100,160,180]);
});
test('compact numbers retain four significant figures and floor instead of rounding',()=>{
  for (const [value, expected] of [[186666221,'186.6m'],[999999,'999.9k'],[1234567,'1.234m'],[1000000,'1.000m'],[1234567890123456789,'1.234qi'],[12.3456,'12.34'],[0.0123456,'0.01234'],[0,'0']]) assert.equal(formatNumber(value),expected);
});
test('gathered contributions sum individual totals and rates without hiding resets',()=>{
  const data = [
    {time:'2026-01-01T00:00:00',members:{a:{contributions:{7:100,8:200,9:300}}}},
    {time:'2026-01-03T00:00:00',members:{a:{contributions:{7:120,8:240,9:360}}}},
    {time:'2026-01-04T00:00:00',members:{a:{contributions:{7:10,8:500,9:400}}}},
  ];
  assert.deepEqual(series(data,'a','gathered','cumulative'),[600,720,910]);
  assert.deepEqual(series(data,'a','gathered','daily'),[null,60,null]);
  assert.deepEqual(contributionOptions(['1','2','3','7','8','9','42']),['1','2','3','9','7','8','gathered','42']);
});
test('missing members, rejoining, and counter resets cannot fabricate daily contributions',()=>{
  const data=[snapshot('2026-01-01T00:00:00',100),snapshot('2026-01-02T00:00:00',null),snapshot('2026-01-03T00:00:00',180),snapshot('2026-01-04T00:00:00',10),snapshot('2026-01-05T00:00:00',20)];
  assert.deepEqual(series(data,'a','1','daily'),[null,null,null,null,10]);
});
