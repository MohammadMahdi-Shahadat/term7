/* ===== Computer Simulation (Sharif 22889, Fall 1405) study notes — shared engine ===== */
(function(){
"use strict";

/* ---------- course plan ---------- */
const SESSIONS = [
  {n:1, part:"الف", title:"شبیه‌سازی چیست و کی به کار می‌آید؟", src:"اسلاید Ch.1 · Banks فصل ۱", built:true},
  {n:2, part:"الف", title:"سیستم، اجزا و مدل: موجودیت، ویژگی، فعالیت، رویداد و حالت", src:"اسلاید Ch.1 · تمرین ۱ سؤال ۱", built:true},
  {n:3, part:"الف", title:"معیارهای عملکرد، مونت‌کارلو، مدل پیوسته و مراحل یک مطالعه", src:"اسلاید Ch.1 · تمرین ۱ سؤال ۲، ۳ و ۸", built:true},
  {n:4, part:"الف", title:"شبیه‌سازی دستی با جدول: صف تک‌سرور", src:"اسلاید Ch.2 · تمرین ۱ سؤال ۴ و ۷", built:true},
  {n:5, part:"الف", title:"مرکز تماس با دو کارمند و سیستم موجودی (M, N)", src:"اسلاید Ch.2 · تمرین ۱ سؤال ۵ و ۶", built:true},
  {n:6, part:"ب", title:"مفاهیم شبیه‌سازی گسسته‌پیشامد: حالت، رویداد، فعالیت و تأخیر", src:"جزوه Ch.3 ص ۱–۲۰ · تمرین ۲ سؤال ۱ و ۶ · تمرین ۳ سؤال ۱", built:true},
  {n:7, part:"ب", title:"دیدگاه‌های مدل‌سازی و اجرای دستی با فهرست رویدادهای آینده", src:"جزوه Ch.3 ص ۲۱–۳۸ · تمرین ۳ سؤال ۲ و ۳", built:true},
  {n:8, part:"ب", title:"پیاده‌سازی: جاوا، چارچوب شیءگرا و گراف‌های شبیه‌سازی", src:"جزوه Ch.3 ص ۳۹–۷۸ · تمرین ۳ سؤال ۸", built:true},
  {n:9, part:"ب", title:"مبانی احتمال: متغیر تصادفی، امید، واریانس، همبستگی و CLT", src:"جزوه Ch.5 ص ۱–۲۷", built:true},
  {n:10, part:"ب", title:"توزیع‌های گسسته و پیوسته و خاصیت بی‌حافظگی", src:"جزوه Ch.5 ص ۲۸–۵۰ · تمرین ۳ سؤال ۴", built:true},
  {n:11, part:"ب", title:"فرایند پواسون، توزیع تجربی و مدل‌های آماری کاربردی", src:"جزوه Ch.5 ص ۵۱–۷۰", built:true},
  {n:12, part:"ج", title:"تولید اعداد شبه‌تصادفی: مربع میانی، LCG و مولدهای ترکیبی", src:"جزوه Ch.6 ص ۱–۳۴ · تمرین ۳ سؤال ۵", built:true},
  {n:13, part:"ج", title:"آزمون اعداد تصادفی: کولموگروف–اسمیرنف، خی‌دو و خودهمبستگی", src:"جزوه Ch.6 ص ۳۵–۵۸ · تمرین ۳ سؤال ۶ و ۷", built:true},
  {n:14, part:"ج", title:"تولید متغیر تصادفی: تبدیل معکوس و پذیرش–رد", src:"Banks فصل ۸", built:false},
  {n:15, part:"ج", title:"مدل‌سازی ورودی: جمع‌آوری داده، برازش و آزمون نیکویی برازش", src:"Banks فصل ۹", built:false},
  {n:16, part:"ج", title:"صحت‌سنجی و اعتبارسنجی مدل", src:"Banks فصل ۱۰", built:false},
  {n:17, part:"ج", title:"تحلیل خروجی (۱): شبیه‌سازی پایان‌پذیر و بازه‌ی اطمینان", src:"Banks فصل ۱۱", built:false},
  {n:18, part:"ج", title:"تحلیل خروجی (۲): حالت پایدار، دوره‌ی گرم‌شدن و batch means", src:"Banks فصل ۱۱", built:false},
  {n:19, part:"ج", title:"مقایسه‌ی سیستم‌ها و طراحی آزمایش", src:"Banks فصل ۱۲", built:false},
  {n:20, part:"ج", title:"مرور پایان‌ترم", src:"—", built:false},
];
const PARTS = {
  "الف":"بخش الف · مبانی و شبیه‌سازی با جدول (فصل ۱ و ۲؛ درس‌داده‌شده)",
  "ب":"بخش ب · اصول شبیه‌سازی گسسته‌پیشامد و مدل‌های آماری (فصل ۳ و ۵؛ درس‌داده‌شده)",
  "ج":"بخش ج · اعداد تصادفی، مدل‌سازی ورودی، اعتبارسنجی و تحلیل خروجی"
};
const fa = n => String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
const pad = n => String(n).padStart(2,"0");
const fileOf = n => `session-${pad(n)}.html`;

/* ---------- storage (best effort) ---------- */
const KEY = "sim2026.progress.v1";
function loadProg(){ try{ return JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){ return {}; } }
function saveProg(p){ try{ localStorage.setItem(KEY, JSON.stringify(p)); }catch(e){} }

/* ---------- theme ---------- */
function getTheme(){ try{ return localStorage.getItem("sim2026.theme"); }catch(e){ return null; } }
function applyTheme(t){ if(t) document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme"); }
applyTheme(getTheme());
function toggleTheme(){
  const dark = document.documentElement.getAttribute("data-theme")==="dark" ||
    (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
  const t = dark ? "light" : "dark";
  applyTheme(t); try{ localStorage.setItem("sim2026.theme", t); }catch(e){}
  document.querySelectorAll("[data-redraw]").forEach(el=>el._redraw && el._redraw());
}

/* ---------- page chrome ---------- */
function buildChrome(){
  const sn = +document.body.dataset.session || 0;
  const s = SESSIONS.find(x=>x.n===sn);
  const bar = document.createElement("header");
  bar.className = "topbar";
  bar.innerHTML = `<div class="in"><a class="home" href="index.html"><svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="14" cy="14" r="11"/><path d="M14 7v7l5 3"/><path d="M3 14h2M23 14h2M14 3v2M14 23v2"/></svg><span>شبیه‌سازی کامپیوتری</span><span class="code">22889</span></a>
    <span class="crumb">${s ? `/ جلسه‌ی ${fa(sn)} · ${s.title}` : ""}</span>
    <button type="button" id="themeBtn" aria-label="تغییر تم روشن و تاریک"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z"/></svg><span>تم</span></button></div><div class="progresstrack"><div class="progressbar"></div></div>`;
  document.body.prepend(bar);
  bar.querySelector("#themeBtn").onclick = toggleTheme;
  const pb = bar.querySelector(".progressbar");
  addEventListener("scroll", ()=>{ const h=document.documentElement; pb.style.width = (100*h.scrollTop/Math.max(1,h.scrollHeight-h.clientHeight))+"%"; }, {passive:true});

  const main = document.querySelector("main");
  const toc = document.querySelector("nav.toc");
  if(toc && main){
    // two-column layout: sticky side TOC + content
    const layout = document.createElement("div"); layout.className = "layout";
    main.parentNode.insertBefore(layout, main);
    const side = document.createElement("aside"); side.className = "side";
    side.innerHTML = `<div class="sh">${s ? "در این جلسه" : "در این صفحه"}</div>`;
    side.appendChild(toc);
    if(!toc.getAttribute("aria-label")) toc.setAttribute("aria-label","فهرست این صفحه");
    layout.append(side, main);
    const links = [];
    document.querySelectorAll("main section[id] > h2").forEach(h=>{
      const a=document.createElement("a"); a.href="#"+h.parentElement.id;
      const cl=h.cloneNode(true); cl.querySelectorAll(".tag,.num").forEach(t=>t.remove());
      const num = h.querySelector(".num");
      a.textContent = (num ? num.textContent.trim().replace(/^0+(?=\d)/,"") + ". " : "") + (h.dataset.short || cl.textContent.replace(/\s+/g," ").trim());
      if(num) a.textContent = a.textContent.replace(/^\d+/, d=>fa(d));
      toc.appendChild(a); links.push([h.parentElement, a]);
    });
    if(links.length && "IntersectionObserver" in window){
      const io = new IntersectionObserver(es=>{
        es.forEach(e=>{ if(e.isIntersecting){ links.forEach(([,a])=>a.classList.remove("on")); const l=links.find(([sec])=>sec===e.target); if(l) l[1].classList.add("on"); } });
      }, {rootMargin:"-20% 0px -70% 0px"});
      links.forEach(([sec])=>io.observe(sec));
    }
  }
  if(!s) return;
  const k = document.querySelector(".hero .kicker");
  if(k && !k.querySelector(".clock")){ const c=document.createElement("span"); c.className="clock"; c.textContent=`t = ${pad(sn)} / ${SESSIONS.length}`; k.prepend(c); }
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
  const pager = document.createElement("nav"); pager.className="pager"; pager.setAttribute("aria-label","جلسه‌ی قبل و بعد");
  pager.innerHTML = (prev?`<a href="${fileOf(prev.n)}"><small>جلسه‌ی قبل</small>${fa(prev.n)}. ${prev.title}</a>`:`<a href="index.html"><small>بازگشت</small>فهرست جلسه‌ها</a>`) +
    (next && next.built ? `<a class="next" href="${fileOf(next.n)}"><small>جلسه‌ی بعد</small>${fa(next.n)}. ${next.title}</a>` : `<a class="next" href="index.html"><small>بازگشت</small>فهرست جلسه‌ها</a>`);
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
    score.innerHTML = `<span>امتیاز: ${fa(correct)} از ${fa(Q.length)}</span><span style="opacity:.75;font-weight:500">پاسخ‌داده: ${fa(answered)}</span><button class="btn ghost" type="button">از نو</button>`;
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

/* ---------- python code blocks: highlight + copy ---------- */
function hiPy(src){
  const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const KW=/^(def|return|import|from|as|for|in|if|elif|else|while|with|lambda|True|False|None|and|or|not|is|class|try|except|finally|raise|yield|pass|break|continue)$/;
  const re=/(#[^\n]*)|("""[\s\S]*?"""|f?"(?:\\.|[^"\\\n])*"|f?'(?:\\.|[^'\\\n])*')|(\b\d+(?:\.\d+)?(?:e-?\d+)?\b)|([A-Za-z_]\w*)(\s*\()?|([\s\S])/g;
  let out="",m;
  while((m=re.exec(src))){
    if(m[1]) out+=`<span class="c">${esc(m[1])}</span>`;
    else if(m[2]) out+=`<span class="s">${esc(m[2])}</span>`;
    else if(m[3]) out+=`<span class="n">${m[3]}</span>`;
    else if(m[4]){ if(KW.test(m[4])) out+=`<span class="k">${m[4]}</span>`+(m[5]||""); else if(m[5]) out+=`<span class="f">${m[4]}</span>${m[5]}`; else out+=m[4]; }
    else out+=esc(m[6]);
  }
  return out;
}
function buildCode(){
  document.querySelectorAll("pre.code").forEach(pre=>{
    if(pre.dataset.done) return; pre.dataset.done="1";
    const raw=pre.textContent.replace(/^\n+|\s+$/g,"");
    if(!pre.classList.contains("plain")) pre.innerHTML=hiPy(raw); else pre.textContent=raw;
    const wrap=document.createElement("div"); wrap.className="codewrap";
    pre.parentNode.insertBefore(wrap,pre); wrap.appendChild(pre);
    const b=document.createElement("button"); b.type="button"; b.className="copy"; b.textContent="کپی";
    b.onclick=()=>{ const done=()=>{ b.textContent="✓ کپی شد"; setTimeout(()=>{b.textContent="کپی";},1400); };
      try{ navigator.clipboard.writeText(raw).then(done,()=>{}); }catch(e){} };
    wrap.appendChild(b);
  });
}

/* ---------- boot ---------- */
const WIDGETS={};
window.ML={Plot,css,fmt,fa,h,slider,onResize,SESSIONS,PARTS,fileOf,loadProg,saveProg,WIDGETS,renderMath,alpha,shell,erf,Phi,L,niceStep};
function boot(){
  buildChrome(); buildQuiz(); buildCode();
  document.querySelectorAll("[data-widget]").forEach(el=>{ const f=WIDGETS[el.dataset.widget]; if(f){ try{ f(el); }catch(e){ el.textContent="خطا در ابزار: "+e.message; console.error(e); } } });
  if(window.PAGE_INIT) try{ window.PAGE_INIT(window.ML); }catch(e){ console.error(e); }
  renderMath(document.body);
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
})();
