// ============================================================
//  Larry's Gym — Creativity Page Scripts
//  creativity.js
//
//  Feature 1: Before/After comparison slider
//    - Width-based reveal (no clip-path, so no sliver artifact)
//    - Draggable on both mouse and touch
//    - after-img pixel width locked to container width at all times
//
//  Feature 2: Interactive Monthly Goal Tracker
//    - Goals defined in an array; items built dynamically
//    - Each bar has a range slider AND a number input
//    - Both controls stay in sync with each other and the bar
//    - Animates in on scroll via IntersectionObserver
//    - Reset button clears everything back to zero then replays
// ============================================================

document.addEventListener("DOMContentLoaded", function () {


  // ============================================================
  //  FEATURE 1 — BEFORE / AFTER COMPARISON SLIDER
  //
  //  How the width approach works:
  //    - The "after" panel sits on top of the "before" from left: 0
  //    - Its CSS width (in %) = the current handle position
  //    - The image INSIDE the after panel has its pixel width locked
  //      to the container's full width so it never squishes
  //    - The handle div has left: <percent>% and width: 0;
  //      its visible line comes from a ::before pseudo-element
  //
  //  This completely eliminates the 1px sliver that clip-path caused.
  // ============================================================

  var compContainer = document.getElementById("comparison-container");
  var panelAfter    = document.getElementById("panel-after");
  var afterImg      = document.getElementById("after-img");
  var handle        = document.getElementById("compare-handle");

  if (compContainer && panelAfter && afterImg && handle) {

    var isDragging     = false;
    var currentPercent = 50;   // start at 50/50

    // ---- updateSlider(percent) ----
    // The one function that moves everything. Call it whenever the
    // handle position changes, whether from drag or initial setup.
    function updateSlider(percent) {
      // Clamp between 1% and 99% so the handle stays visible
      if (percent < 1)  { percent = 1;  }
      if (percent > 99) { percent = 99; }

      currentPercent = percent;

      // Resize the after panel to cover exactly [percent]% from the left
      panelAfter.style.width = percent + "%";

      // Lock the after image to the container's full pixel width.
      // Without this, the image would stretch to fill the panel's smaller width.
      afterImg.style.width  = compContainer.offsetWidth + "px";
      afterImg.style.height = "100%";

      // Slide the handle to match the dividing line
      handle.style.left = percent + "%";
    }

    // Start at 50/50 on load
    updateSlider(50);

    // Also re-lock the image width if the window resizes,
    // since the container pixel width will have changed
    window.addEventListener("resize", function () {
      updateSlider(currentPercent);
    });

    // ---- Turn an event (mouse or touch) into a percent ----
    function eventToPercent(event) {
      var rect    = compContainer.getBoundingClientRect();
      var clientX = event.touches ? event.touches[0].clientX : event.clientX;
      var offsetX = clientX - rect.left;
      return (offsetX / rect.width) * 100;
    }

    // ---- Mouse events on the container ----
    compContainer.addEventListener("mousedown", function (e) {
      isDragging = true;
      e.preventDefault();   // prevent text selection while dragging
      updateSlider(eventToPercent(e));
    });

    document.addEventListener("mousemove", function (e) {
      if (!isDragging) { return; }
      updateSlider(eventToPercent(e));
    });

    document.addEventListener("mouseup", function () {
      isDragging = false;
    });

    // ---- Touch events (phones/tablets) ----
    compContainer.addEventListener("touchstart", function (e) {
      isDragging = true;
      updateSlider(eventToPercent(e));
    }, { passive: true });

    document.addEventListener("touchmove", function (e) {
      if (!isDragging) { return; }
      updateSlider(eventToPercent(e));
    }, { passive: true });

    document.addEventListener("touchend", function () {
      isDragging = false;
    });
  }
  // end Feature 1


  // ============================================================
  //  FEATURE 2 — INTERACTIVE MONTHLY GOAL TRACKER
  //
  //  Goals live in an array of objects. We loop through it to
  //  build the HTML for each item — bar, slider, and number input.
  //
  //  Each item has:
  //    - A color-coded progress bar
  //    - A range slider (0 → total) that updates everything live
  //    - A number input that also updates the bar and slider
  //    - A stats display showing "current / total  XX%"
  //
  //  An IntersectionObserver fires the initial animation when
  //  the section scrolls into view. The Reset button clears all
  //  values back to 0 then replays the animation.
  // ============================================================

  // ---- Goal definitions ----
  // To add or change a goal, just edit this array.
  var goals = [
    {
      id:      "claw-curls",
      emoji:   "🦞",
      name:    "Claw Curls (Larry's personal goal)",
      unit:    "reps",
      current: 320,
      total:   400,
      color:   "fill-coral"
    },
    {
      id:      "open-water",
      emoji:   "🏊",
      name:    "Open Water Laps",
      unit:    "laps",
      current: 48,
      total:   60,
      color:   "fill-ocean"
    },
    {
      id:      "jazzercise",
      emoji:   "🪼",
      name:    "Jellyfish Jazzercise Classes",
      unit:    "classes",
      current: 7,
      total:   8,
      color:   "fill-jelly"
    },
    {
      id:      "healthy-meals",
      emoji:   "🥗",
      name:    "Healthy Meals (No Krabby Patties)",
      unit:    "meals",
      current: 52,
      total:   90,
      color:   "fill-kelp"
    },
    {
      id:      "kelp-strength",
      emoji:   "🏋️",
      name:    "Kelp Strength Sessions",
      unit:    "sessions",
      current: 11,
      total:   12,
      color:   "fill-sandy"
    }
  ];

  var progressContainer = document.getElementById("progress-container");
  var resetBtn          = document.getElementById("reset-progress");

  if (!progressContainer) { return; }

  // ---- Build the HTML for each goal ----
  // We insert each item BEFORE the reset button so the button stays at the bottom
  for (var i = 0; i < goals.length; i++) {
    var g   = goals[i];
    var pct = Math.round((g.current / g.total) * 100);

    // Create the outer item div
    var item = document.createElement("div");
    item.className = "progress-item";
    item.id        = "goal-item-" + g.id;

    // Build the inner HTML for this item
    item.innerHTML =
      "<div class='progress-header'>" +
        "<span class='progress-name'>" +
          "<span aria-hidden='true'>" + g.emoji + "</span>" +
          g.name +
        "</span>" +
        "<span class='progress-stats'>" +
          "<span class='cur-val' id='cur-" + g.id + "'>" + g.current + "</span>" +
          " / " +
          "<span class='total-val' id='tot-" + g.id + "' title='Click to edit goal'>" + g.total + "</span>" +
          " " + g.unit +
          "<span class='progress-badge' id='badge-" + g.id + "'>" + pct + "%</span>" +
        "</span>" +
      "</div>" +

      "<div class='progress-track'" +
        " role='progressbar'" +
        " aria-valuenow='" + pct + "'" +
        " aria-valuemin='0'" +
        " aria-valuemax='100'" +
        " aria-label='" + g.name + ": " + pct + "% complete'>" +
        "<div class='progress-fill " + g.color + "'" +
          " id='fill-" + g.id + "'" +
          " style='width:0%'></div>" +
      "</div>" +

      // Slider + number input below the bar
      "<div class='goal-controls'>" +
        "<label for='slider-" + g.id + "'>Adjust:</label>" +
        "<input type='range'" +
          " id='slider-" + g.id + "'" +
          " class='goal-slider'" +
          " min='0' max='" + g.total + "' step='1'" +
          " value='" + g.current + "'" +
          " aria-label='Adjust " + g.name + "'>" +
        "<input type='number'" +
          " id='num-" + g.id + "'" +
          " class='goal-number'" +
          " min='0' max='" + g.total + "'" +
          " value='" + g.current + "'" +
          " aria-label='Enter value for " + g.name + "'>" +
      "</div>";

    // Insert before the reset button div
    progressContainer.insertBefore(item, resetBtn.parentNode);

    // ---- Wire up the controls for this goal ----
    // We use a self-invoking function to capture the right goal data
    // in the closure — otherwise all handlers would reference the last
    // value of g after the loop finishes.
    (function (goalId, goalTotal) {

      var fillEl   = document.getElementById("fill-"   + goalId);
      var sliderEl = document.getElementById("slider-" + goalId);
      var numEl    = document.getElementById("num-"    + goalId);
      var curEl    = document.getElementById("cur-"    + goalId);
      var badgeEl  = document.getElementById("badge-"  + goalId);
      var trackEl  = fillEl.parentElement;

      // ---- updateGoal(value) ----
      // Central function that refreshes the bar, badge, and stats
      // whenever the current value changes via either control.
      function updateGoal(value) {
        // Clamp to valid range
        if (value < 0)         { value = 0; }
        if (value > goalTotal) { value = goalTotal; }

        var pctNow = Math.round((value / goalTotal) * 100);

        // Update the fill bar width (CSS transition makes it smooth)
        fillEl.style.width = pctNow + "%";

        // Keep slider and number input in sync with each other
        sliderEl.value = value;
        numEl.value    = value;

        // Update the stats display
        curEl.textContent   = value;
        badgeEl.textContent = pctNow + "%";

        // Update the aria attribute so screen readers stay accurate
        trackEl.setAttribute("aria-valuenow", pctNow);
      }

      // Slider fires on every tick as the user drags
      sliderEl.addEventListener("input", function () {
        updateGoal(parseInt(this.value, 10));
      });

      // Number input fires when the user changes the value
      numEl.addEventListener("input", function () {
        var v = parseInt(this.value, 10);
        if (!isNaN(v)) {
          updateGoal(v);
        }
      });

      // Clamp the number input on blur in case someone typed something wild
      numEl.addEventListener("blur", function () {
        var v = parseInt(this.value, 10);
        if (isNaN(v) || v < 0)        { this.value = 0; updateGoal(0); }
        else if (v > goalTotal)        { this.value = goalTotal; updateGoal(goalTotal); }
      });

    })(g.id, g.total);

  }
  // end build loop


  // ---- Track whether the initial entrance animation has run ----
  var hasAnimated = false;

  // ---- animateAllBars() ----
  // Sets every bar to its current slider value, triggering the
  // CSS transition. Staggered with a short delay per bar so they
  // don't all pop at the same time.
  function animateAllBars() {
    var fills   = progressContainer.querySelectorAll(".progress-fill");
    var sliders = progressContainer.querySelectorAll(".goal-slider");

    for (var i = 0; i < fills.length; i++) {
      // Use a closure to capture the right fill and slider per iteration
      (function (fill, slider, delay) {
        setTimeout(function () {
          var target = parseInt(slider.max, 10);
          var current = parseInt(slider.value, 10);
          var pct = Math.round((current / target) * 100);
          fill.style.width = pct + "%";
        }, delay);
      })(fills[i], sliders[i], i * 200);
    }

    hasAnimated = true;
  }

  // ---- resetAllBars() ----
  // Snaps every bar to 0 instantly, then replays the animation.
  function resetAllBars() {
    var fills   = progressContainer.querySelectorAll(".progress-fill");
    var sliders = progressContainer.querySelectorAll(".goal-slider");
    var nums    = progressContainer.querySelectorAll(".goal-number");
    var curs    = progressContainer.querySelectorAll(".cur-val");
    var badges  = progressContainer.querySelectorAll(".progress-badge");
    var tracks  = progressContainer.querySelectorAll(".progress-track");

    // Loop through every bar and reset its display to 0
    for (var i = 0; i < fills.length; i++) {
      // Disable transition so the snap-to-zero is instant
      fills[i].style.transition = "none";
      fills[i].style.width      = "0%";

      // Reset controls and stats to 0 too
      sliders[i].value       = 0;
      nums[i].value          = 0;
      curs[i].textContent    = "0";
      badges[i].textContent  = "0%";
      tracks[i].setAttribute("aria-valuenow", "0");
    }

    // Re-enable transitions after a short pause, then replay
    setTimeout(function () {
      var fills2 = progressContainer.querySelectorAll(".progress-fill");
      for (var j = 0; j < fills2.length; j++) {
        fills2[j].style.transition = "";
      }
      hasAnimated = false;
      animateAllBars();
    }, 180);
  }

  // ---- IntersectionObserver — fire the animation on first scroll-in ----
  var observer = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting && !hasAnimated) {
        animateAllBars();
        observer.disconnect();   // only need to fire once
      }
    }
  }, { threshold: 0.25 });

  observer.observe(progressContainer);

  // ---- Reset button ----
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      resetAllBars();
      resetBtn.textContent = "⏳ Resetting...";
      setTimeout(function () {
        resetBtn.innerHTML = "🔄 Reset &amp; Replay";
      }, 900);
    });
  }

}); // end DOMContentLoaded
