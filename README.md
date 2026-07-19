# ResumeATS Pro

An AI-powered resume builder and ATS optimization platform that helps students, graduates, and job seekers create professional resumes tailored to specific job descriptions.

---

## Live Demo

**Application:** https://zingy-zuccutto-be576c.netlify.app/

## GitHub Repository

**Repository:** https://github.com/aabdullahhtar-create/Resume-ATS-Pro

---

# Problem Statement

Many job seekers struggle to create resumes that effectively showcase their skills while also passing Applicant Tracking Systems (ATS). Generic resume templates often fail to highlight relevant keywords, making it difficult for candidates to receive interview opportunities. Professional resume writing services can also be expensive and inaccessible to many students and early-career professionals.

ResumeATS Pro addresses this problem by providing an intelligent platform where users can build, customize, optimize, and export ATS-friendly resumes with the assistance of Artificial Intelligence.

---

# Target Users

* Students
* Fresh graduates
* Internship applicants
* Job seekers
* Career changers
* Professionals applying for multiple positions

---

# Features

ResumeATS Pro includes the following features:

* Secure user authentication
* User registration and login
* Resume dashboard
* Create multiple resumes
* Edit existing resumes
* Delete resumes
* Resume templates
* Live resume preview
* Resume PDF export
* ATS Resume Checker
* AI Resume Generator
* Voice Resume Assistant
* Resume upload
* Job description analysis
* ATS keyword matching
* Resume improvement suggestions
* Responsive mobile-friendly interface
* Cloud database storage

---

# AI Feature

## AI Resume Generator & ATS Assistant

The application contains an AI-powered Resume Generator and ATS Assistant that helps users improve resume quality according to a target job description.

The AI can:

* Generate professional summaries
* Improve experience bullet points
* Analyze job descriptions
* Identify important ATS keywords
* Recommend missing skills
* Suggest improvements to increase ATS compatibility

The AI does not intentionally invent qualifications or work experience and instead improves the information supplied by the user.

---

# AI Instructions (System Prompt)

The application uses custom instructions for the AI model.

```text
You are an expert resume writing assistant and ATS optimization specialist.

Your responsibility is to help users create professional resumes while remaining truthful.

Rules:

• Never invent jobs, employers, education, certifications, skills, or achievements.
• Improve wording using professional language.
• Use strong action verbs.
• Optimize resumes for Applicant Tracking Systems.
• Match relevant keywords from the provided job description only when supported by the user's experience.
• Keep writing concise and professional.
• Return structured, easy-to-read content.
• Recommend improvements whenever information is missing.
```

---

# Technologies Used

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

## Backend

* Next.js API Routes
* Node.js

## Database

* Prisma ORM
* PostgreSQL (Neon)

## Authentication

* Google OAuth
* Custom Authentication

## Artificial Intelligence

* Google Gemini API

## Deployment

* GitHub
* Netlify

---

# Project Structure

```text
Resume-ATS-Pro
│
├── src/
├── prisma/
├── public/
├── scripts/
├── mobile-fallback/
├── package.json
├── README.md
└── .env.example
```

# How to Run the Project

## Prerequisites

Install:

* Node.js (18+)
* npm
* PostgreSQL database (or Neon)
* Google Gemini API Key

---

## Clone the Repository

```bash
git clone https://github.com/aabdullahhtar-create/Resume-ATS-Pro.git
```

---

## Navigate to the Project

```bash
cd Resume-ATS-Pro
```

---

## Install Dependencies

```bash
npm install
```

---

## Create Environment Variables

Create a file named:

```text
.env.local
```

Add the required variables:

```env
DATABASE_URL=
GEMINI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

---

## Run the Application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Environment Variables

Sensitive credentials are **not** included in this repository.

A `.env.example` file is provided to demonstrate the required configuration.

---

# Future Improvements

* More resume templates
* Cover letter generation
* LinkedIn profile optimization
* Interview preparation assistant
* AI grammar analysis
* Resume version history
* Recruiter feedback system
* Multi-language resume support

---

# Author

**Abdullah Akhtar**

GitHub: https://github.com/aabdullahhtar-create

---

# License

This project was developed as an individual academic project for educational purposes.
