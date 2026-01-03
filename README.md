<img width="2376" height="594" alt="banner" src="https://github.com/user-attachments/assets/7c9cd937-1dfb-402f-8802-b36e015cb0d2" />

<br><br>

Dokistry is an open-source tool to preview and manage Docker registries, images, and users from a single interface.

## ✨ Features
- Preview and manage Docker registries
- View image and tag sizes and disk usage
- Inspect tags on each registry
- Delete images or tags
- Manage multiple registries from one instance
- Add and manage users (admin privileges required)

<br>

## 🚀 Getting Started

Make sure you have Docker and Docker Compose installed. Then:

```bash
git clone https://github.com/duneal/dokistry.git
cd dokistry
```

### Option 1: Quick Start (Development)

For development, create a `.env` file based on `.env.dev.example`:

```bash
cp .env.dev.example .env
docker compose watch
```

### Option 2: Production Setup

For production, create a `.env` file based on `.env.prod.example`:

```bash
cp .env.prod.example .env
docker compose -f docker-compose.prod.yml up -d
```

**Note:** The production compose file now includes default values for PostgreSQL (for testing purposes). For production deployments, always set secure values in your `.env` file.

Your application will be available at http://localhost:3000.

<br>

## 🤝 Contributing

Check out the Contributing Guide for more information.

<br>

## 👀 Preview

<img width="4904" height="3283" alt="screenshot-dashboard" src="https://github.com/user-attachments/assets/45474515-966f-4905-81ad-fd282e4ee51c" />