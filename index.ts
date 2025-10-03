import fastify from 'fastify'
import { setupRoutes } from './src/routes/index.ts'

const app = fastify()

await setupRoutes(app)

const PORT = isNaN(Number(process.env.PORT)) ? 3000 : Number(process.env.PORT)

const start = async () => {
	try {
		await app.listen({ port: PORT })
		console.log(`Better Moodle available at http://localhost:${PORT}`)
	} catch (err) {
		app.log.error(err)
		process.exit(1)
	}
}

start()
