
/**
 * Transforms a GitHub file tree into a 3D Graph dataset
 * @param {Array} fileTree - Array of file objects from GitHub API
 * @returns {Object} { nodes, links }
 */
export function transformRepoToGraph(fileTree) {
    if (!fileTree || !Array.isArray(fileTree)) return { nodes: [], links: [] };

    const nodes = [];
    const links = [];
    const idMap = new Map();

    // Color Palette per file type
    // Color Palette per file type (Vibrant / Neon)
    const colors = {
        js: "#F7DF1E", // Neon Yellow
        jsx: "#61DAFB", // React Cyan
        ts: "#3178C6", // TS Deep Blue
        tsx: "#007ACC", // VS Code Blue
        css: "#2965F1", // CSS Blue
        scss: "#CD6799", // Sass Pink
        html: "#E34C26", // HTML Orange
        json: "#F0E68C", // Light Yellow
        py: "#FFD700", // Python Gold
        md: "#9E9E9E", // Markdown Grey

        // Backend / Configs
        java: "#B07219",
        c: "#555555",
        cpp: "#F34B7D",
        go: "#00ADD8",
        dockerfile: "#2496ED",
        yml: "#CB171E",
        yaml: "#CB171E",

        // Folders
        folder: "#FF00FF", // Neon Magenta for Folders (Nodes)
        root: "#FFFFFF",
        unknown: "#00FF00" // Neon Green for unknown
    };

    // Helper to get color
    const getColor = (path, type) => {
        if (type === 'tree') return colors.folder;
        const ext = path.split('.').pop().toLowerCase();
        return colors[ext] || colors.unknown;
    };

    // Helper to get size
    const getSize = (item) => {
        if (item.type === 'tree') return 5; // Folder size
        // Scale file size log-like: min 1, max 10
        return Math.max(1, Math.min(10, Math.log(item.size || 100)));
    };

    // 1. Create Nodes
    // Add Root Node
    nodes.push({
        id: "root",
        name: "root",
        color: "#ffffff",
        val: 8,
        type: "root"
    });

    fileTree.forEach(item => {
        const node = {
            id: item.path,
            name: item.path.split('/').pop(),
            path: item.path,
            color: getColor(item.path, item.type),
            val: getSize(item),
            type: item.type
        };
        nodes.push(node);
        idMap.set(item.path, node);
    });

    // 2. Create Directory Links (Parent structure)
    fileTree.forEach(item => {
        const parts = item.path.split('/');
        if (parts.length === 1) {
            // Linked to root
            links.push({
                source: "root",
                target: item.path,
                color: "rgba(255,255,255,0.1)"
            });
        } else {
            // Linked to parent folder
            parts.pop(); // Remove self
            const parentPath = parts.join('/');
            // Only link if parent exists in tree (mostly yes)
            // If parent is not in tree (partial fetch), link to root
            if (idMap.has(parentPath)) {
                links.push({
                    source: parentPath,
                    target: item.path,
                    color: "rgba(255,255,255,0.2)"
                });
            } else {
                links.push({
                    source: "root",
                    target: item.path,
                    color: "rgba(255,255,255,0.1)"
                });
            }
        }
    });

    // 3. (Optional) Create Dependency Links logic would go here
    // ... regex parsing of 'import' statments if content is available ...

    return { nodes, links };
}
