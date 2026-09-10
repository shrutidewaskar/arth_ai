import os
import psycopg2
import re
from dotenv import dotenv_values

def inspect_remote():
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
    env = dotenv_values(env_path)
    db_url = env.get('DATABASE_URL', '').strip('\"\'')
    
    m = re.match(r'postgresql://([^:]+):(.*)@([^:/]+)(?::(\d+))?/(.*)', db_url)
    _, password, _, _, dbname = m.groups()
    dbname = dbname or 'postgres'
    
    conn = psycopg2.connect(
        host="aws-0-ap-southeast-1.pooler.supabase.com",
        port=5432,
        dbname=dbname,
        user="postgres.qszgfpeqmkdqbjbacrol",
        password=password,
        connect_timeout=10
    )
    cur = conn.cursor()
    
    # 1. Check all tables in public schema
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    """)
    tables = [r[0] for r in cur.fetchall()]
    print("ALL PUBLIC TABLES:", tables)
    
    # 2. Check migration history tables
    cur.execute("""
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_name IN ('alembic_version', 'schema_migrations', 'supabase_migrations', '_prisma_migrations');
    """)
    print("MIGRATION HISTORY TABLES:", cur.fetchall())
    
    # 3. Check columns of documents table
    cur.execute("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'documents'
        ORDER BY ordinal_position;
    """)
    print("\nDOCUMENTS COLUMNS:", cur.fetchall())
    
    # 4. Check installed extensions
    cur.execute("SELECT extname, extversion FROM pg_extension;")
    print("\nINSTALLED EXTENSIONS:", cur.fetchall())
    
    conn.close()

if __name__ == '__main__':
    inspect_remote()
