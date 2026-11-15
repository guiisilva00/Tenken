import styles from "./AdminTable.module.css";

export default function TabelaAdmin({
  columns,
  children,
  loading = false,
  loadingMessage = "Carregando...",
  empty = false,
  emptyMessage = "Nenhum registro encontrado.",
  minWidth = "42.5rem",
  tableClassName = "",
  pagination,
}) {
  return (
    <section className={styles.card}>
      <div className={styles.responsive}>
        <table
          className={`${styles.table} ${tableClassName}`}
          style={{ minWidth }}
          aria-busy={loading}
        >
          <thead>
            <tr>
              {columns.map((column) => {
                const label =
                  typeof column === "string" ? column : column.label;
                const align =
                  typeof column === "string" ? undefined : column.align;
                return (
                  <th
                    key={label}
                    scope="col"
                    style={align ? { textAlign: align } : undefined}
                  >
                    {label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={styles.empty}
                  role="status"
                >
                  {loadingMessage}
                </td>
              </tr>
            ) : empty ? (
              <tr>
                <td colSpan={columns.length} className={styles.empty}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <footer className={styles.pagination}>
          <span className={styles.paginationInfo}>{pagination.info}</span>
          <div className={styles.paginationButtons}>
            <button
              type="button"
              disabled={pagination.page === 1}
              onClick={() => pagination.onChange(pagination.page - 1)}
              className={styles.pageButton}
              aria-label="Página anterior"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                chevron_left
              </span>
            </button>
            {Array.from(
              { length: pagination.totalPages },
              (_, index) => index + 1,
            )
              .slice(0, 7)
              .map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => pagination.onChange(page)}
                  className={`${styles.pageButton} ${page === pagination.page ? styles.pageButtonActive : ""}`}
                  aria-current={page === pagination.page ? "page" : undefined}
                >
                  {page}
                </button>
              ))}
            <button
              type="button"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => pagination.onChange(pagination.page + 1)}
              className={styles.pageButton}
              aria-label="Próxima página"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                chevron_right
              </span>
            </button>
          </div>
        </footer>
      )}
    </section>
  );
}
