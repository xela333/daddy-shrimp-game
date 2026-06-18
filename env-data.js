/* Daddy Shrimp — environment: background, jiggly kelp/coral/rock/urchin (+ depth layers), layered jellyfish, algae & bubble sprites. Anemones are gameplay objects (world.anemones). */
(function(){
  window.ENV={ready:false,img:{}};
  var names=["kelp1","kelp2","kelp3","kelp4","kelp5","anem1","anem2","anem3","anem4","anem5","anem6",
   "coral1","coral2","coral3","rock1","rock2","rock3","rock4","rock5","urchin1","urchin2","urchin3","urchin4",
   "algae1","algae2","algae3","algae4","algae5","algae6","bubble1","bubble2","bubble3","bubble4","bubble5","bubble6",
   "jelly_bell","jelly_t1","jelly_t2","jelly_t3","background"];
  var n=0,done=function(){if(++n>=names.length)ENV.ready=true;};
  names.forEach(function(k){var im=new Image();im.onload=done;im.onerror=done;im.src="assets/env/"+k+".png";ENV.img[k]=im;});
})();
var JB={w:300,h:412,bcx:149.8,bcy:108.4,t:[{k:"jelly_t1",px:95.7,py:225.5},{k:"jelly_t2",px:156.4,py:232.2},{k:"jelly_t3",px:222.4,py:226.8}]};
function _ok(im){return im&&im.complete&&im.naturalWidth>0;}
ENV.drawBackground=function(ctx,camX,camY,W,Hh){
  return false; // dark mode: use solid black
  var bg=ENV.img.background; if(!_ok(bg))return false;
  var s=Math.max(W/bg.naturalWidth,Hh/bg.naturalHeight)*1.12;
  var bw=bg.naturalWidth*s, bh=bg.naturalHeight*s;
  var ox=((-camX*0.05)%bw+bw)%bw-bw, oy=((-camY*0.05)%bh+bh)%bh-bh;
  for(var xx=ox;xx<W;xx+=bw)for(var yy=oy;yy<Hh;yy+=bh)ctx.drawImage(bg,xx,yy,bw,bh);
  return true;
};
ENV.genDecor=function(W,H){
  var d=[]; function R(a,b){return a+Math.random()*(b-a);}
  function add(kind,k,x,y,h,sway,fg){d.push({kind:kind,k:k,x:x,y:y,h:h,phase:Math.random()*7,sway:sway,flip:Math.random()<0.5?-1:1,fg:!!fg});}
  for(var c=0;c<26;c++){            // kelp clusters
    var cx=R(150,W-150),cy=R(150,H-150),count=2+Math.floor(Math.random()*5);
    for(var i=0;i<count;i++) add("kelp","kelp"+(1+Math.floor(Math.random()*5)),cx+R(-170,170),cy+R(-120,120),R(160,320),0.10, Math.random()<0.45);
  }
  for(var i=0;i<24;i++)add("coral","coral"+(1+Math.floor(Math.random()*3)),R(100,W-100),R(100,H-100),R(95,160),0.05,false);
  for(var i=0;i<30;i++)add("rock","rock"+(1+Math.floor(Math.random()*5)),R(100,W-100),R(100,H-100),R(70,150),0,false);
  for(var i=0;i<18;i++)add("urchin","urchin"+(1+Math.floor(Math.random()*4)),R(100,W-100),R(100,H-100),R(55,100),0,false);
  d.sort(function(a,b){return a.y-b.y;});
  return d;
};
ENV.drawDecor=function(ctx,decor,t,inView,layer){
  var front = layer==="front";
  for(var n=0;n<decor.length;n++){var it=decor[n]; if((!!it.fg)!==front) continue; if(inView&&!inView(it.x,it.y,it.h))continue;
    var im=ENV.img[it.k]; if(!_ok(im))continue;
    var sc=it.h/im.naturalHeight, w=im.naturalWidth*sc, h=it.h;
    ctx.save(); ctx.translate(it.x,it.y);
    if(it.kind==="urchin"){ctx.scale(it.flip,1);ctx.drawImage(im,-w/2,-h*0.7,w,h);}
    else{var ang=it.sway?Math.sin(t*1.3+it.phase)*it.sway:0; ctx.rotate(ang); ctx.scale(it.flip,1); ctx.drawImage(im,-w/2,-h,w,h);}
    ctx.restore();
  }
};
ENV.drawBubbles=function(ctx,bubbles,W,Hh){
  for(var i=0;i<bubbles.length;i++){var b=bubbles[i]; b.y-=b.s; if(b.y<-0.06)b.y=1.06;
    var im=ENV.img[b.k]; if(_ok(im)){var d=b.r*2; ctx.globalAlpha=0.7; ctx.drawImage(im,b.x*W-b.r,b.y*Hh-b.r,d,d); ctx.globalAlpha=1;}
    else{ctx.fillStyle="#ffffff44";ctx.beginPath();ctx.arc(b.x*W,b.y*Hh,b.r,0,7);ctx.fill();}
  }
};
ENV.drawAlgae=function(ctx,al,r,t){
  var im=ENV.img["algae"+(al.v||1)]; if(!_ok(im)){ctx.fillStyle="hsl("+al.hue+",65%,55%)";ctx.beginPath();ctx.arc(al.x,al.y,r+2,0,7);ctx.fill();return;}
  var w=Math.max(16,r*3.4), h=w*(im.naturalHeight/im.naturalWidth);
  ctx.drawImage(im,al.x-w/2,al.y-h/2+Math.sin(t*2+al.x*0.05)*1.5,w,h);
};
ENV.drawAnemone=function(ctx,a,t){
  var im=ENV.img["anem"+(a.v||1)]; if(!_ok(im)){ctx.fillStyle="#ffb3c7aa";ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,7);ctx.fill();return;}
  var h=a.r*2.3, w=h*(im.naturalWidth/im.naturalHeight);   // sized so the sprite covers the hide circle top-to-bottom
  ctx.save(); ctx.globalAlpha=0.97; ctx.translate(a.x, a.y + h*0.40);
  ctx.rotate(Math.sin(t*1.2+a.x*0.01)*0.05); ctx.drawImage(im,-w/2,-h,w,h); ctx.globalAlpha=1; ctx.restore();
};
ENV.drawJelly=function(ctx,j,r,t){
  var bell=ENV.img.jelly_bell; if(!_ok(bell))return false;
  var sc=(r*2.6)/JB.w;
  ctx.save(); ctx.translate(j.x,j.y); ctx.scale(sc,sc); ctx.translate(-JB.bcx,-JB.bcy);
  for(var i=0;i<JB.t.length;i++){var tt=JB.t[i],im=ENV.img[tt.k]; if(!_ok(im))continue;
    ctx.save(); ctx.translate(tt.px,tt.py); ctx.rotate(Math.sin(t*2.0+(j.phase||0)+i)*0.20); ctx.translate(-tt.px,-tt.py);
    ctx.drawImage(im,0,0,JB.w,JB.h); ctx.restore();}
  ctx.drawImage(bell,0,0,JB.w,JB.h);
  ctx.restore(); return true;
};
