import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove();

    let pageCount; // Храним общее число страниц для кнопок "первая/последняя"

    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        // Обработка кликов по кнопкам навигации
        if (action) switch(action.name) {
            case 'prev': page = Math.max(1, page - 1); break;            
            case 'next': page = Math.min(pageCount, page + 1); break;    
            case 'first': page = 1; break;                                
            case 'last': page = pageCount; break;                        
        }

        // Добавляем limit и page в параметры запроса
        return Object.assign({}, query, { 
            limit,
            page
        });
    }

    const updatePagination = (total, { page, limit }) => {
        // Вычисляем количество страниц только на основе реального total с сервера
        pageCount = Math.ceil(total / limit);

        // Отрисовка кнопок со страницами
        const visiblePages = getPages(page, pageCount, 5);                
        pages.replaceChildren(...visiblePages.map(pageNumber => {        
            const el = pageTemplate.cloneNode(true);                    
            return createPage(el, pageNumber, pageNumber === page);        
        }));

        // Обновление текстовой информации (с какой по какую строку)
        fromRow.textContent = (page - 1) * limit + 1;                    
        toRow.textContent = Math.min((page * limit), total);    
        totalRows.textContent = total;                                
    }

    return {
        updatePagination,
        applyPagination
    }
}