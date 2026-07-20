import {rules, createComparison} from "../lib/compare.js";

export function initSearching(searchField) {
    // @todo: #5.1
    const compare = createComparison(
        [ rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], false) ],
        { skipEmptyTargetValues: true }
    );

    return (data, state, action) => {
        // @todo: #5.2
        return data.filter(row => compare(row, state));
    }
}