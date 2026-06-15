const express = require('express');
const router = express.Router();
const prisma = require('../prisma/client');
const aiService = require('../services/aiService');
const { protect } = require('../middleware/auth');

// @desc    Send a message to the AI advisor
// @route   POST /api/chat
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { text, language, isVoice } = req.body;

        // Find or create active conversation
        let conversation = await prisma.conversation.findFirst({
            where: {
                userId: req.user.id,
                isActive: true
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    userId: req.user.id,
                    language: language || req.user.languagePreference || 'en',
                    messages: [] // json array
                }
            });
        }

        const currentMessages = Array.isArray(conversation.messages) ? conversation.messages : [];

        // Add user message
        const updatedMessages = [...currentMessages, {
            role: 'user',
            content: text,
            isVoice: isVoice || false,
            timestamp: new Date().toISOString()
        }];

        // Get AI response
        const aiResponse = await aiService.processMessage(
            text,
            language || conversation.language,
            updatedMessages,
            conversation.currentIntent ? { currentIntent: conversation.currentIntent, userQueries: conversation.userQueries || [] } : {}
        );

        // Add assistant message
        updatedMessages.push({
            role: aiResponse.role || 'assistant',
            content: aiResponse.content,
            timestamp: new Date().toISOString()
        });

        // Update context and language
        const updateData = {
            messages: updatedMessages
        };

        if (aiResponse.context) {
            if (aiResponse.context.currentIntent) updateData.currentIntent = aiResponse.context.currentIntent;
            if (aiResponse.context.userQueries) updateData.userQueries = aiResponse.context.userQueries;
        }

        if (aiResponse.activeLang && aiResponse.activeLang !== conversation.language) {
            updateData.language = aiResponse.activeLang;
        }

        await prisma.conversation.update({
            where: { id: conversation.id },
            data: updateData
        });

        res.json({
            message: aiResponse.content,
            conversationId: conversation.id,
            context: aiResponse.context || {}
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @desc    Translate a message
 * @route   POST /api/chat/translate
 * @access  Private
 */
router.post('/translate', protect, async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        console.log('[TRANSLATE API] Request received:', { text: text?.substring(0, 50), targetLang });

        if (!text || !targetLang) {
            console.log('[TRANSLATE API] Missing parameters');
            return res.status(400).json({ message: 'Text and targetLang are required' });
        }

        const translatedText = await aiService.translateText(text, targetLang);
        console.log('[TRANSLATE API] Translation successful:', translatedText.substring(0, 50));
        res.json({ translatedText });
    } catch (error) {
        console.error('[TRANSLATE API] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});


// @desc    Get chat history
// @route   GET /api/chat/history
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        const conversation = await prisma.conversation.findFirst({
            where: {
                userId: req.user.id,
                isActive: true
            }
        });

        if (conversation) {
            res.json(conversation.messages || []);
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Clear chat history
// @route   DELETE /api/chat/history
// @access  Private
router.delete('/history', protect, async (req, res) => {
    try {
        const conversations = await prisma.conversation.findMany({
            where: { userId: req.user.id, isActive: true }
        });

        for (const conv of conversations) {
            await prisma.conversation.update({
                where: { id: conv.id },
                data: { isActive: false }
            });
        }

        res.json({ message: 'Chat history cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
