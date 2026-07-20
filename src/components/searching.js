import {rules, createComparison} from "../lib/compare.js";

export function initSearching(searchField) {
    // 1. МАГИЯ: Мы добавляем нашу функцию в общий словарь rules под ключом 'search'.
    // Теперь, когда compare.js сделает rules['search'](), он найдет её!
    rules[searchField] = rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], false);

    // 2. Передаем массив со строкой (именем поля)
    // 3. Вторым аргументом передаем настройки, как написано в задании
    const compare = createComparison(
        [searchField], 
        { skipEmptyTargetValues: true }
    );

    return (data, state, action) => {
        return data.filter(row => compare(row, state));
    }
}