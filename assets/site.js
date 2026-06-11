(function(){
  const canvas = document.getElementById("helios-bg");
  if(!canvas) return;

  const ctx = canvas.getContext("2d", { alpha:false });

  let w = 1;
  let h = 1;
  let dpr = 1;
  let t = 0;
  let last = performance.now();

  let stars = [];
  let photons = [];
  let rings = [];

  const TAU = Math.PI * 2;

  function rand(a,b){
    return a + Math.random() * (b - a);
  }

  function hue(v){
    return ((v % 360) + 360) % 360;
  }

  function resize(){
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.setTransform(dpr,0,0,dpr,0,0);

    const count = Math.min(380, Math.floor((w*h)/5200));

    stars = Array.from({length:count}, () => ({
      x:Math.random()*w,
      y:Math.random()*h,
      r:rand(.12,1.5),
      a:rand(.05,.55),
      h:rand(180,340),
      p:rand(0,TAU)
    }));

    rings = Array.from({length:10}, (_,i) => ({
      r:Math.min(w,h) * (0.10 + i*.052),
      rot:rand(0,TAU),
      s:rand(.012,.043) * (i%2 ? -1 : 1),
      h:hue(i*38+40)
    }));

    photons = [];
    for(let i=0;i<190;i++){
      spawnPhoton(true);
    }
  }

  function spawnPhoton(random){
    photons.push({
      a:rand(0,TAU),
      r:random ? rand(20,Math.min(w,h)*.54) : rand(10,80),
      s:rand(.30,1.35),
      h:rand(0,360),
      life:random ? rand(0,1) : 0,
      dir:Math.random() < .5 ? -1 : 1
    });

    if(photons.length > 280){
      photons.shift();
    }
  }

  function drawBackground(){
    const g = ctx.createRadialGradient(w/2,h*.47,0,w/2,h*.50,Math.max(w,h)*.74);

    g.addColorStop(0,"#0a1c31");
    g.addColorStop(.28,"#061324");
    g.addColorStop(.62,"#020713");
    g.addColorStop(1,"#01030a");

    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for(const s of stars){
      const alpha = s.a * (.52 + .48 * Math.sin(t*1.2 + s.p));
      ctx.fillStyle = `hsla(${s.h},95%,72%,${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.r,0,TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawFieldLines(){
    const cx = w/2;
    const cy = h*.47;
    const R = Math.min(w,h) * .50;

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    for(let i=0;i<42;i++){
      const a = i * TAU / 42 + t*.018;
      const x1 = cx + Math.cos(a) * R*.20;
      const y1 = cy + Math.sin(a) * R*.20;
      const x2 = cx + Math.cos(a + Math.sin(t+i)*.18) * R*1.05;
      const y2 = cy + Math.sin(a + Math.sin(t+i)*.18) * R*1.05;
      const mx = cx + Math.cos(a+t*.20) * R*.64;
      const my = cy + Math.sin(a+t*.20) * R*.64;

      ctx.strokeStyle = `hsla(${hue(i*10+t*24)},100%,72%,.055)`;
      ctx.lineWidth = .75;
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.quadraticCurveTo(mx,my,x2,y2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawRings(){
    const cx = w/2;
    const cy = h*.47;
    const R = Math.min(w,h)*.47;

    ctx.save();
    ctx.translate(cx,cy);
    ctx.globalCompositeOperation = "screen";

    for(let i=0;i<rings.length;i++){
      const ring = rings[i];

      ctx.save();
      ctx.rotate(ring.rot + t*ring.s);

      ctx.strokeStyle = `hsla(${hue(ring.h+t*18)},100%,72%,${.07+i*.012})`;
      ctx.lineWidth = i%3===0 ? 1.4 : .65;
      ctx.beginPath();
      ctx.arc(0,0,ring.r,0,TAU);
      ctx.stroke();

      for(let d=0; d<360; d += i%2 ? 15 : 10){
        const a = d * Math.PI / 180;
        const from = ring.r * (i%2 ? .965 : .985);
        const to = ring.r * (i%2 ? 1.035 : 1.055);

        ctx.strokeStyle = `hsla(${hue(d+i*30+t*22)},100%,72%,${i%3===0?.28:.14})`;
        ctx.lineWidth = i%3===0 ? .9 : .45;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a)*from, Math.sin(a)*from);
        ctx.lineTo(Math.cos(a)*to, Math.sin(a)*to);
        ctx.stroke();
      }

      ctx.restore();
    }

    for(let arm=0; arm<20; arm++){
      ctx.beginPath();

      for(let p=0; p<=150; p++){
        const n = p/150;
        const a = arm*TAU/20 + n*4.9 + t*(.29+arm*.004);
        const r = R * (n*n);
        const x = Math.cos(a)*r;
        const y = Math.sin(a)*r;

        if(p===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
      }

      ctx.strokeStyle = `hsla(${hue(arm*24+t*72)},100%,66%,${.12+Math.sin(t+arm)*.025})`;
      ctx.lineWidth = 1.25;
      ctx.stroke();
    }

    for(let flower=0; flower<6; flower++){
      ctx.save();
      ctx.rotate(t*(flower%2?-.045:.035)+flower*TAU/6);

      const lobes = 12 + flower*4;
      const rad = R * (.18 + flower*.065);

      for(let l=0;l<lobes;l++){
        ctx.save();
        ctx.rotate(l*TAU/lobes);

        ctx.strokeStyle = `hsla(${hue(l*360/lobes+flower*40+t*40)},100%,72%,${.055+flower*.014})`;
        ctx.lineWidth = .65;
        ctx.beginPath();

        for(let p=0;p<=90;p++){
          const n = p/90;
          const a = n*TAU*(1.08+flower*.04);
          const rr = rad * (.25+.75*Math.sin(n*Math.PI));
          const x = Math.cos(a)*rr;
          const y = Math.sin(a)*rr*.45;

          if(p===0) ctx.moveTo(x,y);
          else ctx.lineTo(x,y);
        }

        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }

    const core = ctx.createRadialGradient(0,0,0,0,0,R*.18);
    core.addColorStop(0,"rgba(255,255,255,.95)");
    core.addColorStop(.18,"rgba(255,215,90,.72)");
    core.addColorStop(.40,"rgba(72,245,255,.32)");
    core.addColorStop(.72,"rgba(255,85,203,.12)");
    core.addColorStop(1,"rgba(0,0,0,0)");

    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0,0,R*.18,0,TAU);
    ctx.fill();

    ctx.restore();
  }

  function drawPhotons(dt){
    const cx = w/2;
    const cy = h*.47;
    const maxR = Math.min(w,h) * .56;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for(let i=photons.length-1;i>=0;i--){
      const p = photons[i];

      p.life += dt*.08*p.s;
      p.a += dt*.22*p.dir*p.s;
      p.r += dt*48*p.s;

      if(p.life>1 || p.r>maxR){
        photons.splice(i,1);
        spawnPhoton(false);
        continue;
      }

      const wave = Math.sin(t*2+p.a*3)*18*Math.sin(p.life*Math.PI);
      const x = cx + Math.cos(p.a)*p.r + Math.cos(p.a+Math.PI/2)*wave;
      const y = cy + Math.sin(p.a)*p.r + Math.sin(p.a+Math.PI/2)*wave;

      const tailR = Math.max(0,p.r-26);
      const tx = cx + Math.cos(p.a)*tailR;
      const ty = cy + Math.sin(p.a)*tailR;

      const alpha = (1-p.life)*.65;
      const col = hue(p.h+t*50+p.r*.08);

      ctx.strokeStyle = `hsla(${col},100%,72%,${alpha*.28})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(tx,ty);
      ctx.lineTo(x,y);
      ctx.stroke();

      const g = ctx.createRadialGradient(x,y,0,x,y,9);
      g.addColorStop(0,"rgba(255,255,255,.95)");
      g.addColorStop(.22,`hsla(${col},100%,76%,${alpha})`);
      g.addColorStop(.62,`hsla(${hue(col+55)},100%,66%,${alpha*.28})`);
      g.addColorStop(1,"rgba(0,0,0,0)");

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x,y,3.2,0,TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  function frame(now){
    const dt = Math.min(.05,(now-last)/1000);
    last = now;
    t += dt;

    drawBackground();
    drawFieldLines();
    drawRings();
    drawPhotons(dt);

    requestAnimationFrame(frame);
  }

  window.addEventListener("resize",resize,{passive:true});

  resize();
  requestAnimationFrame(frame);
})();
