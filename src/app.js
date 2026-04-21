// TravelNet 主应用 - 模块化重构版本
import { Router } from './router.js';
import { NetworkView } from './views/NetworkView.js';
import { CitiesView } from './views/CitiesView.js';
import { RecordsView } from './views/RecordsView.js';
import { DataView } from './views/DataView.js';
import { SettingsView } from './views/SettingsView.js';

// 导入配置和状态模块
import { CONFIG } from './config.js';
import { AppState } from './state/app-state.js';

// 导入工具模块
import { GeoUtils } from './utils/geo.js';
import { CityValidator } from './utils/city-validator.js';

// 导入管理器模块
import { DataManager } from './managers/data-manager.js';
import { AuthManager } from './managers/auth-manager.js';
import { UIManager } from './managers/ui-manager.js';
import { PhotoManager } from './managers/photo-manager.js';

// 导入网络图模块
import { NetworkGraph } from './network/graph.js';

// 路由配置
const routes = {
  network: {
    view: NetworkView,
    name: '网络图',
    icon: 'fa-network-wired'
  },
  cities: {
    view: CitiesView,
    name: '城市列表',
    icon: 'fa-city'
  },
  records: {
    view: RecordsView,
    name: '旅游记录',
    icon: 'fa-passport'
  },
  data: {
    view: DataView,
    name: '数据管理',
    icon: 'fa-database'
  },
  settings: {
    view: SettingsView,
    name: '设置',
    icon: 'fa-cog'
  }
};

// 全局路由器实例
let router = null;

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
    
    // 1.5 初始化照片管理器
    await PhotoManager.init();
    
    // 2. 初始化认证状态
    AuthManager.init();
    
    // 3. 加载城市数据
    await DataManager.loadCitiesData();
    
    // 4. 加载用户数据
    await DataManager.loadUserData();
    
    // 5. 初始化路由器
    router = new Router(routes, 'network');
    
    // 6. 绑定导航菜单事件
    bindNavEvents();
    
    // 7. 绑定认证事件
    bindAuthEvents();
    
    // 8. 更新认证UI
    UIManager.updateAuthUI();
    
    // 9. 隐藏加载状态
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
    
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

// 绑定导航菜单事件
function bindNavEvents() {
  // 更新导航状态函数
  function updateNavState() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentHash = window.location.hash.substring(1) || 'network';
    
    // 移除所有active类
    navLinks.forEach(link => link.classList.remove('active'));
    
    // 添加active类到当前路由对应的链接
    const activeLink = document.querySelector(`.nav-link[data-route="${currentHash}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      
      // 更新当前视图名称显示
      const viewName = activeLink.querySelector('span').textContent;
      const currentViewElement = document.getElementById('currentViewName');
      if (currentViewElement) {
        currentViewElement.textContent = viewName;
      }
    }
  }
  
  // 初始状态
  updateNavState();
  
  // 监听hash变化更新导航状态
  window.addEventListener('hashchange', updateNavState);
  
  // 点击链接时也更新状态（防止某些浏览器延迟）
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      // 短暂延迟确保hash已更新
      setTimeout(updateNavState, 10);
    });
  });
}

// 绑定认证相关事件
function bindAuthEvents() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  
  console.log('绑定认证事件，登录按钮:', loginBtn, '登出按钮:', logoutBtn);
  
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      console.log('登录按钮被点击，跳转到设置页面');
      // 跳转到设置页面进行登录
      window.location.hash = 'settings';
    });
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      console.log('登出按钮被点击');
      AuthManager.logout();
      UIManager.updateAuthUI();
      UIManager.showNotification('已退出登录', 'info');
    });
  }
}

// 将全局对象暴露给window（用于视图访问）
window.AppState = AppState;
window.DataManager = DataManager;
window.UIManager = UIManager;
window.AuthManager = AuthManager;
window.CONFIG = CONFIG;
window.GeoUtils = GeoUtils;
window.NetworkGraph = NetworkGraph;
window.CityValidator = CityValidator; // 可能被某些视图使用
window.PhotoManager = PhotoManager; // 照片管理器

// 页面加载完成后初始化应用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// 导出模块（保持向后兼容）
export {
  AppState,
  DataManager,
  AuthManager,
  UIManager,
  CONFIG,
  GeoUtils,
  CityValidator,
  NetworkGraph,
  initApp
};