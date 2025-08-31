#!/usr/bin/env node

/**
 * QuizMentor Locust CSV Summary Generator
 *
 * Processes Locust CSV output files and generates a consolidated summary
 * with key metrics, trends, and recommendations.
 *
 * Usage: node export_locust_csv_summary.js [options]
 *   -i, --input <dir>    Input directory containing Locust CSV files (default: ./artifacts)
 *   -o, --output <file>  Output summary CSV file (default: ./summary_report.csv)
 *   -f, --format <type>  Output format: csv, json, html (default: csv)
 *   -t, --threshold      Apply SLO thresholds and fail if exceeded
 *   -v, --verbose        Enable verbose logging
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// Command line argument parsing
const args = process.argv.slice(2);
const options = {
  inputDir: './artifacts',
  outputFile: './summary_report.csv',
  format: 'csv',
  checkThresholds: false,
  verbose: false,
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '-i':
    case '--input':
      options.inputDir = args[++i];
      break;
    case '-o':
    case '--output':
      options.outputFile = args[++i];
      break;
    case '-f':
    case '--format':
      options.format = args[++i];
      break;
    case '-t':
    case '--threshold':
      options.checkThresholds = true;
      break;
    case '-v':
    case '--verbose':
      options.verbose = true;
      break;
    case '-h':
    case '--help':
      showHelp();
      process.exit(0);
  }
}

// SLO Thresholds (configurable via environment variables)
const thresholds = {
  maxErrorRate: parseFloat(process.env.QM_THRESHOLD_ERROR_RATE || '0.01'), // 1%
  maxP95Latency: parseInt(process.env.QM_THRESHOLD_P95 || '1000'), // 1000ms
  maxP99Latency: parseInt(process.env.QM_THRESHOLD_P99 || '2000'), // 2000ms
  minThroughput: parseFloat(process.env.QM_THRESHOLD_MIN_RPS || '10'), // 10 RPS
};

function showHelp() {
  console.log(`
QuizMentor Locust CSV Summary Generator

Usage: node export_locust_csv_summary.js [options]

Options:
  -i, --input <dir>     Input directory containing Locust CSV files (default: ./artifacts)
  -o, --output <file>   Output summary CSV file (default: ./summary_report.csv)
  -f, --format <type>   Output format: csv, json, html (default: csv)
  -t, --threshold       Apply SLO thresholds and fail if exceeded
  -v, --verbose         Enable verbose logging
  -h, --help           Show this help message

Environment Variables:
  QM_THRESHOLD_ERROR_RATE   Maximum error rate (default: 0.01)
  QM_THRESHOLD_P95          Maximum P95 latency in ms (default: 1000)
  QM_THRESHOLD_P99          Maximum P99 latency in ms (default: 2000)
  QM_THRESHOLD_MIN_RPS      Minimum throughput in RPS (default: 10)
    `);
}

function log(message) {
  if (options.verbose) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
}

function readCSVFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parse(content, {
      columns: true,
      skip_empty_lines: true,
      cast: true,
      cast_date: false,
    });
  } catch (error) {
    log(`Error reading ${filePath}: ${error.message}`);
    return [];
  }
}

function processStatsFile(statsPath) {
  const stats = readCSVFile(statsPath);

  const summary = {
    totalRequests: 0,
    totalFailures: 0,
    endpoints: {},
    overallMetrics: {
      avgResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      medianResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      rps: 0,
    },
  };

  stats.forEach((row) => {
    if (row.Type === 'Request' && row.Name !== 'Total') {
      const endpoint = row.Name;
      const requests = parseInt(row['Request Count'] || row['# Requests'] || 0);
      const failures = parseInt(row['Failure Count'] || row['# Failures'] || 0);
      const median = parseFloat(row['50%'] || row['Median Response Time'] || 0);
      const p95 = parseFloat(row['95%'] || 0);
      const p99 = parseFloat(row['99%'] || 0);
      const avg = parseFloat(row['Average Response Time'] || row['Average'] || 0);
      const min = parseFloat(row['Min Response Time'] || row['Min'] || 0);
      const max = parseFloat(row['Max Response Time'] || row['Max'] || 0);
      const rps = parseFloat(row['Current RPS'] || row['Requests/s'] || 0);

      summary.endpoints[endpoint] = {
        requests,
        failures,
        errorRate: requests > 0 ? failures / requests : 0,
        median,
        p95,
        p99,
        avg,
        min,
        max,
        rps,
      };

      summary.totalRequests += requests;
      summary.totalFailures += failures;
    } else if (row.Name === 'Total' || row.Name === 'Aggregated') {
      // Overall metrics
      summary.overallMetrics.avgResponseTime = parseFloat(
        row['Average Response Time'] || row['Average'] || 0,
      );
      summary.overallMetrics.minResponseTime = parseFloat(
        row['Min Response Time'] || row['Min'] || 0,
      );
      summary.overallMetrics.maxResponseTime = parseFloat(
        row['Max Response Time'] || row['Max'] || 0,
      );
      summary.overallMetrics.medianResponseTime = parseFloat(
        row['50%'] || row['Median Response Time'] || 0,
      );
      summary.overallMetrics.p95ResponseTime = parseFloat(row['95%'] || 0);
      summary.overallMetrics.p99ResponseTime = parseFloat(row['99%'] || 0);
      summary.overallMetrics.rps = parseFloat(row['Current RPS'] || row['Requests/s'] || 0);
    }
  });

  summary.overallErrorRate =
    summary.totalRequests > 0 ? summary.totalFailures / summary.totalRequests : 0;

  return summary;
}

function processHistoryFile(historyPath) {
  const history = readCSVFile(historyPath);

  if (history.length === 0) {
    return null;
  }

  // Calculate trends
  const timestamps = history.map((row) => parseFloat(row.Timestamp || 0));
  const userCounts = history.map((row) => parseInt(row['User Count'] || 0));
  const rpsValues = history.map((row) => parseFloat(row['Requests/s'] || 0));
  const failureRates = history.map(
    (row) => parseFloat(row['Failures/s'] || 0) / parseFloat(row['Requests/s'] || 1),
  );

  return {
    duration: Math.max(...timestamps) - Math.min(...timestamps),
    maxUsers: Math.max(...userCounts),
    avgRPS: rpsValues.reduce((a, b) => a + b, 0) / rpsValues.length,
    maxRPS: Math.max(...rpsValues),
    avgFailureRate: failureRates.reduce((a, b) => a + b, 0) / failureRates.length,
  };
}

function generateSummary() {
  log(`Processing Locust CSV files from: ${options.inputDir}`);

  // Find all relevant CSV files
  const files = fs.readdirSync(options.inputDir).filter((f) => f.endsWith('.csv'));

  const statsFile = files.find((f) => f.includes('_stats.csv'));
  const historyFile = files.find((f) => f.includes('_stats_history.csv'));
  const failuresFile = files.find((f) => f.includes('_failures.csv'));
  const exceptionsFile = files.find((f) => f.includes('_exceptions.csv'));

  if (!statsFile) {
    console.error('Error: No stats file found in the input directory');
    process.exit(1);
  }

  // Process main stats
  const summary = processStatsFile(path.join(options.inputDir, statsFile));

  // Process history if available
  if (historyFile) {
    const trends = processHistoryFile(path.join(options.inputDir, historyFile));
    if (trends) {
      summary.trends = trends;
    }
  }

  // Process failures if available
  if (failuresFile) {
    const failures = readCSVFile(path.join(options.inputDir, failuresFile));
    summary.failureDetails = failures.map((f) => ({
      method: f.Method,
      name: f.Name,
      error: f.Error,
      occurrences: parseInt(f.Occurrences || 0),
    }));
  }

  // Add test metadata
  summary.metadata = {
    timestamp: new Date().toISOString(),
    inputDir: options.inputDir,
    filesProcessed: [statsFile, historyFile, failuresFile, exceptionsFile].filter(Boolean),
  };

  // Check thresholds if requested
  if (options.checkThresholds) {
    const violations = checkThresholdViolations(summary);
    if (violations.length > 0) {
      summary.thresholdViolations = violations;
      summary.passed = false;
    } else {
      summary.passed = true;
    }
  }

  return summary;
}

function checkThresholdViolations(summary) {
  const violations = [];

  if (summary.overallErrorRate > thresholds.maxErrorRate) {
    violations.push({
      metric: 'Error Rate',
      actual: `${(summary.overallErrorRate * 100).toFixed(2)}%`,
      threshold: `${(thresholds.maxErrorRate * 100).toFixed(2)}%`,
      status: 'FAILED',
    });
  }

  if (summary.overallMetrics.p95ResponseTime > thresholds.maxP95Latency) {
    violations.push({
      metric: 'P95 Latency',
      actual: `${summary.overallMetrics.p95ResponseTime.toFixed(2)}ms`,
      threshold: `${thresholds.maxP95Latency}ms`,
      status: 'FAILED',
    });
  }

  if (summary.overallMetrics.p99ResponseTime > thresholds.maxP99Latency) {
    violations.push({
      metric: 'P99 Latency',
      actual: `${summary.overallMetrics.p99ResponseTime.toFixed(2)}ms`,
      threshold: `${thresholds.maxP99Latency}ms`,
      status: 'FAILED',
    });
  }

  if (summary.overallMetrics.rps < thresholds.minThroughput) {
    violations.push({
      metric: 'Throughput',
      actual: `${summary.overallMetrics.rps.toFixed(2)} RPS`,
      threshold: `${thresholds.minThroughput} RPS`,
      status: 'FAILED',
    });
  }

  return violations;
}

function outputCSV(summary) {
  const rows = [];

  // Overall metrics
  rows.push(['Metric', 'Value']);
  rows.push(['Total Requests', summary.totalRequests]);
  rows.push(['Total Failures', summary.totalFailures]);
  rows.push(['Error Rate', `${(summary.overallErrorRate * 100).toFixed(2)}%`]);
  rows.push(['Average Response Time', `${summary.overallMetrics.avgResponseTime.toFixed(2)}ms`]);
  rows.push(['Median Response Time', `${summary.overallMetrics.medianResponseTime.toFixed(2)}ms`]);
  rows.push(['P95 Response Time', `${summary.overallMetrics.p95ResponseTime.toFixed(2)}ms`]);
  rows.push(['P99 Response Time', `${summary.overallMetrics.p99ResponseTime.toFixed(2)}ms`]);
  rows.push(['Min Response Time', `${summary.overallMetrics.minResponseTime.toFixed(2)}ms`]);
  rows.push(['Max Response Time', `${summary.overallMetrics.maxResponseTime.toFixed(2)}ms`]);
  rows.push(['Throughput', `${summary.overallMetrics.rps.toFixed(2)} RPS`]);

  if (summary.trends) {
    rows.push(['']);
    rows.push(['Trend Metrics', '']);
    rows.push(['Test Duration', `${(summary.trends.duration / 60).toFixed(2)} minutes`]);
    rows.push(['Max Users', summary.trends.maxUsers]);
    rows.push(['Average RPS', summary.trends.avgRPS.toFixed(2)]);
    rows.push(['Max RPS', summary.trends.maxRPS.toFixed(2)]);
  }

  // Endpoint breakdown
  rows.push(['']);
  rows.push([
    'Endpoint',
    'Requests',
    'Failures',
    'Error Rate',
    'Avg',
    'Median',
    'P95',
    'P99',
    'RPS',
  ]);

  Object.entries(summary.endpoints).forEach(([endpoint, metrics]) => {
    rows.push([
      endpoint,
      metrics.requests,
      metrics.failures,
      `${(metrics.errorRate * 100).toFixed(2)}%`,
      `${metrics.avg.toFixed(2)}ms`,
      `${metrics.median.toFixed(2)}ms`,
      `${metrics.p95.toFixed(2)}ms`,
      `${metrics.p99.toFixed(2)}ms`,
      metrics.rps.toFixed(2),
    ]);
  });

  // Threshold violations if checked
  if (summary.thresholdViolations && summary.thresholdViolations.length > 0) {
    rows.push(['']);
    rows.push(['Threshold Violations', '']);
    rows.push(['Metric', 'Actual', 'Threshold', 'Status']);
    summary.thresholdViolations.forEach((v) => {
      rows.push([v.metric, v.actual, v.threshold, v.status]);
    });
  }

  const csv = stringify(rows);
  fs.writeFileSync(options.outputFile, csv);
}

function outputJSON(summary) {
  fs.writeFileSync(options.outputFile, JSON.stringify(summary, null, 2));
}

function outputHTML(summary) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>QuizMentor Load Test Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .metric-good { color: green; }
        .metric-bad { color: red; }
        .summary-box { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>QuizMentor Load Test Summary</h1>
    <div class="summary-box">
        <h2>Overall Metrics</h2>
        <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Total Requests</td><td>${summary.totalRequests}</td></tr>
            <tr><td>Total Failures</td><td>${summary.totalFailures}</td></tr>
            <tr><td>Error Rate</td><td class="${summary.overallErrorRate > 0.01 ? 'metric-bad' : 'metric-good'}">${(summary.overallErrorRate * 100).toFixed(2)}%</td></tr>
            <tr><td>Average Response Time</td><td>${summary.overallMetrics.avgResponseTime.toFixed(2)}ms</td></tr>
            <tr><td>P95 Response Time</td><td class="${summary.overallMetrics.p95ResponseTime > 1000 ? 'metric-bad' : 'metric-good'}">${summary.overallMetrics.p95ResponseTime.toFixed(2)}ms</td></tr>
            <tr><td>P99 Response Time</td><td class="${summary.overallMetrics.p99ResponseTime > 2000 ? 'metric-bad' : 'metric-good'}">${summary.overallMetrics.p99ResponseTime.toFixed(2)}ms</td></tr>
            <tr><td>Throughput</td><td>${summary.overallMetrics.rps.toFixed(2)} RPS</td></tr>
        </table>
    </div>
    
    <div class="summary-box">
        <h2>Endpoint Performance</h2>
        <table>
            <tr>
                <th>Endpoint</th>
                <th>Requests</th>
                <th>Failures</th>
                <th>Error Rate</th>
                <th>Avg</th>
                <th>P95</th>
                <th>P99</th>
                <th>RPS</th>
            </tr>
            ${Object.entries(summary.endpoints)
              .map(
                ([endpoint, m]) => `
            <tr>
                <td>${endpoint}</td>
                <td>${m.requests}</td>
                <td>${m.failures}</td>
                <td class="${m.errorRate > 0.01 ? 'metric-bad' : 'metric-good'}">${(m.errorRate * 100).toFixed(2)}%</td>
                <td>${m.avg.toFixed(2)}ms</td>
                <td>${m.p95.toFixed(2)}ms</td>
                <td>${m.p99.toFixed(2)}ms</td>
                <td>${m.rps.toFixed(2)}</td>
            </tr>
            `,
              )
              .join('')}
        </table>
    </div>
    
    ${
      summary.thresholdViolations && summary.thresholdViolations.length > 0
        ? `
    <div class="summary-box">
        <h2 style="color: red;">⚠️ Threshold Violations</h2>
        <table>
            <tr><th>Metric</th><th>Actual</th><th>Threshold</th><th>Status</th></tr>
            ${summary.thresholdViolations
              .map(
                (v) => `
            <tr>
                <td>${v.metric}</td>
                <td>${v.actual}</td>
                <td>${v.threshold}</td>
                <td class="metric-bad">${v.status}</td>
            </tr>
            `,
              )
              .join('')}
        </table>
    </div>
    `
        : ''
    }
    
    <div class="summary-box">
        <p><small>Generated: ${summary.metadata.timestamp}</small></p>
    </div>
</body>
</html>
    `;

  fs.writeFileSync(options.outputFile.replace('.csv', '.html'), html);
}

// Main execution
function main() {
  try {
    const summary = generateSummary();

    switch (options.format.toLowerCase()) {
      case 'json':
        outputJSON(summary);
        log(`JSON summary written to: ${options.outputFile}`);
        break;
      case 'html':
        outputHTML(summary);
        log(`HTML summary written to: ${options.outputFile.replace('.csv', '.html')}`);
        break;
      case 'csv':
      default:
        outputCSV(summary);
        log(`CSV summary written to: ${options.outputFile}`);
        break;
    }

    // Console output
    console.log('\n📊 Load Test Summary:');
    console.log(`   Total Requests: ${summary.totalRequests}`);
    console.log(`   Error Rate: ${(summary.overallErrorRate * 100).toFixed(2)}%`);
    console.log(`   P95 Latency: ${summary.overallMetrics.p95ResponseTime.toFixed(2)}ms`);
    console.log(`   P99 Latency: ${summary.overallMetrics.p99ResponseTime.toFixed(2)}ms`);
    console.log(`   Throughput: ${summary.overallMetrics.rps.toFixed(2)} RPS`);

    if (options.checkThresholds) {
      if (summary.passed) {
        console.log('\n✅ All thresholds passed!');
        process.exit(0);
      } else {
        console.log('\n❌ Threshold violations detected:');
        summary.thresholdViolations.forEach((v) => {
          console.log(`   - ${v.metric}: ${v.actual} (threshold: ${v.threshold})`);
        });
        process.exit(1);
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateSummary, checkThresholdViolations };
