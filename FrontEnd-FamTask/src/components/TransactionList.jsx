import { useEffect, useMemo, useState } from "react";

export default function TransactionList({ transactions, onDelete, onEdit }) {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // resetear página si cambian filtros o cantidad por página
    setPage(1);
  }, [transactions, pageSize]);

  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return transactions.slice(start, start + pageSize);
  }, [transactions, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  return (
    <div className="bg-white shadow-md rounded-xl p-6 border mb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold">Movimientos</h3>
          <p className="text-xs text-gray-500 mt-1">
            Moneda: $ ARS (pesos argentinos)
          </p>
        </div>

        {transactions.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-sm text-gray-600">
              Mostrando{" "}
              <span className="font-semibold">{pageItems.length}</span> de{" "}
              <span className="font-semibold">{transactions.length}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Por página</span>
              <select
                className="border p-2 rounded"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 rounded border font-semibold disabled:opacity-40"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                type="button"
              >
                ◀
              </button>

              <div className="text-sm text-gray-700">
                Página <span className="font-semibold">{page}</span> de{" "}
                <span className="font-semibold">{totalPages}</span>
              </div>

              <button
                className="px-3 py-2 rounded border font-semibold disabled:opacity-40"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                type="button"
              >
                ▶
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      {transactions.length === 0 ? (
        <p className="text-gray-500">No hay movimientos.</p>
      ) : (
        <ul className="space-y-3">
          {pageItems.map((tx) => (
            <li
              key={tx.id}
              className="p-4 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-start justify-between gap-4">
                {/* IZQUIERDA: concepto */}
                <div className="min-w-0">
                  <p className="text-sm text-gray-600 truncate">
                    {tx.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {tx.category}
                  </p>
                </div>

                {/* DERECHA: monto */}
                <div className="text-right shrink-0">
                  <p
                    className={`text-lg font-bold ${
                      tx.type === "INCOME"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {tx.type === "INCOME" ? "+ " : "- "}$
                    {formatAmount(tx.amount)}{" "}
                    <span className="text-sm font-semibold">ARS</span>
                  </p>

                  <div className="flex justify-end gap-3 mt-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => onEdit(tx)}
                      type="button"
                      title="Editar"
                    >
                      ✏️
                    </button>

                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => onDelete(tx.id)}
                      type="button"
                      title="Eliminar"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
