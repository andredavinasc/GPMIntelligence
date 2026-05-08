export async function generatePDFFromHTML(htmlContent: string, fileName: string = 'relatorio.pdf'): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('PDF generation only works on client side')
  }

  try {
    const response = await fetch('/api/gerar-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ htmlContent, fileName }),
    })

    if (!response.ok) {
      throw new Error('Erro ao gerar PDF no servidor')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    throw new Error('Erro ao gerar PDF. Por favor, tente novamente.')
  }
}

