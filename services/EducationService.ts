import AsyncStorage from '@react-native-async-storage/async-storage';

interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  modules: Module[];
  prerequisites: string[]; // course IDs
  tags: string[];
  instructor: Instructor;
  rating: number;
  enrollments: number;
  thumbnail: string;
  price: number; // 0 for free
  language: 'en' | 'ne';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  certificate: boolean;
}

interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  quiz?: Quiz;
  duration: number;
  isLocked: boolean;
  completionRequired: boolean;
}

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: LessonContent;
  type: 'video' | 'article' | 'interactive' | 'simulation' | 'case_study';
  duration: number;
  order: number;
  resources: Resource[];
  notes: string;
  isCompleted: boolean;
  lastAccessed?: Date;
}

interface LessonContent {
  text?: string;
  videoUrl?: string;
  images?: string[];
  interactive?: InteractiveContent;
  simulation?: SimulationContent;
  caseStudy?: CaseStudyContent;
}

interface InteractiveContent {
  type: 'chart_analysis' | 'portfolio_builder' | 'trading_simulator' | 'calculator';
  data: any;
  instructions: string;
  expectedOutcome: string;
}

interface SimulationContent {
  scenario: string;
  initialConditions: any;
  decisions: Decision[];
  outcomes: Outcome[];
}

interface CaseStudyContent {
  company: string;
  situation: string;
  data: any;
  questions: string[];
  analysis: string;
  lessons: string[];
}

interface Decision {
  id: string;
  description: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

interface Outcome {
  decisionId: string;
  result: string;
  impact: number;
  explanation: string;
}

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video' | 'calculator' | 'template';
  url: string;
  description: string;
  downloadable: boolean;
}

interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  attempts: number; // max attempts allowed
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'matching' | 'numerical';
  question: string;
  options?: string[];
  correctAnswer: string | number | string[];
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  image?: string;
}

interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: { [questionId: string]: any };
  score: number;
  percentage: number;
  timeSpent: number;
  startedAt: Date;
  completedAt: Date;
  passed: boolean;
}

interface UserProgress {
  userId: string;
  courseId: string;
  enrolledAt: Date;
  lastAccessedAt: Date;
  completedModules: string[];
  completedLessons: string[];
  quizAttempts: QuizAttempt[];
  overallProgress: number; // percentage
  timeSpent: number; // in minutes
  certificateEarned: boolean;
  certificateDate?: Date;
  notes: string;
  bookmarks: string[]; // lesson IDs
}

interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  experience: number; // years
  specializations: string[];
  rating: number;
  coursesCount: number;
  studentsCount: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'completion' | 'streak' | 'score' | 'time' | 'special';
  criteria: {
    type: string;
    value: number;
    comparison: 'gte' | 'lte' | 'eq';
  };
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  courses: string[]; // course IDs in order
  estimatedDuration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: CourseCategory;
  prerequisites: string[];
  outcomes: string[];
  thumbnail: string;
}

type CourseCategory = 
  | 'basics'
  | 'technical_analysis'
  | 'fundamental_analysis'
  | 'portfolio_management'
  | 'risk_management'
  | 'trading_strategies'
  | 'market_psychology'
  | 'derivatives'
  | 'mutual_funds'
  | 'ipo_investing'
  | 'sector_analysis'
  | 'financial_planning'
  | 'taxation'
  | 'regulations'
  | 'case_studies';

interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  goal: string;
  targetDate: Date;
  courses: string[];
  dailyTimeGoal: number; // minutes
  weeklyGoal: number; // lessons or modules
  currentStreak: number;
  longestStreak: number;
  createdAt: Date;
  isActive: boolean;
}

interface LearningAnalytics {
  totalTimeSpent: number;
  coursesCompleted: number;
  coursesInProgress: number;
  averageQuizScore: number;
  strongAreas: string[];
  weakAreas: string[];
  learningStreak: number;
  weeklyProgress: { week: string; time: number; lessons: number }[];
  categoryProgress: { [category: string]: number };
  achievements: Achievement[];
  recommendations: Course[];
}

class EducationService {
  private static instance: EducationService;
  private courses: Map<string, Course> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private learningPaths: Map<string, LearningPath> = new Map();
  private studyPlans: Map<string, StudyPlan> = new Map();
  private subscribers: Map<string, (data: any) => void> = new Map();
  private currentUserId: string | null = null;

  private constructor() {
    this.initializeDefaultContent();
    this.loadStoredData();
  }

  public static getInstance(): EducationService {
    if (!EducationService.instance) {
      EducationService.instance = new EducationService();
    }
    return EducationService.instance;
  }

  // User Management
  public setCurrentUser(userId: string): void {
    this.currentUserId = userId;
  }

  // Subscription Management
  public subscribe(event: string, callback: (data: any) => void): string {
    const id = `${event}_${Date.now()}_${Math.random()}`;
    this.subscribers.set(id, callback);
    return id;
  }

  public unsubscribe(id: string): void {
    this.subscribers.delete(id);
  }

  // Course Management
  public getCourses(filters?: {
    category?: CourseCategory;
    level?: string;
    language?: string;
    free?: boolean;
  }): Course[] {
    let courses = Array.from(this.courses.values()).filter(course => course.isActive);
    
    if (filters) {
      if (filters.category) {
        courses = courses.filter(course => course.category === filters.category);
      }
      if (filters.level) {
        courses = courses.filter(course => course.level === filters.level);
      }
      if (filters.language) {
        courses = courses.filter(course => course.language === filters.language);
      }
      if (filters.free !== undefined) {
        courses = courses.filter(course => filters.free ? course.price === 0 : course.price > 0);
      }
    }
    
    return courses.sort((a, b) => b.rating - a.rating);
  }

  public getCourse(courseId: string): Course | undefined {
    return this.courses.get(courseId);
  }

  public searchCourses(query: string): Course[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.courses.values())
      .filter(course => 
        course.isActive &&
        (course.title.toLowerCase().includes(searchTerm) ||
         course.description.toLowerCase().includes(searchTerm) ||
         course.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      )
      .sort((a, b) => b.rating - a.rating);
  }

  public getFeaturedCourses(): Course[] {
    return Array.from(this.courses.values())
      .filter(course => course.isActive && course.rating >= 4.5)
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 6);
  }

  public getRecommendedCourses(userId: string): Course[] {
    const userProgress = this.getUserProgress(userId);
    const completedCourses = userProgress.map(p => p.courseId);
    const userCategories = new Set<CourseCategory>();
    
    // Analyze user's learning patterns
    userProgress.forEach(progress => {
      const course = this.courses.get(progress.courseId);
      if (course) {
        userCategories.add(course.category);
      }
    });
    
    // Find courses in similar categories that user hasn't taken
    const recommendations = Array.from(this.courses.values())
      .filter(course => 
        course.isActive &&
        !completedCourses.includes(course.id) &&
        (userCategories.has(course.category) || course.rating >= 4.0)
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
    
    return recommendations;
  }

  // Enrollment and Progress
  public async enrollInCourse(courseId: string, userId: string): Promise<boolean> {
    const course = this.courses.get(courseId);
    if (!course) return false;
    
    // Check if already enrolled
    const existingProgress = this.userProgress.get(`${userId}_${courseId}`);
    if (existingProgress) return true;
    
    // Check prerequisites
    const hasPrerequisites = await this.checkPrerequisites(course.prerequisites, userId);
    if (!hasPrerequisites) return false;
    
    const progress: UserProgress = {
      userId,
      courseId,
      enrolledAt: new Date(),
      lastAccessedAt: new Date(),
      completedModules: [],
      completedLessons: [],
      quizAttempts: [],
      overallProgress: 0,
      timeSpent: 0,
      certificateEarned: false,
      notes: '',
      bookmarks: []
    };
    
    this.userProgress.set(`${userId}_${courseId}`, progress);
    course.enrollments++;
    
    await this.saveProgressToStorage();
    await this.saveCoursesToStorage();
    
    this.notifySubscribers('course_enrolled', { courseId, userId });
    return true;
  }

  private async checkPrerequisites(prerequisites: string[], userId: string): Promise<boolean> {
    if (prerequisites.length === 0) return true;
    
    for (const prereqId of prerequisites) {
      const progress = this.userProgress.get(`${userId}_${prereqId}`);
      if (!progress || progress.overallProgress < 100) {
        return false;
      }
    }
    
    return true;
  }

  public async markLessonComplete(lessonId: string, userId: string, timeSpent: number): Promise<void> {
    const lesson = this.findLesson(lessonId);
    if (!lesson) return;
    
    const module = this.findModule(lesson.moduleId);
    if (!module) return;
    
    const progressKey = `${userId}_${module.courseId}`;
    const progress = this.userProgress.get(progressKey);
    if (!progress) return;
    
    // Mark lesson as completed
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      lesson.isCompleted = true;
      lesson.lastAccessed = new Date();
    }
    
    progress.timeSpent += timeSpent;
    progress.lastAccessedAt = new Date();
    
    // Check if module is completed
    const moduleCompleted = module.lessons.every(l => 
      progress.completedLessons.includes(l.id)
    );
    
    if (moduleCompleted && !progress.completedModules.includes(module.id)) {
      progress.completedModules.push(module.id);
      await this.checkAchievements(userId, 'module_completed', module.id);
    }
    
    // Update overall progress
    const course = this.courses.get(module.courseId);
    if (course) {
      const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
      progress.overallProgress = (progress.completedLessons.length / totalLessons) * 100;
      
      // Check if course is completed
      if (progress.overallProgress >= 100) {
        await this.completeCourse(userId, module.courseId);
      }
    }
    
    await this.saveProgressToStorage();
    this.notifySubscribers('lesson_completed', { lessonId, userId, progress: progress.overallProgress });
  }

  private async completeCourse(userId: string, courseId: string): Promise<void> {
    const progress = this.userProgress.get(`${userId}_${courseId}`);
    const course = this.courses.get(courseId);
    
    if (!progress || !course) return;
    
    if (course.certificate && !progress.certificateEarned) {
      progress.certificateEarned = true;
      progress.certificateDate = new Date();
      
      await this.checkAchievements(userId, 'course_completed', courseId);
      this.notifySubscribers('certificate_earned', { courseId, userId });
    }
    
    this.notifySubscribers('course_completed', { courseId, userId });
  }

  // Quiz Management
  public async startQuiz(quizId: string, userId: string): Promise<QuizAttempt | null> {
    const quiz = this.findQuiz(quizId);
    if (!quiz) return null;
    
    // Check attempt limit
    const existingAttempts = this.getQuizAttempts(quizId, userId);
    if (existingAttempts.length >= quiz.attempts) return null;
    
    const attempt: QuizAttempt = {
      id: `attempt_${Date.now()}_${Math.random()}`,
      quizId,
      userId,
      answers: {},
      score: 0,
      percentage: 0,
      timeSpent: 0,
      startedAt: new Date(),
      completedAt: new Date(),
      passed: false
    };
    
    return attempt;
  }

  public async submitQuiz(attempt: QuizAttempt): Promise<QuizAttempt> {
    const quiz = this.findQuiz(attempt.quizId);
    if (!quiz) return attempt;
    
    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    
    quiz.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = attempt.answers[question.id];
      
      if (this.isAnswerCorrect(question, userAnswer)) {
        earnedPoints += question.points;
      }
    });
    
    attempt.score = earnedPoints;
    attempt.percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    attempt.passed = attempt.percentage >= quiz.passingScore;
    attempt.completedAt = new Date();
    attempt.timeSpent = attempt.completedAt.getTime() - attempt.startedAt.getTime();
    
    // Save attempt to user progress
    const module = this.findModuleByQuiz(quiz.id);
    if (module) {
      const progressKey = `${attempt.userId}_${module.courseId}`;
      const progress = this.userProgress.get(progressKey);
      if (progress) {
        progress.quizAttempts.push(attempt);
        await this.saveProgressToStorage();
      }
    }
    
    // Check achievements
    if (attempt.passed) {
      await this.checkAchievements(attempt.userId, 'quiz_passed', quiz.id);
    }
    
    this.notifySubscribers('quiz_completed', attempt);
    return attempt;
  }

  private isAnswerCorrect(question: Question, userAnswer: any): boolean {
    switch (question.type) {
      case 'multiple_choice':
      case 'true_false':
        return userAnswer === question.correctAnswer;
      
      case 'fill_blank':
        const correctAnswers = Array.isArray(question.correctAnswer) 
          ? question.correctAnswer 
          : [question.correctAnswer];
        return correctAnswers.some(answer => 
          userAnswer?.toLowerCase().trim() === answer.toString().toLowerCase().trim()
        );
      
      case 'numerical':
        const numAnswer = parseFloat(userAnswer);
        const correctNum = parseFloat(question.correctAnswer.toString());
        return Math.abs(numAnswer - correctNum) < 0.01;
      
      case 'matching':
        // Implement matching logic based on your specific requirements
        return JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer);
      
      default:
        return false;
    }
  }

  public getQuizAttempts(quizId: string, userId: string): QuizAttempt[] {
    const allProgress = Array.from(this.userProgress.values())
      .filter(p => p.userId === userId);
    
    const attempts: QuizAttempt[] = [];
    allProgress.forEach(progress => {
      attempts.push(...progress.quizAttempts.filter(a => a.quizId === quizId));
    });
    
    return attempts.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  // Learning Paths
  public getLearningPaths(category?: CourseCategory): LearningPath[] {
    let paths = Array.from(this.learningPaths.values());
    
    if (category) {
      paths = paths.filter(path => path.category === category);
    }
    
    return paths;
  }

  public getLearningPath(pathId: string): LearningPath | undefined {
    return this.learningPaths.get(pathId);
  }

  public async enrollInLearningPath(pathId: string, userId: string): Promise<boolean> {
    const path = this.learningPaths.get(pathId);
    if (!path) return false;
    
    // Enroll in all courses in the path
    for (const courseId of path.courses) {
      await this.enrollInCourse(courseId, userId);
    }
    
    this.notifySubscribers('learning_path_enrolled', { pathId, userId });
    return true;
  }

  // Study Plans
  public async createStudyPlan(plan: Omit<StudyPlan, 'id' | 'createdAt'>): Promise<string> {
    const id = `plan_${Date.now()}_${Math.random()}`;
    const studyPlan: StudyPlan = {
      id,
      createdAt: new Date(),
// currentStreak is already included in the plan parameter
// longestStreak is already included in the plan parameter, no need to set it again
      ...plan
    };
    
    this.studyPlans.set(id, studyPlan);
    await this.saveStudyPlansToStorage();
    
    this.notifySubscribers('study_plan_created', studyPlan);
    return id;
  }

  public getStudyPlans(userId: string): StudyPlan[] {
    return Array.from(this.studyPlans.values())
      .filter(plan => plan.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async updateStudyPlanProgress(planId: string, timeSpent: number): Promise<void> {
    const plan = this.studyPlans.get(planId);
    if (!plan) return;
    
    // Update streak logic would go here
    // This is a simplified version
    const today = new Date().toDateString();
    const lastUpdate = new Date().toDateString(); // Would track actual last update
    
    if (today === lastUpdate) {
      // Continue streak
    } else {
      // Reset or increment streak based on consecutive days
    }
    
    await this.saveStudyPlansToStorage();
    this.notifySubscribers('study_plan_updated', plan);
  }

  // Achievements
  private async checkAchievements(userId: string, type: string, data: any): Promise<void> {
    const userAchievements = await this.getUserAchievements(userId);
    const unlockedIds = new Set(userAchievements.map(a => a.id));
    
    for (const achievement of this.achievements.values()) {
      if (unlockedIds.has(achievement.id)) continue;
      
      const unlocked = await this.evaluateAchievement(achievement, userId, type, data);
      if (unlocked) {
        achievement.unlockedAt = new Date();
        await this.saveUserAchievement(userId, achievement);
        this.notifySubscribers('achievement_unlocked', { userId, achievement });
      }
    }
  }

  private async evaluateAchievement(achievement: Achievement, userId: string, type: string, data: any): Promise<boolean> {
    const { criteria } = achievement;
    const userProgress = this.getUserProgress(userId);
    
    switch (criteria.type) {
      case 'courses_completed':
        const completedCourses = userProgress.filter(p => p.overallProgress >= 100).length;
        return this.compareValue(completedCourses, criteria.value, criteria.comparison);
      
      case 'modules_completed':
        const completedModules = userProgress.reduce((sum, p) => sum + p.completedModules.length, 0);
        return this.compareValue(completedModules, criteria.value, criteria.comparison);
      
      case 'quiz_streak':
        // Implement quiz streak logic
        return false;
      
      case 'time_spent':
        const totalTime = userProgress.reduce((sum, p) => sum + p.timeSpent, 0);
        return this.compareValue(totalTime, criteria.value, criteria.comparison);
      
      default:
        return false;
    }
  }

  private compareValue(actual: number, target: number, comparison: string): boolean {
    switch (comparison) {
      case 'gte': return actual >= target;
      case 'lte': return actual <= target;
      case 'eq': return actual === target;
      default: return false;
    }
  }

  private async saveUserAchievement(userId: string, achievement: Achievement): Promise<void> {
    // In a real implementation, this would save to a user-specific achievement store
    // For now, we'll use AsyncStorage with a user-specific key
    try {
      const key = `user_achievements_${userId}`;
      const existing = await AsyncStorage.getItem(key);
      const achievements = existing ? JSON.parse(existing) : [];
      achievements.push(achievement);
      await AsyncStorage.setItem(key, JSON.stringify(achievements));
    } catch (error) {
      console.error('Failed to save user achievement:', error);
    }
  }

  public async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const key = `user_achievements_${userId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load user achievements:', error);
      return [];
    }
  }

  // Analytics
  public async getLearningAnalytics(userId: string): Promise<LearningAnalytics> {
    const userProgress = this.getUserProgress(userId);
    const userAchievements = await this.getUserAchievements(userId);
    
    const totalTimeSpent = userProgress.reduce((sum, p) => sum + p.timeSpent, 0);
    const coursesCompleted = userProgress.filter(p => p.overallProgress >= 100).length;
    const coursesInProgress = userProgress.filter(p => p.overallProgress > 0 && p.overallProgress < 100).length;
    
    // Calculate average quiz score
    const allQuizAttempts = userProgress.flatMap(p => p.quizAttempts);
    const averageQuizScore = allQuizAttempts.length > 0 
      ? allQuizAttempts.reduce((sum, a) => sum + a.percentage, 0) / allQuizAttempts.length 
      : 0;
    
    // Analyze strong and weak areas
    const categoryScores = new Map<string, { total: number; count: number }>();
    userProgress.forEach(progress => {
      const course = this.courses.get(progress.courseId);
      if (course) {
        const existing = categoryScores.get(course.category) || { total: 0, count: 0 };
        existing.total += progress.overallProgress;
        existing.count += 1;
        categoryScores.set(course.category, existing);
      }
    });
    
    const categoryProgress: { [category: string]: number } = {};
    const strongAreas: string[] = [];
    const weakAreas: string[] = [];
    
    categoryScores.forEach((data, category) => {
      const average = data.total / data.count;
      categoryProgress[category] = average;
      
      if (average >= 80) strongAreas.push(category);
      else if (average < 60) weakAreas.push(category);
    });
    
    // Calculate learning streak (simplified)
    const learningStreak = this.calculateLearningStreak(userId);
    
    // Generate weekly progress (mock data)
    const weeklyProgress = this.generateWeeklyProgress(userProgress);
    
    // Get recommendations
    const recommendations = this.getRecommendedCourses(userId);
    
    return {
      totalTimeSpent,
      coursesCompleted,
      coursesInProgress,
      averageQuizScore,
      strongAreas,
      weakAreas,
      learningStreak,
      weeklyProgress,
      categoryProgress,
      achievements: userAchievements,
      recommendations
    };
  }

  private calculateLearningStreak(userId: string): number {
    // Simplified streak calculation
    // In a real implementation, this would track daily learning activity
    return Math.floor(Math.random() * 30) + 1;
  }

  private generateWeeklyProgress(userProgress: UserProgress[]): { week: string; time: number; lessons: number }[] {
    // Generate mock weekly progress data
    const weeks = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      const week = `Week ${date.getMonth() + 1}/${date.getDate()}`;
      
      weeks.push({
        week,
        time: Math.floor(Math.random() * 300) + 60, // 60-360 minutes
        lessons: Math.floor(Math.random() * 10) + 2 // 2-12 lessons
      });
    }
    return weeks;
  }

  // Utility Methods
  public getUserProgress(userId: string): UserProgress[] {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
  }

  public getCourseProgress(courseId: string, userId: string): UserProgress | undefined {
    return this.userProgress.get(`${userId}_${courseId}`);
  }

  private findLesson(lessonId: string): Lesson | undefined {
    for (const course of this.courses.values()) {
      for (const module of course.modules) {
        const lesson = module.lessons.find(l => l.id === lessonId);
        if (lesson) return lesson;
      }
    }
    return undefined;
  }

  private findModule(moduleId: string): Module | undefined {
    for (const course of this.courses.values()) {
      const module = course.modules.find(m => m.id === moduleId);
      if (module) return module;
    }
    return undefined;
  }

  private findQuiz(quizId: string): Quiz | undefined {
    for (const course of this.courses.values()) {
      for (const module of course.modules) {
        if (module.quiz?.id === quizId) return module.quiz;
      }
    }
    return undefined;
  }

  private findModuleByQuiz(quizId: string): Module | undefined {
    for (const course of this.courses.values()) {
      const module = course.modules.find(m => m.quiz?.id === quizId);
      if (module) return module;
    }
    return undefined;
  }

  // Bookmarks and Notes
  public async addBookmark(lessonId: string, userId: string): Promise<void> {
    const lesson = this.findLesson(lessonId);
    if (!lesson) return;
    
    const module = this.findModule(lesson.moduleId);
    if (!module) return;
    
    const progressKey = `${userId}_${module.courseId}`;
    const progress = this.userProgress.get(progressKey);
    if (!progress) return;
    
    if (!progress.bookmarks.includes(lessonId)) {
      progress.bookmarks.push(lessonId);
      await this.saveProgressToStorage();
      this.notifySubscribers('bookmark_added', { lessonId, userId });
    }
  }

  public async removeBookmark(lessonId: string, userId: string): Promise<void> {
    const lesson = this.findLesson(lessonId);
    if (!lesson) return;
    
    const module = this.findModule(lesson.moduleId);
    if (!module) return;
    
    const progressKey = `${userId}_${module.courseId}`;
    const progress = this.userProgress.get(progressKey);
    if (!progress) return;
    
    const index = progress.bookmarks.indexOf(lessonId);
    if (index > -1) {
      progress.bookmarks.splice(index, 1);
      await this.saveProgressToStorage();
      this.notifySubscribers('bookmark_removed', { lessonId, userId });
    }
  }

  public getBookmarks(userId: string): Lesson[] {
    const userProgress = this.getUserProgress(userId);
    const bookmarkedLessons: Lesson[] = [];
    
    userProgress.forEach(progress => {
      progress.bookmarks.forEach(lessonId => {
        const lesson = this.findLesson(lessonId);
        if (lesson) bookmarkedLessons.push(lesson);
      });
    });
    
    return bookmarkedLessons;
  }

  // Initialize Default Content
  private initializeDefaultContent(): void {
    this.createDefaultCourses();
    this.createDefaultLearningPaths();
    this.createDefaultAchievements();
  }

  private createDefaultCourses(): void {
    const defaultInstructor: Instructor = {
      id: 'instructor_1',
      name: 'Dr. Rajesh Sharma',
      title: 'Senior Financial Analyst',
      bio: 'Expert in Nepal Stock Market with 15+ years of experience',
      avatar: 'https://picsum.photos/100/100?random=1',
      experience: 15,
      specializations: ['Technical Analysis', 'Portfolio Management', 'Risk Assessment'],
      rating: 4.8,
      coursesCount: 12,
      studentsCount: 5000
    };

    // Stock Market Basics Course
    const basicsCourse: Course = {
      id: 'course_basics_001',
      title: 'Stock Market Fundamentals for Beginners',
      description: 'Learn the basics of stock market investing in Nepal. Perfect for beginners who want to start their investment journey.',
      category: 'basics',
      level: 'beginner',
      duration: 180, // 3 hours
      modules: [
        {
          id: 'module_basics_001',
          courseId: 'course_basics_001',
          title: 'Introduction to Stock Markets',
          description: 'Understanding what stock markets are and how they work',
          order: 1,
          lessons: [
            {
              id: 'lesson_basics_001',
              moduleId: 'module_basics_001',
              title: 'What is a Stock Market?',
              content: {
                text: 'A stock market is a platform where shares of publicly traded companies are bought and sold. In Nepal, the primary stock exchange is NEPSE (Nepal Stock Exchange).'
              },
              type: 'article',
              duration: 15,
              order: 1,
              resources: [],
              notes: '',
              isCompleted: false
            },
            {
              id: 'lesson_basics_002',
              moduleId: 'module_basics_001',
              title: 'Understanding NEPSE',
              content: {
                text: 'NEPSE is the only stock exchange in Nepal, established in 1993. It facilitates trading of securities of listed companies.'
              },
              type: 'article',
              duration: 20,
              order: 2,
              resources: [],
              notes: '',
              isCompleted: false
            }
          ],
          quiz: {
            id: 'quiz_basics_001',
            moduleId: 'module_basics_001',
            title: 'Stock Market Basics Quiz',
            description: 'Test your understanding of stock market fundamentals',
            questions: [
              {
                id: 'q1',
                type: 'multiple_choice',
                question: 'What does NEPSE stand for?',
                options: ['Nepal Stock Exchange', 'Nepal Securities Exchange', 'Nepal Share Exchange', 'Nepal Stock Enterprise'],
                correctAnswer: 'Nepal Stock Exchange',
                explanation: 'NEPSE stands for Nepal Stock Exchange, the only stock exchange in Nepal.',
                points: 10,
                difficulty: 'easy',
                tags: ['nepse', 'basics']
              }
            ],
            timeLimit: 30,
            passingScore: 70,
            attempts: 3,
            randomizeQuestions: false,
            showCorrectAnswers: true
          },
          duration: 45,
          isLocked: false,
          completionRequired: true
        }
      ],
      prerequisites: [],
      tags: ['beginner', 'basics', 'nepse', 'investing'],
      instructor: defaultInstructor,
      rating: 4.7,
      enrollments: 1250,
      thumbnail: 'https://picsum.photos/300/200?random=1',
      price: 0,
      language: 'en',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      isActive: true,
      certificate: true
    };

    this.courses.set(basicsCourse.id, basicsCourse);

    // Add more default courses here...
  }

  private createDefaultLearningPaths(): void {
    const beginnerPath: LearningPath = {
      id: 'path_beginner_001',
      title: 'Complete Beginner to Investor',
      description: 'A comprehensive learning path for complete beginners to become confident investors',
      courses: ['course_basics_001'], // Add more course IDs
      estimatedDuration: 480, // 8 hours
      level: 'beginner',
      category: 'basics',
      prerequisites: [],
      outcomes: [
        'Understand stock market fundamentals',
        'Learn to analyze stocks',
        'Build your first portfolio',
        'Manage investment risks'
      ],
      thumbnail: 'https://picsum.photos/300/200?random=10'
    };

    this.learningPaths.set(beginnerPath.id, beginnerPath);
  }

  private createDefaultAchievements(): void {
    const achievements: Achievement[] = [
      {
        id: 'achievement_first_course',
        title: 'First Steps',
        description: 'Complete your first course',
        icon: '🎯',
        category: 'completion',
        criteria: {
          type: 'courses_completed',
          value: 1,
          comparison: 'gte'
        },
        points: 100,
        rarity: 'common'
      },
      {
        id: 'achievement_quiz_master',
        title: 'Quiz Master',
        description: 'Score 100% on 5 quizzes',
        icon: '🧠',
        category: 'score',
        criteria: {
          type: 'perfect_quizzes',
          value: 5,
          comparison: 'gte'
        },
        points: 250,
        rarity: 'rare'
      },
      {
        id: 'achievement_time_scholar',
        title: 'Time Scholar',
        description: 'Spend 10 hours learning',
        icon: '⏰',
        category: 'time',
        criteria: {
          type: 'time_spent',
          value: 600, // 10 hours in minutes
          comparison: 'gte'
        },
        points: 200,
        rarity: 'common'
      }
    ];

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  // Notification
  private notifySubscribers(event: string, data: any): void {
    this.subscribers.forEach((callback, key) => {
      if (key.includes(event)) {
        try {
          callback(data);
        } catch (error) {
          console.error('Error notifying subscriber:', error);
        }
      }
    });
  }

  // Storage Methods
  private async loadStoredData(): Promise<void> {
    try {
      const [coursesData, progressData, plansData] = await Promise.all([
        AsyncStorage.getItem('education_courses'),
        AsyncStorage.getItem('education_progress'),
        AsyncStorage.getItem('education_study_plans')
      ]);

      if (coursesData) {
        const courses = JSON.parse(coursesData);
        courses.forEach((course: any) => {
          course.createdAt = new Date(course.createdAt);
          course.updatedAt = new Date(course.updatedAt);
          this.courses.set(course.id, course);
        });
      }

      if (progressData) {
        const progress = JSON.parse(progressData);
        progress.forEach((p: any) => {
          p.enrolledAt = new Date(p.enrolledAt);
          p.lastAccessedAt = new Date(p.lastAccessedAt);
          if (p.certificateDate) p.certificateDate = new Date(p.certificateDate);
          p.quizAttempts.forEach((attempt: any) => {
            attempt.startedAt = new Date(attempt.startedAt);
            attempt.completedAt = new Date(attempt.completedAt);
          });
          this.userProgress.set(`${p.userId}_${p.courseId}`, p);
        });
      }

      if (plansData) {
        const plans = JSON.parse(plansData);
        plans.forEach((plan: any) => {
          plan.createdAt = new Date(plan.createdAt);
          plan.targetDate = new Date(plan.targetDate);
          this.studyPlans.set(plan.id, plan);
        });
      }
    } catch (error) {
      console.error('Failed to load education data:', error);
    }
  }

  private async saveCoursesToStorage(): Promise<void> {
    try {
      const courses = Array.from(this.courses.values());
      await AsyncStorage.setItem('education_courses', JSON.stringify(courses));
    } catch (error) {
      console.error('Failed to save courses:', error);
    }
  }

  private async saveProgressToStorage(): Promise<void> {
    try {
      const progress = Array.from(this.userProgress.values());
      await AsyncStorage.setItem('education_progress', JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  private async saveStudyPlansToStorage(): Promise<void> {
    try {
      const plans = Array.from(this.studyPlans.values());
      await AsyncStorage.setItem('education_study_plans', JSON.stringify(plans));
    } catch (error) {
      console.error('Failed to save study plans:', error);
    }
  }

  // Cleanup
  public cleanup(): void {
    this.subscribers.clear();
  }
}

export default EducationService;
export type {
  Course,
  Module,
  Lesson,
  Quiz,
  Question,
  QuizAttempt,
  UserProgress,
  Achievement,
  LearningPath,
  StudyPlan,
  LearningAnalytics,
  CourseCategory,
  Instructor
};