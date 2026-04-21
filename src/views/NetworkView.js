import { BaseView } from './BaseView.js';

export class NetworkView extends BaseView {
  constructor(container, params = {}) {
    super(container, params);
    this.networkInitialized = false;
  }
  
  async render() {
    this.showLoading('正在加载网络视图...');
    
    try {
      // 等待全局对象就绪
      if (!window.NetworkGraph || !window.AppState) {
        throw new Error('应用未完全初始化');
      }
      
      // 渲染网络视图HTML
      const html = this.getTemplate();
      this.updateContent(html);
      
      // 初始化网络图
      await this.initNetworkGraph();
      
      this.isRendered = true;
    } catch (error) {
      this.showError('加载网络视图失败', error);
    }
  }
  
  getTemplate() {
    return `
      <div class="network-view">
        <div class="view-header">
          <h2><i class="fas fa-network-wired"></i> 城市网络图</h2>
        <div class="view-controls">
          <div class="legend">
            <span class="legend-item"><span class="legend-color distance-far"></span> 远距离</span>
            <span class="legend-item"><span class="legend-color distance-near"></span> 近距离</span>
          </div>
        </div>
        </div>
        
        <div class="network-container">
          <div class="network-graph-container">
            <div id="networkGraph" class="network-graph"></div>
            <div class="graph-controls">
              <button id="zoomInBtn" class="btn-icon" title="放大">
                <i class="fas fa-search-plus"></i>
              </button>
               <button id="zoomOutBtn" class="btn-icon" title="缩小">
                 <i class="fas fa-search-minus"></i>
               </button>
               <button id="resetViewBtn" class="btn-icon" title="重置视图">
                 <i class="fas fa-sync-alt"></i>
               </button>
            </div>
          </div>
          
           <div class="selected-city-panel" id="selectedCityInfo">
             <div class="panel-top-controls">
               <button id="randomCityBtn" class="btn-primary" style="width: 100%; margin-bottom: var(--space-sm);">
                 <i class="fas fa-random"></i> 随机选择城市
               </button>
             </div>
             <div class="panel-header">
               <h3><i class="fas fa-map-pin"></i> 选中城市</h3>
               <button id="closeCityPanel" class="btn-icon btn-small">
                 <i class="fas fa-times"></i>
               </button>
             </div>
            <div class="city-details">
              <h4 id="selectedCityName">未选择城市</h4>
              <div class="city-stats">
                <div class="stat">
                  <span class="stat-label">距离</span>
                  <span class="stat-value" id="selectedCityDistance">0 km</span>
                </div>
                <div class="stat">
                  <span class="stat-label">方位角</span>
                  <span class="stat-value" id="selectedCityBearing">0°</span>
                </div>
                <div class="stat">
                  <span class="stat-label">人口</span>
                  <span class="stat-value" id="selectedCityPopulation">0</span>
                </div>
              </div>
              <p class="city-description" id="selectedCityDescription">点击网络图中的城市节点或使用"随机选择城市"按钮选择一个城市</p>
              <div class="action-buttons">
                <button id="confirmCityBtn" class="btn-success">
                  <i class="fas fa-check-circle"></i> 确定到访
                </button>
                <button id="cancelCityBtn" class="btn-secondary">
                  <i class="fas fa-times-circle"></i> 取消选择
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="view-footer">
          <div class="status-info">
            <span id="networkStatus">就绪</span>
            <span class="zoom-level">缩放级别: <span id="zoomLevel">1.0</span>x</span>
          </div>
        </div>
      </div>
    `;
  }
  
  async initNetworkGraph() {
    // 检查是否已初始化
    if (this.networkInitialized) {
      return;
    }
    
    // 初始化网络图
    if (window.NetworkGraph && typeof window.NetworkGraph.init === 'function') {
      // 重新初始化网络图（容器ID已改变）
      window.NetworkGraph.init('networkGraph');
      window.AppState.networkGraph = window.NetworkGraph;
      this.networkInitialized = true;
      
      // 更新缩放级别显示
      this.updateZoomDisplay();
    }
    
    // 绑定事件
    this.bindEvents();
  }
  
  bindEvents() {
    // 缩放控制
    const zoomInBtn = this.container.querySelector('#zoomInBtn');
    const zoomOutBtn = this.container.querySelector('#zoomOutBtn');
    const resetViewBtn = this.container.querySelector('#resetViewBtn');
    const randomCityBtn = this.container.querySelector('#randomCityBtn');
    const closeCityPanel = this.container.querySelector('#closeCityPanel');
    const confirmCityBtn = this.container.querySelector('#confirmCityBtn');
    const cancelCityBtn = this.container.querySelector('#cancelCityBtn');
    
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => this.zoomIn());
    }
    
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => this.zoomOut());
    }
    
    if (resetViewBtn) {
      resetViewBtn.addEventListener('click', () => this.resetView());
    }
    
    if (randomCityBtn) {
      randomCityBtn.addEventListener('click', () => this.selectRandomCity());
    }
    
    if (closeCityPanel) {
      closeCityPanel.addEventListener('click', () => this.hideSelectedCityPanel());
    }
    
    if (confirmCityBtn) {
      confirmCityBtn.addEventListener('click', () => this.confirmSelectedCity());
    }
    
    if (cancelCityBtn) {
      cancelCityBtn.addEventListener('click', () => this.cancelSelectedCity());
    }
  }
  
  // 网络图控制方法
  zoomIn() {
    if (window.UIManager && typeof window.UIManager.zoomIn === 'function') {
      window.UIManager.zoomIn();
      this.updateZoomDisplay();
    }
  }
  
  zoomOut() {
    if (window.UIManager && typeof window.UIManager.zoomOut === 'function') {
      window.UIManager.zoomOut();
      this.updateZoomDisplay();
    }
  }
  
  resetView() {
    if (window.UIManager && typeof window.UIManager.resetView === 'function') {
      window.UIManager.resetView();
      this.updateZoomDisplay();
    }
  }
  
  updateZoomDisplay() {
    const zoomLevelElement = this.container.querySelector('#zoomLevel');
    if (zoomLevelElement && window.AppState) {
      zoomLevelElement.textContent = window.AppState.zoomLevel.toFixed(1);
    }
  }
  
  selectRandomCity() {
    if (window.UIManager && typeof window.UIManager.selectRandomCity === 'function') {
      window.UIManager.selectRandomCity();
      this.showSelectedCityPanel();
    }
  }
  
  showSelectedCityPanel() {
    const cityPanel = this.container.querySelector('#selectedCityInfo');
    if (cityPanel) {
      cityPanel.style.display = 'block';
    }
  }
  
  hideSelectedCityPanel() {
    const cityPanel = this.container.querySelector('#selectedCityInfo');
    if (cityPanel) {
      cityPanel.style.display = 'none';
    }
    if (window.UIManager && typeof window.UIManager.hideSelectedCityInfo === 'function') {
      window.UIManager.hideSelectedCityInfo();
    }
  }
  
  confirmSelectedCity() {
    if (window.UIManager && typeof window.UIManager.confirmSelectedCity === 'function') {
      window.UIManager.confirmSelectedCity();
      this.hideSelectedCityPanel();
    }
  }
  
  cancelSelectedCity() {
    if (window.UIManager && typeof window.UIManager.cancelSelectedCity === 'function') {
      window.UIManager.cancelSelectedCity();
      this.hideSelectedCityPanel();
    }
  }
  
  async onEnter() {
    // 视图进入时的逻辑
    console.log('进入网络视图');
    
    // 更新网络图数据
    if (window.NetworkGraph && typeof window.NetworkGraph.updateData === 'function') {
      window.NetworkGraph.updateData();
    }
  }
  
  async onLeave() {
    // 视图离开时的逻辑
    console.log('离开网络视图');
    
    // 清理工作可以在这里进行
  }
}