export interface IComment {
    id?: number;
    post: number; // ID del post al que pertenece el comentario
    user: number; // ID del usuario que realizó el comentario
    content: string; // Contenido del comentario
    created_at?: string; // Fecha de creación del comentario (opcional)
    updated_at?: string; // Fecha de actualización del comentario (opcional)
}
