export default function TransactionList({ transactions, onDelete, onEdit }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 border mb-6">

      <h3 className="text-lg font-semibold mb-4">Movimientos</h3>

      {transactions.length === 0 ? (
        <p className="text-gray-500">No hay movimientos.</p>
      ) : (
        <ul className="space-y-3">
          {transactions.map((tx) => (
            <li
              key={tx.id}
              className="p-4 bg-gray-50 rounded-lg flex justify-between items-center border"
            >
              <div>
                <p
                  className={`text-lg font-bold ${
                    tx.type === "INCOME" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tx.type === "INCOME" ? "+ " : "- "}
                  ${tx.amount.toLocaleString("es-AR")}
                </p>
                <p className="text-sm text-gray-600">{tx.description}</p>
                <p className="text-xs text-gray-400">{tx.category}</p>
              </div>

              <div className="flex gap-3">
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => onEdit(tx)}
                >
                  ✏️
                </button>

                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => onDelete(tx.id)}
                >
                  🗑
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}
