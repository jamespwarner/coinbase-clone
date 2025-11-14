#!/bin/bash

echo "🔐 Secure Key Generator for Deployment"
echo "========================================"
echo ""

# Generate JWT Secret (64 characters)
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Generate Admin Key (32 characters)
ADMIN_KEY=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")

echo "✅ Generated secure keys for your deployment:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "JWT_SECRET (use in backend .env):"
echo "$JWT_SECRET"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "ADMIN_KEY (use in backend .env):"
echo "$ADMIN_KEY"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT:"
echo "   • Save these keys securely"
echo "   • Never commit them to Git"
echo "   • Use them in your hosting platform's environment variables"
echo "   • Generate new keys for each deployment environment"
echo ""
echo "📝 Copy these values to:"
echo "   • Railway.app → Variables tab"
echo "   • Render.com → Environment section"
echo "   • Or your .env file for local development"
echo ""
