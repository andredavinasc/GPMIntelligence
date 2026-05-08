import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

const CHROME_PATH = process.env.CHROME_PATH

export async function POST(request: NextRequest) {
  try {
    const { htmlContent, fileName } = await request.json()

    if (!htmlContent) {
      return NextResponse.json({ error: 'htmlContent is required' }, { status: 400 })
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: CHROME_PATH,
    })

    const page = await browser.newPage()

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle2',
    })

    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
      printBackground: true,
      preferCSSPageSize: true,
    })

    await browser.close()

    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName || 'relatorio.pdf'}"`,
      },
    })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar PDF. Por favor, tente novamente.' },
      { status: 500 }
    )
  }
}
