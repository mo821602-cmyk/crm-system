// NLP Service - Natural Language Processing

const natural = require('natural');
const compromise = require('compromise');

class NLPService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.classifier = new natural.BayesClassifier();
    this.stemmer = natural.PorterStemmer;
    this.sentiment = require('natural').SentimentAnalyzer;
  }

  // Classify text
  classifyText(text, categories) {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const scores = {};
    
    categories.forEach(category => {
      let score = 0;
      tokens.forEach(token => {
        if (category.keywords.some(kw => token.includes(kw.toLowerCase()))) {
          score++;
        }
      });
      scores[category.name] = score / tokens.length;
    });
    
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    
    return {
      classification: sorted[0][0],
      scores,
      confidence: sorted[0][1]
    };
  }

  // Extract entities from text
  extractEntities(text) {
    const doc = compromise(text);
    
    return {
      people: doc.people().out('array'),
      organizations: doc.organizations().out('array'),
      places: doc.places().out('array'),
      dates: doc.dates().out('array'),
      money: doc.money().out('array'),
      numbers: doc.numbers().out('array')
    };
  }

  // Analyze sentiment
  analyzeSentiment(text) {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    
    const positive = ['good', 'great', 'excellent', 'amazing', 'happy', 'satisfied'];
    const negative = ['bad', 'poor', 'terrible', 'awful', 'angry', 'unhappy'];
    
    let score = 0;
    tokens.forEach(token => {
      if (positive.includes(token)) score++;
      if (negative.includes(token)) score--;
    });
    
    const sentiment = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
    
    return {
      sentiment,
      score: score / tokens.length,
      confidence: 0.75
    };
  }

  // Generate summary
  generateSummary(text, sentenceCount = 3) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const scores = sentences.map((sentence, index) => ({
      index,
      sentence: sentence.trim(),
      score: this.scoreSentence(sentence)
    }));
    
    const topSentences = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, sentenceCount)
      .sort((a, b) => a.index - b.index);
    
    return topSentences.map(s => s.sentence).join(' ');
  }

  // Score sentence importance
  scoreSentence(sentence) {
    const words = sentence.split(' ').length;
    const keywords = ['important', 'critical', 'urgent', 'key', 'must'];
    let score = words;
    
    keywords.forEach(kw => {
      if (sentence.toLowerCase().includes(kw)) score += 5;
    });
    
    return score;
  }

  // Extract key phrases
  extractKeyPhrases(text) {
    const doc = compromise(text);
    const nouns = doc.nouns().out('array');
    const verbs = doc.verbs().out('array');
    
    return {
      nouns: [...new Set(nouns)],
      verbs: [...new Set(verbs)],
      phrases: this.extractPhrases(text)
    };
  }

  // Extract phrases
  extractPhrases(text) {
    const phrases = [];
    const tokens = this.tokenizer.tokenize(text);
    
    for (let i = 0; i < tokens.length - 2; i++) {
      phrases.push([tokens[i], tokens[i + 1], tokens[i + 2]].join(' '));
    }
    
    return [...new Set(phrases)].slice(0, 5);
  }
}

module.exports = NLPService;
