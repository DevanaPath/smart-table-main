import {rules, createComparison} from "../lib/compare.js";

export function initSearching(searchField) {
    // @todo: #5.1 — настроить компаратор
    const compare = createComparison(
        // 1 аргумент: массив строковых имен стандартных правил
        ['skipEmptyTargetValues'], 
        
        // 2 аргумент: массив кастомных функций-правил
        [
            rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], false)
        ]
    );

    return (data, state, action) => {
        // @todo: #5.2 — применить компаратор
        return data.filter(row => compare(row, state));
    }
}