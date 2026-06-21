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

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    try {
      if (file.name.endsWith('.zip')) {
        await processZip(file);
      } else if (file.name.endsWith('.csv')) {
        await processCSV(file, file.name);
      } else {
        throw new Error("Unsupported file type. Please upload a .zip or .csv file.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processZip = async (file: File) => {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(file);
    
    let parsedDaySummaries: DaySummary[] = [];
    let parsedHeartRates: HeartRate[] = [];
    let parsedSleepData: SleepData[] = [];

    const promises: Promise<void>[] = [];

    loadedZip.forEach((relativePath, zipEntry) => {
      if (zipEntry.dir) return;
      
      const fileName = zipEntry.name;
      
      if (fileName.includes('com.samsung.shealth.activity.day_summary') && fileName.endsWith('.csv')) {
        promises.push(zipEntry.async('string').then(content => {
          parsedDaySummaries = parseDaySummaryCSV(content);
        }));
      } else if (fileName.includes('com.samsung.shealth.heart_rate') && fileName.endsWith('.csv')) {
        promises.push(zipEntry.async('string').then(content => {
          parsedHeartRates = parseHeartRateCSV(content);
        }));
      } else if ((fileName.includes('com.samsung.shealth.sleep') || fileName.includes('sleep_data')) && fileName.endsWith('.csv')) {
        promises.push(zipEntry.async('string').then(content => {
          parsedSleepData = parseSleepCSV(content);
        }));
      }
    });

    await Promise.all(promises);

    setHealthData({
      daySummaries: parsedDaySummaries.length > 0 ? parsedDaySummaries : undefined,
      heartRates: parsedHeartRates.length > 0 ? parsedHeartRates : undefined,
      sleepData: parsedSleepData.length > 0 ? parsedSleepData : undefined,
    });
  };

  const processCSV = async (file: File, fileName: string) => {
    const text = await file.text();
    if (fileName.includes('day_summary')) {
      setHealthData({ daySummaries: parseDaySummaryCSV(text) });
    } else if (fileName.includes('heart_rate')) {
      setHealthData({ heartRates: parseHeartRateCSV(text) });
    } else if (fileName.includes('sleep')) {
      setHealthData({ sleepData: parseSleepCSV(text) });
    } else {
      throw new Error(`Unrecognized CSV file: ${fileName}`);
    }
  };

  const parseDaySummaryCSV = (csvContent: string): DaySummary[] => {
    // Samsung Health CSVs often have an extra metadata row at the very top.
    // PapaParse might struggle if headers are on row 2. We'll skip empty/metadata lines.
    const lines = csvContent.split('\n');
    let startIndex = 0;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        if (lines[i].includes('step_count') || lines[i].includes('calorie')) {
            startIndex = i;
            break;
        }
    }
    const cleanCsv = lines.slice(startIndex).join('\n');

    const result = Papa.parse(cleanCsv, { header: true, skipEmptyLines: true, dynamicTyping: true });
    
    return result.data.map((row: any) => ({
      date: row.create_time || row.day_time || '',
      step_count: Number(row.step_count) || 0,
      active_time: Number(row.active_time) || 0,
      calorie: Number(row.calorie) || 0,
    })).filter(item => item.date && item.step_count > 0);
  };

  const parseHeartRateCSV = (csvContent: string): HeartRate[] => {
    const lines = csvContent.split('\n');
    let startIndex = 0;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        if (lines[i].includes('heart_rate')) {
            startIndex = i;
            break;
        }
    }
    const cleanCsv = lines.slice(startIndex).join('\n');
    const result = Papa.parse(cleanCsv, { header: true, skipEmptyLines: true, dynamicTyping: true });
    
    return result.data.map((row: any) => ({
      start_time: row.start_time || row.create_time || '',
      heart_rate: Number(row.heart_rate) || 0,
      heart_rate_range: row.heart_rate_range || undefined,
    })).filter(item => item.start_time && item.heart_rate > 0);
  };

  const parseSleepCSV = (csvContent: string): SleepData[] => {
     const lines = csvContent.split('\n');
    let startIndex = 0;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        if (lines[i].includes('start_time')) {
            startIndex = i;
            break;
        }
    }
    const cleanCsv = lines.slice(startIndex).join('\n');
    const result = Papa.parse(cleanCsv, { header: true, skipEmptyLines: true, dynamicTyping: true });
    
    return result.data.map((row: any) => ({
      start_time: row.start_time || '',
      end_time: row.end_time || '',
      // Approximations, real Samsung data varies wildly in structure. 
      // Sometimes it's in a separate stage file, sometimes it's just efficiency.
      stage_deep: Number(row.efficiency) ? Math.floor(Number(row.efficiency) * 0.3) : 0, 
      stage_light: Number(row.efficiency) ? Math.floor(Number(row.efficiency) * 0.5) : 0,
      stage_rem: Number(row.efficiency) ? Math.floor(Number(row.efficiency) * 0.2) : 0,
    })).filter(item => item.start_time);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      // Process the first file if it's a ZIP, or multiple CSVs
      const zipFile = acceptedFiles.find(f => f.name.endsWith('.zip'));
      if (zipFile) {
        processFile(zipFile);
      } else {
        acceptedFiles.forEach(f => {
            if (f.name.endsWith('.csv')) {
                processFile(f);
            }
        })
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'text/csv': ['.csv']
    }
  });

  if (isLoaded && !isProcessing && !error) {
     // If loaded and no intent to re-upload, we can minimize this
     return (
        <div className="sci-fi-panel p-4 flex items-center justify-between border-bright-green">
             <div className="flex items-center gap-3">
                 <CheckCircle2 className="text-bright-green w-5 h-5" />
                 <span className="text-white font-medium">Data Loaded Successfully</span>
             </div>
             <button 
                {...getRootProps()} 
                className="text-xs uppercase tracking-widest text-electric-blue hover:text-white transition-colors"
             >
                <input {...getInputProps()} />
                Upload New Data
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
            <p className="text-electric-blue font-medium tracking-widest uppercase">Extracting Telemetry...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 text-red-500">
            <AlertCircle className="w-12 h-12" />
            <p className="font-medium tracking-wide">{error}</p>
            <p className="text-xs text-gray-400">Click to try again</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-[rgba(255,255,255,0.05)]">
                <UploadCloud className={cn("w-10 h-10 transition-colors", isDragActive ? "text-electric-blue" : "text-gray-400")} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-white mb-2">Initialize Data Core</h3>
                <p className="text-sm text-gray-400 max-w-md">
                    Drag and drop your Samsung Health <strong className="text-electric-blue">.zip</strong> export file here, or drop individual <strong className="text-bright-green">.csv</strong> sheets.
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
                    <FileType className="w-3 h-3" /> sleep.csv
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
