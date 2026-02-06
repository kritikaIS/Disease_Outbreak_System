import Report from '../models/Report.js';
import Outbreak from '../models/Outbreak.js';
import Symptom from '../models/Symptom.js';
import Clinic from '../models/Clinic.js';

/**
 * Outbreak Detection Service
 * Analyzes symptom data to detect potential outbreaks based on thresholds and clustering
 */

// Default thresholds for different symptom severities
const DEFAULT_THRESHOLDS = {
  'Low': 5,      // 5 cases per day
  'Medium': 3,   // 3 cases per day  
  'High': 2      // 2 cases per day
};

/**
 * Analyze reports for outbreak detection
 * @param {Object} options - Analysis options
 * @param {string} options.region - Region to analyze (optional)
 * @param {number} options.days - Number of days to look back (default: 7)
 * @param {Date} options.endDate - End date for analysis (default: now)
 * @returns {Object} Analysis results
 */
export async function analyzeOutbreaks(options = {}) {
  const {
    region = null,
    days = 7,
    endDate = new Date()
  } = options;

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  console.log(`Analyzing outbreaks from ${startDate.toISOString()} to ${endDate.toISOString()}`);
  
  try {
    // Step 1: Data Entry - Get all reports in the time period
    const query = {
      report_date: {
        $gte: startDate,
        $lte: endDate
      }
    };

    // Add region filter if specified
    if (region) {
      const clinicsInRegion = await Clinic.find({ region }).select('clinic_id');
      const clinicIds = clinicsInRegion.map(c => c.clinic_id);
      query.clinic_id = { $in: clinicIds };
    }

    const reports = await Report.find(query);
    console.log(`Found ${reports.length} reports for analysis`);

    // Step 2: Symptom Aggregation - Count symptoms by day and region
    const symptomAggregation = await aggregateSymptoms(reports, startDate, endDate);
    
    // Step 3: Threshold Comparison - Check against thresholds
    const thresholdAnalysis = await checkThresholds(symptomAggregation);
    
    // Step 4: Outbreak Flagging - Create outbreak records
    const outbreaks = await flagOutbreaks(thresholdAnalysis, region);
    
    // Step 5: Cluster Detection - Look for symptom clusters
    const clusters = await detectClusters(reports, startDate, endDate);

    return {
      analysisPeriod: {
        startDate,
        endDate,
        days
      },
      totalReports: reports.length,
      symptomAggregation,
      thresholdAnalysis,
      outbreaks,
      clusters,
      summary: {
        totalOutbreaks: outbreaks.length,
        activeOutbreaks: outbreaks.filter(o => o.status === 'Active').length,
        totalClusters: clusters.length
      }
    };

  } catch (error) {
    console.error('Error in outbreak analysis:', error);
    throw error;
  }
}

/**
 * Aggregate symptoms by day and region
 */
async function aggregateSymptoms(reports, startDate, endDate) {
  const aggregation = {};
  
  // Get all unique symptoms
  const allSymptoms = await Symptom.find({});
  const symptomMap = {};
  allSymptoms.forEach(symptom => {
    symptomMap[symptom.symptom_id] = symptom;
  });

  // Initialize aggregation structure
  allSymptoms.forEach(symptom => {
    aggregation[symptom.symptom_id] = {
      symptom_id: symptom.symptom_id,
      name: symptom.name,
      severity: symptom.severity,
      dailyCounts: {},
      totalCount: 0,
      regions: {},
      threshold: DEFAULT_THRESHOLDS[symptom.severity] || DEFAULT_THRESHOLDS['Medium']
    };
  });

  // Process each report
  reports.forEach(report => {
    const reportDate = new Date(report.report_date);
    const dateKey = reportDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    report.symptoms.forEach(symptomReport => {
      const symptomId = symptomReport.symptom_id;
      
      if (aggregation[symptomId]) {
        // Daily count
        if (!aggregation[symptomId].dailyCounts[dateKey]) {
          aggregation[symptomId].dailyCounts[dateKey] = 0;
        }
        aggregation[symptomId].dailyCounts[dateKey]++;
        
        // Total count
        aggregation[symptomId].totalCount++;
        
        // Regional count
        if (!aggregation[symptomId].regions[report.clinic_id]) {
          aggregation[symptomId].regions[report.clinic_id] = 0;
        }
        aggregation[symptomId].regions[report.clinic_id]++;
      }
    });
  });

  return Object.values(aggregation);
}

/**
 * Check symptoms against thresholds
 */
async function checkThresholds(symptomAggregation) {
  const analysis = [];
  
  for (const symptom of symptomAggregation) {
    const dailyCounts = Object.values(symptom.dailyCounts);
    const maxDailyCount = Math.max(...dailyCounts, 0);
    const avgDailyCount = dailyCounts.length > 0 ? 
      dailyCounts.reduce((sum, count) => sum + count, 0) / dailyCounts.length : 0;
    
    const isThresholdExceeded = maxDailyCount > symptom.threshold;
    const severity = isThresholdExceeded ? 
      (maxDailyCount > symptom.threshold * 2 ? 'Critical' : 'High') : 'Normal';
    
    analysis.push({
      ...symptom,
      maxDailyCount,
      avgDailyCount,
      isThresholdExceeded,
      severity,
      thresholdExceededDays: dailyCounts.filter(count => count > symptom.threshold).length
    });
  }
  
  return analysis;
}

/**
 * Flag outbreaks based on threshold analysis
 */
async function flagOutbreaks(thresholdAnalysis, region) {
  const outbreaks = [];
  
  // Group symptoms by region and time period
  const regionGroups = {};
  
  for (const symptom of thresholdAnalysis) {
    if (symptom.isThresholdExceeded) {
      // Get regions where this symptom exceeded threshold
      const affectedRegions = Object.keys(symptom.regions);
      
      for (const clinicId of affectedRegions) {
        // Get the actual region from clinic data
        const clinic = await Clinic.findOne({ clinic_id: clinicId });
        const regionKey = region || (clinic ? clinic.region : 'Unknown');
        
        if (!regionGroups[regionKey]) {
          regionGroups[regionKey] = {
            region: regionKey,
            symptoms: [],
            startDate: null,
            endDate: null
          };
        }
        
        regionGroups[regionKey].symptoms.push({
          symptom_id: symptom.symptom_id,
          name: symptom.name,
          cases_count: symptom.regions[clinicId],
          threshold: symptom.threshold,
          is_threshold_exceeded: true,
          maxDailyCount: symptom.maxDailyCount
        });
      }
    }
  }
  
  // Create outbreak records
  for (const [regionKey, group] of Object.entries(regionGroups)) {
    if (group.symptoms.length > 0) {
      const outbreakId = `OUT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const outbreak = new Outbreak({
        outbreak_id: outbreakId,
        start_date: new Date(),
        status: 'Investigation',
        description: `Outbreak detected in ${regionKey} with ${group.symptoms.length} symptoms exceeding thresholds`,
        symptoms: group.symptoms,
        region: regionKey
      });
      
      await outbreak.save();
      outbreaks.push(outbreak);
    }
  }
  
  return outbreaks;
}

/**
 * Detect symptom clusters
 */
async function detectClusters(reports, startDate, endDate) {
  const clusters = [];
  
  // Group reports by date and clinic
  const reportGroups = {};
  
  reports.forEach(report => {
    const dateKey = new Date(report.report_date).toISOString().split('T')[0];
    const groupKey = `${dateKey}_${report.clinic_id}`;
    
    if (!reportGroups[groupKey]) {
      reportGroups[groupKey] = {
        date: dateKey,
        clinic_id: report.clinic_id,
        symptoms: new Set(),
        patientCount: 0
      };
    }
    
    report.symptoms.forEach(symptom => {
      reportGroups[groupKey].symptoms.add(symptom.symptom_id);
    });
    
    reportGroups[groupKey].patientCount++;
  });
  
  // Find clusters (groups with multiple symptoms and multiple patients)
  for (const [groupKey, group] of Object.entries(reportGroups)) {
    if (group.symptoms.size >= 3 && group.patientCount >= 2) {
      clusters.push({
        cluster_id: `CLUSTER_${groupKey}`,
        date: group.date,
        clinic_id: group.clinic_id,
        symptoms: Array.from(group.symptoms),
        patientCount: group.patientCount,
        severity: group.symptoms.size >= 5 ? 'High' : 'Medium'
      });
    }
  }
  
  return clusters;
}

/**
 * Get outbreak statistics
 */
export async function getOutbreakStats(region = null) {
  const query = region ? { region } : {};
  
  const stats = await Outbreak.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgSymptoms: { $avg: { $size: '$symptoms' } }
      }
    }
  ]);
  
  const totalOutbreaks = await Outbreak.countDocuments(query);
  const activeOutbreaks = await Outbreak.countDocuments({ ...query, status: 'Active' });
  
  return {
    totalOutbreaks,
    activeOutbreaks,
    byStatus: stats,
    lastAnalysis: new Date()
  };
}

/**
 * Get recent outbreaks
 */
export async function getRecentOutbreaks(limit = 10, region = null) {
  const query = region ? { region } : {};
  
  const outbreaks = await Outbreak.find(query)
    .sort({ start_date: -1 })
    .limit(limit);
  
  // Populate symptom details
  const populatedOutbreaks = await Promise.all(
    outbreaks.map(async (outbreak) => {
      const symptomDetails = await Symptom.find({
        symptom_id: { $in: outbreak.symptoms.map(s => s.symptom_id) }
      });
      
      const populatedSymptoms = outbreak.symptoms.map(symptom => {
        const detail = symptomDetails.find(s => s.symptom_id === symptom.symptom_id);
        return {
          ...symptom.toObject(),
          name: detail ? detail.name : 'Unknown',
          severity: detail ? detail.severity : 'Medium'
        };
      });
      
      return {
        ...outbreak.toObject(),
        symptoms: populatedSymptoms
      };
    })
  );
  
  return populatedOutbreaks;
}
