import Link from 'next/link';
import Image from 'next/image';
import { Item } from '@/types';
import { formatPrice, STATUS_COLORS } from '@/lib/utils';
import { MapPin, Eye } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  showStatus?: boolean;
}

export default function ItemCard({ item, showStatus = false }: ItemCardProps) {
  const seller = typeof item.seller === 'object' ? item.seller : null;
  const imageUrl = item.images?.[0]?.url;

  return (
    <Link href={`/items/${item._id}`}>
      <div className="card overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
        <div className="relative h-48 bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">📦</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className={`badge ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-700'}`}>
              {item.status.replace('_', ' ')}
            </span>
          </div>
          {!showStatus && (
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
              <Eye className="w-3 h-3" /> {item.views}
            </div>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">{item.category}</p>
          <h3 className="font-semibold text-gray-900 mt-1 line-clamp-1">{item.title}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>

          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <MapPin className="w-3 h-3" />
            <span>{item.location}</span>
          </div>

          {item.finalPrice ? (
            <div className="mt-3 pt-3 border-t">
              <p className="text-lg font-bold text-gray-900">{formatPrice(item.finalPrice)}</p>
              {item.totalAmount && (
                <p className="text-xs text-gray-400">Total with fee: {formatPrice(item.totalAmount)}</p>
              )}
            </div>
          ) : item.expectedPrice ? (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-gray-500">Expected: {formatPrice(item.expectedPrice)}</p>
            </div>
          ) : null}

          {seller && (
            <p className="text-xs text-gray-400 mt-2">Seller: {seller.name}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
