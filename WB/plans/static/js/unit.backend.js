(function(){
  const qs = s => document.querySelector(s);
  const fmtMoney = n => (n==null||isNaN(n)) ? '—' : new Intl.NumberFormat('ru-RU').format(Math.round(n));
  const fmtPct   = n => (n==null||isNaN(n)) ? '—' : Math.round(n);

  const EL = {
    profile: qs('#profileFilter'),
    search: qs('#searchInput'),
    refresh: qs('#refreshBtn'),
    exportCsv: qs('#exportCsv'),
    rows: qs('#rowsBody'),
    kProfit: qs('#k_totalProfit'),
    kMargin: qs('#k_avgMargin'),
    meta: qs('#metaInfo'),
  };

  async function jget(url){
    const r = await fetch(url, {credentials:'same-origin'});
    if (!r.ok) throw new Error('HTTP '+r.status);
    return await r.json();
  }
  async function jpost(url, body){
    const r = await fetch(url, {
      method:'POST', credentials:'same-origin',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error('HTTP '+r.status);
    return await r.json();
  }

  // load profiles
  async function loadProfiles(){
    const data = await jget('/api/unit/profiles');
    const arr = data.profiles || [];
    EL.profile.innerHTML = `<option value="all">Все профили</option>` +
      arr.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  }

  function overrideInput(value, placeholder='—'){
    return `<input class="num w80 override" placeholder="${placeholder}" value="${value ?? ''}">`;
  }
  function profileSelect(profiles, selectedId){
    return `<select class="w140 profile-ov">
      <option value="">— по SKU / профилю —</option>
      ${profiles.map(p=>`<option value="${p.id}" ${p.id===selectedId?'selected':''}>${p.name}</option>`).join('')}
    </select>`;
  }

  async function loadRows(){
    EL.rows.innerHTML = `<tr><td colspan="15" class="muted">Загружаю…</td></tr>`;
    const params = new URLSearchParams();
    if (EL.profile.value && EL.profile.value!=='all') params.set('profile', EL.profile.value);
    if (EL.search.value.trim()) params.set('search', EL.search.value.trim());
    const data = await jget('/api/unit/rows' + (params.toString()?`?${params}`:''));

    const profs = (await jget('/api/unit/profiles')).profiles || []; // для селектов в таблице

    const rows = data.rows || [];
    if (!rows.length){
      EL.rows.innerHTML = `<tr><td colspan="15" class="muted">Нет данных</td></tr>`;
    } else {
      EL.rows.innerHTML = rows.map(r=>{
        const c = r.calc || {};
        // эфф. ставки для вывода подсказкой (title)
        const tip = `WB:${c.eff?.wb ?? '-'} TAX:${c.eff?.tax ?? '-'} ACOS:${c.eff?.acos ?? '-'} | LOG:${c.eff?.log ?? '-'} STO:${c.eff?.sto ?? '-'} RET:${c.eff?.ret ?? '-'}`;
        return `<tr data-sku="${r.sku}" title="${tip}">
          <td>${r.sku}</td>
          <td>${r.name||''}</td>
          <td>${profileSelect(profs, r.profile_id)}</td>
          <td class="num">${fmtMoney(r.price)}</td>
          <td class="num">${fmtMoney(r.cogs)}</td>
          <td class="num">${r.qty_month}</td>

          <td class="num">${overrideInput(null,'—')}</td>
          <td class="num">${overrideInput(null,'—')}</td>
          <td class="num">${overrideInput(null,'—')}</td>
          <td class="num">${overrideInput(null,'—')}</td>

          <td class="num ${c.profit_unit>=0?'pos':'neg'}">${fmtMoney(c.profit_unit)}</td>
          <td class="num ${c.margin_pct>=30?'pos':(c.margin_pct<0?'neg':'')}">${fmtPct(c.margin_pct)}</td>
          <td class="num ${c.profit_month>=0?'pos':'neg'}">${fmtMoney(c.profit_month)}</td>
          <td class="num">${c.breakeven_price!=null?fmtMoney(c.breakeven_price):'∞'}</td>
          <td class="num">${c.breakeven_acos_pct!=null?fmtPct(c.breakeven_acos_pct):'—'}</td>
        </tr>`;
      }).join('');
      hookRowEditors();
    }

    EL.kProfit.textContent = fmtMoney(data.summary?.total_profit_month) + ' ₽';
    EL.kMargin.textContent = (data.summary ? fmtPct(data.summary.avg_margin_pct) : '—') + '%';
    EL.meta.textContent = `Строк: ${data.summary?.count ?? 0}`;
  }

  function hookRowEditors(){
    // профили
    document.querySelectorAll('tbody .profile-ov').forEach(sel=>{
      sel.addEventListener('change', async (e)=>{
        const tr = e.target.closest('tr'); const sku = tr.dataset.sku;
        const profile_id = e.target.value || null;
        await jpost('/api/unit/override', { sku, profile_id });
        await loadRows();
      });
    });
    // оверрайды: ACOS / LOG / STO / RET — в порядке колонок
    document.querySelectorAll('tbody tr').forEach(tr=>{
      const sku = tr.dataset.sku;
      const inputs = tr.querySelectorAll('input.override');
      const [acosI, logI, stoI, retI] = inputs;
      function parse(v){ v = (v||'').trim(); return v===''? null : Number(v.replace(',','.')); }
      const send = async ()=>{
        await jpost('/api/unit/override', {
          sku,
          acos: parse(acosI.value) != null ? parse(acosI.value)/100 : null, // в API доля
          logistics: parse(logI.value),
          storage: parse(stoI.value),
          returns: parse(retI.value),
        });
        await loadRows();
      };
      inputs.forEach(inp => inp.addEventListener('change', send));
      inputs.forEach(inp => inp.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.target.blur(); } }));
    });
  }

  function exportCSV(){
    // соберём из текущей таблицы
    const header = ['SKU','Название','Профиль','Цена','Себестоимость','Кол-во/мес','Прибыль/ед.','Маржа%','Прибыль/мес','Безуб. цена','Безуб. ACOS%'];
    const rows = Array.from(document.querySelectorAll('#rowsBody tr')).map(tr=>{
      const tds = tr.querySelectorAll('td');
      return [
        tds[0].textContent.trim(), tds[1].textContent.trim(), tds[2].querySelector('select')?.selectedOptions[0]?.text || '',
        tds[3].textContent.trim(), tds[4].textContent.trim(), tds[5].textContent.trim(),
        tds[10].textContent.trim(), tds[11].textContent.trim(), tds[12].textContent.trim(),
        tds[13].textContent.trim(), tds[14].textContent.trim()
      ];
    });
    const csv = [header].concat(rows).map(a=>a.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'unit_economics_server.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  EL.refresh.addEventListener('click', loadRows);
  EL.search.addEventListener('input', ()=> { clearTimeout(EL._t); EL._t=setTimeout(loadRows, 300); });
  EL.profile.addEventListener('change', loadRows);
  EL.exportCsv.addEventListener('click', exportCSV);

  (async function init(){
    await loadProfiles();
    await loadRows();
    if (window.feather) feather.replace({});
  })();
})();
