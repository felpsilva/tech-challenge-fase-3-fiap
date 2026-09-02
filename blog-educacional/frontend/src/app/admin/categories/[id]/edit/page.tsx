import { notFound } from 'next/navigation'
import { CategoryFormPage } from '@/features/categories/category-form-page'

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const categoryId = Number(id)

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
        notFound()
    }

    return <CategoryFormPage mode="edit" categoryId={categoryId} />
}
