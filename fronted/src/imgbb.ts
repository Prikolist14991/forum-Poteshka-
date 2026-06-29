// ImgBB upload utility

const IMGBB_API_KEY = '60882755bc8e44dd0b54cc65e0a4c09b'

export async function uploadImageToImgbb(file: File): Promise<string | null> {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('key', IMGBB_API_KEY)

  try {
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      console.error('ImgBB upload error:', response.status)
      return null
    }

    const data = await response.json()
    
    if (data.success && data.data?.url) {
      return data.data.url
    }

    return null
  } catch (error) {
    console.error('ImgBB upload failed:', error)
    return null
  }
}
