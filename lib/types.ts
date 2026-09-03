export type Categoria = {
  id: string;
  nombre: string;
  /** Familia comercial de alto nivel: "Desechables" o "Limpieza". */
  grupo: string;
  emoji: string;
};

export type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  /** Coincide con Categoria["id"]. */
  categoria: string;
  imagen: string;
  /** null = mayoreo, se cotiza por WhatsApp. */
  precio: number | null;
  presentaciones: string[];
  destacado: boolean;
};
