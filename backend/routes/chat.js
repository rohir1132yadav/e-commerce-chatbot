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

    // Add user message to chat
    chat.messages.push({
      content: message,
      sender: 'user',
    });

    // Process message and generate bot response
    const { botResponse, newBotIntent } = await processMessage(message, chat.lastBotIntent);

    // Add bot response
    chat.messages.push({
      content: botResponse,
      sender: 'bot'
    });
    chat.lastBotIntent = newBotIntent;

    chat.lastActivity = Date.now();
    await chat.save();

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to process messages and generate responses
async function processMessage(message, lastBotIntent) {
  const lowerMessage = message.toLowerCase();

  // Handle price range follow-up
  if (lastBotIntent === 'price_inquiry' && lowerMessage === 'yes') {
    return { botResponse: "Please specify the minimum and maximum price you are looking for, e.g., 'price from 50 to 200'.", newBotIntent: 'awaiting_price_range' };
  }

  if (lastBotIntent === 'awaiting_price_range' && lowerMessage.includes('price from') && lowerMessage.includes('to')) {
    const regex = /price from (\d+) to (\d+)/;
    const match = lowerMessage.match(regex);
    if (match) {
      const minPrice = parseInt(match[1]);
      const maxPrice = parseInt(match[2]);
      const products = await Product.find({ price: { $gte: minPrice, $lte: maxPrice } }).limit(5);

      if (products.length === 0) {
        return { botResponse: "I couldn't find any products in that price range. Please try another range.", newBotIntent: null };
      }

      return {
        botResponse: `I found ${products.length} products in that price range:\n` +
          products.map(p => `- ${p.name} ($${p.price})`).join('\n'), newBotIntent: null
      };
    }
  }

  // Handle price range queries (should be checked before general search)
  if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return { botResponse: "Our products range from $10 to $1000. Would you like to see products in a specific price range?", newBotIntent: 'price_inquiry' };
  }

  // Handle product search
  if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
    const searchTerms = message.split(' ').slice(1).join(' ');
    const products = await Product.find({ $text: { $search: searchTerms } }).limit(5);

    if (products.length === 0) {
      return { botResponse: "I couldn't find any products matching your search. Could you try different keywords?", newBotIntent: null };
    }

    return {
      botResponse: `I found ${products.length} products matching your search:\n` +
        products.map(p => `- ${p.name} ($${p.price})`).join('\n'), newBotIntent: null
    };
  }

  // Handle category browsing
  if (lowerMessage.includes('category') || lowerMessage.includes('categories')) {
    const categories = await Product.distinct('category');
    return { botResponse: `We have the following categories available:\n${categories.join(', ')}`, newBotIntent: null };
  }

  // Default response
  return { botResponse: "I can help you search for products, browse categories, or check prices. What would you like to do?", newBotIntent: null };
}

module.exports = router; 