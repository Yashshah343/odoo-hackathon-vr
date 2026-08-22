# 🌍 GlobeTrotter
> **Empowering Personalized Travel Planning**

GlobeTrotter is an intelligent, personalized, and collaborative platform that transforms the way individuals plan and experience travel. Built for the Hackathon, this application empowers users to dream, design, and organize multi-city trips with an interactive itinerary builder, real-time budget tracking, and community sharing.

## ✨ Key Features
- **Interactive Itinerary Builder:** Drag-and-drop interface to effortlessly manage travel stops, hotels, and activities.
- **Smart Budget Tracking:** Automated cost breakdowns with visual charts to ensure you stay within budget.
- **Community Discovery:** Share your public itineraries and discover inspiration from other travelers.
- **Admin Analytics Dashboard:** Powerful insights tracking user trends, popular cities, and global activities.

## 🛠 Tech Stack
This project is built using a modern, high-performance web stack:
- **Frontend:** React.js (Vite), Tailwind CSS, Zustand, Recharts, `dnd-kit`
- **Backend:** Python FastAPI, Pydantic, JWT Auth
- **Database:** MongoDB (NoSQL for flexible document storage)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MongoDB (Local or Atlas URI)

### Installation
**1. Clone the repository**
```bash
git clone https://github.com/your-username/globetrotter.git
cd globetrotter
```

**2. Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**3. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
