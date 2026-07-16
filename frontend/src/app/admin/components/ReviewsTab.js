'use client';
import { MessageSquare, Star, Trash2 } from 'lucide-react';

export default function ReviewsTab({ data, getReviewStats, deleteReview }) {
  return (
    <div className="space-y-6">
      {/* Review Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl">
          <p className="text-[11px] text-zinc-400 font-medium mb-1">Total Reviews</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">{getReviewStats().totalReviews}</h3>
          <p className="text-[10px] text-[#fb5607] font-medium mt-1">Verified Feedback</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl">
          <p className="text-[11px] text-zinc-400 font-medium mb-1">Average Rating</p>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">{getReviewStats().globalAvg}</h3>
            <Star size={18} fill="#fb5607" className="text-[#fb5607]" />
          </div>
          <p className="text-[10px] text-zinc-400 font-medium mt-1">Across {getReviewStats().reviewedProductsCount} products</p>
        </div>
        <div className="bg-[#fb5607] text-white p-5 rounded-2xl">
          <p className="text-[11px] font-medium opacity-70 mb-1">Satisfaction</p>
          <h3 className="text-2xl sm:text-3xl font-bold">{Math.round((getReviewStats().globalAvg / 5) * 100)}%</h3>
          <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-white h-full rounded-full" style={{ width: `${(getReviewStats().globalAvg / 5) * 100}%` }} />
          </div>
        </div>
      </div>

      {data.products.filter(p => p.reviews?.length > 0).length === 0 ? (
        <div className="bg-zinc-50 dark:bg-zinc-900 p-12 sm:p-20 rounded-2xl sm:rounded-[48px] text-center border-2 border-dashed border-zinc-200 dark:border-zinc-700">
          <MessageSquare size={32} className="mx-auto mb-4 text-zinc-300" />
          <h3 className="text-lg font-black uppercase tracking-tight mb-2">No Reviews Yet</h3>
          <p className="text-zinc-400 text-sm font-medium">Reviews will appear here for moderation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8">
          {data.products.filter(p => p.reviews?.length > 0).map(product => (
            <div key={product._id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl sm:rounded-[40px] overflow-hidden group hover:border-zinc-200 dark:hover:border-zinc-700 transition-all">
              <div className="p-4 sm:p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/30">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {(product.images?.[0]?.url || product.image) ? (
                      <img src={product.images?.[0]?.url || product.image} className="w-12 h-16 sm:w-16 sm:h-20 rounded-xl object-cover shadow-sm" alt={product.name} />
                    ) : (
                      <div className="w-12 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-xl flex items-center justify-center text-[8px] font-bold text-zinc-400 uppercase">NA</div>
                    )}
                    <div className="absolute -top-1.5 -right-1.5 bg-black text-white w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black">
                      {product.reviews.length}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-xl font-black uppercase tracking-tight">{product.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Star size={10} fill="#fb5607" className="text-[#fb5607]" />
                      <span className="text-[9px] font-bold text-[#fb5607] uppercase">{product.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-6 space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                {product.reviews.map(r => (
                  <div key={r._id} className="bg-zinc-50 dark:bg-zinc-800/50 p-4 sm:p-6 rounded-2xl border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-[9px] text-zinc-500">
                          {r.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{r.name}</p>
                          <div className="flex gap-0.5 mt-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} size={8} fill={r.rating >= s ? '#fb5607' : 'none'} className={r.rating >= s ? 'text-[#fb5607]' : 'text-zinc-200'} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => deleteReview(product._id, r._id)} className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm font-medium leading-relaxed italic">"{r.comment || "Great product! 🔥"}"</p>
                    <p className="text-[7px] font-bold text-zinc-300 uppercase tracking-widest mt-2">{new Date(r.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}