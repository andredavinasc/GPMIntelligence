#!/bin/bash

# Script para testar o endpoint de configuração

echo "🔍 Testando endpoint /api/configuracao"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Assumindo que o servidor está rodando em http://localhost:3000
BASE_URL="http://localhost:3000"

echo ""
echo "📡 Fazendo GET request em: $BASE_URL/api/configuracao"
echo ""

# Fazer a requisição e exibir a resposta
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/configuracao")
http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

echo "HTTP Status: $http_code"
echo ""
echo "Response Body:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$http_code" = "200" ]; then
    echo "✅ Endpoint respondeu com sucesso (200)"

    # Verificar se retornou dados
    if echo "$body" | jq -e '.' > /dev/null 2>&1; then
        if [ "$body" != "null" ]; then
            echo "✅ Dados encontrados no banco"
            echo ""
            echo "Campos retornados:"
            echo "$body" | jq 'keys' 2>/dev/null || echo "Não foi possível extrair campos"
        else
            echo "⚠️  Nenhum registro de configuração encontrado"
            echo "   - Verifique se há dados na tabela 'configuracao'"
        fi
    fi
else
    echo "❌ Erro na requisição (HTTP $http_code)"
fi

echo ""
echo "Dicas:"
echo "  1. Se vazio (null): Insira um registro via dashboard"
echo "  2. Se erro 500: Verifique os logs do servidor"
echo "  3. Se erro 404: O endpoint não foi encontrado"
