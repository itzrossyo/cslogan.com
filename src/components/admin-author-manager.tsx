"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function AdminAuthorManager() {
    const [authorData, setAuthorData] = useState({
        name: "Jane Smith",
        bio: "Jane Smith is a bestselling author with over 15 years of experience in digital transformation and mindful living. Her unique approach combines practical wisdom with deep insights into human nature.",
        image: "/placeholder.svg?height=500&width=400",
    })

    const handleSave = (e:any) => {
        e.preventDefault()
        // Save to Firebase
        console.log("Saving author data:", authorData)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Author Information</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Author Name</Label>
                        <Input
                            id="name"
                            value={authorData.name}
                            onChange={(e) => setAuthorData((prev) => ({ ...prev, name: e.target.value }))}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="bio">Biography</Label>
                        <Textarea
                            id="bio"
                            value={authorData.bio}
                            onChange={(e) => setAuthorData((prev) => ({ ...prev, bio: e.target.value }))}
                            rows={6}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="image">Author Image URL</Label>
                        <Input
                            id="image"
                            value={authorData.image}
                            onChange={(e) => setAuthorData((prev) => ({ ...prev, image: e.target.value }))}
                            placeholder="https://example.com/author-photo.jpg"
                        />
                    </div>

                    <Button type="submit">Save Changes</Button>
                </form>
            </CardContent>
        </Card>
    )
}
