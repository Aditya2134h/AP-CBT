import Question from '../models/Question';
import { QuestionType } from '../constants';
import { getLogger } from './logger';

export class QuestionBankService {
  private logger;

  constructor() {
    this.logger = getLogger();
  }

  public async getQuestions(
    filters: {
      type?: QuestionType;
      difficulty?: string;
      subject?: string;
      section?: string;
      search?: string;
      createdBy?: string;
    } = {},
    limit: number = 100,
    skip: number = 0,
    sort: 'createdAt' | 'points' | 'difficulty' = 'createdAt',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<any[]> {
    try {
      const query: any = {};

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.difficulty) {
        query.difficulty = filters.difficulty;
      }

      if (filters.subject) {
        query.subject = filters.subject;
      }

      if (filters.section) {
        query.section = filters.section;
      }

      if (filters.search) {
        query.$or = [
          { text: { $regex: filters.search, $options: 'i' } },
          { explanation: { $regex: filters.search, $options: 'i' } },
          { hint: { $regex: filters.search, $options: 'i' } },
        ];
      }

      if (filters.createdBy) {
        query.createdBy = filters.createdBy;
      }

      const sortField = sort === 'createdAt' ? { createdAt: order === 'desc' ? -1 : 1 } :
                       sort === 'points' ? { points: order === 'desc' ? -1 : 1 } :
                       { difficulty: order === 'desc' ? -1 : 1 };

      return await Question.find(query)
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get questions: ${error.message}`, 'QUESTION_BANK');
      throw error;
    }
  }

  public async getQuestionCount(
    filters: {
      type?: QuestionType;
      difficulty?: string;
      subject?: string;
      section?: string;
      search?: string;
      createdBy?: string;
    } = {}
  ): Promise<number> {
    try {
      const query: any = {};

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.difficulty) {
        query.difficulty = filters.difficulty;
      }

      if (filters.subject) {
        query.subject = filters.subject;
      }

      if (filters.section) {
        query.section = filters.section;
      }

      if (filters.search) {
        query.$or = [
          { text: { $regex: filters.search, $options: 'i' } },
          { explanation: { $regex: filters.search, $options: 'i' } },
          { hint: { $regex: filters.search, $options: 'i' } },
        ];
      }

      if (filters.createdBy) {
        query.createdBy = filters.createdBy;
      }

      return await Question.countDocuments(query);
    } catch (error) {
      this.logger.error(`Failed to get question count: ${error.message}`, 'QUESTION_BANK');
      throw error;
    }
  }

  public async getQuestionById(id: string): Promise<any> {
    try {
      return await Question.findById(id)
        .populate('createdBy', 'name email')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get question by ID: ${id} - ${error.message}`, 'QUESTION_BANK');
      throw error;
    }
  }

  public async createQuestion(questionData: any): Promise<any> {
    try {
      const question = new Question(questionData);
      await question.save();

      this.logger.info(`Question created: ${question._id}`, 'QUESTION_BANK');

      return question;
    } catch (error) {
      this.logger.error(`Failed to create question: ${error.message}`, 'QUESTION_BANK');
      throw error;
    }
  }

  public async updateQuestion(id: string, updateData: any): Promise<any> {
    try {
      const question = await Question.findByIdAndUpdate(id, updateData, { new: true })
        .populate('createdBy', 'name email')
        .exec();

      if (!question) {
        throw new Error('Question not found');
      }

      this.logger.info(`Question updated: ${id}`, 'QUESTION_BANK');

      return question;
    } catch (error) {
      this.logger.error(`Failed to update question: ${id} - ${error.message}`, 'QUESTION_BANK');
      throw error;
    }
  }

  public async deleteQuestion(id: string): Promise<boolean> {
    try {
      const result = await Question.deleteOne({ _id: id }).exec();

      if (result.deletedCount === 0) {
        throw new Error('Question not found');
      }

      this.logger.info(`Question deleted: ${id}`, 'QUESTION_BANK');

      return true;
    } catch (error) {
      this.logger.error(`Failed to delete question: ${id} - ${error.message}`, 'QUESTION_BANK');
      throw error;
    }
  }

  public async importQuestions(questions: any[], createdBy: string): Promise<{ success: number; failed: number }> {
    try {
      let success = 0;
      let failed = 0;

      for (const questionData of questions) {
        try {
          const question = new Question({
            ...questionData,
            createdBy,
          });

          await question.save();
          success++;
        } catch (error) {
          this.logger.warn(`Failed to import question: ${error.message}`, 'QUESTION_BANK');
          failed++;
        }
      }

      this.logger.info(`Imported questions: ${success} success, ${failed} failed`, 'QUESTION_BANK');

      return { success, failed };
    } catch (error) {
      this.logger.error(`Failed to import questions: ${error.message}`, 'QUESTION_BANK');
      throw error;
    }
  }

  public async exportQuestions(
    filters: {
      type?: QuestionType;
      difficulty?: string;
      subject?: string;
      section?: string;
      createdBy?: string;
    } = {}
  ): Promise<any[]> {
    try {
      const questions = await this.getQuestions(filters, 10000); // Limit to 10k questions for export

      return questions.map(question => ({
        _id: question._id,
        text: question.text,
        type: question.type,
        points: question.points,
        difficulty: question.difficulty,
        section: question.section,
        hint: question.hint,
        explanation: question.explanation,
        options: question.options,
        correctAnswer: question.correctAnswer,
        matchingPairs: question.matchingPairs,
        imageUrl: question.imageUrl,
        createdBy: question.createdBy?._id,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      }));
    } catch (error) {
      this.logger.error(`Failed to export questions: ${error.message}`, 'QUESTION_BANK');
      throw error;
    }
  }

  public async getQuestionStatistics(): Promise<{
    totalQuestions: number;
    byType: Record<QuestionType, number>;
    byDifficulty: Record<string, number>;
  }> {
    try {
      const totalQuestions = await Question.countDocuments();

      const byType = await Question.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]);

      const byDifficulty = await Question.aggregate([
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      ]);

      const typeStats: Record<QuestionType, number> = {
        'mcq': 0,
        'essay': 0,
        'matching': 0,
        'fill-blank': 0,
        'true-false': 0,
        'image-recognition': 0,
      };

      byType.forEach((item: any) => {
        if (item._id in typeStats) {
          typeStats[item._id] = item.count;
        }
      });

      const difficultyStats: Record<string, number> = {
        'easy': 0,
        'medium': 0,
        'hard': 0,
      };

      byDifficulty.forEach((item: any) => {
        if (item._id in difficultyStats) {
          difficultyStats[item._id] = item.count;
        }
      });

      return {
        totalQuestions,
        byType: typeStats,
        byDifficulty: difficultyStats,
      };
    } catch (error) {
      this.logger.error(`Failed to get question statistics: ${error.message}`, 'QUESTION_BANK');
      throw error;
    }
  }

  public async createQuestionVersion(questionId: string, versionData: any): Promise<any> {
    try {
      const originalQuestion = await Question.findById(questionId).exec();

      if (!originalQuestion) {
        throw new Error('Original question not found');
      }

      const version = new Question({
        ...originalQuestion.toObject(),
        ...versionData,
        versionOf: questionId,
        isVersion: true,
      });

      await version.save();

      this.logger.info(`Question version created: ${version._id} (original: ${questionId})`, 'QUESTION_BANK');

      return version;
    } catch (error) {
      this.logger.error(`Failed to create question version: ${questionId} - ${error.message}`, 'QUESTION_BANK');
      throw error;
    }
  }

  public async getQuestionVersions(questionId: string): Promise<any[]> {
    try {
      return await Question.find({ versionOf: questionId })
        .sort({ createdAt: -1 })
        .populate('createdBy', 'name email')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get question versions: ${questionId} - ${error.message}`, 'QUESTION_BANK');
      throw error;
    }
  }

  public async searchQuestions(query: string, limit: number = 10): Promise<any[]> {
    try {
      return await Question.find({
        $or: [
          { text: { $regex: query, $options: 'i' } },
          { explanation: { $regex: query, $options: 'i' } },
          { hint: { $regex: query, $options: 'i' } },
        ],
      })
        .limit(limit)
        .populate('createdBy', 'name email')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to search questions: ${error.message}`, 'QUESTION_BANK');
      throw error;
    }
  }
}

// Singleton instance
let questionBankService: QuestionBankService | null = null;

export function getQuestionBankService(): QuestionBankService {
  if (!questionBankService) {
    questionBankService = new QuestionBankService();
  }
  return questionBankService;
}

export async function getQuestions(
  filters: {
    type?: QuestionType;
    difficulty?: string;
    subject?: string;
    section?: string;
    search?: string;
    createdBy?: string;
  } = {},
  limit: number = 100,
  skip: number = 0,
  sort: 'createdAt' | 'points' | 'difficulty' = 'createdAt',
  order: 'asc' | 'desc' = 'desc'
): Promise<any[]> {
  return getQuestionBankService().getQuestions(filters, limit, skip, sort, order);
}

export async function getQuestionCount(
  filters: {
    type?: QuestionType;
    difficulty?: string;
    subject?: string;
    section?: string;
    search?: string;
    createdBy?: string;
  } = {}
): Promise<number> {
  return getQuestionBankService().getQuestionCount(filters);
}

export async function getQuestionById(id: string): Promise<any> {
  return getQuestionBankService().getQuestionById(id);
}

export async function createQuestion(questionData: any): Promise<any> {
  return getQuestionBankService().createQuestion(questionData);
}

export async function updateQuestion(id: string, updateData: any): Promise<any> {
  return getQuestionBankService().updateQuestion(id, updateData);
}

export async function deleteQuestion(id: string): Promise<boolean> {
  return getQuestionBankService().deleteQuestion(id);
}

export async function importQuestions(questions: any[], createdBy: string): Promise<{ success: number; failed: number }> {
  return getQuestionBankService().importQuestions(questions, createdBy);
}

export async function exportQuestions(
  filters: {
    type?: QuestionType;
    difficulty?: string;
    subject?: string;
    section?: string;
    createdBy?: string;
  } = {}
): Promise<any[]> {
  return getQuestionBankService().exportQuestions(filters);
}

export async function getQuestionStatistics(): Promise<{
  totalQuestions: number;
  byType: Record<QuestionType, number>;
  byDifficulty: Record<string, number>;
}> {
  return getQuestionBankService().getQuestionStatistics();
}

export async function createQuestionVersion(questionId: string, versionData: any): Promise<any> {
  return getQuestionBankService().createQuestionVersion(questionId, versionData);
}

export async function getQuestionVersions(questionId: string): Promise<any[]> {
  return getQuestionBankService().getQuestionVersions(questionId);
}

export async function searchQuestions(query: string, limit: number = 10): Promise<any[]> {
  return getQuestionBankService().searchQuestions(query, limit);
}