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
 * @returns 波峰所在索引值的数组
 */
export const AMPD = (data: number[]): number[] => {
    const count = data.length;
    const pData = new Array(count).fill(0);
    const arrRowsum: number[] = [];

    // 第一个循环 - 找到最优窗口大小
    for (let k = 1; k <= Math.floor(count / 2); k++) {
        let rowSum = 0;
        for (let i = k; i < count - k; i++) {
            if (data[i] > data[i - k] && data[i] > data[i + k]) {
                rowSum -= 1;
            }
        }
        arrRowsum.push(rowSum);
    }

    // 找到最小值的索引
    const minIndex = arrRowsum.indexOf(Math.min(...arrRowsum));
    const maxWindowLength = minIndex + 1; // 因为k从1开始，所以要+1

    // 第二个循环 - 统计波峰出现次数
    for (let k = 1; k <= maxWindowLength; k++) {
        for (let i = k; i < count - k; i++) {
            if (data[i] > data[i - k] && data[i] > data[i + k]) {
                pData[i] += 1;
            }
        }
    }

    // 返回在所有测试窗口大小中都被识别为波峰的索引
    const peaks: number[] = [];
    for (let i = 0; i < count; i++) {
        if (pData[i] === maxWindowLength) {
            peaks.push(i);
        }
    }

    return peaks;
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