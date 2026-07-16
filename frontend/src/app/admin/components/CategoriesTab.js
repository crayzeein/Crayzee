'use client';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function CategoriesTab({ data, handleAddCategory, handleEditCategory, deleteCategory }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-bold">Categories</h2>
        <button onClick={handleAddCategory} className="bg-[#fb5607] text-white px-5 py-2.5 rounded-xl font-semibold text-[12px] flex items-center gap-2 hover:bg-[#e04d06] transition-all justify-center">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Mobile: Card Layout */}
      <div className="md:hidden space-y-3">
        {data.categories.map((cat) => (
          <div key={cat._id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-black text-sm uppercase">{cat.name}</h3>
                <p className="text-[9px] text-zinc-400 font-medium mt-0.5">{cat.slug}</p>
              </div>
              {cat.isActive ? (
                <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full font-bold text-[8px] uppercase">Active</span>
              ) : (
                <span className="text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full font-bold text-[8px] uppercase">Hidden</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {cat.items.map((it, idx) => (
                <span key={idx} className="text-[8px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded font-bold uppercase text-zinc-600 dark:text-zinc-400">{it.label}</span>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEditCategory(cat)} className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[9px] font-bold uppercase text-center hover:bg-black hover:text-white transition-all">Edit</button>
              <button onClick={() => deleteCategory(cat._id)} className="py-2 px-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-[#fb5607] hover:text-white transition-all"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden md:block bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Category Name</th>
                <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Slug (URL)</th>
                <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Sub-Items</th>
                <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 font-black text-sm uppercase leading-tight">{cat.name}</td>
                  <td className="px-6 py-4 font-bold text-[10px] text-zinc-400">{cat.slug}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {cat.items.map((it, idx) => (
                        <span key={idx} className="text-[8px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded font-bold uppercase">{it.label}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {cat.isActive ? <span className="text-emerald-500 font-black text-[10px] uppercase">Active</span> : <span className="text-red-500 font-black text-[10px] uppercase">Hidden</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEditCategory(cat)} className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-black hover:text-white transition-all"><Edit size={14} /></button>
                      <button onClick={() => deleteCategory(cat._id)} className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-[#fb5607] hover:text-white transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider text-center px-2 mt-2">Categories with 0 products are auto-hidden from users.</p>
    </div>
  );
}