// 数据管理器
// 负责城市数据加载、用户数据持久化和存储管理

import { CONFIG } from '../config.js';
import { AppState } from '../state/app-state.js';
import { GeoUtils } from '../utils/geo.js';
import { CityValidator } from '../utils/city-validator.js';
import localforage from 'localforage';
import { PhotoManager } from './photo-manager.js';

export const DataManager = {
  async initStorage() {
    try {
      // 配置localforage
      localforage.config({
        name: 'TravelNet',
        version: 1.0,
        storeName: 'travelnet_store',
        description: 'TravelNet应用数据存储'
      });
      
      console.log('IndexedDB存储初始化完成');
      return true;
    } catch (error) {
      console.error('存储初始化失败:', error);
      return false;
    }
  },

  async loadCitiesData() {
    try {
      // 使用基于base URL的路径，确保在GitHub Pages上正常工作
      const baseUrl = import.meta.env.BASE_URL || './';
      const citiesUrl = `${baseUrl}data/cities.json`.replace(/\/\//g, '/');
      
      const response = await fetch(citiesUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      AppState.cities = await response.json();
      
      // 计算每个城市到中心点的距离和方位角
      AppState.cities.forEach(city => {
        city.distance = GeoUtils.calculateDistance(
          CONFIG.centerLat, CONFIG.centerLng,
          city.lat, city.lng
        );
        city.bearing = GeoUtils.calculateBearing(
          CONFIG.centerLat, CONFIG.centerLng,
          city.lat, city.lng
        );
      });
      
      // 过滤只保留地级市
      AppState.cities = CityValidator.filterPrefectureLevelCities(AppState.cities);
      
      // 筛选500公里内的城市
      AppState.filteredCities = AppState.cities.filter(
        city => city.distance <= CONFIG.radiusKm
      );
      
      console.log(`加载了 ${AppState.cities.length} 个城市，其中 ${AppState.filteredCities.length} 个在500公里内`);
      
      // 合并自定义城市
      await this.mergeCustomCities();
      
      return true;
    } catch (error) {
      console.error('加载城市数据失败:', error);
      
      // 如果加载失败，使用模拟数据
      await this.generateSampleData();
      return false;
    }
  },

  async generateSampleData() {
    console.log('使用示例数据');
    
    // 北京周边的一些城市示例
    const sampleCities = [
      { id: 'city_001', name: '北京市区', lat: 39.9042, lng: 116.4074, population: 21540000, description: '中国首都，政治文化中心。' },
      { id: 'city_002', name: '天津市', lat: 39.3434, lng: 117.3616, population: 13870000, description: '北方重要港口城市。' },
      { id: 'city_003', name: '石家庄市', lat: 38.0428, lng: 114.5149, population: 11030000, description: '河北省省会，华北重要城市。' },
      { id: 'city_004', name: '唐山市', lat: 39.6309, lng: 118.1802, population: 7718000, description: '河北重要工业城市。' },
      { id: 'city_005', name: '保定市', lat: 38.8740, lng: 115.4646, population: 9243000, description: '历史文化名城。' },
      { id: 'city_006', name: '张家口市', lat: 40.8244, lng: 114.8879, population: 4118000, description: '2022年冬奥会举办城市之一。' },
      { id: 'city_007', name: '承德市', lat: 40.9734, lng: 117.9322, population: 3354000, description: '避暑山庄所在地。' },
      { id: 'city_008', name: '秦皇岛市', lat: 39.9354, lng: 119.6005, population: 3073000, description: '著名海滨旅游城市。' },
      { id: 'city_009', name: '廊坊市', lat: 39.5219, lng: 116.6856, population: 4359000, description: '京津之间的重要城市。' },
      { id: 'city_010', name: '沧州市', lat: 38.3045, lng: 116.8388, population: 6833000, description: '武术之乡。' },
      { id: 'city_011', name: '衡水市', lat: 37.7389, lng: 115.6702, population: 4213000, description: '教育名城。' },
      { id: 'city_012', name: '邢台市', lat: 37.0706, lng: 114.5044, population: 7111000, description: '历史悠久的城市。' },
      { id: 'city_013', name: '邯郸市', lat: 36.6256, lng: 114.5391, population: 9414000, description: '赵国古都。' },
      { id: 'city_014', name: '大同市', lat: 40.0768, lng: 113.3001, population: 3106000, description: '山西北部重要城市，云冈石窟所在地。' },
      { id: 'city_015', name: '朔州市', lat: 39.3318, lng: 112.4328, population: 1535000, description: '山西北部城市。' },
      { id: 'city_016', name: '呼和浩特市', lat: 40.8424, lng: 111.7480, population: 3126000, description: '内蒙古自治区首府。' },
      { id: 'city_017', name: '包头市', lat: 40.6574, lng: 109.8403, population: 2709000, description: '内蒙古重要工业城市。' },
      { id: 'city_018', name: '锡林浩特市', lat: 43.9332, lng: 116.0860, population: 260000, description: '锡林郭勒盟中心城市。' },
      { id: 'city_019', name: '沈阳市', lat: 41.8057, lng: 123.4315, population: 8106000, description: '辽宁省省会，东北重要城市。' },
      { id: 'city_020', name: '大连市', lat: 38.9137, lng: 121.6147, population: 7451000, description: '著名海滨城市。' }
    ];
    
    AppState.cities = sampleCities.map(city => {
      const distance = GeoUtils.calculateDistance(
        CONFIG.centerLat, CONFIG.centerLng,
        city.lat, city.lng
      );
      const bearing = GeoUtils.calculateBearing(
        CONFIG.centerLat, CONFIG.centerLng,
        city.lat, city.lng
      );
      
      return {
        ...city,
        distance,
        bearing
      };
    });
    
    AppState.filteredCities = AppState.cities.filter(
      city => city.distance <= CONFIG.radiusKm
    );
  },

  // 迁移旧版照片数据到PhotoManager
  async migratePhotosToPhotoManager() {
    try {
      let migratedCount = 0;
      
      for (const record of AppState.travelRecords) {
        if (record.photos && Array.isArray(record.photos) && record.photos.length > 0) {
          console.log(`迁移记录 ${record.id} 的照片 (${record.photos.length} 张)`);
          
          // 导入照片到PhotoManager
          const result = await PhotoManager.importBase64Photos(record.id, record.photos);
          
          if (result.success) {
            console.log(`已迁移 ${result.importedCount} 张照片`);
            migratedCount += result.importedCount;
            
            // 从记录中删除photos数组，避免重复存储
            delete record.photos;
          } else {
            console.warn(`照片迁移失败: ${result.message}`);
          }
        }
      }
      
      if (migratedCount > 0) {
        console.log(`照片迁移完成，共迁移 ${migratedCount} 张照片`);
        // 保存更新后的记录（不含照片数组）
        await this.saveUserData();
      }
      
      return migratedCount;
    } catch (error) {
      console.error('照片迁移失败:', error);
      return 0;
    }
  },

  async loadUserData() {
    try {
      // 加载已访问城市
      const visited = await localforage.getItem(CONFIG.storageKeys.visitedCities) || [];
      AppState.visitedCities = new Set(visited);
      
      // 加载旅游记录
      AppState.travelRecords = await localforage.getItem(CONFIG.storageKeys.travelRecords) || [];
      
      console.log('用户数据加载完成');
      
      // 迁移旧版照片数据
      await this.migratePhotosToPhotoManager();
      
      this.updateUIFromState();
      return true;
    } catch (error) {
      console.error('加载用户数据失败:', error);
      return false;
    }
  },

  async saveUserData() {
    try {
      await localforage.setItem(CONFIG.storageKeys.visitedCities, Array.from(AppState.visitedCities));
      await localforage.setItem(CONFIG.storageKeys.travelRecords, AppState.travelRecords);
      
      console.log('用户数据保存完成');
      return true;
    } catch (error) {
      console.error('保存用户数据失败:', error);
      return false;
    }
  },

  updateUIFromState() {
    // 更新城市计数
    const cityCountElement = document.getElementById('cityCount');
    if (cityCountElement) {
      cityCountElement.textContent = AppState.filteredCities.length;
    }
    
    // 更新存储使用情况
    this.updateStorageUsage();
  },

  async updateStorageUsage() {
    try {
      // 获取所有键值对的大小
      let totalSize = 0;
      const keys = await localforage.keys();
      
      for (const key of keys) {
        const value = await localforage.getItem(key);
        if (value) {
          totalSize += JSON.stringify(value).length;
        }
      }
      
      const usageElement = document.getElementById('storageUsage');
      if (usageElement) {
        const sizeKB = (totalSize / 1024).toFixed(2);
        usageElement.textContent = `本地存储: ${sizeKB} KB`;
      }
    } catch (error) {
      console.error('计算存储使用情况失败:', error);
    }
  },

  // 加载自定义城市
  async loadCustomCities() {
    try {
      const customCities = await localforage.getItem(CONFIG.storageKeys.customCities) || [];
      console.log(`加载了 ${customCities.length} 个自定义城市`);
      return customCities;
    } catch (error) {
      console.error('加载自定义城市失败:', error);
      return [];
    }
  },

  // 保存自定义城市
  async saveCustomCities(customCities) {
    try {
      await localforage.setItem(CONFIG.storageKeys.customCities, customCities);
      console.log(`保存了 ${customCities.length} 个自定义城市`);
      return true;
    } catch (error) {
      console.error('保存自定义城市失败:', error);
      return false;
    }
  },

  // 获取所有自定义城市
  getCustomCities() {
    // 自定义城市存储在AppState中吗？可能需要单独存储
    // 暂时返回空数组，后续实现
    return [];
  },

  // 添加自定义城市
  async addCustomCity(cityData) {
    try {
      // 验证必填字段
      if (!cityData.name || !cityData.lat || !cityData.lng) {
        throw new Error('城市名称、纬度和经度为必填项');
      }

      // 验证坐标范围
      const lat = parseFloat(cityData.lat);
      const lng = parseFloat(cityData.lng);
      if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
        throw new Error('无效的坐标值：纬度必须在-90到90之间，经度必须在-180到180之间');
      }

      // 加载现有自定义城市
      const existingCustomCities = await this.loadCustomCities();
      
      // 生成唯一ID
      const cityId = `custom_city_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 计算距离和方位角
      const distance = GeoUtils.calculateDistance(
        CONFIG.centerLat, CONFIG.centerLng,
        lat, lng
      );
      const bearing = GeoUtils.calculateBearing(
        CONFIG.centerLat, CONFIG.centerLng,
        lat, lng
      );

      // 创建城市对象
      const newCity = {
        id: cityId,
        name: cityData.name.trim(),
        lat: lat,
        lng: lng,
        population: parseInt(cityData.population) || 0,
        description: cityData.description || '',
        distance: distance,
        bearing: bearing,
        isCustom: true, // 标记为自定义城市
        addedDate: new Date().toISOString()
      };

      // 添加到自定义城市列表
      existingCustomCities.push(newCity);
      
      // 保存到存储
      await this.saveCustomCities(existingCustomCities);
      
      // 合并到应用状态
      await this.mergeCustomCities();
      
      console.log(`成功添加自定义城市: ${newCity.name}`);
      return { success: true, city: newCity };
    } catch (error) {
      console.error('添加自定义城市失败:', error);
      return { success: false, message: error.message };
    }
  },

  // 合并自定义城市到应用状态
  async mergeCustomCities() {
    try {
      // 加载自定义城市
      const customCities = await this.loadCustomCities();
      
      if (customCities.length === 0) {
        return;
      }

      // 过滤掉可能重复的城市（基于ID）
      const existingCityIds = new Set(AppState.cities.map(city => city.id));
      const newCustomCities = customCities.filter(city => !existingCityIds.has(city.id));
      
      if (newCustomCities.length === 0) {
        return;
      }

      // 添加到AppState.cities
      AppState.cities.push(...newCustomCities);
      
      // 重新筛选500公里内的城市
      AppState.filteredCities = AppState.cities.filter(
        city => city.distance <= CONFIG.radiusKm
      );
      
      console.log(`合并了 ${newCustomCities.length} 个自定义城市到应用状态`);
      
      // 更新UI
      this.updateUIFromState();
      
      return true;
    } catch (error) {
      console.error('合并自定义城市失败:', error);
      return false;
    }
  }
};