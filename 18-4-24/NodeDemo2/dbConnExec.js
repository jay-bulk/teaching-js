// Author: Rhett Bulkley
import sql from 'mssql'

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_SCHEMA,
    trustServerCertificate: true
}

export async function execQuery(query) {
    const conn = await sql.connect(dbConfig)
    const result = await conn.query(query)
    return result.recordset
}