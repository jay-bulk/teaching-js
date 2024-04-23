async function routes (fastify, opts) {
  fastify.get('/categories', async (request, reply) => {
    console.log('Req received')
    const data = await request.pool.connect.query('SELECT * FROM film')
    console.log(JSON.stringify(`${data}`))
    if (data) {
      return { data }
    } 
      reply.code(500)
      reply.message('Database Error')
      reply.send()
  })
}

export default routes
