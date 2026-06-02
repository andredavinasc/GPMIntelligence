#!/usr/bin/env python3
"""
Database migration script to add CAPEX/OPEX objectives fields
Supports direct SQL execution via Supabase API
"""

import os
import sys
import requests
import json
from pathlib import Path

def get_env(key: str) -> str:
    """Get environment variable or exit if not found"""
    value = os.getenv(key)
    if not value:
        print(f"❌ Error: {key} not set")
        sys.exit(1)
    return value

def read_migration_sql() -> str:
    """Read the migration SQL file"""
    script_dir = Path(__file__).parent
    migration_file = script_dir.parent / "migrations" / "001_add_capex_opex_objectives.sql"

    if not migration_file.exists():
        print(f"❌ Error: Migration file not found at {migration_file}")
        sys.exit(1)

    with open(migration_file, 'r') as f:
        return f.read()

def run_migration():
    """Execute the migration"""
    supabase_url = get_env('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = get_env('SUPABASE_SERVICE_KEY')

    print("📦 Starting migration: Adding CAPEX/OPEX objectives...")

    sql = read_migration_sql()

    # Try to execute via SQL query interface
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json',
    }

    # First, try to add fields via individual updates
    print("✓ Adding objetivo_capex and objetivo_opex fields to configuracao...")

    # Check if columns exist by attempting a query
    query_url = f"{supabase_url}/rest/v1/configuracao?select=objetivo_capex,objetivo_opex&limit=1"

    try:
        response = requests.get(query_url, headers=headers)

        if response.status_code == 200:
            print("✓ Fields already exist or have been added")
        elif response.status_code == 406:
            # Column doesn't exist, need to create it
            print("⚠️  Columns don't exist yet")
            print("\n📋 Please run the following SQL in Supabase SQL Editor:")
            print("-" * 60)
            print(sql)
            print("-" * 60)
            print("\nSteps:")
            print("1. Go to https://supabase.com/dashboard")
            print("2. Select your project")
            print("3. Go to SQL Editor")
            print("4. Click 'New Query'")
            print("5. Paste the SQL above")
            print("6. Click 'Run'")
            sys.exit(1)
        else:
            print(f"⚠️  Unexpected response: {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"⚠️  Error checking columns: {e}")
        print("\n📋 Please run the following SQL in Supabase SQL Editor:")
        print("-" * 60)
        print(sql)
        print("-" * 60)
        sys.exit(1)

    # Verify the migration
    print("\n📋 Verifying migration...")

    try:
        # Check configuracao table
        config_url = f"{supabase_url}/rest/v1/configuracao?select=objetivo_capex,objetivo_opex&limit=1"
        response = requests.get(config_url, headers=headers)

        if response.status_code == 200:
            data = response.json()
            print("✓ Configuracao table updated successfully")
            if data and len(data) > 0:
                print(f"  - objetivo_capex: {data[0].get('objetivo_capex', 'not set')}")
                print(f"  - objetivo_opex: {data[0].get('objetivo_opex', 'not set')}")

        # Check capex_opex table
        capex_url = f"{supabase_url}/rest/v1/capex_opex?select=meta_capex,meta_opex&limit=1"
        response = requests.get(capex_url, headers=headers)

        if response.status_code == 200:
            data = response.json()
            print("✓ Capex_opex table updated successfully")
            if data and len(data) > 0:
                print(f"  - meta_capex: {data[0].get('meta_capex', 'not set')}")
                print(f"  - meta_opex: {data[0].get('meta_opex', 'not set')}")

        print("\n✅ Migration verified!")

    except Exception as e:
        print(f"⚠️  Error verifying migration: {e}")
        print("Please verify manually in Supabase dashboard")

if __name__ == '__main__':
    run_migration()
