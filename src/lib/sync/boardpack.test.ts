import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db';
import { exportBoardPack, importBoardPack } from './boardpack';

beforeEach(async () => { await db.delete(); await db.open(); await db.settings.put({id:'local',myLat:0,myLon:0,myRadiusMiles:5,boardCode:'ABC123',deviceId:'dev1',blockedAuthors:[]}); });

describe('boardpack', () => {
  it('exports imports dedupes', async () => {
    await db.posts.add({id:'p1',type:'request',title:'t',description:'d',category:'food',tags:[],lat:1,lon:2,shareExact:false,radiusMiles:5,contactMethod:'in-app',author:'a',anonymous:true,createdAt:'',updatedAt:''});
    const pack = await exportBoardPack();
    await importBoardPack(pack);
    expect((await db.posts.toArray()).length).toBe(1);
  });
});
