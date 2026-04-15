import { useState } from "react";
import Header from "../components/Header";
import TopTabs from "../components/Toptabs";
import { useCropSeason } from "../context/CropSeasonContext";
import { authHeader } from "../utils/auth";

const API = import.meta.env.VITE_API_URL;

export default function Expenses() {
  const { cropSeasons, expenses, refreshData } = useCropSeason();
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States
  const [category, setCategory] = useState("Seeds");
  const [desc, setDesc] = useState(""); // This is now optional
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [cropRecordId, setCropRecordId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Format description: if desc is empty, just show the [Category]
    const finalDescription = desc.trim() 
      ? `[${category}] ${desc.trim()}` 
      : `[${category}]`;

    try {
      const res = await fetch(`${API}/expenses`, {
        method: "POST",
        headers: { 
          ...authHeader(), 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          description: finalDescription, 
          amount: Number(amount),
          date,
          cropRecordId: cropRecordId || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save expense");

      // Reset form
      setDesc("");
      setAmount("");
      setDate("");
      setCropRecordId("");
      setCategory("Seeds");
      
      refreshData();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await fetch(`${API}/expenses/${id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      refreshData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const list = showAll ? expenses : expenses.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <TopTabs />

        <form className="bg-white rounded-xl shadow-sm p-4 mt-6" onSubmit={handleSubmit}>
          <h3 className="font-semibold text-orange-600 mb-3">+ Add Expense</h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Category Dropdown */}
            <select 
              className="border px-3 py-2 rounded focus:ring-2 focus:ring-orange-300 outline-none text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {["Seeds", "Fertilizer", "Pesticide", "Labour", "Irrigation", "Equipment", "Transport", "Other"].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Optional Details (removed 'required') */}
            <input
              className="border px-3 py-2 rounded focus:ring-2 focus:ring-orange-300 outline-none text-sm"
              placeholder="Details (Optional - e.g. 50kg bag)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />

            <input
              type="number"
              className="border px-3 py-2 rounded focus:ring-2 focus:ring-orange-300 outline-none text-sm"
              placeholder="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <input
              type="date"
              className="border px-3 py-2 rounded focus:ring-2 focus:ring-orange-300 outline-none text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <select
              className="border px-3 py-2 rounded text-sm text-gray-600 outline-none"
              value={cropRecordId}
              onChange={(e) => setCropRecordId(e.target.value)}
              required
            >
              <option value="">-- Link to Crop Season --</option>
              {cropSeasons.map((c) => (
                <option key={c.cropId} value={c.cropId}>
                  {c.cropName} · {c.season} {c.year}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Expense"}
          </button>
        </form>

        <div className="bg-white rounded-xl shadow-sm p-4 mt-6">
          <div className="flex justify-between mb-4 border-b pb-2">
            <h3 className="font-semibold text-gray-700">Recent Expenses</h3>
            {expenses.length > 3 && (
              <button onClick={() => setShowAll(!showAll)} className="text-orange-600 text-sm font-medium hover:underline">
                {showAll ? "Hide history" : "See all history"}
              </button>
            )}
          </div>
          
          <div className="space-y-1">
            {list.map((e) => (
              <div key={e.id} className="flex justify-between items-center py-3 border-b last:border-0 hover:bg-gray-50 px-2 rounded-md transition-colors">
                <div>
                  <p className="font-medium text-gray-800">{e.description}</p>
                  <div className="flex gap-2 items-center mt-1">
                    <p className="text-xs text-gray-500">{e.date}</p>
                    {e.cropRecord && (
                      <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-100">
                        🌾 {e.cropRecord.cropName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-orange-600 font-bold">₹{e.amount.toLocaleString()}</p>
                  <button 
                    onClick={() => handleDelete(e.id)} 
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}