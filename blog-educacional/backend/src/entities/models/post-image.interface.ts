export interface IPostImage {
    post_id: number
    filename: string
    mime_type: string
    size_bytes: number
    data: Buffer
    created_at?: Date
    updated_at?: Date
}

export type IPostImageMetadata = Omit<IPostImage, 'data'>
