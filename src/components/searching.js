import {rules, createComparison} from "../lib/compare.js";

export function initSearching(searchField) {
    // 1. Создаем свой маленький набор правил (точная копия структуры defaultRules)
    const searchRules = [
        {
            name: searchField,
            rule: rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], false)
        }
    ];
    
    // 2. Добавляем нужную настройку прямо в этот массив 
    // (в JS массивы являются объектами, поэтому мы можем вешать на них свойства)
    searchRules.skipEmptyTargetValues = true;

    // 3. Передаем всё это так же, как это сделано в filtering.js!
    const compare = createComparison(searchRules);

    return (data, state, action) => {
        return data.filter(row => compare(row, state));
    }
}