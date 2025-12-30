import axios from 'axios';
import systemConfig from '../../config/system';

export interface EssayScoringRequest {
  essayText: string;
  question: string;
  rubric?: string;
  modelAnswer?: string;
  maxScore: number;
}

export interface EssayScoringResponse {
  score: number;
  feedback: string;
  confidence: number;
  suggestions?: string[];
}

export async function scoreEssayWithClaude(
  request: EssayScoringRequest
): Promise<EssayScoringResponse> {
  try {
    const apiKey = systemConfig.claude?.apiKey || process.env.CLAUDE_API_KEY;
    const apiUrl = systemConfig.claude?.apiUrl || process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';

    if (!apiKey) {
      throw new Error('Claude API key not configured');
    }

    const prompt = `
      You are an expert educator tasked with scoring a student's essay response. 
      Please evaluate the following essay based on the provided question, rubric, and model answer.
      
      Question: ${request.question}
      
      ${request.rubric ? `Rubric: ${request.rubric}` : ''}
      
      ${request.modelAnswer ? `Model Answer: ${request.modelAnswer}` : ''}
      
      Student's Essay: ${request.essayText}
      
      Please provide:
      1. A numerical score out of ${request.maxScore}
      2. Detailed feedback on strengths and weaknesses
      3. A confidence level (0-1) for your evaluation
      4. Specific suggestions for improvement
      
      Respond in JSON format with the following structure:
      {
        "score": number,
        "feedback": string,
        "confidence": number,
        "suggestions": string[]
      }
    `;

    const response = await axios.post(apiUrl, {
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        }
      ],
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    });

    // Parse the response - Claude typically returns the response in content[0].text
    const content = response.data.content[0].text;
    
    try {
      // Try to parse as JSON
      const parsedResponse = JSON.parse(content);
      return parsedResponse;
    } catch (parseError) {
      // If not JSON, try to extract the information
      console.warn('Could not parse Claude response as JSON, attempting fallback parsing');
      
      return {
        score: extractScoreFromText(content, request.maxScore),
        feedback: extractFeedbackFromText(content),
        confidence: extractConfidenceFromText(content),
        suggestions: extractSuggestionsFromText(content),
      };
    }
  } catch (error) {
    console.error('Error scoring essay with Claude:', error);
    
    if (axios.isAxiosError(error)) {
      throw new Error(`Claude API error: ${error.response?.data?.error?.message || error.message}`);
    }
    
    throw new Error('Failed to score essay with Claude API');
  }
}

function extractScoreFromText(text: string, maxScore: number): number {
  // Simple extraction - in production, this would be more sophisticated
  const scoreMatch = text.match(/score[\s:]*(\d+(?:\.\d+)?)/i);
  
  if (scoreMatch && scoreMatch[1]) {
    const score = parseFloat(scoreMatch[1]);
    return Math.min(score, maxScore); // Ensure score doesn't exceed max
  }
  
  // Fallback: return average score
  return maxScore / 2;
}

function extractFeedbackFromText(text: string): string {
  // Extract feedback section
  const feedbackMatch = text.match(/feedback[\s:]*([\s\S]*?)(?=\n\n|\nscore|\nconfidence|\nsuggestions|$)/i);
  
  if (feedbackMatch && feedbackMatch[1]) {
    return feedbackMatch[1].trim();
  }
  
  // Fallback: return first paragraph
  return text.split('\n\n')[0].trim();
}

function extractConfidenceFromText(text: string): number {
  // Extract confidence level
  const confidenceMatch = text.match(/confidence[\s:]*(\d+(?:\.\d+)?)/i);
  
  if (confidenceMatch && confidenceMatch[1]) {
    return parseFloat(confidenceMatch[1]);
  }
  
  // Fallback: return medium confidence
  return 0.7;
}

function extractSuggestionsFromText(text: string): string[] {
  // Extract suggestions
  const suggestionsMatch = text.match(/suggestions[\s:]*([\s\S]*)/i);
  
  if (suggestionsMatch && suggestionsMatch[1]) {
    const suggestionsText = suggestionsMatch[1].trim();
    return suggestionsText.split('\n').map(s => s.trim()).filter(s => s);
  }
  
  // Fallback: return empty array
  return [];
}

export async function scoreEssayFallback(
  request: EssayScoringRequest
): Promise<EssayScoringResponse> {
  // Fallback scoring when Claude API is not available
  // This is a simplified version - real implementation would be more sophisticated
  
  const wordCount = request.essayText.split(/\s+/).length;
  const hasIntroduction = request.essayText.toLowerCase().includes('introduction') || 
                         request.essayText.toLowerCase().includes('first');
  const hasConclusion = request.essayText.toLowerCase().includes('conclusion') || 
                       request.essayText.toLowerCase().includes('finally');
  const mentionsQuestion = request.essayText.toLowerCase().includes(request.question.toLowerCase());
  
  // Simple scoring algorithm
  let score = 0;
  
  // Word count (20%)
  score += Math.min(wordCount / 50, 1) * (request.maxScore * 0.2);
  
  // Structure (30%)
  if (hasIntroduction) score += request.maxScore * 0.1;
  if (hasConclusion) score += request.maxScore * 0.1;
  if (mentionsQuestion) score += request.maxScore * 0.1;
  
  // Content (50%)
  // This would be more sophisticated in a real implementation
  score += request.maxScore * 0.25;
  
  return {
    score: Math.round(score),
    feedback: `This essay has ${wordCount} words and ${hasIntroduction && hasConclusion ? 'good' : 'fair'} structure. ` +
              `${mentionsQuestion ? 'It addresses the question well.' : 'It could better address the question.'}`,
    confidence: 0.5, // Lower confidence for fallback
    suggestions: [
      'Ensure your essay has a clear introduction and conclusion',
      'Directly address all parts of the question',
      'Use specific examples to support your points',
      'Proofread for grammar and spelling errors',
    ],
  };
}

export async function scoreEssay(
  request: EssayScoringRequest
): Promise<EssayScoringResponse> {
  try {
    // Try Claude API first
    return await scoreEssayWithClaude(request);
  } catch (error) {
    console.warn('Claude API failed, using fallback scorer:', error);
    
    // Fall back to simple scoring
    return await scoreEssayFallback(request);
  }
}