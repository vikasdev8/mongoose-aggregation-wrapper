// Example usage file showing how to use the Wrapper function
// Note: This assumes you already have a connected Mongoose model
import Wrapper from './index';

// Example function showing how to use the Wrapper
// You would call this function with your own connected model
export async function exampleUsage(materialModel: any) {
  // Example aggregation pipeline (same as your example)
  const pipeline = [
    // Sort stage
    { $sort: { createdAt: -1 } },
    
    // Pagination (example)
    { $skip: 0 },
    { $limit: 10 },

    // Lookup createdBy
    {
      $lookup: {
        from: 'users', // Use actual collection name
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy'
      }
    },

    { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },

    // Lookup products
    {
      $lookup: {
        from: 'products', // Use actual collection name
        localField: 'products.productId',
        foreignField: '_id',
        as: 'productDetails'
      }
    },

    // Add product details to each product in products array
    {
      $addFields: {
        products: {
          $map: {
            input: { $ifNull: ['$products', []] },
            as: 'product',
            in: {
              $mergeObjects: [
                '$$product',
                {
                  productDetails: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$productDetails',
                          cond: { $eq: ['$$this._id', '$$product.productId'] }
                        }
                      },
                      0
                    ]
                  }
                }
              ]
            }
          }
        }
      }
    },

    { $match: { deleted: false } },
    { $unset: 'productDetails' }
  ];

  console.log('Running aggregation with Wrapper function...\n');
  
  try {
    // Use the Wrapper function - it will execute each stage and show results
    const results = await Wrapper(materialModel, pipeline, {
      debug: true,        // Enable debug mode (step by step execution)
      logResults: true,   // Log sample results after each stage
      allowDiskUse: true  // MongoDB option for large datasets
    });

    console.log('\n🎉 Final Results Summary:');
    console.log(`Total documents: ${results.length}`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Error in aggregation:', error);
    throw error;
  }
}

// Simple example for basic usage
export async function simpleExample(yourModel: any) {
  const simplePipeline = [
    { $match: { deleted: false } },
    { $sort: { createdAt: -1 } },
    { $limit: 5 }
  ];

  return await Wrapper(yourModel, simplePipeline);
}

/*
Usage in your application:

import { exampleUsage } from 'mongoose-aggregation-wrapper/dist/example';
import { MaterialModel } from './your-models';

// In your service/controller
const results = await exampleUsage(MaterialModel);

Or directly:

import Wrapper from 'mongoose-aggregation-wrapper';

const results = await Wrapper(YourModel, yourPipeline, {
  debug: true,
  logResults: true
});
*/
