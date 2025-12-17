# Influxity.ai File Index

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview and quick start guide |
| `IONOS_DEPLOYMENT_GUIDE.md` | Complete step-by-step deployment guide for IONOS VPS |
| `DEPLOYMENT_CHECKLIST.md` | Printable checklist for tracking deployment progress |
| `TESTING_ENVIRONMENT_SETUP.md` | How to set up local testing environment |
| `API_DOCUMENTATION.md` | Complete API reference for all endpoints |
| `USER_MANUAL.md` | End-user documentation and feature guides |
| `STREAMING_IMPLEMENTATION.md` | Guide for implementing frontend streaming |
| `100_PERCENT_ACHIEVEMENT.md` | Report of achieving 100% AI capabilities |
| `PERFORMANCE_FIXES_COMPLETE.md` | Summary of all performance improvements |
| `FIXES_APPLIED.md` | Changelog of all fixes applied |
| `FIXES_SUMMARY.md` | Quick reference of fixes |
| `FRESH_TEST_REPORT.md` | Latest comprehensive test results |
| `AI_EFFICIENCY_REPORT.md` | Detailed AI and performance analysis |
| `FINAL_COMPLETION_REPORT.md` | Final mission completion report |
| `FILE_INDEX.md` | This file - index of all files |

## 🛠️ Scripts

| File | Purpose |
|------|---------|
| `deploy.sh` | Automated deployment script for updates |
| `scripts/setup-monitoring.sh` | Configure PM2 monitoring and health checks |
| `scripts/backup-database.sh` | Automated database backup (30-day retention) |
| `scripts/restore-database.sh` | Interactive database restore from backup |
| `scripts/health-check.sh` | Automated health check (runs every 5 min) |

## 🧪 Test Scripts

| File | Purpose |
|------|---------|
| `ai-capabilities-test.ts` | Comprehensive AI features analysis |
| `comprehensive-analysis.ts` | Complete static code analysis |
| `security-audit.ts` | Security vulnerability scanning |
| `performance-benchmark.ts` | Performance testing and benchmarks |
| `integration-tests.ts` | Integration testing suite |
| `performance-tests.ts` | Load and performance testing |

## 📦 Configuration Files

| File | Purpose |
|------|---------|
| `.env.example` | Template for environment variables |
| `vite.config.ts` | Vite build configuration (with optimizations) |
| `package.json` | Dependencies and scripts |
| `drizzle.config.ts` | Database ORM configuration |
| `tsconfig.json` | TypeScript configuration |

## 🎯 Key Directories

| Directory | Contents |
|-----------|----------|
| `server/` | Backend API code |
| `client/` | Frontend React application |
| `drizzle/` | Database schema and migrations |
| `scripts/` | Production utility scripts |
| `dist/` | Compiled production build |
| `test-artifacts/` | Test results and reports |

## 🚀 Quick Reference

### To Deploy
```bash
# Follow IONOS_DEPLOYMENT_GUIDE.md
```

### To Update After Deployment
```bash
./deploy.sh
```

### To Backup Database
```bash
./scripts/backup-database.sh
```

### To Restore Database
```bash
./scripts/restore-database.sh ~/influxity.ai/backups/influxity_backup_YYYYMMDD_HHMMSS.sql.gz
```

### To Check Health
```bash
./scripts/health-check.sh
```

### To Monitor
```bash
pm2 monit
```
