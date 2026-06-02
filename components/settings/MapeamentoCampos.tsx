'use client'

import { useState } from 'react'
import { TipoCarga } from '@/lib/types/mapeamento'
import MapeamentoTab from './MapeamentoTab'

type TabType = 'okrs' | 'work_items' | 'agilidade'

export default function MapeamentoCampos() {
  const [abaAtiva, setAbaAtiva] = useState<TabType>('okrs')

  const abas: { id: TabType; label: string }[] = [
    { id: 'okrs', label: 'OKRs' },
    { id: 'work_items', label: 'Work Items' },
    { id: 'agilidade', label: 'Agilidade' },
  ]

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200">
        <div className="flex gap-4 overflow-x-auto">
          {abas.map((aba) => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                abaAtiva === aba.id
                  ? 'border-green-700 text-green-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {aba.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {abas.map((aba) => (
          <div key={aba.id} className={abaAtiva === aba.id ? 'block' : 'hidden'}>
            <MapeamentoTab tipo={aba.id} />
          </div>
        ))}
      </div>
    </div>
  )
}
