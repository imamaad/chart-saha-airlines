/**
 * مدیریت داده‌های سازمانی
 * @module DataManager
 */

/**
 * کلاس مدیریت داده‌ها
 * @class DataManager
 */
export class DataManager {
  constructor() {
    this.data = null;
  }

  async loadData() {
    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/data.json`);
      if (!response.ok) {
        throw new Error('خطا در بارگذاری داده‌ها');
      }
      
      const jsonData = await response.json();
      
      // استفاده از ساختار جدید
      this.data = jsonData.organization;
      
      // اضافه کردن ID به گره‌هایی که ندارند
      this.assignIdsRecursively(this.data);
      
      // محاسبه داینامیک counts بر اساس children
      this.calculateCountsRecursively(this.data);
      
      return this.data;
    } catch (error) {
      console.error('خطا در بارگذاری داده‌ها:', error);
      throw new Error('خطا در بارگذاری داده‌ها: ' + error.message);
    }
  }

  assignIdsRecursively(node, parentId = null) {
    if (!node.id) {
      node.id = this.generateId(node.label);
    }
    
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        this.assignIdsRecursively(child, node.id);
      });
    }
  }

  generateId(label) {
    if (label) {
      return label.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_').toLowerCase();
    }
    return 'node_' + Math.random().toString(36).substr(2, 9);
  }

  findPathToNode(root, targetId) {
    if (!root || !targetId) return [];
    
    const path = [];
    
    const findPath = (node, targetId, currentPath) => {
      if (node.id === targetId) {
        path.push(...currentPath, node);
        return true;
      }
      
      if (node.children) {
        for (const child of node.children) {
          if (findPath(child, targetId, [...currentPath, node])) {
            return true;
          }
        }
      }
      
      return false;
    };
    
    findPath(root, targetId, []);
    return path;
  }

  rebuildPathToNode(targetId) {
    if (!this.data) return null;
    
    const findNode = (node, targetId) => {
      if (node.id === targetId) {
        return node;
      }
      
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, targetId);
          if (found) return found;
        }
      }
      
      return null;
    };
    
    return findNode(this.data, targetId);
  }

  loadChildrenIfNeeded(node) {
    // در ساختار جدید، تمام فرزندان از ابتدا بارگذاری می‌شوند
    // این تابع برای سازگاری نگه داشته شده
    return node;
  }

  validateData(data) {
    if (!data) {
      throw new Error('داده‌ای برای اعتبارسنجی وجود ندارد');
    }
    
    if (!data.label) {
      throw new Error('برچسب گره الزامی است');
    }
    
    if (data.children && !Array.isArray(data.children)) {
      throw new Error('فرزندان باید آرایه باشند');
    }
    
    if (data.children) {
      data.children.forEach(child => this.validateData(child));
    }
    
    return true;
  }

  getNodeById(id) {
    if (!this.data) return null;
    
    const findNode = (node, targetId) => {
      if (node.id === targetId) {
        return node;
      }
      
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, targetId);
          if (found) return found;
        }
      }
      
      return null;
    };
    
    return findNode(this.data, id);
  }

  // متد جدید برای جستجو در داده‌های ارسالی
  getNodeByIdFromData(data, id) {
    if (!data) return null;
    
    const findNode = (node, targetId) => {
      if (node.id === targetId) {
        return node;
      }
      
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, targetId);
          if (found) return found;
        }
      }
      
      return null;
    };
    
    return findNode(data, id);
  }

  getNodeByLabel(label) {
    if (!this.data) return null;
    
    const findNode = (node, targetLabel) => {
      if (node.label === targetLabel) {
        return node;
      }
      
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, targetLabel);
          if (found) return found;
        }
      }
      
      return null;
    };
    
    return findNode(this.data, label);
  }

  getAllNodes() {
    const nodes = [];
    
    const traverse = (node) => {
      nodes.push(node);
      if (node.children) {
        node.children.forEach(child => traverse(child));
      }
    };
    
    if (this.data) {
      traverse(this.data);
    }
    
    return nodes;
  }

  getNodesByLevel(level) {
    const nodes = [];
    
    const traverse = (node, currentLevel) => {
      if (currentLevel === level) {
        nodes.push(node);
      }
      
      if (node.children) {
        node.children.forEach(child => traverse(child, currentLevel + 1));
      }
    };
    
    if (this.data) {
      traverse(this.data, 0);
    }
    
    return nodes;
  }

  getStatistics() {
    if (!this.data) return null;
    
    const stats = {
      totalNodes: 0,
      totalOfficial: 0,
      totalContract: 0,
      totalRetired: 0,
      totalPartTime: 0,
      levels: {}
    };
    
    const traverse = (node, level) => {
      stats.totalNodes++;
      
      if (!stats.levels[level]) {
        stats.levels[level] = {
          count: 0,
          official: 0,
          contract: 0,
          retired: 0,
          partTime: 0
        };
      }
      
      stats.levels[level].count++;
      
      if (node.counts) {
        const counts = node.counts;
        stats.totalOfficial += counts.official || 0;
        stats.totalContract += counts.contract || 0;
        stats.totalRetired += counts.retired || 0;
        stats.totalPartTime += counts.partTime || 0;
        
        stats.levels[level].official += counts.official || 0;
        stats.levels[level].contract += counts.contract || 0;
        stats.levels[level].retired += counts.retired || 0;
        stats.levels[level].partTime += counts.partTime || 0;
      }
      
      if (node.children) {
        node.children.forEach(child => traverse(child, level + 1));
      }
    };
    
    traverse(this.data, 0);
    
    return stats;
  }

  /**
   * محاسبه داینامیک counts برای تمام گره‌ها بر اساس تعداد children
   * @param {Object} node - گره فعلی
   * @returns {Object} counts محاسبه شده
   */
  calculateCountsRecursively(node) {
    if (!node) return { official: 0, contract: 0, retired: 0, partTime: 0 };

    // اگر گره children ندارد، counts صفر برگردان
    if (!node.children || node.children.length === 0) {
      return { official: 0, contract: 0, retired: 0, partTime: 0 };
    }

    // محاسبه counts بر اساس تعداد children
    let totalCounts = { official: 0, contract: 0, retired: 0, partTime: 0 };
    
    // هر child به عنوان یک کارمند در نظر گرفته می‌شود
    node.children.forEach(child => {
      // اگر child دارای employmentType باشد، بر اساس آن محاسبه می‌شود
      if (child.employmentType) {
        if (child.employmentType.includes('نظامی') || child.employmentType.includes('رسمی')) {
          totalCounts.official += 1;
        } else if (child.employmentType.includes('قراردادی')) {
          totalCounts.contract += 1;
        } else if (child.employmentType.includes('بازنشسته')) {
          totalCounts.retired += 1;
        } else if (child.employmentType.includes('پاره‌وقت')) {
          totalCounts.partTime += 1;
        } else {
          // اگر نوع مشخص نشده، به عنوان رسمی در نظر گرفته می‌شود
          totalCounts.official += 1;
        }
      } else {
        // اگر employmentType ندارد، به عنوان رسمی در نظر گرفته می‌شود
        totalCounts.official += 1;
      }

      // محاسبه counts برای children های این child
      const childCounts = this.calculateCountsRecursively(child);
      totalCounts.official += childCounts.official || 0;
      totalCounts.contract += childCounts.contract || 0;
      totalCounts.retired += childCounts.retired || 0;
      totalCounts.partTime += childCounts.partTime || 0;
    });

    // به‌روزرسانی counts گره
    node.counts = totalCounts;
    
    return totalCounts;
  }
}
