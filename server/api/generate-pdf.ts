import { Request, Response } from 'express'
import { createRequire } from 'module'
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces'

// Use require for CJS module compatibility
// pdfmake exports the Printer class from pdfmake/js/Printer.default
const require = createRequire(import.meta.url)
const PdfPrinter = require('pdfmake/js/Printer').default

interface ProcessData {
  processName: string
  businessName: string
  businessType: string
  teamSize: string
  processOwner: string
  steps: Array<{
    number: number
    title: string
    actor: string
    details: string[]
  }>
  tools: Array<{ name: string; purpose: string }>
  painPoints: string[]
  duration: string
  decisionPoints: Array<{
    location: string
    condition: string
    paths: string[]
  }>
  automationOpportunities?: Array<{
    title: string
    observation: string
    solution: string
    impact: string
  }>
}

interface UserInfo {
  name: string
  email: string
}

interface GeneratePdfRequest {
  processData: ProcessData
  userInfo: UserInfo
}

// Define fonts for pdfmake
const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
}

export async function generatePdfHandler(req: Request, res: Response) {
  try {
    const { processData, userInfo } = req.body as GeneratePdfRequest

    if (!processData || !userInfo) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const printer = new PdfPrinter(fonts)

    // Build the document content
    const content: Content[] = []

    // Title
    content.push({
      text: processData.processName || 'Process Document',
      style: 'title',
      margin: [0, 0, 0, 4]
    })

    // Subtitle
    content.push({
      text: processData.businessName || '',
      style: 'subtitle',
      margin: [0, 0, 0, 15]
    })

    // Horizontal line
    content.push({
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e2e8f0' }],
      margin: [0, 0, 0, 15]
    })

    // Process Overview section
    content.push({
      text: 'Process Overview',
      style: 'heading',
      margin: [0, 0, 0, 10]
    })

    content.push({
      table: {
        widths: [120, '*'],
        body: [
          [{ text: 'Business Type', style: 'labelCell' }, { text: processData.businessType || 'N/A', style: 'valueCell' }],
          [{ text: 'Process Owner', style: 'labelCell' }, { text: processData.processOwner || 'N/A', style: 'valueCell' }],
          [{ text: 'Team Size', style: 'labelCell' }, { text: processData.teamSize || 'N/A', style: 'valueCell' }],
          [{ text: 'Total Duration', style: 'labelCell' }, { text: processData.duration || 'N/A', style: 'valueCell' }],
        ]
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 20]
    })

    // Process Steps section
    content.push({
      text: 'Process Steps',
      style: 'heading',
      margin: [0, 10, 0, 10]
    })

    if (processData.steps && processData.steps.length > 0) {
      processData.steps.forEach((step) => {
        content.push({
          text: `${step.number}. ${step.title}`,
          style: 'stepTitle',
          margin: [0, 8, 0, 3]
        })

        content.push({
          text: [{ text: 'Who: ', bold: true }, step.actor || 'N/A'],
          style: 'stepBody',
          margin: [12, 0, 0, 3]
        })

        if (step.details && step.details.length > 0) {
          step.details.forEach((detail) => {
            content.push({
              text: `• ${detail}`,
              style: 'stepBody',
              margin: [12, 0, 0, 2]
            })
          })
        }
      })
    }

    // Page break before Tools section
    content.push({ text: '', pageBreak: 'after' })

    // Tools & Systems section
    content.push({
      text: 'Tools & Systems',
      style: 'heading',
      margin: [0, 0, 0, 10]
    })

    if (processData.tools && processData.tools.length > 0) {
      const toolsBody = [
        [{ text: 'Tool', style: 'tableHeader' }, { text: 'Purpose', style: 'tableHeader' }]
      ]

      processData.tools.forEach((tool) => {
        toolsBody.push([
          { text: tool.name || '', style: 'tableCell' },
          { text: tool.purpose || '', style: 'tableCell' }
        ])
      })

      content.push({
        table: {
          headerRows: 1,
          widths: [130, '*'],
          body: toolsBody
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 1 ? 1 : 0),
          vLineWidth: () => 0,
          hLineColor: () => '#e2e8f0',
          fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f1f5f9' : null),
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
        margin: [0, 0, 0, 20]
      })
    } else {
      content.push({
        text: 'No tools specified',
        style: 'body',
        margin: [0, 0, 0, 20]
      })
    }

    // Decision Points section
    if (processData.decisionPoints && processData.decisionPoints.length > 0) {
      content.push({
        text: 'Decision Points',
        style: 'heading',
        margin: [0, 10, 0, 10]
      })

      processData.decisionPoints.forEach((dp) => {
        content.push({
          text: [{ text: `${dp.location}: `, bold: true }, dp.condition],
          style: 'body',
          margin: [0, 0, 0, 3]
        })

        if (dp.paths && dp.paths.length > 0) {
          dp.paths.forEach((path) => {
            content.push({
              text: `→ ${path}`,
              style: 'stepBody',
              margin: [12, 0, 0, 2]
            })
          })
        }

        content.push({ text: '', margin: [0, 0, 0, 6] })
      })
    }

    // Pain Points section
    if (processData.painPoints && processData.painPoints.length > 0) {
      content.push({
        text: 'Pain Points Identified',
        style: 'heading',
        margin: [0, 15, 0, 10]
      })

      processData.painPoints.forEach((pp, i) => {
        content.push({
          text: `${i + 1}. ${pp}`,
          style: 'body',
          margin: [0, 0, 0, 6]
        })
      })
    }

    // Automation Opportunities section
    if (processData.automationOpportunities && processData.automationOpportunities.length > 0) {
      // Page break before Automation Opportunities
      content.push({ text: '', pageBreak: 'after' })

      content.push({
        text: 'Automation Opportunities',
        style: 'heading',
        margin: [0, 0, 0, 6]
      })

      content.push({
        text: 'Based on your process, here are areas where automation could save time and reduce errors:',
        style: 'body',
        margin: [0, 0, 0, 15]
      })

      processData.automationOpportunities.forEach((opp, i) => {
        // Opportunity title with number
        content.push({
          text: `${i + 1}. ${opp.title}`,
          style: 'stepTitle',
          margin: [0, 10, 0, 6]
        })

        // Observation
        content.push({
          text: [{ text: 'What we noticed: ', bold: true, color: '#64748b' }, opp.observation],
          style: 'body',
          margin: [12, 0, 0, 4]
        })

        // Solution
        content.push({
          text: [{ text: 'Potential solution: ', bold: true, color: '#64748b' }, opp.solution],
          style: 'body',
          margin: [12, 0, 0, 4]
        })

        // Impact
        content.push({
          text: [{ text: 'Estimated impact: ', bold: true, color: '#64748b' }, opp.impact],
          style: 'body',
          margin: [12, 0, 0, 8]
        })
      })

      // CTA after opportunities
      content.push({
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e2e8f0' }],
        margin: [0, 20, 0, 15]
      })

      content.push({
        text: 'Want to explore these opportunities?',
        style: 'subheading',
        alignment: 'center',
        margin: [0, 0, 0, 6]
      })

      content.push({
        text: 'Book a free strategy call to discuss how automation could work for your business.',
        style: 'body',
        alignment: 'center',
        margin: [0, 0, 0, 8]
      })

      content.push({
        text: 'cal.com/roy-banwell/ai-strategy-call',
        style: 'body',
        color: '#2563eb',
        alignment: 'center',
        margin: [0, 0, 0, 15]
      })
    }

    // Footer
    content.push({
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e2e8f0' }],
      margin: [0, 30, 0, 8]
    })

    content.push({
      text: 'Generated by UpLevel Automations Process Mapper',
      style: 'footer',
      alignment: 'center'
    })

    content.push({
      text: 'Questions about automating this process? Contact roy@uplevelautomations.com',
      style: 'footer',
      alignment: 'center'
    })

    const docDefinition: TDocumentDefinitions = {
      content,
      defaultStyle: {
        font: 'Helvetica'
      },
      styles: {
        title: {
          fontSize: 24,
          bold: true,
          color: '#1e293b'
        },
        subtitle: {
          fontSize: 12,
          color: '#64748b'
        },
        heading: {
          fontSize: 14,
          bold: true,
          color: '#1e293b'
        },
        subheading: {
          fontSize: 12,
          bold: true,
          color: '#334155'
        },
        body: {
          fontSize: 10,
          color: '#334155',
          lineHeight: 1.3
        },
        stepTitle: {
          fontSize: 11,
          bold: true,
          color: '#1e293b'
        },
        stepBody: {
          fontSize: 9,
          color: '#475569',
          lineHeight: 1.2
        },
        labelCell: {
          fontSize: 10,
          bold: true,
          color: '#64748b'
        },
        valueCell: {
          fontSize: 10,
          color: '#334155'
        },
        tableHeader: {
          fontSize: 9,
          bold: true,
          color: '#1e293b'
        },
        tableCell: {
          fontSize: 9,
          color: '#475569'
        },
        footer: {
          fontSize: 9,
          color: '#94a3b8'
        }
      },
      pageSize: 'LETTER',
      pageMargins: [54, 43, 54, 36] // 0.75in sides, 0.6in top, 0.5in bottom
    }

    // createPdfKitDocument returns a Promise in newer versions of pdfmake
    const pdfDoc = await printer.createPdfKitDocument(docDefinition)

    // Collect PDF chunks
    const chunks: Buffer[] = []

    pdfDoc.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })

    pdfDoc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks)
      const pdfBase64 = pdfBuffer.toString('base64')
      const pdfUrl = `data:application/pdf;base64,${pdfBase64}`

      return res.json({ pdfUrl, pdfBase64 })
    })

    pdfDoc.on('error', (err: Error) => {
      console.error('PDF stream error:', err)
      return res.status(500).json({ error: 'Failed to generate PDF' })
    })

    pdfDoc.end()
  } catch (error) {
    console.error('PDF generation error:', error)
    return res.status(500).json({ error: 'Failed to generate PDF' })
  }
}
