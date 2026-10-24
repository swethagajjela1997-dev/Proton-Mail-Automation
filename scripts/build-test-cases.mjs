/**
 * Builds test-cases/ProtonMail_TestCases.xlsx and test-cases/ProtonMail_TestCases.md
 * from the single source of truth test-cases/testCases.source.json.
 *
 * Usage: npm run testcases:build
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = JSON.parse(fs.readFileSync(path.join(root, 'test-cases', 'testCases.source.json'), 'utf8'));
const cases = source.testCases;

const COLUMNS = [
  { header: 'ID', key: 'id', width: 12 },
  { header: 'Feature', key: 'feature', width: 22 },
  { header: 'Scenario', key: 'scenario', width: 48 },
  { header: 'Priority', key: 'priority', width: 9 },
  { header: 'Preconditions', key: 'preconditions', width: 28 },
  { header: 'Test Data', key: 'testData', width: 32 },
  { header: 'Steps', key: 'steps', width: 55 },
  { header: 'Expected Result', key: 'expected', width: 55 },
  { header: 'Automation Classification', key: 'classification', width: 22 },
  { header: 'Reason', key: 'reason', width: 55 },
  { header: 'Automated Test', key: 'automatedTest', width: 38 },
];

const numberedSteps = (steps) => steps.map((step, index) => `${index + 1}. ${step}`).join('\n');

function summaryRows() {
  const by = (key) =>
    Object.entries(cases.reduce((acc, item) => ({ ...acc, [item[key]]: (acc[item[key]] ?? 0) + 1 }), {})).sort();
  return { byClassification: by('classification'), byPriority: by('priority'), byFeature: by('feature') };
}

async function buildWorkbook() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Proton Mail Automation Assessment';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Test Cases', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = COLUMNS;
  for (const item of cases) sheet.addRow({ ...item, steps: numberedSteps(item.steps) });

  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2A44' } };
  sheet.eachRow((row) => {
    row.alignment = { vertical: 'top', wrapText: true };
    row.eachCell((cell) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
  });
  const fills = { Automate: 'FFE2F0D9', 'Manual / Exploratory': 'FFFFF2CC', 'Not worth automating': 'FFF2F2F2' };
  sheet.eachRow((row, index) => {
    if (index === 1) return;
    const fill = fills[row.getCell('classification').value];
    if (fill) row.getCell('classification').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
  });
  sheet.autoFilter = { from: 'A1', to: 'K1' };

  const summary = workbook.addWorksheet('Summary');
  summary.columns = [{ width: 30 }, { width: 10 }];
  const { byClassification, byPriority, byFeature } = summaryRows();
  summary.addRow(['Total test cases', cases.length]).font = { bold: true };
  summary.addRow(['Automated (implemented)', cases.filter((item) => item.automatedTest !== '-').length]).font = { bold: true };
  for (const [title, rows] of [['By classification', byClassification], ['By priority', byPriority], ['By feature', byFeature]]) {
    summary.addRow([]);
    summary.addRow([title]).font = { bold: true };
    for (const row of rows) summary.addRow(row);
  }

  const preconditions = workbook.addWorksheet('Preconditions');
  preconditions.columns = [{ header: 'Key', width: 8 }, { header: 'Meaning', width: 80 }];
  for (const [key, value] of Object.entries(source.commonPreconditions)) preconditions.addRow([key, value]);

  await workbook.xlsx.writeFile(path.join(root, 'test-cases', 'ProtonMail_TestCases.xlsx'));
}

function buildMarkdown() {
  const escape = (text) => String(text).replace(/\|/g, '\\|').replace(/\n/g, '<br>');
  const { byClassification, byPriority } = summaryRows();
  const implemented = cases.filter((item) => item.automatedTest !== '-');
  const lines = [
    '# Proton Mail - Test Cases',
    '',
    '> Generated from `test-cases/testCases.source.json` by `npm run testcases:build`. Edit the JSON, not this file.',
    '',
    `**${cases.length} test cases designed**, **${implemented.length} automated** (implemented in \`tests/\`).`,
    '',
    '| Classification | Count |',
    '|---|---|',
    ...byClassification.map(([key, count]) => `| ${key} | ${count} |`),
    '',
    '| Priority | Count |',
    '|---|---|',
    ...byPriority.map(([key, count]) => `| ${key} | ${count} |`),
    '',
    '**Common preconditions:** ' + Object.entries(source.commonPreconditions).map(([key, value]) => `\`${key}\` = ${value}`).join('; '),
    '',
    '## Overview',
    '',
    '| ID | Feature | Scenario | Priority | Classification | Automated test |',
    '|---|---|---|---|---|---|',
    ...cases.map((item) => `| ${item.id} | ${item.feature} | ${escape(item.scenario)} | ${item.priority} | ${item.classification} | ${item.automatedTest === '-' ? '-' : `\`${item.automatedTest}\``} |`),
    '',
    '## Detailed test cases',
    '',
  ];
  for (const item of cases) {
    lines.push(
      `### ${item.id} - ${item.scenario}`,
      '',
      '| Field | Value |',
      '|---|---|',
      `| Feature | ${item.feature} |`,
      `| Priority | ${item.priority} |`,
      `| Preconditions | ${escape(item.preconditions)} |`,
      `| Test data | ${escape(item.testData)} |`,
      `| Steps | ${escape(numberedSteps(item.steps))} |`,
      `| Expected result | ${escape(item.expected)} |`,
      `| Automation classification | ${item.classification} |`,
      `| Reason | ${escape(item.reason)} |`,
      `| Automated test | ${item.automatedTest} |`,
      '',
    );
  }
  fs.writeFileSync(path.join(root, 'test-cases', 'ProtonMail_TestCases.md'), lines.join('\n'));
}

await buildWorkbook();
buildMarkdown();
console.log(`Built ${cases.length} test cases -> test-cases/ProtonMail_TestCases.{xlsx,md}`);
