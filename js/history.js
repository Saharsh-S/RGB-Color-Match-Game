/**
 * history.js
 * CS 1XD3 – JS Individual Assignment: CHROMATIC
 * Author: Saharsh Canjeevaram Sukumar
 * Date:   March 2026
 * Description:
 *   MODEL — HistoryManager class. Saves and loads
 *   CHROMATIC run history from localStorage.
 *   No DOM access.
 */
"use strict";

class HistoryManager {
  
  constructor(key = "chromatic_history", max = 6) {
    this.key = key;
    this.max = max;
  }

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  save(score, grade) {
    const history = this.load();
    history.unshift({
      date:  new Date().toLocaleDateString("en-CA"),
      score,
      grade
    });
    localStorage.setItem(this.key, JSON.stringify(history.slice(0, this.max)));
  }

  highScore() {
    const h = this.load();
    return h.length === 0 ? 0 : Math.max(...h.map(e => e.score));
  }
}
