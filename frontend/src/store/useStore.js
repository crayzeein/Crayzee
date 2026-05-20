import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API from '@/utils/api';

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      cart: [],
      wishlist: [],
      cartToast: null,
      wishlistToast: null,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setUser: (user, token, refreshToken) => set({ user, token, refreshToken: refreshToken || null }),
      logout: async () => {
        // Invalidate refresh token on backend
        try {
          await API.post('/auth/logout');
        } catch (e) {
          // Ignore errors during logout
        }
        set({ user: null, token: null, refreshToken: null, cart: [], wishlist: [] });
        localStorage.removeItem('crayzee-storage');
      },
      setWishlist: (wishlist) => set({ wishlist }),

      addToCart: (product, qty = 1, size = null) => set((state) => {
        const cartItemId = size ? `${product._id}-${size}` : product._id;
        const itemIndex = state.cart.findIndex((item) => item.cartItemId === cartItemId);

        const toastData = {
          name: product.name,
          image: product.images?.[0]?.url || product.image || '',
          price: product.price,
          size: size,
          qty: qty
        };

        if (itemIndex > -1) {
          const newCart = [...state.cart];
          const potentialQty = newCart[itemIndex].qty + qty;
          newCart[itemIndex].qty = product.stock !== undefined ? Math.min(potentialQty, product.stock) : potentialQty;
          return { cart: newCart, cartToast: toastData };
        }

        const finalQty = product.stock !== undefined ? Math.min(qty, product.stock) : qty;
        return {
          cart: [...state.cart, { ...product, cartItemId, qty: finalQty, selectedSize: size }],
          cartToast: toastData
        };
      }),

      clearCartToast: () => set({ cartToast: null }),

      updateCartQty: (cartItemId, qty) => set((state) => ({
        cart: state.cart.map((item) =>
          item.cartItemId === cartItemId ? { ...item, qty: Math.max(0, qty) } : item
        )
      })),

      setCart: (newCart) => set({ cart: newCart }),

      removeFromCart: (cartItemId) => set((state) => ({
        cart: state.cart.filter((item) => item.cartItemId !== cartItemId)
      })),

      clearCart: () => set({ cart: [] }),

      toggleWishlist: async (product) => {
        const state = get();
        const isInWishlist = state.wishlist.find((item) => item._id === product._id);

        let newWishlist;
        const added = !isInWishlist;
        if (isInWishlist) {
          newWishlist = state.wishlist.filter((item) => item._id !== product._id);
        } else {
          newWishlist = [...state.wishlist, product];
        }

        set({
          wishlist: newWishlist,
          wishlistToast: {
            name: product.name,
            image: product.images?.[0]?.url || product.image || '',
            price: product.price,
            added: added
          }
        });

        // If user is logged in, sync with backend
        if (state.user) {
          try {
            await API.post(`/users/wishlist/${product._id}`);
          } catch (error) {
            console.error('Wishlist sync failed:', error);
          }
        }
      },

      clearWishlistToast: () => set({ wishlistToast: null }),

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
        refreshToken: state.refreshToken,
        cart: state.cart,
        wishlist: state.wishlist
      }),
    }
  )
);
