import { NextResponse } from 'next/server';
import { getHealthData, saveHealthData, HealthDataPayload } from '@/lib/dataStore';

export async function POST(request: Request) {
  try {
    const payload: HealthDataPayload = await request.json();

    // Basic validation
    if (!payload.day_summary && !payload.sleep_data && !payload.heart_rate) {
      return NextResponse.json({ error: 'Invalid payload structure' }, { status: 400 });
    }

    // Retrieve existing data to merge or overwrite (simplest approach: overwrite for now, or merge)
    // Here we will just store the incoming payload as the source of truth
    // The Python drone will send all available data each time or incremental.
    // Assuming the Python drone sends the consolidated data.
    const existingData = await getHealthData();

    // Simple merge logic: For now we overwrite arrays if they are provided in the payload
    const mergedData: HealthDataPayload = {
      day_summary: payload.day_summary && payload.day_summary.length > 0 ? payload.day_summary : existingData.day_summary,
      sleep_data: payload.sleep_data && payload.sleep_data.length > 0 ? payload.sleep_data : existingData.sleep_data,
      heart_rate: payload.heart_rate && payload.heart_rate.length > 0 ? payload.heart_rate : existingData.heart_rate,
      last_sync: new Date().toISOString()
    };

    await saveHealthData(mergedData);

    return NextResponse.json({ success: true, message: 'Data synced successfully', last_sync: mergedData.last_sync });
  } catch (error) {
    console.error('Error syncing data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await getHealthData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
