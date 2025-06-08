const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Get chat history
router.get('/:userId', auth, async (req, res) => {
  try {
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const chats = await Chat.find({ userId: req.params.userId })
      .sort({ lastActivity: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new chat session
router.post('/session', auth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const sessionId = Date.now().toString();

    const chat = new Chat({
      userId,
      sessionId,
      messages: [{
        content: 'Hello! How can I help you today?',
        sender: 'bot'
      }]
    });

    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Process chat message
router.post('/message', auth, async (req, res) => {
  try {
    const { sessionId, message, userId } = req.body;

    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find chat session
    const chat = await Chat.findOne({ sessionId, userId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // Add user message
    chat.messages.push({
      content: message,
      sender: 'user'
    });

    // Process message and generate bot response
    const botResponse = await processMessage(message);

    // Add bot response
    chat.messages.push({
      content: botResponse,
      sender: 'bot'
    });

    chat.lastActivity = Date.now();
    await chat.save();

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to process messages and generate responses
async function processMessage(message) {
  const lowerMessage = message.toLowerCase();

  // Handle product search
  if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
    const searchTerms = message.split(' ').slice(1).join(' ');
    const products = await Product.find({ $text: { $search: searchTerms } }).limit(5);

    if (products.length === 0) {
      return "I couldn't find any products matching your search. Could you try different keywords?";
    }

    return `I found ${products.length} products matching your search:\n` +
      products.map(p => `- ${p.name} ($${p.price})`).join('\n');
  }

  // Handle category browsing
  if (lowerMessage.includes('category') || lowerMessage.includes('categories')) {
    const categories = await Product.distinct('category');
    return `We have the following categories available:\n${categories.join(', ')}`;
  }

  // Handle price range queries
  if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return "Our products range from $10 to $1000. Would you like to see products in a specific price range?";
  }

  // Default response
  return "I can help you search for products, browse categories, or check prices. What would you like to do?";
}

module.exports = router; 