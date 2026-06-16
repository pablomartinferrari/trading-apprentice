# Trading Apprentice AI

An AI-powered trading mentor for beginner traders. The goal is **education and disciplined decision-making**, not automated trading or blind buy/sell signals.

## Vision

Trading Apprentice acts as a personal trading analyst that helps you:

- Analyze trade ideas with bullish and bearish factors
- Challenge weak decisions like a skeptical mentor
- Size positions based on risk rules
- Journal trades and learn from outcomes
- Track performance by strategy

## Architecture

Domain-Driven Design with hexagonal architecture:

```
src/
  domain/           Aggregates and value objects
  application/      Use cases and port interfaces
  infrastructure/     Adapters (mock AI, mock market data, SQLite, stub brokerage)
  interfaces/api/   Hono REST API
  shared/           Cross-cutting errors
```

## Prerequisites

- Node.js 20+
- npm

## Setup

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

The API starts at `http://localhost:3000`.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/health` | Health check |
| POST | `/api/trades/analyze` | Analyze a trade idea |
| GET | `/api/watchlist?market=US` | Generate today's watchlist |
| POST | `/api/risk/position-size` | Calculate position size |
| POST | `/api/journal` | Record a completed trade |
| GET | `/api/journal` | List journal entries |
| GET | `/api/journal/performance` | Performance analytics |
| GET | `/api/account` | Account balance, positions, exposure |

## Smoke Tests

Analyze a trade:

```bash
curl -X POST http://localhost:3000/api/trades/analyze \
  -H "Content-Type: application/json" \
  -d "{\"symbol\":\"PLTR\"}"
```

Generate watchlist:

```bash
curl "http://localhost:3000/api/watchlist?market=US"
```

Calculate position size:

```bash
curl -X POST http://localhost:3000/api/risk/position-size \
  -H "Content-Type: application/json" \
  -d "{\"accountBalance\":10000,\"riskPercent\":2,\"entryPrice\":100,\"stopPrice\":95}"
```

Record a journal entry:

```bash
curl -X POST http://localhost:3000/api/journal \
  -H "Content-Type: application/json" \
  -d "{\"symbol\":\"PLTR\",\"entryPrice\":20,\"exitPrice\":25,\"quantity\":10,\"thesis\":\"Breakout above resistance\",\"strategyTag\":\"breakout\"}"
```

List journal entries:

```bash
curl http://localhost:3000/api/journal
```

View performance:

```bash
curl http://localhost:3000/api/journal/performance
```

Get account info:

```bash
curl http://localhost:3000/api/account
```

## Configuration

See `.env.example`:

- `MARKET_DATA_PROVIDER=mock` — swap to `finnhub` when implemented
- `AI_PROVIDER=stub` — swap to `openai` when implemented
- `BROKERAGE_PROVIDER=stub` — swap to `robinhood` when MCP adapter is added
- `TRADING_ENABLED=false` — order execution disabled by default

## Testing

```bash
npm test
```

## Deferred

- React frontend (`src/interfaces/web/`)
- OpenAI adapter for real AI analysis
- Finnhub / Polygon / Alpha Vantage market data adapters
- Robinhood MCP brokerage adapter (`https://agent.robinhood.com/mcp/trading`)
- V2 conversational mentor workflow
