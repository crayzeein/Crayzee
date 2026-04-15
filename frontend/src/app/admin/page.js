'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import API from '@/utils/api';
import Navbar from '@/components/layout/Navbar';
import {
  LayoutDashboard, Package, Users as UsersIcon, ShoppingCart,
  MessageSquare, ShieldAlert, TrendingUp, DollarSign, Plus, Edit, Trash2, X, Check, Search, Upload, Image as ImageIcon, Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const { user } = useStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({ products: [], users: [], orders: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [orderTab, setOrderTab] = useState('all');

  // Pagination
  const [productPage, setProductPage] = useState(1);
  const [totalProductPages, setTotalProductPages] = useState(1);

  // Modal for Product Add/Edit
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [formData, setFormData] = useState({
    name: '', price: '', category: 'clothing', gender: '', subCategory: '', stock: '', description: '', images: [], sizes: ['S', 'M', 'L', 'XL', 'XXL']
  });
  
  // Category Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', slug: '', items: [], isActive: true });

  const [uploading, setUploading] = useState(false);

  const categoriesConfig = {
    clothing: {
      genders: ['men', 'women', 'unisex'],
      subCategories: ['none', 'oversized', 'graphic', 'anime', 'regular']
    },
    footwear: {
      genders: ['men', 'women', 'unisex'],
      subCategories: ['none', 'sneakers', 'slides', 'boots', 'formal']
    },
    'mobile-accessories': {
      genders: ['unisex'],
      subCategories: ['none', 'covers', 'cables', 'chargers']
    },
    gifts: {
      genders: ['unisex'],
      subCategories: ['none', 'combos', 'accessories']
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchAllData();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    }
  }, [productPage, activeTab]);

  const fetchAllData = async () => {
    if (loading && data.users.length > 0) return; // Guard against redundant fetches if we already have data
    setLoading(true);
    try {
      const [userRes, orderRes, catRes] = await Promise.all([
        API.get('/users'),
        API.get('/orders'),
        API.get('/categories/admin')
      ]);
      setData(prev => ({ ...prev, users: userRes.data, orders: orderRes.data, categories: catRes.data || [] }));
      await fetchProducts();
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (limit = 10) => {
    try {
      const { data: prodData } = await API.get(`/products?page=${productPage}&limit=${limit}`);
      setData(prev => ({ ...prev, products: prodData.products }));
      setTotalProductPages(prodData.pages);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchProducts(100); // Fetch more for reviews tab to see all moderation items
    }
  }, [activeTab]);

  // --- PRODUCT CRUD ---
  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setFormData({
      ...product,
      category: product.category || 'clothing',
      gender: product.gender || '',
      subCategory: product.subCategory || '',
      images: product.images || [],
      sizes: product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL']
    });
    setShowProductModal(true);
  };

  const handleAddProduct = () => {
    setCurrentProduct(null);
    setFormData({
      name: '',
      price: '',
      category: 'clothing',
      gender: 'men',
      subCategory: 'oversized',
      stock: '',
      description: '',
      images: [],
      sizes: ['S', 'M', 'L', 'XL', 'XXL']
    });
    setShowProductModal(true);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    const uploadFormData = new FormData();
    files.forEach(file => uploadFormData.append('images', file));

    try {
      const { data: uploadedImages } = await API.post('/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages]
      }));
    } catch (error) {
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (public_id) => {
    if (!confirm('Remove this image?')) return;

    try {
      await API.delete(`/upload/${public_id}`);
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img.public_id !== public_id)
      }));
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
      // Still remove from local state even if Cloudinary delete fails (might be orphaned)
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img.public_id !== public_id)
      }));
    }
  };

  const saveProduct = async (e) => {
    e.preventDefault();

    // Validation
    const { category, gender, subCategory, images } = formData;
    if (!category || !gender || !subCategory) {
      return alert('Category, Gender, and Sub-Category are all required.');
    }
    if (images.length === 0) {
      return alert('At least one image is required for the drop.');
    }

    try {
      if (currentProduct) {
        // Find if any images were removed during edit and delete from Cloudinary
        const oldImages = currentProduct.images || [];
        const newImages = formData.images || [];
        const removedImages = oldImages.filter(oldImg => !newImages.find(newImg => newImg.public_id === oldImg.public_id));

        for (const img of removedImages) {
          try {
            await API.delete(`/upload/${img.public_id}`);
          } catch (err) {
            console.warn('Failed to cleanup old image from Cloudinary:', err);
          }
        }

        await API.put(`/products/${currentProduct._id}`, formData);
      } else {
        await API.post('/products', formData);
      }
      setShowProductModal(false);
      fetchProducts();
    } catch (error) {
      alert('Failed to save product: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteProduct = async (id) => {
    if (confirm('Delete this product permanently? This will also remove images from Cloudinary.')) {
      try {
        await API.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        alert('Delete failed');
      }
    }
  };

  // --- CATEGORY CRUD ---
  const handleEditCategory = (cat) => {
    setCurrentCategory(cat);
    setCategoryFormData({ ...cat });
    setShowCategoryModal(true);
  };

  const handleAddCategory = () => {
    setCurrentCategory(null);
    setCategoryFormData({ name: '', slug: '', items: [], isActive: true });
    setShowCategoryModal(true);
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    try {
      if (currentCategory) {
        await API.put(`/categories/${currentCategory._id}`, categoryFormData);
      } else {
        await API.post('/categories', categoryFormData);
      }
      setShowCategoryModal(false);
      fetchAllData();
    } catch (error) {
      alert('Failed to save category: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteCategory = async (id) => {
    if (confirm('Delete this category?')) {
      try {
        await API.delete(`/categories/${id}`);
        fetchAllData();
      } catch (error) {
        alert('Delete failed');
      }
    }
  };

  // --- USER MGMT ---
  const handleBlockUser = async (id) => {
    try {
      await API.put(`/users/${id}/block`);
      fetchAllData();
    } catch (error) {
      alert('Action failed');
    }
  };

  // --- ORDER MGMT ---
  const handleViewOrder = (order) => {
    setCurrentOrder(order);
    setShowOrderModal(true);
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await API.put(`/orders/${id}/${status}`);
      if (showOrderModal) {
        const { data: updatedOrder } = await API.get(`/orders/${id}`);
        setCurrentOrder(updatedOrder);
      }
      fetchAllData();
    } catch (error) {
      alert('Update failed');
    }
  };

  const getFilteredOrders = () => {
    switch (orderTab) {
      case 'processing': return data.orders.filter(o => o.status === 'Processing');
      case 'shipped': return data.orders.filter(o => o.status === 'Shipped');
      case 'delivered': return data.orders.filter(o => o.status === 'Delivered');
      case 'cancelled': return data.orders.filter(o => o.status === 'Cancelled');
      case 'history': return data.orders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled');
      default: return data.orders;
    }
  };

  const getOrderCounts = () => ({
    history: data.orders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled').length,
  });

  const getReviewStats = () => {
    const reviewedProducts = data.products.filter(p => p.reviews?.length > 0);
    const totalReviews = reviewedProducts.reduce((acc, p) => acc + p.reviews.length, 0);
    const avgSum = reviewedProducts.reduce((acc, p) => acc + p.rating, 0);
    const globalAvg = reviewedProducts.length > 0 ? (avgSum / reviewedProducts.length).toFixed(1) : 0;

    return { totalReviews, globalAvg, reviewedProductsCount: reviewedProducts.length };
  };

  // --- REVIEW MGMT ---
  const deleteReview = async (productId, reviewId) => {
    try {
      await API.delete(`/products/${productId}/reviews/${reviewId}`);
      fetchAllData();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Admin Dash', icon: LayoutDashboard },
    { id: 'products', label: 'Inventory', icon: Package },
    { id: 'categories', label: 'Categories', icon: TrendingUp },
    { id: 'users', label: 'Customers', icon: UsersIcon },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'reviews', label: 'Ratings', icon: MessageSquare }
  ];

  if (loading && activeTab === 'overview') return <div className="min-h-screen flex items-center justify-center font-black text-2xl animate-pulse text-purple-600">LOADING CRAYZEE DATA...</div>;

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 dark:text-zinc-100 flex flex-col overflow-x-hidden pb-20 md:pb-0">
      {/* Sidebar - Desktop: FIXED vertical sidebar | Mobile: HIDDEN (bottom bar replaces) */}
      <aside className="hidden md:flex w-72 bg-zinc-950 text-white flex-col p-8 fixed top-0 left-0 h-screen border-r border-zinc-900 z-40 overflow-y-auto thin-scrollbar">
        <div className="text-3xl font-black mb-12 tracking-tighter text-[#fb5607] uppercase text-left">CRAYZEE ADMIN</div>
        <nav className="flex flex-col flex-1 gap-3">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-4 px-6 py-4 rounded-3xl transition-all whitespace-nowrap ${activeTab === item.id ? 'bg-[#fb5607] text-white shadow-[0_0_30px_rgba(251,86,7,0.2)]' : 'hover:bg-zinc-900 text-zinc-500 hover:text-white'
                }`}
            >
              <item.icon size={20} strokeWidth={activeTab === item.id ? 3 : 2} />
              <span className="font-black text-sm uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={() => router.push('/')} className="flex mt-8 items-center gap-4 px-6 py-4 text-zinc-600 hover:text-white transition-all font-black text-xs uppercase tracking-widest justify-start">
          <ShieldAlert size={20} /> Exit Dashboard
        </button>
      </aside>

      {/* Mobile Bottom Navigation Bar - fixed at bottom like real apps */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-zinc-800 flex justify-around items-center px-1 py-2 safe-area-pb">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all min-w-0 ${activeTab === item.id ? 'text-[#fb5607]' : 'text-zinc-500'}`}
          >
            <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 1.5} />
            <span className="text-[8px] font-bold uppercase tracking-wider truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <section className="flex-1 md:ml-72 p-4 sm:p-8 md:p-12 lg:p-16 overflow-y-auto overflow-x-hidden">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 capitalize">{activeTab === 'overview' ? 'Dashboard Overview' : activeTab}</h1>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mt-0.5">Manage your store from here</p>
          </div>
          <span className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {user?.name}
          </span>
        </header>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6">
              {[
                { label: 'Total Revenue', val: `₹${data.orders.reduce((t, o) => t + (o.isPaid ? o.totalPrice : 0), 0)}`, icon: DollarSign, color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' },
                { label: 'Active Orders', val: data.orders.length, icon: ShoppingCart, color: 'bg-[#fb5607]/10 text-[#fb5607]' },
                { label: 'Total Users', val: data.users.length, icon: UsersIcon, color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' },
                { label: 'Inventory', val: data.products.length, icon: Package, color: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600' }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 sm:p-8 rounded-2xl sm:rounded-[40px] hover:border-zinc-200 dark:hover:border-zinc-700 transition-all group">
                  <div className={`${stat.color} w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-3xl flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-5 h-5 sm:w-8 sm:h-8" />
                  </div>
                  <p className="text-zinc-400 dark:text-zinc-500 text-[8px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-[0.2em] mb-1">{stat.label}</p>
                  <h3 className="text-xl sm:text-4xl font-black leading-none">{stat.val}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- PRODUCTS TAB --- */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4">
              <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight">Crayzee Inventory</h2>
              <button
                onClick={handleAddProduct}
                className="bg-zinc-950 dark:bg-zinc-800 text-white px-5 py-3 sm:px-8 sm:py-4 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#fb5607] transition-all shadow-xl justify-center"
              >
                <Plus size={16} /> Add New Drop
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
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Product</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Category</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Gender</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Sub-Cat</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Price</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-center">Actions</th>
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
              <p className="text-[9px] sm:text-[10px] font-black uppercase text-zinc-400 tracking-widest">Page {productPage} of {totalProductPages}</p>
              <div className="flex gap-2">
                <button disabled={productPage === 1} onClick={() => setProductPage(prev => prev - 1)} className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-[10px] uppercase disabled:opacity-30">Prev</button>
                <button disabled={productPage === totalProductPages} onClick={() => setProductPage(prev => prev + 1)} className="px-4 py-2 bg-zinc-950 dark:bg-zinc-800 text-white rounded-xl font-bold text-[10px] uppercase disabled:opacity-30">Next</button>
              </div>
            </div>
          </div>
        )}

        {/* --- CATEGORIES TAB --- */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4">
              <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight">Main Categories</h2>
              <button onClick={handleAddCategory} className="bg-[#fb5607] text-white px-5 py-3 sm:px-8 sm:py-4 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl justify-center">
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
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Category Name</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Slug (URL)</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Sub-Items</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-center">Actions</th>
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
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight mb-4">All Customers</h2>

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
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">User Profile</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Role</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-center">Security</th>
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
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Order Filter Tabs - scrollable on mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-zinc-100 dark:bg-zinc-800 p-1.5 sm:p-2 rounded-2xl sm:rounded-[32px] overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All' },
                { id: 'processing', label: 'Processing' },
                { id: 'shipped', label: 'Shipped' },
                { id: 'delivered', label: 'Delivered' },
                { id: 'cancelled', label: 'Cancelled' },
                { id: 'history', label: 'History' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setOrderTab(tab.id)}
                  className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-3xl font-bold text-[9px] sm:text-[10px] uppercase tracking-wider whitespace-nowrap transition-all shrink-0 ${orderTab === tab.id ? 'bg-black dark:bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mobile: Card Layout */}
            <div className="md:hidden space-y-3">
              {getFilteredOrders().map((o) => (
                <div key={o._id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-mono text-[#fb5607] font-black text-xs">#{o._id.slice(-8).toUpperCase()}</p>
                      <p className="text-[8px] text-zinc-400 font-medium">{new Date(o.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      {o.status === 'Cancelled' && <span className="px-2 py-1 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-lg font-bold text-[8px] uppercase">Cancelled</span>}
                      {o.status === 'Processing' && <span className="px-2 py-1 bg-orange-50 dark:bg-orange-950/30 text-orange-500 rounded-lg font-bold text-[8px] uppercase">Processing</span>}
                      {o.status === 'Shipped' && <span className="px-2 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-lg font-bold text-[8px] uppercase">In Transit</span>}
                      {o.status === 'Delivered' && <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-lg font-bold text-[8px] uppercase flex items-center gap-1"><Check size={10} /> Delivered</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-sm">{o.user?.name || 'User'}</p>
                      <p className="text-[8px] text-zinc-400 uppercase">{o.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg">₹{o.totalPrice}</p>
                      <p className={`text-[7px] font-bold uppercase ${o.isPaid ? 'text-emerald-500' : 'text-zinc-400'}`}>{o.isPaid ? 'Paid ✓' : 'Pending'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleViewOrder(o)} className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[9px] font-bold uppercase text-center hover:bg-black hover:text-white transition-all">View</button>
                    {o.status === 'Processing' && (
                      <>
                        <button onClick={() => updateOrderStatus(o._id, 'ship')} className="py-2 px-3 bg-blue-600 text-white rounded-lg text-[9px] font-bold uppercase">Ship</button>
                        <button onClick={() => updateOrderStatus(o._id, 'cancel')} className="py-2 px-3 bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-900 text-red-500 rounded-lg text-[9px] font-bold uppercase">Cancel</button>
                      </>
                    )}
                    {o.status === 'Shipped' && (
                      <button onClick={() => updateOrderStatus(o._id, 'deliver')} className="py-2 px-3 bg-emerald-600 text-white rounded-lg text-[9px] font-bold uppercase">Deliver</button>
                    )}
                  </div>
                </div>
              ))}
              {getFilteredOrders().length === 0 && (
                <div className="py-12 text-center text-zinc-400 font-bold text-sm">No orders found 🏜️</div>
              )}
            </div>

            {/* Desktop: Table Layout */}
            <div className="hidden md:block bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Order Details</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Customer</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Pricing</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-center">Lifecycle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {getFilteredOrders().map((o) => (
                      <tr key={o._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono text-[#fb5607] font-black text-xs leading-tight mb-0.5">#{o._id.slice(-8).toUpperCase()}</p>
                          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(o.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm uppercase leading-tight">{o.user?.name || 'Crayzee User'}</p>
                          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{o.paymentMethod}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-black text-base leading-tight">₹{o.totalPrice}</p>
                          <p className={`text-[8px] font-bold uppercase ${o.isPaid ? 'text-emerald-500' : 'text-zinc-300'}`}>{o.isPaid ? 'Paid' : 'Pending'}</p>
                        </td>
                        <td className="px-6 py-4">
                          {o.status === 'Cancelled' && <span className="px-3 py-1 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-full font-bold text-[9px] uppercase">Cancelled</span>}
                          {o.status === 'Processing' && <span className="px-3 py-1 bg-orange-50 dark:bg-orange-950/30 text-orange-500 rounded-full font-bold text-[9px] uppercase">Processing</span>}
                          {o.status === 'Shipped' && <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-full font-bold text-[9px] uppercase">In Transit</span>}
                          {o.status === 'Delivered' && <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-full font-bold text-[9px] uppercase flex items-center gap-1 w-fit"><Check size={10} /> Delivered</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleViewOrder(o)} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[9px] font-bold uppercase hover:bg-black hover:text-white transition-all">View</button>
                            {o.status === 'Processing' && (
                              <>
                                <button onClick={() => updateOrderStatus(o._id, 'ship')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-blue-700 transition-all">Ship</button>
                                <button onClick={() => updateOrderStatus(o._id, 'cancel')} className="px-4 py-2 bg-white dark:bg-zinc-800 border border-red-200 text-red-500 rounded-lg text-[9px] font-bold uppercase hover:bg-red-50 transition-all">Cancel</button>
                              </>
                            )}
                            {o.status === 'Shipped' && (
                              <button onClick={() => updateOrderStatus(o._id, 'deliver')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-emerald-700 transition-all">Deliver</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {getFilteredOrders().length === 0 && (
                      <tr><td colSpan="5" className="py-16 text-center text-zinc-400 font-bold uppercase tracking-widest text-sm">No orders found 🏜️</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- REVIEWS MODERATION --- */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 sm:space-y-12">
            {/* Review Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-8">
              <div className="bg-zinc-900 dark:bg-zinc-800 text-white p-5 sm:p-8 rounded-2xl sm:rounded-[40px] shadow-2xl border border-zinc-800 dark:border-zinc-700">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Total Feedback</p>
                <h3 className="text-3xl sm:text-5xl font-black">{getReviewStats().totalReviews}</h3>
                <p className="text-[9px] font-bold text-[#fb5607] mt-2 uppercase tracking-widest">Verified Reviews</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-8 rounded-2xl sm:rounded-[40px]">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Avg Rating</p>
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl sm:text-5xl font-black">{getReviewStats().globalAvg}</h3>
                  <Star size={20} fill="#fb5607" className="text-[#fb5607]" />
                </div>
                <p className="text-[9px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">Across {getReviewStats().reviewedProductsCount} Drops</p>
              </div>
              <div className="bg-[#fb5607] text-white p-5 sm:p-8 rounded-2xl sm:rounded-[40px] shadow-xl shadow-[#fb5607]/20">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Satisfaction</p>
                <h3 className="text-3xl sm:text-5xl font-black">{Math.round((getReviewStats().globalAvg / 5) * 100)}%</h3>
                <div className="w-full bg-white/20 h-1.5 rounded-full mt-3 overflow-hidden">
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
        )}
      </section>

      {/* --- CATEGORY MODAL --- */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCategoryModal(false)} className="absolute inset-0 bg-zinc-950 dark:bg-zinc-900/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-white dark:bg-zinc-950 dark:text-zinc-100 w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-10 md:p-14">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black uppercase tracking-tighter">{currentCategory ? 'Edit Category' : 'New Category'}</h2>
                  <button onClick={() => setShowCategoryModal(false)} className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:rotate-90 transition-all"><X size={24} /></button>
                </div>
                <form onSubmit={saveCategory} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-3">Category Name</label>
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

      {/* --- ADD/EDIT MODAL --- */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProductModal(false)} className="absolute inset-0 bg-zinc-950 dark:bg-zinc-900/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-white dark:bg-zinc-950 dark:text-zinc-100 w-full max-w-4xl rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-10 md:p-14">
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-4xl font-black uppercase tracking-tighter">{currentProduct ? 'Update Drop' : 'New Drop Leak'}</h2>
                  <button onClick={() => setShowProductModal(false)} className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:rotate-90 transition-all"><X size={24} /></button>
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

      {/* --- ORDER DETAILS MODAL --- */}
      <AnimatePresence>
        {showOrderModal && currentOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOrderModal(false)} className="absolute inset-0 bg-zinc-950 dark:bg-zinc-900/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-white dark:bg-zinc-950 dark:text-zinc-100 w-full max-w-5xl rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-10 md:p-14">
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter">Order Details</h2>
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-2">ID: #{currentOrder._id}</p>
                  </div>
                  <button onClick={() => setShowOrderModal(false)} className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:rotate-90 transition-all"><X size={24} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {/* Left: Info */}
                  <div className="md:col-span-2 space-y-12">
                    <section>
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#fb5607] mb-6">Customer & Shipping</h3>
                      <div className="grid grid-cols-2 gap-8 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-800 p-8 rounded-[32px]">
                        <div>
                          <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Customer</p>
                          <p className="font-black uppercase">{currentOrder.user?.name}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{currentOrder.user?.email}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Shipping Address</p>
                          <p className="text-xs font-bold leading-relaxed">
                            {currentOrder.shippingAddress.address}<br />
                            {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.postalCode}<br />
                            {currentOrder.shippingAddress.country}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#fb5607] mb-6">Order Items</h3>
                      <div className="space-y-4">
                        {currentOrder.orderItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-6 p-4 border border-zinc-100 dark:border-zinc-700 rounded-[24px]">
                            <img src={item.image} className="w-16 h-20 object-cover rounded-xl" alt={item.name} />
                            <div className="flex-1">
                              <p className="font-black uppercase text-sm">{item.name}</p>
                              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                                {item.size ? `SIZE: ${item.size} | ` : ''}₹{item.price} × {item.qty}
                              </p>
                            </div>
                            <p className="font-black text-lg">₹{item.price * item.qty}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Right: Summary & Action */}
                  <div className="space-y-8">
                    <section className="bg-zinc-950 dark:bg-zinc-900 text-white p-10 rounded-[40px]">
                      <h3 className="text-xl font-black uppercase tracking-tight mb-8">Summary</h3>
                      <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">
                          <span>Payment Method</span>
                          <span className="text-white">{currentOrder.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">
                          <span>Payment Status</span>
                          <span className={currentOrder.isPaid ? 'text-emerald-500' : 'text-orange-500'}>{currentOrder.isPaid ? 'PAID' : 'PENDING'}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">
                          <span>Order Status</span>
                          <span className={`font-black ${currentOrder.status === 'Cancelled' ? 'text-red-500' : currentOrder.status === 'Delivered' ? 'text-emerald-500' : 'text-orange-500'}`}>
                            {currentOrder.status?.toUpperCase() || 'PROCESSING'}
                          </span>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-white/10">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-400">Total Price</span>
                          <span className="text-4xl font-black tracking-tighter text-[#fb5607]">₹{currentOrder.totalPrice}</span>
                        </div>
                      </div>
                    </section>

                    {/* Dynamic Action Buttons */}
                    <div className="flex flex-col gap-4">
                      {currentOrder.status === 'Processing' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(currentOrder._id, 'ship')}
                            className="w-full py-6 rounded-3xl bg-blue-600 text-white font-black text-sm uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all"
                          >
                            Mark as Shipped
                          </button>
                          <button
                            onClick={() => updateOrderStatus(currentOrder._id, 'cancel')}
                            className="w-full py-6 rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-2 border-zinc-200 dark:border-zinc-600 font-black text-sm uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                          >
                            Cancel Order & Restore Stock
                          </button>
                        </>
                      )}

                      {currentOrder.status === 'Shipped' && (
                        <button
                          onClick={() => updateOrderStatus(currentOrder._id, 'deliver')}
                          className="w-full py-6 rounded-3xl bg-emerald-600 text-white font-black text-sm uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all"
                        >
                          Mark as Delivered
                        </button>
                      )}

                      {currentOrder.status === 'Cancelled' && (
                        <div className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl flex items-center justify-center gap-3 text-red-600 font-black uppercase text-xs">
                          <ShieldAlert size={18} /> Order Cancelled
                        </div>
                      )}

                      {currentOrder.status === 'Delivered' && (
                        <div className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-3xl flex items-center justify-center gap-3 text-emerald-600 font-black uppercase text-xs">
                          <Check size={18} /> Order Delivered
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
