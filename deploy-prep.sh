#!/bin/bash

echo "🚀 Coinbase Clone - Deployment Preparation"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -d "client" ] || [ ! -d "server" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
echo ""

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies  
echo "Installing client dependencies..."
cd client
npm install
cd ..

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

echo "📝 Step 2: Setting up environment files..."
echo ""

# Copy example env files
if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    echo "✅ Created server/.env from example"
else
    echo "⚠️  server/.env already exists, skipping..."
fi

if [ ! -f "client/.env.local" ]; then
    cp client/.env.example client/.env.local
    echo "✅ Created client/.env.local from example"
else
    echo "⚠️  client/.env.local already exists, skipping..."
fi

echo ""
echo "🎯 Step 3: Building frontend for production..."
echo ""

cd client
npm run build
cd ..

echo ""
echo "✅ Build completed successfully!"
echo ""

echo "================================================"
echo "✨ Deployment Preparation Complete!"
echo "================================================"
echo ""
echo "📖 Next Steps:"
echo ""
echo "1. Read DEPLOYMENT.md for detailed deployment instructions"
echo "2. Push your code to GitHub"
echo "3. Deploy backend to Railway.app or Render.com"
echo "4. Deploy frontend to Vercel.com"
echo "5. Configure environment variables on hosting platforms"
echo ""
echo "🔗 Quick Links:"
echo "   • Railway: https://railway.app"
echo "   • Render: https://render.com"
echo "   • Vercel: https://vercel.com"
echo "   • MongoDB Atlas: https://www.mongodb.com/cloud/atlas"
echo ""
echo "💡 Tip: Your production build is ready in client/build/"
echo ""
