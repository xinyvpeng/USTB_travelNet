// 认证管理器
// 负责用户认证和权限管理

import { CONFIG } from '../config.js';
import { AppState } from '../state/app-state.js';

export const AuthManager = {
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

  validateToken(token) {
    // 简单验证：检查令牌是否存在且不为空
    return token && token.trim().length > 0;
  },

  login(password) {
    // 检查密码是否已配置
    if (!CONFIG.auth.password || CONFIG.auth.password.trim() === '') {
      console.error('认证密码未配置：请设置环境变量 VITE_AUTH_PASSWORD');
      return { 
        success: false, 
        message: '系统配置错误：认证密码未配置。请检查环境变量设置。' 
      };
    }
    
    if (password === CONFIG.auth.password) {
      // 生成简单令牌（时间戳 + 随机数）
      const token = `travelnet_auth_${Date.now()}_${Math.random().toString(36).substr(2)}`;
      
      // 存储令牌
      localStorage.setItem(CONFIG.auth.storageKey, token);
      
      // 更新应用状态
      AppState.authToken = token;
      AppState.isAuthenticated = true;
      AppState.authUsername = '项目所有者';
      
      // 更新UI状态（通过全局UIManager，需要确保UIManager已加载）
      if (window.UIManager && typeof window.UIManager.updateAuthUI === 'function') {
        window.UIManager.updateAuthUI();
      }
      
      // 触发登录成功事件，供其他组件监听
      window.dispatchEvent(new CustomEvent('auth:login'));
      
      console.log('登录成功');
      return { success: true, message: '登录成功' };
    } else {
      console.log('登录失败：密码错误');
      return { success: false, message: '密码错误' };
    }
  },

  logout() {
    // 清除令牌
    localStorage.removeItem(CONFIG.auth.storageKey);
    
    // 更新应用状态
    AppState.authToken = null;
    AppState.isAuthenticated = false;
    AppState.authUsername = '未登录用户';
    
    // 更新UI状态
    if (window.UIManager && typeof window.UIManager.updateAuthUI === 'function') {
      window.UIManager.updateAuthUI();
    }
    
    // 触发退出登录事件，供其他组件监听
    window.dispatchEvent(new CustomEvent('auth:logout'));
    
    console.log('已退出登录');
    return { success: true, message: '已退出登录' };
  },

  isAuthenticated() {
    return AppState.isAuthenticated;
  },

  getAuthStatus() {
    return {
      isAuthenticated: AppState.isAuthenticated,
      username: AppState.authUsername
    };
  }
};