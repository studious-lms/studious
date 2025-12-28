export default function ResponsivePageHeader({ title, description }: { title: string, description: string }) {
    return (
        <div className="flex flex-col justify-between">
            <h1 className="sm:text-2xl text-xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
        </div>
    )
}