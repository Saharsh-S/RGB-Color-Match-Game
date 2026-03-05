/**
 * splash.js
 * CS 1XD3 – JS Individual Assignment: CHROMATIC
 * Author: Saharsh Canjeevaram Sukumar
 * Date:   March 2026
 * Description:
 *   Manages two canvas effects:
 *   1. SplashRenderer — animated ink-drop / colour-burst splash screen.
 *      Draws expanding colour rings from random origins, simulating
 *      drops of paint falling into water.
 *   2. drawEndCanvas — static rainbow-spectrum end screen background.
 */
"use strict";

class InkDrop {
  
  constructor(w, h) {
    this.reset(w, h);
  }

  reset(w, h) {
    this.x       = Math.random() * w;
    this.y       = Math.random() * h;
    this.radius  = 0;
    this.maxR    = 60 + Math.random() * 120;
    this.speed   = 0.8 + Math.random() * 1.4;
    this.hue     = Math.random() * 360;
    this.alpha   = 0.55 + Math.random() * 0.35;
    this.done    = false;
  }

  update() {
    this.radius += this.speed;
    if (this.radius >= this.maxR) { this.done = true; }
    return this.done;
  }

  draw(ctx) {
    const prog   = this.radius / this.maxR;           
    const alpha  = this.alpha * (1 - prog);            
    ctx.globalAlpha = alpha;

    const grad = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.radius
    );
    grad.addColorStop(0,   `hsla(${this.hue},85%,62%,1)`);
    grad.addColorStop(0.5, `hsla(${this.hue},85%,62%,0.4)`);
    grad.addColorStop(1,   `hsla(${this.hue},85%,62%,0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class SplashRenderer {
  
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext("2d");
    this.drops   = [];
    this.animId  = null;
    this.running = false;
    this.frame   = 0;
    this._spawnInterval = 18;  

    this._resize();
    window.addEventListener("resize", () => this._resize());
  }

  _resize() {
    const r = window.devicePixelRatio || 1;
    this.canvas.width  = this.canvas.offsetWidth  * r;
    this.canvas.height = this.canvas.offsetHeight * r;
    this.ctx.scale(r, r);
    this.W = this.canvas.offsetWidth;
    this.H = this.canvas.offsetHeight;
  }

  start() {
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this._resize();
      this.frame++;

      this.ctx.fillStyle = "#0e0d0b";
      this.ctx.fillRect(0, 0, this.W, this.H);

      if (this.frame % this._spawnInterval === 0) {
        this.drops.push(new InkDrop(this.W, this.H));
      }

      this.drops = this.drops.filter(d => {
        d.update();
        d.draw(this.ctx);
        return !d.done;
      });

      this.animId = requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}

function drawEndCanvas(canvas) {
  const r = window.devicePixelRatio || 1;
  canvas.width  = canvas.offsetWidth  * r;
  canvas.height = canvas.offsetHeight * r;
  const ctx = canvas.getContext("2d");
  ctx.scale(r, r);
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;

  ctx.fillStyle = "#0e0d0b";
  ctx.fillRect(0, 0, W, H);

  const sweep = ctx.createLinearGradient(0, 0, W, H);
  for (let i = 0; i <= 12; i++) {
    sweep.addColorStop(i / 12, `hsla(${i * 30},80%,50%,0.07)`);
  }
  ctx.fillStyle = sweep;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 50; i++) {
    const x   = Math.random() * W;
    const y   = Math.random() * H;
    const rad = Math.random() * 40 + 5;
    const hue = Math.random() * 360;
    const g   = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `hsla(${hue},80%,55%,0.14)`);
    g.addColorStop(1, `hsla(${hue},80%,55%,0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const vig = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.9);
  vig.addColorStop(0, "rgba(14,13,11,0.5)");
  vig.addColorStop(1, "rgba(14,13,11,0.88)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}
