# 🛰️ Sentinel Eye - Land-Use Change Detection System

<div align="center">

![Sentinel Eye](https://img.shields.io/badge/Status-Production-success)
![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)
![AWS](https://img.shields.io/badge/AWS-Serverless-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

**AI-Powered Satellite Imagery Analysis for Rondônia, Brazil**

[Live Demo](https://sentinel-eye-psi.vercel.app/) · [Report Bug](https://github.com/yourusername/sentinel-eye/issues) · [Request Feature](https://github.com/yourusername/sentinel-eye/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌍 Overview

**Sentinel Eye** is a cloud-native land-use change detection system designed to monitor deforestation, urban expansion, and illegal encroachment in Rondônia, Brazil using multi-temporal satellite imagery analysis.

### Problem Statement

Rondônia has experienced **massive deforestation** over the past decades, losing approximately **34% of its forest cover**. Monitoring these changes manually is time-consuming, expensive, and often delayed. Sentinel Eye provides:

- ✅ **Automated change detection** from Sentinel-2 satellite imagery
- ✅ **Near real-time monitoring** with 5-day revisit cycles
- ✅ **Quantitative analysis** of affected areas (km²)
- ✅ **Geospatial visualization** with interactive maps
- ✅ **Downloadable datasets** for further analysis

### Key Capabilities

| Feature | Description |
|---------|-------------|
| 🌲 **Deforestation Detection** | Identifies forest loss using NDVI thresholds and spectral analysis |
| 🏙️ **Urban Expansion Tracking** | Monitors city growth using NDBI and built-up area algorithms |
| ⚠️ **Encroachment Alerts** | Detects illegal activity in protected areas and conservation zones |
| 📊 **Statistical Analysis** | Provides area calculations, change counts, and severity metrics |
| 🗺️ **Interactive Maps** | Leaflet-based visualization with satellite basemaps and overlays |
| 📥 **Data Export** | Download GeoTIFF, GeoJSON, and summary reports |

---

## ✨ Features

### Core Functionality

#### 1. Analysis Submission
- **Interactive map-based coordinate selection** (click to set lat/lon)
- **Date range picker** (2020-2024)
- **Multi-type change detection** (deforestation, urban, encroachment)
- **Real-time validation** and feedback

#### 2. Real-Time Processing
- **Job queue system** with automatic status polling
- **Progress tracking** (0-100% completion)
- **Live updates** every 5 seconds
- **Processing time estimates** (~5-10 minutes per analysis)

#### 3. Results Visualization
- **Statistics dashboard**
  - Total area changed (km²)
  - Breakdown by change type
  - Number of detected changes
  - Severity indicators
  
- **Interactive map**
  - Satellite basemap (ESRI World Imagery)
  - Color-coded change overlays
  - Clickable markers with details
  - Map legend
  
- **Change details table**
  - Top changes by area
  - Coordinates and type
  - Sortable columns

#### 4. Data Management
- **Job history** stored in localStorage
- **Recent jobs** quick access on dashboard
- **Data logs** with filtering and search
- **Alert generation** from high-severity changes

#### 5. Downloads
- **GeoTIFF files** (georeferenced rasters)
- **GeoJSON** (vector change polygons)
- **Summary JSON** (complete metadata)
- **Presigned S3 URLs** (60-minute expiry)

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework with App Router | 16.1.4 |
| **TypeScript** | Type-safe development | 5.x |
| **Tailwind CSS** | Utility-first styling | 3.x |
| **Shadcn/ui** | Component library | Latest |
| **Leaflet.js** | Interactive maps | 1.9.4 |
| **React Leaflet** | React wrapper for Leaflet | 4.x |
| **Axios** | HTTP client | 1.x |
| **Lucide React** | Icon library | Latest |

### Backend

| Technology | Purpose |
|------------|---------|
| **AWS Lambda** | Serverless compute |
| **API Gateway** | RESTful API endpoints |
| **DynamoDB** | Job status and metadata storage |
| **S3** | Result file storage (GeoTIFF, GeoJSON) |
| **EC2** | Satellite imagery processing (GDAL, Python) |
| **CloudWatch** | Logging and monitoring |

### Deployment

| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting (Next.js) |
| **AWS** | Backend infrastructure |
| **GitHub** | Version control |

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (Next.js App on Vercel)                      │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Analysis    │  │  Dashboard   │  │  Results     │        │
│  │  Submission  │  │  Overview    │  │  Display     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS API GATEWAY                            │
│                   /dev/api/* endpoints                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │   POST   │  │   GET    │  │   GET    │
         │ /analyze │  │ /status  │  │ /results │
         └──────────┘  └──────────┘  └──────────┘
                │             │             │
                ▼             ▼             ▼
         ┌─────────────────────────────────────┐
         │        AWS Lambda Functions         │
         │  (Create job, Check status, Fetch)  │
         └─────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │ DynamoDB │  │    EC2   │  │    S3    │
         │  (Jobs)  │  │(Process) │  │ (Files)  │
         └──────────┘  └──────────┘  └──────────┘
```

### Data Flow

1. **User submits analysis** → Frontend sends coordinates + date range to `/api/analyze`
2. **Job created** → Lambda saves job to DynamoDB with status "QUEUED"
3. **Processing begins** → EC2 worker fetches Sentinel-2 imagery and runs change detection
4. **Status updates** → Frontend polls `/api/status/{job_id}` every 5 seconds
5. **Results ready** → EC2 uploads GeoTIFF/GeoJSON to S3, updates DynamoDB to "COMPLETED"
6. **Frontend displays** → Fetches results from `/api/results/{job_id}` and renders statistics + map

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **AWS Account** (for backend)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sentinel-eye.git
   cd sentinel-eye
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```bash
   NEXT_PUBLIC_API_URL=https://3y53hcmnt8.execute-api.us-west-2.amazonaws.com/dev/api
   NEXT_PUBLIC_AWS_API_BASE=https://3y53hcmnt8.execute-api.us-west-2.amazonaws.com/dev/api
   NEXT_PUBLIC_ESRI_SATELLITE_URL=https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
   NEXT_PUBLIC_USE_MOCK_DATA=false
   NEXT_PUBLIC_ENABLE_LOCAL_SCAN_HISTORY=true
   AWS_REGION=us-west-2
   AWS_S3_BUCKET=landuse-rondonia-data-dev
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage Guide

### Submitting an Analysis

1. **Navigate to Analysis page** (`/analysis`)

2. **Select coordinates**
   - Click anywhere on the map, OR
   - Manually enter latitude and longitude

3. **Choose date range**
   - Start year: 2020-2023
   - End year: 2021-2024
   - Recommended: 1-4 year range

4. **Select change types**
   - ☑️ Deforestation
   - ☑️ Urban Expansion
   - ☑️ Encroachment

5. **Submit** and wait for processing (~5-10 minutes)

### Viewing Results

After completion, you'll see:

- **Analysis Summary** (location, time period, processing time)
- **Statistics Cards** (total area, deforestation, urban, encroachment)
- **Interactive Map** (satellite basemap with colored change overlays)
- **Top Changes Table** (sorted by area)
- **Downloads** (GeoTIFF, GeoJSON, Summary JSON)

### Dashboard

Access at `/dashboard`:
- Recent jobs with quick access
- Statistics overview
- Alert preview

---

## 📡 API Documentation

### Base URL
```
https://3y53hcmnt8.execute-api.us-west-2.amazonaws.com/dev/api
```

### Endpoints

#### POST `/analyze`

**Request:**
```json
{
  "coordinates": { "lat": -10.0, "lon": -63.0 },
  "start_year": 2021,
  "end_year": 2024,
  "change_types": ["deforestation", "urban_expansion"]
}
```

**Response:**
```json
{
  "job_id": "d5507ea1-1ff9-46f9-9575-c994299fcaa5",
  "status": "QUEUED",
  "message": "Analysis job created successfully"
}
```

#### GET `/status/{job_id}`

**Response:**
```json
{
  "job_id": "...",
  "status": "PROCESSING",
  "progress": 45,
  "message": "Processing satellite imagery..."
}
```

Status: `QUEUED` | `PROCESSING` | `COMPLETED` | `FAILED`

#### GET `/results/{job_id}`

**Response:**
```json
{
  "job_id": "...",
  "status": "COMPLETED",
  "coordinates": { "lat": -10.0, "lon": -63.0 },
  "statistics": {
    "deforestation_area_km2": 139.78,
    "urban_expansion_km2": 210.40
  },
  "total_changes": 2,
  "top_changes": [...],
  "files": {
    "deforestation_map.tif": "https://s3.amazonaws.com/...",
    "summary.json": "https://s3.amazonaws.com/..."
  }
}
```

---

## 🚢 Deployment

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy via Vercel dashboard

**Live URL:** [https://sentinel-eye-psi.vercel.app/](https://sentinel-eye-psi.vercel.app/)

### Backend (AWS)

1. Deploy Lambda functions
2. Configure API Gateway with CORS
3. Set up DynamoDB table
4. Create S3 bucket
5. Deploy EC2 processing worker

---

## 📁 Project Structure

```
sentinel-eye/
├── src/
│   ├── app/
│   │   ├── analysis/          # Analysis submission
│   │   ├── scan-result/       # Results display
│   │   ├── dashboard/         # Overview
│   │   ├── data-logs/         # Job history
│   │   └── api/               # API proxy routes
│   ├── components/
│   │   ├── ui/                # Shadcn/ui components
│   │   └── layout/
│   ├── lib/
│   │   ├── api/               # API clients
│   │   └── utils/
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript types
├── .env.local
├── next.config.ts
└── package.json
```

---

## 🤝 Contributing

We welcome contributions!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 🐛 Known Issues

1. **Processing Queue**: Jobs may stick in QUEUED if backend worker isn't running
2. **File Expiry**: Download URLs expire after 60 minutes
3. **Coordinate Precision**: Single-point analysis (not polygon AOI)

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

## 👥 Team

**Frontend Development:**
- Aditya Pamar - [@adityapamar](https://github.com/adityapamar)
  - Email: 

**Backend Development:**
- AWS infrastructure, Lambda, EC2 processing

---

## 🙏 Acknowledgments

- **Sentinel-2** - ESA for satellite imagery
- **AWS** - Cloud infrastructure
- **Vercel** - Frontend hosting
- **Shadcn/ui** - Component library
- **Leaflet** - Mapping library


<div align="center">

**Made with ❤️ by the Sentinel Eye Team**

[Website](https://sentinel-eye-psi.vercel.app/) · [Documentation](docs/) · [Contributing](CONTRIBUTING.md)

</div>