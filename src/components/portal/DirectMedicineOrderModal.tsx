import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { AddressAutoPopupModal } from '../common/AddressAutoPopupModal';
import { CatalogService, PharmacyMedicineItem } from '../../services/catalogService';
import { PortalService, MedicineOrder, PharmacyOrderItem } from '../../services/portalService';
import { WalletService } from '../../services/walletService';
import { AuditService } from '../../services/auditService';
import { Patient, Membership } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import {
  Pill,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Truck,
  Building2,
  Wallet,
  CheckCircle2,
  Sparkles,
  MapPin,
  FileText,
  AlertCircle,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';

export interface CartItem {
  id: string;
  name: string;
  genericComposition: string;
  brand: string;
  dosage: string;
  quantity: number;
  unitPrice: number;
}

export interface DirectMedicineOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  membership: Membership;
  walletBalance: number;
  onOrderSuccess: (order: MedicineOrder, receiptData?: any) => void;
}

export const DirectMedicineOrderModal: React.FC<DirectMedicineOrderModalProps> = ({
  isOpen,
  onClose,
  patient,
  membership,
  walletBalance,
  onOrderSuccess
}) => {
  const { showToast } = useToast();
  const medicines: PharmacyMedicineItem[] = useMemo(() => CatalogService.getMedicines(), []);

  // Search & Category Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Cart State (Initialized with essential popular medicines)
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 'med_telma_am',
      name: 'Tab. Telma-AM 40/5',
      genericComposition: 'Telmisartan 40mg + Amlodipine 5mg',
      brand: 'Glenmark',
      dosage: '1 Tab Daily',
      quantity: 30,
      unitPrice: 15.6
    },
    {
      id: 'med_pan_d',
      name: 'Cap. Pan-D',
      genericComposition: 'Pantoprazole 40mg + Domperidone 30mg SR',
      brand: 'Alkem',
      dosage: '1 Cap Before Breakfast',
      quantity: 15,
      unitPrice: 13.0
    }
  ]);

  // Custom Medicine Input Form State
  const [showCustomAdd, setShowCustomAdd] = useState(false);
  const [customMedName, setCustomMedName] = useState('');
  const [customComposition, setCustomComposition] = useState('');
  const [customQty, setCustomQty] = useState(10);
  const [customPrice, setCustomPrice] = useState(120);

  // Delivery Logistics
  const [deliveryMode, setDeliveryMode] = useState<'express_home_delivery' | 'counter_pickup'>('express_home_delivery');
  const [deliveryAddress, setDeliveryAddress] = useState(
    patient?.address?.fullAddress || 'Flat 4B, Salt Lake Sector 2, Kolkata 700091'
  );
  const [patientPhone, setPatientPhone] = useState(patient?.mobile || '9830012345');
  const [isAddressPopupOpen, setIsAddressPopupOpen] = useState(false);

  // Payment Option
  const [paymentOption, setPaymentOption] = useState<'paid_wallet' | 'cash_on_delivery'>('paid_wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered medicines
  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const matchCat = selectedCategory === 'all' || m.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchSearch =
        !searchQuery ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genericComposition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [medicines, selectedCategory, searchQuery]);

  // Add medicine from catalog to cart
  const handleAddToCart = (med: PharmacyMedicineItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === med.id);
      if (existing) {
        return prev.map((item) =>
          item.id === med.id ? { ...item, quantity: item.quantity + 10 } : item
        );
      }
      return [
        ...prev,
        {
          id: med.id,
          name: med.name,
          genericComposition: med.genericComposition,
          brand: med.brand,
          dosage: 'As prescribed',
          quantity: 10,
          unitPrice: Math.round((med.mrp / 10) * 10) / 10
        }
      ];
    });
    showToast('info', 'Added to Cart', `${med.name} added to cart.`);
  };

  // Adjust quantity
  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove from cart
  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Add custom unlisted medicine
  const handleAddCustomMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMedName.trim()) return;

    const newItem: CartItem = {
      id: `custom_med_${Date.now()}`,
      name: customMedName.trim(),
      genericComposition: customComposition.trim() || 'Custom Formulation',
      brand: 'Direct Patient Request',
      dosage: 'As prescribed',
      quantity: customQty,
      unitPrice: Math.round((customPrice / customQty) * 10) / 10
    };

    setCart((prev) => [...prev, newItem]);
    setCustomMedName('');
    setCustomComposition('');
    setShowCustomAdd(false);
    showToast('success', 'Custom Medicine Added', `${newItem.name} added to order cart.`);
  };

  // Financial Calculations
  const discountPercent = membership?.pharmacyDiscount || 15;
  const grossTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return (grossTotal * discountPercent) / 100;
  }, [grossTotal, discountPercent]);

  const netTotal = useMemo(() => {
    return grossTotal - discountAmount;
  }, [grossTotal, discountAmount]);

  // Handle final order submission
  const handleConfirmOrder = () => {
    if (cart.length === 0) {
      showToast('error', 'Cart is Empty', 'Please add at least 1 medicine to place an order.');
      return;
    }

    if (paymentOption === 'paid_wallet' && walletBalance < netTotal) {
      showToast(
        'error',
        'Insufficient Wallet Balance',
        `Required: ${formatCurrency(netTotal)}, Available in Health Wallet: ${formatCurrency(walletBalance)}. Please recharge wallet or choose "Cash on Delivery".`
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Prepare Order Items
      const orderItems: PharmacyOrderItem[] = cart.map((c) => ({
        medicineName: c.name,
        genericComposition: c.genericComposition,
        dosage: c.dosage,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        totalPrice: c.quantity * c.unitPrice
      }));

      // 2. Save in PortalService
      const savedOrder = PortalService.savePharmacyOrder({
        patientId: patient.id,
        patientName: patient.fullName,
        patientPhone,
        items: orderItems,
        deliveryMode,
        deliveryAddress: deliveryMode === 'express_home_delivery' ? deliveryAddress : 'Pharmacy Counter Pickup Desk',
        grossTotal,
        discountPercentage: discountPercent,
        discountAmount,
        netTotal,
        paymentStatus: paymentOption,
        status: 'order_placed'
      });

      // 3. If Paid from Health Wallet -> Debit
      if (paymentOption === 'paid_wallet') {
        WalletService.addTransaction(
          patient.id,
          'debit',
          netTotal,
          `Cashless e-Pharmacy Order (${orderItems.length} Medicines) [Order Ref: ${savedOrder.orderNo}]`,
          {
            grossAmount: grossTotal,
            discountAmount,
            discountPercentage: discountPercent
          }
        );
      }

      // 4. Audit Log
      AuditService.log(
        'MEDICINE_ORDERED',
        'patient',
        `Direct e-Pharmacy order placed by ${patient.fullName} (${orderItems.length} items) [Order: ${savedOrder.orderNo}, Net: ${formatCurrency(netTotal)}]`,
        savedOrder.id
      );

      // 5. Generate Receipt Data
      const receiptData = {
        id: `rcp_phm_${savedOrder.id}`,
        receiptNo: `REC-${savedOrder.orderNo}`,
        patientId: patient.id,
        patientName: patient.fullName,
        patientPhone,
        cardNo: patient.healthCardId,
        cardTier: membership?.name || 'Cardholder',
        serviceType: 'Pharmacy',
        serviceDescription: `Direct e-Pharmacy Order (${orderItems.length} Medicines Delivered via ${deliveryMode === 'express_home_delivery' ? 'Express Doorstep Delivery' : 'Counter Pickup'})`,
        items: orderItems.map((i) => ({ name: i.medicineName, qty: i.quantity, price: i.totalPrice })),
        grossAmount: grossTotal,
        discountAmount,
        discountPercentage: discountPercent,
        netAmount: netTotal,
        paymentMethod: paymentOption === 'paid_wallet' ? 'Health Wallet (Prepaid Cashless)' : 'Cash on Delivery',
        walletClosingBalance: paymentOption === 'paid_wallet' ? walletBalance - netTotal : walletBalance,
        date: new Date().toISOString(),
        status: 'Confirmed',
        referenceNo: savedOrder.orderNo
      };

      setIsSubmitting(false);
      triggerCelebrationFireworks();
      showToast('success', 'Medicine Order Confirmed!', `Order ${savedOrder.orderNo} dispatched for packaging.`);
      onOrderSuccess(savedOrder, receiptData);
      onClose();
    }, 900);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="LABMEDIX Direct e-Pharmacy & Medicine Store"
      maxWidth="4xl"
    >
      <div className="space-y-5 text-xs">
        {/* Top Benefit Callout */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 border border-teal-500/40 flex items-center justify-between text-teal-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-300 animate-bounce" />
            <span className="font-bold">100% Genuine Certified Medicines • Doorstep Express Dispatch</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-emerald-950 text-emerald-300 border border-emerald-500">
            {discountPercent}% CARD DISCOUNT APPLIED
          </span>
        </div>

        {/* Search Bar & Category Filter Pills */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search by Medicine Name, Brand, or Generic (e.g. Telma, Pan-D, Glycomet, Calpol, Azithral)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowCustomAdd(!showCustomAdd)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold border border-slate-700 flex items-center gap-1.5 whitespace-nowrap transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{showCustomAdd ? 'Close Custom' : 'Custom Medicine'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
            {['all', 'Cardiac & BP', 'Diabetes Care', 'Gastro & Antacid', 'Antibiotics', 'Pain & Fever', 'Vitamins & Minerals', 'Respiratory & Allergy'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white shadow-sm font-bold'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {cat === 'all' ? 'All Medicines (12)' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Medicine Write-In Box */}
        {showCustomAdd && (
          <form onSubmit={handleAddCustomMedicine} className="p-4 rounded-2xl bg-slate-900 border border-teal-500/50 space-y-3">
            <span className="text-[11px] font-bold text-teal-300 uppercase block tracking-wider">
              Add Any Custom Prescription Medicine to Cart:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Input
                label="Medicine Name & Form"
                placeholder="e.g. Tab. Ecosprin 75"
                value={customMedName}
                onChange={(e) => setCustomMedName(e.target.value)}
                required
              />
              <Input
                label="Generic / Strength"
                placeholder="e.g. Aspirin 75mg"
                value={customComposition}
                onChange={(e) => setCustomComposition(e.target.value)}
              />
              <Input
                label="Total Quantity (Tablets)"
                type="number"
                value={customQty}
                onChange={(e) => setCustomQty(parseInt(e.target.value) || 1)}
                required
              />
              <Input
                label="Estimated MRP (₹)"
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 10)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCustomAdd(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-teal-600 font-bold" leftIcon={<Plus className="w-4 h-4" />}>
                Add to Cart
              </Button>
            </div>
          </form>
        )}

        {/* Grid: Catalog on Left (60%), Cart Summary on Right (40%) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* LEFT: Medicine Catalog */}
          <div className="md:col-span-7 space-y-2 max-h-[300px] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-2">
              {filteredMedicines.map((med) => (
                <div
                  key={med.id}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-white">{med.name}</strong>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-slate-800 text-slate-300">
                        {med.packaging}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono line-clamp-1">
                      {med.genericComposition} • {med.brand}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono pt-0.5">
                      <span className="text-slate-400 line-through">MRP {formatCurrency(med.mrp)}</span>
                      <strong className="text-emerald-400">
                        {formatCurrency(med.mrp - (med.mrp * discountPercent) / 100)}
                      </strong>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    className="bg-teal-600 hover:bg-teal-500 font-bold text-xs shrink-0"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => handleAddToCart(med)}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Order Cart Drawer */}
          <div className="md:col-span-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-teal-400" />
                  Your Order Cart ({cart.length} items)
                </span>
                <span className="text-[10px] font-mono text-emerald-400">{discountPercent}% Card Discount</span>
              </div>

              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-500 space-y-1">
                  <Pill className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs">Your medicine cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 bg-slate-900 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5 max-w-[120px]">
                        <strong className="text-[11px] text-white block truncate">{item.name}</strong>
                        <span className="text-[9.5px] font-mono text-slate-400 block">
                          ₹{item.unitPrice} x {item.quantity} = {formatCurrency(item.quantity * item.unitPrice)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, -5)}
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-xs px-1 text-teal-300">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, 5)}
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="p-1 rounded-lg text-rose-400 hover:bg-rose-950 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs space-y-1">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Gross Total:</span>
                <span>{formatCurrency(grossTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 text-[11px]">
                <span>Cardholder Discount ({discountPercent}%):</span>
                <span>- {formatCurrency(discountAmount)}</span>
              </div>
              <div className="flex justify-between text-white font-bold border-t border-slate-800 pt-1 text-xs">
                <span>Net Total:</span>
                <span className="text-emerald-400 text-sm font-black">{formatCurrency(netTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Mode & Address */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">
            Delivery Logistics & Mode:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDeliveryMode('express_home_delivery')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                deliveryMode === 'express_home_delivery'
                  ? 'bg-teal-600 text-white border-teal-400 font-bold shadow-md'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Truck className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <strong className="block text-xs">🚀 Express Doorstep Home Delivery</strong>
                <span className="text-[10px] opacity-80 block">Dispatched within 2 to 4 hours in temperature-safe box</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryMode('counter_pickup')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                deliveryMode === 'counter_pickup'
                  ? 'bg-teal-600 text-white border-teal-400 font-bold shadow-md'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-5 h-5 text-teal-300 shrink-0" />
              <div>
                <strong className="block text-xs">🏪 Hospital / Pharmacy Counter Pickup</strong>
                <span className="text-[10px] opacity-80 block">Instant priority pickup counter at Central Hospital</span>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300">Delivery Address</span>
                <button
                  type="button"
                  onClick={() => setIsAddressPopupOpen(true)}
                  className="text-[10px] text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 underline"
                >
                  <MapPin className="w-3 h-3" />
                  <span>📍 Auto Popup Address / PIN Lookup</span>
                </button>
              </div>
              <Input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                required
              />
            </div>
            <Input
              label="Contact Phone (Delivery Updates)"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-teal-500/40 space-y-2">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">
            Payment Reconciliation:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentOption('paid_wallet')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                paymentOption === 'paid_wallet'
                  ? 'bg-teal-600 text-white border-teal-400 font-bold shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-300" />
                <div>
                  <strong className="block text-xs">Pay with Health Wallet</strong>
                  <span className="text-[9.5px] opacity-80 block font-mono">Available: {formatCurrency(walletBalance)}</span>
                </div>
              </div>
              {paymentOption === 'paid_wallet' && <CheckCircle2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setPaymentOption('cash_on_delivery')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                paymentOption === 'cash_on_delivery'
                  ? 'bg-teal-600 text-white border-teal-400 font-bold shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-teal-300" />
                <div>
                  <strong className="block text-xs">Cash on Delivery (COD)</strong>
                  <span className="text-[9.5px] opacity-80 block font-mono">Pay via Cash / UPI on delivery</span>
                </div>
              </div>
              {paymentOption === 'cash_on_delivery' && <CheckCircle2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirmOrder}
            isLoading={isSubmitting}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-lg"
            rightIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm Medicine Order ({formatCurrency(netTotal)})
          </Button>
        </div>
      </div>

      <AddressAutoPopupModal
        isOpen={isAddressPopupOpen}
        onClose={() => setIsAddressPopupOpen(false)}
        initialQuery={deliveryAddress}
        onSelectAddress={(addr) => {
          setDeliveryAddress(`${addr.cityArea}, P.O: ${addr.postOffice}, P.S: ${addr.policeStation}, ${addr.district}, ${addr.state} - ${addr.pinCode}`);
          showToast('success', 'Address Selected', `${addr.cityArea}, ${addr.district} (${addr.pinCode}) selected for delivery.`);
        }}
      />
    </Modal>
  );
};
