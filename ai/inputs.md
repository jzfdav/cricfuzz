# Adding the "Vibe" Context (Dynamic Updates)

To make it interesting, we inject state-aware lines into the commentary before returning it to the UI. Check sample code as a reference only. Our implementation should be much more detailed to cover all the possible scenarios. Think deep and research commonly used cricket commentary, maybe use some of the famous lines.

```JavaScript
function getVibeContext(state) {
  const { score, wickets, overs, ballsInOver, target } = state;
  const rr = (score / (overs + ballsInOver / 6)).toFixed(2);
  
  // Logic for situational commentary
  if (overs >= 18 && wickets < 8) {
    return "The death overs are here! Time to swing for the hills.";
  }
  if (target && (target - score) < 20) {
    return "The crowd is on its feet! We are heading for a nail-biting finish.";
  }
  if (ballsInOver === 0 && overs > 0) {
    return `End of over. ${score}/${wickets}. Current Run Rate: ${rr}`;
  }
  return null;
}
```