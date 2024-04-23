import fp from "fastify-plugin";
import { DBProvider } from "../util/db";
import sql from "mssql";

export class DBProvider {
  configOptions = {
    dbConfig,
    pool,
    db,
  };
  constructor(configOptions) {
    this.dbConfig = {
      user: configOptions?.user ?? process.env.SQLUSER,
      password: configOptions?.password ?? process.env.SQLPASSWORD,
      connectString: configOptions?.connectString ?? process.env.DATABASE_URL,
    };
  }

  async init() {
    try {
      this.pool = sql.ConnectionPool(this.dbConfig);
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
        user: "test",
        password: "test",
        connectString: "localhost",
      }),
    },
  ) => {
    await db.init();
    fastify.decorateRequest("db", null);
    await fastify.addHook("preSerialization", (req, reply, done) => {
      req.db = db;
      done();
    });
  },
);
