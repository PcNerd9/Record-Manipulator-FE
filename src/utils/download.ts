/**
 * Download utility
 * Handles file downloads from Blob or URL
 */

/**
 * Download a file from a Blob
 * @param blob - Blob to download
 * @param filename - Name of the file to download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  // Create object URL from blob
  const url = URL.createObjectURL(blob)

  // Create temporary anchor element
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'

  // Append to body, click, and remove
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Revoke object URL after a short delay to allow download to start
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)
}

/**
 * Download a file from a URL
 * @param url - URL of the file to download
 * @param filename - Name of the file to download
 */
export function downloadUrl(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Download a file from a Blob with automatic filename detection
 * Attempts to extract filename from Content-Disposition header if available
 * @param blob - Blob to download
 * @param defaultFilename - Default filename if extraction fails
 * @param contentType - Optional content type for filename extension
 */
export function downloadBlobWithAutoFilename(
  blob: Blob,
  defaultFilename: string,
  contentType?: string
): void {
  let filename = defaultFilename

  // Try to extract filename from blob type if available
  if (contentType) {
    const extension = getExtensionFromContentType(contentType)
    if (extension && !filename.includes('.')) {
      filename = `${filename}.${extension}`
    }
  }

  downloadBlob(blob, filename)
}

/**
 * Get file extension from content type
 * @param contentType - MIME type (e.g., 'application/vnd.ms-excel')
 * @returns File extension without dot
 */
function getExtensionFromContentType(contentType: string): string | null {
  const typeMap: Record<string, string> = {
    'text/csv': 'csv',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/json': 'json',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
  }

  // Check exact match first
  if (typeMap[contentType]) {
    return typeMap[contentType]
  }

  // Check partial match (e.g., 'application/vnd.ms-excel; charset=utf-8')
  for (const [type, ext] of Object.entries(typeMap)) {
    if (contentType.includes(type)) {
      return ext
    }
  }

  return null
}

/**
 * Download helper - Main export
 * Automatically handles Blob or URL
 */
export const download = {
  blob: downloadBlob,
  url: downloadUrl,
  auto: downloadBlobWithAutoFilename,
}
