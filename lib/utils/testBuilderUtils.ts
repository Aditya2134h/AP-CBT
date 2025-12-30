import { QuestionType } from '../constants';

export function createEmptyQuestion(type: QuestionType) {
  const baseQuestion = {
    text: '',
    type,
    points: 1,
    difficulty: 'medium' as const,
    section: '',
    hint: '',
    explanation: '',
  };

  switch (type) {
    case 'mcq':
      return {
        ...baseQuestion,
        options: ['', ''],
        correctAnswer: '',
      };
    
    case 'essay':
      return {
        ...baseQuestion,
        wordLimit: 500,
        rubric: '',
      };
    
    case 'matching':
      return {
        ...baseQuestion,
        matchingPairs: [
          { left: '', right: '' },
          { left: '', right: '' },
        ],
      };
    
    case 'fill-blank':
      return {
        ...baseQuestion,
        correctAnswer: '',
        caseSensitive: false,
      };
    
    case 'true-false':
      return {
        ...baseQuestion,
        correctAnswer: 'true',
      };
    
    case 'image-recognition':
      return {
        ...baseQuestion,
        imageUrl: '',
        correctAnswer: '',
      };
    
    default:
      return baseQuestion;
  }
}

export function validateQuestion(question: any) {
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

  switch (question.type) {
    case 'mcq':
      if (!question.options || question.options.length < 2) {
        errors.push('MCQ questions require at least 2 options');
      }

      if (question.options && question.options.some((opt: string) => !opt || opt.trim() === '')) {
        errors.push('All MCQ options must be filled');
      }

      if (!question.correctAnswer) {
        errors.push('Correct answer is required for MCQ');
      } else if (question.options && !question.options.includes(question.correctAnswer)) {
        errors.push('Correct answer must be one of the options');
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

      if (question.matchingPairs && question.matchingPairs.some((pair: any) => !pair.left || !pair.right)) {
        errors.push('All matching pairs must have both left and right values');
      }
      break;

    case 'image-recognition':
      if (!question.imageUrl) {
        errors.push('Image URL is required for image recognition');
      }

      if (!question.correctAnswer) {
        errors.push('Correct answer is required for image recognition');
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateTest(test: any) {
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

  // Validate all questions
  if (test.questions) {
    test.questions.forEach((question: any, index: number) => {
      const questionValidation = validateQuestion(question);
      if (!questionValidation.valid) {
        questionValidation.errors.forEach(error => {
          errors.push(`Question ${index + 1}: ${error}`);
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function calculateTestStatistics(test: any) {
  if (!test.questions || test.questions.length === 0) {
    return {
      totalPoints: 0,
      questionCount: 0,
      difficultyDistribution: { easy: 0, medium: 0, hard: 0 },
    };
  }

  const totalPoints = test.questions.reduce((sum: number, question: any) => sum + (question.points || 1), 0);
  const questionCount = test.questions.length;

  const difficultyDistribution = test.questions.reduce((dist: any, question: any) => {
    const difficulty = question.difficulty || 'medium';
    dist[difficulty] = (dist[difficulty] || 0) + 1;
    return dist;
  }, { easy: 0, medium: 0, hard: 0 });

  return {
    totalPoints,
    questionCount,
    difficultyDistribution,
  };
}

export function shuffleTestQuestions(test: any) {
  if (!test.questions || test.questions.length <= 1) {
    return test;
  }

  return {
    ...test,
    questions: [...test.questions].sort(() => Math.random() - 0.5),
  };
}

export function getQuestionTypeLabel(type: QuestionType) {
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

export function getQuestionTypeIcon(type: QuestionType) {
  const icons: Record<QuestionType, string> = {
    'mcq': '✓',
    'essay': '📝',
    'matching': '🔗',
    'fill-blank': '🔤',
    'true-false': '✅/❌',
    'image-recognition': '🖼️',
  };

  return icons[type] || '❓';
}

export function exportTestToJSON(test: any) {
  return JSON.stringify({
    version: '1.0',
    type: 'cbt-test',
    data: test,
  }, null, 2);
}

export function importTestFromJSON(json: string) {
  try {
    const parsed = JSON.parse(json);

    if (parsed.version !== '1.0' || parsed.type !== 'cbt-test') {
      throw new Error('Invalid test format');
    }

    return parsed.data;
  } catch (error) {
    throw new Error('Failed to import test: ' + error.message);
  }
}

export function exportTestToCSV(test: any) {
  // This is a simplified version - real implementation would be more comprehensive
  const header = 'Type,Text,Points,Difficulty,Section,Correct Answer,Options,Hint,Explanation\n';

  const rows = test.questions.map((question: any) => {
    const options = question.options ? question.options.join('|') : '';
    const correctAnswer = question.correctAnswer ? question.correctAnswer : '';

    return `"${question.type}","${question.text}",${question.points},"${question.difficulty}","${question.section}","${correctAnswer}","${options}","${question.hint}","${question.explanation}"`;
  }).join('\n');

  return header + rows;
}

export function importTestFromCSV(csv: string) {
  // This is a simplified version - real implementation would be more comprehensive
  const lines = csv.split('\n');
  const header = lines[0];
  const questionLines = lines.slice(1);

  const questions = questionLines.map(line => {
    if (!line.trim()) return null;

    const values = line.split(',').map(v => v.replace(/^"|"$/g, ''));

    return {
      type: values[0],
      text: values[1],
      points: parseInt(values[2]) || 1,
      difficulty: values[3] || 'medium',
      section: values[4] || '',
      correctAnswer: values[5] || '',
      options: values[6] ? values[6].split('|') : [],
      hint: values[7] || '',
      explanation: values[8] || '',
    };
  }).filter(q => q !== null);

  return {
    title: 'Imported Test',
    subject: 'General',
    duration: 60,
    passingScore: 70,
    questions,
  };
}

export function generateTestPreview(test: any) {
  return {
    title: test.title,
    subject: test.subject,
    duration: test.duration,
    passingScore: test.passingScore,
    questionCount: test.questions?.length || 0,
    totalPoints: test.questions?.reduce((sum: number, q: any) => sum + (q.points || 1), 0) || 0,
    startDate: test.startDate,
    endDate: test.endDate,
  };
}