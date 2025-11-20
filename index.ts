import fastify from 'fastify'
import { setupRoutes } from './src/routes/index.ts'

const app = fastify()

// MOVED setupRoutes from here

const PORT = isNaN(Number(process.env.PORT)) ? 3002 : Number(process.env.PORT)

const start = async () => {
    try {
        // MOVED setupRoutes TO HERE:
        await setupRoutes(app) 

        await app.listen({ port: PORT })
        console.log(`Better Moodle available at http://localhost:${PORT}`)
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}

// Call start() WITHOUT await
start()
