export type FileNode = {
	name: string
	type: 'file' | 'directory'
	path: string
	children?: FileNode[]
}

export type MimeTypeMap = {
	[key: string]: string
}

export type FileIconMap = {
	[key: string]: string
}
