import { getPages } from "../lib/utils.js";

export function initPagination(elements, createPage) {
    const { pages, fromRow, toRow, totalRows } = elements;

    return (data, state, action) => {
        const rowsPerPage = state.rowsPerPage;
        const pageCount = Math.ceil(data.length / rowsPerPage);
        let page = state.page;

        // @todo: #2.6 — обработать действия пагинации
        if (action) {
            switch (action.name) {
                case 'prev': page = Math.max(1, page - 1); break;
                case 'next': page = Math.min(pageCount, page + 1); break;
                case 'first': page = 1; break;
                case 'last': page = pageCount; break;
            }
        }

        // @todo: #2.1 — (уже вычислено выше)
        // @todo: #2.2 — вернуть нужные строки
        const skip = (page - 1) * rowsPerPage;
        const result = data.slice(skip, skip + rowsPerPage);

        // @todo: #2.3 — подготовить шаблон страницы
        const pageTemplate = pages.firstElementChild.cloneNode(true);
        pages.firstElementChild.remove();

        // @todo: #2.4 — вывести кнопки страниц
        const visiblePages = getPages(page, pageCount, 5);
        pages.replaceChildren(...visiblePages.map(pageNumber => {
            const el = pageTemplate.cloneNode(true);
            return createPage(el, pageNumber, pageNumber === page);
        }));

        // @todo: #2.5 — вывести статус
        fromRow.textContent = (page - 1) * rowsPerPage + 1;
        toRow.textContent = Math.min(page * rowsPerPage, data.length);
        totalRows.textContent = data.length;

        return result;
    };
}