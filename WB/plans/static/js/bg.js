(() => {
  const layers = Array.from(document.querySelectorAll('.matrix-layer'));
  const chars = 'アイウエオカキクケコｱｲｳｴｵ01{}[]<>+-*/=0123456789ABCDEF';
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  function rand(min, max){ return Math.random()*(max-min)+min; }
  function pick(s){ return s[ (Math.random()*s.length)|0 ]; }

  // Палитра: бирюзовый основной + редкие бледно-желтые вспышки
  const palette = {
    base: { r: 0, g: 230, b: 140 },   // ярко-зелёный с каплей синего
    flare: { r: 255, g: 247, b: 189 }  // бледно-жёлтые вспышки
  };

  function MatrixLayer(canvas){
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.depth = parseFloat(canvas.dataset.depth || '0.08');
    this.columns = 0;
    this.fontSize = 18;
    this.drops = [];
    this.time = 0;
    this.resize();
  }

  MatrixLayer.prototype.resize = function(){
    const {cv, ctx} = this;
    const w = cv.clientWidth * dpr;
    const h = cv.clientHeight * dpr;
    if (cv.width !== w || cv.height !== h){
      cv.width = w; cv.height = h;
      ctx.setTransform(1,0,0,1,0,0);
      ctx.scale(dpr,dpr);
    }
    this.fontSize = Math.max(14, Math.round(Math.min(window.innerWidth, window.innerHeight)/50));
    this.ctx.font = `${this.fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`;
    this.columns = Math.ceil(cv.clientWidth / this.fontSize);
    this.drops = Array.from({length:this.columns}, () => rand(-40, 0));
  };

  MatrixLayer.prototype.step = function(dt){
    const {cv, ctx, fontSize, columns, drops, depth} = this;
    this.time += dt;

    // Лёгкое затухание следа
    ctx.fillStyle = `rgba(0,0,0,0.08)`;
    ctx.fillRect(0,0,cv.clientWidth,cv.clientHeight);

    for (let i=0; i<columns; i++){
      const x = i*fontSize + 2;
      const y = (drops[i]*fontSize);

      // Цвет символа: в 4-6% случаев — бледно-жёлтый «всплеск»
      const flareChance = Math.random() < 0.055;
      const flicker = 0.85 + Math.sin((this.time*2 + i)*0.7)*0.15; // лёгкое мерцание
      const c = flareChance
        ? palette.flare
        : palette.base;

      // Градиент яркости в хвосте
      const brightness = 0.75 + Math.random()*0.25;
      const r = Math.min(255, c.r * brightness * flicker);
      const g = Math.min(255, c.g * brightness * flicker);
      const b = Math.min(255, c.b * brightness * flicker);
      ctx.fillStyle = `rgba(${r|0},${g|0},${b|0},0.95)`;

      const ch = pick(chars);
      ctx.fillText(ch, x, y);

      // Переход символа вниз; рандомный «сброс»
      if (y > cv.clientHeight && Math.random() > 0.975){
        drops[i] = rand(-20, -2);
      } else {
        // Скорость фиксированная, без параллакса
        drops[i] += 0.35;
      }
    }
  };

  const instances = layers.map(c => new MatrixLayer(c));

  // Оптимизированный resize: только при изменении окна
  window.addEventListener('resize', () => instances.forEach(i => i.resize()));
  window.addEventListener('orientationchange', () => instances.forEach(i => i.resize()));

  // RAF
  let last = performance.now();
  function loop(now){
    const dt = Math.min(0.05, (now - last)/1000);
    last = now;
    instances.forEach(i => i.step(dt));
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

// Обновление активной ссылки при скролле
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("main .section, main .hero");
  const navLinks = document.querySelectorAll(".main-nav .nav-link");

  let activeId = null;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const id = entry.target.getAttribute("id");
        if(id) activeId = id;
      }
    });
    if(activeId){
      navLinks.forEach(link => link.classList.remove("is-active"));
      const activeLink = document.querySelector(`.main-nav a[href="#${activeId}"]`);
      if(activeLink){ activeLink.classList.add("is-active"); }
    }
  }, {
    threshold: 0.7   // секция считается видимой, если хотя бы 70% в viewport
  });

  sections.forEach(section => observer.observe(section));
});