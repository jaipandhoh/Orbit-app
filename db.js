import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// We wrap the standard pg Pool in an object that provides
// `.query()` and `.execute()` methods that mimic mysql2's behavior.
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
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

export default poolWrapper;
