import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Category } from "@shared/schema";

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: () => void;
  categories: Category[];
}

export function SettingsMenu({ isOpen, onClose, onAddCategory, categories }: SettingsMenuProps) {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      await apiRequest("DELETE", `/api/categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete category", variant: "destructive" });
    },
  });

  const handleRenameCategory = (category: Category) => {
    const newName = prompt("Enter new category name:", category.name);
    if (newName?.trim() && newName !== category.name) {
      const updateMutation = async () => {
        await apiRequest("PUT", `/api/categories/${category.id}`, { name: newName.trim() });
      };
      
      updateMutation()
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
          toast({ title: "Category renamed successfully" });
        })
        .catch(() => {
          toast({ title: "Failed to rename category", variant: "destructive" });
        });
    }
  };

  const handleDeleteCategory = (category: Category) => {
    if (confirm(`Are you sure you want to delete "${category.name}"? This will also delete all items in this category.`)) {
      deleteCategoryMutation.mutate(category.id);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <Card className="absolute right-0 mt-2 w-64 z-50 shadow-lg">
        <CardContent className="p-0">
          <div className="py-2">
            <div className="px-4 py-2 text-sm font-medium text-foreground border-b border-border">
              Categories
            </div>
            
            <Button
              variant="ghost"
              onClick={() => {
                onAddCategory();
                onClose();
              }}
              className="w-full justify-start px-4 py-2 text-sm hover:bg-accent"
            >
              <Plus className="h-4 w-4 mr-2 text-green-600" />
              Add Category
            </Button>
            
            {categories.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                  Manage Categories
                </div>
                
                <div className="max-h-40 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center px-4 py-2 hover:bg-accent">
                      <span className="flex-1 text-sm truncate">{category.name}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRenameCategory(category)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <Separator />
            
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-sm text-foreground">Dark Mode</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  theme === "dark" ? "bg-primary" : "bg-muted"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  theme === "dark" ? "translate-x-6" : "translate-x-1"
                )}>
                  {theme === "dark" ? (
                    <Moon className="h-3 w-3 text-primary ml-0.5 mt-0.5" />
                  ) : (
                    <Sun className="h-3 w-3 text-muted-foreground ml-0.5 mt-0.5" />
                  )}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
