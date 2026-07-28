-- CreateTable
CREATE TABLE "Industry" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subindustry" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subindustry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobFamily" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subindustryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobFamily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeniorityLevel" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "SeniorityLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Occupation" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "jobFamilyId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "automationExposure" DOUBLE PRECISION NOT NULL,
    "remoteFriendliness" DOUBLE PRECISION NOT NULL,
    "onetSocCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Occupation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OccupationSeniority" (
    "id" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "seniorityLevelId" TEXT NOT NULL,
    "yearsExperienceMin" INTEGER NOT NULL,
    "yearsExperienceMax" INTEGER,

    CONSTRAINT "OccupationSeniority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OccupationAlias" (
    "id" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "kind" TEXT NOT NULL,

    CONSTRAINT "OccupationAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OccupationSkill" (
    "id" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "importance" DOUBLE PRECISION NOT NULL,
    "isCore" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OccupationSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT,
    "description" TEXT,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OccupationCertification" (
    "id" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "certificationId" TEXT NOT NULL,
    "frequency" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OccupationCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'USD',
    "supportLevel" TEXT NOT NULL DEFAULT 'seed',

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetroArea" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "MetroArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostOfLivingIndex" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "metroAreaId" TEXT,
    "index" DOUBLE PRECISION NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "dataStatus" TEXT NOT NULL,
    "sourceId" TEXT,

    CONSTRAINT "CostOfLivingIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryObservation" (
    "id" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "metroAreaId" TEXT,
    "seniorityRank" INTEGER NOT NULL,
    "workArrangement" TEXT NOT NULL,
    "companySize" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "equity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalComp" DOUBLE PRECISION NOT NULL,
    "sampleSize" INTEGER NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "dataStatus" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "sourceId" TEXT,

    CONSTRAINT "SalaryObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryPercentile" (
    "id" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "seniorityRank" INTEGER NOT NULL,
    "p10" DOUBLE PRECISION NOT NULL,
    "p25" DOUBLE PRECISION NOT NULL,
    "median" DOUBLE PRECISION NOT NULL,
    "p75" DOUBLE PRECISION NOT NULL,
    "p90" DOUBLE PRECISION NOT NULL,
    "mean" DOUBLE PRECISION NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "dataStatus" TEXT NOT NULL,
    "sampleSize" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "sourceId" TEXT,

    CONSTRAINT "SalaryPercentile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryHistory" (
    "id" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "medianTotalComp" DOUBLE PRECISION NOT NULL,
    "yoyChangePct" DOUBLE PRECISION,
    "dataStatus" TEXT NOT NULL,
    "sourceId" TEXT,

    CONSTRAINT "SalaryHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryForecast" (
    "id" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "yearsOut" INTEGER NOT NULL,
    "scenario" TEXT NOT NULL,
    "projectedTotalComp" DOUBLE PRECISION NOT NULL,
    "methodologyVersionId" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataStatus" TEXT NOT NULL DEFAULT 'forecast',

    CONSTRAINT "SalaryForecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmploymentStatistic" (
    "id" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "employedCount" INTEGER NOT NULL,
    "projectedGrowthPct" DOUBLE PRECISION,
    "openingsPerYear" INTEGER,
    "dataStatus" TEXT NOT NULL,
    "sourceId" TEXT,

    CONSTRAINT "EmploymentStatistic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPostingStatistic" (
    "id" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "activeOpenings" INTEGER NOT NULL,
    "postingGrowthPct" DOUBLE PRECISION NOT NULL,
    "medianDaysToFill" INTEGER,
    "dataStatus" TEXT NOT NULL,
    "sourceId" TEXT,

    CONSTRAINT "JobPostingStatistic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustryStatistic" (
    "id" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "revenueGrowthPct" DOUBLE PRECISION,
    "profitGrowthPct" DOUBLE PRECISION,
    "employmentGrowthPct" DOUBLE PRECISION,
    "dataStatus" TEXT NOT NULL,
    "sourceId" TEXT,

    CONSTRAINT "IndustryStatistic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LayoffStatistic" (
    "id" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "layoffCount" INTEGER NOT NULL,
    "companiesAffected" INTEGER,
    "dataStatus" TEXT NOT NULL,
    "sourceId" TEXT,

    CONSTRAINT "LayoffStatistic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillDemandStatistic" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "demandGrowthPct" DOUBLE PRECISION NOT NULL,
    "postingShare" DOUBLE PRECISION NOT NULL,
    "trendDirection" TEXT NOT NULL,
    "dataStatus" TEXT NOT NULL,
    "sourceId" TEXT,

    CONSTRAINT "SkillDemandStatistic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemoteWorkStatistic" (
    "id" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "remoteSharePct" DOUBLE PRECISION NOT NULL,
    "hybridSharePct" DOUBLE PRECISION NOT NULL,
    "onsiteSharePct" DOUBLE PRECISION NOT NULL,
    "dataStatus" TEXT NOT NULL,
    "sourceId" TEXT,

    CONSTRAINT "RemoteWorkStatistic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustryMomentumScore" (
    "id" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "employmentGrowthScore" DOUBLE PRECISION NOT NULL,
    "postingGrowthScore" DOUBLE PRECISION NOT NULL,
    "salaryGrowthScore" DOUBLE PRECISION NOT NULL,
    "hiringVelocityScore" DOUBLE PRECISION NOT NULL,
    "layoffRiskScore" DOUBLE PRECISION NOT NULL,
    "skillDemandScore" DOUBLE PRECISION NOT NULL,
    "automationSafetyScore" DOUBLE PRECISION NOT NULL,
    "entryLevelScore" DOUBLE PRECISION NOT NULL,
    "geographicDiversityScore" DOUBLE PRECISION NOT NULL,
    "weights" TEXT NOT NULL,
    "dataStatus" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "IndustryMomentumScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "control" TEXT NOT NULL,
    "levelType" TEXT NOT NULL,
    "annualTuitionInState" DOUBLE PRECISION,
    "annualTuitionOutState" DOUBLE PRECISION,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Major" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "Major_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationProgram" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "majorId" TEXT NOT NULL,
    "degreeLevel" TEXT NOT NULL,

    CONSTRAINT "EducationProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationOutcome" (
    "id" TEXT NOT NULL,
    "educationProgramId" TEXT,
    "majorId" TEXT NOT NULL,
    "degreeLevel" TEXT NOT NULL,
    "occupationId" TEXT,
    "entrySalaryMedian" DOUBLE PRECISION NOT NULL,
    "salaryPremiumPct" DOUBLE PRECISION,
    "timeToFirstRoleMonths" DOUBLE PRECISION,
    "employmentRatePct" DOUBLE PRECISION,
    "tenYearReturnPct" DOUBLE PRECISION,
    "twentyYearReturnPct" DOUBLE PRECISION,
    "sampleSize" INTEGER NOT NULL,
    "dataStatus" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "sourceId" TEXT,

    CONSTRAINT "EducationOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OccupationEducationRequirement" (
    "id" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "degreeLevel" TEXT NOT NULL,
    "requiresPct" DOUBLE PRECISION NOT NULL,
    "prefersPct" DOUBLE PRECISION NOT NULL,
    "dataStatus" TEXT NOT NULL,
    "sourceId" TEXT,

    CONSTRAINT "OccupationEducationRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollegeCost" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "degreeLevel" TEXT NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "years" DOUBLE PRECISION NOT NULL,
    "dataStatus" TEXT NOT NULL,
    "sourceId" TEXT,

    CONSTRAINT "CollegeCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationRoiScenario" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "label" TEXT NOT NULL,
    "degreeLevel" TEXT NOT NULL,
    "majorSlug" TEXT NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "yearsInSchool" DOUBLE PRECISION NOT NULL,
    "forgoneEarnings" DOUBLE PRECISION NOT NULL,
    "postGradSalary" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EducationRoiScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerTransition" (
    "id" TEXT NOT NULL,
    "fromOccupationId" TEXT NOT NULL,
    "toOccupationId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "salaryDeltaPct" DOUBLE PRECISION NOT NULL,
    "transitionDifficulty" DOUBLE PRECISION NOT NULL,
    "opportunityScore" DOUBLE PRECISION NOT NULL,
    "demandScore" DOUBLE PRECISION NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "compatibilityScore" DOUBLE PRECISION NOT NULL,
    "typicalTransitionMonths" DOUBLE PRECISION NOT NULL,
    "educationCommonlyRequired" TEXT,
    "postingCoOccurrence" DOUBLE PRECISION,
    "dataStatus" TEXT NOT NULL,
    "sourceId" TEXT,

    CONSTRAINT "CareerTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransitionSkillGap" (
    "id" TEXT NOT NULL,
    "transitionId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "gapType" TEXT NOT NULL,
    "postingFrequency" DOUBLE PRECISION NOT NULL,
    "salaryValue" DOUBLE PRECISION NOT NULL,
    "demandGrowth" DOUBLE PRECISION NOT NULL,
    "monthsToLearn" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TransitionSkillGap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSource" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "url" TEXT,
    "requiresApiKey" BOOLEAN NOT NULL DEFAULT false,
    "apiKeyEnvVar" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_configured',
    "description" TEXT NOT NULL,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EconomicIndicator" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "dataStatus" TEXT NOT NULL,
    "sourceId" TEXT,

    CONSTRAINT "EconomicIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataImportRun" (
    "id" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "rowsImported" INTEGER NOT NULL DEFAULT 0,
    "rowsRejected" INTEGER NOT NULL DEFAULT 0,
    "warnings" TEXT,
    "errorMessage" TEXT,

    CONSTRAINT "DataImportRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataQualityCheck" (
    "id" TEXT NOT NULL,
    "importRunId" TEXT NOT NULL,
    "checkName" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "detail" TEXT,

    CONSTRAINT "DataQualityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MethodologyVersion" (
    "id" TEXT NOT NULL,
    "scoreName" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "formula" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MethodologyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "educationStatus" TEXT,
    "currentIndustry" TEXT,
    "currentRoleSlug" TEXT,
    "location" TEXT,
    "expectedGraduationYear" INTEGER,
    "skillsCsv" TEXT,
    "salaryGoal" DOUBLE PRECISION,
    "workArrangementPref" TEXT,
    "currentSalary" DOUBLE PRECISION,
    "yearsExperience" DOUBLE PRECISION,
    "degreeLevel" TEXT,
    "major" TEXT,
    "companySize" TEXT,
    "onboardedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedOccupation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedOccupation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedComparison" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "slug" TEXT NOT NULL,
    "occupationIds" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryScenario" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "currentSalary" DOUBLE PRECISION NOT NULL,
    "yearsExperience" DOUBLE PRECISION NOT NULL,
    "annualRaisePct" DOUBLE PRECISION NOT NULL,
    "promotionEveryYears" DOUBLE PRECISION NOT NULL,
    "inflationPct" DOUBLE PRECISION NOT NULL,
    "jobChangeProbabilityPct" DOUBLE PRECISION NOT NULL,
    "locationMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "degreeLevel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaryScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "occupationId" TEXT,
    "targetSalary" DOUBLE PRECISION,
    "targetYear" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'learning',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetOccupationSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPlanItem" (
    "id" TEXT NOT NULL,
    "learningPlanId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LearningPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Industry_slug_key" ON "Industry"("slug");

-- CreateIndex
CREATE INDEX "Industry_slug_idx" ON "Industry"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subindustry_slug_key" ON "Subindustry"("slug");

-- CreateIndex
CREATE INDEX "Subindustry_industryId_idx" ON "Subindustry"("industryId");

-- CreateIndex
CREATE UNIQUE INDEX "JobFamily_slug_key" ON "JobFamily"("slug");

-- CreateIndex
CREATE INDEX "JobFamily_subindustryId_idx" ON "JobFamily"("subindustryId");

-- CreateIndex
CREATE UNIQUE INDEX "SeniorityLevel_slug_key" ON "SeniorityLevel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Occupation_slug_key" ON "Occupation"("slug");

-- CreateIndex
CREATE INDEX "Occupation_jobFamilyId_idx" ON "Occupation"("jobFamilyId");

-- CreateIndex
CREATE INDEX "Occupation_title_idx" ON "Occupation"("title");

-- CreateIndex
CREATE UNIQUE INDEX "OccupationSeniority_occupationId_seniorityLevelId_key" ON "OccupationSeniority"("occupationId", "seniorityLevelId");

-- CreateIndex
CREATE INDEX "OccupationAlias_alias_idx" ON "OccupationAlias"("alias");

-- CreateIndex
CREATE INDEX "OccupationAlias_occupationId_idx" ON "OccupationAlias"("occupationId");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- CreateIndex
CREATE INDEX "OccupationSkill_skillId_idx" ON "OccupationSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "OccupationSkill_occupationId_skillId_key" ON "OccupationSkill"("occupationId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "Certification_slug_key" ON "Certification"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "OccupationCertification_occupationId_certificationId_key" ON "OccupationCertification"("occupationId", "certificationId");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_code_idx" ON "Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Region_countryId_code_key" ON "Region"("countryId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "MetroArea_slug_key" ON "MetroArea"("slug");

-- CreateIndex
CREATE INDEX "MetroArea_regionId_idx" ON "MetroArea"("regionId");

-- CreateIndex
CREATE INDEX "CostOfLivingIndex_countryId_idx" ON "CostOfLivingIndex"("countryId");

-- CreateIndex
CREATE INDEX "CostOfLivingIndex_metroAreaId_idx" ON "CostOfLivingIndex"("metroAreaId");

-- CreateIndex
CREATE INDEX "SalaryObservation_occupationId_countryId_idx" ON "SalaryObservation"("occupationId", "countryId");

-- CreateIndex
CREATE INDEX "SalaryObservation_occupationId_seniorityRank_idx" ON "SalaryObservation"("occupationId", "seniorityRank");

-- CreateIndex
CREATE INDEX "SalaryPercentile_occupationId_countryId_seniorityRank_idx" ON "SalaryPercentile"("occupationId", "countryId", "seniorityRank");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryHistory_occupationId_countryId_year_key" ON "SalaryHistory"("occupationId", "countryId", "year");

-- CreateIndex
CREATE INDEX "SalaryForecast_occupationId_countryId_idx" ON "SalaryForecast"("occupationId", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "EmploymentStatistic_occupationId_countryId_year_key" ON "EmploymentStatistic"("occupationId", "countryId", "year");

-- CreateIndex
CREATE INDEX "JobPostingStatistic_occupationId_idx" ON "JobPostingStatistic"("occupationId");

-- CreateIndex
CREATE UNIQUE INDEX "IndustryStatistic_industryId_year_key" ON "IndustryStatistic"("industryId", "year");

-- CreateIndex
CREATE INDEX "LayoffStatistic_industryId_idx" ON "LayoffStatistic"("industryId");

-- CreateIndex
CREATE INDEX "SkillDemandStatistic_skillId_idx" ON "SkillDemandStatistic"("skillId");

-- CreateIndex
CREATE INDEX "RemoteWorkStatistic_industryId_idx" ON "RemoteWorkStatistic"("industryId");

-- CreateIndex
CREATE INDEX "IndustryMomentumScore_industryId_observedAt_idx" ON "IndustryMomentumScore"("industryId", "observedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_slug_key" ON "Institution"("slug");

-- CreateIndex
CREATE INDEX "Institution_countryId_idx" ON "Institution"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "Major_slug_key" ON "Major"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "EducationProgram_institutionId_majorId_degreeLevel_key" ON "EducationProgram"("institutionId", "majorId", "degreeLevel");

-- CreateIndex
CREATE INDEX "EducationOutcome_majorId_degreeLevel_idx" ON "EducationOutcome"("majorId", "degreeLevel");

-- CreateIndex
CREATE INDEX "EducationOutcome_occupationId_idx" ON "EducationOutcome"("occupationId");

-- CreateIndex
CREATE UNIQUE INDEX "OccupationEducationRequirement_occupationId_degreeLevel_key" ON "OccupationEducationRequirement"("occupationId", "degreeLevel");

-- CreateIndex
CREATE INDEX "CollegeCost_institutionId_idx" ON "CollegeCost"("institutionId");

-- CreateIndex
CREATE INDEX "EducationRoiScenario_userId_idx" ON "EducationRoiScenario"("userId");

-- CreateIndex
CREATE INDEX "CareerTransition_fromOccupationId_idx" ON "CareerTransition"("fromOccupationId");

-- CreateIndex
CREATE INDEX "CareerTransition_toOccupationId_idx" ON "CareerTransition"("toOccupationId");

-- CreateIndex
CREATE UNIQUE INDEX "CareerTransition_fromOccupationId_toOccupationId_key" ON "CareerTransition"("fromOccupationId", "toOccupationId");

-- CreateIndex
CREATE UNIQUE INDEX "TransitionSkillGap_transitionId_skillId_key" ON "TransitionSkillGap"("transitionId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_slug_key" ON "DataSource"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "EconomicIndicator_slug_key" ON "EconomicIndicator"("slug");

-- CreateIndex
CREATE INDEX "DataImportRun_dataSourceId_idx" ON "DataImportRun"("dataSourceId");

-- CreateIndex
CREATE INDEX "DataQualityCheck_importRunId_idx" ON "DataQualityCheck"("importRunId");

-- CreateIndex
CREATE UNIQUE INDEX "MethodologyVersion_scoreName_version_key" ON "MethodologyVersion"("scoreName", "version");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedOccupation_userId_occupationId_key" ON "SavedOccupation"("userId", "occupationId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedComparison_slug_key" ON "SavedComparison"("slug");

-- CreateIndex
CREATE INDEX "SavedComparison_userId_idx" ON "SavedComparison"("userId");

-- CreateIndex
CREATE INDEX "SalaryScenario_userId_idx" ON "SalaryScenario"("userId");

-- CreateIndex
CREATE INDEX "CareerGoal_userId_idx" ON "CareerGoal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkill_userId_skillId_key" ON "UserSkill"("userId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPlanItem_learningPlanId_skillId_key" ON "LearningPlanItem"("learningPlanId", "skillId");

-- AddForeignKey
ALTER TABLE "Subindustry" ADD CONSTRAINT "Subindustry_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobFamily" ADD CONSTRAINT "JobFamily_subindustryId_fkey" FOREIGN KEY ("subindustryId") REFERENCES "Subindustry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Occupation" ADD CONSTRAINT "Occupation_jobFamilyId_fkey" FOREIGN KEY ("jobFamilyId") REFERENCES "JobFamily"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupationSeniority" ADD CONSTRAINT "OccupationSeniority_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupationSeniority" ADD CONSTRAINT "OccupationSeniority_seniorityLevelId_fkey" FOREIGN KEY ("seniorityLevelId") REFERENCES "SeniorityLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupationAlias" ADD CONSTRAINT "OccupationAlias_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupationSkill" ADD CONSTRAINT "OccupationSkill_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupationSkill" ADD CONSTRAINT "OccupationSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupationCertification" ADD CONSTRAINT "OccupationCertification_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupationCertification" ADD CONSTRAINT "OccupationCertification_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetroArea" ADD CONSTRAINT "MetroArea_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostOfLivingIndex" ADD CONSTRAINT "CostOfLivingIndex_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostOfLivingIndex" ADD CONSTRAINT "CostOfLivingIndex_metroAreaId_fkey" FOREIGN KEY ("metroAreaId") REFERENCES "MetroArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostOfLivingIndex" ADD CONSTRAINT "CostOfLivingIndex_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryObservation" ADD CONSTRAINT "SalaryObservation_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryObservation" ADD CONSTRAINT "SalaryObservation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryObservation" ADD CONSTRAINT "SalaryObservation_metroAreaId_fkey" FOREIGN KEY ("metroAreaId") REFERENCES "MetroArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryObservation" ADD CONSTRAINT "SalaryObservation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryPercentile" ADD CONSTRAINT "SalaryPercentile_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryPercentile" ADD CONSTRAINT "SalaryPercentile_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryHistory" ADD CONSTRAINT "SalaryHistory_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryHistory" ADD CONSTRAINT "SalaryHistory_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryForecast" ADD CONSTRAINT "SalaryForecast_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryForecast" ADD CONSTRAINT "SalaryForecast_methodologyVersionId_fkey" FOREIGN KEY ("methodologyVersionId") REFERENCES "MethodologyVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentStatistic" ADD CONSTRAINT "EmploymentStatistic_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentStatistic" ADD CONSTRAINT "EmploymentStatistic_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentStatistic" ADD CONSTRAINT "EmploymentStatistic_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPostingStatistic" ADD CONSTRAINT "JobPostingStatistic_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPostingStatistic" ADD CONSTRAINT "JobPostingStatistic_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryStatistic" ADD CONSTRAINT "IndustryStatistic_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryStatistic" ADD CONSTRAINT "IndustryStatistic_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayoffStatistic" ADD CONSTRAINT "LayoffStatistic_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayoffStatistic" ADD CONSTRAINT "LayoffStatistic_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillDemandStatistic" ADD CONSTRAINT "SkillDemandStatistic_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillDemandStatistic" ADD CONSTRAINT "SkillDemandStatistic_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemoteWorkStatistic" ADD CONSTRAINT "RemoteWorkStatistic_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemoteWorkStatistic" ADD CONSTRAINT "RemoteWorkStatistic_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryMomentumScore" ADD CONSTRAINT "IndustryMomentumScore_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Institution" ADD CONSTRAINT "Institution_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationProgram" ADD CONSTRAINT "EducationProgram_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationProgram" ADD CONSTRAINT "EducationProgram_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "Major"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationOutcome" ADD CONSTRAINT "EducationOutcome_educationProgramId_fkey" FOREIGN KEY ("educationProgramId") REFERENCES "EducationProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationOutcome" ADD CONSTRAINT "EducationOutcome_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "Major"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationOutcome" ADD CONSTRAINT "EducationOutcome_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationOutcome" ADD CONSTRAINT "EducationOutcome_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupationEducationRequirement" ADD CONSTRAINT "OccupationEducationRequirement_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupationEducationRequirement" ADD CONSTRAINT "OccupationEducationRequirement_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollegeCost" ADD CONSTRAINT "CollegeCost_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollegeCost" ADD CONSTRAINT "CollegeCost_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationRoiScenario" ADD CONSTRAINT "EducationRoiScenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerTransition" ADD CONSTRAINT "CareerTransition_fromOccupationId_fkey" FOREIGN KEY ("fromOccupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerTransition" ADD CONSTRAINT "CareerTransition_toOccupationId_fkey" FOREIGN KEY ("toOccupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerTransition" ADD CONSTRAINT "CareerTransition_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransitionSkillGap" ADD CONSTRAINT "TransitionSkillGap_transitionId_fkey" FOREIGN KEY ("transitionId") REFERENCES "CareerTransition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransitionSkillGap" ADD CONSTRAINT "TransitionSkillGap_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EconomicIndicator" ADD CONSTRAINT "EconomicIndicator_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataImportRun" ADD CONSTRAINT "DataImportRun_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataQualityCheck" ADD CONSTRAINT "DataQualityCheck_importRunId_fkey" FOREIGN KEY ("importRunId") REFERENCES "DataImportRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedOccupation" ADD CONSTRAINT "SavedOccupation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedOccupation" ADD CONSTRAINT "SavedOccupation_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedComparison" ADD CONSTRAINT "SavedComparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryScenario" ADD CONSTRAINT "SalaryScenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryScenario" ADD CONSTRAINT "SalaryScenario_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerGoal" ADD CONSTRAINT "CareerGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerGoal" ADD CONSTRAINT "CareerGoal_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPlan" ADD CONSTRAINT "LearningPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPlanItem" ADD CONSTRAINT "LearningPlanItem_learningPlanId_fkey" FOREIGN KEY ("learningPlanId") REFERENCES "LearningPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPlanItem" ADD CONSTRAINT "LearningPlanItem_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
