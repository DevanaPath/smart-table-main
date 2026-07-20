import { rules, createComparison } from "../lib/compare.js";

export function initSearching(searchField) {
    const searchRule = rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], true);
    rules[searchField] = searchRule;
    const Compare = createComparison([searchField]);
    return (data, state, action) => data.filter(row => Compare(row, state));
}