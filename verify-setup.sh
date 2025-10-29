#!/bin/bash

# Zyra Frontend Verification Script
# Verifies Node.js, TypeScript, and build configuration

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🚀 Zyra Frontend Verification Script"
echo "======================================"
echo ""

# Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
  echo "${GREEN}✅ Node.js version: $(node -v)${NC}"
else
  echo "${RED}❌ Node.js version $(node -v) is too old. Required: >=18.0.0${NC}"
  exit 1
fi

# Check npm version
echo ""
echo "📦 Checking npm version..."
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -ge 9 ]; then
  echo "${GREEN}✅ npm version: $(npm -v)${NC}"
else
  echo "${YELLOW}⚠️  npm version $(npm -v) is below recommended. Recommended: >=9.0.0${NC}"
fi

# Check TypeScript version
echo ""
echo "🔷 Checking TypeScript version..."
if command -v tsc &> /dev/null; then
  TSC_VERSION=$(tsc --version | cut -d' ' -f2)
  echo "${GREEN}✅ TypeScript version: $TSC_VERSION${NC}"
else
  echo "${YELLOW}⚠️  TypeScript not found globally. Checking local installation...${NC}"
  if [ -f "node_modules/.bin/tsc" ]; then
    echo "${GREEN}✅ TypeScript found in node_modules${NC}"
  else
    echo "${RED}❌ TypeScript not found. Run: npm install${NC}"
    exit 1
  fi
fi

# Check for react-flow-renderer (old deprecated package)
echo ""
echo "🔍 Checking for deprecated packages..."
if grep -q "react-flow-renderer" package.json 2>/dev/null; then
  echo "${RED}❌ react-flow-renderer found in package.json (deprecated)${NC}"
  echo "   Please remove it and use reactflow instead"
  exit 1
else
  echo "${GREEN}✅ No react-flow-renderer found${NC}"
fi

# Check for reactflow
if grep -q "reactflow" package.json 2>/dev/null; then
  echo "${GREEN}✅ reactflow package found${NC}"
else
  echo "${YELLOW}⚠️  reactflow not found in package.json${NC}"
fi

# Check .npmrc
echo ""
echo "📝 Checking .npmrc configuration..."
if [ -f ".npmrc" ]; then
  if grep -q "engine-strict=true" .npmrc; then
    echo "${GREEN}✅ .npmrc configured correctly${NC}"
  else
    echo "${YELLOW}⚠️  .npmrc missing engine-strict setting${NC}"
  fi
else
  echo "${YELLOW}⚠️  .npmrc not found${NC}"
fi

# Check next.config.js
echo ""
echo "⚙️  Checking next.config.js..."
if [ -f "next.config.js" ]; then
  if grep -q "reactflow" next.config.js; then
    echo "${GREEN}✅ next.config.js includes reactflow optimization${NC}"
  else
    echo "${YELLOW}⚠️  next.config.js missing reactflow optimization${NC}"
  fi
else
  echo "${RED}❌ next.config.js not found${NC}"
  exit 1
fi

# Check TypeScript config
echo ""
echo "📘 Checking TypeScript configuration..."
if [ -f "tsconfig.json" ]; then
  if grep -q '"strict": true' tsconfig.json; then
    echo "${GREEN}✅ TypeScript strict mode enabled${NC}"
  else
    echo "${YELLOW}⚠️  TypeScript strict mode not enabled${NC}"
  fi
else
  echo "${RED}❌ tsconfig.json not found${NC}"
  exit 1
fi

# Run type check
echo ""
echo "🔍 Running TypeScript type check..."
if npm run type-check 2>&1 | grep -q "error"; then
  echo "${RED}❌ TypeScript errors found${NC}"
  echo "   Run: npm run type-check"
  exit 1
else
  echo "${GREEN}✅ No TypeScript errors${NC}"
fi

# Run lint check
echo ""
echo "🔍 Running ESLint..."
if npm run lint 2>&1 | grep -q "error"; then
  echo "${YELLOW}⚠️  ESLint warnings/errors found${NC}"
  echo "   Run: npm run lint:fix"
else
  echo "${GREEN}✅ No ESLint errors${NC}"
fi

# Final summary
echo ""
echo "======================================"
echo "${GREEN}✅ Verification complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run 'npm run dev' to start development server"
echo "  2. Run 'npm run build' to test production build"
echo "  3. Check for any ReactFlow imports if using workflow builder"
echo ""

