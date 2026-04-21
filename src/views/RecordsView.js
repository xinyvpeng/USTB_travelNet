import { BaseView } from './BaseView.js';

export class RecordsView extends BaseView {
  static MAX_PHOTOS_PER_RECORD = 10;
  
  constructor(container, params = {}) {
    super(container, params);
    this.editingRecordId = null;
  }
  
  async render() {
    this.showLoading('正在加载旅游记录...');
    
    try {
      // 检查全局对象
      if (!window.AppState || !window.UIManager) {
        throw new Error('应用未完全初始化');
      }
      
      // 渲染记录视图HTML
      const html = this.getTemplate();
      this.updateContent(html);
      
      // 更新记录列表
      this.updateRecordsList();
      
      // 绑定事件
      this.bindEvents();
      
      this.isRendered = true;
    } catch (error) {
      this.showError('加载旅游记录失败', error);
    }
  }
  
  getTemplate() {
    const recordCount = window.AppState ? window.AppState.travelRecords.length : 0;
    
    return `
      <div class="records-view">
        <div class="view-header">
          <h2><i class="fas fa-passport"></i> 我的旅游记录</h2>
          <div class="view-controls">
            <button id="addRecordBtn" class="btn-primary">
              <i class="fas fa-plus"></i> 新增记录
            </button>
            <button id="clearRecordsBtn" class="btn-danger">
              <i class="fas fa-trash"></i> 清空记录
            </button>
            <button id="exportRecordsBtn" class="btn-secondary">
              <i class="fas fa-download"></i> 导出
            </button>
          </div>
        </div>
        
        <div class="view-content">
          <div class="records-stats">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-city"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value" id="totalRecords">${recordCount}</span>
                <span class="stat-label">总记录数</span>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-road"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value" id="totalDistance">0</span>
                <span class="stat-label">总距离(km)</span>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-calendar"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value" id="uniqueCities">0</span>
                <span class="stat-label">唯一城市</span>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-camera"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value" id="totalPhotos">0</span>
                <span class="stat-label">照片总数</span>
              </div>
            </div>
          </div>
          
          <div class="records-container">
            <div id="recordsList" class="records-list">
              <!-- 记录列表动态生成 -->
              ${recordCount === 0 ? `
                <div class="empty-state">
                  <i class="fas fa-compass"></i>
                  <p>暂无旅游记录</p>
                  <p class="empty-hint">开始探索周边城市，记录您的旅行足迹</p>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
        
        <div class="view-footer">
          <div class="status-info">
            <span id="recordsStatus">就绪</span>
            <span class="hint">点击记录查看详情，支持编辑和删除</span>
          </div>
        </div>
      </div>
      
      <!-- 编辑记录模态框（内联，避免依赖外部模态框） -->
      <div id="recordEditModal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h2><i class="fas fa-edit"></i> 编辑旅行记录</h2>
            <button class="modal-close" id="recordEditModalClose">&times;</button>
          </div>
          <div class="modal-body">
            <form id="recordEditForm" class="edit-record-form">
              <div class="form-group">
                <label for="editRecordCityName"><i class="fas fa-city"></i> 城市名称</label>
                <input type="text" id="editRecordCityName" readonly class="readonly-input">
              </div>
              
              <div class="form-group">
                <label for="editRecordVisitDate"><i class="fas fa-calendar-alt"></i> 到访日期</label>
                <input type="date" id="editRecordVisitDate" required>
              </div>
              
              <div class="form-group">
                <label for="editRecordThoughts"><i class="fas fa-comment-dots"></i> 旅行感想</label>
                <textarea id="editRecordThoughts" rows="4" placeholder="记录您的旅行体验、感受或建议..."></textarea>
              </div>
              
              <div class="form-group">
                <label><i class="fas fa-images"></i> 照片管理</label>
                <div class="photos-management">
                  <div id="editRecordPhotosList" class="photos-list">
                    <div class="empty-photos">
                      <i class="fas fa-camera"></i>
                      <span>暂无照片</span>
                    </div>
                  </div>
                  <div class="photos-actions">
                    <button type="button" id="addPhotoBtn" class="btn-small">
                      <i class="fas fa-link"></i> 添加照片URL
                    </button>
                    <button type="button" id="uploadPhotoBtn" class="btn-small">
                      <i class="fas fa-upload"></i> 上传本地照片
                    </button>
                    <input type="file" id="photoFileInput" accept="image/*" multiple style="display: none;">
                  </div>
                </div>
              </div>
              
              <div class="form-actions">
                <button type="submit" id="editRecordSaveBtn" class="btn-primary">
                  <i class="fas fa-save"></i> 保存更改
                </button>
                <button type="button" id="editRecordCancelBtn" class="btn-secondary">
                  取消
                </button>
                <button type="button" id="editRecordDeleteBtn" class="btn-danger" style="margin-left: auto;">
                  <i class="fas fa-trash"></i> 删除记录
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }
  
  async updateRecordsList() {
    const recordsList = this.container.querySelector('#recordsList');
    if (!recordsList || !window.AppState) return;
    
    const records = window.AppState.travelRecords;
    await this.updateRecordsStats();
    
    if (!records || records.length === 0) {
      recordsList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-compass"></i>
          <p>暂无旅游记录</p>
          <p class="empty-hint">开始探索周边城市，记录您的旅行足迹</p>
        </div>
      `;
      return;
    }
    
    // 并行获取所有记录的照片
    const recordsWithPhotos = [];
    for (const record of records) {
      let photos = [];
      if (window.PhotoManager) {
        try {
          photos = await window.PhotoManager.getPhotos(record.id);
        } catch (error) {
          console.error(`获取记录 ${record.id} 的照片失败:`, error);
        }
      }
      recordsWithPhotos.push({ record, photos });
    }
    
    let recordsHTML = '';
    
    recordsWithPhotos.forEach(({ record, photos }) => {
      const city = window.AppState.cities.find(c => c.id === record.cityId);
      const cityName = city ? city.name : record.cityName;
      const distance = city ? city.distance : record.distance;
      const visitDate = new Date(record.visitDate).toLocaleDateString('zh-CN');
      
      recordsHTML += `
        <div class="record-card" data-record-id="${record.id}">
          <div class="record-card-header">
            <div class="record-city-info">
              <h4 class="record-city-name">${cityName}</h4>
              <span class="record-date">${visitDate}</span>
            </div>
            <div class="record-card-actions">
              <span class="record-distance">${distance.toFixed(1)} km</span>
              <button class="btn-icon btn-edit-record" data-record-id="${record.id}" title="编辑">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon btn-delete-record" data-record-id="${record.id}" title="删除">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <div class="record-card-body">
            <p class="record-thoughts">${record.thoughts || '<span class="text-muted">暂无感想</span>'}</p>
            
            ${photos.length > 0 ? `
              <div class="record-photos-preview">
                <div class="photos-count">
                  <i class="fas fa-images"></i>
                  <span>${photos.length} 张照片</span>
                </div>
                <div class="photos-thumbnails">
                  ${photos.slice(0, 3).map((photo, index) => `
                    <div class="photo-thumbnail" style="background-image: url('${photo.dataUrl}')" 
                         data-photo-id="${photo.id}" data-photo-url="${photo.dataUrl}" data-record-id="${record.id}">
                      ${index === 2 && photos.length > 3 ? 
                        `<span class="more-photos">+${photos.length - 3}</span>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
          
          <div class="record-card-footer">
            <div class="record-tags">
              <span class="record-tag">
                <i class="fas fa-clock"></i>
                ${this.getTimeAgo(record.visitDate)}
              </span>
              ${city ? `
                <span class="record-tag">
                  <i class="fas fa-compass"></i>
                  ${Math.round(city.bearing)}° 方向
                </span>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    });
    
    recordsList.innerHTML = recordsHTML;
    
    // 绑定记录卡片事件
    this.bindRecordCardEvents();
  }
  
  async updateRecordsStats() {
    if (!window.AppState) return;
    
    const records = window.AppState.travelRecords;
    
    // 更新总记录数
    const totalRecordsElement = this.container.querySelector('#totalRecords');
    if (totalRecordsElement) {
      totalRecordsElement.textContent = records.length;
    }
    
    // 计算总距离
    let totalDistance = 0;
    let uniqueCities = new Set();
    let totalPhotos = 0;
    
    // 使用PhotoManager获取每个记录的照片数量
    for (const record of records) {
      const city = window.AppState.cities.find(c => c.id === record.cityId);
      if (city) {
        totalDistance += city.distance;
        uniqueCities.add(city.id);
      }
      
      // 从PhotoManager获取照片
      if (window.PhotoManager) {
        try {
          const photos = await window.PhotoManager.getPhotos(record.id);
          totalPhotos += photos.length;
        } catch (error) {
          console.error(`获取记录 ${record.id} 的照片失败:`, error);
        }
      }
    }
    
    // 更新总距离
    const totalDistanceElement = this.container.querySelector('#totalDistance');
    if (totalDistanceElement) {
      totalDistanceElement.textContent = totalDistance.toFixed(0);
    }
    
    // 更新唯一城市数
    const uniqueCitiesElement = this.container.querySelector('#uniqueCities');
    if (uniqueCitiesElement) {
      uniqueCitiesElement.textContent = uniqueCities.size;
    }
    
    // 更新照片总数
    const totalPhotosElement = this.container.querySelector('#totalPhotos');
    if (totalPhotosElement) {
      totalPhotosElement.textContent = totalPhotos;
    }
  }
  
  getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
    return `${Math.floor(diffDays / 365)}年前`;
  }
  
  bindEvents() {
    // 新增记录按钮
    const addRecordBtn = this.container.querySelector('#addRecordBtn');
    if (addRecordBtn) {
      addRecordBtn.addEventListener('click', () => this.handleAddRecord());
    }
    
    // 清空记录按钮
    const clearRecordsBtn = this.container.querySelector('#clearRecordsBtn');
    if (clearRecordsBtn) {
      clearRecordsBtn.addEventListener('click', () => this.handleClearRecords());
    }
    
    // 导出按钮
    const exportRecordsBtn = this.container.querySelector('#exportRecordsBtn');
    if (exportRecordsBtn) {
      exportRecordsBtn.addEventListener('click', () => this.handleExportRecords());
    }
  }
  
  bindRecordCardEvents() {
    // 编辑按钮
    const editButtons = this.container.querySelectorAll('.btn-edit-record');
    editButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const recordId = btn.dataset.recordId;
        this.editRecord(recordId);
      });
    });
    
    // 删除按钮
    const deleteButtons = this.container.querySelectorAll('.btn-delete-record');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const recordId = btn.dataset.recordId;
        this.deleteRecord(recordId);
      });
    });
    
    // 照片缩略图点击
    const photoThumbnails = this.container.querySelectorAll('.photo-thumbnail');
    photoThumbnails.forEach(thumb => {
      thumb.addEventListener('click', (e) => {
        e.stopPropagation();
        const photoUrl = thumb.dataset.photoUrl;
        if (photoUrl) {
          console.log('缩略图点击，URL:', photoUrl.substring(0, 50) + '...');
          
          // 尝试在新窗口打开
          try {
            const newWindow = window.open(photoUrl, '_blank');
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
              // 可能被浏览器阻止，使用模态框
              this.showPhotoInModal(photoUrl);
            }
          } catch (error) {
            console.error('打开照片失败:', error);
            this.showPhotoInModal(photoUrl);
          }
        }
      });
    });
    
    // 记录卡片点击
    const recordCards = this.container.querySelectorAll('.record-card');
    recordCards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        
        const recordId = card.dataset.recordId;
        this.viewRecordDetails(recordId);
      });
    });
  }
  
  async handleAddRecord() {
    if (!window.AppState || !window.UIManager) return;
    
    // 认证检查
    if (!window.AppState.isAuthenticated) {
      if (window.UIManager.showNotification) {
        window.UIManager.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
      }
      return;
    }
    
    // 显示添加记录模态框（暂时使用简单提示）
    if (window.UIManager.showNotification) {
      window.UIManager.showNotification('请先在城市列表中选择城市并点击"到访"按钮', 'info');
    }
  }
  
  async handleClearRecords() {
    if (!window.AppState || !window.UIManager) return;
    
    // 认证检查
    if (!window.AppState.isAuthenticated) {
      if (window.UIManager.showNotification) {
        window.UIManager.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
      }
      return;
    }
    
    if (!confirm('确定要清除所有旅行记录吗？此操作不可撤销。')) {
      return;
    }
    
    try {
      window.AppState.travelRecords = [];
      window.AppState.visitedCities.clear();
      
      // 保存数据
      if (window.DataManager && typeof window.DataManager.saveUserData === 'function') {
        await window.DataManager.saveUserData();
      }
      
      // 更新UI
      this.updateRecordsList();
      
      // 显示通知
      if (window.UIManager.showNotification) {
        window.UIManager.showNotification('所有记录已清除', 'success');
      }
    } catch (error) {
      console.error('清除记录失败:', error);
      if (window.UIManager.showNotification) {
        window.UIManager.showNotification('清除记录时发生错误', 'danger');
      }
    }
  }
  
  async handleExportRecords() {
    if (!window.AppState || !window.UIManager) return;
    
    // 使用现有的导出功能
    if (typeof window.UIManager.handleExportData === 'function') {
      window.UIManager.handleExportData();
    }
  }
  
  editRecord(recordId) {
    if (!window.AppState || !window.UIManager) return;
    
    // 认证检查
    if (!window.AppState.isAuthenticated) {
      if (window.UIManager.showNotification) {
        window.UIManager.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
      }
      return;
    }
    
    this.editingRecordId = recordId;
    this.showEditModal(recordId);
  }
  
  async showEditModal(recordId) {
    const record = window.AppState.travelRecords.find(r => r.id === recordId);
    if (!record) return;
    
    const city = window.AppState.cities.find(c => c.id === record.cityId);
    const cityName = city ? city.name : record.cityName;
    
    // 填充表单
    const modal = this.container.querySelector('#recordEditModal');
    const cityNameInput = modal.querySelector('#editRecordCityName');
    const visitDateInput = modal.querySelector('#editRecordVisitDate');
    const thoughtsInput = modal.querySelector('#editRecordThoughts');
    
    if (cityNameInput) cityNameInput.value = cityName;
    if (visitDateInput) visitDateInput.value = record.visitDate;
    if (thoughtsInput) thoughtsInput.value = record.thoughts || '';
    
    // 显示模态框
    modal.style.display = 'flex';
    
    // 绑定模态框事件
    this.bindModalEvents();
    
    // 异步加载照片
    await this.loadPhotosForRecord(recordId);
  }
  
  // 加载记录的照片并更新列表
  async loadPhotosForRecord(recordId) {
    const photosList = this.container.querySelector('#editRecordPhotosList');
    if (!photosList) return;
    
    // 显示加载状态
    photosList.innerHTML = `
      <div class="loading-photos">
        <i class="fas fa-spinner fa-spin"></i>
        <span>加载照片中...</span>
      </div>
    `;
    
    try {
      let photos = [];
      if (window.PhotoManager) {
        photos = await window.PhotoManager.getPhotos(recordId);
      }
      
      // 更新照片列表
      this.updatePhotoList(photos);
    } catch (error) {
      console.error('加载照片失败:', error);
      photosList.innerHTML = `
        <div class="error-photos">
          <i class="fas fa-exclamation-triangle"></i>
          <span>照片加载失败</span>
        </div>
      `;
    }
  }

  updatePhotoList(photos) {
    const photosList = this.container.querySelector('#editRecordPhotosList');
    if (!photosList) return;
    
    if (!photos || photos.length === 0) {
      photosList.innerHTML = `
        <div class="empty-photos">
          <i class="fas fa-camera"></i>
          <span>暂无照片</span>
        </div>
      `;
      return;
    }
    
    let photosHTML = '';
    photos.forEach((photo) => {
      photosHTML += `
        <div class="photo-item" data-photo-id="${photo.id}">
          <img src="${photo.dataUrl}" alt="旅行照片" onerror="this.style.display='none'">
          <div class="photo-actions">
            <button class="btn-small btn-view-photo" data-url="${photo.dataUrl}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-small btn-remove-photo" data-photo-id="${photo.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    });
    
    photosList.innerHTML = photosHTML;
    
    // 绑定照片按钮事件
    const viewButtons = photosList.querySelectorAll('.btn-view-photo');
    const removeButtons = photosList.querySelectorAll('.btn-remove-photo');
    
    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const url = e.target.closest('button').dataset.url;
        console.log('查看照片，URL:', url ? '有' : '无', url ? url.substring(0, 50) + '...' : '');
        
        if (!url) {
          console.error('没有照片URL');
          if (window.UIManager && window.UIManager.showNotification) {
            window.UIManager.showNotification('照片URL无效', 'warning');
          }
          return;
        }
        
        // 尝试在新窗口打开
        try {
          const newWindow = window.open(url, '_blank');
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            // 可能被浏览器阻止，尝试其他方式
            console.log('新窗口可能被阻止，使用备用方案');
            this.showPhotoInModal(url);
          }
        } catch (error) {
          console.error('打开照片失败:', error);
          this.showPhotoInModal(url);
        }
      });
    });
    
    removeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const photoId = e.target.closest('button').dataset.photoId;
        this.removePhoto(photoId);
      });
    });
  }
  
  bindModalEvents() {
    const modal = this.container.querySelector('#recordEditModal');
    if (!modal) return;
    
    // 关闭按钮
    const closeBtn = modal.querySelector('#recordEditModalClose');
    const cancelBtn = modal.querySelector('#editRecordCancelBtn');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideEditModal());
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hideEditModal());
    }
    
    // 模态框外部点击关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideEditModal();
      }
    });
    
    // 保存按钮
    const saveBtn = modal.querySelector('#editRecordSaveBtn');
    if (saveBtn) {
      // 移除旧的事件监听器，添加新的
      const form = modal.querySelector('#recordEditForm');
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);
      
      newForm.addEventListener('submit', (e) => this.handleSaveRecord(e));
    }
    
    // 删除按钮
    const deleteBtn = modal.querySelector('#editRecordDeleteBtn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.handleDeleteRecord());
    }
    
    // 添加照片按钮
    const addPhotoBtn = modal.querySelector('#addPhotoBtn');
    if (addPhotoBtn) {
      addPhotoBtn.addEventListener('click', () => this.handleAddPhoto());
    }
    
    // 上传照片按钮
    const uploadPhotoBtn = modal.querySelector('#uploadPhotoBtn');
    const photoFileInput = modal.querySelector('#photoFileInput');
    if (uploadPhotoBtn && photoFileInput) {
      uploadPhotoBtn.addEventListener('click', () => {
        photoFileInput.click();
      });
      
      photoFileInput.addEventListener('change', (e) => {
        this.handleUploadPhoto(e);
      });
    }
  }
  
  hideEditModal() {
    const modal = this.container.querySelector('#recordEditModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.editingRecordId = null;
  }
  
  async handleSaveRecord(event) {
    event.preventDefault();
    
    if (!this.editingRecordId || !window.AppState) return;
    
    const record = window.AppState.travelRecords.find(r => r.id === this.editingRecordId);
    if (!record) return;
    
    const modal = this.container.querySelector('#recordEditModal');
    const visitDateInput = modal.querySelector('#editRecordVisitDate');
    const thoughtsInput = modal.querySelector('#editRecordThoughts');
    
    if (!visitDateInput || !thoughtsInput) return;
    
    // 更新记录
    record.visitDate = visitDateInput.value;
    record.thoughts = thoughtsInput.value;
    
    try {
      // 保存数据
      if (window.DataManager && typeof window.DataManager.saveUserData === 'function') {
        await window.DataManager.saveUserData();
      }
      
      // 更新UI
      this.updateRecordsList();
      this.hideEditModal();
      
      // 显示通知
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification('旅行记录已更新', 'success');
      }
    } catch (error) {
      console.error('保存记录失败:', error);
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification('保存记录时发生错误', 'danger');
      }
    }
  }
  
  async handleDeleteRecord() {
    if (!this.editingRecordId || !window.AppState) return;
    
    if (!confirm('确定要删除这条旅行记录吗？此操作不可撤销。')) {
      return;
    }
    
    await this.deleteRecord(this.editingRecordId);
    this.hideEditModal();
  }
  
  async deleteRecord(recordId) {
    if (!window.AppState || !window.UIManager) return;
    
    // 认证检查
    if (!window.AppState.isAuthenticated) {
      if (window.UIManager.showNotification) {
        window.UIManager.showNotification('此操作需要登录。请先登录以编辑内容。', 'warning');
      }
      return;
    }
    
    const recordIndex = window.AppState.travelRecords.findIndex(r => r.id === recordId);
    if (recordIndex === -1) return;
    
    const record = window.AppState.travelRecords[recordIndex];
    const cityName = record.cityName;
    
    try {
      // 从已访问城市中移除
      window.AppState.visitedCities.delete(record.cityId);
      
      // 从旅游记录中移除
      window.AppState.travelRecords.splice(recordIndex, 1);
      
      // 删除该记录的所有照片
      if (window.PhotoManager && typeof window.PhotoManager.deleteAllPhotos === 'function') {
        await window.PhotoManager.deleteAllPhotos(recordId);
      }
      
      // 保存数据
      if (window.DataManager && typeof window.DataManager.saveUserData === 'function') {
        await window.DataManager.saveUserData();
      }
      
      // 更新UI
      await this.updateRecordsList();
      
      // 显示通知
      if (window.UIManager.showNotification) {
        window.UIManager.showNotification(`已删除 ${cityName} 的旅行记录`, 'success');
      }
    } catch (error) {
      console.error('删除记录失败:', error);
      if (window.UIManager.showNotification) {
        window.UIManager.showNotification('删除记录时发生错误', 'danger');
      }
    }
  }
  
  async handleAddPhoto() {
    if (!this.editingRecordId || !window.AppState || !window.PhotoManager) return;
    
    const url = prompt('请输入照片URL地址:');
    if (!url) return;
    
    // 简单的URL验证
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification('请输入有效的URL地址 (以 http:// 或 https:// 开头)', 'warning');
      }
      return;
    }
    
    // 创建照片数据对象（URL作为dataUrl）
    const photoData = {
      originalFile: { name: 'external_image.jpg' },
      compressedDataUrl: url,
      originalSizeKB: 0,
      compressedSizeKB: 0,
      width: 800,
      height: 600,
      quality: 1
    };
    
    // 保存到PhotoManager
    const result = await window.PhotoManager.savePhoto(this.editingRecordId, photoData);
    
    if (result.success) {
      // 重新加载照片列表
      await this.loadPhotosForRecord(this.editingRecordId);
      
      // 显示通知
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification('照片已添加', 'success');
      }
    } else {
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification(`添加照片失败: ${result.message}`, 'warning');
      }
    }
  }
  
  async handleUploadPhoto(event) {
    if (!this.editingRecordId || !window.AppState || !window.PhotoManager) return;
    
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // 检查照片数量限制（使用PhotoManager的配置）
    const currentPhotos = await window.PhotoManager.getPhotos(this.editingRecordId);
    const maxPhotos = window.PhotoManager.CONFIG.MAX_PHOTOS_PER_RECORD;
    
    if (currentPhotos.length >= maxPhotos) {
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification(`每个旅游记录最多只能保存 ${maxPhotos} 张照片`, 'warning');
      }
      return;
    }
    
    let uploadedCount = 0;
    let errorCount = 0;
    let limitExceeded = false;
    
    // 处理每个文件
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        errorCount++;
        continue;
      }
      
      // 检查文件大小（限制为5MB）
      if (file.size > 5 * 1024 * 1024) {
        errorCount++;
        continue;
      }
      
      // 检查照片数量限制
      if (currentPhotos.length + uploadedCount >= maxPhotos) {
        if (window.UIManager && window.UIManager.showNotification) {
          window.UIManager.showNotification(`已达到照片数量限制（最多 ${maxPhotos} 张）`, 'warning');
        }
        limitExceeded = true;
        break;
      }
      
      try {
        // 使用PhotoManager压缩图片
        const compressedPhoto = await window.PhotoManager.compressImage(file);
        
        // 保存压缩后的照片
        const result = await window.PhotoManager.savePhoto(this.editingRecordId, compressedPhoto);
        
        if (result.success) {
          uploadedCount++;
        } else {
          errorCount++;
          console.error('保存照片失败:', result.message);
        }
      } catch (error) {
        console.error('处理照片失败:', error);
        errorCount++;
      }
    }
    
    // 清除文件输入，以便可以再次选择相同的文件
    event.target.value = '';
    
    // 重新加载照片列表
    if (uploadedCount > 0) {
      await this.loadPhotosForRecord(this.editingRecordId);
    }
    
    // 显示通知
    if (window.UIManager && window.UIManager.showNotification) {
      let message = '';
      if (uploadedCount > 0 && errorCount === 0) {
        message = `已上传 ${uploadedCount} 张照片`;
        if (limitExceeded) {
          message += `，已达到照片数量限制（最多 ${maxPhotos} 张）`;
        }
      } else if (uploadedCount > 0 && errorCount > 0) {
        message = `已上传 ${uploadedCount} 张照片，${errorCount} 张失败（非图片、文件过大或处理错误）`;
        if (limitExceeded) {
          message += `，已达到照片数量限制（最多 ${maxPhotos} 张）`;
        }
      } else if (uploadedCount === 0 && errorCount > 0) {
        message = '上传失败：请确保选择的是图片文件且大小不超过5MB';
      } else if (limitExceeded && uploadedCount === 0 && errorCount === 0) {
        // 这种情况应该不会发生，因为如果limitExceeded且uploadedCount=0，说明在循环开始前就已经达到限制了
        // 但我们已经在前面的检查中返回了
      }
      
      if (message) {
        window.UIManager.showNotification(message, uploadedCount > 0 ? 'success' : 'warning');
      }
    }
  }
  
  // 将文件读取为DataURL的辅助方法
  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = (e) => {
        reject(new Error('文件读取失败'));
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  async removePhoto(photoId) {
    if (!this.editingRecordId || !window.AppState || !window.PhotoManager) return;
    
    try {
      // 从PhotoManager删除照片
      const result = await window.PhotoManager.deletePhoto(this.editingRecordId, photoId);
      
      if (result.success) {
        // 重新加载照片列表
        await this.loadPhotosForRecord(this.editingRecordId);
        
        // 显示通知
        if (window.UIManager && window.UIManager.showNotification) {
          window.UIManager.showNotification('照片已删除', 'success');
        }
      } else {
        if (window.UIManager && window.UIManager.showNotification) {
          window.UIManager.showNotification(`删除照片失败: ${result.message}`, 'warning');
        }
      }
    } catch (error) {
      console.error('删除照片失败:', error);
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification('删除照片时发生错误', 'danger');
      }
    }
  }
  
  // 在模态框中显示照片
  showPhotoInModal(photoUrl) {
    // 创建模态框元素
    const modal = document.createElement('div');
    modal.className = 'photo-viewer-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;
    
    // 创建图片容器
    const imgContainer = document.createElement('div');
    imgContainer.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      position: relative;
    `;
    
    // 创建图片元素
    const img = document.createElement('img');
    img.src = photoUrl;
    img.style.cssText = `
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    `;
    img.onerror = () => {
      img.alt = '图片加载失败';
      img.style.padding = '20px';
      img.style.background = '#333';
      img.style.color = '#fff';
    };
    
    // 创建关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
      position: absolute;
      top: -40px;
      right: -10px;
      background: #ff4757;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeBtn.onclick = () => document.body.removeChild(modal);
    
    // 组装
    imgContainer.appendChild(img);
    imgContainer.appendChild(closeBtn);
    modal.appendChild(imgContainer);
    
    // 点击模态框背景关闭
    modal.onclick = (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    };
    
    // 添加到页面
    document.body.appendChild(modal);
  }
  
  async viewRecordDetails(recordId) {
    // 显示记录详情（简单实现）
    const record = window.AppState.travelRecords.find(r => r.id === recordId);
    if (!record) return;
    
    const city = window.AppState.cities.find(c => c.id === record.cityId);
    const cityName = city ? city.name : record.cityName;
    
    // 从PhotoManager获取照片数量
    let photoCount = 0;
    if (window.PhotoManager) {
      try {
        const photos = await window.PhotoManager.getPhotos(recordId);
        photoCount = photos.length;
      } catch (error) {
        console.error('获取照片数量失败:', error);
      }
    }
    
    alert(`${cityName} 的旅行记录\n
到访日期: ${record.visitDate}\n
旅行感想: ${record.thoughts || '暂无'}\n
照片数量: ${photoCount}`);
  }
  
  async onEnter() {
    console.log('进入旅游记录视图');
    // 更新记录列表
    await this.updateRecordsList();
  }
  
  async onLeave() {
    console.log('离开旅游记录视图');
    // 隐藏编辑模态框（如果打开）
    this.hideEditModal();
  }
}