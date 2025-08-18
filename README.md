# 🚀 Mongoose Aggregation Wrapper

[![npm version](https://badge.fury.io/js/mongoose-aggregation-wrapper.svg)](https://badge.fury.io/js/mongoose-aggregation-wrapper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful TypeScript package that provides a debugging wrapper for Mongoose aggregation operations. Execute aggregation pipelines **stage by stage** and see the results after each stage for easier debugging, optimization, and understanding of your MongoDB aggregation queries.

**Created by:** [Vikas Verma](https://github.com/vikasdev8)

---

## 🎯 **Why Use This Package?**

MongoDB aggregation pipelines can be complex and hard to debug. This package helps you:

- ✅ **Debug Complex Pipelines**: See exactly what each stage produces
- ✅ **Optimize Performance**: Identify slow stages with execution timing
- ✅ **Validate Logic**: Ensure each stage works as expected before moving to the next
- ✅ **Learn Aggregation**: Understand how data flows through your pipeline
- ✅ **TypeScript Support**: Full type safety and IntelliSense
- ✅ **Zero Configuration**: Works with your existing Mongoose models

---

## 📦 **Installation**

```bash
npm install mongoose-aggregation-wrapper
```

### Prerequisites

- Node.js >= 14
- Mongoose >= 7.0 (Compatible with Mongoose v7, v8, and future versions)
- TypeScript (if using TypeScript)

---

## 🚀 **Quick Start**

### 1. Basic Import and Usage

```typescript
// ES6/TypeScript
import Wrapper from 'mongoose-aggregation-wrapper';

// CommonJS
const Wrapper = require('mongoose-aggregation-wrapper').default;

// Use with your existing Mongoose model
const results = await Wrapper(YourModel, pipeline);
```

### 2. Simple Example

```typescript
import Wrapper from 'mongoose-aggregation-wrapper';

async function getUsersWithPosts(UserModel) {
  const pipeline = [
    { $match: { active: true } },
    { $sort: { createdAt: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'posts',
        localField: '_id',
        foreignField: 'userId',
        as: 'posts'
      }
    }
  ];

  // This will execute each stage and show debug info
  const results = await Wrapper(UserModel, pipeline);
  return results;
}
```

---

## 📚 **Detailed Usage Guide**

### **Function Signature**

```typescript
Wrapper<T = any>(
  model: mongoose.Model,           // Your Mongoose model
  pipeline: PipelineStage[],       // Array of aggregation stages
  options?: WrapperOptions         // Optional configuration
): Promise<T[]>
```

### **Options Interface**

```typescript
interface WrapperOptions {
  allowDiskUse?: boolean;    // MongoDB allowDiskUse option (default: false)
  debug?: boolean;           // Enable step-by-step execution (default: true)
  logResults?: boolean;      // Log sample results after each stage (default: true)
}
```

### **Option Details**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debug` | `boolean` | `true` | When `true`, executes pipeline stage by stage. When `false`, executes full pipeline at once |
| `logResults` | `boolean` | `true` | When `true`, shows sample documents after each stage |
| `allowDiskUse` | `boolean` | `false` | MongoDB option for handling large datasets that exceed memory limits |

---

## 🔧 **Advanced Examples**

### **Example 1: E-commerce Product Aggregation**

```typescript
import Wrapper from 'mongoose-aggregation-wrapper';

class ProductService {
  async getProductsWithDetails(ProductModel) {
    const pipeline = [
      // Stage 1: Filter active products
      { $match: { status: 'active', deleted: false } },
      
      // Stage 2: Sort by popularity
      { $sort: { popularity: -1, createdAt: -1 } },
      
      // Stage 3: Pagination
      { $skip: 0 },
      { $limit: 20 },
      
      // Stage 4: Lookup category details
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      
      // Stage 5: Unwind category
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      
      // Stage 6: Lookup reviews
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'productId',
          as: 'reviews'
        }
      },
      
      // Stage 7: Calculate average rating
      {
        $addFields: {
          averageRating: { $avg: '$reviews.rating' },
          reviewCount: { $size: '$reviews' }
        }
      },
      
      // Stage 8: Project final fields
      {
        $project: {
          name: 1,
          price: 1,
          category: '$category.name',
          averageRating: 1,
          reviewCount: 1,
          imageUrl: 1
        }
      }
    ];

    // Debug mode - see results after each stage
    return await Wrapper(ProductModel, pipeline, {
      debug: true,
      logResults: true,
      allowDiskUse: true
    });
  }
}
```

### **Example 2: User Analytics Dashboard**

```typescript
async function getUserAnalytics(UserModel) {
  const pipeline = [
    // Stage 1: Match users from last 30 days
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    },
    
    // Stage 2: Group by registration date
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        userCount: { $sum: 1 },
        users: { $push: "$$ROOT" }
      }
    },
    
    // Stage 3: Sort by date
    { $sort: { _id: 1 } },
    
    // Stage 4: Add cumulative count
    {
      $group: {
        _id: null,
        dailyStats: { $push: "$$ROOT" },
        totalUsers: { $sum: "$userCount" }
      }
    }
  ];

  return await Wrapper(UserModel, pipeline, {
    debug: true,
    logResults: false  // Don't log user details for privacy
  });
}
```

### **Example 3: Production Mode (No Debug)**

```typescript
// For production - execute full pipeline without debug info
async function getProductionData(Model) {
  const pipeline = [
    { $match: { status: 'active' } },
    { $sort: { createdAt: -1 } },
    { $limit: 100 }
  ];

  return await Wrapper(Model, pipeline, {
    debug: false,        // No stage-by-stage execution
    allowDiskUse: true
  });
}
```

---

## 📊 **Debug Output Example**

When `debug: true`, you'll see detailed output like this:

```
🚀 Starting Aggregation Pipeline Debug Mode
📊 Total stages: 4
==================================================

🔍 Stage 1/4:
Stage content: { "$match": { "status": "active", "deleted": false } }
⏱️  Execution time: 23ms
📈 Results count: 1,247
📋 Sample result (first document):
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "Premium Laptop",
  "status": "active",
  "deleted": false,
  "price": 1299.99
}
... and 1,246 more documents
----------------------------------------

🔍 Stage 2/4:
Stage content: { "$sort": { "popularity": -1, "createdAt": -1 } }
⏱️  Execution time: 15ms
📈 Results count: 1,247
📋 Sample result (first document):
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "Most Popular Laptop",
  "popularity": 98.5,
  "createdAt": "2025-08-15T10:30:00.000Z"
}
... and 1,246 more documents
----------------------------------------

🔍 Stage 3/4:
Stage content: { "$limit": 20 }
⏱️  Execution time: 2ms
📈 Results count: 20
📋 Sample result (first document):
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "Most Popular Laptop",
  "popularity": 98.5
}
... and 19 more documents
----------------------------------------

🔍 Stage 4/4:
Stage content: { "$lookup": { "from": "categories", ... } }
⏱️  Execution time: 45ms
📈 Results count: 20
📋 Sample result (first document):
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "Most Popular Laptop",
  "category": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Electronics"
    }
  ]
}
... and 19 more documents
----------------------------------------

✅ Pipeline execution completed successfully!
🎯 Final result count: 20
```

---

## 🛠️ **Integration Examples**

### **With Express.js**

```typescript
import express from 'express';
import Wrapper from 'mongoose-aggregation-wrapper';
import { ProductModel } from './models';

const router = express.Router();

router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const skip = (page - 1) * limit;

    const pipeline = [
      ...(category ? [{ $match: { categoryId: category } }] : []),
      { $match: { deleted: false } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      }
    ];

    const products = await Wrapper(ProductModel, pipeline, {
      debug: process.env.NODE_ENV === 'development',
      logResults: false
    });

    res.json({ products, page, limit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### **With NestJS**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Wrapper from 'mongoose-aggregation-wrapper';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product') private productModel: Model<any>
  ) {}

  async findProductsWithAnalytics() {
    const pipeline = [
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'productId',
          as: 'orders'
        }
      },
      {
        $addFields: {
          totalSales: { $sum: '$orders.quantity' },
          revenue: { $sum: '$orders.total' }
        }
      }
    ];

    return await Wrapper(this.productModel, pipeline);
  }
}
```

---

## 🚨 **Common Pitfalls & Solutions**

### **1. Large Result Sets**

```typescript
// ❌ Don't do this - may cause memory issues
const hugePipeline = [
  { $match: {} }, // Matches millions of documents
  // ... more stages
];

// ✅ Do this instead
const optimizedPipeline = [
  { $match: { createdAt: { $gte: recentDate } } }, // Filter first
  { $limit: 1000 }, // Limit early
  // ... other stages
];

await Wrapper(Model, optimizedPipeline, { allowDiskUse: true });
```

### **2. Sensitive Data in Logs**

```typescript
// ❌ Don't log sensitive user data
await Wrapper(UserModel, pipeline, {
  debug: true,
  logResults: true  // This might log passwords, emails, etc.
});

// ✅ Disable result logging for sensitive data
await Wrapper(UserModel, pipeline, {
  debug: true,
  logResults: false  // Still see stage info, but no sample data
});
```

### **3. Production Performance**

```typescript
// ✅ Use environment-based configuration
await Wrapper(Model, pipeline, {
  debug: process.env.NODE_ENV === 'development',
  logResults: process.env.NODE_ENV === 'development',
  allowDiskUse: true
});
```

---

## 🔧 **Development & Building**

### **Setup Development Environment**

```bash
# Clone the repository
git clone https://github.com/vikasdev8/mongoose-aggregation-wrapper.git
cd mongoose-aggregation-wrapper

# Install dependencies
npm install

# Install dev dependencies for local testing
npm install --save-dev @types/node mongoose
```

### **Available Scripts**

```bash
npm run build      # Build TypeScript to dist/
npm run dev        # Run example with ts-node
npm run lint       # Lint code with ESLint
npm run test       # Run tests (when implemented)
npm run clean      # Clean dist/ directory
```

### **Build for Production**

```bash
npm run clean
npm run build
npm publish --access public
```

---

## 📄 **TypeScript Support**

This package is written in TypeScript and provides full type definitions:

```typescript
import Wrapper, { WrapperOptions } from 'mongoose-aggregation-wrapper';

// Full type safety
const options: WrapperOptions = {
  debug: true,
  logResults: false,
  allowDiskUse: true
};

// Generic type support
interface User {
  _id: string;
  name: string;
  email: string;
}

const users: User[] = await Wrapper<User>(UserModel, pipeline, options);
```

---

## 🤝 **Contributing**

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 **Author**

**Vikas Verma**
- GitHub: [@vikasdev8](https://github.com/vikasdev8)
- npm: [mongoose-aggregation-wrapper](https://www.npmjs.com/package/mongoose-aggregation-wrapper)

---

## 🆘 **Support**

If you have any questions or need help, please:

1. Check the [examples](#-advanced-examples) above
2. Open an [issue](https://github.com/vikasdev8/mongoose-aggregation-wrapper/issues) on GitHub
3. Read the [MongoDB Aggregation Documentation](https://docs.mongodb.com/manual/aggregation/)

---

## 🌟 **Show Your Support**

If this package helped you debug your aggregation pipelines, please give it a ⭐ on [GitHub](https://github.com/vikasdev8/mongoose-aggregation-wrapper)!

### ☕ **Buy me a coffee**

If this package saved you time and helped you debug complex aggregation pipelines, consider supporting the project:

[![PayPal](https://img.shields.io/badge/PayPal-Buy%20me%20a%20coffee-blue?style=for-the-badge&logo=paypal)](https://paypal.me/VikasVermaDelhi)

**Other ways to support:**
- ⭐ Star the repository on GitHub
- 🐛 Report bugs and suggest features  
- 📢 Share with your developer friends
- 💻 Contribute code improvements
- 📝 Write about it in your blog

Your support helps maintain and improve this project! 💝

---

**Happy Debugging! 🚀**
