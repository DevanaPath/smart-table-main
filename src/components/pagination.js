import { getPages } from "../lib/utils.js";

export function initPagination(elements, createPage) {
    const { pages, fromRow, toRow, totalRows } = elements;

    let pageCount; // Для хранения общего кол-ва страниц (нужно для кнопки "Последняя")

    // 1. Формируем параметры для запроса
    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        // Обработка кнопок переключения страниц (код из старого @todo: #2.6)
        if (action) switch(action.name) {
            case 'prev': page = Math.max(1, page - 1); break;
            case 'next': page = Math.min(pageCount, page + 1); break;
            case 'first': page = 1; break;
            case 'last': page = pageCount; break;
        }

        // Добавляем limit и page в общий объект запроса
        return Object.assign({}, query, {
            limit,
            page
        });
    }

    // 2. Перерисовываем пагинатор после получения данных
    const updatePagination = (total, { page, limit }) => {
        pageCount = Math.ceil(total / limit);

        // Отрисовка кнопок (код из старого @todo: #2.3 и #2.4)
        const pageTemplate = pages.firstElementChild.cloneNode(true);
        pages.firstElementChild.remove();

        const visiblePages = getPages(page, pageCount, 5);
        pages.replaceChildren(...visiblePages.map(pageNumber => {
            const el = pageTemplate.cloneNode(true);
            return createPage(el, pageNumber, pageNumber === page);
        }));

        // Обновление текста статуса (код из старого @todo: #2.5, rowsPerPage заменен на limit)
        fromRow.textContent = (page - 1) * limit + 1;
        toRow.textContent = Math.min((page * limit), total);
        totalRows.textContent = total;
    }

    return {
        updatePagination,
        applyPagination
    }
}