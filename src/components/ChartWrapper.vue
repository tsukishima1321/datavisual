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
            <ElButton type="primary" @click="updateChart">更新图表</ElButton>
          </div>
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
        <ElCollapseItem title='数据列修正'>
          <div class="data-correction-panel">
            <div class="correction-select">
              <label>选择数据列:</label>
              <el-select v-model="correctionForm.seriesKey" placeholder="请选择要修正的数据列" style="width: 250px">
                <el-option v-for="serie in availableSeriesForComparison" :key="serie.key" :label="serie.label"
                  :value="serie.key.toString()" />
              </el-select>
            </div>
            <div class="correction-operation">
              <label>修正方式:</label>
              <el-select v-model="correctionForm.operation" placeholder="请选择修正方式" style="width: 150px">
                <el-option label="加法 (+)" value="add" />
                <el-option label="减法 (-)" value="subtract" />
                <el-option label="乘法 (×)" value="multiply" />
                <el-option label="除法 (÷)" value="divide" />
              </el-select>
            </div>
            <div class="correction-value">
              <label>修正值:</label>
              <el-input-number v-model="correctionForm.value" :precision="6" :step="0.1" style="width: 200px"
                placeholder="请输入修正值" />
            </div>
            <div class="correction-apply-mode">
              <label>应用方式:</label>
              <el-radio-group v-model="correctionForm.applyMode">
                <el-radio value="replace">替换原数据</el-radio>
                <el-radio value="new">保存为新数据</el-radio>
              </el-radio-group>
            </div>
            <div class="correction-new-name" v-if="correctionForm.applyMode === 'new'">
              <label>新数据名称:</label>
              <el-input v-model="correctionForm.newName" placeholder="请输入新数据系列名称" style="width: 200px" />
            </div>
            <div class="correction-buttons">
              <el-button type="primary" @click="performCorrection" :disabled="!canPerformCorrection">执行修正</el-button>
              <el-button type="warning" @click="previewCorrection" :disabled="!canPerformCorrection">预览效果</el-button>
              <el-button type="info" @click="clearCorrectionPreview" :disabled="!showCorrectionPreview">清除预览</el-button>
            </div>
          </div>
        </ElCollapseItem>
        <ElCollapseItem title='数据列比对'>
          <div class="comparison-panel">
            <div class="comparison-select">
              <div class="select-group">
                <label>数据列A:</label>
                <el-select v-model="comparisonForm.seriesAKey" placeholder="请选择第一个数据列" style="width: 200px">
                  <el-option v-for="serie in availableSeriesForComparison" :key="serie.key" :label="serie.label"
                    :value="serie.key.toString()" />
                </el-select>
              </div>
              <div class="select-group">
                <label>数据列B:</label>
                <el-select v-model="comparisonForm.seriesBKey" placeholder="请选择第二个数据列" style="width: 200px">
                  <el-option v-for="serie in availableSeriesForComparison" :key="serie.key" :label="serie.label"
                    :value="serie.key.toString()" />
                </el-select>
              </div>
            </div>
            <div class="comparison-operation">
              <label>运算方式:</label>
              <el-select v-model="comparisonForm.operation" placeholder="请选择运算方式" style="width: 150px">
                <el-option label="A - B" value="subtract" />
                <el-option label="B - A" value="reverseSubtract" />
                <el-option label="A + B" value="add" />
                <el-option label="A × B" value="multiply" />
                <el-option label="A ÷ B" value="divide" />
              </el-select>
            </div>
            <div class="comparison-result-name">
              <label>结果名称:</label>
              <el-input v-model="comparisonForm.resultName" placeholder="请输入结果系列名称" style="width: 200px" />
            </div>
            <div class="comparison-buttons">
              <el-button type="primary" @click="performComparison" :disabled="!canPerformComparison">执行比对</el-button>
              <el-button type="success" @click="saveComparisonResult" :disabled="!showResult">保存结果</el-button>
              <el-button type="info" @click="clearComparisonResult" :disabled="!showResult">清除结果</el-button>
            </div>
          </div>
        </ElCollapseItem>
        <ElCollapseItem title='数据列求导'></ElCollapseItem>
        <ElCollapseItem title='数据分析'>
          <ElCollapse>
            <ElCollapseItem title="最值和区间">
              <div class="analysis-controls">
                <el-select v-model="analysisForm.seriesKey" placeholder="请选择要分析的数据列" style="width: 250px">
                  <el-option v-for="serie in availableSeriesForComparison" :key="serie.key" :label="serie.label"
                    :value="serie.key.toString()" />
                </el-select>
                <div class="analysis-row">
                  <label>搜索 x% 最大值范围：</label>
                  <ElInput v-model="analysisForm.range" placeholder="请输入区间范围：" style="width: 150px" />
                </div>
                <div class="analysis-row">
                  <ElButton type="primary" @click="performAnalysisMaxRange">执行分析</ElButton>
                  <ElButton type="success" @click="highlightAnalysisRange" :disabled="!maxResult">高亮区间</ElButton>
                  <ElButton type="info" @click="clearAnalysisResult">清除结果</ElButton>
                </div>
                <div class="analysis-result" v-if="maxResult">
                  <p>最大值: {{ maxResult.maxValue }}</p>
                  <p>最大值位置: {{ maxResult.maxValueIndex / 100 }}秒</p>
                  <p>指定百分数区间范围起点: {{ maxResult.rangeStart / 100 }}秒</p>
                  <p>指定百分数区间范围终点: {{ maxResult.rangeEnd / 100 }}秒</p>
                </div>
              </div>
            </ElCollapseItem>
            <ElCollapseItem title="峰值搜索"></ElCollapseItem>
          </ElCollapse>
        </ElCollapseItem>
      </ElCollapse>
    </div>
    <div class="chartColumn">
      <div ref="chartContainer" class="chart-container"></div>
      <div ref="resultChartContainer" class="chart-container"></div>
    </div>

    <!-- 数据列选择对话框 -->
    <el-dialog v-model="showColumnDialog" title="选择数据列" width="500px">
      <el-form :model="columnForm" label-width="100px">
        <el-form-item label="工作表">
          <el-select v-model="columnForm.sheetName" placeholder="请选择工作表" @change="onSheetChange" style="width: 100%">
            <el-option v-for="sheet in availableSheets" :key="sheet" :label="sheet" :value="sheet" />
          </el-select>
        </el-form-item>

        <el-form-item label="是否有表头">
          <el-select v-model="columnForm.hasHeader" placeholder="请选择" @change="onHeaderModeChange" style="width: 100%">
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>

        <el-form-item label="数据列">
          <el-select v-model="columnForm.columnName" placeholder="请选择数据列" style="width: 100%"
            :disabled="!columnForm.sheetName">
            <el-option v-for="column in availableColumns" :key="column" :label="column" :value="column" />
          </el-select>
        </el-form-item>

        <el-form-item label="数据名称">
          <el-input v-model="columnForm.dataName" placeholder="请输入数据系列的显示名称" />
        </el-form-item>

        <el-form-item label="单位">
          <el-input v-model="columnForm.unit" placeholder="请输入数据单位，如：°C、kPa等" />
        </el-form-item>

        <el-form-item label="数值格式">
          <el-input v-model="columnForm.valueFormat" placeholder="可选，如：{value} °C" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showColumnDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmAddColumn">确认添加</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import { ElLoading, ElButton, ElCollapse, ElCollapseItem, ElTransfer, ElMessage, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElInputNumber, ElRadio, ElRadioGroup } from 'element-plus'
import type { UploadFile } from 'element-plus';
import { generateContinuousData, generateTimeData } from '@/test';
import { findMaxRange, maxRangeResult } from '@/analyse';
import * as XLSX from 'xlsx';

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

const series = ref<transferOption[]>([]);

// 数据配置常量
let totalSeconds = 500
let pointsPerSecond = 100
let totalPoints = totalSeconds * pointsPerSecond

let timeData: Array<string> = []

const selectedSeries = ref<Array<number>>([]);

const fileList = ref<UploadFile[]>([]);

// Excel 相关的响应式变量
let excelWorkbook: XLSX.WorkBook | null = null;
const showColumnDialog = ref(false);
const availableSheets = ref<string[]>([]);
const selectedSheet = ref('');
const availableColumns = ref<string[]>([]);
const columnForm = ref({
  sheetName: '',
  columnName: '',
  dataName: '',
  unit: '',
  valueFormat: '',
  hasHeader: true // 默认有表头
});

// 数据列比对相关的响应式变量
const comparisonForm = ref({
  seriesAKey: '' as string,
  seriesBKey: '' as string,
  operation: 'subtract' as string,
  resultName: '比对结果'
});

// 存储当前比对结果
const currentComparisonResult = ref<dataSerie | null>(null);

// 数据列修正相关的响应式变量
const correctionForm = ref({
  seriesKey: '' as string,
  operation: 'add' as string,
  value: 0 as number,
  applyMode: 'new' as string, // 'replace' | 'new'
  newName: '修正后数据'
});

// 修正预览相关
const showCorrectionPreview = ref(false);
const currentCorrectionPreview = ref<dataSerie | null>(null);

// 数据分析相关的响应式变量
const analysisForm = ref({
  seriesKey: '' as string,
  range: 90 as number // 默认搜索范围为90%
});

const maxResult = ref<maxRangeResult | null>(null);

const loading = ref(false);

const handleFileChange = (file: UploadFile) => {
  if (file.raw) {
    loading.value = true;
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '文件处理中...',
      background: 'rgba(0, 0, 0, 0.7)',
    });
    const reader = new FileReader();
    reader.onload = (e) => {

      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        excelWorkbook = XLSX.read(data, { type: 'array' });

        // 获取工作表名称
        availableSheets.value = excelWorkbook.SheetNames;

        ElMessage.success(`文件上传成功！`);

      } catch (error) {
        ElMessage.error('文件读取失败，请确保文件格式正确');
        console.error('Excel文件读取错误:', error);
      } finally {
        loading.value = false;
        loadingInstance.close();
      }
    };
    reader.readAsArrayBuffer(file.raw);
  }
  fileList.value = [file];
  return false; // 阻止自动上传
};

const handleRemove = () => {
  fileList.value = [];
  excelWorkbook = null;
  availableSheets.value = [];
  selectedSheet.value = '';
  availableColumns.value = [];
};

const selectDataSerie = () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先上传数据文件');
    return;
  }
  if (!excelWorkbook) {
    ElMessage.warning('文件未正确加载，请重新上传');
    return;
  }

  // 重置表单
  columnForm.value = {
    sheetName: '',
    columnName: '',
    dataName: '',
    unit: '',
    valueFormat: '',
    hasHeader: true
  };

  showColumnDialog.value = true;
};

// 当选择工作表时，获取该表的列名
const onSheetChange = (sheetName: string) => {
  if (!excelWorkbook || !sheetName) {
    availableColumns.value = [];
    return;
  }

  columnForm.value.sheetName = sheetName;
  updateColumnNames();
};

// 当表头模式改变时，重新获取列名
const onHeaderModeChange = () => {
  if (columnForm.value.sheetName) {
    updateColumnNames();
  }
};

// 更新列名列表
const updateColumnNames = () => {
  const sheetName = columnForm.value.sheetName;
  const hasHeader = columnForm.value.hasHeader;

  if (!excelWorkbook || !sheetName) {
    availableColumns.value = [];
    return;
  }

  try {
    const worksheet = excelWorkbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const columns: string[] = [];

    if (hasHeader) {
      // 有表头：使用第一行作为列名
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          columns.push(cell.v.toString());
        } else {
          columns.push(`列${col + 1}`); // 如果没有列名，使用默认名称
        }
      }
    } else {
      // 无表头：使用列号作为列名
      for (let col = range.s.c; col <= range.e.c; col++) {
        columns.push(`列${String.fromCharCode(65 + col)}`); // A, B, C...
      }
    }

    availableColumns.value = columns;
  } catch (error) {
    ElMessage.error('读取工作表失败');
    console.error('工作表读取错误:', error);
  }
};

// 确认添加数据列
const confirmAddColumn = () => {
  const form = columnForm.value;

  if (!form.sheetName || !form.columnName || !form.dataName || !form.unit) {
    ElMessage.warning('请填写完整信息');
    return;
  }

  if (!excelWorkbook) {
    ElMessage.error('Excel文件未加载');
    return;
  }

  try {
    const worksheet = excelWorkbook.Sheets[form.sheetName];
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

    // 找到列索引
    let columnIndex = -1;

    if (form.hasHeader) {
      // 有表头：在第一行中查找列名
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        const cell = worksheet[cellAddress];
        const cellValue = cell && cell.v ? cell.v.toString() : `列${col + 1}`;
        if (cellValue === form.columnName) {
          columnIndex = col;
          break;
        }
      }
    } else {
      // 无表头：根据列号查找
      const colLetter = form.columnName.replace('列', '');
      columnIndex = colLetter.charCodeAt(0) - 65; // A=0, B=1, C=2...
    }

    if (columnIndex === -1 || columnIndex < range.s.c || columnIndex > range.e.c) {
      ElMessage.error('未找到指定列');
      return;
    }

    // 读取列数据
    const columnData: number[] = [];
    const startRow = form.hasHeader ? 1 : 0; // 有表头则跳过第一行

    for (let row = startRow; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: columnIndex });
      const cell = worksheet[cellAddress];
      const value = cell && cell.v ? parseFloat(cell.v.toString()) : 0;
      columnData.push(isNaN(value) ? 0 : value);
    }

    totalPoints = columnData.length;
    totalSeconds = totalPoints / pointsPerSecond;
    timeData = generateTimeData(totalSeconds, pointsPerSecond);
    ElMessage.success(`检测到 ${columnData.length} 行数据，设置总时长为 ${totalSeconds} 秒`);

    // 创建新的数据系列
    const newSerie: transferOption = {
      key: Date.now(), // 使用时间戳作为唯一key
      label: `${form.dataName} (${form.sheetName})`,
      disabled: false,
      serie: {
        name: form.dataName,
        data: columnData,
        yAxisName: `${form.dataName} (${form.unit})`,
        valueFormat: form.valueFormat || `{value} ${form.unit}`
      }
    };

    // 添加到系列列表
    series.value.push(newSerie);

    ElMessage.success(`成功添加数据列：${form.dataName}`);
    showColumnDialog.value = false;

  } catch (error) {
    ElMessage.error('数据读取失败');
    console.error('数据读取错误:', error);
  }
};

// 数据列比对相关的计算属性
const availableSeriesForComparison = computed(() => {
  return series.value.filter(s => selectedSeries.value.includes(s.key));
});

const canPerformComparison = computed(() => {
  return comparisonForm.value.seriesAKey &&
    comparisonForm.value.seriesBKey &&
    comparisonForm.value.seriesAKey !== comparisonForm.value.seriesBKey &&
    comparisonForm.value.resultName.trim() !== '';
});

// 数据列比对相关的方法
const performComparison = () => {
  if (!canPerformComparison.value) {
    ElMessage.warning('请选择两个不同的数据列并输入结果名称');
    return;
  }

  const seriesAKey = parseInt(comparisonForm.value.seriesAKey);
  const seriesBKey = parseInt(comparisonForm.value.seriesBKey);

  const seriesA = series.value.find(s => s.key === seriesAKey);
  const seriesB = series.value.find(s => s.key === seriesBKey);

  if (!seriesA || !seriesB) {
    ElMessage.error('找不到选中的数据列');
    return;
  }

  const dataA = seriesA.serie.data;
  const dataB = seriesB.serie.data;

  // 确保数据长度一致
  const minLength = Math.min(dataA.length, dataB.length);
  const resultData: number[] = [];

  for (let i = 0; i < minLength; i++) {
    let result = 0;
    switch (comparisonForm.value.operation) {
      case 'subtract':
        result = dataA[i] - dataB[i];
        break;
      case 'reverseSubtract':
        result = dataB[i] - dataA[i];
        break;
      case 'add':
        result = dataA[i] + dataB[i];
        break;
      case 'multiply':
        result = dataA[i] * dataB[i];
        break;
      case 'divide':
        result = dataB[i] !== 0 ? dataA[i] / dataB[i] : 0;
        break;
      default:
        result = dataA[i] - dataB[i];
    }
    resultData.push(result);
  }

  // 创建结果数据系列
  const resultSerie: dataSerie = {
    name: comparisonForm.value.resultName,
    data: resultData,
    yAxisName: `${comparisonForm.value.resultName}`,
    valueFormat: '{value}'
  };

  // 保存当前比对结果
  currentComparisonResult.value = resultSerie;

  console.log('Comparison result:', resultSerie);

  // 显示结果图表
  showResult.value = true;

  // 等待DOM更新后初始化结果图表
  setTimeout(() => {
    if (resultChartInstance && resultChartContainer.value) {
      const currentTimeData = generateTimeData(totalSeconds, pointsPerSecond);
      const resultOption = chartOptionFromSeries([resultSerie], currentTimeData.slice(0, minLength));
      resultChartInstance.setOption(resultOption, true);

      // 同步缩放状态
      updateDataZoom();

      ElMessage.success(`比对完成：${seriesA.label} ${getOperationText(comparisonForm.value.operation)} ${seriesB.label}`);
    } else {
      ElMessage.error('结果图表初始化失败，请稍后重试');
    }
  }, 100);
};

const getOperationText = (operation: string): string => {
  switch (operation) {
    case 'subtract': return '-';
    case 'reverseSubtract': return '(反向减法)';
    case 'add': return '+';
    case 'multiply': return '×';
    case 'divide': return '÷';
    default: return '-';
  }
};

const clearComparisonResult = () => {
  showResult.value = false;
  currentComparisonResult.value = null;

  // 如果没有修正预览在显示，则清空图表
  if (!showCorrectionPreview.value) {
    if (resultChartInstance) {
      resultChartInstance.clear();
    }
  }

  ElMessage.info('已清除比对结果');
};

const saveComparisonResult = () => {
  if (!currentComparisonResult.value) {
    ElMessage.warning('没有可保存的比对结果');
    return;
  }

  // 检查是否已存在同名的数据系列
  const existingSerie = series.value.find(s => s.serie.name === currentComparisonResult.value!.name);
  if (existingSerie) {
    ElMessage.warning('已存在同名的数据系列，请修改结果名称后重新执行比对');
    return;
  }

  // 创建新的传输选项
  const newTransferOption: transferOption = {
    key: Date.now(), // 使用时间戳作为唯一key
    label: `${currentComparisonResult.value.name} (比对结果)`,
    disabled: false,
    serie: { ...currentComparisonResult.value }
  };

  // 添加到系列列表
  series.value.push(newTransferOption);

  ElMessage.success(`比对结果已保存为数据系列：${currentComparisonResult.value.name}`);
};

// 数据列修正相关的计算属性
const canPerformCorrection = computed(() => {
  return correctionForm.value.seriesKey &&
    correctionForm.value.operation &&
    correctionForm.value.value !== undefined &&
    (correctionForm.value.applyMode === 'replace' ||
      (correctionForm.value.applyMode === 'new' && correctionForm.value.newName.trim() !== ''));
});

// 数据列修正相关的方法
const performCorrection = () => {
  if (!canPerformCorrection.value) {
    ElMessage.warning('请完善修正参数');
    return;
  }

  const seriesKey = parseInt(correctionForm.value.seriesKey);
  const targetSerie = series.value.find(s => s.key === seriesKey);

  if (!targetSerie) {
    ElMessage.error('找不到选中的数据列');
    return;
  }

  // 执行修正计算
  const correctedData = applyCorrectionToData(targetSerie.serie.data, correctionForm.value.operation, correctionForm.value.value);

  if (correctionForm.value.applyMode === 'replace') {
    // 替换原数据
    targetSerie.serie.data = correctedData;
    ElMessage.success(`已修正数据列：${targetSerie.label}`);

    // 如果该数据列当前被选中显示，则更新图表
    if (selectedSeries.value.includes(seriesKey)) {
      fillChart();
    }
  } else {
    // 保存为新数据
    const existingSerie = series.value.find(s => s.serie.name === correctionForm.value.newName);
    if (existingSerie) {
      ElMessage.warning('已存在同名的数据系列，请修改名称');
      return;
    }

    const newSerie: transferOption = {
      key: Date.now(),
      label: `${correctionForm.value.newName} (修正结果)`,
      disabled: false,
      serie: {
        name: correctionForm.value.newName,
        data: correctedData,
        yAxisName: targetSerie.serie.yAxisName,
        valueFormat: targetSerie.serie.valueFormat
      }
    };

    series.value.push(newSerie);
    ElMessage.success(`修正结果已保存为新数据系列：${correctionForm.value.newName}`);
  }

  // 清除预览
  clearCorrectionPreview();
};

const previewCorrection = () => {
  if (!canPerformCorrection.value) {
    ElMessage.warning('请完善修正参数');
    return;
  }

  const seriesKey = parseInt(correctionForm.value.seriesKey);
  const targetSerie = series.value.find(s => s.key === seriesKey);

  if (!targetSerie) {
    ElMessage.error('找不到选中的数据列');
    return;
  }

  // 执行修正计算
  const correctedData = applyCorrectionToData(targetSerie.serie.data, correctionForm.value.operation, correctionForm.value.value);

  // 创建预览数据系列
  const previewSerie: dataSerie = {
    name: `${targetSerie.serie.name} (预览)`,
    data: correctedData,
    yAxisName: `${targetSerie.serie.yAxisName} (预览)`,
    valueFormat: targetSerie.serie.valueFormat
  };

  currentCorrectionPreview.value = previewSerie;
  showCorrectionPreview.value = true;

  // 显示预览图表
  setTimeout(() => {
    if (resultChartInstance && resultChartContainer.value) {
      const currentTimeData = generateTimeData(totalSeconds, pointsPerSecond);
      const previewOption = chartOptionFromSeries([previewSerie], currentTimeData.slice(0, correctedData.length));
      resultChartInstance.setOption(previewOption, true);

      // 同步缩放状态
      updateDataZoom();

      ElMessage.success(`预览修正效果：${getOperationText(correctionForm.value.operation)} ${correctionForm.value.value}`);
    } else {
      ElMessage.error('预览图表初始化失败，请稍后重试');
    }
  }, 100);
};

const clearCorrectionPreview = () => {
  showCorrectionPreview.value = false;
  currentCorrectionPreview.value = null;
  if (resultChartInstance) {
    resultChartInstance.clear();
  }
  // 如果有比对结果正在显示，需要恢复
  if (showResult.value && currentComparisonResult.value) {
    setTimeout(() => {
      if (resultChartInstance && resultChartContainer.value) {
        const currentTimeData = generateTimeData(totalSeconds, pointsPerSecond);
        const resultOption = chartOptionFromSeries([currentComparisonResult.value!], currentTimeData.slice(0, currentComparisonResult.value!.data.length));
        resultChartInstance.setOption(resultOption, true);
        updateDataZoom();
      }
    }, 50);
  }
};

// 应用修正计算的工具函数
const applyCorrectionToData = (data: number[], operation: string, value: number): number[] => {
  return data.map(item => {
    switch (operation) {
      case 'add':
        return item + value;
      case 'subtract':
        return item - value;
      case 'multiply':
        return item * value;
      case 'divide':
        return value !== 0 ? item / value : item;
      default:
        return item;
    }
  });
};

// 根据数据系列生成完整的图表配置
const chartOptionFromSeries = (series: dataSerie[], timeData: string[], highlightRange?: { start: number, end: number }): echarts.EChartsOption => {
  const option: echarts.EChartsOption = {
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
            if(param.seriesName == 'highlight-helper') return; // 跳过辅助系列
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
        end: 100
      },
      {
        start: 0,
        end: 100,
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
      symbol: 'none',
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
  };

  // 如果有高亮范围，添加visualMap组件
  if (highlightRange && series.length > 0) {
    // 创建标记数组，用于visualMap
    const markData = new Array(series[0].data.length).fill(0);
    for (let i = highlightRange.start; i <= highlightRange.end; i++) {
      if (i >= 0 && i < markData.length) {
        markData[i] = 1;
      }
    }

    // 添加一个隐藏的辅助系列用于visualMap
    const seriesArray = option.series as any[];
    seriesArray.push({
      name: 'highlight-helper',
      type: 'line',
      data: markData,
      showSymbol: false,
      lineStyle: {
        opacity: 0
      },
      itemStyle: {
        opacity: 0
      },
      silent: true
    });

    // 添加visualMap组件
    option.visualMap = {
      show: false,
      type: 'piecewise',
      seriesIndex: seriesArray.length - 1, // 应用到辅助系列
      dimension: 1, // 按y轴值分段
      pieces: [
        {
          value: 0,
          color: 'transparent'
        },
        {
          value: 1,
          color: 'rgba(255, 0, 0, 0.2)'
        }
      ]
    };

    // 添加标记区域
    (seriesArray[0] as any).markArea = {
      silent: true,
      itemStyle: {
        color: 'rgba(255, 100, 100, 0.2)',
        borderColor: 'rgba(255, 100, 100, 0.8)',
        borderWidth: 1
      },
      data: [[
        {
          xAxis: highlightRange.start,
          name: '分析结果区间'
        },
        {
          xAxis: highlightRange.end
        }
      ]]
    };
  }

  return option;
}

const clearAnalysisResult = () => {
  maxResult.value = null;
  // 清除高亮，重新绘制图表
  fillChart();
  ElMessage.info('已清除分析结果');
}

const highlightAnalysisRange = () => {
  if (!maxResult.value) {
    ElMessage.warning('没有分析结果可以高亮');
    return;
  }

  const highlightRange = {
    start: maxResult.value.rangeStart,
    end: maxResult.value.rangeEnd
  };

  fillChart(highlightRange);
  ElMessage.success('已高亮显示分析区间');
}

const performAnalysisMaxRange = () => {
  const seriesKey = analysisForm.value.seriesKey;
  const range = analysisForm.value.range;

  if (!seriesKey || !range) {
    ElMessage.warning('请选择数据列并输入搜索范围');
    return;
  }

  const targetSerie = series.value.find(s => s.key === parseInt(seriesKey));
  if (!targetSerie) {
    ElMessage.error('找不到选中的数据列');
    return;
  }

  // 执行最大值范围分析
  const result = findMaxRange(targetSerie.serie.data, range);
  if (result.maxValueIndex === -1) {
    ElMessage.error('未找到符合条件的最大值范围');
    return;
  }
  maxResult.value = {
    maxValue: targetSerie.serie.data[result.maxValueIndex],
    maxValueIndex: result.maxValueIndex,
    rangeStart: result.rangeStart,
    rangeEnd: result.rangeEnd,
  };

  // 高亮显示分析区间
  const highlightRange = {
    start: result.rangeStart,
    end: result.rangeEnd
  };

  // 如果分析的数据列在当前选中的系列中，则更新主图表以显示高亮区间
  if (selectedSeries.value.includes(parseInt(seriesKey))) {
    fillChart(highlightRange);
    ElMessage.success(`分析完成！已在图表中高亮显示 ${range}% 最大值区间`);
  } else {
    ElMessage.success(`分析完成！请在数据列选择中选中该数据列以查看高亮区间`);
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
  endTime.value = Math.min(50, totalSeconds) // 确保不超过总时长
  updateDataZoom()
}

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return

  // 创建ECharts实例
  chartInstance = echarts.init(chartContainer.value)

  resultChartInstance = echarts.init(resultChartContainer.value)

  chartInstance.on('dataZoom', (params) => {
    // 当手动缩放时，更新startTime和endTime控件
    const param = params as unknown as { start: number, end: number }
    const start = param.start
    const end = param.end
    startTime.value = Math.round((start / 100) * totalSeconds * 100) / 100
    endTime.value = Math.round((end / 100) * totalSeconds * 100) / 100

    // 缩放主图表时，同步结果图表
    if (resultChartInstance) {
      resultChartInstance.setOption({
        dataZoom: [
          {
            type: 'inside',
            start: start,
            end: end
          },
          {
            start: start,
            end: end,
            height: 30,
            bottom: '2%'
          }
        ]
      })
    }
  })

  window.addEventListener('resize', handleResize)
}

const fillChart = (highlightRange?: { start: number, end: number }) => {
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

  // 重新生成时间数据（确保与当前totalSeconds匹配）
  const currentTimeData = generateTimeData(totalSeconds, pointsPerSecond);

  // 配置项
  const option: echarts.EChartsOption = chartOptionFromSeries(chartData, currentTimeData, highlightRange);

  chartInstance.setOption(option, true)
}

// 模板中使用的更新图表函数
const updateChart = () => {
  fillChart();
}

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
  if (resultChartInstance) {
    resultChartInstance.resize()
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
  width: 35vw;
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

.transfer-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comparison-panel {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comparison-select {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.select-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.select-group label {
  min-width: 80px;
  font-size: 14px;
  color: #666;
}

.comparison-operation {
  display: flex;
  align-items: center;
  gap: 10px;
}

.comparison-operation label {
  min-width: 80px;
  font-size: 14px;
  color: #666;
}

.comparison-result-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.comparison-result-name label {
  min-width: 80px;
  font-size: 14px;
  color: #666;
}

.comparison-buttons {
  display: flex;
  gap: 10px;
}

.data-correction-panel {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.correction-select {
  display: flex;
  align-items: center;
  gap: 10px;
}

.correction-select label {
  min-width: 100px;
  font-size: 14px;
  color: #666;
}

.correction-operation {
  display: flex;
  align-items: center;
  gap: 10px;
}

.correction-operation label {
  min-width: 100px;
  font-size: 14px;
  color: #666;
}

.correction-value {
  display: flex;
  align-items: center;
  gap: 10px;
}

.correction-value label {
  min-width: 100px;
  font-size: 14px;
  color: #666;
}

.correction-apply-mode {
  display: flex;
  align-items: center;
  gap: 10px;
}

.correction-apply-mode label {
  min-width: 100px;
  font-size: 14px;
  color: #666;
}

.correction-new-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.correction-new-name label {
  min-width: 100px;
  font-size: 14px;
  color: #666;
}

.correction-buttons {
  display: flex;
  gap: 10px;
}

.analysis-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.analysis-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-right: auto;
}

.analysis-result {
  margin-top: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
}

.analysis-result p {
  margin: 8px 0;
  font-size: 14px;
  color: #333;
}

.analysis-result p:first-child {
  font-weight: bold;
  color: #409EFF;
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
  margin-bottom: 10px;
  width: 60vw;
  height: calc(80vh - 80px);
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chartColumn {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  width: 60vw;
}
</style>
