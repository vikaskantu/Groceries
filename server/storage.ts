import { categories, items, type Category, type Item, type InsertCategory, type InsertItem, type UpdateCategory, type UpdateItem } from "@shared/schema";
import { FileStorage } from "./file-storage";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: UpdateCategory): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Items
  getItems(): Promise<Item[]>;
  getItemsByCategory(categoryId: number): Promise<Item[]>;
  getItemById(id: number): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, item: UpdateItem): Promise<Item | undefined>;
  deleteItem(id: number): Promise<boolean>;

  // Bulk operations
  getCategoriesWithItems(): Promise<(Category & { items: Item[] })[]>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private items: Map<number, Item>;
  private currentCategoryId: number;
  private currentItemId: number;

  constructor() {
    this.categories = new Map();
    this.items = new Map();
    this.currentCategoryId = 1;
    this.currentItemId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Create default categories
    const fruitsVeg = this.createCategorySync({ name: "Fruits & Vegetables", isExpanded: true, order: 0 });
    const dairy = this.createCategorySync({ name: "Dairy & Eggs", isExpanded: true, order: 1 });
    const pantry = this.createCategorySync({ name: "Pantry", isExpanded: false, order: 2 });

    // Create sample items
    this.createItemSync({ categoryId: fruitsVeg.id, name: "Bananas", quantity: 6, unit: "Nos.", referencePrice: "$4.99", colorState: 0, checked: false, order: 0 });
    this.createItemSync({ categoryId: fruitsVeg.id, name: "Apples", quantity: 1, unit: "Kgs.", referencePrice: "$3.50", colorState: 1, checked: false, order: 1 });
    this.createItemSync({ categoryId: fruitsVeg.id, name: "Carrots", quantity: 500, unit: "Gms.", referencePrice: "$2.99", colorState: 2, checked: false, order: 2 });
    this.createItemSync({ categoryId: fruitsVeg.id, name: "Onions", quantity: 2, unit: "Kgs.", referencePrice: "$1.50", colorState: 3, checked: false, order: 3 });
    this.createItemSync({ categoryId: fruitsVeg.id, name: "Tomatoes", quantity: 750, unit: "Gms.", referencePrice: "$3.99", colorState: 0, checked: false, order: 4 });

    this.createItemSync({ categoryId: dairy.id, name: "Milk", quantity: 2, unit: "Nos.", referencePrice: "$5.99", colorState: 1, checked: false, order: 0 });
    this.createItemSync({ categoryId: dairy.id, name: "Eggs", quantity: 12, unit: "Nos.", referencePrice: "$4.50", colorState: 2, checked: false, order: 1 });
    this.createItemSync({ categoryId: dairy.id, name: "Cheese", quantity: 250, unit: "Gms.", referencePrice: "$7.99", colorState: 3, checked: false, order: 2 });
  }

  private createCategorySync(insertCategory: InsertCategory): Category {
    const id = this.currentCategoryId++;
    const category: Category = { 
      ...insertCategory, 
      id,
      order: insertCategory.order ?? 0,
      isExpanded: insertCategory.isExpanded ?? true
    };
    this.categories.set(id, category);
    return category;
  }

  private createItemSync(insertItem: InsertItem): Item {
    const id = this.currentItemId++;
    const item: Item = { 
      ...insertItem, 
      id,
      order: insertItem.order ?? 0,
      categoryId: insertItem.categoryId ?? null,
      quantity: insertItem.quantity ?? 1,
      unit: insertItem.unit ?? "Nos.",
      referencePrice: insertItem.referencePrice ?? "",
      colorState: insertItem.colorState ?? 0,
      checked: insertItem.checked ?? false
    };
    this.items.set(id, item);
    return item;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { 
      ...insertCategory, 
      id,
      order: insertCategory.order ?? 0,
      isExpanded: insertCategory.isExpanded ?? true
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, updateCategory: UpdateCategory): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updateCategory };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    // Delete all items in this category first
    const itemsToDelete = Array.from(this.items.values()).filter(item => item.categoryId === id);
    itemsToDelete.forEach(item => this.items.delete(item.id));

    return this.categories.delete(id);
  }

  async getItems(): Promise<Item[]> {
    return Array.from(this.items.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async getItemsByCategory(categoryId: number): Promise<Item[]> {
    return Array.from(this.items.values())
      .filter(item => item.categoryId === categoryId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async getItemById(id: number): Promise<Item | undefined> {
    return this.items.get(id);
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const id = this.currentItemId++;
    const item: Item = { 
      ...insertItem, 
      id,
      order: insertItem.order ?? 0,
      categoryId: insertItem.categoryId ?? null,
      quantity: insertItem.quantity ?? 1,
      unit: insertItem.unit ?? "Nos.",
      referencePrice: insertItem.referencePrice ?? "",
      colorState: insertItem.colorState ?? 0,
      checked: insertItem.checked ?? false
    };
    this.items.set(id, item);
    return item;
  }

  async updateItem(id: number, updateItem: UpdateItem): Promise<Item | undefined> {
    const existing = this.items.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updateItem };
    this.items.set(id, updated);
    return updated;
  }

  async deleteItem(id: number): Promise<boolean> {
    return this.items.delete(id);
  }

  async getCategoriesWithItems(): Promise<(Category & { items: Item[] })[]> {
    const categoriesArray = await this.getCategories();
    const result = [];

    for (const category of categoriesArray) {
      const items = await this.getItemsByCategory(category.id);
      result.push({ ...category, items });
    }

    return result;
  }
}

// Switch to local file storage for offline functionality
export const storage = new FileStorage();
