// TravelNet 路由管理器
export class Router {
  constructor(routes = {}, defaultRoute = 'network') {
    this.routes = routes;
    this.defaultRoute = defaultRoute;
    this.currentRoute = null;
    this.currentView = null;
    
    // 初始化路由
    this.init();
  }
  
  init() {
    // 监听hash变化
    window.addEventListener('hashchange', () => this.handleHashChange());
    
    // 初始路由
    this.handleHashChange();
  }
  
  handleHashChange() {
    const hash = window.location.hash.substring(1) || this.defaultRoute;
    const route = hash.split('?')[0]; // 移除查询参数
    
    if (route === this.currentRoute) {
      return; // 相同路由不重新渲染
    }
    
    this.navigateTo(route);
  }
  
  navigateTo(routeName, params = {}) {
    // 查找路由
    const route = this.routes[routeName];
    
    if (!route) {
      console.warn(`路由 "${routeName}" 不存在，跳转到默认路由`);
      this.navigateTo(this.defaultRoute);
      return;
    }
    
    // 更新URL（如果当前hash不同）
    const currentHash = window.location.hash.substring(1) || this.defaultRoute;
    if (currentHash !== routeName) {
      window.location.hash = routeName;
    }
    
    // 执行离开当前视图的逻辑
    if (this.currentView && this.currentView.onLeave) {
      this.currentView.onLeave();
    }
    
    // 更新当前路由
    this.currentRoute = routeName;
    
    // 渲染新视图
    this.renderView(route, params);
  }
  
  async renderView(route, params) {
    const { view, containerId = 'app-content' } = route;
    
    // 获取容器
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`容器 #${containerId} 不存在`);
      return;
    }
    
    // 清空容器
    container.innerHTML = '';
    
    // 创建视图实例
    try {
      this.currentView = new view(container, params);
      
      // 调用视图的渲染方法
      if (typeof this.currentView.render === 'function') {
        await this.currentView.render();
      }
      
      // 调用视图的进入方法
      if (typeof this.currentView.onEnter === 'function') {
        await this.currentView.onEnter();
      }
      
      console.log(`路由 "${this.currentRoute}" 渲染完成`);
    } catch (error) {
      console.error(`渲染路由 "${this.currentRoute}" 失败:`, error);
      container.innerHTML = `
        <div class="error-view">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>页面加载失败</h3>
          <p>${error.message}</p>
        </div>
      `;
    }
  }
  
  // 获取当前路由信息
  getCurrentRoute() {
    return this.currentRoute;
  }
  
  // 获取当前视图实例
  getCurrentView() {
    return this.currentView;
  }
}

// 创建全局路由实例
export const createRouter = (routes, defaultRoute = 'network') => {
  return new Router(routes, defaultRoute);
};