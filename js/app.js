/**
 * app.js
 * CS 1XD3 – JS Individual Assignment: CHROMATIC
 * Author: Saharsh Canjeevaram Sukumar 
 * Date:   March 2026
 * Description:
 *   VIEW + CONTROLLER. All DOM references, event listeners,
 *   and screen transitions live here. All game state is read
 *   exclusively from model objects (GameSession, Round, Colour,
 *   HistoryManager). 
 */
"use strict";

window.addEventListener("load", () => {

  const screenSplash = document.getElementById("screen-splash");
  const screenGame   = document.getElementById("screen-game");
  const screenEnd    = document.getElementById("screen-end");

  const splashCanvas = document.getElementById("splash-canvas");
  const btnStart     = document.getElementById("btn-start");

  const valRound     = document.getElementById("val-round");
  const timerArc     = document.getElementById("timer-arc");
  const timerVal     = document.getElementById("timer-val");
  const valScore     = document.getElementById("val-score");

  const swatchTarget = document.getElementById("swatch-target");
  const swatchMix    = document.getElementById("swatch-mix");
  const accuracyBadge = document.getElementById("accuracy-badge");

  const sliderR = document.getElementById("slider-r");
  const sliderG = document.getElementById("slider-g");
  const sliderB = document.getElementById("slider-b");
  const valR    = document.getElementById("val-r");
  const valG    = document.getElementById("val-g");
  const valB    = document.getElementById("val-b");

  const btnSubmit     = document.getElementById("btn-submit");
  const btnHelp       = document.getElementById("btn-help");
  const helpPanel     = document.getElementById("help-panel");
  const btnCloseHelp  = document.getElementById("btn-close-help");

  const resultFlash  = document.getElementById("result-flash");
  const flashGrade   = document.getElementById("flash-grade");
  const flashPts     = document.getElementById("flash-pts");
  const flashDetail  = document.getElementById("flash-detail");

  const endCanvas      = document.getElementById("end-canvas");
  const endTotalScore  = document.getElementById("end-total-score");
  const endGradeText   = document.getElementById("end-grade-text");
  const endRoundList   = document.getElementById("end-round-list");
  const historyList    = document.getElementById("history-list");
  const btnReplay      = document.getElementById("btn-replay");

  const historyMgr = new HistoryManager();
  let session      = null;   
  let splashR      = null;   
  let loopId       = null;   

  const ARC_C = 2 * Math.PI * 18;

  splashR = new SplashRenderer(splashCanvas);
  splashR.start();

  setTimeout(() => btnStart.classList.remove("hidden"), 2200);

  btnStart.addEventListener("click", () => {
    splashR.stop();
    startSession();
  });

  function showScreen(target) {
    [screenSplash, screenGame, screenEnd].forEach(s => s.classList.remove("active"));
    target.classList.add("active");
  }

  function startSession() {
    if (loopId) cancelAnimationFrame(loopId);
    helpPanel.classList.add("hidden");
    resultFlash.classList.add("hidden");

    session = new GameSession(10);
    showScreen(screenGame);
    renderRound();
    gameLoop();
  }

  function renderRound() {
    const rnd = session.currentRound;

    valRound.innerHTML = `${rnd.roundNumber}<span id="val-round-total">/10</span>`;
    valScore.textContent = session.totalScore;

    sliderR.value = 128;
    sliderG.value = 128;
    sliderB.value = 128;
    valR.textContent = "128";
    valG.textContent = "128";
    valB.textContent = "128";
    updateSliderFill(sliderR, 128);
    updateSliderFill(sliderG, 128);
    updateSliderFill(sliderB, 128);

    session.updateMix(128, 128, 128);
    swatchTarget.style.backgroundColor = rnd.target.toCSS();
    swatchMix.style.backgroundColor    = rnd.mix.toCSS();

    btnSubmit.disabled = false;

    accuracyBadge.textContent = "–";
    accuracyBadge.style.color = "";
  }

  function gameLoop() {
    if (!session || session.isOver()) return;

    const rnd     = session.currentRound;
    const timedOut = session.tick();        

    const frac   = rnd.timerFraction();       
    const offset = ARC_C * (1 - frac);
    timerArc.style.strokeDashoffset = offset;
    timerVal.textContent = Math.ceil(rnd.timeLeft);

    timerArc.style.stroke = frac < 0.25 ? "#ff3c3c" : "#0e0d0b";

    if (!rnd.complete) {
      const acc = rnd.liveAccuracy();
      accuracyBadge.textContent = acc + "%";
      accuracyBadge.style.color = accColour(acc);
    }

    if (timedOut) {
      btnSubmit.disabled = true;
      showRoundResult(false);
      return;
    }

    loopId = requestAnimationFrame(gameLoop);
  }

  function accColour(acc) {
    if (acc >= 90) return "#2ebb6e";
    if (acc >= 70) return "#f5a623";
    return "#ff3c3c";
  }

  function updateSliderFill(slider, value) {
    const pct    = (value / 255) * 100;
    const id     = slider.id;
    const colMap = { "slider-r": "var(--r-col)", "slider-g": "var(--g-col)", "slider-b": "var(--b-col)" };
    const col    = colMap[id] || "#888";
    slider.style.background =
      `linear-gradient(to right, ${col} 0%, ${col} ${pct}%, #d0cbc0 ${pct}%)`;
  }

  function onSliderInput() {
    const r = parseInt(sliderR.value, 10);
    const g = parseInt(sliderG.value, 10);
    const b = parseInt(sliderB.value, 10);

    valR.textContent = r;
    valG.textContent = g;
    valB.textContent = b;

    updateSliderFill(sliderR, r);
    updateSliderFill(sliderG, g);
    updateSliderFill(sliderB, b);

    session.updateMix(r, g, b);

    swatchMix.style.backgroundColor = session.currentRound.mix.toCSS();
  }

  sliderR.addEventListener("input", onSliderInput);
  sliderG.addEventListener("input", onSliderInput);
  sliderB.addEventListener("input", onSliderInput);

  btnSubmit.addEventListener("click", () => {
    if (!session || !session.currentRound || session.currentRound.complete) return;
    cancelAnimationFrame(loopId);
    session.submitCurrent();
    btnSubmit.disabled = true;
    showRoundResult(true);
  });

  function showRoundResult(submitted) {
    const rnd = session.currentRound;

    flashGrade.textContent  = rnd.gradeLabel();
    flashPts.textContent    = `+${rnd.points} pts`;
    flashDetail.textContent = submitted
      ? `${rnd.accuracy}% match · ${Math.ceil(rnd.timeLeft)}s remaining`
      : `TIME OUT · ${rnd.accuracy}% match`;

    flashGrade.style.color = accColour(rnd.accuracy);

    resultFlash.classList.remove("hidden");

    setTimeout(() => {
      resultFlash.classList.add("hidden");
      const hasMore = session.advance();

      if (hasMore) {
        renderRound();
        
        timerArc.style.strokeDashoffset = 0;
        gameLoop();
      } else {
        endSession();
      }
    }, 1600);
  }

  btnHelp.addEventListener("click", () => {
    helpPanel.classList.toggle("hidden");
  });

  btnCloseHelp.addEventListener("click", () => {
    helpPanel.classList.add("hidden");
  });

  function endSession() {
    cancelAnimationFrame(loopId);
    showScreen(screenEnd);

    const grade = session.finalGrade();
    const score = session.totalScore;

    historyMgr.save(score, grade);

    drawEndCanvas(endCanvas);

    endTotalScore.textContent = score;
    endGradeText.textContent  = grade;

    endRoundList.innerHTML = "";
    session.rounds.forEach(rnd => {
      const row = document.createElement("div");
      row.className = "round-recap";

      const rndSpan = document.createElement("span");
      rndSpan.className   = "recap-rnd";
      rndSpan.textContent = `R${rnd.roundNumber}`;

      const targetWrap = document.createElement("span");
      const dot = document.createElement("span");
      dot.className = "recap-swatch";
      dot.style.backgroundColor = rnd.target.toCSS();
      targetWrap.appendChild(dot);
      targetWrap.appendChild(document.createTextNode(rnd.target.toHex()));

      const matchSpan = document.createElement("span");
      matchSpan.className   = "recap-match";
      matchSpan.textContent = rnd.gradeLabel();
      matchSpan.style.color = accColour(rnd.accuracy);

      const ptsSpan = document.createElement("span");
      ptsSpan.className   = "recap-pts";
      ptsSpan.textContent = `+${rnd.points}`;

      row.appendChild(rndSpan);
      row.appendChild(targetWrap);
      row.appendChild(matchSpan);
      row.appendChild(ptsSpan);
      endRoundList.appendChild(row);
    });

    renderHistory();
  }

  function renderHistory() {
    const history = historyMgr.load();
    const best    = historyMgr.highScore();
    historyList.innerHTML = "";

    if (history.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No records yet.";
      historyList.appendChild(li);
      return;
    }

    history.forEach(entry => {
      const li = document.createElement("li");

      const dateSpan = document.createElement("span");
      dateSpan.className   = "h-date";
      dateSpan.textContent = entry.date;

      const scoreSpan = document.createElement("span");
      scoreSpan.className   = "h-score";
      scoreSpan.textContent = `${entry.score} · ${entry.grade}`;

      li.appendChild(dateSpan);
      li.appendChild(scoreSpan);

      if (entry.score === best) {
        const badge = document.createElement("span");
        badge.className   = "h-best";
        badge.textContent = "BEST";
        li.appendChild(badge);
      }

      historyList.appendChild(li);
    });
  }

  btnReplay.addEventListener("click", () => {
    startSession();
  });

}); 
