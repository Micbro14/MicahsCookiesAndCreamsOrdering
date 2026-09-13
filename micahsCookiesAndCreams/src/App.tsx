import { useCallback, useMemo, useState } from "react";
import { Header } from "./components/Layout/Header";
import { CategoryNav } from "./components/Layout/CategoryNav";
import { FlavorGrid, type FlavorSectionGroup } from "./components/FlavourGallery/FlavorGrid";
import { CartSidebar } from "./components/Cart/CartSidebar";
import { UpdateModal } from "./components/Modals/UpdateModal";
import { FlavorModal } from "./components/Modals/FlavorModal";
import { CustomizeModal } from "./components/Modals/CustomizeModal";
import { CheckoutModal } from "./components/Modals/CheckoutModal";
import { RecipeModal } from "./components/Modals/RecipeModal";
import { useDataContext } from "./context/DataContext";
import { useCartContext } from "./context/CartContext";
import type { FlavorSpec } from "./types";
import { CalculationUtilities } from "./utils/calculations";

const isHexColor = (value: string): boolean => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());

function App() {
  const {
    loading,
    error,
    workbook,
    premadeWorksheet,
    sizeOptions,
    sizeSpecsDict,
    milkWorksheet,
    thickenerWorksheet,
    flavorWorksheet,
    solidMixInWorksheet,
    sweetenerWorksheet,
    liquidSpecs,
    thickenerSpecs,
    solidSpecs,
    sweetenerSpecs,
  } = useDataContext();
  const { addItem } = useCartContext();
  const [updateOpen, setUpdateOpen] = useState(true);
  const [flavorModalOpen, setFlavorModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [recipeOpen, setRecipeOpen] = useState(false);
  const [selectedFlavor, setSelectedFlavor] = useState<FlavorSpec | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>(sizeOptions[0] ?? "");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedLactoseFree, setSelectedLactoseFree] = useState<boolean>(false);

  const groupedFlavors = useMemo<FlavorSectionGroup[]>(() => {
    const sections: FlavorSectionGroup[] = [];
    let activeSection: FlavorSectionGroup | undefined;
    let featuredSection: FlavorSectionGroup | undefined;

    const createFlavor = (id: string): FlavorSpec => ({
      id,
      name: id,
      description: String((premadeWorksheet[id] as Record<string, unknown>)?.Description ?? "Classic favorite."),
      imageUrl: `./images/${id}.png`,
      basePrice: 0,
      sizeOptions: sizeOptions,
    });

    for (const [id, row] of Object.entries(premadeWorksheet)) {
      if (!id || id === "_NOT FEATURED" || id.startsWith("__")) continue;

      if (id.startsWith("_")) {
        const rawLabel = id.replace(/^_+/, "").trim();
        const label = rawLabel.startsWith("FEATURED:") ? rawLabel.replace(/^FEATURED:/, "").trim() : rawLabel;
        const sectionId = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "featured";
        const color = isHexColor(String((row as Record<string, unknown>)?.Description ?? ""))
          ? String((row as Record<string, unknown>)?.Description)
          : undefined;

        const section: FlavorSectionGroup = {
          id: sectionId,
          label,
          color,
          items: [],
        };

        if (rawLabel.startsWith("FEATURED:")) {
          featuredSection = section;
          sections.unshift(section);
        } else {
          activeSection = section;
          sections.push(section);
        }

        continue;
      }

      const targetSection = activeSection ?? featuredSection ?? sections[0];
      if (targetSection) {
        targetSection.items.push(createFlavor(id));
      } else {
        sections.push({ id: "featured", label: "Featured", items: [createFlavor(id)] });
      }
    }

    if (sections.length === 0) {
      const fallbackFlavors = Object.entries(premadeWorksheet)
        .filter(([id]) => !id.startsWith("_") && !id.startsWith("__"))
        .map(([id]) => createFlavor(id));

      return [{ id: "featured", label: "Featured", items: fallbackFlavors }];
    }

    return sections.filter((section) => section.items.length > 0);
  }, [premadeWorksheet, sizeOptions]);

  const sectionNav = useMemo(
    () => groupedFlavors.map(({ id, label, color }) => ({ id, label, color })),
    [groupedFlavors]
  );

  const flavors: FlavorSpec[] = groupedFlavors.flatMap((section) => section.items);

  const calculateFlavorPrice = useCallback(
    (flavor: FlavorSpec, size: string, lactoseFree = false): number => {
      const flavorRow = premadeWorksheet[flavor.name];
      if (!flavorRow || !size) {
        return 0;
      }

      const specsSheet = workbook?.Sheets["Specs"];
      const upcharge = Number(specsSheet?.N2?.v ?? 1);
      const lactaseDropsPerGram = Number(specsSheet?.AA3?.v ?? 1);
      const lactaseDropsPerGramCost = Number(specsSheet?.Z3?.v ?? 0);
      const calculator = new CalculationUtilities(upcharge);

      const liquidMix1Data = calculator.calculateSegmentPrice(
        flavorWorksheet,
        liquidSpecs,
        sizeSpecsDict,
        String(flavorRow["Liquid Mix 1"] ?? ""),
        String(flavorRow["Liquid Mix 1 Amount (x tbsp)"] ?? ""),
        size,
        0,
        "flavor"
      );
      const liquidMix2Data = calculator.calculateSegmentPrice(
        flavorWorksheet,
        liquidSpecs,
        sizeSpecsDict,
        String(flavorRow["Liquid Mix 2"] ?? ""),
        String(flavorRow["Liquid Mix 2 Amount (x tbsp)"] ?? ""),
        size,
        0,
        "flavor"
      );
      const sweetener1Data = calculator.calculateSegmentPrice(
        sweetenerWorksheet,
        sweetenerSpecs,
        sizeSpecsDict,
        String(flavorRow["Sweetner Type 1"] ?? ""),
        String(flavorRow["Sweetner Type 1 Amount (x 100g)"] ?? ""),
        size,
        0,
        "sweetener"
      );
      const sweetener2Data = calculator.calculateSegmentPrice(
        sweetenerWorksheet,
        sweetenerSpecs,
        sizeSpecsDict,
        String(flavorRow["Sweetner Type 2"] ?? ""),
        String(flavorRow["Sweetner Type 2 Amount (x 100g)"] ?? ""),
        size,
        0,
        "sweetener"
      );
      const solidSimulated = calculator.calculateSolidPrice(
        solidMixInWorksheet,
        solidSpecs,
        sizeSpecsDict,
        String(flavorRow["Solid Mix 1"] ?? ""),
        String(flavorRow["Solid Mix Amount (% of all ice cream)"] ?? ""),
        size,
        String(flavorRow["Solid Mix 2"] ?? "") || undefined
      );

      const totalGramsBeforeMilk =
        (liquidMix1Data.thick ? liquidMix1Data.amount : 0) +
        (liquidMix2Data.thick ? liquidMix2Data.amount : 0) +
        (solidSimulated.gramsPerCup1 === 0 ? 0 : ((solidSimulated.amount1 / solidSimulated.gramsPerCup1) * 240)) +
        (solidSimulated.gramsPerCup2 === 0 ? 0 : ((solidSimulated.amount2 / solidSimulated.gramsPerCup2) * 240));

      const milkType1 = calculator.calculateMilkPrice(
        milkWorksheet,
        sizeSpecsDict,
        String(flavorRow["Milk Type 1 (2/3)"] ?? ""),
        size,
        2 / 3,
        totalGramsBeforeMilk
      );
      const milkType2 = calculator.calculateMilkPrice(
        milkWorksheet,
        sizeSpecsDict,
        String(flavorRow["Milk Type 2 (1/3)"] ?? ""),
        size,
        1 / 3,
        totalGramsBeforeMilk
      );

      const milkType1Price = milkType1.price;
      const milkType2Price = milkType2.price;
      const milkType1Grams = milkType1.grams;
      const milkType2Grams = milkType2.grams;
      const milkType1LactoseDrops = milkType1.lactaseDrops;
      const milkType2LactoseDrops = milkType2.lactaseDrops;

      const totalMilk = milkType1Grams + milkType2Grams;
      const thickenerData = calculator.calculateSegmentPrice(
        thickenerWorksheet,
        thickenerSpecs,
        sizeSpecsDict,
        String(flavorRow.Thickener ?? ""),
        String(flavorRow["Thickener Amount (x tbsp)"] ?? "Auto"),
        size,
        totalMilk,
        "thickener"
      );
      const thickener2Data = calculator.calculateSegmentPrice(
        thickenerWorksheet,
        thickenerSpecs,
        sizeSpecsDict,
        String(flavorRow["Thickener 2"] ?? ""),
        String(flavorRow["Thickener 2 Amount (x tbsp)"] ?? "Auto"),
        size,
        totalMilk,
        "thickener"
      );
      const thickener3Data = calculator.calculateSegmentPrice(
        thickenerWorksheet,
        thickenerSpecs,
        sizeSpecsDict,
        String(flavorRow["Thickener 3"] ?? ""),
        String(flavorRow["Thickener 3 Amount (x tbsp)"] ?? "Auto"),
        size,
        totalMilk,
        "thickener"
      );

      let lactaseDrops = 0;
      if (lactoseFree) {
        lactaseDrops = Math.ceil(
          Number(milkType1LactoseDrops ?? 0) +
            Number(milkType2LactoseDrops ?? 0) +
            Number(thickenerData?.lactaseDrops ?? 0) +
            Number(thickener2Data?.lactaseDrops ?? 0) +
            Number(thickener3Data?.lactaseDrops ?? 0)
        );
      }

      const currentAdditionalCosts =
        (Number(sizeSpecsDict[size]?.additionalCost ?? 0) + Number(sizeSpecsDict[size]?.containerCost ?? 0)) * upcharge;
      const lactaseDropsCost =
        lactaseDrops * (lactaseDropsPerGramCost / Math.max(lactaseDropsPerGram, 1)) * upcharge;

      const pricePerQuantity =
        milkType1Price +
        milkType2Price +
        (thickenerData.price || 0) +
        (thickener2Data.price || 0) +
        (thickener3Data.price || 0) +
        (liquidMix1Data.price || 0) +
        (liquidMix2Data.price || 0) +
        (sweetener1Data.price || 0) +
        (sweetener2Data.price || 0) +
        (solidSimulated.price1 || 0) +
        (solidSimulated.price2 || 0) +
        currentAdditionalCosts +
        lactaseDropsCost;

      return Number(pricePerQuantity.toFixed(2));
    },
    [flavorWorksheet, liquidSpecs, milkWorksheet, premadeWorksheet, sizeSpecsDict, solidMixInWorksheet, solidSpecs, sweetenerSpecs, sweetenerWorksheet, thickenerSpecs, thickenerWorksheet, workbook]
  );

  const handleAddToCart = (flavor: FlavorSpec, size: string, quantity: number, lactoseFree: boolean) => {
    const unitPrice = calculateFlavorPrice(flavor, size, lactoseFree);

    addItem({
      flavorId: flavor.id,
      flavorName: flavor.name,
      sizeId: size,
      sizeName: size,
      quantity,
      unitPrice,
      isLactoseFree: lactoseFree,
      recipeName: flavor.name,
      ingredients: [
        { name: flavor.name, label: size, type: "base" },
        ...(flavor.ingredients ?? []).slice(0, 6),
      ],
    });

    setCartOpen(true);
  };

  if (loading) {
    return <div className="loading-spinner">Loading Micah&apos;s Cookies and Creams...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <>
      <div className="app-shell">
        <Header onCartToggle={() => setCartOpen((value) => !value)} />
        <CategoryNav sections={sectionNav} />

        <main className="content-area storefront-layout">
          <section className="product-panel">
            <h2>Featured Flavors</h2>
            <FlavorGrid
              sections={groupedFlavors}
              sizeOptions={sizeOptions}
              getFlavorPrice={calculateFlavorPrice}
              onCustomize={(flavor, size, quantity, lactoseFree) => {
                setSelectedFlavor(flavor);
                setSelectedSize(size);
                setSelectedQuantity(quantity);
                setSelectedLactoseFree(lactoseFree);
                setCustomizeOpen(true);
              }}
              onAddToCart={handleAddToCart}
            />
          </section>
        </main>
      </div>

      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-panel" onClick={(event) => event.stopPropagation()}>
            <div className="cart-panel-header">
              <h3>Shopping Cart</h3>
              <button type="button" className="close-button" aria-label="Close cart" onClick={() => setCartOpen(false)}>
                ×
              </button>
            </div>
            <CartSidebar
              onCheckout={() => {
                setCartOpen(false);
                setCheckoutOpen(true);
              }}
            />
          </div>
        </div>
      )}

      <UpdateModal isOpen={updateOpen} onClose={() => setUpdateOpen(false)} />
      <FlavorModal isOpen={flavorModalOpen} flavor={flavors[0]} onClose={() => setFlavorModalOpen(false)} />
      <CustomizeModal
        isOpen={customizeOpen}
        flavor={selectedFlavor ?? undefined}
        initialSize={selectedSize}
        initialQuantity={selectedQuantity}
        initialLactoseFree={selectedLactoseFree}
        onClose={() => setCustomizeOpen(false)}
      />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <RecipeModal isOpen={recipeOpen} onClose={() => setRecipeOpen(false)} />
    </>
  );
}

export default App;