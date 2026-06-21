"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Timeframe = 'Daily' | 'Weekly' | 'Monthly' | 'All-Time';

export interface DaySummary {
  date: string;
  step_count: number;
  active_time: number;
  calorie: number;
}

export interface HeartRate {
  start_time: string;
  heart_rate: number;
  heart_rate_range?: string;
}

export interface SleepData {
  start_time: string;
  end_time: string;
  stage_deep?: number;
  stage_light?: number;
  stage_rem?: number;
  stage_awake?: number;
}

interface HealthDataState {
  daySummaries: DaySummary[];
  heartRates: HeartRate[];
  sleepData: SleepData[];
  timeframe: Timeframe;
  isLoaded: boolean;
  setTimeframe: (tf: Timeframe) => void;
  setHealthData: (data: { daySummaries?: DaySummary[], heartRates?: HeartRate[], sleepData?: SleepData[] }) => void;
  clearData: () => void;
}

const HealthDataContext = createContext<HealthDataState | undefined>(undefined);

export function HealthDataProvider({ children }: { children: ReactNode }) {
  const [daySummaries, setDaySummaries] = useState<DaySummary[]>([]);
  const [heartRates, setHeartRates] = useState<HeartRate[]>([]);
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>('Weekly');
  
  const isLoaded = daySummaries.length > 0 || heartRates.length > 0 || sleepData.length > 0;

  const setHealthData = (data: { daySummaries?: DaySummary[], heartRates?: HeartRate[], sleepData?: SleepData[] }) => {
    if (data.daySummaries) setDaySummaries(data.daySummaries);
    if (data.heartRates) setHeartRates(data.heartRates);
    if (data.sleepData) setSleepData(data.sleepData);
  };

  const clearData = () => {
    setDaySummaries([]);
    setHeartRates([]);
    setSleepData([]);
  };

  return (
    <HealthDataContext.Provider value={{
      daySummaries,
      heartRates,
      sleepData,
      timeframe,
      isLoaded,
      setTimeframe,
      setHealthData,
      clearData
    }}>
      {children}
    </HealthDataContext.Provider>
  );
}

export function useHealthData() {
  const context = useContext(HealthDataContext);
  if (context === undefined) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
}
