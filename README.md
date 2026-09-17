# SchemeSaathi

SchemeSaathi is a modern, AI-powered platform designed to help citizens effortlessly discover, verify, and apply for government welfare schemes. We've replaced confusing government portals with a beautifully designed, friendly, and highly intuitive experience.

## ✨ Key Features

- **AI Scheme Discovery Chat**: Have a guided, natural conversation with our intelligent assistant. Just tell us about yourself, and get personalized scheme recommendations instantly.
- **Instant DigiLocker Match**: Connect your DigiLocker for one-click verification. We automatically fetch your verified details and match you with eligible schemes—no questions asked.
- **Quick-Match Wizard**: Short on time? Use our lightning-fast, 3-step wizard to find schemes based on your age, occupation, and state in under 30 seconds.
- **Organic Vector Aesthetic**: A highly custom, friendly, and accessible user interface. Featuring a soothing cream background, vibrant floating "cloud" scheme elements, and beautiful typography (Nunito & Quicksand).

## 🛠 Tech Stack

- **Framework**: Next.js (App Router)
- **Library**: React
- **Styling**: Tailwind CSS + Custom Organic Vector CSS animations
- **Icons**: Lucide React
- **Typography**: Google Fonts (Nunito, Quicksand)

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Manav-jit/SE_Project.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

## 📁 Project Structure
- `/src/app`: Next.js App Router pages (Chat, Wizard, Dashboard, Categories)
- `/src/components`: Reusable React components (Cards, Modals, Chat Interface)
- `/src/lib`: Core logic (AI prompts, RAG embeddings, PDF generation)
- `/data/schemes`: JSON data containing detailed scheme eligibility and benefits
- `/diagrams`: Draw.io architectural diagrams and Use Case templates
