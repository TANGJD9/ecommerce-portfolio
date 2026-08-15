/* 广告投放方案：预算饼图 + ACOS 优化路径 */
(function () {
  'use strict';
  if (typeof echarts === 'undefined') return;
  var FONT = getComputedStyle(document.documentElement).getPropertyValue('--font');

  /* 预算分配环形图 */
  var budgetEl = document.getElementById('chartBudget');
  if (budgetEl) {
    var b = echarts.init(budgetEl);
    b.setOption({
      tooltip: {
        trigger: 'item', backgroundColor: '#0e1f45', borderWidth: 0, textStyle: { color: '#fff', fontSize: 12 },
        formatter: '{b}<br/>预算占比：{d}%'
      },
      legend: { bottom: 0, textStyle: { color: '#5c6b83', fontSize: 12, fontFamily: FONT } },
      series: [{
        type: 'pie', radius: ['46%', '72%'], center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 3 },
        label: { show: true, formatter: '{d}%', color: '#16233c', fontSize: 12, fontWeight: 700, fontFamily: FONT },
        data: [
          { value: 40, name: '手动精准 · 收割', itemStyle: { color: '#0da678' } },
          { value: 25, name: '手动词组 · 精准拓量', itemStyle: { color: '#f5a524' } },
          { value: 20, name: '自动广告 · 跑词', itemStyle: { color: '#2f6bff' } },
          { value: 15, name: '手动广泛 · 拓词', itemStyle: { color: '#7c5cff' } }
        ]
      }]
    });
    window.addEventListener('resize', function () { b.resize(); });
  }

  /* ACOS / ROAS 优化路径 */
  var acosEl = document.getElementById('chartAcos');
  if (acosEl) {
    var weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
    var acos = [45, 39, 34, 30, 27, 25];
    var roas = [2.2, 2.6, 2.9, 3.3, 3.7, 4.0];
    var a = echarts.init(acosEl);
    a.setOption({
      grid: { left: 46, right: 46, top: 34, bottom: 30 },
      tooltip: {
        trigger: 'axis', backgroundColor: '#0e1f45', borderWidth: 0, textStyle: { color: '#fff', fontSize: 12 },
        formatter: function (ps) {
          var s = '<b>' + ps[0].axisValue + '</b>';
          ps.forEach(function (p) { s += '<br/>' + p.marker + p.seriesName + '：' + p.value + (p.seriesName === 'ROAS' ? '' : '%'); });
          return s;
        }
      },
      legend: { top: 0, textStyle: { color: '#5c6b83', fontSize: 12, fontFamily: FONT } },
      xAxis: { type: 'category', data: weeks, axisLine: { lineStyle: { color: '#d7deeb' } }, axisLabel: { color: '#5c6b83', fontFamily: FONT } },
      yAxis: [
        { type: 'value', name: 'ACOS %', nameTextStyle: { color: '#8b98ad' }, max: 50, axisLabel: { color: '#5c6b83', formatter: '{value}%' }, splitLine: { lineStyle: { color: '#edf1f8' } } },
        { type: 'value', name: 'ROAS', nameTextStyle: { color: '#8b98ad' }, max: 5, axisLabel: { color: '#5c6b83' }, splitLine: { show: false } }
      ],
      series: [
        {
          name: 'ACOS', type: 'line', data: acos, smooth: true, symbolSize: 8,
          lineStyle: { color: '#e5484d', width: 3 }, itemStyle: { color: '#e5484d' },
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(229,72,77,.25)' }, { offset: 1, color: 'rgba(229,72,77,.02)' }]) },
          markLine: {
            silent: true, symbol: 'none',
            lineStyle: { color: '#ffb27a', type: 'dashed', width: 1.5 },
            label: { color: '#e8520a', fontSize: 11, formatter: '目标 25%', position: 'insideEndTop' },
            data: [{ yAxis: 25 }]
          }
        },
        {
          name: 'ROAS', type: 'line', yAxisIndex: 1, data: roas, smooth: true, symbolSize: 8,
          lineStyle: { color: '#0da678', width: 3 }, itemStyle: { color: '#0da678' },
          markLine: {
            silent: true, symbol: 'none',
            lineStyle: { color: '#a7e8d3', type: 'dashed', width: 1.5 },
            label: { color: '#078a63', fontSize: 11, formatter: '目标 4.0', position: 'insideEndTop' },
            data: [{ yAxis: 4 }]
          }
        }
      ]
    });
    window.addEventListener('resize', function () { a.resize(); });
  }
})();
