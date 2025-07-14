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

    for (let i= maxValueIndex; i >= 0; i--) {
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