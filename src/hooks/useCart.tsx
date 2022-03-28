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

  const addProduct = async (productId: number) => {
    try {
      const responseProducts = await api.get(`products/${productId}`)

      const responseStocks = await api.get(`stock/${productId}`)

      if (responseStocks.data?.amount > 0) {

        const product = {
          ...responseProducts.data,
          amount: 1
        }
        const obj = {
          productId: productId,
          amount: responseStocks.data?.amount - product.amount
        }
        setCart(cart => {
          const newProduct = [
            ...cart,
            product
          ]
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newProduct))

          return newProduct
        })
        // updateProductAmount(obj)
        return
      }

      // toast.error('Estoque indisponível')

    } catch {
      toast.error('erro')
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
      const stock = {
        id: productId,
        amount: amount
      }
      await api.put(`stock/${productId}`, stock).then(console.log)

    } catch {
      toast.error('erro')
    }

  }

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
