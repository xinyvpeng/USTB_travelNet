// 城市验证器
// 用于过滤和验证地级市（第二行政划分）

export const CityValidator = {
  // 检查城市是否为地级市（第二行政划分）
  isPrefectureLevelCity(cityName, prefectureCityNames = []) {
    // 特殊情况：北京市区（应视为地级市/直辖市）
    if (cityName === '北京市区') {
      return true;
    }
    
    // 地级市应以"市"结尾
    if (!cityName.endsWith('市')) {
      return false;
    }
    
    // 不应包含"县"或"区"（除非是直辖市的一部分，但我们已经处理了北京市区）
    if (cityName.includes('县') || cityName.includes('区')) {
      return false;
    }
    
    // 检查是否为县级市模式（包含上级地级市名称，如"廊坊三河市"）
    // 如果城市名称长度超过4个字符（不含"市"），很可能是县级市
    const nameWithoutSuffix = cityName.replace('市', '');
    if (nameWithoutSuffix.length > 3) {
      // 检查是否包含已知的地级市名前缀
      for (const prefectureName of prefectureCityNames) {
        const prefectureNameWithoutSuffix = prefectureName.replace('市', '');
        if (cityName.includes(prefectureNameWithoutSuffix) && cityName !== prefectureName) {
          // 包含地级市名但不是该地级市本身 → 县级市
          return false;
        }
      }
    }
    
    // 其他情况视为地级市
    return true;
  },
  
  // 过滤地级市
  filterPrefectureLevelCities(cities) {
    const originalCount = cities.length;
    
    // 第一轮：收集简单的地级市（用于后续检查）
    const simplePrefectureCities = cities.filter(city => {
      const name = city.name;
      if (name === '北京市区') return true;
      if (!name.endsWith('市')) return false;
      if (name.includes('县') || name.includes('区')) return false;
      
      const nameWithoutSuffix = name.replace('市', '');
      // 简单的地级市：名称长度≤3个字符（不含"市"）
      return nameWithoutSuffix.length <= 3;
    });
    
    const prefectureCityNames = simplePrefectureCities.map(city => city.name);
    
    // 记录收集到的地级市
    console.log(`收集到 ${prefectureCityNames.length} 个简单地级市:`, prefectureCityNames);
    
    // 第二轮：使用收集的地级市名单进行精确过滤
    const filteredCities = cities.filter(city => {
      return this.isPrefectureLevelCity(city.name, prefectureCityNames);
    });
    
    // 记录被过滤的城市
    const filteredOut = cities.filter(city => !filteredCities.some(fc => fc.id === city.id));
    if (filteredOut.length > 0) {
      console.log(`过滤掉 ${filteredOut.length} 个非地级市（县级市/县/区）:`);
      filteredOut.forEach(city => {
        console.log(`  - ${city.name} (ID: ${city.id})`);
      });
      
      // 特别检查用户提到的城市是否被过滤
      const userMentionedCities = ['廊坊三河市', '唐山迁安市', '唐山遵化市'];
      userMentionedCities.forEach(cityName => {
        const found = filteredOut.find(city => city.name === cityName);
        if (found) {
          console.log(`✓ ${cityName} 已被正确过滤`);
        }
      });
    }
    
    console.log(`城市过滤: ${originalCount} → ${filteredCities.length} (过滤掉 ${originalCount - filteredCities.length} 个)`);
    
    return filteredCities;
  }
};