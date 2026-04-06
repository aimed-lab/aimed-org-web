CREATE TABLE IF NOT EXISTS "PersonProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "shortBio" TEXT,
    "headshot" TEXT,
    "email" TEXT,
    "googleScholar" TEXT,
    "orcid" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "cvUrl" TEXT,
    "featuredMetrics" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE IF NOT EXISTS "Appointment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "institution" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "type" TEXT NOT NULL,
    "location" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "Grant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agency" TEXT NOT NULL,
    "mechanism" TEXT,
    "title" TEXT NOT NULL,
    "role" TEXT,
    "amount" REAL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "collaborators" TEXT,
    "status" TEXT,
    "piName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "Talk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "venue" TEXT,
    "host" TEXT,
    "city" TEXT,
    "country" TEXT,
    "date" DATETIME,
    "talkType" TEXT,
    "slidesUrl" TEXT,
    "videoUrl" TEXT,
    "topic" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "Honor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "awardName" TEXT NOT NULL,
    "year" INTEGER,
    "category" TEXT,
    "issuer" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "Patent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "year" INTEGER,
    "inventors" TEXT,
    "filingInfo" TEXT,
    "relatedResearch" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "NewsItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME,
    "headline" TEXT NOT NULL,
    "summary" TEXT,
    "imageUrl" TEXT,
    "link" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "PhotoAsset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "caption" TEXT,
    "date" DATETIME,
    "tags" TEXT,
    "galleryGroup" TEXT,
    "sourceUrl" TEXT,
    "altText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "InquirySubmission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "interestArea" TEXT,
    "message" TEXT,
    "attachmentUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
, "attachments" TEXT, "aiAnalysis" TEXT, "aiScore" INTEGER, "aiScoreBreakdown" TEXT, "aiScoredAt" DATETIME, "manualNotes" TEXT, "manualScore" INTEGER, "priority" TEXT);
CREATE TABLE IF NOT EXISTS "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'APPLICANT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE IF NOT EXISTS "ActivationCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "memberId" INTEGER NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" DATETIME,
    "expiresAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivationCode_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "LabMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "QuarterlyGoal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "quarter" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL, "url" TEXT,
    CONSTRAINT "QuarterlyGoal_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "LabMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ActivationCode_code_key" ON "ActivationCode"("code");
CREATE UNIQUE INDEX "ActivationCode_memberId_key" ON "ActivationCode"("memberId");
CREATE TABLE IF NOT EXISTS "MemberPaper" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT,
    "year" INTEGER,
    "journal" TEXT,
    "url" TEXT,
    "doi" TEXT,
    "pubmedId" TEXT,
    "scholarUrl" TEXT,
    "pdfPath" TEXT,
    "citation" TEXT,
    "notes" TEXT,
    "tags" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MemberPaper_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "LabMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "MemberCompliance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "docType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "issuer" TEXT,
    "fileUrl" TEXT,
    "expiresAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "protocolNum" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MemberCompliance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "LabMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "MemberWatch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "watchType" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'PUBMED',
    "frequency" TEXT NOT NULL DEFAULT 'WEEKLY',
    "lastChecked" DATETIME,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MemberWatch_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "LabMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "ContentSubmission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContentSubmission_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "LabMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "MagicCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "MagicCode_email_code_idx" ON "MagicCode"("email", "code");
CREATE TABLE IF NOT EXISTS "MemberDataset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT NOT NULL DEFAULT 'LOCAL',
    "doi" TEXT,
    "url" TEXT,
    "filePath" TEXT,
    "mcpServer" TEXT,
    "format" TEXT,
    "size" TEXT,
    "tags" TEXT,
    "curationStatus" TEXT NOT NULL DEFAULT 'PROVISIONAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MemberDataset_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "LabMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "MemberTool" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "toolType" TEXT NOT NULL DEFAULT 'GITHUB',
    "url" TEXT,
    "githubRepo" TEXT,
    "dockerImage" TEXT,
    "apiEndpoint" TEXT,
    "mcpServer" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "tags" TEXT,
    "curationStatus" TEXT NOT NULL DEFAULT 'PROVISIONAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MemberTool_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "LabMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Publication" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "journal" TEXT,
    "abstract" TEXT,
    "doi" TEXT,
    "pubmedId" TEXT,
    "arxivId" TEXT,
    "pdfUrl" TEXT,
    "tags" TEXT,
    "researchLineage" TEXT,
    "articleType" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "curationStatus" TEXT NOT NULL DEFAULT 'VERIFIED',
    "sourceCV" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "SoftwareResource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "githubUrl" TEXT,
    "screenshotUrl" TEXT,
    "relatedPapers" TEXT,
    "category" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "curationStatus" TEXT NOT NULL DEFAULT 'VERIFIED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "OnboardingProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "moduleId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OnboardingProgress_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "LabMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "OnboardingProgress_memberId_moduleId_key" ON "OnboardingProgress"("memberId", "moduleId");
CREATE TABLE IF NOT EXISTS "LabMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joinDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "resumeUrl" TEXT,
    "boxFolderId" TEXT,
    "boxFolderUrl" TEXT,
    "notionPageUrl" TEXT,
    "githubUsername" TEXT,
    "headshot" TEXT,
    "bio" TEXT,
    "passwordHash" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "orcidId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "LabMember_email_key" ON "LabMember"("email");
CREATE TABLE IF NOT EXISTS "ProjectTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "dueDate" DATETIME,
    "category" TEXT,
    "year" TEXT,
    "period" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectTask_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "LabMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
