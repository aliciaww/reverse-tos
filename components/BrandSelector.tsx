import Image from "next/image";
import type { BrandTosData } from "@/types";

type BrandSelectorProps = {
  brands: BrandTosData[];
  selectedBrand: string | null;
  onSelect: (brand: string) => void;
};

export function BrandSelector({
  brands,
  selectedBrand,
  onSelect,
}: BrandSelectorProps) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[var(--card)] p-3 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
          Preloaded Sources
        </p>
        <p className="text-xs text-[var(--muted)]">Instant cached analysis</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {brands.map((brand) => {
          const isSelected = selectedBrand === brand.brand;

          return (
            <button
              key={brand.brand}
              type="button"
              onClick={() => onSelect(brand.brand)}
              className={`rounded-[22px] border px-3 py-3 text-left transition ${
                isSelected
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                  : "border-[var(--line)] bg-transparent text-[var(--ink)] hover:border-[var(--line-strong)] hover:bg-[#f8f2e6]"
              }`}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/90">
                {brand.logo ? (
                  <Image
                    src={brand.logo}
                    alt={`${brand.brand} logo`}
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                  />
                ) : (
                  <span className="text-sm font-semibold">{brand.brand.slice(0, 1)}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">{brand.brand}</p>
                <p
                  className={`mt-1 text-xs ${
                    isSelected ? "text-white/72" : "text-[var(--muted)]"
                  }`}
                >
                  Local JSON
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
