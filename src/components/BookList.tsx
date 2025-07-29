import { db } from '@/lib/firebase'
import { doc, deleteDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Book } from './types'

interface BooksListProps {
    books: Book[];
    setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
    handleEdit?: (book: Book) => void;
}

export default function BooksList({ books, setBooks, handleEdit }: BooksListProps) {
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

    return (
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
                                    onClick={() => handleEdit && handleEdit(book)}
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
    )
}