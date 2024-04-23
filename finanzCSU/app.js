import Fastify from 'fastify'
import db from './plugin/db.js'
import fastifyPrintRoutes from 'fastify-print-routes'
import autoLoad from '@fastify/autoload'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(filename)

export async function app() {
  const fastify = Fastify({
    logger: true
  })

  await fastify.register(fastifyPrintRoutes)
  await fastify.register(db)

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'routes')
  })

  return fastify
}
