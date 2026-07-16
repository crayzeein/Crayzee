'use client';

export default function UsersTab({ data, handleBlockUser }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-bold mb-4">All Customers</h2>

      {/* Mobile: Card Layout */}
      <div className="md:hidden space-y-3">
        {data.users.map((u) => (
          <div key={u._id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-sm text-zinc-500 uppercase shrink-0">
              {u.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm truncate">{u.name}</p>
                <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase ${u.role === 'admin' ? 'bg-[#fb5607]/10 text-[#fb5607]' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>{u.role}</span>
              </div>
              <p className="text-[9px] text-zinc-400 truncate">{u.email}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-[8px] font-bold uppercase ${u.isBlocked ? 'text-red-500' : 'text-emerald-600'}`}>
                  {u.isBlocked ? '● Blocked' : '● Active'}
                </span>
                <button onClick={() => handleBlockUser(u._id)} className={`px-3 py-1.5 rounded-lg font-bold text-[8px] uppercase transition-all ${u.isBlocked ? 'bg-emerald-600 text-white' : 'bg-[#fb5607] text-white'}`}>
                  {u.isBlocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden md:block bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">User Profile</th>
              <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Role</th>
              <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Status</th>
              <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 text-center">Security</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {data.users.map((u) => (
              <tr key={u._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-black text-base leading-tight">{u.name}</p>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{u.email}</p>
                </td>
                <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-[#fb5607]/10 text-[#fb5607]' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}>{u.role}</span></td>
                <td className="px-6 py-4">{u.isBlocked ? <span className="text-[#fb5607] font-bold text-[10px] uppercase">Blocked</span> : <span className="text-emerald-600 font-bold text-[10px] uppercase">Active</span>}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleBlockUser(u._id)} className={`px-6 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all ${u.isBlocked ? 'bg-emerald-600 text-white' : 'bg-[#fb5607] text-white'}`}>
                    {u.isBlocked ? 'Unblock' : 'Block Access'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}