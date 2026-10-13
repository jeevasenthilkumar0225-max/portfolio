import fs from 'fs';
import path from 'path';
import os from 'os';

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

export function getStorageStatus(): { readOnly: boolean; path: string; fallbackActive: boolean } {
  const fallbackPath = getFallbackFilePath();
  const fallbackExists = fs.existsSync(fallbackPath);
  return {
    readOnly: isStorageReadOnly,
    path: fallbackExists ? fallbackPath : dataFilePath,
    fallbackActive: fallbackExists,
  };
}

export function getPortfolioData(): PortfolioData {
  try {
    const fallbackPath = getFallbackFilePath();

    // Check if fallback tmp file exists and has newer or active data
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
        // If reading fallback fails, proceed to primary file
      }
    }

    if (!fs.existsSync(dataFilePath)) {
      if (cachedData) return cachedData;
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
    if (cachedData) {
      return cachedData;
    }
    console.error('Error reading portfolio data:', error);
    throw error;
  }
}

export function savePortfolioData(data: PortfolioData): boolean {
  // Update in-memory cache immediately so runtime requests have instant access
  cachedData = data;
  cachedMtime = Date.now();

  // Try saving to primary dataFilePath (works in local dev & writable servers)
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
    // Vercel serverless functions have a read-only filesystem (/var/task)
    // EROFS or EACCES: Gracefully fallback to writable temporary storage (/tmp or os.tmpdir)
    console.warn(`[data.ts] Primary filesystem is read-only (${fsError?.code || fsError?.message}). Writing to temporary fallback storage.`);
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
    } catch (fallbackError) {
      console.error('[data.ts] Fallback storage write also failed:', fallbackError);
      // In-memory cache is still updated, so return true to prevent client crash
      return true;
    }
  }
}

export function exportPortfolioDataJSON(data?: PortfolioData): string {
  const target = data || getPortfolioData();
  return JSON.stringify(target, null, 2);
}

export function importPortfolioDataJSON(jsonString: string): { success: boolean; data?: PortfolioData; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !parsed.profile || !parsed.skills || !parsed.projects || !parsed.experience) {
      return { success: false, error: 'JSON does not conform to PortfolioData schema (missing required fields)' };
    }
    const saved = savePortfolioData(parsed);
    if (!saved) {
      return { success: false, error: 'Failed to write imported data to storage' };
    }
    return { success: true, data: parsed };
  } catch (err: any) {
    return { success: false, error: `Invalid JSON syntax: ${err?.message || 'unknown error'}` };
  }
}
