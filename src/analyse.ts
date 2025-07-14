export interface maxRangeResult {
    maxValue: number;
    maxValueIndex: number;
    rangeStart: number;
    rangeEnd: number;
}

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
 * 实现AMPD算法
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