import {rules, createComparison} from "../lib/compare.js";

export function initSearching(searchField) {
    // @todo: #5.1 — настроить компаратор
    const compare = createComparison(
        // 1. Массив имен полей, которые мы проверяем
        [searchField], 
        
        // 2. Настройки + карта кастомных функций
        { 
            skipEmptyTargetValues: true,
            // Говорим библиотеке: "Если попросят проверить поле searchField, используй эту функцию"
            [searchField]: rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], false)
        }
    );

    return (data, state, action) => {
        // @todo: #5.2 — применить компаратор
        return data.filter(row => compare(row, state));
    }
}