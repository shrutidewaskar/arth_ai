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
        print("Invalid DB URL")
        return
    _, password, host, port, dbname = m.groups()
    dbname = dbname or 'postgres'
    conn = psycopg2.connect(
        host='aws-0-ap-southeast-1.pooler.supabase.com',
        port=5432,
        dbname=dbname,
        user='postgres.qszgfpeqmkdqbjbacrol',
        password=password,
        connect_timeout=10
    )
    cur = conn.cursor()
    migration_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'database', 'migrations', '004_candidate_financial_entities.sql'))
    with open(migration_path, 'r', encoding='utf-8') as f:
        sql = f.read()
    cur.execute(sql)
    conn.commit()
    print("Migration 004 applied successfully!")
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_name = 'candidate_financial_entities';")
    print("Verified table:", cur.fetchall())
    conn.close()

if __name__ == '__main__':
    apply_migration()
