import fp from "fastify-plugin";
import sql from "mssql";

export class DBProvider {
  dbConfig = {}
  pool
  db
  constructor(configOptions) {
    this.dbConfig = {
      user: configOptions?.user ?? '',
      password: configOptions?.password ?? '',
      server: configOptions?.server ?? '',
      database: configOptions?.database ?? '',
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

export default fp(
  async (
    fastify,
    {
      db = new DBProvider({
        user: process.env.DB_USER ?? '',
        password: process.env.DB_PASSWORD ?? '',
        server: process.env.DB_HOST ?? '',
        database: process.env.DB_SCHEMA ?? ''
      }),
    },
  ) => {
    await db.init();
    fastify.decorateRequest("db", null);
    await fastify.addHook("preSerialization", (req, reply, done) => {
      req.db = this.db;
      done();
    });
  },
);
