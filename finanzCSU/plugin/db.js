import fastifyPlugin from 'fastify-plugin'
import sql from 'mssql'

const defaults = {
  server: 'localhost',
  port: 1433,
  user: 'sa',
  password: '',
  database: '',
  trustServerCertificate: true
}

class DBProvider {
  dbConfig
  pool
  constructor (configOptions) {
    this.dbConfig = {
      user: configOptions?.user ?? defaults.user,
      password: configOptions?.password ?? defaults.password,
      server: configOptions?.server ?? defaults.server,
      database: configOptions?.database ?? defaults.database,
      options: {
        trustServerCertificate: true
      }
    }
  }

  async initdB () {
    const conn = new sql.ConnectionPool(this.dbConfig).connect()
      .then(async (pool) => {
        await pool.query('SELECT 1')
        this.pool = pool
      })
      .catch((err) => {
        console.error(err)
      })
  }
}

export default fastifyPlugin(async (fastify, opts) => {
  const db = new DBProvider({
    user: process.env.DB_USER ?? opts.user,
    password: process.env.DB_PASSWORD ?? opts.password,
    server: process.env.DB_HOST ?? opts.server,
    database: process.env.DB_SCHEMA ?? opts.database
  })
  fastify.addHook('onReady', async () => {
    await db.initdB()
  })
  fastify.addHook('onClose', async () => {
    await this.pool.close()
  })
  fastify.decorateRequest('pool', null)
  fastify.addHook('preHandler', (request) => {
    request.pool = db.pool.connect()
  })
})
