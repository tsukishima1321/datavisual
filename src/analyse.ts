export interface maxRangeResult {
    maxValue: number;
    maxValueIndex: number;
    rangeStart: number;
    rangeEnd: number;
}

/**
 * 查找数据中最大值及其索引，并返回该最大值在指定范围内的起始和结束索引
 * @param data 1-D number array
 * @param range 范围百分比
 * @returns 包含最大值、最大值索引、范围起始索引和范围结束索引的对象
 */
export const findMaxRange = (data: number[], range: number): maxRangeResult => {
    if (data.length === 0 || range <= 0 || range >= 100) {
        return { maxValue: 0, maxValueIndex: -1, rangeStart: -1, rangeEnd: -1 };
    }

    let maxValue = -Infinity;
    let maxValueIndex = -1;
    let rangeStart = -1;
    let rangeEnd = -1;

    for (let i = 0; i < data.length; i++) {
        const currentValue = data[i];
        if (currentValue > maxValue) {
            maxValue = currentValue;
            maxValueIndex = i;
        }
    }

    if (maxValueIndex === -1) {
        return { maxValue: 0, maxValueIndex: -1, rangeStart: -1, rangeEnd: -1 };
    }

    for (let i = maxValueIndex; i >= 0; i--) {
        if (data[i] >= maxValue * (range / 100)) {
            rangeStart = i;
        }
        else {
            break;
        }
    }

    for (let i = maxValueIndex; i < data.length; i++) {
        if (data[i] >= maxValue * (range / 100)) {
            rangeEnd = i;
        }
        else {
            break;
        }
    }

    return { maxValue, maxValueIndex, rangeStart, rangeEnd };
}

/**
 * 实现AMPD算法，搜索一维数组中的波峰
 * @param data 1-D number array
 * @param minPeakHeight 最小峰值高度（相对于数据均值的倍数，默认0.5）
 * @param minPeakDistance 最小峰值距离（默认为数据长度的1/50）
 * @returns 波峰所在索引值的数组
 */
export const AMPD = (data: number[], minPeakHeight: number = 0.5, minPeakDistance: number = 0.02): number[] => {
    const N = data.length;
    if (N < 3) {
        return [];
    }

    // 计算数据的统计信息
    const mean = data.reduce((sum, val) => sum + val, 0) / N;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / N;
    const std = Math.sqrt(variance);
    
    // 设置默认最小峰值距离
    const actualMinDistance = Math.max(Math.floor(N * minPeakDistance), 5);
    
    // 设置峰值高度阈值
    const heightThreshold = mean + minPeakHeight * std;

    // 第一步：生成Local Maxima Scalogram (LMS)
    const maxScale = Math.min(Math.floor(N / 10), 50); // 限制最大尺度
    const LMS: boolean[][] = [];
    
    // 初始化LMS矩阵
    for (let i = 0; i < N; i++) {
        LMS[i] = new Array(maxScale).fill(false);
    }
    
    // 计算LMS矩阵 - 添加高度阈值过滤
    for (let scale = 1; scale <= maxScale; scale++) {
        for (let i = scale; i < N - scale; i++) {
            if (data[i] > data[i - scale] && 
                data[i] > data[i + scale] && 
                data[i] >= heightThreshold) {
                LMS[i][scale - 1] = true;
            }
        }
    }
    
    // 第二步：计算γ（gamma）
    const gamma: number[] = new Array(maxScale).fill(0);
    for (let scale = 0; scale < maxScale; scale++) {
        for (let i = 0; i < N; i++) {
            if (LMS[i][scale]) {
                gamma[scale]++;
            }
        }
    }
    
    // 第三步：找到最优尺度（改进的选择方法）
    let optimalScale = 1;
    let minGamma = Infinity;
    
    // 寻找峰值数量相对稳定且较少的尺度
    for (let scale = Math.max(1, Math.floor(actualMinDistance / 2)); scale <= Math.min(maxScale, actualMinDistance * 2); scale++) {
        if (gamma[scale - 1] > 0 && gamma[scale - 1] < minGamma) {
            minGamma = gamma[scale - 1];
            optimalScale = scale;
        }
    }
    
    // 如果没有找到合适的尺度，使用较大的尺度
    if (minGamma === Infinity) {
        optimalScale = Math.min(maxScale, actualMinDistance);
    }
    
    // 第四步：使用最优尺度提取峰值
    const candidatePeaks: number[] = [];
    for (let i = 0; i < N; i++) {
        if (optimalScale <= maxScale && LMS[i][optimalScale - 1]) {
            candidatePeaks.push(i);
        }
    }
    
    // 第五步：峰值筛选和后处理
    const filteredPeaks: number[] = [];
    
    // 首先按峰值高度排序（从高到低）
    candidatePeaks.sort((a, b) => data[b] - data[a]);
    
    for (const currentPeak of candidatePeaks) {
        let isValid = true;
        
        // 检查是否与已选择的峰值距离过近
        for (const existingPeak of filteredPeaks) {
            if (Math.abs(currentPeak - existingPeak) < actualMinDistance) {
                isValid = false;
                break;
            }
        }
        
        // 额外验证：检查是否真的是局部最大值
        if (isValid) {
            const checkRadius = Math.max(3, Math.floor(actualMinDistance / 3));
            let isLocalMax = true;
            
            for (let j = Math.max(0, currentPeak - checkRadius); j <= Math.min(N - 1, currentPeak + checkRadius); j++) {
                if (j !== currentPeak && data[j] >= data[currentPeak]) {
                    isLocalMax = false;
                    break;
                }
            }
            
            if (isLocalMax) {
                filteredPeaks.push(currentPeak);
            }
        }
    }
    
    // 按位置排序
    filteredPeaks.sort((a, b) => a - b);
    
    return filteredPeaks;
}

/**
 * 用五点求导法计算一维数组的导数
 * @param data 1-D number array
 * @returns 求导后的数组
 * */
export const derivative = (data: number[], pointsPerSecond: number): number[] => {
    const result: number[] = [];
    const count = data.length;
    const dt = 1 / pointsPerSecond; // 时间间隔
    // 处理边界情况和内部点
    for (let i = 0; i < count; i++) {
        if (i === 0) {
            // 左边界：前向差分
            result[i] = (data[i + 1] - data[i]) / dt;
        } else if (i === 1) {
            // 次左边界：三点中心差分
            result[i] = (data[i + 1] - data[i - 1]) / (2 * dt);
        } else if (i === count - 2) {
            // 次右边界：三点中心差分
            result[i] = (data[i + 1] - data[i - 1]) / (2 * dt);
        } else if (i === count - 1) {
            // 右边界：后向差分
            result[i] = (data[i] - data[i - 1]) / dt;
        } else {
            // 内部点：五点中心差分
            result[i] = (-data[i + 2] + 8 * data[i + 1] - 8 * data[i - 1] + data[i - 2]) / (12 * dt);
        }
    }
    return result;
}

/**
 * 用滑动平均法平滑一维数组
 * @param data 1-D number array
 * @param windowSize 窗口大小
 * @return 平滑后的数组
 */
export const smooth = (data: number[], windowSize: number): number[] => {
    if (windowSize <= 0 || windowSize > data.length) {
        return data.slice(); // 返回原数组的副本
    }

    const halfWindow = Math.floor(windowSize / 2);
    const smoothedData: number[] = new Array(data.length).fill(0);

    for (let i = 0; i < data.length; i++) {
        let sum = 0;
        let count = 0;

        for (let j = -halfWindow; j <= halfWindow; j++) {
            const index = i + j;
            if (index >= 0 && index < data.length) {
                sum += data[index];
                count++;
            }
        }

        smoothedData[i] = sum / count;
    }

    return smoothedData;
}