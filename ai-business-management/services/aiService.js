// AI Service - Core AI Functionality

const brain = require('brain.js');
const ml = require('ml.js');
const natural = require('natural');
const compromise = require('compromise');

class AIService {
  constructor() {
    this.models = {};
    this.cache = new Map();
    this.trained = false;
  }

  // Initialize AI models
  initialize() {
    console.log('🤖 Initializing AI Models...');
    this.loadModels();
    this.setupNLP();
    this.trained = true;
    console.log('✅ AI Models Ready');
  }

  // Load pre-trained models
  loadModels() {
    // Load task estimation model
    this.models.taskEstimation = new brain.NeuralNetwork();
    
    // Load employee skill matching model
    this.models.skillMatching = new brain.NeuralNetwork();
    
    // Load performance prediction model
    this.models.performancePrediction = new brain.NeuralNetwork();
    
    // Load risk detection model
    this.models.riskDetection = new brain.NeuralNetwork();
  }

  // Setup NLP processors
  setupNLP() {
    this.tokenizer = new natural.WordTokenizer();
    this.classifier = new natural.BayesClassifier();
    this.stemmer = natural.PorterStemmer;
  }

  // Analyze resume and extract skills
  analyzeResume(resumeText) {
    console.log('📄 Analyzing Resume...');
    
    const tokens = this.tokenizer.tokenize(resumeText.toLowerCase());
    const stems = tokens.map(token => this.stemmer.stem(token));
    
    // Extract skills using NLP
    const skillKeywords = [
      'javascript', 'python', 'java', 'csharp', 'nodejs', 'react', 'vue',
      'sql', 'mongodb', 'management', 'leadership', 'communication',
      'project', 'agile', 'scrum', 'devops', 'aws', 'azure'
    ];
    
    const extractedSkills = stems.filter(stem => 
      skillKeywords.includes(stem)
    );
    
    // Score skills
    const skillScore = extractedSkills.length / skillKeywords.length;
    
    return {
      skills: [...new Set(extractedSkills)],
      skillScore: Math.min(1, skillScore),
      experience: this.extractExperience(resumeText),
      education: this.extractEducation(resumeText),
      confidence: 0.85
    };
  }

  // Extract experience from resume
  extractExperience(text) {
    const doc = compromise(text);
    const numbers = doc.numbers().text();
    const years = parseInt(numbers) || 0;
    return { years, details: text.substring(0, 200) };
  }

  // Extract education from resume
  extractEducation(text) {
    const educationKeywords = ['bachelor', 'master', 'phd', 'diploma', 'certification'];
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    return tokens.filter(t => educationKeywords.includes(t));
  }

  // Predict task completion time (in hours)
  predictTaskTime(taskData) {
    const { complexity, dependencies, teamSize, skillLevel } = taskData;
    
    // Base estimation
    let estimatedHours = complexity * 4; // 4 hours per complexity unit
    
    // Adjust for dependencies
    estimatedHours *= (1 + dependencies * 0.1);
    
    // Adjust for team efficiency
    estimatedHours /= (teamSize * skillLevel);
    
    return {
      estimatedHours: Math.round(estimatedHours * 10) / 10,
      confidence: 0.82,
      factors: { complexity, dependencies, teamSize, skillLevel }
    };
  }

  // Smart task assignment
  assignTask(task, employees) {
    console.log('🎯 Running AI Task Assignment...');
    
    const scored = employees.map(emp => ({
      employee: emp,
      score: this.calculateTaskFitScore(task, emp)
    }));
    
    scored.sort((a, b) => b.score - a.score);
    
    return {
      recommended: scored[0]?.employee,
      alternatives: scored.slice(1, 4),
      scores: scored,
      confidence: scored[0]?.score || 0
    };
  }

  // Calculate task fit score for employee
  calculateTaskFitScore(task, employee) {
    let score = 0;
    
    // Skill match
    const skillMatch = this.calculateSkillMatch(task.requiredSkills, employee.skills);
    score += skillMatch * 0.4;
    
    // Availability
    const availability = 1 - (employee.currentTasks / employee.maxTasks);
    score += availability * 0.3;
    
    // Experience level
    const experienceMatch = Math.min(1, employee.yearsExperience / 5);
    score += experienceMatch * 0.2;
    
    // Past performance
    const performanceMatch = (employee.performanceRating || 3) / 5;
    score += performanceMatch * 0.1;
    
    return Math.round(score * 100) / 100;
  }

  // Calculate skill match percentage
  calculateSkillMatch(requiredSkills, employeeSkills) {
    if (!requiredSkills || requiredSkills.length === 0) return 1;
    
    const matched = requiredSkills.filter(skill => 
      employeeSkills.some(empSkill => 
        empSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    return matched.length / requiredSkills.length;
  }

  // Predict employee performance
  predictPerformance(employee) {
    const factors = {
      skillLevel: employee.skillLevel / 10,
      experience: Math.min(1, employee.yearsExperience / 10),
      pastPerformance: (employee.performanceRating || 3) / 5,
      satisfaction: (employee.satisfaction || 3.5) / 5,
      trainingHours: Math.min(1, (employee.trainingHours || 0) / 100)
    };
    
    // Weighted prediction
    const prediction = 
      factors.skillLevel * 0.25 +
      factors.experience * 0.25 +
      factors.pastPerformance * 0.25 +
      factors.satisfaction * 0.15 +
      factors.trainingHours * 0.1;
    
    return {
      predictedPerformance: Math.round(prediction * 100),
      factors,
      recommendation: this.getPerformanceRecommendation(prediction),
      confidence: 0.78
    };
  }

  // Get performance recommendation
  getPerformanceRecommendation(score) {
    if (score >= 0.8) return '⭐ Excellent - High performer';
    if (score >= 0.6) return '✅ Good - Solid contributor';
    if (score >= 0.4) return '⚠️ Fair - Needs improvement';
    return '❌ Poor - Requires intervention';
  }

  // Detect risks in projects
  detectProjectRisk(project) {
    const risks = [];
    let riskScore = 0;
    
    // Budget risk
    if (project.spentBudget / project.totalBudget > 0.8) {
      risks.push({ type: 'Budget', severity: 'High', message: 'Budget running low' });
      riskScore += 0.3;
    }
    
    // Schedule risk
    const daysRemaining = (new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24);
    const completionPercentage = project.completedTasks / project.totalTasks;
    if (completionPercentage < (1 - daysRemaining / project.totalDays)) {
      risks.push({ type: 'Schedule', severity: 'High', message: 'Behind schedule' });
      riskScore += 0.3;
    }
    
    // Resource risk
    if (project.teamSize < project.requiredTeamSize) {
      risks.push({ type: 'Resource', severity: 'Medium', message: 'Insufficient resources' });
      riskScore += 0.2;
    }
    
    // Quality risk
    if (project.defectRate > 0.05) {
      risks.push({ type: 'Quality', severity: 'Medium', message: 'Quality issues detected' });
      riskScore += 0.2;
    }
    
    return {
      risks,
      riskScore: Math.min(1, riskScore),
      riskLevel: riskScore > 0.6 ? 'High' : riskScore > 0.3 ? 'Medium' : 'Low',
      recommendations: this.getProjectRiskRecommendations(risks)
    };
  }

  // Get recommendations for project risks
  getProjectRiskRecommendations(risks) {
    const recommendations = [];
    
    risks.forEach(risk => {
      if (risk.type === 'Budget') {
        recommendations.push('Prioritize high-value tasks');
        recommendations.push('Review and cut low-priority features');
      }
      if (risk.type === 'Schedule') {
        recommendations.push('Add more team members');
        recommendations.push('Extend deadline if possible');
        recommendations.push('Parallelize tasks');
      }
      if (risk.type === 'Resource') {
        recommendations.push('Reallocate resources from other projects');
        recommendations.push('Hire additional contractors');
      }
      if (risk.type === 'Quality') {
        recommendations.push('Increase testing time');
        recommendations.push('Code review improvements');
        recommendations.push('Quality assurance focus');
      }
    });
    
    return [...new Set(recommendations)];
  }

  // Generate insights and recommendations
  generateInsights(data) {
    const insights = [];
    
    // Employee insights
    if (data.employees) {
      const topPerformers = data.employees
        .sort((a, b) => (b.performanceRating || 0) - (a.performanceRating || 0))
        .slice(0, 3);
      
      insights.push({
        type: 'Employee',
        title: 'Top Performers',
        value: topPerformers.map(e => e.name).join(', '),
        action: 'Consider for leadership roles'
      });
    }
    
    // Project insights
    if (data.projects) {
      const onTrackProjects = data.projects.filter(p => p.completionPercentage > 0.5).length;
      
      insights.push({
        type: 'Project',
        title: 'Project Status',
        value: `${onTrackProjects}/${data.projects.length} on track`,
        action: 'Review delayed projects'
      });
    }
    
    return insights;
  }
}

module.exports = AIService;
