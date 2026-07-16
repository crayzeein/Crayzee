'use client';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function ProductsTab({ data, productPage, totalProductPages, setProductPage, handleAddProduct, handleEditProduct, deleteProduct }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-bold">All Products</h2>
        <button
          onClick={handleAddProduct}
          className="bg-[#fb5607] text-white px-5 py-2.5 rounded-xl font-semibold text-[12px] flex items-center gap-2 hover:bg-[#e04d06] transition-all justify-center"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Mobile: Card Layout */}
      <div className="md:hidden space-y-3">
        {data.products.map((p) => (
          <div key={p._id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-3 flex gap-3">
            <div className="shrink-0">
              {(p.images?.[0]?.url || p.image) ? (
                <img src={p.images?.[0]?.url || p.image} alt={p.name} className="w-16 h-20 object-cover rounded-xl" />
              ) : (
                <div className="w-16 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-[7px] font-bold text-zinc-400">NO IMG</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-tight truncate">{p.name}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="text-[8px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-bold uppercase text-zinc-500">{p.category}</span>
                <span className="text-[8px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-bold uppercase text-zinc-500">{p.gender}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-black text-base">₹{p.price}</span>
                <div className="flex items-center gap-1">
                  {p.stock > 0 ? (
                    <span className="text-emerald-600 text-[8px] font-bold">{p.stock} in stock</span>
                  ) : (
                    <span className="text-red-500 text-[8px] font-bold">Out of stock</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleEditProduct(p)} className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[9px] font-bold uppercase text-center hover:bg-black hover:text-white transition-all">Edit</button>
                <button onClick={() => deleteProduct(p._id)} className="py-2 px-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-[#fb5607] hover:text-white transition-all"><Trash2 size={13} /></button>
              </div>
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
                <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Product</th>
                <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Category</th>
                <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Gender</th>
                <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Sub-Cat</th>
                <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Price</th>
                <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.products.map((p) => (
                <tr key={p._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-4">
                    {(p.images?.[0]?.url || p.image) ? (
                      <img src={p.images?.[0]?.url || p.image} alt={p.name} className="w-12 h-16 object-cover rounded-xl shadow-sm" />
                    ) : (
                      <div className="w-12 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-[7px] font-black text-zinc-400 uppercase">No Img</div>
                    )}
                    <div>
                      <p className="font-bold text-sm leading-tight mb-0.5">{p.name}</p>
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        Stock: {p.stock}
                        {p.stock > 0 ? (
                          <span className="text-emerald-500 font-black text-[7px] px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-full">IN STOCK</span>
                        ) : (
                          <span className="text-red-500 font-black text-[7px] px-1.5 py-0.5 bg-red-50 dark:bg-red-950/30 rounded-full">OUT</span>
                        )}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 uppercase font-bold text-[10px] tracking-widest text-zinc-500 dark:text-zinc-400">{p.category}</td>
                  <td className="px-6 py-4 uppercase font-bold text-[10px] tracking-widest text-zinc-500 dark:text-zinc-400">{p.gender}</td>
                  <td className="px-6 py-4 uppercase font-bold text-[10px] tracking-widest text-zinc-500 dark:text-zinc-400">{p.subCategory}</td>
                  <td className="px-6 py-4 font-black text-base">₹{p.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEditProduct(p)} className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-black hover:text-white transition-all"><Edit size={14} /></button>
                      <button onClick={() => deleteProduct(p._id)} className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-[#fb5607] hover:text-white transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1 sm:px-4">
        <p className="text-[9px] sm:text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Page {productPage} of {totalProductPages}</p>
        <div className="flex gap-2">
          <button disabled={productPage === 1} onClick={() => setProductPage(prev => prev - 1)} className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-[10px] uppercase disabled:opacity-30">Prev</button>
          <button disabled={productPage === totalProductPages} onClick={() => setProductPage(prev => prev + 1)} className="px-4 py-2 bg-zinc-950 dark:bg-zinc-800 text-white rounded-xl font-bold text-[10px] uppercase disabled:opacity-30">Next</button>
        </div>
      </div>
    </div>
  );
}