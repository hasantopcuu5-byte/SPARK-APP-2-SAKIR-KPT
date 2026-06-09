function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = src
  })
}

export async function resizeImageToDataUrl(
  file: File,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number },
): Promise<string> {
  const { maxWidth = 1280, maxHeight = 1280, quality = 0.82 } = options ?? {}

  try {
    const dataUrl = await readFileAsDataUrl(file)
    const img = await loadImage(dataUrl)

    const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
    const width = Math.round(img.width * scale)
    const height = Math.round(img.height * scale)

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext("2d")
    if (!ctx) return dataUrl

    ctx.drawImage(img, 0, 0, width, height)
    return canvas.toDataURL("image/jpeg", quality)
  } catch {
    return readFileAsDataUrl(file)
  }
}
