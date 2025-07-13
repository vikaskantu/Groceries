import * as fs from 'fs';
import * as path from 'path';
import type { Category, Item, InsertCategory, InsertItem, UpdateCategory, UpdateItem } from '@shared/schema';
import type { IStorage } from './storage';

interface StorageData {
  categories: Category[];
  items: Item[];
  currentCategoryId: number;
  currentItemId: number;
}

export class FileStorage implements IStorage {
  private dataPath: string;
  private data: StorageData;

  constructor(dataPath: string = './data/storage.json') {
    this.dataPath = dataPath;
    this.ensureDirectoryExists();
    this.data = this.loadData();
  }

  private ensureDirectoryExists(): void {
    const dir = path.dirname(this.dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadData(): StorageData {
    try {
      if (fs.existsSync(this.dataPath)) {
        const fileContent = fs.readFileSync(this.dataPath, 'utf8');
        return JSON.parse(fileContent);
      }
    } catch (error) {
      console.warn('Failed to load storage data, using defaults:', error);
    }
    
    // Initialize with default data
    return this.getDefaultData();
  }

  private getDefaultData(): StorageData {
    const fruitsVeg: Category = { id: 1, name: "Fruits & Vegetables", isExpanded: true, order: 0 };
    const dairy: Category = { id: 2, name: "Dairy & Eggs", isExpanded: true, order: 1 };
    const pantry: Category = { id: 3, name: "Pantry", isExpanded: false, order: 2 };

    const items: Item[] = [
      { id: 1, categoryId: 1, name: "Bananas", quantity: 6, unit: "Nos.", referencePrice: "$4.99", colorState: 0, checked: false, order: 0 },
      { id: 2, categoryId: 1, name: "Apples", quantity: 1, unit: "Kgs.", referencePrice: "$3.50", colorState: 1, checked: false, order: 1 },
      { id: 3, categoryId: 1, name: "Carrots", quantity: 500, unit: "Gms.", referencePrice: "$2.99", colorState: 2, checked: false, order: 2 },
      { id: 4, categoryId: 1, name: "Onions", quantity: 2, unit: "Kgs.", referencePrice: "$1.50", colorState: 3, checked: false, order: 3 },
      { id: 5, categoryId: 1, name: "Tomatoes", quantity: 750, unit: "Gms.", referencePrice: "$3.99", colorState: 0, checked: false, order: 4 },
      { id: 6, categoryId: 2, name: "Milk", quantity: 2, unit: "Nos.", referencePrice: "$5.99", colorState: 1, checked: false, order: 0 },
      { id: 7, categoryId: 2, name: "Eggs", quantity: 12, unit: "Nos.", referencePrice: "$4.50", colorState: 2, checked: false, order: 1 },
      { id: 8, categoryId: 2, name: "Cheese", quantity: 250, unit: "Gms.", referencePrice: "$7.99", colorState: 3, checked: false, order: 2 },
    ];

    return {
      categories: [fruitsVeg, dairy, pantry],
      items,
      currentCategoryId: 4,
      currentItemId: 9
    };
  }

  private saveData(): void {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Failed to save storage data:', error);
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.data.categories.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.data.categories.find(cat => cat.id === id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.data.currentCategoryId++;
    const category: Category = {
      ...insertCategory,
      id,
      order: insertCategory.order ?? 0,
      isExpanded: insertCategory.isExpanded ?? true
    };
    this.data.categories.push(category);
    this.saveData();
    return category;
  }

  async updateCategory(id: number, updateCategory: UpdateCategory): Promise<Category | undefined> {
    const index = this.data.categories.findIndex(cat => cat.id === id);
    if (index === -1) return undefined;

    this.data.categories[index] = { ...this.data.categories[index], ...updateCategory };
    this.saveData();
    return this.data.categories[index];
  }

  async deleteCategory(id: number): Promise<boolean> {
    const categoryIndex = this.data.categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) return false;

    // Delete all items in this category
    this.data.items = this.data.items.filter(item => item.categoryId !== id);
    this.data.categories.splice(categoryIndex, 1);
    this.saveData();
    return true;
  }

  // Items
  async getItems(): Promise<Item[]> {
    return this.data.items.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async getItemsByCategory(categoryId: number): Promise<Item[]> {
    return this.data.items
      .filter(item => item.categoryId === categoryId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async getItemById(id: number): Promise<Item | undefined> {
    return this.data.items.find(item => item.id === id);
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const id = this.data.currentItemId++;
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
    this.data.items.push(item);
    this.saveData();
    return item;
  }

  async updateItem(id: number, updateItem: UpdateItem): Promise<Item | undefined> {
    const index = this.data.items.findIndex(item => item.id === id);
    if (index === -1) return undefined;

    this.data.items[index] = { ...this.data.items[index], ...updateItem };
    this.saveData();
    return this.data.items[index];
  }

  async deleteItem(id: number): Promise<boolean> {
    const index = this.data.items.findIndex(item => item.id === id);
    if (index === -1) return false;

    this.data.items.splice(index, 1);
    this.saveData();
    return true;
  }

  async getCategoriesWithItems(): Promise<(Category & { items: Item[] })[]> {
    const categories = await this.getCategories();
    const result = [];

    for (const category of categories) {
      const items = await this.getItemsByCategory(category.id);
      result.push({ ...category, items });
    }

    return result;
  }
}