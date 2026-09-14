export type Categoria = {
  id: string;
  nombre: string;
  /** Familia comercial de alto nivel: "Desechables" o "Limpieza". */
  grupo: string;
  emoji: string;
  orden?: number;
};

export type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  /** Coincide con Categoria["id"]. */
  categoria: string;
  /** Portada. Siempre igual a imagenes[0]. */
  imagen: string;
  /** Galería completa; la primera es la portada. */
  imagenes?: string[];
  /** null = mayoreo, se cotiza por WhatsApp. */
  precio: number | null;
  presentaciones: string[];
  destacado: boolean;
  /** false lo esconde del sitio público sin borrarlo del panel. */
  activo?: boolean;
  orden?: number;
};

export type Rol = 'admin' | 'editor';

export type Perfil = {
  id: string;
  nombre: string;
  rol: Rol;
  correo?: string;
  creado_en?: string;
};

/** Lo que necesitan las secciones del sitio público para pintarse. */
export type Catalogo = {
  categorias: Categoria[];
  productos: Producto[];
};
