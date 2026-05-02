import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ChevronRight,
  Coins,
  MapPin,
  Store,
  Ticket,
} from "lucide-react";
import { useAuthStore } from "@/store";
import { useMyCart } from "@/hooks/useMyCart";
import { usePartnerNames } from "@/hooks/usePartnerNames";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRequiresPhysicalShipping } from "@/hooks/useRequiresPhysicalShipping";
import { orderApi } from "@/services/order/order.api";
import type { CheckoutNavigateState, PreviewOrderResponse } from "@/types";
import { PaymentMethod } from "@/types";
import {
  CheckoutAddressModal,
  type SavedCheckoutAddress,
} from "@/features/checkout/components/CheckoutAddressModal";
import { CheckoutVoucherModal } from "@/features/checkout/components/CheckoutVoucherModal";
import type { CartItemDto } from "@/types";
import { getAxiosErrorMessage } from "@/utils/axiosErrorMessage";

const ADDR_STORAGE = "sv_checkout_addresses_v1";

const formatVnd = (v: number) =>
  `${new Intl.NumberFormat("vi-VN").format(Math.round(v))}₫`;

const parseVariantText = (json: string | null) => {
  if (!json) return "";
  try {
    const obj = JSON.parse(json) as Record<string, string>;
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
  } catch {
    return "";
  }
};

function loadAddresses(): SavedCheckoutAddress[] {
  try {
    const raw = localStorage.getItem(ADDR_STORAGE);
    if (!raw) return [];
    const p = JSON.parse(raw) as SavedCheckoutAddress[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function saveAddresses(list: SavedCheckoutAddress[]) {
  localStorage.setItem(ADDR_STORAGE, JSON.stringify(list));
}

export function PreviewOrderPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CheckoutNavigateState | null;
  const user = useAuthStore((s) => s.user);

  const [addrProvinceCode, setAddrProvinceCode] = useState("");
  const [addrWardCode, setAddrWardCode] = useState("");
  const [addrStreetLine, setAddrStreetLine] = useState("");

  const { data: cart, isLoading: cartLoading } = useMyCart(true);

  const selectedIds = state?.selectedCartItemIds ?? [];
  const selectedItems = useMemo(() => {
    const items = cart?.items ?? [];
    const set = new Set(selectedIds);
    return items.filter((i) => set.has(i.id));
  }, [cart?.items, selectedIds]);

  const validSelectedIds = useMemo(
    () => selectedItems.map((i) => i.id),
    [selectedItems],
  );

  const partnerIds = useMemo(
    () => selectedItems.map((i) => i.partnerId),
    [selectedItems],
  );
  const { partnerNameMap } = usePartnerNames(partnerIds);

  const { needsShipping, isLoading: shippingMetaLoading } =
    useRequiresPhysicalShipping(selectedItems, selectedItems.length > 0);

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState<SavedCheckoutAddress[]>(
    () => loadAddresses(),
  );

  const [platformVoucherCode, setPlatformVoucherCode] = useState<string | null>(
    null,
  );
  const [shopVoucherCodes, setShopVoucherCodes] = useState<
    Record<string, string>
  >({});
  const [platformVoucherOpen, setPlatformVoucherOpen] = useState(false);
  const [shopVoucherOpenFor, setShopVoucherOpenFor] = useState<string | null>(
    null,
  );

  const [useSoulCoin, setUseSoulCoin] = useState(false);
  const [soulCoinAmountToUse, setSoulCoinAmountToUse] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.VnPay,
  );

  const [preview, setPreview] = useState<PreviewOrderResponse | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const soulBalance = user?.soulCoinBalance ?? 0;

  const previewInput = useMemo(
    () => ({
      userId: user?.id,
      selectedCartItemIds: validSelectedIds.length ? validSelectedIds : null,
      platformVoucherCode,
      shopVoucherCodes,
      useSoulCoin,
      soulCoinAmountToUse: useSoulCoin ? soulCoinAmountToUse : 0,
    }),
    [
      user?.id,
      validSelectedIds,
      platformVoucherCode,
      shopVoucherCodes,
      useSoulCoin,
      soulCoinAmountToUse,
    ],
  );

  const debouncedPreviewInput = useDebouncedValue(previewInput, 400);

  const runPreview = useCallback(async () => {
    if (!user?.id || !debouncedPreviewInput.selectedCartItemIds?.length) return;
    setPreviewError(null);
    try {
      const res = await orderApi.previewOrder({
        userId: user.id,
        selectedCartItemIds: debouncedPreviewInput.selectedCartItemIds,
        platformVoucherCode: debouncedPreviewInput.platformVoucherCode,
        shopVoucherCodes: debouncedPreviewInput.shopVoucherCodes,
        useSoulCoin: debouncedPreviewInput.useSoulCoin,
        soulCoinAmountToUse: debouncedPreviewInput.soulCoinAmountToUse,
      });
      setPreview(res);
    } catch (e: unknown) {
      const msg = getAxiosErrorMessage(e, t("checkout.previewError"));
      setPreviewError(msg);
      toast.error(msg);
    }
  }, [user?.id, debouncedPreviewInput, t]);

  useEffect(() => {
    void runPreview();
  }, [runPreview]);

  const imageByCartId = useMemo(() => {
    const m = new Map<string, string | null>();
    selectedItems.forEach((i) => m.set(i.id, i.mainImage));
    return m;
  }, [selectedItems]);

  const cartItemById = useMemo(() => {
    const m = new Map<string, CartItemDto>();
    selectedItems.forEach((i) => m.set(i.id, i));
    return m;
  }, [selectedItems]);

  const createMutation = useMutation({
    mutationFn: () =>
      orderApi.createOrder({
        userId: user?.id,
        receiverName: needsShipping ? receiverName : null,
        receiverPhone: needsShipping ? receiverPhone : null,
        receiverEmail: receiverEmail || null,
        shippingAddress: needsShipping ? shippingAddress : null,
        orderNotes: null,
        selectedCartItemIds: validSelectedIds,
        platformVoucherCode,
        shopVoucherCodes,
        useSoulCoin,
        soulCoinAmountToUse: useSoulCoin ? soulCoinAmountToUse : 0,
        paymentMethod,
      }),
  });

  const handlePlaceOrder = async () => {
    if (!user?.id) return;
    if (needsShipping) {
      if (
        !receiverName.trim() ||
        !receiverPhone.trim() ||
        !shippingAddress.trim()
      ) {
        setAddressModalOpen(true);
        return;
      }
    }
    try {
      const res = await createMutation.mutateAsync();
      if (!res.success) {
        const msg = res.message || t("checkout.orderFailed");
        setPreviewError(msg);
        toast.error(msg);
        return;
      }
      if (res.paymentUrl) {
        window.location.assign(res.paymentUrl);
        return;
      }
      navigate("/cart", { replace: true });
    } catch (e: unknown) {
      const msg = getAxiosErrorMessage(e, t("checkout.orderFailed"));
      setPreviewError(msg);
      toast.error(msg);
    }
  };

  const onToggleSoulCoin = (on: boolean) => {
    setUseSoulCoin(on);
    if (on && preview) {
      const max = Math.min(
        soulBalance,
        Math.max(0, Math.floor(preview.grandTotal)),
      );
      setSoulCoinAmountToUse(max);
    }
    if (!on) setSoulCoinAmountToUse(0);
  };

  useEffect(() => {
    if (!useSoulCoin || !preview) return;
    const max = Math.min(
      soulBalance,
      Math.max(0, Math.floor(preview.grandTotal)),
    );
    setSoulCoinAmountToUse((prev) => Math.min(prev, max));
  }, [useSoulCoin, preview, soulBalance]);

  if (!user?.id) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!state?.selectedCartItemIds?.length) {
    return <Navigate to="/cart" replace />;
  }

  if (cartLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-[#004d40]">
        {t("checkout.loading")}
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const shopDiscountSum =
    preview?.vendorOrders.reduce((s, v) => s + v.shopDiscountAmount, 0) ?? 0;

  const amountForVoucherApi =
    preview?.grandTotal ?? selectedItems.reduce((s, i) => s + i.subTotal, 0);

  const allowFreeShippingVoucher = shippingMetaLoading || needsShipping;

  return (
    <div className="min-h-screen bg-[#fdfaf5] pb-16">
      <div className="border-b border-black/5 bg-[#fdfaf5]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            to="/cart"
            className="flex items-center gap-2 text-sm font-semibold text-[#004d40]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("checkout.backToCart")}
          </Link>
          <h1 className="font-serif text-2xl font-bold text-[#004d40]">
            {t("checkout.title")}
          </h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {needsShipping || shippingMetaLoading ? (
            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  {t("checkout.delivery.title")}
                </span>
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(true)}
                  className="text-xs font-bold uppercase text-[#004d40]"
                >
                  {t("checkout.delivery.change")}
                </button>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">
                    {receiverName || t("checkout.delivery.placeholderName")}
                  </div>
                  <div className="text-gray-600">{receiverPhone || "—"}</div>
                  <div className="mt-1 text-gray-700">
                    {shippingAddress ||
                      t("checkout.delivery.placeholderAddress")}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {previewError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {previewError}
            </div>
          ) : null}

          {(preview?.vendorOrders ?? []).map((vo) => {
            const shopCode = shopVoucherCodes[vo.partnerId] ?? null;
            return (
              <section
                key={vo.partnerId}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#004d40]">
                  <Store className="h-4 w-4" />
                  {partnerNameMap[vo.partnerId] ?? vo.partnerId.slice(0, 8)}
                </div>

                <div className="space-y-3">
                  {vo.items.map((line) => {
                    const cartLine = cartItemById.get(line.cartItemId);
                    const img = imageByCartId.get(line.cartItemId);
                    const variantText =
                      parseVariantText(line.variantAttributesJson) ||
                      parseVariantText(cartLine?.variantAttributesJson ?? null);
                    return (
                      <div
                        key={line.cartItemId}
                        className="flex gap-3 border-b border-black/5 pb-3 last:border-0"
                      >
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                          {img ? (
                            <img
                              src={img}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900">
                            {line.productName}
                          </div>
                          {variantText ? (
                            <div className="text-xs text-gray-500">
                              {variantText}
                            </div>
                          ) : null}
                          <div className="text-xs text-gray-500">
                            {t("checkout.lineQty", { qty: line.quantity })}
                          </div>
                        </div>
                        <div className="shrink-0 text-sm font-bold text-gray-900">
                          {formatVnd(line.totalPrice)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setShopVoucherOpenFor(vo.partnerId)}
                  className="mt-3 flex w-full items-center justify-between rounded-xl bg-[#f8faf9] px-3 py-2 text-left text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-[#004d40]" />
                    {shopCode
                      ? t("checkout.shopVoucher.applied")
                      : t("checkout.shopVoucher.select")}
                  </span>
                  <span className="flex items-center gap-2 font-semibold text-[#16a34a]">
                    {shopCode && preview
                      ? formatVnd(
                          vo.shopDiscountAmount > 0
                            ? -vo.shopDiscountAmount
                            : 0,
                        )
                      : null}
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </span>
                </button>
              </section>
            );
          })}
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <button
              type="button"
              onClick={() => setPlatformVoucherOpen(true)}
              className="flex w-full items-center justify-between text-sm font-semibold text-gray-900"
            >
              <span className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-[#004d40]" />
                {t("checkout.platformVoucher.title")}
              </span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>

          </section>

          <section
            className="rounded-2xl border border-[#d4e3db] bg-[#f1f6f3] p-4 shadow-sm"
            aria-label={t("checkout.soulCoin.balanceTitle")}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#b5654c] text-white shadow-md ring-2 ring-white/40"
                  aria-hidden
                >
                  <Coins className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="text-sm font-bold tracking-tight text-gray-900">
                    {t("checkout.soulCoin.balanceTitle")}
                  </div>
                  <p className="text-xs leading-relaxed text-gray-600">
                    {t("checkout.soulCoin.hint", {
                      coins: new Intl.NumberFormat(
                        i18n.language?.startsWith("vi") ? "vi-VN" : "en-US",
                      ).format(soulBalance),
                      vnd: formatVnd(soulBalance),
                    })}
                  </p>
                  {useSoulCoin ? (
                    <div className="pt-2">
                      <label htmlFor="checkout-soul-coin-amount" className="sr-only">
                        {t("checkout.soulCoin.inputLabel")}
                      </label>
                      <input
                        id="checkout-soul-coin-amount"
                        type="number"
                        min={0}
                        max={Math.min(
                          soulBalance,
                          preview
                            ? Math.floor(preview.grandTotal)
                            : soulBalance,
                        )}
                        className="w-full rounded-full border border-gray-300/90 bg-white px-4 py-2.5 text-sm tabular-nums text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-[#004d40] focus:ring-2 focus:ring-[#004d40]/20"
                        value={soulCoinAmountToUse}
                        onChange={(e) =>
                          setSoulCoinAmountToUse(Number(e.target.value))
                        }
                      />
                      <p className="mt-1.5 text-[11px] text-gray-500">
                        {t("checkout.soulCoin.useHint")}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={useSoulCoin}
                aria-label={t("checkout.soulCoin.toggleAria")}
                onClick={() => onToggleSoulCoin(!useSoulCoin)}
                className={`relative mt-0.5 h-8 w-13 shrink-0 rounded-full transition-colors ${
                  useSoulCoin
                    ? "bg-[#004d40]"
                    : "bg-[#b8ccbf]"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-7 w-7 rounded-full bg-white shadow-md transition-[left] ${
                    useSoulCoin ? "left-[calc(100%-1.875rem)]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-gray-900">
              {t("checkout.payment.title")}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod(PaymentMethod.VnPay)}
                className={`rounded-xl border px-2 py-3 text-center text-xs font-bold ${
                  paymentMethod === PaymentMethod.VnPay
                    ? "border-[#004d40] text-[#004d40]"
                    : "border-gray-200 text-gray-700"
                }`}
              >
                VnPay
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod(PaymentMethod.Cod)}
                className={`rounded-xl border px-2 py-3 text-center text-xs font-bold ${
                  paymentMethod === PaymentMethod.Cod
                    ? "border-[#004d40] text-[#004d40]"
                    : "border-gray-200 text-gray-700"
                }`}
              >
                COD
              </button>
            </div>
            <button
              type="button"
              onClick={() => setPaymentMethod(PaymentMethod.SoulCoin)}
              className={`mt-2 w-full rounded-xl border px-2 py-3 text-center text-xs font-bold ${
                paymentMethod === PaymentMethod.SoulCoin
                  ? "border-[#004d40] text-[#004d40]"
                  : "border-gray-200 text-gray-700"
              }`}
            >
              SoulCoin
            </button>
          </section>

          <section className="rounded-2xl bg-[#f5efe6] p-4 shadow-inner">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("checkout.summary.subtotal")}
                </span>
                <span>{formatVnd(preview?.totalItemsPrice ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("checkout.summary.shipping")}
                </span>
                <span>{formatVnd(preview?.totalShippingFee ?? 0)}</span>
              </div>
              <div className="flex justify-between text-[#16a34a]">
                <span>{t("checkout.summary.shopDiscounts")}</span>
                <span>
                  {shopDiscountSum
                    ? `-${formatVnd(shopDiscountSum)}`
                    : formatVnd(0)}
                </span>
              </div>
              <div className="flex justify-between text-[#16a34a]">
                <span>{t("checkout.summary.platformVoucher")}</span>
                <span>
                  {preview?.platformDiscountAmount
                    ? `-${formatVnd(preview.platformDiscountAmount)}`
                    : formatVnd(0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("checkout.summary.soulCoin")}
                </span>
                <span>
                  {preview?.soulCoinUsed
                    ? `-${formatVnd(preview.soulCoinUsed)}`
                    : formatVnd(0)}
                </span>
              </div>
            </div>
            <div className="mt-4 border-t border-black/10 pt-4">
              <div className="text-xs font-semibold text-gray-600">
                {t("checkout.summary.total")}
              </div>
              <div className="font-serif text-3xl font-bold text-[#8d4925]">
                {formatVnd(preview?.finalPayableAmount ?? 0)}
              </div>
              <div className="text-xs text-gray-500">
                {t("checkout.summary.vat")}
              </div>
            </div>
            <button
              type="button"
              disabled={createMutation.isPending || !preview}
              onClick={() => void handlePlaceOrder()}
              className="mt-4 w-full rounded-2xl bg-[#8d4925] py-3 text-sm font-extrabold uppercase tracking-wide text-white disabled:opacity-50"
            >
              {t("checkout.placeOrder")}
            </button>
          </section>
        </aside>
      </div>

      <CheckoutAddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        saved={savedAddresses}
        onSaveSaved={(list) => {
          setSavedAddresses(list);
          saveAddresses(list);
        }}
        onConfirm={(addr) => {
          setReceiverName(addr.receiverName);
          setReceiverPhone(addr.receiverPhone);
          setReceiverEmail(addr.receiverEmail);
          setShippingAddress(addr.shippingAddress);
          setAddrProvinceCode(addr.provinceCode ?? "");
          setAddrWardCode(addr.wardCode ?? "");
          setAddrStreetLine(addr.streetLine ?? "");
        }}
        initial={{
          receiverName,
          receiverPhone,
          receiverEmail,
          shippingAddress,
          provinceCode: addrProvinceCode,
          wardCode: addrWardCode,
          streetLine: addrStreetLine,
        }}
      />

      <CheckoutVoucherModal
        open={platformVoucherOpen}
        onClose={() => setPlatformVoucherOpen(false)}
        title={t("checkout.platformVoucher.modalTitle")}
        currentOrderAmount={amountForVoucherApi}
        initialCode={platformVoucherCode}
        allowFreeShippingVoucher={allowFreeShippingVoucher}
        onConfirm={(code) => setPlatformVoucherCode(code)}
      />

      <CheckoutVoucherModal
        open={shopVoucherOpenFor != null}
        onClose={() => setShopVoucherOpenFor(null)}
        title={t("checkout.shopVoucher.modalTitle")}
        partnerId={shopVoucherOpenFor ?? undefined}
        currentOrderAmount={amountForVoucherApi}
        allowFreeShippingVoucher={allowFreeShippingVoucher}
        initialCode={
          shopVoucherOpenFor
            ? (shopVoucherCodes[shopVoucherOpenFor] ?? null)
            : null
        }
        onConfirm={(code) => {
          const pid = shopVoucherOpenFor;
          if (!pid) return;
          setShopVoucherCodes((prev) => {
            const next = { ...prev };
            if (code) next[pid] = code;
            else delete next[pid];
            return next;
          });
        }}
      />
    </div>
  );
}
