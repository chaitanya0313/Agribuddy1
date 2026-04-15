import { useState } from "react";
import Header from "../components/Header";
import TopTabs from "../components/Toptabs";
import { useCropSeason } from "../context/CropSeasonContext";
import { authHeader } from "../utils/auth";

const API = import.meta.env.VITE_API_URL;

export default function Income() {
  const { cropSeasons, incomes, refreshData } = useCropSeason();
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [cropRecordId, setCropRecordId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // NOTE: Removed /api/ because it's already in VITE_API_URL
      const res = await fetch(`${API}/incomes`, {
        method: "POST",
        headers: { 
          ...authHeader(), 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          source,
          amount: Number(amount),
          date,
          cropRecordId: cropRecordId || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save income");

      setSource("");
      setAmount("");
      setDate("");
      setCropRecordId("");
      
      refreshData();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this income?")) return;
    try {
      await fetch(`${API}/incomes/${id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      refreshData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const list = showAll ? incomes : incomes.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <TopTabs />

        <form className="bg-white rounded-xl shadow-sm p-4 mt-6" onSubmit={handleSubmit}>
          <h3 className="font-semibold text-green-700 mb-3">+ Add Income</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              className="border px-3 py-2 rounded focus:ring-2 focus:ring-green-300 outline-none"
              placeholder="Source (e.g. Market Sale)"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
            />
            <input
              type="number"
              className="border px-3 py-2 rounded focus:ring-2 focus:ring-green-300 outline-none"
              placeholder="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <input
              type="date"
              className="border px-3 py-2 rounded focus:ring-2 focus:ring-green-300 outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <select
              className="border px-3 py-2 rounded text-sm text-gray-600 outline-none"
              value={cropRecordId}
              onChange={(e) => setCropRecordId(e.target.value)}
            >
              <option value="">-- Link to Crop (optional) --</option>
              {cropSeasons.map((c) => (
                <option key={c.cropId} value={c.cropId}>
                  {c.cropName} · {c.season}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-3 bg-green-600 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Income"}
          </button>
        </form>

        <div className="bg-white rounded-xl shadow-sm p-4 mt-6">
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold text-gray-700">Recent Income</h3>
            {incomes.length > 3 && (
              <button onClick={() => setShowAll(!showAll)} className="text-green-600 text-sm">
                {showAll ? "Hide" : "See all"}
              </button>
            )}
          </div>
          {list.map((i) => (
            <div key={i.id} className="flex justify-between items-center py-2 border-b last:border-0">
              <div>
                <p className="font-medium text-gray-800">{i.source}</p>
                <p className="text-xs text-gray-500">{i.date}</p>
                {i.cropRecord && (
                  <p className="text-xs text-green-600">🌾 {i.cropRecord.cropName}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-green-700 font-bold">₹{i.amount.toLocaleString()}</p>
                <button onClick={() => handleDelete(i.id)} className="text-red-400">✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}