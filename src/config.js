// TravelNet 应用配置
// 注意：认证密码通过环境变量 VITE_AUTH_PASSWORD 设置

export const CONFIG = {
  centerLat: 39.99048,      // 北京科技大学纬度
  centerLng: 116.36087,     // 北京科技大学经度
  radiusKm: 500,            // 探索半径（公里）
  earthRadiusKm: 6371,      // 地球半径（公里）
  
  // 认证配置
  auth: {
    password: import.meta.env.VITE_AUTH_PASSWORD, // 必须通过环境变量设置，禁止使用测试密码
    storageKey: 'travelnet_auth_token'
  },
  
  // 存储配置
  storageKeys: {
    visitedCities: 'travelnet_visited_cities',
    travelRecords: 'travelnet_travel_records',
    appSettings: 'travelnet_app_settings',
    customCities: 'travelnet_custom_cities'
  }
};