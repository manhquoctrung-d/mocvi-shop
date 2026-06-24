import { createContext, useContext, useReducer, useEffect } from 'react';

const CartCtx = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const idx = state.findIndex(i => i.product.id === action.product.id);
      if (idx >= 0) {
        const next = [...state];
        next[idx] = { ...next[idx], qty: next[idx].qty + action.qty };
        return next;
      }
      return [...state, { product: action.product, qty: action.qty }];
    }
    case 'SET_QTY':
      if (action.qty <= 0) return state.filter(i => i.product.id !== action.id);
      return state.map(i => i.product.id === action.id ? { ...i, qty: action.qty } : i);
    case 'REMOVE':
      return state.filter(i => i.product.id !== action.id);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], () => {
    try { return JSON.parse(localStorage.getItem('mocvi_cart') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('mocvi_cart', JSON.stringify(items));
  }, [items]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);

  return (
    <CartCtx.Provider value={{ items, count, total, dispatch }}>
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => useContext(CartCtx);
