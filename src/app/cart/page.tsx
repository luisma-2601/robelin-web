import CartClient from "./CartClient";
import { getBcvRate } from "@/lib/bcv";

export const revalidate = 60; // Refresh exchange rate data every minute minimum

export default async function CartPage() {
  const bcvRate = await getBcvRate();
  
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight text-white mb-8">Tu Carrito</h1>
      <CartClient bcvRate={bcvRate} />
    </main>
  );
}
