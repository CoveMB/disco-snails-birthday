# Snail ID entry design

## Goal

Replace the current first-load dancing scene with a club-door entry state. The first view shows a smiling snail security agent in front of a club door. Music is not playing yet.

The main action says: "Show your snail ID and enter the disco". The status text below it should continue to make clear that music starts after the click.

After the user clicks the action, the club door opens, the music starts, and the page reveals the existing dancing-snail animation.

## Scope

In scope:

- Initial page state for the stage.
- A security-agent snail illustration built from the existing SVG snail style.
- A club-door visual that can move into an open state.
- A single click path that starts audio and transitions into the current dancing-snail scene.
- Tests that cover the new label, entry markup, and audio status text.

Out of scope:

- Backward compatibility with the old first-load dancing view.
- New audio assets.
- A separate stage-local entry button.
- A full re-render between entry and disco states.

## Architecture

Keep the app as a single rendered card. The rendered stage will include both scene layers:

- The entry layer contains the door and security-agent snail.
- The disco layer contains the current floor-snail party, mirror ball, lights, trails, and dance floor.

The root card element will hold an entry state through a data attribute. On load it starts in the entry state. On click, the app updates that data attribute and asks the existing audio controller to play.

The existing audio state remains the source for button label, disabled state, pressed state, and status text.

## Interaction

On load:

- The button label is "Show your snail ID and enter the disco".
- The audio status says music will start after the user enters.
- The stage shows the security-agent snail and closed door.
- The dancing-snail party is hidden or visually inactive.
- No audio playback is requested.

On click:

- The app switches to the entered state.
- The door opens.
- The audio controller requests playback.
- Confetti runs.
- The existing floor-snail animation starts.

If audio fails, the existing failure message appears. The page stays in the entered state because the user did enter the disco, even if the browser refused playback.

## Motion

Use CSS for the door-open transition and entry-layer fade. Use the existing GSAP motion controller for the dancing snails.

Reduced-motion users should see the entry state without continuous movement, then the entered state with the existing reduced-motion static floor-snail layout.

## Testing

Update the render tests to check:

- The new first-load button label.
- The new first-load status text.
- Entry scene markup for the club door and security-agent snail.
- The existing floor-snail party remains present for the entered state.

Update audio state tests for the new paused copy. Existing playback, loading, and failure behavior should continue to pass.
