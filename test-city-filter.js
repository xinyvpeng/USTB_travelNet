import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load cities data
const citiesData = JSON.parse(readFileSync(join(__dirname, 'src/data/cities.json'), 'utf8'));

console.log(`Total cities in file: ${citiesData.length}`);

// Copy the CityValidator logic
const CityValidator = {
  isPrefectureLevelCity(cityName, prefectureCityNames = []) {
    if (cityName === '北京市区') return true;
    if (!cityName.endsWith('市')) return false;
    if (cityName.includes('县') || cityName.includes('区')) return false;
    
    const nameWithoutSuffix = cityName.replace('市', '');
    if (nameWithoutSuffix.length > 3) {
      for (const prefectureName of prefectureCityNames) {
        const prefectureNameWithoutSuffix = prefectureName.replace('市', '');
        if (cityName.includes(prefectureNameWithoutSuffix) && cityName !== prefectureName) {
          return false;
        }
      }
    }
    return true;
  },
  
  filterPrefectureLevelCities(cities) {
    const originalCount = cities.length;
    
    const simplePrefectureCities = cities.filter(city => {
      const name = city.name;
      if (name === '北京市区') return true;
      if (!name.endsWith('市')) return false;
      if (name.includes('县') || name.includes('区')) return false;
      
      const nameWithoutSuffix = name.replace('市', '');
      return nameWithoutSuffix.length <= 3;
    });
    
    const prefectureCityNames = simplePrefectureCities.map(city => city.name);
    
    console.log(`\n收集到 ${prefectureCityNames.length} 个简单地级市:`, prefectureCityNames);
    
    const filteredCities = cities.filter(city => {
      return this.isPrefectureLevelCity(city.name, prefectureCityNames);
    });
    
    const filteredOut = cities.filter(city => !filteredCities.some(fc => fc.id === city.id));
    if (filteredOut.length > 0) {
      console.log(`\n过滤掉 ${filteredOut.length} 个非地级市（县级市/县/区）:`);
      filteredOut.forEach(city => {
        console.log(`  - ${city.name} (ID: ${city.id})`);
      });
      
      const userMentionedCities = ['廊坊三河市', '唐山迁安市', '唐山遵化市'];
      userMentionedCities.forEach(cityName => {
        const found = filteredOut.find(city => city.name === cityName);
        if (found) {
          console.log(`✓ ${cityName} 已被正确过滤`);
        }
      });
    }
    
    console.log(`\n城市过滤: ${originalCount} → ${filteredCities.length} (过滤掉 ${originalCount - filteredCities.length} 个)`);
    
    // Show some examples
    console.log('\n前10个地级市:');
    filteredCities.slice(0, 10).forEach(city => {
      console.log(`  ${city.name}`);
    });
    
    return filteredCities;
  }
};

console.log('Running city filter test...\n');
const filtered = CityValidator.filterPrefectureLevelCities(citiesData);