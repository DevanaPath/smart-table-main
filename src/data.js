import { makeIndex } from "./lib/utils.js";

export function initData(sourceData) {
  const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';
  
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

  const getIndexes = async () => {
    if (!sellers || !customers) {
      [sellers, customers] = await Promise.all([
        fetch(`${BASE_URL}/sellers`).then(res => res.json()),
        fetch(`${BASE_URL}/customers`).then(res => res.json()),
      ]);
    }
    return { sellers, customers };
  };

  const getRecords = async (query, isUpdated = false) => {
    try {
      const qs = new URLSearchParams(query);
      const nextQuery = qs.toString();

      // Кеширование
      if (lastQuery === nextQuery && !isUpdated) {
        return lastResult;
      }

      const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const records = await response.json();
      lastQuery = nextQuery;
      lastResult = {
        total: Number(records.total) || 0,
        items: mapRecords(records.items || [])
      };
      return lastResult;
    } catch (err) {
      console.error('API error:', err);
      return { total: 0, items: [] };
    }
  };

  return { getIndexes, getRecords };
}