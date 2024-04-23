async function budgets (fastify, opts) {
  fastify.get('/budget', async (request, reply) => {
    console.log('Req received')
    const data = await request.pool.query('SELECT * FROM budget')
    console.log(JSON.stringify(`${data}`))
    if (data) {
      return { data }
    } 
      reply.code(500)
      reply.message('Database Error')
      reply.send()
  })

  fastify.post('/budget', async (request, reply) => {
    console.log('Req received')
    const data = await request.pool.query('INSERT INTO budget')
    console.log(JSON.stringify(`${data}`))
    if (data) {
      return { data }
    } 
      reply.code(500)
      reply.message('Database Error')
      reply.send()
  })
}

export default budgets
