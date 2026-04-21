# TravelNet — 智能周边城市探索与旅行决策系统

![TravelNet](https://img.shields.io/badge/Status-Ready-green)
![Tech](https://img.shields.io/badge/Tech-D3.js%20%7C%20Vite%20%7C%20IndexedDB-blue)

基于北京科技大学位置（北纬39.99048°，东经116.36087°）的智能周边城市探索系统，可视化展示500公里内县级城市网络图，支持随机选择、搜索、旅游记录管理。

## 🌟 功能特性

- **地理位置中心**：以北京科技大学为探索中心
- **网络图可视化**：D3.js实现科技感网络图，距离映射为半径，方位角准确
- **智能交互**：
  - 随机选择城市（从未访问城市中随机抽取）
  - 实时搜索过滤与高亮
  - 旅游记录管理（添加感想、照片）
  - 缩放、拖拽交互
- **数据持久化**：IndexedDB存储用户数据，支持离线使用
- **响应式设计**：适配桌面与移动设备
- **科技感UI**：深色主题、发光效果、粒子动画

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装与运行

```bash
# 克隆项目
git clone <repository-url>
cd travel

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

开发服务器将在 http://localhost:3000 启动。

## 📁 项目结构

```
travel/
├── index.html              # 主HTML文件
├── src/
│   ├── main.js            # 应用主入口
│   ├── style.css          # 样式文件
│   ├── data/
│   │   └── cities.json    # 城市数据集（67个城市）
│   ├── utils/             # 工具函数
│   └── components/        # 组件（待扩展）
├── package.json
├── vite.config.js
└── README.md
```

## 🗺️ 数据说明

内置北京周边500公里内67个县级城市数据，包含：
- 城市名称、经纬度
- 人口数量
- 简短描述
- 自动计算的：距离中心点距离、方位角

数据文件：`src/data/cities.json`

## 🎨 技术栈

- **前端框架**：原生JavaScript (ES6+)
- **构建工具**：Vite
- **可视化**：D3.js v7
- **数据存储**：localForage (IndexedDB)
- **UI样式**：纯CSS + CSS变量
- **字体图标**：FontAwesome 6
- **部署**：GitHub Pages

## 📱 核心功能详解

### 1. 网络图可视化
- 中心点：北京科技大学位置
- 节点：每个城市，半径反映人口，颜色反映距离
- 连线：从中心到城市的射线，颜色渐变
- 交互：缩放、拖拽、悬停提示、点击选中

### 2. 随机选择系统
- 从未访问和未排除的城市中随机选择
- 弹出窗口显示城市详情
- 可选择"确定到访"（添加到记录）或"取消"

### 3. 旅游记录管理
- 记录已访问城市
- 支持添加文字感想
- 支持上传照片（base64存储）
- 记录按时间倒序排列

### 4. 搜索与筛选
- 实时搜索城市名称
- 按距离、名称、人口排序
- 高亮匹配节点

## 🔧 配置与自定义

### 修改中心位置
在 `src/main.js` 中修改 `CONFIG` 对象：
```javascript
const CONFIG = {
  centerLat: 39.99048,      // 修改纬度
  centerLng: 116.36087,     // 修改经度
  radiusKm: 500,            // 修改探索半径
  // ...
};
```

### 添加城市数据
编辑 `src/data/cities.json`，添加新城市对象：
```json
{
  "id": "city_xxx",
  "name": "城市名称",
  "lat": 纬度,
  "lng": 经度,
  "population": 人口,
  "description": "描述"
}
```

## 🚢 部署到GitHub Pages

### 当前自动化部署流程
项目已配置完整的GitHub Actions自动化部署流程，推送到`master`分支后自动构建并部署到GitHub Pages。

#### 触发条件
- **自动触发**：每次推送到 `master` 分支
- **手动触发**：在GitHub Actions页面可手动运行工作流（`workflow_dispatch`）

#### 部署步骤
GitHub Actions工作流（`.github/workflows/deploy.yml`）执行以下步骤：
1. **检出代码**：拉取最新代码
2. **设置Node.js环境**：使用Node.js 18
3. **安装依赖**：执行 `npm ci` 安装项目依赖
4. **构建项目**：执行 `npm run build`，注入环境变量
5. **配置Pages**：设置GitHub Pages环境
6. **上传构建产物**：将`docs`目录内容上传为Pages Artifact
7. **部署到GitHub Pages**：自动发布到https://xinyvpeng.github.io/USTB_travelNet/

#### 环境变量配置
**注意**：项目使用默认密码"123"进行身份验证，任何人都可以使用此密码登录记录自己的旅行数据。
- **变量名**：`VITE_AUTH_PASSWORD`（可选）
- **用途**：用于覆盖默认登录认证密码
- **配置方法（如需自定义密码）**：
  1. 在GitHub仓库中：Settings → Secrets and variables → Actions
  2. 点击"New repository secret"
  3. 名称：`VITE_AUTH_PASSWORD`
  4. 值：设置您的自定义密码
  5. 点击"Add secret"

环境变量在构建时自动注入（工作流第42-43行）：
```yaml
- name: Build project
  run: npm run build
  env:
    VITE_AUTH_PASSWORD: "123"  # 公开密码，任何人都可以使用
```

#### 构建配置
- **构建输出目录**：`docs/`（在`vite.config.js`中配置）
- **基础路径**：`/USTB_travelNet/`（适配GitHub Pages子路径）
- **源代码映射**：生产环境包含sourcemap便于调试

### 验证部署
1. **检查Actions状态**：访问仓库 → Actions标签页查看运行状态
2. **验证Pages配置**：仓库 → Settings → Pages，确认部署来源为`GitHub Actions`
3. **访问在线版本**：https://xinyvpeng.github.io/USTB_travelNet/
 4. **测试认证功能**：使用密码"123"登录（公开密码，任何人都可以使用）

### 手动构建与本地测试
```bash
# 本地开发
npm install          # 安装依赖
npm run dev         # 开发服务器 (http://localhost:3000)

# 生产构建（可选环境变量）
# 默认密码为123，如需自定义可设置环境变量
export VITE_AUTH_PASSWORD=123  # Linux/Mac（默认值）
set VITE_AUTH_PASSWORD=123     # Windows CMD（默认值）
$env:VITE_AUTH_PASSWORD="123"  # Windows PowerShell（默认值）

npm run build       # 构建生产版本到docs/目录
npm run preview     # 预览构建结果
```

### 故障排除
#### 部署失败
1. 检查GitHub Actions日志中的具体错误信息
 2. 确认工作流文件中的密码配置正确（默认值为"123"）
3. 验证`vite.config.js`中的base路径配置

#### 环境变量问题
项目使用默认密码"123"，如需自定义可设置环境变量覆盖。如果遇到登录问题，请检查构建时的密码配置。



### 部署状态
![GitHub Pages](https://img.shields.io/github/deployments/xinyvpeng/USTB_travelNet/github-pages?label=GitHub%20Pages)
![Last Commit](https://img.shields.io/github/last-commit/xinyvpeng/USTB_travelNet)

## 📊 性能优化

- **代码分割**：Vite自动分割vendor包
- **图片压缩**：照片上传时自动压缩（最大200KB）
- **虚拟滚动**：城市列表虚拟化（待实现）
- **缓存策略**：IndexedDB智能缓存

## 🐛 故障排除

### 构建错误
如果遇到rollup native模块错误：
```bash
rm -rf node_modules package-lock.json
npm install
```

### 开发服务器无法启动
检查端口占用，修改 `vite.config.js` 中的端口配置。

### 数据无法保存
检查浏览器IndexedDB支持，现代浏览器均支持。

## 📝 待实现功能

- [ ] 手动添加城市功能
- [ ] 照片批量上传与管理
- [ ] 旅行路线规划
- [ ] 天气信息集成
- [ ] 导出数据为JSON/CSV
- [ ] 多语言支持

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [D3.js](https://d3js.org/) - 强大的可视化库
- [Vite](https://vitejs.dev/) - 现代前端构建工具
- [localForage](https://localforage.github.io/localForage/) - 简化的客户端存储
- 所有贡献者和用户

---

**TravelNet** - 探索未知，记录旅程 🗺️✨/