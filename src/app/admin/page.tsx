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
} from 'firebase/firestore'
import {
    ref,
    uploadBytes,
    getDownloadURL,
} from 'firebase/storage'
import { ToastContainer, toast } from 'react-toastify';

export default function AdminPage() {
    const [user, setUser] = useState<any>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [books, setBooks] = useState<any[]>([])
    const [error, setError] = useState('')
    const [uploading, setUploading] = useState(false)
    const [editingBook, setEditingBook] = useState<any>(null)

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
            setUser(currentUser)
            if (currentUser) {
                try {
                    const userRef = doc(db, 'users', currentUser.uid)
                    const userSnap = await getDoc(userRef)

                    if (userSnap.exists() && userSnap.data().role === 'admin') {
                        setIsAdmin(true)
                        await fetchBooks()
                    }
                } catch (err) {
                    console.error('Failed to check admin status:', err)
                }
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const fetchBooks = async () => {
        const querySnap = await getDocs(collection(db, 'books'))
        const allBooks = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setBooks(allBooks)
    }

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
        window.location.reload() // reload to re-trigger role check
    }

    const handleLogout = async () => {
        await signOut(auth)
        setUser(null)
        setIsAdmin(false)
    }

    const handleChange = (e: any) => {
        const { name, value, type, checked, files } = e.target
        if (type === 'checkbox') {
            setForm(prev => ({ ...prev, [name]: checked }))
        } else if (type === 'file') {
            setForm(prev => ({ ...prev, [name]: files[0] }))
        } else {
            setForm(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setUploading(true)
        setError('')

        try {
            let coverUrl = editingBook?.coverUrl
            let pdfUrl = editingBook?.pdfUrl

            // Upload new cover if provided
            if (form.coverFile) {
                const coverRef = ref(storage, `covers/${form.coverFile.name}`)
                const coverSnap = await uploadBytes(coverRef, form.coverFile)
                coverUrl = await getDownloadURL(coverSnap.ref)
            }

            // Upload new PDF if provided
            if (form.pdfFile) {
                const pdfRef = ref(storage, `books/${form.pdfFile.name}`)
                const pdfSnap = await uploadBytes(pdfRef, form.pdfFile)
                pdfUrl = await getDownloadURL(pdfSnap.ref)
            }

            const bookData = {
                title: form.title,
                author: form.author,
                bio: form.bio,
                description: form.description,
                price: parseFloat(form.price),
                isFree: form.isFree,
                coverUrl,
                pdfUrl,
            }

            if (editingBook) {
                const bookRef = doc(db, 'books', editingBook.id);
                await updateDoc(bookRef, bookData);
                toast.success('Book updated successfully!');
            } else {
                await addDoc(collection(db, 'books'), {
                    ...bookData,
                    createdAt: serverTimestamp(),
                });
                alert('Book uploaded!');
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
        } catch (err) {
            console.error(err)
            setError(editingBook ? 'Update failed' : 'Upload failed')
        }

        setUploading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this book?')) return
        await deleteDoc(doc(db, 'books', id))
        setBooks(prev => prev.filter(b => b.id !== id))
    }

    const handleEdit = (book: any) => {
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
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' })
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
    }

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
                    <button
                        onClick={handleLogin}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        Sign in with Google
                    </button>
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
                    <button
                        onClick={handleLogout}
                        className="text-slate-500 hover:text-slate-700 underline font-medium transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        )
    }

    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div><ToastContainer
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

            /></div>
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
                        <button
                            onClick={handleLogout}
                            className="text-slate-500 hover:text-slate-700 font-medium transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Add Book Form */}
                <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            {editingBook ? 'Edit Book' : 'Add New Book'}
                        </h2>
                        {editingBook && (
                            <button
                                onClick={handleCancelEdit}
                                className="text-slate-500 hover:text-slate-700 font-medium transition-colors"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>

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
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter book title"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Author</label>
                                <input
                                    type="text"
                                    name="author"
                                    value={form.author}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter author name"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Author Bio</label>
                            <textarea
                                name="bio"
                                value={form.bio}
                                onChange={handleChange}
                                placeholder="Tell us about the author..."
                                rows={3}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Describe the book..."
                                rows={4}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Price ($)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div className="flex items-center">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isFree"
                                        checked={form.isFree}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className={`relative w-11 h-6 rounded-full transition-colors ${form.isFree ? 'bg-green-500' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form.isFree ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-slate-700">Make this book free</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Cover Image</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-300 transition-colors">
                                    <input
                                        type="file"
                                        name="coverFile"
                                        accept="image/*"
                                        onChange={handleChange}
                                        required={!editingBook}
                                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:font-medium"
                                    />
                                    {editingBook && (
                                        <p className="text-xs text-slate-400 mt-1">Optional - leave empty to keep current cover</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">PDF File</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-300 transition-colors">
                                    <input
                                        type="file"
                                        name="pdfFile"
                                        accept="application/pdf"
                                        onChange={handleChange}
                                        required={!editingBook}
                                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:font-medium"
                                    />
                                    {editingBook && (
                                        <p className="text-xs text-slate-400 mt-1">Optional - leave empty to keep current PDF</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:shadow-none"
                        >
                            {uploading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Uploading...
                                </div>
                            ) : (
                                editingBook ? 'Update Book' : 'Add Book'
                            )}
                        </button>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-red-800 font-medium">{error}</p>
                            </div>
                        )}
                    </form>
                </div>

                {/* Books List */}
                <div className="bg-white rounded-2xl shadow-sm p-8">
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
                            <p className="text-slate-400 text-sm mt-1">Add your first book using the form above</p>
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
                                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">${book.price}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleEdit(book)}
                                            className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium py-2 px-4 rounded-lg transition-colors"
                                        >
                                            Edit Book
                                        </button>
                                        <button
                                            onClick={() => handleDelete(book.id)}
                                            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors"
                                        >
                                            Delete Book
                                        </button>
                                    </div>
                                </div>
                            ))} {/* ✅ only one closing parenthesis + brace */}

                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}