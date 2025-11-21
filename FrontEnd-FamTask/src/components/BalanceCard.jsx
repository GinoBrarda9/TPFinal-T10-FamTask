export default function BalanceCard({ balance }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 mb-6 border border-amber-200">
      <h2 className="text-xl font-semibold mb-2 text-gray-700">Balance actual</h2>

      <p
        className={`text-3xl font-bold ${
          balance >= 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        ${balance.toLocaleString("es-AR")}
      </p>
    </div>
  );
}
