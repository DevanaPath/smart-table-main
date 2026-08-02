const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData(sourceData) {
  let sellers;
  let customers;
  let lastResult;
  let lastQuery;
  const hasLocalData = !!sourceData;

  // Превращаем массивы [{id, first_name, last_name}] в объекты {[id]: "Имя Фамилия"}
  const normalizePersons = (list) => {
    if (!Array.isArray(list)) return list || {};
    return Object.fromEntries(
      list.map(p => [p.id, `${p.first_name} ${p.last_name}`])
    );
  };

  const mapRecords = (data) => data.map(item => ({
    id: item.receipt_id,
    date: item.date,
    seller: sellers?.[item.seller_id] ?? '',
    customer: customers?.[item.customer_id] ?? '',
    total: item.total_amount
  }));

  // ===== Локальная реализация (без сети) =====
  const ensureLocalIndexes = () => {
    if (!sellers || !customers) {
      sellers = normalizePersons(sourceData.sellers);
      customers = normalizePersons(sourceData.customers);
    }
  };

  const localGetRecords = (query) => {
    ensureLocalIndexes();
    let list = [...sourceData.purchase_records];

    // Поиск по всем видимым полям
    if (query.search) {
      const q = String(query.search).toLowerCase();
      list = list.filter(rec => {
        const mapped = mapRecords([rec])[0];
        return ['id', 'date', 'seller', 'customer', 'total'].some(k =>
          String(mapped[k] ?? '').toLowerCase().includes(q)
        );
      });
    }

    // Фильтрация
    for (const [key, val] of Object.entries(query)) {
      if (!val || !key.startsWith('filter[')) continue;
      const field = key.slice(7, -1); // filter[X] → X
      if (field === 'seller') {
        list = list.filter(r => (sellers?.[r.seller_id] ?? '') === val);
      } else if (field === 'customer') {
        list = list.filter(r => (customers?.[r.customer_id] ?? '') === val);
      } else if (field === 'dateFrom') {
        list = list.filter(r => r.date >= val);
      } else if (field === 'dateTo') {
        list = list.filter(r => r.date <= val);
      } else if (field === 'totalFrom') {
        list = list.filter(r => r.total_amount >= parseFloat(val));
      } else if (field === 'totalTo') {
        list = list.filter(r => r.total_amount <= parseFloat(val));
      }
    }

    // Сортировка
    if (query.sort) {
      const [field, order] = String(query.sort).split(':');
      const dir = order === 'asc' ? 1 : -1;
      list.sort((a, b) => {
        let av, bv;
        if (field === 'date') { av = a.date; bv = b.date; }
        else if (field === 'total') { av = a.total_amount; bv = b.total_amount; }
        else if (field === 'seller') { av = sellers?.[a.seller_id] ?? ''; bv = sellers?.[b.seller_id] ?? ''; }
        else if (field === 'customer') { av = customers?.[a.customer_id] ?? ''; bv = customers?.[b.customer_id] ?? ''; }
        else { av = a[field]; bv = b[field]; }
        if (av == null) av = '';
        if (bv == null) bv = '';
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });
    }

    // Пагинация
    const total = list.length;
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = parseInt(query.limit, 10) || 10;
    const start = (page - 1) * limit;
    const items = list.slice(start, start + limit);

    return { total, items: mapRecords(items) };
  };

  // ===== API реализация (fallback) =====
  const fetchIndexes = async () => {
    const [sellersList, customersList] = await Promise.all([
      fetch(`${BASE_URL}/sellers`).then(r => r.json()),
      fetch(`${BASE_URL}/customers`).then(r => r.json()),
    ]);
    sellers = normalizePersons(sellersList);
    customers = normalizePersons(customersList);
  };

  const getIndexes = async () => {
    if (hasLocalData) {
      ensureLocalIndexes();
      return { sellers, customers };
    }
    if (!sellers || !customers) await fetchIndexes();
    return { sellers, customers };
  };

  const getRecords = async (query = {}, isUpdated = false) => {
    const qs = new URLSearchParams(query).toString();

    if (hasLocalData) {
      if (lastQuery === qs && !isUpdated) return lastResult;
      lastQuery = qs;
      lastResult = localGetRecords(query);
      return lastResult;
    }

    if (!sellers || !customers) await fetchIndexes();
    if (lastQuery === qs && !isUpdated) return lastResult;

    const response = await fetch(`${BASE_URL}/records?${qs}`);
    const records = await response.json();
    lastQuery = qs;
    lastResult = { total: records.total, items: mapRecords(records.items) };
    return lastResult;
  };

  return { getIndexes, getRecords };
}