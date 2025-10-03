import fastify from 'fastify'
import { setupRoutes } from './src/routes/index.ts'

const app = fastify()

// Setup all routes
await setupRoutes(app)

// Start the server
const start = async () => {
	try {
		await app.listen({ port: 3000 })
		console.log('Better Moodle available at http://localhost:3000')
	} catch (err) {
		app.log.error(err)
		process.exit(1)
	}
}

start()
