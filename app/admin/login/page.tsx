import Image from 'next/image';
import type { Metadata } from 'next';
import { FormularioEntrada } from '@/components/admin/FormularioEntrada';

export const metadata: Metadata = {
  title: 'Entrar al panel',
  robots: { index: false, follow: false },
};

export default function Entrar({ searchParams }: { searchParams: { volver?: string } }) {
  return (
    <main className="grid min-h-[100svh] place-items-center bg-[#180610] px-5 py-16">
      <div aria-hidden="true" className="fixed inset-0 bg-brand-mesh" />
      <div aria-hidden="true" className="franja-marca fixed inset-0 opacity-60" />

      <div className="relative w-full max-w-sm">
        <div className="mx-auto w-fit rounded-3xl bg-white px-7 py-5 shadow-2xl">
          <Image
            src="/logo-dg.png"
            alt="Distribuidora Gutiérrez"
            width={728}
            height={464}
            priority
            className="h-16 w-auto"
          />
        </div>

        <h1 className="mt-8 text-center font-display text-2xl font-extrabold text-white">
          Panel de administración
        </h1>
        <p className="mt-2 text-center text-sm text-white/70">
          Entra para administrar el catálogo
        </p>

        <FormularioEntrada volver={searchParams.volver ?? '/admin'} />
      </div>
    </main>
  );
}
