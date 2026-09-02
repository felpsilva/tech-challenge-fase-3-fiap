import { notFound } from 'next/navigation'
import { PostFormPage } from '@/features/posts/post-form-page'

// `params` é Promise no Next 16.
export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const postId = Number(id)

    if (!Number.isInteger(postId) || postId <= 0) {
        notFound()
    }

    return <PostFormPage mode="edit" postId={postId} />
}
