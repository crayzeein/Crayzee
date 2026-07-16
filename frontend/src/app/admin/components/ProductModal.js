'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Trash2 } from 'lucide-react';

export default function ProductModal({ show, onClose, currentProduct, formData, setFormData, saveProduct, handleFileChange, removeImage, uploading, data, categoriesConfig }) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-zinc-950 dark:bg-zinc-900/40 backdrop-blur-md" />
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-white dark:bg-zinc-950 dark:text-zinc-100 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">{currentProduct ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={onClose} className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 transition-all"><X size={18} /></button>
              </div>
              <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div><label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-3">Product Name</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 font-bold outline-none ring-2 ring-transparent focus:ring-[#fb5607] transition-all" required /></div>
                  <div className="grid grid-cols-2 gap-6">
                    <div><label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-3">Price (₹)</label><input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all" required /></div>
                    <div><label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-3">Stock</label><input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all" required /></div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-3">Category</label>
                      <select
                        value={formData.category}
                        onChange={e => {
                          setFormData({
                            ...formData,
                            category: e.target.value
                          });
                        }}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all appearance-none uppercase"
                      >
                        <option value="">Select Category</option>
                        {data.categories.map(cat => <option key={cat.slug} value={cat.slug} className="uppercase">{cat.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-3">Gender Label</label>
                        {categoriesConfig[formData.category]?.genders ? (
                          <select
                            value={formData.gender}
                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all appearance-none uppercase"
                            required
                          >
                            <option value="">Select Gender</option>
                            {categoriesConfig[formData.category].genders.map(g => <option key={g} value={g} className="uppercase">{g}</option>)}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={formData.gender}
                            onChange={e => setFormData({ ...formData, gender: e.target.value.toLowerCase() })}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all"
                            required
                            placeholder="e.g. men or unisex"
                          />
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-3">Sub Category</label>
                        {categoriesConfig[formData.category]?.subCategories ? (
                          <select
                            value={formData.subCategory}
                            onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all appearance-none uppercase"
                            required
                          >
                            <option value="">Select Sub-Cat</option>
                            {categoriesConfig[formData.category].subCategories.map(sub => <option key={sub} value={sub} className="uppercase">{sub}</option>)}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={formData.subCategory}
                            onChange={e => setFormData({ ...formData, subCategory: e.target.value.toLowerCase() })}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all"
                            required
                            placeholder="e.g. oversized or limited"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-3">Available Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            const newSizes = formData.sizes.includes(size)
                              ? formData.sizes.filter(s => s !== size)
                              : [...formData.sizes, size];
                            setFormData({ ...formData, sizes: newSizes });
                          }}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${formData.sizes.includes(size)
                            ? 'bg-[#fb5607] border-[#fb5607] text-white'
                            : 'bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:border-[#fb5607] hover:text-[#fb5607]'
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-2">Deselect sizes that are not applicable to this drop.</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div><label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-3">Drop Description</label><textarea rows="5" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-800 border-none rounded-3xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all resize-none" required></textarea></div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1">Visual Drops (Images)</label>
                    <div className="grid grid-cols-3 gap-4">
                      {formData.images.map((img, i) => (
                        <div key={img.public_id} className="relative aspect-[3/4] group rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-700">
                          <img src={img.url} className="w-full h-full object-cover" alt="Preview" />
                          <button
                            type="button"
                            onClick={() => removeImage(img.public_id)}
                            className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}

                      {(formData.images.length < 5) && (
                        <label className={`aspect-[3/4] rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-600 flex flex-col items-center justify-center cursor-pointer hover:border-[#fb5607] hover:bg-[#fb5607]/5 transition-all ${uploading ? 'animate-pulse' : ''}`}>
                          {uploading ? (
                            <div className="w-6 h-6 border-2 border-[#fb5607] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Upload size={24} className="text-zinc-400 dark:text-zinc-500 mb-2" />
                              <span className="text-[8px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest text-center px-4">Add Shot</span>
                            </>
                          )}
                          <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
                        </label>
                      )}
                    </div>
                    <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Max 5 images. Recommended: 3:4 aspect ratio.</p>
                  </div>
                </div>
                <div className="md:col-span-2 pt-6">
                  <button type="submit" className="w-full bg-zinc-950 dark:bg-zinc-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-[#fb5607] transition-all transform active:scale-95">
                    Confirm Gear Deploy
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