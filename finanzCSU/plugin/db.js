import fp from "fastify-plugin";
import sql from 'mssql'

const defaults = {
  server: 'localhost',
  port: 1433,
  user: 'sa',
  password: '',
  database: '',
  trustCertificate: true
}

class DBProvider {
  pool
  db
  constructor(configOptions) {
    this.dbConfig = {
      user: configOptions?.user ?? defaults.user,
      password: configOptions?.password ?? defaults.password,
      server: configOptions?.server ?? defaults.server,
      database: configOptions?.database ?? defaults.database,
      trustServerCertificate: true
    };
  }

  async init() {
    try {
      this.pool = new sql.ConnectionPool(this.dbConfig);
      this.db = this.pool.connect();
    } catch (e) {
      console.error(e);
      await this.db?.dispose();
    }
  }
}

async function plugin(fastify, opts) {
  const db = new DBProvider({
    user: process.env.DB_USER ?? opts.user,
    password: process.env.DB_PASSWORD ?? opts.password,
    server: process.env.DB_HOST ?? opts.server,
    database: process.env.DB_SCHEMA ?? opts.database
  })
  await db.init();
  fastify.addHook('onClose', async () => {
    await this.pool.close()
  })
  fastify.decorateRequest('db', null);
  await fastify.addHook('preSerialization', (req, reply, done) => {
    req.db = db;
    done();
  });
}

export default fp(plugin, {
  fastify: '4.x',
  name: 'mssql'
});
