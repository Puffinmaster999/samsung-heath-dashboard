const fs = require('fs');
const Papa = require('papaparse');

function test() {
    const dir = '/Users/dohyuny/.gemini/antigravity/scratch/samsung-health/DownloadPersonalData_202606211917';
    
    // Day summary
    let content = fs.readFileSync(`${dir}/com.samsung.shealth.activity.day_summary.2026062119.csv`, 'utf8');
    let cleanCsv = content.split('\n').slice(1).join('\n');
    let result = Papa.parse(cleanCsv, { header: true, skipEmptyLines: true, dynamicTyping: true });
    console.log('Day Summary (first 1):', result.data[0]);

    // Heart Rate
    content = fs.readFileSync(`${dir}/com.samsung.health.heart_rate.2026062119.csv`, 'utf8');
    cleanCsv = content.split('\n').slice(1).join('\n');
    result = Papa.parse(cleanCsv, { header: true, skipEmptyLines: true, dynamicTyping: true });
    console.log('Heart Rate (first 1):', result.data[0]);

    // Sleep
    content = fs.readFileSync(`${dir}/com.samsung.health.sleep.2026062119.csv`, 'utf8');
    cleanCsv = content.split('\n').slice(1).join('\n');
    result = Papa.parse(cleanCsv, { header: true, skipEmptyLines: true, dynamicTyping: true });
    console.log('Sleep (first 1):', result.data[0]);

    // Sleep Stage
    content = fs.readFileSync(`${dir}/com.samsung.health.sleep_stage.2026062119.csv`, 'utf8');
    cleanCsv = content.split('\n').slice(1).join('\n');
    result = Papa.parse(cleanCsv, { header: true, skipEmptyLines: true, dynamicTyping: true });
    console.log('Sleep Stage (first 1):', result.data[0]);
}

test();
