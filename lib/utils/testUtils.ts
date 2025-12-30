import { QuestionType } from '../constants';

export function calculateTestScore(answers: any[], questions: any[]): number {
  let totalScore = 0;
  let totalPossible = 0;
  
  for (const answer of answers) {
    const question = questions.find(q => q._id.toString() === answer.question.toString());
    
    if (!question) continue;
    
    totalPossible += question.points;
    
    switch (question.type) {
      case 'mcq':
        if (Array.isArray(answer.answer)) {
          // Multiple selection MCQ
          const correctAnswers = Array.isArray(question.correctAnswer) 
            ? question.correctAnswer 
            : [question.correctAnswer];
          
          const correctCount = answer.answer.filter((ans: string) => 
            correctAnswers.includes(ans)
          ).length;
          
          totalScore += (correctCount / correctAnswers.length) * question.points;
        } else {
          // Single selection MCQ
          if (answer.answer === question.correctAnswer) {
            totalScore += question.points;
          }
        }
        break;
      
      case 'true-false':
        if (answer.answer === question.correctAnswer) {
          totalScore += question.points;
        }
        break;
      
      case 'fill-blank':
        // Simple exact match for fill-in-the-blank
        if (answer.answer.toLowerCase().trim() === 
            (question.correctAnswer as string).toLowerCase().trim()) {
          totalScore += question.points;
        }
        break;
      
      case 'matching':
        // Matching questions would need more complex scoring
        // This is a simplified version
        const correctPairs = question.matchingPairs || [];
        const userPairs = answer.answer || [];
        
        let correctCount = 0;
        
        for (const pair of userPairs) {
          const correctPair = correctPairs.find((cp: any) => cp.left === pair.left);
          if (correctPair && correctPair.right === pair.right) {
            correctCount++;
          }
        }
        
        totalScore += (correctCount / correctPairs.length) * question.points;
        break;
      
      case 'image-recognition':
        // Image recognition would typically be scored manually or with AI
        // For now, we'll assume it's scored separately
        break;
      
      case 'essay':
        // Essay questions are scored separately (manually or with AI)
        // For now, we'll assume the score is already set
        if (answer.score) {
          totalScore += answer.score;
        }
        break;
    }
  }
  
  return { totalScore, totalPossible };
}

export function calculatePercentage(score: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
}

export function determineGrade(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

export function determineStatus(percentage: number, passingScore: number): 'pass' | 'fail' {
  return percentage >= passingScore ? 'pass' : 'fail';
}

export function shuffleQuestions(questions: any[]): any[] {
  return [...questions].sort(() => Math.random() - 0.5);
}

export function getQuestionTypeLabel(type: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    'mcq': 'Multiple Choice',
    'essay': 'Essay',
    'matching': 'Matching',
    'fill-blank': 'Fill in the Blank',
    'true-false': 'True/False',
    'image-recognition': 'Image Recognition',
  };
  
  return labels[type] || type;
}

export function formatQuestionText(text: string, type: QuestionType): string {
  // Add question number prefix based on type
  switch (type) {
    case 'mcq':
      return `MCQ: ${text}`;
    case 'essay':
      return `Essay: ${text}`;
    case 'matching':
      return `Matching: ${text}`;
    case 'fill-blank':
      return `Fill in the Blank: ${text}`;
    case 'true-false':
      return `True/False: ${text}`;
    case 'image-recognition':
      return `Image Recognition: ${text}`;
    default:
      return text;
  }
}

export function validateQuestion(question: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!question.text || question.text.trim() === '') {
    errors.push('Question text is required');
  }
  
  if (!question.type) {
    errors.push('Question type is required');
  }
  
  if (!question.points || question.points <= 0) {
    errors.push('Points must be greater than 0');
  }
  
  // Type-specific validation
  switch (question.type) {
    case 'mcq':
      if (!question.options || question.options.length < 2) {
        errors.push('MCQ questions require at least 2 options');
      }
      
      if (!question.correctAnswer) {
        errors.push('Correct answer is required for MCQ');
      } else {
        if (Array.isArray(question.correctAnswer)) {
          if (question.correctAnswer.length === 0) {
            errors.push('At least one correct answer is required');
          }
        } else if (!question.options?.includes(question.correctAnswer)) {
          errors.push('Correct answer must be one of the options');
        }
      }
      break;
    
    case 'true-false':
      if (!question.correctAnswer || !['true', 'false'].includes(question.correctAnswer.toLowerCase())) {
        errors.push('Correct answer must be true or false');
      }
      break;
    
    case 'fill-blank':
      if (!question.correctAnswer) {
        errors.push('Correct answer is required for fill-in-the-blank');
      }
      break;
    
    case 'matching':
      if (!question.matchingPairs || question.matchingPairs.length < 2) {
        errors.push('Matching questions require at least 2 pairs');
      }
      break;
    
    case 'image-recognition':
      if (!question.imageUrl) {
        errors.push('Image URL is required for image recognition');
      }
      break;
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateTest(test: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!test.title || test.title.trim() === '') {
    errors.push('Test title is required');
  }
  
  if (!test.subject || test.subject.trim() === '') {
    errors.push('Subject is required');
  }
  
  if (!test.duration || test.duration <= 0) {
    errors.push('Duration must be greater than 0');
  }
  
  if (!test.passingScore || test.passingScore <= 0 || test.passingScore > 100) {
    errors.push('Passing score must be between 1 and 100');
  }
  
  if (!test.startDate || !(test.startDate instanceof Date) || isNaN(test.startDate.getTime())) {
    errors.push('Valid start date is required');
  }
  
  if (!test.endDate || !(test.endDate instanceof Date) || isNaN(test.endDate.getTime())) {
    errors.push('Valid end date is required');
  }
  
  if (test.startDate && test.endDate && test.startDate >= test.endDate) {
    errors.push('End date must be after start date');
  }
  
  if (!test.questions || test.questions.length === 0) {
    errors.push('Test must have at least one question');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function calculateTestDuration(startDate: Date, endDate: Date): number {
  return (endDate.getTime() - startDate.getTime()) / (1000 * 60); // in minutes
}

export function isTestAvailable(test: any): boolean {
  const now = new Date();
  return now >= test.startDate && now <= test.endDate;
}

export function isTestUpcoming(test: any): boolean {
  const now = new Date();
  return now < test.startDate;
}

export function isTestCompleted(test: any): boolean {
  const now = new Date();
  return now > test.endDate;
}