import { Request, Response } from 'express'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const execAsync = promisify(exec)

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
}

interface UserInfo {
  name: string
  email: string
}

interface GeneratePdfRequest {
  processData: ProcessData
  userInfo: UserInfo
}

export async function generatePdfHandler(req: Request, res: Response) {
  try {
    const { processData, userInfo } = req.body as GeneratePdfRequest

    if (!processData || !userInfo) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const filename = `process-map-${uuidv4()}.pdf`
    const outputPath = path.join('/tmp', filename)

    const pythonScript = generatePythonScript(processData, outputPath)
    const scriptPath = path.join('/tmp', `generate-${uuidv4()}.py`)

    await fs.writeFile(scriptPath, pythonScript)
    await execAsync(`python3 ${scriptPath}`)

    const pdfBuffer = await fs.readFile(outputPath)

    // Clean up
    await fs.unlink(scriptPath)
    await fs.unlink(outputPath)

    const pdfBase64 = pdfBuffer.toString('base64')
    const pdfUrl = `data:application/pdf;base64,${pdfBase64}`

    return res.json({ pdfUrl, pdfBase64 })
  } catch (error) {
    console.error('PDF generation error:', error)
    return res.status(500).json({ error: 'Failed to generate PDF' })
  }
}

function generatePythonScript(processData: ProcessData, outputPath: string): string {
  const escape = (str: string) => str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')

  const stepsJson = JSON.stringify(processData.steps)
  const toolsJson = JSON.stringify(processData.tools)
  const painPointsJson = JSON.stringify(processData.painPoints)
  const decisionPointsJson = JSON.stringify(processData.decisionPoints)

  return `
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak
import json

process_name = '${escape(processData.processName)}'
business_name = '${escape(processData.businessName)}'
business_type = '${escape(processData.businessType)}'
team_size = '${escape(processData.teamSize)}'
process_owner = '${escape(processData.processOwner)}'
duration = '${escape(processData.duration)}'
steps = json.loads('${stepsJson.replace(/'/g, "\\'")}')
tools = json.loads('${toolsJson.replace(/'/g, "\\'")}')
pain_points = json.loads('${painPointsJson.replace(/'/g, "\\'")}')
decision_points = json.loads('${decisionPointsJson.replace(/'/g, "\\'")}')

doc = SimpleDocTemplate(
    '${outputPath}',
    pagesize=letter,
    rightMargin=0.75*inch,
    leftMargin=0.75*inch,
    topMargin=0.6*inch,
    bottomMargin=0.5*inch
)

styles = getSampleStyleSheet()

title_style = ParagraphStyle('CustomTitle', parent=styles['Title'], fontSize=24, spaceAfter=4, textColor=HexColor('#1e293b'))
subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=12, textColor=HexColor('#64748b'), spaceAfter=15)
heading_style = ParagraphStyle('CustomHeading', parent=styles['Heading1'], fontSize=14, spaceBefore=16, spaceAfter=8, textColor=HexColor('#1e293b'))
subheading_style = ParagraphStyle('SubHeading', parent=styles['Heading2'], fontSize=12, spaceBefore=10, spaceAfter=5, textColor=HexColor('#334155'))
body_style = ParagraphStyle('CustomBody', parent=styles['Normal'], fontSize=10, spaceAfter=6, leading=13)
step_title_style = ParagraphStyle('StepTitle', parent=styles['Normal'], fontSize=11, fontName='Helvetica-Bold', spaceAfter=3, textColor=HexColor('#1e293b'))
step_body_style = ParagraphStyle('StepBody', parent=styles['Normal'], fontSize=9, leftIndent=12, spaceAfter=3, leading=12)
footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=9, textColor=HexColor('#94a3b8'), alignment=1)

story = []

story.append(Paragraph(process_name, title_style))
story.append(Paragraph(business_name, subtitle_style))
story.append(HRFlowable(width="100%", thickness=1, color=HexColor('#e2e8f0'), spaceAfter=12))

story.append(Paragraph("Process Overview", heading_style))

overview_data = [
    ["Business Type", business_type],
    ["Process Owner", process_owner],
    ["Team Size", team_size],
    ["Total Duration", duration],
]

overview_table = Table(overview_data, colWidths=[1.6*inch, 4.5*inch])
overview_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
    ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('TEXTCOLOR', (0, 0), (0, -1), HexColor('#64748b')),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(overview_table)

story.append(Paragraph("Process Steps", heading_style))

for step in steps:
    story.append(Paragraph(f"{step['number']}. {step['title']}", step_title_style))
    story.append(Paragraph(f"<b>Who:</b> {step['actor']}", step_body_style))
    for detail in step['details']:
        story.append(Paragraph(f"• {detail}", step_body_style))
    story.append(Spacer(1, 4))

story.append(PageBreak())

story.append(Paragraph("Tools & Systems", heading_style))

if tools:
    tools_data = [["Tool", "Purpose"]] + [[t['name'], t['purpose']] for t in tools]
    tools_table = Table(tools_data, colWidths=[1.8*inch, 4.3*inch])
    tools_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#f1f5f9')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LINEBELOW', (0, 0), (-1, 0), 1, HexColor('#e2e8f0')),
    ]))
    story.append(tools_table)

if decision_points:
    story.append(Paragraph("Decision Points", heading_style))
    for dp in decision_points:
        story.append(Paragraph(f"<b>{dp['location']}:</b> {dp['condition']}", body_style))
        for path in dp['paths']:
            story.append(Paragraph(f"→ {path}", step_body_style))
        story.append(Spacer(1, 6))

if pain_points:
    story.append(Paragraph("Pain Points & Opportunities", heading_style))
    for i, pp in enumerate(pain_points, 1):
        story.append(Paragraph(f"<b>Pain Point {i}</b>", subheading_style))
        story.append(Paragraph(pp, body_style))

story.append(Spacer(1, 30))
story.append(HRFlowable(width="100%", thickness=1, color=HexColor('#e2e8f0')))
story.append(Spacer(1, 8))
story.append(Paragraph("Generated by UpLevel Automations Process Mapper", footer_style))
story.append(Paragraph("Questions about automating this process? Contact roy@uplevelautomations.com", footer_style))

doc.build(story)
print("PDF generated successfully!")
`
}
