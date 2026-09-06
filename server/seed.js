/**
 * Rize Sample Data Seeder
 * ─────────────────────────────────────────────────────────────────────────
 * Creates realistic Indian startup / MNC placement data for testing.
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User.model');
const Student = require('./models/Student.model');
const Company = require('./models/Company.model');
const PlacementDrive = require('./models/PlacementDrive.model');
const Application = require('./models/Application.model');
const Interview = require('./models/Interview.model');
const Notification = require('./models/Notification.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rize';

// ─── Company logos via local high-res vector SVGs ──────────────────────────
const COMPANIES = [
  {
    name: 'Google India',
    email: 'campus@google.co.in',
    industry: 'Technology / Cloud',
    website: 'https://careers.google.com',
    logoUrl: '/logos/google.svg',
    location: 'Bengaluru, Hyderabad',
    description: `Google LLC is an American multinational technology company focusing on AI, Search, Cloud, and Workspace products. Google India operates its largest engineering centre outside the US in Bengaluru and Hyderabad, working on core Search infrastructure, Maps, Pay, and Cloud solutions tailored for the Indian market and global scale.`,
  },
  {
    name: 'Microsoft India',
    email: 'campus@microsoft.com',
    industry: 'Technology / Cloud',
    website: 'https://careers.microsoft.com',
    logoUrl: '/logos/microsoft.svg',
    location: 'Hyderabad, Bengaluru, Noida',
    description: `Microsoft India Development Center (MSIDC) in Hyderabad is one of Microsoft's largest R&D hubs globally. Teams here build Azure, Office 365, Visual Studio, and Bing. Microsoft India is consistently ranked among India's top employers and offers an unparalleled engineering culture.`,
  },
  {
    name: 'Razorpay',
    email: 'campus@razorpay.com',
    industry: 'FinTech / Payments',
    website: 'https://razorpay.com/jobs',
    logoUrl: '/logos/razorpay.svg',
    location: 'Bengaluru',
    description: `Razorpay is India's leading full-stack financial solutions company, trusted by 10 million+ businesses. We're building the future of money movement — from payment gateways and banking (RazorpayX) to capital lending and payroll. Our engineering teams solve payments infrastructure problems at massive Indian scale.`,
  },
  {
    name: 'Zerodha',
    email: 'campus@zerodha.com',
    industry: 'FinTech / Stock Broking',
    website: 'https://zerodha.com/careers',
    logoUrl: '/logos/zerodha.svg',
    location: 'Bengaluru',
    description: `Zerodha is India's largest stock broker with 10 million+ active clients and a bootstrapped unicorn. We build Kite, Console, Coin, and Streak — products that democratize investing for India. Our small, highly-skilled engineering team tackles real-time financial data at enormous scale without VC pressure.`,
  },
  {
    name: 'CRED',
    email: 'campus@cred.club',
    industry: 'FinTech / Credit',
    website: 'https://cred.club/jobs',
    logoUrl: '/logos/cred.svg',
    location: 'Bengaluru',
    description: `CRED is a members-only credit card bill payment platform that rewards responsible financial behavior. With 12 million+ premium members and $6.4B valuation, CRED is redefining India's credit ecosystem. We hire exceptionally talented generalists who can think from first principles.`,
  },
  {
    name: 'PhonePe',
    email: 'campus@phonepe.com',
    industry: 'FinTech / UPI Payments',
    website: 'https://phonepe.com/en/careers',
    logoUrl: '/logos/phonepe.svg',
    location: 'Bengaluru, Pune',
    description: `PhonePe is India's leading UPI-based digital payments platform with 500 million+ registered users and 37% market share in UPI transactions. A Walmart-owned company, we process billions of transactions annually. Our engineering teams work on payments infrastructure, financial services, and the Indus Appstore.`,
  },
  {
    name: 'Groww',
    email: 'campus@groww.in',
    industry: 'FinTech / Investments',
    website: 'https://groww.in/careers',
    logoUrl: '/logos/groww.svg',
    location: 'Bengaluru',
    description: `Groww is India's fastest-growing investment platform with 10 million+ users, offering stocks, mutual funds, gold, and more. We're building simple, transparent investment products for the next 500 million Indians. Our tech team is engineering systems that handle crores of transactions during market hours.`,
  },
  {
    name: 'Flipkart',
    email: 'campus@flipkart.com',
    industry: 'E-Commerce',
    website: 'https://careers.flipkart.com',
    logoUrl: '/logos/flipkart.svg',
    location: 'Bengaluru, Hyderabad, Chennai',
    description: `Flipkart is India's largest e-commerce marketplace (Walmart-owned), serving 500 million+ customers. Our engineering challenges span supply chain, search, recommendations, logistics, and payments. The Flipkart Internet private Ltd. campus in Bengaluru is one of the largest tech hubs in India.`,
  },
  {
    name: 'Atlassian',
    email: 'campus@atlassian.com',
    industry: 'Developer Tools / SaaS',
    website: 'https://www.atlassian.com/company/careers',
    logoUrl: '/logos/atlassian.svg',
    location: 'Bengaluru, Remote',
    description: `Atlassian makes collaboration software for teams — Jira, Confluence, Trello, Bitbucket, and more — used by 300,000+ customers globally. Our Bengaluru office is a full-fledged engineering hub where product, design, and engineering teams ship features used by millions of developers worldwide.`,
  },
  {
    name: 'BrowserStack',
    email: 'campus@browserstack.com',
    industry: 'Developer Tools / Testing',
    website: 'https://www.browserstack.com/careers',
    logoUrl: '/logos/browserstack.svg',
    location: 'Mumbai, Bengaluru, Remote',
    description: `BrowserStack is the world's leading software testing platform used by 50,000+ customers including Google, Microsoft, and Amazon. Born in Mumbai and bootstrapped to a $4B valuation, we help developers deliver software faster. Our Mumbai-Bengaluru engineering teams build cloud infrastructure, automation frameworks, and AI testing tools.`,
  },
  {
    name: 'Meesho',
    email: 'campus@meesho.com',
    industry: 'Social Commerce',
    website: 'https://meesho.io/careers',
    logoUrl: '/logos/meesho.svg',
    location: 'Bengaluru',
    description: `Meesho is India's fastest-growing e-commerce platform empowering 150 million+ small businesses and entrepreneurs, primarily in Tier-2/3 cities. With Y Combinator and Sequoia backing, Meesho is democratizing internet commerce. Our engineering teams solve unique challenges of serving India's next-billion users.`,
  },
  {
    name: 'Amazon India',
    email: 'campus@amazon.com',
    industry: 'E-Commerce / Cloud',
    website: 'https://amazon.jobs/en-gb/teams/india',
    logoUrl: '/logos/amazon.svg',
    location: 'Hyderabad, Bengaluru, Chennai, Pune',
    description: `Amazon's India development centers in Hyderabad and Bengaluru are among the largest outside the US. Teams here build AWS services, Alexa, Amazon.in, and Kindle across all engineering stacks. Amazon India is one of the top employers for IIT/NIT graduates and offers highly competitive compensation.`,
  },
  {
    name: 'FundingPips',
    email: 'campus@fundingpips.com',
    industry: 'FinTech / Proprietary Trading',
    website: 'https://fundingpips.com',
    logoUrl: '/logos/fundingpips.svg',
    location: 'Dubai / Bengaluru (Remote)',
    description: `FundingPips is a premier global proprietary trading firm offering simulated evaluation accounts and high-performance financial technology. Founded in Dubai in 2022, FundingPips empowers global traders with up to 100% profit splits, advanced algorithmic trading pipelines, and ultra-low latency execution across global FX, indices, and crypto markets. Our engineering hub hires top quantitative analysts, high-frequency systems engineers, and full-stack FinTech builders.`,
  },
  {
    name: 'Legion Funding',
    email: 'campus@legionfunding.com',
    industry: 'FinTech / Prop Trading',
    website: 'https://legionfunding.com',
    logoUrl: '/logos/legionfunding.svg',
    location: 'Bengaluru / Remote',
    description: `Legion Funding is an innovative proprietary evaluation and trading firm providing modern traders access to simulated funded capital challenges up to $400,000 with up to 80-90% profit splits. Operating under Hyper Funded Ltd., Legion Funding builds cutting-edge automated risk engines, instant funding frameworks, and institutional-grade algorithmic execution tools for active market participants worldwide.`,
  },
  {
    name: 'FundedFirm',
    email: 'campus@fundedfirm.com',
    industry: 'FinTech / Quantitative Finance',
    website: 'https://fundedfirm.com',
    logoUrl: '/logos/fundedfirm.svg',
    location: 'Mumbai / Remote',
    description: `FundedFirm is a rapidly expanding proprietary trading firm dedicated to identifying, mentoring, and backing top-tier retail and institutional traders globally. Offering 1-Step, 2-Step, and Instant simulated funding programs with profit splits up to 90%, FundedFirm engineers robust risk-management infrastructure, automated drawdown guardrails, and real-time analytical dashboards for global market traders.`,
  },
];

// ─── Placement Drives (per company) ───────────────────────────────────────
const DRIVES_TEMPLATE = [
  // Google
  {
    companyIndex: 0,
    title: 'Software Engineer — New Grad 2025',
    jobRole: 'Software Engineer L3',
    jobType: 'full-time',
    location: 'Bengaluru / Hyderabad',
    package: { min: 30, max: 45 },
    description: `Google is looking for exceptional software engineers to join our India teams. You'll work on large-scale distributed systems, machine learning infrastructure, or consumer products. Our SWE L3 role is an entry-level position for new graduates — you'll be mentored by senior Googlers and shipped to production on day 30.

**What you'll do:**
- Design, develop, test, deploy, and improve software across Google's product ecosystem
- Work on problems of massive scale and impact
- Collaborate in an open, creative environment
- Contribute to projects spanning Search, Maps, Cloud, and Pay

**Compensation (CTC):**
- Base: ₹30–40 LPA
- ESOP / RSU: ₹5–10 LPA
- Performance bonus: Up to 15%
- Total first-year: ₹35–45 LPA`,
    eligibility: { minCGPA: 8.0, maxBacklogs: 0, allowedDepartments: ['CS', 'IT', 'ECE'], min10Percentage: 80, min12Percentage: 80 },
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    status: 'open',
    requiredSkills: ['Data Structures', 'Algorithms', 'System Design', 'Java/C++/Python', 'Distributed Systems'],
  },
  {
    companyIndex: 0,
    title: 'STEP Intern — Summer 2025',
    jobRole: 'Student Trainee Engineering Program Intern',
    jobType: 'internship',
    location: 'Bengaluru (with relocation support)',
    package: { min: 6, max: 8 },
    description: `Google's STEP (Student Training in Engineering Program) is a 12-week paid internship designed for first and second year CS undergraduate students. You'll work on a real project, be assigned a dedicated mentor, and experience Google's unique culture.\n\nStipen: ₹6–8 LPA equivalent (₹50,000–65,000/month).\nPre-placement offer (PPO) based on performance.`,
    eligibility: { minCGPA: 7.5, maxBacklogs: 0, allowedDepartments: ['CS', 'IT'], min10Percentage: 75, min12Percentage: 75 },
    applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    status: 'open',
    requiredSkills: ['Data Structures', 'OOP', 'Problem Solving'],
  },
  // Microsoft
  {
    companyIndex: 1,
    title: 'SDE — New Graduate (IDC Hyderabad)',
    jobRole: 'Software Development Engineer',
    jobType: 'full-time',
    location: 'Hyderabad',
    package: { min: 25, max: 38 },
    description: `Microsoft India Development Center (IDC) in Hyderabad is hiring talented new graduates to join product teams building Azure, Office 365, Teams, and Windows. You will be part of world-class engineering teams working on products used by 1 billion+ people globally.

**Role summary:**
- Design and implement large-scale software components
- Own features end-to-end — from requirements to production
- Work with PMs, designers, and senior engineers
- Learn from Microsoft's incredible engineering culture

**Compensation:**
- Base: ₹25–34 LPA
- ESOP: ₹4–8 LPA (4-year vest)
- Joining bonus: ₹2.5 LPA
- Total: ₹28–38 LPA`,
    eligibility: { minCGPA: 7.5, maxBacklogs: 0, allowedDepartments: ['CS', 'IT', 'ECE', 'EEE'], min10Percentage: 75, min12Percentage: 75 },
    applicationDeadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
    status: 'open',
    requiredSkills: ['C++', 'C#', 'Algorithms', 'OS Concepts', 'Networking'],
  },
  // Razorpay
  {
    companyIndex: 2,
    title: 'SDE-1 — Payments Platform',
    jobRole: 'Software Development Engineer - 1',
    jobType: 'full-time',
    location: 'Bengaluru (Hybrid)',
    package: { min: 18, max: 28 },
    description: `Razorpay is looking for its next generation of engineers to join the Payments Platform team. You'll work on the core infrastructure that processes ₹10,000 crore+ daily, ensuring 99.99% uptime with sub-100ms latency for 10M+ merchants.\n\n**What makes this special:**\n- You'll own real production systems from month 1\n- Flat hierarchy, direct access to founders\n- ESOP at unicorn valuation\n- Best-in-class fintech engineering problems\n\n**Stack:** Go, Java, React, Kafka, Redis, MySQL, Kubernetes\n\n**CTC:** ₹18–24 LPA base + ₹4 LPA ESOP = ₹22–28 LPA total`,
    eligibility: { minCGPA: 7.0, maxBacklogs: 0, allowedDepartments: ['CS', 'IT', 'ECE'], min10Percentage: 70 },
    applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000),
    status: 'open',
    requiredSkills: ['Java/Go', 'System Design', 'REST APIs', 'SQL', 'Microservices'],
  },
  // Zerodha
  {
    companyIndex: 3,
    title: 'Backend Engineer — Kite Platform',
    jobRole: 'Backend Engineer',
    jobType: 'full-time',
    location: 'Bengaluru',
    package: { min: 15, max: 25 },
    description: `Zerodha is one of the few bootstrapped unicorns in India, and we're looking for talented engineers to join our small but exceptional team. You'll work on Kite — India's most popular trading platform handling 15%+ of all NSE volumes.\n\n**Why Zerodha:**\n- Genuinely small team (60 engineers for 10M users)\n- No VC pressure, sustainable business\n- Solve real hard problems at scale\n- Generous ESOPs in a profitable company\n\n**Stack:** Python/Go, React, PostgreSQL, Redis, WebSockets\n\n**Hiring process:** Portfolio review → take-home project → technical interview`,
    eligibility: { minCGPA: 6.5, maxBacklogs: 1, allowedDepartments: ['CS', 'IT', 'ECE', 'Maths'], min10Percentage: 65 },
    applicationDeadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 36 * 24 * 60 * 60 * 1000),
    status: 'open',
    requiredSkills: ['Python', 'PostgreSQL', 'System Design', 'WebSockets', 'Linux'],
  },
  // CRED
  {
    companyIndex: 4,
    title: 'Product Engineer — Member Experience',
    jobRole: 'Product Engineer',
    jobType: 'full-time',
    location: 'Bengaluru',
    package: { min: 20, max: 35 },
    description: `CRED is looking for exceptional product engineers who can think at the intersection of product, design, and engineering. You'll work on the core CRED app experience trusted by India's top 1% credit card users.\n\n**What we look for:**\n- Strong first-principles thinking\n- Ability to move fast and ship beautiful products\n- Attention to detail in UX/DX\n- Collaborative spirit in a high-trust environment\n\n**Compensation is top 1% of Indian startups** — base + ESOP + generous benefits.`,
    eligibility: { minCGPA: 7.5, maxBacklogs: 0, allowedDepartments: ['CS', 'IT'] },
    applicationDeadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
    status: 'open',
    requiredSkills: ['React Native', 'Node.js', 'TypeScript', 'System Design'],
  },
  // PhonePe
  {
    companyIndex: 5,
    title: 'SDE-1 — UPI Infrastructure',
    jobRole: 'Software Development Engineer',
    jobType: 'full-time',
    location: 'Bengaluru / Pune',
    package: { min: 16, max: 26 },
    description: `PhonePe processes 5 billion+ UPI transactions annually. Our SDE-1 role puts you at the heart of India's digital payments revolution. You'll work on real-time payment processing systems that need to handle 100K TPS with 99.999% uptime.\n\n**Teams hiring:** UPI Core, Risk & Fraud, Financial Services, Indus Appstore, Data Platform\n\n**Stack:** Java, Spring Boot, Kafka, Cassandra, Redis, AWS\n\n**Total Comp:** ₹16–22 LPA + ESOP ₹4 LPA = ₹20–26 LPA`,
    eligibility: { minCGPA: 7.0, maxBacklogs: 0, allowedDepartments: ['CS', 'IT', 'ECE'], min10Percentage: 70 },
    applicationDeadline: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    status: 'open',
    requiredSkills: ['Java', 'Spring Boot', 'Kafka', 'Distributed Systems', 'SQL'],
  },
  // Groww
  {
    companyIndex: 6,
    title: 'Frontend Engineer — Investment Platform',
    jobRole: 'Frontend Engineer',
    jobType: 'full-time',
    location: 'Bengaluru',
    package: { min: 14, max: 22 },
    description: `Groww's frontend team builds the investment experience for 10M+ users. Our apps need to be blazing fast, beautifully designed, and handle real-time stock data for crores of users. You'll own critical user journeys and ship features that directly impact how Indians invest.\n\n**Stack:** React, React Native, Next.js, GraphQL, WebSockets\n\n**Perks:** 5-day week, generous ESOP, premium equipment, team offsites.`,
    eligibility: { minCGPA: 6.5, maxBacklogs: 1, allowedDepartments: ['CS', 'IT', 'ECE'] },
    applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    status: 'open',
    requiredSkills: ['React', 'JavaScript', 'CSS', 'REST APIs', 'Performance Optimization'],
  },
  // Flipkart
  {
    companyIndex: 7,
    title: 'SDE-1 — Supply Chain Engineering',
    jobRole: 'Software Development Engineer',
    jobType: 'full-time',
    location: 'Bengaluru',
    package: { min: 18, max: 30 },
    description: `Flipkart's Supply Chain Engineering team is the backbone of India's largest e-commerce operation. You'll build systems that orchestrate millions of daily shipments across India's complex logistics landscape.\n\n**Scale you'll work at:**\n- 3B+ page views/day\n- 8M+ orders/day during Big Billion Days\n- 500M+ customers\n\n**Comp:** ₹20–26 LPA base + ₹4 LPA ESOP (Walmart subsidiary) = ₹22–30 LPA`,
    eligibility: { minCGPA: 7.0, maxBacklogs: 0, allowedDepartments: ['CS', 'IT', 'ECE', 'EEE'] },
    applicationDeadline: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    status: 'open',
    requiredSkills: ['Java', 'Microservices', 'Kafka', 'Redis', 'MySQL'],
  },
  // Atlassian
  {
    companyIndex: 8,
    title: 'Associate Software Engineer — Jira Cloud',
    jobRole: 'Associate Software Engineer',
    jobType: 'full-time',
    location: 'Bengaluru (Hybrid)',
    package: { min: 22, max: 36 },
    description: `Atlassian's Bengaluru engineering hub is hiring new graduates to work on Jira Cloud — the world's #1 project management tool used by 200,000+ teams. You'll build features that developers and product managers rely on every day at companies from startups to Fortune 500.\n\n**Engineering culture:** No managers telling you what to do — teams are autonomous, product-thinking is valued, and code quality is non-negotiable.\n\n**Compensation:** AUD 100K equivalent base + ESOP = ₹22–36 LPA (varies with AUD-INR)`,
    eligibility: { minCGPA: 7.5, maxBacklogs: 0, allowedDepartments: ['CS', 'IT'] },
    applicationDeadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000),
    status: 'open',
    requiredSkills: ['React', 'Java/Node.js', 'REST APIs', 'TypeScript', 'Agile'],
  },
  // BrowserStack
  {
    companyIndex: 9,
    title: 'Software Engineer — Platform Infrastructure',
    jobRole: 'Software Engineer',
    jobType: 'full-time',
    location: 'Mumbai / Bengaluru / Remote',
    package: { min: 16, max: 28 },
    description: `BrowserStack is a bootstrapped $4B company — rare in Indian tech. Our Platform Infrastructure team maintains the cloud grid that runs 50 million+ browser and device tests daily for 50,000+ customers including Google and Amazon.\n\n**What makes BrowserStack special:**\n- No VC pressure, profitable, and fast-growing\n- Remote-first with offices in Mumbai & Bengaluru\n- Work with engineers from Uber, Stripe, and Google\n- Competitive global compensation`,
    eligibility: { minCGPA: 6.5, maxBacklogs: 1, allowedDepartments: ['CS', 'IT', 'ECE'] },
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    status: 'open',
    requiredSkills: ['Python/Ruby', 'Docker', 'Kubernetes', 'AWS', 'Linux'],
  },
  // Meesho
  {
    companyIndex: 10,
    title: 'SDE-1 — Catalog & Search',
    jobRole: 'Software Development Engineer',
    jobType: 'full-time',
    location: 'Bengaluru',
    package: { min: 14, max: 22 },
    description: `Meesho is building India's most inclusive e-commerce platform. Our Catalog & Search team manages 500M+ product listings and builds personalized search experiences for 150M+ users, predominantly in Tier-2/3 India.\n\n**The challenge:** Build search that works for users with slow internet, diverse languages, and price-sensitive buying patterns — a uniquely Indian engineering problem.\n\n**Total Comp:** ₹14–18 LPA + ESOP ₹4 LPA = ₹18–22 LPA`,
    eligibility: { minCGPA: 6.5, maxBacklogs: 1, allowedDepartments: ['CS', 'IT', 'ECE'] },
    applicationDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 36 * 24 * 60 * 60 * 1000),
    status: 'open',
    requiredSkills: ['Java', 'Elasticsearch', 'ML basics', 'Redis', 'MySQL'],
  },
  // Amazon
  {
    companyIndex: 11,
    title: 'SDE-1 — AWS / Alexa India',
    jobRole: 'Software Development Engineer',
    jobType: 'full-time',
    location: 'Hyderabad / Bengaluru',
    package: { min: 22, max: 40 },
    description: `Amazon India Development Centers in Hyderabad and Bengaluru are hiring SDE-1s to work on AWS, Alexa, Amazon.in, Kindle, and Advertising. Amazon offers one of the most rigorous engineering interview processes and compensation packages in India.\n\n**Leadership Principles:** Amazon's culture is built on 16 Leadership Principles — you'll be evaluated on these throughout your career.\n\n**Compensation:**\n- Base: ₹22–28 LPA\n- Signing bonus: ₹5 LPA (2-year vest)\n- RSU: ₹6–12 LPA (4-year vest)\n- Total: ₹28–40 LPA`,
    eligibility: { minCGPA: 7.5, maxBacklogs: 0, allowedDepartments: ['CS', 'IT', 'ECE', 'EEE'], min10Percentage: 75, min12Percentage: 75 },
    applicationDeadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000),
    status: 'open',
    requiredSkills: ['Data Structures', 'Algorithms', 'Java/C++', 'System Design', 'OOP'],
  },
  // FundingPips
  {
    companyIndex: 12,
    title: 'Quantitative Developer — Algorithmic Trading Systems',
    jobRole: 'Quantitative Software Engineer',
    jobType: 'full-time',
    location: 'Bengaluru / Remote',
    package: { min: 26, max: 42 },
    description: `FundingPips is hiring exceptional quantitative developers to engineer our next-generation simulated execution fabric and algorithmic risk-engine.\n\n**What you will do:**\n- Design, optimize, and maintain low-latency algorithmic trading infrastructure and market feed listeners\n- Develop automated risk metrics, dynamic drawdown calculation pipelines, and high-volume order routing\n- Interface directly with quantitative analysts and traders to backtest and roll out algorithmic trading tools\n\n**Compensation:**\n- Base Salary: ₹26–34 LPA\n- Performance & PnL Bonus: ₹6–8 LPA\n- Total CTC: ₹32–42 LPA`,
    eligibility: { minCGPA: 7.5, maxBacklogs: 0, allowedDepartments: ['CS', 'IT', 'ECE', 'Math & Computing'], min10Percentage: 75, min12Percentage: 75 },
    applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    status: 'open',
    requiredSkills: ['C++', 'Python', 'Algorithms', 'Distributed Systems', 'Low Latency', 'Data Structures'],
  },
  // Legion Funding
  {
    companyIndex: 13,
    title: 'Backend FinTech Engineer — High-Frequency Risk Engine',
    jobRole: 'FinTech Backend Engineer',
    jobType: 'full-time',
    location: 'Bengaluru / Remote',
    package: { min: 22, max: 36 },
    description: `Legion Funding is looking for high-caliber backend engineers to power our rapid evaluation challenges, instant funding infrastructure, and automated trader analytics.\n\n**Responsibilities:**\n- Architect real-time trade monitoring engines handling 100,000+ simulated orders daily\n- Build distributed event-driven microservices for instant account provisioning and payout verification\n- Ensure zero-downtime execution and rock-solid financial consistency\n\n**Compensation:**\n- Base Salary: ₹22–28 LPA\n- Annual Performance Bonus: ₹4–8 LPA\n- Total Package: ₹26–36 LPA`,
    eligibility: { minCGPA: 7.0, maxBacklogs: 1, allowedDepartments: ['CS', 'IT', 'ECE'] },
    applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    status: 'open',
    requiredSkills: ['Node.js', 'Go', 'Redis', 'WebSockets', 'PostgreSQL', 'Microservices'],
  },
  // FundedFirm
  {
    companyIndex: 14,
    title: 'Full Stack Engineer — Trading Platform & Analytics',
    jobRole: 'Full Stack FinTech Engineer',
    jobType: 'full-time',
    location: 'Mumbai / Remote',
    package: { min: 20, max: 32 },
    description: `FundedFirm is hiring full-stack builders to craft beautiful, responsive trading dashboards and mission-critical financial interfaces for our global community of funded traders.\n\n**What you will build:**\n- Real-time trader performance dashboards, PnL charts, and equity curve visualizations\n- Secure payment integration, KYC verification workflows, and reward payout distribution\n- High-throughput REST & WebSocket APIs connected to our core evaluation ledger\n\n**Compensation:**\n- Base: ₹20–26 LPA\n- Variable / Bonus: ₹4–6 LPA\n- Total: ₹24–32 LPA`,
    eligibility: { minCGPA: 6.8, maxBacklogs: 1, allowedDepartments: ['CS', 'IT', 'ECE'] },
    applicationDeadline: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000),
    status: 'open',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'REST APIs'],
  },
];

// ─── Students (Only 1 dummy student: Yug Nanda) ──────────────────────────────
const STUDENTS = [
  {
    name: 'Yug Nanda',
    email: 'yug@student.rize.in',
    rollNo: 'CS2021001',
    department: 'CS',
    batch: '2021-2025',
    semester: 8,
    cgpa: 9.2,
    backlogs: 0,
    tenthPercentage: 96,
    twelfthPercentage: 93,
    skills: ['React', 'Node.js', 'Python', 'System Design', 'Algorithms', 'TypeScript', 'Docker', 'PostgreSQL'],
    placementStatus: 'not_placed',
  },
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // ─── Clean up ───────────────────────────────────────────────────────────
  console.log('🗑  Clearing existing data...');
  await Promise.all([
    User.deleteMany({ email: { $regex: 'rize.in$' } }),
    Application.deleteMany({}),
    PlacementDrive.deleteMany({}),
    Company.deleteMany({}),
    Student.deleteMany({}),
    Interview.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('   Done.\n');

  const companyPassword = 'comp@123';
  const studentPassword = 'stu@123';
  const adminPassword = 'admin@123';
  const tpcellPassword = 'tp@123';

  // ─── Admin & T&P Cell ───────────────────────────────────────────────────
  console.log('👑 Creating admin & T&P Cell...');
  const adminUser = await User.create({ name: 'Yug Nanda (Admin)', email: 'admin@rize.in', password: adminPassword, role: 'admin' });
  const tpcellUser = await User.create({ name: 'Prof. R.K. Sharma (Head T&P Cell)', email: 'tpcell@rize.in', password: tpcellPassword, role: 'tpcell' });

  // ─── Companies ──────────────────────────────────────────────────────────
  console.log('🏢 Creating companies...');
  const companyUsers = [];
  const companyDocs = [];

  for (const c of COMPANIES) {
    const slug = c.name.toLowerCase().replace(/[^a-z]/g, '');
    const email = `${slug}@rize.in`;
    const user = await User.create({ name: c.name, email, password: companyPassword, role: 'company', avatar: c.logoUrl });
    companyUsers.push(user);

    const company = await Company.create({
      name: c.name,
      email: c.email,
      industry: c.industry,
      website: c.website,
      logoUrl: c.logoUrl,
      location: c.location,
      description: c.description,
      createdBy: user._id,
      isVerified: true,
    });
    companyDocs.push(company);
    console.log(`   ✔ ${c.name}`);
  }

  // ─── Students (Single dummy student: Yug Nanda) ──────────────────────────
  console.log('\n🎓 Creating student Yug Nanda...');
  const studentDocs = [];

  for (const s of STUDENTS) {
    const user = await User.create({ name: s.name, email: s.email, password: studentPassword, role: 'student', avatar: '/avatars/yug.png' });
    const student = await Student.create({
      userId: user._id,
      rollNo: s.rollNo,
      department: s.department,
      batch: s.batch,
      semester: s.semester,
      cgpa: s.cgpa,
      backlogs: s.backlogs,
      activeBacklogs: 0,
      tenthPercentage: s.tenthPercentage,
      twelfthPercentage: s.twelfthPercentage,
      skills: s.skills,
      profilePhotoUrl: '/avatars/yug.png',
      phone: '+91 9876543210',
      placementStatus: s.placementStatus,
      isVerified: true,
      verificationStatus: 'verified',
      verificationRemarks: 'Academic records, 10th/12th marksheets and B.Tech transcripts verified by T&P Cell.',
      nocIssued: false,
      nocIssuedAt: null,
    });
    studentDocs.push(student);
    console.log(`   ✔ ${s.name} (${s.email})`);
  }

  // ─── Drives ─────────────────────────────────────────────────────────────
  console.log('\n🚀 Creating placement drives...');
  const driveDocs = [];

  for (const d of DRIVES_TEMPLATE) {
    const company = companyDocs[d.companyIndex];
    const companyUser = companyUsers[d.companyIndex];

    const drive = await PlacementDrive.create({
      companyId: company._id,
      title: d.title,
      jobRole: d.jobRole,
      jobType: d.jobType,
      location: d.location,
      package: { min: d.package.min, max: d.package.max, currency: 'INR' },
      description: d.description,
      eligibility: {
        minCGPA: d.eligibility.minCGPA || 0,
        maxBacklogs: d.eligibility.maxBacklogs ?? 0,
        allowedDepartments: d.eligibility.allowedDepartments || [],
        min10Percentage: d.eligibility.min10Percentage || 0,
        min12Percentage: d.eligibility.min12Percentage || 0,
        requiredSkills: d.requiredSkills || [],
      },
      applicationDeadline: d.applicationDeadline,
      driveDate: d.driveDate,
      status: d.status,
      createdBy: companyUser._id,
    });
    driveDocs.push(drive);
    console.log(`   ✔ ${d.title} @ ${company.name}`);
  }

  // ─── Sample Applications for Yug Nanda ──────────────────────────────────
  console.log('\n📋 Creating applications for Yug Nanda...');
  const yugStudent = studentDocs[0];
  const yugUser = await User.findById(yugStudent.userId);

  const applyPairs = [
    { drive: driveDocs[0], status: 'shortlisted' },  // Google SWE
    { drive: driveDocs[2], status: 'applied' },       // Microsoft SDE
    { drive: driveDocs[3], status: 'interview' },     // Razorpay
    { drive: driveDocs[12], status: 'rejected', rejectionReason: "Profile and prior project experience didn't suit senior requirements." },      // Amazon
    { drive: driveDocs[13], status: 'interview' },    // FundingPips Quant Dev
    { drive: driveDocs[14], status: 'applied' },      // Legion Funding Backend
  ];

  const appDocs = [];
  for (const { drive, status, rejectionReason } of applyPairs) {
    if (drive) {
      const app = await Application.create({
        driveId: drive._id,
        studentId: yugStudent._id,
        status,
        rejectionReason: rejectionReason || '',
        appliedAt: new Date(Date.now() - Math.floor(Math.random() * 5 + 1) * 86400000),
      });
      appDocs.push(app);
      console.log(`   ✔ Yug Nanda → ${drive.title} [${status}]`);
    }
  }

  // ─── Sample Interviews for Yug Nanda ────────────────────────────────────
  console.log('\n🎯 Creating sample interviews for Yug Nanda...');
  const razorpayApp = appDocs.find(a => a.driveId.toString() === driveDocs[3]._id.toString());
  const fundingPipsApp = appDocs.find(a => a.driveId.toString() === driveDocs[13]._id.toString());
  const googleApp = appDocs.find(a => a.driveId.toString() === driveDocs[0]._id.toString());

  if (razorpayApp) {
    await Interview.create({
      applicationId: razorpayApp._id,
      title: 'Round 1 — Technical Architecture & Distributed Systems',
      round: 1,
      type: 'technical',
      interviewer: 'Rajesh Iyer (Staff SDE — Core Payments)',
      scheduledAt: new Date(Date.now() + 24 * 3600 * 1000), // Tomorrow 2:00 PM
      location: 'Virtual / Google Meet',
      meetingLink: 'https://meet.google.com/rzp-sde-yug',
      notes: 'Focus on distributed idempotency, database replication, and payment gateway fault tolerance.',
      status: 'scheduled',
    });
    console.log('   ✔ Razorpay Round 1 scheduled for tomorrow');
  }

  if (fundingPipsApp) {
    await Interview.create({
      applicationId: fundingPipsApp._id,
      title: 'Round 2 — Quantitative Algorithmic Problem Solving',
      round: 2,
      type: 'technical',
      interviewer: 'Elena Rostova (Head of Quantitative Systems)',
      scheduledAt: new Date(Date.now() + 3 * 24 * 3600 * 1000), // In 3 days
      location: 'Virtual / Zoom',
      meetingLink: 'https://meet.google.com/fp-quant-yug',
      notes: 'Live coding session: cache-friendly order book implementation and multi-threaded ring buffers.',
      status: 'scheduled',
    });
    console.log('   ✔ FundingPips Round 2 scheduled in 3 days');
  }

  if (googleApp) {
    await Interview.create({
      applicationId: googleApp._id,
      title: 'Round 1 — Data Structures & Graph Algorithms',
      round: 1,
      type: 'technical',
      interviewer: 'Amitabh Sengupta (Senior SDE)',
      scheduledAt: new Date(Date.now() - 2 * 24 * 3600 * 1000), // Completed 2 days ago
      location: 'Google Meet',
      meetingLink: 'https://meet.google.com/goog-swe-yug',
      notes: 'Evaluate candidate on algorithmic efficiency and clean modular code.',
      status: 'completed',
      feedback: 'Excellent problem decomposition and optimal O(V+E) topological sort solution. Highly recommended.',
    });
    console.log('   ✔ Google Round 1 (Completed)');
  }

  // ─── In-App Notifications ────────────────────────────────────────────────
  console.log('\n🔔 Creating in-app notifications...');

  // Notifications for Yug Nanda
  await Notification.create([
    {
      userId: yugUser._id,
      title: '🎯 Interview Scheduled — Razorpay',
      message: 'Razorpay has invited you for "Round 1 — Technical Architecture & Distributed Systems" on tomorrow at 2:00 PM.',
      type: 'interview',
      link: '/student/interviews',
      isRead: false,
    },
    {
      userId: yugUser._id,
      title: '🎯 Interview Scheduled — FundingPips',
      message: 'FundingPips has scheduled "Round 2 — Quantitative Algorithmic Problem Solving" in 3 days.',
      type: 'interview',
      link: '/student/interviews',
      isRead: false,
    },
    {
      userId: yugUser._id,
      title: '🎉 Shortlisted — Google India',
      message: 'Your resume and online assessment cleared the Google India cutoff. Next round details will be shared soon.',
      type: 'application',
      link: '/student/applications',
      isRead: false,
    },
    {
      userId: yugUser._id,
      title: '🎓 Academic Marksheets Verified by T&P Cell',
      message: 'Prof. R.K. Sharma has verified your 10th, 12th, and B.Tech academic marks. Your profile is verified for campus drives.',
      type: 'general',
      link: '/student/profile',
      isRead: true,
    },
    {
      userId: yugUser._id,
      title: '🚀 New Placement Drive — Legion Funding',
      message: 'Legion Funding has opened recruitment for Backend FinTech Engineer (₹24–38 LPA). Apply before the deadline.',
      type: 'drive',
      link: `/student/drives/${driveDocs[14]._id}`,
      isRead: true,
    },
  ]);

  // Notifications for Recruiters (e.g. Razorpay, Legion Funding)
  if (companyUsers[3]) {
    await Notification.create({
      userId: companyUsers[3]._id, // Razorpay
      title: '📥 Application Received — Yug Nanda',
      message: 'Candidate Yug Nanda (CS2021001, CGPA 9.2) applied for SDE-1 Payments Platform.',
      type: 'application',
      link: '/company/applicants',
      isRead: false,
    });
  }
  if (companyUsers[14]) {
    await Notification.create({
      userId: companyUsers[14]._id, // Legion Funding
      title: '📥 Application Received — Yug Nanda',
      message: 'Candidate Yug Nanda (CS2021001, CGPA 9.2) applied for Backend FinTech Engineer.',
      type: 'application',
      link: '/company/applicants',
      isRead: false,
    });
  }

  // Notification for T&P Cell
  await Notification.create({
    userId: tpcellUser._id,
    title: '🏢 New Drive Governance Request — Legion Funding',
    message: 'Legion Funding has submitted Backend FinTech Engineer for T&P audit and approval.',
    type: 'drive',
    link: '/tpcell/drives',
    isRead: false,
  });

  console.log('   ✔ In-app notifications seeded successfully');

  console.log('\n✅ Seed complete!\n');
  console.log('─'.repeat(60));
  console.log('🔑 LOGIN CREDENTIALS:');
  console.log('─'.repeat(60));
  console.log('👑 Admin       : admin@rize.in        (Password: admin@123)');
  console.log('\n🎓 Students (All passwords: stu@123):');
  STUDENTS.forEach((s) => console.log(`   ${s.name.padEnd(18)} : ${s.email}`));
  console.log('\n🏢 Companies (All passwords: comp@123):');
  console.log('   Google India       : googleindia@rize.in');
  console.log('   Microsoft India    : microsoftindia@rize.in');
  console.log('   Razorpay           : razorpay@rize.in');
  console.log('   FundingPips        : fundingpips@rize.in');
  console.log('   Legion Funding     : legionfunding@rize.in');
  console.log('   FundedFirm         : fundedfirm@rize.in');
  console.log('   (all company emails follow: <name_no_spaces>@rize.in)');
  console.log('─'.repeat(60));

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
