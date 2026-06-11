(function () {
  const canvas = document.querySelector(".stars");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];

  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(220, Math.floor((width * height) / 8500));

    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.55 + 0.08,
      h: 180 + Math.random() * 170,
      p: Math.random() * Math.PI * 2
    }));
  }

  function frame(time) {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    for (const star of stars) {
      const alpha = star.a * (0.55 + 0.45 * Math.sin(time * 0.001 + star.p));
      ctx.fillStyle = `hsla(${star.h}, 90%, 75%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize, { passive: true });

  resize();
  requestAnimationFrame(frame);
})();

function printPoster() {
  window.print();
}
