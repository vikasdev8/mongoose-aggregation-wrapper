/**
 * Mongoose Aggregation Pipeline Debugger Wrapper
 * Executes each stage of an aggregation pipeline step by step and logs results
 */

export interface WrapperOptions {
  allowDiskUse?: boolean;
  debug?: boolean;
  logResults?: boolean;
}

export async function Wrapper<T = any>(
  model: any, 
  pipeline: unknown[], 
  options: WrapperOptions = {}
): Promise<T[]> {
  if (!model || typeof model.aggregate !== 'function') {
    throw new TypeError('model must be a Mongoose model with an aggregate method');
  }

  if (!Array.isArray(pipeline)) {
    throw new TypeError('pipeline must be an array of aggregation stages');
  }

  const { debug = true, logResults = true, allowDiskUse = false } = options;

  if (!debug) {
    // If debug is false, run the full pipeline at once
    return model.aggregate(pipeline).option({ allowDiskUse }).exec();
  }

  console.log('🚀 Starting Aggregation Pipeline Debug Mode');
  console.log(`📊 Total stages: ${pipeline.length}`);
  console.log('='.repeat(50));

  let results: T[] = [];

  // Execute pipeline stage by stage
  for (let i = 0; i < pipeline.length; i++) {
    const currentStage = pipeline[i];
    const stageNumber = i + 1;
    const currentPipeline = pipeline.slice(0, stageNumber);

    console.log(`\n🔍 Stage ${stageNumber}/${pipeline.length}:`);
    console.log('Stage content:', JSON.stringify(currentStage, null, 2));
    
    try {
      const stageStartTime = Date.now();
      results = await model.aggregate(currentPipeline).option({ allowDiskUse }).exec();
      const stageEndTime = Date.now();
      const executionTime = stageEndTime - stageStartTime;

      console.log(`⏱️  Execution time: ${executionTime}ms`);
      console.log(`📈 Results count: ${results.length}`);
      
      if (logResults && results.length > 0) {
        console.log('📋 Sample result (first document):');
        console.log(JSON.stringify(results[0], null, 2));
        
        if (results.length > 1) {
          console.log(`... and ${results.length - 1} more documents`);
        }
      } else if (results.length === 0) {
        console.log('❌ No results returned from this stage');
      }
      
    } catch (error) {
      console.error(`❌ Error at stage ${stageNumber}:`, error);
      throw error;
    }

    console.log('-'.repeat(40));
  }

  console.log('\n✅ Pipeline execution completed successfully!');
  console.log(`🎯 Final result count: ${results.length}`);
  
  return results;
}

// Export as default for easy importing
export default Wrapper;
