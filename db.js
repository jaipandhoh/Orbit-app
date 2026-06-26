import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// We wrap the standard pg Pool in an object that provides
// `.query()` and `.execute()` methods that mimic mysql2's behavior.
if (!process.env.DATABASE_URL) {
  console.error('[db] DATABASE_URL is not set — all queries will fail');
}

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase (and most hosted Postgres) require SSL.
  // rejectUnauthorized:false accepts Supabase's CA-signed cert without
  // needing to bundle a root certificate.
  ssl: (process.env.DATABASE_URL &&
        !process.env.DATABASE_URL.includes("localhost") &&
        !process.env.DATABASE_URL.includes("127.0.0.1"))
    ? { rejectUnauthorized: false }
    : false,
});

function convertQuery(sql) {
  let paramCount = 1;
  // Replace MySQL ? bindings with PostgreSQL $1, $2, etc.
  let newSql = sql.replace(/\?/g, () => `$${paramCount++}`);
  
  const upperSql = newSql.trim().toUpperCase();
  // Automatically append RETURNING * to mutations so we get the insertId / affectedRows
  if ((upperSql.startsWith('INSERT') || upperSql.startsWith('UPDATE') || upperSql.startsWith('DELETE')) 
      && !upperSql.includes('RETURNING')) {
      newSql += ' RETURNING *';
  }
  return newSql;
}

const poolWrapper = {
  query: async (sql, params) => {
    const converted = convertQuery(sql);
    const res = await pgPool.query(converted, params);
    
    let resultObj = res.rows;
    if (res.command === 'INSERT' || res.command === 'UPDATE' || res.command === 'DELETE') {
        resultObj = {
            insertId: null,
            affectedRows: res.rowCount,
        };
        if (res.rows && res.rows.length > 0) {
            const firstRow = res.rows[0];
            const keys = Object.keys(firstRow);
            const idKey = keys.find(k => k === 'id' || k.endsWith('_id'));
            if (idKey) {
                resultObj.insertId = firstRow[idKey];
            }
        }
    }
    
    return [resultObj, res.fields];
  },
  execute: async function(sql, params) {
    return this.query(sql, params);
  }
};

// Test the connection once at startup so misconfiguration shows up immediately in logs
pgPool.query('SELECT 1').then(() => {
  console.log('[db] Connected to Postgres');
}).catch((err) => {
  console.error('[db] Connection test failed:', err.message);
});

export default poolWrapper;
