'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore, useProductsStore } from '@/lib/store';
import { ChefHat, Plus, X, Trash2, Save } from 'lucide-react';
import type { Recipe, RecipeIngredient } from '@/lib/types';

export default function RecipesPage() {
  const router = useRouter();
  const { isAuthenticated, shop } = useAuthStore();
  const { products } = useProductsStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [yieldQuantity, setYieldQuantity] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const finalProducts = products.filter(p => !p.is_raw_material);
  const rawMaterials = products.filter(p => p.is_raw_material);

  const addIngredient = () => {
    setIngredients([...ingredients, { product_id: '', product_name: '', quantity: 0, unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
    const updated = [...ingredients];
    if (field === 'product_id') {
      const product = rawMaterials.find(p => p.id === value);
      if (product) {
        updated[index] = { ...updated[index], product_id: value, product_name: product.name, unit: product.unit };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setIngredients(updated);
  };

  const saveRecipe = () => {
    if (!selectedProduct || ingredients.length === 0) return;
    
    const newRecipe: Recipe = {
      id: `recipe-${Date.now()}`,
      product_id: selectedProduct,
      ingredients,
      yield_quantity: yieldQuantity,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setRecipes([...recipes, newRecipe]);
    setShowForm(false);
    setSelectedProduct('');
    setIngredients([]);
    setYieldQuantity(1);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Sidebar />

      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        <div className="p-2 sm:p-4 md:p-6 max-w-6xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-900 flex items-center gap-2">
                <ChefHat className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                Recipe Management
              </h1>
              <p className="text-xs sm:text-sm text-orange-700">Create recipes from raw materials</p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-orange-600 hover:bg-orange-700 text-sm w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Button>
          </div>

          {/* Form */}
          {showForm && (
            <Card className="border-2 border-orange-300 bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-orange-50">
                <CardTitle className="text-orange-900">Create New Recipe</CardTitle>
                <button onClick={() => setShowForm(false)} className="text-orange-600 hover:text-orange-800">
                  <X className="h-5 w-5" />
                </button>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Final Product</Label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full h-10 px-3 border border-orange-200 rounded-md focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  >
                    <option value="">Select a product...</option>
                    {finalProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Yield Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={yieldQuantity || ''}
                    onChange={(e) => setYieldQuantity(e.target.value === '' ? 1 : parseInt(e.target.value) || 1)}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value);
                      if (isNaN(val) || val < 1) setYieldQuantity(1);
                    }}
                    placeholder="How many units does this recipe produce?"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Ingredients (Raw Materials)</Label>
                    <Button size="sm" onClick={addIngredient} variant="outline" className="border-orange-300 text-orange-700">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Ingredient
                    </Button>
                  </div>

                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex gap-2 items-end p-3 bg-orange-50 rounded-lg">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Raw Material</Label>
                        <select
                          value={ing.product_id}
                          onChange={(e) => updateIngredient(idx, 'product_id', e.target.value)}
                          className="w-full h-9 px-2 border border-orange-200 rounded text-sm"
                        >
                          <option value="">Select...</option>
                          {rawMaterials.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24 space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={ing.quantity || ''}
                          onChange={(e) => updateIngredient(idx, 'quantity', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            if (isNaN(val) || val < 0) updateIngredient(idx, 'quantity', 0);
                          }}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="w-20 space-y-1">
                        <Label className="text-xs">Unit</Label>
                        <Input value={ing.unit} disabled className="h-9 text-sm bg-gray-100" />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeIngredient(idx)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={saveRecipe} className="bg-orange-600 hover:bg-orange-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Recipe
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recipes List */}
          <div className="grid gap-4">
            {recipes.map(recipe => {
              const product = products.find(p => p.id === recipe.product_id);
              return (
                <Card key={recipe.id} className="border-orange-200 hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-orange-900">{product?.name}</h3>
                        <p className="text-sm text-orange-600">Yields: {recipe.yield_quantity} {product?.unit}</p>
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-slate-700">Ingredients:</p>
                          {recipe.ingredients.map((ing, idx) => (
                            <div key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                              <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                              {ing.product_name}: {ing.quantity} {ing.unit}
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {recipes.length === 0 && !showForm && (
            <Card className="border-orange-200">
              <CardContent className="text-center py-12">
                <ChefHat className="h-16 w-16 text-orange-300 mx-auto mb-4" />
                <p className="text-orange-700 text-lg mb-4">No recipes yet</p>
                <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Recipe
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
