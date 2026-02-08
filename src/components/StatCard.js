'use client';
export default function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-gray-800 rounded-xl p-2">
      <div className="flex items-center gap-1 mb-1">
        <Icon size={12} className={color} />
        <span className="text-gray-400 text-xs">{label}</span>
      </div>
      <p className={`text-base font-bold ${color}`}>
        ₹{value.toLocaleString('en-IN')}
      </p>
    </div>
  );
}
