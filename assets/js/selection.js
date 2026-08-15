/* 选品分析页：市场趋势图表 + 利润测算器 */
(function () {
  'use strict';
  if (typeof echarts === 'undefined') return;

  var FONT = getComputedStyle(document.documentElement).getPropertyValue('--font');

  function baseTextStyle() { return { color: '#5c6b83', fontFamily: FONT, fontSize: 12 }; }

  /* ---------- 市场规模 ---------- */
  var marketEl = document.getElementById('chartMarket');
  if (marketEl) {
    var years = ['2021', '2022', '2023', '2024', '2025E', '2026E', '2027E', '2028E'];
    var vals = [147, 158, 169, 182, 196, 210, 225, 241]; // 十亿美元
    var chart = echarts.init(marketEl);
    chart.setOption({
      grid: { left: 48, right: 20, top: 30, bottom: 34 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0e1f45', borderWidth: 0, textStyle: { color: '#fff', fontSize: 12 },
        formatter: function (ps) {
          var p = ps[0];
          return '<b>' + p.axisValue + '</b><br/>市场规模：$' + p.value + 'B';
        }
      },
      xAxis: { type: 'category', data: years, axisLine: { lineStyle: { color: '#d7deeb' } }, axisLabel: baseTextStyle() },
      yAxis: {
        type: 'value', name: '十亿美元', nameTextStyle: { color: '#8b98ad' },
        axisLabel: { ...baseTextStyle(), formatter: '{value}B' }, splitLine: { lineStyle: { color: '#edf1f8' } }
      },
      series: [{
        type: 'bar', data: vals, barWidth: 26,
        itemStyle: {
          borderRadius: [7, 7, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#ff8a3d' }, { offset: 1, color: '#ff6a13' }
          ])
        },
        label: { show: true, position: 'top', color: '#5c6b83', fontSize: 11, formatter: '{c}' }
      }, {
        type: 'line', data: vals, smooth: true, symbol: 'none',
        lineStyle: { color: '#2f6bff', width: 2, type: 'dashed' }
      }]
    });
    window.addEventListener('resize', function () { chart.resize(); });
  }

  /* ---------- 季节性 ---------- */
  var seasonEl = document.getElementById('chartSeason');
  if (seasonEl) {
    var months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    var svals = [104, 96, 88, 90, 86, 82, 84, 92, 101, 108, 112, 118];
    var schart = echarts.init(seasonEl);
    schart.setOption({
      grid: { left: 40, right: 16, top: 24, bottom: 26 },
      tooltip: { trigger: 'axis', backgroundColor: '#0e1f45', borderWidth: 0, textStyle: { color: '#fff', fontSize: 12 } },
      xAxis: { type: 'category', data: months, axisLine: { lineStyle: { color: '#d7deeb' } }, axisLabel: baseTextStyle() },
      yAxis: {
        type: 'value', name: '指数', nameTextStyle: { color: '#8b98ad' },
        axisLabel: baseTextStyle(), splitLine: { lineStyle: { color: '#edf1f8' } }
      },
      series: [{
        type: 'line', data: svals, smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { color: '#0da678', width: 3 },
        itemStyle: { color: '#0da678' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(13,166,120,.28)' }, { offset: 1, color: 'rgba(13,166,120,.02)' }
          ])
        }
      }]
    });
    window.addEventListener('resize', function () { schart.resize(); });
  }

  /* ---------- 利润测算器 ---------- */
  var FBA = 3.49, FEE_RATE = 0.15;
  var els = {
    rPrice: document.getElementById('rPrice'), rCog: document.getElementById('rCog'),
    rFreight: document.getElementById('rFreight'), rAcos: document.getElementById('rAcos')
  };
  function money(v) { return '$' + v.toFixed(2); }
  function calc() {
    var price = parseFloat(els.rPrice.value);
    var cog = parseFloat(els.rCog.value);
    var freight = parseFloat(els.rFreight.value);
    var acos = parseFloat(els.rAcos.value) / 100;
    var fee = price * FEE_RATE;
    var ad = price * acos;
    var gross = price - cog - freight - FBA - fee;
    var net = gross - ad;
    var set = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
    set('outPrice', money(price)); set('outCog', money(cog)); set('outFreight', money(freight)); set('outAcos', Math.round(acos * 100) + '%');
    set('kvPrice', money(price)); set('kvCog', '-' + money(cog)); set('kvFreight', '-' + money(freight));
    set('kvFee', '-' + money(fee)); set('kvAd', '-' + money(ad));
    set('kvPlatformPct', ((fee + FBA + ad) / price * 100).toFixed(1) + '%');
    set('rvGross', money(gross)); set('rvGrossPct', (gross / price * 100).toFixed(1) + '%');
    set('rvNet', money(net)); set('rvNetPct', (net / price * 100).toFixed(1) + '%');
  }
  if (els.rPrice) {
    Object.keys(els).forEach(function (k) {
      els[k].addEventListener('input', calc);
    });
    calc();
  }
})();
