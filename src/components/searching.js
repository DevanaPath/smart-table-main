import {rules, createComparison} from "../lib/compare.js";

export function initSearching(searchField) {
    // РЕШЕНИЕ: Добавляем нашу функцию в словарь правил библиотеки.
    // Теперь, когда compare.js захочет вызвать rules['search'](), он найдет её здесь!
    rules[searchField] = rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], false);

    // @todo: #5.1 — настроить компаратор
    const compare = createComparison(
        [searchField], // Передаем просто массив имен полей (строк)
        { skipEmptyTargetValues: true } // Настройки
    );

    return (data, state, action) => {
        // @todo: #5.2 — применить компаратор
        return data.filter(row => compare(row, state));
    }
}