import TestSession from '../models/TestSession';
import StudentAnswer from '../models/StudentAnswer';
import TestResult from '../models/TestResult';
import { getLogger } from './logger';

export class TestSessionService {
  private logger;

  constructor() {
    this.logger = getLogger();
  }

  public async createTestSession(sessionData: any): Promise<any> {
    try {
      const session = new TestSession(sessionData);
      await session.save();

      this.logger.info(`Test session created: ${session._id}`, 'TEST_SESSION');

      return session;
    } catch (error) {
      this.logger.error(`Failed to create test session: ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }

  public async getTestSession(id: string): Promise<any> {
    try {
      return await TestSession.findById(id)
        .populate('test', 'title subject duration')
        .populate('student', 'name email')
        .populate('answers')
        .populate('securityEvents')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get test session: ${id} - ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }

  public async getActiveTestSessions(): Promise<any[]> {
    try {
      return await TestSession.find({ 
        status: { $in: ['in-progress', 'active'] },
        endTime: { $exists: false },
      })
        .populate('test', 'title subject')
        .populate('student', 'name email')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get active test sessions: ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }

  public async getTestSessionsByTest(testId: string): Promise<any[]> {
    try {
      return await TestSession.find({ test: testId })
        .populate('student', 'name email')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get test sessions by test: ${testId} - ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }

  public async getTestSessionsByStudent(studentId: string): Promise<any[]> {
    try {
      return await TestSession.find({ student: studentId })
        .populate('test', 'title subject')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get test sessions by student: ${studentId} - ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }

  public async updateTestSession(id: string, updateData: any): Promise<any> {
    try {
      const session = await TestSession.findByIdAndUpdate(id, updateData, { new: true })
        .populate('test', 'title subject duration')
        .populate('student', 'name email')
        .exec();

      if (!session) {
        throw new Error('Test session not found');
      }

      this.logger.info(`Test session updated: ${id}`, 'TEST_SESSION');

      return session;
    } catch (error) {
      this.logger.error(`Failed to update test session: ${id} - ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }

  public async endTestSession(id: string): Promise<any> {
    try {
      return await this.updateTestSession(id, {
        status: 'completed',
        endTime: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to end test session: ${id} - ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }

  public async submitTestSession(id: string): Promise<any> {
    try {
      return await this.updateTestSession(id, {
        status: 'submitted',
        endTime: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to submit test session: ${id} - ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }

  public async extendTestSession(id: string, minutes: number): Promise<any> {
    try {
      const session = await TestSession.findById(id).exec();

      if (!session) {
        throw new Error('Test session not found');
      }

      // Calculate new end time
      const newEndTime = new Date();
      newEndTime.setMinutes(newEndTime.getMinutes() + minutes);

      return await this.updateTestSession(id, {
        endTime: newEndTime,
      });
    } catch (error) {
      this.logger.error(`Failed to extend test session: ${id} - ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }

  public async addSecurityEvent(sessionId: string, eventData: any): Promise<any> {
    try {
      const session = await TestSession.findById(sessionId).exec();

      if (!session) {
        throw new Error('Test session not found');
      }

      // In a real implementation, this would create a SecurityEvent document
      // For now, we'll just log it
      this.logger.warn(`Security event in test session ${sessionId}: ${eventData.type}`, 'SECURITY');

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to add security event: ${sessionId} - ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }

  public async saveAnswer(sessionId: string, answerData: any): Promise<any> {
    try {
      const session = await TestSession.findById(sessionId).exec();

      if (!session) {
        throw new Error('Test session not found');
      }

      const answer = new StudentAnswer({
        ...answerData,
        testSession: sessionId,
      });

      await answer.save();

      // Add answer to session
      session.answers.push(answer._id);
      await session.save();

      this.logger.info(`Answer saved for session ${sessionId}`, 'TEST_SESSION');

      return answer;
    } catch (error) {
      this.logger.error(`Failed to save answer: ${sessionId} - ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }

  public async updateAnswer(answerId: string, updateData: any): Promise<any> {
    try {
      const answer = await StudentAnswer.findByIdAndUpdate(answerId, updateData, { new: true })
        .exec();

      if (!answer) {
        throw new Error('Answer not found');
      }

      this.logger.info(`Answer updated: ${answerId}`, 'TEST_SESSION');

      return answer;
    } catch (error) {
      this.logger.error(`Failed to update answer: ${answerId} - ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }

  public async getAnswersBySession(sessionId: string): Promise<any[]> {
    try {
      return await StudentAnswer.find({ testSession: sessionId })
        .populate('question')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get answers by session: ${sessionId} - ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }

  public async calculateTestResult(sessionId: string): Promise<any> {
    try {
      const session = await TestSession.findById(sessionId)
        .populate('test')
        .populate('student')
        .populate({
          path: 'answers',
          populate: { path: 'question' },
        })
        .exec();

      if (!session) {
        throw new Error('Test session not found');
      }

      if (!session.test) {
        throw new Error('Test not found');
      }

      // Calculate score
      let totalScore = 0;
      let totalPossible = 0;

      for (const answer of session.answers) {
        const question = session.test.questions.find((q: any) => 
          q._id.toString() === answer.question._id.toString()
        );

        if (question) {
          totalPossible += question.points;
          
          // Simple scoring - in real implementation, this would be more sophisticated
          if (answer.isCorrect) {
            totalScore += question.points;
          } else if (answer.score) {
            totalScore += answer.score;
          }
        }
      }

      const percentage = Math.round((totalScore / totalPossible) * 100);
      const status = percentage >= (session.test.passingScore || 70) ? 'pass' : 'fail';
      const grade = this.calculateGrade(percentage);

      // Create test result
      const testResult = new TestResult({
        testSession: sessionId,
        test: session.test._id,
        student: session.student._id,
        totalScore,
        percentage,
        grade,
        status,
        answers: session.answers.map((a: any) => a._id),
      });

      await testResult.save();

      // Update session with result
      session.result = testResult._id;
      await session.save();

      this.logger.info(`Test result calculated for session ${sessionId}: ${percentage}% (${status})`, 'TEST_SESSION');

      return testResult;
    } catch (error) {
      this.logger.error(`Failed to calculate test result: ${sessionId} - ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }

  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  public async getTestSessionStatistics(): Promise<{
    activeSessions: number;
    completedSessions: number;
    averageDuration: number;
  }> {
    try {
      const activeSessions = await TestSession.countDocuments({ 
        status: { $in: ['in-progress', 'active'] },
      });

      const completedSessions = await TestSession.countDocuments({ 
        status: 'completed',
      });

      // In a real implementation, this would calculate average duration
      // For now, we'll return mock data
      return {
        activeSessions,
        completedSessions,
        averageDuration: 45 + Math.random() * 30, // 45-75 minutes
      };
    } catch (error) {
      this.logger.error(`Failed to get test session statistics: ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }

  public async getTestSessionByStudentAndTest(studentId: string, testId: string): Promise<any> {
    try {
      return await TestSession.findOne({ 
        student: studentId,
        test: testId,
      })
        .populate('test', 'title subject')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get test session by student and test: ${studentId}, ${testId} - ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }

  public async canStudentTakeTest(studentId: string, testId: string): Promise<boolean> {
    try {
      const session = await this.getTestSessionByStudentAndTest(studentId, testId);

      if (!session) {
        return true; // No session exists, student can take the test
      }

      // Check if the session is completed
      if (session.status === 'completed' || session.status === 'submitted') {
        // Check if the test allows multiple attempts
        // In a real implementation, this would check the test settings
        return true; // Assume multiple attempts are allowed
      }

      // Session is still active
      return false;
    } catch (error) {
      this.logger.error(`Failed to check if student can take test: ${studentId}, ${testId} - ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }

  public async getTestSessionProgress(sessionId: string): Promise<{
    totalQuestions: number;
    answeredQuestions: number;
    percentage: number;
  }> {
    try {
      const session = await TestSession.findById(sessionId)
        .populate('test')
        .exec();

      if (!session || !session.test) {
        throw new Error('Session or test not found');
      }

      const totalQuestions = session.test.questions.length;
      const answeredQuestions = session.answers.length;
      const percentage = totalQuestions > 0 
        ? Math.round((answeredQuestions / totalQuestions) * 100)
        : 0;

      return {
        totalQuestions,
        answeredQuestions,
        percentage,
      };
    } catch (error) {
      this.logger.error(`Failed to get test session progress: ${sessionId} - ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }

  public async getTimeRemaining(sessionId: string): Promise<{
    minutes: number;
    seconds: number;
    expired: boolean;
  }> {
    try {
      const session = await TestSession.findById(sessionId)
        .populate('test')
        .exec();

      if (!session || !session.test) {
        throw new Error('Session or test not found');
      }

      const now = new Date();
      const startTime = session.startTime;
      const durationMinutes = session.test.duration || 60;
      const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

      if (now >= endTime) {
        return {
          minutes: 0,
          seconds: 0,
          expired: true,
        };
      }

      const diffMs = endTime.getTime() - now.getTime();
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);

      return {
        minutes,
        seconds,
        expired: false,
      };
    } catch (error) {
      this.logger.error(`Failed to get time remaining: ${sessionId} - ${error.message}`, 'TEST_SESSION');
      throw error;
    }
  }
}

// Singleton instance
let testSessionService: TestSessionService | null = null;

export function getTestSessionService(): TestSessionService {
  if (!testSessionService) {
    testSessionService = new TestSessionService();
  }
  return testSessionService;
}

export async function createTestSession(sessionData: any): Promise<any> {
  return getTestSessionService().createTestSession(sessionData);
}

export async function getTestSession(id: string): Promise<any> {
  return getTestSessionService().getTestSession(id);
}

export async function getActiveTestSessions(): Promise<any[]> {
  return getTestSessionService().getActiveTestSessions();
}

export async function getTestSessionsByTest(testId: string): Promise<any[]> {
  return getTestSessionService().getTestSessionsByTest(testId);
}

export async function getTestSessionsByStudent(studentId: string): Promise<any[]> {
  return getTestSessionService().getTestSessionsByStudent(studentId);
}

export async function updateTestSession(id: string, updateData: any): Promise<any> {
  return getTestSessionService().updateTestSession(id, updateData);
}

export async function endTestSession(id: string): Promise<any> {
  return getTestSessionService().endTestSession(id);
}

export async function submitTestSession(id: string): Promise<any> {
  return getTestSessionService().submitTestSession(id);
}

export async function extendTestSession(id: string, minutes: number): Promise<any> {
  return getTestSessionService().extendTestSession(id, minutes);
}

export async function addSecurityEvent(sessionId: string, eventData: any): Promise<any> {
  return getTestSessionService().addSecurityEvent(sessionId, eventData);
}

export async function saveAnswer(sessionId: string, answerData: any): Promise<any> {
  return getTestSessionService().saveAnswer(sessionId, answerData);
}

export async function updateAnswer(answerId: string, updateData: any): Promise<any> {
  return getTestSessionService().updateAnswer(answerId, updateData);
}

export async function getAnswersBySession(sessionId: string): Promise<any[]> {
  return getTestSessionService().getAnswersBySession(sessionId);
}

export async function calculateTestResult(sessionId: string): Promise<any> {
  return getTestSessionService().calculateTestResult(sessionId);
}

export async function getTestSessionStatistics(): Promise<{
  activeSessions: number;
  completedSessions: number;
  averageDuration: number;
}> {
  return getTestSessionService().getTestSessionStatistics();
}

export async function getTestSessionByStudentAndTest(studentId: string, testId: string): Promise<any> {
  return getTestSessionService().getTestSessionByStudentAndTest(studentId, testId);
}

export async function canStudentTakeTest(studentId: string, testId: string): Promise<boolean> {
  return getTestSessionService().canStudentTakeTest(studentId, testId);
}

export async function getTestSessionProgress(sessionId: string): Promise<{
  totalQuestions: number;
  answeredQuestions: number;
  percentage: number;
}> {
  return getTestSessionService().getTestSessionProgress(sessionId);
}

export async function getTimeRemaining(sessionId: string): Promise<{
  minutes: number;
  seconds: number;
  expired: boolean;
}> {
  return getTestSessionService().getTimeRemaining(sessionId);
}