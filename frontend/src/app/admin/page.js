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
    <main className="min-h-screen bg-white flex flex-col md:flex-row overflow-x-hidden">
      {/* Sidebar - Desktop: vertical sidebar | Mobile: horizontal tab bar */}
      <aside className="w-full md:w-72 bg-zinc-950 text-white flex md:flex-col md:p-8 md:sticky md:top-0 md:h-screen border-b md:border-b-0 md:border-r border-zinc-900">
        <div className="hidden md:block text-3xl font-black mb-12 tracking-tighter text-[#fb5607] uppercase text-center md:text-left">CRAYZEE ADMIN</div>
        <nav className="flex md:flex-col md:flex-1 gap-1 md:gap-3 w-full overflow-x-auto no-scrollbar px-2 py-2 md:px-0 md:py-0">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 md:gap-4 px-3 md:px-6 py-2.5 md:py-4 rounded-xl md:rounded-3xl transition-all whitespace-nowrap shrink-0 ${activeTab === item.id ? 'bg-[#fb5607] text-white shadow-[0_0_30px_rgba(251,86,7,0.2)]' : 'hover:bg-zinc-900 text-zinc-500 hover:text-white'
                }`}
            >
              <item.icon size={16} className="md:w-5 md:h-5" strokeWidth={activeTab === item.id ? 3 : 2} />
              <span className="hidden md:inline font-black text-sm uppercase tracking-widest">{item.label}</span>
              <span className="md:hidden font-black text-[9px] uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={() => router.push('/')} className="hidden md:flex mt-8 items-center gap-4 px-6 py-4 text-zinc-600 hover:text-white transition-all font-black text-xs uppercase tracking-widest justify-center md:justify-start">
          <ShieldAlert size={20} /> Exit Dashboard
        </button>
      </aside>

      {/* Content */}
      <section className="flex-1 p-4 sm:p-8 md:p-12 lg:p-16 overflow-y-auto overflow-x-hidden">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-10 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 capitalize">{activeTab === 'overview' ? 'Dashboard Overview' : activeTab}</h1>
            <p className="text-xs text-zinc-400 font-medium mt-1">Manage your store from here</p>
          </div>
          <span className="bg-zinc-100 px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            {user?.name}
          </span>
        </header>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
              {[
                { label: 'Total Revenue', val: `₹${data.orders.reduce((t, o) => t + (o.isPaid ? o.totalPrice : 0), 0)}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Active Orders', val: data.orders.length, icon: ShoppingCart, color: 'bg-[#fb5607]/10 text-[#fb5607]' },
                { label: 'Crayzee Users', val: data.users.length, icon: UsersIcon, color: 'bg-zinc-100 text-zinc-900' },
                { label: 'Inventory Items', val: data.products.length, icon: Package, color: 'bg-orange-50 text-orange-600' }
              ].map((stat, i) => (
                <div key={i} className="bg-white border-2 border-zinc-50 p-8 rounded-[40px] hover:border-zinc-100 transition-all group">
                  <div className={`${stat.color} w-16 h-16 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <stat.icon size={32} />
                  </div>
                  <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                  <h3 className="text-4xl font-black leading-none">{stat.val}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- PRODUCTS TAB --- */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="bg-white border-2 border-zinc-50 rounded-[48px] overflow-hidden">
              <div className="p-10 border-b border-zinc-50 flex flex-col sm:flex-row justify-between items-center gap-6">
                <h2 className="text-2xl font-black uppercase tracking-tight">Crayzee Inventory</h2>
                <button
                  onClick={handleAddProduct}
                  className="bg-zinc-950 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-[#fb5607] transition-all shadow-xl w-full sm:w-auto justify-center"
                >
                  <Plus size={20} /> Add New Drop
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50/50">
                    <tr>
                      <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest">Product</th>
                      <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest">Category</th>
                      <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest">Gender</th>
                      <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest">Sub-Cat</th>
                      <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest">Price</th>
                      <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {data.products.map((p) => (
                      <tr key={p._id} className="hover:bg-zinc-50/30 transition-colors">
                        <td className="px-10 py-6 flex items-center gap-6">
                          {(p.images?.[0]?.url || p.image) ? (
                            <img src={p.images?.[0]?.url || p.image} alt={p.name} className="w-16 h-20 object-cover rounded-2xl shadow-sm" />
                          ) : (
                            <div className="w-16 h-20 bg-zinc-100 rounded-2xl flex items-center justify-center text-[8px] font-black text-zinc-400 uppercase">No Image</div>
                          )}
                          <div>
                            <p className="font-black text-sm leading-tight mb-1">{p.name}</p>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                              Stock: {p.stock} pcs
                              {p.stock > 0 ? (
                                <span className="text-emerald-500 font-black text-[8px] px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">IN STOCK</span>
                              ) : (
                                <span className="text-red-500 font-black text-[8px] px-2 py-0.5 bg-red-50 rounded-full border border-red-100">OUT OF STOCK</span>
                              )}
                            </p>
                          </div>
                        </td>
                        <td className="px-10 py-6 uppercase font-black text-[10px] tracking-widest text-zinc-500">{p.category}</td>
                        <td className="px-10 py-6 uppercase font-black text-[10px] tracking-widest text-zinc-500">{p.gender}</td>
                        <td className="px-10 py-6 uppercase font-black text-[10px] tracking-widest text-zinc-500">{p.subCategory}</td>
                        <td className="px-10 py-6 font-black text-lg">₹{p.price}</td>
                        <td className="px-10 py-6">
                          <div className="flex justify-center gap-3">
                            <button onClick={() => handleEditProduct(p)} className="p-3 bg-zinc-100 rounded-xl hover:bg-black hover:text-white transition-all"><Edit size={16} /></button>
                            <button onClick={() => deleteProduct(p._id)} className="p-3 bg-zinc-100 rounded-xl hover:bg-[#fb5607] hover:text-white transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination UI */}
            <div className="flex items-center justify-between px-10">
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Page {productPage} of {totalProductPages}</p>
              <div className="flex gap-2">
                <button
                  disabled={productPage === 1}
                  onClick={() => setProductPage(prev => prev - 1)}
                  className="px-6 py-3 bg-white border border-zinc-100 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30"
                >
                  Prev
                </button>
                <button
                  disabled={productPage === totalProductPages}
                  onClick={() => setProductPage(prev => prev + 1)}
                  className="px-6 py-3 bg-zinc-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- CATEGORIES TAB --- */}
        {activeTab === 'categories' && (
          <div className="bg-white border-2 border-zinc-50 rounded-[48px] overflow-hidden">
            <div className="p-10 border-b border-zinc-50 flex flex-col sm:flex-row justify-between items-center gap-6">
              <h2 className="text-2xl font-black uppercase tracking-tight">Main Categories</h2>
              <button
                onClick={handleAddCategory}
                className="bg-[#fb5607] text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all shadow-xl w-full sm:w-auto justify-center"
              >
                <Plus size={20} /> Add Category
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-50/50">
                  <tr>
                    <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest">Category Name</th>
                    <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest">Slug (URL)</th>
                    <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest">Sub-Items</th>
                    <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest">Status</th>
                    <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {data.categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-zinc-50/30 transition-colors">
                      <td className="px-10 py-6 font-black text-sm uppercase leading-tight">{cat.name}</td>
                      <td className="px-10 py-6 font-bold text-[10px] text-zinc-400">{cat.slug}</td>
                      <td className="px-10 py-6">
                        <div className="flex flex-wrap gap-2">
                          {cat.items.map((it, idx) => (
                            <span key={idx} className="text-[8px] bg-zinc-100 px-2 py-1 rounded font-bold uppercase">{it.label}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        {cat.isActive ? <span className="text-emerald-500 font-black text-[10px] uppercase">Active</span> : <span className="text-red-500 font-black text-[10px] uppercase">Hidden</span>}
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex justify-center gap-3">
                          <button onClick={() => handleEditCategory(cat)} className="p-3 bg-zinc-100 rounded-xl hover:bg-black hover:text-white transition-all"><Edit size={16} /></button>
                          <button onClick={() => deleteCategory(cat._id)} className="p-3 bg-zinc-100 rounded-xl hover:bg-[#fb5607] hover:text-white transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-8 text-center bg-orange-50/30 border-t border-zinc-50">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Categories with 0 products will automatically be hidden from normal users to prevent empty views.</p>
            </div>
          </div>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
          <div className="bg-white border-2 border-zinc-50 rounded-[48px] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-50/50">
                <tr>
                  <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest">User Profile</th>
                  <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest">Role</th>
                  <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest">Status</th>
                  <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest text-center">Security</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {data.users.map((u) => (
                  <tr key={u._id}>
                    <td className="px-10 py-6">
                      <p className="font-black text-lg leading-tight">{u.name}</p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{u.email}</p>
                    </td>
                    <td className="px-10 py-6"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-[#fb5607]/10 text-[#fb5607]' : 'bg-zinc-100 text-zinc-600'}`}>{u.role}</span></td>
                    <td className="px-10 py-6">{u.isBlocked ? <span className="text-[#fb5607] font-black text-[10px] uppercase">Blocked</span> : <span className="text-emerald-600 font-black text-[10px] uppercase">Active</span>}</td>
                    <td className="px-10 py-6 flex justify-center">
                      <button onClick={() => handleBlockUser(u._id)} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${u.isBlocked ? 'bg-emerald-600 text-white shadow-lg' : 'bg-[#fb5607] text-white shadow-lg'}`}>
                        {u.isBlocked ? 'Unblock' : 'Block Access'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-8">
            {/* Order Filter Tabs */}
            <div className="flex items-center gap-2 bg-zinc-100 p-2 rounded-[32px] w-full md:w-fit overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Orders' },
                { id: 'processing', label: 'Processing' },
                { id: 'shipped', label: 'Shipped' },
                { id: 'delivered', label: 'Delivered' },
                { id: 'cancelled', label: 'Cancelled' },
                { id: 'history', label: 'History' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setOrderTab(tab.id)}
                  className={`px-8 py-3 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 ${orderTab === tab.id ? 'bg-black text-white shadow-xl scale-105' : 'text-zinc-500 hover:text-black hover:bg-zinc-200/50'}`}
                >
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-[8px] ${orderTab === tab.id ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-600'}`}>
                    {getOrderCounts()[tab.id]}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-white border-2 border-zinc-50 rounded-[48px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50/50">
                    <tr>
                      <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest">Order Details</th>
                      <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest">Customer</th>
                      <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest">Pricing</th>
                      <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest">Status</th>
                      <th className="px-10 py-6 text-xs font-black uppercase text-zinc-400 tracking-widest text-center">Lifecycle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {getFilteredOrders().map((o) => (
                      <tr key={o._id} className="hover:bg-zinc-50/30 transition-colors">
                        <td className="px-10 py-6">
                          <p className="font-mono text-[#fb5607] font-black text-xs leading-tight mb-1">#{o._id.slice(-8).toUpperCase()}</p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(o.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-10 py-6">
                          <p className="font-black text-sm uppercase leading-tight">{o.user?.name || 'Crayzee User'}</p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{o.paymentMethod}</p>
                        </td>
                        <td className="px-10 py-6">
                          <p className="font-black text-lg leading-tight">₹{o.totalPrice}</p>
                          <p className={`text-[8px] font-black uppercase tracking-widest ${o.isPaid ? 'text-emerald-500' : 'text-zinc-300'}`}>{o.isPaid ? 'Payment Confirmed' : 'Payment Pending'}</p>
                        </td>
                        <td className="px-10 py-6">
                          {o.status === 'Cancelled' && <span className="px-4 py-1.5 bg-red-50 text-red-500 rounded-full font-black text-[10px] uppercase border border-red-100 italic">Cancelled</span>}
                          {o.status === 'Processing' && <span className="px-4 py-1.5 bg-orange-50 text-orange-500 rounded-full font-black text-[10px] uppercase border border-orange-100">Processing</span>}
                          {o.status === 'Shipped' && <span className="px-4 py-1.5 bg-blue-50 text-blue-500 rounded-full font-black text-[10px] uppercase border border-blue-100">In Transit</span>}
                          {o.status === 'Delivered' && <span className="px-4 py-1.5 bg-emerald-50 text-emerald-500 rounded-full font-black text-[10px] uppercase border border-emerald-100 flex items-center gap-1 w-fit"><Check size={12} /> Delivered</span>}
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex justify-center gap-3">
                            <button onClick={() => handleViewOrder(o)} className="px-6 py-2.5 bg-zinc-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">View</button>

                            {o.status === 'Processing' && (
                              <>
                                <button onClick={() => updateOrderStatus(o._id, 'ship')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">Ship</button>
                                <button onClick={() => updateOrderStatus(o._id, 'cancel')} className="px-6 py-2.5 bg-white border border-red-100 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all">Cancel</button>
                              </>
                            )}

                            {o.status === 'Shipped' && (
                              <button onClick={() => updateOrderStatus(o._id, 'deliver')} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all">Deliver</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {getFilteredOrders().length === 0 && (
                      <tr><td colSpan="5" className="py-20 text-center text-zinc-400 font-black uppercase tracking-widest">No orders found in this category! 🏜️</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- REVIEWS MODERATION --- */}
        {activeTab === 'reviews' && (
          <div className="space-y-12">
            {/* Review Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-zinc-950 text-white p-8 rounded-[40px] shadow-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Total Community Feedback</p>
                <h3 className="text-5xl font-black">{getReviewStats().totalReviews}</h3>
                <p className="text-[10px] font-bold text-[#fb5607] mt-3 uppercase tracking-widest">Verified Vibe Checks</p>
              </div>
              <div className="bg-white border-2 border-zinc-50 p-8 rounded-[40px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Global Vibe Rating</p>
                <div className="flex items-center gap-4">
                  <h3 className="text-5xl font-black">{getReviewStats().globalAvg}</h3>
                  <div className="flex text-[#fb5607]">
                    <Star size={24} fill="currentColor" />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-zinc-400 mt-3 uppercase tracking-widest">Across {getReviewStats().reviewedProductsCount} Drops</p>
              </div>
              <div className="bg-[#fb5607] text-white p-8 rounded-[40px] shadow-xl shadow-[#fb5607]/20">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Customer Satisfaction</p>
                <h3 className="text-5xl font-black">{Math.round((getReviewStats().globalAvg / 5) * 100)}%</h3>
                <div className="w-full bg-white/20 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-white h-full" style={{ width: `${(getReviewStats().globalAvg / 5) * 100}%` }} />
                </div>
              </div>
            </div>

            {data.products.filter(p => p.reviews?.length > 0).length === 0 ? (
              <div className="bg-zinc-50 p-20 rounded-[48px] text-center border-2 border-dashed border-zinc-200">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 text-zinc-200 shadow-sm">
                  <MessageSquare size={40} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">No Reviews Yet</h3>
                <p className="text-zinc-400 font-medium">When users start rating your gear, they'll show up here for moderation.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {data.products.filter(p => p.reviews?.length > 0).map(product => (
                  <div key={product._id} className="bg-white border-2 border-zinc-50 rounded-[48px] overflow-hidden group hover:border-zinc-200 transition-all">
                    <div className="p-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {(product.images?.[0]?.url || product.image) ? (
                            <img src={product.images?.[0]?.url || product.image} className="w-16 h-20 rounded-2xl object-cover shadow-sm transition-transform group-hover:scale-105" alt={product.name} />
                          ) : (
                            <div className="w-16 h-20 bg-zinc-200 rounded-2xl flex items-center justify-center text-[10px] font-black text-zinc-400 uppercase">NA</div>
                          )}
                          <div className="absolute -top-2 -right-2 bg-black text-white w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-black">
                            {product.reviews.length}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-black uppercase tracking-tight">{product.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex text-[#fb5607]">
                              <Star size={12} fill="currentColor" />
                            </div>
                            <span className="text-[10px] font-black text-[#fb5607] uppercase tracking-widest">{product.rating.toFixed(1)} Rating</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
                      {product.reviews.map(r => (
                        <div key={r._id} className="bg-zinc-50/50 p-6 rounded-[32px] border border-transparent hover:border-zinc-100 transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center font-black text-[10px] text-zinc-500">
                                {r.name[0]}
                              </div>
                              <div>
                                <p className="font-black text-xs uppercase text-zinc-900">{r.name}</p>
                                <div className="flex gap-0.5 mt-0.5 mt-1">
                                  {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} size={8} fill={r.rating >= s ? '#fb5607' : 'none'} className={r.rating >= s ? 'text-[#fb5607]' : 'text-zinc-200'} />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <button onClick={() => deleteReview(product._id, r._id)} className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-zinc-600 text-sm font-medium leading-relaxed italic">"{r.comment || "Dropped a stellar rating! 🔥"}"</p>
                          <p className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest mt-4">Posted on {new Date(r.createdAt || Date.now()).toLocaleDateString()}</p>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCategoryModal(false)} className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-10 md:p-14">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black uppercase tracking-tighter">{currentCategory ? 'Edit Category' : 'New Category'}</h2>
                  <button onClick={() => setShowCategoryModal(false)} className="p-4 rounded-full bg-zinc-100 hover:rotate-90 transition-all"><X size={24} /></button>
                </div>
                <form onSubmit={saveCategory} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Category Name</label>
                    <input type="text" value={categoryFormData.name} onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">URL Slug</label>
                    <input type="text" value={categoryFormData.slug} onChange={e => setCategoryFormData({ ...categoryFormData, slug: e.target.value })} className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all" required />
                  </div>
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={categoryFormData.isActive} onChange={e => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })} className="w-5 h-5 accent-[#fb5607]" />
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-700">Category is Active</span>
                    </label>
                  </div>
                  
                  <div className="pt-4 border-t border-zinc-100">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Sub-Items (Menu Links)</label>
                      <button type="button" onClick={() => setCategoryFormData({ ...categoryFormData, items: [...categoryFormData.items, { label: '', href: '' }] })} className="text-[10px] bg-zinc-100 px-3 py-1 rounded font-black uppercase hover:bg-zinc-200">
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
                          }} className="flex-1 w-1/3 bg-zinc-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-1 focus:ring-[#fb5607]" required />
                          <input type="text" placeholder="URL (e.g. /browse?category=...)" value={item.href} onChange={e => {
                            const newItems = [...categoryFormData.items];
                            newItems[index].href = e.target.value;
                            setCategoryFormData({ ...categoryFormData, items: newItems });
                          }} className="flex-1 bg-zinc-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-1 focus:ring-[#fb5607]" required />
                          <button type="button" onClick={() => {
                            const newItems = [...categoryFormData.items];
                            newItems.splice(index, 1);
                            setCategoryFormData({ ...categoryFormData, items: newItems });
                          }} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"><Trash2 size={14} /></button>
                        </div>
                      ))}
                      {categoryFormData.items.length === 0 && <p className="text-[10px] text-zinc-400 italic">No sub-items added.</p>}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProductModal(false)} className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-white w-full max-w-4xl rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-10 md:p-14">
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-4xl font-black uppercase tracking-tighter">{currentProduct ? 'Update Drop' : 'New Drop Leak'}</h2>
                  <button onClick={() => setShowProductModal(false)} className="p-4 rounded-full bg-zinc-100 hover:rotate-90 transition-all"><X size={24} /></button>
                </div>
                <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div><label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Product Name</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 font-bold outline-none ring-2 ring-transparent focus:ring-[#fb5607] transition-all" required /></div>
                    <div className="grid grid-cols-2 gap-6">
                      <div><label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Price (₹)</label><input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all" required /></div>
                      <div><label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Stock</label><input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all" required /></div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Category</label>
                        <select
                          value={formData.category}
                          onChange={e => {
                            setFormData({
                              ...formData,
                              category: e.target.value
                            });
                          }}
                          className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all appearance-none uppercase"
                        >
                          <option value="">Select Category</option>
                          {data.categories.map(cat => <option key={cat.slug} value={cat.slug} className="uppercase">{cat.name}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Gender Label</label>
                          {categoriesConfig[formData.category]?.genders ? (
                            <select
                              value={formData.gender}
                              onChange={e => setFormData({ ...formData, gender: e.target.value })}
                              className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all appearance-none uppercase"
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
                              className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all"
                              required
                              placeholder="e.g. men or unisex"
                            />
                          )}
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Sub Category</label>
                          {categoriesConfig[formData.category]?.subCategories ? (
                            <select
                              value={formData.subCategory}
                              onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                              className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all appearance-none uppercase"
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
                              className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all"
                              required
                              placeholder="e.g. oversized or limited"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Available Sizes</label>
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
                              : 'bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-[#fb5607] hover:text-[#fb5607]'
                              }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Deselect sizes that are not applicable to this drop.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div><label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Drop Description</label><textarea rows="5" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-zinc-50 border-none rounded-3xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all resize-none" required></textarea></div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Visual Drops (Images)</label>
                      <div className="grid grid-cols-3 gap-4">
                        {formData.images.map((img, i) => (
                          <div key={img.public_id} className="relative aspect-[3/4] group rounded-2xl overflow-hidden border border-zinc-100">
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
                          <label className={`aspect-[3/4] rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#fb5607] hover:bg-[#fb5607]/5 transition-all ${uploading ? 'animate-pulse' : ''}`}>
                            {uploading ? (
                              <div className="w-6 h-6 border-2 border-[#fb5607] border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <Upload size={24} className="text-zinc-400 mb-2" />
                                <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest text-center px-4">Add Shot</span>
                              </>
                            )}
                            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
                          </label>
                        )}
                      </div>
                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Max 5 images. Recommended: 3:4 aspect ratio.</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 pt-6">
                    <button type="submit" className="w-full bg-zinc-950 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-[#fb5607] transition-all transform active:scale-95">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOrderModal(false)} className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-white w-full max-w-5xl rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-10 md:p-14">
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter">Order Details</h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">ID: #{currentOrder._id}</p>
                  </div>
                  <button onClick={() => setShowOrderModal(false)} className="p-4 rounded-full bg-zinc-100 hover:rotate-90 transition-all"><X size={24} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {/* Left: Info */}
                  <div className="md:col-span-2 space-y-12">
                    <section>
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#fb5607] mb-6">Customer & Shipping</h3>
                      <div className="grid grid-cols-2 gap-8 bg-zinc-50 p-8 rounded-[32px]">
                        <div>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Customer</p>
                          <p className="font-black uppercase">{currentOrder.user?.name}</p>
                          <p className="text-xs text-zinc-500">{currentOrder.user?.email}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Shipping Address</p>
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
                          <div key={i} className="flex items-center gap-6 p-4 border border-zinc-100 rounded-[24px]">
                            <img src={item.image} className="w-16 h-20 object-cover rounded-xl" alt={item.name} />
                            <div className="flex-1">
                              <p className="font-black uppercase text-sm">{item.name}</p>
                              <p className="text-[10px] font-bold text-zinc-400">
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
                    <section className="bg-zinc-950 text-white p-10 rounded-[40px]">
                      <h3 className="text-xl font-black uppercase tracking-tight mb-8">Summary</h3>
                      <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500">
                          <span>Payment Method</span>
                          <span className="text-white">{currentOrder.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500">
                          <span>Payment Status</span>
                          <span className={currentOrder.isPaid ? 'text-emerald-500' : 'text-orange-500'}>{currentOrder.isPaid ? 'PAID' : 'PENDING'}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500">
                          <span>Order Status</span>
                          <span className={`font-black ${currentOrder.status === 'Cancelled' ? 'text-red-500' : currentOrder.status === 'Delivered' ? 'text-emerald-500' : 'text-orange-500'}`}>
                            {currentOrder.status?.toUpperCase() || 'PROCESSING'}
                          </span>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-white/10">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-black uppercase text-zinc-500">Total Price</span>
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
                            className="w-full py-6 rounded-3xl bg-zinc-100 text-zinc-900 border-2 border-zinc-200 font-black text-sm uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
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
