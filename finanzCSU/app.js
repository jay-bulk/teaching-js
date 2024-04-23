import Fastify from "fastify";
import db from "./plugins/db";
import auth from "./plugins/auth";

export async function app() {
  let fastify = Fastify({
    logger: true,
  });
  await fastify.register(db);
  //await fastify.register(auth);

  return fastify;
}
