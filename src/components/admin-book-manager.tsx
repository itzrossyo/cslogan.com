"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function AdminBookManager() {
    const [books, setBooks] = useState([
        {
            id: "1",
            title: "The Digital Revolution",
            author: "Jane Smith",
            price: 24.99,
            description: "A comprehensive guide to understanding the digital transformation.",
            isFree: false,
            image: "/placeholder.svg?height=300&width=200",
        },
    ])

    const [editingBook, setEditingBook] = useState(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleSaveBook = (bookData) => {
        if (editingBook) {
            setBooks((prev) => prev.map((book) => (book.id === editingBook.id ? { ...bookData, id: editingBook.id } : book)))
        } else {
            setBooks((prev) => [...prev, { ...bookData, id: Date.now().toString() }])
        }
        setEditingBook(null)
        setIsDialogOpen(false)
    }

    const handleDeleteBook = (id) => {
        setBooks((prev) => prev.filter((book) => book.id !== id))
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Manage Books</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingBook(null)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Book
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingBook ? "Edit Book" : "Add New Book"}</DialogTitle>
                        </DialogHeader>
                        <BookForm book={editingBook} onSave={handleSaveBook} onCancel={() => setIsDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {books.map((book) => (
                    <Card key={book.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{book.title}</CardTitle>
                                    <p className="text-muted-foreground">{book.author}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            setEditingBook(book)
                                            setIsDialogOpen(true)
                                        }}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => handleDeleteBook(book.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Price: </span>${book.price}
                                </div>
                                <div>
                                    <span className="font-medium">Free: </span>
                                    {book.isFree ? "Yes" : "No"}
                                </div>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{book.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function BookForm({ book, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        title: book?.title || "",
        author: book?.author || "",
        price: book?.price || 0,
        description: book?.description || "",
        isFree: book?.isFree || false,
        image: book?.image || "",
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    required
                />
            </div>

            <div>
                <Label htmlFor="author">Author</Label>
                <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                    required
                />
            </div>

            <div>
                <Label htmlFor="price">Price</Label>
                <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) }))}
                    required
                />
            </div>

            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                />
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    id="isFree"
                    checked={formData.isFree}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFree: checked }))}
                />
                <Label htmlFor="isFree">Free Book</Label>
            </div>

            <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="https://example.com/book-cover.jpg"
                />
            </div>

            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">{book ? "Update" : "Add"} Book</Button>
            </div>
        </form>
    )
}
