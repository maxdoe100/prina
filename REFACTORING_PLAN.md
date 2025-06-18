# Project Reorganization Plan

## 📁 New Folder Structure

```
prina/
├── frontend/                          # All frontend code
│   ├── components/                     # React components
│   │   ├── ui/                        # Existing shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── dialogs/                   # Modal/Dialog components
│   │   │   ├── TradeActionDialog.tsx
│   │   │   ├── EditTradeDialog.tsx
│   │   │   ├── EditSummaryDialog.tsx
│   │   │   ├── TradeSummaryModal.tsx
│   │   │   ├── CashModal.tsx
│   │   │   ├── SettingsDialog.tsx
│   │   │   └── PricingModal.tsx
│   │   ├── layout/                    # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── sections/                  # Page sections
│   │       ├── PortfolioOverview.tsx
│   │       ├── NewTradeForm.tsx
│   │       ├── PositionsTab.tsx
│   │       └── TradesTab.tsx
│   ├── hooks/                         # Custom React hooks
│   │   ├── useTradeManagement.ts      # Trade CRUD operations
│   │   ├── usePositions.ts            # Position calculations
│   │   ├── useCashManagement.ts       # Cash transactions
│   │   └── useAppSettings.ts          # Settings management
│   ├── lib/                           # Utility libraries
│   │   ├── utils.ts                   # Existing shadcn utils
│   │   ├── formatters.ts              # Currency, date formatting
│   │   └── calculations.ts            # Trading calculations
│   ├── types/                         # TypeScript interfaces
│   │   └── trade.ts                   # All trading-related types
│   └── constants/                     # App constants
│       └── defaults.ts                # Default values, configs
├── backend/                           # Backend services (future API)
│   ├── api/                          # API routes (future)
│   │   ├── trades.ts
│   │   ├── positions.ts
│   │   └── settings.ts
│   ├── services/                     # Business logic
│   │   ├── mockData.ts              # Mock data service
│   │   ├── tradeService.ts          # Trade operations
│   │   └── portfolioService.ts      # Portfolio calculations
│   ├── models/                       # Data models
│   │   ├── Trade.ts
│   │   └── Position.ts
│   └── utils/                        # Backend utilities
│       └── validators.ts
└── app/                              # Next.js app directory (current)
    ├── page.tsx                      # Refactored main page
    ├── auth/
    │   └── page.tsx
    ├── layout.tsx
    └── globals.css
```

## 🔄 Refactoring Benefits

### Before (Current State)
- **2,223 lines** in single `page.tsx` file
- All logic mixed together
- Hard to maintain and debug
- Difficult to test individual components
- Poor code reusability

### After (Proposed Structure)
- **~100-200 lines** per file (modular)
- Clear separation of concerns
- Easy to test individual parts
- Reusable components and hooks
- Better TypeScript intellisense
- Scalable architecture

## 📋 Migration Steps

### Phase 1: Extract Types & Utilities ✅
- [x] Create `frontend/types/trade.ts`
- [x] Create `frontend/lib/formatters.ts`
- [x] Create `frontend/lib/calculations.ts`
- [x] Create `frontend/constants/defaults.ts`

### Phase 2: Extract Hooks ✅
- [x] Create `frontend/hooks/useTradeManagement.ts`
- [x] Create `frontend/hooks/usePositions.ts`
- [ ] Create `frontend/hooks/useCashManagement.ts`
- [ ] Create `frontend/hooks/useAppSettings.ts`

### Phase 3: Extract Components
- [ ] Create dialog components
- [ ] Create layout components
- [ ] Create section components

### Phase 4: Backend Structure ✅
- [x] Create `backend/services/mockData.ts`
- [ ] Create API layer structure
- [ ] Create validation utilities

### Phase 5: Refactor Main Page
- [ ] Update `app/page.tsx` to use modular components
- [ ] Remove duplicate code
- [ ] Update imports

## 🚀 Implementation Priority

1. **High Priority** (Core functionality)
   - Dialog components (TradeActionDialog, TradeSummaryModal)
   - Trading hooks (useTradeManagement, usePositions)
   - Main page refactoring

2. **Medium Priority** (Organization)
   - Layout components (Header, Sidebar)
   - Section components (PortfolioOverview, NewTradeForm)
   - Cash management hooks

3. **Low Priority** (Future enhancement)
   - Backend API structure
   - Advanced validation
   - Error handling improvements

## 📊 File Size Reduction

| Component | Current Size | Target Size | Improvement |
|-----------|-------------|-------------|-------------|
| Main Page | 2,223 lines | ~200 lines | 90% reduction |
| Trade Logic | Mixed | ~300 lines | Isolated |
| UI Components | Mixed | ~100 lines each | Modular |
| Utilities | Mixed | ~50 lines each | Reusable |

## 🔧 Development Benefits

- **Faster Development**: Find code quickly
- **Better Testing**: Test components in isolation
- **Easier Debugging**: Clear error locations
- **Team Collaboration**: Multiple developers can work on different parts
- **Code Reviews**: Smaller, focused pull requests
- **Maintenance**: Easy to update specific features

## 📱 Frontend/Backend Separation

### Frontend Responsibilities
- React components and UI
- State management
- User interactions
- Form validation
- Local calculations

### Backend Responsibilities  
- Data persistence
- Business logic validation
- External API integrations
- Authentication
- Rate limiting

This separation allows for:
- Independent deployment
- Technology flexibility
- Better scaling
- Clearer API contracts 