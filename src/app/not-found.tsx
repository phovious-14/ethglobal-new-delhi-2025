import Link from 'next/link'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-6xl font-bold text-muted-foreground">404</CardTitle>
                    <CardDescription className="text-xl">
                        Page Not Found
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        Sorry, the page you're looking for doesn't exist or is not accessible.
                    </p>
                    <div className="flex justify-center">
                        <Button asChild>
                            <Link href="/">
                                Go Back Home
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 