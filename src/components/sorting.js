import {sortMap} from "../lib/sort.js";

export function initSorting(columns) {
    return (query, state, action) => {
        let field = null;
        let order = null;

        if (action && action.name === 'sort') {
            // Переключаем иконку и состояние кнопки по карте переходов
            action.dataset.value = sortMap[action.dataset.value];    
            field = action.dataset.field;                            
            order = action.dataset.value;                            

            // Сбрасываем все остальные кнопки сортировки
            columns.forEach(column => {                                    
                if (column.dataset.field !== action.dataset.field) {    
                    column.dataset.value = 'none';                        
                }
            });
        } else {
            // При обычном перерендере (без клика) ищем активную сортировку
            columns.forEach(column => {                        
                if (column.dataset.value !== 'none') {        
                    field = column.dataset.field;            
                    order = column.dataset.value;            
                }
            });
        }

        // Сервер ожидает формат sort=date:asc или sort=total:desc
        const sort = (field && order !== 'none') ? `${field}:${order}` : null; 

        return sort ? Object.assign({}, query, { sort }) : query; 
    }
}