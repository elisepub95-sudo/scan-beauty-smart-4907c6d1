export interface OpenFoodFactsProduct {
  code: string;
  product: {
    product_name?: string;
    brands?: string;
    categories?: string;
    ingredients_text?: string;
    ingredients?: Array<{
      id: string;
      text: string;
      percent_estimate?: number;
    }>;
    image_url?: string;
  };
  status: number;
  status_verbose: string;
}

export const searchProductByBarcode = async (barcode: string): Promise<OpenFoodFactsProduct | null> => {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data: OpenFoodFactsProduct = await response.json();
    
    if (data.status === 0) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching product from OpenFoodFacts:", error);
    return null;
  }
};

export const parseIngredients = (ingredientsText: string): string[] => {
  if (!ingredientsText) return [];
  
  // Split by comma and clean up
  return ingredientsText
    .split(',')
    .map(ingredient => 
      ingredient
        .trim()
        .replace(/\(.*?\)/g, '') // Remove parentheses content
        .replace(/\[.*?\]/g, '') // Remove brackets content
        .replace(/\d+\.?\d*%/g, '') // Remove percentages
        .trim()
    )
    .filter(ingredient => ingredient.length > 0);
};
