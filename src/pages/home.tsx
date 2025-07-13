import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Moon, Sun } from "lucide-react";
import { CategorySection } from "@/components/category-section";
import { SettingsMenu } from "@/components/settings-menu";
import { useTheme } from "@/hooks/use-theme";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Category, Item, InsertCategory, InsertItem } from "@shared/schema";

type CategoryWithItems = Category & { items: Item[] };

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery<CategoryWithItems[]>({
    queryKey: ["/api/categories"],
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (category: InsertCategory) => {
      const response = await apiRequest("POST", "/api/categories", category);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create category", variant: "destructive" });
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (item: InsertItem) => {
      const response = await apiRequest("POST", "/api/items", item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Item added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add item", variant: "destructive" });
    },
  });

  const handleAddCategory = () => {
    const name = prompt("Enter category name:");
    if (name?.trim()) {
      createCategoryMutation.mutate({
        name: name.trim(),
        isExpanded: true,
        order: categories?.length || 0,
      });
    }
  };

  const handleAddItem = () => {
    if (!categories || categories.length === 0) {
      toast({ title: "Please create a category first", variant: "destructive" });
      return;
    }

    const name = prompt("Enter item name:");
    if (name?.trim()) {
      // Add to first category by default
      const firstCategory = categories[0];
      createItemMutation.mutate({
        categoryId: firstCategory.id,
        name: name.trim(),
        quantity: 1,
        unit: "Nos.",
        referencePrice: "",
        colorState: 0,
        checked: false,
        order: firstCategory.items.length || 0,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted rounded-lg p-4 h-20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-[Calibri,Roboto,sans-serif]">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-medium text-foreground">Groceries</h1>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="h-9 w-9"
              >
                <Settings className="h-4 w-4" />
              </Button>
              
              <SettingsMenu
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onAddCategory={handleAddCategory}
                categories={categories || []}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {categories && categories.length > 0 ? (
          <div className="space-y-6">
            {categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                onUpdate={() => queryClient.invalidateQueries({ queryKey: ["/api/categories"] })}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No categories yet. Create your first category to get started!</p>
            <Button onClick={handleAddCategory}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={handleAddItem}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
