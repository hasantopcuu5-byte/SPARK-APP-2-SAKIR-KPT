import imageCompression from "browser-image-compression"

function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

export async function resizeImageToDataUrl(
  file: File,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number },
): Promise<string> {
  const { maxWidth = 1024, maxHeight = 1024, quality = 0.7 } = options ?? {}

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.08, // ~80KB
      maxWidthOrHeight: Math.max(maxWidth, maxHeight),
      useWebWorker: true,
      initialQuality: quality
    })
    
    return await fileToBase64(compressedFile)
  } catch (error) {
    console.error("Image compression error:", error)
    return fileToBase64(file)
  }
}
