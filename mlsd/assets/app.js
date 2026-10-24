/* ===== ML Systems Design study notes — shared engine ===== */
(function(){
"use strict";

/* ---------- course plan ---------- */
const SESSIONS = [
  {n:1,  part:"الف", title:"از مدل تا محصول: ML در تحقیق و در production", built:true},
  {n:2,  part:"الف", title:"قاب‌بندی مسئله، اهداف، محدودیت‌ها و جداسازی اهداف", built:true},
  {n:3,  part:"الف", title:"مهندسی داده (۱): منابع، فرمت‌ها و مدل‌های داده", built:true},
  {n:4,  part:"الف", title:"مهندسی داده (۲): جریان داده، OLTP/OLAP، ETL، batch و stream", built:true},
  {n:5,  part:"الف", title:"کیفیت داده و برچسب‌گذاری", built:true},
  {n:6,  part:"الف", title:"نمونه‌گیری، عدم‌توازن کلاس، تقسیم داده و افزایش داده", built:true},
  {n:7,  part:"الف", title:"مهندسی ویژگی (۱): عملیات رایج", built:true},
  {n:8,  part:"الف", title:"مهندسی ویژگی (۲): نشت داده + آزمون جامع بخش داده", built:true},
  {n:9,  part:"ب", title:"توسعه‌ی مدل (۱): انتخاب مدل، baseline، ensemble، ردیابی آزمایش", built:false},
  {n:10, part:"ب", title:"توسعه‌ی مدل (۲): آموزش توزیع‌شده، AutoML و تنظیم ابرپارامتر", built:false},
  {n:11, part:"ب", title:"ارزیابی آفلاین", built:false},
  {n:12, part:"ب", title:"استقرار (۱): batch و online، feature store", built:false},
  {n:13, part:"ب", title:"استقرار (۲): فشرده‌سازی مدل، edge و cloud", built:false},
  {n:14, part:"ب", title:"سرویس‌دهی عملی: TF Serving و Ray Serve", built:false},
  {n:15, part:"ب", title:"خرابی سیستم‌های ML و حلقه‌های بازخورد", built:false},
  {n:16, part:"ب", title:"جابه‌جایی توزیع داده: انواع، تشخیص، مقابله", built:false},
  {n:17, part:"ب", title:"مانیتورینگ، یادگیری پیوسته و تست در production", built:false},
  {n:18, part:"ب", title:"فراتر از دقت: تفسیرپذیری، انصاف، امنیت", built:false},
  {n:19, part:"ب", title:"زیرساخت و ابزار + مطالعه‌ی موردی کامل", built:false},
  {n:20, part:"ب", title:"مرور نهایی و امتحان آزمایشی", built:false},
];
const PARTS = {"الف":"بنیان‌ها و داده (درس داده‌شده تا هفته‌ی ۴)","ب":"مدل‌سازی، استقرار و پایش (بقیه‌ی ترم)"};
const fa = n => String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
const pad = n => String(n).padStart(2,"0");
const fileOf = n => `session-${pad(n)}.html`;

/* ---------- storage (best effort) ---------- */
const KEY = "mlsd.progress.v1";
function loadProg(){ try{ return JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){ return {}; } }
function saveProg(p){ try{ localStorage.setItem(KEY, JSON.stringify(p)); }catch(e){} }

/* ---------- theme ---------- */
function getTheme(){ try{ return localStorage.getItem("mlsd.theme"); }catch(e){ return null; } }
function applyTheme(t){ if(t) document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme"); }
applyTheme(getTheme());
function toggleTheme(){
  const dark = document.documentElement.getAttribute("data-theme")==="dark" ||
    (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
  const t = dark ? "light" : "dark";
  applyTheme(t); try{ localStorage.setItem("mlsd.theme", t); }catch(e){}
  document.querySelectorAll("[data-redraw]").forEach(el=>el._redraw && el._redraw());
}

/* ---------- page chrome ---------- */
function buildChrome(){
  const sn = +document.body.dataset.session || 0;
  const s = SESSIONS.find(x=>x.n===sn);
  const bar = document.createElement("div");
  bar.className = "topbar";
  bar.innerHTML = `<div class="in"><a class="home" href="index.html">⌂ طراحی سیستم‌های ML</a>
    <span class="crumb">${s ? `جلسه‌ی ${fa(sn)} · ${s.title}` : ""}</span>
    <button type="button" id="themeBtn" title="تغییر تم">◐ تم</button></div><div class="progressbar"></div>`;
  document.body.prepend(bar);
  bar.querySelector("#themeBtn").onclick = toggleTheme;
  const pb = bar.querySelector(".progressbar");
  addEventListener("scroll", ()=>{ const h=document.documentElement; pb.style.width = (100*h.scrollTop/Math.max(1,h.scrollHeight-h.clientHeight))+"%"; }, {passive:true});

  const toc = document.querySelector("nav.toc");
  if(toc){
    document.querySelectorAll("main section[id] > h2").forEach(h=>{
      const a=document.createElement("a"); a.href="#"+h.parentElement.id;
      const cl=h.cloneNode(true); cl.querySelectorAll(".tag").forEach(t=>t.remove());
      a.textContent = h.dataset.short || cl.textContent.replace(/\s+/g," ").trim();
      toc.appendChild(a);
    });
  }
  if(!s) return;
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
    score.querySelector("button").onclick = ()=>{ host.innerHTML=""; buildQuiz(); renderMath(host); };
    if(answered===Q.length && sn){ const p=loadProg(); p[sn]=p[sn]||{}; const best=p[sn].quiz?p[sn].quiz[0]:-1; if(correct>best) p[sn].quiz=[correct,Q.length]; saveProg(p); }
  };
  Q.forEach((it,i)=>{
    const d = document.createElement("div"); d.className="qitem";
    d.innerHTML = `<div class="qhead"><span class="qn">${fa(i+1)}.</span>${it.q}</div><div class="opts"></div><div class="fb"></div>`;
    const opts = d.querySelector(".opts"), fb = d.querySelector(".fb");
    const order = it.o.map((_,k)=>k); for(let k=order.length-1;k>0;k--){ const r=Math.floor(Math.random()*(k+1)); [order[k],order[r]]=[order[r],order[k]]; }
    const ans = order.indexOf(it.a);
    order.map(k=>it.o[k]).forEach((t,j)=>{
      const b=document.createElement("button"); b.type="button"; b.className="opt"; b.innerHTML=`<b>${"الف ب ج د ه و".split(" ")[j]})</b> ${t}`;
      b.onclick=()=>{
        opts.querySelectorAll("button").forEach((x,k)=>{ x.disabled=true; if(k===ans) x.classList.add("correct"); });
        const ok = j===ans; if(!ok) b.classList.add("wrong");
        answered++; if(ok) correct++;
        fb.innerHTML = `<b class="${ok?"ok":"no"}">${ok?"درست!":"نه دقیقاً."}</b> ${it.e||""}`; fb.style.display="block";
        renderMath(fb); upd();
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
   Helpers
   ====================================================================== */
function css(v){ return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
function fmt(x,d=3){ if(!isFinite(x)) return String(x); return (+x.toFixed(d)).toString(); }
function h(tag,attrs,html){ const e=document.createElement(tag); if(attrs) for(const k in attrs){ if(k==="class") e.className=attrs[k]; else e.setAttribute(k,attrs[k]); } if(html!==undefined) e.innerHTML=html; return e; }
function slider(label,min,max,step,val,onInput,show){
  const l=h("label"); l.append(label+" ");
  const r=h("input",{type:"range",min,max,step,value:val}); const v=h("span",{class:"val"});
  const disp=()=>{ v.textContent = show? show(+r.value) : r.value; };
  r.oninput=()=>{ disp(); onInput(+r.value); }; disp();
  l.append(r,v); return l;
}
function onResize(el, fn){ let t; const ro=new ResizeObserver(()=>{ clearTimeout(t); t=setTimeout(fn,60); }); ro.observe(el); el.setAttribute("data-redraw",""); el._redraw=fn; }
function niceStep(range){ const raw=range/6, p=Math.pow(10,Math.floor(Math.log10(raw))), m=raw/p; return (m<1.5?1:m<3?2:m<7?5:10)*p; }

class Plot{
  constructor(cv,xr,yr,o={}){
    const dpr=window.devicePixelRatio||1, r=cv.getBoundingClientRect();
    cv.width=Math.max(10,r.width*dpr); cv.height=Math.max(10,r.height*dpr);
    this.ctx=cv.getContext("2d"); this.ctx.setTransform(dpr,0,0,dpr,0,0);
    this.W=r.width; this.H=r.height; this.xr=xr; this.yr=yr;
    this.p={l:o.l??44,r:o.r??12,t:o.t??12,b:o.b??30};
    this.ctx.clearRect(0,0,this.W,this.H);
    this.ctx.direction="ltr";
  }
  X(x){ return this.p.l+(x-this.xr[0])/(this.xr[1]-this.xr[0])*(this.W-this.p.l-this.p.r); }
  Y(y){ return this.H-this.p.b-(y-this.yr[0])/(this.yr[1]-this.yr[0])*(this.H-this.p.t-this.p.b); }
  axes(xl,yl,o={}){
    const c=this.ctx; c.font="11px Vazirmatn,Tahoma,sans-serif"; c.lineWidth=1;
    const sx=o.xstep||niceStep(this.xr[1]-this.xr[0]), sy=o.ystep||niceStep(this.yr[1]-this.yr[0]);
    c.strokeStyle=css("--plot-grid"); c.fillStyle=css("--ink-3");
    for(let x=Math.ceil(this.xr[0]/sx)*sx;x<=this.xr[1]+1e-9;x+=sx){ const X=this.X(x); c.beginPath(); c.moveTo(X,this.p.t); c.lineTo(X,this.H-this.p.b); c.stroke(); c.textAlign="center"; c.fillText(o.xfmt?o.xfmt(x):fmt(x,2),X,this.H-this.p.b+14); }
    for(let y=Math.ceil(this.yr[0]/sy)*sy;y<=this.yr[1]+1e-9;y+=sy){ const Y=this.Y(y); c.beginPath(); c.moveTo(this.p.l,Y); c.lineTo(this.W-this.p.r,Y); c.stroke(); c.textAlign="right"; c.fillText(o.yfmt?o.yfmt(y):fmt(y,2),this.p.l-4,Y+4); }
    c.strokeStyle=css("--plot-axis"); c.beginPath(); c.moveTo(this.p.l,this.p.t); c.lineTo(this.p.l,this.H-this.p.b); c.lineTo(this.W-this.p.r,this.H-this.p.b); c.stroke();
    c.fillStyle=css("--ink-2"); c.textAlign="center"; if(xl) c.fillText(xl,(this.p.l+this.W-this.p.r)/2,this.H-3);
    if(yl){ c.save(); c.translate(11,(this.p.t+this.H-this.p.b)/2); c.rotate(-Math.PI/2); c.fillText(yl,0,0); c.restore(); }
  }
  line(pts,color,w=2,dash){ const c=this.ctx; c.strokeStyle=color; c.lineWidth=w; c.setLineDash(dash||[]); c.beginPath(); let first=true; for(const [x,y] of pts){ if(!isFinite(y)){first=true;continue;} const X=this.X(x),Y=this.Y(Math.max(this.yr[0]-1e3,Math.min(this.yr[1]+1e3,y))); if(first){c.moveTo(X,Y);first=false;} else c.lineTo(X,Y);} c.stroke(); c.setLineDash([]); }
  vline(x,color,dash){ this.line([[x,this.yr[0]],[x,this.yr[1]]],color,1.5,dash||[5,4]); }
  hline(y,color,dash){ this.line([[this.xr[0],y],[this.xr[1],y]],color,1.5,dash||[5,4]); }
  dot(x,y,color,r=4){ const c=this.ctx; c.fillStyle=color; c.beginPath(); c.arc(this.X(x),this.Y(y),r,0,7); c.fill(); }
  bar(x,w,y0,y1,color){ const c=this.ctx; c.fillStyle=color; const X0=this.X(x-w/2),X1=this.X(x+w/2); const Y0=this.Y(y0),Y1=this.Y(y1); c.fillRect(X0,Math.min(Y0,Y1),X1-X0,Math.abs(Y1-Y0)); }
  text(x,y,s,color,align="center",dy=0){ const c=this.ctx; c.fillStyle=color||css("--ink-2"); c.textAlign=align; c.font="11px Vazirmatn,Tahoma,sans-serif"; c.fillText(s,this.X(x),this.Y(y)+dy); }
  area(pts,color){ const c=this.ctx; c.fillStyle=color; c.beginPath(); c.moveTo(this.X(pts[0][0]),this.Y(this.yr[0])); for(const [x,y] of pts) c.lineTo(this.X(x),this.Y(y)); c.lineTo(this.X(pts[pts.length-1][0]),this.Y(this.yr[0])); c.closePath(); c.fill(); }
}
function alpha(col,a){ // hex or rgb -> rgba
  col=col.trim(); if(col.startsWith("#")){ let s=col.slice(1); if(s.length===3) s=s.split("").map(c=>c+c).join(""); const n=parseInt(s,16); return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`; } return col;
}
function shell(el,title,desc){
  el.classList.add("widget");
  el.innerHTML=`<div class="wt">${title}</div>${desc?`<div class="wd">${desc}</div>`:""}`;
}
function erf(x){ const t=1/(1+0.3275911*Math.abs(x)); const y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x); return x>=0?y:-y; }
const L = x => "\u2066"+x+"\u2069";
const Phi = x => 0.5*(1+erf(x/Math.SQRT2));

/* ======================================================================
   Widget 1 — ensemble accuracy vs latency (HW1 Q2)
   ====================================================================== */
function wEnsemble(el){
  shell(el,"🔧 ابزار: چند زیرمدل در ensemble؟","هر زیرمدل α واحد به دقت اضافه می‌کند ولی تأخیر نمایی رشد می‌کند: $L(n)=L_0(1.3)^n$. مطلوبیت: $U(n)=\\alpha n-\\lambda L(n)$.");
  let a=2, lam=0.05, L0=20, Lmax=400;
  const cv=h("canvas",{class:"wide"}); el.append(cv);
  const ctr=h("div",{class:"controls"});
  ctr.append(slider("α (درصد دقت به‌ازای هر زیرمدل)",0.2,5,0.1,a,v=>{a=v;draw();}),
             slider("λ (جریمه به‌ازای هر ms)",0.005,0.3,0.005,lam,v=>{lam=v;draw();}),
             slider("L₀ (ms)",5,100,1,L0,v=>{L0=v;draw();}),
             slider("سقف تأخیر مجاز (ms)",50,2000,10,Lmax,v=>{Lmax=v;draw();}));
  el.append(ctr); const out=h("div",{class:"readout"}); el.append(out);
  function draw(){
    const N=16, U=n=>a*n-lam*L0*Math.pow(1.3,n);
    let best=1; for(let n=1;n<=N;n++) if(U(n)>U(best)) best=n;
    const nCap=Math.floor(Math.log(Lmax/L0)/Math.log(1.3));
    let bestC=0; for(let n=1;n<=Math.min(N,nCap);n++) if(!bestC||U(n)>U(bestC)) bestC=n;
    const vals=[...Array(N)].map((_,i)=>U(i+1)); const ymax=Math.max(...vals,1), ymin=Math.min(Math.max(Math.min(...vals),-3*Math.abs(ymax)),0);
    const P=new Plot(cv,[0.3,N+0.7],[ymin,ymax*1.12]); P.axes("n (تعداد زیرمدل)","U(n)",{xstep:1});
    P.hline(0,css("--plot-axis"),[2,2]);
    for(let n=1;n<=N;n++){ const ok=n<=nCap; P.bar(n,0.62,0,U(n), n===best?css("--plot-c1"): ok?alpha(css("--plot-c3"),.45):alpha(css("--plot-c2"),.35)); }
    if(nCap>=1&&nCap<N) P.vline(nCap+0.5,css("--plot-c2"));
    const nstar = Math.log(a/(lam*L0*Math.log(1.3)))/Math.log(1.3);
    out.textContent =
      `n* پیوسته: ${L("ln(α/(λ·L₀·ln1.3)) / ln1.3 = "+(isFinite(nstar)?fmt(nstar,2):"—"))}\n`+
      `بهترین n صحیح (بدون سقف): ${L("n = "+best)} ← دقت ${L("+"+fmt(a*best,2)+"%")}، تأخیر ${L(fmt(L0*Math.pow(1.3,best),1)+" ms")}، ${L("U = "+fmt(U(best),2))}\n`+
      (nCap<1? `با سقف ${L(Lmax+" ms")} حتی یک زیرمدل هم مجاز نیست!` :
      `با سقف تأخیر ${L(Lmax+" ms")}: حداکثر ${L("n = "+nCap)}، بهترین n مجاز ${L("= "+bestC)}` + (bestC!==best?" ← این‌جا قید تأخیر «فعال» است و جواب را عوض کرده":" ← قید تأخیر فعال نیست"));
  }
  onResize(cv,draw); draw();
}

/* ======================================================================
   Widget 2 — decoupled objectives: rank by α·quality + (1−α)·engagement
   ====================================================================== */
function wObjMix(el){
  shell(el,"🔧 ابزار: رتبه‌بندی با دو مدل جدا","دو مدل جدا داریم: $M_q$ (کیفیت) و $M_e$ (تعامل). امتیاز نهایی $\\alpha M_q+(1-\\alpha)M_e$ است. α را عوض کن: ترتیب فوراً عوض می‌شود و <b>هیچ مدلی دوباره آموزش نمی‌بیند</b>.");
  const posts=[["خبر تحلیلی بلند درباره‌ی بودجه",0.92,0.35],["ویدیوی بامزه‌ی گربه",0.55,0.90],["تیتر جنجالی و نیمه‌درست",0.15,0.97],["آموزش آشپزی کوتاه",0.75,0.70],["پست تبلیغاتی کم‌کیفیت",0.20,0.40],["گزارش علمی ساده‌شده",0.85,0.60]];
  let a=0.5;
  const ctr=h("div",{class:"controls"}); ctr.append(slider("α (وزن کیفیت)",0,1,0.05,a,v=>{a=v;draw();}));
  const ol=h("ol",{class:"rank"}); el.append(ctr,ol);
  function draw(){
    const qc=css("--plot-c3"), ec=css("--plot-c2");
    const sc=posts.map(p=>({t:p[0],q:p[1],e:p[2],s:a*p[1]+(1-a)*p[2]})).sort((x,y)=>y.s-x.s);
    ol.innerHTML=sc.map((p,i)=>`<li><b>${fa(i+1)}</b><span>${p.t}</span><span class="bars">کیفیت <i style="width:${p.q*50}px;background:${qc}"></i> تعامل <i style="width:${p.e*50}px;background:${ec}"></i> <span class="ltr">score=${p.s.toFixed(2)}</span></span></li>`).join("");
  }
  el.setAttribute("data-redraw",""); el._redraw=draw; draw();
}

/* ======================================================================
   Widget 3 — text vs binary bytes
   ====================================================================== */
function wBytes(el){
  shell(el,"🔧 ابزار: متن یا باینری؟","چند عدد بنویس (با کاما جدا کن). حجم ذخیره در CSV (هر رقم یک بایت) را با int32 یا float64 مقایسه کن.");
  const inp=h("input",{type:"text",value:"1000000, 3.14159265, 42, 123456789, 7"});
  const ctr=h("div",{class:"controls"}); ctr.append(inp); el.append(ctr);
  const out=h("div",{class:"readout"}); el.append(out);
  function draw(){
    const toks=inp.value.split(",").map(s=>s.trim()).filter(Boolean);
    const text=toks.join(",").length;
    const allInt=toks.every(t=>/^-?\d+$/.test(t)&&Math.abs(+t)<2**31);
    out.textContent=`متن (CSV): ${L(text)} بایت (با کاماها)\n`+
      (allInt?`باینری ${L("int32")}: ${L(4*toks.length)} بایت\n`:`باینری ${L("int32")}: قابل استفاده نیست (عدد اعشاری یا خیلی بزرگ داری)\n`)+
      `باینری ${L("float64")}: ${L(8*toks.length)} بایت\n`+
      `نکته: Parquet روی این‌ها فشرده‌سازی ستونی هم انجام می‌دهد، پس اختلاف در عمل بیشتر است.`;
  }
  inp.oninput=draw; draw();
}

/* ======================================================================
   Widget 4 — feature freshness: J(Δt)=C/Δt+β(1−e^{−λΔt}) (HW1 Q3)
   ====================================================================== */
function wFresh(el){
  shell(el,"🔧 ابزار: هر چند وقت یک‌بار ویژگی را دوباره حساب کنیم؟","$J(\\Delta t)=\\dfrac{C}{\\Delta t}+\\beta\\,(1-e^{-\\lambda\\Delta t})$ : جمله‌ی اول هزینه‌ی محاسبه (در واحد زمان)، جمله‌ی دوم جریمه‌ی کهنگی. واحد زمان: ساعت.");
  let C=0.2, beta=4, lam=0.5;
  const cv=h("canvas",{class:"wide"}); el.append(cv);
  const ctr=h("div",{class:"controls"});
  ctr.append(slider("C (هزینه‌ی هر بار محاسبه)",0.01,3,0.01,C,v=>{C=v;draw();}),
             slider("β (اهمیت تازگی)",0.2,10,0.1,beta,v=>{beta=v;draw();}),
             slider("λ (سرعت کهنه‌شدن، ۱/ساعت)",0.01,5,0.01,lam,v=>{lam=v;draw();}));
  el.append(ctr); const out=h("div",{class:"readout"}); el.append(out);
  function draw(){
    const T=24, J=t=>C/t+beta*(1-Math.exp(-lam*t));
    let tb=T, jb=J(T); const pts=[];
    for(let i=1;i<=1200;i++){ const t=T*i/1200; const j=J(t); pts.push([t,j]); if(j<jb){jb=j;tb=t;} }
    const ymax=Math.max(beta*1.4, jb*2, 1);
    const P=new Plot(cv,[0,T],[0,ymax]); P.axes("Δt (ساعت)","J",{xstep:2});
    P.line(pts.map(([t])=>[t,C/t]),alpha(css("--plot-c3"),.7),1.5,[4,3]);
    P.line(pts.map(([t])=>[t,beta*(1-Math.exp(-lam*t))]),alpha(css("--plot-c2"),.7),1.5,[4,3]);
    P.line(pts,css("--plot-fn"),2.4);
    P.hline(beta,css("--plot-diag"));
    P.dot(tb,jb,css("--plot-c1"),5);
    const approx=Math.sqrt(C/(beta*lam));
    const verdict = tb>=T*0.999 ? "کمینه در انتهای بازه است: محاسبه‌ی مکرر نمی‌ارزد؛ batch با دوره‌ی طولانی (یا اصلاً بازمحاسبه نکن)." :
       tb<0.25 ? "Δt* کمتر از ۱۵ دقیقه است: عملاً باید ویژگی را stream / near-real-time حساب کنی." :
       tb<2 ? "Δt* بین ۱۵ دقیقه و ۲ ساعت: micro-batch یا stream (بسته به هزینه‌ی زیرساخت)." : `batch با دوره‌ی تقریباً هر ${fmt(tb,1)} ساعت کافی است.`;
    out.textContent=`کمینه‌ی عددی: ${L("Δt* ≈ "+fmt(tb,3))} ساعت، ${L("J(Δt*) ≈ "+fmt(jb,3))}\n`+
      `تقریب برای ${L("λΔt ≪ 1")}: ${L("Δt* ≈ √(C/(βλ)) = "+fmt(approx,3))} ساعت (${L("λΔt* = "+fmt(lam*tb,2))}${lam*tb<0.5?" ← تقریب معتبر است":" ← تقریب ضعیف است"})\n`+
      `شرط وجود کمینه‌ی داخلی: ${L("C ≤ 4β/(λe²) = "+fmt(4*beta/(lam*Math.E**2),3))}\n← ${verdict}`;
  }
  onResize(cv,draw); draw();
}

/* ======================================================================
   Widget 5 — labeling functions majority vote
   ====================================================================== */
function wLFVote(el){
  shell(el,"🔧 ابزار: برچسب‌گذاری برنامه‌نویسی‌شده (Labeling Functions)","هر LF یا رأی می‌دهد (SPAM/HAM) یا «ممتنع» است. LFها را روشن و خاموش کن و ببین رأی اکثریت، پوشش (coverage) و دقت چطور عوض می‌شود.");
  const emails=[
    ["Free money!!! Click now to claim your prize","SPAM","stranger"],
    ["Grandma: sending you some money for dinner ❤","HAM","Grandma"],
    ["Meeting moved to 3pm, see agenda attached","HAM","boss"],
    ["You are pre-approved for free cash, act fast","SPAM","stranger"],
    ["Cheap meds, no prescription, limited offer","SPAM","stranger"],
    ["Your invoice for October (money transfer details)","HAM","bank"],
    ["Congratulations winner, send your bank info","SPAM","stranger"],
    ["Lunch tomorrow?","HAM","friend"],
  ];
  const LFs=[
    {n:"LF1 · اگر «money» در متن بود ← SPAM", f:e=>/money/i.test(e[0])?"SPAM":null, on:true},
    {n:"LF2 · اگر «free» در متن بود ← SPAM", f:e=>/free/i.test(e[0])?"SPAM":null, on:true},
    {n:"LF3 · اگر فرستنده آشنا بود ← HAM", f:e=>e[2]!=="stranger"?"HAM":null, on:true},
    {n:"LF4 · اگر «offer/winner/prize» در متن بود ← SPAM", f:e=>/offer|winner|prize/i.test(e[0])?"SPAM":null, on:false},
  ];
  const tg=h("div",{class:"toggles"});
  LFs.forEach((L,i)=>{ const lab=h("label"); const c=h("input",{type:"checkbox"}); c.checked=L.on; c.onchange=()=>{L.on=c.checked;draw();}; lab.append(c,h("span",null,L.n)); tg.append(lab); });
  const tw=h("div",{class:"tablewrap"}); const out=h("div",{class:"readout"});
  el.append(tg,tw,out);
  const cls=v=>v==="SPAM"?"v-spam":v==="HAM"?"v-ham":"v-abs";
  function draw(){
    const act=LFs.map((L,i)=>[L,i]).filter(([L])=>L.on);
    let cov=0,cor=0,conf=0;
    let html=`<table class="lfgrid"><tr><th>ایمیل</th>${act.map(([L,i])=>`<th>LF${i+1}</th>`).join("")}<th>رأی اکثریت</th><th>برچسب واقعی</th></tr>`;
    emails.forEach(e=>{
      const votes=act.map(([L])=>L.f(e)); const s=votes.filter(v=>v==="SPAM").length, hm=votes.filter(v=>v==="HAM").length;
      const mv = s>hm?"SPAM": hm>s?"HAM": (s+hm>0?"تساوی":"—");
      if(s>0&&hm>0) conf++;
      if(mv==="SPAM"||mv==="HAM"){ cov++; if(mv===e[1]) cor++; }
      html+=`<tr><td class="txt ltr">${e[0]}</td>${votes.map(v=>`<td class="${cls(v)}">${v||"·"}</td>`).join("")}<td class="${cls(mv)}">${mv}</td><td class="${cls(e[1])}">${e[1]}</td></tr>`;
    });
    tw.innerHTML=html+"</table>";
    out.textContent=`پوشش (برچسب قطعی گرفت): ${L(cov+"/"+emails.length)} — دقت روی پوشش‌داده‌ها: ${L(cov?cor+"/"+cov:"—")} — تعارض بین LFها: ${L(conf)} ایمیل\n`+
      `در Snorkel به‌جای رأی اکثریت ساده، یک «مدل برچسب» از روی توافق‌ها و تعارض‌ها دقت هر LF را تخمین می‌زند و وزن می‌دهد.`;
  }
  draw();
}

/* ======================================================================
   Widget 6 — reservoir sampling
   ====================================================================== */
function wReservoir(el){
  shell(el,"🔧 ابزار: آزمایش reservoir sampling","یک جریان $n$تایی را بارها با الگوریتم مخزن نمونه‌گیری می‌کنیم و می‌شماریم هر عنصر چند بار در نمونه‌ی نهایی آمده. اگر الگوریتم درست باشد همه‌ی میله‌ها نزدیک خط $k/n$ هستند.");
  let n=60,k=6,trials=3000;
  const cv=h("canvas",{class:"wide"}); el.append(cv);
  const ctr=h("div",{class:"controls"});
  ctr.append(slider("n (طول جریان)",10,200,1,n,v=>{n=v;run();}), slider("k (اندازه‌ی مخزن)",1,30,1,k,v=>{k=v;run();}));
  const b=h("button",{class:"btn",type:"button"},"↻ اجرای دوباره"); b.onclick=run; ctr.append(b);
  const naive=h("label"); const cb=h("input",{type:"checkbox"}); naive.append(cb," نسخه‌ی غلط: همیشه با احتمال ۱/۲ جایگزین کن"); cb.onchange=run; ctr.append(naive);
  el.append(ctr); const out=h("div",{class:"readout"}); el.append(out);
  let cnt=[];
  function run(){
    const kk=Math.min(k,n); cnt=new Array(n).fill(0);
    for(let t=0;t<trials;t++){
      const R=[]; for(let i=0;i<n;i++){
        if(i<kk) R.push(i);
        else if(cb.checked){ if(Math.random()<0.5) R[Math.floor(Math.random()*kk)]=i; }
        else { const j=Math.floor(Math.random()*(i+1)); if(j<kk) R[j]=i; }
      }
      R.forEach(i=>cnt[i]++);
    }
    draw();
  }
  function draw(){
    const kk=Math.min(k,n); const fr=cnt.map(c=>c/trials); const exp=kk/n;
    const P=new Plot(cv,[0,n+1],[0,Math.max(exp*1.8,Math.max(...fr)*1.1)]); P.axes("شماره‌ی عنصر در جریان","فراوانی حضور در نمونه");
    fr.forEach((f,i)=>P.bar(i+1,0.75,0,f,alpha(css("--plot-c3"),.6)));
    P.hline(exp,css("--plot-c1"),[6,3]);
    const mn=Math.min(...fr), mx=Math.max(...fr);
    out.textContent=`انتظار: ${L("k/n = "+fmt(exp,4))} — کمینه‌ی مشاهده‌شده: ${L(fmt(mn,4))} — بیشینه: ${L(fmt(mx,4))} (${L(trials)} بار تکرار)`+(cb.checked?"\nنسخه‌ی غلط به عنصرهای آخر وزن خیلی بیشتری می‌دهد: نمونه یکنواخت نیست.":"");
  }
  onResize(cv,draw); run();
}

/* ======================================================================
   Widget 7 — imbalance & threshold: confusion matrix and metrics
   ====================================================================== */
function wConfusion(el){
  shell(el,"🔧 ابزار: عدم‌توازن کلاس، آستانه و پارادوکس دقت","امتیاز مدل برای نمونه‌های منفی از توزیع نرمال $\\mathcal N(0,1)$ و برای مثبت‌ها از $\\mathcal N(d,1)$ می‌آید. هر نمونه‌ای که امتیازش از آستانه بیشتر باشد «مثبت» پیش‌بینی می‌شود. کل داده ۱۰٬۰۰۰ نمونه است.");
  let pr=0.02, d=2, th=1.5; const N=10000;
  const cv=h("canvas",{class:"wide"}); el.append(cv);
  const ctr=h("div",{class:"controls"});
  ctr.append(slider("نسبت کلاس مثبت",0.005,0.5,0.005,pr,v=>{pr=v;draw();},v=>(v*100).toFixed(1)+"%"),
             slider("جدایی d",0,5,0.1,d,v=>{d=v;draw();}),
             slider("آستانه",-2,6,0.05,th,v=>{th=v;draw();}));
  const nl=h("label"); const ncb=h("input",{type:"checkbox"}); nl.append(ncb," نمایش هر کلاس با مقیاس خودش (تا کلاس کوچک دیده شود)"); ncb.onchange=()=>draw(); ctr.append(nl);
  el.append(ctr);
  const cm=h("div",{class:"cm"}); const out=h("div",{class:"readout"}); el.append(cm,out);
  function draw(){
    const P_=N*pr, N_=N-P_;
    const TP=P_*(1-Phi(th-d)), FN=P_-TP, FP=N_*(1-Phi(th)), TN=N_-FP;
    const acc=(TP+TN)/N, prec=TP+FP>0?TP/(TP+FP):NaN, rec=TP/P_, f1=(prec+rec)>0?2*prec*rec/(prec+rec):0;
    const pdf=(x,m)=>Math.exp(-(x-m)*(x-m)/2)/Math.sqrt(2*Math.PI);
    const xs=[...Array(301)].map((_,i)=>-4+i*(d+8)/300);
    const sN=ncb.checked?1:N_, sP=ncb.checked?1:P_;
    const ymax=Math.max(sN*pdf(0,0),sP*pdf(d,d))*1.1;
    const P=new Plot(cv,[-4,d+4],[0,ymax],{l:50}); P.axes("امتیاز مدل",ncb.checked?"چگالی":"تعداد (چگالی)");
    P.area(xs.map(x=>[x,sN*pdf(x,0)]),alpha(css("--plot-c3"),.25)); P.line(xs.map(x=>[x,sN*pdf(x,0)]),css("--plot-c3"),2);
    P.area(xs.map(x=>[x,sP*pdf(x,d)]),alpha(css("--plot-c2"),.3)); P.line(xs.map(x=>[x,sP*pdf(x,d)]),css("--plot-c2"),2);
    P.vline(th,css("--plot-fn"),[6,3]);
    P.text(-3.6,ymax*0.92,"منفی‌ها",css("--plot-c3"),"left"); P.text(d+3.6,ymax*0.92,"مثبت‌ها",css("--plot-c2"),"right");
    const r=x=>Math.round(x).toLocaleString("en");
    cm.innerHTML=`<div class="h"></div><div class="h">Actual +</div><div class="h">Actual −</div>
      <div class="h">Pred +</div><div class="tp">TP = ${r(TP)}</div><div class="fp">FP = ${r(FP)}</div>
      <div class="h">Pred −</div><div class="fn">FN = ${r(FN)}</div><div class="tn">TN = ${r(TN)}</div>`;
    out.textContent=`معیارها: ${L("Accuracy = "+fmt(acc,4)+"   Precision = "+(isFinite(prec)?fmt(prec,3):"—")+"   Recall = "+fmt(rec,3)+"   F1 = "+fmt(f1,3))}\n`+
      `مدل احمقی که همیشه «منفی» می‌گوید: ${L("Accuracy = "+fmt(1-pr,4)+" , Recall = 0")}\n`+
      (acc<1-pr?"⚠ دقت مدل تو از مدل احمق کمتر است، ولی شاید Recall خیلی بهتری دارد. برای داده‌ی نامتوازن Accuracy معیار گمراه‌کننده‌ای است.":"");
  }
  onResize(cv,draw); draw();
}

/* ======================================================================
   Widget 8 — hashing trick collisions
   ====================================================================== */
function wHashing(el){
  shell(el,"🔧 ابزار: اندازه‌ی فضای hash و برخورد","$n$ دسته (مثلاً برند) را با یک تابع hash یکنواخت در $m$ خانه می‌ریزیم. سهم دسته‌هایی که حداقل با یک دسته‌ی دیگر هم‌خانه می‌شوند: $1-(1-1/m)^{n-1}$.");
  let lgN=24, lgM=20;
  const cv=h("canvas",{class:"wide"}); el.append(cv);
  const ctr=h("div",{class:"controls"});
  const show=v=>"2^"+v+" ≈ "+Math.round(2**v).toLocaleString("en");
  ctr.append(slider("تعداد دسته‌ها n",4,26,1,lgN,v=>{lgN=v;draw();},v=>Math.round(10**(v/4)).toLocaleString("en")),
             slider("اندازه‌ی فضای hash m",4,30,1,lgM,v=>{lgM=v;draw();},show));
  el.append(ctr); const out=h("div",{class:"readout"}); el.append(out);
  function draw(){
    const n=Math.round(10**(lgN/4)), m=2**lgM;
    const frac=lm=>{ const mm=2**lm; return 1-Math.exp((n-1)*Math.log1p(-1/mm)); };
    const pts=[]; for(let x=4;x<=30;x+=0.1) pts.push([x,frac(x)]);
    const P=new Plot(cv,[4,30],[0,1]); P.axes("log₂ m","سهم دسته‌های دارای برخورد",{xstep:2,yfmt:y=>Math.round(y*100)+"%"});
    P.line(pts,css("--plot-c1"),2.4); P.dot(lgM,frac(lgM),css("--plot-c2"),5);
    const f=frac(lgM);
    out.textContent=`تعداد دسته‌ها ${L("n = "+n.toLocaleString("en"))}، تعداد خانه‌ها ${L("m = "+m.toLocaleString("en"))}\n`+
      `حدود ${L((f*100).toFixed(2)+"%")} دسته‌ها با حداقل یک دسته‌ی دیگر هم‌خانه‌اند (حدود ${L(Math.round(f*n).toLocaleString("en"))} دسته)\n`+
      `احتمال این‌که یک برند تازه‌وارد با یکی از موجودها برخورد کند: ${L((100*(1-Math.exp(n*Math.log1p(-1/m)))).toFixed(2)+"%")}\n`+
      `قاعده‌ی سرانگشتی: وقتی ${L("m ≫ n")} است، سهم برخورد تقریباً ${L("n/m = "+(100*n/m).toFixed(3)+"%")}`;
  }
  onResize(cv,draw); draw();
}

/* ---------- boot ---------- */
const WIDGETS={ensemble:wEnsemble, objmix:wObjMix, bytes:wBytes, fresh:wFresh, lfvote:wLFVote, reservoir:wReservoir, confusion:wConfusion, hashing:wHashing};
window.ML={Plot,css,fmt,fa,h,slider,onResize,SESSIONS,PARTS,fileOf,loadProg,WIDGETS,renderMath};
function boot(){
  buildChrome(); buildQuiz();
  document.querySelectorAll("[data-widget]").forEach(el=>{ const f=WIDGETS[el.dataset.widget]; if(f){ try{ f(el); }catch(e){ el.textContent="خطا در ابزار: "+e.message; console.error(e); } } });
  if(window.PAGE_INIT) try{ window.PAGE_INIT(window.ML); }catch(e){ console.error(e); }
  renderMath(document.body);
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
})();
