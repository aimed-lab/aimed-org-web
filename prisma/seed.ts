import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

import { resolve } from "path"
const dbPath = resolve(__dirname, "..", "dev.db")
const adapter = new PrismaLibSql({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // ─── Person Profile ──────────────────────────────────────────────
  await prisma.personProfile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Jake Y. Chen",
      title: "Triton Endowed Professor of Biomedical Informatics and Data Science",
      bio: "Prof. Jake Y. Chen is the Triton Endowed Professor of Biomedical Informatics and Data Science at UAB, with joint appointments in the Departments of Genetics, Computer Science, and Biomedical Engineering. He is the founding director of the Informatics Institute's Secure Patient-centric Analyses and Research Computing (SPARC) platform. With over 25 years of experience advancing AI-driven biomedical informatics, network and systems biology, and computational drug discovery, Prof. Chen has authored more than 200 peer-reviewed publications, delivered over 200 invited talks worldwide, and secured more than 60 grants totaling over $100 million since 2004. His research spans rigorous methods, deployable software, broad collaboration, and long-horizon training at the intersection of AI, systems pharmacology, translational informatics, and precision medicine.",
      shortBio: "25+ years advancing AI-driven biomedical informatics, network/systems biology, and computational drug discovery. 200+ publications, 200+ invited talks, >$100M in grants.",
      email: "jakechen@uab.edu",
      googleScholar: "https://scholar.google.com/citations?user=PLACEHOLDER",
      orcid: "https://orcid.org/0000-0002-PLACEHOLDER",
      linkedin: "https://www.linkedin.com/in/jakeychen",
      github: "https://github.com/aimed-lab",
      cvUrl: "/uploads/cv/CV_Jake_Chen_2026.pdf",
      featuredMetrics: JSON.stringify({
        publications: "200+",
        talks: "200+",
        grants: ">$100M",
        years: "25+",
      }),
    },
  })

  // ─── Education ───────────────────────────────────────────────────
  const appointments = [
    { institution: "Beijing No. 4 High School", role: "Student", department: null, startYear: 1985, endYear: 1988, type: "EDUCATION", location: "Beijing, China", sortOrder: 1 },
    { institution: "Peking University", role: "B.S. in Computer Science", department: "Department of Computer Science", startYear: 1988, endYear: 1993, type: "EDUCATION", location: "Beijing, China", sortOrder: 2 },
    { institution: "University of Minnesota", role: "M.S. in Computer Science & Engineering", department: "Department of Computer Science & Engineering", startYear: 1996, endYear: 1998, type: "EDUCATION", location: "Minneapolis, MN", sortOrder: 3 },
    { institution: "University of Minnesota", role: "Ph.D. in Computer Science & Engineering", department: "Department of Computer Science & Engineering", startYear: 1998, endYear: 2002, type: "EDUCATION", location: "Minneapolis, MN", sortOrder: 4 },
    { institution: "Affymetrix Inc.", role: "Bioinformatics Scientist", department: null, startYear: 2002, endYear: 2004, type: "INDUSTRY", location: "Santa Clara, CA", sortOrder: 5 },
    { institution: "Indiana University–Purdue University Indianapolis", role: "Assistant Professor", department: "School of Informatics", startYear: 2004, endYear: 2010, type: "FACULTY", location: "Indianapolis, IN", sortOrder: 6 },
    { institution: "Indiana University–Purdue University Indianapolis", role: "Associate Professor", department: "School of Informatics and Computing", startYear: 2010, endYear: 2015, type: "FACULTY", location: "Indianapolis, IN", sortOrder: 7 },
    { institution: "Wenzhou Medical University", role: "Founding Dean, Institute of Informatics", department: "Institute of Informatics", startYear: 2015, endYear: 2018, type: "FACULTY", location: "Wenzhou, China", sortOrder: 8 },
    { institution: "University of Alabama at Birmingham", role: "Professor and Founding Director of SPARC", department: "Department of Biomedical Informatics and Data Science", startYear: 2018, endYear: null, type: "FACULTY", location: "Birmingham, AL", sortOrder: 9 },
    { institution: "University of Alabama at Birmingham", role: "Triton Endowed Professor", department: "Department of Biomedical Informatics and Data Science", startYear: 2022, endYear: null, type: "FACULTY", location: "Birmingham, AL", sortOrder: 10 },
  ]
  for (const appt of appointments) {
    await prisma.appointment.create({ data: appt })
  }

  // ─── Honors ──────────────────────────────────────────────────────
  const honors = [
    { awardName: "ACM Distinguished Scientist", year: 2019, category: "Professional Society", issuer: "Association for Computing Machinery (ACM)", description: "Recognized for significant contributions to computing" },
    { awardName: "Fellow, American Institute for Medical and Biological Engineering (AIMBE)", year: 2021, category: "Fellowship", issuer: "AIMBE", description: "Elected for contributions to biomedical engineering and informatics" },
    { awardName: "Fellow, American Medical Informatics Association (AMIA)", year: 2018, category: "Fellowship", issuer: "AMIA", description: "Recognized for excellence in biomedical informatics" },
    { awardName: "Fellow, American College of Medical Informatics (ACMI)", year: 2020, category: "Fellowship", issuer: "ACMI", description: "Elected to the most selective honorary college in biomedical informatics" },
    { awardName: "CAST-USA Pioneer Award", year: 2017, category: "Leadership", issuer: "Chinese Association for Science and Technology – USA", description: "Honored for pioneering contributions to science and technology" },
    { awardName: "Top 100 AI Leaders in Drug Discovery and Advanced Healthcare", year: 2023, category: "Leadership", issuer: "Deep Pharma Intelligence", description: "Named among the world's top AI leaders in drug discovery" },
    { awardName: "Triton Endowed Professorship", year: 2022, category: "Endowed Chair", issuer: "University of Alabama at Birmingham", description: "Named endowed professor in biomedical informatics and data science" },
  ]
  for (const honor of honors) {
    await prisma.honor.create({ data: honor })
  }

  // ─── Sample Publications ─────────────────────────────────────────
  const publications = [
    { title: "Network-based Drug Repurposing for Human Coronavirus", authors: "Chen JY, Zhou Y, et al.", year: 2020, journal: "Nature Communications", abstract: "We present a network medicine methodology for systematic identification of potential drug repurposing candidates against SARS-CoV-2.", doi: "10.1038/s41467-020-XXXXX", tags: '["Drug Discovery","Knowledge Networks","COVID-19"]', researchLineage: "Systems Pharmacology & Drug Discovery", articleType: "Journal Article", featured: true },
    { title: "Deep Learning Approaches for Biomedical Knowledge Graph Completion", authors: "Chen JY, Zhang L, et al.", year: 2023, journal: "Bioinformatics", abstract: "A deep learning framework for completing biomedical knowledge graphs to support drug discovery and disease understanding.", doi: "10.1093/bioinformatics/btad001", tags: '["AI/ML","Knowledge Networks","Drug Discovery"]', researchLineage: "Biomedical Knowledge Networks", articleType: "Journal Article", featured: true },
    { title: "Biomedical Knowledge Graph Construction and Applications in Drug Discovery", authors: "Chen JY, Wang X, et al.", year: 2022, journal: "Briefings in Bioinformatics", abstract: "A comprehensive review of biomedical knowledge graph construction methods and their applications in computational drug discovery.", doi: "10.1093/bib/bbac001", tags: '["Knowledge Networks","Drug Discovery","Review"]', researchLineage: "Biomedical Knowledge Networks", articleType: "Review", featured: true },
    { title: "Multi-omics Integration for Precision Oncology Using Graph Neural Networks", authors: "Chen JY, Li S, et al.", year: 2024, journal: "Nature Methods", abstract: "An integrative multi-omics framework using graph neural networks for patient stratification and precision treatment selection in oncology.", doi: "10.1038/s41592-024-XXXXX", tags: '["Multi-omics","AI/ML","Precision Medicine"]', researchLineage: "Multi-omics & Interpretable AI", articleType: "Journal Article", featured: true },
    { title: "Digital Twin Modeling for Personalized Drug Response Prediction", authors: "Chen JY, Kumar A, et al.", year: 2024, journal: "npj Digital Medicine", abstract: "A computational digital twin framework that integrates multi-scale patient data for predicting individualized drug responses.", doi: "10.1038/s41746-024-XXXXX", tags: '["Digital Twins","Drug Discovery","Precision Medicine"]', researchLineage: "Digital Twins & Precision Medicine", articleType: "Journal Article", featured: true },
    { title: "GeneTerrainMap: Terrain-based Visualization for Large-scale Gene Expression Analysis", authors: "Chen JY, Zhao Y, et al.", year: 2019, journal: "BMC Bioinformatics", abstract: "A novel terrain-based visualization method that enables intuitive exploration of large-scale gene expression datasets.", doi: "10.1186/s12859-019-XXXX", tags: '["Visualization","Multi-omics","Bioinformatics"]', researchLineage: "Multi-omics & Interpretable AI", articleType: "Journal Article", featured: false },
    { title: "Systems Pharmacology Approaches for Target Identification in Alzheimer's Disease", authors: "Chen JY, Liu J, et al.", year: 2021, journal: "Pharmacological Reviews", abstract: "A systems pharmacology framework integrating multi-omics and network biology for identifying novel drug targets in neurodegeneration.", doi: "10.1124/pharmrev.121.XXXXX", tags: '["Systems Pharmacology","Drug Discovery","Neuroscience"]', researchLineage: "Systems Pharmacology & Drug Discovery", articleType: "Review", featured: false },
    { title: "HAPPI: Human Annotated and Predicted Protein Interaction Database", authors: "Chen JY, Mamidipalli S, et al.", year: 2009, journal: "BMC Genomics", abstract: "A comprehensive database of human protein-protein interactions integrating experimental and computational annotations.", doi: "10.1186/1471-2164-10-S1-S16", tags: '["Knowledge Networks","Bioinformatics","Database"]', researchLineage: "Biomedical Knowledge Networks", articleType: "Journal Article", featured: false },
    { title: "Translational Bioinformatics: Coming of Age", authors: "Chen JY, Sarkar IN, Butte AJ", year: 2012, journal: "Journal of the American Medical Informatics Association", abstract: "A perspective on the emergence and future of translational bioinformatics as a discipline.", doi: "10.1136/amiajnl-2012-XXXXX", tags: '["Bioinformatics","Review","Translational"]', researchLineage: "Translational Data Infrastructure", articleType: "Editorial", featured: false },
    { title: "AI-Enabled Drug Discovery Pipeline Using Knowledge Graphs and Molecular Simulations", authors: "Chen JY, Zhang W, et al.", year: 2025, journal: "Nature Biotechnology", abstract: "An end-to-end AI pipeline integrating biomedical knowledge graphs with molecular dynamics simulations for accelerated drug candidate identification.", doi: "10.1038/s41587-025-XXXXX", tags: '["AI/ML","Drug Discovery","Knowledge Networks"]', researchLineage: "Systems Pharmacology & Drug Discovery", articleType: "Journal Article", featured: true },
  ]
  for (const pub of publications) {
    await prisma.publication.create({ data: pub })
  }

  // ─── Sample Talks ────────────────────────────────────────────────
  const talks = [
    { title: "AI-Driven Drug Discovery: From Knowledge Graphs to Clinical Translation", venue: "Gordon Research Conference on Computer-Aided Drug Design", host: "GRC", city: "West Dover", country: "USA", date: new Date("2024-07-15"), talkType: "Keynote", topic: "Drug Discovery" },
    { title: "Biomedical Knowledge Networks for Precision Medicine", venue: "AMIA Annual Symposium", host: "American Medical Informatics Association", city: "San Francisco", country: "USA", date: new Date("2023-11-12"), talkType: "Invited Talk", topic: "Knowledge Networks" },
    { title: "Digital Twins in Healthcare: Current State and Future Directions", venue: "NIH Workshop on Digital Twins", host: "National Institutes of Health", city: "Bethesda", country: "USA", date: new Date("2024-03-20"), talkType: "Invited Talk", topic: "Digital Twins" },
    { title: "Systems Pharmacology and Network Medicine", venue: "International Conference on Bioinformatics", host: "InCoB", city: "Seoul", country: "South Korea", date: new Date("2022-09-25"), talkType: "Keynote", topic: "Systems Pharmacology" },
    { title: "Multi-omics Visualization for Interpretable AI in Biomedicine", venue: "ACM BCB Conference", host: "ACM", city: "Boston", country: "USA", date: new Date("2023-08-07"), talkType: "Invited Talk", topic: "AI/ML" },
    { title: "Computational Drug Repurposing in the Post-COVID Era", venue: "World Molecular Imaging Congress", host: "WMIC", city: "Prague", country: "Czech Republic", date: new Date("2022-05-18"), talkType: "Plenary", topic: "Drug Discovery" },
    { title: "Building Biomedical Data Ecosystems at Scale", venue: "Pacific Symposium on Biocomputing", host: "PSB", city: "Kohala Coast", country: "USA", date: new Date("2024-01-05"), talkType: "Invited Talk", topic: "Data Infrastructure" },
    { title: "AI and Translational Informatics in Precision Oncology", venue: "Peking University Health Science Center", host: "Peking University", city: "Beijing", country: "China", date: new Date("2023-06-20"), talkType: "Distinguished Lecture", topic: "Precision Medicine" },
  ]
  for (const talk of talks) {
    await prisma.talk.create({ data: talk })
  }

  // ─── Software Resources ──────────────────────────────────────────
  const software = [
    { name: "HAPPI", description: "Human Annotated and Predicted Protein Interaction database — a comprehensive resource integrating experimental and computationally predicted human protein-protein interactions.", url: "https://happi.imed.ecm.uab.edu", category: "Database", featured: true },
    { name: "GeneTerrainMap", description: "Terrain-based visualization tool for exploring large-scale gene expression datasets, enabling intuitive pattern discovery across conditions and samples.", githubUrl: "https://github.com/aimed-lab/geneterrainmap", category: "Visualization", featured: true },
    { name: "DrugSIGNS", description: "Drug discovery platform using network-based gene signatures for systematic identification of drug repurposing opportunities and novel therapeutic candidates.", category: "Drug Discovery", featured: true },
    { name: "BioKG Explorer", description: "Interactive biomedical knowledge graph exploration platform supporting multi-relational queries across drugs, diseases, genes, and pathways.", category: "Knowledge Graph", featured: true },
    { name: "OmicsViz", description: "Multi-omics data visualization toolkit providing interactive dashboards for integrated analysis of genomic, transcriptomic, proteomic, and metabolomic data.", githubUrl: "https://github.com/aimed-lab/omicsviz", category: "Visualization", featured: false },
    { name: "DigitalTwin-Rx", description: "Patient digital twin framework for predicting individual drug responses using multi-scale computational modeling and machine learning.", category: "Precision Medicine", featured: true },
  ]
  for (const sw of software) {
    await prisma.softwareResource.create({ data: sw })
  }

  // ─── Patents ─────────────────────────────────────────────────────
  await prisma.patent.create({
    data: {
      title: "Systems and Methods for AI-Enabled Drug Target Identification Using Knowledge Graphs",
      year: 2025,
      inventors: "Jake Y. Chen, et al.",
      filingInfo: "US Patent Application, 2025",
      relatedResearch: "Systems Pharmacology & Drug Discovery",
    },
  })

  // ─── News Items ──────────────────────────────────────────────────
  const news = [
    { headline: "AI.MED Lab Receives NIH R01 Grant for Digital Twin Research", summary: "The lab has been awarded a major NIH R01 grant to develop computational digital twin models for personalized drug response prediction.", date: new Date("2024-03-15"), pinned: true, published: true },
    { headline: "Prof. Chen Named Top 100 AI Leaders in Drug Discovery", summary: "Deep Pharma Intelligence has named Prof. Jake Y. Chen among the world's Top 100 AI Leaders in Drug Discovery and Advanced Healthcare.", date: new Date("2023-11-20"), pinned: false, published: true },
    { headline: "New Publication in Nature Methods on Multi-omics Integration", summary: "Our latest work on graph neural network-based multi-omics integration for precision oncology has been published in Nature Methods.", date: new Date("2024-01-10"), pinned: false, published: true },
    { headline: "PhD Student Wins Best Paper Award at AMIA Annual Symposium", summary: "Congratulations to our doctoral student for receiving the Best Paper Award at the AMIA 2024 Annual Symposium for work on biomedical knowledge graphs.", date: new Date("2024-02-28"), pinned: false, published: true },
    { headline: "SPARC Computational Core Expanded", summary: "The SPARC (Secure Patient-centric Analyses and Research Computing) platform has expanded its computational infrastructure to support AI-driven biomedical research at UAB.", date: new Date("2023-09-01"), pinned: false, published: true },
    { headline: "Now Recruiting: PhD Students for AI-Driven Drug Discovery", summary: "AI.MED is actively recruiting motivated PhD students interested in computational drug discovery, knowledge graphs, and AI methods for translational medicine.", date: new Date("2024-06-01"), pinned: true, published: true },
  ]
  for (const item of news) {
    await prisma.newsItem.create({ data: item })
  }

  // ─── Sample Grants ───────────────────────────────────────────────
  const grants = [
    { agency: "NIH/NCI", mechanism: "R01", title: "AI-Enabled Digital Twin Models for Precision Oncology Drug Response", role: "PI", amount: 2500000, startDate: new Date("2024-01-01"), endDate: new Date("2028-12-31"), status: "Active", piName: "Jake Y. Chen" },
    { agency: "NIH/NIGMS", mechanism: "R01", title: "Network-Based Systems Pharmacology for Multi-Target Drug Discovery", role: "PI", amount: 1800000, startDate: new Date("2022-04-01"), endDate: new Date("2026-03-31"), status: "Active", piName: "Jake Y. Chen" },
    { agency: "NIH/NLM", mechanism: "R01", title: "Biomedical Knowledge Graph Construction and Semantic Search", role: "PI", amount: 1200000, startDate: new Date("2020-07-01"), endDate: new Date("2024-06-30"), status: "Completed", piName: "Jake Y. Chen" },
    { agency: "NSF", mechanism: "CISE", title: "Interpretable AI Methods for Multi-omics Data Integration", role: "PI", amount: 900000, startDate: new Date("2021-09-01"), endDate: new Date("2025-08-31"), status: "Active", piName: "Jake Y. Chen" },
  ]
  for (const grant of grants) {
    await prisma.grant.create({ data: grant })
  }

  // ─── Admin User ──────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "admin@aimed-lab.org" },
    update: {},
    create: {
      email: "admin@aimed-lab.org",
      password: "changeme123", // TODO: hash in production
      name: "Admin",
      role: "ADMIN",
    },
  })

  console.log("Seeding completed successfully!")
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
