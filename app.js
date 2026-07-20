import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('#scene');
const loading = document.querySelector('#loading');
const errorBox = document.querySelector('#error');
const app = document.querySelector('#app');
const hoverLabel = document.querySelector('#hover-label');
const storyPanel = document.querySelector('#story-panel');
const storyKicker = document.querySelector('#story-kicker');
const storyTitle = document.querySelector('#story-title');
const storyCopy = document.querySelector('#story-copy');
const closeStory = document.querySelector('#close-story');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe5cfad);
scene.fog = new THREE.Fog(0xe5cfad, 18, 31);

const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false, preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new THREE.PerspectiveCamera(38, 1, .05, 100);
const home = {position:new THREE.Vector3(.15,3.7,15.5), target:new THREE.Vector3(0,3.35,.1)};
camera.position.copy(home.position);
const controls = new OrbitControls(camera, canvas);
controls.target.copy(home.target); controls.enableDamping=true; controls.dampingFactor=.055;
controls.autoRotate=true; controls.autoRotateSpeed=.35;
controls.minDistance=1.5; controls.maxDistance=24; controls.maxPolarAngle=Math.PI*.52;

scene.add(new THREE.HemisphereLight(0xfff3d8,0x6f7555,2.25));
const key = new THREE.DirectionalLight(0xffe0ad,4.2); key.position.set(-5,12,8); key.castShadow=true;
key.shadow.mapSize.set(2048,2048); key.shadow.camera.left=-9; key.shadow.camera.right=9; key.shadow.camera.top=11; key.shadow.camera.bottom=-4; scene.add(key);
const fill = new THREE.DirectionalLight(0xa9c9e4,1.4); fill.position.set(8,6,-6); scene.add(fill);

const world = new THREE.Group(); world.name='Journey Diorama'; scene.add(world);
const stories = Object.freeze({
  'Young traveler':{label:'My Life',title:'The center of my story',copy:'The journey at the heart of everything — shaped by curiosity, courage, and constant growth.'},
  'Learning desk — updated':{label:'My Career',title:'Building what comes next',copy:'The work, ideas, and tools that turn ambition into a path forward.'},
  'University campus':{label:'My Education',title:'Where I learned and grew',copy:'The campuses and communities that shaped how I learn, think, and build.'},
  'College campus':{label:'My Education',title:'Where I learned and grew',copy:'The campuses and communities that shaped how I learn, think, and build.'},
  'Group of four dolls':{label:'My Family',title:'The people who keep me grounded',copy:'Family is the support, connection, and shared strength behind every chapter.'},
  'City skyline':{label:'My City',title:'New York City',copy:'Energy, opportunity, and the backdrop to so many chapters of my life.'},
  'Fire breathing performer':{label:'My Passion',title:'The spark behind the journey',copy:'A reminder to create boldly, take risks, and bring ideas to life.'},
  'Orbit airplane':{label:'My Journey',title:'Always moving forward',copy:'Every destination opens another perspective, possibility, and story.'},
});
const interactiveRoots=[];
const raycaster=new THREE.Raycaster();
const pointer=new THREE.Vector2();
let cameraTween=null;
let focusedRoot=null;
let pointerDown=null;
const mat = (color,rough=.82)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:.02});
function receive(o){o.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;n.material.side=THREE.DoubleSide}});return o}
function brightenTexturedModel(o,intensity=.28){
  const brightenMaterial=source=>{
    const material=source.clone();
    if(material.color)material.color.offsetHSL(0,0,.07);
    if(material.emissive){
      material.emissive.set(0xffffff);
      material.emissiveIntensity=intensity;
      if(material.map)material.emissiveMap=material.map;
    }
    material.needsUpdate=true;return material;
  };
  o.traverse(n=>{if(n.isMesh)n.material=Array.isArray(n.material)?n.material.map(brightenMaterial):brightenMaterial(n.material)});
}
function disk(name,x,z,r,color,y=.04){const g=new THREE.CylinderGeometry(r,r*.96,.16,64);const m=new THREE.Mesh(g,mat(color));m.name=name;m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=true;world.add(m);return m}
function stoneTerrace(name,x,z,topY,radius,colors){
  const group=new THREE.Group();group.name=name;
  const layers=5,layerHeight=topY/layers;
  for(let i=0;i<layers;i++){
    const t=i/(layers-1),r=radius*(1-t*.2);
    const stone=new THREE.Mesh(
      new THREE.CylinderGeometry(r*.94,r,layerHeight*1.08,14),
      mat(colors[i%colors.length],.97)
    );
    stone.position.y=layerHeight*(i+.5)-.03;
    stone.rotation.y=i*.37;
    stone.scale.z=1-(i%2)*.05;
    stone.castShadow=true;stone.receiveShadow=true;group.add(stone);
  }
  const rockMaterial=mat(colors[1],.98);
  for(let i=0;i<9;i++){
    const angle=i/9*Math.PI*2+.18,radiusOffset=radius*(.7+(i%3)*.08);
    const rock=new THREE.Mesh(new THREE.IcosahedronGeometry(.16+(i%3)*.035,1),rockMaterial);
    rock.position.set(Math.cos(angle)*radiusOffset,.13+(i%2)*.09,Math.sin(angle)*radiusOffset);
    rock.scale.set(1.35,.75,1);rock.rotation.set(i*.21,i*.43,0);rock.castShadow=true;group.add(rock);
  }
  group.position.set(x,0,z);world.add(group);return group;
}

const ground = new THREE.Mesh(new THREE.CylinderGeometry(4.15,4.4,.28,96),mat(0xd1b991,.94));
ground.name='Main sandstone plinth'; ground.position.y=-.19; ground.receiveShadow=true; world.add(ground);
stoneTerrace('NYC stacked-stone terrace',1.8,-1.62,1.18,1.62,[0xb9a486,0x9d8a70,0xc8b497]);
stoneTerrace('University stacked-stone terrace',-1.5,-2.02,1.27,1.84,[0x8f8b78,0x747565,0xa29b83]);
stoneTerrace('Fire performer stacked-stone terrace',0,-6,2.8,2.55,[0xeee9df,0xded7ca,0xf7f3eb]);
disk('City plinth',1.8,-1.62,1.73,0xcbb18a,1.24);
disk('Desk plinth',-1.62,1.32,1.25,0xd8c5a4,.19);
disk('Fire performer plinth',0,-6,2.65,0xe9e2d5,2.86);
disk('Family plinth',1.4,1.08,1.3,0xd88e5e,.15);
disk('University campus plinth',-2.28,-2.04,1,0x638b7b,1.34);
disk('College campus plinth',-.72,-2,1,0xb98462,1.34);
disk('Traveler plinth',0,.72,1.34,0xd9c3a1,.18);

function orbit(rx,ry,z,yOffset,color,rotation=0){const pts=[];for(let i=0;i<=180;i++){const a=i/180*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*rx,Math.sin(a)*ry+yOffset,z));}const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color,transparent:true,opacity:.78}));line.rotation.z=rotation;line.name='Orbit arc';world.add(line)}
function planet(name,x,y,z,r,color){const s=new THREE.Mesh(new THREE.IcosahedronGeometry(r,2),mat(color,.68));s.name=name;s.position.set(x,y,z);s.castShadow=true;world.add(s);return s}
function airplane(){
  const plane=new THREE.Group();plane.name='Orbit airplane';
  const ivory=mat(0xeee2ce,.42),dark=mat(0x413a35,.38),gold=new THREE.MeshStandardMaterial({color:0xc5913f,roughness:.28,metalness:.68});
  const navy=new THREE.MeshStandardMaterial({color:0x173e59,roughness:.24,metalness:.32});
  const ruby=new THREE.MeshStandardMaterial({color:0xb83f35,roughness:.3,metalness:.18,emissive:0x6f110b,emissiveIntensity:.65});
  const wingShape=new THREE.Shape();
  wingShape.moveTo(-.34,0);wingShape.lineTo(.18,.72);wingShape.lineTo(.5,.66);wingShape.lineTo(.18,.1);
  wingShape.lineTo(.18,-.1);wingShape.lineTo(.5,-.66);wingShape.lineTo(.18,-.72);wingShape.closePath();
  const wings=new THREE.Mesh(new THREE.ShapeGeometry(wingShape),ivory);wings.position.z=-.02;plane.add(wings);
  const tailShape=new THREE.Shape();
  tailShape.moveTo(-.72,0);tailShape.lineTo(-.48,.34);tailShape.lineTo(-.32,.31);tailShape.lineTo(-.49,.04);
  tailShape.lineTo(-.49,-.04);tailShape.lineTo(-.32,-.31);tailShape.lineTo(-.48,-.34);tailShape.closePath();
  const tailWings=new THREE.Mesh(new THREE.ShapeGeometry(tailShape),ivory);tailWings.position.z=.015;plane.add(tailWings);
  const fuselage=new THREE.Mesh(new THREE.CylinderGeometry(.095,.125,1.45,18),ivory);fuselage.rotation.z=Math.PI/2;plane.add(fuselage);
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.095,.34,18),ivory);nose.rotation.z=-Math.PI/2;nose.position.x=.89;plane.add(nose);
  const tailCone=new THREE.Mesh(new THREE.ConeGeometry(.12,.26,18),ivory);tailCone.rotation.z=Math.PI/2;tailCone.position.x=-.84;plane.add(tailCone);
  const stripe=new THREE.Mesh(new THREE.BoxGeometry(1.18,.025,.13),gold);stripe.position.set(.02,.025,.105);plane.add(stripe);
  const cockpit=new THREE.Mesh(new THREE.SphereGeometry(.12,18,10),navy);cockpit.position.set(.66,.055,.075);cockpit.scale.set(1.45,.58,.62);plane.add(cockpit);
  for(let i=0;i<6;i++){const windowMesh=new THREE.Mesh(new THREE.SphereGeometry(.02,10,7),dark);windowMesh.position.set(-.04+i*.105,.076,.114);plane.add(windowMesh)}
  for(const side of [-1,1]){
    const engine=new THREE.Mesh(new THREE.CylinderGeometry(.058,.074,.3,16),navy);engine.rotation.z=Math.PI/2;engine.position.set(.1,side*.34,-.025);plane.add(engine);
    const engineRing=new THREE.Mesh(new THREE.TorusGeometry(.071,.012,8,20),gold);engineRing.rotation.y=Math.PI/2;engineRing.position.set(.255,side*.34,-.025);plane.add(engineRing);
    const light=new THREE.Mesh(new THREE.SphereGeometry(.032,10,8),side<0?ruby:new THREE.MeshStandardMaterial({color:0x5b9f78,emissive:0x1d633f,emissiveIntensity:.8}));
    light.position.set(.18,side*.69,.02);plane.add(light);
    const trailCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.72,side*.18,-.03),new THREE.Vector3(-1.15,side*.2,-.025),new THREE.Vector3(-1.7,side*.25,.01)]);
    const trail=new THREE.Mesh(new THREE.TubeGeometry(trailCurve,18,.018,6,false),new THREE.MeshBasicMaterial({color:0xfff7e7,transparent:true,opacity:.48}));plane.add(trail);
  }
  const noseRing=new THREE.Mesh(new THREE.TorusGeometry(.096,.012,8,22),gold);noseRing.rotation.y=Math.PI/2;noseRing.position.x=.72;plane.add(noseRing);
  plane.position.set(1.86,6.42,-1.78);plane.rotation.z=-.42;plane.scale.set(.68,.68,.68);
  plane.userData.story=stories[plane.name];interactiveRoots.push(plane);
  plane.traverse(n=>{if(n.isMesh)n.castShadow=true});world.add(plane);return plane;
}
orbit(3.85,3.15,-2.35,4.2,0x8f6840,.08);
orbit(2.95,1.52,-2.15,4.28,0xb28a36,-.08);
for(const [name,x,y,z,r,c] of [['Blue orbit planet',-2.22,7.02,-2.08,.29,0x2d7da3],['Lower green planet',-3.34,.2,2.55,.24,0xa6aa27],['Lower blue planet',3.28,.25,2.42,.29,0x2e78a0]])planet(name,x,y,z,r,c);
planet('Inner green planet',-2.48,4.02,-1.98,.25,0xa7a52c);
planet('Inner red planet',2.48,4.62,-1.98,.24,0xc85836);
airplane();

const loader = new GLTFLoader();
const specs = [
  ['young-man.glb','Young traveler',[0,.29,.72],[5.05,5.05,5.05],[0,.03,0]],
  ['city.glb','City skyline',[1.8,1.34,-1.65],[3.45,3.45,3.45],[0,.12,0]],
  ['fire-breathing-person.glb','Fire breathing performer',[0,2.95,-6],[4.1,4.1,4.1],[0,.03,0]],
  ['family-dolls.glb','Group of four dolls',[1.4,.26,1.06],[2.05,2.05,2.05],[0,-.36,0]],
  ['desk-v2.glb','Learning desk — updated',[-1.62,.3,1.3],[2.05,2.05,2.05],[0,.22,0]],
  ['university-campus.glb','University campus',[-2.28,1.45,-2.04],[2.12,2.12,2.12],[0,.12,0]],
  ['college-campus.glb','College campus',[-.72,1.45,-2],[1.9,1.9,1.9],[0,-.14,0]],
];

async function loadModel([file,name,pos,scale,rot]){
  const gltf=await loader.loadAsync(`assets/${file}`); const o=receive(gltf.scene); o.name=name;
  if(stories[name]){o.userData.story=stories[name];interactiveRoots.push(o)}
  if(name==='College campus')brightenTexturedModel(o,.32);
  o.position.set(...pos);o.scale.set(...scale);o.rotation.set(...rot);world.add(o);return o;
}

async function init(){
  try{await Promise.all(specs.map(loadModel)); loading.classList.add('done'); setTimeout(()=>loading.remove(),500)}
  catch(err){console.error(err);loading.remove();errorBox.hidden=false;errorBox.textContent='The 3D models could not load. Run this project through a local web server (see README.md).'}
}

function pickStoryRoot(event){
  const rect=canvas.getBoundingClientRect();
  pointer.x=(event.clientX-rect.left)/rect.width*2-1;
  pointer.y=-(event.clientY-rect.top)/rect.height*2+1;
  raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObjects(interactiveRoots,true)[0];
  let object=hit?.object;
  while(object&&object!==world){
    if(object.userData.story)return object;
    object=object.parent;
  }
  return null;
}

function showStory(story){
  storyKicker.textContent=story.label;
  storyTitle.textContent=story.title;
  storyCopy.textContent=story.copy;
  storyPanel.hidden=false;
  app.classList.add('is-focused');
}

function animateCamera(position,target,onComplete){
  cameraTween={
    started:performance.now(),duration:900,
    fromPosition:camera.position.clone(),toPosition:position.clone(),
    fromTarget:controls.target.clone(),toTarget:target.clone(),onComplete,
  };
  controls.enabled=false;
}

function focusObject(root){
  const bounds=new THREE.Box3().setFromObject(root);
  const sphere=bounds.getBoundingSphere(new THREE.Sphere());
  const size=bounds.getSize(new THREE.Vector3());
  if(!Number.isFinite(sphere.radius)||sphere.radius<=0)return;
  focusedRoot=root;
  hoverLabel.hidden=true;
  controls.autoRotate=false;
  const verticalFov=THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov=2*Math.atan(Math.tan(verticalFov/2)*camera.aspect);
  const verticalFit=(size.y*.5)/Math.tan(verticalFov*.5);
  const horizontalFit=(size.x*.5)/Math.tan(horizontalFov*.5);
  const distance=Math.max(Math.max(verticalFit,horizontalFit)*1.22+size.z*.35,2.4);
  const direction=camera.position.clone().sub(controls.target).normalize();
  const target=sphere.center.clone();
  target.y-=size.y*.08;
  const position=target.clone().add(direction.multiplyScalar(distance));
  showStory(root.userData.story);
  animateCamera(position,target,()=>{controls.enabled=true});
}

function returnToFullScene(){
  hoverLabel.hidden=true;
  storyPanel.hidden=true;
  app.classList.remove('is-focused');
  focusedRoot=null;
  animateCamera(home.position,home.target,()=>{controls.enabled=true;controls.autoRotate=true});
}

canvas.addEventListener('pointermove',event=>{
  if(pointerDown||focusedRoot||event.pointerType==='touch'){hoverLabel.hidden=true;return}
  const root=pickStoryRoot(event);
  canvas.style.cursor=root?'pointer':'grab';
  if(!root){hoverLabel.hidden=true;return}
  const rect=app.getBoundingClientRect();
  hoverLabel.textContent=root.userData.story.label;
  hoverLabel.style.left=`${Math.min(Math.max(event.clientX-rect.left,70),rect.width-70)}px`;
  hoverLabel.style.top=`${Math.max(event.clientY-rect.top,48)}px`;
  hoverLabel.hidden=false;
});
canvas.addEventListener('pointerleave',()=>{hoverLabel.hidden=true;canvas.style.cursor='grab'});
canvas.addEventListener('pointerdown',event=>{
  pointerDown={x:event.clientX,y:event.clientY};
  hoverLabel.hidden=true;
});
canvas.addEventListener('pointerup',event=>{
  const start=pointerDown;pointerDown=null;
  if(!start||Math.hypot(event.clientX-start.x,event.clientY-start.y)>7)return;
  const root=pickStoryRoot(event);
  if(root)focusObject(root);
});
canvas.addEventListener('pointercancel',()=>{pointerDown=null});
document.querySelector('#reset').addEventListener('click',returnToFullScene);
closeStory.addEventListener('click',returnToFullScene);
let hinted=false;controls.addEventListener('start',()=>{if(!hinted){document.querySelector('#hint').style.opacity=.25;hinted=true}});
let portraitMode;
function resize(){
  const w=canvas.clientWidth,h=canvas.clientHeight,portrait=w/h<.8;
  renderer.setSize(w,h,false);camera.aspect=w/h;
  if(portraitMode!==portrait&&!focusedRoot){
    portraitMode=portrait;
    home.position.set(portrait?.15:7.1,portrait?3.7:5.3,portrait?15.5:13.2);
    home.target.set(0,portrait?3.35:2.65,.1);
    camera.position.copy(home.position);controls.target.copy(home.target);controls.update();
  }
  camera.updateProjectionMatrix();
}
function frame(time){
  resize();
  if(cameraTween){
    const progress=Math.min((time-cameraTween.started)/cameraTween.duration,1);
    const eased=progress<.5?4*progress**3:1-(-2*progress+2)**3/2;
    camera.position.lerpVectors(cameraTween.fromPosition,cameraTween.toPosition,eased);
    controls.target.lerpVectors(cameraTween.fromTarget,cameraTween.toTarget,eased);
    camera.lookAt(controls.target);
    if(progress===1){
      const complete=cameraTween.onComplete;
      cameraTween=null;
      complete?.();
    }
  }else controls.update();
  renderer.render(scene,camera);requestAnimationFrame(frame);
}
init();requestAnimationFrame(frame);
