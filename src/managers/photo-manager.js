// 照片管理器
// 负责照片的上传、压缩、存储和管理

import localforage from 'localforage';

export const PhotoManager = {
  // 配置
  CONFIG: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB原始文件限制
    MAX_COMPRESSED_SIZE: 200 * 1024, // 200KB压缩后限制
    MAX_PHOTOS_PER_RECORD: 10,
    COMPRESSION_QUALITY: 0.8, // JPEG压缩质量（0-1）
    MAX_WIDTH: 1920, // 最大宽度
    MAX_HEIGHT: 1080, // 最大高度
    STORAGE_KEY: 'travelnet_photos'
  },

  // 初始化照片存储
  async init() {
    try {
      // 配置独立的照片存储
      await localforage.config({
        name: 'TravelNet_Photos',
        version: 1.0,
        storeName: 'photos_store',
        description: 'TravelNet照片存储'
      });
      
      console.log('照片存储初始化完成');
      return true;
    } catch (error) {
      console.error('照片存储初始化失败:', error);
      return false;
    }
  },

  // 压缩图片
  async compressImage(file, options = {}) {
    return new Promise((resolve, reject) => {
      // 参数合并
      const config = {
        quality: options.quality || this.CONFIG.COMPRESSION_QUALITY,
        maxWidth: options.maxWidth || this.CONFIG.MAX_WIDTH,
        maxHeight: options.maxHeight || this.CONFIG.MAX_HEIGHT,
        maxSizeKB: options.maxSizeKB || (this.CONFIG.MAX_COMPRESSED_SIZE / 1024)
      };
      
      // 检查文件大小
      if (file.size > this.CONFIG.MAX_FILE_SIZE) {
        reject(new Error(`文件过大: ${(file.size / 1024 / 1024).toFixed(2)}MB > ${this.CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`));
        return;
      }
      
      // 创建图片对象
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      img.onload = () => {
        // 计算缩放比例
        let width = img.width;
        let height = img.height;
        
        if (width > config.maxWidth || height > config.maxHeight) {
          const ratio = Math.min(
            config.maxWidth / width,
            config.maxHeight / height
          );
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        // 创建canvas进行压缩
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // 获取压缩后的数据URL
        let dataUrl = canvas.toDataURL('image/jpeg', config.quality);
        
        // 检查压缩后的大小
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const padding = dataUrl.endsWith('==') ? 2 : dataUrl.endsWith('=') ? 1 : 0;
        const fileSizeKB = (base64Length * 0.75 - padding) / 1024;
        
        // 如果仍然太大，继续降低质量
        if (fileSizeKB > config.maxSizeKB) {
          let attempts = 0;
          const maxAttempts = 5;
          let currentQuality = config.quality;
          
          while (fileSizeKB > config.maxSizeKB && attempts < maxAttempts) {
            currentQuality *= 0.8; // 每次降低20%质量
            dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
            const newBase64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
            const newPadding = dataUrl.endsWith('==') ? 2 : dataUrl.endsWith('=') ? 1 : 0;
            const newFileSizeKB = (newBase64Length * 0.75 - newPadding) / 1024;
            
            if (newFileSizeKB <= config.maxSizeKB) {
              break;
            }
            attempts++;
          }
          
          if (fileSizeKB > config.maxSizeKB && attempts >= maxAttempts) {
            console.warn(`压缩后文件大小仍超过限制: ${fileSizeKB.toFixed(2)}KB > ${config.maxSizeKB}KB`);
          }
        }
        
        resolve({
          originalFile: file,
          compressedDataUrl: dataUrl,
          originalSizeKB: file.size / 1024,
          compressedSizeKB: Math.floor((dataUrl.length * 0.75) / 1024),
          width: width,
          height: height,
          quality: config.quality
        });
      };
      
      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };
      
      // 开始读取文件
      reader.readAsDataURL(file);
    });
  },

  // 批量压缩图片
  async compressImages(files, options = {}) {
    const results = {
      success: [],
      failed: []
    };
    
    for (const file of files) {
      try {
        const compressed = await this.compressImage(file, options);
        results.success.push(compressed);
      } catch (error) {
        results.failed.push({
          file: file,
          error: error.message
        });
      }
    }
    
    return results;
  },

  // 保存照片到存储
  async savePhoto(recordId, photoData) {
    try {
      const key = `${this.CONFIG.STORAGE_KEY}_${recordId}`;
      let photos = await this.getPhotos(recordId);
      
      // 检查照片数量限制
      if (photos.length >= this.CONFIG.MAX_PHOTOS_PER_RECORD) {
        throw new Error(`已达到照片数量限制（最多 ${this.CONFIG.MAX_PHOTOS_PER_RECORD} 张）`);
      }
      
      // 添加照片
      const photoWithMetadata = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        dataUrl: photoData.compressedDataUrl,
        originalName: photoData.originalFile.name,
        originalSizeKB: photoData.originalSizeKB,
        compressedSizeKB: photoData.compressedSizeKB,
        width: photoData.width,
        height: photoData.height,
        uploadedAt: new Date().toISOString(),
        recordId: recordId
      };
      
      photos.push(photoWithMetadata);
      await localforage.setItem(key, photos);
      
      console.log(`照片已保存: ${photoData.originalFile.name} (${photoData.compressedSizeKB}KB)`);
      
      return {
        success: true,
        photo: photoWithMetadata
      };
    } catch (error) {
      console.error('保存照片失败:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // 批量保存照片
  async savePhotos(recordId, compressedPhotos) {
    const results = {
      success: [],
      failed: []
    };
    
    for (const photoData of compressedPhotos) {
      const result = await this.savePhoto(recordId, photoData);
      if (result.success) {
        results.success.push(result.photo);
      } else {
        results.failed.push({
          file: photoData.originalFile,
          error: result.message
        });
      }
    }
    
    return results;
  },

  // 获取记录的所有照片
  async getPhotos(recordId) {
    try {
      const key = `${this.CONFIG.STORAGE_KEY}_${recordId}`;
      const photos = await localforage.getItem(key) || [];
      return photos;
    } catch (error) {
      console.error('获取照片失败:', error);
      return [];
    }
  },

  // 删除照片
  async deletePhoto(recordId, photoId) {
    try {
      const photos = await this.getPhotos(recordId);
      const initialCount = photos.length;
      
      const filteredPhotos = photos.filter(photo => photo.id !== photoId);
      
      if (filteredPhotos.length === initialCount) {
        return {
          success: false,
          message: '未找到要删除的照片'
        };
      }
      
      const key = `${this.CONFIG.STORAGE_KEY}_${recordId}`;
      await localforage.setItem(key, filteredPhotos);
      
      return {
        success: true,
        deletedCount: initialCount - filteredPhotos.length
      };
    } catch (error) {
      console.error('删除照片失败:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // 删除记录的所有照片
  async deleteAllPhotos(recordId) {
    try {
      const key = `${this.CONFIG.STORAGE_KEY}_${recordId}`;
      await localforage.removeItem(key);
      return { success: true };
    } catch (error) {
      console.error('删除所有照片失败:', error);
      return { success: false, message: error.message };
    }
  },

  // 获取照片存储使用情况
  async getStorageUsage() {
    try {
      let totalSize = 0;
      let totalPhotos = 0;
      
      const keys = await localforage.keys();
      const photoKeys = keys.filter(key => key.startsWith(this.CONFIG.STORAGE_KEY));
      
      for (const key of photoKeys) {
        const photos = await localforage.getItem(key) || [];
        totalPhotos += photos.length;
        
        for (const photo of photos) {
          // 估算Base64字符串的大小
          if (photo.dataUrl) {
            totalSize += photo.dataUrl.length * 0.75;
          }
        }
      }
      
      return {
        totalPhotos: totalPhotos,
        totalSizeKB: Math.floor(totalSize / 1024),
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
      };
    } catch (error) {
      console.error('获取存储使用情况失败:', error);
      return { totalPhotos: 0, totalSizeKB: 0, totalSizeMB: 0 };
    }
  },

  // 清理过大的照片（如果需要）
  async cleanupLargePhotos(maxSizeMB = 10) {
    try {
      const storageInfo = await this.getStorageUsage();
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      const currentSizeBytes = storageInfo.totalSizeKB * 1024;
      
      if (currentSizeBytes <= maxSizeBytes) {
        return {
          success: true,
          message: '存储使用正常，无需清理',
          cleanedCount: 0,
          freedSizeKB: 0
        };
      }
      
      // 按上传时间排序，清理最早的图片
      let allPhotos = [];
      const keys = await localforage.keys();
      const photoKeys = keys.filter(key => key.startsWith(this.CONFIG.STORAGE_KEY));
      
      for (const key of photoKeys) {
        const photos = await localforage.getItem(key) || [];
        const recordId = key.replace(`${this.CONFIG.STORAGE_KEY}_`, '');
        
        for (const photo of photos) {
          allPhotos.push({
            ...photo,
            storageKey: key,
            recordId: recordId
          });
        }
      }
      
      // 按上传时间排序（最早的在前）
      allPhotos.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
      
      let cleanedCount = 0;
      let freedSizeKB = 0;
      
      // 清理照片直到满足存储限制
      while (allPhotos.length > 0 && currentSizeBytes - freedSizeKB * 1024 > maxSizeBytes) {
        const photoToDelete = allPhotos.shift();
        
        try {
          // 从存储中删除
          const photos = await this.getPhotos(photoToDelete.recordId);
          const filteredPhotos = photos.filter(p => p.id !== photoToDelete.id);
          
          const key = `${this.CONFIG.STORAGE_KEY}_${photoToDelete.recordId}`;
          await localforage.setItem(key, filteredPhotos);
          
          cleanedCount++;
          freedSizeKB += photoToDelete.compressedSizeKB || 50; // 估算
        } catch (error) {
          console.error(`清理照片失败: ${photoToDelete.id}`, error);
        }
      }
      
      return {
        success: true,
        message: `清理了 ${cleanedCount} 张照片，释放了 ${freedSizeKB.toFixed(2)}KB 空间`,
        cleanedCount: cleanedCount,
        freedSizeKB: freedSizeKB
      };
    } catch (error) {
      console.error('清理照片失败:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // 导出照片为Base64数组（兼容现有系统）
  async exportPhotosAsBase64(recordId) {
    const photos = await this.getPhotos(recordId);
    return photos.map(photo => photo.dataUrl);
  },

  // 导入Base64照片到新系统
  async importBase64Photos(recordId, base64Photos) {
    try {
      const photos = [];
      let importedCount = 0;
      
      for (const base64Str of base64Photos) {
        // 估算大小
        const base64Length = base64Str.length - (base64Str.indexOf(',') + 1);
        const padding = base64Str.endsWith('==') ? 2 : base64Str.endsWith('=') ? 1 : 0;
        const sizeKB = Math.floor((base64Length * 0.75 - padding) / 1024);
        
        const photo = {
          id: `photo_import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dataUrl: base64Str,
          originalName: `imported_${importedCount + 1}.jpg`,
          originalSizeKB: sizeKB,
          compressedSizeKB: sizeKB,
          width: 800, // 未知，设为默认值
          height: 600,
          uploadedAt: new Date().toISOString(),
          recordId: recordId
        };
        
        photos.push(photo);
        importedCount++;
        
        // 检查数量限制
        if (photos.length >= this.CONFIG.MAX_PHOTOS_PER_RECORD) {
          console.warn(`已达到照片数量限制，停止导入`);
          break;
        }
      }
      
      const key = `${this.CONFIG.STORAGE_KEY}_${recordId}`;
      await localforage.setItem(key, photos);
      
      return {
        success: true,
        importedCount: importedCount
      };
    } catch (error) {
      console.error('导入照片失败:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
};