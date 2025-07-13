import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { ItemRow } from "./item-row";
import { useLongPress } from "@/hooks/use-long-press";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Category, Item, InsertItem } from "@shared/schema";

type CategoryWithItems = Category & { items: Item[] };

interface CategorySectionProps {
  category: CategoryWithItems;
  onUpdate: () => void;
}

export function CategorySection({ category, onUpdate }: CategorySectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateCategoryMutation = useMutation({
    mutationFn: async (updates: Partial<Category>) => {
      const response = await apiRequest("PUT", `/api/categories/${category.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      onUpdate();
    },
    onError: () => {
      toast({ title: "Failed to update category", variant: "destructive" });
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (item: InsertItem) => {
      const response = await apiRequest("POST", "/api/items", item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      onUpdate();
      toast({ title: "Item added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add item", variant: "destructive" });
    },
  });

  const longPressHandlers = useLongPress(() => {
    setIsEditing(true);
  }, 1000);

  const handleToggleExpanded = () => {
    updateCategoryMutation.mutate({ isExpanded: !category.isExpanded });
  };

  const handleSaveName = () => {
    if (editName.trim() && editName !== category.name) {
      updateCategoryMutation.mutate({ name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      setEditName(category.name);
      setIsEditing(false);
    }
  };

  const handleAddItem = () => {
    const name = prompt("Enter item name:");
    if (name?.trim()) {
      createItemMutation.mutate({
        categoryId: category.id,
        name: name.trim(),
        quantity: 1,
        unit: "Nos.",
        referencePrice: "",
        colorState: 0,
        checked: false,
        order: category.items.length || 0,
      });
    }
  };

  return (
    <div className="space-y-2">
      {/* Category Header */}
      <div className="bg-card rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleExpanded}
              className="h-auto p-0 hover:bg-transparent"
            >
              {category.isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
              )}
            </Button>
            
            {isEditing ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyDown}
                className="text-lg font-medium border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            ) : (
              <h2
                className="text-lg font-medium text-foreground cursor-pointer select-none"
                {...longPressHandlers}
              >
                {category.name}
              </h2>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {category.items.length} item{category.items.length !== 1 ? 's' : ''}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddItem}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Category Items */}
      {category.isExpanded && (
        <div className="space-y-1">
          {category.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
