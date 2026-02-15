const otherOrderTypes = [
  "Lieutenant",
  "Irregular",
  "Impetuous",
  "Tactical Awareness"
];

let counts = {};
let gameMode = false;

// Persistent regular group structure
let regularGroups = [];

// ICON HELPER
function createOrderIcon(type) {
  const img = document.createElement("img");
  img.src = `icons/${type.toLowerCase().replace(/\s+/g, "")}.png`;
  img.className = "order-icon";
  return img;
}

// LOAD SAVED VALUES
function loadSaved() {
  const saved = localStorage.getItem("orderCounts");
  if (saved) counts = JSON.parse(saved);

  const savedGroups = localStorage.getItem("regularGroups");
  if (savedGroups) regularGroups = JSON.parse(savedGroups);
}

// SAVE VALUES
function saveCounts() {
  localStorage.setItem("orderCounts", JSON.stringify(counts));
  localStorage.setItem("regularGroups", JSON.stringify(regularGroups));
}

// SETUP MODE PROMPTS
function setupCounts() {
  counts["Regular"] = parseInt(prompt("How many Regular orders?")) || 0;

  otherOrderTypes.forEach(type => {
    counts[type] = parseInt(prompt(`How many ${type} orders?`)) || 0;
  });

  // Rebuild groups fresh
  regularGroups = [];
  let total = counts["Regular"];
  while (total > 0) {
    regularGroups.push(Math.min(10, total));
    total -= 10;
  }

  saveCounts();
}

// GAME MODE TOGGLE
document.getElementById("mode-toggle").addEventListener("click", () => {
  gameMode = !gameMode;
  document.getElementById("mode-toggle").textContent =
    gameMode ? "Switch to Setup Mode" : "Switch to Game Mode";

  if (!gameMode) setupCounts();
  renderAll();
});

// ADD/REMOVE CONTROLS
function setupControls() {
  // Regular global controls (Setup Mode only)
  document.querySelector(".add[data-type='Regular']").onclick = () => {
    counts["Regular"]++;
    if (!gameMode) {
      // Rebuild groups fresh
      regularGroups = [];
      let total = counts["Regular"];
      while (total > 0) {
        regularGroups.push(Math.min(10, total));
        total -= 10;
      }
    }
    saveCounts();
    renderAll();
  };

  document.querySelector(".remove[data-type='Regular']").onclick = () => {
    if (counts["Regular"] > 0) counts["Regular"]--;

    if (!gameMode) {
      // Rebuild groups fresh
      regularGroups = [];
      let total = counts["Regular"];
      while (total > 0) {
        regularGroups.push(Math.min(10, total));
        total -= 10;
      }
    }

    saveCounts();
    renderAll();
  };

  // OTHER ORDERS
  const otherControls = document.getElementById("other-controls");
  otherControls.innerHTML = "";

  otherOrderTypes.forEach(type => {
    const row = document.createElement("div");
    row.className = "controls";

    row.innerHTML = `
      <span>${type}</span>
      <div class="button-group">
        <button class="add" data-type="${type}">+</button>
        <button class="remove" data-type="${type}">–</button>
      </div>
    `;

    otherControls.appendChild(row);

    row.querySelector(".add").onclick = () => {
      counts[type]++;
      saveCounts();
      renderAll();
    };

    row.querySelector(".remove").onclick = () => {
      if (counts[type] > 0) counts[type]--;
      saveCounts();
      renderAll();
    };
  });
}

// RENDER REGULAR GROUPS
function renderRegularGroups() {
  const container = document.getElementById("regular-groups");
  container.innerHTML = "";

  // If Setup Mode or no saved groups, rebuild groups fresh
  if (!gameMode || regularGroups.length === 0) {
    regularGroups = [];
    let total = counts["Regular"];
    while (total > 0) {
      regularGroups.push(Math.min(10, total));
      total -= 10;
    }
  }

  regularGroups.forEach((size, index) => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "group";

    const groupNum = index + 1;

    const header = document.createElement("div");
    header.className = "controls";

    header.innerHTML = `
      <span>Group ${groupNum} (${size} Regular Orders)</span>
      <div class="button-group">
        <button class="add-group" data-group="${index}">+</button>
        <button class="remove-group" data-group="${index}">–</button>
      </div>
    `;

    groupDiv.appendChild(header);

    // GROUP ADD
    header.querySelector(".add-group").onclick = () => {
      if (regularGroups[index] < 10) {
        regularGroups[index]++;
      } else {
        regularGroups.push(1);
      }

      counts["Regular"] = regularGroups.reduce((a, b) => a + b, 0);
      saveCounts();
      renderAll();
    };

    // GROUP REMOVE
    header.querySelector(".remove-group").onclick = () => {
      if (regularGroups[index] > 0) {
        regularGroups[index]--;
      }

      // Remove empty groups
      regularGroups = regularGroups.filter(g => g > 0);

      counts["Regular"] = regularGroups.reduce((a, b) => a + b, 0);
      saveCounts();
      renderAll();
    };

    // ORDER SWITCHES
    for (let i = 0; i < size; i++) {
      const row = document.createElement("div");
      row.className = "order-row";

      const icon = createOrderIcon("Regular");
      const label = document.createElement("span");
      label.textContent = `Regular ${i + 1}`;

      const toggle = createToggleSwitch(`regular-${groupNum}-${i}`);

      row.appendChild(icon);
      row.appendChild(label);
      row.appendChild(toggle);

      groupDiv.appendChild(row);
    }

    container.appendChild(groupDiv);
  });
}

// RENDER OTHER ORDERS
function renderOtherOrders() {
  const container = document.getElementById("other-orders");
  container.innerHTML = "";

  otherOrderTypes.forEach(type => {
    for (let i = 0; i < counts[type]; i++) {
      const row = document.createElement("div");
      row.className = "order-row";

      const icon = createOrderIcon(type);
      const label = document.createElement("span");
      label.textContent = `${type} ${i + 1}`;

      const toggle = createToggleSwitch(`other-${type}-${i}`);

      row.appendChild(icon);
      row.appendChild(label);
      row.appendChild(toggle);

      container.appendChild(row);
    }
  });
}

// METACHEMISTRY
function renderMetachem() {
  const select = document.getElementById("meta-select");
  select.innerHTML = "";

  Object.entries(metaTable).forEach(([num, text]) => {
    const opt = document.createElement("option");
    opt.value = num;
    opt.textContent = `${num}: ${text}`;
    select.appendChild(opt);
  });

  document.getElementById("meta-random").onclick = () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    select.value = roll;
  };
}

// OBJECTIVE SCORING
let scores = { primary: 0, classified: 0 };

function loadScores() {
  const saved = localStorage.getItem("scores");
  if (saved) scores = JSON.parse(saved);
}

function saveScores() {
  localStorage.setItem("scores", JSON.stringify(scores));
}

function renderScores() {
  document.getElementById("score-primary").textContent = scores.primary;
  document.getElementById("score-classified").textContent = scores.classified;

  document.querySelectorAll(".score-add").forEach(btn => {
    btn.onclick = () => {
      const type = btn.dataset.type;
      scores[type]++;
      saveScores();
      renderScores();
    };
  });

  document.querySelectorAll(".score-remove").forEach(btn => {
    btn.onclick = () => {
      const type = btn.dataset.type;
      if (scores[type] > 0) scores[type]--;
      saveScores();
      renderScores();
    };
  });
}

// TOGGLE STATE PERSISTENCE
function saveToggleState(id, state) {
  const toggles = JSON.parse(localStorage.getItem("toggles") || "{}");
  toggles[id] = state;
  localStorage.setItem("toggles", JSON.stringify(toggles));
}

function loadToggleState(id) {
  const toggles = JSON.parse(localStorage.getItem("toggles") || "{}");
  return toggles[id] || "used"; // default ON
}

// TOGGLE SWITCH
function createToggleSwitch(id) {
  const wrapper = document.createElement("label");
  wrapper.className = "switch";

  const input = document.createElement("input");
  input.type = "checkbox";

  // Load saved state
  if (loadToggleState(id) === "used") {
    input.checked = true;
  }

  const slider = document.createElement("span");
  slider.className = "slider";

  input.onchange = () => {
    const state = input.checked ? "used" : "unused";
    if (gameMode) saveToggleState(id, state);
  };

  wrapper.appendChild(input);
  wrapper.appendChild(slider);
  return wrapper;
}

// RESET
document.getElementById("reset").onclick = () => {
  localStorage.removeItem("orderCounts");
  localStorage.removeItem("regularGroups");
  localStorage.removeItem("scores");
  localStorage.removeItem("toggles");

  scores = { primary: 0, classified: 0 };
  regularGroups = [];

  setupCounts();
  renderAll();
};

// RENDER EVERYTHING
function renderAll() {
  setupControls();
  renderRegularGroups();
  renderOtherOrders();
  renderMetachem();
  renderScores();
}

// INITIALISE
loadSaved();
loadScores();
if (!counts["Regular"]) setupCounts();
renderAll();