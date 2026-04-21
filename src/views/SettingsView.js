import { BaseView } from './BaseView.js';

export class SettingsView extends BaseView {
  constructor(container, params = {}) {
    super(container, params);
    this.authEventHandler = null;
  }
  
  async render() {
    this.showLoading('正在加载设置...');
    
    try {
      // 检查全局对象
      if (!window.AppState || !window.AuthManager) {
        throw new Error('应用未完全初始化');
      }
      
      // 渲染设置视图HTML
      const html = this.getTemplate();
      this.updateContent(html);
      
      // 更新认证状态显示
      this.updateAuthStatus();
      
      // 绑定事件
      this.bindEvents();
      
      this.isRendered = true;
    } catch (error) {
      this.showError('加载设置视图失败', error);
    }
  }
  
  getTemplate() {
    const isAuthenticated = window.AppState ? window.AppState.isAuthenticated : false;
    const authUsername = window.AppState ? window.AppState.authUsername : '未登录用户';
    
    return `
      <div class="settings-view">
        <div class="view-header">
          <h2><i class="fas fa-cog"></i> 设置</h2>
          <div class="view-controls">
            <button id="saveSettingsBtn" class="btn-primary" disabled>
              <i class="fas fa-save"></i> 保存设置
            </button>
          </div>
        </div>
        
        <div class="view-content">
          <div class="settings-sections">
            <!-- 用户认证部分 -->
            <section class="settings-section">
              <h3><i class="fas fa-user-shield"></i> 用户认证</h3>
              <div class="auth-status-card">
                <div class="auth-status-header">
                  <div class="auth-status-icon ${isAuthenticated ? 'authenticated' : 'not-authenticated'}">
                    <i class="fas fa-${isAuthenticated ? 'user-check' : 'user'}"></i>
                  </div>
                  <div class="auth-status-info">
                    <h4>${authUsername}</h4>
                    <p class="auth-status-text">
                      ${isAuthenticated ? 
                        '您已登录为项目所有者，可以进行所有编辑操作。' : 
                        '您处于只读模式，可以查看所有内容但不能编辑。'}
                    </p>
                  </div>
                </div>
                
                <div class="auth-actions">
                  ${isAuthenticated ? `
                    <button id="logoutBtn" class="btn-danger">
                      <i class="fas fa-sign-out-alt"></i> 退出登录
                    </button>
                    <div class="form-hint">
                      <i class="fas fa-info-circle"></i>
                      退出后将无法编辑内容，但仍可查看所有数据。
                    </div>
                  ` : `
                    <button id="loginBtn" class="btn-primary">
                      <i class="fas fa-sign-in-alt"></i> 登录
                    </button>
                    <div class="form-hint">
                      <i class="fas fa-info-circle"></i>
                      只有项目所有者可以登录进行编辑操作。
                    </div>
                  `}
                </div>
              </div>
              
              <!-- 登录表单（内联） -->
              <div id="loginFormContainer" class="login-form-container" style="display: ${isAuthenticated ? 'none' : 'block'}">
                <form id="loginForm" class="auth-form">
                  <div class="form-group">
                    <label for="loginPassword"><i class="fas fa-key"></i> 认证密码</label>
                    <input type="password" id="loginPassword" placeholder="请输入认证密码" autocomplete="current-password" required>
                    <div class="form-hint">
                       提示：认证密码：123（任何人都可以使用此密码登录记录自己的旅行数据）
                    </div>
                  </div>
                  <div class="form-actions">
                    <button type="submit" id="loginSubmitBtn" class="btn-primary">
                      <i class="fas fa-sign-in-alt"></i> 登录
                    </button>
                  </div>
                </form>
                
                <div class="auth-info-note">
                  <p><i class="fas fa-info-circle"></i> 此项目为开源项目，其他人可以克隆到自己的仓库进行修改和使用。</p>
                </div>
              </div>
            </section>
            
            <!-- 应用设置部分 -->
            <section class="settings-section">
              <h3><i class="fas fa-sliders-h"></i> 应用设置</h3>
              
              <div class="setting-group">
                <h4><i class="fas fa-map-marker-alt"></i> 中心位置</h4>
                <div class="setting-controls">
                  <div class="form-group">
                    <label for="centerLat">纬度</label>
                    <input type="number" id="centerLat" step="0.00001" value="39.99048" disabled>
                  </div>
                  <div class="form-group">
                    <label for="centerLng">经度</label>
                    <input type="number" id="centerLng" step="0.00001" value="116.36087" disabled>
                  </div>
                </div>
                <div class="form-hint">
                  <i class="fas fa-info-circle"></i>
                  中心位置已固定为北京科技大学，如需修改需要编辑源代码。
                </div>
              </div>
              
              <div class="setting-group">
                <h4><i class="fas fa-radiation-alt"></i> 探索半径</h4>
                <div class="setting-controls">
                  <div class="form-group">
                    <label for="radiusKm">半径 (公里)</label>
                    <input type="range" id="radiusKm" min="100" max="1000" step="50" value="500">
                    <span class="range-value" id="radiusValue">500 km</span>
                  </div>
                </div>
                <div class="form-hint">
                  <i class="fas fa-info-circle"></i>
                  调整探索半径会影响显示的城市数量。
                </div>
              </div>
              
              <div class="setting-group">
                <h4><i class="fas fa-eye"></i> 显示设置</h4>
                <div class="setting-controls">
                  <div class="checkbox-group">
                    <input type="checkbox" id="showVisitedCities" checked>
                    <label for="showVisitedCities">显示已访问城市</label>
                  </div>

                  <div class="checkbox-group">
                    <input type="checkbox" id="enableAnimations" checked>
                    <label for="enableAnimations">启用动画效果</label>
                  </div>
                  <div class="checkbox-group">
                    <input type="checkbox" id="autoSave" checked>
                    <label for="autoSave">自动保存数据</label>
                  </div>
                </div>
              </div>
            </section>
            
            <!-- 关于部分 -->
            <section class="settings-section">
              <h3><i class="fas fa-info-circle"></i> 关于</h3>
              
              <div class="about-card">
                <div class="about-header">
                  <div class="app-icon">
                    <i class="fas fa-satellite-dish"></i>
                  </div>
                  <div class="app-info">
                    <h4>TravelNet</h4>
                    <p class="app-subtitle">智能周边城市探索系统</p>
                    <p class="app-version">版本 1.0.0</p>
                  </div>
                </div>
                
                <div class="about-content">
                  <p>此项目为个人旅行探索系统，用于可视化展示北京周边500公里内的城市网络，并记录旅行足迹。</p>
                  
                  <div class="about-features">
                    <h5><i class="fas fa-star"></i> 主要功能</h5>
                    <ul>
                      <li>城市网络可视化（基于D3.js）</li>
                      <li>城市列表搜索与筛选</li>
                      <li>旅行记录管理</li>
                      <li>数据导入/导出</li>
                      <li>用户认证（只读/编辑模式）</li>
                    </ul>
                  </div>
                  
                  <div class="about-links">
                    <h5><i class="fas fa-external-link-alt"></i> 相关链接</h5>
                    <div class="link-buttons">
                      <a href="https://github.com/xinyvpeng/USTB_travelNet" target="_blank" class="btn-small">
                        <i class="fab fa-github"></i> GitHub仓库
                      </a>
                      <button id="helpBtn" class="btn-small">
                        <i class="fas fa-question-circle"></i> 使用帮助
                      </button>
                      <button id="reportIssueBtn" class="btn-small">
                        <i class="fas fa-bug"></i> 报告问题
                      </button>
                    </div>
                  </div>
                  
                  <div class="about-technologies">
                    <h5><i class="fas fa-code"></i> 技术栈</h5>
                    <div class="tech-tags">
                      <span class="tech-tag">HTML/CSS/JavaScript</span>
                      <span class="tech-tag">D3.js</span>
                      <span class="tech-tag">LocalForage</span>
                      <span class="tech-tag">Vite</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        <div class="view-footer">
          <div class="status-info">
            <span id="settingsStatus">就绪</span>
            <span class="hint">设置更改可能需要刷新页面才能生效</span>
          </div>
        </div>
      </div>
    `;
  }
  
  updateAuthStatus() {
    if (!window.AppState) return;
    
    const isAuthenticated = window.AppState.isAuthenticated;
    const authUsername = window.AppState.authUsername;
    
    // 更新登录表单显示
    const loginFormContainer = this.container.querySelector('#loginFormContainer');
    if (loginFormContainer) {
      loginFormContainer.style.display = isAuthenticated ? 'none' : 'block';
    }
    
    // 更新认证状态文本
    const authStatusText = this.container.querySelector('.auth-status-text');
    if (authStatusText) {
      authStatusText.textContent = isAuthenticated ? 
        '您已登录为项目所有者，可以进行所有编辑操作。' : 
        '您处于只读模式，可以查看所有内容但不能编辑。';
    }
    
    // 更新用户名
    const authUsernameElement = this.container.querySelector('.auth-status-info h4');
    if (authUsernameElement) {
      authUsernameElement.textContent = authUsername;
    }
    
    // 更新认证状态图标
    const authStatusIcon = this.container.querySelector('.auth-status-icon');
    if (authStatusIcon) {
      authStatusIcon.className = `auth-status-icon ${isAuthenticated ? 'authenticated' : 'not-authenticated'}`;
      const icon = authStatusIcon.querySelector('i');
      if (icon) {
        icon.className = `fas fa-${isAuthenticated ? 'user-check' : 'user'}`;
      }
    }
  }
  
  bindEvents() {
    // 登录按钮
    const loginBtn = this.container.querySelector('#loginBtn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.showLoginForm());
    }
    
    // 退出登录按钮
    const logoutBtn = this.container.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }
    
    // 登录表单提交
    const loginForm = this.container.querySelector('#loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));
    }
    
    // 探索半径滑块
    const radiusSlider = this.container.querySelector('#radiusKm');
    if (radiusSlider) {
      radiusSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        const radiusValue = this.container.querySelector('#radiusValue');
        if (radiusValue) {
          radiusValue.textContent = `${value} km`;
        }
      });
    }
    
    // 帮助按钮
    const helpBtn = this.container.querySelector('#helpBtn');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => this.handleHelp());
    }
    
    // 报告问题按钮
    const reportIssueBtn = this.container.querySelector('#reportIssueBtn');
    if (reportIssueBtn) {
      reportIssueBtn.addEventListener('click', () => this.handleReportIssue());
    }
    
    // 保存设置按钮
    const saveSettingsBtn = this.container.querySelector('#saveSettingsBtn');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => this.handleSaveSettings());
    }
    
    // 监听认证状态变化事件
    this.authEventHandler = () => this.updateAuthStatus();
    window.addEventListener('auth:login', this.authEventHandler);
    window.addEventListener('auth:logout', this.authEventHandler);
  }
  
  showLoginForm() {
    const loginFormContainer = this.container.querySelector('#loginFormContainer');
    if (loginFormContainer) {
      loginFormContainer.style.display = 'block';
      
      // 聚焦密码输入框
      const passwordInput = loginFormContainer.querySelector('#loginPassword');
      if (passwordInput) {
        passwordInput.focus();
      }
    }
  }
  
  async handleLoginSubmit(event) {
    event.preventDefault();
    
    if (!window.AuthManager) return;
    
    const passwordInput = this.container.querySelector('#loginPassword');
    const password = passwordInput ? passwordInput.value : '';
    
    if (!password.trim()) {
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification('请输入密码', 'warning');
      }
      return;
    }
    
    // 调用AuthManager.login
    const result = window.AuthManager.login(password);
    
    if (result.success) {
      // 更新UI
      this.updateAuthStatus();
      
      // 更新右上角认证状态
      if (window.UIManager && typeof window.UIManager.updateAuthUI === 'function') {
        window.UIManager.updateAuthUI();
      }
      
      // 清空密码字段
      if (passwordInput) {
        passwordInput.value = '';
      }
      
      // 显示通知
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification('登录成功！您现在可以编辑内容。', 'success');
      }
    } else {
      // 显示错误
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification(result.message || '密码错误，请重试', 'danger');
      }
      
      // 清空密码字段并聚焦
      if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
      }
    }
  }
  
  async handleLogout() {
    if (!window.AuthManager) return;
    
    if (!confirm('确定要退出登录吗？退出后将无法编辑内容。')) {
      return;
    }
    
    const result = window.AuthManager.logout();
    
    // 更新UI
    this.updateAuthStatus();
    
    // 显示通知
    if (window.UIManager && window.UIManager.showNotification) {
      window.UIManager.showNotification('已退出登录', 'info');
    }
  }
  
  async handleHelp() {
    if (!window.UIManager) return;
    
    if (typeof window.UIManager.handleHelp === 'function') {
      window.UIManager.handleHelp();
    } else {
      alert(`TravelNet 使用帮助：
      
1. 查看模式：所有用户都可以查看城市网络和旅行记录
2. 编辑模式：只有认证用户（项目所有者）可以添加城市、编辑记录等
3. 随机选择：点击"随机选择"按钮选择一个未访问的城市
4. 确认访问：选中城市后点击"确认访问"添加到旅行记录
5. 数据管理：支持导出/导入JSON格式的数据

项目地址：https://github.com/xinyvpeng/USTB_travelNet`);
    }
  }
  
  handleReportIssue() {
    window.open('https://github.com/xinyvpeng/USTB_travelNet/issues', '_blank');
  }
  
  async handleSaveSettings() {
    // 这里可以保存应用设置到localStorage
    const radiusKm = this.container.querySelector('#radiusKm').value;
    const showVisitedCities = this.container.querySelector('#showVisitedCities').checked;
    const enableAnimations = this.container.querySelector('#enableAnimations').checked;
    const autoSave = this.container.querySelector('#autoSave').checked;
    
    const settings = {
      radiusKm: parseInt(radiusKm),
      showVisitedCities,
      enableAnimations,
      autoSave,
      savedAt: new Date().toISOString()
    };
    
    try {
      localStorage.setItem('travelnet_settings', JSON.stringify(settings));
      
      // 更新应用配置（如果设置被应用）
      if (window.CONFIG) {
        window.CONFIG.radiusKm = parseInt(radiusKm);
      }
      
      // 显示通知
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification('设置已保存', 'success');
      }
      
      // 提示可能需要刷新
      alert('部分设置更改可能需要刷新页面才能生效。');
      
    } catch (error) {
      console.error('保存设置失败:', error);
      if (window.UIManager && window.UIManager.showNotification) {
        window.UIManager.showNotification('保存设置失败', 'danger');
      }
    }
  }
  
  async onEnter() {
    console.log('进入设置视图');
    // 更新认证状态显示
    this.updateAuthStatus();
    
    // 加载保存的设置
    this.loadSavedSettings();
  }
  
  loadSavedSettings() {
    try {
      const savedSettings = localStorage.getItem('travelnet_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // 应用设置到表单
        const radiusKmInput = this.container.querySelector('#radiusKm');
        const radiusValue = this.container.querySelector('#radiusValue');
        if (radiusKmInput && radiusValue) {
          radiusKmInput.value = settings.radiusKm || 500;
          radiusValue.textContent = `${settings.radiusKm || 500} km`;
        }
        
        const showVisitedCitiesInput = this.container.querySelector('#showVisitedCities');
        if (showVisitedCitiesInput) {
          showVisitedCitiesInput.checked = settings.showVisitedCities !== false;
        }
        

        
        const enableAnimationsInput = this.container.querySelector('#enableAnimations');
        if (enableAnimationsInput) {
          enableAnimationsInput.checked = settings.enableAnimations !== false;
        }
        
        const autoSaveInput = this.container.querySelector('#autoSave');
        if (autoSaveInput) {
          autoSaveInput.checked = settings.autoSave !== false;
        }
      }
    } catch (error) {
      console.error('加载保存的设置失败:', error);
    }
  }
  
  async onLeave() {
    console.log('离开设置视图');
    // 移除事件监听器
    if (this.authEventHandler) {
      window.removeEventListener('auth:login', this.authEventHandler);
      window.removeEventListener('auth:logout', this.authEventHandler);
      this.authEventHandler = null;
    }
  }
}