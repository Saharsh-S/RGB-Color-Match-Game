/**
 * round.js
 * CS 1XD3 – JS Individual Assignment: CHROMATIC
 * Author: Saharsh Canjeevaram Sukumar
 * Date:   March 2026
 * Description:
 *   MODEL — Round class. Manages one round of CHROMATIC:
 *   target colour, countdown timer (via timestamps — not setInterval),
 *   player's current mix, and score calculation.
 *   No DOM access. Exposes tick(), submit(), and scoring helpers.
 */
"use strict";

class Round {
  
  constructor(roundNumber, totalRounds) {
    this.roundNumber  = roundNumber;
    this.totalRounds  = totalRounds;

    this.difficulty = (roundNumber - 1) / (totalRounds - 1);

    this.timeLimit = Math.round(24 - (this.difficulty * this.difficulty) * 10);

    this.target = Colour.random(this.difficulty);

    this.mix = new Colour(128, 128, 128);

    this.startTime  = null;

    this.timeLeft   = this.timeLimit;

    this.complete   = false;

    this.submitted  = false;

    this.accuracy   = 0;

    this.points     = 0;
  }

  start() {
    this.startTime = performance.now();
  }

  tick() {
    if (this.complete || !this.startTime) return false;
    const elapsed  = (performance.now() - this.startTime) / 1000;
    this.timeLeft  = Math.max(0, this.timeLimit - elapsed);

    if (this.timeLeft <= 0) {
      this._finalise();
      return true;   
    }
    return false;
  }

  updateMix(r, g, b) {
    this.mix = new Colour(r, g, b);
  }

  liveAccuracy() {
    return this.target.accuracyVs(this.mix);
  }

  submit() {
    if (this.complete) return;
    this.submitted = true;
    this._finalise();
  }

  _finalise() {
    this.complete  = true;
    this.accuracy  = this.target.accuracyVs(this.mix);

    const base     = Math.round((this.accuracy * this.accuracy) / 100);

    let speedBonus = 0;
    if (this.submitted && this.timeLeft > this.timeLimit * 0.5) {
      speedBonus = Math.round(50 * (this.timeLeft / this.timeLimit));
    }

    this.points = base + speedBonus;
  }

  gradeLabel() {
    const a = this.accuracy;
    if (a >= 97) return "PERFECT";
    if (a >= 90) return "BRILLIANT";
    if (a >= 78) return "GREAT";
    if (a >= 62) return "GOOD";
    if (a >= 45) return "OKAY";
    return "MISS";
  }

  timerFraction() {
    return this.timeLeft / this.timeLimit;
  }
}

class GameSession {
  
  constructor(totalRounds = 10) {
    this.totalRounds   = totalRounds;
    this.rounds        = [];    
    this.currentRound  = null;  
    this.roundIndex    = 0;     
    this.totalScore    = 0;

    this._nextRound();
  }

  _nextRound() {
    this.currentRound = new Round(this.roundIndex + 1, this.totalRounds);
    this.currentRound.start();
  }

  tick() {
    return this.currentRound ? this.currentRound.tick() : false;
  }

  submitCurrent() {
    if (this.currentRound) this.currentRound.submit();
  }

  updateMix(r, g, b) {
    if (this.currentRound) this.currentRound.updateMix(r, g, b);
  }

  advance() {
    if (this.currentRound) {
      this.totalScore += this.currentRound.points;
      this.rounds.push(this.currentRound);
    }
    this.roundIndex++;

    if (this.roundIndex >= this.totalRounds) {
      this.currentRound = null;
      return false;   
    }

    this._nextRound();
    return true;
  }

  isOver() {
    return this.roundIndex >= this.totalRounds && !this.currentRound;
  }

  finalGrade() {
    const max = this.totalRounds * 150;   
    const pct = this.totalScore / max;
    if (pct >= 0.85) return "COLOUR MASTER";
    if (pct >= 0.65) return "SHARP EYE";
    if (pct >= 0.45) return "DECENT MIXER";
    return "KEEP PRACTISING";
  }
}
