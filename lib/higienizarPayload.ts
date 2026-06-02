/**
 * Higieniza dados de upload removendo HTML, entidades especiais,
 * caracteres invisíveis, normalizando espaços e removendo campos vazios
 */
export function higienizarPayload(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  const higienizados = rows.map((row) => higienizarObjeto(row))
  return removerCamposVazios(higienizados)
}

function higienizarObjeto(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    result[key] = higienizarValor(value)
  }

  return result
}

function higienizarValor(valor: unknown): unknown {
  // Preservar tipos que não são string
  if (typeof valor !== 'string') {
    return valor
  }

  // Converter variações de "vazio" para string vazia
  if (isValorVazio(valor)) {
    return ''
  }

  let texto = valor

  // Remover tags HTML
  texto = removerTagsHTML(texto)

  // Converter entidades HTML
  texto = converterEntidadesHTML(texto)

  // Remover caracteres de controle invisíveis
  texto = removerCaracteresControle(texto)

  // Normalizar espaços e quebras de linha
  texto = normalizarEspacos(texto)

  // Aplicar trim final
  texto = texto.trim()

  return texto
}

function isValorVazio(texto: string): boolean {
  const normalizador = texto.toLowerCase().trim()
  return normalizador === 'null' || normalizador === 'undefined' || normalizador === '-' || normalizador === '—'
}

function removerTagsHTML(texto: string): string {
  // Remove tags HTML comuns e qualquer outra tag genérica
  return texto.replace(/<[^>]*>/g, '')
}

function converterEntidadesHTML(texto: string): string {
  // Mapa de entidades HTML comuns
  const entidades: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&copy;': '©',
    '&reg;': '®',
    '&deg;': '°',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
    '&cent;': '¢',
    '&sect;': '§',
    '&para;': '¶',
    '&dagger;': '†',
    '&Dagger;': '‡',
    '&bull;': '•',
    '&hellip;': '…',
    '&prime;': '′',
    '&Prime;': '″',
    '&lsquo;': '‘',
    '&rsquo;': '’',
    '&ldquo;': '“',
    '&rdquo;': '”',
    '&lsaquo;': '‹',
    '&rsaquo;': '›',
    '&oline;': '‾',
    '&frasl;': '⁄',
    '&weierp;': '℘',
    '&image;': 'ℑ',
    '&real;': 'ℜ',
    '&trade;': '™',
    '&alefsym;': 'ℵ',
    '&larr;': '←',
    '&uarr;': '↑',
    '&rarr;': '→',
    '&darr;': '↓',
    '&harr;': '↔',
    '&crarr;': '↵',
    '&lArr;': '⇐',
    '&uArr;': '⇑',
    '&rArr;': '⇒',
    '&dArr;': '⇓',
    '&hArr;': '⇔',
    '&forall;': '∀',
    '&part;': '∂',
    '&exist;': '∃',
    '&empty;': '∅',
    '&nabla;': '∇',
    '&isin;': '∈',
    '&notin;': '∉',
    '&ni;': '∋',
    '&prod;': '∏',
    '&sum;': '∑',
    '&minus;': '−',
    '&lowast;': '∗',
    '&radic;': '√',
    '&prop;': '∝',
    '&infin;': '∞',
    '&ang;': '∠',
    '&and;': '∧',
    '&or;': '∨',
    '&cap;': '∩',
    '&cup;': '∪',
    '&int;': '∫',
    '&there4;': '∴',
    '&sim;': '∼',
    '&cong;': '≅',
    '&asymp;': '≈',
    '&ne;': '≠',
    '&equiv;': '≡',
    '&le;': '≤',
    '&ge;': '≥',
    '&sub;': '⊂',
    '&sup;': '⊃',
    '&nsub;': '⊄',
    '&sube;': '⊆',
    '&supe;': '⊇',
    '&oplus;': '⊕',
    '&otimes;': '⊗',
    '&perp;': '⊥',
    '&sdot;': '⋅',
  }

  // Substituir entidades nomeadas conhecidas
  let resultado = texto
  for (const [entidade, caractere] of Object.entries(entidades)) {
    resultado = resultado.replace(new RegExp(entidade, 'g'), caractere)
  }

  // Substituir entidades numéricas (&#123; ou &#xAB;)
  resultado = resultado.replace(/&#(\d+);/g, (_, code) => {
    try {
      return String.fromCharCode(parseInt(code, 10))
    } catch {
      return _
    }
  })

  // Substituir entidades hexadecimais (&#xABC;)
  resultado = resultado.replace(/&#x([0-9A-Fa-f]+);/g, (_, code) => {
    try {
      return String.fromCharCode(parseInt(code, 16))
    } catch {
      return _
    }
  })

  return resultado
}

function removerCaracteresControle(texto: string): string {
  // Remover caracteres de controle Unicode (0x00–0x08, 0x0B, 0x0C, 0x0E–0x1F, 0x7F)
  // Preserva 0x09 (tab), 0x0A (LF), 0x0D (CR) pois podem ser significativos
  return texto.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

function normalizarEspacos(texto: string): string {
  // Remover espaços e quebras de linha múltiplas
  return texto
    .replace(/\r\n/g, ' ') // Windows newline → espaço
    .replace(/\n/g, ' ') // Unix newline → espaço
    .replace(/\r/g, ' ') // Mac newline → espaço
    .replace(/\t/g, ' ') // Tab → espaço
    .replace(/\s+/g, ' ') // Múltiplos espaços → único espaço
}

function removerCamposVazios(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((record) => {
    const cleaned: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(record)) {
      if (value !== '' && value !== null && value !== undefined) {
        cleaned[key] = value
      }
    }

    return cleaned
  })
}
