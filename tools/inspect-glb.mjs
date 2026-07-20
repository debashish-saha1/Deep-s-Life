import fs from 'node:fs';

function mul(a, b) {
  const o = Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++)
    for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
}
function trs(n) {
  if (n.matrix) return n.matrix;
  const t=n.translation||[0,0,0], s=n.scale||[1,1,1], q=n.rotation||[0,0,0,1];
  const [x,y,z,w]=q, x2=x+x,y2=y+y,z2=z+z, xx=x*x2,xy=x*y2,xz=x*z2, yy=y*y2,yz=y*z2,zz=z*z2, wx=w*x2,wy=w*y2,wz=w*z2;
  return [(1-(yy+zz))*s[0],(xy+wz)*s[0],(xz-wy)*s[0],0,(xy-wz)*s[1],(1-(xx+zz))*s[1],(yz+wx)*s[1],0,(xz+wy)*s[2],(yz-wx)*s[2],(1-(xx+yy))*s[2],0,t[0],t[1],t[2],1];
}
function point(m,p){return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]]}
const I=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
for (const file of process.argv.slice(2)) {
  const b=fs.readFileSync(file), len=b.readUInt32LE(12), json=JSON.parse(b.subarray(20,20+len).toString().replace(/\0/g,''));
  let lo=[Infinity,Infinity,Infinity], hi=[-Infinity,-Infinity,-Infinity];
  function visit(i,parent){const n=json.nodes[i], world=mul(parent,trs(n)); if(n.mesh!=null) for(const p of json.meshes[n.mesh].primitives){const a=json.accessors[p.attributes.POSITION]; if(!a?.min||!a?.max)continue; for(const X of [a.min[0],a.max[0]])for(const Y of [a.min[1],a.max[1]])for(const Z of [a.min[2],a.max[2]]){const v=point(world,[X,Y,Z]); for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],v[k]);hi[k]=Math.max(hi[k],v[k]);}}} for(const c of n.children||[])visit(c,world)}
  const roots=json.scenes?.[json.scene||0]?.nodes||json.nodes.map((_,i)=>i).filter(i=>!json.nodes.some(n=>n.children?.includes(i))); for(const r of roots)visit(r,I);
  console.log(JSON.stringify({file, nodes:json.nodes.length, meshes:json.meshes?.length||0, materials:json.materials?.length||0, min:lo,max:hi,size:hi.map((v,i)=>+(v-lo[i]).toFixed(3))},null,2));
}
