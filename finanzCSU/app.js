import Fastify from "fastify";
import db from "./plugin/db.js";
import autoload from '@fastify/autoload'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function app() {
  let fastify = Fastify({
    logger: true,
  });
  await fastify.register(db);
  //await fastify.register(auth);
  app.register(autoload, {
    dir: join(__dirname, 'routes')
  })

  return fastify;
}
