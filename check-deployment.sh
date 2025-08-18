#!/bin/bash

# Check deployment status script
echo "🚀 Mongoose Aggregation Wrapper - Deployment Status Check"
echo "========================================================="

# Check if website is accessible
echo "🌐 Checking website availability..."
curl -s -o /dev/null -w "Website Status: %{http_code}\n" https://vikasdev8.github.io/mongoose-aggregation-wrapper/

# Check npm package
echo "📦 Checking npm package..."
npm view mongoose-aggregation-wrapper version 2>/dev/null && echo "✅ Package found on npm" || echo "❌ Package not found on npm"

# Check GitHub repository
echo "📁 GitHub Repository: https://github.com/vikasdev8/mongoose-aggregation-wrapper"
echo "🌍 Website URL: https://vikasdev8.github.io/mongoose-aggregation-wrapper"
echo "📦 npm Package: https://www.npmjs.com/package/mongoose-aggregation-wrapper"

echo ""
echo "📋 Next Steps:"
echo "1. Go to GitHub Settings > Pages and enable GitHub Pages from /docs folder"
echo "2. Wait 5-10 minutes for GitHub Pages to deploy"
echo "3. Submit sitemap to Google Search Console"
echo "4. Share your package on social media and dev communities"
echo ""
echo "✨ Your package website is ready for the world to discover!"
