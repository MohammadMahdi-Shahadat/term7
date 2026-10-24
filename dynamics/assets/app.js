/* ===== Dynamical Systems study notes — shared engine ===== */
(function(){
"use strict";

/* ---------- course plan ---------- */
const SESSIONS = [
  {n:1,  part:"الف", title:"سیستم دینامیکی، مدار و نقطه‌ی تناوبی", built:true},
  {n:2,  part:"الف", title:"پیش‌تصویر، grand orbit و دینامیک‌های متناهی", built:true},
  {n:3,  part:"الف", title:"مزدوج بودن: همان دینامیک با برچسب دیگر", built:true},
  {n:4,  part:"الف", title:"نقطه‌ی ثابت جاذب و دافع، محک مشتق", built:true},
  {n:5,  part:"الف", title:"مدار تناوبی، ضریب مدار و نمای لیاپانوف", built:true},
  {n:6,  part:"ب",   title:"خانواده‌ی لجستیک: نقاط ثابت و اولین بازه‌های پارامتر", built:true},
  {n:7,  part:"ب",   title:"انشعاب زینی و برگردان؛ خانواده‌ی x²+c", built:true},
  {n:8,  part:"ب",   title:"نمودار انشعاب، آبشار دوبرابرشدن و فایگنباوم", built:true},
  {n:9,  part:"ب",   title:"دوره‌ی ۳ و قضیه‌ی شارکوفسکی", built:true},
  {n:10, part:"ب",   title:"نگاشت خیمه و نگاشت اولام؛ فضای پارامترها", built:true},
  {n:11, part:"ب",   title:"حل کامل کارگاه ۱ و آزمون جامع یک‌بعدی", built:true},
  {n:12, part:"ج",   title:"نگاشت‌های خطی صفحه (۱): مقادیر ویژه و رده‌بندی", built:false},
  {n:13, part:"ج",   title:"نگاشت‌های خطی صفحه (۲): trace–det، حفظ مساحت، نگاشت گربه", built:false},
  {n:14, part:"ج",   title:"نگاشت غیرخطی صفحه: ژاکوبین و خطی‌سازی", built:false},
  {n:15, part:"ج",   title:"نگاشت هنون", built:false},
  {n:16, part:"د",   title:"(بسته به کلاس) دوران دایره و هم‌توزیعی", built:false},
  {n:17, part:"د",   title:"(بسته به کلاس) دینامیک نمادین", built:false},
  {n:18, part:"د",   title:"(بسته به کلاس) آشوب و آنتروپی توپولوژیک", built:false},
  {n:19, part:"د",   title:"(بسته به کلاس) دینامیک مختلط یا معادلات دیفرانسیل", built:false},
  {n:20, part:"د",   title:"مرور نهایی و امتحان آزمایشی", built:false},
];
const PARTS = {"الف":"پایه‌ها","ب":"دینامیک یک‌بعدی و لجستیک","ج":"دینامیک دوبعدی","د":"ادامه‌ی ترم"};
const fa = n => String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
const pad = n => String(n).padStart(2,"0");
const fileOf = n => `session-${pad(n)}.html`;

/* ---------- storage (best effort) ---------- */
const KEY = "dynsys.progress.v1";
function loadProg(){ try{ return JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){ return {}; } }
function saveProg(p){ try{ localStorage.setItem(KEY, JSON.stringify(p)); }catch(e){} }

/* ---------- theme ---------- */
function getTheme(){ try{ return localStorage.getItem("dynsys.theme"); }catch(e){ return null; } }
function applyTheme(t){ if(t) document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme"); }
applyTheme(getTheme());
function toggleTheme(){
  const dark = document.documentElement.getAttribute("data-theme")==="dark" ||
    (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
  const t = dark ? "light" : "dark";
  applyTheme(t); try{ localStorage.setItem("dynsys.theme", t); }catch(e){}
  document.querySelectorAll("[data-redraw]").forEach(el=>el._redraw && el._redraw());
}

/* ---------- page chrome ---------- */
function buildChrome(){
  const sn = +document.body.dataset.session || 0;
  const s = SESSIONS.find(x=>x.n===sn);
  const bar = document.createElement("div");
  bar.className = "topbar";
  bar.innerHTML = `<div class="in"><a class="home" href="index.html">⌂ سیستم‌های دینامیکی</a>
    <span class="crumb">${s ? `جلسه‌ی ${fa(sn)} · ${s.title}` : ""}</span>
    <button type="button" id="themeBtn" title="تغییر تم">◐ تم</button></div><div class="progressbar"></div>`;
  document.body.prepend(bar);
  bar.querySelector("#themeBtn").onclick = toggleTheme;
  const pb = bar.querySelector(".progressbar");
  addEventListener("scroll", ()=>{ const h=document.documentElement; pb.style.width = (100*h.scrollTop/Math.max(1,h.scrollHeight-h.clientHeight))+"%"; }, {passive:true});

  // TOC
  const toc = document.querySelector("nav.toc");
  if(toc){
    document.querySelectorAll("main section[id] > h2").forEach(h=>{
      const a=document.createElement("a"); a.href="#"+h.parentElement.id;
      a.textContent = h.dataset.short || h.textContent.replace(/هسته‌ی اصلی|مسیر تکمیلی/g,"").trim();
      toc.appendChild(a);
    });
  }
  if(!s) return;
  // done bar + pager
  const main = document.querySelector("main");
  const prog = loadProg();
  const done = document.createElement("div");
  done.className="donebar";
  const isDone = prog[sn] && prog[sn].done;
  done.innerHTML = `<span>این جلسه را تمام کردی؟ وقتی تست را زدی و تمرین‌های اصلی را بدون نگاه به راه‌حل حل کردی، علامت بزن.</span>
     <button class="btn${isDone?" ghost":""}" type="button">${isDone?"✓ تمام شده (برگرداندن)":"علامت‌گذاری: تمام شد"}</button>`;
  done.querySelector("button").onclick = (e)=>{
    const p = loadProg(); p[sn] = p[sn]||{}; p[sn].done = !p[sn].done; saveProg(p);
    e.target.textContent = p[sn].done ? "✓ تمام شده (برگرداندن)" : "علامت‌گذاری: تمام شد";
    e.target.classList.toggle("ghost", p[sn].done);
  };
  main.appendChild(done);
  const prev = SESSIONS.find(x=>x.n===sn-1), next = SESSIONS.find(x=>x.n===sn+1);
  const pager = document.createElement("div"); pager.className="pager";
  pager.innerHTML = (prev?`<a href="${fileOf(prev.n)}"><small>→ جلسه‌ی قبل</small>${fa(prev.n)}. ${prev.title}</a>`:`<a href="index.html"><small>→</small>فهرست</a>`) +
    (next && next.built ? `<a href="${fileOf(next.n)}" style="text-align:left"><small>جلسه‌ی بعد ←</small>${fa(next.n)}. ${next.title}</a>` : `<a href="index.html" style="text-align:left"><small>←</small>فهرست جلسه‌ها</a>`);
  main.appendChild(pager);
}

/* ---------- quiz ---------- */
function buildQuiz(){
  const host = document.querySelector(".quiz");
  if(!host || !window.QUIZ) return;
  const sn = +document.body.dataset.session || 0;
  const Q = window.QUIZ;
  let answered = 0, correct = 0;
  const score = document.createElement("div"); score.className="score";
  const upd = ()=>{
    score.innerHTML = `<span>امتیاز: ${fa(correct)} از ${fa(Q.length)}</span><span style="color:var(--ink-3);font-weight:500">پاسخ‌داده: ${fa(answered)}</span><button class="btn ghost" type="button">از نو</button>`;
    score.querySelector("button").onclick = ()=>{ host.innerHTML=""; buildQuizReset(); };
    if(answered===Q.length && sn){ const p=loadProg(); p[sn]=p[sn]||{}; const best=p[sn].quiz?p[sn].quiz[0]:-1; if(correct>best) p[sn].quiz=[correct,Q.length]; saveProg(p); }
  };
  function buildQuizReset(){ window.__quizBuilt=false; buildQuiz(); renderMath(host); }
  Q.forEach((it,i)=>{
    const d = document.createElement("div"); d.className="qitem";
    d.innerHTML = `<div class="qhead"><span class="qn">${fa(i+1)}.</span>${it.q}</div><div class="opts"></div><div class="fb"></div>`;
    const opts = d.querySelector(".opts"), fb = d.querySelector(".fb");
    it.o.forEach((t,j)=>{
      const b=document.createElement("button"); b.type="button"; b.className="opt"; b.innerHTML=`<b>${"الف ب ج د ه و".split(" ")[j]})</b> ${t}`;
      b.onclick=()=>{
        opts.querySelectorAll("button").forEach((x,k)=>{ x.disabled=true; if(k===it.a) x.classList.add("correct"); });
        const ok = j===it.a; if(!ok) b.classList.add("wrong");
        answered++; if(ok) correct++;
        fb.innerHTML = `<b class="${ok?"ok":"no"}">${ok?"درست!":"نه دقیقاً."}</b> ${it.e||""}`; fb.style.display="block";
        upd();
      };
      opts.appendChild(b);
    });
    host.appendChild(d);
  });
  host.appendChild(score); upd();
}

/* ---------- math ---------- */
function renderMath(root){
  if(window.renderMathInElement){
    renderMathInElement(root||document.body,{delimiters:[
      {left:"$$",right:"$$",display:true},{left:"\\[",right:"\\]",display:true},
      {left:"$",right:"$",display:false},{left:"\\(",right:"\\)",display:false}],
      throwOnError:false, strict:"ignore", ignoredTags:["script","noscript","style","textarea","pre","code","option","select","input"]});
  }
}

/* ======================================================================
   Plotting
   ====================================================================== */
function css(v){ return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
function niceStep(range){ const raw=range/6, p=Math.pow(10,Math.floor(Math.log10(raw))), m=raw/p; return (m<1.5?1:m<3?2:m<7?5:10)*p; }
function fmt(x,d=4){ if(!isFinite(x)) return String(x); const s=Math.abs(x)<1e-12?"0":(+x.toFixed(d)).toString(); return s; }

class Plot{
  constructor(canvas, view){
    this.c=canvas; this.ctx=canvas.getContext("2d"); this.v=Object.assign({},view);
    this.pad={l:34,r:10,t:10,b:24};
    this.resize();
  }
  resize(){
    const r=this.c.getBoundingClientRect(), dpr=window.devicePixelRatio||1;
    const w=Math.max(200,Math.round(r.width)), h=Math.max(120,Math.round(r.height||r.width));
    this.c.width=w*dpr; this.c.height=h*dpr; this.w=w; this.h=h; this.ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  X(x){ const v=this.v; return this.pad.l+(x-v.xmin)/(v.xmax-v.xmin)*(this.w-this.pad.l-this.pad.r); }
  Y(y){ const v=this.v; return this.h-this.pad.b-(y-v.ymin)/(v.ymax-v.ymin)*(this.h-this.pad.t-this.pad.b); }
  invX(px){ const v=this.v; return v.xmin+(px-this.pad.l)/(this.w-this.pad.l-this.pad.r)*(v.xmax-v.xmin); }
  invY(py){ const v=this.v; return v.ymin+(this.h-this.pad.b-py)/(this.h-this.pad.t-this.pad.b)*(v.ymax-v.ymin); }
  clear(){ const g=this.ctx; g.fillStyle=css("--plot-bg"); g.fillRect(0,0,this.w,this.h); }
  axes(opt={}){
    const g=this.ctx,v=this.v; g.save(); g.font="11px Vazirmatn, sans-serif"; g.fillStyle=css("--ink-3");
    const sx=opt.sx||niceStep(v.xmax-v.xmin), sy=opt.sy||niceStep(v.ymax-v.ymin);
    g.strokeStyle=css("--plot-grid"); g.lineWidth=1;
    for(let x=Math.ceil(v.xmin/sx)*sx;x<=v.xmax+1e-12;x+=sx){ const X=this.X(x); g.beginPath(); g.moveTo(X,this.pad.t); g.lineTo(X,this.h-this.pad.b); g.stroke(); g.textAlign="center"; g.fillText(fmt(x,3),X,this.h-this.pad.b+14); }
    for(let y=Math.ceil(v.ymin/sy)*sy;y<=v.ymax+1e-12;y+=sy){ const Y=this.Y(y); g.beginPath(); g.moveTo(this.pad.l,Y); g.lineTo(this.w-this.pad.r,Y); g.stroke(); g.textAlign="right"; g.fillText(fmt(y,3),this.pad.l-4,Y+4); }
    g.strokeStyle=css("--plot-axis"); g.lineWidth=1.2;
    if(v.ymin<=0&&v.ymax>=0){ g.beginPath(); g.moveTo(this.pad.l,this.Y(0)); g.lineTo(this.w-this.pad.r,this.Y(0)); g.stroke(); }
    if(v.xmin<=0&&v.xmax>=0){ g.beginPath(); g.moveTo(this.X(0),this.pad.t); g.lineTo(this.X(0),this.h-this.pad.b); g.stroke(); }
    g.strokeRect(this.pad.l,this.pad.t,this.w-this.pad.l-this.pad.r,this.h-this.pad.t-this.pad.b);
    if(opt.xl){ g.textAlign="left"; g.fillText(opt.xl,this.w-this.pad.r-30,this.h-this.pad.b-4); }
    if(opt.yl){ g.textAlign="left"; g.fillText(opt.yl,this.pad.l+4,this.pad.t+12); }
    g.restore();
  }
  clip(){ const g=this.ctx; g.save(); g.beginPath(); g.rect(this.pad.l,this.pad.t,this.w-this.pad.l-this.pad.r,this.h-this.pad.t-this.pad.b); g.clip(); }
  unclip(){ this.ctx.restore(); }
  fn(f,color,width=1.8,samples){
    const g=this.ctx,v=this.v,N=samples||Math.max(400,this.w*2); this.clip();
    g.strokeStyle=color; g.lineWidth=width; g.beginPath(); let pen=false, py=null;
    for(let i=0;i<=N;i++){ const x=v.xmin+(v.xmax-v.xmin)*i/N, y=f(x);
      if(!isFinite(y)){ pen=false; continue; }
      const Y=this.Y(y);
      if(pen && py!==null && Math.abs(Y-py)>this.h*0.8){ pen=false; }
      if(!pen){ g.moveTo(this.X(x),Y); pen=true; } else g.lineTo(this.X(x),Y); py=Y; }
    g.stroke(); this.unclip();
  }
  line(x1,y1,x2,y2,color,width=1,alpha=1,dash){ const g=this.ctx; this.clip(); g.globalAlpha=alpha; g.strokeStyle=color; g.lineWidth=width; if(dash) g.setLineDash(dash); g.beginPath(); g.moveTo(this.X(x1),this.Y(y1)); g.lineTo(this.X(x2),this.Y(y2)); g.stroke(); g.setLineDash([]); g.globalAlpha=1; this.unclip(); }
  dot(x,y,r,color,stroke){ const g=this.ctx; this.clip(); g.fillStyle=color; g.beginPath(); g.arc(this.X(x),this.Y(y),r,0,7); g.fill(); if(stroke){ g.strokeStyle=stroke; g.lineWidth=1.5; g.stroke(); } this.unclip(); }
  diag(){ const v=this.v,a=Math.max(v.xmin,v.ymin),b=Math.min(v.xmax,v.ymax); this.line(a,a,b,b,css("--plot-diag"),1.3,1,[5,4]); }
}

/* ---------- function library ---------- */
const TAU=2*Math.PI;
const FN = {
  logistic:{name:"لجستیک  r·x(1−x)", f:(x,p)=>p.r*x*(1-x), df:(x,p)=>p.r*(1-2*x), dom:[0,1], ran:[0,1], params:[{k:"r",min:0,max:4,step:0.001,val:3.2}], tex:"f_r(x)=rx(1-x)"},
  quad:{name:"درجه‌دو  x²+c", f:(x,p)=>x*x+p.c, df:(x)=>2*x, dom:[-2,2], ran:[-2,2], params:[{k:"c",min:-2,max:0.5,step:0.001,val:-0.5}], tex:"Q_c(x)=x^2+c"},
  tent:{name:"خیمه  s·min(x,1−x)", f:(x,p)=>p.s*Math.min(x,1-x), df:(x,p)=>x<0.5?p.s:-p.s, dom:[0,1], ran:[0,1], params:[{k:"s",min:0,max:2,step:0.001,val:2}], tex:"T(x)=s\\min(x,1-x)"},
  affine:{name:"آفین  ax+b", f:(x,p)=>p.a*x+p.b, df:(x,p)=>p.a, dom:[-3,3], ran:[-3,3], params:[{k:"a",min:-2,max:2,step:0.01,val:0.5},{k:"b",min:-2,max:2,step:0.01,val:1}], tex:"f(x)=ax+b"},
  half:{name:"x/2", f:x=>x/2, df:()=>0.5, dom:[0,1], ran:[0,1], params:[], tex:"f(x)=x/2"},
  cubm:{name:"x − x³", f:x=>x-x*x*x, df:x=>1-3*x*x, dom:[-1,1], ran:[-1,1], params:[], tex:"f(x)=x-x^3"},
  cubp:{name:"x + x³", f:x=>x+x*x*x, df:x=>1+3*x*x, dom:[-1,1], ran:[-1,1], params:[], tex:"f(x)=x+x^3"},
  xx2:{name:"x + x²", f:x=>x+x*x, df:x=>1+2*x, dom:[-1.5,0.5], ran:[-1.5,0.5], params:[], tex:"f(x)=x+x^2"},
  cos:{name:"cos x", f:x=>Math.cos(x), df:x=>-Math.sin(x), dom:[0,1.6], ran:[0,1.6], params:[], tex:"f(x)=\\cos x"},
  newton:{name:"نیوتن برای √2:  x/2 + 1/x", f:x=>x/2+1/x, df:x=>0.5-1/(x*x), dom:[0.4,3], ran:[0.4,3], params:[], tex:"N(x)=\\tfrac{x}{2}+\\tfrac1x"},
  doubling:{name:"دوبرابرکردن  2x mod 1", f:x=>{const y=2*x; return y-Math.floor(y);}, df:()=>2, dom:[0,1], ran:[0,1], params:[], tex:"D(x)=2x \\bmod 1", mod:true},
  circ:{name:"دایره‌ای  4x + (a/2π)sin 2πx  mod 1", f:(x,p)=>{const y=4*x+p.a/TAU*Math.sin(TAU*x); return y-Math.floor(y);}, df:(x,p)=>4+p.a*Math.cos(TAU*x), dom:[0,1], ran:[0,1], params:[{k:"a",min:-6,max:6,step:0.01,val:2}], tex:"f_a(x)=4x+\\tfrac{a}{2\\pi}\\sin 2\\pi x \\pmod 1", mod:true},
  sq:{name:"x²", f:x=>x*x, df:x=>2*x, dom:[-1.5,1.5], ran:[-1.5,1.5], params:[], tex:"f(x)=x^2"},
};
function paramsOf(id, over){ const p={}; FN[id].params.forEach(q=>p[q.k]= (over&&over[q.k]!==undefined)?over[q.k]:q.val); return p; }
function iterN(F,p,x,n){ for(let i=0;i<n;i++) x=F.f(x,p); return x; }
function dIterN(F,p,x,n){ let d=1; for(let i=0;i<n;i++){ d*=F.df(x,p); x=F.f(x,p);} return d; }
/* fixed points of f^n on domain (numeric) */
function fixedPointsN(F,p,n,N=6000){
  const [a,b]=F.dom, g=x=>iterN(F,p,x,n)-x, out=[];
  let x0=a, g0=g(a);
  if(Math.abs(g0)<1e-10) out.push(a);
  for(let i=1;i<=N;i++){
    const x1=a+(b-a)*i/N, g1=g(x1);
    if(Math.abs(g1)<1e-12){ out.push(x1); }
    else if(g0*g1<0){
      let lo=x0,hi=x1,glo=g0;
      for(let k=0;k<70;k++){ const m=(lo+hi)/2, gm=g(m); if(glo*gm<=0){hi=m;} else {lo=m; glo=gm;} }
      const r=(lo+hi)/2; if(Math.abs(g(r))<1e-7) out.push(r);
    }
    x0=x1; g0=g1;
  }
  const uniq=[]; out.sort((u,v)=>u-v).forEach(r=>{ if(!uniq.length||Math.abs(r-uniq[uniq.length-1])>1e-7) uniq.push(r); });
  return uniq;
}
function minPeriod(F,p,x,n){ for(let k=1;k<=n;k++){ if(n%k===0 && Math.abs(iterN(F,p,x,k)-x)<1e-6) return k; } return n; }

/* ---------- small DOM helpers ---------- */
function h(tag,attrs,html){ const e=document.createElement(tag); if(attrs) for(const k in attrs){ if(k==="class") e.className=attrs[k]; else e.setAttribute(k,attrs[k]); } if(html!==undefined) e.innerHTML=html; return e; }
function slider(label,min,max,step,val,onInput){
  const L=h("label"); L.innerHTML=`${label} <input type="range" min="${min}" max="${max}" step="${step}" value="${val}"> <span class="val"></span>`;
  const inp=L.querySelector("input"), sp=L.querySelector(".val");
  const show=()=>{ sp.textContent=(+inp.value).toFixed(step<0.01?3:step<1?2:0); };
  inp.addEventListener("input",()=>{ show(); onInput(+inp.value); }); show();
  L.set=(v)=>{ inp.value=v; show(); }; L.get=()=>+inp.value; return L;
}
function onResize(el, fn){ let t; const ro=new ResizeObserver(()=>{ clearTimeout(t); t=setTimeout(fn,60); }); ro.observe(el); el.setAttribute("data-redraw",""); el._redraw=fn; }
function select(options,val,onChange){ const s=h("select"); options.forEach(([v,t])=>{ const o=h("option",{value:v},t); if(v===val) o.selected=true; s.appendChild(o); }); s.onchange=()=>onChange(s.value); return s; }

/* ======================================================================
   Widget: cobweb + time series
   data-fns="logistic,quad"  data-p='{"r":3.2}'  data-x0  data-n  data-ts="0"
   ====================================================================== */
function wCobweb(el){
  const ids=(el.dataset.fns||"logistic").split(",");
  let id=ids[0]; let P=paramsOf(id, el.dataset.p?JSON.parse(el.dataset.p):null);
  let x0=el.dataset.x0!==undefined?+el.dataset.x0:0.2, N=+(el.dataset.n||30), shown=N, extra=[];
  const showTS = el.dataset.ts!=="0";
  el.innerHTML = `<div class="wt">${el.dataset.title||"نمودار تارعنکبوتی (cobweb)"}</div><div class="wd">${el.dataset.desc||"روی نمودار سمت راست کلیک کن تا نقطه‌ی شروع x₀ عوض شود. «اجرا» مدار را گام‌به‌گام می‌کشد."}</div>
    <div class="canvases ${showTS?"":"one"}"><canvas class="cw"></canvas>${showTS?'<canvas class="ts"></canvas>':""}</div>
    <div class="controls c1"></div><div class="controls c2"></div>
    <div class="legend"><span><i style="background:var(--plot-fn)"></i>نمودار f</span><span><i style="background:var(--plot-diag)"></i>قطر y=x</span><span><i style="background:var(--plot-c1)"></i>مدار x₀</span><span><i style="background:var(--plot-c2)"></i>مدارهای نزدیک</span></div>
    <div class="readout"></div>`;
  const cw=new Plot(el.querySelector(".cw"),{}), ts=showTS?new Plot(el.querySelector(".ts"),{}):null;
  const c1=el.querySelector(".c1"), c2=el.querySelector(".c2"), ro=el.querySelector(".readout");
  let sliders={}, x0s, timer=null;
  function buildControls(){
    c1.innerHTML=""; sliders={};
    if(ids.length>1) c1.appendChild(Object.assign(h("label"),{innerHTML:"نگاشت: "})).appendChild(select(ids.map(i=>[i,FN[i].name]),id,v=>{ id=v; P=paramsOf(id); x0=(FN[id].dom[0]+FN[id].dom[1])/2+0.123*(FN[id].dom[1]-FN[id].dom[0]); extra=[]; buildControls(); reset(); }));
    FN[id].params.forEach(q=>{ const s=slider(q.k+" =",q.min,q.max,q.step,P[q.k],v=>{P[q.k]=v; reset();}); sliders[q.k]=s; c1.appendChild(s); });
    const [a,b]=FN[id].dom;
    x0s=slider("x₀ =",a,b,(b-a)/1000,x0,v=>{x0=v; extra=[]; reset();}); c1.appendChild(x0s);
    c2.innerHTML="";
    c2.appendChild(slider("تعداد گام n =",1,300,1,N,v=>{N=v; shown=N; draw();}));
    const bRun=h("button",{class:"btn",type:"button"},"▶ اجرا"); bRun.onclick=()=>{ if(timer){ stop(); return; } shown=0; bRun.textContent="⏸ توقف"; timer=setInterval(()=>{ shown++; draw(); if(shown>=N) stop(); }, Math.max(25,600/Math.sqrt(N))); };
    function stop(){ clearInterval(timer); timer=null; bRun.textContent="▶ اجرا"; }
    const bStep=h("button",{class:"btn ghost",type:"button"},"یک گام"); bStep.onclick=()=>{ if(shown>=N) shown=0; shown++; draw(); };
    const bNear=h("button",{class:"btn ghost",type:"button"},"+ مدار نزدیک (x₀+10⁻⁶)"); bNear.onclick=()=>{ extra.push(x0+1e-6*(extra.length+1)); draw(); };
    const bClr=h("button",{class:"btn ghost",type:"button"},"پاک کردن مدارهای نزدیک"); bClr.onclick=()=>{ extra=[]; draw(); };
    c2.append(bRun,bStep,bNear,bClr);
  }
  function reset(){ shown=N; draw(); }
  function orbit(x,n){ const F=FN[id], o=[x]; for(let i=0;i<n;i++){ x=F.f(x,P); o.push(x); } return o; }
  function draw(){
    const F=FN[id]; const [a,b]=F.dom, [ya,yb]=F.ran;
    cw.resize(); cw.v={xmin:a,xmax:b,ymin:ya,ymax:yb}; cw.clear(); cw.axes({xl:"x",yl:"f(x)"}); cw.diag(); cw.fn(x=>F.f(x,P),css("--plot-fn"),2);
    const orbs=[[x0,css("--plot-c1")]].concat(extra.map(e=>[e,css("--plot-c2")]));
    orbs.forEach(([s,col],k)=>{
      const o=orbit(s,shown);
      for(let i=0;i<o.length-1;i++){
        const al=Math.max(0.15, 1-(o.length-1-i)/60);
        cw.line(o[i],i===0?Math.max(ya,Math.min(yb,0)):o[i],o[i],o[i+1],col,1.2,al);
        if(!F.mod) cw.line(o[i],o[i+1],o[i+1],o[i+1],col,1.2,al);
        else { cw.line(o[i],o[i+1],o[i+1],o[i+1],col,1.0,al*0.7,[2,3]); }
      }
      cw.dot(o[0],Math.max(ya,Math.min(yb,0)),4,col);
      cw.dot(o[o.length-1],o[o.length-1],3.5,col,css("--plot-bg"));
    });
    if(ts){
      ts.resize(); ts.v={xmin:0,xmax:Math.max(10,N),ymin:ya,ymax:yb}; ts.clear(); ts.axes({xl:"n",yl:"xₙ"});
      orbs.forEach(([s,col])=>{ const o=orbit(s,shown);
        for(let i=0;i<o.length-1;i++) ts.line(i,o[i],i+1,o[i+1],col,1,0.5);
        o.forEach((y,i)=>ts.dot(i,y,i===o.length-1?3.5:2.2,col)); });
    }
    // readout
    const o=orbit(x0,shown); const last=o.slice(-6).map(v=>fmt(v,6)).join(", ");
    let lyap=0, cnt=0, xx=x0; for(let i=0;i<Math.max(shown,1);i++){ const d=Math.abs(F.df(xx,P)); lyap+= Math.log(d); cnt++; xx=F.f(xx,P); }
    const fps=fixedPointsN(F,P,1,3000).map(r=>{ const d=F.df(r,P); return `${fmt(r,5)} (f′=${fmt(d,3)} → ${Math.abs(d)<1-1e-9?"جاذب":Math.abs(d)>1+1e-9?"دافع":"مرزی"})`; });
    let s=`آخرین مقادیر: ${last}\nتقریب نمای لیاپانوف (1/n)Σlog|f′(x_k)| روی ${fa(cnt)} گام = ${isFinite(lyap/cnt)?fmt(lyap/cnt,4):"−∞"}\nنقاط ثابت: ${fps.length?fps.join(" ;  "):"ندارد (در این بازه)"}`;
    if(extra.length){ const e=orbit(extra[extra.length-1],shown); s+=`\nفاصله‌ی مدار نزدیک از مدار اصلی در گام آخر: ${fmt(Math.abs(e[e.length-1]-o[o.length-1]),8)}`; }
    ro.textContent=s;
  }
  el.querySelector(".cw").addEventListener("pointerdown",ev=>{ const r=ev.target.getBoundingClientRect(); const x=cw.invX(ev.clientX-r.left); const [a,b]=FN[id].dom; if(x>=a&&x<=b){ x0=x; x0s.set(x); extra=[]; draw(); } });
  buildControls(); onResize(el,draw); draw();
}

/* ======================================================================
   Widget: graph of f^n with fixed points (periodic points)
   ====================================================================== */
function wIterate(el){
  const ids=(el.dataset.fns||"logistic").split(","); let id=ids[0];
  let P=paramsOf(id, el.dataset.p?JSON.parse(el.dataset.p):null), n=+(el.dataset.k||2), exact=false;
  el.innerHTML=`<div class="wt">${el.dataset.title||"نمودار fⁿ و نقاط تناوبی"}</div><div class="wd">${el.dataset.desc||"هر تقاطع نمودار fⁿ با قطر یک جواب fⁿ(x)=x است. سبز: جاذب، نارنجی: دافع (بر اساس |(fⁿ)′|)."}</div>
  <div class="canvases one"><canvas class="cv wide"></canvas></div><div class="controls"></div><div class="readout"></div>`;
  const pl=new Plot(el.querySelector(".cv"),{}), C=el.querySelector(".controls"), ro=el.querySelector(".readout");
  function build(){
    C.innerHTML="";
    if(ids.length>1){ const L=h("label",null,"نگاشت: "); L.appendChild(select(ids.map(i=>[i,FN[i].name]),id,v=>{id=v;P=paramsOf(id);build();draw();})); C.appendChild(L); }
    FN[id].params.forEach(q=>C.appendChild(slider(q.k+" =",q.min,q.max,q.step,P[q.k],v=>{P[q.k]=v;draw();})));
    C.appendChild(slider("n =",1,+(el.dataset.kmax||8),1,n,v=>{n=v;draw();}));
    const L=h("label"); L.innerHTML=`<input type="checkbox"> فقط دوره‌ی کمینه‌ی دقیقاً n`; L.querySelector("input").onchange=e=>{exact=e.target.checked;draw();}; C.appendChild(L);
  }
  function draw(){
    const F=FN[id]; pl.resize(); const [a,b]=F.dom,[ya,yb]=F.ran; pl.v={xmin:a,xmax:b,ymin:ya,ymax:yb};
    pl.clear(); pl.axes({xl:"x",yl:"fⁿ(x)"}); pl.diag();
    if(n>1) pl.fn(x=>F.f(x,P),css("--plot-axis"),1);
    pl.fn(x=>iterN(F,P,x,n),css("--plot-fn"),1.8,Math.max(1500,pl.w*4));
    let fps=fixedPointsN(F,P,n,Math.min(40000,4000*Math.pow(2,Math.min(n,6))/4));
    const rows=[]; const byPer={};
    fps.forEach(x=>{ const k=minPeriod(F,P,x,n); if(exact&&k!==n) return; const d=dIterN(F,P,x,n);
      const col=Math.abs(d)<1?css("--good"):css("--warn"); pl.dot(x,x,4,col,css("--plot-bg")); byPer[k]=(byPer[k]||0)+1; rows.push(`x=${fmt(x,6)}  دوره‌ی کمینه=${k}  (fⁿ)′=${fmt(d,4)}`); });
    ro.textContent=`تعداد جواب‌های fⁿ(x)=x در بازه: ${fps.length}   ·   بر حسب دوره‌ی کمینه: ${Object.keys(byPer).map(k=>`دوره ${k}: ${byPer[k]}`).join("، ")||"—"}\n`+rows.slice(0,24).join("\n")+(rows.length>24?`\n… (${rows.length-24} مورد دیگر)`:"");
  }
  build(); onResize(el,draw); draw();
}

/* ======================================================================
   Widget: bifurcation diagram (logistic) + Lyapunov strip
   ====================================================================== */
function wBifurcation(el){
  const full={rmin:+(el.dataset.rmin||2.5),rmax:4,xmin:0,xmax:1};
  let view=Object.assign({},full), hist=[], sel=null, showL=el.dataset.lyap==="1", showR=false;
  el.innerHTML=`<div class="wt">${el.dataset.title||"نمودار انشعاب خانواده‌ی لجستیک"}</div>
   <div class="wd">برای بزرگ‌نمایی، روی نمودار یک مستطیل بکش. با یک کلیک ساده یک r انتخاب می‌شود و رفتار مدار نشان داده می‌شود.</div>
   <div class="canvases one"><canvas class="bf wide"></canvas><canvas class="ly strip" style="display:${showL?"block":"none"}"></canvas></div>
   <div class="controls"></div><div class="readout"></div>`;
  const cv=el.querySelector(".bf"), lc=el.querySelector(".ly"), pl=new Plot(cv,{}), pll=new Plot(lc,{}), C=el.querySelector(".controls"), ro=el.querySelector(".readout");
  const RS=[3,3.449489743,3.544090360,3.564407266,3.568759420,3.569691610];
  const mk=(t,f,ghost=true)=>{ const b=h("button",{class:"btn"+(ghost?" ghost":""),type:"button"},t); b.onclick=f; C.appendChild(b); return b; };
  mk("نمای کامل",()=>{hist=[];view=Object.assign({},full);draw();},false);
  mk("زوم قبلی",()=>{ if(hist.length){view=hist.pop();draw();} });
  mk("آبشار دوبرابرشدن",()=>{hist.push(view);view={rmin:2.95,rmax:3.575,xmin:0.28,xmax:0.92};draw();});
  mk("پنجره‌ی دوره‌ی ۳",()=>{hist.push(view);view={rmin:3.81,rmax:3.87,xmin:0,xmax:1};draw();});
  mk("خودمانندی در پنجره‌ی ۳",()=>{hist.push(view);view={rmin:3.8414,rmax:3.8571,xmin:0.445,xmax:0.555};draw();});
  const L1=h("label"); L1.innerHTML=`<input type="checkbox" ${showL?"checked":""}> نمای لیاپانوف`; L1.querySelector("input").onchange=e=>{showL=e.target.checked; lc.style.display=showL?"block":"none"; draw();}; C.appendChild(L1);
  const L2=h("label"); L2.innerHTML=`<input type="checkbox"> خطوط r₁,r₂,…`; L2.querySelector("input").onchange=e=>{showR=e.target.checked; draw();}; C.appendChild(L2);
  function draw(){
    pl.resize(); pl.v={xmin:view.rmin,xmax:view.rmax,ymin:view.xmin,ymax:view.xmax}; pl.clear(); pl.axes({xl:"r",yl:"x"});
    const g=pl.ctx, W=Math.floor(pl.w-pl.pad.l-pl.pad.r), H=Math.floor(pl.h-pl.pad.t-pl.pad.b);
    const dpr=window.devicePixelRatio||1, Wd=Math.floor(W*dpr), Hd=Math.floor(H*dpr);
    const img=g.createImageData(Wd,Hd), cnt=new Uint16Array(Wd*Hd);
    const zoom=Math.max(1,(full.rmax-full.rmin)/(view.rmax-view.rmin));
    const T=Math.min(6000,Math.round(400+300*Math.log2(zoom+1))), K=Math.min(1200,250+Math.round(60*Math.log2(zoom+1)));
    const lyap=new Float64Array(Wd);
    for(let i=0;i<Wd;i++){
      const r=view.rmin+(view.rmax-view.rmin)*(i+0.5)/Wd; let x=0.5; for(let t=0;t<T;t++) x=r*x*(1-x);
      let L=0;
      for(let k=0;k<K;k++){ x=r*x*(1-x); L+=Math.log(Math.abs(r*(1-2*x))+1e-300);
        const j=Math.floor((view.xmax-x)/(view.xmax-view.xmin)*Hd); if(j>=0&&j<Hd) cnt[j*Wd+i]++; }
      lyap[i]=L/K;
    }
    const ink=css("--plot-fn"); const m=ink.match(/#(..)(..)(..)/); const R=m?parseInt(m[1],16):30,G=m?parseInt(m[2],16):30,B=m?parseInt(m[3],16):50;
    for(let p=0;p<cnt.length;p++){ if(cnt[p]){ const a=Math.min(255,90+cnt[p]*40); img.data[4*p]=R; img.data[4*p+1]=G; img.data[4*p+2]=B; img.data[4*p+3]=a; } }
    const off=document.createElement("canvas"); off.width=Wd; off.height=Hd; off.getContext("2d").putImageData(img,0,0);
    g.drawImage(off,pl.pad.l,pl.pad.t,W,H);
    if(showR) RS.forEach((r,i)=>{ if(r>view.rmin&&r<view.rmax){ pl.line(r,view.xmin,r,view.xmax,css("--plot-c3"),1,0.7,[3,3]); g.fillStyle=css("--plot-c3"); g.font="11px Vazirmatn"; g.fillText("r"+(i+1),pl.X(r)+2,pl.pad.t+12+12*(i%2)); } });
    if(sel!==null && sel>view.rmin && sel<view.rmax) pl.line(sel,view.xmin,sel,view.xmax,css("--plot-c2"),1.5);
    if(showL){
      pll.resize(); let lo=-2,hi=1; pll.v={xmin:view.rmin,xmax:view.rmax,ymin:lo,ymax:hi}; pll.pad.b=16; pll.clear(); pll.axes({sy:1,yl:"λ"});
      const gg=pll.ctx; gg.save(); pll.clip(); gg.lineWidth=1;
      for(let i=0;i<Wd;i++){ const r=view.rmin+(view.rmax-view.rmin)*(i+0.5)/Wd, l=Math.max(lo,Math.min(hi,lyap[i]));
        gg.strokeStyle= lyap[i]>0?css("--plot-c2"):css("--plot-c1"); gg.beginPath(); gg.moveTo(pll.X(r),pll.Y(0)); gg.lineTo(pll.X(r),pll.Y(l)); gg.stroke(); }
      pll.unclip(); gg.restore();
    }
    ro.textContent = `بازه‌ی r: [${fmt(view.rmin,6)}, ${fmt(view.rmax,6)}]   ·   گذرا=${T} تکرار، رسم=${K} تکرار برای هر ستون` + (sel!==null?describe(sel):"");
  }
  function describe(r){
    let x=0.5; for(let t=0;t<20000;t++) x=r*x*(1-x);
    const o=[x]; for(let k=1;k<=64;k++){ x=r*x*(1-x); o.push(x); }
    let per=0; for(let k=1;k<=64;k++){ if(Math.abs(o[k]-o[0])<1e-7){ per=k; break; } }
    let L=0, y=o[0]; for(let k=0;k<5000;k++){ L+=Math.log(Math.abs(r*(1-2*y))+1e-300); y=r*y*(1-y); }
    return `\nr انتخابی = ${fmt(r,6)}  →  ${per?`مدار جاذب با دوره‌ی ${per}: ${o.slice(0,Math.min(per,8)).map(v=>fmt(v,5)).join(", ")}${per>8?" …":""}`:"دوره‌ی کوچک (≤۶۴) دیده نشد؛ احتمالاً رفتار آشوبی"}\nنمای لیاپانوف مدار نقطه‌ی بحرانی ≈ ${fmt(L/5000,4)}`;
  }
  let drag=null;
  cv.addEventListener("pointerdown",e=>{ const r=cv.getBoundingClientRect(); drag={x:e.clientX-r.left,y:e.clientY-r.top}; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove",e=>{ if(!drag) return; const r=cv.getBoundingClientRect(); const x=e.clientX-r.left,y=e.clientY-r.top; draw(); const g=pl.ctx; g.strokeStyle=css("--plot-c2"); g.setLineDash([4,3]); g.strokeRect(drag.x,drag.y,x-drag.x,y-drag.y); g.setLineDash([]); });
  cv.addEventListener("pointerup",e=>{ if(!drag) return; const r=cv.getBoundingClientRect(); const x=e.clientX-r.left,y=e.clientY-r.top;
    if(Math.abs(x-drag.x)<6&&Math.abs(y-drag.y)<6){ sel=pl.invX(x); }
    else{ const r1=pl.invX(Math.min(x,drag.x)), r2=pl.invX(Math.max(x,drag.x)), y1=pl.invY(Math.max(y,drag.y)), y2=pl.invY(Math.min(y,drag.y));
      hist.push(view); view={rmin:Math.max(0,r1),rmax:Math.min(4,r2),xmin:Math.max(0,y1),xmax:Math.min(1,y2)}; }
    drag=null; draw(); });
  onResize(el,draw); draw();
}

/* ======================================================================
   Widget: functional graph of a map on a finite set
   ====================================================================== */
function wFinite(el){
  let n=+(el.dataset.n||12), rule=el.dataset.rule||"sqmod", k=+(el.dataset.k||3), custom="";
  el.innerHTML=`<div class="wt">${el.dataset.title||"گراف یک دینامیک روی مجموعه‌ی متناهی"}</div><div class="wd">هر پیکان یعنی x → f(x). دورها پررنگ‌اند. هر مؤلفه‌ی همبند یک grand orbit است.</div>
   <svg class="fgraph" viewBox="0 0 800 500"></svg><div class="controls"></div><div class="readout"></div>`;
  const svg=el.querySelector("svg"), C=el.querySelector(".controls"), ro=el.querySelector(".readout");
  let rnd=[];
  const RULES=[["sqmod","x² mod n"],["dbl","2x mod n"],["cube","x³ mod n"],["rot","x+k mod n (جابه‌جایی)"],["mulk","k·x mod n"],["perm","جایگشت تصادفی"],["rand","تابع تصادفی"],["custom","دلخواه (فهرست مقادیر)"]];
  function mapArr(){
    const a=[];
    for(let x=0;x<n;x++){
      if(rule==="sqmod") a.push((x*x)%n); else if(rule==="dbl") a.push((2*x)%n); else if(rule==="cube") a.push((x*x*x)%n);
      else if(rule==="rot") a.push((x+k)%n); else if(rule==="mulk") a.push((k*x)%n);
    }
    if(rule==="perm"||rule==="rand"){ if(rnd.length!==n) reroll(); return rnd.slice(); }
    if(rule==="custom"){ const v=custom.split(/[\s,،]+/).filter(s=>s!=="").map(Number); if(v.length===n && v.every(t=>Number.isInteger(t)&&t>=0&&t<n)) return v; return null; }
    return a;
  }
  function reroll(){ rnd=[]; if(rule==="perm"){ const p=[...Array(n).keys()]; for(let i=n-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [p[i],p[j]]=[p[j],p[i]]; } rnd=p; } else { for(let i=0;i<n;i++) rnd.push(Math.floor(Math.random()*n)); } }
  function build(){
    C.innerHTML="";
    const L=h("label",null,"قاعده: "); L.appendChild(select(RULES,rule,v=>{rule=v; rnd=[]; build(); draw();})); C.appendChild(L);
    C.appendChild(slider("n =",2,40,1,n,v=>{n=v; rnd=[]; draw();}));
    if(rule==="rot"||rule==="mulk") C.appendChild(slider("k =",0,20,1,k,v=>{k=v; draw();}));
    if(rule==="perm"||rule==="rand"){ const b=h("button",{class:"btn ghost",type:"button"},"تصادفی جدید"); b.onclick=()=>{reroll();draw();}; C.appendChild(b); }
    if(rule==="custom"){ const L2=h("label",null,"f(0), f(1), …, f(n−1): "); const t=h("input",{type:"text",placeholder:"1,2,0,0,3"}); t.value=custom; t.oninput=()=>{custom=t.value; draw();}; L2.appendChild(t); C.appendChild(L2); }
  }
  function analyze(f){
    const N=f.length, onCycle=new Array(N).fill(false), comp=new Array(N).fill(-1), cycles=[];
    for(let s=0;s<N;s++){ // find cycle reached from s
      const seen=new Map(); let x=s, i=0; while(!seen.has(x)){ seen.set(x,i++); x=f[x]; }
      if(!onCycle[x]){ const cyc=[]; let y=x; do{ onCycle[y]=true; cyc.push(y); y=f[y]; }while(y!==x); cycles.push(cyc); }
    }
    cycles.forEach((c,ci)=>c.forEach(v=>comp[v]=ci));
    const depth=new Array(N).fill(0);
    for(let s=0;s<N;s++){ let x=s,d=0; while(!onCycle[x]){ x=f[x]; d++; } depth[s]=d; comp[s]=comp[x]; }
    return {onCycle,comp,cycles,depth};
  }
  function draw(){
    const f=mapArr(); svg.innerHTML="";
    if(!f){ ro.textContent="فهرست باید دقیقاً n عدد صحیح بین 0 و n−1 باشد."; return; }
    const A=analyze(f), N=f.length, kids=[...Array(N)].map(()=>[]);
    for(let x=0;x<N;x++) if(!A.onCycle[x]) kids[f[x]].push(x);
    const leaves=v=>{ if(!kids[v].length) return 1; return kids[v].reduce((s,c)=>s+leaves(c),0); };
    const pos=new Array(N);
    const comps=A.cycles.map((c,ci)=>({c,ci,size:[...Array(N).keys()].filter(v=>A.comp[v]===ci).length}));
    const cols=Math.ceil(Math.sqrt(comps.length*1.6)), rows=Math.ceil(comps.length/cols);
    const cw=800/cols, ch=500/rows;
    comps.forEach((cp,idx)=>{
      const cx=cw*(idx%cols+0.5), cy=ch*(Math.floor(idx/cols)+0.5), L=cp.c.length;
      const maxDepth=Math.max(0,...[...Array(N).keys()].filter(v=>A.comp[v]===cp.ci).map(v=>A.depth[v]));
      const R0=L===1?0:Math.min(Math.min(cw,ch)*0.22, 12+8*L);
      const ring=Math.max(34,Math.min((Math.min(cw,ch)/2-R0-14)/Math.max(1,maxDepth),70));
      const tot=cp.c.reduce((s,v)=>s+Math.max(1,kids[v].length?leaves(v):1),0);
      let ang=-Math.PI/2;
      cp.c.forEach(v=>{
        const wv=Math.max(1,kids[v].length?leaves(v):1)*2*Math.PI/tot; const mid=ang+wv/2;
        pos[v]= L===1?[cx,cy]:[cx+R0*Math.cos(mid),cy+R0*Math.sin(mid)];
        const place=(u,a0,a1,d)=>{ const tl=kids[u].reduce((s,c)=>s+leaves(c),0); let a=a0;
          kids[u].forEach(c=>{ const w=(a1-a0)*leaves(c)/tl, m=a+w/2, rr=R0+ring*d; pos[c]=[cx+rr*Math.cos(m),cy+rr*Math.sin(m)]; place(c,a,a+w,d+1); a+=w; }); };
        const spread=L===1?2*Math.PI:wv;
        place(v, L===1?-Math.PI/2:mid-spread/2, L===1?3*Math.PI/2:mid+spread/2, 1);
        ang+=wv;
      });
    });
    const NS="http://www.w3.org/2000/svg", mkS=(t,a)=>{ const e=document.createElementNS(NS,t); for(const k in a) e.setAttribute(k,a[k]); return e; };
    const defs=mkS("defs",{}); const mrk=mkS("marker",{id:"ah"+el.__id,viewBox:"0 0 10 10",refX:"10",refY:"5",markerWidth:"6",markerHeight:"6",orient:"auto-start-reverse"});
    mrk.appendChild(mkS("path",{d:"M0,0 L10,5 L0,10 z",fill:css("--ink-3")})); defs.appendChild(mrk);
    const mrk2=mrk.cloneNode(true); mrk2.setAttribute("id","ahc"+el.__id); mrk2.firstChild.setAttribute("fill",css("--plot-c1")); defs.appendChild(mrk2); svg.appendChild(defs);
    const r=11;
    for(let x=0;x<N;x++){
      const [x1,y1]=pos[x],[x2,y2]=pos[f[x]], cyc=A.onCycle[x];
      if(x===f[x]){ svg.appendChild(mkS("circle",{cx:x1,cy:y1-r-6,r:7,fill:"none",stroke:css("--plot-c1"),"stroke-width":2})); continue; }
      const dx=x2-x1,dy=y2-y1,d=Math.hypot(dx,dy)||1, ux=dx/d,uy=dy/d;
      const bend=cyc?0.18:0, mx=(x1+x2)/2-uy*d*bend, my=(y1+y2)/2+ux*d*bend;
      const sx=x1+ux*r, sy=y1+uy*r, ex=x2-ux*(r+2), ey=y2-uy*(r+2);
      svg.appendChild(mkS("path",{d:`M${sx},${sy} Q${mx},${my} ${ex},${ey}`,fill:"none",stroke:cyc?css("--plot-c1"):css("--ink-3"),"stroke-width":cyc?2.2:1.3,"marker-end":`url(#${cyc?"ahc":"ah"}${el.__id})`}));
    }
    for(let x=0;x<N;x++){ const [cx,cy]=pos[x]; svg.appendChild(mkS("circle",{cx,cy,r,fill:A.onCycle[x]?css("--accent-soft"):css("--paper"),stroke:A.onCycle[x]?css("--plot-c1"):css("--line-2"),"stroke-width":1.6}));
      const t=mkS("text",{x:cx,y:cy+4,"text-anchor":"middle","font-size":"11",fill:css("--ink"),"font-family":"Vazirmatn"}); t.textContent=x; svg.appendChild(t); }
    const inj=new Set(f).size===N;
    ro.textContent=`f = [${f.join(", ")}]\nتعداد grand orbitها (مؤلفه‌ها): ${A.cycles.length}   ·   طول دورها: ${A.cycles.map(c=>c.length).sort((a,b)=>b-a).join(", ")}\nبیشترین طول دنباله‌ی گذرا (گام‌ها تا رسیدن به دور): ${Math.max(...A.depth)}   ·   یک‌به‌یک؟ ${inj?"بله ← همه‌چیز روی دور است (جایگشت)":"خیر"}`;
  }
  el.__id=Math.random().toString(36).slice(2,7);
  build(); draw(); el.setAttribute("data-redraw",""); el._redraw=draw;
}

/* ======================================================================
   Widget: circle maps (rotation / doubling)
   ====================================================================== */
function wCircle(el){
  let map=el.dataset.map||"rot", alpha=+(el.dataset.alpha||0.2), th0=0.05, N=+(el.dataset.n||40);
  el.innerHTML=`<div class="wt">${el.dataset.title||"دینامیک روی دایره"}</div><div class="wd">نقطه‌ها را با زاویه θ∈[0,1) (یعنی e^{2πiθ}) نشان می‌دهیم. رنگ از روشن به تیره = گذر زمان.</div>
  <div class="canvases"><canvas class="cc"></canvas><canvas class="ct"></canvas></div><div class="controls"></div><div class="readout"></div>`;
  const cc=el.querySelector(".cc"), pl=new Plot(cc,{}), pt=new Plot(el.querySelector(".ct"),{}), C=el.querySelector(".controls"), ro=el.querySelector(".readout");
  const PRE=[["1/3",1/3],["2/5",2/5],["3/8",3/8],["√2−1",Math.SQRT2-1],["(√5−1)/2",(Math.sqrt(5)-1)/2]];
  let sA;
  function build(){
    C.innerHTML="";
    const L=h("label",null,"نگاشت: "); L.appendChild(select([["rot","دوران θ ↦ θ+α"],["dbl","z ↦ z²  (θ ↦ 2θ)"],["tri","z ↦ z³  (θ ↦ 3θ)"]],map,v=>{map=v;build();draw();})); C.appendChild(L);
    if(map==="rot"){ sA=slider("α =",0,1,0.0001,alpha,v=>{alpha=v;draw();}); C.appendChild(sA);
      PRE.forEach(([t,v])=>{ const b=h("button",{class:"btn ghost",type:"button"},"α="+t); b.onclick=()=>{alpha=v; sA.set(v); draw();}; C.appendChild(b); }); }
    C.appendChild(slider("θ₀ =",0,1,0.0001,th0,v=>{th0=v;draw();}));
    C.appendChild(slider("تعداد نقاط N =",1,600,1,N,v=>{N=v;draw();}));
  }
  const step=t=> map==="rot"?(t+alpha)%1 : map==="dbl"?(2*t)%1 : (3*t)%1;
  function draw(){
    pl.resize(); pl.pad={l:10,r:10,t:10,b:10}; pl.v={xmin:-1.25,xmax:1.25,ymin:-1.25,ymax:1.25}; pl.clear();
    const g=pl.ctx; g.strokeStyle=css("--line-2"); g.lineWidth=1.5; g.beginPath(); g.arc(pl.X(0),pl.Y(0),pl.X(1)-pl.X(0),0,7); g.stroke();
    const o=[th0]; for(let i=1;i<N;i++) o.push(step(o[i-1]));
    if(N<=60) for(let i=0;i<N-1;i++){ const a=TAU*o[i],b=TAU*o[i+1]; pl.line(Math.cos(a),Math.sin(a),Math.cos(b),Math.sin(b),css("--plot-c3"),1,0.35); }
    o.forEach((t,i)=>{ const a=TAU*t; const col=css("--plot-c1"); g.globalAlpha=0.25+0.75*(i+1)/N; pl.dot(Math.cos(a),Math.sin(a),i===0?5:3.2,i===0?css("--plot-c2"):col); g.globalAlpha=1; });
    pt.resize(); pt.v={xmin:0,xmax:Math.max(10,N),ymin:0,ymax:1}; pt.clear(); pt.axes({xl:"n",yl:"θₙ"}); o.forEach((t,i)=>pt.dot(i,t,2,css("--plot-c1")));
    let per=0; for(let k=1;k<Math.min(N,200);k++){ const d=Math.abs(o[k]-o[0]); if(Math.min(d,1-d)<1e-9){per=k;break;} }
    const s=[...o].sort((a,b)=>a-b); let gap=0; for(let i=0;i<s.length;i++){ const d=(i+1<s.length?s[i+1]:s[0]+1)-s[i]; gap=Math.max(gap,d); }
    ro.textContent=(per?`مدار تناوبی با دوره‌ی ${per} (در دقت عددی)`:`در ${N} گام به نقطه‌ی شروع برنگشت`)+`   ·   بزرگ‌ترین فاصله‌ی خالی بین نقاط مدار روی دایره: ${fmt(gap,4)}`;
  }
  build(); onResize(el,draw); draw();
}

/* ---------- boot ---------- */
const WIDGETS={cobweb:wCobweb, iterate:wIterate, bifurcation:wBifurcation, finite:wFinite, circle:wCircle};
window.DS={Plot,FN,css,fmt,fa,iterN,dIterN,fixedPointsN,minPeriod,h,slider,select,onResize,SESSIONS,PARTS,fileOf,loadProg,WIDGETS};
function boot(){
  buildChrome(); buildQuiz();
  document.querySelectorAll("[data-widget]").forEach(el=>{ const f=WIDGETS[el.dataset.widget]; if(f){ try{ f(el); }catch(e){ el.textContent="خطا در ابزار: "+e.message; console.error(e); } } });
  if(window.PAGE_INIT) try{ window.PAGE_INIT(window.DS); }catch(e){ console.error(e); }
  renderMath(document.body);
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
})();
