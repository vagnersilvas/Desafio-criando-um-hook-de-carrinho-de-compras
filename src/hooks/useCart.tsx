import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  function compare(product1: Product, product2: Product) {
    return JSON.stringify(product1) === JSON.stringify(product2)
  }

  const addProduct = async (productId: number) => {
    try {
      const response = await api.get(`products/${productId}`)

      const product = {
        ...response.data,
        amount: 1
      }

      setCart(cart => {
        const newCart = [
          ...cart,
          product
        ]

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))

        return newCart
      })

      // TODO
    } catch {
      console.log(toast.error('erro'))
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productDeleted = cart.filter(product => (product.id !== productId))

      setCart([...productDeleted]);

    } catch {
    toast.error('erro')

    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      
      setCart(cart => {

        const productStoraged = cart.map(item => {
          if (item.id === productId) {
            return item = {
              id: item.id,
              title: item.title,
              price: item.price,
              image: item.image,
              amount: amount
            }
          }
          return item
        })
        
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(productStoraged))

        return productStoraged
      })

    } catch {
      toast.error('erro')
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
