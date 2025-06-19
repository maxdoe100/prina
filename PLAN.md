# Options Trading Cost Basis Tracking App - UPDATED PLAN

## 1. Project Overview

**Objective**: Deploy a fully functional options trading cost basis tracking web application that replicates and enhances the functionality of MyATMM.com, focusing on covered calls and cash-secured puts for weekly cash flow generation.

**Current Status**: 
- ✅ **Frontend**: Complete 2,223-line React application with all core functionality
- ✅ **UI/UX**: Professional design with shadcn/ui components
- ✅ **Logic**: Full trade management, portfolio calculations, cost basis tracking
- ⚠️ **Architecture**: Needs refactoring for maintainability
- ❌ **Backend**: Mock data only, needs Supabase integration
- ❌ **Auth**: Mock implementation, needs real authentication
- ❌ **Deployment**: Not production-ready

**Target Audience**: Retail options traders (beginners to intermediate) seeking to generate cash flow through covered calls and cash-secured puts.

## 2. Core Functionalities (IMPLEMENTED ✅)

### 2.1 Portfolio Overview
- **Portfolio Value**: Combined cash + stock value + unrealized options value
- **Premium Tracking**: Time-filtered view (1M, 3M, 1Y, All)
- **Cash Management**: Editable cash amount with deposit/withdraw tracking
- **Locked Collateral**: Displays secured cash for cash-secured puts

### 2.2 Trade Management 
- **Trade Input**: Symbol, Side (STO/BTO), Type (Call/Put/Stock), dates, prices, contracts
- **Validation**: Real stock tickers, positive strikes, valid dates, sufficient contracts
- **Trade Actions**: Close, Assign, Roll, Edit functionality
- **Status Tracking**: Open, Closed, Expired, Assigned

### 2.3 Position Tracking
- **Stock Positions**: Real-time share counts, cost basis calculations
- **Options Positions**: Open contracts by symbol with P&L tracking
- **Cost Basis Views**: With/without premiums toggle
- **Risk Management**: Expiration alerts, position sizing

### 2.4 Advanced Features
- **Covered Calls**: Auto-stock purchase for coverage
- **Cash-Secured Puts**: Collateral locking mechanism
- **Trade Nomenclature**: Professional options format display
- **Settings**: Default commission, risk alerts, preferences

## 3. Technical Architecture

**Current Stack**:
- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Tailwind CSS + shadcn/ui components
- **State**: React hooks with local state
- **Data**: Mock service (temporary)
- **Auth**: Mock implementation (temporary)

**Target Production Stack**:
- **Database**: Supabase PostgreSQL with RLS
- **Auth**: Supabase Auth with Google OAuth
- **API**: Next.js API routes
- **Deployment**: Vercel
- **Monitoring**: Vercel Analytics

## 4. Database Schema (Required - CRITICAL FIXES NEEDED)

### 🚨 **CRITICAL ISSUES DISCOVERED**
1. **Missing Portfolio State**: No persistent storage for cash balance, locked collateral
2. **Schema Mismatch**: Frontend camelCase vs DB snake_case naming conflicts
3. **Cash as Fake Trades**: Deposits/withdrawals create "CASH" symbol trades instead of proper audit
4. **No Trade Relationships**: Missing parent-child links for rollovers/assignments
5. **Performance Issues**: No indexes for common query patterns

### 4.1 Tables

**user_portfolios (CRITICAL - MISSING TABLE)**
```sql
-- ❌ ISSUE: Portfolio state (cash, collateral) currently lost on page refresh
-- ✅ SOLUTION: Persistent portfolio table with real-time triggers
CREATE TABLE user_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cash_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  locked_collateral DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_premiums_collected DECIMAL(15,2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_portfolio UNIQUE(user_id),
  CONSTRAINT positive_cash CHECK(cash_balance >= 0)
);
```

**trades (ENHANCED)**
```sql
-- ❌ ISSUES: Missing trade relationships, schema mismatch with frontend
-- ✅ SOLUTIONS: Add parent_trade_id, enhanced constraints, performance indexes
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_trade_id UUID REFERENCES trades(id), -- NEW: For rollovers/assignments
  
  symbol VARCHAR(10) NOT NULL,
  side trade_side NOT NULL, -- Enhanced: proper enum
  type trade_type NOT NULL, -- Enhanced: proper enum  
  trade_date DATE NOT NULL, -- FIXED: Changed from start_date to match frontend
  strike_price DECIMAL(10,4), -- Enhanced: more precision for options
  price DECIMAL(10,4) NOT NULL, -- Enhanced: more precision
  contracts INTEGER NOT NULL,
  expiration_date DATE, -- FIXED: Matches frontend naming
  status trade_status NOT NULL DEFAULT 'open',
  
  premium DECIMAL(15,2) NOT NULL, -- Enhanced: larger precision
  commission DECIMAL(10,2) DEFAULT 0,
  is_covered BOOLEAN DEFAULT FALSE, -- FIXED: Changed from covered
  is_secured BOOLEAN DEFAULT FALSE, -- FIXED: Changed from secured
  closing_price DECIMAL(10,4), -- Enhanced: more precision
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- NEW: Enhanced constraints for data integrity
  CONSTRAINT valid_strike_for_options CHECK(
    (type = 'Stock' AND strike_price IS NULL) OR 
    (type IN ('Call', 'Put') AND strike_price > 0)
  ),
  CONSTRAINT valid_expiration_for_options CHECK(
    (type = 'Stock' AND expiration_date IS NULL) OR 
    (type IN ('Call', 'Put') AND expiration_date IS NOT NULL)
  ),
  CONSTRAINT non_zero_contracts CHECK(contracts != 0)
);

-- NEW: Performance indexes for common queries
CREATE INDEX idx_trades_user_status ON trades(user_id, status);
CREATE INDEX idx_trades_user_symbol ON trades(user_id, symbol);
CREATE INDEX idx_trades_expiration ON trades(expiration_date) WHERE status = 'open';
```

**user_settings**
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key)
- default_commission: decimal(10,2)
- risk_alerts: boolean
- email_notifications: boolean
- dark_mode: boolean
- created_at: timestamp
- updated_at: timestamp
```

**cash_transactions (FIXED - NO MORE FAKE TRADES)**
```sql
-- ❌ ISSUE: Currently creates fake "CASH" trades for deposits/withdrawals
-- ✅ SOLUTION: Proper cash transaction audit trail separate from trades
CREATE TABLE cash_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id UUID REFERENCES trades(id) ON DELETE SET NULL, -- Link to trade if applicable
  
  transaction_type transaction_type NOT NULL, -- Enhanced: more types
  amount DECIMAL(15,2) NOT NULL, -- Enhanced: larger precision
  balance_after DECIMAL(15,2) NOT NULL, -- NEW: Running balance
  description TEXT,
  reference_id VARCHAR(50), -- NEW: External reference (broker confirmation)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT non_zero_amount CHECK(amount != 0)
);

-- Enhanced transaction types
CREATE TYPE transaction_type AS ENUM (
  'deposit', 'withdraw', 'trade_settlement', 'assignment', 'dividend'
);
```

### 4.2 Row Level Security (RLS)
- Users can only access their own trades and settings
- Service role for admin operations
- Authenticated users only

## 5. API Endpoints (Required - ENHANCED)

**Portfolio Management (NEW - CRITICAL)**
- `GET /api/portfolio` - Get portfolio state (cash, collateral, totals)
- `PATCH /api/portfolio` - Update portfolio state
- `POST /api/portfolio/sync` - Sync portfolio with trade changes

**Trades Management (ENHANCED)**
- `GET /api/trades` - Get user's trades with relationships
- `POST /api/trades` - Create new trade (with portfolio updates)
- `PATCH /api/trades/[id]` - Update trade (with audit trail)
- `DELETE /api/trades/[id]` - Delete trade (with portfolio sync)
- `POST /api/trades/[id]/actions` - Execute trade actions (close/assign/roll)

**Cash Management (FIXED)**
- `GET /api/cash` - Get cash transaction history
- `POST /api/cash` - Record cash deposit/withdrawal (NO MORE FAKE TRADES)
- `GET /api/cash/balance` - Get current cash balance

**Settings Management (ENHANCED)**
- `GET /api/settings` - Get user settings
- `PATCH /api/settings` - Update settings
- `POST /api/settings/defaults` - Reset to defaults

**Authentication**
- Handled by Supabase Auth middleware
- Protected routes for authenticated users only

## 6. Key Business Logic

### 6.1 Trade Financial Calculations

**STO Options (Selling)**
```typescript
premium = (price × contracts × 100) - commission
collateral = strikePrice × 100 × contracts (for puts if secured)
```

**BTO Options (Buying)**
```typescript
premium = -((price × contracts × 100) + commission)
```

**Stock Trades**
```typescript
// Buy: premium = -(price × shares + commission)
// Sell: premium = (price × shares) - commission
```

### 6.2 Position Calculations

**Cost Basis (Stock)**
```typescript
avgCostBasis = totalStockCost / totalShares
costBasisWithPremiums = (totalStockCost - premiumsReceived) / totalShares
```

**Portfolio Value**
```typescript
portfolioValue = cash + stockValue + unrealizedOptionsValue - lockedCollateral
```

### 6.3 Trade Actions

**Assignment (STO Puts)**
- Add shares: strikePrice × contracts
- Remove collateral: strikePrice × 100 × contracts
- Update trade status: "assigned"

**Assignment (STO Calls)**
- Remove shares: 100 × contracts
- Update trade status: "assigned"

**Expiration**
- Update status: "expired"
- Release collateral (if applicable)

## 7. Implementation Priority

### Phase 1: Complete Refactoring (Days 1-3)
1. Extract dialog components from monolithic page.tsx
2. Create section components (Portfolio, Trades, etc.)
3. Complete missing hooks (cash management, settings)
4. Reduce main page from 2,223 lines to ~200 lines

### Phase 2: Supabase Integration (Days 4-6)
1. Set up Supabase project and database schema
2. Create API routes replacing mock data
3. Implement real authentication with Google OAuth
4. Add protected routes and session management

### Phase 3: Production Deployment (Days 7-9)
1. Environment configuration and testing
2. Performance optimization and error handling
3. Security hardening (RLS, rate limiting, validation)
4. Vercel deployment with monitoring

## 8. Success Criteria

**Technical Requirements**
- [ ] All data persists in Supabase database
- [ ] Users can authenticate with email + Google
- [ ] Main page.tsx < 300 lines (90% size reduction)
- [ ] Zero runtime errors in production
- [ ] Page load time < 3 seconds

**Business Requirements**
- [ ] Users can create/edit/delete trades
- [ ] Portfolio calculations are accurate
- [ ] Premium tracking works correctly
- [ ] Trade actions (close/assign/roll) function properly
- [ ] Data persists between user sessions

## 9. Deployment Configuration

**Environment Variables**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

**Vercel Settings**
- Node.js 18+
- Auto-deployments from main branch
- Environment variables configured
- Domain and SSL configured

## 10. Risk Mitigation

**High-Risk Areas**
1. Supabase configuration and RLS policies
2. Authentication flow and session management
3. Data migration from mock to real database
4. Performance impact of refactoring

**Mitigation Strategies**
- Thorough testing in development environment
- Keep mock data service as fallback
- Gradual migration approach
- Performance monitoring during refactoring

---

## 11. Critical Database Implementation Steps

### 🚨 **IMMEDIATE PRIORITY (Day 1)**
1. **Create user_portfolios table** - Fixes critical portfolio state loss issue
2. **Fix schema mapping** - Frontend camelCase ↔ Database snake_case utilities
3. **Separate cash transactions** - Stop creating fake "CASH" trades

### 🔧 **DATABASE SETUP CHECKLIST**
- [ ] Create enhanced schema with constraints and indexes
- [ ] Implement portfolio update triggers for real-time calculations
- [ ] Add comprehensive RLS policies for security
- [ ] Create mapping utilities for frontend-database translation
- [ ] Set up database functions for complex operations
- [ ] Enable realtime subscriptions for live portfolio updates

### ⚡ **PERFORMANCE OPTIMIZATIONS**
- [ ] Index all common query patterns (user+status, user+symbol, expiration dates)
- [ ] Implement database-level portfolio calculations with triggers
- [ ] Use proper constraints to prevent invalid data states
- [ ] Set up connection pooling for production deployment

---

**🎯 GOAL: DEPLOY FULLY FUNCTIONAL MVP IN 9 DAYS**

This plan focuses on delivering a working product quickly while maintaining code quality and user experience. The existing frontend functionality is comprehensive and proven - the focus is on proper architecture, real data persistence, and production deployment.

**🔥 CRITICAL SUCCESS FACTOR: Fix the database design issues first** - The current approach of storing portfolio state in React state and using fake "CASH" trades will cause major problems in production. The enhanced schema above solves these fundamental issues.


