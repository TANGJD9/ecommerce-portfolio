/* 复盘与优化：A/B 测试结果对比 */
(function () {
  'use strict';
  if (typeof echarts === 'undefined') return;
  var el = document.getElementById('chartAB1');
  if (!el) return;
  var FONT = getComputedStyle(document.documentElement).getPropertyValue('--font');
  var chart = echarts.init(el);
  chart.setOption({
    grid: { left: 46, right: 20, top: 40, bottom: 30 },
    tooltip: {
      trigger: 'axis', backgroundColor: '#0e1f45', borderWidth: 0, textStyle: { color: '#fff', fontSize: 12 },
      formatter: function (ps) {
        var s = '<b>' + ps[0].axisValue + '</b>';
        ps.forEach(function (p) { s += '<br/>' + p.marker + p.seriesName + '：' + p.value + '%'; });
        return s;
      }
    },
    legend: { top: 0, textStyle: { color: '#5c6b83', fontSize: 12, fontFamily: FONT } },
    xAxis: {
      type: 'category', data: ['点击率 CTR', '转化率 CVR', 'ACOS（越低越好）'],
      axisLabel: { color: '#16233c', fontFamily: FONT, fontWeight: 700, fontSize: 12.5 },
      axisLine: { lineStyle: { color: '#d7deeb' } }
    },
    yAxis: { type: 'value', name: '%', nameTextStyle: { color: '#8b98ad' }, axisLabel: { color: '#5c6b83', formatter: '{value}%' }, splitLine: { lineStyle: { color: '#edf1f8' } } },
    series: [
      {
        name: '版本 A（对照）', type: 'bar', data: [0.46, 9.1, 29], barWidth: 26,
        itemStyle: { color: '#b9c4d6', borderRadius: [5, 5, 0, 0] },
        label: { show: true, position: 'top', color: '#5c6b83', fontSize: 11, formatter: '{c}%' }
      },
      {
        name: '版本 B（胜出）', type: 'bar', data: [0.54, 10.2, 25], barWidth: 26,
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#23c694' }, { offset: 1, color: '#0da678' }]), borderRadius: [5, 5, 0, 0] },
        label: { show: true, position: 'top', color: '#078a63', fontSize: 11, fontWeight: 700, formatter: '{c}%' }
      }
    ]
  });
  window.addEventListener('resize', function () { chart.resize(); });
})();
