var D=Object.defineProperty;var P=(a,t,e)=>t in a?D(a,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):a[t]=e;var N=(a,t,e)=>P(a,typeof t!="symbol"?t+"":t,e);import{l as p,s as C,a as k,z as _}from"./vendor-CbUDFNMC.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function e(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(s){if(s.ep)return;s.ep=!0;const n=e(s);fetch(s.href,n)}})();class O{constructor(t={},e="network"){this.routes=t,this.defaultRoute=e,this.currentRoute=null,this.currentView=null,this.init()}init(){window.addEventListener("hashchange",()=>this.handleHashChange()),this.handleHashChange()}handleHashChange(){const e=(window.location.hash.substring(1)||this.defaultRoute).split("?")[0];e!==this.currentRoute&&this.navigateTo(e)}navigateTo(t,e={}){const i=this.routes[t];if(!i){console.warn(`路由 "${t}" 不存在，跳转到默认路由`),this.navigateTo(this.defaultRoute);return}(window.location.hash.substring(1)||this.defaultRoute)!==t&&(window.location.hash=t),this.currentView&&this.currentView.onLeave&&this.currentView.onLeave(),this.currentRoute=t,this.renderView(i,e)}async renderView(t,e){const{view:i,containerId:s="app-content"}=t,n=document.getElementById(s);if(!n){console.error(`容器 #${s} 不存在`);return}n.innerHTML="";try{this.currentView=new i(n,e),typeof this.currentView.render=="function"&&await this.currentView.render(),typeof this.currentView.onEnter=="function"&&await this.currentView.onEnter(),console.log(`路由 "${this.currentRoute}" 渲染完成`)}catch(o){console.error(`渲染路由 "${this.currentRoute}" 失败:`,o),n.innerHTML=`
        <div class="error-view">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>页面加载失败</h3>
          <p>${o.message}</p>
        </div>
      `}}getCurrentRoute(){return this.currentRoute}getCurrentView(){return this.currentView}}class S{constructor(t,e={}){this.container=t,this.params=e,this.isRendered=!1}async render(){throw new Error("render() 方法必须在子类中实现")}async onEnter(){}async onLeave(){}async destroy(){}showLoading(t="加载中..."){this.container&&(this.container.innerHTML=`
      <div class="view-loading">
        <div class="loading-spinner">
          <i class="fas fa-satellite fa-spin"></i>
        </div>
        <p>${t}</p>
      </div>
    `)}showError(t,e=null){if(!this.container)return;let i="";e&&(e.message?i=e.message:typeof e=="string"&&(i=e)),this.container.innerHTML=`
      <div class="view-error">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3>${t}</h3>
        ${i?`<p class="error-details">${i}</p>`:""}
        <button class="btn-primary retry-btn">
          <i class="fas fa-redo"></i> 重试
        </button>
      </div>
    `;const s=this.container.querySelector(".retry-btn");s&&s.addEventListener("click",()=>this.render())}updateContent(t){this.container&&(this.container.innerHTML=t,this.isRendered=!0)}}class T extends S{constructor(t,e={}){super(t,e),this.networkInitialized=!1}async render(){this.showLoading("正在加载网络视图...");try{if(!window.NetworkGraph||!window.AppState)throw new Error("应用未完全初始化");const t=this.getTemplate();this.updateContent(t),await this.initNetworkGraph(),this.isRendered=!0}catch(t){this.showError("加载网络视图失败",t)}}getTemplate(){return`
      <div class="network-view">
        <div class="view-header">
          <h2><i class="fas fa-network-wired"></i> 城市网络图</h2>
        <div class="view-controls">
          <div class="legend">
            <span class="legend-item"><span class="legend-color distance-far"></span> 远距离</span>
            <span class="legend-item"><span class="legend-color distance-near"></span> 近距离</span>
          </div>
        </div>
        </div>
        
        <div class="network-container">
          <div class="network-graph-container">
            <div id="networkGraph" class="network-graph"></div>
            <div class="graph-controls">
              <button id="zoomInBtn" class="btn-icon" title="放大">
                <i class="fas fa-search-plus"></i>
              </button>
               <button id="zoomOutBtn" class="btn-icon" title="缩小">
                 <i class="fas fa-search-minus"></i>
               </button>
               <button id="resetViewBtn" class="btn-icon" title="重置视图">
                 <i class="fas fa-sync-alt"></i>
               </button>
            </div>
          </div>
          
           <div class="selected-city-panel" id="selectedCityInfo">
             <div class="panel-top-controls">
               <button id="randomCityBtn" class="btn-primary" style="width: 100%; margin-bottom: var(--space-sm);">
                 <i class="fas fa-random"></i> 随机选择城市
               </button>
             </div>
             <div class="panel-header">
               <h3><i class="fas fa-map-pin"></i> 选中城市</h3>
               <button id="closeCityPanel" class="btn-icon btn-small">
                 <i class="fas fa-times"></i>
               </button>
             </div>
            <div class="city-details">
              <h4 id="selectedCityName">未选择城市</h4>
              <div class="city-stats">
                <div class="stat">
                  <span class="stat-label">距离</span>
                  <span class="stat-value" id="selectedCityDistance">0 km</span>
                </div>
                <div class="stat">
                  <span class="stat-label">方位角</span>
                  <span class="stat-value" id="selectedCityBearing">0°</span>
                </div>
                <div class="stat">
                  <span class="stat-label">人口</span>
                  <span class="stat-value" id="selectedCityPopulation">0</span>
                </div>
              </div>
              <p class="city-description" id="selectedCityDescription">点击网络图中的城市节点或使用"随机选择城市"按钮选择一个城市</p>
              <div class="action-buttons">
                <button id="confirmCityBtn" class="btn-success">
                  <i class="fas fa-check-circle"></i> 确定到访
                </button>
                <button id="cancelCityBtn" class="btn-secondary">
                  <i class="fas fa-times-circle"></i> 取消选择
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="view-footer">
          <div class="status-info">
            <span id="networkStatus">就绪</span>
            <span class="zoom-level">缩放级别: <span id="zoomLevel">1.0</span>x</span>
          </div>
        </div>
      </div>
    `}async initNetworkGraph(){this.networkInitialized||(window.NetworkGraph&&typeof window.NetworkGraph.init=="function"&&(window.NetworkGraph.init("networkGraph"),window.AppState.networkGraph=window.NetworkGraph,this.networkInitialized=!0,this.updateZoomDisplay()),this.bindEvents())}bindEvents(){const t=this.container.querySelector("#zoomInBtn"),e=this.container.querySelector("#zoomOutBtn"),i=this.container.querySelector("#resetViewBtn"),s=this.container.querySelector("#randomCityBtn"),n=this.container.querySelector("#closeCityPanel"),o=this.container.querySelector("#confirmCityBtn"),r=this.container.querySelector("#cancelCityBtn");t&&t.addEventListener("click",()=>this.zoomIn()),e&&e.addEventListener("click",()=>this.zoomOut()),i&&i.addEventListener("click",()=>this.resetView()),s&&s.addEventListener("click",()=>this.selectRandomCity()),n&&n.addEventListener("click",()=>this.hideSelectedCityPanel()),o&&o.addEventListener("click",()=>this.confirmSelectedCity()),r&&r.addEventListener("click",()=>this.cancelSelectedCity())}zoomIn(){window.UIManager&&typeof window.UIManager.zoomIn=="function"&&(window.UIManager.zoomIn(),this.updateZoomDisplay())}zoomOut(){window.UIManager&&typeof window.UIManager.zoomOut=="function"&&(window.UIManager.zoomOut(),this.updateZoomDisplay())}resetView(){window.UIManager&&typeof window.UIManager.resetView=="function"&&(window.UIManager.resetView(),this.updateZoomDisplay())}updateZoomDisplay(){const t=this.container.querySelector("#zoomLevel");t&&window.AppState&&(t.textContent=window.AppState.zoomLevel.toFixed(1))}selectRandomCity(){window.UIManager&&typeof window.UIManager.selectRandomCity=="function"&&(window.UIManager.selectRandomCity(),this.showSelectedCityPanel())}showSelectedCityPanel(){const t=this.container.querySelector("#selectedCityInfo");t&&(t.style.display="block")}hideSelectedCityPanel(){const t=this.container.querySelector("#selectedCityInfo");t&&(t.style.display="none"),window.UIManager&&typeof window.UIManager.hideSelectedCityInfo=="function"&&window.UIManager.hideSelectedCityInfo()}confirmSelectedCity(){window.UIManager&&typeof window.UIManager.confirmSelectedCity=="function"&&(window.UIManager.confirmSelectedCity(),this.hideSelectedCityPanel())}cancelSelectedCity(){window.UIManager&&typeof window.UIManager.cancelSelectedCity=="function"&&(window.UIManager.cancelSelectedCity(),this.hideSelectedCityPanel())}async onEnter(){console.log("进入网络视图"),window.NetworkGraph&&typeof window.NetworkGraph.updateData=="function"&&window.NetworkGraph.updateData()}async onLeave(){console.log("离开网络视图")}}class q extends S{constructor(t,e={}){super(t,e),this.currentSort="distance",this.currentSearch=""}async render(){this.showLoading("正在加载城市列表...");try{if(!window.AppState||!window.UIManager)throw new Error("应用未完全初始化");const t=this.getTemplate();this.updateContent(t),this.updateCityList(),this.bindEvents(),this.isRendered=!0}catch(t){this.showError("加载城市视图失败",t)}}getTemplate(){const t=window.AppState?window.AppState.filteredCities.length:0;return`
      <div class="cities-view">
        <div class="view-header">
          <h2><i class="fas fa-city"></i> 城市列表</h2>
          <div class="view-controls">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input type="text" id="citySearchInput" placeholder="搜索城市名称..." value="${this.currentSearch}">
            </div>
            <button id="addCityBtn" class="btn-primary">
              <i class="fas fa-plus-circle"></i> 手动添加城市
            </button>
          </div>
        </div>
        
        <div class="view-content">
          <div class="filter-controls">
            <div class="filter-group">
              <span class="filter-label">显示 <span id="cityCount">${t}</span> 个城市</span>
              <select id="sortSelect" class="sort-select">
                <option value="distance" ${this.currentSort==="distance"?"selected":""}>按距离排序</option>
                <option value="name" ${this.currentSort==="name"?"selected":""}>按名称排序</option>
                <option value="population" ${this.currentSort==="population"?"selected":""}>按人口排序</option>
              </select>
            </div>
            <div class="filter-stats">
              <span class="stat-item">
                <i class="fas fa-check-circle"></i>
                已访问: <span id="visitedCount">0</span>
              </span>

            </div>
          </div>
          
          <div class="cities-container">
            <div id="cityListContainer" class="city-list-container">
              <!-- 城市列表动态生成 -->
              <div class="empty-state">
                <i class="fas fa-city"></i>
                <p>正在加载城市数据...</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="view-footer">
          <div class="status-info">
            <span id="citiesStatus">就绪</span>
            <span class="hint">点击城市查看详情，双击可快速添加到旅游记录</span>
          </div>
        </div>
      </div>
    `}updateCityList(){const t=this.container.querySelector("#cityListContainer");if(!t||!window.AppState)return;const e=this.getFilteredAndSortedCities();if(this.updateFilterStats(),!e||e.length===0){t.innerHTML=`
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <p>未找到匹配的城市</p>
          ${this.currentSearch?'<p class="empty-hint">尝试其他搜索关键词</p>':""}
        </div>
      `;return}let i="";e.forEach(s=>{var o;const n=window.AppState.visitedCities.has(s.id);i+=`
        <div class="city-card" data-city-id="${s.id}">
          <div class="city-card-header">
            <h4 class="city-name">${s.name}</h4>
            <div class="city-card-actions">
              <span class="city-distance">${s.distance.toFixed(1)} km</span>
              ${n?'<span class="city-status visited"><i class="fas fa-check-circle"></i> 已访问</span>':'<button class="btn-small btn-visit-city" data-city-id="'+s.id+'">到访</button>'}

            </div>
          </div>
          
          <div class="city-card-body">
            <p class="city-description">${s.description}</p>
            
            <div class="city-card-stats">
              <div class="city-stat">
                <i class="fas fa-users"></i>
                <span class="stat-value">${((o=s.population)==null?void 0:o.toLocaleString())||"N/A"}</span>
                <span class="stat-label">人口</span>
              </div>
              <div class="city-stat">
                <i class="fas fa-compass"></i>
                <span class="stat-value">${Math.round(s.bearing)}°</span>
                <span class="stat-label">方位角</span>
              </div>
              <div class="city-stat">
                <i class="fas fa-map-marker-alt"></i>
                <span class="stat-value">${s.lat.toFixed(4)}°, ${s.lng.toFixed(4)}°</span>
                <span class="stat-label">坐标</span>
              </div>
            </div>
          </div>
          
          <div class="city-card-footer">
            <button class="btn-small btn-view-details" data-city-id="${s.id}">
              <i class="fas fa-info-circle"></i> 详情
            </button>

          </div>
        </div>
      `}),t.innerHTML=i,this.bindCityCardEvents()}getFilteredAndSortedCities(){if(!window.AppState)return[];let t=[...window.AppState.filteredCities];if(this.currentSearch){const e=this.currentSearch.toLowerCase();t=t.filter(i=>i.name.toLowerCase().includes(e)||i.description.toLowerCase().includes(e))}switch(this.currentSort){case"distance":t.sort((e,i)=>e.distance-i.distance);break;case"name":t.sort((e,i)=>e.name.localeCompare(i.name));break;case"population":t.sort((e,i)=>(i.population||0)-(e.population||0));break}return t}updateFilterStats(){if(!window.AppState)return;const t=this.container.querySelector("#cityCount");if(t){const i=this.getFilteredAndSortedCities();t.textContent=i.length}const e=this.container.querySelector("#visitedCount");e&&(e.textContent=window.AppState.visitedCities.size)}bindEvents(){const t=this.container.querySelector("#citySearchInput");t&&t.addEventListener("input",s=>{this.currentSearch=s.target.value,this.updateCityList()});const e=this.container.querySelector("#sortSelect");e&&e.addEventListener("change",s=>{this.currentSort=s.target.value,this.updateCityList()});const i=this.container.querySelector("#addCityBtn");i&&i.addEventListener("click",()=>this.handleAddCity())}bindCityCardEvents(){this.container.querySelectorAll(".btn-visit-city").forEach(s=>{s.addEventListener("click",n=>{n.stopPropagation();const o=s.dataset.cityId;this.visitCity(o)})}),this.container.querySelectorAll(".btn-view-details").forEach(s=>{s.addEventListener("click",n=>{n.stopPropagation();const o=s.dataset.cityId;this.showCityDetails(o)})}),this.container.querySelectorAll(".city-card").forEach(s=>{let n=null;s.addEventListener("click",o=>{o.target.closest("button")||(n&&(clearTimeout(n),n=null),n=setTimeout(()=>{const r=s.dataset.cityId;this.showCityDetails(r)},300))}),s.addEventListener("dblclick",o=>{n&&(clearTimeout(n),n=null);const r=s.dataset.cityId;this.visitCity(r)})})}async visitCity(t){if(!window.AppState||!window.UIManager)return;if(!window.AppState.isAuthenticated){window.UIManager.showNotification&&window.UIManager.showNotification("此操作需要登录。请先登录以编辑内容。","warning");return}const e=window.AppState.filteredCities.find(i=>i.id===t);e&&(window.AppState.selectedCity=e,typeof window.UIManager.confirmSelectedCity=="function"&&(await window.UIManager.confirmSelectedCity(),this.updateCityList(),window.UIManager.showNotification&&window.UIManager.showNotification(`已添加 ${e.name} 到旅游记录`,"success")))}showCityDetails(t){if(!window.AppState||!window.UIManager)return;const e=window.AppState.filteredCities.find(i=>i.id===t);e&&(window.AppState.selectedCity=e,typeof window.UIManager.showSelectedCityInfo=="function"&&window.UIManager.showSelectedCityInfo(e))}async handleAddCity(){if(!window.AppState||!window.UIManager||!window.DataManager)return;if(!window.AppState.isAuthenticated){window.UIManager.showNotification("此操作需要登录。请先登录以编辑内容。","warning");return}const t=prompt("请输入城市名称（例如：南京市）:","");if(!t)return;const e=prompt("请输入城市纬度（例如：32.0603）:","");if(!e)return;const i=parseFloat(e),s=prompt("请输入城市经度（例如：118.7969）:","");if(!s)return;const n=parseFloat(s),o=prompt("请输入城市人口（可选，留空为0）:","0"),r=o?parseInt(o):0,d=prompt("请输入城市描述（可选）:","");if(!t.trim()){window.UIManager.showNotification("城市名称不能为空","warning");return}if(isNaN(i)||i<-90||i>90){window.UIManager.showNotification("纬度必须在-90到90之间","warning");return}if(isNaN(n)||n<-180||n>180){window.UIManager.showNotification("经度必须在-180到180之间","warning");return}const l=`确定要添加城市 "${t}" 吗？
纬度: ${i}
经度: ${n}
人口: ${r.toLocaleString()}
描述: ${d||"无"}`;if(!confirm(l))return;const w=await window.DataManager.addCustomCity({name:t.trim(),lat:i,lng:n,population:r,description:d||""});w.success?(window.UIManager.showNotification(`成功添加城市: ${t}`,"success"),this.updateCityList()):window.UIManager.showNotification(`添加城市失败: ${w.message}`,"danger")}async onEnter(){console.log("进入城市列表视图"),this.updateCityList()}async onLeave(){console.log("离开城市列表视图")}}class L extends S{constructor(t,e={}){super(t,e),this.editingRecordId=null}async render(){this.showLoading("正在加载旅游记录...");try{if(!window.AppState||!window.UIManager)throw new Error("应用未完全初始化");const t=this.getTemplate();this.updateContent(t),this.updateRecordsList(),this.bindEvents(),this.isRendered=!0}catch(t){this.showError("加载旅游记录失败",t)}}getTemplate(){const t=window.AppState?window.AppState.travelRecords.length:0;return`
      <div class="records-view">
        <div class="view-header">
          <h2><i class="fas fa-passport"></i> 我的旅游记录</h2>
          <div class="view-controls">
            <button id="addRecordBtn" class="btn-primary">
              <i class="fas fa-plus"></i> 新增记录
            </button>
            <button id="clearRecordsBtn" class="btn-danger">
              <i class="fas fa-trash"></i> 清空记录
            </button>
            <button id="exportRecordsBtn" class="btn-secondary">
              <i class="fas fa-download"></i> 导出
            </button>
          </div>
        </div>
        
        <div class="view-content">
          <div class="records-stats">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-city"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value" id="totalRecords">${t}</span>
                <span class="stat-label">总记录数</span>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-road"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value" id="totalDistance">0</span>
                <span class="stat-label">总距离(km)</span>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-calendar"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value" id="uniqueCities">0</span>
                <span class="stat-label">唯一城市</span>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-camera"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value" id="totalPhotos">0</span>
                <span class="stat-label">照片总数</span>
              </div>
            </div>
          </div>
          
          <div class="records-container">
            <div id="recordsList" class="records-list">
              <!-- 记录列表动态生成 -->
              ${t===0?`
                <div class="empty-state">
                  <i class="fas fa-compass"></i>
                  <p>暂无旅游记录</p>
                  <p class="empty-hint">开始探索周边城市，记录您的旅行足迹</p>
                </div>
              `:""}
            </div>
          </div>
        </div>
        
        <div class="view-footer">
          <div class="status-info">
            <span id="recordsStatus">就绪</span>
            <span class="hint">点击记录查看详情，支持编辑和删除</span>
          </div>
        </div>
      </div>
      
      <!-- 编辑记录模态框（内联，避免依赖外部模态框） -->
      <div id="recordEditModal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h2><i class="fas fa-edit"></i> 编辑旅行记录</h2>
            <button class="modal-close" id="recordEditModalClose">&times;</button>
          </div>
          <div class="modal-body">
            <form id="recordEditForm" class="edit-record-form">
              <div class="form-group">
                <label for="editRecordCityName"><i class="fas fa-city"></i> 城市名称</label>
                <input type="text" id="editRecordCityName" readonly class="readonly-input">
              </div>
              
              <div class="form-group">
                <label for="editRecordVisitDate"><i class="fas fa-calendar-alt"></i> 到访日期</label>
                <input type="date" id="editRecordVisitDate" required>
              </div>
              
              <div class="form-group">
                <label for="editRecordThoughts"><i class="fas fa-comment-dots"></i> 旅行感想</label>
                <textarea id="editRecordThoughts" rows="4" placeholder="记录您的旅行体验、感受或建议..."></textarea>
              </div>
              
              <div class="form-group">
                <label><i class="fas fa-images"></i> 照片管理</label>
                <div class="photos-management">
                  <div id="editRecordPhotosList" class="photos-list">
                    <div class="empty-photos">
                      <i class="fas fa-camera"></i>
                      <span>暂无照片</span>
                    </div>
                  </div>
                  <div class="photos-actions">
                    <button type="button" id="addPhotoBtn" class="btn-small">
                      <i class="fas fa-link"></i> 添加照片URL
                    </button>
                    <button type="button" id="uploadPhotoBtn" class="btn-small">
                      <i class="fas fa-upload"></i> 上传本地照片
                    </button>
                    <input type="file" id="photoFileInput" accept="image/*" multiple style="display: none;">
                  </div>
                </div>
              </div>
              
              <div class="form-actions">
                <button type="submit" id="editRecordSaveBtn" class="btn-primary">
                  <i class="fas fa-save"></i> 保存更改
                </button>
                <button type="button" id="editRecordCancelBtn" class="btn-secondary">
                  取消
                </button>
                <button type="button" id="editRecordDeleteBtn" class="btn-danger" style="margin-left: auto;">
                  <i class="fas fa-trash"></i> 删除记录
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `}async updateRecordsList(){const t=this.container.querySelector("#recordsList");if(!t||!window.AppState)return;const e=window.AppState.travelRecords;if(await this.updateRecordsStats(),!e||e.length===0){t.innerHTML=`
        <div class="empty-state">
          <i class="fas fa-compass"></i>
          <p>暂无旅游记录</p>
          <p class="empty-hint">开始探索周边城市，记录您的旅行足迹</p>
        </div>
      `;return}const i=[];for(const n of e){let o=[];if(window.PhotoManager)try{o=await window.PhotoManager.getPhotos(n.id)}catch(r){console.error(`获取记录 ${n.id} 的照片失败:`,r)}i.push({record:n,photos:o})}let s="";i.forEach(({record:n,photos:o})=>{const r=window.AppState.cities.find(h=>h.id===n.cityId),d=r?r.name:n.cityName,l=r?r.distance:n.distance,w=new Date(n.visitDate).toLocaleDateString("zh-CN");s+=`
        <div class="record-card" data-record-id="${n.id}">
          <div class="record-card-header">
            <div class="record-city-info">
              <h4 class="record-city-name">${d}</h4>
              <span class="record-date">${w}</span>
            </div>
            <div class="record-card-actions">
              <span class="record-distance">${l.toFixed(1)} km</span>
              <button class="btn-icon btn-edit-record" data-record-id="${n.id}" title="编辑">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon btn-delete-record" data-record-id="${n.id}" title="删除">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <div class="record-card-body">
            <p class="record-thoughts">${n.thoughts||'<span class="text-muted">暂无感想</span>'}</p>
            
            ${o.length>0?`
              <div class="record-photos-preview">
                <div class="photos-count">
                  <i class="fas fa-images"></i>
                  <span>${o.length} 张照片</span>
                </div>
                <div class="photos-thumbnails">
                  ${o.slice(0,3).map((h,f)=>`
                    <div class="photo-thumbnail" style="background-image: url('${h.dataUrl}')" 
                         data-photo-id="${h.id}" data-photo-url="${h.dataUrl}" data-record-id="${n.id}">
                      ${f===2&&o.length>3?`<span class="more-photos">+${o.length-3}</span>`:""}
                    </div>
                  `).join("")}
                </div>
              </div>
            `:""}
          </div>
          
          <div class="record-card-footer">
            <div class="record-tags">
              <span class="record-tag">
                <i class="fas fa-clock"></i>
                ${this.getTimeAgo(n.visitDate)}
              </span>
              ${r?`
                <span class="record-tag">
                  <i class="fas fa-compass"></i>
                  ${Math.round(r.bearing)}° 方向
                </span>
              `:""}
            </div>
          </div>
        </div>
      `}),t.innerHTML=s,this.bindRecordCardEvents()}async updateRecordsStats(){if(!window.AppState)return;const t=window.AppState.travelRecords,e=this.container.querySelector("#totalRecords");e&&(e.textContent=t.length);let i=0,s=new Set,n=0;for(const l of t){const w=window.AppState.cities.find(h=>h.id===l.cityId);if(w&&(i+=w.distance,s.add(w.id)),window.PhotoManager)try{const h=await window.PhotoManager.getPhotos(l.id);n+=h.length}catch(h){console.error(`获取记录 ${l.id} 的照片失败:`,h)}}const o=this.container.querySelector("#totalDistance");o&&(o.textContent=i.toFixed(0));const r=this.container.querySelector("#uniqueCities");r&&(r.textContent=s.size);const d=this.container.querySelector("#totalPhotos");d&&(d.textContent=n)}getTimeAgo(t){const e=new Date(t),s=new Date-e,n=Math.floor(s/(1e3*60*60*24));return n===0?"今天":n===1?"昨天":n<7?`${n}天前`:n<30?`${Math.floor(n/7)}周前`:n<365?`${Math.floor(n/30)}个月前`:`${Math.floor(n/365)}年前`}bindEvents(){const t=this.container.querySelector("#addRecordBtn");t&&t.addEventListener("click",()=>this.handleAddRecord());const e=this.container.querySelector("#clearRecordsBtn");e&&e.addEventListener("click",()=>this.handleClearRecords());const i=this.container.querySelector("#exportRecordsBtn");i&&i.addEventListener("click",()=>this.handleExportRecords())}bindRecordCardEvents(){this.container.querySelectorAll(".btn-edit-record").forEach(n=>{n.addEventListener("click",o=>{o.stopPropagation();const r=n.dataset.recordId;this.editRecord(r)})}),this.container.querySelectorAll(".btn-delete-record").forEach(n=>{n.addEventListener("click",o=>{o.stopPropagation();const r=n.dataset.recordId;this.deleteRecord(r)})}),this.container.querySelectorAll(".photo-thumbnail").forEach(n=>{n.addEventListener("click",o=>{o.stopPropagation();const r=n.dataset.photoUrl;if(r){console.log("缩略图点击，URL:",r.substring(0,50)+"...");try{const d=window.open(r,"_blank");(!d||d.closed||typeof d.closed>"u")&&this.showPhotoInModal(r)}catch(d){console.error("打开照片失败:",d),this.showPhotoInModal(r)}}})}),this.container.querySelectorAll(".record-card").forEach(n=>{n.addEventListener("click",o=>{if(o.target.closest("button"))return;const r=n.dataset.recordId;this.viewRecordDetails(r)})})}async handleAddRecord(){if(!(!window.AppState||!window.UIManager)){if(!window.AppState.isAuthenticated){window.UIManager.showNotification&&window.UIManager.showNotification("此操作需要登录。请先登录以编辑内容。","warning");return}window.UIManager.showNotification&&window.UIManager.showNotification('请先在城市列表中选择城市并点击"到访"按钮',"info")}}async handleClearRecords(){if(!(!window.AppState||!window.UIManager)){if(!window.AppState.isAuthenticated){window.UIManager.showNotification&&window.UIManager.showNotification("此操作需要登录。请先登录以编辑内容。","warning");return}if(confirm("确定要清除所有旅行记录吗？此操作不可撤销。"))try{window.AppState.travelRecords=[],window.AppState.visitedCities.clear(),window.DataManager&&typeof window.DataManager.saveUserData=="function"&&await window.DataManager.saveUserData(),this.updateRecordsList(),window.UIManager.showNotification&&window.UIManager.showNotification("所有记录已清除","success")}catch(t){console.error("清除记录失败:",t),window.UIManager.showNotification&&window.UIManager.showNotification("清除记录时发生错误","danger")}}}async handleExportRecords(){!window.AppState||!window.UIManager||typeof window.UIManager.handleExportData=="function"&&window.UIManager.handleExportData()}editRecord(t){if(!(!window.AppState||!window.UIManager)){if(!window.AppState.isAuthenticated){window.UIManager.showNotification&&window.UIManager.showNotification("此操作需要登录。请先登录以编辑内容。","warning");return}this.editingRecordId=t,this.showEditModal(t)}}async showEditModal(t){const e=window.AppState.travelRecords.find(l=>l.id===t);if(!e)return;const i=window.AppState.cities.find(l=>l.id===e.cityId),s=i?i.name:e.cityName,n=this.container.querySelector("#recordEditModal"),o=n.querySelector("#editRecordCityName"),r=n.querySelector("#editRecordVisitDate"),d=n.querySelector("#editRecordThoughts");o&&(o.value=s),r&&(r.value=e.visitDate),d&&(d.value=e.thoughts||""),n.style.display="flex",this.bindModalEvents(),await this.loadPhotosForRecord(t)}async loadPhotosForRecord(t){const e=this.container.querySelector("#editRecordPhotosList");if(e){e.innerHTML=`
      <div class="loading-photos">
        <i class="fas fa-spinner fa-spin"></i>
        <span>加载照片中...</span>
      </div>
    `;try{let i=[];window.PhotoManager&&(i=await window.PhotoManager.getPhotos(t)),this.updatePhotoList(i)}catch(i){console.error("加载照片失败:",i),e.innerHTML=`
        <div class="error-photos">
          <i class="fas fa-exclamation-triangle"></i>
          <span>照片加载失败</span>
        </div>
      `}}}updatePhotoList(t){const e=this.container.querySelector("#editRecordPhotosList");if(!e)return;if(!t||t.length===0){e.innerHTML=`
        <div class="empty-photos">
          <i class="fas fa-camera"></i>
          <span>暂无照片</span>
        </div>
      `;return}let i="";t.forEach(o=>{i+=`
        <div class="photo-item" data-photo-id="${o.id}">
          <img src="${o.dataUrl}" alt="旅行照片" onerror="this.style.display='none'">
          <div class="photo-actions">
            <button class="btn-small btn-view-photo" data-url="${o.dataUrl}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-small btn-remove-photo" data-photo-id="${o.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `}),e.innerHTML=i;const s=e.querySelectorAll(".btn-view-photo"),n=e.querySelectorAll(".btn-remove-photo");s.forEach(o=>{o.addEventListener("click",r=>{const d=r.target.closest("button").dataset.url;if(console.log("查看照片，URL:",d?"有":"无",d?d.substring(0,50)+"...":""),!d){console.error("没有照片URL"),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("照片URL无效","warning");return}try{const l=window.open(d,"_blank");(!l||l.closed||typeof l.closed>"u")&&(console.log("新窗口可能被阻止，使用备用方案"),this.showPhotoInModal(d))}catch(l){console.error("打开照片失败:",l),this.showPhotoInModal(d)}})}),n.forEach(o=>{o.addEventListener("click",r=>{const d=r.target.closest("button").dataset.photoId;this.removePhoto(d)})})}bindModalEvents(){const t=this.container.querySelector("#recordEditModal");if(!t)return;const e=t.querySelector("#recordEditModalClose"),i=t.querySelector("#editRecordCancelBtn");if(e&&e.addEventListener("click",()=>this.hideEditModal()),i&&i.addEventListener("click",()=>this.hideEditModal()),t.addEventListener("click",l=>{l.target===t&&this.hideEditModal()}),t.querySelector("#editRecordSaveBtn")){const l=t.querySelector("#recordEditForm"),w=l.cloneNode(!0);l.parentNode.replaceChild(w,l),w.addEventListener("submit",h=>this.handleSaveRecord(h))}const n=t.querySelector("#editRecordDeleteBtn");n&&n.addEventListener("click",()=>this.handleDeleteRecord());const o=t.querySelector("#addPhotoBtn");o&&o.addEventListener("click",()=>this.handleAddPhoto());const r=t.querySelector("#uploadPhotoBtn"),d=t.querySelector("#photoFileInput");r&&d&&(r.addEventListener("click",()=>{d.click()}),d.addEventListener("change",l=>{this.handleUploadPhoto(l)}))}hideEditModal(){const t=this.container.querySelector("#recordEditModal");t&&(t.style.display="none"),this.editingRecordId=null}async handleSaveRecord(t){if(t.preventDefault(),!this.editingRecordId||!window.AppState)return;const e=window.AppState.travelRecords.find(o=>o.id===this.editingRecordId);if(!e)return;const i=this.container.querySelector("#recordEditModal"),s=i.querySelector("#editRecordVisitDate"),n=i.querySelector("#editRecordThoughts");if(!(!s||!n)){e.visitDate=s.value,e.thoughts=n.value;try{window.DataManager&&typeof window.DataManager.saveUserData=="function"&&await window.DataManager.saveUserData(),this.updateRecordsList(),this.hideEditModal(),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("旅行记录已更新","success")}catch(o){console.error("保存记录失败:",o),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("保存记录时发生错误","danger")}}}async handleDeleteRecord(){!this.editingRecordId||!window.AppState||confirm("确定要删除这条旅行记录吗？此操作不可撤销。")&&(await this.deleteRecord(this.editingRecordId),this.hideEditModal())}async deleteRecord(t){if(!window.AppState||!window.UIManager)return;if(!window.AppState.isAuthenticated){window.UIManager.showNotification&&window.UIManager.showNotification("此操作需要登录。请先登录以编辑内容。","warning");return}const e=window.AppState.travelRecords.findIndex(n=>n.id===t);if(e===-1)return;const i=window.AppState.travelRecords[e],s=i.cityName;try{window.AppState.visitedCities.delete(i.cityId),window.AppState.travelRecords.splice(e,1),window.PhotoManager&&typeof window.PhotoManager.deleteAllPhotos=="function"&&await window.PhotoManager.deleteAllPhotos(t),window.DataManager&&typeof window.DataManager.saveUserData=="function"&&await window.DataManager.saveUserData(),await this.updateRecordsList(),window.UIManager.showNotification&&window.UIManager.showNotification(`已删除 ${s} 的旅行记录`,"success")}catch(n){console.error("删除记录失败:",n),window.UIManager.showNotification&&window.UIManager.showNotification("删除记录时发生错误","danger")}}async handleAddPhoto(){if(!this.editingRecordId||!window.AppState||!window.PhotoManager)return;const t=prompt("请输入照片URL地址:");if(!t)return;if(!t.startsWith("http://")&&!t.startsWith("https://")){window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("请输入有效的URL地址 (以 http:// 或 https:// 开头)","warning");return}const e={originalFile:{name:"external_image.jpg"},compressedDataUrl:t,originalSizeKB:0,compressedSizeKB:0,width:800,height:600,quality:1},i=await window.PhotoManager.savePhoto(this.editingRecordId,e);i.success?(await this.loadPhotosForRecord(this.editingRecordId),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("照片已添加","success")):window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification(`添加照片失败: ${i.message}`,"warning")}async handleUploadPhoto(t){if(!this.editingRecordId||!window.AppState||!window.PhotoManager)return;const e=t.target.files;if(!e||e.length===0)return;const i=await window.PhotoManager.getPhotos(this.editingRecordId),s=window.PhotoManager.CONFIG.MAX_PHOTOS_PER_RECORD;if(i.length>=s){window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification(`每个旅游记录最多只能保存 ${s} 张照片`,"warning");return}let n=0,o=0,r=!1;for(let d=0;d<e.length;d++){const l=e[d];if(!l.type.startsWith("image/")){o++;continue}if(l.size>5*1024*1024){o++;continue}if(i.length+n>=s){window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification(`已达到照片数量限制（最多 ${s} 张）`,"warning"),r=!0;break}try{const w=await window.PhotoManager.compressImage(l),h=await window.PhotoManager.savePhoto(this.editingRecordId,w);h.success?n++:(o++,console.error("保存照片失败:",h.message))}catch(w){console.error("处理照片失败:",w),o++}}if(t.target.value="",n>0&&await this.loadPhotosForRecord(this.editingRecordId),window.UIManager&&window.UIManager.showNotification){let d="";n>0&&o===0?(d=`已上传 ${n} 张照片`,r&&(d+=`，已达到照片数量限制（最多 ${s} 张）`)):n>0&&o>0?(d=`已上传 ${n} 张照片，${o} 张失败（非图片、文件过大或处理错误）`,r&&(d+=`，已达到照片数量限制（最多 ${s} 张）`)):n===0&&o>0&&(d="上传失败：请确保选择的是图片文件且大小不超过5MB"),d&&window.UIManager.showNotification(d,n>0?"success":"warning")}}readFileAsDataURL(t){return new Promise((e,i)=>{const s=new FileReader;s.onload=n=>{e(n.target.result)},s.onerror=n=>{i(new Error("文件读取失败"))},s.readAsDataURL(t)})}async removePhoto(t){if(!(!this.editingRecordId||!window.AppState||!window.PhotoManager))try{const e=await window.PhotoManager.deletePhoto(this.editingRecordId,t);e.success?(await this.loadPhotosForRecord(this.editingRecordId),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("照片已删除","success")):window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification(`删除照片失败: ${e.message}`,"warning")}catch(e){console.error("删除照片失败:",e),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("删除照片时发生错误","danger")}}showPhotoInModal(t){const e=document.createElement("div");e.className="photo-viewer-modal",e.style.cssText=`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;const i=document.createElement("div");i.style.cssText=`
      max-width: 90%;
      max-height: 90%;
      position: relative;
    `;const s=document.createElement("img");s.src=t,s.style.cssText=`
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    `,s.onerror=()=>{s.alt="图片加载失败",s.style.padding="20px",s.style.background="#333",s.style.color="#fff"};const n=document.createElement("button");n.innerHTML="&times;",n.style.cssText=`
      position: absolute;
      top: -40px;
      right: -10px;
      background: #ff4757;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    `,n.onclick=()=>document.body.removeChild(e),i.appendChild(s),i.appendChild(n),e.appendChild(i),e.onclick=o=>{o.target===e&&document.body.removeChild(e)},document.body.appendChild(e)}async viewRecordDetails(t){const e=window.AppState.travelRecords.find(o=>o.id===t);if(!e)return;const i=window.AppState.cities.find(o=>o.id===e.cityId),s=i?i.name:e.cityName;let n=0;if(window.PhotoManager)try{n=(await window.PhotoManager.getPhotos(t)).length}catch(o){console.error("获取照片数量失败:",o)}alert(`${s} 的旅行记录

到访日期: ${e.visitDate}

旅行感想: ${e.thoughts||"暂无"}

照片数量: ${n}`)}async onEnter(){console.log("进入旅游记录视图"),await this.updateRecordsList()}async onLeave(){console.log("离开旅游记录视图"),this.hideEditModal()}}N(L,"MAX_PHOTOS_PER_RECORD",10);class z extends S{constructor(t,e={}){super(t,e),this.storageInfo=null}async render(){this.showLoading("正在加载数据管理...");try{if(!window.AppState||!window.DataManager)throw new Error("应用未完全初始化");const t=this.getTemplate();this.updateContent(t),await this.loadStorageInfo(),this.bindEvents(),this.isRendered=!0}catch(t){this.showError("加载数据管理视图失败",t)}}getTemplate(){return`
      <div class="data-view">
        <div class="view-header">
          <h2><i class="fas fa-database"></i> 数据管理</h2>
          <div class="view-controls">
            <button id="refreshStorageBtn" class="btn-icon" title="刷新">
              <i class="fas fa-redo"></i>
            </button>
          </div>
        </div>
        
        <div class="view-content">
          <div class="data-sections">
            <!-- 存储信息部分 -->
            <section class="data-section">
              <h3><i class="fas fa-hdd"></i> 存储信息</h3>
              <div class="storage-info-cards">
                <div class="info-card">
                  <div class="info-icon">
                    <i class="fas fa-city"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">城市数据</span>
                    <span class="info-value" id="citiesData">加载中...</span>
                  </div>
                </div>
                
                <div class="info-card">
                  <div class="info-icon">
                    <i class="fas fa-passport"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">旅游记录</span>
                    <span class="info-value" id="recordsData">加载中...</span>
                  </div>
                </div>
                
                <div class="info-card">
                  <div class="info-icon">
                    <i class="fas fa-user-check"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">已访问城市</span>
                    <span class="info-value" id="visitedData">加载中...</span>
                  </div>
                </div>
                

              </div>
              
              <div class="storage-usage">
                <div class="usage-header">
                  <h4><i class="fas fa-chart-pie"></i> 存储使用情况</h4>
                  <span id="totalStorage">计算中...</span>
                </div>
                <div class="usage-bar">
                  <div class="usage-fill" id="usageFill" style="width: 0%"></div>
                </div>
                <div class="usage-stats">
                  <span class="usage-stat">已使用: <span id="usedStorage">0 KB</span></span>
                  <span class="usage-stat">可用: <span id="availableStorage">∞</span></span>
                </div>
              </div>
            </section>
            
            <!-- 导入导出部分 -->
            <section class="data-section">
              <h3><i class="fas fa-exchange-alt"></i> 数据导入/导出</h3>
              <div class="import-export-cards">
                <div class="action-card export-card">
                  <div class="action-icon">
                    <i class="fas fa-download"></i>
                  </div>
                  <div class="action-content">
                    <h4>导出数据</h4>
                    <p>将所有旅行数据导出为JSON文件，用于备份或迁移。</p>
                    <button id="exportDataBtn" class="btn-primary">
                      <i class="fas fa-file-export"></i> 导出JSON
                    </button>
                  </div>
                </div>
                
                <div class="action-card import-card">
                  <div class="action-icon">
                    <i class="fas fa-upload"></i>
                  </div>
                  <div class="action-content">
                    <h4>导入数据</h4>
                    <p>从JSON文件导入旅行数据，将覆盖现有数据。</p>
                    <button id="importDataBtn" class="btn-primary">
                      <i class="fas fa-file-import"></i> 导入JSON
                    </button>
                    <div class="form-hint">
                      <i class="fas fa-exclamation-triangle"></i>
                      导入数据将覆盖当前所有旅行记录
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <!-- 数据操作部分 -->
            <section class="data-section">
              <h3><i class="fas fa-tools"></i> 数据操作</h3>
              <div class="data-actions">
                <div class="action-group">
                  <h4><i class="fas fa-broom"></i> 数据清理</h4>
                  <p>清理无效或过时的数据，优化存储空间。</p>
                  <div class="action-buttons">
                    <button id="cleanOrphanedBtn" class="btn-secondary">
                      <i class="fas fa-trash-alt"></i> 清理孤儿数据
                    </button>
                    <button id="clearAllDataBtn" class="btn-danger">
                      <i class="fas fa-skull-crossbones"></i> 清除所有数据
                    </button>
                  </div>
                  <div class="form-hint">
                    <i class="fas fa-info-circle"></i>
                    "孤儿数据"指已删除记录对应的城市标记
                  </div>
                </div>
                
                <div class="action-group">
                  <h4><i class="fas fa-redo"></i> 数据重置</h4>
                  <p>重置应用数据到初始状态，保留城市数据。</p>
                  <button id="resetDataBtn" class="btn-warning">
                    <i class="fas fa-history"></i> 重置旅行数据
                  </button>
                  <div class="form-hint">
                    <i class="fas fa-exclamation-triangle"></i>
                    此操作将清除所有旅行记录和用户设置
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        <div class="view-footer">
          <div class="status-info">
            <span id="dataStatus">就绪</span>
            <span class="hint">定期备份您的旅行数据以防止丢失</span>
          </div>
        </div>
      </div>
    `}async loadStorageInfo(){if(!(!window.AppState||!window.DataManager))try{this.updateBasicInfo(),typeof window.DataManager.updateStorageUsage=="function"&&await window.DataManager.updateStorageUsage(),await this.calculateStorageInfo()}catch(t){console.error("加载存储信息失败:",t)}}updateBasicInfo(){if(!window.AppState)return;const t=this.container.querySelector("#citiesData");t&&(t.textContent=`${window.AppState.filteredCities.length} 个城市`);const e=this.container.querySelector("#recordsData");e&&(e.textContent=`${window.AppState.travelRecords.length} 条记录`);const i=this.container.querySelector("#visitedData");i&&(i.textContent=`${window.AppState.visitedCities.size} 个城市`)}async calculateStorageInfo(){try{const t=window.localforage||window.window&&window.window.localforage;if(!t){console.warn("localforage不可用，无法计算存储信息");return}let e=0;const i=await t.keys();for(const r of i){const d=await t.getItem(r);d&&(e+=JSON.stringify(d).length)}const s=this.container.querySelector("#usedStorage"),n=this.container.querySelector("#totalStorage"),o=this.container.querySelector("#usageFill");if(s){const r=(e/1024).toFixed(2);s.textContent=`${r} KB`}if(n&&(n.textContent="~50 MB 限额"),o){const d=Math.min(e/52428800*100,100);o.style.width=`${d.toFixed(1)}%`}}catch(t){console.error("计算存储信息失败:",t)}}bindEvents(){const t=this.container.querySelector("#refreshStorageBtn");t&&t.addEventListener("click",()=>this.loadStorageInfo());const e=this.container.querySelector("#exportDataBtn");e&&e.addEventListener("click",()=>this.handleExportData());const i=this.container.querySelector("#importDataBtn");i&&i.addEventListener("click",()=>this.handleImportData());const s=this.container.querySelector("#cleanOrphanedBtn");s&&s.addEventListener("click",()=>this.handleCleanOrphanedData());const n=this.container.querySelector("#clearAllDataBtn");n&&n.addEventListener("click",()=>this.handleClearAllData());const o=this.container.querySelector("#resetDataBtn");o&&o.addEventListener("click",()=>this.handleResetData())}async handleExportData(){window.UIManager&&(typeof window.UIManager.handleExportData=="function"?window.UIManager.handleExportData():this.exportDataFallback())}async exportDataFallback(){if(!window.AppState)return;const t={visitedCities:Array.from(window.AppState.visitedCities),travelRecords:window.AppState.travelRecords,exportDate:new Date().toISOString(),appVersion:"1.0.0"},e=JSON.stringify(t,null,2),i=new Blob([e],{type:"application/json"}),s=URL.createObjectURL(i),n=document.createElement("a");n.href=s,n.download=`travelnet_data_${new Date().toISOString().split("T")[0]}.json`,document.body.appendChild(n),n.click(),document.body.removeChild(n),URL.revokeObjectURL(s),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("数据导出成功","success")}async handleImportData(){if(window.UIManager){if(!window.AppState.isAuthenticated){window.UIManager.showNotification&&window.UIManager.showNotification("此操作需要登录。请先登录以编辑内容。","warning");return}typeof window.UIManager.handleImportData=="function"?window.UIManager.handleImportData():this.importDataFallback()}}importDataFallback(){const t=document.createElement("input");t.type="file",t.accept="application/json",t.onchange=async e=>{const i=e.target.files[0];if(i)try{const s=await i.text(),n=JSON.parse(s);if(!n.visitedCities||!n.travelRecords)throw new Error("无效的数据格式");if(!confirm("导入数据将覆盖当前所有旅行记录。确定要继续吗？"))return;window.AppState.visitedCities=new Set(n.visitedCities||[]),window.AppState.travelRecords=n.travelRecords||[],window.DataManager&&typeof window.DataManager.saveUserData=="function"&&await window.DataManager.saveUserData(),await this.loadStorageInfo(),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("数据导入成功","success")}catch(s){console.error("导入数据失败:",s),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("导入失败：文件格式无效","danger")}},t.click()}async handleCleanOrphanedData(){if(!window.AppState||!window.DataManager)return;if(!window.AppState.isAuthenticated){window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("此操作需要登录。请先登录以编辑内容。","warning");return}const t=new Set;for(const e of window.AppState.visitedCities)window.AppState.travelRecords.some(s=>s.cityId===e)||t.add(e);if(t.size===0){window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("没有发现孤儿数据","info");return}if(confirm(`发现 ${t.size} 个孤儿数据，确定要清理吗？`))try{for(const e of t)window.AppState.visitedCities.delete(e);await window.DataManager.saveUserData(),await this.loadStorageInfo(),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification(`已清理 ${t.size} 个孤儿数据`,"success")}catch(e){console.error("清理孤儿数据失败:",e),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("清理数据时发生错误","danger")}}async handleClearAllData(){if(!(!window.AppState||!window.DataManager)){if(!window.AppState.isAuthenticated){window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("此操作需要登录。请先登录以编辑内容。","warning");return}if(confirm("确定要清除所有数据吗？此操作将删除所有旅行记录、设置，且不可撤销！"))try{window.AppState.visitedCities.clear(),window.AppState.travelRecords=[],await window.DataManager.saveUserData(),await this.loadStorageInfo(),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("所有数据已清除","success")}catch(t){console.error("清除所有数据失败:",t),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("清除数据时发生错误","danger")}}}async handleResetData(){if(!(!window.AppState||!window.DataManager)){if(!window.AppState.isAuthenticated){window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("此操作需要登录。请先登录以编辑内容。","warning");return}if(confirm("确定要重置所有旅行数据吗？此操作将清除所有旅行记录和用户设置，但保留城市数据。"))try{window.AppState.visitedCities.clear(),window.AppState.travelRecords=[],window.AppState.selectedCity=null,await window.DataManager.saveUserData(),await this.loadStorageInfo(),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("旅行数据已重置","success")}catch(t){console.error("重置数据失败:",t),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("重置数据时发生错误","danger")}}}async onEnter(){console.log("进入数据管理视图"),await this.loadStorageInfo()}async onLeave(){console.log("离开数据管理视图")}}class F extends S{constructor(t,e={}){super(t,e),this.authEventHandler=null}async render(){this.showLoading("正在加载设置...");try{if(!window.AppState||!window.AuthManager)throw new Error("应用未完全初始化");const t=this.getTemplate();this.updateContent(t),this.updateAuthStatus(),this.bindEvents(),this.isRendered=!0}catch(t){this.showError("加载设置视图失败",t)}}getTemplate(){const t=window.AppState?window.AppState.isAuthenticated:!1,e=window.AppState?window.AppState.authUsername:"未登录用户";return`
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
                  <div class="auth-status-icon ${t?"authenticated":"not-authenticated"}">
                    <i class="fas fa-${t?"user-check":"user"}"></i>
                  </div>
                  <div class="auth-status-info">
                    <h4>${e}</h4>
                    <p class="auth-status-text">
                      ${t?"您已登录为项目所有者，可以进行所有编辑操作。":"您处于只读模式，可以查看所有内容但不能编辑。"}
                    </p>
                  </div>
                </div>
                
                <div class="auth-actions">
                  ${t?`
                    <button id="logoutBtn" class="btn-danger">
                      <i class="fas fa-sign-out-alt"></i> 退出登录
                    </button>
                    <div class="form-hint">
                      <i class="fas fa-info-circle"></i>
                      退出后将无法编辑内容，但仍可查看所有数据。
                    </div>
                  `:`
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
              <div id="loginFormContainer" class="login-form-container" style="display: ${t?"none":"block"}">
                <form id="loginForm" class="auth-form">
                  <div class="form-group">
                    <label for="loginPassword"><i class="fas fa-key"></i> 认证密码</label>
                    <input type="password" id="loginPassword" placeholder="请输入认证密码" autocomplete="current-password" required>
                    <div class="form-hint">
                      提示：认证密码通过环境变量 VITE_AUTH_PASSWORD 配置，仅项目所有者知晓。
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
    `}updateAuthStatus(){if(!window.AppState)return;const t=window.AppState.isAuthenticated,e=window.AppState.authUsername,i=this.container.querySelector("#loginFormContainer");i&&(i.style.display=t?"none":"block");const s=this.container.querySelector(".auth-status-text");s&&(s.textContent=t?"您已登录为项目所有者，可以进行所有编辑操作。":"您处于只读模式，可以查看所有内容但不能编辑。");const n=this.container.querySelector(".auth-status-info h4");n&&(n.textContent=e);const o=this.container.querySelector(".auth-status-icon");if(o){o.className=`auth-status-icon ${t?"authenticated":"not-authenticated"}`;const r=o.querySelector("i");r&&(r.className=`fas fa-${t?"user-check":"user"}`)}}bindEvents(){const t=this.container.querySelector("#loginBtn");t&&t.addEventListener("click",()=>this.showLoginForm());const e=this.container.querySelector("#logoutBtn");e&&e.addEventListener("click",()=>this.handleLogout());const i=this.container.querySelector("#loginForm");i&&i.addEventListener("submit",d=>this.handleLoginSubmit(d));const s=this.container.querySelector("#radiusKm");s&&s.addEventListener("input",d=>{const l=d.target.value,w=this.container.querySelector("#radiusValue");w&&(w.textContent=`${l} km`)});const n=this.container.querySelector("#helpBtn");n&&n.addEventListener("click",()=>this.handleHelp());const o=this.container.querySelector("#reportIssueBtn");o&&o.addEventListener("click",()=>this.handleReportIssue());const r=this.container.querySelector("#saveSettingsBtn");r&&r.addEventListener("click",()=>this.handleSaveSettings()),this.authEventHandler=()=>this.updateAuthStatus(),window.addEventListener("auth:login",this.authEventHandler),window.addEventListener("auth:logout",this.authEventHandler)}showLoginForm(){const t=this.container.querySelector("#loginFormContainer");if(t){t.style.display="block";const e=t.querySelector("#loginPassword");e&&e.focus()}}async handleLoginSubmit(t){if(t.preventDefault(),!window.AuthManager)return;const e=this.container.querySelector("#loginPassword"),i=e?e.value:"";if(!i.trim()){window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("请输入密码","warning");return}const s=window.AuthManager.login(i);s.success?(this.updateAuthStatus(),window.UIManager&&typeof window.UIManager.updateAuthUI=="function"&&window.UIManager.updateAuthUI(),e&&(e.value=""),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("登录成功！您现在可以编辑内容。","success")):(window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification(s.message||"密码错误，请重试","danger"),e&&(e.value="",e.focus()))}async handleLogout(){window.AuthManager&&confirm("确定要退出登录吗？退出后将无法编辑内容。")&&(window.AuthManager.logout(),this.updateAuthStatus(),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("已退出登录","info"))}async handleHelp(){window.UIManager&&(typeof window.UIManager.handleHelp=="function"?window.UIManager.handleHelp():alert(`TravelNet 使用帮助：
      
1. 查看模式：所有用户都可以查看城市网络和旅行记录
2. 编辑模式：只有认证用户（项目所有者）可以添加城市、编辑记录等
3. 随机选择：点击"随机选择"按钮选择一个未访问的城市
4. 确认访问：选中城市后点击"确认访问"添加到旅行记录
5. 数据管理：支持导出/导入JSON格式的数据

项目地址：https://github.com/xinyvpeng/USTB_travelNet`))}handleReportIssue(){window.open("https://github.com/xinyvpeng/USTB_travelNet/issues","_blank")}async handleSaveSettings(){const t=this.container.querySelector("#radiusKm").value,e=this.container.querySelector("#showVisitedCities").checked,i=this.container.querySelector("#enableAnimations").checked,s=this.container.querySelector("#autoSave").checked,n={radiusKm:parseInt(t),showVisitedCities:e,enableAnimations:i,autoSave:s,savedAt:new Date().toISOString()};try{localStorage.setItem("travelnet_settings",JSON.stringify(n)),window.CONFIG&&(window.CONFIG.radiusKm=parseInt(t)),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("设置已保存","success"),alert("部分设置更改可能需要刷新页面才能生效。")}catch(o){console.error("保存设置失败:",o),window.UIManager&&window.UIManager.showNotification&&window.UIManager.showNotification("保存设置失败","danger")}}async onEnter(){console.log("进入设置视图"),this.updateAuthStatus(),this.loadSavedSettings()}loadSavedSettings(){try{const t=localStorage.getItem("travelnet_settings");if(t){const e=JSON.parse(t),i=this.container.querySelector("#radiusKm"),s=this.container.querySelector("#radiusValue");i&&s&&(i.value=e.radiusKm||500,s.textContent=`${e.radiusKm||500} km`);const n=this.container.querySelector("#showVisitedCities");n&&(n.checked=e.showVisitedCities!==!1);const o=this.container.querySelector("#enableAnimations");o&&(o.checked=e.enableAnimations!==!1);const r=this.container.querySelector("#autoSave");r&&(r.checked=e.autoSave!==!1)}}catch(t){console.error("加载保存的设置失败:",t)}}async onLeave(){console.log("离开设置视图"),this.authEventHandler&&(window.removeEventListener("auth:login",this.authEventHandler),window.removeEventListener("auth:logout",this.authEventHandler),this.authEventHandler=null)}}const u={centerLat:39.99048,centerLng:116.36087,radiusKm:500,earthRadiusKm:6371,auth:{password:void 0,storageKey:"travelnet_auth_token"},storageKeys:{visitedCities:"travelnet_visited_cities",travelRecords:"travelnet_travel_records",appSettings:"travelnet_app_settings",customCities:"travelnet_custom_cities"}},c={cities:[],filteredCities:[],visitedCities:new Set,travelRecords:[],selectedCity:null,networkGraph:null,zoomLevel:1,isAuthenticated:!1,authToken:null,authUsername:"未登录用户"},g={calculateDistance(a,t,e,i){const s=l=>l*Math.PI/180,n=s(e-a),o=s(i-t),r=Math.sin(n/2)*Math.sin(n/2)+Math.cos(s(a))*Math.cos(s(e))*Math.sin(o/2)*Math.sin(o/2),d=2*Math.atan2(Math.sqrt(r),Math.sqrt(1-r));return u.earthRadiusKm*d},calculateBearing(a,t,e,i){const s=f=>f*Math.PI/180,n=f=>f*180/Math.PI,o=s(a),r=s(e),d=s(i-t),l=Math.sin(d)*Math.cos(r),w=Math.cos(o)*Math.sin(r)-Math.sin(o)*Math.cos(r)*Math.cos(d);let h=n(Math.atan2(l,w));return h=(h+360)%360,h},polarToCartesian(a,t,e,i=1){const s=a/u.radiusKm*e*i,n=(t-90)*(Math.PI/180);return{x:s*Math.cos(n),y:s*Math.sin(n)}}},x={isPrefectureLevelCity(a,t=[]){if(a==="北京市区")return!0;if(!a.endsWith("市")||a.includes("县")||a.includes("区"))return!1;if(a.replace("市","").length>3)for(const i of t){const s=i.replace("市","");if(a.includes(s)&&a!==i)return!1}return!0},filterPrefectureLevelCities(a){const t=a.length,i=a.filter(o=>{const r=o.name;return r==="北京市区"?!0:!r.endsWith("市")||r.includes("县")||r.includes("区")?!1:r.replace("市","").length<=3}).map(o=>o.name);console.log(`收集到 ${i.length} 个简单地级市:`,i);const s=a.filter(o=>this.isPrefectureLevelCity(o.name,i)),n=a.filter(o=>!s.some(r=>r.id===o.id));return n.length>0&&(console.log(`过滤掉 ${n.length} 个非地级市（县级市/县/区）:`),n.forEach(r=>{console.log(`  - ${r.name} (ID: ${r.id})`)}),["廊坊三河市","唐山迁安市","唐山遵化市"].forEach(r=>{n.find(l=>l.name===r)&&console.log(`✓ ${r} 已被正确过滤`)})),console.log(`城市过滤: ${t} → ${s.length} (过滤掉 ${t-s.length} 个)`),s}},b={CONFIG:{MAX_FILE_SIZE:5*1024*1024,MAX_COMPRESSED_SIZE:200*1024,MAX_PHOTOS_PER_RECORD:10,COMPRESSION_QUALITY:.8,MAX_WIDTH:1920,MAX_HEIGHT:1080,STORAGE_KEY:"travelnet_photos"},async init(){try{return await p.config({name:"TravelNet_Photos",version:1,storeName:"photos_store",description:"TravelNet照片存储"}),console.log("照片存储初始化完成"),!0}catch(a){return console.error("照片存储初始化失败:",a),!1}},async compressImage(a,t={}){return new Promise((e,i)=>{const s={quality:t.quality||this.CONFIG.COMPRESSION_QUALITY,maxWidth:t.maxWidth||this.CONFIG.MAX_WIDTH,maxHeight:t.maxHeight||this.CONFIG.MAX_HEIGHT,maxSizeKB:t.maxSizeKB||this.CONFIG.MAX_COMPRESSED_SIZE/1024};if(a.size>this.CONFIG.MAX_FILE_SIZE){i(new Error(`文件过大: ${(a.size/1024/1024).toFixed(2)}MB > ${this.CONFIG.MAX_FILE_SIZE/1024/1024}MB`));return}const n=new Image,o=new FileReader;o.onload=r=>{n.src=r.target.result},o.onerror=()=>{i(new Error("文件读取失败"))},n.onload=()=>{let r=n.width,d=n.height;if(r>s.maxWidth||d>s.maxHeight){const v=Math.min(s.maxWidth/r,s.maxHeight/d);r=Math.floor(r*v),d=Math.floor(d*v)}const l=document.createElement("canvas");l.width=r,l.height=d,l.getContext("2d").drawImage(n,0,0,r,d);let h=l.toDataURL("image/jpeg",s.quality);const f=h.length-(h.indexOf(",")+1),M=h.endsWith("==")?2:h.endsWith("=")?1:0,I=(f*.75-M)/1024;if(I>s.maxSizeKB){let v=0;const E=5;let A=s.quality;for(;I>s.maxSizeKB&&v<E;){A*=.8,h=l.toDataURL("image/jpeg",A);const B=h.length-(h.indexOf(",")+1),$=h.endsWith("==")?2:h.endsWith("=")?1:0;if((B*.75-$)/1024<=s.maxSizeKB)break;v++}I>s.maxSizeKB&&v>=E&&console.warn(`压缩后文件大小仍超过限制: ${I.toFixed(2)}KB > ${s.maxSizeKB}KB`)}e({originalFile:a,compressedDataUrl:h,originalSizeKB:a.size/1024,compressedSizeKB:Math.floor(h.length*.75/1024),width:r,height:d,quality:s.quality})},n.onerror=()=>{i(new Error("图片加载失败"))},o.readAsDataURL(a)})},async compressImages(a,t={}){const e={success:[],failed:[]};for(const i of a)try{const s=await this.compressImage(i,t);e.success.push(s)}catch(s){e.failed.push({file:i,error:s.message})}return e},async savePhoto(a,t){try{const e=`${this.CONFIG.STORAGE_KEY}_${a}`;let i=await this.getPhotos(a);if(i.length>=this.CONFIG.MAX_PHOTOS_PER_RECORD)throw new Error(`已达到照片数量限制（最多 ${this.CONFIG.MAX_PHOTOS_PER_RECORD} 张）`);const s={id:`photo_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,dataUrl:t.compressedDataUrl,originalName:t.originalFile.name,originalSizeKB:t.originalSizeKB,compressedSizeKB:t.compressedSizeKB,width:t.width,height:t.height,uploadedAt:new Date().toISOString(),recordId:a};return i.push(s),await p.setItem(e,i),console.log(`照片已保存: ${t.originalFile.name} (${t.compressedSizeKB}KB)`),{success:!0,photo:s}}catch(e){return console.error("保存照片失败:",e),{success:!1,message:e.message}}},async savePhotos(a,t){const e={success:[],failed:[]};for(const i of t){const s=await this.savePhoto(a,i);s.success?e.success.push(s.photo):e.failed.push({file:i.originalFile,error:s.message})}return e},async getPhotos(a){try{const t=`${this.CONFIG.STORAGE_KEY}_${a}`;return await p.getItem(t)||[]}catch(t){return console.error("获取照片失败:",t),[]}},async deletePhoto(a,t){try{const e=await this.getPhotos(a),i=e.length,s=e.filter(o=>o.id!==t);if(s.length===i)return{success:!1,message:"未找到要删除的照片"};const n=`${this.CONFIG.STORAGE_KEY}_${a}`;return await p.setItem(n,s),{success:!0,deletedCount:i-s.length}}catch(e){return console.error("删除照片失败:",e),{success:!1,message:e.message}}},async deleteAllPhotos(a){try{const t=`${this.CONFIG.STORAGE_KEY}_${a}`;return await p.removeItem(t),{success:!0}}catch(t){return console.error("删除所有照片失败:",t),{success:!1,message:t.message}}},async getStorageUsage(){try{let a=0,t=0;const i=(await p.keys()).filter(s=>s.startsWith(this.CONFIG.STORAGE_KEY));for(const s of i){const n=await p.getItem(s)||[];t+=n.length;for(const o of n)o.dataUrl&&(a+=o.dataUrl.length*.75)}return{totalPhotos:t,totalSizeKB:Math.floor(a/1024),totalSizeMB:(a/1024/1024).toFixed(2)}}catch(a){return console.error("获取存储使用情况失败:",a),{totalPhotos:0,totalSizeKB:0,totalSizeMB:0}}},async cleanupLargePhotos(a=10){try{const t=await this.getStorageUsage(),e=a*1024*1024,i=t.totalSizeKB*1024;if(i<=e)return{success:!0,message:"存储使用正常，无需清理",cleanedCount:0,freedSizeKB:0};let s=[];const o=(await p.keys()).filter(l=>l.startsWith(this.CONFIG.STORAGE_KEY));for(const l of o){const w=await p.getItem(l)||[],h=l.replace(`${this.CONFIG.STORAGE_KEY}_`,"");for(const f of w)s.push({...f,storageKey:l,recordId:h})}s.sort((l,w)=>new Date(l.uploadedAt)-new Date(w.uploadedAt));let r=0,d=0;for(;s.length>0&&i-d*1024>e;){const l=s.shift();try{const h=(await this.getPhotos(l.recordId)).filter(M=>M.id!==l.id),f=`${this.CONFIG.STORAGE_KEY}_${l.recordId}`;await p.setItem(f,h),r++,d+=l.compressedSizeKB||50}catch(w){console.error(`清理照片失败: ${l.id}`,w)}}return{success:!0,message:`清理了 ${r} 张照片，释放了 ${d.toFixed(2)}KB 空间`,cleanedCount:r,freedSizeKB:d}}catch(t){return console.error("清理照片失败:",t),{success:!1,message:t.message}}},async exportPhotosAsBase64(a){return(await this.getPhotos(a)).map(e=>e.dataUrl)},async importBase64Photos(a,t){try{const e=[];let i=0;for(const n of t){const o=n.length-(n.indexOf(",")+1),r=n.endsWith("==")?2:n.endsWith("=")?1:0,d=Math.floor((o*.75-r)/1024),l={id:`photo_import_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,dataUrl:n,originalName:`imported_${i+1}.jpg`,originalSizeKB:d,compressedSizeKB:d,width:800,height:600,uploadedAt:new Date().toISOString(),recordId:a};if(e.push(l),i++,e.length>=this.CONFIG.MAX_PHOTOS_PER_RECORD){console.warn("已达到照片数量限制，停止导入");break}}const s=`${this.CONFIG.STORAGE_KEY}_${a}`;return await p.setItem(s,e),{success:!0,importedCount:i}}catch(e){return console.error("导入照片失败:",e),{success:!1,message:e.message}}}},m={async initStorage(){try{return p.config({name:"TravelNet",version:1,storeName:"travelnet_store",description:"TravelNet应用数据存储"}),console.log("IndexedDB存储初始化完成"),!0}catch(a){return console.error("存储初始化失败:",a),!1}},async loadCitiesData(){try{const t="/USTB_travelNet/data/cities.json".replace(/\/\//g,"/"),e=await fetch(t);if(!e.ok)throw new Error(`HTTP error! status: ${e.status}`);return c.cities=await e.json(),c.cities.forEach(i=>{i.distance=g.calculateDistance(u.centerLat,u.centerLng,i.lat,i.lng),i.bearing=g.calculateBearing(u.centerLat,u.centerLng,i.lat,i.lng)}),c.cities=x.filterPrefectureLevelCities(c.cities),c.filteredCities=c.cities.filter(i=>i.distance<=u.radiusKm),console.log(`加载了 ${c.cities.length} 个城市，其中 ${c.filteredCities.length} 个在500公里内`),await this.mergeCustomCities(),!0}catch(a){return console.error("加载城市数据失败:",a),await this.generateSampleData(),!1}},async generateSampleData(){console.log("使用示例数据");const a=[{id:"city_001",name:"北京市区",lat:39.9042,lng:116.4074,population:2154e4,description:"中国首都，政治文化中心。"},{id:"city_002",name:"天津市",lat:39.3434,lng:117.3616,population:1387e4,description:"北方重要港口城市。"},{id:"city_003",name:"石家庄市",lat:38.0428,lng:114.5149,population:1103e4,description:"河北省省会，华北重要城市。"},{id:"city_004",name:"唐山市",lat:39.6309,lng:118.1802,population:7718e3,description:"河北重要工业城市。"},{id:"city_005",name:"保定市",lat:38.874,lng:115.4646,population:9243e3,description:"历史文化名城。"},{id:"city_006",name:"张家口市",lat:40.8244,lng:114.8879,population:4118e3,description:"2022年冬奥会举办城市之一。"},{id:"city_007",name:"承德市",lat:40.9734,lng:117.9322,population:3354e3,description:"避暑山庄所在地。"},{id:"city_008",name:"秦皇岛市",lat:39.9354,lng:119.6005,population:3073e3,description:"著名海滨旅游城市。"},{id:"city_009",name:"廊坊市",lat:39.5219,lng:116.6856,population:4359e3,description:"京津之间的重要城市。"},{id:"city_010",name:"沧州市",lat:38.3045,lng:116.8388,population:6833e3,description:"武术之乡。"},{id:"city_011",name:"衡水市",lat:37.7389,lng:115.6702,population:4213e3,description:"教育名城。"},{id:"city_012",name:"邢台市",lat:37.0706,lng:114.5044,population:7111e3,description:"历史悠久的城市。"},{id:"city_013",name:"邯郸市",lat:36.6256,lng:114.5391,population:9414e3,description:"赵国古都。"},{id:"city_014",name:"大同市",lat:40.0768,lng:113.3001,population:3106e3,description:"山西北部重要城市，云冈石窟所在地。"},{id:"city_015",name:"朔州市",lat:39.3318,lng:112.4328,population:1535e3,description:"山西北部城市。"},{id:"city_016",name:"呼和浩特市",lat:40.8424,lng:111.748,population:3126e3,description:"内蒙古自治区首府。"},{id:"city_017",name:"包头市",lat:40.6574,lng:109.8403,population:2709e3,description:"内蒙古重要工业城市。"},{id:"city_018",name:"锡林浩特市",lat:43.9332,lng:116.086,population:26e4,description:"锡林郭勒盟中心城市。"},{id:"city_019",name:"沈阳市",lat:41.8057,lng:123.4315,population:8106e3,description:"辽宁省省会，东北重要城市。"},{id:"city_020",name:"大连市",lat:38.9137,lng:121.6147,population:7451e3,description:"著名海滨城市。"}];c.cities=a.map(t=>{const e=g.calculateDistance(u.centerLat,u.centerLng,t.lat,t.lng),i=g.calculateBearing(u.centerLat,u.centerLng,t.lat,t.lng);return{...t,distance:e,bearing:i}}),c.filteredCities=c.cities.filter(t=>t.distance<=u.radiusKm)},async migratePhotosToPhotoManager(){try{let a=0;for(const t of c.travelRecords)if(t.photos&&Array.isArray(t.photos)&&t.photos.length>0){console.log(`迁移记录 ${t.id} 的照片 (${t.photos.length} 张)`);const e=await b.importBase64Photos(t.id,t.photos);e.success?(console.log(`已迁移 ${e.importedCount} 张照片`),a+=e.importedCount,delete t.photos):console.warn(`照片迁移失败: ${e.message}`)}return a>0&&(console.log(`照片迁移完成，共迁移 ${a} 张照片`),await this.saveUserData()),a}catch(a){return console.error("照片迁移失败:",a),0}},async loadUserData(){try{const a=await p.getItem(u.storageKeys.visitedCities)||[];return c.visitedCities=new Set(a),c.travelRecords=await p.getItem(u.storageKeys.travelRecords)||[],console.log("用户数据加载完成"),await this.migratePhotosToPhotoManager(),this.updateUIFromState(),!0}catch(a){return console.error("加载用户数据失败:",a),!1}},async saveUserData(){try{return await p.setItem(u.storageKeys.visitedCities,Array.from(c.visitedCities)),await p.setItem(u.storageKeys.travelRecords,c.travelRecords),console.log("用户数据保存完成"),!0}catch(a){return console.error("保存用户数据失败:",a),!1}},updateUIFromState(){const a=document.getElementById("cityCount");a&&(a.textContent=c.filteredCities.length),this.updateStorageUsage()},async updateStorageUsage(){try{let a=0;const t=await p.keys();for(const i of t){const s=await p.getItem(i);s&&(a+=JSON.stringify(s).length)}const e=document.getElementById("storageUsage");if(e){const i=(a/1024).toFixed(2);e.textContent=`本地存储: ${i} KB`}}catch(a){console.error("计算存储使用情况失败:",a)}},async loadCustomCities(){try{const a=await p.getItem(u.storageKeys.customCities)||[];return console.log(`加载了 ${a.length} 个自定义城市`),a}catch(a){return console.error("加载自定义城市失败:",a),[]}},async saveCustomCities(a){try{return await p.setItem(u.storageKeys.customCities,a),console.log(`保存了 ${a.length} 个自定义城市`),!0}catch(t){return console.error("保存自定义城市失败:",t),!1}},getCustomCities(){return[]},async addCustomCity(a){try{if(!a.name||!a.lat||!a.lng)throw new Error("城市名称、纬度和经度为必填项");const t=parseFloat(a.lat),e=parseFloat(a.lng);if(isNaN(t)||t<-90||t>90||isNaN(e)||e<-180||e>180)throw new Error("无效的坐标值：纬度必须在-90到90之间，经度必须在-180到180之间");const i=await this.loadCustomCities(),s=`custom_city_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,n=g.calculateDistance(u.centerLat,u.centerLng,t,e),o=g.calculateBearing(u.centerLat,u.centerLng,t,e),r={id:s,name:a.name.trim(),lat:t,lng:e,population:parseInt(a.population)||0,description:a.description||"",distance:n,bearing:o,isCustom:!0,addedDate:new Date().toISOString()};return i.push(r),await this.saveCustomCities(i),await this.mergeCustomCities(),console.log(`成功添加自定义城市: ${r.name}`),{success:!0,city:r}}catch(t){return console.error("添加自定义城市失败:",t),{success:!1,message:t.message}}},async mergeCustomCities(){try{const a=await this.loadCustomCities();if(a.length===0)return;const t=new Set(c.cities.map(i=>i.id)),e=a.filter(i=>!t.has(i.id));return e.length===0?void 0:(c.cities.push(...e),c.filteredCities=c.cities.filter(i=>i.distance<=u.radiusKm),console.log(`合并了 ${e.length} 个自定义城市到应用状态`),this.updateUIFromState(),!0)}catch(a){return console.error("合并自定义城市失败:",a),!1}}},U={init(){const a=localStorage.getItem(u.auth.storageKey);a&&this.validateToken(a)?(c.authToken=a,c.isAuthenticated=!0,c.authUsername="项目所有者",console.log("认证状态已恢复")):(localStorage.removeItem(u.auth.storageKey),c.authToken=null,c.isAuthenticated=!1,c.authUsername="未登录用户")},validateToken(a){return a&&a.trim().length>0},login(a){if(!u.auth.password||u.auth.password.trim()==="")return console.error("认证密码未配置：请设置环境变量 VITE_AUTH_PASSWORD"),{success:!1,message:"系统配置错误：认证密码未配置。请检查环境变量设置。"};if(a===u.auth.password){const t=`travelnet_auth_${Date.now()}_${Math.random().toString(36).substr(2)}`;return localStorage.setItem(u.auth.storageKey,t),c.authToken=t,c.isAuthenticated=!0,c.authUsername="项目所有者",window.UIManager&&typeof window.UIManager.updateAuthUI=="function"&&window.UIManager.updateAuthUI(),window.dispatchEvent(new CustomEvent("auth:login")),console.log("登录成功"),{success:!0,message:"登录成功"}}else return console.log("登录失败：密码错误"),{success:!1,message:"密码错误"}},logout(){return localStorage.removeItem(u.auth.storageKey),c.authToken=null,c.isAuthenticated=!1,c.authUsername="未登录用户",window.UIManager&&typeof window.UIManager.updateAuthUI=="function"&&window.UIManager.updateAuthUI(),window.dispatchEvent(new CustomEvent("auth:logout")),console.log("已退出登录"),{success:!0,message:"已退出登录"}},isAuthenticated(){return c.isAuthenticated},getAuthStatus(){return{isAuthenticated:c.isAuthenticated,username:c.authUsername}}},y={showSelectedCityInfo(a){var r;const t=document.getElementById("selectedCityName"),e=document.getElementById("selectedCityDistance"),i=document.getElementById("selectedCityBearing"),s=document.getElementById("selectedCityPopulation"),n=document.getElementById("selectedCityDescription"),o=document.getElementById("selectedCityInfo");t&&e&&i&&s&&n&&o&&(t.textContent=a.name,e.textContent=`${a.distance.toFixed(1)} km`,i.textContent=`${Math.round(a.bearing)}°`,s.textContent=((r=a.population)==null?void 0:r.toLocaleString())||"N/A",n.textContent=a.description,o.style.display="block")},hideSelectedCityInfo(){const a=document.getElementById("selectedCityInfo");a&&(a.style.display="none")},confirmSelectedCity(){if(!c.selectedCity)return;if(!c.isAuthenticated){this.showNotification("此操作需要登录。请先登录以编辑内容。","warning");return}const a=c.selectedCity;if(!confirm(`确定要将 ${a.name} 添加到旅游记录吗？`))return;c.visitedCities.add(a.id);const t={id:`record_${Date.now()}`,cityId:a.id,cityName:a.name,distance:a.distance,visitDate:new Date().toISOString().split("T")[0],thoughts:"",photos:[]};c.travelRecords.unshift(t),m.saveUserData(),this.hideSelectedCityInfo(),this.showNotification(`已添加 ${a.name} 到旅游记录`,"success"),c.selectedCity=null},cancelSelectedCity(){c.selectedCity&&(this.hideSelectedCityInfo(),c.selectedCity=null,this.showNotification("已取消选择","info"))},showNotification(a,t="info"){const e=document.createElement("div");e.className=`notification notification-${t}`,e.innerHTML=`
      <i class="fas fa-${t==="success"?"check-circle":t==="warning"?"exclamation-triangle":"info-circle"}"></i>
      <span>${a}</span>
    `,document.body.appendChild(e),setTimeout(()=>{e.classList.add("show")},10),setTimeout(()=>{e.classList.remove("show"),setTimeout(()=>{e.parentNode&&e.parentNode.removeChild(e)},300)},3e3)},handleExportData(){const a={visitedCities:Array.from(c.visitedCities),travelRecords:c.travelRecords,exportDate:new Date().toISOString()},t=JSON.stringify(a,null,2),e=new Blob([t],{type:"application/json"}),i=URL.createObjectURL(e),s=document.createElement("a");s.href=i,s.download=`travelnet_data_${new Date().toISOString().split("T")[0]}.json`,document.body.appendChild(s),s.click(),document.body.removeChild(s),URL.revokeObjectURL(i),this.showNotification("数据导出成功","success")},handleImportData(){if(!c.isAuthenticated){this.showNotification("此操作需要登录。请先登录以编辑内容。","warning");return}const a=document.createElement("input");a.type="file",a.accept="application/json",a.onchange=async t=>{const e=t.target.files[0];if(e)try{const i=await e.text(),s=JSON.parse(i);if(!s.visitedCities||!s.travelRecords)throw new Error("无效的数据格式");if(!confirm("导入数据将覆盖当前所有旅行记录。确定要继续吗？"))return;c.visitedCities=new Set(s.visitedCities||[]),c.travelRecords=s.travelRecords||[],await m.saveUserData(),this.showNotification("数据导入成功","success")}catch(i){console.error("导入数据失败:",i),this.showNotification("导入失败：文件格式无效","danger")}},a.click()},handleHelp(){alert(`TravelNet 使用帮助：
    
1. 查看模式：所有用户都可以查看城市网络和旅行记录
2. 编辑模式：只有认证用户（项目所有者）可以添加城市、编辑记录等
3. 随机选择：点击"随机选择"按钮选择一个未访问的城市
4. 确认访问：选中城市后点击"确认访问"添加到旅行记录
5. 数据管理：支持导出/导入JSON格式的数据

项目地址：https://github.com/xinyvpeng/USTB_travelNet
`)},zoomIn(){c.networkGraph&&(c.zoomLevel=Math.min(c.zoomLevel*1.2,5),c.networkGraph.updateZoom(c.zoomLevel))},zoomOut(){c.networkGraph&&(c.zoomLevel=Math.max(c.zoomLevel/1.2,.5),c.networkGraph.updateZoom(c.zoomLevel))},resetView(){c.zoomLevel=1,c.networkGraph&&c.networkGraph.updateZoom(c.zoomLevel)},selectRandomCity(){const a=c.filteredCities.filter(i=>!c.visitedCities.has(i.id));if(a.length===0){this.showNotification("没有可用的城市了！","warning");return}const t=Math.floor(Math.random()*a.length),e=a[t];c.selectedCity=e,this.showSelectedCityInfo(e),c.networkGraph&&c.networkGraph.highlightCity(e.id),this.showNotification(`随机选择了: ${e.name}`,"info")},updateAuthUI(){const a=document.getElementById("authStatus"),t=document.getElementById("loginBtn"),e=document.getElementById("logoutBtn");c.isAuthenticated?(a&&(a.textContent="已登录 (项目所有者)",a.className="auth-status authenticated"),t&&(t.style.display="none"),e&&(e.style.display="inline-block")):(a&&(a.textContent="未登录 (只读模式)",a.className="auth-status not-authenticated"),t&&(t.style.display="inline-block"),e&&(e.style.display="none"))}},G={svg:null,width:0,height:0,center:{x:0,y:0},maxRadius:0,scale:1,nodes:[],links:[],init(a){const t=document.getElementById(a);if(!t){console.error("网络图容器不存在:",a);return}this.width=t.clientWidth,this.height=t.clientHeight,this.center={x:this.width/2,y:this.height/2},this.maxRadius=Math.min(this.width,this.height)*.4,this.svg=C(`#${a}`).append("svg").attr("width",this.width).attr("height",this.height).attr("viewBox",`0 0 ${this.width} ${this.height}`).style("background-color","transparent"),this.zoomGroup=this.svg.append("g").attr("class","zoom-group"),this.linksGroup=this.zoomGroup.append("g").attr("class","links"),this.nodesGroup=this.zoomGroup.append("g").attr("class","nodes"),this.centerGroup=this.zoomGroup.append("g").attr("class","center-point");const e=_().scaleExtent([.5,5]).translateExtent([[-this.width*.5,-this.height*.5],[this.width*1.5,this.height*1.5]]).on("zoom",i=>{this.zoomGroup.attr("transform",i.transform),c.zoomLevel=i.transform.k});this.svg.call(e),this.drawCenterPoint(),this.updateData(),window.addEventListener("resize",()=>this.handleResize()),console.log("D3网络图初始化完成")},drawCenterPoint(){this.centerGroup.selectAll("*").remove(),this.centerGroup.append("circle").attr("cx",this.center.x).attr("cy",this.center.y).attr("r",10).attr("fill","#00e0ff").attr("opacity",.9).style("filter","url(#glow)"),this.centerGroup.append("circle").attr("cx",this.center.x).attr("cy",this.center.y).attr("r",20).attr("fill","none").attr("stroke","#00e0ff").attr("stroke-width",2).attr("opacity",.5).style("filter","url(#glow)");const a=this.centerGroup.append("circle").attr("cx",this.center.x).attr("cy",this.center.y).attr("r",15).attr("fill","none").attr("stroke","#00e0ff").attr("stroke-width",1).attr("opacity",0).style("filter","url(#glow)"),t=function(){C(this).attr("r",15).attr("opacity",0).transition().duration(2e3).ease(k).attr("r",40).attr("opacity",0).on("end",t)};a.transition().duration(2e3).ease(k).attr("r",40).attr("opacity",0).on("end",t);const i=this.svg.append("defs").append("filter").attr("id","glow").attr("x","-50%").attr("y","-50%").attr("width","200%").attr("height","200%");i.append("feGaussianBlur").attr("stdDeviation","3").attr("result","coloredBlur");const s=i.append("feMerge");s.append("feMergeNode").attr("in","coloredBlur"),s.append("feMergeNode").attr("in","SourceGraphic")},updateData(){if(!c.filteredCities||c.filteredCities.length===0){console.warn("没有城市数据可渲染");return}this.nodes=c.filteredCities.map(a=>{const t=g.polarToCartesian(a.distance,a.bearing,this.maxRadius,this.scale);return{id:a.id,name:a.name,distance:a.distance,bearing:a.bearing,population:a.population,x:this.center.x+t.x,y:this.center.y+t.y,radius:this.calculateNodeRadius(a),color:this.calculateNodeColor(a.distance),isVisited:c.visitedCities.has(a.id)}}),this.links=this.nodes.map(a=>({source:this.center,target:{x:a.x,y:a.y},distance:a.distance})),this.render()},calculateNodeRadius(a){const e=a.population?Math.log10(a.population)/10:1;return Math.max(5,Math.min(15,8*e))},calculateNodeColor(a){const t=u.radiusKm,e=a/t,i=Math.round(0+e*157),s=Math.round(224+e*-146),n=Math.round(255+e*-34);return`rgb(${i}, ${s}, ${n})`},render(){const a=this.linksGroup.selectAll("line").data(this.links,i=>`${i.source.x},${i.source.y}-${i.target.x},${i.target.y}`);a.enter().append("line").attr("x1",i=>i.source.x).attr("y1",i=>i.source.y).attr("x2",i=>i.target.x).attr("y2",i=>i.target.y).attr("stroke",i=>this.calculateLinkColor(i.distance)).attr("stroke-width",1).attr("stroke-opacity",.3).style("filter","url(#glow)"),a.attr("x1",i=>i.source.x).attr("y1",i=>i.source.y).attr("x2",i=>i.target.x).attr("y2",i=>i.target.y),a.exit().remove();const t=this.nodesGroup.selectAll("g.node").data(this.nodes,i=>i.id),e=t.enter().append("g").attr("class","node").attr("transform",i=>`translate(${i.x}, ${i.y})`).style("cursor","pointer");e.append("circle").attr("r",i=>i.radius).attr("fill",i=>i.color).attr("opacity",.8).style("filter","url(#glow)"),e.append("text").attr("text-anchor","middle").attr("dy",i=>i.radius+12).attr("fill","#f0f4ff").attr("font-size","8px").attr("font-weight","bold").text(i=>i.name).style("pointer-events","none"),t.attr("transform",i=>`translate(${i.x}, ${i.y})`),t.exit().remove(),this.nodesGroup.selectAll("g.node").on("mouseover",(i,s)=>this.handleNodeHover(i,s)).on("mouseout",()=>this.handleNodeOut()).on("click",(i,s)=>this.handleNodeClick(i,s))},calculateLinkColor(a){const t=u.radiusKm,e=a/t,i=Math.round(0+e*157),s=Math.round(224+e*-146),n=Math.round(255+e*-34);return`rgb(${i}, ${s}, ${n})`},handleNodeHover(a,t){C(a.currentTarget).select("circle").transition().duration(200).attr("r",t.radius*1.3).attr("opacity",1),this.linksGroup.selectAll("line").filter(e=>e.target.x===t.x&&e.target.y===t.y).transition().duration(200).attr("stroke-width",3).attr("stroke-opacity",.8)},handleNodeOut(){this.nodesGroup.selectAll("circle").transition().duration(200).attr("r",a=>a.radius).attr("opacity",.8),this.linksGroup.selectAll("line").transition().duration(200).attr("stroke-width",1).attr("stroke-opacity",.3)},handleNodeClick(a,t){const e=c.filteredCities.find(i=>i.id===t.id);e&&(c.selectedCity=e,window.UIManager&&typeof window.UIManager.showSelectedCityInfo=="function"&&window.UIManager.showSelectedCityInfo(e))},highlightCity(a){this.nodesGroup.selectAll("circle").attr("r",e=>e.radius).attr("opacity",.8);const t=this.nodesGroup.selectAll("g.node").filter(e=>e.id===a);t.select("circle").transition().duration(300).attr("r",e=>e.radius*1.5).attr("opacity",1),t.append("circle").attr("r",e=>e.radius*1.5).attr("fill","none").attr("stroke","#ffcc00").attr("stroke-width",2).attr("opacity",.8).transition().duration(1e3).attr("r",e=>e.radius*3).attr("opacity",0).remove()},highlightCities(a){this.nodesGroup.selectAll("circle").attr("r",t=>t.radius).attr("opacity",.3),this.nodesGroup.selectAll("g.node").filter(t=>a.includes(t.id)).select("circle").transition().duration(300).attr("opacity",1)},updateZoom(a){this.scale=a,this.updateData()},handleResize(){const a=document.getElementById("networkGraph");a&&(this.width=a.clientWidth,this.height=a.clientHeight,this.center={x:this.width/2,y:this.height/2},this.maxRadius=Math.min(this.width,this.height)*.35,this.svg.attr("width",this.width).attr("height",this.height).attr("viewBox",`0 0 ${this.width} ${this.height}`),this.updateData())}},K={network:{view:T,name:"网络图",icon:"fa-network-wired"},cities:{view:q,name:"城市列表",icon:"fa-city"},records:{view:L,name:"旅游记录",icon:"fa-passport"},data:{view:z,name:"数据管理",icon:"fa-database"},settings:{view:F,name:"设置",icon:"fa-cog"}};let H=null;async function R(){console.log("TravelNet应用初始化...");const a=document.getElementById("loadingOverlay");a&&(a.style.display="flex");try{await m.initStorage(),await b.init(),U.init(),await m.loadCitiesData(),await m.loadUserData(),H=new O(K,"network"),V(),W(),y.updateAuthUI(),a&&(a.style.display="none"),console.log("TravelNet应用初始化完成！"),setTimeout(()=>{y.showNotification(`欢迎使用TravelNet！已加载 ${c.filteredCities.length} 个城市`,"success")},1e3)}catch(t){console.error("应用初始化失败:",t),a&&(a.style.display="none"),y.showNotification("应用初始化失败，请刷新页面重试","danger")}}function V(){function a(){const e=document.querySelectorAll(".nav-link"),i=window.location.hash.substring(1)||"network";e.forEach(n=>n.classList.remove("active"));const s=document.querySelector(`.nav-link[data-route="${i}"]`);if(s){s.classList.add("active");const n=s.querySelector("span").textContent,o=document.getElementById("currentViewName");o&&(o.textContent=n)}}a(),window.addEventListener("hashchange",a),document.querySelectorAll(".nav-link").forEach(e=>{e.addEventListener("click",()=>{setTimeout(a,10)})})}function W(){const a=document.getElementById("loginBtn"),t=document.getElementById("logoutBtn");console.log("绑定认证事件，登录按钮:",a,"登出按钮:",t),a&&a.addEventListener("click",()=>{console.log("登录按钮被点击，跳转到设置页面"),window.location.hash="settings"}),t&&t.addEventListener("click",()=>{console.log("登出按钮被点击"),U.logout(),y.updateAuthUI(),y.showNotification("已退出登录","info")})}window.AppState=c;window.DataManager=m;window.UIManager=y;window.AuthManager=U;window.CONFIG=u;window.GeoUtils=g;window.NetworkGraph=G;window.CityValidator=x;window.PhotoManager=b;document.readyState==="loading"?document.addEventListener("DOMContentLoaded",R):R();
//# sourceMappingURL=index-DsvrM-Lo.js.map
