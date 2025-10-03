import fs from 'node:fs'
import path from 'node:path'
import type { FileNode } from '../types/index.ts'

export function scanDirectory(
	dirPath: string,
	relativePath: string = ''
): FileNode[] {
	const nodes: FileNode[] = []

	try {
		const items = fs.readdirSync(dirPath)

		for (const item of items) {
			if (
				item === 'node_modules' ||
				item === '.git' ||
				item.startsWith('.') ||
				item === 'index.ts' ||
				item === 'package.json' ||
				item === 'package-lock.json' ||
				item === 'README.md' ||
				item === 'tsconfig.json' ||
				item === 'src'
			) {
				continue
			}

			const fullPath = path.join(dirPath, item)
			const relativeItemPath = path.join(relativePath, item).replace(/\\/g, '/')
			const stats = fs.statSync(fullPath)

			if (stats.isDirectory()) {
				const children = scanDirectory(fullPath, relativeItemPath)
				nodes.push({
					name: item,
					type: 'directory',
					path: relativeItemPath,
					children: children
				})
			} else {
				nodes.push({
					name: item,
					type: 'file',
					path: relativeItemPath
				})
			}
		}
	} catch (error) {
		console.error(`Error scanning directory ${dirPath}:`, error)
	}

	return nodes.sort((a, b) => {
		if (a.type === 'directory' && b.type === 'file') return -1
		if (a.type === 'file' && b.type === 'directory') return 1
		return a.name.localeCompare(b.name)
	})
}

export function getFileIcon(filename: string): string {
	const ext = path.extname(filename).toLowerCase()
	const iconMap: { [key: string]: string } = {
		'.pdf': '📄',
		'.doc': '📝',
		'.docx': '📝',
		'.html': '🌐',
		'.zip': '📦',
		'.ts': '⚡',
		'.js': '⚡',
		'.json': '⚙️',
		'.md': '📋',
		'.txt': '📄',
		'.r': '📊',
		'.undefined': '❓'
	}
	return iconMap[ext] || '📄'
}

export function getFileIconColor(filename: string): string {
	const ext = path.extname(filename).toLowerCase()
	const colorMap: { [key: string]: string } = {
		'.pdf': 'text-red-500',
		'.doc': 'text-blue-500',
		'.docx': 'text-blue-500',
		'.html': 'text-orange-500',
		'.zip': 'text-yellow-500',
		'.ts': 'text-blue-600',
		'.js': 'text-yellow-600',
		'.json': 'text-green-500',
		'.md': 'text-gray-600',
		'.txt': 'text-gray-500',
		'.r': 'text-purple-500',
		'.undefined': 'text-gray-400'
	}
	return colorMap[ext] || 'text-gray-500'
}

export function getMimeType(filePath: string): string {
	const ext = path.extname(filePath).toLowerCase()
	const mimeTypes: { [key: string]: string } = {
		'.pdf': 'application/pdf',
		'.html': 'text/html',
		'.htm': 'text/html',
		'.css': 'text/css',
		'.js': 'application/javascript',
		'.json': 'application/json',
		'.png': 'image/png',
		'.jpg': 'image/jpeg',
		'.jpeg': 'image/jpeg',
		'.gif': 'image/gif',
		'.svg': 'image/svg+xml',
		'.ico': 'image/x-icon',
		'.txt': 'text/plain',
		'.md': 'text/markdown',
		'.zip': 'application/zip',
		'.doc': 'application/msword',
		'.docx':
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'.r': 'text/plain'
	}
	return mimeTypes[ext] || 'application/octet-stream'
}

export function generateBreadcrumb(currentPath: string): string {
	if (!currentPath)
		return '<a href="/" class="text-blue-500 no-underline font-medium hover:underline">root</a>'

	const parts = currentPath.split('/').filter(Boolean)
	let breadcrumbs =
		'<a href="/" class="text-blue-500 no-underline font-medium hover:underline">root</a>'
	let accumPath = ''

	for (const part of parts) {
		accumPath += `/${part}`
		breadcrumbs += ` → <a href="${accumPath}" class="text-blue-500 no-underline font-medium hover:underline">${part}</a>`
	}

	return breadcrumbs
}
