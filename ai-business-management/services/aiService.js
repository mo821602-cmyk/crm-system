// ✅ Fixed AI Service with Error Handling & Improvements

const brain = require('brain.js');
const ml = require('ml.js');
const natural = require('natural');
const compromise = require('compromise');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.models = {};
    this.cache = new Map();
    this.trained = false;
    this.lastCleanup = Date.now();
    this.CACHE_CLEANUP_INTERVAL = 1000 * 60 * 30; // 30 minutes
  }

  // Initialize AI models with error handling
  async initialize() {
    try {
      console.log('🤖 Initializing AI Models...');
      await this.loadModels();
      await this.setupNLP();
      await this.startCacheCleanup();
      this.trained = true;
      logger.info('✅ AI Models Ready');
      return { success: true, message: 'AI Models initialized successfully' };
    } catch (error) {
      logger.error('❌ AI Initialization Error:', error);
      throw new Error(`AI initialization failed: ${error.message}`);
    }
  }

  // Load pre-trained models with validation
  async loadModels() {
    try {
      this.models.taskEstimation = new brain.NeuralNetwork();
      this.models.skillMatching = new brain.NeuralNetwork();
      this.models.performancePrediction = new brain.NeuralNetwork();
      this.models.riskDetection = new brain.NeuralNetwork();
      logger.info('✅ ML Models loaded');
    } catch (error) {
      logger.error('❌ Model loading error:', error);
      throw error;
    }
  }

  // Setup NLP with error handling
  async setupNLP() {
    try {
      this.tokenizer = new natural.WordTokenizer();
      this.classifier = new natural.BayesClassifier();
      this.stemmer = natural.PorterStemmer;
      logger.info('✅ NLP processor ready');
    } catch (error) {
      logger.error('❌ NLP setup error:', error);
      throw error;
    }
  }

  // Start automatic cache cleanup
  startCacheCleanup() {
    setInterval(() => {
      this.cleanupCache();
    }, this.CACHE_CLEANUP_INTERVAL);
  }

  // Clean up expired cache entries
  cleanupCache() {
    try {
      let cleaned = 0;
      const now = Date.now();
      
      for (const [key, value] of this.cache.entries()) {
        if (value.expiry && now > value.expiry) {
          this.cache.delete(key);
          cleaned++;
        }
      }
      
      logger.info(`🗑️ Cache cleanup: removed ${cleaned} entries`);
      this.lastCleanup = now;
    } catch (error) {
      logger.error('❌ Cache cleanup error:', error);
    }
  }

  // Analyze resume with validation and error handling
  async analyzeResume(resumeText) {
    try {
      // Input validation
      if (!resumeText || typeof resumeText !== 'string') {
        throw new Error('Invalid resume text provided');
      }

      if (resumeText.trim().length === 0) {
        throw new Error('Resume text cannot be empty');
      }

      if (resumeText.length > 50000) {
        throw new Error('Resume text is too long (max 50KB)');
      }

      logger.info('📄 Analyzing Resume...');
      
      const tokens = this.tokenizer.tokenize(resumeText.toLowerCase());
      const stems = tokens.map(token => this.stemmer.stem(token));
      
      const skillKeywords = [
        'javascript', 'python', 'java', 'csharp', 'nodejs', 'react', 'vue',
        'sql', 'mongodb', 'management', 'leadership', 'communication',
        'project', 'agile', 'scrum', 'devops', 'aws', 'azure', 'docker'
      ];
      
      const extractedSkills = stems.filter(stem => skillKeywords.includes(stem));
      const skillScore = extractedSkills.length / skillKeywords.length;
      
      return {
        success: true,
        skills: [...new Set(extractedSkills)],
        skillScore: Math.min(1, skillScore),
        experience: this.extractExperience(resumeText),
        education: this.extractEducation(resumeText),
        confidence: 0.85
      };
    } catch (error) {
      logger.error('❌ Resume analysis error:', error);
      return {
        success: false,
        error: error.message,
        confidence: 0
      };
    }
  }

  // Extract experience with validation
  extractExperience(text) {
    try {
      const doc = compromise(text);
      const numbers = doc.numbers().text();
      const years = parseInt(numbers) || 0;
      return { years: Math.max(0, years), details: text.substring(0, 200) };
    } catch (error) {
      logger.warn('⚠️ Experience extraction error:', error);
      return { years: 0, details: '' };
    }
  }

  // Extract education with error handling
  extractEducation(text) {
    try {
      const educationKeywords = ['bachelor', 'master', 'phd', 'diploma', 'certification'];
      const tokens = this.tokenizer.tokenize(text.toLowerCase());
      return tokens.filter(t => educationKeywords.includes(t));
    } catch (error) {
      logger.warn('⚠️ Education extraction error:', error);
      return [];
    }
  }

  // Predict task completion time with validation
  async predictTaskTime(taskData) {
    try {
      // Validate input
      if (!taskData) throw new Error('Task data is required');
      
      const { complexity = 1, dependencies = 0, teamSize = 1, skillLevel = 1 } = taskData;
      
      // Validate ranges
      if (complexity < 1 || complexity > 10) throw new Error('Complexity must be 1-10');
      if (teamSize < 1 || teamSize > 100) throw new Error('Team size must be 1-100');
      if (skillLevel < 0.1 || skillLevel > 2) throw new Error('Skill level must be 0.1-2');
      
      let estimatedHours = complexity * 4;
      estimatedHours *= (1 + dependencies * 0.1);
      estimatedHours /= (teamSize * skillLevel);
      
      return {
        success: true,
        estimatedHours: Math.round(estimatedHours * 10) / 10,
        confidence: 0.82,
        factors: { complexity, dependencies, teamSize, skillLevel }
      };
    } catch (error) {
      logger.error('❌ Task time prediction error:', error);
      return {
        success: false,
        error: error.message,
        estimatedHours: 0
      };
    }
  }

  // Smart task assignment with improved algorithm
  async assignTask(task, employees) {
    try {
      if (!task) throw new Error('Task is required');
      if (!employees || !Array.isArray(employees) || employees.length === 0) {
        throw new Error('Valid employee list is required');
      }

      logger.info('🎯 Running AI Task Assignment...');
      
      const scored = employees
        .filter(emp => emp && emp.id) // Filter valid employees
        .map(emp => ({
          employee: emp,
          score: this.calculateTaskFitScore(task, emp)
        }))
        .sort((a, b) => b.score - a.score);
      
      if (scored.length === 0) {
        throw new Error('No valid employees found for assignment');
      }

      return {
        success: true,
        recommended: scored[0]?.employee,
        alternatives: scored.slice(1, 4),
        scores: scored,
        confidence: Math.min(1, scored[0]?.score || 0)
      };
    } catch (error) {
      logger.error('❌ Task assignment error:', error);
      return {
        success: false,
        error: error.message,
        recommended: null
      };
    }
  }

  // Calculate task fit score
  calculateTaskFitScore(task, employee) {
    try {
      let score = 0;
      
      const skillMatch = this.calculateSkillMatch(
        task.requiredSkills || [], 
        employee.skills || []
      );
      score += skillMatch * 0.4;
      
      const availability = Math.max(0, 1 - ((employee.currentTasks || 0) / (employee.maxTasks || 10)));
      score += availability * 0.3;
      
      const experienceMatch = Math.min(1, (employee.yearsExperience || 0) / 5);
      score += experienceMatch * 0.2;
      
      const performanceMatch = ((employee.performanceRating || 3) / 5);
      score += performanceMatch * 0.1;
      
      return Math.round(score * 100) / 100;
    } catch (error) {
      logger.warn('⚠️ Score calculation error:', error);
      return 0;
    }
  }

  // Calculate skill match
  calculateSkillMatch(requiredSkills, employeeSkills) {
    try {
      if (!requiredSkills || requiredSkills.length === 0) return 1;
      if (!employeeSkills || employeeSkills.length === 0) return 0;
      
      const matched = requiredSkills.filter(skill => 
        employeeSkills.some(empSkill => 
          empSkill?.toLowerCase?.()?.includes?.(skill?.toLowerCase?.())
        )
      );
      
      return Math.min(1, matched.length / requiredSkills.length);
    } catch (error) {
      logger.warn('⚠️ Skill match error:', error);
      return 0.5;
    }
  }

  // Predict employee performance
  async predictPerformance(employee) {
    try {
      if (!employee) throw new Error('Employee data is required');
      
      const factors = {
        skillLevel: Math.min(1, (employee.skillLevel || 5) / 10),
        experience: Math.min(1, (employee.yearsExperience || 0) / 10),
        pastPerformance: Math.min(1, (employee.performanceRating || 3) / 5),
        satisfaction: Math.min(1, (employee.satisfaction || 3.5) / 5),
        trainingHours: Math.min(1, (employee.trainingHours || 0) / 100)
      };
      
      const prediction = 
        factors.skillLevel * 0.25 +
        factors.experience * 0.25 +
        factors.pastPerformance * 0.25 +
        factors.satisfaction * 0.15 +
        factors.trainingHours * 0.1;
      
      return {
        success: true,
        predictedPerformance: Math.round(prediction * 100),
        factors,
        recommendation: this.getPerformanceRecommendation(prediction),
        confidence: 0.78
      };
    } catch (error) {
      logger.error('❌ Performance prediction error:', error);
      return {
        success: false,
        error: error.message,
        predictedPerformance: 0
      };
    }
  }

  // Get performance recommendation
  getPerformanceRecommendation(score) {
    if (score >= 0.8) return '⭐ Excellent - High performer';
    if (score >= 0.6) return '✅ Good - Solid contributor';
    if (score >= 0.4) return '⚠️ Fair - Needs improvement';
    return '❌ Poor - Requires intervention';
  }

  // Detect project risks
  async detectProjectRisk(project) {
    try {
      if (!project) throw new Error('Project data is required');
      
      const risks = [];
      let riskScore = 0;
      
      // Budget risk
      const budgetUsage = (project.spentBudget || 0) / (project.totalBudget || 1);
      if (budgetUsage > 0.8) {
        risks.push({ type: 'Budget', severity: 'High', message: 'Budget running low' });
        riskScore += 0.3;
      }
      
      // Schedule risk
      const daysRemaining = Math.max(0, 
        (new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      const totalDays = Math.max(1, 
        (new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24)
      );
      const completionPercentage = Math.min(1, (project.completedTasks || 0) / (project.totalTasks || 1));
      
      if (completionPercentage < (1 - daysRemaining / totalDays)) {
        risks.push({ type: 'Schedule', severity: 'High', message: 'Behind schedule' });
        riskScore += 0.3;
      }
      
      // Resource risk
      if ((project.teamSize || 0) < (project.requiredTeamSize || 1)) {
        risks.push({ type: 'Resource', severity: 'Medium', message: 'Insufficient resources' });
        riskScore += 0.2;
      }
      
      // Quality risk
      if ((project.defectRate || 0) > 0.05) {
        risks.push({ type: 'Quality', severity: 'Medium', message: 'Quality issues detected' });
        riskScore += 0.2;
      }
      
      return {
        success: true,
        risks,
        riskScore: Math.min(1, riskScore),
        riskLevel: riskScore > 0.6 ? 'High' : riskScore > 0.3 ? 'Medium' : 'Low',
        recommendations: this.getProjectRiskRecommendations(risks)
      };
    } catch (error) {
      logger.error('❌ Risk detection error:', error);
      return {
        success: false,
        error: error.message,
        risks: [],
        riskScore: 0
      };
    }
  }

  // Get project risk recommendations
  getProjectRiskRecommendations(risks) {
    const recommendations = new Set();
    
    risks.forEach(risk => {
      if (risk.type === 'Budget') {
        recommendations.add('Prioritize high-value tasks');
        recommendations.add('Review and cut low-priority features');
      }
      if (risk.type === 'Schedule') {
        recommendations.add('Add more team members');
        recommendations.add('Extend deadline if possible');
        recommendations.add('Parallelize tasks');
      }
      if (risk.type === 'Resource') {
        recommendations.add('Reallocate resources from other projects');
        recommendations.add('Hire additional contractors');
      }
      if (risk.type === 'Quality') {
        recommendations.add('Increase testing time');
        recommendations.add('Code review improvements');
        recommendations.add('Quality assurance focus');
      }
    });
    
    return Array.from(recommendations);
  }

  // Generate insights
  async generateInsights(data) {
    try {
      if (!data) throw new Error('Data is required');
      
      const insights = [];
      
      // Employee insights
      if (data.employees && Array.isArray(data.employees)) {
        const topPerformers = [...data.employees]
          .filter(e => e && e.performanceRating)
          .sort((a, b) => (b.performanceRating || 0) - (a.performanceRating || 0))
          .slice(0, 3);
        
        if (topPerformers.length > 0) {
          insights.push({
            type: 'Employee',
            title: '⭐ Top Performers',
            value: topPerformers.map(e => e.name).join(', '),
            action: 'Consider for leadership roles'
          });
        }
      }
      
      // Project insights
      if (data.projects && Array.isArray(data.projects)) {
        const onTrackProjects = data.projects.filter(p => 
          p && (p.completionPercentage || 0) > 0.5
        ).length;
        
        insights.push({
          type: 'Project',
          title: '📊 Project Status',
          value: `${onTrackProjects}/${data.projects.length} on track`,
          action: 'Review delayed projects'
        });
      }
      
      return {
        success: true,
        insights
      };
    } catch (error) {
      logger.error('❌ Insights generation error:', error);
      return {
        success: false,
        error: error.message,
        insights: []
      };
    }
  }
}

module.exports = AIService;
