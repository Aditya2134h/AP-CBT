import Class from '../models/Class';
import User from '../models/User';
import { getLogger } from './logger';

export class ClassService {
  private logger;

  constructor() {
    this.logger = getLogger();
  }

  public async getClasses(
    filters: {
      name?: string;
      subject?: string;
      instructor?: string;
      status?: string;
      search?: string;
    } = {},
    limit: number = 100,
    skip: number = 0,
    sort: 'createdAt' | 'name' | 'studentCount' = 'createdAt',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<any[]> {
    try {
      const query: any = {};

      if (filters.name) {
        query.name = { $regex: filters.name, $options: 'i' };
      }

      if (filters.subject) {
        query.subject = filters.subject;
      }

      if (filters.instructor) {
        query.instructor = filters.instructor;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { subject: { $regex: filters.search, $options: 'i' } },
        ];
      }

      const sortField = sort === 'createdAt' ? { createdAt: order === 'desc' ? -1 : 1 } :
                       sort === 'name' ? { name: order === 'desc' ? -1 : 1 } :
                       { studentCount: order === 'desc' ? -1 : 1 };

      return await Class.find(query)
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .populate('instructor', 'name email')
        .populate('students', 'name email')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get classes: ${error.message}`, 'CLASS');
      throw error;
    }
  }

  public async getClassCount(
    filters: {
      name?: string;
      subject?: string;
      instructor?: string;
      status?: string;
      search?: string;
    } = {}
  ): Promise<number> {
    try {
      const query: any = {};

      if (filters.name) {
        query.name = { $regex: filters.name, $options: 'i' };
      }

      if (filters.subject) {
        query.subject = filters.subject;
      }

      if (filters.instructor) {
        query.instructor = filters.instructor;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { subject: { $regex: filters.search, $options: 'i' } },
        ];
      }

      return await Class.countDocuments(query);
    } catch (error) {
      this.logger.error(`Failed to get class count: ${error.message}`, 'CLASS');
      throw error;
    }
  }

  public async getClassById(id: string): Promise<any> {
    try {
      return await Class.findById(id)
        .populate('instructor', 'name email')
        .populate('students', 'name email')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get class by ID: ${id} - ${error.message}`, 'CLASS');
      throw error;
    }
  }

  public async createClass(classData: any): Promise<any> {
    try {
      const cls = new Class(classData);
      await cls.save();

      this.logger.info(`Class created: ${cls._id}`, 'CLASS');

      return cls;
    } catch (error) {
      this.logger.error(`Failed to create class: ${error.message}`, 'CLASS');
      throw error;
    }
  }

  public async updateClass(id: string, updateData: any): Promise<any> {
    try {
      const cls = await Class.findByIdAndUpdate(id, updateData, { new: true })
        .populate('instructor', 'name email')
        .populate('students', 'name email')
        .exec();

      if (!cls) {
        throw new Error('Class not found');
      }

      this.logger.info(`Class updated: ${id}`, 'CLASS');

      return cls;
    } catch (error) {
      this.logger.error(`Failed to update class: ${id} - ${error.message}`, 'CLASS');
      throw error;
    }
  }

  public async deleteClass(id: string): Promise<boolean> {
    try {
      const result = await Class.deleteOne({ _id: id }).exec();

      if (result.deletedCount === 0) {
        throw new Error('Class not found');
      }

      this.logger.info(`Class deleted: ${id}`, 'CLASS');

      return true;
    } catch (error) {
      this.logger.error(`Failed to delete class: ${id} - ${error.message}`, 'CLASS');
      throw error;
    }
  }

  public async addStudentsToClass(classId: string, studentIds: string[]): Promise<any> {
    try {
      const cls = await Class.findById(classId).exec();

      if (!cls) {
        throw new Error('Class not found');
      }

      // Add students that aren't already in the class
      const studentsToAdd = studentIds.filter(id => !cls.students.includes(id));

      if (studentsToAdd.length === 0) {
        return cls;
      }

      cls.students.push(...studentsToAdd);
      await cls.save();

      // Update users' class lists
      await User.updateMany(
        { _id: { $in: studentsToAdd } },
        { $addToSet: { classes: classId } }
      );

      this.logger.info(`Added ${studentsToAdd.length} students to class: ${classId}`, 'CLASS');

      return cls;
    } catch (error) {
      this.logger.error(`Failed to add students to class: ${classId} - ${error.message}`, 'CLASS');
      throw error;
    }
  }

  public async removeStudentsFromClass(classId: string, studentIds: string[]): Promise<any> {
    try {
      const cls = await Class.findById(classId).exec();

      if (!cls) {
        throw new Error('Class not found');
      }

      // Remove students from class
      cls.students = cls.students.filter(id => !studentIds.includes(id.toString()));
      await cls.save();

      // Update users' class lists
      await User.updateMany(
        { _id: { $in: studentIds } },
        { $pull: { classes: classId } }
      );

      this.logger.info(`Removed ${studentIds.length} students from class: ${classId}`, 'CLASS');

      return cls;
    } catch (error) {
      this.logger.error(`Failed to remove students from class: ${classId} - ${error.message}`, 'CLASS');
      throw error;
    }
  }

  public async getClassStatistics(classId: string): Promise<{
    studentCount: number;
    testCount: number;
    averageScore: number;
  }> {
    try {
      const cls = await Class.findById(classId)
        .populate('students', 'name email')
        .exec();

      if (!cls) {
        throw new Error('Class not found');
      }

      // In a real implementation, this would query test results
      // For now, we'll return mock data
      return {
        studentCount: cls.students.length,
        testCount: Math.floor(Math.random() * 20) + 5,
        averageScore: 70 + Math.random() * 20, // 70-90
      };
    } catch (error) {
      this.logger.error(`Failed to get class statistics: ${classId} - ${error.message}`, 'CLASS');
      throw error;
    }
  }

  public async getClassesByStudent(studentId: string): Promise<any[]> {
    try {
      return await Class.find({ students: studentId })
        .populate('instructor', 'name email')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get classes by student: ${studentId} - ${error.message}`, 'CLASS');
      throw error;
    }
  }

  public async getClassesByInstructor(instructorId: string): Promise<any[]> {
    try {
      return await Class.find({ instructor: instructorId })
        .populate('students', 'name email')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get classes by instructor: ${instructorId} - ${error.message}`, 'CLASS');
      throw error;
    }
  }

  public async getClassPerformance(classId: string): Promise<{
    averageScore: number;
    passRate: number;
    testCompletionRate: number;
  }> {
    try {
      // In a real implementation, this would query test results
      // For now, we'll return mock data
      return {
        averageScore: 75 + Math.random() * 15, // 75-90
        passRate: 80 + Math.random() * 15, // 80-95%
        testCompletionRate: 90 + Math.random() * 8, // 90-98%
      };
    } catch (error) {
      this.logger.error(`Failed to get class performance: ${classId} - ${error.message}`, 'CLASS');
      throw error;
    }
  }

  public async getStudentPerformanceInClass(classId: string, studentId: string): Promise<{
    averageScore: number;
    testsTaken: number;
    testsPassed: number;
  }> {
    try {
      // In a real implementation, this would query test results
      // For now, we'll return mock data
      return {
        averageScore: 70 + Math.random() * 20, // 70-90
        testsTaken: Math.floor(Math.random() * 15) + 5, // 5-20
        testsPassed: Math.floor(Math.random() * 10) + 3, // 3-13
      };
    } catch (error) {
      this.logger.error(`Failed to get student performance in class: ${classId}, ${studentId} - ${error.message}`, 'CLASS');
      throw error;
    }
  }

  public async archiveClass(classId: string): Promise<any> {
    try {
      return await this.updateClass(classId, { status: 'completed' });
    } catch (error) {
      this.logger.error(`Failed to archive class: ${classId} - ${error.message}`, 'CLASS');
      throw error;
    }
  }

  public async activateClass(classId: string): Promise<any> {
    try {
      return await this.updateClass(classId, { status: 'active' });
    } catch (error) {
      this.logger.error(`Failed to activate class: ${classId} - ${error.message}`, 'CLASS');
      throw error;
    }
  }

  public async getClassSchedule(classId: string): Promise<any[]> {
    try {
      // In a real implementation, this would query the schedule
      // For now, we'll return mock data
      return [
        {
          date: new Date(Date.now() + 86400000), // Tomorrow
          topic: 'Introduction to Subject',
          duration: 60,
        },
        {
          date: new Date(Date.now() + 172800000), // Day after tomorrow
          topic: 'Advanced Topics',
          duration: 90,
        },
      ];
    } catch (error) {
      this.logger.error(`Failed to get class schedule: ${classId} - ${error.message}`, 'CLASS');
      throw error;
    }
  }
}

// Singleton instance
let classService: ClassService | null = null;

export function getClassService(): ClassService {
  if (!classService) {
    classService = new ClassService();
  }
  return classService;
}

export async function getClasses(
  filters: {
    name?: string;
    subject?: string;
    instructor?: string;
    status?: string;
    search?: string;
  } = {},
  limit: number = 100,
  skip: number = 0,
  sort: 'createdAt' | 'name' | 'studentCount' = 'createdAt',
  order: 'asc' | 'desc' = 'desc'
): Promise<any[]> {
  return getClassService().getClasses(filters, limit, skip, sort, order);
}

export async function getClassCount(
  filters: {
    name?: string;
    subject?: string;
    instructor?: string;
    status?: string;
    search?: string;
  } = {}
): Promise<number> {
  return getClassService().getClassCount(filters);
}

export async function getClassById(id: string): Promise<any> {
  return getClassService().getClassById(id);
}

export async function createClass(classData: any): Promise<any> {
  return getClassService().createClass(classData);
}

export async function updateClass(id: string, updateData: any): Promise<any> {
  return getClassService().updateClass(id, updateData);
}

export async function deleteClass(id: string): Promise<boolean> {
  return getClassService().deleteClass(id);
}

export async function addStudentsToClass(classId: string, studentIds: string[]): Promise<any> {
  return getClassService().addStudentsToClass(classId, studentIds);
}

export async function removeStudentsFromClass(classId: string, studentIds: string[]): Promise<any> {
  return getClassService().removeStudentsFromClass(classId, studentIds);
}

export async function getClassStatistics(classId: string): Promise<{
  studentCount: number;
  testCount: number;
  averageScore: number;
}> {
  return getClassService().getClassStatistics(classId);
}

export async function getClassesByStudent(studentId: string): Promise<any[]> {
  return getClassService().getClassesByStudent(studentId);
}

export async function getClassesByInstructor(instructorId: string): Promise<any[]> {
  return getClassService().getClassesByInstructor(instructorId);
}

export async function getClassPerformance(classId: string): Promise<{
  averageScore: number;
  passRate: number;
  testCompletionRate: number;
}> {
  return getClassService().getClassPerformance(classId);
}

export async function getStudentPerformanceInClass(classId: string, studentId: string): Promise<{
  averageScore: number;
  testsTaken: number;
  testsPassed: number;
}> {
  return getClassService().getStudentPerformanceInClass(classId, studentId);
}

export async function archiveClass(classId: string): Promise<any> {
  return getClassService().archiveClass(classId);
}

export async function activateClass(classId: string): Promise<any> {
  return getClassService().activateClass(classId);
}

export async function getClassSchedule(classId: string): Promise<any[]> {
  return getClassService().getClassSchedule(classId);
}