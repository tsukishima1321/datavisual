<template>
  <div class="chartwrapper">
    <div class="control-panel">
      <el-upload class="upload-demo" drag :auto-upload="false" accept=".xlsx, .xls" v-model:file-list="fileList"
        :limit="1" :on-change="handleFileChange" :on-remove="handleRemove">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖曳或 <em>点击上传excel文件</em>
        </div>
      </el-upload>
      <ElCollapse expand-icon-position="left">
        <ElCollapseItem title='数据列选择'>
          <div class="transfer-panel">
            <ElButton type="primary" @click="selectDataSerie">从表格中添加数据列</ElButton>
            <el-transfer v-model="selectedSeries" :data="series" :titles="['可选数据列', '已选数据列']" />
          </div>
          <ElButton type="primary" @click="fillChart">更新图表</ElButton>
        </ElCollapseItem>
        <ElCollapseItem title='显示范围控制'>
          <div class="zoom-controls">
            <div class="input-group">
              <label>起始点 (秒):</label>
              <input v-model.number="startTime" type="number" min="0" :max="totalSeconds - 0.01" step="0.1"
                @change="updateDataZoom" class="time-input" />
            </div>
            <div class="input-group">
              <label>结束点 (秒):</label>
              <input v-model.number="endTime" type="number" :min="startTime + 0.1" :max="totalSeconds" step="0.1"
                @change="updateDataZoom" class="time-input" />
            </div>
            <button @click="resetZoom" class="reset-btn">重置</button>
            <span class="data-info">
              显示 {{ Math.round((endTime - startTime) * pointsPerSecond) }} 个数据点
            </span>
          </div>
        </ElCollapseItem>
        <ElCollapseItem title='数据修正'></ElCollapseItem>
        <ElCollapseItem title='数据列比对'></ElCollapseItem>
        <ElCollapseItem title='数据列求导'></ElCollapseItem>
      </ElCollapse>
    </div>
    <div class="chartColumn">
      <div ref="chartContainer" class="chart-container"></div>
      <div ref="resultChartContainer" class="chart-container" v-if="showResult"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElButton, ElCollapse, ElCollapseItem, ElTransfer, ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus';
import { generateContinuousData, generateTimeData } from '@/test';

interface dataSerie {
  name: string
  data: number[]
  yAxisName: string
  valueFormat: string
}

interface transferOption {
  key: number
  label: string
  disabled: boolean
  serie: dataSerie
}

// 图表使用的颜色系列
const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']

const series = ref<transferOption[]>([
  { key: 1, label: '示例数据：温度', disabled: false, serie: { name: '温度', data: [], yAxisName: '温度 (°C)', valueFormat: '{value} °C' } },
  { key: 2, label: '示例数据：压力', disabled: false, serie: { name: '压力', data: [], yAxisName: '压力 (kPa)', valueFormat: '{value} kPa' } }
]);

// 数据配置常量
let totalSeconds = 500
let pointsPerSecond = 100
let totalPoints = totalSeconds * pointsPerSecond

// 生成测试数据
const timeData = generateTimeData(totalSeconds, pointsPerSecond)
const temperatureData = generateContinuousData(totalPoints, 25, 15) // 温度数据，基值25°C，变化幅度±15°C
const pressureData = generateContinuousData(totalPoints, 101.3, 5) // 压力数据，基值101.3kPa，变化幅度±5kPa

series.value[0].serie.data = temperatureData
series.value[1].serie.data = pressureData

const selectedSeries = ref<Array<number>>([]);

const fileList = ref<UploadFile[]>([]);

const handleFileChange = (file: UploadFile) => {
  if (file.raw) {
    const reader = new FileReader();
    reader.readAsDataURL(file.raw);
  }
  fileList.value = [file];
  return false; // 阻止自动上传
};

const handleRemove = () => {
  fileList.value = [];
};

const selectDataSerie = () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先上传数据文件');
    return;
  }
}

// 根据数据系列生成完整的图表配置
const chartOptionFromSeries = (series: dataSerie[], timeData: string[]): echarts.EChartsOption => {
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textStyle: {
        color: '#fff',
        fontSize: 12
      },
      formatter: (params: any) => {
        if (Array.isArray(params) && params.length > 0) {
          const time = params[0].axisValue
          let result = `时间: ${time}<br/>`
          params.forEach((param: any) => {
            result += `${param.marker}${param.seriesName}: ${param.value}<br/>`
          })
          return result
        }
        return ''
      }
    },
    legend: {
      data: series.map(s => s.name),
      top: '8%',
      textStyle: {
        fontSize: 12
      }
    },
    grid: {
      left: '6%',
      right: '4%',
      bottom: '8%',
      top: '18%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      },
      right: '2%',
      top: '8%'
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 10
      },
      {
        start: 0,
        end: 10,
        height: 30,
        bottom: '2%'
      }
    ],
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeData,
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      axisLabel: {
        color: '#666',
        fontSize: 10,
        interval: Math.floor(totalPoints / 20) // 只显示部分标签避免拥挤
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#f5f5f5',
          type: 'dashed'
        }
      }
    },
    yAxis: series.map(s => ({
      type: 'value',
      name: s.yAxisName,
      position: series.indexOf(s) === 0 ? 'left' : 'right',
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      axisLabel: {
        formatter: s.valueFormat,
        color: '#666',
        fontSize: 10
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#f5f5f5',
          type: 'dashed'
        }
      }
    })),
    series: series.map((s, index) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      lineStyle: {
        color: colors[index % colors.length],
        width: 1.5
      },
      itemStyle: {
        color: colors[index % colors.length]
      },
      yAxisIndex: index
    })),
    animation: false, // 关闭动画
    notMerge: true // 取消合并options实现图表实时更新
  }

}

// 图表实例
let chartInstance: echarts.ECharts | null = null
// 图表容器的引用
const chartContainer = ref<HTMLDivElement>()

// 计算结果图表
let resultChartInstance: echarts.ECharts | null = null
const resultChartContainer = ref<HTMLDivElement>()
const showResult = ref(false)

// 控制数据显示范围的响应式变量
const startTime = ref(0)
const endTime = ref(50) // 默认显示前50秒

// 更新数据缩放范围
const updateDataZoom = () => {
  if (!chartInstance) return

  // 确保输入值有效
  if (startTime.value >= endTime.value) {
    endTime.value = startTime.value + 1
  }

  // 计算百分比
  const startPercent = (startTime.value / totalSeconds) * 100
  const endPercent = (endTime.value / totalSeconds) * 100

  // 更新图表的dataZoom配置
  chartInstance.setOption({
    dataZoom: [
      {
        type: 'inside',
        start: startPercent,
        end: endPercent
      },
      {
        start: startPercent,
        end: endPercent,
        height: 30,
        bottom: '2%'
      }
    ]
  })
}

// 重置缩放
const resetZoom = () => {
  startTime.value = 0
  endTime.value = 50
  updateDataZoom()
}

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return

  // 创建ECharts实例
  chartInstance = echarts.init(chartContainer.value)

  chartInstance.on('dataZoom', (params) => {
    // 当手动缩放时，更新startTime和endTime控件
    const param = params as unknown as { start: number, end: number }
    const start = param.start
    const end = param.end
    startTime.value = Math.round((start / 100) * totalSeconds * 100) / 100
    endTime.value = Math.round((end / 100) * totalSeconds * 100) / 100
  })

  window.addEventListener('resize', handleResize)
}

const fillChart = () => {
  if (!chartInstance) return

  let selected = series.value.map(s => ({
    key: s.key,
    label: s.label,
    disabled: s.disabled,
    serie: s.serie
  })).filter(s => selectedSeries.value.includes(s.key))
  console.log('Selected series:', selected)
  if (selected.length === 0) {
    ElMessage.warning('请选择至少一个数据列');
    return;
  }

  const chartData: dataSerie[] = selected.map(s => (s.serie));

  // 配置项
  const option: echarts.EChartsOption = chartOptionFromSeries(chartData, timeData);

  chartInstance.setOption(option, true)
}

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  initChart()
})
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.chartwrapper {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.control-panel {
  width: 30vw;
  margin-bottom: 15px;
  padding: 5px;
}

.zoom-controls {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 15px;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-group label {
  font-size: 16px;
  color: #666;
  white-space: nowrap;
}

.time-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}

.time-input:focus {
  outline: none;
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.reset-btn {
  padding: 6px 12px;
  background: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.reset-btn:hover {
  background: #337ab7;
}

.data-info {
  margin-top: auto;
  margin-bottom: auto;
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.chart-container {
  width: 65vw;
  height: calc(80vh - 80px);
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chartColumn {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  width: 65vw;
  height: calc(80vh - 80px);
}
</style>
