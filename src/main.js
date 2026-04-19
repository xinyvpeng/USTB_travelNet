// TravelNet - 主应用程序入口
import * as d3 from 'd3';
import localforage from 'localforage';

// 应用配置
const CONFIG = {
  centerLat: 39.99048,      // 北京科技大学纬度
  centerLng: 116.36087,     // 北京科技大学经度
  radiusKm: 500,            // 探索半径（公里）
  earthRadiusKm: 6371,      // 地球半径（公里）
  
  // 认证配置 - 密码通过环境变量设置，生产环境中应替换
  auth: {
    password: 'TravelNet2024!', // 默认密码，在实际部署时应通过环境变量设置
    storageKey: 'travelnet_auth_token',
    
    // GitHub OAuth 配置 (可选)
    github: {
      clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '', // 通过环境变量设置
      allowedUsers: ['xinyvpeng'], // 允许编辑的GitHub用户名
      scope: 'read:user'
    }
  },
  
  // 存储配置
  storageKeys: {
    visitedCities: 'travelnet_visited_cities',
    travelRecords: 'travelnet_travel_records',
    excludedCities: 'travelnet_excluded_cities',
    appSettings: 'travelnet_app_settings'
  }
};

// 全局状态
const AppState = {
  cities: [],               // 所有城市数据
  filteredCities: [],       // 筛选后的城市（500公里内）
  visitedCities: new Set(), // 已访问城市ID集合
  excludedCities: new Set(),// 排除的城市ID集合
  travelRecords: [],        // 旅游记录
  selectedCity: null,       // 当前选中的城市
  networkGraph: null,       // D3网络图实例
  zoomLevel: 1,             // 当前缩放级别
  
  // 认证状态
  isAuthenticated: false,   // 用户是否已认证
  authToken: null,          // 认证令牌
  authUsername: '未登录用户' // 认证用户名
};

// 工具函数 - 地理计算
const GeoUtils = {
  /**
   * 计算两个经纬度坐标之间的距离（公里）使用Haversine公式
   * @param {number} lat1 - 纬度1
   * @param {number} lng1 - 经度1
   * @param {number} lat2 - 纬度2
   * @param {number} lng2 - 经度2
   * @returns {number} 距离（公里）
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const toRad = (angle) => (angle * Math.PI) / 180;
    
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return CONFIG.earthRadiusKm * c;
  },

  /**
   * 计算从中心点到目标点的方位角（度）
   * @param {number} lat1 - 中心点纬度
   * @param {number} lng1 - 中心点经度
   * @param {number} lat2 - 目标点纬度
   * @param {number} lng2 - 目标点经度
   * @returns {number} 方位角（0-360度，0表示正北）
   */
  calculateBearing(lat1, lng1, lat2, lng2) {
    const toRad = (angle) => (angle * Math.PI) / 180;
    const toDeg = (angle) => (angle * 180) / Math.PI;
    
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δλ = toRad(lng2 - lng1);
    
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    
    let bearing = toDeg(Math.atan2(y, x));
    
    // 转换为0-360度
    bearing = (bearing + 360) % 360;
    
    return bearing;
  },

  /**
   * 将经纬度坐标转换为网络图上的极坐标
   * @param {number} distance - 距离（公里）
   * @param {number} bearing - 方位角（度）
   * @param {number} maxRadius - 网络图最大半径（像素）
   * @param {number} scale - 缩放比例
   * @returns {Object} {x, y} 坐标
   */
  polarToCartesian(distance, bearing, maxRadius, scale = 1) {
    // 将距离映射到半径（500公里对应最大半径）
    const radius = (distance / CONFIG.radiusKm) * maxRadius * scale;
    
    // 将方位角转换为弧度（0度为正北，顺时针）
    const angle = (bearing - 90) * (Math.PI / 180); // 调整角度，使0度指向右边
    
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    };
  }
};

// 数据管理
const DataManager = {
  // 初始化存储
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

  // 加载城市数据
  async loadCitiesData() {
    try {
      // 这里暂时使用模拟数据，稍后替换为实际数据
      const response = await fetch('./src/data/cities.json');
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
      
      // 筛选500公里内的城市
      AppState.filteredCities = AppState.cities.filter(
        city => city.distance <= CONFIG.radiusKm
      );
      
      console.log(`加载了 ${AppState.cities.length} 个城市，其中 ${AppState.filteredCities.length} 个在500公里内`);
      return true;
    } catch (error) {
      console.error('加载城市数据失败:', error);
      
      // 如果加载失败，使用模拟数据
      await this.generateSampleData();
      return false;
    }
  },

  // 生成示例数据（备用）
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

  // 加载用户数据
  async loadUserData() {
    try {
      // 加载已访问城市
      const visited = await localforage.getItem(CONFIG.storageKeys.visitedCities) || [];
      AppState.visitedCities = new Set(visited);
      
      // 加载排除城市
      const excluded = await localforage.getItem(CONFIG.storageKeys.excludedCities) || [];
      AppState.excludedCities = new Set(excluded);
      
      // 加载旅游记录
      AppState.travelRecords = await localforage.getItem(CONFIG.storageKeys.travelRecords) || [];
      
      console.log('用户数据加载完成');
      this.updateUIFromState();
      return true;
    } catch (error) {
      console.error('加载用户数据失败:', error);
      return false;
    }
  },

  // 保存用户数据
  async saveUserData() {
    try {
      await localforage.setItem(CONFIG.storageKeys.visitedCities, Array.from(AppState.visitedCities));
      await localforage.setItem(CONFIG.storageKeys.excludedCities, Array.from(AppState.excludedCities));
      await localforage.setItem(CONFIG.storageKeys.travelRecords, AppState.travelRecords);
      
      console.log('用户数据保存完成');
      return true;
    } catch (error) {
      console.error('保存用户数据失败:', error);
      return false;
    }
  },

  // 更新UI状态
  updateUIFromState() {
    // 更新城市计数
    const cityCountElement = document.getElementById('cityCount');
    if (cityCountElement) {
      cityCountElement.textContent = AppState.filteredCities.length;
    }
    
    // 更新存储使用情况
    this.updateStorageUsage();
  },

  // 更新存储使用情况显示
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
  }
};

// 认证管理器
const AuthManager = {
  // 初始化认证状态
  init() {
    // 尝试从localStorage加载认证令牌
    const token = localStorage.getItem(CONFIG.auth.storageKey);
    if (token && this.validateToken(token)) {
      AppState.authToken = token;
      AppState.isAuthenticated = true;
      AppState.authUsername = '项目所有者';
      console.log('认证状态已恢复');
    } else {
      // 清除无效令牌
      localStorage.removeItem(CONFIG.auth.storageKey);
      AppState.authToken = null;
      AppState.isAuthenticated = false;
      AppState.authUsername = '未登录用户';
    }
  },

  // 验证令牌
  validateToken(token) {
    // 简单验证：检查令牌是否存在且不为空
    return token && token.trim().length > 0;
  },

  // 登录
  login(password) {
    if (password === CONFIG.auth.password) {
      // 生成简单令牌（时间戳 + 随机数）
      const token = `travelnet_auth_${Date.now()}_${Math.random().toString(36).substr(2)}`;
      
      // 存储令牌
      localStorage.setItem(CONFIG.auth.storageKey, token);
      
      // 更新应用状态
      AppState.authToken = token;
      AppState.isAuthenticated = true;
      AppState.authUsername = '项目所有者';
      
      console.log('登录成功');
      return { success: true, message: '登录成功' };
    } else {
      console.log('登录失败：密码错误');
      return { success: false, message: '密码错误' };
    }
  },

  // 登出
  logout() {
    // 清除令牌
    localStorage.removeItem(CONFIG.auth.storageKey);
    
    // 更新应用状态
    AppState.authToken = null;
    AppState.isAuthenticated = false;
    AppState.authUsername = '未登录用户';
    
    console.log('已退出登录');
    return { success: true, message: '已退出登录' };
  },

  // 检查是否已认证
  isAuthenticated() {
    return AppState.isAuthenticated;
  },

  // 获取认证状态
  getAuthStatus() {
    return {
      isAuthenticated: AppState.isAuthenticated,
      username: AppState.authUsername
    };
  }
};

// UI管理器
const UIManager = {
  // 初始化UI事件
  initEvents() {
    // 随机选择城市按钮
    const randomCityBtn = document.getElementById('randomCityBtn');
    if (randomCityBtn) {
      randomCityBtn.addEventListener('click', () => this.selectRandomCity());
    }
    
    // 搜索框
    const citySearch = document.getElementById('citySearch');
    if (citySearch) {
      citySearch.addEventListener('input', (e) => this.filterCities(e.target.value));
    }
    
    // 排序选择
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
      sortBy.addEventListener('change', (e) => this.sortCities(e.target.value));
    }
    
    // 确认城市按钮
    const confirmCityBtn = document.getElementById('confirmCityBtn');
    if (confirmCityBtn) {
      confirmCityBtn.addEventListener('click', () => this.confirmSelectedCity());
    }
    
    // 取消按钮
    const cancelCityBtn = document.getElementById('cancelCityBtn');
    if (cancelCityBtn) {
      cancelCityBtn.addEventListener('click', () => this.cancelSelectedCity());
    }
    
    // 缩放控制
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetViewBtn = document.getElementById('resetViewBtn');
    
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.zoomIn());
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.zoomOut());
    if (resetViewBtn) resetViewBtn.addEventListener('click', () => this.resetView());
    
    // 认证相关事件
    // 登录按钮
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.showLoginModal());
    }
    
    // 退出按钮
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }
    
    // 登录表单提交
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));
    }
    
    // 登录模态框关闭按钮
    const loginModalClose = document.getElementById('loginModalClose');
    if (loginModalClose) {
      loginModalClose.addEventListener('click', () => this.hideLoginModal());
    }
    
    // 登录取消按钮
    const loginCancelBtn = document.getElementById('loginCancelBtn');
    if (loginCancelBtn) {
      loginCancelBtn.addEventListener('click', () => this.hideLoginModal());
    }
    
    // 点击模态框外部关闭
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
      loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
          this.hideLoginModal();
        }
      });
    }
    
    // 其他功能按钮
    const addCityBtn = document.getElementById('addCityBtn');
    if (addCityBtn) {
      addCityBtn.addEventListener('click', () => this.handleAddCity());
    }
    
    const addRecordBtn = document.getElementById('addRecordBtn');
    if (addRecordBtn) {
      addRecordBtn.addEventListener('click', () => this.handleAddRecord());
    }
    
    const clearRecordsBtn = document.getElementById('clearRecordsBtn');
    if (clearRecordsBtn) {
      clearRecordsBtn.addEventListener('click', () => this.handleClearRecords());
    }
    
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleExportData();
      });
    }
    
    const importDataBtn = document.getElementById('importDataBtn');
    if (importDataBtn) {
      importDataBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleImportData();
      });
    }
    
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
      helpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleHelp();
      });
    }
    
    // GitHub登录按钮
    const githubLoginBtn = document.getElementById('githubLoginBtn');
    if (githubLoginBtn) {
      githubLoginBtn.addEventListener('click', () => this.handleGitHubLogin());
    }
    
    // 根据配置显示/隐藏GitHub认证部分
    const githubAuthSection = document.getElementById('githubAuthSection');
    if (githubAuthSection && CONFIG.auth.github && CONFIG.auth.github.clientId) {
      githubAuthSection.style.display = 'block';
    }
    
    console.log('UI事件初始化完成');
  },

  // 随机选择城市
  selectRandomCity() {
    // 获取未排除的城市
    const availableCities = AppState.filteredCities.filter(
      city => !AppState.visitedCities.has(city.id) && !AppState.excludedCities.has(city.id)
    );
    
    if (availableCities.length === 0) {
      this.showNotification('没有可用的城市了！', 'warning');
      return;
    }
    
    // 随机选择一个
    const randomIndex = Math.floor(Math.random() * availableCities.length);
    const selectedCity = availableCities[randomIndex];
    
    // 设置选中的城市
    AppState.selectedCity = selectedCity;
    
    // 显示选中城市信息
    this.showSelectedCityInfo(selectedCity);
    
    // 高亮网络图中的节点
    if (AppState.networkGraph) {
      AppState.networkGraph.highlightCity(selectedCity.id);
    }
    
    this.showNotification(`随机选择了: ${selectedCity.name}`, 'info');
  },

  // 显示选中城市信息
  showSelectedCityInfo(city) {
    const infoPanel = document.getElementById('selectedCityInfo');
    const nameElement = document.getElementById('selectedCityName');
    const distanceElement = document.getElementById('selectedCityDistance');
    const bearingElement = document.getElementById('selectedCityBearing');
    const populationElement = document.getElementById('selectedCityPopulation');
    const descriptionElement = document.getElementById('selectedCityDescription');
    
    if (infoPanel && nameElement && distanceElement && bearingElement && populationElement && descriptionElement) {
      nameElement.textContent = city.name;
      distanceElement.textContent = `${city.distance.toFixed(1)} km`;
      bearingElement.textContent = `${Math.round(city.bearing)}°`;
      populationElement.textContent = city.population?.toLocaleString() || 'N/A';
      descriptionElement.textContent = city.description;
      
      infoPanel.style.display = 'block';
    }
  },

  // 确认选中城市（添加到旅游记录）
  async confirmSelectedCity() {
    if (!AppState.selectedCity) return;
    
    // 认证检查：只有已登录用户才能执行此操作
    if (!AppState.isAuthenticated) {
      this.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
      this.showLoginModal();
      return;
    }
    
    const city = AppState.selectedCity;
    
    // 添加到已访问城市
    AppState.visitedCities.add(city.id);
    
    // 创建旅游记录
    const record = {
      id: `record_${Date.now()}`,
      cityId: city.id,
      cityName: city.name,
      distance: city.distance,
      visitDate: new Date().toISOString().split('T')[0],
      thoughts: '',
      photos: []
    };
    
    AppState.travelRecords.unshift(record);
    
    // 保存数据
    await DataManager.saveUserData();
    
    // 更新UI
    this.updateTravelRecords();
    this.hideSelectedCityInfo();
    
    // 显示通知
    this.showNotification(`已添加 ${city.name} 到旅游记录`, 'success');
    
    // 重置选中城市
    AppState.selectedCity = null;
  },

  // 取消选中城市
  cancelSelectedCity() {
    if (!AppState.selectedCity) return;
    
    // 添加到排除列表（可选）
    // AppState.excludedCities.add(AppState.selectedCity.id);
    
    this.hideSelectedCityInfo();
    AppState.selectedCity = null;
    
    this.showNotification('已取消选择', 'info');
  },

  // 隐藏选中城市信息
  hideSelectedCityInfo() {
    const infoPanel = document.getElementById('selectedCityInfo');
    if (infoPanel) {
      infoPanel.style.display = 'none';
    }
  },

  // 过滤城市
  filterCities(searchTerm) {
    if (!searchTerm.trim()) {
      // 如果搜索词为空，显示所有城市
      this.updateCityList(AppState.filteredCities);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = AppState.filteredCities.filter(
      city => city.name.toLowerCase().includes(term)
    );
    
    this.updateCityList(filtered);
    
    // 高亮网络图中的匹配节点
    if (AppState.networkGraph) {
      AppState.networkGraph.highlightCities(filtered.map(city => city.id));
    }
  },

  // 排序城市
  sortCities(criteria) {
    let sortedCities = [...AppState.filteredCities];
    
    switch (criteria) {
      case 'distance':
        sortedCities.sort((a, b) => a.distance - b.distance);
        break;
      case 'name':
        sortedCities.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'population':
        sortedCities.sort((a, b) => (b.population || 0) - (a.population || 0));
        break;
    }
    
    this.updateCityList(sortedCities);
  },

  // 更新城市列表
  updateCityList(cities) {
    const cityListContainer = document.getElementById('cityList');
    if (!cityListContainer) return;
    
    // 清空现有内容
    cityListContainer.innerHTML = '';
    
    if (cities.length === 0) {
      cityListContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <p>未找到匹配的城市</p>
        </div>
      `;
      return;
    }
    
    // 创建城市列表项
    cities.forEach(city => {
      const isVisited = AppState.visitedCities.has(city.id);
      const isExcluded = AppState.excludedCities.has(city.id);
      
      const cityElement = document.createElement('div');
      cityElement.className = 'city-item';
      cityElement.innerHTML = `
        <div class="city-item-header">
          <h4>${city.name}</h4>
          <span class="city-distance">${city.distance.toFixed(1)} km</span>
        </div>
        <div class="city-item-details">
          <p class="city-description">${city.description}</p>
          <div class="city-item-stats">
            <span class="city-stat"><i class="fas fa-users"></i> ${city.population?.toLocaleString() || 'N/A'}</span>
            <span class="city-stat"><i class="fas fa-compass"></i> ${Math.round(city.bearing)}°</span>
            ${isVisited ? '<span class="city-status visited"><i class="fas fa-check-circle"></i> 已访问</span>' : ''}
            ${isExcluded ? '<span class="city-status excluded"><i class="fas fa-times-circle"></i> 已排除</span>' : ''}
          </div>
        </div>
      `;
      
      // 添加点击事件
      cityElement.addEventListener('click', () => {
        AppState.selectedCity = city;
        this.showSelectedCityInfo(city);
        
        if (AppState.networkGraph) {
          AppState.networkGraph.highlightCity(city.id);
        }
      });
      
      cityListContainer.appendChild(cityElement);
    });
  },

  // 更新旅游记录
  updateTravelRecords() {
    const recordsContainer = document.getElementById('recordsContainer');
    if (!recordsContainer) return;
    
    if (AppState.travelRecords.length === 0) {
      recordsContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-compass"></i>
          <p>暂无旅游记录</p>
          <p class="empty-hint">点击"随机选择城市"开始探索</p>
        </div>
      `;
      return;
    }
    
    let recordsHTML = '';
    
    AppState.travelRecords.forEach(record => {
      const city = AppState.cities.find(c => c.id === record.cityId);
      const cityName = city ? city.name : record.cityName;
      const distance = city ? city.distance : record.distance;
      
      recordsHTML += `
        <div class="travel-record">
          <div class="record-header">
            <h4>${cityName}</h4>
            <span class="record-date">${record.visitDate}</span>
          </div>
          <div class="record-details">
            <span class="record-distance">${distance.toFixed(1)} km</span>
            <p class="record-thoughts">${record.thoughts || '暂无感想'}</p>
            ${record.photos.length > 0 ? 
              `<div class="record-photos">
                <i class="fas fa-images"></i>
                <span>${record.photos.length} 张照片</span>
              </div>` : ''
            }
          </div>
          <div class="record-actions">
            <button class="btn-small" onclick="UIManager.editRecord('${record.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-small btn-danger" onclick="UIManager.deleteRecord('${record.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    });
    
    recordsContainer.innerHTML = recordsHTML;
  },

  // 缩放控制
  zoomIn() {
    if (AppState.networkGraph) {
      AppState.zoomLevel = Math.min(AppState.zoomLevel * 1.2, 5);
      AppState.networkGraph.updateZoom(AppState.zoomLevel);
    }
  },

  zoomOut() {
    if (AppState.networkGraph) {
      AppState.zoomLevel = Math.max(AppState.zoomLevel / 1.2, 0.5);
      AppState.networkGraph.updateZoom(AppState.zoomLevel);
    }
  },

  resetView() {
    AppState.zoomLevel = 1;
    if (AppState.networkGraph) {
      AppState.networkGraph.updateZoom(AppState.zoomLevel);
    }
  },

  // 显示通知
  showNotification(message, type = 'info') {
    // 创建临时通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 添加动画
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // 3秒后移除
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  },

  // 编辑记录（待实现）
  editRecord(recordId) {
    // 认证检查：只有已登录用户才能执行此操作
    if (!AppState.isAuthenticated) {
      this.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
      this.showLoginModal();
      return;
    }
    
    console.log('编辑记录:', recordId);
    this.showNotification('编辑功能开发中...', 'info');
  },

  // 删除记录（待实现）
  deleteRecord(recordId) {
    // 认证检查：只有已登录用户才能执行此操作
    if (!AppState.isAuthenticated) {
      this.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
      this.showLoginModal();
      return;
    }
    
    console.log('删除记录:', recordId);
    this.showNotification('删除功能开发中...', 'info');
  },

  // ===== 认证相关方法 =====
  
  // 显示登录模态框
  showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.style.display = 'flex';
      // 清空密码字段
      const passwordInput = document.getElementById('loginPassword');
      if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
      }
    }
  },

  // 隐藏登录模态框
  hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.style.display = 'none';
    }
  },

  // 处理登录表单提交
  handleLoginSubmit(event) {
    event.preventDefault();
    
    const passwordInput = document.getElementById('loginPassword');
    const password = passwordInput ? passwordInput.value : '';
    
    if (!password.trim()) {
      this.showNotification('请输入密码', 'warning');
      return;
    }
    
    // 调用AuthManager.login
    const result = AuthManager.login(password);
    
    if (result.success) {
      this.hideLoginModal();
      this.updateAuthUI();
      this.showNotification('登录成功！您现在可以编辑内容。', 'success');
    } else {
      this.showNotification('密码错误，请重试', 'danger');
      // 清空密码字段
      if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
      }
    }
  },

  // 处理退出登录
  handleLogout() {
    if (confirm('确定要退出登录吗？退出后将无法编辑内容。')) {
      const result = AuthManager.logout();
      this.updateAuthUI();
      this.showNotification('已退出登录', 'info');
    }
  },

  // ===== 其他功能方法 =====
  
  // 处理添加城市
  handleAddCity() {
    // 认证检查：只有已登录用户才能执行此操作
    if (!AppState.isAuthenticated) {
      this.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
      this.showLoginModal();
      return;
    }
    
    this.showNotification('添加城市功能开发中...', 'info');
  },
  
  // 处理添加记录
  handleAddRecord() {
    // 认证检查：只有已登录用户才能执行此操作
    if (!AppState.isAuthenticated) {
      this.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
      this.showLoginModal();
      return;
    }
    
    this.showNotification('添加记录功能开发中...', 'info');
  },
  
  // 处理清除记录
  handleClearRecords() {
    // 认证检查：只有已登录用户才能执行此操作
    if (!AppState.isAuthenticated) {
      this.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
      this.showLoginModal();
      return;
    }
    
    if (confirm('确定要清除所有旅行记录吗？此操作不可撤销。')) {
      AppState.travelRecords = [];
      AppState.visitedCities.clear();
      DataManager.saveUserData();
      this.updateTravelRecords();
      this.showNotification('所有记录已清除', 'success');
    }
  },
  
  // 处理导出数据
  handleExportData() {
    const data = {
      visitedCities: Array.from(AppState.visitedCities),
      travelRecords: AppState.travelRecords,
      excludedCities: Array.from(AppState.excludedCities),
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travelnet_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showNotification('数据导出成功', 'success');
  },
  
  // 处理导入数据
  handleImportData() {
    // 认证检查：只有已登录用户才能执行此操作
    if (!AppState.isAuthenticated) {
      this.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
      this.showLoginModal();
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // 验证数据格式
        if (!data.visitedCities || !data.travelRecords) {
          throw new Error('无效的数据格式');
        }
        
        // 确认覆盖
        if (!confirm('导入数据将覆盖当前所有旅行记录。确定要继续吗？')) {
          return;
        }
        
        AppState.visitedCities = new Set(data.visitedCities || []);
        AppState.travelRecords = data.travelRecords || [];
        AppState.excludedCities = new Set(data.excludedCities || []);
        
        await DataManager.saveUserData();
        this.updateTravelRecords();
        this.showNotification('数据导入成功', 'success');
      } catch (error) {
        console.error('导入数据失败:', error);
        this.showNotification('导入失败：文件格式无效', 'danger');
      }
    };
    
    input.click();
  },
  
  // 处理帮助
  handleHelp() {
    alert(`TravelNet 使用帮助：
    
1. 查看模式：所有用户都可以查看城市网络和旅行记录
2. 编辑模式：只有认证用户（项目所有者）可以添加城市、编辑记录等
3. 随机选择：点击"随机选择"按钮选择一个未访问的城市
4. 确认访问：选中城市后点击"确认访问"添加到旅行记录
5. 数据管理：支持导出/导入JSON格式的数据

项目地址：https://github.com/xinyvpeng/USTB_travelNet
`);
  },

  // 处理GitHub登录
  handleGitHubLogin() {
    if (!CONFIG.auth.github || !CONFIG.auth.github.clientId) {
      this.showNotification('GitHub登录未配置。请先配置GitHub OAuth应用。', 'warning');
      alert(`要启用GitHub登录，您需要：
      
1. 访问 https://github.com/settings/applications/new 创建OAuth App
2. 应用名称：TravelNet
3. 主页URL：https://xinyvpeng.github.io/USTB_travelNet/
4. 授权回调URL：https://xinyvpeng.github.io/USTB_travelNet/
5. 创建后复制Client ID
6. 在项目环境变量中设置 VITE_GITHUB_CLIENT_ID

或者，您可以使用当前的密码认证。`);
      return;
    }
    
    this.showNotification('GitHub登录功能开发中...', 'info');
    // TODO: 实现GitHub Device Flow认证
  },

  // 更新认证UI状态
  updateAuthUI() {
    const authStatus = document.getElementById('authStatus');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const appContainer = document.getElementById('appContainer');
    
    if (AppState.isAuthenticated) {
      // 已登录状态
      if (authStatus) {
        authStatus.textContent = '已登录 (项目所有者)';
        authStatus.className = 'auth-status authenticated';
      }
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-block';
      if (appContainer) appContainer.classList.remove('read-only');
    } else {
      // 未登录状态
      if (authStatus) {
        authStatus.textContent = '未登录 (只读模式)';
        authStatus.className = 'auth-status not-authenticated';
      }
      if (loginBtn) loginBtn.style.display = 'inline-block';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (appContainer) appContainer.classList.add('read-only');
    }
  }
};

// D3网络图管理器
const NetworkGraph = {
  svg: null,
  width: 0,
  height: 0,
  center: { x: 0, y: 0 },
  maxRadius: 0,
  scale: 1,
  nodes: [],
  links: [],
  
  // 初始化网络图
  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('网络图容器不存在:', containerId);
      return;
    }
    
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    this.center = { x: this.width / 2, y: this.height / 2 };
    this.maxRadius = Math.min(this.width, this.height) * 0.4;
    
    // 创建SVG
    this.svg = d3.select(`#${containerId}`)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .style('background-color', 'transparent');
    
    // 创建缩放组
    this.zoomGroup = this.svg.append('g')
      .attr('class', 'zoom-group');
    
    // 创建连线容器
    this.linksGroup = this.zoomGroup.append('g')
      .attr('class', 'links');
    
    // 创建节点容器
    this.nodesGroup = this.zoomGroup.append('g')
      .attr('class', 'nodes');
    
    // 创建中心点
    this.centerGroup = this.zoomGroup.append('g')
      .attr('class', 'center-point');
    
    // 添加缩放行为
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        this.zoomGroup.attr('transform', event.transform);
        AppState.zoomLevel = event.transform.k;
      });
    
    this.svg.call(zoom);
    
    // 绘制中心点
    this.drawCenterPoint();
    
    // 初始渲染
    this.updateData();
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => this.handleResize());
    
    console.log('D3网络图初始化完成');
  },
  
  // 绘制中心点
  drawCenterPoint() {
    this.centerGroup.selectAll('*').remove();
    
    // 中心点
    this.centerGroup.append('circle')
      .attr('cx', this.center.x)
      .attr('cy', this.center.y)
      .attr('r', 10)
      .attr('fill', '#00e0ff')
      .attr('opacity', 0.9)
      .style('filter', 'url(#glow)');
    
    // 光环效果
    this.centerGroup.append('circle')
      .attr('cx', this.center.x)
      .attr('cy', this.center.y)
      .attr('r', 20)
      .attr('fill', 'none')
      .attr('stroke', '#00e0ff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.5)
      .style('filter', 'url(#glow)');
    
    // 脉冲动画
    this.centerGroup.append('circle')
      .attr('cx', this.center.x)
      .attr('cy', this.center.y)
      .attr('r', 15)
      .attr('fill', 'none')
      .attr('stroke', '#00e0ff')
      .attr('stroke-width', 1)
      .attr('opacity', 0)
      .style('filter', 'url(#glow)')
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr('r', 40)
      .attr('opacity', 0)
      .on('end', function() {
        d3.select(this)
          .attr('r', 15)
          .attr('opacity', 0)
          .transition()
          .duration(2000)
          .ease(d3.easeLinear)
          .attr('r', 40)
          .attr('opacity', 0)
          .on('end', arguments.callee);
      });
    
    // 添加发光滤镜
    const defs = this.svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'coloredBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');
  },
  
  // 更新数据
  updateData() {
    if (!AppState.filteredCities || AppState.filteredCities.length === 0) {
      console.warn('没有城市数据可渲染');
      return;
    }
    
    // 创建节点数据
    this.nodes = AppState.filteredCities.map(city => {
      const pos = GeoUtils.polarToCartesian(
        city.distance,
        city.bearing,
        this.maxRadius,
        this.scale
      );
      
      return {
        id: city.id,
        name: city.name,
        distance: city.distance,
        bearing: city.bearing,
        population: city.population,
        x: this.center.x + pos.x,
        y: this.center.y + pos.y,
        radius: this.calculateNodeRadius(city),
        color: this.calculateNodeColor(city.distance),
        isVisited: AppState.visitedCities.has(city.id),
        isExcluded: AppState.excludedCities.has(city.id)
      };
    });
    
    // 创建连线数据（从中心点到每个节点）
    this.links = this.nodes.map(node => ({
      source: this.center,
      target: { x: node.x, y: node.y },
      distance: node.distance
    }));
    
    // 渲染
    this.render();
  },
  
  // 计算节点半径
  calculateNodeRadius(city) {
    // 根据人口调整半径，但限制在5-15像素之间
    const baseRadius = 8;
    const populationFactor = city.population ? Math.log10(city.population) / 10 : 1;
    return Math.max(5, Math.min(15, baseRadius * populationFactor));
  },
  
  // 计算节点颜色
  calculateNodeColor(distance) {
    // 根据距离调整颜色：近处为蓝色，远处为紫色
    const maxDistance = CONFIG.radiusKm;
    const t = distance / maxDistance;
    
    // 从蓝色 (#00e0ff) 到紫色 (#9d4edd)
    const r = Math.round(0 + t * 157);
    const g = Math.round(224 + t * (78 - 224));
    const b = Math.round(255 + t * (221 - 255));
    
    return `rgb(${r}, ${g}, ${b})`;
  },
  
  // 渲染网络图
  render() {
    // 渲染连线
    const links = this.linksGroup.selectAll('line')
      .data(this.links, d => `${d.source.x},${d.source.y}-${d.target.x},${d.target.y}`);
    
    links.enter()
      .append('line')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('stroke', d => this.calculateLinkColor(d.distance))
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.3)
      .style('filter', 'url(#glow)');
    
    links.attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    
    links.exit().remove();
    
    // 渲染节点
    const nodes = this.nodesGroup.selectAll('g.node')
      .data(this.nodes, d => d.id);
    
    const nodeEnter = nodes.enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer');
    
    // 节点圆圈
    nodeEnter.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('opacity', 0.8)
      .style('filter', 'url(#glow)');
    
    // 节点标签
    nodeEnter.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.radius + 12)
      .attr('fill', '#f0f4ff')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text(d => d.name)
      .style('pointer-events', 'none');
    
    // 更新节点位置
    nodes.attr('transform', d => `translate(${d.x}, ${d.y})`);
    
    // 移除多余节点
    nodes.exit().remove();
    
    // 添加交互事件
    this.nodesGroup.selectAll('g.node')
      .on('mouseover', (event, d) => this.handleNodeHover(event, d))
      .on('mouseout', () => this.handleNodeOut())
      .on('click', (event, d) => this.handleNodeClick(event, d));
  },
  
  // 计算连线颜色
  calculateLinkColor(distance) {
    const maxDistance = CONFIG.radiusKm;
    const t = distance / maxDistance;
    
    // 从蓝色到紫色
    const r = Math.round(0 + t * 157);
    const g = Math.round(224 + t * (78 - 224));
    const b = Math.round(255 + t * (221 - 255));
    
    return `rgb(${r}, ${g}, ${b})`;
  },
  
  // 节点悬停处理
  handleNodeHover(event, node) {
    // 高亮节点
    d3.select(event.currentTarget).select('circle')
      .transition()
      .duration(200)
      .attr('r', node.radius * 1.3)
      .attr('opacity', 1);
    
    // 高亮连线
    this.linksGroup.selectAll('line')
      .filter(d => d.target.x === node.x && d.target.y === node.y)
      .transition()
      .duration(200)
      .attr('stroke-width', 3)
      .attr('stroke-opacity', 0.8);
  },
  
  // 节点离开处理
  handleNodeOut() {
    // 恢复节点大小
    this.nodesGroup.selectAll('circle')
      .transition()
      .duration(200)
      .attr('r', d => d.radius)
      .attr('opacity', 0.8);
    
    // 恢复连线
    this.linksGroup.selectAll('line')
      .transition()
      .duration(200)
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.3);
  },
  
  // 节点点击处理
  handleNodeClick(event, node) {
    const city = AppState.filteredCities.find(c => c.id === node.id);
    if (city) {
      AppState.selectedCity = city;
      UIManager.showSelectedCityInfo(city);
    }
  },
  
  // 高亮特定城市
  highlightCity(cityId) {
    // 重置所有节点
    this.nodesGroup.selectAll('circle')
      .attr('r', d => d.radius)
      .attr('opacity', 0.8);
    
    // 高亮目标节点
    const targetNode = this.nodesGroup.selectAll('g.node')
      .filter(d => d.id === cityId);
    
    targetNode.select('circle')
      .transition()
      .duration(300)
      .attr('r', d => d.radius * 1.5)
      .attr('opacity', 1);
    
    // 脉冲动画
    targetNode.append('circle')
      .attr('r', d => d.radius * 1.5)
      .attr('fill', 'none')
      .attr('stroke', '#ffcc00')
      .attr('stroke-width', 2)
      .attr('opacity', 0.8)
      .transition()
      .duration(1000)
      .attr('r', d => d.radius * 3)
      .attr('opacity', 0)
      .remove();
  },
  
  // 高亮多个城市
  highlightCities(cityIds) {
    // 重置所有节点
    this.nodesGroup.selectAll('circle')
      .attr('r', d => d.radius)
      .attr('opacity', 0.3);
    
    // 高亮匹配节点
    this.nodesGroup.selectAll('g.node')
      .filter(d => cityIds.includes(d.id))
      .select('circle')
      .transition()
      .duration(300)
      .attr('opacity', 1);
  },
  
  // 更新缩放
  updateZoom(scale) {
    this.scale = scale;
    this.updateData();
  },
  
  // 处理窗口大小变化
  handleResize() {
    const container = document.getElementById('networkGraph');
    if (!container) return;
    
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    this.center = { x: this.width / 2, y: this.height / 2 };
    this.maxRadius = Math.min(this.width, this.height) * 0.4;
    
    this.svg
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);
    
    this.updateData();
  }
};

// 主初始化函数
async function initApp() {
  console.log('TravelNet应用初始化...');
  
  // 显示加载状态
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'flex';
  }
  
  try {
    // 1. 初始化存储
    await DataManager.initStorage();
    
    // 2. 初始化认证状态
    AuthManager.init();
    
    // 3. 加载城市数据
    await DataManager.loadCitiesData();
    
    // 4. 加载用户数据
    await DataManager.loadUserData();
    
    // 4. 初始化UI事件
    UIManager.initEvents();
    
    // 5. 初始化网络图
    NetworkGraph.init('networkGraph');
    AppState.networkGraph = NetworkGraph;
    
    // 6. 隐藏加载状态
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
    
    // 7. 更新UI
    UIManager.updateCityList(AppState.filteredCities);
    UIManager.updateTravelRecords();
    DataManager.updateUIFromState();
    UIManager.updateAuthUI();
    
    console.log('TravelNet应用初始化完成！');
    
    // 显示欢迎消息
    setTimeout(() => {
      UIManager.showNotification(`欢迎使用TravelNet！已加载 ${AppState.filteredCities.length} 个城市`, 'success');
    }, 1000);
    
  } catch (error) {
    console.error('应用初始化失败:', error);
    
    // 隐藏加载状态
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
    
    UIManager.showNotification('应用初始化失败，请刷新页面重试', 'danger');
  }
}

// 将全局对象暴露给window（用于调试）
window.AppState = AppState;
window.DataManager = DataManager;
window.UIManager = UIManager;
window.NetworkGraph = NetworkGraph;

// 页面加载完成后初始化应用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}