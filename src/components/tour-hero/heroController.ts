/* =====================================================================
   Hero: floor plan + timestamps + room cards
   React renders the static markup once; a small imperative controller (Web Animations API) runs the
   sequence. One `alive` token + reset() cancels every running animation, removes cards and restores the
   plan, so leaving/re-entering the viewport, resizing or switching desktop/mobile can never leave a
   half-finished state behind.
   Geometry is the Figma "Hero2" frame (1440 x 880). Each timestamp is anchored by its DOT CENTRE.
   ===================================================================== */

export type HeroRoomKey = "kitchen" | "living" | "guest";
export type HeroRoom = {
  k: HeroRoomKey;
  time: string;
  tone: "night" | "soft";
  /** dot centre in the 1440 x 880 Figma frame */
  dot: [number, number];
  /** desktop card width */
  w: number;
  /** card position relative to the chip, always 16px away */
  place: "above" | "right" | "below";
  t: string;
  d: string;
  /** [ms after the previous step, phase] (null = close) */
  tl: [number, number | null][];
};

export const HERO_ROOMS: HeroRoom[] = [
  { k: "kitchen", time: "2:20", tone: "night", dot: [1114, 358], w: 300, place: "above",
    t: "Kitchen", d: "Steven updated his budget to a max of $2,200 per month.", tl: [[800, 1], [320, 2], [1100, 3], [1900, null]] },
  { k: "living", time: "4:17", tone: "night", dot: [882, 722], w: 280, place: "right",
    t: "Living Room", d: "Steven mentioned he’s adding his pet, Biscuit, to the lease.", tl: [[1300, 1], [2000, null]] },
  { k: "guest", time: "8:47", tone: "soft", dot: [390, 190], w: 280, place: "below",
    t: "Guest Room", d: "Agent failed to address the objection about no in-unit laundry.", tl: [[700, 1], [1900, 3], [2000, null]] },
];

const H_SPIN = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x=".75" y=".75" width="14" height="14" rx="7" stroke="#DFDBFF" stroke-width="1.5"/><path d="M14.75 7.75a7 7 0 1 1-7-7" stroke="#6B4FFF" stroke-width="1.5" stroke-linecap="round"/></svg>';
const H_CHECK = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path class="ck" d="M2.33 7L5.25 9.92 11.67 3.5" stroke="#3F3E3C" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>';

type Room = HeroRoom & { el: HTMLElement; cw: number };

export function createHeroController(root: HTMLElement) {
  const E = "cubic-bezier(.22,1,.36,1)", DRAW = "cubic-bezier(.65,0,.35,1)", NS = "http://www.w3.org/2000/svg";
  const q = <T extends Element = HTMLElement>(s: string) => root.querySelector(s) as T;
  const det = q<SVGSVGElement>("[data-det]"), walls = q<SVGSVGElement>("[data-walls]"), layA = q("[data-layer-a]"), layB = q("[data-layer-b]");
  const copy = q("[data-copy]"), glow = q("[data-glow]"), mcards = q("[data-mcards]");
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* per-instance copies, so two heroes (or StrictMode's double mount) never share chip elements */
  const ROOMS: Room[] = HERO_ROOMS.map((r) => ({ ...r, el: q(`[data-chip="${r.k}"]`), cw: 0 }));
  let anims: Animation[] = [], alive = 0, timers: ReturnType<typeof setTimeout>[] = [];
  let mobile = false, S = 1, OX = 0, OY = 0, focus: [number, number] | null = null, inView = false, started = false;
  const a = (el: Element, kf: Keyframe[], o: KeyframeAnimationOptions) => {
    const x = el.animate(kf, Object.assign({ fill: "both" as FillMode }, o));
    anims.push(x);
    return x;
  };
  const wait = (ms: number, id: number) =>
    new Promise<void>((res, rej) => {
      timers.push(setTimeout(() => (id === alive ? res() : rej("stop")), ms));
    });
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

  /* ---------- layout ---------- */
  function layout(animateCam: boolean) {
    const W = root.clientWidth, wasMobile = mobile;
    mobile = W < 768;
    let H: number;
    if (!mobile) {
      H = Math.max(640, Math.round((W * 880) / 1440));
      S = Math.min(W / 1440, H / 880); OX = (W - 1440 * S) / 2; OY = (H - 880 * S) / 2; /* centred exactly */
    } else {
      S = clamp(W / 620, 0.55, 0.8);
      const cr = copy.getBoundingClientRect(), rr = root.getBoundingClientRect();
      const copyBottom = cr.bottom - rr.top, ty = copyBottom + 96; /* where the active dot sits */
      const f = focus || [720, 330];
      OX = clamp(W / 2 - S * f[0], W - 1440 * S, 0); OY = ty - S * f[1];
      H = Math.max(780, Math.round(ty + 32 + 170 + 44));
      mcards.style.top = ty + 0.8 * 16 + 16 + "px";
      glow.style.top = (96 + copyBottom) / 2 + "px";
    }
    root.style.height = H + "px";
    const tr = `translate(${OX}px,${OY}px) scale(${S})`, tt = mobile && animateCam ? `transform 1.1s ${DRAW}` : "none";
    [layA, layB].forEach((l) => { l.style.transition = tt; l.style.transform = tr; });
    /* chips: dot centre on the Figma point; on mobile they keep a readable 0.8 size */
    const k = mobile ? 0.8 / S : 1;
    ROOMS.forEach((r) => {
      const w = r.el.offsetWidth;
      r.el.style.left = r.dot[0] + 16 - w + "px"; r.el.style.top = r.dot[1] - 16 + "px";
      r.el.style.transformOrigin = `${w - 16}px 16px`; r.el.style.transform = k === 1 ? "" : `scale(${k})`; r.cw = w;
    });
    if (started && wasMobile !== mobile) restart();
  }

  /* ---------- plan draw-in ---------- */
  function drawPlan() {
    walls.querySelectorAll("path").forEach((el, i) => {
      el.setAttribute("pathLength", "1"); el.style.strokeDasharray = "1 1";
      a(el, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1300, delay: i * 60, easing: DRAW });
    });
    const maxD = Math.hypot(720, 440);
    let defs = det.querySelector("defs");
    if (!defs) { defs = document.createElementNS(NS, "defs"); det.prepend(defs); }
    let uid = 0;
    [...det.querySelectorAll<SVGGraphicsElement>("path,text")].filter((el) => !el.closest("clipPath,mask,defs")).forEach((el) => {
      let bb: DOMRect;
      try { bb = el.getBBox(); } catch { return; }
      const k = Math.min(1, Math.hypot(bb.x + bb.width / 2 - 720, bb.y + bb.height / 2 - 440) / maxD), delay = 250 + k * 900, cs = getComputedStyle(el);
      const isPath = el.tagName === "path", solid = cs.strokeDasharray === "none" || cs.strokeDasharray === "";
      if (isPath && cs.stroke !== "none" && solid) {
        el.setAttribute("pathLength", "1"); el.style.strokeDasharray = "1 1";
        a(el, [{ strokeDashoffset: 1, fillOpacity: 0 }, { strokeDashoffset: 0, fillOpacity: 1 }], { duration: 1100, delay, easing: DRAW });
      } else if (isPath && cs.stroke !== "none") {
        /* dashed / dotted lines draw through a solid copy used as a mask */
        const m = document.createElementNS(NS, "mask"), id = "hm" + ++uid;
        m.setAttribute("id", id); m.setAttribute("data-hm", ""); m.setAttribute("maskUnits", "userSpaceOnUse");
        m.setAttribute("x", "-2000"); m.setAttribute("y", "-2000"); m.setAttribute("width", "6000"); m.setAttribute("height", "6000");
        const c = document.createElementNS(NS, "path");
        c.setAttribute("d", el.getAttribute("d") || ""); c.setAttribute("fill", "none"); c.setAttribute("stroke", "#fff");
        c.setAttribute("stroke-width", String(parseFloat(cs.strokeWidth) + 6)); c.setAttribute("pathLength", "1"); c.style.strokeDasharray = "1 1";
        m.appendChild(c); defs!.appendChild(m); el.setAttribute("mask", `url(#${id})`);
        a(c, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1100, delay, easing: DRAW });
      } else {
        a(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: delay + 450, easing: "ease" });
      }
    });
  }
  function copyIn() {
    const [h, p, b] = copy.querySelectorAll("[data-in]");
    if (h) a(h, [{ opacity: 0, transform: "translateY(14px)", filter: "blur(4px)" }, { opacity: 1, transform: "none", filter: "blur(0px)" }], { duration: 1000, delay: 450, easing: E });
    if (p) a(p, [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 1000, delay: 580, easing: E });
    if (b) a(b, [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 1000, delay: 700, easing: E });
  }
  function showChip(r: Room, i: number) {
    a(r.el.querySelector(".pill")!, [{ opacity: 0, transform: "translateX(6px)" }, { opacity: 1, transform: "none" }], { duration: 600, delay: 100, easing: E });
    a(r.el.querySelector(".pt")!, [{ opacity: 0, transform: "scale(.85)" }, { opacity: 1, transform: "none" }], { duration: 600, easing: E });
    a(r.el.querySelector(".pulse-ring")!, [{ opacity: 0, inset: "0px", offset: 0 }, { opacity: 1, inset: "-1px", offset: 0.12 }, { opacity: 0, inset: "-9px", offset: 1 }],
      { duration: 2800, delay: 600 + i * 900, iterations: Infinity, easing: "cubic-bezier(.2,.6,.35,1)" });
  }

  /* ---------- room cards ---------- */
  function cardFor(r: Room) {
    const c = document.createElement("div");
    c.className = "hrc";
    let body = "";
    if (r.k === "kitchen") body = '<div class="row"><span class="spin">' + H_SPIN + '</span><span class="old">$2,000<i></i></span></div>';
    if (r.k === "living") body = '<div class="cols">' + [["Pet", "Dog"], ["Breed", "Corgi"], ["Name", "Biscuit"]].map((p, i) => (i ? '<i class="sep"></i>' : "") +
      '<div class="col"><span class="k">' + p[0] + '</span><span class="v"><i class="sk"></i><span class="val" style="transition-delay:' + i * 100 + 'ms">' + p[1] + "</span></span></div>").join("") + "</div>";
    if (r.k === "guest") body = '<div class="sc"><div class="lbl"><span>Providing Solutions</span><span>5/15pts</span></div><div class="segs">' + "<span><b></b></span>".repeat(7) + "</div></div>";
    c.innerHTML = '<div class="tx"><h4>' + r.t + "</h4><p>" + r.d + '</p></div><div class="hr"></div><div class="bd">' + body + "</div>";
    if (mobile) {
      c.style.left = "0"; c.style.right = "0"; c.style.top = "0"; c.style.transformOrigin = "50% 0%"; mcards.appendChild(c);
    } else {
      /* 16px from the chip, exactly as in the Figma frames */
      c.style.width = r.w + "px";
      const L = r.dot[0] + 16 - r.cw, T = r.dot[1] - 16;
      if (r.place === "above") { c.style.left = L + "px"; c.style.bottom = 880 - T + 16 + "px"; c.style.transformOrigin = "0% 100%"; }
      if (r.place === "right") { c.style.left = L + r.cw + 16 + "px"; c.style.bottom = 880 - T - 32 + "px"; c.style.transformOrigin = "0% 100%"; }
      if (r.place === "below") { c.style.left = L + r.cw - r.w + "px"; c.style.top = T + 32 + 16 + "px"; c.style.transformOrigin = "100% 0%"; } /* right edges aligned */
      layB.appendChild(c);
    }
    a(c, [{ opacity: 0, transform: "scale(.94)", filter: "blur(4px)" }, { opacity: 1, transform: "none", filter: "blur(0px)" }], { duration: 550, easing: E });
    a(c.querySelector(".tx")!, [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], { duration: 400, delay: 120, easing: E });
    a(c.querySelector(".bd")!, [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], { duration: 400, delay: 220, easing: E });
    return c;
  }
  function swapBody(c: HTMLElement, html: string) {
    const bd = c.querySelector(".bd")!, old = bd.firstElementChild as HTMLElement, t = document.createElement("div");
    t.innerHTML = html;
    const n = t.firstElementChild as HTMLElement;
    old.style.position = "absolute"; old.style.left = "0"; old.style.right = "0"; old.style.top = "0";
    a(old, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-6px)" }], { duration: 400, easing: E }).finished.then(() => old.remove(), () => {});
    bd.appendChild(n);
    a(n, [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 400, easing: E });
    return n;
  }
  function phase(r: Room, c: HTMLElement, p: number) {
    if (r.k === "kitchen") {
      if (p === 1) { const o = c.querySelector<HTMLElement>(".old")!; o.style.color = "#A9A8A6"; o.querySelector("i")!.style.transform = "scaleX(1)"; }
      if (p === 2) { const sp = c.querySelector<HTMLElement>(".spin")!; sp.style.opacity = "1"; sp.style.transform = "none"; }
      if (p === 3) {
        const n = swapBody(c, '<div class="row">' + H_CHECK + '$2,200<span class="badge">Complete</span></div>');
        a(n.querySelector(".ck")!, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 350, delay: 100, easing: "ease" });
        a(n.querySelector(".badge")!, [{ opacity: 0, transform: "scale(.85)" }, { opacity: 1, transform: "none" }], { duration: 450, delay: 180, easing: E });
      }
    }
    if (r.k === "living" && p === 1) c.classList.add("p1");
    if (r.k === "guest") {
      if (p === 1) {
        const bs = [...c.querySelectorAll<HTMLElement>(".segs b")], t0 = performance.now(), id = alive;
        const f = (now: number) => {
          if (id !== alive || !c.isConnected) return;
          const k = Math.min(1, (now - t0) / 1100), v = 2 * (1 - Math.pow(1 - k, 2.4));
          bs.forEach((b, i) => { b.style.transform = "scaleX(" + Math.min(Math.max(v - i, 0), 1) + ")"; });
          if (k < 1) requestAnimationFrame(f);
        };
        f(t0);
      }
      if (p === 3) swapBody(c, '<div class="coach">' + H_SPIN.replace('width="16" height="16"', 'width="14" height="14"') + "Coaching</div>");
    }
  }

  async function loop(id: number) {
    try {
      await wait(350, id);
      ROOMS[0].el.classList.add("live"); showChip(ROOMS[0], 0);
      timers.push(setTimeout(() => { if (id === alive) showChip(ROOMS[1], 1); }, 450));
      timers.push(setTimeout(() => { if (id === alive) showChip(ROOMS[2], 2); }, 600));
      let i = 0, first = true;
      while (true) {
        const r = ROOMS[i];
        ROOMS.forEach((x, j) => x.el.classList.toggle("live", j === i));
        if (mobile && !first) { focus = [r.dot[0], r.dot[1]]; layout(true); await wait(1150, id); }
        await wait(first ? 120 : 200, id);
        first = false;
        const c = cardFor(r);
        for (const [ms, p] of r.tl) { await wait(ms, id); if (p !== null) phase(r, c, p); }
        a(c, [{ opacity: 1, transform: "none", filter: "blur(0px)" }, { opacity: 0, transform: "scale(.97)", filter: "blur(2px)" }], { duration: 350, easing: E })
          .finished.then(() => c.remove(), () => c.remove());
        await wait(500, id);
        i = (i + 1) % ROOMS.length;
      }
    } catch { /* stopped */ }
  }
  function reset() {
    alive++; timers.forEach(clearTimeout); timers = [];
    anims.forEach((x) => x.cancel()); anims = [];
    root.querySelectorAll(".hrc").forEach((c) => c.remove());
    ROOMS.forEach((r) => r.el.classList.remove("live"));
    root.querySelectorAll("[data-hm]").forEach((m) => m.remove());
    det.querySelectorAll("[mask]").forEach((el) => el.removeAttribute("mask"));
    root.querySelectorAll<SVGElement>("svg [pathLength]").forEach((el) => {
      if (!el.classList.contains("ck")) { el.removeAttribute("pathLength"); el.style.strokeDasharray = ""; }
    });
    focus = null;
  }
  function start() {
    reset(); started = true; focus = [ROOMS[0].dot[0], ROOMS[0].dot[1]]; layout(false); /* mobile: the first dot starts centred */
    const id = alive;
    if (RM) { root.classList.add("h-static"); return; }
    drawPlan(); copyIn(); loop(id);
  }
  function restart() { if (inView) start(); }
  function stop() { reset(); started = false; layout(false); }

  layout(false);
  const ro = new ResizeObserver(() => layout(false));
  ro.observe(root);
  const io = new IntersectionObserver((es) => {
    const e = es[es.length - 1];
    if (e.isIntersecting && !inView) { inView = true; start(); }
    else if (!e.isIntersecting && inView) { inView = false; stop(); }
  }, { threshold: 0.25 });
  io.observe(root);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => layout(false));
  return { destroy() { reset(); ro.disconnect(); io.disconnect(); } };
}
