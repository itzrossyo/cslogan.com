import { useState } from 'react'
import { db, storage } from '@/lib/firebase'
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { toast } from 'react-toastify'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Book } from './types'

interface BookFormProps {
    books: Book[];
    setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
}

export default function BookForm({ setBooks }: BookFormProps) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [editingBook, setEditingBook] = useState<Book | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
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
                const coverRef = ref(storage, `covers / ${form.coverFile.name} `)
                const coverSnap = await uploadBytes(coverRef, form.coverFile)
                coverUrl = await getDownloadURL(coverSnap.ref)
            }

            if (form.pdfFile) {
                const pdfRef = ref(storage, `books / ${form.pdfFile.name} `)
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
                setBooks(prev =>
                    prev.map(b =>
                        b.id === editingBook.id
                            ? { ...b, ...bookData } as Book
                            : b
                    )
                );

                toast.success('Book updated successfully!')
            } else {
                const newBook = await addDoc(collection(db, 'books'), {
                    ...bookData,
                    createdAt: serverTimestamp(),
                })
                setBooks(prev => [
                    ...prev,
                    {
                        id: newBook.id,
                        ...bookData,
                        coverUrl: bookData.coverUrl ?? '',
                        pdfUrl: bookData.pdfUrl ?? '',
                    }
                ]);

                toast.success('Book uploaded successfully!')
            }

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

    return (
        <div className="bg-white rounded-2xl shadow-sm p-8">
            <Button onClick={openAddBookDialog} className="mb-6 bg-green-600 hover:bg-green-700">
                Add New Book
            </Button>
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
    )
}