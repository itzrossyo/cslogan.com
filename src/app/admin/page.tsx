'use client'

import { useEffect, useState } from 'react'
import { auth, db, storage } from '@/lib/firebase'
import {
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut,
} from 'firebase/auth'
import {
    doc,
    getDoc,
    collection,
    addDoc,
    deleteDoc,
    getDocs,
    serverTimestamp,
    updateDoc,
    query,
    where
} from 'firebase/firestore'
import {
    ref,
    uploadBytes,
    getDownloadURL,
} from 'firebase/storage'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Book {
    id: string;
    title: string;
    author: string;
    bio?: string;
    description?: string;
    price: number;
    isFree: boolean;
    coverUrl: string;
    pdfUrl: string;
    createdAt?: never;
}

interface Order {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    status: 'pending' | 'completed' | 'archived' | 'success';
    totalPrice?: number;
    postageCost?: number;
    items: Array<{
        title: string;
        interiorUrl: string;
        coverUrl: string;
        price?: number;
        author?: string;
        bio?: string;
        description?: string;
        pdfUrl?: string;
        isFree?: boolean;
        quantity?: number;
    }>;
}

interface FinanceSummary {
    bookTitle: string;
    unitsSold: number;
    revenue: number;
}

export default function AdminPage() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const [user, setUser] = useState<never>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [books, setBooks] = useState<Book[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [archivedOrders, setArchivedOrders] = useState<Order[]>([])
    const [error, setError] = useState('')
    const [uploading, setUploading] = useState(false)
    const [editingBook, setEditingBook] = useState<Book | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [taxRate, setTaxRate] = useState(20) // Default tax rate: 20%

    const [form, setForm] = useState({
        title: '',
        author: '',
        bio: '',
        description: '',
        price: '',
        isFree: false,
        coverFile: null as File | null,
        pdfFile: null as File | null,
    })

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setUser(currentUser)
            if (currentUser) {
                try {
                    const userRef = doc(db, 'users', currentUser.uid)
                    const userSnap = await getDoc(userRef)

                    if (userSnap.exists() && userSnap.data().role === 'admin') {
                        setIsAdmin(true)
                        await fetchBooks()
                        await fetchOrders()
                        await fetchArchivedOrders()
                    }
                } catch (err) {
                    console.error('Failed to check admin status:', err)
                    toast.error('Failed to load admin status')
                }
            }
            setLoading(false)
        })
        return () => unsubscribe()
    },)

    const fetchBooks = async () => {
        try {
            const querySnap = await getDocs(collection(db, 'books'))
            const allBooks = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book))
            setBooks(allBooks)
        } catch (err) {
            console.error('Failed to fetch books:', err)
            toast.error('Failed to load books')
        }
    }

    const fetchOrders = async () => {
        try {
            const q = query(collection(db, 'orders'), where('status', 'in', ['pending', 'completed', 'success']))
            const snapshot = await getDocs(q)
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                totalPrice: doc.data().totalPrice ?? calculateTotalPrice(doc.data().items)
            } as Order))
            setOrders(data)
            console.log('Fetched orders:', data)
        } catch (err) {
            console.error('Failed to fetch orders:', err)
            toast.error('Failed to load orders')
        }
    }

    const fetchArchivedOrders = async () => {
        try {
            const q = query(collection(db, 'orders'), where('status', '==', 'archived'))
            const snapshot = await getDocs(q)
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                totalPrice: doc.data().totalPrice ?? calculateTotalPrice(doc.data().items)
            } as Order))
            setArchivedOrders(data)
            console.log('Fetched archived orders:', data)
        } catch (err) {
            console.error('Failed to fetch archived orders:', err)
            toast.error('Failed to load archived orders')
        }
    }

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

    const handleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider()
            await signInWithPopup(auth, provider)
            window.location.reload()
        } catch (err) {
            console.error('Login failed:', err)
            toast.error('Failed to sign in')
        }
    }

    const handleLogout = async () => {
        try {
            await signOut(auth)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setUser(null)
            setIsAdmin(false)
        } catch (err) {
            console.error('Logout failed:', err)
            toast.error('Failed to sign out')
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked, files } = e.target as HTMLInputElement
        if (type === 'checkbox') {
            setForm(prev => ({ ...prev, [name]: checked }))
        } else if (type === 'file') {
            setForm(prev => ({ ...prev, [name]: files ? files[0] : null }))
        } else {
            setForm(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setUploading(true)
        setError('')

        try {
            let coverUrl = editingBook?.coverUrl
            let pdfUrl = editingBook?.pdfUrl

            if (form.coverFile) {
                const coverRef = ref(storage, `covers/${form.coverFile.name} `)
                const coverSnap = await uploadBytes(coverRef, form.coverFile)
                coverUrl = await getDownloadURL(coverSnap.ref)
            }

            if (form.pdfFile) {
                const pdfRef = ref(storage, `books/${form.pdfFile.name} `)
                const pdfSnap = await uploadBytes(pdfRef, form.pdfFile)
                pdfUrl = await getDownloadURL(pdfSnap.ref)
            }

            const bookData = {
                title: form.title,
                author: form.author,
                bio: form.bio,
                description: form.description,
                price: parseFloat(form.price) || 0,
                isFree: form.isFree,
                coverUrl,
                pdfUrl,
            }

            if (editingBook) {
                const bookRef = doc(db, 'books', editingBook.id)
                await updateDoc(bookRef, bookData)
                toast.success('Book updated successfully!')
            } else {
                await addDoc(collection(db, 'books'), {
                    ...bookData,
                    createdAt: serverTimestamp(),
                })
                toast.success('Book uploaded successfully!')
            }

            await fetchBooks()
            setForm({
                title: '',
                author: '',
                bio: '',
                description: '',
                price: '',
                isFree: false,
                coverFile: null,
                pdfFile: null,
            })
            setEditingBook(null)
            setIsDialogOpen(false)
        } catch (err) {
            console.error('Failed to submit book:', err)
            setError(editingBook ? 'Update failed' : 'Upload failed')
            toast.error(editingBook ? 'Failed to update book' : 'Failed to upload book')
        }

        setUploading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this book?')) return
        try {
            await deleteDoc(doc(db, 'books', id))
            setBooks(prev => prev.filter(b => b.id !== id))
            toast.success('Book deleted successfully!')
        } catch (err) {
            console.error('Failed to delete book:', err)
            toast.error('Failed to delete book')
        }
    }

    const handleEdit = (book: Book) => {
        setEditingBook(book)
        setForm({
            title: book.title,
            author: book.author,
            bio: book.bio || '',
            description: book.description || '',
            price: book.price.toString(),
            isFree: book.isFree,
            coverFile: null,
            pdfFile: null,
        })
        setIsDialogOpen(true)
    }

    const handleCancelEdit = () => {
        setEditingBook(null)
        setForm({
            title: '',
            author: '',
            bio: '',
            description: '',
            price: '',
            isFree: false,
            coverFile: null,
            pdfFile: null,
        })
        setIsDialogOpen(false)
    }

    const openAddBookDialog = () => {
        setEditingBook(null)
        setForm({
            title: '',
            author: '',
            bio: '',
            description: '',
            price: '',
            isFree: false,
            coverFile: null,
            pdfFile: null,
        })
        setIsDialogOpen(true)
    }

    const handleStatusChange = async (orderId: string, newStatus: 'pending' | 'completed' | 'archived' | 'success') => {
        try {
            const orderRef = doc(db, 'orders', orderId)
            await updateDoc(orderRef, { status: newStatus })
            toast.success(`Order marked as ${newStatus} `)
            await fetchOrders()
            await fetchArchivedOrders()
        } catch (err) {
            console.error('Failed to update order status:', err)
            toast.error('Failed to update order status')
        }
    }

    const calculateFinanceSummary = () => {
        const summary: FinanceSummary[] = []
        const allOrders = [...orders, ...archivedOrders]

        books.forEach(book => {
            const bookOrders = allOrders.filter(order => order.items?.[0]?.title === book.title)
            const unitsSold = bookOrders.length
            const revenue = bookOrders.reduce((sum, order) => {
                const price = order.totalPrice ?? calculateTotalPrice(order.items)
                if (typeof price !== 'number') {
                    console.warn(`Invalid totalPrice for order ${order.id}: ${price} `)
                    return sum
                }
                return sum + price
            }, 0)
            summary.push({
                bookTitle: book.title,
                unitsSold,
                revenue
            })
        })

        const totalRevenue = summary.reduce((sum, book) => sum + (book.revenue || 0), 0)
        const totalUnitsSold = summary.reduce((sum, book) => sum + book.unitsSold, 0)
        const totalPostage = allOrders.reduce((sum, order) => {
            const cost = order.postageCost ?? 5.00
            if (typeof cost !== 'number') {
                console.warn(`Invalid postageCost for order ${order.id}: ${cost} `)
                return sum
            }
            return sum + cost
        }, 0)
        const totalTax = totalRevenue * (taxRate / 100)
        const netRevenue = totalRevenue - totalTax

        return { summary, totalRevenue, totalUnitsSold, totalPostage, totalTax, netRevenue }
    }

    const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value)
        if (!isNaN(value) && value >= 0 && value <= 100) {
            setTaxRate(value)
        }
    }

    const { summary, totalRevenue, totalUnitsSold, totalPostage, totalTax, netRevenue } = calculateFinanceSummary()

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Loading...</p>
            </div>
        </div>
    )

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Book Store Admin</h1>
                        <p className="text-slate-600">Please sign in to access the admin dashboard</p>
                    </div>
                    <Button
                        onClick={handleLogin}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                        Sign in with Google
                    </Button>
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
                    <p className="text-slate-600 mb-6">You are not authorized to view this page.</p>
                    <Button
                        onClick={handleLogout}
                        variant="link"
                        className="text-slate-500 hover:text-slate-700"
                    >
                        Logout
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
                        </div>
                        <Button
                            onClick={handleLogout}
                            variant="link"
                            className="text-slate-500 hover:text-slate-700"
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="books" className="w-full ">
                    <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 ">
                        <TabsTrigger value="add-book">Add Book</TabsTrigger>
                        <TabsTrigger value="books">Manage Books</TabsTrigger>
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                        <TabsTrigger value="archived-orders">Archived Orders</TabsTrigger>
                        <TabsTrigger value="finance">Finance</TabsTrigger>
                    </TabsList>

                    {/* Add Book Tab */}
                    <TabsContent value="add-book">
                        <div className="bg-white rounded-2xl shadow-sm p-8 mt-10">
                            <Button onClick={openAddBookDialog} className="mb-6 bg-green-600 hover:bg-green-700">
                                Add New Book
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Manage Books Tab */}
                    <TabsContent value="books">
                        <div className="bg-white rounded-2xl shadow-sm p-8 mt-10">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                Current Books ({books.length})
                            </h2>

                            {books.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-500 font-medium">No books uploaded yet</p>
                                    <p className="text-slate-400 text-sm mt-1">Add your first book using the Add Book tab</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {books.map((book) => (
                                        <div key={book.id} className="bg-slate-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-slate-800 mb-1">{book.title}</h3>
                                                    <p className="text-sm text-slate-600 mb-2">{book.author}</p>
                                                    <div className="flex items-center">
                                                        {book.isFree ? (
                                                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">Free PDF</span>
                                                        ) : (
                                                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">£{book.price.toFixed(2)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    onClick={() => handleEdit(book)}
                                                    variant="outline"
                                                    className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-700"
                                                >
                                                    Edit Book
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(book.id)}
                                                    variant="outline"
                                                    className="w-full bg-red-50 hover:bg-red-100 text-red-600"
                                                >
                                                    Delete Book
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Orders Tab */}
                    <TabsContent value="orders">
                        <div className="bg-white rounded-2xl shadow-sm p-8 mt-10">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Active Orders ({orders.length})
                            </h2>
                            <Button onClick={() => console.log('Orders:', orders, 'Archived:', archivedOrders)} className="mb-6">
                                Debug Orders
                            </Button>
                            {orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-500 font-medium">No active orders found</p>
                                    <p className="text-slate-400 text-sm mt-1">Orders will appear here once placed</p>
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
                    </TabsContent>

                    {/* Archived Orders Tab */}
                    <TabsContent value="archived-orders">
                        <div className="bg-white rounded-2xl shadow-sm p-8 mt-10">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                Archived Orders ({archivedOrders.length})
                            </h2>
                            <Button onClick={() => console.log('Orders:', orders, 'Archived:', archivedOrders)} className="mb-6">
                                Debug Orders
                            </Button>
                            {archivedOrders.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-500 font-medium">No archived orders found</p>
                                    <p className="text-slate-400 text-sm mt-1">Archived orders will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {archivedOrders.map((order) => (
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
                                            <p><strong>Postage Cost:</strong> £
                                                {(order.postageCost ?? 5.00).toFixed(2)}</p>
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
                    </TabsContent>

                    {/* Finance Tab */}
                    <TabsContent value="finance">
                        <div className="bg-white rounded-2xl shadow-sm p-8 mt-10">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Financial Overview
                            </h2>

                            <div className="mb-6">
                                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                                <Input
                                    id="taxRate"
                                    type="number"
                                    value={taxRate}
                                    onChange={handleTaxRateChange}
                                    placeholder="Enter tax rate"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className="w-32"
                                />
                            </div>

                            <div className="bg-blue-50 rounded-xl p-4 mb-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">Summary</h3>
                                <p><strong>Total Units Sold:</strong> {totalUnitsSold}</p>
                                <p><strong>Total Revenue (excl. tax):</strong> £{(totalRevenue || 0).toFixed(2)}</p>
                                <p><strong>Total Tax ({taxRate}%):</strong> £{(totalTax || 0).toFixed(2)}</p>
                                <p><strong>Total Postage Costs:</strong> £{(totalPostage || 0).toFixed(2)}</p>
                                <p><strong>Net Revenue (after tax):</strong> £{(netRevenue || 0).toFixed(2)}</p>
                            </div>

                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Book Sales Breakdown</h3>
                            {summary.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-500 font-medium">No sales data available</p>
                                    <p className="text-slate-400 text-sm mt-1">Sales data will appear once orders are placed</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100">
                                                <th className="p-3 font-semibold text-slate-800">Book Title</th>
                                                <th className="p-3 font-semibold text-slate-800">Units Sold</th>
                                                <th className="p-3 font-semibold text-slate-800">Revenue</th>
                                                <th className="p-3 font-semibold text-slate-800">Tax ({taxRate}%)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {summary.map((book) => (
                                                <tr key={book.bookTitle} className="border-b border-slate-200">
                                                    <td className="p-3">{book.bookTitle}</td>
                                                    <td className="p-3">{book.unitsSold}</td>
                                                    <td className="p-3">£{(book.revenue || 0).toFixed(2)}</td>
                                                    <td className="p-3">£{((book.revenue || 0) * (taxRate / 100)).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Book Form Modal */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
                        </DialogHeader>
                        {editingBook && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                <p className="text-blue-800 font-medium">
                                    Editing: {editingBook.title}
                                </p>
                                <p className="text-blue-600 text-sm mt-1">
                                    Leave cover image and PDF fields empty to keep existing files
                                </p>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter book title"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="author">Author</Label>
                                    <Input
                                        id="author"
                                        type="text"
                                        name="author"
                                        value={form.author}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter author name"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="bio">Author Bio</Label>
                                <Textarea
                                    id="bio"
                                    name="bio"
                                    value={form.bio}
                                    onChange={handleChange}
                                    placeholder="Tell us about the author..."
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Describe the book..."
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="price">Price (£)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        name="price"
                                        value={form.price}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isFree"
                                        name="isFree"
                                        checked={form.isFree}
                                        onCheckedChange={(checked) => setForm(prev => ({ ...prev, isFree: checked }))}
                                    />
                                    <Label htmlFor="isFree">Make this book free</Label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="coverFile">Cover Image</Label>
                                    <Input
                                        id="coverFile"
                                        type="file"
                                        name="coverFile"
                                        accept="image/*"
                                        onChange={handleChange}
                                        required={!editingBook}
                                    />
                                    {editingBook && (
                                        <p className="text-xs text-slate-400 mt-1">Optional - leave empty to keep current cover</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="pdfFile">PDF File</Label>
                                    <Input
                                        id="pdfFile"
                                        type="file"
                                        name="pdfFile"
                                        accept="application/pdf"
                                        onChange={handleChange}
                                        required={!editingBook}
                                    />
                                    {editingBook && (
                                        <p className="text-xs text-slate-400 mt-1">Optional - leave empty to keep current PDF</p>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <p className="text-red-800 font-medium">{error}</p>
                                </div>
                            )}

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={uploading}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-slate-400"
                                >
                                    {uploading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Uploading...
                                        </div>
                                    ) : (
                                        editingBook ? 'Update Book' : 'Add Book'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
