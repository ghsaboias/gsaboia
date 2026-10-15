const root = document.documentElement;
const cvCss = document.getElementById("cv-css");
const artCss = document.getElementById("art-css");
const toggle = document.getElementById("art-toggle");
const screen = document.getElementById("screen");
const tube = document.getElementById("tube");
const osdLabel = document.getElementById("osd-label");
const osdCh = document.getElementById("osd-ch");
const sections = [...tube.querySelectorAll("section[data-ch]")];
const labeled = sections.filter((s) => s.dataset.label);
const navLinks = [...document.querySelectorAll("nav a")];
const buttons = [...document.querySelectorAll(".buttons button")];
const tapes = [...document.querySelectorAll(".tape")];
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

let current = 0;
let timer;

const isArt = () => root.classList.contains("art");

function tune(n, { label, target } = {}) {
  const head = labeled.find((s) => +s.dataset.ch === n);
  if (!head) return;
  current = n;

  navLinks.forEach((a) => a.setAttribute("aria-current", +a.dataset.ch === n));
  buttons.forEach((b) => b.setAttribute("aria-pressed", +b.dataset.ch === n));
  osdCh.textContent = `CH ${String(n).padStart(2, "0")}`;
  osdLabel.textContent = label || head.dataset.label;

  const show = () => {
    sections.forEach((s) => s.classList.toggle("on", +s.dataset.ch === n));
    screen.classList.remove("static");
    tube.scrollTop = target ? target.offsetTop - 62 : 0;
  };

  clearTimeout(timer);
  if (calm) return show();
  screen.classList.add("static");
  timer = setTimeout(show, 220);
}

function play(tape) {
  const job = document.getElementById(tape.dataset.tape);
  const n = +job.closest("section").dataset.ch;
  tapes.forEach((t) => t.classList.toggle("in", t === tape));
  document.querySelectorAll(".job").forEach((j) => j.classList.toggle("playing", j === job));
  tune(n, { label: tape.querySelector(".label").textContent.toUpperCase(), target: job });
}

function fromHash() {
  const head = labeled.find((s) => `#${s.id}` === location.hash);
  return head ? +head.dataset.ch : 1;
}

function setArt(on) {
  root.classList.toggle("art", on);
  cvCss.media = on ? "not all" : "all";
  artCss.media = on ? "all" : "not all";
  toggle.setAttribute("aria-checked", on);
  try {
    localStorage.setItem("view", on ? "art" : "cv");
  } catch (e) {}
  if (on) {
    scrollTo(0, 0);
    tune(fromHash());
  }
}

toggle.addEventListener("click", () => setArt(!isArt()));

navLinks.forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    history.replaceState(null, "", a.getAttribute("href"));
    tune(+a.dataset.ch);
  }),
);

document.querySelector(".wordmark").addEventListener("click", (e) => {
  e.preventDefault();
  history.replaceState(null, "", "#about");
  tune(1);
});

buttons.forEach((b) => b.addEventListener("click", () => tune(+b.dataset.ch)));
tapes.forEach((t) => t.addEventListener("click", () => play(t)));
addEventListener("hashchange", () => isArt() && tune(fromHash()));

addEventListener("keydown", (e) => {
  if (!isArt() || e.metaKey || e.ctrlKey || e.altKey) return;
  const n = labeled.length;
  if (/^[1-9]$/.test(e.key) && +e.key <= n) tune(+e.key);
  else if (e.key === "ArrowRight") tune((current % n) + 1);
  else if (e.key === "ArrowLeft") tune(((current + n - 2) % n) + 1);
});

toggle.setAttribute("aria-checked", isArt());
tune(fromHash());
