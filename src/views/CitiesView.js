import { BaseView } from './BaseView.js';

export class CitiesView extends BaseView {
  constructor(container, params = {}) {
    super(container, params);
    this.currentSort = 'distance';
    this.currentSearch = '';
  }
  
  async render() {
    this.showLoading('正在加载城市列表...');
    
    try {
      // 检查全局对象
      if (!window.AppState || !window.UIManager) {
        throw new Error('应用未完全初始化');
      }
      
      // 渲染城市视图HTML
      const html = this.getTemplate();
      this.updateContent(html);
      
      // 初始化城市列表
      this.updateCityList();
      
      // 绑定事件
      this.bindEvents();
      
      this.isRendered = true;
    } catch (error) {
      this.showError('加载城市视图失败', error);
    }
  }
  
  getTemplate() {
    const cityCount = window.AppState ? window.AppState.filteredCities.length : 0;
    
    return `
      <div class="cities-view">
        <div class="view-header">
          <h2><i class="fas fa-city"></i> 城市列表</h2>
          <div class="view-controls">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input type="text" id="citySearchInput" placeholder="搜索城市名称..." value="${this.currentSearch}">
            </div>
            <button id="addCityBtn" class="btn-primary">
              <i class="fas fa-plus-circle"></i> 手动添加城市
            </button>
          </div>
        </div>
        
        <div class="view-content">
          <div class="filter-controls">
            <div class="filter-group">
              <span class="filter-label">显示 <span id="cityCount">${cityCount}</span> 个城市</span>
              <select id="sortSelect" class="sort-select">
                <option value="distance" ${this.currentSort === 'distance' ? 'selected' : ''}>按距离排序</option>
                <option value="name" ${this.currentSort === 'name' ? 'selected' : ''}>按名称排序</option>
                <option value="population" ${this.currentSort === 'population' ? 'selected' : ''}>按人口排序</option>
              </select>
            </div>
            <div class="filter-stats">
              <span class="stat-item">
                <i class="fas fa-check-circle"></i>
                已访问: <span id="visitedCount">0</span>
              </span>

            </div>
          </div>
          
          <div class="cities-container">
            <div id="cityListContainer" class="city-list-container">
              <!-- 城市列表动态生成 -->
              <div class="empty-state">
                <i class="fas fa-city"></i>
                <p>正在加载城市数据...</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="view-footer">
          <div class="status-info">
            <span id="citiesStatus">就绪</span>
            <span class="hint">点击城市查看详情，双击可快速添加到旅游记录</span>
          </div>
        </div>
      </div>
    `;
  }
  
  updateCityList() {
    const container = this.container.querySelector('#cityListContainer');
    if (!container || !window.AppState) return;
    
    const cities = this.getFilteredAndSortedCities();
    this.updateFilterStats();
    
    if (!cities || cities.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <p>未找到匹配的城市</p>
          ${this.currentSearch ? `<p class="empty-hint">尝试其他搜索关键词</p>` : ''}
        </div>
      `;
      return;
    }
    
    let citiesHTML = '';
    
    cities.forEach(city => {
       const isVisited = window.AppState.visitedCities.has(city.id);
      
      citiesHTML += `
        <div class="city-card" data-city-id="${city.id}">
          <div class="city-card-header">
            <h4 class="city-name">${city.name}</h4>
            <div class="city-card-actions">
              <span class="city-distance">${city.distance.toFixed(1)} km</span>
              ${isVisited ? 
                '<span class="city-status visited"><i class="fas fa-check-circle"></i> 已访问</span>' : 
                '<button class="btn-small btn-visit-city" data-city-id="' + city.id + '">到访</button>'
              }

            </div>
          </div>
          
          <div class="city-card-body">
            <p class="city-description">${city.description}</p>
            
            <div class="city-card-stats">
              <div class="city-stat">
                <i class="fas fa-users"></i>
                <span class="stat-value">${city.population?.toLocaleString() || 'N/A'}</span>
                <span class="stat-label">人口</span>
              </div>
              <div class="city-stat">
                <i class="fas fa-compass"></i>
                <span class="stat-value">${Math.round(city.bearing)}°</span>
                <span class="stat-label">方位角</span>
              </div>
              <div class="city-stat">
                <i class="fas fa-map-marker-alt"></i>
                <span class="stat-value">${city.lat.toFixed(4)}°, ${city.lng.toFixed(4)}°</span>
                <span class="stat-label">坐标</span>
              </div>
            </div>
          </div>
          
          <div class="city-card-footer">
            <button class="btn-small btn-view-details" data-city-id="${city.id}">
              <i class="fas fa-info-circle"></i> 详情
            </button>

          </div>
        </div>
      `;
    });
    
    container.innerHTML = citiesHTML;
    
    // 绑定城市卡片事件
    this.bindCityCardEvents();
  }
  
  getFilteredAndSortedCities() {
    if (!window.AppState) return [];
    
    let cities = [...window.AppState.filteredCities];
    
    // 应用搜索过滤
    if (this.currentSearch) {
      const searchTerm = this.currentSearch.toLowerCase();
      cities = cities.filter(city => 
        city.name.toLowerCase().includes(searchTerm) ||
        city.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // 应用排序
    switch (this.currentSort) {
      case 'distance':
        cities.sort((a, b) => a.distance - b.distance);
        break;
      case 'name':
        cities.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'population':
        cities.sort((a, b) => (b.population || 0) - (a.population || 0));
        break;
    }
    
    return cities;
  }
  
  updateFilterStats() {
    if (!window.AppState) return;
    
    // 更新城市计数
    const cityCountElement = this.container.querySelector('#cityCount');
    if (cityCountElement) {
      const cities = this.getFilteredAndSortedCities();
      cityCountElement.textContent = cities.length;
    }
    
    // 更新已访问计数
    const visitedCountElement = this.container.querySelector('#visitedCount');
    if (visitedCountElement) {
      visitedCountElement.textContent = window.AppState.visitedCities.size;
    }
    

  }
  
  bindEvents() {
    // 搜索框
    const searchInput = this.container.querySelector('#citySearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentSearch = e.target.value;
        this.updateCityList();
      });
    }
    
    // 排序选择
    const sortSelect = this.container.querySelector('#sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.updateCityList();
      });
    }
    
    // 添加城市按钮
    const addCityBtn = this.container.querySelector('#addCityBtn');
    if (addCityBtn) {
      addCityBtn.addEventListener('click', () => this.handleAddCity());
    }
  }
  
  bindCityCardEvents() {
    // 到访按钮
    const visitButtons = this.container.querySelectorAll('.btn-visit-city');
    visitButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cityId = btn.dataset.cityId;
        this.visitCity(cityId);
      });
    });
    
    // 详情按钮
    const detailButtons = this.container.querySelectorAll('.btn-view-details');
    detailButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cityId = btn.dataset.cityId;
        this.showCityDetails(cityId);
      });
    });
    

    
    // 城市卡片点击（双击快速到访）
    const cityCards = this.container.querySelectorAll('.city-card');
    cityCards.forEach(card => {
      let clickTimer = null;
      
      card.addEventListener('click', (e) => {
        if (e.target.closest('button')) return; // 避免按钮点击触发卡片点击
        
        if (clickTimer) {
          clearTimeout(clickTimer);
          clickTimer = null;
        }
        
        clickTimer = setTimeout(() => {
          // 单击：显示详情
          const cityId = card.dataset.cityId;
          this.showCityDetails(cityId);
        }, 300);
      });
      
      card.addEventListener('dblclick', (e) => {
        if (clickTimer) {
          clearTimeout(clickTimer);
          clickTimer = null;
        }
        
        // 双击：快速到访
        const cityId = card.dataset.cityId;
        this.visitCity(cityId);
      });
    });
  }
  
  async visitCity(cityId) {
    if (!window.AppState || !window.UIManager) return;
    
    // 认证检查
    if (!window.AppState.isAuthenticated) {
      if (window.UIManager.showNotification) {
        window.UIManager.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
      }
      // 可以跳转到设置页面进行登录
      return;
    }
    
    const city = window.AppState.filteredCities.find(c => c.id === cityId);
    if (!city) return;
    
    // 设置为选中城市
    window.AppState.selectedCity = city;
    
    // 确认到访
    if (typeof window.UIManager.confirmSelectedCity === 'function') {
      await window.UIManager.confirmSelectedCity();
      
      // 更新UI
      this.updateCityList();
      
      // 显示通知
      if (window.UIManager.showNotification) {
        window.UIManager.showNotification(`已添加 ${city.name} 到旅游记录`, 'success');
      }
    }
  }
  
  showCityDetails(cityId) {
    if (!window.AppState || !window.UIManager) return;
    
    const city = window.AppState.filteredCities.find(c => c.id === cityId);
    if (!city) return;
    
    // 显示城市详情模态框（使用现有的UIManager功能）
    window.AppState.selectedCity = city;
    if (typeof window.UIManager.showSelectedCityInfo === 'function') {
      window.UIManager.showSelectedCityInfo(city);
    }
  }
  

  
  async handleAddCity() {
    if (!window.AppState || !window.UIManager || !window.DataManager) return;
    
    // 认证检查
    if (!window.AppState.isAuthenticated) {
      window.UIManager.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
      return;
    }
    
    // 收集城市信息
    const name = prompt('请输入城市名称（例如：南京市）:', '');
    if (!name) return; // 用户取消
    
    const latStr = prompt('请输入城市纬度（例如：32.0603）:', '');
    if (!latStr) return;
    const lat = parseFloat(latStr);
    
    const lngStr = prompt('请输入城市经度（例如：118.7969）:', '');
    if (!lngStr) return;
    const lng = parseFloat(lngStr);
    
    const populationStr = prompt('请输入城市人口（可选，留空为0）:', '0');
    const population = populationStr ? parseInt(populationStr) : 0;
    
    const description = prompt('请输入城市描述（可选）:', '');
    
    // 验证输入
    if (!name.trim()) {
      window.UIManager.showNotification('城市名称不能为空', 'warning');
      return;
    }
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      window.UIManager.showNotification('纬度必须在-90到90之间', 'warning');
      return;
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      window.UIManager.showNotification('经度必须在-180到180之间', 'warning');
      return;
    }
    
    // 确认添加
    const confirmMessage = `确定要添加城市 "${name}" 吗？
纬度: ${lat}
经度: ${lng}
人口: ${population.toLocaleString()}
描述: ${description || '无'}`;
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    // 调用DataManager添加城市
    const result = await window.DataManager.addCustomCity({
      name: name.trim(),
      lat: lat,
      lng: lng,
      population: population,
      description: description || ''
    });
    
    if (result.success) {
      window.UIManager.showNotification(`成功添加城市: ${name}`, 'success');
      // 更新城市列表
      this.updateCityList();
    } else {
      window.UIManager.showNotification(`添加城市失败: ${result.message}`, 'danger');
    }
  }
  
  async onEnter() {
    console.log('进入城市列表视图');
    // 更新城市列表
    this.updateCityList();
  }
  
  async onLeave() {
    console.log('离开城市列表视图');
  }
}