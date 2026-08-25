"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCartItemQuantity, removeCartItem } from "@/lib/cart/actions";

export default function CartItemRow({ id, quantity }: { id: string; quantity: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeQty(delta: number) {
    const formData = new FormData();
    formData.set("id", id);
    formData.set("quantity", String(quantity + delta));
    startTransition(async () => {
      await updateCartItemQuantity(formData);
      router.refresh();
    });
  }

  function remove() {
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      await removeCartItem(formData);
      router.refresh();
    });
  }

  return (
    <>
      <div className="qty-control">
        <button className="qty-btn" onClick={() => changeQty(-1)} disabled={isPending}>
          −
        </button>
        <span className="qty-val">{quantity}</span>
        <button className="qty-btn" onClick={() => changeQty(1)} disabled={isPending}>
          +
        </button>
      </div>
      <button className="remove-item" onClick={remove} disabled={isPending}>
        Retirer
      </button>
    </>
  );
}
