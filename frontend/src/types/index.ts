export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller' | 'admin';
  address?: string;
  avatar?: string;
  bankDetails?: { bankName: string; accountNumber: string; accountName: string };
  createdAt: string;
}

export interface ItemMedia {
  url: string;
  publicId: string;
}

export type ItemStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'sold';

export interface Item {
  _id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  images: ItemMedia[];
  videos: ItemMedia[];
  location: string;
  expectedPrice?: number;
  finalPrice?: number;
  platformFee?: number;
  totalAmount?: number;
  seller: User | string;
  buyer?: User | string;
  status: ItemStatus;
  adminNotes?: string;
  rejectionReason?: string;
  isPublished: boolean;
  views: number;
  verifiedAt?: string;
  soldAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionStatus = 'pending' | 'paid' | 'delivered' | 'completed' | 'refunded' | 'failed';

export interface Transaction {
  _id: string;
  buyer: User | string;
  seller: User | string;
  item: Item | string;
  itemPrice: number;
  platformFee: number;
  totalAmount: number;
  paymentReference: string;
  paystackReference?: string;
  status: TransactionStatus;
  paymentStatus: 'pending' | 'success' | 'failed';
  deliveryStatus: 'pending' | 'in_transit' | 'delivered' | 'confirmed';
  sellerPaid: boolean;
  paidAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  pages: number;
}

export interface ApiError {
  message: string;
  errors?: { msg: string; path: string }[];
}
