/* 数据看板：90 天模拟数据 + 时间段/渠道/广告类型筛选 */
(function () {
  'use strict';
  if (typeof echarts === 'undefined') return;

  /* ============ 1. 生成 90 天模拟数据 ============ */
  var DAYS = 90;
  var fmt = function (d) { return (d.getMonth() + 1) + '/' + d.getDate(); };
  var data = [];
  var start = new Date(2026, 4, 17); // 2026-05-17
  for (var t = 0; t < DAYS; t++) {
    var d = new Date(start.getTime() + t * 86400000);
    var wd = d.getDay(); // 0 Sun
    var wk = (wd === 0 || wd === 6) ? 1.16 : (wd === 5 ? 1.08 : 0.94);
    var orders0 = 15 + 0.3777 * t - 0.000834 * t * t; // 15 → 42 件/天
    var orders = Math.round(orders0 * wk * (1 + (Math.random() - 0.5) * 0.1));
    var ctr = (0.42 + 0.08 * t / 89 + 0.10 / (1 + Math.exp(-(t - 45) / 4))) / 100; // 0.42% → 0.60%
    var cvr = (8 + 4.5 / (1 + Math.exp(-(t - 50) / 10))) / 100; // 8% → 12.5%
    var imp = Math.round(orders / (ctr * cvr));
    var clicks = Math.round(imp * ctr);
    var aov = 16.2 + (Math.random() - 0.5) * 1.4;
    var sales = orders * aov;
    var adShare = 0.88 - 0.26 * t / 89; // 广告单占比 88% → 62%
    var adOrders = Math.round(orders * adShare);
    var organicOrders = orders - adOrders;
    var adSales = adOrders * aov;
    var organicSales = organicOrders * aov;
    var acos = 0.24 + 0.21 * Math.exp(-t / 30); // 45% → 25%
    var spend = adSales * acos;
    // 广告类型拆分
    var sAuto = 0.22 - 0.08 * t / 89, sBroad = 0.20 - 0.06 * t / 89, sExact = 0.34 + 0.12 * t / 89;
    var sPhrase = 1 - sAuto - sBroad - sExact;
    var typeAcos = { auto: 1.35, broad: 1.25, phrase: 1.0, exact: 0.78 };
    data.push({
      t: t, label: fmt(d), imp: imp, clicks: clicks, orders: orders,
      adOrders: adOrders, organicOrders: organicOrders,
      sales: sales, adSales: adSales, organicSales: organicSales,
      spend: spend, acos: acos,
      spendAuto: spend * sAuto, spendBroad: spend * sBroad, spendPhrase: spend * sPhrase, spendExact: spend * sExact,
      acosAuto: acos * typeAcos.auto, acosBroad: acos * typeAcos.broad, acosPhrase: acos * typeAcos.phrase, acosExact: acos * typeAcos.exact
    });
  }

  /* ============ 2. 状态与工具 ============ */
  var state = { range: 7, channel: 'all', adtype: 'all' };
  var FONT = getComputedStyle(document.documentElement).getPropertyValue('--font');
  var money = function (v) { return '$' + Math.round(v).toLocaleString('en-US'); };
  var pct = function (v, d) { return (v * 100).toFixed(d || 1) + '%'; };
  var g = function (id) { return document.getElementById(id); };

  function slice(n) {
    return data.slice(DAYS - n);
  }
  function prevSlice(n) {
    return data.slice(DAYS - 2 * n, DAYS - n);
  }
  function sum(arr, key) { return arr.reduce(function (a, x) { return a + x[key]; }, 0); }

  function compute(range, channel) {
    var cur = slice(range), prev = prevSlice(range);
    var res = {
      imp: sum(cur, 'imp'), clicks: sum(cur, 'clicks'),
      orders: sum(cur, channel === 'ad' ? 'adOrders' : channel === 'organic' ? 'organicOrders' : 'orders'),
      sales: sum(cur, channel === 'ad' ? 'adSales' : channel === 'organic' ? 'organicSales' : 'sales'),
      adSales: sum(cur, 'adSales'), spend: sum(cur, 'spend')
    };
    // CTR / CVR 是 Listing 层面指标，不随订单渠道筛选变化
    res.ctr = sum(cur, 'clicks') / sum(cur, 'imp');
    res.cvr = sum(cur, 'orders') / sum(cur, 'clicks');
    res.aov = res.orders ? res.sales / res.orders : 0;
    res.acos = res.adSales ? res.spend / res.adSales : 0;
    res.roas = res.spend ? res.adSales / res.spend : 0;
    var p2 = {
      orders: sum(prev, channel === 'ad' ? 'adOrders' : channel === 'organic' ? 'organicOrders' : 'orders'),
      sales: sum(prev, channel === 'ad' ? 'adSales' : channel === 'organic' ? 'organicSales' : 'sales')
    };
    res.dOrders = p2.orders ? (res.orders - p2.orders) / p2.orders : 0;
    res.dSales = p2.sales ? (res.sales - p2.sales) / p2.sales : 0;
    // 库存
    var cum = 0;
    data.forEach(function (x) { cum += x.orders; });
    var arrived = 800; // 在途补货已入仓
    var remaining = 2500 + arrived - cum;
    var last7 = slice(7);
    var dailyAvg = sum(last7, 'orders') / 7;
    res.remaining = remaining;
    res.invDays = dailyAvg ? remaining / dailyAvg : 0;
    res.dailyAvg = dailyAvg;
    return res;
  }

  /* ============ 3. KPI 更新 ============ */
  function updateKpis() {
    var r = compute(state.range, state.channel);
    var el = function (id, v) { var e = g(id); if (e) e.textContent = v; };
    el('vCtr', pct(r.ctr, 2));
    el('vCvr', pct(r.cvr, 2));
    el('vAov', '$' + r.aov.toFixed(2));
    el('vSales', money(r.sales));
    el('subSales', '近 ' + state.range + ' 天' + (state.channel === 'ad' ? ' · 广告订单' : state.channel === 'organic' ? ' · 自然订单' : ' · 全部订单'));
    el('vAcos', pct(r.acos, 1));
    el('vRoas', r.roas.toFixed(2));
    el('vInvDays', Math.round(r.invDays) + ' 天');
    el('vDailySales', '约 ' + r.dailyAvg.toFixed(0) + ' 件/天');
    el('vInvDays2', '约 ' + Math.round(r.invDays) + ' 天');
    el('invHealthPct', '当前 ' + Math.round(r.invDays) + ' 天');
    var impEl = g('subImp');
    if (impEl) impEl.textContent = '近 ' + state.range + ' 天累计';
    var impVal = g('kpiGrid') ? document.querySelector('#kpiGrid .kpi .val') : null;
    if (impVal) {
      impVal.classList.remove('count-up');
      impVal.removeAttribute('data-count');
      animateKpiVal(impVal, r.imp);
    }
    var tag = g('salesTag');
    if (tag) tag.textContent = state.channel === 'ad' ? '广告订单' : state.channel === 'organic' ? '自然订单' : '全部订单';
  }

  /* KPI 数字滚动（避免与 main.js 的静态 count-up 冲突） */
  var animating = null;
  function animateKpiVal(el, target) {
    if (!el) return;
    if (animating) cancelAnimationFrame(animating);
    var start = null;
    var from = 0;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / 900, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (target - from) * eased).toLocaleString('en-US');
      if (p < 1) animating = requestAnimationFrame(frame);
    }
    animating = requestAnimationFrame(frame);
  }

  /* ============ 4. 图表 ============ */
  var charts = {};
  function make(id) { var el = g(id); if (!el) return null; var c = echarts.init(el); charts[id] = c; return c; }
  var cSales = make('chartSales'), cMix = make('chartMix'), cAd = make('chartAd'), cKw = make('chartKw');

  var tooltipStyle = { backgroundColor: '#0e1f45', borderWidth: 0, textStyle: { color: '#fff', fontSize: 12 } };

  function renderSales() {
    if (!cSales) return;
    var cur = slice(state.range);
    var weekly = [];
    if (state.range === 90) {
      for (var i = 0; i < cur.length; i += 7) {
        var chunk = cur.slice(i, i + 7);
        weekly.push({
          label: chunk[0].label + '~' + chunk[chunk.length - 1].label,
          orders: sum(chunk, state.channel === 'ad' ? 'adOrders' : state.channel === 'organic' ? 'organicOrders' : 'orders'),
          sales: sum(chunk, state.channel === 'ad' ? 'adSales' : state.channel === 'organic' ? 'organicSales' : 'sales')
        });
      }
    } else {
      cur.forEach(function (x) {
        weekly.push({
          label: x.label,
          orders: state.channel === 'ad' ? x.adOrders : state.channel === 'organic' ? x.organicOrders : x.orders,
          sales: state.channel === 'ad' ? x.adSales : state.channel === 'organic' ? x.organicSales : x.sales
        });
      });
    }
    cSales.setOption({
      grid: { left: 50, right: 54, top: 30, bottom: 30 },
      tooltip: { trigger: 'axis', ...tooltipStyle, formatter: function (ps) {
        var s = '<b>' + ps[0].axisValue + '</b>';
        ps.forEach(function (p) { s += '<br/>' + p.marker + p.seriesName + '：' + (p.seriesName.indexOf('销售额') > -1 ? '$' + Math.round(p.value).toLocaleString('en-US') : p.value); });
        return s;
      } },
      legend: { top: 0, textStyle: { color: '#5c6b83', fontSize: 12, fontFamily: FONT } },
      xAxis: { type: 'category', data: weekly.map(function (w) { return w.label; }), axisLabel: { color: '#5c6b83', fontFamily: FONT, interval: state.range === 90 ? 'auto' : 0 }, axisLine: { lineStyle: { color: '#d7deeb' } } },
      yAxis: [
        { type: 'value', name: '订单', nameTextStyle: { color: '#8b98ad' }, axisLabel: { color: '#5c6b83' }, splitLine: { lineStyle: { color: '#edf1f8' } } },
        { type: 'value', name: '销售额 $', nameTextStyle: { color: '#8b98ad' }, axisLabel: { color: '#5c6b83', formatter: function (v) { return '$' + v; } }, splitLine: { show: false } }
      ],
      series: [
        { name: '订单数', type: 'bar', data: weekly.map(function (w) { return w.orders; }), barWidth: state.range === 90 ? '45%' : '50%',
          itemStyle: { borderRadius: [5, 5, 0, 0], color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#5c8bff' }, { offset: 1, color: '#2f6bff' }]) } },
        { name: '销售额', type: 'line', yAxisIndex: 1, data: weekly.map(function (w) { return Math.round(w.sales); }), smooth: true, symbolSize: 6,
          lineStyle: { color: '#ff7a2a', width: 3 }, itemStyle: { color: '#ff7a2a' } }
      ]
    }, true);
  }

  function renderMix() {
    if (!cMix) return;
    var cur = slice(state.range);
    var weekly = [];
    if (state.range === 90) {
      for (var i = 0; i < cur.length; i += 7) {
        var chunk = cur.slice(i, i + 7);
        weekly.push({ label: chunk[0].label + '~' + chunk[chunk.length - 1].label, ad: sum(chunk, 'adOrders'), organic: sum(chunk, 'organicOrders') });
      }
    } else {
      cur.forEach(function (x) { weekly.push({ label: x.label, ad: x.adOrders, organic: x.organicOrders }); });
    }
    cMix.setOption({
      grid: { left: 44, right: 16, top: 30, bottom: 30 },
      tooltip: { trigger: 'axis', ...tooltipStyle, formatter: function (ps) {
        var s = '<b>' + ps[0].axisValue + '</b>';
        ps.forEach(function (p) { s += '<br/>' + p.marker + p.seriesName + '：' + p.value; });
        return s;
      } },
      legend: { top: 0, textStyle: { color: '#5c6b83', fontSize: 12, fontFamily: FONT } },
      xAxis: { type: 'category', data: weekly.map(function (w) { return w.label; }), axisLabel: { color: '#5c6b83', fontFamily: FONT, interval: state.range === 90 ? 'auto' : 0 }, axisLine: { lineStyle: { color: '#d7deeb' } } },
      yAxis: { type: 'value', name: '订单', nameTextStyle: { color: '#8b98ad' }, axisLabel: { color: '#5c6b83' }, splitLine: { lineStyle: { color: '#edf1f8' } } },
      series: [
        { name: '广告订单', type: 'bar', stack: 'x', data: weekly.map(function (w) { return w.ad; }), itemStyle: { color: '#ff8a3d' } },
        { name: '自然订单', type: 'bar', stack: 'x', data: weekly.map(function (w) { return w.organic; }), itemStyle: { color: '#0da678' } }
      ]
    }, true);
  }

  function renderAd() {
    if (!cAd) return;
    var cur = slice(state.range);
    var key = state.adtype;
    var weekly = [];
    if (state.range === 90) {
      for (var i = 0; i < cur.length; i += 7) {
        var chunk = cur.slice(i, i + 7);
        var sp = key === 'all' ? sum(chunk, 'spend') : sum(chunk, 'spend' + key[0].toUpperCase() + key.slice(1));
        var ac = sum(chunk, 'spend') / (sum(chunk, 'adSales') || 1);
        if (key !== 'all') {
          var acSum = 0, acN = 0;
          chunk.forEach(function (x) { acSum += x['acos' + key[0].toUpperCase() + key.slice(1)]; acN++; });
          ac = acSum / acN;
        }
        weekly.push({ label: chunk[0].label + '~' + chunk[chunk.length - 1].label, spend: sp, acos: ac });
      }
    } else {
      cur.forEach(function (x) {
        var sp = key === 'all' ? x.spend : x['spend' + key[0].toUpperCase() + key.slice(1)];
        var ac = key === 'all' ? x.acos : x['acos' + key[0].toUpperCase() + key.slice(1)];
        weekly.push({ label: x.label, spend: sp, acos: ac });
      });
    }
    cAd.setOption({
      grid: { left: 50, right: 54, top: 30, bottom: 30 },
      tooltip: { trigger: 'axis', ...tooltipStyle, formatter: function (ps) {
        var s = '<b>' + ps[0].axisValue + '</b>';
        ps.forEach(function (p) { s += '<br/>' + p.marker + p.seriesName + '：' + (p.seriesName === 'ACOS' ? pct(p.value, 1) : '$' + p.value.toFixed(0)); });
        return s;
      } },
      legend: { top: 0, textStyle: { color: '#5c6b83', fontSize: 12, fontFamily: FONT } },
      xAxis: { type: 'category', data: weekly.map(function (w) { return w.label; }), axisLabel: { color: '#5c6b83', fontFamily: FONT, interval: state.range === 90 ? 'auto' : 0 }, axisLine: { lineStyle: { color: '#d7deeb' } } },
      yAxis: [
        { type: 'value', name: '花费 $', nameTextStyle: { color: '#8b98ad' }, axisLabel: { color: '#5c6b83' }, splitLine: { lineStyle: { color: '#edf1f8' } } },
        { type: 'value', name: 'ACOS', nameTextStyle: { color: '#8b98ad' }, max: 0.6, axisLabel: { color: '#5c6b83', formatter: function (v) { return pct(v, 0); } }, splitLine: { show: false } }
      ],
      series: [
        { name: '广告花费', type: 'bar', data: weekly.map(function (w) { return Math.round(w.spend); }), barWidth: state.range === 90 ? '45%' : '50%',
          itemStyle: { borderRadius: [5, 5, 0, 0], color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#ffb27a' }, { offset: 1, color: '#ff7a2a' }]) } },
        { name: 'ACOS', type: 'line', yAxisIndex: 1, data: weekly.map(function (w) { return +w.acos.toFixed(4); }), smooth: true, symbolSize: 6,
          lineStyle: { color: '#e5484d', width: 3 }, itemStyle: { color: '#e5484d' } }
      ]
    }, true);
    var tag = g('adTypeTag');
    if (tag) tag.textContent = state.adtype === 'all' ? '全部广告' : ({ auto: '自动', broad: '广泛', phrase: '词组', exact: '精准' })[state.adtype] + '广告';
  }

  function renderKw() {
    if (!cKw) return;
    var kws = [
      { name: 'slow feeder dog bowl', orders: 412, acos: 0.24 },
      { name: 'dog slow feeder', orders: 296, acos: 0.22 },
      { name: 'slow feed bowl for dogs', orders: 231, acos: 0.21 },
      { name: 'anti gulping dog bowl', orders: 187, acos: 0.19 },
      { name: 'interactive dog bowl', orders: 142, acos: 0.26 },
      { name: 'puzzle bowl for dogs', orders: 118, acos: 0.23 },
      { name: 'dog bowl with suction cup', orders: 96, acos: 0.18 },
      { name: 'slow dog bowl large', orders: 74, acos: 0.25 },
      { name: 'dog feeding bowl slow', orders: 58, acos: 0.27 },
      { name: 'non slip dog bowl', orders: 45, acos: 0.20 }
    ].reverse();
    cKw.setOption({
      grid: { left: 190, right: 60, top: 10, bottom: 24 },
      tooltip: { trigger: 'axis', ...tooltipStyle, formatter: function (ps) {
        var p = ps[0];
        var kw = kws[ps[0].dataIndex];
        return '<b>' + p.name + '</b><br/>订单：' + p.value + '<br/>ACOS：' + pct(kw ? kw.acos : 0, 0);
      } },
      xAxis: { type: 'value', name: '订单', nameTextStyle: { color: '#8b98ad' }, axisLabel: { color: '#5c6b83' }, splitLine: { lineStyle: { color: '#edf1f8' } } },
      yAxis: { type: 'category', data: kws.map(function (k) { return k.name; }), axisLabel: { color: '#5c6b83', fontFamily: FONT, fontSize: 11 }, axisLine: { lineStyle: { color: '#d7deeb' } } },
      series: [{
        type: 'bar', data: kws.map(function (k) { return k.orders; }), barWidth: '58%',
        label: { show: true, position: 'right', color: '#16233c', fontSize: 11, fontFamily: 'var(--mono)' },
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#0da678' }, { offset: 1, color: '#23c694' }])
        }
      }]
    }, true);
  }

  /* ============ 5. 事件绑定 ============ */
  function bindTabs(sel, prop, values) {
    var btns = document.querySelectorAll(sel + ' button');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        state[prop] = b.getAttribute(values);
        refresh();
      });
    });
  }
  bindTabs('#channelTabs', 'channel', 'data-channel');
  bindTabs('#adtypeTabs', 'adtype', 'data-adtype');

  // 时间范围
  var rangeBtns = document.querySelectorAll('[data-tabs] button');
  rangeBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var m = b.getAttribute('data-tab').match(/[0-9]+/);
      if (m) state.range = parseInt(m[0], 10);
      refresh();
    });
  });
  window.addEventListener('tabchange', function () {
    // main.js 已在 tab 点击时更新 active，这里同步 range 后重绘
    refresh();
  });

  function refresh() {
    updateKpis();
    renderSales();
    renderMix();
    renderAd();
    renderKw();
  }

  refresh();

  window.addEventListener('resize', function () {
    Object.keys(charts).forEach(function (k) { if (charts[k]) charts[k].resize(); });
  });
})();
