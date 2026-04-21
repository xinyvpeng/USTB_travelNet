// 地理计算工具函数
// 用于计算距离、方位角和坐标转换

import { CONFIG } from '../config.js';

export const GeoUtils = {
  calculateDistance(lat1, lng1, lat2, lng2) {
    const toRad = (angle) => (angle * Math.PI) / 180;
    
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return CONFIG.earthRadiusKm * c;
  },

  calculateBearing(lat1, lng1, lat2, lng2) {
    const toRad = (angle) => (angle * Math.PI) / 180;
    const toDeg = (angle) => (angle * 180) / Math.PI;
    
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δλ = toRad(lng2 - lng1);
    
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    
    let bearing = toDeg(Math.atan2(y, x));
    
    // 转换为0-360度
    bearing = (bearing + 360) % 360;
    
    return bearing;
  },

  polarToCartesian(distance, bearing, maxRadius, scale = 1) {
    // 将距离映射到半径（500公里对应最大半径）
    const radius = (distance / CONFIG.radiusKm) * maxRadius * scale;
    
    // 将方位角转换为弧度（0度为正北，顺时针）
    const angle = (bearing - 90) * (Math.PI / 180); // 调整角度，使0度指向右边
    
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    };
  }
};