// Chatbot Service - AI Assistant

const NLPService = require('./nlpService');

class ChatbotService {
  constructor() {
    this.nlp = new NLPService();
    this.intents = this.setupIntents();
    this.conversationHistory = [];
  }

  // Setup intents for chatbot
  setupIntents() {
    return {
      greeting: {
        keywords: ['hello', 'hi', 'hey', 'good morning'],
        responses: [
          'Hello! How can I assist you today?',
          'Hi there! What can I help you with?',
          'Welcome! How may I help you?'
        ]
      },
      taskHelp: {
        keywords: ['task', 'assignment', 'work', 'project'],
        responses: [
          'I can help you with task management. What would you like to know?',
          'Need help with tasks? I can show you recommendations or statistics.'
        ]
      },
      employeeInfo: {
        keywords: ['employee', 'staff', 'team', 'person'],
        responses: [
          'I can help you find information about employees. Who are you looking for?',
          'Which employee would you like to know about?'
        ]
      },
      projectStatus: {
        keywords: ['project', 'status', 'progress', 'update'],
        responses: [
          'Which project would you like to check on?',
          'I can give you a project status update. Which one interests you?'
        ]
      },
      help: {
        keywords: ['help', 'assist', 'support'],
        responses: [
          'I can help with: tasks, employees, projects, finance, and recommendations.',
          'I\'m here to help! Ask me about tasks, employees, or projects.'
        ]
      },
      goodbye: {
        keywords: ['goodbye', 'bye', 'see you', 'farewell'],
        responses: [
          'Goodbye! Feel free to ask anytime.',
          'See you later! Have a great day!',
          'Bye! Thanks for using AI Assistant.'
        ]
      }
    };
  }

  // Process user message
  processMessage(userMessage, context = {}) {
    console.log('🤖 Processing:', userMessage);
    
    // Add to history
    this.conversationHistory.push({
      role: 'user',
      message: userMessage,
      timestamp: new Date()
    });
    
    // Identify intent
    const intent = this.identifyIntent(userMessage);
    
    // Generate response
    let response = this.generateResponse(intent, userMessage, context);
    
    // Add to history
    this.conversationHistory.push({
      role: 'assistant',
      message: response,
      timestamp: new Date()
    });
    
    return {
      response,
      intent,
      confidence: 0.85,
      suggestions: this.getSuggestions(intent)
    };
  }

  // Identify user intent
  identifyIntent(message) {
    const lowerMessage = message.toLowerCase();
    let bestMatch = 'greeting';
    let bestScore = 0;
    
    Object.entries(this.intents).forEach(([intent, data]) => {
      const score = data.keywords.filter(kw => 
        lowerMessage.includes(kw)
      ).length;
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = intent;
      }
    });
    
    return bestMatch;
  }

  // Generate response
  generateResponse(intent, message, context) {
    const intentData = this.intents[intent];
    const response = intentData.responses[
      Math.floor(Math.random() * intentData.responses.length)
    ];
    
    // Add contextual information if available
    if (context.employeeName) {
      return `Regarding ${context.employeeName}: ${response}`;
    }
    
    if (context.projectName) {
      return `About project "${context.projectName}": ${response}`;
    }
    
    return response;
  }

  // Get suggestions for next action
  getSuggestions(intent) {
    const suggestions = {
      greeting: [
        'Show me my tasks',
        'Recent projects',
        'Team performance',
        'Financial summary'
      ],
      taskHelp: [
        'Assign a task',
        'View task predictions',
        'Task statistics',
        'Risk analysis'
      ],
      employeeInfo: [
        'Show top performers',
        'Performance predictions',
        'Skill analysis',
        'Team statistics'
      ],
      projectStatus: [
        'View project risks',
        'Budget forecast',
        'Team allocation',
        'Timeline analysis'
      ],
      help: [
        'AI Features',
        'Recommendations',
        'Analytics',
        'Documentation'
      ]
    };
    
    return suggestions[intent] || [];
  }

  // Respond to specific queries
  respondToQuery(query, database) {
    const lowerQuery = query.toLowerCase();
    
    // Employee queries
    if (lowerQuery.includes('top performer')) {
      const topPerformers = database.employees
        .sort((a, b) => (b.performanceRating || 0) - (a.performanceRating || 0))
        .slice(0, 3);
      return `Top performers: ${topPerformers.map(e => e.name).join(', ')}`;
    }
    
    // Task queries
    if (lowerQuery.includes('pending task')) {
      const pendingTasks = database.tasks.filter(t => t.status === 'pending');
      return `You have ${pendingTasks.length} pending tasks.`;
    }
    
    // Project queries
    if (lowerQuery.includes('project status')) {
      const activeProjects = database.projects.filter(p => p.status === 'in_progress');
      return `${activeProjects.length} projects are currently active.`;
    }
    
    return 'I can help you with that. Could you provide more details?';
  }

  // Get conversation history
  getHistory(limit = 10) {
    return this.conversationHistory.slice(-limit);
  }

  // Clear history
  clearHistory() {
    this.conversationHistory = [];
  }
}

module.exports = ChatbotService;
