import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function StatsCharts({ transactions }) {

  const incomes = transactions.filter(t => t.type === "INCOME");
  const expenses = transactions.filter(t => t.type === "EXPENSE");

  const incomeCategories = {};
  incomes.forEach(t => {
    incomeCategories[t.category] = (incomeCategories[t.category] || 0) + t.amount;
  });

  const expenseCategories = {};
  expenses.forEach(t => {
    expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">

      {/* PIE INCOMES */}
      <div className="bg-white p-6 rounded shadow border">
        <h3 className="text-lg font-bold mb-3">Distribución de Ingresos</h3>
        <Pie
          data={{
            labels: Object.keys(incomeCategories),
            datasets: [{
              data: Object.values(incomeCategories),
              backgroundColor: ["#4ade80", "#22c55e", "#16a34a", "#15803d"],
            }],
          }}
        />
      </div>

      {/* PIE EXPENSES */}
      <div className="bg-white p-6 rounded shadow border">
        <h3 className="text-lg font-bold mb-3">Distribución de Gastos</h3>
        <Pie
          data={{
            labels: Object.keys(expenseCategories),
            datasets: [{
              data: Object.values(expenseCategories),
              backgroundColor: ["#f87171", "#ef4444", "#dc2626", "#b91c1c"],
            }],
          }}
        />
      </div>

      {/* BARS */}
      <div className="bg-white p-6 rounded shadow border md:col-span-2">
        <h3 className="text-lg font-bold mb-3">Ingresos vs Gastos</h3>
        <Bar
          data={{
            labels: ["Ingresos", "Gastos"],
            datasets: [{
              label: "Monto total",
              data: [
                incomes.reduce((acc, t) => acc + t.amount, 0),
                expenses.reduce((acc, t) => acc + t.amount, 0)
              ],
              backgroundColor: ["#22c55e", "#ef4444"],
            }],
          }}
        />
      </div>

    </div>
  );
}
