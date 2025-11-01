# ANMC Digital - DynamoDB Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ANMC Digital Application                          │
│                     (React Frontend + Node.js Backend)                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ AWS SDK
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          AWS DynamoDB Service                            │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                      Content Tables                             │   │
│  │                                                                 │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │   │
│  │  │  News/Blog   │  │    Events    │  │   Projects   │        │   │
│  │  │              │  │              │  │              │        │   │
│  │  │  Items: 6    │  │  Items: 2    │  │  Items: 4    │        │   │
│  │  │  GSIs: 3     │  │  GSIs: 3     │  │  GSIs: 4     │        │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘        │   │
│  │                                                                 │   │
│  │  Features:                                                      │   │
│  │  • Slug-based lookups                                          │   │
│  │  • Category filtering                                          │   │
│  │  • Featured content queries                                    │   │
│  │  • Date-based sorting                                          │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                   Organization Tables                           │   │
│  │                                                                 │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │   │
│  │  │   About Us   │  │   Contact    │  │ Master Plan  │        │   │
│  │  │              │  │              │  │              │        │   │
│  │  │  Items: 1    │  │  Items: 1    │  │  Items: 1    │        │   │
│  │  │  GSIs: 0     │  │  GSIs: 0     │  │  GSIs: 0     │        │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘        │   │
│  │                                                                 │   │
│  │  ┌──────────────┐  ┌──────────────────────────────┐           │   │
│  │  │  Facilities  │  │  Project Achievements        │           │   │
│  │  │              │  │                              │           │   │
│  │  │  Items: 4    │  │  Items: 10                   │           │   │
│  │  │  GSIs: 0     │  │  GSIs: 1 (CategoryYear)      │           │   │
│  │  └──────────────┘  └──────────────────────────────┘           │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                     Website Tables                              │   │
│  │                                                                 │   │
│  │  ┌──────────────┐  ┌──────────────┐                           │   │
│  │  │   Homepage   │  │   Counters   │                           │   │
│  │  │              │  │              │                           │   │
│  │  │  Items: 1    │  │  Items: 4    │                           │   │
│  │  │  GSIs: 1     │  │  GSIs: 0     │                           │   │
│  │  └──────────────┘  └──────────────┘                           │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌──────────────┐
│   Browser    │
│   (React)    │
└──────────────┘
       │
       │ HTTPS
       ▼
┌──────────────────────────────────────────────────────────┐
│              Backend API (Node.js/Express)                │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │           AWS SDK DynamoDB Client               │    │
│  │                                                  │    │
│  │  • getItem()      • query()                     │    │
│  │  • putItem()      • scan()                      │    │
│  │  • updateItem()   • batchWriteItem()            │    │
│  │  • deleteItem()   • batchGetItem()              │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
       │
       │ AWS API
       ▼
┌──────────────────────────────────────────────────────────┐
│                   Amazon DynamoDB                         │
│                                                           │
│  ┌────────────────┐  ┌────────────────┐                 │
│  │  Base Tables   │  │      GSIs      │                 │
│  │                │  │                │                 │
│  │  • Hash Key    │  │  • Hash Key    │                 │
│  │  • Range Key   │  │  • Range Key   │                 │
│  │  • Attributes  │  │  • Projection  │                 │
│  └────────────────┘  └────────────────┘                 │
│                                                           │
│  ┌────────────────────────────────────────────┐         │
│  │         Storage & Indexing Engine           │         │
│  │                                              │         │
│  │  • Partition Management                     │         │
│  │  • Auto-scaling                             │         │
│  │  • Replication                              │         │
│  └────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────┘
       │
       │ Monitoring
       ▼
┌──────────────────────────────────────────────────────────┐
│              AWS CloudWatch Monitoring                    │
│                                                           │
│  • Read/Write Capacity Units                             │
│  • Request Latency                                       │
│  • Throttled Requests                                    │
│  • User Errors                                           │
└──────────────────────────────────────────────────────────┘
```

## Table Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      News Table                              │
│  PK: id                                                      │
│  ┌─────────────────────────────────────────────────┐       │
│  │ GSI: SlugIndex           (slug)                 │       │
│  │ GSI: CategoryDateIndex   (category+publishedAt) │       │
│  │ GSI: FeaturedIndex       (featured+publishedAt) │       │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
│  Data: 6 articles                                           │
│  - Dashain Celebration                                      │
│  - New Community Programs                                   │
│  - Youth Leadership Program                                 │
│  - Community Garden Milestone                               │
│  - School Partnership Expansion                             │
│  - Tihar Festival                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Events Table                             │
│  PK: id                                                      │
│  ┌─────────────────────────────────────────────────┐       │
│  │ GSI: SlugIndex           (slug)                 │       │
│  │ GSI: StatusDateIndex     (status+startDate)     │       │
│  │ GSI: CategoryDateIndex   (category+startDate)   │       │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
│  Data: 2 events                                             │
│  - Community Picnic 2025                                    │
│  - Cultural Dance Workshop                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Projects Table                            │
│  PK: id                                                      │
│  ┌─────────────────────────────────────────────────┐       │
│  │ GSI: SlugIndex      (slug)                      │       │
│  │ GSI: StatusIndex    (status)                    │       │
│  │ GSI: CategoryIndex  (category)                  │       │
│  │ GSI: FeaturedIndex  (featured)                  │       │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
│  Data: 4 projects                                           │
│  - Community Garden Initiative                              │
│  - Youth Leadership Program                                 │
│  - Cultural Heritage Center                                 │
│  - Wellness and Sports Complex                              │
└─────────────────────────────────────────────────────────────┘

┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  Facilities    │  │   Homepage     │  │   Counters     │
│  PK: id        │  │   PK: id       │  │   PK: id       │
│                │  │   GSI: comp.   │  │                │
│  4 facilities  │  │   1 hero       │  │   4 stats      │
└────────────────┘  └────────────────┘  └────────────────┘

┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   About Us     │  │    Contact     │  │  Master Plan   │
│   PK: id       │  │    PK: id      │  │    PK: id      │
│                │  │                │  │                │
│   1 record     │  │   1 record     │  │   1 plan       │
│   6 members    │  │                │  │   5 areas      │
└────────────────┘  └────────────────┘  └────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Project Achievements Table                      │
│  PK: year                                                    │
│  ┌─────────────────────────────────────────────────┐       │
│  │ GSI: CategoryIndex  (category+year)             │       │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
│  Data: 10 achievements (1998-2024)                          │
└─────────────────────────────────────────────────────────────┘
```

## Access Pattern Matrix

| Use Case | Table | Index | Query Type |
|----------|-------|-------|------------|
| Get article by ID | News | Primary | GetItem |
| Get article by slug | News | SlugIndex | Query |
| List featured articles | News | FeaturedIndex | Query |
| List articles by category | News | CategoryDateIndex | Query |
| Get event by ID | Events | Primary | GetItem |
| Get event by slug | Events | SlugIndex | Query |
| List upcoming events | Events | StatusDateIndex | Query |
| List events by category | Events | CategoryDateIndex | Query |
| Get project by ID | Projects | Primary | GetItem |
| Get project by slug | Projects | SlugIndex | Query |
| List active projects | Projects | StatusIndex | Query |
| List featured projects | Projects | FeaturedIndex | Query |
| Get facility info | Facilities | Primary | GetItem |
| List all facilities | Facilities | - | Scan |
| Get homepage hero | Homepage | Primary | GetItem |
| Get all counters | Counters | - | Scan |
| Get about us | About Us | Primary | GetItem |
| Get contact info | Contact | Primary | GetItem |
| Get master plan | Master Plan | Primary | GetItem |
| Get achievement by year | Achievements | Primary | GetItem |
| List achievements by cat | Achievements | CategoryIndex | Query |

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Development Workflow                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌─────────────────────────────────────┐
        │  CloudFormation Template (YAML)     │
        │  dynamodb-tables-updated.yml        │
        └─────────────────────────────────────┘
                           │
                           ▼
        ┌─────────────────────────────────────┐
        │    AWS CloudFormation Service       │
        │  • Stack Creation                   │
        │  • Resource Provisioning            │
        │  • Dependency Management            │
        └─────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Development  │  │   Staging    │  │  Production  │
│              │  │              │  │              │
│ anmc-*-dev   │  │ anmc-*-stage │  │ anmc-*-prod  │
│              │  │              │  │              │
│ • Testing    │  │ • QA Testing │  │ • Live Data  │
│ • Dev Data   │  │ • UAT        │  │ • Backups    │
│ • No Backups │  │ • Monitoring │  │ • PITR       │
└──────────────┘  └──────────────┘  └──────────────┘
                           │
                           ▼
        ┌─────────────────────────────────────┐
        │      Monitoring & Alerting          │
        │  • CloudWatch Metrics               │
        │  • SNS Notifications                │
        │  • Cost Alerts                      │
        └─────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Layers                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Network Security                                  │
│  ┌────────────────────────────────────────────┐            │
│  │ • VPC Endpoints (optional)                 │            │
│  │ • Security Groups                          │            │
│  │ • NACLs                                    │            │
│  └────────────────────────────────────────────┘            │
│                                                              │
│  Layer 2: IAM Access Control                                │
│  ┌────────────────────────────────────────────┐            │
│  │ • IAM Roles                                │            │
│  │ • IAM Policies                             │            │
│  │ • Resource-based Policies                  │            │
│  │ • Least Privilege Access                   │            │
│  └────────────────────────────────────────────┘            │
│                                                              │
│  Layer 3: Data Encryption                                   │
│  ┌────────────────────────────────────────────┐            │
│  │ • Encryption at Rest (AWS KMS)             │            │
│  │ • Encryption in Transit (TLS/HTTPS)        │            │
│  └────────────────────────────────────────────┘            │
│                                                              │
│  Layer 4: Audit & Compliance                                │
│  ┌────────────────────────────────────────────┐            │
│  │ • CloudTrail Logging                       │            │
│  │ • DynamoDB Streams                         │            │
│  │ • Access Logging                           │            │
│  └────────────────────────────────────────────┘            │
│                                                              │
│  Layer 5: Backup & Recovery                                 │
│  ┌────────────────────────────────────────────┐            │
│  │ • Point-in-Time Recovery (PITR)            │            │
│  │ • On-Demand Backups                        │            │
│  │ • Cross-Region Replication                 │            │
│  └────────────────────────────────────────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                  Performance Strategies                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Query Optimization                                       │
│     • Use GSIs instead of Scans                             │
│     • Limit result sets                                     │
│     • Use consistent reads only when needed                 │
│                                                              │
│  2. Caching Layer                                            │
│     ┌────────────────────────────────────┐                 │
│     │  Application → ElastiCache/Redis   │                 │
│     │             ↓                      │                 │
│     │           DynamoDB                 │                 │
│     └────────────────────────────────────┘                 │
│                                                              │
│  3. Batch Operations                                         │
│     • BatchGetItem (up to 100 items)                        │
│     • BatchWriteItem (up to 25 items)                       │
│     • Parallel queries across partitions                    │
│                                                              │
│  4. Connection Pooling                                       │
│     • Reuse SDK client instances                            │
│     • Configure appropriate timeouts                        │
│     • Implement retry logic with backoff                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Cost Optimization Strategy

```
Pay-per-Request Billing (ap-southeast-2 - Sydney)
├── Read Request Units (RRUs)
│   └── $0.285 per million reads
├── Write Request Units (WRUs)
│   └── $1.4275 per million writes
└── Storage
    └── $0.285 per GB-month

Development Environment
├── ~10,000 reads/month   = $0.00285
├── ~1,000 writes/month   = $0.00143
└── <1 GB storage         = $0.285
    Total: ~$4-5/month

Production Environment (Projected)
├── ~1M reads/month       = $0.285
├── ~100K writes/month    = $0.143
├── ~10 GB storage        = $2.85
├── PITR enabled          = ~$2.00
└── Backups (30 days)     = ~$3.00
    Total: ~$50-100/month
```

---

**Architecture Version**: 1.0
**Last Updated**: 2025
**Status**: Production Ready
