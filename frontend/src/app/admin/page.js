'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import API from '@/utils/api';
import {
  LayoutDashboard, Package, Users as UsersIcon, ShoppingCart,
  MessageSquare, ShieldAlert, TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import OverviewTab from './components/OverviewTab';
import ProductsTab from './components/ProductsTab';
import CategoriesTab from './components/CategoriesTab';
import UsersTab from './components/UsersTab';
import OrdersTab from './components/OrdersTab';
import ReviewsTab from './components/ReviewsTab';
import ProductModal from './components/ProductModal';
import CategoryModal from './components/CategoryModal';
import OrderModal from './components/OrderModal';

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
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: TrendingUp },
    { id: 'users', label: 'Customers', icon: UsersIcon },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare }
  ];

  if (loading && activeTab === 'overview') return <div className="min-h-screen flex items-center justify-center font-semibold text-lg animate-pulse text-zinc-400">Loading dashboard...</div>;

  return (
    <main className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 dark:text-zinc-100 flex flex-col overflow-x-hidden pb-20 md:pb-0">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[260px] bg-white dark:bg-zinc-900 flex-col fixed top-0 left-0 h-screen border-r border-zinc-200 dark:border-zinc-800 z-40 overflow-y-auto thin-scrollbar">
        <div className="px-7 pt-8 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#fb5607] rounded-xl flex items-center justify-center">
              <ShieldAlert size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-zinc-900 dark:text-white leading-tight">Crayzee</p>
              <p className="text-[10px] text-zinc-400 font-medium">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-col flex-1 px-4 pt-4 gap-0.5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2">Menu</p>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${activeTab === item.id ? 'bg-[#fb5607]/10 text-[#fb5607]' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                }`}
            >
              <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 1.8} />
              <span className="text-[13px] font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="px-4 pb-6 mt-auto">
          <button onClick={() => router.push('/')} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
            <ShieldAlert size={18} />
            <span className="text-[13px] font-semibold">Exit Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-around items-center px-1 py-1.5 safe-area-pb">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-0 ${activeTab === item.id ? 'text-[#fb5607]' : 'text-zinc-400'}`}
          >
            <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 1.5} />
            <span className="text-[9px] font-medium truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <section className="flex-1 md:ml-[260px] p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto overflow-x-hidden">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-3">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 capitalize">{activeTab === 'overview' ? 'Dashboard' : activeTab}</h1>
            <p className="text-[12px] text-zinc-400 dark:text-zinc-500 font-normal mt-0.5">Welcome back, manage your store</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#fb5607]/10 rounded-full flex items-center justify-center text-[#fb5607] text-[11px] font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-[12px] font-medium text-zinc-600 dark:text-zinc-400">{user?.name}</span>
          </div>
        </header>

        {activeTab === 'overview' && <OverviewTab data={data} />}

        {activeTab === 'products' && (
          <ProductsTab
            data={data}
            productPage={productPage}
            totalProductPages={totalProductPages}
            setProductPage={setProductPage}
            handleAddProduct={handleAddProduct}
            handleEditProduct={handleEditProduct}
            deleteProduct={deleteProduct}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesTab
            data={data}
            handleAddCategory={handleAddCategory}
            handleEditCategory={handleEditCategory}
            deleteCategory={deleteCategory}
          />
        )}

        {activeTab === 'users' && <UsersTab data={data} handleBlockUser={handleBlockUser} />}

        {activeTab === 'orders' && (
          <OrdersTab
            orderTab={orderTab}
            setOrderTab={setOrderTab}
            getFilteredOrders={getFilteredOrders}
            handleViewOrder={handleViewOrder}
            updateOrderStatus={updateOrderStatus}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewsTab data={data} getReviewStats={getReviewStats} deleteReview={deleteReview} />
        )}
      </section>

      {/* Modals */}
      <CategoryModal
        show={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        currentCategory={currentCategory}
        categoryFormData={categoryFormData}
        setCategoryFormData={setCategoryFormData}
        saveCategory={saveCategory}
      />

      <ProductModal
        show={showProductModal}
        onClose={() => setShowProductModal(false)}
        currentProduct={currentProduct}
        formData={formData}
        setFormData={setFormData}
        saveProduct={saveProduct}
        handleFileChange={handleFileChange}
        removeImage={removeImage}
        uploading={uploading}
        data={data}
        categoriesConfig={categoriesConfig}
      />

      <OrderModal
        show={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        currentOrder={currentOrder}
        updateOrderStatus={updateOrderStatus}
      />
    </main>
  );
}