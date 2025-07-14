// 生成连续的随机数据
export const generateContinuousData = (points: number, baseValue = 50, amplitude = 20) => {
  const data: number[] = []
  let currentValue = baseValue

  for (let i = 0; i < points; i++) {
    // 使用小幅随机变化，保持数据连续性
    const change = (Math.random() - 0.5) * 2 // -1 到 1 的随机变化
    currentValue += change

    // 添加一些周期性变化和趋势
    const time = i / points * 2 * Math.PI
    const periodicComponent = Math.sin(time * 5) * amplitude * 0.3
    const trendComponent = Math.sin(time * 0.5) * amplitude * 0.5

    const finalValue = currentValue + periodicComponent + trendComponent
    data.push(Number(finalValue.toFixed(2)))
  }

  return data
}

// 生成时间轴数据（100秒，每秒100个点，共10000个点）
export const generateTimeData = (totalSeconds: number, pointsPerSecond: number) => {
  const timeData: string[] = []
  for (let second = 0; second < totalSeconds; second++) {
    for (let point = 0; point < pointsPerSecond; point++) {
      const time = second + point / pointsPerSecond
      timeData.push(time.toFixed(2) + 's')
    }
  }
  return timeData
}