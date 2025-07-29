import { useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Order } from './types'

interface OrdersListProps {
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    setArchivedOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    isArchived: boolean;
}

export default function OrdersList({ orders, setOrders, setArchivedOrders, isArchived }: OrdersListProps) {
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const q = query(collection(db, 'orders'), where('status', isArchived ? '==' : 'in', isArchived ? 'archived' : ['pending', 'completed', 'success']))
                const snapshot = await getDocs(q)
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    totalPrice: doc.data().totalPrice ?? calculateTotalPrice(doc.data().items)
                } as Order))
                if (isArchived) {
                    setArchivedOrders(data)
                } else {
                    setOrders(data)
                }
            } catch (err) {
                console.error(`Failed to fetch ${isArchived ? 'archived' : 'active'} orders: `, err)
                toast.error(`Failed to load ${isArchived ? 'archived' : 'active'} orders`)
            }
        }
        fetchOrders()
    }, [isArchived, setOrders, setArchivedOrders])

    const calculateTotalPrice = (items: Order['items']): number => {
        return items.reduce((sum, item) => {
            const price = item.price ?? 0
            const quantity = item.quantity ?? 1
            if (typeof price !== 'number' || typeof quantity !== 'number') {
                console.warn(`Invalid price or quantity for item: ${item.title} `)
                return sum
            }
            return sum + price * quantity
        }, 0)
    }

    const handleStatusChange = async (orderId: string, newStatus: 'pending' | 'completed' | 'archived' | 'success') => {
        try {
            const orderRef = doc(db, 'orders', orderId)
            await updateDoc(orderRef, { status: newStatus })
            toast.success(`Order marked as ${newStatus} `)
            const q = query(collection(db, 'orders'), where('status', isArchived ? '==' : 'in', isArchived ? 'archived' : ['pending', 'completed', 'success']))
            const snapshot = await getDocs(q)
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                totalPrice: doc.data().totalPrice ?? calculateTotalPrice(doc.data().items)
            } as Order))
            if (isArchived) {
                setArchivedOrders(data)
            } else {
                setOrders(data)
            }
        } catch (err) {
            console.error('Failed to update order status:', err)
            toast.error('Failed to update order status')
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isArchived ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    )}
                </svg>
                {isArchived ? `Archived Orders(${orders.length})` : `Active Orders(${orders.length})`}
            </h2>
            <Button onClick={() => console.log('Orders:', orders)} className="mb-6">
                Debug Orders
            </Button>
            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isArchived ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            )}
                        </svg>
                    </div>
                    <p className="text-slate-500 font-medium">{isArchived ? 'No archived orders found' : 'No active orders found'}</p>
                    <p className="text-slate-400 text-sm mt-1">{isArchived ? 'Archived orders will appear here' : 'Orders will appear here once placed'}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="border border-gray-300 rounded-md p-4 shadow-sm bg-white">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg">{order.items?.[0]?.title || 'Unknown Book'}</h3>
                                <Select
                                    value={order.status}
                                    onValueChange={(value: 'pending' | 'completed' | 'archived' | 'success') => handleStatusChange(order.id, value)}
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                        <SelectItem value="success">Success</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <p><strong>Buyer:</strong> {order.firstName} {order.lastName} ({order.email})</p>
                            <p><strong>Address:</strong> {order.address}, {order.city}, {order.zipCode}, {order.country}</p>
                            <p><strong>Status:</strong> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
                            <p><strong>Total Price:</strong> £{(order.totalPrice ?? calculateTotalPrice(order.items)).toFixed(2)}</p>
                            <p><strong>Postage Cost:</strong> £{(order.postageCost ?? 5.00).toFixed(2)}</p>
                            <div className="mt-2">
                                <p><strong>Interior PDF:</strong> <a href={order.items?.[0]?.interiorUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a></p>
                                <p><strong>Cover PDF:</strong> <a href={order.items?.[0]?.coverUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a></p>
                            </div>
                            <Button
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        `Interior: ${order.items?.[0]?.interiorUrl || ''} \nCover: ${order.items?.[0]?.coverUrl || ''} `
                                    )
                                    toast.success('PDF URLs copied to clipboard!')
                                }}
                                className="mt-4 bg-blue-500 hover:bg-blue-600"
                            >
                                📋 Copy PDF URLs
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}