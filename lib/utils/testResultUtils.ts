import TestResult from '../models/TestResult';
import { getLogger } from './logger';

export class TestResultService {
  private logger;

  constructor() {
    this.logger = getLogger();
  }

  public async getTestResults(
    filters: {
      testId?: string;
      studentId?: string;
      status?: string;
      grade?: string;
      minScore?: number;
      maxScore?: number;
    } = {},
    limit: number = 100,
    skip: number = 0,
    sort: 'createdAt' | 'score' | 'percentage' = 'createdAt',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<any[]> {
    try {
      const query: any = {};

      if (filters.testId) {
        query.test = filters.testId;
      }

      if (filters.studentId) {
        query.student = filters.studentId;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.grade) {
        query.grade = filters.grade;
      }

      if (filters.minScore) {
        query.percentage = { ...query.percentage, $gte: filters.minScore };
      }

      if (filters.maxScore) {
        query.percentage = { ...query.percentage, $lte: filters.maxScore };
      }

      const sortField = sort === 'createdAt' ? { createdAt: order === 'desc' ? -1 : 1 } :
                       sort === 'score' ? { totalScore: order === 'desc' ? -1 : 1 } :
                       { percentage: order === 'desc' ? -1 : 1 };

      return await TestResult.find(query)
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .populate('test', 'title subject')
        .populate('student', 'name email')
        .populate('reviewedBy', 'name email')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get test results: ${error.message}`, 'TEST_RESULT');
      throw error;
    }
  }

  public async getTestResultCount(
    filters: {
      testId?: string;
      studentId?: string;
      status?: string;
      grade?: string;
      minScore?: number;
      maxScore?: number;
    } = {}
  ): Promise<number> {
    try {
      const query: any = {};

      if (filters.testId) {
        query.test = filters.testId;
      }

      if (filters.studentId) {
        query.student = filters.studentId;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.grade) {
        query.grade = filters.grade;
      }

      if (filters.minScore) {
        query.percentage = { ...query.percentage, $gte: filters.minScore };
      }

      if (filters.maxScore) {
        query.percentage = { ...query.percentage, $lte: filters.maxScore };
      }

      return await TestResult.countDocuments(query);
    } catch (error) {
      this.logger.error(`Failed to get test result count: ${error.message}`, 'TEST_RESULT');
      throw error;
    }
  }

  public async getTestResultById(id: string): Promise<any> {
    try {
      return await TestResult.findById(id)
        .populate('test', 'title subject duration passingScore')
        .populate('student', 'name email')
        .populate('reviewedBy', 'name email')
        .populate('answers')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get test result by ID: ${id} - ${error.message}`, 'TEST_RESULT');
      throw error;
    }
  }

  public async updateTestResult(id: string, updateData: any): Promise<any> {
    try {
      const result = await TestResult.findByIdAndUpdate(id, updateData, { new: true })
        .populate('test', 'title subject')
        .populate('student', 'name email')
        .populate('reviewedBy', 'name email')
        .exec();

      if (!result) {
        throw new Error('Test result not found');
      }

      this.logger.info(`Test result updated: ${id}`, 'TEST_RESULT');

      return result;
    } catch (error) {
      this.logger.error(`Failed to update test result: ${id} - ${error.message}`, 'TEST_RESULT');
      throw error;
    }
  }

  public async publishTestResult(id: string): Promise<any> {
    try {
      return await this.updateTestResult(id, {
        isPublished: true,
        publishedAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to publish test result: ${id} - ${error.message}`, 'TEST_RESULT');
      throw error;
    }
  }

  public async addFeedback(id: string, feedback: string, reviewedBy: string): Promise<any> {
    try {
      return await this.updateTestResult(id, {
        feedback,
        reviewedBy,
        reviewDate: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to add feedback to test result: ${id} - ${error.message}`, 'TEST_RESULT');
      throw error;
    }
  }

  public async getTestResultStatistics(testId: string): Promise<{
    totalResults: number;
    passCount: number;
    failCount: number;
    averageScore: number;
    gradeDistribution: Record<string, number>;
  }> {
    try {
      const results = await TestResult.find({ test: testId }).exec();

      const passCount = results.filter(r => r.status === 'pass').length;
      const failCount = results.filter(r => r.status === 'fail').length;
      const averageScore = results.reduce((sum, r) => sum + r.percentage, 0) / results.length || 0;

      const gradeDistribution: Record<string, number> = {
        'A': 0,
        'B': 0,
        'C': 0,
        'D': 0,
        'F': 0,
      };

      results.forEach(r => {
        if (r.grade in gradeDistribution) {
          gradeDistribution[r.grade]++;
        }
      });

      return {
        totalResults: results.length,
        passCount,
        failCount,
        averageScore,
        gradeDistribution,
      };
    } catch (error) {
      this.logger.error(`Failed to get test result statistics: ${testId} - ${error.message}`, 'TEST_RESULT');
      throw error;
    }
  }

  public async getStudentPerformance(studentId: string): Promise<{
    totalTests: number;
    passedTests: number;
    failedTests: number;
    averageScore: number;
    improvementTrend: number;
  }> {
    try {
      const results = await TestResult.find({ student: studentId })
        .sort({ createdAt: 1 })
        .exec();

      const passedTests = results.filter(r => r.status === 'pass').length;
      const failedTests = results.filter(r => r.status === 'fail').length;
      const averageScore = results.reduce((sum, r) => sum + r.percentage, 0) / results.length || 0;

      // Calculate improvement trend (simple linear regression)
      let improvementTrend = 0;
      if (results.length > 1) {
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumX2 = 0;

        results.forEach((result, index) => {
          sumX += index;
          sumY += result.percentage;
          sumXY += index * result.percentage;
          sumX2 += index * index;
        });

        const slope = (results.length * sumXY - sumX * sumY) / 
                      (results.length * sumX2 - sumX * sumX);
        improvementTrend = slope;
      }

      return {
        totalTests: results.length,
        passedTests,
        failedTests,
        averageScore,
        improvementTrend,
      };
    } catch (error) {
      this.logger.error(`Failed to get student performance: ${studentId} - ${error.message}`, 'TEST_RESULT');
      throw error;
    }
  }

  public async getClassPerformance(classId: string): Promise<{
    totalResults: number;
    passRate: number;
    averageScore: number;
    studentCount: number;
  }> {
    try {
      // In a real implementation, this would query students in the class
      // and then their test results
      // For now, we'll return mock data
      return {
        totalResults: Math.floor(Math.random() * 200) + 50,
        passRate: 75 + Math.random() * 20, // 75-95%
        averageScore: 70 + Math.random() * 20, // 70-90
        studentCount: Math.floor(Math.random() * 50) + 20, // 20-70
      };
    } catch (error) {
      this.logger.error(`Failed to get class performance: ${classId} - ${error.message}`, 'TEST_RESULT');
      throw error;
    }
  }

  public async exportTestResults(
    filters: {
      testId?: string;
      studentId?: string;
      status?: string;
      grade?: string;
      minScore?: number;
      maxScore?: number;
    } = {}
  ): Promise<string> {
    try {
      const results = await this.getTestResults(filters, 10000); // Limit to 10k results for export

      // Convert to CSV format
      const header = 'Test,Student,Score,Percentage,Grade,Status,Date,Feedback\n';

      const rows = results.map(result => {
        return `"${result.test?.title || 'N/A'}","${result.student?.name || 'N/A'}",${result.totalScore},${result.percentage},"${result.grade}","${result.status}","${result.createdAt}","${result.feedback || ''}"`;
      }).join('\n');

      return header + rows;
    } catch (error) {
      this.logger.error(`Failed to export test results: ${error.message}`, 'TEST_RESULT');
      throw error;
    }
  }

  public async getRecentTestResults(
    limit: number = 10,
    studentId?: string,
    testId?: string
  ): Promise<any[]> {
    try {
      const query: any = {};

      if (studentId) {
        query.student = studentId;
      }

      if (testId) {
        query.test = testId;
      }

      return await TestResult.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('test', 'title subject')
        .populate('student', 'name email')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get recent test results: ${error.message}`, 'TEST_RESULT');
      throw error;
    }
  }

  public async getTestResultBySession(sessionId: string): Promise<any> {
    try {
      return await TestResult.findOne({ testSession: sessionId })
        .populate('test', 'title subject')
        .populate('student', 'name email')
        .populate('answers')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get test result by session: ${sessionId} - ${error.message}`, 'TEST_RESULT');
      throw error;
    }
  }

  public async getTestResultComparison(
    testId: string,
    studentId: string
  ): Promise<{
    studentScore: number;
    classAverage: number;
    classHigh: number;
    classLow: number;
    percentile: number;
  }> {
    try {
      // Get student's result
      const studentResult = await TestResult.findOne({
        test: testId,
        student: studentId,
      }).exec();

      if (!studentResult) {
        throw new Error('Student result not found');
      }

      // Get all results for the test
      const allResults = await TestResult.find({ test: testId }).exec();

      const scores = allResults.map(r => r.percentage);
      const classAverage = scores.reduce((sum, s) => sum + s, 0) / scores.length || 0;
      const classHigh = Math.max(...scores);
      const classLow = Math.min(...scores);

      // Calculate percentile
      const studentScore = studentResult.percentage;
      const aboveStudent = scores.filter(s => s > studentScore).length;
      const percentile = 100 - (aboveStudent / scores.length * 100);

      return {
        studentScore: studentResult.percentage,
        classAverage,
        classHigh,
        classLow,
        percentile,
      };
    } catch (error) {
      this.logger.error(`Failed to get test result comparison: ${testId}, ${studentId} - ${error.message}`, 'TEST_RESULT');
      throw error;
    }
  }

  public async getTestResultTrends(
    studentId: string,
    limit: number = 10
  ): Promise<Array<{
    testId: string;
    testName: string;
    score: number;
    date: Date;
  }>> {
    try {
      const results = await TestResult.find({ student: studentId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('test', 'title')
        .exec();

      return results.map(result => ({
        testId: result.test._id,
        testName: result.test.title,
        score: result.percentage,
        date: result.createdAt,
      }));
    } catch (error) {
      this.logger.error(`Failed to get test result trends: ${studentId} - ${error.message}`, 'TEST_RESULT');
      throw error;
    }
  }
}

// Singleton instance
let testResultService: TestResultService | null = null;

export function getTestResultService(): TestResultService {
  if (!testResultService) {
    testResultService = new TestResultService();
  }
  return testResultService;
}

export async function getTestResults(
  filters: {
    testId?: string;
    studentId?: string;
    status?: string;
    grade?: string;
    minScore?: number;
    maxScore?: number;
  } = {},
  limit: number = 100,
  skip: number = 0,
  sort: 'createdAt' | 'score' | 'percentage' = 'createdAt',
  order: 'asc' | 'desc' = 'desc'
): Promise<any[]> {
  return getTestResultService().getTestResults(filters, limit, skip, sort, order);
}

export async function getTestResultCount(
  filters: {
    testId?: string;
    studentId?: string;
    status?: string;
    grade?: string;
    minScore?: number;
    maxScore?: number;
  } = {}
): Promise<number> {
  return getTestResultService().getTestResultCount(filters);
}

export async function getTestResultById(id: string): Promise<any> {
  return getTestResultService().getTestResultById(id);
}

export async function updateTestResult(id: string, updateData: any): Promise<any> {
  return getTestResultService().updateTestResult(id, updateData);
}

export async function publishTestResult(id: string): Promise<any> {
  return getTestResultService().publishTestResult(id);
}

export async function addFeedback(id: string, feedback: string, reviewedBy: string): Promise<any> {
  return getTestResultService().addFeedback(id, feedback, reviewedBy);
}

export async function getTestResultStatistics(testId: string): Promise<{
  totalResults: number;
  passCount: number;
  failCount: number;
  averageScore: number;
  gradeDistribution: Record<string, number>;
}> {
  return getTestResultService().getTestResultStatistics(testId);
}

export async function getStudentPerformance(studentId: string): Promise<{
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageScore: number;
  improvementTrend: number;
}> {
  return getTestResultService().getStudentPerformance(studentId);
}

export async function getClassPerformance(classId: string): Promise<{
  totalResults: number;
  passRate: number;
  averageScore: number;
  studentCount: number;
}> {
  return getTestResultService().getClassPerformance(classId);
}

export async function exportTestResults(
  filters: {
    testId?: string;
    studentId?: string;
    status?: string;
    grade?: string;
    minScore?: number;
    maxScore?: number;
  } = {}
): Promise<string> {
  return getTestResultService().exportTestResults(filters);
}

export async function getRecentTestResults(
  limit: number = 10,
  studentId?: string,
  testId?: string
): Promise<any[]> {
  return getTestResultService().getRecentTestResults(limit, studentId, testId);
}

export async function getTestResultBySession(sessionId: string): Promise<any> {
  return getTestResultService().getTestResultBySession(sessionId);
}

export async function getTestResultComparison(
  testId: string,
  studentId: string
): Promise<{
  studentScore: number;
  classAverage: number;
  classHigh: number;
  classLow: number;
  percentile: number;
}> {
  return getTestResultService().getTestResultComparison(testId, studentId);
}

export async function getTestResultTrends(
  studentId: string,
  limit: number = 10
): Promise<Array<{
  testId: string;
  testName: string;
  score: number;
  date: Date;
}>> {
  return getTestResultService().getTestResultTrends(studentId, limit);
}