// Your "Input" tab should look like this
const modifier = (text) => {
  try {
    // Your other input modifier scripts go here (preferred)
    if (typeof Testing === 'function') {
      text = Testing("input", text);
    }
    // Your other input modifier scripts go here (alternative)
  } catch (error) {
    // Silent error handling - just continue with original text
  }
  return {text};
};
modifier(text);