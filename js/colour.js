/**
 * colour.js
 * CS 1XD3 – JS Individual Assignment: CHROMATIC
 * Author: Saharsh Canjeevaram Sukumar
 * Date:   March 2026
 * Description:
 *   MODEL — Colour class. Stores an RGB colour and provides
 *   utility methods for comparison, CSS string output,
 *   and accuracy scoring. No DOM access.
 */
"use strict";

class Colour {
  
  constructor(r, g, b) {
    this.r = Math.round(Math.max(0, Math.min(255, r)));
    this.g = Math.round(Math.max(0, Math.min(255, g)));
    this.b = Math.round(Math.max(0, Math.min(255, b)));
  }

  toCSS() {
    return `rgb(${this.r},${this.g},${this.b})`;
  }

  toHex() {
    const h = v => v.toString(16).padStart(2, "0");
    return `#${h(this.r)}${h(this.g)}${h(this.b)}`;
  }

  distanceTo(other) {
    const dr = (this.r - other.r) * 0.299;
    const dg = (this.g - other.g) * 0.587;
    const db = (this.b - other.b) * 0.114;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  accuracyVs(other) {
    const MAX_DIST = 255 * Math.sqrt(0.299 + 0.587 + 0.114); 
    const pct = 1 - (this.distanceTo(other) / MAX_DIST);
    return Math.round(Math.max(0, Math.min(100, pct * 100)));
  }

  static random(difficulty = 1) {
    if (difficulty < 0.3) {
      
      const presets = [
        [255, 60,  60],  [60,  200, 80],  [60,  120, 255],
        [255, 200, 50],  [220, 60,  220], [60,  210, 220],
        [255, 130, 50],  [150, 255, 100], [100, 100, 255],
      ];
      const p = presets[Math.floor(Math.random() * presets.length)];
      return new Colour(...p);
    }

    if (difficulty < 0.65) {
      
      const r = Math.floor(40 + Math.random() * 200);
      const g = Math.floor(40 + Math.random() * 200);
      const b = Math.floor(40 + Math.random() * 200);
      return new Colour(r, g, b);
    }

    return new Colour(
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256)
    );
  }
}
