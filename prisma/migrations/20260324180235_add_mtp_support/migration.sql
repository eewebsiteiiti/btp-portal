-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roll_no" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "submit_status" BOOLEAN NOT NULL DEFAULT false,
    "cpi" REAL,
    "program" TEXT NOT NULL DEFAULT 'BTP',
    "domain" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "professors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "student_limit" INTEGER NOT NULL DEFAULT 4,
    "submit_status" BOOLEAN NOT NULL DEFAULT false,
    "students_preference" TEXT NOT NULL DEFAULT '{}',
    "mtp_submit_status" BOOLEAN NOT NULL DEFAULT false,
    "mtp_students_preference" TEXT NOT NULL DEFAULT '{}',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "project_no" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "nature_of_work" TEXT NOT NULL,
    "comments" TEXT NOT NULL,
    "supervisor" TEXT NOT NULL,
    "cosupervisor" TEXT,
    "supervisor_email" TEXT NOT NULL,
    "drop_project" BOOLEAN NOT NULL DEFAULT false,
    "program" TEXT NOT NULL DEFAULT 'BTP',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "professor_id" TEXT,
    CONSTRAINT "projects_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_index" INTEGER NOT NULL,
    "is_group" BOOLEAN NOT NULL DEFAULT false,
    "partner_roll_number" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "student_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "preferences_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "preferences_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "assigned_projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "student_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    CONSTRAINT "assigned_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "assigned_projects_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "admin_controls" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submit_enable_student_projects" BOOLEAN NOT NULL DEFAULT false,
    "submit_enable_professor_students" BOOLEAN NOT NULL DEFAULT false,
    "project_view_enable_student" BOOLEAN NOT NULL DEFAULT false,
    "student_view_enable_professor" BOOLEAN NOT NULL DEFAULT false,
    "student_view_result" BOOLEAN NOT NULL DEFAULT false,
    "professor_view_result" BOOLEAN NOT NULL DEFAULT false,
    "min_capacity" INTEGER NOT NULL DEFAULT 3,
    "max_capacity" INTEGER NOT NULL DEFAULT 4
);

-- CreateTable
CREATE TABLE "mtp_admin_controls" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "submit_enable_student_projects" BOOLEAN NOT NULL DEFAULT false,
    "submit_enable_professor_students" BOOLEAN NOT NULL DEFAULT false,
    "project_view_enable_student" BOOLEAN NOT NULL DEFAULT false,
    "student_view_enable_professor" BOOLEAN NOT NULL DEFAULT false,
    "student_view_result" BOOLEAN NOT NULL DEFAULT false,
    "professor_view_result" BOOLEAN NOT NULL DEFAULT false,
    "min_capacity" INTEGER NOT NULL DEFAULT 3,
    "max_capacity" INTEGER NOT NULL DEFAULT 4
);

-- CreateTable
CREATE TABLE "program_coordinators" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "students_roll_no_key" ON "students"("roll_no");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "professors_email_key" ON "professors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "preferences_student_id_project_id_key" ON "preferences"("student_id", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "assigned_projects_student_id_key" ON "assigned_projects"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "mtp_admin_controls_domain_key" ON "mtp_admin_controls"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "program_coordinators_email_key" ON "program_coordinators"("email");
