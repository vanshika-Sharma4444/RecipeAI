import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sampleRecipes } from '../utils/seedData.js';

// Generate 24-character hex ID compatible with MongoDB ObjectId format
export const generateId = () => crypto.randomBytes(12).toString('hex');

// In-Memory Data Tables
export const memoryStore = {
  users: [],
  recipes: [],
  mealPlans: [],
  shoppingLists: [],
  nutritionLogs: [],
};

// Seed initial recipes into memory
export const initMemoryData = () => {
  if (memoryStore.recipes.length === 0) {
    sampleRecipes.forEach((recipe, idx) => {
      memoryStore.recipes.push({
        _id: (idx + 1).toString().padStart(24, '0'),
        ...recipe,
        createdAt: new Date(Date.now() - (sampleRecipes.length - idx) * 3600000),
        updatedAt: new Date(),
      });
    });
    console.log(`🌱 [In-Memory DB] Auto-seeded ${memoryStore.recipes.length} sample recipes.`);
  }
};

/**
 * Model helper constructor
 */
class MemoryModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  get table() {
    return memoryStore[this.collectionName];
  }

  async countDocuments() {
    return this.table.length;
  }

  async insertMany(docs) {
    const inserted = docs.map((d) => {
      const doc = {
        _id: d._id || generateId(),
        ...d,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this._attachDocMethods(doc);
      this.table.push(doc);
      return doc;
    });
    return inserted;
  }

  find(filter = {}) {
    let results = this.table.filter((item) => {
      for (const [key, val] of Object.entries(filter)) {
        if (key === '$or' && Array.isArray(val)) {
          const matchAny = val.some((cond) => {
            for (const [k, v] of Object.entries(cond)) {
              if (v?.$regex) {
                const targetVal = String(item[k] || '');
                const reg = new RegExp(v.$regex, v.$options || 'i');
                if (reg.test(targetVal)) return true;
              } else if (item[k] === v) {
                return true;
              }
            }
            return false;
          });
          if (!matchAny) return false;
        } else if (val?.$lte !== undefined) {
          if (item[key] > val.$lte) return false;
        } else if (val?.$gte !== undefined) {
          const itemDate = new Date(item[key]).getTime();
          if (itemDate < new Date(val.$gte).getTime()) return false;
          if (val.$lte && itemDate > new Date(val.$lte).getTime()) return false;
        } else if (item[key] !== val && item[key]?.toString() !== val?.toString()) {
          return false;
        }
      }
      return true;
    });

    // Make shallow clone and attach doc methods
    results = results.map((item) => {
      const copy = { ...item };
      this._attachDocMethods(copy);
      return copy;
    });

    const chainable = {
      sort: (sortObj) => {
        if (sortObj?.createdAt === -1 || sortObj?.analysisDate === -1) {
          results.sort((a, b) => new Date(b.createdAt || b.analysisDate) - new Date(a.createdAt || a.analysisDate));
        }
        return chainable;
      },
      populate: (field) => {
        results = results.map((item) => {
          if (field === 'recipe' && item.recipe) {
            const recipeId = item.recipe._id ? item.recipe._id.toString() : item.recipe.toString();
            item.recipe = memoryStore.recipes.find((r) => r._id === recipeId) || item.recipe;
          }
          if (field === 'favourites' && Array.isArray(item.favourites)) {
            item.favourites = item.favourites
              .map((favId) => {
                const id = favId?._id ? favId._id.toString() : favId?.toString();
                return memoryStore.recipes.find((r) => r._id === id);
              })
              .filter(Boolean);
          }
          return item;
        });
        return chainable;
      },
      then: (resolve, reject) => Promise.resolve(results).then(resolve, reject),
      catch: (reject) => Promise.resolve(results).catch(reject),
    };

    return chainable;
  }

  findById(id) {
    const strId = id?.toString();
    const item = this.table.find((doc) => doc._id === strId);
    let copy = item ? { ...item } : null;
    if (copy) {
      this._attachDocMethods(copy);
    }

    const chainable = {
      select: () => chainable,
      populate: (field) => {
        if (copy) {
          if (field === 'recipe' && copy.recipe) {
            const recipeId = copy.recipe._id ? copy.recipe._id.toString() : copy.recipe.toString();
            copy.recipe = memoryStore.recipes.find((r) => r._id === recipeId) || copy.recipe;
          }
          if (field === 'favourites' && Array.isArray(copy.favourites)) {
            copy.favourites = copy.favourites
              .map((favId) => {
                const id = favId?._id ? favId._id.toString() : favId?.toString();
                return memoryStore.recipes.find((r) => r._id === id);
              })
              .filter(Boolean);
          }
        }
        return chainable;
      },
      then: (resolve, reject) => Promise.resolve(copy).then(resolve, reject),
      catch: (reject) => Promise.resolve(copy).catch(reject),
    };

    return chainable;
  }

  findOne(filter = {}) {
    const item = this.table.find((doc) => {
      for (const [key, val] of Object.entries(filter)) {
        if (doc[key] !== val && doc[key]?.toString() !== val?.toString()) {
          return false;
        }
      }
      return true;
    });

    let copy = item ? { ...item } : null;
    if (copy) {
      this._attachDocMethods(copy);
    }

    const chainable = {
      select: () => chainable,
      populate: (field) => {
        if (copy && field === 'favourites' && Array.isArray(copy.favourites)) {
          copy.favourites = copy.favourites
            .map((favId) => {
              const id = favId?._id ? favId._id.toString() : favId?.toString();
              return memoryStore.recipes.find((r) => r._id === id);
            })
            .filter(Boolean);
        }
        return chainable;
      },
      then: (resolve, reject) => Promise.resolve(copy).then(resolve, reject),
      catch: (reject) => Promise.resolve(copy).catch(reject),
    };

    return chainable;
  }

  async create(data) {
    const doc = {
      _id: generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.collectionName === 'users' && doc.password) {
      const salt = await bcrypt.genSalt(10);
      doc.password = await bcrypt.hash(doc.password, salt);
      doc.favourites = doc.favourites || [];
    }

    if (this.collectionName === 'shoppingLists') {
      doc.items = (doc.items || []).map((it) => ({
        _id: generateId(),
        purchased: false,
        ...it,
      }));
    }

    this._attachDocMethods(doc);
    this.table.push(doc);
    return doc;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const index = this.table.findIndex((doc) => doc._id === id?.toString());
    if (index === -1) return null;

    this.table[index] = {
      ...this.table[index],
      ...update,
      updatedAt: new Date(),
    };

    const updated = { ...this.table[index] };
    this._attachDocMethods(updated);
    return updated;
  }

  _attachDocMethods(doc) {
    doc.save = async () => {
      const index = this.table.findIndex((d) => d._id === doc._id);
      if (index !== -1) {
        this.table[index] = { ...doc, updatedAt: new Date() };
      }
      return doc;
    };

    doc.deleteOne = async () => {
      const index = this.table.findIndex((d) => d._id === doc._id);
      if (index !== -1) {
        this.table.splice(index, 1);
      }
      return true;
    };

    if (this.collectionName === 'users') {
      doc.comparePassword = async (enteredPassword) => {
        return await bcrypt.compare(enteredPassword, doc.password);
      };
    }

    if (this.collectionName === 'shoppingLists' && doc.items) {
      doc.items.id = (itemId) => {
        const it = doc.items.find((i) => i._id === itemId?.toString());
        if (it) {
          it.deleteOne = () => {
            doc.items = doc.items.filter((i) => i._id !== itemId?.toString());
          };
        }
        return it;
      };
    }
  }
}

// In-Memory Model instances
export const MemoryUser = new MemoryModel('users');
export const MemoryRecipe = new MemoryModel('recipes');
export const MemoryMealPlan = new MemoryModel('mealPlans');
export const MemoryShoppingList = new MemoryModel('shoppingLists');
export const MemoryNutritionLog = new MemoryModel('nutritionLogs');
