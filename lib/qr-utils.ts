import QRCode from 'qrcode'
import path from 'path'
import fs from 'fs'

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
const qrDir = path.join(uploadsDir, 'qr-codes')
const imagesDir = path.join(uploadsDir, 'images')

export function ensureDirectoriesExist() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
  if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true })
  }
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true })
  }
}

export async function generateQRCode(boxId: number, boxNumber: number): Promise<string> {
  ensureDirectoriesExist()
  
  // Create URL that points to the box contents page
  const boxUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/box/${boxId}`
  
  // Generate QR code
  const qrFileName = `box-${boxNumber}-qr.png`
  const qrFilePath = path.join(qrDir, qrFileName)
  
  await QRCode.toFile(qrFilePath, boxUrl, {
    errorCorrectionLevel: 'M',
    type: 'png',
    quality: 0.92,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    width: 256
  })
  
  return `/uploads/qr-codes/${qrFileName}`
}

export function saveUploadedImage(buffer: Buffer, originalName: string, type: 'box' | 'item', id: number): string {
  ensureDirectoriesExist()
  
  const ext = path.extname(originalName).toLowerCase()
  const fileName = `${type}-${id}-${Date.now()}${ext}`
  const filePath = path.join(imagesDir, fileName)
  
  fs.writeFileSync(filePath, buffer)
  
  return `/uploads/images/${fileName}`
}

export function deleteImage(imagePath: string) {
  if (imagePath && imagePath.startsWith('/uploads/')) {
    const fullPath = path.join(process.cwd(), 'public', imagePath)
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
    }
  }
}

export function isValidImageType(mimeType: string): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return validTypes.includes(mimeType)
}

export function validateImageSize(size: number): boolean {
  const maxSize = 10 * 1024 * 1024 // 10MB
  return size <= maxSize
} 