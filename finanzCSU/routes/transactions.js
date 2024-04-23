async function transactions(fastify, opts) {
  fastify.get("/transaction/:transaction_id", async (request, reply) => {
    console.log(`Req received`);
    const data = await request.pool.query(
      "SELECT * FROM Transactions WHERE transactionId = $1;",
      request.params.transaction_id,
    );
    console.log(JSON.stringify(`${data}`));
    if (data) {
      return { data };
    }
    reply.code(500);
    reply.message("Database Error");
    reply.send();
  });

  fastify.post("/transaction", async (request, reply) => {
    console.log(`Req received`);
    const t = request.query;
    const data = await request.pool
      .query`INSERT INTO Transactions VALUES (${t.MonthID}, ${t.UserBudgetID} ${t.CategoryID}, ${t.TransactionAmount} ${t.Memo})`;
    console.log(JSON.stringify(`${data}`));
    if (data) {
      return { data };
    }
    reply.code(500);
    reply.message("Database Error");
    reply.send();
  });
}
export default transactions;
