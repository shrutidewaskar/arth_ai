import os
import psycopg2
import re
from dotenv import dotenv_values

def apply_migration():
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env.local'))
    env = dotenv_values(env_path) if os.path.exists(env_path) else {}
    raw_db_url = os.getenv('DATABASE_URL') or env.get('DATABASE_URL', '')
    m = re.match(r'postgresql://([^:]+):(.*)@([^:/]+)(?::(\d+))?/(.*)', raw_db_url.strip('\"\''))
    if not m:
        print("Invalid DB URL in .env.local")
        return
    _, password, host, port, dbname = m.groups()
    dbname = dbname or 'postgres'
    try:
        conn = psycopg2.connect(
            host='aws-0-ap-southeast-1.pooler.supabase.com',
            port=5432,
            dbname=dbname,
            user='postgres.qszgfpeqmkdqbjbacrol',
            password=password,
            connect_timeout=15
        )
        cur = conn.cursor()
        migration_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'database', 'migrations', '005_economic_intelligence_data_model.sql'))
        with open(migration_path, 'r', encoding='utf-8') as f:
            sql = f.read()
        cur.execute(sql)
        conn.commit()
        print("Migration 005 applied successfully!")
        
        expected_tables = [
            'external_sources',
            'economic_observations',
            'inflation_observations',
            'cost_index_observations',
            'gdp_observations',
            'interest_rate_observations',
            'tax_rule_versions'
        ]
        
        cur.execute(f"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ({','.join(repr(t) for t in expected_tables)});")
        tables = [row[0] for row in cur.fetchall()]
        print("Verified tables in database:", tables)
        
        cur.execute("SELECT tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename IN ({});".format(','.join(repr(t) for t in expected_tables)))
        policies = cur.fetchall()
        print("Verified RLS Policies count:", len(policies))
        for p in policies:
            print(f"  - {p[0]}: {p[1]} ({p[4]}) -> {p[5]}")

        conn.close()
    except Exception as e:
        print("Error applying migration 005 to remote DB:", e)

if __name__ == '__main__':
    apply_migration()
