const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const employer1 = await User.create({
      name: 'Priya Sharma',
      email: 'employer@jobsearch.in',
      password: 'password123',
      role: 'employer',
    });

    const employer2 = await User.create({
      name: 'Rahul Mehta',
      email: 'rahul@infosys.com',
      password: 'password123',
      role: 'employer',
    });

    const candidate = await User.create({
      name: 'Amit Patel',
      email: 'candidate@jobsearch.in',
      password: 'password123',
      role: 'candidate',
    });

    console.log('Created users');

    // Create jobs
    const jobs = await Job.insertMany([
      {
        title: 'Senior React Developer',
        company: 'TCS Digital',
        location: 'Bangalore, Karnataka',
        type: 'Full-time',
        salary: '₹12,00,000 - ₹18,00,000/year',
        description: 'We are looking for a Senior React Developer to join our growing team. You will be responsible for building and maintaining high-performance web applications using React, Redux, and modern JavaScript.\n\nAs a key member of our engineering team, you will architect solutions, mentor junior developers, and drive technical decisions.',
        requirements: ['5+ years of React experience', 'Strong TypeScript skills', 'Experience with Redux/RTK', 'REST API design', 'Unit testing experience'],
        skills: ['React', 'TypeScript', 'Redux', 'Node.js', 'Jest', 'GraphQL'],
        employer: employer1._id,
      },
      {
        title: 'Full Stack Engineer',
        company: 'Wipro',
        location: 'Hyderabad, Telangana',
        type: 'Full-time',
        salary: '₹10,00,000 - ₹15,00,000/year',
        description: 'Join our product team as a Full Stack Engineer. Work on cutting-edge projects that impact millions of users across India. You will build end-to-end features from database design to frontend implementation.',
        requirements: ['3+ years full stack experience', 'React and Node.js proficiency', 'MongoDB/PostgreSQL experience', 'CI/CD knowledge'],
        skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Docker', 'AWS'],
        employer: employer1._id,
      },
      {
        title: 'UI/UX Designer',
        company: 'Infosys',
        location: 'Pune, Maharashtra',
        type: 'Remote',
        salary: '₹8,00,000 - ₹12,00,000/year',
        description: 'We need a creative UI/UX Designer to craft beautiful, intuitive experiences for our SaaS products. You will conduct user research, create wireframes and prototypes, and collaborate closely with developers to bring designs to life.',
        requirements: ['Portfolio of shipped products', 'Figma mastery', 'User research experience', 'Design system knowledge'],
        skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Design Systems'],
        employer: employer2._id,
      },
      {
        title: 'DevOps Engineer',
        company: 'Infosys',
        location: 'Noida, Uttar Pradesh',
        type: 'Full-time',
        salary: '₹14,00,000 - ₹22,00,000/year',
        description: 'Looking for a DevOps Engineer to build and maintain our cloud infrastructure. You will design CI/CD pipelines, manage Kubernetes clusters, and ensure 99.99% uptime for our production services.',
        requirements: ['AWS/GCP certification', 'Kubernetes expertise', 'Terraform experience', 'Linux administration', 'Monitoring tools'],
        skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'Prometheus'],
        employer: employer2._id,
      },
      {
        title: 'Backend Developer Intern',
        company: 'Zoho Corporation',
        location: 'Chennai, Tamil Nadu',
        type: 'Internship',
        salary: '₹25,000/month',
        description: 'Exciting internship opportunity for aspiring backend developers. You will work alongside senior engineers on real projects, learning best practices in API development, database design, and cloud services.',
        requirements: ['Computer Science student or recent graduate', 'Basic knowledge of Node.js or Python', 'Understanding of REST APIs', 'Eagerness to learn'],
        skills: ['Node.js', 'Python', 'SQL', 'Git', 'REST APIs'],
        employer: employer1._id,
      },
      {
        title: 'Product Manager',
        company: 'Flipkart',
        location: 'Bangalore, Karnataka',
        type: 'Full-time',
        salary: '₹20,00,000 - ₹30,00,000/year',
        description: 'Lead the product vision for our e-commerce platform. You will define product strategy, work with customers, coordinate engineering sprints, and drive data-informed decisions.',
        requirements: ['5+ years product management', 'Technical background preferred', 'E-commerce or B2C experience', 'Agile methodology'],
        skills: ['Product Strategy', 'Agile', 'Jira', 'Analytics', 'Stakeholder Management'],
        employer: employer2._id,
      },
      {
        title: 'Mobile Developer (React Native)',
        company: 'Paytm',
        location: 'Gurugram, Haryana',
        type: 'Contract',
        salary: '₹11,00,000 - ₹16,00,000/year',
        description: 'Build cross-platform mobile applications using React Native. You will be responsible for developing and shipping mobile apps for both iOS and Android platforms.',
        requirements: ['3+ years React Native', 'Published apps on App Store/Play Store', 'Native module experience', 'Performance optimization'],
        skills: ['React Native', 'iOS', 'Android', 'TypeScript', 'Firebase'],
        employer: employer1._id,
      },
      {
        title: 'Data Analyst',
        company: 'Razorpay',
        location: 'Mumbai, Maharashtra',
        type: 'Part-time',
        salary: '₹6,00,000 - ₹9,00,000/year',
        description: 'Analyze business data to provide actionable insights. Create dashboards, reports, and presentations to help leadership make informed decisions.',
        requirements: ['SQL proficiency', 'Experience with BI tools', 'Statistical analysis knowledge', 'Strong communication skills'],
        skills: ['SQL', 'Python', 'Tableau', 'Power BI', 'Excel', 'Statistics'],
        employer: employer2._id,
      },
    ]);

    console.log(`Created ${jobs.length} jobs`);

    // Create sample applications
    await Application.create([
      {
        job: jobs[0]._id,
        candidate: candidate._id,
        coverLetter: 'I am very excited about this Senior React Developer position. With 6 years of experience in React and a passion for building performant UIs, I believe I would be a great fit for the team.',
        status: 'reviewed',
      },
      {
        job: jobs[2]._id,
        candidate: candidate._id,
        coverLetter: 'As a designer with 4 years of experience, I would love to contribute my skills to Infosys.',
        status: 'pending',
      },
    ]);

    console.log('Created sample applications');

    console.log('\n✅ Seed complete!\n');
    console.log('Test Accounts:');
    console.log('───────────────────────────────');
    console.log('Employer: employer@jobsearch.in / password123');
    console.log('Employer: rahul@infosys.com / password123');
    console.log('Candidate: candidate@jobsearch.in / password123');
    console.log('───────────────────────────────\n');
  } catch (error) {
    console.error('Seed error:', error);
  }
};

// Auto-run when called directly via CLI
if (require.main === module) {
  const dotenv = require('dotenv');
  dotenv.config();
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => seedData())
    .then(() => process.exit(0))
    .catch((e) => { console.error(e); process.exit(1); });
}

module.exports = seedData;
