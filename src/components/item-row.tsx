import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus } from "lucide-react";
import { useLongPress } from "@/hooks/use-long-press";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Item, UpdateItem } from "@shared/schema";

interface ItemRowProps {
  item: Item;
  onUpdate: () => void;
}

const COLOR_CLASSES = [
  "bg-row-white dark:bg-row-white",
  "bg-row-teal dark:bg-row-teal", 
  "bg-row-blue dark:bg-row-blue",
  "bg-row-orange dark:bg-row-orange",
];

const COLOR_DOT_CLASSES = [
  "bg-row-white",
  "bg-row-teal",
  "bg-row-blue", 
  "bg-row-orange",
];

const UNITS = ["Nos.", "Gms.", "Kgs."];

export function ItemRow({ item, onUpdate }: ItemRowProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editPrice, setEditPrice] = useState(item.referencePrice || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateItemMutation = useMutation({
    mutationFn: async (updates: UpdateItem) => {
      const response = await apiRequest("PUT", `/api/items/${item.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      onUpdate();
    },
    onError: () => {
      toast({ title: "Failed to update item", variant: "destructive" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/items/${item.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      onUpdate();
      toast({ title: "Item deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete item", variant: "destructive" });
    },
  });

  const quantityLongPressHandlers = useLongPress(() => {
    const currentUnitIndex = UNITS.indexOf(item.unit || "Nos.");
    const nextUnitIndex = (currentUnitIndex + 1) % UNITS.length;
    const nextUnit = UNITS[nextUnitIndex];
    
    // Adjust quantity based on unit change
    let newQuantity = item.quantity || 1;
    if (nextUnit === "Gms." && item.unit === "Nos.") {
      newQuantity = Math.max(250, newQuantity * 250);
    } else if (nextUnit === "Nos." && item.unit === "Gms.") {
      newQuantity = Math.max(1, Math.round(newQuantity / 250));
    } else if (nextUnit === "Kgs." && item.unit === "Gms.") {
      newQuantity = Math.max(1, Math.round(newQuantity / 1000));
    } else if (nextUnit === "Gms." && item.unit === "Kgs.") {
      newQuantity = newQuantity * 1000;
    }
    
    updateItemMutation.mutate({ unit: nextUnit, quantity: newQuantity });
  }, 1000);

  const handleColorToggle = () => {
    const nextColorState = (item.colorState + 1) % COLOR_CLASSES.length;
    updateItemMutation.mutate({ colorState: nextColorState });
  };

  const handleCheckToggle = () => {
    updateItemMutation.mutate({ checked: !item.checked });
  };

  const handleQuantityChange = (delta: number) => {
    const unit = item.unit || "Nos.";
    let increment = 1;
    
    if (unit === "Gms.") increment = 250;
    else if (unit === "Kgs.") increment = 1;
    
    const newQuantity = Math.max(increment, (item.quantity || 1) + (delta * increment));
    updateItemMutation.mutate({ quantity: newQuantity });
  };

  const handleQuantityInputChange = (value: string) => {
    const newQuantity = parseInt(value) || 1;
    updateItemMutation.mutate({ quantity: newQuantity });
  };

  const handleSaveName = () => {
    if (editName.trim() && editName !== item.name) {
      updateItemMutation.mutate({ name: editName.trim() });
    }
    setIsEditingName(false);
  };

  const handleSavePrice = () => {
    if (editPrice !== item.referencePrice) {
      updateItemMutation.mutate({ referencePrice: editPrice });
    }
    setIsEditingPrice(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      setEditName(item.name);
      setIsEditingName(false);
    }
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSavePrice();
    } else if (e.key === "Escape") {
      setEditPrice(item.referencePrice || "");
      setIsEditingPrice(false);
    }
  };

  const colorClass = COLOR_CLASSES[item.colorState] || COLOR_CLASSES[0];
  const colorDotClass = COLOR_DOT_CLASSES[item.colorState] || COLOR_DOT_CLASSES[0];

  return (
    <div className={cn(
      "flex items-center p-3 rounded-lg border border-border transition-all",
      colorClass,
      // IMPORTANT: Currently shows opposite behavior
      // TODO: User needs to reverse this logic - unchecked items should be greyed out, not checked items
      item.checked && "opacity-60"
    )}>
      {/* Color Dot */}
      <button
        onClick={handleColorToggle}
        className={cn(
          "w-6 h-6 rounded-full border-2 border-border mr-3 transition-colors",
          colorDotClass
        )}
      />
      
      {/* Checkbox */}
      <div className="mr-3">
        <Checkbox
          checked={item.checked}
          onCheckedChange={handleCheckToggle}
        />
      </div>
      
      {/* Item Name */}
      <div className="flex-1 min-w-0">
        {isEditingName ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleNameKeyDown}
            className="bg-transparent border-none font-medium focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            autoFocus
          />
        ) : (
          <span
            onClick={() => setIsEditingName(true)}
            className={cn(
              "font-medium cursor-pointer select-none text-foreground",
              // IMPORTANT: Currently shows opposite behavior  
              // TODO: User needs to reverse this logic - unchecked items should have strikethrough, not checked items
              item.checked && "line-through"
            )}
          >
            {item.name}
          </span>
        )}
      </div>
      
      {/* Quantity Controls */}
      <div className="flex items-center space-x-2 mx-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(-1)}
          className="h-8 w-8 p-0 rounded-full"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Input
          type="number"
          value={item.quantity || 1}
          onChange={(e) => handleQuantityInputChange(e.target.value)}
          className={cn(
            "w-16 text-center border-border focus-visible:ring-0 focus-visible:ring-offset-0",
            // IMPORTANT: Currently shows opposite behavior
            // TODO: User needs to reverse this logic - unchecked items should have strikethrough, not checked items
            item.checked && "line-through"
          )}
          {...quantityLongPressHandlers}
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(1)}
          className="h-8 w-8 p-0 rounded-full"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <span className={cn(
          "text-sm text-muted-foreground ml-1",
          // IMPORTANT: Currently shows opposite behavior
          // TODO: User needs to reverse this logic - unchecked items should have strikethrough, not checked items
          item.checked && "line-through"
        )}>
          {item.unit || "Nos."}
        </span>
      </div>
      
      {/* Reference Price */}
      <div className="text-right min-w-0">
        {isEditingPrice ? (
          <Input
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            onBlur={handleSavePrice}
            onKeyDown={handlePriceKeyDown}
            className="w-20 text-right bg-transparent border-none text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            autoFocus
          />
        ) : (
          <span
            onClick={() => setIsEditingPrice(true)}
            className={cn(
              "cursor-pointer select-none text-muted-foreground",
              // IMPORTANT: Currently shows opposite behavior
              // TODO: User needs to reverse this logic - unchecked items should have strikethrough, not checked items
              item.checked && "line-through"
            )}
          >
            {item.referencePrice || ""}
          </span>
        )}
      </div>
    </div>
  );
}
