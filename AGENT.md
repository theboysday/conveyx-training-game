# Agent Guidance for Conveyor Bypass Training Game

This document serves as a reference for any AI agent or developer
responsible for extending, maintaining or troubleshooting the
**Conveyor Bypass Training Game**. It outlines the project’s purpose,
architecture and recommended practices.

## Purpose

The game simulates a ConveyX Mod‑LinX conveyor system with a single
Master panel and 15 sequential Child panels. Technicians use bypass
switches to isolate a randomly generated communication fault. The game
provides immediate feedback on the effect of each bypass action and
confirms when the fault has been properly isolated. An embedded
tutorial video at the bottom of the page teaches the troubleshooting
methodology.

## Core Components

1. **Panel State Model** (`panels` array in `script.js`): Each panel
   has properties for its name, bypass state, relay values (`cr1`,
   `cr2`, `crbp`), running status and fault flag. The Master panel is
   always at index 0; children 1–15 follow in order.
2. **Game Flow**: A fault index is chosen randomly upon scenario
   initialization. The `computeStatus()` function recalculates each
   panel’s relay values and running status whenever the simulation is
   started or a bypass state changes.
3. **User Interface**: Panel cards are rendered dynamically and stored
   in the DOM with references to key elements (dropdown selectors,
   relay indicators, status labels). The UI is updated via
   `updatePanelUI()` after state changes.
4. **Feedback Mechanism**: The `provideFeedback()` function generates
   descriptive messages depending on which panel’s bypass was toggled
   and whether the action is upstream or downstream of the fault. When
   the correct panel’s bypass is engaged, it triggers a success
   alert and locks the game state.
5. **Video Tutorial**: A `<video>` element embeds an MP4 tutorial with
   a playback speed selector. Event listeners adjust the
   `playbackRate` of the video based on user input.

## Guidelines for Extension

- **Maintain Separation of Concerns**: Keep UI rendering, state
  management and event handling in separate functions. When adding new
  features (e.g. scoring or timers) encapsulate them in their own
  functions to avoid monolithic code.
- **Preserve Responsiveness**: The existing CSS uses a responsive grid
  for panels and flexbox for controls. If adding elements, ensure
  they adapt gracefully to different screen sizes. Prefer CSS
  variables and classes defined in `style.css` to maintain a
  consistent look.
- **Avoid External Dependencies**: The current implementation is pure
  HTML/CSS/JavaScript. Additional libraries (e.g. frameworks or UI
  kits) are unnecessary for the core functionality. If you must
  introduce dependencies, document them clearly and ensure they
  integrate seamlessly with the existing build‑free setup.
- **Data-Driven Scenarios**: Should you implement scenario loading,
  define a JSON schema similar to the example in the project
  specification. Include fields like `scenario_id`, `fault_panel`,
  and an array of panel definitions with relay values and feedback
  messages. Write code to parse the JSON and initialize the `panels`
  array accordingly.
- **Internationalization**: If the game needs to support multiple
  languages, wrap text content in a simple translation object or
  externalize strings into separate JSON files. Ensure that the
  feedback mechanism uses these translated strings.

## File Naming and Structure

For consistency, keep new files in the same directory (`conveyor_game/`)
and use lowercase names with hyphens or underscores. Examples:

- `timer.js` – logic for adding a timer to the game.  
- `scenarios.json` – collection of predefined scenarios for
  scenario‑based training.  
- `dashboard.html` / `dashboard.js` – potential manager dashboard.

## Version Control and Documentation

It is good practice to document significant changes in this `AGENT.md`
file or in commit messages. When adding new features, describe why the
change was made, how it works and any potential side effects. This
helps future agents or developers understand the rationale behind
decisions and reduces the likelihood of unintended regressions.

## Troubleshooting Tips

- **UI not Updating?** Ensure that state variables (`panels`, `started`,
  `gameOver`) are being modified correctly and that `computeStatus()`
  and `updatePanelUI()` are called after any change.
- **Video Not Playing?** Verify that the MP4 file is present and that
  the `<source>` element references it correctly. Some browsers block
  autoplay; users might need to press play manually.
- **Unexpected Behaviour?** Use the browser’s developer tools (F12) to
  inspect the console for errors and to watch how state changes when
  interacting with the UI. Logging intermediate values in
  `computeStatus()` can help trace logic errors.

By following these guidelines, you can confidently extend the training
game while preserving its simplicity and educational value.