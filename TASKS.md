# 🎯 PRINA OPTIONS TRACKER - DEVELOPMENT TASKS

## 📊 Current Project Status
- ✅ **Frontend Architecture**: 2,223-line monolithic `page.tsx` with full functionality 
- ✅ **UI Components**: Complete shadcn/ui component library
- ✅ **Core Logic**: Trade management, position tracking, calculations
- ✅ **Partial Refactoring**: Types, hooks, and services extracted 
- ✅ **Auth UI**: Authentication pages implemented (mock)
- ⚠️ **Database**: Supabase configured but not connected
- ❌ **Authentication**: Mock implementation only
- ❌ **Deployment**: Not production-ready

## 🔥 CRITICAL PATH (MVP → Deployment)

### Phase 1: Complete Refactoring (Days 1-3) 
**Priority: HIGH** - Essential for maintainability

#### Task 1.1: Extract Dialog Components
- [ ] Create `frontend/components/dialogs/TradeActionDialog.tsx`
- [ ] Create `frontend/components/dialogs/EditTradeDialog.tsx` 
- [ ] Create `frontend/components/dialogs/TradeSummaryModal.tsx`
- [ ] Create `frontend/components/dialogs/CashModal.tsx`
- [ ] Create `frontend/components/dialogs/SettingsDialog.tsx`
- [ ] Create `frontend/components/dialogs/PricingModal.tsx`

#### Task 1.2: Extract Layout Components
- [ ] Create `frontend/components/layout/Header.tsx`
- [ ] Create `frontend/components/layout/Sidebar.tsx` (if needed)

#### Task 1.3: Extract Section Components
- [ ] Create `frontend/components/sections/PortfolioOverview.tsx`
- [ ] Create `frontend/components/sections/NewTradeForm.tsx`
- [ ] Create `frontend/components/sections/PositionsTab.tsx`
- [ ] Create `frontend/components/sections/TradesTab.tsx`

#### Task 1.4: Complete Missing Hooks
- [ ] Create `frontend/hooks/useCashManagement.ts`
- [ ] Create `frontend/hooks/useAppSettings.ts`

#### Task 1.5: Refactor Main Page
- [ ] Update `app/page.tsx` to use modular components
- [ ] Remove duplicate code
- [ ] Reduce from 2,223 lines to ~200 lines

### Phase 2: Supabase Integration (Days 4-6)
**Priority: HIGH** - Required for real data persistence

#### Task 2.1: Database Setup (CRITICAL FIXES REQUIRED)
- [ ] Create Supabase project and configure environment variables
- [ ] **FIX CRITICAL ISSUE**: Create `user_portfolios` table for persistent cash/collateral state
- [ ] **ENHANCE**: Upgrade `trades` table with:
  - `parent_trade_id` for trade relationships (rollovers, assignments)
  - Enhanced constraints and validation
  - Change `start_date`/`expiration_date` to match frontend `startDate`/`expirationDate`
- [ ] **SEPARATE**: Create proper `cash_transactions` table (not fake "CASH" trades)
- [ ] **UPGRADE**: Enhanced `user_settings` with trading preferences
- [ ] **PERFORMANCE**: Add critical indexes for common queries
- [ ] **SECURITY**: Implement comprehensive RLS policies
- [ ] **DATABASE FUNCTIONS**: Portfolio update triggers and constraints

#### Task 2.2: API Layer Creation (WITH SCHEMA MAPPING)
- [ ] **CRITICAL**: Create database mapping utilities for camelCase ↔ snake_case
- [ ] Create `app/api/portfolio/route.ts` - **NEW**: Portfolio state management
- [ ] Create `app/api/trades/route.ts` (GET, POST) - Enhanced with relationships
- [ ] Create `app/api/trades/[id]/route.ts` (PATCH, DELETE) - With audit trail
- [ ] Create `app/api/cash/route.ts` - **FIXED**: Real cash transactions (not fake trades)
- [ ] Create `app/api/settings/route.ts` - Enhanced user preferences
- [ ] **IMPLEMENT**: Replace mock data service with real API calls
- [ ] **ADD**: Database transaction support for complex operations

#### Task 2.3: Real Authentication
- [ ] Implement Supabase Auth in `app/auth/page.tsx`
- [ ] Add Google OAuth configuration
- [ ] Create protected route middleware
- [ ] Add session management

### Phase 3: Production Optimization (Days 7-8)
**Priority: MEDIUM** - Polish for deployment

#### Task 3.1: Error Handling & Validation
- [ ] Add comprehensive error boundaries
- [ ] Implement form validation with Zod
- [ ] Add loading states and skeletons
- [ ] Add toast notifications for user feedback

#### Task 3.2: Performance & UX
- [ ] Implement data caching strategies
- [ ] Add optimistic updates for trades
- [ ] Implement real-time price data (optional)
- [ ] Add responsive design improvements

#### Task 3.3: Security Hardening
- [ ] Add rate limiting to API endpoints
- [ ] Implement input sanitization
- [ ] Add CAPTCHA to auth forms
- [ ] Configure Vercel security headers

### Phase 4: Deployment (Day 9)
**Priority: HIGH** - Go live

#### Task 4.1: Environment Setup
- [ ] Configure production Supabase project
- [ ] Set up Vercel deployment
- [ ] Configure domain and SSL
- [ ] Set up monitoring and analytics

#### Task 4.2: Testing & Launch
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security audit
- [ ] Launch monitoring

## 📋 DETAILED IMPLEMENTATION GUIDE

### Current Working Features ✅
1. **Trade Management**: Full CRUD for options and stock trades
2. **Position Tracking**: Real-time portfolio calculations
3. **Cost Basis Calculations**: With/without premiums
4. **Premium Tracking**: Time-filtered income reporting
5. **Trade Actions**: Close, assign, roll functionality
6. **Settings Management**: Commission defaults, preferences
7. **Responsive UI**: Complete mobile/desktop interface

### Missing Critical Components ❌
1. **Real Authentication**: Currently mock implementation
2. **Data Persistence**: All data lost on refresh
3. **API Integration**: No backend connectivity
4. **Deployment Configuration**: Not production-ready

## 🛠️ DEVELOPMENT PRIORITIES

### Priority 1: MUST HAVE (MVP)
- Database connection and data persistence
- Real user authentication
- Basic deployment capability

### Priority 2: SHOULD HAVE (V1.1)
- Real-time market data integration
- Advanced error handling
- Performance optimizations

### Priority 3: NICE TO HAVE (V1.2+) 
- Advanced analytics and reporting
- Mobile app version
- Third-party integrations (brokers)

## 📂 FILE ORGANIZATION TARGET

```
prina/
├── app/                          # Next.js 13+ app directory
│   ├── api/                      # API routes
│   ├── auth/                     # Auth pages
│   ├── page.tsx                  # Main app (~200 lines)
│   └── layout.tsx
├── frontend/                     # All frontend code
│   ├── components/               # React components
│   ├── hooks/                    # Custom hooks
│   ├── lib/                      # Utilities
│   ├── types/                    # TypeScript types
│   └── constants/                # App constants
├── backend/                      # Backend services
│   ├── api/                      # API logic
│   ├── services/                 # Business logic
│   └── config/                   # Configuration
└── deployment/                   # Deployment configs
```

## 🎯 SUCCESS METRICS

### Technical Metrics
- [ ] Page load time < 3 seconds
- [ ] Main page.tsx < 300 lines
- [ ] 100% TypeScript coverage
- [ ] Zero runtime errors in production

### Business Metrics
- [ ] User can create account and login
- [ ] User can add/edit/delete trades
- [ ] Portfolio calculations work correctly
- [ ] Data persists between sessions

## 🚨 RISK MITIGATION

### High-Risk Items
1. **Supabase Configuration**: Test thoroughly in development
2. **Data Migration**: Backup strategy for existing mock data  
3. **Authentication Flow**: Comprehensive testing required
4. **Performance**: Monitor bundle size during refactoring

### Backup Plans
- Keep mock data service as fallback
- Gradual migration instead of big-bang deployment
- Feature flags for new functionality
- Rollback strategy for each deployment

---

**⏰ ESTIMATED TIMELINE: 9 DAYS TO MVP DEPLOYMENT**
- Days 1-3: Refactoring (50% effort)
- Days 4-6: Supabase Integration (30% effort)  
- Days 7-8: Polish & Optimization (15% effort)
- Day 9: Deployment (5% effort) 