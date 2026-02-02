export default function BalanceCard({ balance, title = "Balance actual" }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 border border-amber-200">
      <h2 className="text-lg font-semibold mb-1 text-gray-600">
        {title}
      </h2>

      <p
        className={`text-3xl font-bold ${
          balance >= 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        ${balance.toLocaleString("es-AR")} <span className="text-base font-semibold">ARS</span>
      </p>
    </div>
  );
}
