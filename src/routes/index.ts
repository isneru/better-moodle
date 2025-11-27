import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import archiver from 'archiver'
import { scanDirectory, getMimeType } from '../utils/fileSystem.ts'
import { generatePageHTML } from '../templates/pageTemplate.ts'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const PROJECT_ROOT = path.resolve(__dirname, '../..') // Where code/CSS lives
const MATERIALS_ROOT = path.resolve(__dirname, '../../materials') // Where downloads go

if (!fs.existsSync(MATERIALS_ROOT)) {
	fs.mkdirSync(MATERIALS_ROOT, { recursive: true })
}

export async function setupRoutes(app: FastifyInstance) {
	app.get(
		'/styles/output.css',
		async (request: FastifyRequest, reply: FastifyReply) => {
			const cssPath = path.join(PROJECT_ROOT, 'src', 'styles', 'output.css')
			try {
				const cssContent = fs.readFileSync(cssPath, 'utf-8')
				reply.type('text/css')
				return cssContent
			} catch (error) {
				reply.code(404)
				return 'CSS file not found'
			}
		}
	)

	app.get(
		'/favicon.png',
		async (request: FastifyRequest, reply: FastifyReply) => {
			const faviconPath = path.join(
				PROJECT_ROOT,
				'src',
				'assets',
				'favicon.png'
			)
			try {
				const faviconStream = fs.createReadStream(faviconPath)
				reply.type('image/png')
				return reply.send(faviconStream)
			} catch (error) {
				reply.code(404)
				return 'Favicon not found'
			}
		}
	)

	app.get('/zip/*', async (request: FastifyRequest, reply: FastifyReply) => {
		const requestedPath = (request.params as any)['*'] || ''
		const fullPath = path.join(MATERIALS_ROOT, requestedPath)
		// Nome do ficheiro será o nome da pasta ou "materials" se for a raiz
		const downloadName =
			requestedPath.split('/').filter(Boolean).pop() || 'materials'

		try {
			if (!fs.statSync(fullPath).isDirectory()) {
				return reply
					.code(400)
					.send('Apenas pastas podem ser descarregadas como zip.')
			}

			reply.header('Content-Type', 'application/zip')
			reply.header(
				'Content-Disposition',
				`attachment; filename="${downloadName}.zip"`
			)

			const archive = archiver('zip', { zlib: { level: 5 } }) // Nível de compressão médio (mais rápido)

			archive.on('error', (err: any) => {
				reply.code(500).send({ error: err.message })
			})

			// Enviar o zip diretamente para a resposta (stream)
			archive.directory(fullPath, false) // 'false' mete os ficheiros na raiz do zip
			await archive.finalize()

			return reply.send(archive)
		} catch (error) {
			return reply.code(404).send('Pasta não encontrada')
		}
	})

	app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
		const fileTree = scanDirectory(MATERIALS_ROOT)
		const html = generatePageHTML(fileTree, '', 'Better Moodle')

		reply.type('text/html')
		return html
	})

	app.get('/*', async (request: FastifyRequest, reply: FastifyReply) => {
		const requestedPath = (request.params as any)['*']
		const fullPath = path.join(MATERIALS_ROOT, requestedPath)

		try {
			const stats = fs.statSync(fullPath)

			if (stats.isDirectory()) {
				const fileTree = scanDirectory(fullPath, requestedPath)
				const pathParts = requestedPath.split('/').filter(Boolean)
				const folderName = pathParts[pathParts.length - 1] || 'Root'
				const html = generatePageHTML(
					fileTree,
					requestedPath,
					`${folderName} - ISEP`
				)

				reply.type('text/html')
				return html
			} else {
				const fileStream = fs.createReadStream(fullPath)
				const contentType = getMimeType(fullPath)

				reply.type(contentType)
				return reply.send(fileStream)
			}
		} catch (error) {
			reply.code(404)
			return { error: 'File or folder not found' }
		}
	})
}
