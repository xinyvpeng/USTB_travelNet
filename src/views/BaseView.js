// 基础视图类
export class BaseView {
  constructor(container, params = {}) {
    this.container = container;
    this.params = params;
    this.isRendered = false;
  }
  
  // 渲染视图（子类需实现）
  async render() {
    throw new Error('render() 方法必须在子类中实现');
  }
  
  // 视图进入时调用
  async onEnter() {
    // 可以被子类覆盖
  }
  
  // 视图离开时调用
  async onLeave() {
    // 可以被子类覆盖
  }
  
  // 清理视图资源
  async destroy() {
    // 可以被子类覆盖
  }
  
  // 通用方法：显示加载状态
  showLoading(message = '加载中...') {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="view-loading">
        <div class="loading-spinner">
          <i class="fas fa-satellite fa-spin"></i>
        </div>
        <p>${message}</p>
      </div>
    `;
  }
  
  // 通用方法：显示错误
  showError(message, error = null) {
    if (!this.container) return;
    
    let errorDetails = '';
    if (error) {
      if (error.message) errorDetails = error.message;
      else if (typeof error === 'string') errorDetails = error;
    }
    
    this.container.innerHTML = `
      <div class="view-error">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3>${message}</h3>
        ${errorDetails ? `<p class="error-details">${errorDetails}</p>` : ''}
        <button class="btn-primary retry-btn">
          <i class="fas fa-redo"></i> 重试
        </button>
      </div>
    `;
    
    // 添加重试按钮事件
    const retryBtn = this.container.querySelector('.retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.render());
    }
  }
  
  // 通用方法：更新容器内容
  updateContent(html) {
    if (!this.container) return;
    this.container.innerHTML = html;
    this.isRendered = true;
  }
}