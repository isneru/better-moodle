import type { FileNode } from '../types/index.ts'
import {
	getFileIcon,
	getFileIconColor,
	generateBreadcrumb
} from '../utils/fileSystem.ts'

export function generateTreeHTML(
	nodes: FileNode[],
	level: number = 0,
	currentPath: string = ''
): string {
	let html = ''

	for (const node of nodes) {
		const indent = '  '.repeat(level)

		if (node.type === 'directory') {
			html += `${indent}<div class="folder-item mb-1">\n`
			html += `${indent}  <div class="folder-header flex items-center py-2 px-3 rounded-md hover:bg-gray-50 transition-colors cursor-pointer" onclick="toggleFolder(this)">\n`
			html += `${indent}    <svg class="w-4 h-4 mr-2 text-gray-500 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">\n`
			html += `${indent}      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>\n`
			html += `${indent}    </svg>\n`
			html += `${indent}    <svg class="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">\n`
			html += `${indent}      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>\n`
			html += `${indent}    </svg>\n`
			html += `${indent}    <a href="/${node.path}" class="folder-name font-medium text-gray-700 hover:text-blue-600 inline no-underline" onclick="event.stopPropagation()">${node.name}</a>\n`
			html += `${indent}  </div>\n`
			html += `${indent}  <div class="folder-content ml-6 border-l border-gray-200 pl-4">\n`
			if (node.children) {
				html += generateTreeHTML(node.children, level + 2, node.path)
			}
			html += `${indent}  </div>\n`
			html += `${indent}</div>\n`
		} else {
			const fileIcon = getFileIcon(node.name)
			const iconColor = getFileIconColor(node.name)
			html += `${indent}<div class="file-item flex items-center py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">\n`
			html += `${indent}  <span class="w-4 h-4 mr-3 text-lg flex items-center justify-center">${fileIcon}</span>\n`
			html += `${indent}  <a href="/${node.path}" class="file-link text-gray-700 hover:text-blue-600 no-underline inline font-medium" target="_blank">${node.name}</a>\n`
			html += `${indent}</div>\n`
		}
	}

	return html
}

export function generatePageHTML(
	fileTree: FileNode[],
	currentPath: string,
	title: string
): string {
	const treeHTML = generateTreeHTML(fileTree)
	const breadcrumb = generateBreadcrumb(currentPath)

	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link href="/styles/output.css" rel="stylesheet">
    <link rel="icon" type="image/png" href="/favicon.png">
</head>
<body class="font-sans bg-gray-100 m-0">
    <div class="min-h-screen">
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-8 py-6">
            <div class="flex items-center justify-center mb-2">
                <h1 class="text-3xl font-bold">Better Moodle</h1>
            </div>
            <p class="text-center text-emerald-100 text-lg">No bullsh*t session timeouts, just seamless access to your course materials.</p>
            <p class="text-center text-emerald-100 text-lg">All in one place.</p>
        </div>

        <!-- Navigation Bar -->
        <div class="bg-white border-b border-gray-200 px-8 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center text-gray-600 font-mono">
                    <span class="font-medium">${breadcrumb}</span>
                </div>
                <div class="relative">
                    <input
                        type="text"
                        placeholder="Search files..."
                        class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-64"
                        id="searchInput"
                    >
                    <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
                    </svg>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto bg-white rounded-lg shadow-sm m-4">
            <!-- File Tree -->
            <div class="p-6">
                ${treeHTML}
            </div>
        </div>
    </div>

    <script>
        const STORAGE_KEY = 'better-moodle-neru';

        // Get folder path for storage
        function getFolderPath(folderElement) {
            const folderName = folderElement.querySelector('.folder-name').textContent;
            let path = folderName;
            let parent = folderElement.closest('.folder-content');

            while (parent) {
                const parentFolder = parent.previousElementSibling?.querySelector('.folder-name');
                if (parentFolder) {
                    path = parentFolder.textContent + '/' + path;
                }
                parent = parent.closest('.folder-item')?.closest('.folder-content');
            }

            return path;
        }

        // Load folder states from localStorage
        function loadFolderStates() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                return stored ? JSON.parse(stored) : {};
            } catch (e) {
                console.warn('Error loading folder states:', e);
                return {};
            }
        }

        // Save folder states to localStorage
        function saveFolderStates(states) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
            } catch (e) {
                console.warn('Error saving folder states:', e);
            }
        }

        function toggleFolder(element) {
            const content = element.nextElementSibling;
            const chevronIcon = element.querySelector('svg:first-child');
            const folderItem = element.closest('.folder-item');
            const folderPath = getFolderPath(folderItem);

            console.log('Toggling folder:', folderPath);
            console.log('Content element:', content);

            const folderStates = loadFolderStates();

            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                chevronIcon.style.transform = 'rotate(0deg)';
                folderStates[folderPath] = 'open';
                console.log('Showing folder');
            } else {
                content.classList.add('hidden');
                chevronIcon.style.transform = 'rotate(-90deg)';
                folderStates[folderPath] = 'closed';
                console.log('Hiding folder');
            }

            saveFolderStates(folderStates);
        }

        // Initialize all folders based on localStorage or default to collapsed
        document.addEventListener('DOMContentLoaded', function() {
            const folders = document.querySelectorAll('.folder-content');
            const chevronIcons = document.querySelectorAll('.folder-header svg:first-child');
            const folderStates = loadFolderStates();

            console.log('Found folders:', folders.length);
            console.log('Loaded states:', folderStates);

            // Set default styles for all chevrons
            chevronIcons.forEach(icon => {
                icon.style.transition = 'transform 0.2s ease';
            });

            // Apply states from localStorage or default to collapsed
            folders.forEach(folder => {
                const folderItem = folder.closest('.folder-item');
                const folderPath = getFolderPath(folderItem);
                const chevronIcon = folderItem.querySelector('.folder-header svg:first-child');

                if (folderStates[folderPath] === 'open') {
                    folder.classList.remove('hidden');
                    chevronIcon.style.transform = 'rotate(0deg)';
                } else {
                    folder.classList.add('hidden');
                    chevronIcon.style.transform = 'rotate(-90deg)';
                }
            });
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const fileItems = document.querySelectorAll('.file-item, .folder-item');

            if (searchTerm === '') {
                // Reset everything to original state when search is cleared
                fileItems.forEach(item => {
                    item.style.display = '';
                });

                // Restore folder states from localStorage
                const folders = document.querySelectorAll('.folder-content');
                const chevronIcons = document.querySelectorAll('.folder-header svg:first-child');
                const folderStates = loadFolderStates();

                folders.forEach(folder => {
                    const folderItem = folder.closest('.folder-item');
                    const folderPath = getFolderPath(folderItem);
                    const chevronIcon = folderItem.querySelector('.folder-header svg:first-child');

                    if (folderStates[folderPath] === 'open') {
                        folder.classList.remove('hidden');
                        chevronIcon.style.transform = 'rotate(0deg)';
                    } else {
                        folder.classList.add('hidden');
                        chevronIcon.style.transform = 'rotate(-90deg)';
                    }
                });
            } else {
                // Search mode: show/hide based on search term
                fileItems.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        item.style.display = '';
                        // Show parent folders if a file matches
                        let parent = item.closest('.folder-content');
                        while (parent) {
                            parent.classList.remove('hidden');
                            const parentHeader = parent.previousElementSibling;
                            if (parentHeader) {
                                const chevron = parentHeader.querySelector('svg:first-child');
                                if (chevron) chevron.style.transform = 'rotate(0deg)';
                            }
                            parent = parent.closest('.folder-item')?.closest('.folder-content');
                        }
                    } else {
                        item.style.display = 'none';
                    }
                });
            }
        });
    </script>
</body>
</html>
        `
}
