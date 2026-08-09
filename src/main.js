import './fonts/ys-display/fonts.css'
import './style.css'

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";

// Теперь initData возвращает объект с методами для запросов к серверу
const api = initData();

function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);
    return { ...state, rowsPerPage, page };
}

// Рендер становится асинхронным, так как ждёт ответа от сервера
async function render(action) {
    let state = collectState(); 
    let query = {}; // здесь собираем параметры для URL
    
    // Собираем запрос по цепочке: Поиск -> Фильтрация -> Сортировка -> Пагинация
    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action);

    // Отправляем запрос на сервер и получаем готовые строки и их общее количество
    const { total, items } = await api.getRecords(query); 

    // Перерисовываем пагинатор, опираясь на total от сервера
    updatePagination(total, query); 
    
    // Рендерим полученные элементы в таблицу
    sampleTable.render(items);
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

// Инициализация компонентов (теперь они возвращают функции для работы с query)
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

const applySearching = initSearching('search');

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

// Функция первичной подготовки (загружает списки продавцов для фильтров)
async function init() {
    const indexes = await api.getIndexes();
    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });
}

// Запуск: сначала подгружаем индексы, затем отрисовываем таблицу
init().then(render);