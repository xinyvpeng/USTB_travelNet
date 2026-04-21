// D3网络图管理器
// 负责城市网络的可视化渲染和交互

import * as d3 from 'd3';
import { CONFIG } from '../config.js';
import { AppState } from '../state/app-state.js';
import { GeoUtils } from '../utils/geo.js';

export const NetworkGraph = {
  svg: null,
  width: 0,
  height: 0,
  center: { x: 0, y: 0 },
  maxRadius: 0,
  scale: 1,
  nodes: [],
  links: [],
  
  // 初始化网络图
  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('网络图容器不存在:', containerId);
      return;
    }
    
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    this.center = { x: this.width / 2, y: this.height / 2 };
    this.maxRadius = Math.min(this.width, this.height) * 0.4;
    
    // 创建SVG
    this.svg = d3.select(`#${containerId}`)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .style('background-color', 'transparent');
    
    // 创建缩放组
    this.zoomGroup = this.svg.append('g')
      .attr('class', 'zoom-group');
    
    // 创建连线容器
    this.linksGroup = this.zoomGroup.append('g')
      .attr('class', 'links');
    
    // 创建节点容器
    this.nodesGroup = this.zoomGroup.append('g')
      .attr('class', 'nodes');
    
    // 创建中心点
    this.centerGroup = this.zoomGroup.append('g')
      .attr('class', 'center-point');
    
    // 添加缩放行为
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .translateExtent([[-this.width * 0.5, -this.height * 0.5], [this.width * 1.5, this.height * 1.5]])
      .on('zoom', (event) => {
        this.zoomGroup.attr('transform', event.transform);
        AppState.zoomLevel = event.transform.k;
      });
    
    this.svg.call(zoom);
    
    // 绘制中心点
    this.drawCenterPoint();
    
    // 初始渲染
    this.updateData();
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => this.handleResize());
    
    console.log('D3网络图初始化完成');
  },
  
  // 绘制中心点
  drawCenterPoint() {
    this.centerGroup.selectAll('*').remove();
    
    // 中心点
    this.centerGroup.append('circle')
      .attr('cx', this.center.x)
      .attr('cy', this.center.y)
      .attr('r', 10)
      .attr('fill', '#00e0ff')
      .attr('opacity', 0.9)
      .style('filter', 'url(#glow)');
    
    // 光环效果
    this.centerGroup.append('circle')
      .attr('cx', this.center.x)
      .attr('cy', this.center.y)
      .attr('r', 20)
      .attr('fill', 'none')
      .attr('stroke', '#00e0ff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.5)
      .style('filter', 'url(#glow)');
    
    // 脉冲动画
    const pulseCircle = this.centerGroup.append('circle')
      .attr('cx', this.center.x)
      .attr('cy', this.center.y)
      .attr('r', 15)
      .attr('fill', 'none')
      .attr('stroke', '#00e0ff')
      .attr('stroke-width', 1)
      .attr('opacity', 0)
      .style('filter', 'url(#glow)');
    
    // 定义脉冲动画函数
    const pulseAnimation = function() {
      d3.select(this)
        .attr('r', 15)
        .attr('opacity', 0)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr('r', 40)
        .attr('opacity', 0)
        .on('end', pulseAnimation);
    };
    
    // 开始脉冲动画
    pulseCircle
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr('r', 40)
      .attr('opacity', 0)
      .on('end', pulseAnimation);
    
    // 添加发光滤镜
    const defs = this.svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'coloredBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');
  },
  
  // 更新数据
  updateData() {
    if (!AppState.filteredCities || AppState.filteredCities.length === 0) {
      console.warn('没有城市数据可渲染');
      return;
    }
    
    // 创建节点数据
    this.nodes = AppState.filteredCities.map(city => {
      const pos = GeoUtils.polarToCartesian(
        city.distance,
        city.bearing,
        this.maxRadius,
        this.scale
      );
      
      return {
        id: city.id,
        name: city.name,
        distance: city.distance,
        bearing: city.bearing,
        population: city.population,
        x: this.center.x + pos.x,
        y: this.center.y + pos.y,
        radius: this.calculateNodeRadius(city),
        color: this.calculateNodeColor(city.distance),
        isVisited: AppState.visitedCities.has(city.id)
      };
    });
    
    // 创建连线数据（从中心点到每个节点）
    this.links = this.nodes.map(node => ({
      source: this.center,
      target: { x: node.x, y: node.y },
      distance: node.distance
    }));
    
    // 渲染
    this.render();
  },
  
  // 计算节点半径
  calculateNodeRadius(city) {
    // 根据人口调整半径，但限制在5-15像素之间
    const baseRadius = 8;
    const populationFactor = city.population ? Math.log10(city.population) / 10 : 1;
    return Math.max(5, Math.min(15, baseRadius * populationFactor));
  },
  
  // 计算节点颜色
  calculateNodeColor(distance) {
    // 根据距离调整颜色：近处为蓝色，远处为紫色
    const maxDistance = CONFIG.radiusKm;
    const t = distance / maxDistance;
    
    // 从蓝色 (#00e0ff) 到紫色 (#9d4edd)
    const r = Math.round(0 + t * 157);
    const g = Math.round(224 + t * (78 - 224));
    const b = Math.round(255 + t * (221 - 255));
    
    return `rgb(${r}, ${g}, ${b})`;
  },
  
  // 渲染网络图
  render() {
    // 渲染连线
    const links = this.linksGroup.selectAll('line')
      .data(this.links, d => `${d.source.x},${d.source.y}-${d.target.x},${d.target.y}`);
    
    links.enter()
      .append('line')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('stroke', d => this.calculateLinkColor(d.distance))
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.3)
      .style('filter', 'url(#glow)');
    
    links.attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    
    links.exit().remove();
    
    // 渲染节点
    const nodes = this.nodesGroup.selectAll('g.node')
      .data(this.nodes, d => d.id);
    
    const nodeEnter = nodes.enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer');
    
    // 节点圆圈
    nodeEnter.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('opacity', 0.8)
      .style('filter', 'url(#glow)');
    
    // 节点标签
    nodeEnter.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.radius + 12)
      .attr('fill', '#f0f4ff')
      .attr('font-size', '8px')
      .attr('font-weight', 'bold')
      .text(d => d.name)
      .style('pointer-events', 'none');
    
    // 更新节点位置
    nodes.attr('transform', d => `translate(${d.x}, ${d.y})`);
    
    // 移除多余节点
    nodes.exit().remove();
    
    // 添加交互事件
    this.nodesGroup.selectAll('g.node')
      .on('mouseover', (event, d) => this.handleNodeHover(event, d))
      .on('mouseout', () => this.handleNodeOut())
      .on('click', (event, d) => this.handleNodeClick(event, d));
  },
  
  // 计算连线颜色
  calculateLinkColor(distance) {
    const maxDistance = CONFIG.radiusKm;
    const t = distance / maxDistance;
    
    // 从蓝色到紫色
    const r = Math.round(0 + t * 157);
    const g = Math.round(224 + t * (78 - 224));
    const b = Math.round(255 + t * (221 - 255));
    
    return `rgb(${r}, ${g}, ${b})`;
  },
  
  // 节点悬停处理
  handleNodeHover(event, node) {
    // 高亮节点
    d3.select(event.currentTarget).select('circle')
      .transition()
      .duration(200)
      .attr('r', node.radius * 1.3)
      .attr('opacity', 1);
    
    // 高亮连线
    this.linksGroup.selectAll('line')
      .filter(d => d.target.x === node.x && d.target.y === node.y)
      .transition()
      .duration(200)
      .attr('stroke-width', 3)
      .attr('stroke-opacity', 0.8);
  },
  
  // 节点离开处理
  handleNodeOut() {
    // 恢复节点大小
    this.nodesGroup.selectAll('circle')
      .transition()
      .duration(200)
      .attr('r', d => d.radius)
      .attr('opacity', 0.8);
    
    // 恢复连线
    this.linksGroup.selectAll('line')
      .transition()
      .duration(200)
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.3);
  },
  
  // 节点点击处理
  handleNodeClick(event, node) {
    const city = AppState.filteredCities.find(c => c.id === node.id);
    if (city) {
      AppState.selectedCity = city;
      // 通过全局UIManager显示选中城市信息
      if (window.UIManager && typeof window.UIManager.showSelectedCityInfo === 'function') {
        window.UIManager.showSelectedCityInfo(city);
      }
    }
  },
  
  // 高亮特定城市
  highlightCity(cityId) {
    // 重置所有节点
    this.nodesGroup.selectAll('circle')
      .attr('r', d => d.radius)
      .attr('opacity', 0.8);
    
    // 高亮目标节点
    const targetNode = this.nodesGroup.selectAll('g.node')
      .filter(d => d.id === cityId);
    
    targetNode.select('circle')
      .transition()
      .duration(300)
      .attr('r', d => d.radius * 1.5)
      .attr('opacity', 1);
    
    // 脉冲动画
    targetNode.append('circle')
      .attr('r', d => d.radius * 1.5)
      .attr('fill', 'none')
      .attr('stroke', '#ffcc00')
      .attr('stroke-width', 2)
      .attr('opacity', 0.8)
      .transition()
      .duration(1000)
      .attr('r', d => d.radius * 3)
      .attr('opacity', 0)
      .remove();
  },
  
  // 高亮多个城市
  highlightCities(cityIds) {
    // 重置所有节点
    this.nodesGroup.selectAll('circle')
      .attr('r', d => d.radius)
      .attr('opacity', 0.3);
    
    // 高亮匹配节点
    this.nodesGroup.selectAll('g.node')
      .filter(d => cityIds.includes(d.id))
      .select('circle')
      .transition()
      .duration(300)
      .attr('opacity', 1);
  },
  
  // 更新缩放
  updateZoom(scale) {
    this.scale = scale;
    this.updateData();
  },
  
  // 处理窗口大小变化
  handleResize() {
    const container = document.getElementById('networkGraph');
    if (!container) return;
    
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    this.center = { x: this.width / 2, y: this.height / 2 };
    this.maxRadius = Math.min(this.width, this.height) * 0.35;
    
    this.svg
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);
    
    this.updateData();
  }
};