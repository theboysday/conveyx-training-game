# Conveyor Bypass Training Game

This repository contains an interactive web‑based training game designed to
teach technicians how to isolate communication faults in a ConveyX
Mod‑LinX system using bypass switches. The game presents a grid of
16 card‑style panels (one Master and 15 Child panels) and challenges
users to determine which child panel has a randomly generated fault.

## Features

- **Panel Layout:** A responsive grid containing one Master panel and 15
  Child panels. Each panel displays its title, a bypass control (ON/OFF),
  relay indicators (CR‑1, CR‑2, CR‑BP) and a status indicator (Running or
  Not running).  
- **Random Fault Generation:** Every time a new scenario starts, a
  random child panel is designated as the fault location. The fault and
  bypass logic is computed in `script.js`.  
- **Dynamic Feedback:** As technicians toggle bypass controls, the
  application recalculates the relay states and chain status, providing
  immediate feedback describing whether the fault is upstream or
  downstream and when it has been successfully isolated.  
- **Tutorial Video:** A built‑in tutorial video (“Logic of the
  Silent Conveyor”) is provided at the bottom of the page. Users can
  watch the video at different playback speeds (0.5× to 2×) via a
  dropdown control.  
- **Pure Client‑Side Implementation:** The entire application runs in
  the browser; no back‑end server is required.

## Getting Started

To run the training game locally:

1. Download or clone this repository (or obtain the provided
   `conveyor_game.zip` archive and extract it).  
2. Make sure all files (`index.html`, `style.css`, `script.js`,
   `Logic_of_the_Silent_Conveyor.mp4`, `README.md`, and `AGENT.md`) reside
   in the same directory.  
3. Open `index.html` in a modern web browser (Chrome, Firefox,
   Edge, Safari, etc.). The game runs entirely in your browser; no
   additional software or web server is required.  
4. Click **Start Simulation** to power up the system and begin. A
   random fault will be generated automatically.  
5. Toggle the bypass controls on child panels to test sections of
   the communication loop. The status indicators and feedback messages
   will guide you toward isolating the fault. When the correct panel’s
   bypass is engaged, a pop‑up message will confirm your success.

## File Structure

```
conveyor_game/
├── index.html        # Main HTML file; defines the page structure
├── style.css         # Stylesheet controlling the look and layout
├── script.js         # JavaScript file containing game logic
├── Logic_of_the_Silent_Conveyor.mp4  # Tutorial video
├── README.md         # This documentation file
└── AGENT.md          # Guidance notes for future developers/agents
```

### `index.html`

Defines the overall page layout, including the control buttons, the
dynamic panel container, the feedback area, and the tutorial video
section. The panels themselves are generated dynamically by the
JavaScript.

### `style.css`

Contains CSS variables and rules to style the cards, buttons, feedback
messages and video. It employs a responsive grid layout so the panels
resize gracefully on different screen sizes.

### `script.js`

Implements the game’s logic and interactivity:

- Generates the panel cards on page load.
- Initializes a random fault scenario and resets the UI.
- Calculates relay states and running status based on bypass
  configuration and fault position.
- Updates the DOM to reflect current states and shows feedback
  messages.
- Manages the tutorial video playback rate via a dropdown control.

### `Logic_of_the_Silent_Conveyor.mp4`

A 6:40 training video explaining the troubleshooting and bypass
methodology. It is embedded in the page and includes adjustable
playback speed.

### `AGENT.md`

Provides guidance for other developers or AI agents who may need to
extend, modify or troubleshoot this project.

## Extending the Game

If you plan to enhance the game, consider the following:

1. **Add New Scenarios:** The fault logic currently selects a random
   child panel each time. You could extend this by loading predefined
   scenarios from a JSON file (see the JSON template in the original
   specification) or by introducing different failure modes.  
2. **Scoring and Timing:** Implement scoring or time limits to add
   difficulty. For example, penalize wrong guesses or measure how
   quickly a user isolates the fault.  
3. **Accessibility Improvements:** Ensure that colour choices meet
   contrast guidelines, and consider adding keyboard navigation for
   bypass controls.  
4. **Backend Integration:** Although the current version is static,
   you might integrate it with a backend to store user progress or
   provide a management dashboard (as mentioned in the stretch goals).

Feel free to adapt the UI and logic while keeping the user guidance and
feedback mechanisms clear and informative.