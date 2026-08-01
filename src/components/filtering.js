import {createComparison, defaultRules} from "../lib/compare.js";

export function initFiltering(elements) {
    // Функция для заполнения селектов (вызывается после запроса к серверу)
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            elements[elementName].append(...Object.values(indexes[elementName]).map(name => {
                const el = document.createElement('option');
                el.textContent = name;
                el.value = name;
                return el;
            }))
        })
    }

    // Функция формирования параметров фильтрации для запроса
    const applyFiltering = (query, state, action) => {
        // Обработка очистки поля
        if (action && action.name === 'clear') {
            const fieldName = action.dataset.field;
            const parent = action.parentElement;
            const input = parent.querySelector('input');
            if (input) input.value = '';
            state[fieldName] = '';
        }

        // Формируем параметры фильтра
        const filter = {};
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                if (['INPUT', 'SELECT'].includes(elements[key].tagName) && elements[key].value) { 
                    filter[`filter[${elements[key].name}]`] = elements[key].value; 
                }
            }
        })

        // Если в фильтре что-то есть, мерджим его в запрос
        return Object.keys(filter).length ? Object.assign({}, query, filter) : query; 
    }

    return {
        updateIndexes,
        applyFiltering
    }
}