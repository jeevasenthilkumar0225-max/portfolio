import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'portfolio.json');

let cachedData: PortfolioData | null = null;
let cachedMtime: number = 0;

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
  featured?: boolean;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  driveUrl?: string;
  isPlaceholder?: boolean;
}

export interface PortfolioData {
  profile: ProfileData;
  skills: SkillCategory[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
}

export function getPortfolioData(): PortfolioData {
  try {
    if (!fs.existsSync(dataFilePath)) {
      throw new Error(`Data file not found at ${dataFilePath}`);
    }

    const stat = fs.statSync(dataFilePath);
    const mtime = stat.mtimeMs;

    // Fast-path: return cached JSON in-memory if file has not changed
    if (cachedData && cachedMtime === mtime) {
      return cachedData;
    }

    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    cachedData = JSON.parse(fileContents);
    cachedMtime = mtime;
    return cachedData!;
  } catch (error) {
    console.error('Error reading portfolio data:', error);
    throw error;
  }
}

export function savePortfolioData(data: PortfolioData): boolean {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');

    // Invalidate cache immediately on write
    cachedData = data;
    cachedMtime = fs.statSync(dataFilePath).mtimeMs;
    return true;
  } catch (error) {
    console.error('Error saving portfolio data:', error);
    return false;
  }
}
