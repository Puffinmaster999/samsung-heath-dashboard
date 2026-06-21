import fs from 'fs/promises';
import path from 'path';

export interface HealthDataPayload {
  day_summary: any[];
  sleep_data: any[];
  heart_rate: any[];
  last_sync?: string;
}

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'health_data.json');

export async function getHealthData(): Promise<HealthDataPayload> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(data) as HealthDataPayload;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { day_summary: [], sleep_data: [], heart_rate: [] };
    }
    throw error;
  }
}

export async function saveHealthData(data: HealthDataPayload): Promise<void> {
  const dir = path.dirname(DATA_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });
  
  data.last_sync = new Date().toISOString();
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
