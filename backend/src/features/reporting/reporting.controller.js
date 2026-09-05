'use strict';

const reportingService = require('./reporting.service');

function generatePDFReport(report) {
  const overview = report.overview || {};
  const analytics = report.analytics || {};
  const dateStr = new Date().toLocaleDateString('en-IN');

  const textLines = [
    'DEALFLOW360 EXECUTIVE ANALYTICS REPORT',
    `Report Generated Date: ${dateStr}`,
    '----------------------------------------------------------------',
    'EXECUTIVE SUMMARY & PIPELINE METRICS:',
    `  - Total Quotations Issued: ${overview.quotationsCount || 0}`,
    `  - Total Pipeline Value: INR ${Number(overview.pipelineValue || 0).toLocaleString('en-IN')}`,
    `  - Total Commercial Invoices: ${overview.invoicesCount || 0}`,
    `  - Total Amount Invoiced: INR ${Number(overview.totalInvoiced || 0).toLocaleString('en-IN')}`,
    `  - Total Payments Collected: INR ${Number(overview.totalCollected || 0).toLocaleString('en-IN')}`,
    `  - Outstanding Accounts Receivable: INR ${Number(overview.outstandingAR || 0).toLocaleString('en-IN')}`,
    '----------------------------------------------------------------',
    'DISCOUNT PERFORMANCE & AVERAGES:',
    `  - Average Discount Value per Quote: INR ${Number(analytics.avgDiscountValue || 0).toLocaleString('en-IN')}`,
    `  - Average Invoice Amount: INR ${Number(analytics.avgInvoiceValue || 0).toLocaleString('en-IN')}`,
    '----------------------------------------------------------------',
    'CONFIDENTIAL - FOR INTERNAL MANAGEMENT USE ONLY'
  ];

  let stream = `BT /F1 12 Tf 40 740 Td 18 TL\n`;
  textLines.forEach((line) => {
    const escaped = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    stream += `(${escaped}) ' \n`;
  });
  stream += `ET`;

  const streamLen = Buffer.byteLength(stream);

  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length ${streamLen} >>
stream
${stream}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000222 00000 n 
0000000311 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${420 + streamLen}
%%EOF`;

  return Buffer.from(pdfString, 'utf-8');
}

async function getSummaryReport(req, res, next) {
  try {
    const { startDate, endDate, category, salesRepId } = req.query;
    const report = await reportingService.getSummaryReport({
      startDate,
      endDate,
      category,
      salesRepId,
    });
    res.json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

async function exportReport(req, res, next) {
  try {
    const { startDate, endDate, category, salesRepId, format } = req.query;
    const report = await reportingService.getSummaryReport({
      startDate,
      endDate,
      category,
      salesRepId,
    });

    const isPdf = format && format.toUpperCase() === 'PDF';
    const filenameDate = new Date().toISOString().split('T')[0];

    if (isPdf) {
      const pdfBuffer = generatePDFReport(report);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="dealflow360_executive_report_${filenameDate}.pdf"`);
      return res.send(pdfBuffer);
    }

    // CSV / Excel export
    const rows = [
      ['Metric', 'Value'],
      ['Total Quotations', report.overview.quotationsCount],
      ['Pipeline Value (INR)', report.overview.pipelineValue],
      ['Total Invoices', report.overview.invoicesCount],
      ['Total Invoiced (INR)', report.overview.totalInvoiced],
      ['Total Collected (INR)', report.overview.totalCollected],
      ['Outstanding AR (INR)', report.overview.outstandingAR],
      ['Avg Discount Value (INR)', report.analytics.avgDiscountValue],
      ['Avg Invoice Value (INR)', report.analytics.avgInvoiceValue],
    ];

    const csvContent = rows.map(r => r.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="dealflow360_executive_report_${filenameDate}.csv"`);
    return res.send(csvContent);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSummaryReport,
  exportReport,
};
