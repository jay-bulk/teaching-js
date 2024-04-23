import { app } from '../app.js'
import { it, before, describe } from 'node:test'
import assert from 'node:assert'

describe('category tests', async () => {
  const fastify = await app()
  before(async () =>
  fastify.listen({
    host: '0.0.0.0',
    post: '1343'
  })
  )

  after(async () => {
    await fastify.close()
  })

  it('test happy path', () => {
    const res = fastify.inject({
      method: 'GET',
      url: '/categories'
    })
    assert(res.body, {}, 'Missing Categories')
  })
})


