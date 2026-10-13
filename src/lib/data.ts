import fs from 'fs';
import path from 'path';
import os from 'os';
import { getDatabase, getLastMongoConnectionError } from './mongodb';

const dataFilePath = path.join(process.cwd(), 'data', 'portfolio.json');

function getFallbackFilePath(): string {
  try {
    const tmpDir = os.tmpdir();
    return path.join(tmpDir, 'portfolio.json');
  } catch {
    return path.join(process.cwd(), 'data', 'portfolio.json');
  }
}

let cachedData: PortfolioData | null = null;
let cachedMtime: number = 0;
let isStorageReadOnly: boolean = false;
let isMongoConnected: boolean = false;
let lastMongoError: string | null = null;

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  board?: string;
  duration: string;
  score: string;
  details?: string;
  isPlaceholder?: boolean;
}

export interface HackathonItem {
  id: string;
  title: string;
  location: string;
  role: string;
  description: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
}

export interface ProfileData {
  name: string;
  phone: string;
  email: string;
  linkedIn: string;
  github: string;
  additionalLinks: { label: string; url: string }[];
  targetRoles: string[];
  summary: string;
  education: EducationItem[];
  softSkills: string[];
  languages: string[];
  strengths: string[];
  areasOfInterest: string[];
  hackathons: HackathonItem[];
  achievements: AchievementItem[];
}

export interface SkillItem {
  name: string;
  level: string;
}

export interface SkillCategory {
  category: string;
  items: SkillItem[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  duration: string;
  project: string;
  responsibilities: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  techStack: string[];
  description: string;
  longDescription?: string;
  githubUrl: string;
  liveUrl?: string;
  imageUrl?: string;
  featured?: boolean;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  driveUrl?: string;
  imageUrl?: string;
  isPlaceholder?: boolean;
}

export interface PortfolioData {
  profile: ProfileData;
  skills: SkillCategory[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
}

export function getStorageStatus(): {
  readOnly: boolean;
  path: string;
  fallbackActive: boolean;
  mongoConnected: boolean;
  mongoError: string | null;
  hasMongoUri: boolean;
} {
  const fallbackPath = getFallbackFilePath();
  const fallbackExists = fs.existsSync(fallbackPath);
  return {
    readOnly: isStorageReadOnly,
    path: isMongoConnected ? 'MongoDB Cloud Atlas (portfolio_main)' : fallbackExists ? fallbackPath : dataFilePath,
    fallbackActive: fallbackExists && !isMongoConnected,
    mongoConnected: isMongoConnected,
    mongoError: lastMongoError || getLastMongoConnectionError(),
    hasMongoUri: Boolean(process.env.MONGODB_URI),
  };
}

// Read local JSON file as backup or initial seed
function getLocalSeedData(): PortfolioData {
  const fallbackPath = getFallbackFilePath();
  if (fs.existsSync(fallbackPath)) {
    try {
      const raw = fs.readFileSync(fallbackPath, 'utf8');
      return JSON.parse(raw);
    } catch {
      // ignore
    }
  }
  if (fs.existsSync(dataFilePath)) {
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(raw);
  }
  if (cachedData) return cachedData;
  throw new Error(`Data file not found at ${dataFilePath}`);
}

export async function getPortfolioData(): Promise<PortfolioData> {
  // 1. Try MongoDB if configured
  try {
    const db = await getDatabase();
    if (db) {
      const doc = await db.collection('portfolio_data').findOne({ id: 'main_portfolio' });
      if (doc && doc.data) {
        isMongoConnected = true;
        cachedData = doc.data as PortfolioData;
        return cachedData;
      }

      // If MongoDB is connected but has no document yet, seed it from local JSON!
      const seed = getLocalSeedData();
      await db.collection('portfolio_data').updateOne(
        { id: 'main_portfolio' },
        { $set: { id: 'main_portfolio', data: seed, updatedAt: new Date() } },
        { upsert: true }
      );
      isMongoConnected = true;
      cachedData = seed;
      return cachedData;
    }
  } catch (mongoErr) {
    console.warn('[data.ts] MongoDB read failed, falling back to local storage:', mongoErr);
    isMongoConnected = false;
  }

  // 2. Fallback to local filesystem / /tmp cache
  try {
    const fallbackPath = getFallbackFilePath();

    if (fs.existsSync(fallbackPath)) {
      try {
        const fallbackStat = fs.statSync(fallbackPath);
        if (cachedData && cachedMtime === fallbackStat.mtimeMs) {
          return cachedData;
        }
        const fallbackContents = fs.readFileSync(fallbackPath, 'utf8');
        cachedData = JSON.parse(fallbackContents);
        cachedMtime = fallbackStat.mtimeMs;
        return cachedData!;
      } catch {
        // proceed
      }
    }

    if (!fs.existsSync(dataFilePath)) {
      if (cachedData) return cachedData;
      throw new Error(`Data file not found at ${dataFilePath}`);
    }

    const stat = fs.statSync(dataFilePath);
    const mtime = stat.mtimeMs;

    if (cachedData && cachedMtime === mtime) {
      return cachedData;
    }

    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    cachedData = JSON.parse(fileContents);
    cachedMtime = mtime;
    return cachedData!;
  } catch (error) {
    if (cachedData) {
      return cachedData;
    }
    console.error('Error reading portfolio data:', error);
    throw error;
  }
}

export async function savePortfolioData(data: PortfolioData): Promise<boolean> {
  cachedData = data;
  cachedMtime = Date.now();

  let mongoSaved = false;

  // 1. Try saving to MongoDB if configured
  if (!process.env.MONGODB_URI) {
    lastMongoError = 'MONGODB_URI environment variable is missing in Vercel settings';
    isMongoConnected = false;
  } else {
    try {
      const db = await getDatabase();
      if (db) {
        await db.collection('portfolio_data').updateOne(
          { id: 'main_portfolio' },
          { $set: { id: 'main_portfolio', data, updatedAt: new Date() } },
          { upsert: true }
        );
        isMongoConnected = true;
        mongoSaved = true;
        lastMongoError = null;
      }
    } catch (mongoErr: any) {
      console.warn('[data.ts] MongoDB write failed:', mongoErr);
      isMongoConnected = false;
      lastMongoError = mongoErr?.message || String(mongoErr);
    }
  }

  // 2. Also save to local filesystem / fallback tmp
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    cachedMtime = fs.statSync(dataFilePath).mtimeMs;
    isStorageReadOnly = false;
    return true;
  } catch (fsError: any) {
    isStorageReadOnly = true;

    try {
      const fallbackPath = getFallbackFilePath();
      const fallbackDir = path.dirname(fallbackPath);
      if (!fs.existsSync(fallbackDir)) {
        fs.mkdirSync(fallbackDir, { recursive: true });
      }
      fs.writeFileSync(fallbackPath, JSON.stringify(data, null, 2), 'utf8');
      cachedMtime = fs.statSync(fallbackPath).mtimeMs;
      return true;
    } catch {
      // If MongoDB succeeded, we consider it a success even if local disk fails
      return mongoSaved;
    }
  }
}

export function exportPortfolioDataJSON(data: PortfolioData): string {
  return JSON.stringify(data, null, 2);
}

export async function importPortfolioDataJSON(jsonString: string): Promise<{ success: boolean; data?: PortfolioData; error?: string }> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !parsed.profile || !parsed.skills || !parsed.projects || !parsed.experience) {
      return { success: false, error: 'JSON does not conform to PortfolioData schema (missing required fields)' };
    }
    const saved = await savePortfolioData(parsed);
    if (!saved) {
      return { success: false, error: 'Failed to write imported data to storage' };
    }
    return { success: true, data: parsed };
  } catch (err: any) {
    return { success: false, error: `Invalid JSON syntax: ${err?.message || 'unknown error'}` };
  }
}
