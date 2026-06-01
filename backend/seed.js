const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

const seedData = async () => {
  try {
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log('Cleared existing data');

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

    const companies = [
      'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Uber', 'Swiggy',
      'Zomato', 'Razorpay', 'PhonePe', 'CRED', 'Groww', 'Zerodha', 'Flipkart',
      'Myntra', 'Nykaa', 'Urban Company', 'Ola', 'Rapido', 'MakeMyTrip',
      'Paytm', 'BharatPe', 'TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra',
      'LTI Mindtree', 'Cognizant', 'Accenture', 'Deloitte', 'JPMC', 'Goldman Sachs',
      'Morgan Stanley', 'Stripe', 'Spotify', 'Adobe', 'Salesforce', 'Oracle',
      'IBM', 'SAP', 'Cisco', 'Vmware', 'Intel', 'Nvidia', 'AMD', 'Qualcomm',
      'Media.net', 'InMobi', 'BrowserStack', 'Postman', 'Freshworks', 'Chargebee',
      'Zoho', 'Unacademy', 'BYJU\'S', 'Vedantu', 'UpGrad', 'Physics Wallah',
      'Meesho', 'ShareChat', 'Dream11', 'LensKart', 'PharmEasy', 'Pratilipi',
      'Rivigo', 'BlackBuck', 'Delhivery', 'Dunzo', 'Curefit', 'Cultfit',
      'Yulu', 'Ather Energy', 'Ola Electric', 'Razorpay X', 'Khatabook',
      'CoinSwitch', 'CoinDCX', 'WazirX', 'Niyo', 'Jupiter', 'Bajaj Finserv',
      'HDFC Bank', 'ICICI Bank', 'Kotak Mahindra', 'Axis Bank', 'DBS Bank',
      'Sprinklr', 'WeWork', 'Wakefit', 'Bounce', 'Vogo', 'Fractal Analytics',
      'Mu Sigma', 'LatentView', 'Tiger Analytics', 'Sigmoid', 'Publicis Sapient',
      'ThoughtWorks', 'Coda Global', 'Hasura', 'Nagarro',
    ];

    const jobTemplates = [
      { title: 'SDE I', type: 'Full-time', minSal: 12, maxSal: 20, skills: ['DSA', 'System Design', 'Java', 'Python', 'SQL'], reqs: ['B.Tech/BE in CS', '0-2 years experience', 'Strong DSA fundamentals'] },
      { title: 'SDE II', type: 'Full-time', minSal: 25, maxSal: 40, skills: ['Java', 'Spring Boot', 'Microservices', 'AWS', 'Kubernetes', 'System Design'], reqs: ['3-5 years experience', 'System design skills', 'Distributed systems knowledge'] },
      { title: 'Senior SDE', type: 'Full-time', minSal: 45, maxSal: 70, skills: ['Java', 'Go', 'Distributed Systems', 'Azure', 'Docker'], reqs: ['6+ years experience', 'Led large-scale projects', 'Architecture design'] },
      { title: 'Staff Software Engineer', type: 'Full-time', minSal: 60, maxSal: 90, skills: ['Architecture', 'System Design', 'Leadership', 'Cloud', 'Scalability'], reqs: ['10+ years experience', 'Cross-team leadership', 'Technical strategy'] },
      { title: 'Frontend Engineer', type: 'Full-time', minSal: 14, maxSal: 25, skills: ['React', 'TypeScript', 'CSS', 'Redux', 'Jest', 'Webpack'], reqs: ['2-4 years frontend experience', 'Strong JavaScript skills', 'UI/UX sensibility'] },
      { title: 'Senior Frontend Engineer', type: 'Full-time', minSal: 30, maxSal: 50, skills: ['React', 'Vue.js', 'Next.js', 'GraphQL', 'Webpack', 'CI/CD'], reqs: ['5+ years frontend', 'Component library experience', 'Performance optimization'] },
      { title: 'Frontend Lead', type: 'Full-time', minSal: 50, maxSal: 80, skills: ['React', 'Micro Frontends', 'Monorepo', 'Testing', 'Performance'], reqs: ['7+ years frontend', 'Team management', 'Architecture decisions'] },
      { title: 'Backend Engineer', type: 'Full-time', minSal: 15, maxSal: 28, skills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'RabbitMQ', 'Docker'], reqs: ['2-4 years backend', 'API design', 'Database knowledge'] },
      { title: 'Senior Backend Engineer', type: 'Full-time', minSal: 32, maxSal: 55, skills: ['Node.js', 'Go', 'PostgreSQL', 'Kafka', 'AWS Lambda', 'Terraform'], reqs: ['5+ years backend', 'High-scale systems', 'Cloud infrastructure'] },
      { title: 'Backend Lead', type: 'Full-time', minSal: 55, maxSal: 85, skills: ['System Design', 'Microservices', 'Go', 'Rust', 'Distributed DBs'], reqs: ['8+ years backend', 'Led engineering teams', 'Production excellence'] },
      { title: 'ML Engineer', type: 'Full-time', minSal: 18, maxSal: 35, skills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'SQL', 'Statistics'], reqs: ['ML degree preferred', '2-4 years NLP/CV', 'Model deployment experience'] },
      { title: 'Senior ML Engineer', type: 'Full-time', minSal: 40, maxSal: 65, skills: ['Deep Learning', 'NLP', 'Computer Vision', 'Kubernetes', 'MLFlow'], reqs: ['5+ years ML', 'Published research', 'Production ML systems'] },
      { title: 'ML Research Scientist', type: 'Full-time', minSal: 50, maxSal: 90, skills: ['LLMs', 'Transformers', 'PyTorch', 'Research', 'Python'], reqs: ['PhD preferred', 'Published papers', 'Research experience'] },
      { title: 'Data Engineer', type: 'Full-time', minSal: 14, maxSal: 26, skills: ['Spark', 'Airflow', 'Python', 'BigQuery', 'Kafka', 'SQL'], reqs: ['2-4 years data engineering', 'ETL pipelines', 'Data warehousing'] },
      { title: 'Senior Data Engineer', type: 'Full-time', minSal: 30, maxSal: 50, skills: ['Apache Spark', 'Flink', 'Kafka', 'Snowflake', 'dbt', 'Databricks'], reqs: ['5+ years data eng', 'Real-time pipelines', 'Data architecture'] },
      { title: 'Data Scientist', type: 'Full-time', minSal: 16, maxSal: 30, skills: ['Python', 'SQL', 'R', 'Machine Learning', 'A/B Testing', 'Tableau'], reqs: ['MS/PhD in quantitative field', 'Statistical modeling', 'Product analytics'] },
      { title: 'DevOps Engineer', type: 'Full-time', minSal: 16, maxSal: 30, skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'Jenkins', 'Linux'], reqs: ['3-5 years DevOps', 'Cloud certifications', 'CI/CD pipelines'] },
      { title: 'Senior DevOps Engineer', type: 'Full-time', minSal: 35, maxSal: 55, skills: ['AWS/Azure', 'K8s', 'ArgoCD', 'Prometheus', 'Istio', 'Helm'], reqs: ['6+ years DevOps', 'SRE experience', 'Infra at scale'] },
      { title: 'Platform Engineer', type: 'Full-time', minSal: 20, maxSal: 38, skills: ['Kubernetes', 'Go', 'Internal Dev Platform', 'Backstage', 'Docker'], reqs: ['3-5 years platform eng', 'Developer tooling', 'K8s expertise'] },
      { title: 'iOS Developer', type: 'Full-time', minSal: 14, maxSal: 27, skills: ['Swift', 'iOS', 'UIKit', 'SwiftUI', 'Core Data', 'XCode'], reqs: ['2-4 years iOS', 'Published apps', 'Swift expertise'] },
      { title: 'Android Developer', type: 'Full-time', minSal: 13, maxSal: 25, skills: ['Kotlin', 'Jetpack Compose', 'Android SDK', 'Dagger', 'Room'], reqs: ['2-4 years Android', 'Play Store apps', 'Kotlin proficiency'] },
      { title: 'React Native Developer', type: 'Full-time', minSal: 12, maxSal: 24, skills: ['React Native', 'TypeScript', 'Redux', 'Firebase', 'App Center'], reqs: ['2-4 years React Native', 'Cross-platform apps', 'Mobile best practices'] },
      { title: 'Flutter Developer', type: 'Full-time', minSal: 12, maxSal: 23, skills: ['Flutter', 'Dart', 'Firebase', 'REST APIs', 'Provider'], reqs: ['2-4 years Flutter', 'Mobile app development', 'State management'] },
      { title: 'Product Manager', type: 'Full-time', minSal: 25, maxSal: 45, skills: ['Product Strategy', 'Agile', 'Analytics', 'User Research', 'Roadmapping'], reqs: ['3-5 years PM', 'Technical background', 'Data-driven decisions'] },
      { title: 'Senior Product Manager', type: 'Full-time', minSal: 50, maxSal: 80, skills: ['Strategy', 'Growth', 'Analytics', 'Stakeholder Mgmt', 'A/B Testing'], reqs: ['7+ years PM', 'P&L ownership', 'Consumer tech experience'] },
      { title: 'QA Engineer', type: 'Full-time', minSal: 8, maxSal: 18, skills: ['Selenium', 'Cypress', 'Python', 'Automation', 'API Testing', 'Jira'], reqs: ['2-4 years QA', 'Automation frameworks', 'Manual + automated testing'] },
      { title: 'SDET', type: 'Full-time', minSal: 14, maxSal: 28, skills: ['Java', 'Python', 'Cypress', 'Appium', 'Load Testing', 'CI/CD'], reqs: ['3-5 years SDET', 'Test architecture', 'CI/CD integration'] },
      { title: 'Security Engineer', type: 'Full-time', minSal: 20, maxSal: 40, skills: ['Penetration Testing', 'Network Security', 'Cryptography', 'Compliance'], reqs: ['3-5 years security', 'Bug bounty exp', 'Security certifications'] },
      { title: 'Site Reliability Engineer', type: 'Full-time', minSal: 22, maxSal: 42, skills: ['Kubernetes', 'Terraform', 'Prometheus', 'Incident Response', 'Linux'], reqs: ['4-6 years SRE', 'Incident management', 'Automation mindset'] },
      { title: 'Cloud Engineer', type: 'Full-time', minSal: 15, maxSal: 30, skills: ['AWS', 'Terraform', 'Python', 'Networking', 'Serverless'], reqs: ['AWS certification', '3-5 years cloud', 'Infrastructure as Code'] },
      { title: 'Systems Engineer', type: 'Full-time', minSal: 10, maxSal: 20, skills: ['Linux', 'Shell', 'Python', 'Networking', 'Docker'], reqs: ['1-3 years systems', 'Linux administration', 'Scripting skills'] },
      { title: 'Database Administrator', type: 'Full-time', minSal: 12, maxSal: 24, skills: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Backup/Recovery'], reqs: ['3-5 years DBA', 'Performance tuning', 'High availability'] },
      { title: 'Technical Support Engineer', type: 'Full-time', minSal: 5, maxSal: 12, skills: ['Troubleshooting', 'SQL', 'APIs', 'Customer Communication'], reqs: ['1-2 years support', 'Technical background', 'Communication skills'] },
      { title: 'Engineering Manager', type: 'Full-time', minSal: 60, maxSal: 100, skills: ['Engineering Leadership', 'People Management', 'Agile', 'Tech Strategy'], reqs: ['8+ years experience', 'Managed teams of 5+', 'Technical hands-on'] },
      { title: 'Tech Lead', type: 'Full-time', minSal: 45, maxSal: 75, skills: ['System Design', 'Code Review', 'Mentoring', 'Architecture', 'Agile'], reqs: ['6+ years experience', 'Lead projects', 'Mentored juniors'] },
      { title: 'Associate Software Engineer', type: 'Full-time', minSal: 5, maxSal: 10, skills: ['Java', 'Python', 'SQL', 'Git', 'Data Structures'], reqs: ['Fresh graduate', 'Good DSA', 'Internship preferred'] },
      { title: 'Software Development Intern', type: 'Internship', minSal: 0.3, maxSal: 0.8, skills: ['JavaScript', 'React', 'Python', 'Git'], reqs: ['Currently pursuing B.Tech', 'Available for 6 months', 'Coding skills'] },
      { title: 'Data Science Intern', type: 'Internship', minSal: 0.3, maxSal: 0.6, skills: ['Python', 'Pandas', 'ML', 'SQL', 'Statistics'], reqs: ['Pursuing MS/B.Tech', 'ML coursework', 'Analytical mindset'] },
      { title: 'Full Stack Developer', type: 'Full-time', minSal: 14, maxSal: 26, skills: ['React', 'Node.js', 'MongoDB', 'Express', 'AWS', 'TypeScript'], reqs: ['2-4 years full stack', 'End-to-end features', 'Cloud deployment'] },
      { title: 'Senior Full Stack Developer', type: 'Full-time', minSal: 30, maxSal: 55, skills: ['React', 'Node.js', 'PostgreSQL', 'GraphQL', 'Docker', 'Microservices'], reqs: ['5+ years full stack', 'Architecture ownership', 'Team collaboration'] },
      { title: 'Mobile Lead', type: 'Full-time', minSal: 50, maxSal: 80, skills: ['iOS/Android', 'Architecture', 'Team Leadership', 'CI/CD', 'App Performance'], reqs: ['8+ years mobile', 'Published high-scale apps', 'Led mobile teams'] },
    ];

    const locations = [
      'Bangalore, Karnataka', 'Mumbai, Maharashtra', 'Delhi', 'Gurugram, Haryana',
      'Noida, Uttar Pradesh', 'Hyderabad, Telangana', 'Chennai, Tamil Nadu',
      'Pune, Maharashtra', 'Kolkata, West Bengal', 'Ahmedabad, Gujarat',
      'Jaipur, Rajasthan', 'Chandigarh', 'Indore, Madhya Pradesh',
      'Cochin, Kerala', 'Coimbatore, Tamil Nadu',
    ];

    const descriptions = [
      'We are looking for a talented {title} to join our growing team. You will work on cutting-edge products that impact millions of users across India. This role offers great learning opportunities and career growth.',
      'Join our engineering team as a {title}. You will architect and build scalable solutions, collaborate with cross-functional teams, and drive technical excellence in everything we do.',
      'We are seeking an experienced {title} to help us build the next generation of our platform. You will take ownership of key features, mentor junior engineers, and contribute to technical decisions.',
      'Exciting opportunity for a {title} to work on high-impact projects. You will be part of a fast-paced environment where your contributions directly shape the product and user experience.',
      'As a {title}, you will design and implement robust solutions, participate in code reviews, and work closely with product and design teams to deliver world-class features.',
    ];

    const formatter = new Intl.NumberFormat('en-IN');

    const jobs = [];
    let jobId = 0;

    for (let i = 0; i < 100; i++) {
      const tpl = jobTemplates[i % jobTemplates.length];
      const company = companies[i % companies.length];
      const location = locations[i % locations.length];
      const desc = descriptions[i % descriptions.length].replace('{title}', tpl.title);
      const employer = i % 2 === 0 ? employer1._id : employer2._id;

      const minSalLakh = tpl.minSal + Math.floor(Math.random() * 10);
      const maxSalLakh = minSalLakh + 5 + Math.floor(Math.random() * 15);
      const isIntern = tpl.type === 'Internship';
      const salary = isIntern
        ? `₹${(tpl.minSal + Math.floor(Math.random() * 5)) * 1000}/month`
        : `₹${formatter.format(minSalLakh * 100000)} - ₹${formatter.format(maxSalLakh * 100000)}/year`;

      jobs.push({
        title: tpl.title,
        company,
        location,
        type: tpl.type,
        salary,
        description: desc,
        requirements: tpl.reqs,
        skills: tpl.skills,
        employer,
      });
    }

    const created = await Job.insertMany(jobs);
    console.log(`Created ${created.length} jobs`);

    const appJobs = [created[0], created[8], created[15], created[20], created[30]];
    await Application.insertMany([
      { job: appJobs[0]._id, candidate: candidate._id, coverLetter: 'I am very excited about this position. With relevant experience and a passion for technology, I believe I would be a great fit.', status: 'reviewed' },
      { job: appJobs[1]._id, candidate: candidate._id, coverLetter: 'I have been following your company for a while and would love to contribute. My skills align perfectly with this role.', status: 'pending' },
      { job: appJobs[2]._id, candidate: candidate._id, coverLetter: 'This role matches my career goals perfectly. I bring strong technical skills and a collaborative mindset.', status: 'shortlisted' },
      { job: appJobs[3]._id, candidate: candidate._id, coverLetter: 'I am confident I can add value to your team with my experience and enthusiasm.', status: 'pending' },
      { job: appJobs[4]._id, candidate: candidate._id, coverLetter: 'Excited to apply for this role. My background and skills make me a strong candidate.', status: 'accepted' },
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
