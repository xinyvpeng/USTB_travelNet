// UI管理器
// 负责用户界面交互、通知和视图控制

import { CONFIG } from '../config.js';
import { AppState } from '../state/app-state.js';
import { DataManager } from './data-manager.js';

export const UIManager = {
  // 显示选中城市信息（供网络视图使用）
  showSelectedCityInfo(city) {
    const nameElement = document.getElementById('selectedCityName');
    const distanceElement = document.getElementById('selectedCityDistance');
    const bearingElement = document.getElementById('selectedCityBearing');
    const populationElement = document.getElementById('selectedCityPopulation');
    const descriptionElement = document.getElementById('selectedCityDescription');
    const infoPanel = document.getElementById('selectedCityInfo');
    
    if (nameElement && distanceElement && bearingElement && populationElement && descriptionElement && infoPanel) {
      nameElement.textContent = city.name;
      distanceElement.textContent = `${city.distance.toFixed(1)} km`;
      bearingElement.textContent = `${Math.round(city.bearing)}°`;
      populationElement.textContent = city.population?.toLocaleString() || 'N/A';
      descriptionElement.textContent = city.description;
      
      infoPanel.style.display = 'block';
    }
  },

  hideSelectedCityInfo() {
    const infoPanel = document.getElementById('selectedCityInfo');
    if (infoPanel) {
      infoPanel.style.display = 'none';
    }
  },

  confirmSelectedCity() {
    if (!AppState.selectedCity) return;
    
    // 认证检查：只有已登录用户才能执行此操作
    if (!AppState.isAuthenticated) {
      this.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
      return;
    }
    
    const city = AppState.selectedCity;
    
    // 确认添加
    if (!confirm(`确定要将 ${city.name} 添加到旅游记录吗？`)) {
      return;
    }
    
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
    DataManager.saveUserData();
    
    // 隐藏选中城市面板
    this.hideSelectedCityInfo();
    
    // 显示通知
    this.showNotification(`已添加 ${city.name} 到旅游记录`, 'success');
    
    // 重置选中城市
    AppState.selectedCity = null;
  },

  cancelSelectedCity() {
    if (!AppState.selectedCity) return;
    
    this.hideSelectedCityInfo();
    AppState.selectedCity = null;
    
    this.showNotification('已取消选择', 'info');
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

  // 数据导出功能
  handleExportData() {
    const data = {
      visitedCities: Array.from(AppState.visitedCities),
      travelRecords: AppState.travelRecords,
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

  // 数据导入功能
  handleImportData() {
    // 认证检查：只有已登录用户才能执行此操作
    if (!AppState.isAuthenticated) {
      this.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
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
        
        await DataManager.saveUserData();
        this.showNotification('数据导入成功', 'success');
      } catch (error) {
        console.error('导入数据失败:', error);
        this.showNotification('导入失败：文件格式无效', 'danger');
      }
    };
    
    input.click();
  },

  // 帮助功能
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

  // 随机选择城市
  selectRandomCity() {
    // 获取未排除的城市
    const availableCities = AppState.filteredCities.filter(
      city => !AppState.visitedCities.has(city.id)
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

  // 更新认证UI状态
  updateAuthUI() {
    const authStatus = document.getElementById('authStatus');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (AppState.isAuthenticated) {
      // 已登录状态
      if (authStatus) {
        authStatus.textContent = '已登录 (项目所有者)';
        authStatus.className = 'auth-status authenticated';
      }
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
      // 未登录状态
      if (authStatus) {
        authStatus.textContent = '未登录 (只读模式)';
        authStatus.className = 'auth-status not-authenticated';
      }
      if (loginBtn) loginBtn.style.display = 'inline-block';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }
};