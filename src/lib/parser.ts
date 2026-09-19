export type FileKind =
  | "folder"
  | "pdf"
  | "image"
  | "audio"
  | "video"
  | "code"
  | "text"
  | "archive"
  | "unknown";

export interface FileEntry {
  name: string;
  url: string;
  kind: FileKind;
  size: string;
  date: string;
  rawType: string;
}

export function parseDirectory(): FileEntry[] {
  const entries: FileEntry[] = [];
  const rows = document.querySelectorAll('table#tbody tr, table tbody tr');
  
  if (rows.length === 0) {
    // Fallback if structure is different
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      if (link.href && !link.href.endsWith('../') && link.textContent !== 'Parent Directory' && link.textContent !== '..') {
         const name = link.textContent || '';
         const isDir = link.href.endsWith('/');
         entries.push({
           name,
           url: link.href,
           kind: isDir ? 'folder' : determineKind(name),
           size: '',
           date: '',
           rawType: isDir ? 'Folder' : name.split('.').pop()?.toUpperCase() || 'File'
         });
      }
    });
    return entries;
  }

  rows.forEach(row => {
    const a = row.querySelector('a');
    if (!a) return;
    if (a.textContent === 'Parent Directory' || a.textContent === '..') return;

    const name = a.textContent || '';
    const url = a.href;
    const isDir = url.endsWith('/');
    
    let size = '';
    let date = '';
    
    const tds = row.querySelectorAll('td');
    // Chrome directory listing typically has:
    // [Icon] [Name] [Size] [Date] or similar. 
    // We'll just grab text from tds assuming typical layout.
    if (tds.length >= 3) {
      size = tds[1].textContent?.trim() || '';
      date = tds[2].textContent?.trim() || '';
    }
    if (tds.length === 4) {
       size = tds[2].textContent?.trim() || '';
       date = tds[3].textContent?.trim() || '';
    }
    
    entries.push({
      name,
      url,
      kind: isDir ? 'folder' : determineKind(name),
      size,
      date,
      rawType: isDir ? 'Folder' : name.split('.').pop()?.toUpperCase() || 'File'
    });
  });
  
  return entries;
}

function determineKind(name: string): FileKind {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'pdf': return 'pdf';
    case 'png': case 'jpg': case 'jpeg': case 'webp': case 'gif': case 'svg': case 'bmp': return 'image';
    case 'mp3': case 'wav': case 'ogg': case 'm4a': case 'aac': return 'audio';
    case 'mp4': case 'webm': case 'mkv': return 'video';
    case 'js': case 'ts': case 'jsx': case 'tsx': case 'py': case 'cpp': case 'c': case 'java': case 'html': case 'css': case 'sql': case 'json': return 'code';
    case 'txt': case 'md': case 'csv': return 'text';
    case 'zip': case 'rar': case '7z': case 'tar': case 'gz': return 'archive';
    default: return 'unknown';
  }
}
