import { BaseView } from './BaseView.js';

export class DataView extends BaseView {
  constructor(container, params = {}) {
    super(container, params);
    this.storageInfo = null;
  }
  
  async render() {
    this.showLoading('正在加载数据管理...');
    
    try {
      // 检查全局对象
      if (!window.AppState || !window.DataManager) {
        throw new Error('应用未完全初始化');
      }
      
      // 渲染数据视图HTML
      const html = this.getTemplate();
      this.updateContent(html);
      
      // 加载存储信息
      await this.loadStorageInfo();
      
      // 绑定事件
      this.bindEvents();
      
      this.isRendered = true;
    } catch (error) {
      this.showError('加载数据管理视图失败', error);
    }
  }
  
  getTemplate() {
    return `
      <div class="data-view">
        <div class="view-header">
          <h2><i class="fas fa-database"></i> 数据管理</h2>
          <div class="view-controls">
            <button id="refreshStorageBtn" class="btn-icon" title="刷新">
              <i class="fas fa-redo"></i>
            </button>
          </div>
        </div>
        
        <div class="view-content">
          <div class="data-sections">
            <!-- 存储信息部分 -->
            <section class="data-section">
              <h3><i class="fas fa-hdd"></i> 存储信息</h3>
              <div class="storage-info-cards">
                <div class="info-card">
                  <div class="info-icon">
                    <i class="fas fa-city"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">城市数据</span>
                    <span class="info-value" id="citiesData">加载中...</span>
                  </div>
                </div>
                
                <div class="info-card">
                  <div class="info-icon">
                    <i class="fas fa-passport"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">旅游记录</span>
                    <span class="info-value" id="recordsData">加载中...</span>
                  </div>
                </div>
                
                <div class="info-card">
                  <div class="info-icon">
                    <i class="fas fa-user-check"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">已访问城市</span>
                    <span class="info-value" id="visitedData">加载中...</span>
                  </div>
                </div>
                

              </div>
              
              <div class="storage-usage">
                <div class="usage-header">
                  <h4><i class="fas fa-chart-pie"></i> 存储使用情况</h4>
                  <span id="totalStorage">计算中...</span>
                </div>
                <div class="usage-bar">
                  <div class="usage-fill" id="usageFill" style="width: 0%"></div>
                </div>
                <div class="usage-stats">
                  <span class="usage-stat">已使用: <span id="usedStorage">0 KB</span></span>
                  <span class="usage-stat">可用: <span id="availableStorage">∞</span></span>
                </div>
              </div>
            </section>
            
            <!-- 导入导出部分 -->
            <section class="data-section">
              <h3><i class="fas fa-exchange-alt"></i> 数据导入/导出</h3>
              <div class="import-export-cards">
                <div class="action-card export-card">
                  <div class="action-icon">
                    <i class="fas fa-download"></i>
                  </div>
                  <div class="action-content">
                    <h4>导出数据</h4>
                    <p>将所有旅行数据导出为JSON文件，用于备份或迁移。</p>
                    <button id="exportDataBtn" class="btn-primary">
                      <i class="fas fa-file-export"></i> 导出JSON
                    </button>
                  </div>
                </div>
                
                <div class="action-card import-card">
                  <div class="action-icon">
                    <i class="fas fa-upload"></i>
                  </div>
                  <div class="action-content">
                    <h4>导入数据</h4>
                    <p>从JSON文件导入旅行数据，将覆盖现有数据。</p>
                    <button id="importDataBtn" class="btn-primary">
                      <i class="fas fa-file-import"></i> 导入JSON
                    </button>
                    <div class="form-hint">
                      <i class="fas fa-exclamation-triangle"></i>
                      导入数据将覆盖当前所有旅行记录
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <!-- 数据操作部分 -->
            <section class="data-section">
              <h3><i class="fas fa-tools"></i> 数据操作</h3>
              <div class="data-actions">
                <div class="action-group">
                  <h4><i class="fas fa-broom"></i> 数据清理</h4>
                  <p>清理无效或过时的数据，优化存储空间。</p>
                  <div class="action-buttons">
                    <button id="cleanOrphanedBtn" class="btn-secondary">
                      <i class="fas fa-trash-alt"></i> 清理孤儿数据
                    </button>
                    <button id="clearAllDataBtn" class="btn-danger">
                      <i class="fas fa-skull-crossbones"></i> 清除所有数据
                    </button>
                  </div>
                  <div class="form-hint">
                    <i class="fas fa-info-circle"></i>
                    "孤儿数据"指已删除记录对应的城市标记
                  </div>
                </div>
                
                <div class="action-group">
                  <h4><i class="fas fa-redo"></i> 数据重置</h4>
                  <p>重置应用数据到初始状态，保留城市数据。</p>
                  <button id="resetDataBtn" class="btn-warning">
                    <i class="fas fa-history"></i> 重置旅行数据
                  </button>
                  <div class="form-hint">
                    <i class="fas fa-exclamation-triangle"></i>
                    此操作将清除所有旅行记录和用户设置
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        <div class="view-footer">
          <div class="status-info">
            <span id="dataStatus">就绪</span>
            <span class="hint">定期备份您的旅行数据以防止丢失</span>
          </div>
        </div>
      </div>
    `;
  }
  
  async loadStorageInfo() {
    if (!window.AppState || !window.DataManager) return;
    
    try {
      // 更新基本信息
      this.updateBasicInfo();
      
      // 更新存储使用情况
      if (typeof window.DataManager.updateStorageUsage === 'function') {
        await window.DataManager.updateStorageUsage();
      }
      
      // 手动计算存储信息
      await this.calculateStorageInfo();
      
    } catch (error) {
      console.error('加载存储信息失败:', error);
    }
  }
  
  updateBasicInfo() {
    if (!window.AppState) return;
    
    // 城市数据
    const citiesElement = this.container.querySelector('#citiesData');
    if (citiesElement) {
      citiesElement.textContent = `${window.AppState.filteredCities.length} 个城市`;
    }
    
    // 旅游记录
    const recordsElement = this.container.querySelector('#recordsData');
    if (recordsElement) {
      recordsElement.textContent = `${window.AppState.travelRecords.length} 条记录`;
    }
    
    // 已访问城市
    const visitedElement = this.container.querySelector('#visitedData');
    if (visitedElement) {
      visitedElement.textContent = `${window.AppState.visitedCities.size} 个城市`;
    }
    

  }
  
  async calculateStorageInfo() {
    try {
      // 这里使用localforage API来获取存储信息
      const localforage = window.localforage || (window.window && window.window.localforage);
      
      if (!localforage) {
        console.warn('localforage不可用，无法计算存储信息');
        return;
      }
      
      let totalSize = 0;
      const keys = await localforage.keys();
      
      for (const key of keys) {
        const value = await localforage.getItem(key);
        if (value) {
          totalSize += JSON.stringify(value).length;
        }
      }
      
      // 更新UI
      const usedStorageElement = this.container.querySelector('#usedStorage');
      const totalStorageElement = this.container.querySelector('#totalStorage');
      const usageFillElement = this.container.querySelector('#usageFill');
      
      if (usedStorageElement) {
        const sizeKB = (totalSize / 1024).toFixed(2);
        usedStorageElement.textContent = `${sizeKB} KB`;
      }
      
      if (totalStorageElement) {
        // IndexedDB通常有较大限制（约50MB），这里显示估算
        totalStorageElement.textContent = '~50 MB 限额';
      }
      
      if (usageFillElement) {
        // 计算使用百分比（假设限额为50MB）
        const limitBytes = 50 * 1024 * 1024; // 50MB
        const usagePercent = Math.min((totalSize / limitBytes) * 100, 100);
        usageFillElement.style.width = `${usagePercent.toFixed(1)}%`;
      }
      
    } catch (error) {
      console.error('计算存储信息失败:', error);
    }
  }
  
  bindEvents() {
    // 刷新按钮
    const refreshBtn = this.container.querySelector('#refreshStorageBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadStorageInfo());
    }
    
    // 导出按钮
    const exportBtn = this.container.querySelector('#exportDataBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.handleExportData());
    }
    
    // 导入按钮
    const importBtn = this.container.querySelector('#importDataBtn');
    if (importBtn) {
      importBtn.addEventListener('click', () => this.handleImportData());
    }
    
    // 清理孤儿数据按钮
    const cleanOrphanedBtn = this.container.querySelector('#cleanOrphanedBtn');
    if (cleanOrphanedBtn) {
      cleanOrphanedBtn.addEventListener('click', () => this.handleCleanOrphanedData());
    }
    
    // 清除所有数据按钮
    const clearAllDataBtn = this.container.querySelector('#clearAllDataBtn');
    if (clearAllDataBtn) {
      clearAllDataBtn.addEventListener('click', () => this.handleClearAllData());
    }
    
    // 重置数据按钮
    const resetDataBtn = this.container.querySelector('#resetDataBtn');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => this.handleResetData());
    }
  }
  
  async handleExportData() {
    if (!window.UIManager) return;
    
    // 使用现有的导出功能
    if (typeof window.UIManager.handleExportData === 'function') {
      window.UIManager.handleExportData();
    } else {
      // 备用导出实现
      this.exportDataFallback();
    }
  }
  
  async exportDataFallback() {
    if (!window.AppState) return;
    
    const data = {
      visitedCities: Array.from(window.AppState.visitedCities),
      travelRecords: window.AppState.travelRecords,
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0'
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
    
    // 显示通知
    if (window.UIManager && window.UIManager.showNotification) {
      window.UIManager.showNotification('数据导出成功', 'success');
    }
  }
  
  async handleImportData() {
    if (!window.UIManager) return;
    
    // 认证检查
    if (!window.AppState.isAuthenticated) {
      if (window.UIManager.showNotification) {
        window.UIManager.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
      }
      return;
    }
    
    // 使用现有的导入功能
    if (typeof window.UIManager.handleImportData === 'function') {
      window.UIManager.handleImportData();
    } else {
      // 备用导入实现
      this.importDataFallback();
    }
  }
  
  importDataFallback() {
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
        
        window.AppState.visitedCities = new Set(data.visitedCities || []);
        window.AppState.travelRecords = data.travelRecords || [];
        
        // 保存数据
        if (window.DataManager && typeof window.DataManager.saveUserData === 'function') {
          await window.DataManager.saveUserData();
        }
        
        // 更新存储信息
        await this.loadStorageInfo();
        
        // 显示通知
        if (window.UIManager && window.UIManager.showNotification) {
          window.UIManager.showNotification('数据导入成功', 'success');
        }
      } catch (error) {
        console.error('导入数据失败:', error);
        if (window.UIManager && window.UIManager.showNotification) {
          window.UIManager.showNotification('导入失败：文件格式无效', 'danger');
        }
      }
    };
    
    input.click();
  }
  
  async handleCleanOrphanedData() {
    if (!window.AppState || !window.DataManager) return;
    
    // 认证检查
    if (!window.AppState.isAuthenticated) {
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
      }
      return;
    }
    
    // 查找孤儿数据（已访问城市中没有对应记录的）
    const orphanedCities = new Set();
    
    // 遍历已访问城市，检查是否有对应记录
    for (const cityId of window.AppState.visitedCities) {
      const hasRecord = window.AppState.travelRecords.some(record => record.cityId === cityId);
      if (!hasRecord) {
        orphanedCities.add(cityId);
      }
    }
    
    if (orphanedCities.size === 0) {
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification('没有发现孤儿数据', 'info');
      }
      return;
    }
    
    if (!confirm(`发现 ${orphanedCities.size} 个孤儿数据，确定要清理吗？`)) {
      return;
    }
    
    try {
      // 清理孤儿数据
      for (const cityId of orphanedCities) {
        window.AppState.visitedCities.delete(cityId);
      }
      
      // 保存数据
      await window.DataManager.saveUserData();
      
      // 更新存储信息
      await this.loadStorageInfo();
      
      // 显示通知
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification(`已清理 ${orphanedCities.size} 个孤儿数据`, 'success');
      }
    } catch (error) {
      console.error('清理孤儿数据失败:', error);
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification('清理数据时发生错误', 'danger');
      }
    }
  }
  
  async handleClearAllData() {
    if (!window.AppState || !window.DataManager) return;
    
    // 认证检查
    if (!window.AppState.isAuthenticated) {
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
      }
      return;
    }
    
    if (!confirm('确定要清除所有数据吗？此操作将删除所有旅行记录、设置，且不可撤销！')) {
      return;
    }
    
    try {
      // 清空所有数据
      window.AppState.visitedCities.clear();
      window.AppState.travelRecords = [];
      
      // 保存数据
      await window.DataManager.saveUserData();
      
      // 更新存储信息
      await this.loadStorageInfo();
      
      // 显示通知
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification('所有数据已清除', 'success');
      }
    } catch (error) {
      console.error('清除所有数据失败:', error);
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification('清除数据时发生错误', 'danger');
      }
    }
  }
  
  async handleResetData() {
    if (!window.AppState || !window.DataManager) return;
    
    // 认证检查
    if (!window.AppState.isAuthenticated) {
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
      }
      return;
    }
    
    if (!confirm('确定要重置所有旅行数据吗？此操作将清除所有旅行记录和用户设置，但保留城市数据。')) {
      return;
    }
    
    try {
      // 重置旅行数据
      window.AppState.visitedCities.clear();
      window.AppState.travelRecords = [];
      window.AppState.selectedCity = null;
      
      // 保存数据
      await window.DataManager.saveUserData();
      
      // 更新存储信息
      await this.loadStorageInfo();
      
      // 显示通知
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification('旅行数据已重置', 'success');
      }
    } catch (error) {
      console.error('重置数据失败:', error);
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification('重置数据时发生错误', 'danger');
      }
    }
  }
  
  async onEnter() {
    console.log('进入数据管理视图');
    // 加载存储信息
    await this.loadStorageInfo();
  }
  
  async onLeave() {
    console.log('离开数据管理视图');
  }
}