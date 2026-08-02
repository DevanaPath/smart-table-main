import {rules, createComparison} from "../lib/compare.js";

export function initSearching(searchField) {
    // query заменяет data. Проверяем, введено ли что-то в поиск
    return (query, state, action) => {
        return state[searchField] ? Object.assign({}, query, {
            search: state[searchField]
        }) : query;
    }
}