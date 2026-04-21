// TravelNet 应用状态管理
// 全局状态对象，用于存储应用运行时的所有状态

export const AppState = {
  cities: [],               // 所有城市数据
  filteredCities: [],       // 筛选后的城市（500公里内）
  visitedCities: new Set(), // 已访问城市ID集合
  travelRecords: [],        // 旅游记录
  selectedCity: null,       // 当前选中的城市
  networkGraph: null,       // D3网络图实例
  zoomLevel: 1,             // 当前缩放级别
  
  // 认证状态
  isAuthenticated: false,   // 用户是否已认证
  authToken: null,          // 认证令牌
  authUsername: '未登录用户' // 认证用户名
};