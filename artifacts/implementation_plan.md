# Bulk Question Upload via Excel, PDF, and Word

This plan details the implementation for allowing admins to upload test questions in bulk using `.xlsx` (Excel), `.pdf` (PDF), and `.docx` (Word) files within the Exam Manager module.

> [!IMPORTANT]
> Uploading questions from unstructured text formats like PDF and Word requires **strict adherence to a formatting template**, otherwise the parser will not be able to identify where one question ends and another begins. Please review the proposed format rules in the "Open Questions" section carefully.

## User Review Required

Because text in PDFs and Word documents lacks a native data structure (unlike Excel or Databases), the backend must rely on **Regular Expressions (Regex)** to extract Questions, Options, and Answers. You must approve the structure detailed in the "Open Questions" section below, and all future uploads by admins **must** match that approved structure.

## Proposed Changes

---

### Dependency Additions
We need specific libraries to parse these unique file formats on a Next.js Edge/Node server.

#### [NEW] `package.json`
- `xlsx`: For parsing Excel and CSV files.
- `pdf-parse`: For extracting raw text from PDF documents.
- `mammoth`: For extracting raw text from Word documents (`.docx`).

---

### UI Components

#### [MODIFY] [page.tsx](file:///c:/Users/akash/OneDrive/Desktop/dcoe-platform/app/admin/dashboard/exams/page.tsx)
- Add a new "Bulk Upload Questions" panel directly beneath the existing manual "Add Question" form.
- Include a file input (`<input type="file" />`) accepting `.xlsx, .xls, .pdf, .doc, .docx`.
- Provide a downloadable **Template File** link for admins to copy the exact expected format.
- Add a loading state with explicit progress indicating the server is parsing the documents and pushing them to the database.

---

### API Endpoints

#### [NEW] [route.ts](file:///c:/Users/akash/OneDrive/Desktop/dcoe-platform/app/api/questions/upload/route.ts)
A new API POST endpoint to securely receive the uploaded file as a `multipart/form-data` payload.
- It will detect the file extension (`.xlsx`, `.pdf`, `.docx`).
- For **Excel**: It routes the file buffer to `xlsx.read()` and expects columns like A=Question, B=OptionA, C=OptionB, D=OptionC, E=OptionD, F=Answer, G=Marks.
- For **PDF**: It runs `pdf-parse(buffer)` and maps the raw text against our Regex logic.
- For **Word**: It runs `mammoth.extractRawText({ buffer })` and maps the text against our Regex logic.
- After parsing, the endpoint dynamically constructs the Supabase insert array and commits all questions instantly in a batch insert.

## Open Questions

> [!CAUTION]
> **Format Standardization is Mandatory.** Please review the formats below and let me know if you agree with using them as the rigid templates for the uploads. Our parsing engine will strictly rely on these rules.

### 1. Excel Structure
Are you okay with using this strict column structure for Excel files?
| Row 1 Headers | Question | Option A | Option B | Option C | Option D | Correct Answer | Marks |
|---------------|----------|----------|----------|----------|----------|----------------|-------|
| Row 2 Data    | What is 2+2? | 1 | 2 | 3 | 4 | d | 2 |

### 2. PDF & Word Structure
Since documents are just raw text walls, the formatting MUST use strict line breaks and prefixes. Are you okay with enforcing this exact pattern for PDFs and Docs?

```text
Q: What is the capital of France?
A) London
B) Berlin
C) Paris
D) Madrid
Ans: C
Marks: 1
```
*(Every question must start with `Q:`, options with `A) `, `B) `, `C) `, `D) `, the correct answer with `Ans:`, and an optional `Marks:` line).*

## Verification Plan

### Automated Tests
- Uploading a malformed `.pdf` and confirming the frontend throws a soft "Format Error" instead of crashing.
- Uploading a correct `.xlsx` and checking Supabase for exactly 5 inserted rows.

### Manual Verification
- Testing the UI File Picker in `app/admin/dashboard/exams`.
- Downloading the sample format template to ensure clarity.
- Attempting file uploads in the local dev server and confirming instant visual refresh on the Exam Table.
