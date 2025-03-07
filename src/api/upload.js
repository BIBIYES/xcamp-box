import request from '@/utils/request'

/**
 * 上传封面图片
 * @param {string} imageData - Base64格式的图片数据
 * @returns {Promise}
 */
export const uploadCoverImage = (imageData) => {
  // 模拟上传延迟
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '封面图片上传成功',
        data: {
          imageUrl: 'https://example.com/cover-image.jpg'
        }
      })
    }, 1000)
  })
}

/**
 * 上传相册图片
 * @param {Array<string>} imageDataList - Base64格式的图片数据数组
 * @returns {Promise}
 */
export const uploadAlbumImages = (imageDataList) => {
  // 模拟上传延迟
  return new Promise((resolve) => {
    setTimeout(() => {
      const imageUrls = imageDataList.map((_, index) => 
        `https://example.com/album-image-${index + 1}.jpg`
      )
      resolve({
        code: 200,
        message: '相册图片上传成功',
        data: {
          imageUrls
        }
      })
    }, 1500)
  })
}