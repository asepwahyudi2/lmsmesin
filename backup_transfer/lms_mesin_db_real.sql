/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.3.2-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: lms_mesin_db
-- ------------------------------------------------------
-- Server version	12.3.2-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `ActivityLog`
--

DROP TABLE IF EXISTS `ActivityLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ActivityLog` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `action` varchar(191) NOT NULL,
  `details` varchar(191) DEFAULT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `ActivityLog_userId_idx` (`userId`),
  CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ActivityLog`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ActivityLog` WRITE;
/*!40000 ALTER TABLE `ActivityLog` DISABLE KEYS */;
INSERT INTO `ActivityLog` VALUES
('cmrrivp5s0001oteliyzeoctp','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 08:17:11.968'),
('cmrrjj2v00005otelq92ew1b0','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 08:35:22.813'),
('cmrrjjuga0009otelpt9lhxo4','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 08:35:58.570'),
('cmrrjnb6a000dotelmmcao3i3','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 08:38:40.210'),
('cmrrjpwjb00011jtqkof1soa7','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 08:40:41.208'),
('cmrrjvvzp0001zck2qqzm8vkz','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 08:45:20.437'),
('cmrrk2kr30001h13f1zkj11cx','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 08:50:32.461'),
('cmrrl8fr80003h13fl46qi66b','cmrriviu50001b2hlijewke44','LOGIN','{\"email\":\"guru@lms.local\"}',NULL,'2026-07-19 09:23:05.540'),
('cmrro5jn20005h13f1q7cxj3a','cmrriviu50001b2hlijewke44','LOGIN','{\"email\":\"guru@lms.local\"}',NULL,'2026-07-19 10:44:49.454'),
('cmrrwuh2m0007h13f6q5do7bb','cmrriviu50001b2hlijewke44','LOGIN','{\"email\":\"guru@lms.local\"}',NULL,'2026-07-19 14:48:09.455'),
('cmrrwus9j0009h13fgrd04631','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 14:48:23.959'),
('cmrrwvr8n000ch13fjg4ltj6z','cmrrwvi72000ah13fi0liz374','LOGIN','{\"email\":\"asep@asep\"}',NULL,'2026-07-19 14:49:09.288');
/*!40000 ALTER TABLE `ActivityLog` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Announcement`
--

DROP TABLE IF EXISTS `Announcement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Announcement` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `content` varchar(191) NOT NULL,
  `category` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Announcement`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Announcement` WRITE;
/*!40000 ALTER TABLE `Announcement` DISABLE KEYS */;
INSERT INTO `Announcement` VALUES
('a1','Jadwal Pelaksanaan Uji Kompetensi Keahlian (UKK) 2026','Pelaksanaan UKK Pemesinan Bubut akan dimulai tanggal 15 Mei 2026. Persiapkan alat pelindung diri (Safety shoes, kacamata pelindung, wearpack).','Jadwal','2026-07-19 08:17:03.838'),
('a2','Wajib Menggunakan Wearpack & Sepatu Safety di Area Bengkel!','Dilarang keras masuk bengkel mesin tanpa menggunakan APD lengkap. Guru berhak mengeluarkan siswa yang melanggar K3.','K3','2026-07-19 08:17:03.842');
/*!40000 ALTER TABLE `Announcement` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Assignment`
--

DROP TABLE IF EXISTS `Assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Assignment` (
  `id` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `deadline` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Assignment_courseId_idx` (`courseId`),
  CONSTRAINT `Assignment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Assignment`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Assignment` WRITE;
/*!40000 ALTER TABLE `Assignment` DISABLE KEYS */;
/*!40000 ALTER TABLE `Assignment` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `AssignmentSubmission`
--

DROP TABLE IF EXISTS `AssignmentSubmission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `AssignmentSubmission` (
  `id` varchar(191) NOT NULL,
  `assignmentId` varchar(191) NOT NULL,
  `studentId` varchar(191) NOT NULL,
  `fileUrl` varchar(191) NOT NULL,
  `fileName` varchar(191) DEFAULT NULL,
  `gradePrecision` double DEFAULT NULL,
  `gradeFinishing` double DEFAULT NULL,
  `gradeSafety` double DEFAULT NULL,
  `grade` int(11) DEFAULT NULL,
  `feedback` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Belum Mengumpulkan',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `AssignmentSubmission_assignmentId_idx` (`assignmentId`),
  KEY `AssignmentSubmission_studentId_idx` (`studentId`),
  CONSTRAINT `AssignmentSubmission_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `Assignment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AssignmentSubmission_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AssignmentSubmission`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `AssignmentSubmission` WRITE;
/*!40000 ALTER TABLE `AssignmentSubmission` DISABLE KEYS */;
/*!40000 ALTER TABLE `AssignmentSubmission` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Attendance`
--

DROP TABLE IF EXISTS `Attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Attendance` (
  `id` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL,
  `studentId` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `status` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Attendance_courseId_date_idx` (`courseId`,`date`),
  KEY `Attendance_studentId_idx` (`studentId`),
  CONSTRAINT `Attendance_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Attendance_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Attendance`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Attendance` WRITE;
/*!40000 ALTER TABLE `Attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `Attendance` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `AttitudeGrade`
--

DROP TABLE IF EXISTS `AttitudeGrade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `AttitudeGrade` (
  `id` varchar(191) NOT NULL,
  `studentId` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL,
  `discipline` double NOT NULL DEFAULT 0,
  `responsibility` double NOT NULL DEFAULT 0,
  `cleanliness` double NOT NULL DEFAULT 0,
  `cooperation` double NOT NULL DEFAULT 0,
  `semester` varchar(191) NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `AttitudeGrade_studentId_courseId_semester_key` (`studentId`,`courseId`,`semester`),
  KEY `AttitudeGrade_courseId_idx` (`courseId`),
  CONSTRAINT `AttitudeGrade_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AttitudeGrade_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AttitudeGrade`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `AttitudeGrade` WRITE;
/*!40000 ALTER TABLE `AttitudeGrade` DISABLE KEYS */;
/*!40000 ALTER TABLE `AttitudeGrade` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `CalendarEvent`
--

DROP TABLE IF EXISTS `CalendarEvent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `CalendarEvent` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `date` datetime(3) NOT NULL,
  `endDate` datetime(3) DEFAULT NULL,
  `type` varchar(191) NOT NULL,
  `allDay` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CalendarEvent`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `CalendarEvent` WRITE;
/*!40000 ALTER TABLE `CalendarEvent` DISABLE KEYS */;
/*!40000 ALTER TABLE `CalendarEvent` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Course`
--

DROP TABLE IF EXISTS `Course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Course` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `class` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `teacherId` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Course_teacherId_idx` (`teacherId`),
  CONSTRAINT `Course_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Course`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Course` WRITE;
/*!40000 ALTER TABLE `Course` DISABLE KEYS */;
INSERT INTO `Course` VALUES
('c1','Teknik Pemesinan Bubut','XII TPM 1','Mempelajari teknik dasar dan lanjut pengoperasian mesin bubut konvensional.','cmrriviu50001b2hlijewke44'),
('c2','Gambar Teknik Manufaktur','XII TPM 1','Mempelajari desain berbantuan komputer (CAD) untuk manufaktur.','cmrriviu50001b2hlijewke44');
/*!40000 ALTER TABLE `Course` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Enrollment`
--

DROP TABLE IF EXISTS `Enrollment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Enrollment` (
  `id` varchar(191) NOT NULL,
  `studentId` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `shift` varchar(191) DEFAULT NULL,
  `assignedMachineId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Enrollment_studentId_courseId_key` (`studentId`,`courseId`),
  KEY `Enrollment_courseId_idx` (`courseId`),
  KEY `Enrollment_assignedMachineId_idx` (`assignedMachineId`),
  CONSTRAINT `Enrollment_assignedMachineId_fkey` FOREIGN KEY (`assignedMachineId`) REFERENCES `Machine` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Enrollment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Enrollment_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Enrollment`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Enrollment` WRITE;
/*!40000 ALTER TABLE `Enrollment` DISABLE KEYS */;
INSERT INTO `Enrollment` VALUES
('cmrriviv30005b2hltnxlzzcs','cmrriviuj0002b2hlme9ix8w7','c1','2026-07-19 08:17:03.808',NULL,NULL),
('cmrriviv80007b2hlbngumwm7','cmrriviuj0002b2hlme9ix8w7','c2','2026-07-19 08:17:03.812',NULL,NULL);
/*!40000 ALTER TABLE `Enrollment` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ForumPost`
--

DROP TABLE IF EXISTS `ForumPost`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ForumPost` (
  `id` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL,
  `authorId` varchar(191) NOT NULL,
  `content` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `ForumPost_courseId_idx` (`courseId`),
  KEY `ForumPost_authorId_idx` (`authorId`),
  CONSTRAINT `ForumPost_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ForumPost_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ForumPost`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ForumPost` WRITE;
/*!40000 ALTER TABLE `ForumPost` DISABLE KEYS */;
/*!40000 ALTER TABLE `ForumPost` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Grade`
--

DROP TABLE IF EXISTS `Grade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Grade` (
  `id` varchar(191) NOT NULL,
  `studentId` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL,
  `daily` double NOT NULL DEFAULT 0,
  `practical` double NOT NULL DEFAULT 0,
  `midterm` double NOT NULL DEFAULT 0,
  `final` double NOT NULL DEFAULT 0,
  `finalScore` double NOT NULL DEFAULT 0,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Grade_studentId_courseId_key` (`studentId`,`courseId`),
  KEY `Grade_courseId_idx` (`courseId`),
  CONSTRAINT `Grade_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Grade_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Grade`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Grade` WRITE;
/*!40000 ALTER TABLE `Grade` DISABLE KEYS */;
INSERT INTO `Grade` VALUES
('cmrrivivi0009b2hl0i1c1b6q','cmrriviuj0002b2hlme9ix8w7','c1',85,80,88,90,85.75,'2026-07-19 08:17:03.822');
/*!40000 ALTER TABLE `Grade` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `JobSheet`
--

DROP TABLE IF EXISTS `JobSheet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `JobSheet` (
  `id` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `objective` text DEFAULT NULL,
  `tools` text NOT NULL,
  `materials` text NOT NULL,
  `sop` text NOT NULL,
  `safety` text NOT NULL,
  `cadUrl` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Belum Dikerjakan',
  `dueDate` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `JobSheet_courseId_idx` (`courseId`),
  CONSTRAINT `JobSheet_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `JobSheet`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `JobSheet` WRITE;
/*!40000 ALTER TABLE `JobSheet` DISABLE KEYS */;
INSERT INTO `JobSheet` VALUES
('j1','c1','Pembuatan Benda Kerja Bertingkat','Siswa mampu membubut poros bertingkat sesuai ukuran toleransi.','[\"Mesin Bubut Konvensional\",\"Pahat Bubut HSS\",\"Jangka Sorong 0.05mm\",\"Kunci Chuck\"]','[\"Besi As (Mild Steel) Ø 25mm x 100mm\"]','[\"Siapkan gambar kerja dan pahami ukurannya.\",\"Cek kondisi mesin bubut dan pastikan aman digunakan.\",\"Pasang benda kerja pada chuck, pastikan senter.\",\"Lakukan facing pada salah satu ujung.\",\"Bubut rata bertingkat sesuai ukuran pada blueprint.\"]','[\"Gunakan kacamata pelindung (Safety Goggles).\",\"Gunakan sepatu safety.\",\"Jangan memakai pakaian longgar atau perhiasan.\"]',NULL,'Belum Dikerjakan','2026-07-26 08:17:03.816','2026-07-19 08:17:03.818');
/*!40000 ALTER TABLE `JobSheet` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `JobVacancy`
--

DROP TABLE IF EXISTS `JobVacancy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `JobVacancy` (
  `id` varchar(191) NOT NULL,
  `company` varchar(191) NOT NULL,
  `position` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `location` varchar(191) NOT NULL,
  `salary` varchar(191) DEFAULT NULL,
  `contact` varchar(191) NOT NULL,
  `datePosted` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `JobVacancy`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `JobVacancy` WRITE;
/*!40000 ALTER TABLE `JobVacancy` DISABLE KEYS */;
INSERT INTO `JobVacancy` VALUES
('cmrriviwv000cb2hlipgi4ea2','PT Krakatau Steel (Persero) Tbk','Operator Mesin Bubut & CNC','Dibutuhkan lulusan SMK Teknik Pemesinan untuk posisi Operator Bubut & CNC. Mampu membaca gambar teknik, menggunakan jangka sorong/mikrometer, dan mengoperasikan mesin CNC Siemens/Fanuc.','Kawasan Industri Krakatau, Cilegon','UJK Cilegon + Lembur','recruitment@krakatausteel.co.id','2026-07-19 08:17:03.872'),
('cmrriviwy000db2hl1yax7rqz','PT Chandra Asri Petrochemical Tbk','Mechanical Maintenance Technician (Magang)','Program pemagangan BKK SMK untuk lulusan Teknik Mesin/Pemesinan. Fokus pada pemeliharaan preventif pompa, katup (valves), dan mesin-mesin rotasi industri kimia.','Ciwandan, Cilegon','Uang Saku Magang & BPJS','bkk-ypwks@chandra-asri.com','2026-07-19 08:17:03.875');
/*!40000 ALTER TABLE `JobVacancy` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Logbook`
--

DROP TABLE IF EXISTS `Logbook`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Logbook` (
  `id` varchar(191) NOT NULL,
  `studentId` varchar(191) NOT NULL,
  `machineId` varchar(191) NOT NULL,
  `activity` varchar(191) NOT NULL,
  `duration` int(11) NOT NULL,
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `notes` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Logbook_studentId_idx` (`studentId`),
  KEY `Logbook_machineId_idx` (`machineId`),
  CONSTRAINT `Logbook_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Logbook_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Logbook`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Logbook` WRITE;
/*!40000 ALTER TABLE `Logbook` DISABLE KEYS */;
/*!40000 ALTER TABLE `Logbook` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Machine`
--

DROP TABLE IF EXISTS `Machine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Machine` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Machine`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Machine` WRITE;
/*!40000 ALTER TABLE `Machine` DISABLE KEYS */;
INSERT INTO `Machine` VALUES
('m1','Mesin Bubut Konvensional #1','Bubut','Ready','Kondisi baik, oli baru diganti.','2026-07-19 08:17:03.827'),
('m2','Mesin Bubut Konvensional #2','Bubut','Maintenance','Perbaikan spindle, target selesai besok.','2026-07-19 08:17:03.831'),
('m3','Mesin Milling Haas CNC','CNC','Ready','Kalibrasi sensor sumbu Z selesai.','2026-07-19 08:17:03.835');
/*!40000 ALTER TABLE `Machine` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `MachineReservation`
--

DROP TABLE IF EXISTS `MachineReservation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `MachineReservation` (
  `id` varchar(191) NOT NULL,
  `machineId` varchar(191) NOT NULL,
  `studentId` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL,
  `startTime` datetime(3) NOT NULL,
  `endTime` datetime(3) NOT NULL,
  `status` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `MachineReservation_machineId_idx` (`machineId`),
  KEY `MachineReservation_studentId_idx` (`studentId`),
  CONSTRAINT `MachineReservation_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `MachineReservation_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MachineReservation`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `MachineReservation` WRITE;
/*!40000 ALTER TABLE `MachineReservation` DISABLE KEYS */;
/*!40000 ALTER TABLE `MachineReservation` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `MaintenanceLog`
--

DROP TABLE IF EXISTS `MaintenanceLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `MaintenanceLog` (
  `id` varchar(191) NOT NULL,
  `machineId` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `task` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `notes` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `MaintenanceLog_machineId_idx` (`machineId`),
  KEY `MaintenanceLog_userId_idx` (`userId`),
  CONSTRAINT `MaintenanceLog_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `MaintenanceLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MaintenanceLog`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `MaintenanceLog` WRITE;
/*!40000 ALTER TABLE `MaintenanceLog` DISABLE KEYS */;
INSERT INTO `MaintenanceLog` VALUES
('cmrriviws000bb2hl25tose86','m2','cmrriviu50001b2hlijewke44','Penggantian gear spindle utama yang aus & penggantian oli pelumas gearbox','Completed','2026-07-19 08:17:03.869','Suku cadang gear spindle resmi dari pabrik dipasang.');
/*!40000 ALTER TABLE `MaintenanceLog` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Module`
--

DROP TABLE IF EXISTS `Module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Module` (
  `id` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `fileType` varchar(191) NOT NULL,
  `fileUrl` varchar(191) NOT NULL,
  `fileName` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Module_courseId_idx` (`courseId`),
  CONSTRAINT `Module_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Module`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Module` WRITE;
/*!40000 ALTER TABLE `Module` DISABLE KEYS */;
/*!40000 ALTER TABLE `Module` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Notification`
--

DROP TABLE IF EXISTS `Notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notification` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `message` varchar(191) NOT NULL,
  `read` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `Notification_userId_read_idx` (`userId`,`read`),
  CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notification`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Notification` WRITE;
/*!40000 ALTER TABLE `Notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `Notification` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `PasswordResetToken`
--

DROP TABLE IF EXISTS `PasswordResetToken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PasswordResetToken` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `PasswordResetToken_token_key` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PasswordResetToken`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `PasswordResetToken` WRITE;
/*!40000 ALTER TABLE `PasswordResetToken` DISABLE KEYS */;
/*!40000 ALTER TABLE `PasswordResetToken` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Portfolio`
--

DROP TABLE IF EXISTS `Portfolio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Portfolio` (
  `id` varchar(191) NOT NULL,
  `studentId` varchar(191) NOT NULL,
  `workpieceName` varchar(191) NOT NULL,
  `imageUrl` varchar(191) NOT NULL,
  `grade` int(11) NOT NULL,
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `Portfolio_studentId_idx` (`studentId`),
  CONSTRAINT `Portfolio_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Portfolio`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Portfolio` WRITE;
/*!40000 ALTER TABLE `Portfolio` DISABLE KEYS */;
/*!40000 ALTER TABLE `Portfolio` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Question`
--

DROP TABLE IF EXISTS `Question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Question` (
  `id` varchar(191) NOT NULL,
  `quizId` varchar(191) NOT NULL,
  `text` varchar(191) NOT NULL,
  `options` varchar(191) NOT NULL,
  `answer` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Question_quizId_idx` (`quizId`),
  CONSTRAINT `Question_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `Quiz` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Question`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Question` WRITE;
/*!40000 ALTER TABLE `Question` DISABLE KEYS */;
INSERT INTO `Question` VALUES
('que1','q1','Manakah alat keselamatan kerja yang WAJIB digunakan saat mengoperasikan mesin bubut untuk menghindari cipratan geram besi?','[\"Kacamata Pelindung (Safety Goggles)\",\"Sarung Tangan Kulit\",\"Masker Kain\",\"Apron Las\"]','Kacamata Pelindung (Safety Goggles)'),
('que2','q1','Jika diameter benda kerja adalah 50mm dan kecepatan potong (Cs) baja lunak adalah 30 m/menit, berapakah kisaran putaran mesin (RPM) yang harus diset?','[\"~190 RPM\",\"~380 RPM\",\"~570 RPM\",\"~760 RPM\"]','~190 RPM'),
('que3','q1','Alat ukur presisi yang digunakan untuk mengukur diameter dalam suatu silinder berongga dengan ketelitian 0.02mm adalah...','[\"Mistar Baja\",\"Jangka Sorong (Vernier Caliper)\",\"Mikrometer Luar\",\"Dial Indicator\"]','Jangka Sorong (Vernier Caliper)');
/*!40000 ALTER TABLE `Question` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Quiz`
--

DROP TABLE IF EXISTS `Quiz`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Quiz` (
  `id` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `timeLimit` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `Quiz_courseId_idx` (`courseId`),
  CONSTRAINT `Quiz_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Quiz`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Quiz` WRITE;
/*!40000 ALTER TABLE `Quiz` DISABLE KEYS */;
INSERT INTO `Quiz` VALUES
('q1','c1','Ujian Harian 1: Pemesinan Bubut Konvensional','Tes pengetahuan dasar pembubutan, kecepatan potong, dan K3.',15,'2026-07-19 08:17:03.855');
/*!40000 ALTER TABLE `Quiz` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `QuizAttempt`
--

DROP TABLE IF EXISTS `QuizAttempt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `QuizAttempt` (
  `id` varchar(191) NOT NULL,
  `quizId` varchar(191) NOT NULL,
  `studentId` varchar(191) NOT NULL,
  `score` int(11) NOT NULL,
  `answers` varchar(191) NOT NULL,
  `submittedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `QuizAttempt_quizId_idx` (`quizId`),
  KEY `QuizAttempt_studentId_idx` (`studentId`),
  CONSTRAINT `QuizAttempt_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `Quiz` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `QuizAttempt_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `QuizAttempt`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `QuizAttempt` WRITE;
/*!40000 ALTER TABLE `QuizAttempt` DISABLE KEYS */;
/*!40000 ALTER TABLE `QuizAttempt` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `TeacherJournal`
--

DROP TABLE IF EXISTS `TeacherJournal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `TeacherJournal` (
  `id` varchar(191) NOT NULL,
  `teacherId` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `topic` varchar(191) NOT NULL,
  `summary` varchar(191) DEFAULT NULL,
  `obstacles` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `TeacherJournal_teacherId_idx` (`teacherId`),
  KEY `TeacherJournal_courseId_idx` (`courseId`),
  CONSTRAINT `TeacherJournal_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `TeacherJournal_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TeacherJournal`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `TeacherJournal` WRITE;
/*!40000 ALTER TABLE `TeacherJournal` DISABLE KEYS */;
/*!40000 ALTER TABLE `TeacherJournal` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Tool`
--

DROP TABLE IF EXISTS `Tool`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tool` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `available` int(11) NOT NULL,
  `location` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tool`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Tool` WRITE;
/*!40000 ALTER TABLE `Tool` DISABLE KEYS */;
INSERT INTO `Tool` VALUES
('t1','Jangka Sorong Mitutoyo 150mm (0.02mm)',15,15,'Lemari Ukur A-1'),
('t2','Mikrometer Luar Mitutoyo 0-25mm',10,10,'Lemari Ukur A-2'),
('t3','Kunci Chuck Bubut Konvensional 10 Inch',8,8,'Gantungan Panel Alat #1');
/*!40000 ALTER TABLE `Tool` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ToolLoan`
--

DROP TABLE IF EXISTS `ToolLoan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ToolLoan` (
  `id` varchar(191) NOT NULL,
  `studentId` varchar(191) NOT NULL,
  `toolId` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `status` varchar(191) NOT NULL,
  `loanDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `returnDate` datetime(3) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ToolLoan_studentId_idx` (`studentId`),
  KEY `ToolLoan_toolId_idx` (`toolId`),
  CONSTRAINT `ToolLoan_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ToolLoan_toolId_fkey` FOREIGN KEY (`toolId`) REFERENCES `Tool` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ToolLoan`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ToolLoan` WRITE;
/*!40000 ALTER TABLE `ToolLoan` DISABLE KEYS */;
/*!40000 ALTER TABLE `ToolLoan` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `twoFactorSecret` varchar(191) DEFAULT NULL,
  `twoFactorEnabled` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES
('cmrrivitu0000b2hlrkc6lhv6','Admin Utama','admin@lms.local','$2b$10$iY7lLi9TZaLKCCtCVZFj9.DIiWZr15H2xOOuXpVGIHJZNk4fT0YOO','Admin','2026-07-19 08:17:03.763',NULL,0),
('cmrriviu50001b2hlijewke44','Pak Budi','guru@lms.local','$2b$10$iY7lLi9TZaLKCCtCVZFj9.DIiWZr15H2xOOuXpVGIHJZNk4fT0YOO','Guru','2026-07-19 08:17:03.773',NULL,0),
('cmrriviuj0002b2hlme9ix8w7','Andi Wijaya','murid@lms.local','$2b$10$iY7lLi9TZaLKCCtCVZFj9.DIiWZr15H2xOOuXpVGIHJZNk4fT0YOO','Murid','2026-07-19 08:17:03.787',NULL,0),
('cmrriviuq0003b2hljjkwj45u','Kepala Sekolah','kepsek@lms.local','$2b$10$iY7lLi9TZaLKCCtCVZFj9.DIiWZr15H2xOOuXpVGIHJZNk4fT0YOO','Kepsek','2026-07-19 08:17:03.794',NULL,0),
('cmrrwvi72000ah13fi0liz374','Asep Wahyudi, S.Pd,.Gr.','asep@asep','$2b$10$AcJvJrcFBqleBSWucm15ruaZ1q12oMoicYfXsItVgaEXeRkG8Cmkq','Guru','2026-07-19 14:48:57.567',NULL,0);
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `UserSession`
--

DROP TABLE IF EXISTS `UserSession`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserSession` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `userAgent` varchar(191) DEFAULT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `lastActive` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `expiresAt` datetime(3) NOT NULL,
  `pushSubscription` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UserSession_token_key` (`token`),
  KEY `UserSession_userId_idx` (`userId`),
  CONSTRAINT `UserSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserSession`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `UserSession` WRITE;
/*!40000 ALTER TABLE `UserSession` DISABLE KEYS */;
INSERT INTO `UserSession` VALUES
('cmrrivpm90003oteldfmikzcr','cmrrivitu0000b2hlrkc6lhv6','308fa65c0e6996e55f9d09a8452aa41f26e6b40c7dbf4398f55df27765de00ce','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','::ffff:192.168.31.116','2026-07-19 08:17:12.617','2026-07-19 08:17:12.562','2026-08-18 08:17:12.561',NULL),
('cmrrjj3x60007otelko3xakxn','cmrrivitu0000b2hlrkc6lhv6','88728ea6e96f8c42cc392d4bae9f9963dfa5208e576fd46212f8a2cbdc042c66','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','182.2.180.25','2026-07-19 14:49:10.008','2026-07-19 08:35:24.186','2026-08-18 08:35:24.185',NULL),
('cmrrjjved000boteladc2von6','cmrrivitu0000b2hlrkc6lhv6','1cf259574046f14158b51b76d1456c4b65d0b6727a83091500e68f56fb00464d','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','182.2.180.25','2026-07-19 08:36:21.068','2026-07-19 08:35:59.797','2026-08-18 08:35:59.796',NULL),
('cmrrjnc98000fotelhe9y52g0','cmrrivitu0000b2hlrkc6lhv6','049287a08a7438b7fcbe64a123ff585b2842f2872596ebb54fe911845cfa84fc','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','182.2.180.25','2026-07-19 08:43:39.196','2026-07-19 08:38:41.612','2026-08-18 08:38:41.611',NULL),
('cmrrjvxje0003zck213i8780o','cmrrivitu0000b2hlrkc6lhv6','ff58815a7ed359cd49acd98df4b78288aab9407d23a8fe9ce19fc8c51f2f6a72','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','182.2.180.25','2026-07-19 10:44:49.928','2026-07-19 08:45:22.442','2026-08-18 08:45:22.440',NULL);
/*!40000 ALTER TABLE `UserSession` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Violation`
--

DROP TABLE IF EXISTS `Violation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Violation` (
  `id` varchar(191) NOT NULL,
  `studentId` varchar(191) NOT NULL,
  `reportedBy` varchar(191) NOT NULL,
  `category` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `points` int(11) NOT NULL DEFAULT 0,
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `Violation_studentId_idx` (`studentId`),
  KEY `Violation_reportedBy_idx` (`reportedBy`),
  CONSTRAINT `Violation_reportedBy_fkey` FOREIGN KEY (`reportedBy`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Violation_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Violation`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Violation` WRITE;
/*!40000 ALTER TABLE `Violation` DISABLE KEYS */;
/*!40000 ALTER TABLE `Violation` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES
('da43796b-e03d-441f-8ef6-73ac181cee79','f6209ee6731d844f88457fc13e20c44557ee137f2eaf0a4307c04ce64905aaca','2026-07-19 08:15:17.717','0000_init',NULL,NULL,'2026-07-19 08:15:16.276',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-07-19 15:01:50
