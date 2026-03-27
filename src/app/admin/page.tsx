export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm font-medium">Ventas del Mes</h3>
          <p className="text-3xl font-bold text-primary mt-2">$0.00</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm font-medium">Pedidos Pendientes</h3>
          <p className="text-3xl font-bold text-white mt-2">0</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm font-medium">Productos Activos</h3>
          <p className="text-3xl font-bold text-white mt-2">0</p>
        </div>
      </div>
    </div>
  );
}
