import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API from '@/utils/api';

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      cart: [],
      wishlist: [],
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setUser: (user, token) => set({ user, token }),
      logout: () => {
        set({ user: null, token: null, cart: [], wishlist: [] });
        localStorage.removeItem('crayzee-storage');
      },
      setWishlist: (wishlist) => set({ wishlist }),

      addToCart: (product, qty = 1) => set((state) => {
        const itemIndex = state.cart.findIndex((item) => item._id === product._id);
        if (itemIndex > -1) {
          const newCart = [...state.cart];
          const potentialQty = newCart[itemIndex].qty + qty;
          newCart[itemIndex].qty = product.stock !== undefined ? Math.min(potentialQty, product.stock) : potentialQty;
          return { cart: newCart };
        }
        const finalQty = product.stock !== undefined ? Math.min(qty, product.stock) : qty;
        return { cart: [...state.cart, { ...product, qty: finalQty }] };
      }),

      updateCartQty: (productId, qty) => set((state) => ({
        cart: state.cart.map((item) =>
          item._id === productId ? { ...item, qty: Math.max(0, qty) } : item
        )
      })),

      setCart: (newCart) => set({ cart: newCart }),

      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter((item) => item._id !== productId)
      })),

      clearCart: () => set({ cart: [] }),

      toggleWishlist: async (product) => {
        const state = get();
        const isInWishlist = state.wishlist.find((item) => item._id === product._id);

        let newWishlist;
        if (isInWishlist) {
          newWishlist = state.wishlist.filter((item) => item._id !== product._id);
        } else {
          newWishlist = [...state.wishlist, product];
        }

        set({ wishlist: newWishlist });

        // If user is logged in, sync with backend
        if (state.user) {
          try {
            await API.post(`/users/wishlist/${product._id}`);
          } catch (error) {
            console.error('Wishlist sync failed:', error);
          }
        }
      },

      // Category State
      activeMainCat: 'all',
      activeGender: 'all',
      activeSubCat: 'all',
      setCategory: (main, gender, sub) => set({
        activeMainCat: main || 'all',
        activeGender: gender || 'all',
        activeSubCat: sub || 'all'
      }),
    }),
    {
      name: 'crayzee-storage',
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        cart: state.cart,
        wishlist: state.wishlist
      }),
    }
  )
);
