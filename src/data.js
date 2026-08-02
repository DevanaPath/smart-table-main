const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData() {
  let sellers;
  let customers;
  let lastResult;
  let lastQuery;

  const mapRecords = (data) => data.map(item => ({
    id: item.receipt_id,
    date: item.date,
    seller: sellers?.[item.seller_id] ?? '',
    customer: customers?.[item.customer_id] ?? '',
    total: item.total_amount
  }));

  const fetchIndexes = async () => {
    const [sellersList, customersList] = await Promise.all([
      fetch(`${BASE_URL}/sellers`).then(res => res.json()),
      fetch(`${BASE_URL}/customers`).then(res => res.json()),
    ]);
    
    // API отдаёт массивы — превращаем их в объекты { [id]: "Имя Фамилия" }
    sellers = Array.isArray(sellersList)
      ? Object.fromEntries(sellersList.map(s => [s.id, `${s.first_name} ${s.last_name}`]))
      : sellersList;
      
    customers = Array.isArray(customersList)
      ? Object.fromEntries(customersList.map(c => [c.id, `${c.first_name} ${c.last_name}`]))
      : customersList;
  };

  const getIndexes = async () => {
    if (!sellers || !customers) {
      await fetchIndexes();
    }
    return { sellers, customers };
  };

  const getRecords = async (query = {}, isUpdated = false) => {
    // Если индексы ещё не загружены — подгружаем
    if (!sellers || !customers) {
      await fetchIndexes();
    }

    const qs = new URLSearchParams(query);
    const nextQuery = qs.toString();

    if (lastQuery === nextQuery && !isUpdated) {
      return lastResult;
    }

    const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
    const records = await response.json();

    lastQuery = nextQuery;
    lastResult = {
      total: records.total,
      items: mapRecords(records.items)
    };

    return lastResult;
  };

  return { getIndexes, getRecords };
}