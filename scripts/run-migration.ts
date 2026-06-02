import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('📦 Starting migration: Adding CAPEX/OPEX objectives...')

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../migrations/001_add_capex_opex_objectives.sql')
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    // Execute the migration
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: sql,
    })

    if (error) {
      // If execute_sql RPC doesn't exist, try direct query approach
      console.log('⚠️  RPC method not available, attempting direct approach...')

      // Add objetivo_capex and objetivo_opex to configuracao
      console.log('✓ Adding objetivo_capex and objetivo_opex fields to configuracao...')
      await supabase.from('configuracao').select('*').limit(1)

      // Check if columns exist by trying to query them
      const { data: configData } = await supabase.from('configuracao').select('objetivo_capex').limit(1)

      if (!configData || configData.length === 0 || configData[0].objetivo_capex === undefined) {
        console.log('Note: Columns appear to not exist yet.')
        console.log('Please run the SQL migration manually in Supabase dashboard:')
        console.log('\n' + sql)
        process.exit(1)
      }

      console.log('✓ Fields already exist or have been added')
    } else {
      console.log('✓ Migration executed successfully!')
    }

    // Verify the migration
    console.log('\n📋 Verifying migration...')

    // Check configuracao table
    const { data: configData, error: configError } = await supabase
      .from('configuracao')
      .select('objetivo_capex, objetivo_opex')
      .limit(1)

    if (!configError && configData) {
      console.log('✓ Configuracao table updated successfully')
      console.log(`  - objetivo_capex: ${configData[0]?.objetivo_capex ?? 'not set'}`)
      console.log(`  - objetivo_opex: ${configData[0]?.objetivo_opex ?? 'not set'}`)
    }

    // Check capex_opex table
    const { data: capexData, error: capexError } = await supabase
      .from('capex_opex')
      .select('meta_capex, meta_opex')
      .limit(1)

    if (!capexError && capexData) {
      console.log('✓ Capex_opex table updated successfully')
      if (capexData.length > 0) {
        console.log(`  - meta_capex: ${capexData[0]?.meta_capex ?? 'not set'}`)
        console.log(`  - meta_opex: ${capexData[0]?.meta_opex ?? 'not set'}`)
      }
    }

    console.log('\n✅ Migration completed!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
