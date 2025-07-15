<template>
  <div class="about">
    <div class="container">
      <h1 class="title">数据可视化分析系统</h1>
      <p class="subtitle">基于Vue3 + ECharts的时序数据分析平台</p>

      <div class="content-section">
        <h2>项目概述</h2>
        <p>本系统是一个时序数据可视化分析平台，支持Excel数据导入、多种数据运算、峰值检测、区间分析等功能。</p>
      </div>

      <div class="content-section">
        <h2>核心算法介绍</h2>

        <div class="algorithm-card">
          <h3>LTTB降采样算法 (Largest-Triangle-Three-Buckets)</h3>
          <div class="algorithm-content">
            <h4>算法原理</h4>
            <p>LTTB是一种高效的时序数据降采样算法，通过计算三角形面积来选择最具代表性的数据点。该算法能够在大幅减少数据点数量的同时，最大程度保持原始数据的形状特征和趋势。</p>

            <h4>核心步骤</h4>
            <ol>
              <li><strong>分桶策略</strong>：将数据均匀分成若干个桶（bucket）</li>
              <li><strong>三角形计算</strong>：对于每个桶，计算与前后相邻点形成的三角形面积</li>
              <li><strong>最大面积选择</strong>：选择形成最大三角形面积的点作为该桶的代表点</li>
              <li><strong>保留关键点</strong>：始终保留首尾数据点</li>
            </ol>

            <h4>应用场景</h4>
            <ul>
              <li>大规模时序数据的实时可视化</li>
              <li>图表缩放时的动态采样</li>
              <li>提升渲染性能同时保持数据特征</li>
            </ul>

            <div class="code-example">
              <h4>算法特点</h4>
              <div class="feature-grid">
                <div class="feature-item">
                  <span class="feature-icon">⚡</span>
                  <div>
                    <strong>高性能</strong>
                    <p>时间复杂度O(n)，适合实时处理</p>
                  </div>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🎯</span>
                  <div>
                    <strong>特征保持</strong>
                    <p>有效保留数据的峰值和趋势</p>
                  </div>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">📈</span>
                  <div>
                    <strong>视觉友好</strong>
                    <p>降采样后的曲线视觉效果优异</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="algorithm-card">
          <h3>AMPD峰值检测算法 (Automatic Multiscale-based Peak Detection)</h3>
          <div class="algorithm-content">
            <h4>算法原理</h4>
            <p>AMPD是一种基于多尺度分析的自动峰值检测算法，能够在无需预设参数的情况下，自动检测时序数据中的局部最大值。</p>

            <h4>核心步骤</h4>
            <ol>
              <li><strong>多尺度扫描</strong>：在不同的窗口尺度下扫描数据</li>
              <li><strong>局部最大值检测</strong>：在每个尺度下标识局部最大值</li>
              <li><strong>多尺度对比</strong>：选择不同尺度下都被检测为波峰的值作为结果</li>
            </ol>

            <h4>算法优势</h4>
            <ul>
              <li><strong>无参数设定</strong>：算法自动确定检测参数，无需人工调优</li>
              <li><strong>多尺度分析</strong>：能够检测不同宽度和高度的峰值</li>
            </ul>

          </div>
        </div>

        <div class="algorithm-card">
          <h3>数值微分算法</h3>
          <div class="algorithm-content">
            <h4>算法原理</h4>
            <p>采用中心差分法实现数值微分，通过计算相邻数据点的斜率来估算函数的导数。该方法在保持计算简单性的同时，提供了良好的数值稳定性。</p>

            <h4>核心公式</h4>
            <div class="formula">
              <p><strong>五点中心差分：</strong> f'(x) = [f(x-2h)-8f(x-h)+8f(x+h)-f(x+2h)] / 12h </p>
              <p><strong>边界处理：</strong> 首尾点采用前向/后向差分</p>
            </div>

            <h4>平滑处理</h4>
            <p>系统集成了移动平均平滑算法，用于减少微分过程中的噪声放大效应：</p>
            <ul>
              <li>采用自适应窗口大小的移动平均</li>
              <li>窗口大小基于采样频率调整</li>
              <li>有效抑制高频噪声的影响</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.title {
  text-align: center;
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 600;
}

.subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 40px;
}

.content-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.content-section h2 {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 20px;
  border-bottom: 3px solid #3498db;
  padding-bottom: 10px;
}

.algorithm-card {
  background: #f8fafe;
  border: 1px solid #e3f2fd;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 25px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.algorithm-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.algorithm-card h3 {
  color: #1976d2;
  font-size: 1.4rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.algorithm-card .icon {
  margin-right: 10px;
  font-size: 1.2em;
}

.algorithm-content h4 {
  color: #424242;
  font-size: 1.1rem;
  margin: 20px 0 10px 0;
  font-weight: 600;
}

.algorithm-content p {
  line-height: 1.6;
  color: #666;
  margin-bottom: 15px;
}

.algorithm-content ol,
.algorithm-content ul {
  padding-left: 20px;
  margin-bottom: 15px;
}

.algorithm-content li {
  line-height: 1.6;
  color: #666;
  margin-bottom: 8px;
}

.algorithm-content li strong {
  color: #2c3e50;
}

.code-example {
  background: #f5f5f5;
  border-left: 4px solid #3498db;
  padding: 15px;
  margin-top: 20px;
  border-radius: 0 8px 8px 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.feature-icon {
  font-size: 1.5rem;
  margin-right: 12px;
  flex-shrink: 0;
}

.feature-item strong {
  color: #2c3e50;
  display: block;
  margin-bottom: 5px;
}

.feature-item p {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.formula {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 15px;
  margin: 15px 0;
}

.formula p {
  margin: 5px 0;
  font-family: 'Courier New', monospace;
  color: #856404;
}

.tech-stack {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.tech-category h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.tech-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-item {
  background: #3498db;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.feature-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.feature-card .feature-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
  display: block;
}

.feature-card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.feature-card p {
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.version-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid #28a745;
}

.version-info p {
  margin: 8px 0;
  color: #495057;
}

.version-info strong {
  color: #212529;
}

</style>