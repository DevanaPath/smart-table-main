import { getPages } from "../lib/utils.js";

export function initPagination(elements, createPage) {
  const { pages, fromRow, toRow, totalRows } = elements;
  let pageCount = 1;

  const applyPagination = (query, state, action) => {
    const limit = parseInt(state.rowsPerPage, 10) || 10;
    let page = parseInt(state.page, 10) || 1;

    if (action) {
      switch (action.name) {
        case 'prev':  page = Math.max(1, page - 1); break;
        case 'next':  page = Math.min(pageCount, page + 1); break;
        case 'first': page = 1; break;
        case 'last':  page = pageCount; break;
      }
    }

    return Object.assign({}, query, { limit, page });
  };

  const updatePagination = (total, { page, limit }) => {
    const safeTotal = Number(total) || 0;
    const safeLimit = Number(limit) || 10;
    const safePage = Number(page) || 1;

    pageCount = Math.max(1, Math.ceil(safeTotal / safeLimit));

    // Пересоздаем кнопки страниц
    const pageTemplate = pages.firstElementChild?.cloneNode(true);
    if (pages.firstElementChild) {
      pages.firstElementChild.remove();
    }

    const visiblePages = getPages(safePage, pageCount, 5);
    pages.replaceChildren(...visiblePages.map(pageNumber => {
      const el = pageTemplate.cloneNode(true);
      return createPage(el, pageNumber, pageNumber === safePage);
    }));

    fromRow.textContent = safeTotal > 0 ? (safePage - 1) * safeLimit + 1 : 0;
    toRow.textContent = Math.min(safePage * safeLimit, safeTotal);
    totalRows.textContent = safeTotal;
  };

  return { updatePagination, applyPagination };
}