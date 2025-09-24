// Your "Context" tab should look like this
const modifier = (text) => {
  // Initialize stop variable for AI Dungeon context
  let stop = false;
  
  try {
    // Your other context modifier scripts go here (preferred)
    if (typeof Testing === 'function') {
      [text, stop] = Testing("context", text, stop);
    }
    // Your other context modifier scripts go here (alternative)
  } catch (error) {
    // Force create settings card if Testing fails
    if (typeof state !== 'undefined' && !state.storyCards) {
      state.storyCards = [];
    }
    if (typeof state !== 'undefined' && state.storyCards && !state.storyCards.find(card => card.title === "Script Settings Story Card")) {
      state.storyCards.push({
        title: "Script Settings Story Card",
        type: "text",
        keys: "testing,script,settings,config",
        entry: "Testing Script Configuration\n\nThe script encountered an error during initialization. Please check that the Library script is properly loaded.\n\nTry using /testing help in your input to see if the script is working.",
        description: "",
        isVisible: true
      });
    }
  }
  return {text, stop};
};
modifier(text);