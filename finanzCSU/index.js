import { app } from "./app";

async function run() {
  const fastify = await app();

  await fastify.listen({
    host: "0.0.0.0",
    port: 1343,
  });
}

run()
  .then((r) => {})
  .catch((err) => console.log(err));
