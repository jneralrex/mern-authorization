
const User = require("../models/user.model.js");

const generateUsernameSuggestions = async (username) => {
    const suggestions = [];
    const maxSuggestions = 3;
    const maxAttempts = 100; // Prevent infinite loop
  
    let attempts = 0;
    while (suggestions.length < maxSuggestions && attempts < maxAttempts) {
        const suggestion = `${username}${Math.random().toString(36).substring(2, 5)}`;
        const exists = await User.findOne({ username: suggestion });
  
      if (!exists && !suggestions.includes(suggestion)) {
        suggestions.push(suggestion);
      }
  
      attempts++;
    }
  
    if (suggestions.length === 0) {
      suggestions.push("No available suggestions at the moment");
    }
  
    return suggestions;
  };
  
  
module.exports = generateUsernameSuggestions;
