import { rules, createComparison } from "../lib/compare.js";

export function initSearching(searchField) {
    // Третий параметр true — пропускать пустые значения (skipEmptyTargetValues)
    const searchRule = rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], true);
    rules[searchField] = searchRule;                // регистрируем правило по имени
    const Compare = createComparison([searchField]); // передаём только массив имён

    return (data, state, action) => data.filter(row => Compare(row, state));
}