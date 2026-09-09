// 词根/前缀/后缀类型
export type MorphemeType = 'root' | 'prefix' | 'suffix';

// 词根拆解部分
export interface WordPart {
  type: MorphemeType;
  form: string;       // 形态，如 "spec"
  meaning: string;    // 含义，如 "看"
}

// 单词
export interface Word {
  word: string;
  phonetic: string;           // 音标
  meaning: string;            // 中文释义
  parts: WordPart[];          // 拆解：前缀+词根+后缀
  exampleSentence: string;    // 英文例句
  exampleTranslation: string; // 例句中文翻译
  mnemonic?: string;          // 助记（可选）
}

// 学习单元（一个词根/前缀/后缀为一个单元）
export interface LearningUnit {
  id: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  type: MorphemeType;
  form: string;              // 形态，如 "spect"
  meaning: string;           // 含义
  description: string;       // 详细说明
  words: Word[];             // 派生单词
  examTags?: ExamTag[];      // 适用考试标签
}

// 考试标签
export type ExamTag = 'cet4' | 'cet6' | 'kaoyan' | 'ielts' | 'toefl' | 'gre' | 'daily';

// 课程级别
export interface CourseLevel {
  level: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  description: string;
  units: LearningUnit[];
}

// 用户
export interface User {
  username: string;
  password: string;
  createdAt: string;
}

// 单元完成状态
export type UnitStatus = 'not_started' | 'in_progress' | 'completed';

// 学习进度数据
export interface UserProgress {
  unitStatuses: Record<string, UnitStatus>;  // unitId -> status
  practiceCount: number;                       // 总练习次数
  learnedDates: string[];                      // 学习日期列表 (YYYY-MM-DD)
  lastPracticeDate: string | null;            // 最后练习日期
}

// 生词本条目
export interface WordBookEntry {
  word: string;
  meaning: string;
  phonetic: string;
  rootId: string;
  rootForm: string;
  rootMeaning: string;
  parts: WordPart[];
  addedAt: string;
  // SRS 记忆状态
  easeFactor: number;      // SM-2 难度因子（默认 2.5）
  interval: number;        // 当前间隔（天）
  repetitions: number;     // 连续正确次数
  lapses: number;          // 遗忘次数
  lastReview: string | null;  // 上次复习日期
  nextReview: string;      // 下次复习日期
  reviewCount: number;     // 总复习次数
  correctCount: number;    // 正确次数
}

// SRS 复习质量
export type ReviewQuality = 'again' | 'hard' | 'good' | 'easy';

// 每日目标
export interface DailyGoal {
  dailyWords: number;          // 每日目标学词数
  dailyReview: number;         // 每日目标复习数
  dailyPractice: number;       // 每日目标练习数
}

// 每日完成记录
export interface DailyCompletion {
  date: string;
  wordsLearned: number;
  wordsReviewed: number;
  practicesDone: number;
}

// 成就
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;       // emoji 或图标标识
  category: 'learning' | 'streak' | 'practice' | 'level' | 'social' | 'special';
  threshold: number;  // 达成阈值
  metric: string;     // 对应的统计指标名
  reward?: number;    // 奖励宝石
  unlockedAt?: string;
}

// 练习结果
export interface PracticeResult {
  unitId: string;
  type: PracticeType;
  total: number;
  correct: number;
  wrongWords: string[];  // 答错的单词
  date: string;
  xpEarned?: number;
}

// 练习类型
export type PracticeType = 'decompose' | 'spelling' | 'choice' | 'fillblank';

// 练习题
export interface PracticeQuestion {
  type: PracticeType;
  word: string;
  meaning: string;
  phonetic: string;
  parts: WordPart[];
  exampleSentence?: string;
  exampleTranslation?: string;
  options?: string[];      // 选择题选项
  answer?: string;         // 正确答案（选择题/填空题）
  blankedSentence?: string; // 填空题的句子（含___）
}

// 排行榜条目
export interface LeaderboardEntry {
  username: string;
  xp: number;
  streak: number;
  level: number;
  isCurrentUser?: boolean;
}

// 主题
export type ThemeMode = 'light' | 'dark';
