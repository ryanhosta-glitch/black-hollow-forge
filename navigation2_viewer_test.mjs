// Run: node navigation2_viewer_test.mjs /absolute/path/to/three.module.mjs
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {readFile} from 'node:fs/promises';
const THREE=await import(pathToFileURL(process.argv[2]).href);
const {createNavigation2ForgeViewer}=await import('./forge_navigation2_viewer.js');
class Element extends EventTarget {
 constructor(){super();this.nodes=new Map();this.classList={toggle(){}};this.dataset={};}
 querySelector(id){if(!this.nodes.has(id))this.nodes.set(id,new Element());return this.nodes.get(id);}
 querySelectorAll(){return [];}
}
globalThis.window=new EventTarget();globalThis.document=new EventTarget();
document.createElement=()=>new Element();document.body={append(){}};
let now=0;Object.defineProperty(globalThis,'performance',{value:{now:()=>now},configurable:true});
const rooms=[{id:'a',name:'South',floor:0,boundsFeet:{x:0,y:0,l:10,w:10,h:10},openings:[{wall:'top',type:'door',shared:'ab',pos:.5}]},{id:'b',name:'North',floor:0,boundsFeet:{x:0,y:-10,l:10,w:10,h:10},openings:[{wall:'bottom',type:'door',shared:'ab',pos:.5}]}];
window.__forgeWalkRooms=rooms;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(62,1,.1,600),controls={enabled:true,target:new THREE.Vector3()};
let selected=rooms[0],changes=0;
const canvas=new Element();
const nav=createNavigation2ForgeViewer(THREE,{scene,camera,controls,canvas,getRoom:()=>selected,levelY:()=>0,selectRoom:id=>{selected=rooms.find(r=>r.id===id);changes++;},getConnections:()=>[],isReady:()=>true});
function key(type,code){const e=new Event(type,{cancelable:true});Object.defineProperty(e,'code',{value:code});(type==='keydown'?window:document).dispatchEvent(e);}
function frames(n,check=()=>{}){for(let i=0;i<n;i++){now+=16;nav.update(now);scene.updateMatrixWorld(true);check();}}
assert.equal(nav.enter(),true);assert.equal(controls.enabled,false);
key('keydown','KeyW');let previous=nav.position;
frames(170,()=>{const p=nav.position;assert.ok(Math.hypot(p[0]-previous[0],p[2]-previous[2])<.05,'continuous movement, no room-center jump');previous=p;});
assert.equal(nav.currentRoomId,'b');assert.equal(changes,1);assert.ok(nav.position[2]>=-3.048+.20-1e-6,'solid north wall blocks');
key('keyup','KeyW');key('keydown','KeyS');frames(170);assert.equal(nav.currentRoomId,'a','reverse through doorway');key('keyup','KeyS');
nav.exit();assert.equal(controls.enabled,true);assert.equal(camera.near,.1);
// Put the opened leaf inside the room, away from its threshold: it must still
// block travel. The old threshold-only / openness gate walked straight through.
selected=rooms[0];nav.enter();frames(120);
const leaf=scene.getObjectByName('bh-door-leaf-ab');
leaf.parent.position.set(1.524,0,.10);
key('keydown','KeyW');frames(100);
assert.equal(nav.currentRoomId,'a');
assert.ok(nav.position[2]>1.30,'fully open leaf blocks inside room');
key('keyup','KeyW');nav.exit();
// A mismatched receiving aperture must remain a wall even with the same door ID.
rooms[1].openings[0].pos=.05;selected=rooms[0];nav.enter();key('keydown','KeyW');frames(160);assert.equal(nav.currentRoomId,'a');assert.ok(nav.position[2]>=.20-1e-6);key('keyup','KeyW');
// A/D turns the explorer, releasing and blurring do not leave a key held.
key('keydown','KeyD');frames(35);key('keyup','KeyD');key('keydown','KeyW');frames(20);assert.ok(nav.position[0]>1.524);window.dispatchEvent(new Event('blur'));frames(80);const stopped=nav.position;frames(40);assert.deepEqual(nav.position,stopped);nav.exit();
const html=await readFile(new URL('./index.html',import.meta.url),'utf8');assert.ok(html.includes('if(!cinematicWalkthrough.active)controls.update()'),'orbit does not overwrite walking camera');
console.log('PASS: continuous forward/reverse doorway traversal, solid walls, mismatched apertures, turning, blur recovery, exit camera state, orbit ownership');
