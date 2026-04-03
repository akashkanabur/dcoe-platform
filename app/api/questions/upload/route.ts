import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import { v4 as uuid } from 'uuid'
import * as XLSX from 'xlsx'
// @ts-ignore
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

function parseTextToQuestions(text: string, testId: string) {
  // Split the raw text by looking for "Q:"
  const blocks = text.split(/(?=Q:)/i).filter(b => b.trim().toUpperCase().startsWith('Q:'))
  const questions: any[] = []
  let orderCount = 0

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) continue

    let qText = ''
    let options: string[] = []
    let ans = ''
    let marks = 1

    for (let line of lines) {
      if (line.toUpperCase().startsWith('Q:')) {
        qText = line.substring(2).trim()
      } else if (/^[A-Z]\)/i.test(line)) {
        options.push(line.substring(2).trim())
      } else if (line.toUpperCase().startsWith('ANS:')) {
        ans = line.substring(4).trim().toLowerCase()
      } else if (line.toUpperCase().startsWith('MARKS:')) {
        marks = parseInt(line.substring(6).trim(), 10) || 1
      }
    }

    if (!qText || !ans) continue // Minimum required to be a valid question

    const isMcq = options.length > 0
    questions.push({
      id: uuid(),
      test_id: testId,
      type: isMcq ? 'mcq' : 'short-answer',
      text: qText,
      options: options.map((o, i) => ({ id: String.fromCharCode(97 + i), text: o })),
      correct_answer: ans,
      marks: marks,
      order: orderCount++,
      created_at: new Date().toISOString()
    })
  }

  return questions
}

function parseExcelToQuestions(buffer: Buffer, testId: string) {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet)
  
  const questions: any[] = []
  let orderCount = 0

  for (const row of rows) {
    // Dynamically look for common column names (case-insensitive)
    const getCol = (names: string[]) => Object.keys(row).find(k => names.includes(k.toLowerCase().trim()))
    
    const qKey = getCol(['q', 'question', 'text'])
    const ansKey = getCol(['ans', 'answer', 'correct answer', 'correct'])
    const markKey = getCol(['mark', 'marks', 'points'])

    if (!qKey || !ansKey) continue // Need at least question and answer

    const qText = String(row[qKey] || '').trim()
    if (!qText) continue

    // Find option columns dynamically: Option A, Option B, etc.
    const optKeys = Object.keys(row)
      .filter(k => /^opt/i.test(k.trim()) || /^[a-d]$/i.test(k.trim()))
      .sort()

    const options = optKeys.map(k => String((row as any)[k]))

    const isMcq = options.length > 0
    let correctAns = String(row[ansKey] || '').trim().toLowerCase()
    
    questions.push({
      id: uuid(),
      test_id: testId,
      type: isMcq ? 'mcq' : 'short-answer',
      text: qText,
      options: options.map((o, i) => ({ id: String.fromCharCode(97 + i), text: o })),
      correct_answer: correctAns,
      marks: parseInt(String(row[markKey]), 10) || 1,
      order: orderCount++,
      created_at: new Date().toISOString()
    })
  }

  return questions
}

export async function POST(req: NextRequest) {
  return withAuth(async (req, user) => {
    if (user.role !== 'trainer' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
      const formData = await req.formData()
      const testId = formData.get('testId') as string
      const file = formData.get('file') as File

      if (!testId || !file) {
        return NextResponse.json({ error: 'Missing testId or file' }, { status: 400 })
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const name = file.name.toLowerCase()
      
      let parsedQuestions: any[] = []

      if (name.endsWith('.xlsx') || name.endsWith('.csv') || name.endsWith('.xls')) {
        parsedQuestions = parseExcelToQuestions(buffer, testId)
      } else if (name.endsWith('.pdf')) {
        const rawPdf = await pdfParse(buffer)
        parsedQuestions = parseTextToQuestions(rawPdf.text, testId)
      } else if (name.endsWith('.docx')) {
        const rawDocx = await mammoth.extractRawText({ buffer })
        parsedQuestions = parseTextToQuestions(rawDocx.value, testId)
      } else {
        return NextResponse.json({ error: 'Unsupported file type. Please upload .xlsx, .pdf, or .docx' }, { status: 400 })
      }

      if (parsedQuestions.length === 0) {
        return NextResponse.json({ error: 'No valid questions found in document. Please verify the template format.' }, { status: 400 })
      }

      // Bulk Insert into Supabase
      const supabase = getSupabaseAdmin()
      const { error } = await supabase.from('questions').insert(parsedQuestions)
      
      if (error) {
        console.error('Supabase Bulk Insert Error:', error)
        return NextResponse.json({ error: 'Database error pushing questions' }, { status: 500 })
      }

      // Update test total marks
      const { data: qs } = await supabase.from('questions').select('marks').eq('test_id', testId)
      const totalMarks = (qs || []).reduce((sum, q) => sum + (q.marks || 0), 0)
      await supabase.from('tests').update({ total_marks: totalMarks }).eq('id', testId)

      return NextResponse.json({ 
        success: true, 
        message: `Successfully imported ${parsedQuestions.length} questions.` 
      })

    } catch (err: any) {
      console.error('Upload Parsing Error:', err)
      return NextResponse.json({ error: err.message || 'File parsing failed' }, { status: 500 })
    }
  })(req)
}
