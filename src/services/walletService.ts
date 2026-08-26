import { Wallet, WalletTransaction, TransactionType } from '../types';
import { StorageService } from './storage';
import { AuditService } from './auditService';
import { generateTransactionReference, generateUuid } from '../utils/idGenerator';

export interface AddTransactionOptions {
  customRef?: string;
  grossAmount?: number;
  discountAmount?: number;
  discountPercentage?: number;
  allowDue?: boolean;
  coPayCashAmount?: number;
  paymentChannel?: string;
  verificationStatus?: 'verified' | 'pending_verification' | 'failed';
  utrNumber?: string;
  gatewaySignature?: string;
  verifiedBy?: string;
}

export class WalletService {
  public static getAllWallets(): Wallet[] {
    return StorageService.getWallets();
  }

  public static getByPatientId(patientId: string): Wallet | undefined {
    return StorageService.getWallets().find(w => w.patientId === patientId);
  }

  public static getTransactions(patientId?: string): WalletTransaction[] {
    const all = StorageService.getTransactions();
    if (!patientId) return all;
    return all.filter(t => t.patientId === patientId);
  }

  /** Strict Payment Verification Guard before Crediting Cash / Wallet Float */
  public static addTransaction(
    patientId: string,
    type: TransactionType,
    amount: number,
    notes: string,
    optionsOrRef?: string | AddTransactionOptions
  ): { transaction: WalletTransaction; wallet: Wallet; error?: string } {
    if (amount <= 0) {
      return { transaction: null as any, wallet: null as any, error: 'Amount must be greater than zero.' };
    }

    const options: AddTransactionOptions = typeof optionsOrRef === 'string'
      ? { customRef: optionsOrRef }
      : (optionsOrRef || {});

    // STRICT VERIFICATION CHECK FOR CREDITS / WALLET TOP-UPS
    if (type === 'credit') {
      if (options.verificationStatus === 'failed') {
        AuditService.log(
          'SECURITY_ALERT',
          'wallet',
          `REJECTED Top-Up Attempt: Unverified / failed payment of ₹${amount} for Patient ${patientId}. Reason: Bank settlement verification failed.`,
          patientId,
          { amount, options }
        );
        return {
          transaction: null as any,
          wallet: null as any,
          error: 'Payment Verification Failed: Bank settlement could not be confirmed. Wallet balance was NOT credited.'
        };
      }
    }

    const wallets = StorageService.getWallets();
    let wallet = wallets.find(w => w.patientId === patientId);
    const currentUser = StorageService.getCurrentUser();
    const now = new Date().toISOString();

    if (!wallet) {
      wallet = {
        id: `wal_${generateUuid().slice(0, 8)}`,
        patientId,
        balance: 0,
        totalCredits: 0,
        totalDebits: 0,
        totalDue: 0,
        status: 'active',
        createdAt: now,
        updatedAt: now
      };
      wallets.push(wallet);
    }

    if (wallet.status === 'frozen') {
      return { transaction: null as any, wallet, error: 'Patient Health Wallet is currently frozen.' };
    }

    const isPendingVerification = type === 'credit' && options.verificationStatus === 'pending_verification';
    const openingBalance = wallet.balance;
    let closingBalance = openingBalance;
    let paidAmount = amount;
    let dueAmount = 0;
    let paymentStatus: 'paid' | 'partial_due' | 'unpaid_due' = 'paid';

    if (type === 'credit' || type === 'refund') {
      if (!isPendingVerification) {
        closingBalance = openingBalance + amount;
        wallet.totalCredits = (wallet.totalCredits || 0) + amount;
      }
    } else if (type === 'debit') {
      if (openingBalance >= amount) {
        // Sufficient balance
        closingBalance = openingBalance - amount;
        wallet.totalDebits = (wallet.totalDebits || 0) + amount;
        paidAmount = amount;
        dueAmount = 0;
        paymentStatus = 'paid';
      } else {
        // Insufficient balance
        if (options.allowDue) {
          // Smart Due Settlement: Deduct what is available from wallet, remaining is DUE
          const walletDeducted = Math.max(0, openingBalance);
          const coPay = options.coPayCashAmount || 0;
          paidAmount = walletDeducted + coPay;
          dueAmount = Math.max(0, amount - paidAmount);
          closingBalance = 0; // Wallet emptied

          wallet.totalDebits = (wallet.totalDebits || 0) + walletDeducted;
          wallet.totalDue = (wallet.totalDue || 0) + dueAmount;
          paymentStatus = dueAmount === 0 ? 'paid' : (paidAmount > 0 ? 'partial_due' : 'unpaid_due');
        } else {
          return {
            transaction: null as any,
            wallet,
            error: `Insufficient wallet balance. Current: ₹${openingBalance}, Required: ₹${amount}`
          };
        }
      }
    } else if (type === 'adjustment') {
      closingBalance = amount;
      if (closingBalance >= openingBalance) {
        wallet.totalCredits += (closingBalance - openingBalance);
      } else {
        wallet.totalDebits += (openingBalance - closingBalance);
      }
    }

    wallet.balance = closingBalance;
    wallet.updatedAt = now;
    StorageService.saveWallets(wallets);

    const transaction: WalletTransaction = {
      id: `txn_${generateUuid().slice(0, 8)}`,
      walletId: wallet.id,
      patientId,
      type,
      amount,
      openingBalance,
      closingBalance,
      referenceNo: options.customRef || generateTransactionReference(),
      notes: notes.trim(),
      date: now,
      createdBy: options.verifiedBy || currentUser?.fullName || 'System Gateway',
      grossAmount: options.grossAmount || amount,
      discountAmount: options.discountAmount || 0,
      discountPercentage: options.discountPercentage || 0,
      paidAmount,
      dueAmount,
      paymentStatus,
      verificationStatus: options.verificationStatus || 'verified',
      utrNumber: options.utrNumber,
      gatewaySignature: options.gatewaySignature,
      paymentChannel: options.paymentChannel || 'Digital Gateway',
      verifiedAt: now
    };

    const txns = StorageService.getTransactions();
    txns.unshift(transaction);
    StorageService.saveTransactions(txns);

    AuditService.log(
      'WALLET_TRANSACTION',
      'wallet',
      `${type.toUpperCase()} of ₹${amount} for Patient ${patientId}. Verification: ${transaction.verificationStatus?.toUpperCase()} (UTR: ${transaction.utrNumber || 'N/A'})`,
      transaction.id,
      { type, amount, paidAmount, dueAmount, referenceNo: transaction.referenceNo, utr: transaction.utrNumber }
    );

    return { transaction, wallet };
  }

  /** Verify and Approve a Pending Credit Transaction (e.g. from Manual UTR Review) */
  public static verifyAndApprovePendingCredit(
    transactionId: string,
    utrNumber: string,
    approverName: string = 'Super Admin'
  ): { transaction: WalletTransaction; wallet: Wallet; error?: string } {
    const txns = StorageService.getTransactions();
    const txn = txns.find(t => t.id === transactionId);
    if (!txn) return { transaction: null as any, wallet: null as any, error: 'Transaction not found.' };

    if (txn.verificationStatus === 'verified') {
      return { transaction: null as any, wallet: null as any, error: 'Transaction is already verified.' };
    }

    const wallets = StorageService.getWallets();
    const wallet = wallets.find(w => w.id === txn.walletId);
    if (!wallet) return { transaction: null as any, wallet: null as any, error: 'Wallet not found.' };

    const openingBalance = wallet.balance;
    const closingBalance = openingBalance + txn.amount;
    wallet.balance = closingBalance;
    wallet.totalCredits = (wallet.totalCredits || 0) + txn.amount;
    wallet.updatedAt = new Date().toISOString();
    StorageService.saveWallets(wallets);

    txn.verificationStatus = 'verified';
    txn.utrNumber = utrNumber;
    txn.openingBalance = openingBalance;
    txn.closingBalance = closingBalance;
    txn.verifiedAt = new Date().toISOString();
    txn.createdBy = approverName;
    StorageService.saveTransactions(txns);

    AuditService.log(
      'WALLET_TRANSACTION',
      'wallet',
      `Manual Approval: Verified and credited pending Top-up of ₹${txn.amount} for Patient ${txn.patientId} (UTR: ${utrNumber}) by ${approverName}`,
      txn.id,
      { amount: txn.amount, utrNumber }
    );

    return { transaction: txn, wallet };
  }

  public static settlePatientDue(
    patientId: string,
    amountToClear: number,
    paymentMode: string = 'Cash / UPI'
  ): { transaction: WalletTransaction; wallet: Wallet; error?: string } {
    const wallets = StorageService.getWallets();
    const wallet = wallets.find(w => w.patientId === patientId);
    if (!wallet) {
      return { transaction: null as any, wallet: null as any, error: 'Patient wallet not found.' };
    }

    const currentDue = wallet.totalDue || 0;
    if (currentDue <= 0) {
      return { transaction: null as any, wallet, error: 'Patient has no outstanding due balance.' };
    }

    const cleared = Math.min(currentDue, amountToClear);
    wallet.totalDue = currentDue - cleared;
    wallet.updatedAt = new Date().toISOString();
    StorageService.saveWallets(wallets);

    const currentUser = StorageService.getCurrentUser();
    const now = new Date().toISOString();

    const transaction: WalletTransaction = {
      id: `txn_${generateUuid().slice(0, 8)}`,
      walletId: wallet.id,
      patientId,
      type: 'credit',
      amount: cleared,
      openingBalance: wallet.balance,
      closingBalance: wallet.balance, // Due cleared directly
      referenceNo: `DUE-CLR-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: `[DUE-CLEARANCE] Outstanding hospital due cleared via ${paymentMode}. Cleared: ₹${cleared}, Remaining Due: ₹${wallet.totalDue}`,
      date: now,
      createdBy: currentUser?.fullName || 'Cashier',
      grossAmount: cleared,
      paidAmount: cleared,
      dueAmount: 0,
      paymentStatus: 'paid',
      verificationStatus: 'verified',
      paymentChannel: paymentMode,
      verifiedAt: now
    };

    const txns = StorageService.getTransactions();
    txns.unshift(transaction);
    StorageService.saveTransactions(txns);

    AuditService.log(
      'DUE_CLEARANCE',
      'wallet',
      `Due clearance of ₹${cleared} for Patient ${patientId} via ${paymentMode}`,
      transaction.id
    );

    return { transaction, wallet };
  }

  public static updateWalletStatus(walletId: string, status: 'active' | 'frozen'): Wallet | null {
    const wallets = StorageService.getWallets();
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return null;
    wallet.status = status;
    wallet.updatedAt = new Date().toISOString();
    StorageService.saveWallets(wallets);
    AuditService.log('WALLET_STATUS_CHANGED', 'wallet', `Wallet ${wallet.id} status changed to ${status}`);
    return wallet;
  }
}