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

const {data, ...indexes} = initData(sourceData);

function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);

    // ВОТ ОН — КОД ДЛЯ ПРЕОБРАЗОВАНИЯ ДИАПАЗОНА СУММЫ
    if (state.totalFrom || state.totalTo) {
        state.total = [
            state.totalFrom ? parseFloat(state.totalFrom) : undefined,
            state.totalTo ? parseFloat(state.totalTo) : undefined
        ];
        // Удаляем старые отдельные поля, чтобы компаратор не запутался
        delete state.totalFrom;
        delete state.totalTo;
    }

    return { ...state, rowsPerPage, page };
}

function render(action) {
    let state = collectState(); 
    let result = [...data]; 
    
    result = applySearching(result, state, action);
    result = applyFiltering(result, state, action);
    result = applySorting(result, state, action);
    result = applyPagination(result, state, action);

    sampleTable.render(result);
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

const applyPagination = initPagination(
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

const applyFiltering = initFiltering(sampleTable.filter.elements, {    
    searchBySeller: indexes.sellers                                    
}); 

const applySearching = initSearching('search');

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

render();