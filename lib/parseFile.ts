import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { higienizarPayload } from './higienizarPayload'

export async function parseFile(file: File): Promise<Record<string, unknown>[]> {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.csv')) {
    return parseCSV(file)
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcel(file)
  } else {
    throw new Error('Formato de arquivo não suportado. Use CSV ou Excel.')
  }
}

async function parseCSV(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const csv = event.target?.result as string
      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed = results.data as Record<string, unknown>[]
          resolve(higienizarPayload(parsed))
        },
        error: (error: Error) => {
          reject(new Error(`Erro ao processar CSV: ${error.message}`))
        },
      })
    }

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'))
    }

    reader.readAsText(file)
  })
}

async function parseExcel(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = event.target?.result as ArrayBuffer
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet)
        resolve(higienizarPayload(rows))
      } catch (error) {
        reject(new Error(`Erro ao processar Excel: ${error instanceof Error ? error.message : String(error)}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'))
    }

    reader.readAsArrayBuffer(file)
  })
}
