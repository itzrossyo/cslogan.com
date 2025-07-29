import { useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Book, Order, FinanceSummary as FinanceSummaryType } from './types';

interface FinanceSummaryProps {
    books: Book[];
    orders: Order[];
    archivedOrders: Order[];
    taxRate: number;
    setTaxRate: React.Dispatch<React.SetStateAction<number>>;
}

export default function FinanceSummary({ books, orders, archivedOrders, taxRate, setTaxRate }: FinanceSummaryProps) {
    const calculateFinanceSummary = useMemo(() => {
        const summary: FinanceSummaryType[] = []
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
    }, [books, orders, archivedOrders, taxRate])

    const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value)
        if (!isNaN(value) && value >= 0 && value <= 100) {
            setTaxRate(value)
        }
    }

    const { summary, totalRevenue, totalUnitsSold, totalPostage, totalTax, netRevenue } = calculateFinanceSummary

    return (
        <div className="bg-white rounded-2xl shadow-sm p-8">
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
    )
}

function calculateTotalPrice(items: Order['items']): number {
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