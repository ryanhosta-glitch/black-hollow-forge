/** Export preparation budgets are not frame-rate measurements. */
export function auditPackageBudget(files,{maxPackageBytes=32*1024*1024,maxModelTriangles=450000,maxModelDraws=160}={}){
 const issues=[],models=[],images=[];let bytes=0;
 for(const [path,raw]of files){const data=raw instanceof Uint8Array?raw:new Uint8Array(raw);bytes+=data.byteLength;
  if(/\.webp$/i.test(path)){images.push({path,bytes:data.length});if(data.length>150*1024)issues.push({severity:'ADVISORY',code:'TEXTURE_SIZE_BUDGET',path,bytes:data.length});}
  if(!path.endsWith('.glb'))continue;
  try{const view=new DataView(data.buffer,data.byteOffset,data.byteLength);if(data.length<20||view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==data.length||view.getUint32(16,true)!==0x4e4f534a)throw Error('invalid header');const json=JSON.parse(new TextDecoder().decode(data.subarray(20,20+view.getUint32(12,true))));let triangles=0,draws=0,instances=0;
   for(const n of json.nodes||[]){if(n.mesh==null)continue;const attributes=n.extensions?.EXT_mesh_gpu_instancing?.attributes,count=attributes?json.accessors[attributes.TRANSLATION??attributes.SCALE??attributes.ROTATION]?.count||1:1;instances+=count;for(const p of json.meshes[n.mesh]?.primitives||[]){const countVertices=json.accessors[p.indices??p.attributes.POSITION]?.count||0;triangles+=p.mode==null||p.mode===4?countVertices/3*count:0;draws++;}}
   models.push({path,bytes:data.length,triangles,draws,instances});if(triangles>maxModelTriangles||draws>maxModelDraws)issues.push({severity:'ADVISORY',code:'MODEL_RENDER_BUDGET',path,triangles,draws});
  }catch(error){issues.push({severity:'BLOCK_GAME_READY',code:'MODEL_BUDGET_PARSE_FAILED',path,message:error.message});}
 }
 if(bytes>maxPackageBytes)issues.push({severity:'ADVISORY',code:'PACKAGE_SIZE_BUDGET',bytes,limitBytes:maxPackageBytes});
 return {version:1,method:'static-export-inventory',bytes,models,images,budget:{maxPackageBytes,maxModelTriangles,maxModelDraws},issues,withinPlanningBudget:issues.length===0,fpsMeasured:false,limitations:['Model primitive counts are estimates; materials, shadows, repeated template placements and visibility affect real runtime cost','Per-device GPU performance must be measured in the game']};
}
export function readinessStages({playability,decoration,gameplay,budget,issues=[]}){
 const blockers=[...issues,...playability.issues,...decoration.issues,...gameplay.issues,...budget.issues].filter(i=>i.severity==='BLOCK_GAME_READY').filter((i,k,a)=>a.findIndex(j=>JSON.stringify(j)===JSON.stringify(i))===k);
 return {version:1,compiled:true,architecturalClearanceVerified:playability.staticRoutesVerified,physicsVerified:false,gameplayLocationsPrepared:playability.staticRoutesVerified&&gameplay.issues.length===0&&gameplay.slots.length===gameplay.roles.length,gameBindingsComplete:gameplay.unbound.length===0,planningBudgetPassed:budget.withinPlanningBudget,renderedWalkthroughVerified:false,gameTested:false,gameReady:false,blockers,pending:['Dynamic door leaf/camera/mesh physics verification','Bind gameplay objects and quest logic in the actual Black Hollow game','Rendered device and performance testing']};
}
