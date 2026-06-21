"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { UploadCloud, FileType, CheckCircle2, AlertCircle } from 'lucide-react';
import { useHealthData, DaySummary, HeartRate, SleepData } from '@/contexts/HealthDataContext';
import { cn } from '@/lib/utils';

export default function FileUploader() {
  const { setHealthData, isLoaded } = useHealthData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    setError(null);
    try {
      let daySummaryContent = '';
      let heartRateContent = '';
      let sleepStageContent = '';
      let sleepContent = '';

      // Check if a single ZIP was uploaded
      const zipFile = files.find(f => f.name.endsWith('.zip'));
      
      if (zipFile) {
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(zipFile);
        
        const promises: Promise<void>[] = [];
        loadedZip.forEach((relativePath, zipEntry) => {
          if (zipEntry.dir) return;
          const fileName = zipEntry.name;
          if (fileName.includes('activity.day_summary') && fileName.endsWith('.csv')) {
            promises.push(zipEntry.async('string').then(c => { daySummaryContent = c; }));
          } else if (fileName.includes('heart_rate') && !fileName.includes('zone') && fileName.endsWith('.csv')) {
            promises.push(zipEntry.async('string').then(c => { heartRateContent = c; }));
          } else if (fileName.includes('sleep_stage') && fileName.endsWith('.csv')) {
            promises.push(zipEntry.async('string').then(c => { sleepStageContent = c; }));
          } else if (fileName.includes('sleep') && !fileName.includes('sleep_stage') && fileName.endsWith('.csv')) {
            promises.push(zipEntry.async('string').then(c => { sleepContent = c; }));
          }
        });
        await Promise.all(promises);
      } else {
        // Unzipped folder or individual files
        const daySummaryFile = files.find(f => f.name.includes('activity.day_summary') && f.name.endsWith('.csv'));
        const heartRateFile = files.find(f => f.name.includes('heart_rate') && !f.name.includes('zone') && f.name.endsWith('.csv'));
        const sleepStageFile = files.find(f => f.name.includes('sleep_stage') && f.name.endsWith('.csv'));
        const sleepFile = files.find(f => f.name.includes('sleep') && !f.name.includes('sleep_stage') && f.name.endsWith('.csv'));

        if (daySummaryFile) daySummaryContent = await daySummaryFile.text();
        if (heartRateFile) heartRateContent = await heartRateFile.text();
        if (sleepStageFile) sleepStageContent = await sleepStageFile.text();
        if (sleepFile) sleepContent = await sleepFile.text();
      }

      if (!daySummaryContent && !heartRateContent && !sleepContent) {
        throw new Error("Could not find the necessary Samsung Health CSV files. Did you upload the correct folder or ZIP?");
      }

      // Parse the content
      let parsedDaySummaries: DaySummary[] = [];
      let parsedHeartRates: HeartRate[] = [];
      let parsedSleepData: SleepData[] = [];

      if (daySummaryContent) parsedDaySummaries = parseDaySummaryCSV(daySummaryContent);
      if (heartRateContent) parsedHeartRates = parseHeartRateCSV(heartRateContent);
      
      // Parse sleep (preferring stage data if available for hyper-accurate architecture)
      if (sleepStageContent && sleepContent) {
          parsedSleepData = parseAdvancedSleepData(sleepContent, sleepStageContent);
      } else if (sleepContent) {
          parsedSleepData = parseBasicSleepCSV(sleepContent);
      }

      setHealthData({
        daySummaries: parsedDaySummaries.length > 0 ? parsedDaySummaries : undefined,
        heartRates: parsedHeartRates.length > 0 ? parsedHeartRates : undefined,
        sleepData: parsedSleepData.length > 0 ? parsedSleepData : undefined,
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process files.");
    } finally {
      setIsProcessing(false);
    }
  };

  const parseDaySummaryCSV = (csvContent: string): DaySummary[] => {
    const cleanCsv = csvContent.split('\n').slice(1).join('\n'); // Skip metadata row 1
    const result = Papa.parse(cleanCsv, { header: true, skipEmptyLines: true, dynamicTyping: true });
    
    return result.data.map((row: any) => ({
      date: row.create_time || row.update_time || '',
      step_count: Number(row.step_count) || 0,
      active_time: Number(row.active_time) || 0,
      calorie: Number(row.calorie) || 0,
    })).filter(item => item.date && item.step_count > 0);
  };

  const parseHeartRateCSV = (csvContent: string): HeartRate[] => {
    const cleanCsv = csvContent.split('\n').slice(1).join('\n');
    const result = Papa.parse(cleanCsv, { header: true, skipEmptyLines: true, dynamicTyping: true });
    
    return result.data.map((row: any) => ({
      start_time: row.start_time || row.create_time || '',
      heart_rate: Number(row.heart_rate) || 0,
      heart_rate_range: row.heart_rate_range || undefined,
    })).filter(item => item.start_time && item.heart_rate > 0);
  };

  const parseBasicSleepCSV = (csvContent: string): SleepData[] => {
    const cleanCsv = csvContent.split('\n').slice(1).join('\n');
    const result = Papa.parse(cleanCsv, { header: true, skipEmptyLines: true, dynamicTyping: true });
    
    return result.data.map((row: any) => {
        // Fallback approximation if no stage data
        const start = new Date(row.start_time);
        const end = new Date(row.end_time);
        const diffMins = (end.getTime() - start.getTime()) / 60000;
        
        return {
            start_time: row.start_time || '',
            end_time: row.end_time || '',
            stage_deep: Math.floor(diffMins * 0.2), 
            stage_light: Math.floor(diffMins * 0.5),
            stage_rem: Math.floor(diffMins * 0.2),
            stage_awake: Math.floor(diffMins * 0.1),
        };
    }).filter(item => item.start_time);
  };

  const parseAdvancedSleepData = (sleepCsv: string, stageCsv: string): SleepData[] => {
      // Parses sleep.csv for master sessions, then aggregates sleep_stage.csv into those sessions
      const cleanSleep = sleepCsv.split('\n').slice(1).join('\n');
      const cleanStage = stageCsv.split('\n').slice(1).join('\n');
      
      const sleepResult = Papa.parse(cleanSleep, { header: true, skipEmptyLines: true, dynamicTyping: true });
      const stageResult = Papa.parse(cleanStage, { header: true, skipEmptyLines: true, dynamicTyping: true });

      // Group stages by sleep_id or date
      const stageMap: Record<string, any> = {};
      
      stageResult.data.forEach((row: any) => {
          if (!row.sleep_id) return;
          if (!stageMap[row.sleep_id]) {
              stageMap[row.sleep_id] = { deep: 0, light: 0, rem: 0, awake: 0 };
          }
          
          const start = new Date(row.start_time).getTime();
          const end = new Date(row.end_time).getTime();
          const durationMins = (end - start) / 60000;
          
          // Samsung Stage Codes: 40001 (Awake), 40002 (Light), 40003 (Deep), 40004 (REM)
          if (row.stage === 40001) stageMap[row.sleep_id].awake += durationMins;
          else if (row.stage === 40002) stageMap[row.sleep_id].light += durationMins;
          else if (row.stage === 40003) stageMap[row.sleep_id].deep += durationMins;
          else if (row.stage === 40004) stageMap[row.sleep_id].rem += durationMins;
          else stageMap[row.sleep_id].light += durationMins; // fallback
      });

      return sleepResult.data.map((row: any) => {
          // Use datauuid to match sleep_id
          const stages = stageMap[row.datauuid] || { deep: 0, light: 0, rem: 0, awake: 0 };
          return {
              start_time: row.start_time || '',
              end_time: row.end_time || '',
              stage_deep: Math.floor(stages.deep),
              stage_light: Math.floor(stages.light),
              stage_rem: Math.floor(stages.rem),
              stage_awake: Math.floor(stages.awake)
          }
      }).filter(item => item.start_time);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFiles(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    // Removed strict accept constraints so unzipped folders can be dropped natively
  });

  if (isLoaded && !isProcessing && !error) {
     return (
        <div className="sci-fi-panel p-4 flex flex-col md:flex-row items-center justify-between border-bright-green gap-4">
             <div className="flex items-center gap-3">
                 <CheckCircle2 className="text-bright-green w-5 h-5" />
                 <span className="text-white font-medium">Telemetry Core Loaded Successfully</span>
             </div>
             <button 
                {...getRootProps()} 
                className="text-xs uppercase tracking-widest text-electric-blue hover:text-white transition-colors"
             >
                <input {...getInputProps()} />
                Upload Different Data
             </button>
        </div>
     )
  }

  return (
    <div 
      {...getRootProps()} 
      className={cn(
        "sci-fi-panel border-dashed border-2 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center p-6 md:p-12 text-center",
        isDragActive ? "border-electric-blue bg-[var(--color-neon-glow-blue)] bg-opacity-10" : "border-[var(--color-panel-border)] hover:border-gray-400",
        error ? "border-red-500 hover:border-red-400" : ""
      )}
    >
      <input {...getInputProps()} />
      
      {isProcessing ? (
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-electric-blue border-t-transparent animate-spin" />
            <p className="text-electric-blue font-medium tracking-widest uppercase">Extracting & Parsing Telemetry...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 text-red-500">
            <AlertCircle className="w-12 h-12" />
            <p className="font-medium tracking-wide">{error}</p>
            <p className="text-xs text-gray-400 mt-2">Click to try again</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-[rgba(255,255,255,0.05)]">
                <UploadCloud className={cn("w-10 h-10 transition-colors", isDragActive ? "text-electric-blue" : "text-gray-400")} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-white mb-2">Initialize Data Core</h3>
                <p className="text-sm text-gray-400 max-w-md">
                    Drag and drop your <strong className="text-electric-blue">Samsung Health Unzipped Folder</strong> or the <strong className="text-bright-green">.zip</strong> export here.
                </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-4">
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-black bg-opacity-50 px-2 py-1 rounded">
                    <FileType className="w-3 h-3" /> day_summary.csv
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-black bg-opacity-50 px-2 py-1 rounded">
                    <FileType className="w-3 h-3" /> heart_rate.csv
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-black bg-opacity-50 px-2 py-1 rounded">
                    <FileType className="w-3 h-3" /> sleep_stage.csv
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
