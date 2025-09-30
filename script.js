/*
 * Conveyor Bypass Training Game
 *
 * This script powers the interactive training game. It dynamically
 * constructs panel cards, manages state for each panel, and computes
 * relay and status values based on the bypass positions and the
 * location of a random fault. Users begin with the entire zone dead
 * and must engage bypasses to isolate the communication fault.
 */

// Number of child panels in addition to the master
const NUM_CHILDREN = 15;

// Data structure holding the panel state
let panels = [];

// Index of the panel where the fault exists (1..NUM_CHILDREN)
let faultIndex = null;

// Indicates whether the simulation has been started
let started = false;

// Indicates whether the current scenario has been solved
let gameOver = false;

// Cache DOM references
const panelContainer = document.getElementById('panel-container');
const startButton = document.getElementById('startButton');
const newScenarioButton = document.getElementById('newScenarioButton');
const feedbackEl = document.getElementById('feedback');
const feedbackSidebar = document.getElementById('feedbackSidebar');
const feedbackToggleButton = document.getElementById('feedbackToggle');

if (feedbackToggleButton && feedbackSidebar) {
  setFeedbackSidebarExpanded(false);
  feedbackToggleButton.addEventListener('click', () => {
    toggleFeedbackSidebar();
  });
}

/**
 * Expand or collapse the feedback sidebar.
 *
 * @param {boolean} expanded - Whether the sidebar should be expanded.
 */
function setFeedbackSidebarExpanded(expanded) {
  if (!feedbackSidebar || !feedbackToggleButton) return;
  feedbackSidebar.classList.toggle('collapsed', !expanded);
  feedbackSidebar.setAttribute('aria-expanded', String(expanded));
  feedbackToggleButton.setAttribute('aria-expanded', String(expanded));
}

/**
 * Toggle the current state of the feedback sidebar.
 */
function toggleFeedbackSidebar() {
  if (!feedbackSidebar) return;
  const isCollapsed = feedbackSidebar.classList.contains('collapsed');
  setFeedbackSidebarExpanded(isCollapsed);
}

/**
 * Initialize a new game scenario.
 * Randomly selects a fault panel and resets all panel state.
 */
function initGame() {
  panels = [];
  started = false;
  gameOver = false;
  // Randomly choose a fault among children 1..NUM_CHILDREN
  faultIndex = Math.floor(Math.random() * NUM_CHILDREN) + 1;
  // Build panel state array
  for (let i = 0; i <= NUM_CHILDREN; i++) {
    panels.push({
      name: i === 0 ? 'Master' : `Child ${i}`,
      bypass: 'ON',
      cr1: 0,
      cr2: 0,
      crbp: i === 0 ? 0 : 0,
      status: 'Not running',
      fault: i === faultIndex,
    });
  }
  // Render panels fresh
  renderPanels();
  // Clear feedback
  updateFeedback('');
  // Reset start button text
  startButton.disabled = false;
  startButton.textContent = 'Start Simulation';
}

/**
 * Render all panels to the DOM. Called once during initialization.
 */
function renderPanels() {
  panelContainer.innerHTML = '';
  panels.forEach((panel, index) => {
    const card = document.createElement('div');
    card.classList.add('panel');
    // Title
    const title = document.createElement('h2');
    title.textContent = panel.name;
    card.appendChild(title);
    // Bypass control
    const bypassDiv = document.createElement('div');
    bypassDiv.classList.add('bypass-control');
    const bypassLabel = document.createElement('label');
    bypassLabel.textContent = 'Bypass:';
    bypassDiv.appendChild(bypassLabel);
    const select = document.createElement('select');
    select.innerHTML = '<option value="ON">ON</option><option value="OFF">OFF</option>';
    select.value = panel.bypass;
    select.dataset.index = index.toString();
    // Disable master bypass; only children can be toggled
    if (index === 0) {
      select.disabled = true;
    }
    select.addEventListener('change', handleBypassChange);
    bypassDiv.appendChild(select);
    card.appendChild(bypassDiv);
    // Relay indicators container
    const relaysDiv = document.createElement('div');
    relaysDiv.classList.add('relays');
    // CR-1
    const cr1El = document.createElement('div');
    cr1El.classList.add('relay');
    cr1El.innerHTML = '<span class="indicator" data-type="cr1"></span> CR‑1';
    relaysDiv.appendChild(cr1El);
    // CR-2
    const cr2El = document.createElement('div');
    cr2El.classList.add('relay');
    cr2El.innerHTML = '<span class="indicator" data-type="cr2"></span> CR‑2';
    relaysDiv.appendChild(cr2El);
    // CR-BP (always show on Master and optionally on children)
    const crbpEl = document.createElement('div');
    crbpEl.classList.add('relay');
    crbpEl.innerHTML = '<span class="indicator" data-type="crbp"></span> CR‑BP';
    relaysDiv.appendChild(crbpEl);
    card.appendChild(relaysDiv);
    // Status indicator
    const statusDiv = document.createElement('div');
    statusDiv.classList.add('status');
    statusDiv.innerHTML = '<span class="indicator" data-type="status"></span><span class="status-text">Not running</span>';
    card.appendChild(statusDiv);
    // Store references to the indicators on the element for later updates
    card.dataset.index = index.toString();
    card._elements = {
      select,
      cr1Indicator: cr1El.querySelector('.indicator'),
      cr2Indicator: cr2El.querySelector('.indicator'),
      crbpIndicator: crbpEl.querySelector('.indicator'),
      statusIndicator: statusDiv.querySelector('.indicator'),
      statusText: statusDiv.querySelector('.status-text'),
    };
    panelContainer.appendChild(card);
  });
  // After creating elements, compute statuses for the initial display (all off)
  computeStatus();
  updatePanelUI();
}

/**
 * Start the simulation. Once started, the master and any panel not
 * interrupted by the fault or bypass will show running. Before
 * starting, everything is dead.
 */
function startSimulation() {
  if (started) return;
  started = true;
  startButton.disabled = true;
  startButton.textContent = 'Simulation Running';
  computeStatus();
  updatePanelUI();
  updateFeedback('Simulation started. Use bypass controls to isolate the fault.');
}

/**
 * Compute relay states and running status for each panel based on the
 * current bypass configuration, whether the simulation has started,
 * and the location of the fault. The algorithm models a simple
 * communication chain: the master starts the chain, and each panel
 * continues running as long as there is no fault and the bypass
 * allows passage. If a fault exists and the bypass is not engaged
 * (ON), the chain stops; if the bypass is engaged (OFF), the chain
 * skips the faulty panel but that panel remains not running.
 */
function computeStatus() {
  let chainRunning = started; // chain is only running after start
  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];
    // Master panel: only runs after simulation start
    if (i === 0) {
      if (started) {
        panel.status = 'Running';
        panel.cr1 = 1;
        panel.cr2 = 1;
        panel.crbp = 1;
      } else {
        panel.status = 'Not running';
        panel.cr1 = 0;
        panel.cr2 = 0;
        panel.crbp = 0;
      }
      // Chain running continues based on started state
      chainRunning = started;
      continue;
    }
    // If chain already broken, nothing runs downstream
    if (!chainRunning) {
      panel.status = 'Not running';
      panel.cr1 = 0;
      panel.cr2 = 0;
      panel.crbp = 0;
      continue;
    }
    // Determine behaviour at this panel
    if (panel.fault) {
      // Fault present at this panel
      if (panel.bypass === 'OFF') {
        // Bypass engaged: skip the fault. Panel itself not running but CR-BP active
        panel.status = 'Not running';
        panel.cr1 = 0;
        panel.cr2 = 0;
        panel.crbp = 1;
        // Chain continues
        chainRunning = true;
      } else {
        // Bypass not engaged: chain stops here
        panel.status = 'Not running';
        panel.cr1 = 1;
        panel.cr2 = 0;
        panel.crbp = 0;
        chainRunning = false;
      }
    } else {
      // No fault on this panel
      if (panel.bypass === 'OFF') {
        // Bypass engaged: skip the panel
        panel.status = 'Not running';
        panel.cr1 = 0;
        panel.cr2 = 0;
        panel.crbp = 1;
        chainRunning = true;
      } else {
        // Bypass not engaged: panel runs normally
        panel.status = 'Running';
        panel.cr1 = 1;
        panel.cr2 = 1;
        panel.crbp = 0;
        chainRunning = true;
      }
    }
  }
}

/**
 * Update the DOM elements for each panel based on the computed panel state.
 */
function updatePanelUI() {
  // Iterate through panel cards (child nodes of panelContainer)
  panelContainer.childNodes.forEach((card) => {
    const index = parseInt(card.dataset.index, 10);
    const panel = panels[index];
    const els = card._elements;
    // Update select value (bypass control)
    els.select.value = panel.bypass;
    // CR-1 indicator
    els.cr1Indicator.style.backgroundColor = panel.cr1 ? getComputedStyle(document.documentElement).getPropertyValue('--running-color') : getComputedStyle(document.documentElement).getPropertyValue('--not-running-color');
    // CR-2 indicator
    els.cr2Indicator.style.backgroundColor = panel.cr2 ? getComputedStyle(document.documentElement).getPropertyValue('--running-color') : getComputedStyle(document.documentElement).getPropertyValue('--not-running-color');
    // CR-BP indicator
    els.crbpIndicator.style.backgroundColor = panel.crbp ? getComputedStyle(document.documentElement).getPropertyValue('--running-color') : getComputedStyle(document.documentElement).getPropertyValue('--not-running-color');
    // Status indicator and text
    const statusIsRunning = panel.status === 'Running';
    els.statusIndicator.style.backgroundColor = statusIsRunning ? getComputedStyle(document.documentElement).getPropertyValue('--running-color') : getComputedStyle(document.documentElement).getPropertyValue('--not-running-color');
    els.statusText.textContent = panel.status;
  });
}

/**
 * Handle a change event on a bypass select. Updates the panel state,
 * recomputes the chain, updates UI and provides feedback. If the
 * simulation has not started yet, instruct the user to start it.
 */
function handleBypassChange(event) {
  const select = event.target;
  const index = parseInt(select.dataset.index, 10);
  const value = select.value;
  // Prevent changes if game is over
  if (gameOver) {
    select.value = panels[index].bypass;
    return;
  }
  // If simulation not started, block changes and prompt user
  if (!started) {
    // reset select value to previous state
    select.value = panels[index].bypass;
    updateFeedback('Start the simulation before toggling bypass controls.');
    return;
  }
  // Update state
  panels[index].bypass = value;
  computeStatus();
  updatePanelUI();
  provideFeedback(index);
}

/**
 * Provide contextual feedback after a bypass toggle at a given panel. The
 * feedback helps guide the user through the troubleshooting process.
 */
function provideFeedback(index) {
  if (gameOver || !started) return;
  const panel = panels[index];
  let message = '';
  // If this is the fault panel and bypass has been engaged, success
  if (panel.fault && panel.bypass === 'OFF') {
    message = `You isolated ${panel.name}! Check comm cable/relay.`;
    updateFeedback(message);
    // Show alert for success
    setTimeout(() => {
      alert(message);
    }, 100);
    gameOver = true;
    return;
  }
  // If user toggled a bypass to OFF (engaged) but it's not the fault panel
  if (panel.bypass === 'OFF') {
    if (index < faultIndex) {
      // The fault is downstream; despite bypass, chain remains dead
      message = `${panel.name} bypass engaged. Fault is downstream.`;
    } else if (index > faultIndex) {
      // Fault is upstream; bypassing here does nothing until upstream is addressed
      message = `${panel.name} bypass engaged. Fault is upstream.`;
    } else {
      // should not happen because if index==faultIndex, it's success handled above
    }
  } else {
    // Bypass not engaged; user might be reverting a test
    if (index === faultIndex) {
      // Fault panel left unbypassed: chain breaks here
      message = `Warning: ${panel.name} has a fault. Without bypass, downstream panels will not run.`;
    } else if (index < faultIndex) {
      message = `${panel.name} is healthy. Fault remains downstream.`;
    } else {
      message = `${panel.name} is downstream of the fault and will remain off until the fault is isolated.`;
    }
  }
  updateFeedback(message);
}

/**
 * Update the feedback area with a message. Passing an empty string
 * hides the feedback element.
 */
function updateFeedback(message) {
  if (!message) {
    feedbackEl.style.display = 'none';
    feedbackEl.textContent = '';
    setFeedbackSidebarExpanded(false);
  } else {
    feedbackEl.style.display = 'block';
    feedbackEl.textContent = message;
    setFeedbackSidebarExpanded(true);
  }
}

// Event listeners for control buttons
startButton.addEventListener('click', startSimulation);
newScenarioButton.addEventListener('click', () => {
  initGame();
});

// Initialise the game on first load
initGame();

// Video playback speed control
(() => {
  const video = document.getElementById('trainingVideo');
  const rateSelect = document.getElementById('playbackRateSelector');
  if (video && rateSelect) {
    // Set the initial playback rate based on the default selected option
    video.playbackRate = parseFloat(rateSelect.value);
    rateSelect.addEventListener('change', (e) => {
      const newRate = parseFloat(e.target.value);
      video.playbackRate = newRate;
    });
  }
})();