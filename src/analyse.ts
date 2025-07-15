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
 * 用中心差分法计算一维数组的导数
 * @param data 1-D number array
 * @returns 求导后的数组
 * */
export const derivative = (data: number[], pointsPerSecond: number): number[] => {
    const result: number[] = [];
    const count = data.length;
    if (count < 2) {
        return result; // 如果数据点少于2个，无法计算导数
    }
    for (let i = 0; i < count; i++) {
        if (i === 0) {
            result.push((data[i + 1] - data[i]) * pointsPerSecond);
        } else if (i === count - 1) {
            result.push((data[i] - data[i - 1]) * pointsPerSecond);
        } else {
            result.push(((data[i + 1] - data[i - 1]) / 2) * pointsPerSecond);
        }
    }
    return result;
}
