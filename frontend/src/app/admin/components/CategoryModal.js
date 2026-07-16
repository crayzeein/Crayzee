'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';

export default function CategoryModal({ show, onClose, currentCategory, categoryFormData, setCategoryFormData, saveCategory }) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-zinc-950 dark:bg-zinc-900/40 backdrop-blur-md" />
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-white dark:bg-zinc-950 dark:text-zinc-100 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{currentCategory ? 'Edit Category' : 'New Category'}</h2>
                <button onClick={onClose} className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 transition-all"><X size={18} /></button>
              </div>
              <form onSubmit={saveCategory} className="space-y-5">
                <div>
                  <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-2">Category Name</label>
                  <input type="text" value={categoryFormData.name} onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all" required />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-3">URL Slug</label>
                  <input type="text" value={categoryFormData.slug} onChange={e => setCategoryFormData({ ...categoryFormData, slug: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all" required />
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={categoryFormData.isActive} onChange={e => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })} className="w-5 h-5 accent-[#fb5607]" />
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-700">Category is Active</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-700">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Sub-Items (Menu Links)</label>
                    <button type="button" onClick={() => setCategoryFormData({ ...categoryFormData, items: [...categoryFormData.items, { label: '', href: '' }] })} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded font-black uppercase hover:bg-zinc-200 dark:bg-zinc-700">
                      + Add Link
                    </button>
                  </div>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {categoryFormData.items.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input type="text" placeholder="Label (e.g. Men)" value={item.label} onChange={e => {
                          const newItems = [...categoryFormData.items];
                          newItems[index].label = e.target.value;
                          setCategoryFormData({ ...categoryFormData, items: newItems });
                        }} className="flex-1 w-1/3 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-1 focus:ring-[#fb5607]" required />
                        <input type="text" placeholder="URL (e.g. /browse?category=...)" value={item.href} onChange={e => {
                          const newItems = [...categoryFormData.items];
                          newItems[index].href = e.target.value;
                          setCategoryFormData({ ...categoryFormData, items: newItems });
                        }} className="flex-1 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-1 focus:ring-[#fb5607]" required />
                        <button type="button" onClick={() => {
                          const newItems = [...categoryFormData.items];
                          newItems.splice(index, 1);
                          setCategoryFormData({ ...categoryFormData, items: newItems });
                        }} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"><Trash2 size={14} /></button>
                      </div>
                    ))}
                    {categoryFormData.items.length === 0 && <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic">No sub-items added.</p>}
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit" className="w-full bg-[#fb5607] text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all">
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}