import {mkdir,writeFile} from 'node:fs/promises';
const parks={toverland:305,phantasialand:56};
await mkdir('data',{recursive:true});
for(const [park,id] of Object.entries(parks)){
  const response=await fetch(`https://queue-times.com/parks/${id}/queue_times.json`,{headers:{accept:'application/json','user-agent':'de-kempervennen-waits/1.0'}});
  if(!response.ok)throw new Error(`${park}: ${response.status}`);
  const raw=await response.json();
  const rides=[...(raw.lands||[]).flatMap(land=>(land.rides||[]).map(ride=>({...ride,area:land.name}))),...(raw.rides||[]).map(ride=>({...ride,area:null}))]
    .map(({id,name,is_open,wait_time,last_updated,area})=>({id,name,area,open:Boolean(is_open),waitMinutes:Number.isFinite(wait_time)?wait_time:null,lastUpdated:last_updated||null}));
  const sourceUpdated=rides.map(r=>r.lastUpdated).filter(Boolean).sort().at(-1)||null;
  const payload={park,source:'Queue-Times',sourceUrl:`https://queue-times.com/en-US/parks/${id}`,sourceUpdated,fetchedAt:new Date().toISOString(),rides};
  await writeFile(`data/${park}.json`,JSON.stringify(payload,null,2)+'\n');
}
