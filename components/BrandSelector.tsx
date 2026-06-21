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
    <div className="flex flex-wrap gap-2">
        {brands.map((brand) => {
          const isSelected = selectedBrand === brand.brand;

          return (
            <button
              key={brand.brand}
              type="button"
              onClick={() => onSelect(brand.brand)}
              className={`inline-flex h-8 items-center border px-4 text-left text-[15px] transition ${
                isSelected
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                  : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--line-strong)]"
              }`}
            >
              <span className="font-medium">{brand.brand}</span>
            </button>
          );
        })}
    </div>
  );
}
