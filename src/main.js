import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";

// 1. Вызов initData присваиваем константе API
const api = initData(sourceData);

/**
 * Сбор и обработка полей таблицы
 */
function collectState() {
  const state = processFormData(new FormData(sampleTable.container));
  const rowsPerPage = parseInt(state.rowsPerPage);
  const page = parseInt(state.page ?? 1);
  
  if (state.totalFrom || state.totalTo) {
    state.total = [
      state.totalFrom ? parseFloat(state.totalFrom) : undefined, 
      state.totalTo ? parseFloat(state.totalTo) : undefined
    ];
    delete state.totalFrom;
    delete state.totalTo;
  }
  
  return { ...state, rowsPerPage, page };
}

/**
 * 2. Функцию render() делаем асинхронной
 */
async function render(action) {
  let state = collectState();
  let query = {};
  
  query = applySearch(query, state, action);
  query = applyFiltering(query, state, action);
  query = applySorting(query, state, action);
  query = applyPagination(query, state, action);
  
  const { total, items } = await api.getRecords(query);
  
  updatePagination(total, query);
  sampleTable.render(items); 
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'], 
    after: ['pagination']
}, render);

// Инициализация компонентов (достаем две функции из пагинации и фильтрации)
const {applyPagination, updatePagination} = initPagination(
    sampleTable.pagination.elements,             
    (el, page, isCurrent) => {                    
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

const {applyFiltering, updateIndexes} = initFiltering(sampleTable.filter.elements);

const applySearch = initSearching('search');

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

// Асинхронная функция инициализации
async function init() {
    // Получаем индексы с сервера
    const indexes = await api.getIndexes();

    // Заполняем селекты фильтрации
    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });
}

// Запуск: сначала инициализация (загрузка селектов), затем рендер
await init().then(render);