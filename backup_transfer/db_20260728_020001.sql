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
('cmrrwus9j0009h13fgrd04631','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 14:48:23.959'),
('cmrrxwyp60003x2zpi260dx7n','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 15:18:05.226'),
('cmrrxyyh10008x2zpfc0k6oxw','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 15:19:38.245'),
('cmrrydw5a0001vaisectm6faw','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 15:31:15.070'),
('cmrryk0a90005vaisdguzmc5u','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 15:36:00.369'),
('cmrryk86u0007vaisjt2hknbv','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 15:36:10.615'),
('cmrryu3mj000bvaisn7h3nfbx','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 15:43:51.202'),
('cmrrz03pe0001qjcu9v5l8h7i','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 15:48:31.298'),
('cmrrz28ib0003qjcusqounufp','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 15:50:10.835'),
('cmrrzgbob0007qjcuqd4nxwgl','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 16:01:08.123'),
('cmrrzu2tz0001nh66eqjg1ehe','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 16:11:49.847'),
('cmrs0ls7l0005fpwh6koilvs0','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-19 16:33:22.447'),
('cmrt5mnc60003101qpszdw5bq','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-20 11:41:47.046'),
('cmrt8nhlr00015ojthdxh6gav','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-20 13:06:25.119'),
('cmrtrqxdx0001k1hhz834k7in','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-20 22:00:58.245'),
('cmrtrtzur0006k1hhdwym2j73','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-20 22:03:21.412'),
('cmrtry2si0008k1hh4gywnij0','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-20 22:06:31.842'),
('cmrtrz0up000bk1hh3x909ukz','cmrtryqu50009k1hh0xzh6o4y','LOGIN','{\"email\":\"wahyudi.asep13@gmail.com\"}',NULL,'2026-07-20 22:07:15.985'),
('cmrtrzgza000dk1hh5xuemdss','cmrtryqu50009k1hh0xzh6o4y','LOGIN','{\"email\":\"wahyudi.asep13@gmail.com\"}',NULL,'2026-07-20 22:07:36.886'),
('cmrtrzwb4000fk1hh1ysf45wp','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-20 22:07:56.752'),
('cmrttzq8v00016ig46qk3b3so','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-20 23:03:48.127'),
('cmruck1dh00014sdhnmo6f8rr','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-21 07:43:28.725'),
('cmrueg0nf002x4sdhno3bu1nv','cmrtryqu50009k1hh0xzh6o4y','LOGIN','{\"email\":\"wahyudi.asep13@gmail.com\"}',NULL,'2026-07-21 08:36:20.427'),
('cmruntc3200474sdhp8vx3jaj','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-21 12:58:38.318'),
('cmry3vgxi0001xpsr3b9n5urk','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-23 22:51:30.294'),
('cmrymbdcb0005xpsrenpcho49','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-24 07:27:45.227'),
('cmryt4kd40007xpsrb0z5brq4','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-24 10:38:25.048'),
('cmryt57040009xpsrpisi237r','cmrtryqu50009k1hh0xzh6o4y','LOGIN','{\"email\":\"wahyudi.asep13@gmail.com\"}',NULL,'2026-07-24 10:38:54.389'),
('cmrzm6z9n0005hoenlzq52hch','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-25 00:12:06.540'),
('cmrzm72v90007hoenuwxjrutb','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-25 00:12:11.206'),
('cmrzq8cgw000159j06shi1ids','cmrtryqu50009k1hh0xzh6o4y','LOGIN','{\"email\":\"wahyudi.asep13@gmail.com\"}',NULL,'2026-07-25 02:05:08.768'),
('cmrzqpqa3000359j07ryq1i5a','cmrtryqu50009k1hh0xzh6o4y','LOGIN','{\"email\":\"wahyudi.asep13@gmail.com\"}',NULL,'2026-07-25 02:18:39.819'),
('cmrzrlgm20001nq5og50ktdwg','cmrtryqu50009k1hh0xzh6o4y','LOGIN','{\"email\":\"wahyudi.asep13@gmail.com\"}',NULL,'2026-07-25 02:43:20.283'),
('cmrzspm8u0001n11lqz10uyly','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-25 03:14:33.823'),
('cmrztaptq0003n11lm7g1k7lt','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-25 03:30:58.238'),
('cmrzuoo7p000311ggc54js0hq','cmrzuojx1000011ggw44c4fni','LOGIN','{\"email\":\"agus@agus\"}',NULL,'2026-07-25 04:09:48.949'),
('cmrzupvzn000511ggfkwp4303','cmrzuojx1000011ggw44c4fni','LOGIN','{\"email\":\"agus@agus\"}',NULL,'2026-07-25 04:10:45.684'),
('cmrzuq401000711gglddbqdpd','cmrtryqu50009k1hh0xzh6o4y','LOGIN','{\"email\":\"wahyudi.asep13@gmail.com\"}',NULL,'2026-07-25 04:10:56.065'),
('cmrzurq9x000d11ggw9mk106p','cmrzurkcm000811ggzczfx8ze','LOGIN','{\"email\":\"ahmad@ahmad\"}',NULL,'2026-07-25 04:12:11.589'),
('cmrzusi9p000f11ggbwp4s2fy','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-25 04:12:47.870'),
('cmrzve1kt000h11ggf71hvg20','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-25 04:29:32.670'),
('cmrzxpk6t0001e2nuxachyrna','cmrzurkcm000811ggzczfx8ze','LOGIN','{\"email\":\"ahmad@ahmad\"}',NULL,'2026-07-25 05:34:29.237'),
('cmrzzjs0v0001n6j8ymh5u3wf','cmrzurkcm000811ggzczfx8ze','LOGIN','{\"email\":\"ahmad@ahmad\"}',NULL,'2026-07-25 06:25:58.688'),
('cms08x4gx0003n6j8f5yqjgm2','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-25 10:48:17.890'),
('cms08xz4r0005n6j8g0fvkzr6','cmrtryqu50009k1hh0xzh6o4y','LOGIN','{\"email\":\"wahyudi.asep13@gmail.com\"}',NULL,'2026-07-25 10:48:57.628'),
('cms09y0a80007n6j85cas2qqa','cmrtryqu50009k1hh0xzh6o4y','LOGIN','{\"email\":\"wahyudi.asep13@gmail.com\"}',NULL,'2026-07-25 11:16:58.736'),
('cms0b9mhp0009n6j8nkc9atbd','cmrrivitu0000b2hlrkc6lhv6','LOGIN','{\"email\":\"admin@lms.local\"}',NULL,'2026-07-25 11:54:00.349');
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
INSERT INTO `Attendance` VALUES
('cmruegdn2002z4sdhnmr18ah1','cmruckpfk00034sdhjwqujlj0','cmruedcdz00044sdhkte719sy','2026-07-21 00:00:00.000','Hadir'),
('cmruegdnv00314sdhghhypkt8','cmruckpfk00034sdhjwqujlj0','cmruedcjo00054sdhu3w76x81','2026-07-21 00:00:00.000','Hadir'),
('cmruegdp300334sdh23h6quko','cmruckpfk00034sdhjwqujlj0','cmruedcp000064sdhk4e8zhdt','2026-07-21 00:00:00.000','Hadir'),
('cmruegdqc00354sdh0rdq74ck','cmruckpfk00034sdhjwqujlj0','cmruedcuq00074sdhbqs5eu8i','2026-07-21 00:00:00.000','Hadir'),
('cmruegdrl00374sdhfdxx3rhd','cmruckpfk00034sdhjwqujlj0','cmruedd0t00084sdhkd57n6ge','2026-07-21 00:00:00.000','Hadir'),
('cmruegds600394sdhurdtse33','cmruckpfk00034sdhjwqujlj0','cmruedd6800094sdhfgtedakb','2026-07-21 00:00:00.000','Hadir'),
('cmruegdss003b4sdhph6pkzqa','cmruckpfk00034sdhjwqujlj0','cmrueddbh000a4sdh5s8n8qn5','2026-07-21 00:00:00.000','Hadir'),
('cmruegdtf003d4sdht7xkkhrb','cmruckpfk00034sdhjwqujlj0','cmrueddgs000b4sdhn701892k','2026-07-21 00:00:00.000','Hadir'),
('cmruegdu1003f4sdholgtuit1','cmruckpfk00034sdhjwqujlj0','cmrueddm8000c4sdhteu5jdiv','2026-07-21 00:00:00.000','Hadir'),
('cmruegdun003h4sdhk6fsdyji','cmruckpfk00034sdhjwqujlj0','cmrueddrf000d4sdhdu0lrg6m','2026-07-21 00:00:00.000','Hadir'),
('cmruegdv9003j4sdh4gmwzlk5','cmruckpfk00034sdhjwqujlj0','cmrueddwp000e4sdh0fhgm8dw','2026-07-21 00:00:00.000','Hadir'),
('cmruegdvv003l4sdhn8hkrqd6','cmruckpfk00034sdhjwqujlj0','cmruede2r000f4sdhsndy8mth','2026-07-21 00:00:00.000','Hadir'),
('cmruegdwi003n4sdhgxdyww9i','cmruckpfk00034sdhjwqujlj0','cmruedebk000g4sdh5i39fxio','2026-07-21 00:00:00.000','Hadir'),
('cmruegdxt003p4sdh0b4apmmo','cmruckpfk00034sdhjwqujlj0','cmruedegq000h4sdhgcvuchpo','2026-07-21 00:00:00.000','Hadir'),
('cmruegdyc003r4sdhhr3t0uij','cmruckpfk00034sdhjwqujlj0','cmruedelz000i4sdhbpc9xfxb','2026-07-21 00:00:00.000','Hadir'),
('cmruegdyy003t4sdhwcjx269p','cmruckpfk00034sdhjwqujlj0','cmrueder9000j4sdhru5iivio','2026-07-21 00:00:00.000','Hadir'),
('cmruegdzl003v4sdhy0d4zrgc','cmruckpfk00034sdhjwqujlj0','cmruedewj000k4sdh4yknkvtq','2026-07-21 00:00:00.000','Hadir'),
('cmruege07003x4sdh6xh0zeqe','cmruckpfk00034sdhjwqujlj0','cmruedf1s000l4sdhse6k2k1x','2026-07-21 00:00:00.000','Hadir'),
('cmruege0u003z4sdhjp9gwy1q','cmruckpfk00034sdhjwqujlj0','cmruedf7x000m4sdhfrwxxsws','2026-07-21 00:00:00.000','Hadir'),
('cmruege1g00414sdhtqcmn4x7','cmruckpfk00034sdhjwqujlj0','cmruedfd6000n4sdhx5ptssg8','2026-07-21 00:00:00.000','Hadir');
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
('cmrts0wly000hk1hhfas7mo2f','Kreatifitas dan Inovasi Kewirausahaan','XI TM A','KIK','cmrtryqu50009k1hh0xzh6o4y'),
('cmrts5adl000jk1hhae1g3z2w','Dasar Program Keahlian Teknik Mesin 3','X TM B','DPKTM 3','cmrtryqu50009k1hh0xzh6o4y'),
('cmruckpfk00034sdhjwqujlj0','Pengelasan','XI TM B','LAS','cmrtryqu50009k1hh0xzh6o4y'),
('cmrvcap4b004a4sdhvmkyu95g','Dasar Program Keahlian Teknik Mesin','X TM A','DPKTM 3','cmrtryqu50009k1hh0xzh6o4y'),
('cmrvcbhuy004c4sdhbdea8bqe','Sistem Kelistrikan Mesin Industri','XII TM A','SKMI','cmrtryqu50009k1hh0xzh6o4y'),
('cmrvccqy4004e4sdh69ivhwj2','Teknik Mekanik Mesin Industri','XI TM A','TMMI','cmrtryqu50009k1hh0xzh6o4y');
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
('cmrueeg0a000p4sdhgy0lmxt1','cmruedcdz00044sdhkte719sy','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:07.018',NULL,NULL),
('cmrueeiau000t4sdh7o1s7yj6','cmruedcjo00054sdhu3w76x81','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:09.990',NULL,NULL),
('cmrueek2h000x4sdh7co9k7xg','cmruedcp000064sdhk4e8zhdt','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:12.282',NULL,NULL),
('cmrueem2q00114sdhewluzily','cmruedcuq00074sdhbqs5eu8i','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:14.883',NULL,NULL),
('cmrueeo1s00154sdh7xclo5t6','cmruedd0t00084sdhkd57n6ge','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:17.440',NULL,NULL),
('cmrueepgy00194sdhafxdvtbh','cmruedd6800094sdhfgtedakb','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:19.282',NULL,NULL),
('cmrueerun001d4sdh4m2qzl0m','cmrueddbh000a4sdh5s8n8qn5','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:22.367',NULL,NULL),
('cmrueet58001h4sdhzms8d03b','cmrueddgs000b4sdhn701892k','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:24.045',NULL,NULL),
('cmrueeuml001l4sdhykurse0w','cmrueddm8000c4sdhteu5jdiv','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:25.965',NULL,NULL),
('cmrueew5p001p4sdh0fd5cirp','cmrueddrf000d4sdhdu0lrg6m','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:27.949',NULL,NULL),
('cmrueexk6001t4sdhkonb23hf','cmrueddwp000e4sdh0fhgm8dw','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:29.766',NULL,NULL),
('cmrueeywh001x4sdhtohj9gca','cmruede2r000f4sdhsndy8mth','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:31.505',NULL,NULL),
('cmruef14500214sdh6ep1gaqz','cmruedebk000g4sdh5i39fxio','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:34.373',NULL,NULL),
('cmruef2yp00254sdhi8rp6qdu','cmruedegq000h4sdhgcvuchpo','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:36.769',NULL,NULL),
('cmruef4hc00294sdht9b3h8ni','cmruedelz000i4sdhbpc9xfxb','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:38.736',NULL,NULL),
('cmruef63z002d4sdhiwgssgqk','cmrueder9000j4sdhru5iivio','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:40.848',NULL,NULL),
('cmruef7gr002h4sdhd5fdx7dr','cmruedewj000k4sdh4yknkvtq','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:42.603',NULL,NULL),
('cmruef8q6002l4sdhi7azp0cx','cmruedf1s000l4sdhse6k2k1x','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:44.238',NULL,NULL),
('cmruefaog002p4sdhpetn8zl8','cmruedf7x000m4sdhfrwxxsws','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:46.768',NULL,NULL),
('cmrueff6r002t4sdhojduwtc1','cmruedfd6000n4sdhx5ptssg8','cmruckpfk00034sdhjwqujlj0','2026-07-21 08:35:52.612',NULL,NULL),
('cmrzuojzv000111gg2jtb2u90','cmrzuojx1000011ggw44c4fni','cmrvcbhuy004c4sdhbdea8bqe','2026-07-25 04:09:43.483',NULL,NULL),
('cmrzurkd5000911gg5wwrjzr8','cmrzurkcm000811ggzczfx8ze','cmrts0wly000hk1hhfas7mo2f','2026-07-25 04:12:03.929',NULL,NULL),
('cmrzurkd5000a11ggktircm54','cmrzurkcm000811ggzczfx8ze','cmrvccqy4004e4sdh69ivhwj2','2026-07-25 04:12:03.929',NULL,NULL);
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
('cmrueeg0q000r4sdhpkwzjoje','cmruedcdz00044sdhkte719sy','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:07.034'),
('cmrueeidw000v4sdhcj6oalhf','cmruedcjo00054sdhu3w76x81','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:10.100'),
('cmrueek30000z4sdhkqa5umf4','cmruedcp000064sdhk4e8zhdt','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:12.300'),
('cmrueem3800134sdh4r8p1dhn','cmruedcuq00074sdhbqs5eu8i','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:14.900'),
('cmrueeo2c00174sdhydffxtsi','cmruedd0t00084sdhkd57n6ge','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:17.460'),
('cmrueephg001b4sdh8tcqoh97','cmruedd6800094sdhfgtedakb','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:19.300'),
('cmrueervr001f4sdhaf6l8m7m','cmrueddbh000a4sdh5s8n8qn5','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:22.407'),
('cmrueet5k001j4sdhvnzyhxae','cmrueddgs000b4sdhn701892k','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:24.056'),
('cmrueeuo3001n4sdhzs239a4s','cmrueddm8000c4sdhteu5jdiv','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:26.019'),
('cmrueew5x001r4sdhtvswgsc4','cmrueddrf000d4sdhdu0lrg6m','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:27.957'),
('cmrueexkm001v4sdhxqhvbtzb','cmrueddwp000e4sdh0fhgm8dw','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:29.782'),
('cmrueeyx0001z4sdhznbxvx13','cmruede2r000f4sdhsndy8mth','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:31.524'),
('cmruef14n00234sdhv4gves8k','cmruedebk000g4sdh5i39fxio','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:34.391'),
('cmruef2z100274sdhhz7dsti0','cmruedegq000h4sdhgcvuchpo','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:36.781'),
('cmruef4hm002b4sdhaxxymuk1','cmruedelz000i4sdhbpc9xfxb','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:38.746'),
('cmruef64l002f4sdhgv60beh5','cmrueder9000j4sdhru5iivio','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:40.869'),
('cmruef7hn002j4sdh0uaagka1','cmruedewj000k4sdh4yknkvtq','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:42.636'),
('cmruef8xf002n4sdhuc1fmw4y','cmruedf1s000l4sdhse6k2k1x','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:44.499'),
('cmruefaos002r4sdhp1q9zoja','cmruedf7x000m4sdhfrwxxsws','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:46.781'),
('cmrueff76002v4sdhaw82r0tl','cmruedfd6000n4sdhx5ptssg8','cmruckpfk00034sdhjwqujlj0',0,0,0,0,0,'2026-07-21 08:35:52.626');
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
/*!40000 ALTER TABLE `JobVacancy` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `LessonPlan`
--

DROP TABLE IF EXISTS `LessonPlan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `LessonPlan` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `fileUrl` longtext NOT NULL,
  `fileName` varchar(191) DEFAULT NULL,
  `courseId` varchar(191) DEFAULT NULL,
  `teacherId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `LessonPlan_courseId_fkey` (`courseId`),
  KEY `LessonPlan_teacherId_fkey` (`teacherId`),
  CONSTRAINT `LessonPlan_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `LessonPlan_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LessonPlan`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `LessonPlan` WRITE;
/*!40000 ALTER TABLE `LessonPlan` DISABLE KEYS */;
/*!40000 ALTER TABLE `LessonPlan` ENABLE KEYS */;
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
  `startTime` datetime(3) DEFAULT NULL,
  `endTime` datetime(3) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Completed',
  `imageUrl` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Logbook_studentId_idx` (`studentId`),
  KEY `Logbook_machineId_idx` (`machineId`),
  KEY `Logbook_studentId_status_idx` (`studentId`,`status`),
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
-- Table structure for table `LspUnit`
--

DROP TABLE IF EXISTS `LspUnit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `LspUnit` (
  `id` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `courseId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `LspUnit_code_key` (`code`),
  KEY `LspUnit_courseId_fkey` (`courseId`),
  CONSTRAINT `LspUnit_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LspUnit`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `LspUnit` WRITE;
/*!40000 ALTER TABLE `LspUnit` DISABLE KEYS */;
/*!40000 ALTER TABLE `LspUnit` ENABLE KEYS */;
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
  `manualUrl` longtext DEFAULT NULL,
  `sopUrl` longtext DEFAULT NULL,
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
('m1','Mesin Bubut Konvensional #1','Bubut','Ready','Kondisi baik, oli baru diganti.','2026-07-19 08:17:03.827',NULL,NULL),
('m2','Mesin Bubut Konvensional #2','Bubut','Ready','Perbaikan spindle, target selesai besok.','2026-07-21 13:13:33.605',NULL,NULL),
('m3','Mesin Milling Haas CNC','CNC','Ready','Kalibrasi sensor sumbu Z selesai.','2026-07-19 08:17:03.835',NULL,NULL);
/*!40000 ALTER TABLE `Machine` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `MachineReport`
--

DROP TABLE IF EXISTS `MachineReport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `MachineReport` (
  `id` varchar(191) NOT NULL,
  `machineId` varchar(191) NOT NULL,
  `reporterId` varchar(191) NOT NULL,
  `issue` varchar(191) NOT NULL,
  `imageUrl` longtext DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Pending',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `MachineReport_machineId_fkey` (`machineId`),
  KEY `MachineReport_reporterId_fkey` (`reporterId`),
  CONSTRAINT `MachineReport_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `MachineReport_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MachineReport`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `MachineReport` WRITE;
/*!40000 ALTER TABLE `MachineReport` DISABLE KEYS */;
/*!40000 ALTER TABLE `MachineReport` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `MaintenanceLog` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `MaintenanceSchedule`
--

DROP TABLE IF EXISTS `MaintenanceSchedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `MaintenanceSchedule` (
  `id` varchar(191) NOT NULL,
  `machineId` varchar(191) NOT NULL,
  `task` varchar(191) NOT NULL,
  `intervalDays` int(11) NOT NULL,
  `nextDueDate` datetime(3) NOT NULL,
  `lastServiced` datetime(3) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Active',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `MaintenanceSchedule_machineId_fkey` (`machineId`),
  CONSTRAINT `MaintenanceSchedule_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MaintenanceSchedule`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `MaintenanceSchedule` WRITE;
/*!40000 ALTER TABLE `MaintenanceSchedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `MaintenanceSchedule` ENABLE KEYS */;
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
INSERT INTO `Module` VALUES
('cmrunf2pj00434sdhqa8dots8','cmruckpfk00034sdhjwqujlj0','K3 Pengelasan','PDF','https://drive.google.com/file/d/1YIVxIQf8K6gz1vUNFmBYVrVARoYLl3mL/view',NULL);
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
INSERT INTO `PasswordResetToken` VALUES
('cmrtrtb350004k1hht3ewjkrf','asep@asep','597e15ac-f015-4679-b1e9-45cfa6d1b580','2026-07-20 23:02:49.311',0,'2026-07-20 22:02:49.313'),
('cmrtu2a5m00026ig4r33tu4q7','wahyudi.asep13@gmail.com','2f65f712-f39c-4647-a536-d7038cbb5e2f','2026-07-21 00:05:47.241',0,'2026-07-20 23:05:47.243');
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
-- Table structure for table `SparePart`
--

DROP TABLE IF EXISTS `SparePart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `SparePart` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `category` varchar(191) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `minStock` int(11) NOT NULL DEFAULT 1,
  `unit` varchar(191) NOT NULL,
  `location` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SparePart`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `SparePart` WRITE;
/*!40000 ALTER TABLE `SparePart` DISABLE KEYS */;
/*!40000 ALTER TABLE `SparePart` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `SparePartUsage`
--

DROP TABLE IF EXISTS `SparePartUsage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `SparePartUsage` (
  `id` varchar(191) NOT NULL,
  `sparePartId` varchar(191) NOT NULL,
  `machineId` varchar(191) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `notes` varchar(191) DEFAULT NULL,
  `usedBy` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `SparePartUsage_sparePartId_fkey` (`sparePartId`),
  KEY `SparePartUsage_machineId_fkey` (`machineId`),
  CONSTRAINT `SparePartUsage_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `SparePartUsage_sparePartId_fkey` FOREIGN KEY (`sparePartId`) REFERENCES `SparePart` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SparePartUsage`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `SparePartUsage` WRITE;
/*!40000 ALTER TABLE `SparePartUsage` DISABLE KEYS */;
/*!40000 ALTER TABLE `SparePartUsage` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `StudentLspStatus`
--

DROP TABLE IF EXISTS `StudentLspStatus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `StudentLspStatus` (
  `id` varchar(191) NOT NULL,
  `studentId` varchar(191) NOT NULL,
  `unitId` varchar(191) NOT NULL,
  `courseId` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `assessedBy` varchar(191) DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `StudentLspStatus_studentId_unitId_key` (`studentId`,`unitId`),
  KEY `StudentLspStatus_unitId_fkey` (`unitId`),
  KEY `StudentLspStatus_courseId_fkey` (`courseId`),
  CONSTRAINT `StudentLspStatus_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `StudentLspStatus_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `StudentLspStatus_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `LspUnit` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `StudentLspStatus`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `StudentLspStatus` WRITE;
/*!40000 ALTER TABLE `StudentLspStatus` DISABLE KEYS */;
/*!40000 ALTER TABLE `StudentLspStatus` ENABLE KEYS */;
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
INSERT INTO `TeacherJournal` VALUES
('cmrunjurg00454sdh332in6r4','cmrtryqu50009k1hh0xzh6o4y','cmruckpfk00034sdhjwqujlj0','2026-07-21 00:00:00.000','K3 Pengasalan','Membahas Mengenai Kegiatan K3 Pengelasan','','2026-07-21 12:51:15.963');
/*!40000 ALTER TABLE `TeacherJournal` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `TechnicalDiagram`
--

DROP TABLE IF EXISTS `TechnicalDiagram`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `TechnicalDiagram` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `fileUrl` longtext NOT NULL,
  `fileName` varchar(191) DEFAULT NULL,
  `courseId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `TechnicalDiagram_courseId_fkey` (`courseId`),
  CONSTRAINT `TechnicalDiagram_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TechnicalDiagram`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `TechnicalDiagram` WRITE;
/*!40000 ALTER TABLE `TechnicalDiagram` DISABLE KEYS */;
/*!40000 ALTER TABLE `TechnicalDiagram` ENABLE KEYS */;
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
('cmrunuirh00484sdhzto4q7kb','Jangka Sorong',20,20,'LEMARI 1'),
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
  `returnCondition` varchar(191) DEFAULT NULL,
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
  `class` varchar(191) DEFAULT NULL,
  `phone` varchar(191) DEFAULT NULL,
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
('cmrrivitu0000b2hlrkc6lhv6','Admin Utama','admin@lms.local','$2b$10$S6srRFbL3GmJamVxxoWN9.saQzREd7q2bOnB5HHP4ZCF.3kCC9uuq','Admin','2026-07-19 08:17:03.763',NULL,0,NULL,NULL),
('cmrriviuq0003b2hljjkwj45u','Kepala Sekolah','kepsek@lms.local','$2b$10$iY7lLi9TZaLKCCtCVZFj9.DIiWZr15H2xOOuXpVGIHJZNk4fT0YOO','Kepsek','2026-07-19 08:17:03.794',NULL,0,NULL,NULL),
('cmrtryqu50009k1hh0xzh6o4y','Asep Wahyudi, S.Pd,.Gr.','wahyudi.asep13@gmail.com','$2b$10$aYbGe5AlSzxjW7uJ/VvLAOdwu0NuBWUxpL2zK2r2.Z9NwKZCyPpgu','Guru','2026-07-20 22:07:03.005',NULL,0,NULL,NULL),
('cmruedcdz00044sdhkte719sy','Muhammad Fauzan Adziim','gamingfzn143@gmail.com','$2b$10$71vHqoV.ePAgJuijvDdkautzIbOLgL7ChzRtl5Z/IiMUknjgW3rl2','Murid','2026-07-21 08:34:15.671',NULL,0,NULL,NULL),
('cmruedcjo00054sdhu3w76x81','Syed Aqil Amzar','aqilbelajardulu@gmail.com','$2b$10$SCEagYjYiuWnSqpmvE4ekuLGM5cWKa/IPsFfi2IG2gZEBGbWsV.0.','Murid','2026-07-21 08:34:15.877',NULL,0,NULL,NULL),
('cmruedcp000064sdhk4e8zhdt','Joanito Frestian Putra','joanitofrestian79@gmail.com','$2b$10$e65BrvGY0csEj.MxhJAxsusgOv3vzbmOmD8cThSQg2u3Y7FnZUh2e','Murid','2026-07-21 08:34:16.069',NULL,0,NULL,NULL),
('cmruedcuq00074sdhbqs5eu8i','Kenzie Kapuji','kapujikenzie@gmail.com','$2b$10$qSceNj0OPvtjH/xR1s/E8u/V5lNf8qsOmm/AOOg5zmo0rZAHTsFoi','Murid','2026-07-21 08:34:16.274',NULL,0,NULL,NULL),
('cmruedd0t00084sdhkd57n6ge','Muhamad agung ananta','muhamadagungbaru11@gmail.com','$2b$10$z9p.f1o17ZND9hgJrJ87Aulokdcut3t6VyBvyP1/le0RKU59FyPI2','Murid','2026-07-21 08:34:16.493',NULL,0,NULL,NULL),
('cmruedd6800094sdhfgtedakb','Angga Alfarsyah','anggafarsyah8@gmail.com','$2b$10$X7AZ/dTpWwLro7kNejwi5uGFyAfCQQOxAjI/3f3iNxydM9P7lJdf6','Murid','2026-07-21 08:34:16.688',NULL,0,NULL,NULL),
('cmrueddbh000a4sdh5s8n8qn5','Muhamad Fardhan Al Ikrom','fardandanzz73@gmail.com','$2b$10$wo2IzDOcYBgLK0UevtV9/eFq4YbmcGLquqzbSt73vaOjYIzjdtJP2','Murid','2026-07-21 08:34:16.878',NULL,0,NULL,NULL),
('cmrueddgs000b4sdhn701892k','syarif hidayat','sh6416008@gmail.com','$2b$10$mvV6WxNF6eZjNYdFO8eEbOTujY4nMk8f/ynhGScdA4m77n4HEgDwe','Murid','2026-07-21 08:34:17.069',NULL,0,NULL,NULL),
('cmrueddm8000c4sdhteu5jdiv','Muhamad ridho fauzan','dirgaputra0123@gmail.com','$2b$10$hT99erj09xfqpJlkJEq/qONXhIiEKP2VcqJ/EgVq3GJUyjrVlF9ke','Murid','2026-07-21 08:34:17.265',NULL,0,NULL,NULL),
('cmrueddrf000d4sdhdu0lrg6m','Elrava Febrian Nugraha','elravarava98@gmail.com','$2b$10$S0rvlWjYEHLhbyiKJjSUcOOqICiY6K/tb6yKH8tIe.MUWESxxhqLi','Murid','2026-07-21 08:34:17.451',NULL,0,NULL,NULL),
('cmrueddwp000e4sdh0fhgm8dw','ARLAN RASYID AL BUCHORI','arlanrasyid.alb@gmail.com','$2b$10$rQHIyRZSjVbJNhNM.ChFouyV5WOfCcDau79Z8LGjWeW4Mt1K5OyFa','Murid','2026-07-21 08:34:17.642',NULL,0,NULL,NULL),
('cmruede2r000f4sdhsndy8mth','Finza Ardiansyah Ramadhan','serahapebae@gmail.com','$2b$10$6SRQyFr5NYHLYm93B/M8VesXkVSFCVMAlx66Ue0tFNeulOmkPQXFK','Murid','2026-07-21 08:34:17.859',NULL,0,NULL,NULL),
('cmruedebk000g4sdh5i39fxio','Agra rahma p','graa0801@gmail.com','$2b$10$tao3UoMj8AoWAKOhdmewAefBgKD2kn8Hv5jvb9eHl33sNXBiM7wJ2','Murid','2026-07-21 08:34:18.176',NULL,0,NULL,NULL),
('cmruedegq000h4sdhgcvuchpo','MuhammadFaiz Al Faritzy','aantek800@gmail.com','$2b$10$Ukrb8TrtreQFlbCvKCBZn.plGAXgdY9OxivHIDfazsYGh/g3aoFIa','Murid','2026-07-21 08:34:18.362',NULL,0,NULL,NULL),
('cmruedelz000i4sdhbpc9xfxb','KUSUMA DAFFA FATIH','daffa230722@gmail.com','$2b$10$qwo5Qh0NxiHqOfWrFQl3geHyI.psQZCPpK6kxkGEDJStRKU5N/2y6','Murid','2026-07-21 08:34:18.552',NULL,0,NULL,NULL),
('cmrueder9000j4sdhru5iivio','ikbal nur akbar','ballsotre3@gmail.com','$2b$10$Dl4MpltLAHfkMRLfVY6kdOHeX7K24sHjz.btwq3il/oH2OXyDLD3m','Murid','2026-07-21 08:34:18.742',NULL,0,NULL,NULL),
('cmruedewj000k4sdh4yknkvtq','farda al ghofur','ganzbot55@gmail.com','$2b$10$vdjft1pQUb6dFTSdZXKvYuafm72QEuFJZd3/rx8JF1xS81PIUvvDm','Murid','2026-07-21 08:34:18.931',NULL,0,NULL,NULL),
('cmruedf1s000l4sdhse6k2k1x','caesar rizki f','caesarrizkyfahreza@gmail.com','$2b$10$RFckepF6mmtWQ9EuQh4lnu5GJtxeJ69zY4jwqNTLFQcComPgoi41u','Murid','2026-07-21 08:34:19.120',NULL,0,NULL,NULL),
('cmruedf7x000m4sdhfrwxxsws','M arka fatir','arkafatir614@gmail.com','$2b$10$N1FAzgx4wiZ71zbjAeYIru/9kMKeSpmMrrF93Km57YqKxyHrnzDFK','Murid','2026-07-21 08:34:19.341',NULL,0,NULL,NULL),
('cmruedfd6000n4sdhx5ptssg8','bagas yogya E. P.','gegebagas99@gmail.com','$2b$10$cXqAYC6V48FLzYP3jp1DTO31JGZXYjWtx97EDEGMpwGVQ33oZJBtm','Murid','2026-07-21 08:34:19.530',NULL,0,NULL,NULL),
('cmrzuojx1000011ggw44c4fni','agus','agus@agus','$2b$10$w9xgHuP3RSo6BHus5woq3ua1b4iU3qaO1mRie.upFaOjLnbxl8U02','Murid','2026-07-25 04:09:43.382',NULL,0,'XII TM A',NULL),
('cmrzurkcm000811ggzczfx8ze','ahmad','ahmad@ahmad','$2b$10$RRW5M.Tn6qxSrSwvmWh/iuq.y.B1sm.bS3bQzXgl2cImNp4E7qtcG','Murid','2026-07-25 04:12:03.911',NULL,0,'XI TM A',NULL);
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
('cmrrjj3x60007otelko3xakxn','cmrrivitu0000b2hlrkc6lhv6','88728ea6e96f8c42cc392d4bae9f9963dfa5208e576fd46212f8a2cbdc042c66','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','114.10.74.201','2026-07-24 07:33:17.082','2026-07-19 08:35:24.186','2026-08-18 08:35:24.185',NULL),
('cmrrjjved000boteladc2von6','cmrrivitu0000b2hlrkc6lhv6','1cf259574046f14158b51b76d1456c4b65d0b6727a83091500e68f56fb00464d','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','182.2.180.25','2026-07-19 08:36:21.068','2026-07-19 08:35:59.797','2026-08-18 08:35:59.796',NULL),
('cmrrjnc98000fotelhe9y52g0','cmrrivitu0000b2hlrkc6lhv6','049287a08a7438b7fcbe64a123ff585b2842f2872596ebb54fe911845cfa84fc','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','182.2.180.25','2026-07-19 08:43:39.196','2026-07-19 08:38:41.612','2026-08-18 08:38:41.611',NULL),
('cmrrjvxje0003zck213i8780o','cmrrivitu0000b2hlrkc6lhv6','ff58815a7ed359cd49acd98df4b78288aab9407d23a8fe9ce19fc8c51f2f6a72','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','182.2.180.25','2026-07-19 10:44:49.928','2026-07-19 08:45:22.442','2026-08-18 08:45:22.440',NULL),
('cmrrydzyq0003vaismck0z7jl','cmrrivitu0000b2hlrkc6lhv6','54192c4a04ac62679a3a8c7375d86678655ed51c19fe3032d47a57cb9011dab8','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','103.253.26.224','2026-07-19 15:31:20.463','2026-07-19 15:31:20.007','2026-08-18 15:31:19.983',NULL),
('cmrryk9ou0009vaisfqzbr64e','cmrrivitu0000b2hlrkc6lhv6','3b3c5f2b3b257fef7cb3e84f0f0bb854f4c57eb5cf399821e5390bde3bf97332','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','103.253.26.224','2026-07-19 15:39:12.765','2026-07-19 15:36:12.558','2026-08-18 15:36:12.557',NULL),
('cmrrz29ot0005qjcu1khxg7db','cmrrivitu0000b2hlrkc6lhv6','a541bf588184ad9f0fc8b10c5f422849b73d8a777874c2728e47459be474aa57','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36','114.10.68.235','2026-07-24 10:38:54.957','2026-07-19 15:50:12.365','2026-08-18 15:50:12.363',NULL),
('cmrrzgd800009qjcu0j4c4xwc','cmrrivitu0000b2hlrkc6lhv6','06621705a51a34c394e45eca57b8b3911190e0e733ecf9113af918b24f8bc693','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','103.253.26.224','2026-07-19 16:01:10.526','2026-07-19 16:01:10.127','2026-08-18 16:01:10.126',NULL),
('cmrt5mo6b0005101qr6y1m0i7','cmrrivitu0000b2hlrkc6lhv6','fea5600fa435556c4b1b2fd92b8d7930b6dd2151da8d2703f491ffeafddd3f2c','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','::ffff:192.168.31.116','2026-07-20 11:41:48.415','2026-07-20 11:41:48.131','2026-08-19 11:41:48.129',NULL),
('cmrtrqzmy0003k1hh4mcvfwm9','cmrrivitu0000b2hlrkc6lhv6','007e4dc5e85fdfcf6f2c9f90df2689e4ca6d4e21404619cce49451721b25c623','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','103.253.26.224','2026-07-20 22:07:16.656','2026-07-20 22:01:01.161','2026-08-19 22:01:01.159',NULL),
('cmry3vihi0003xpsrcunwup57','cmrrivitu0000b2hlrkc6lhv6','f2e6c8220d9ae817f50d517f5f9844fd2b84a877eebf718b9659613802d96007','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','103.253.26.224','2026-07-23 22:51:32.761','2026-07-23 22:51:32.310','2026-08-22 22:51:32.308',NULL),
('cmrzm745v0009hoen1dz3k5ss','cmrrivitu0000b2hlrkc6lhv6','2e5105440de9ce907793aeabb4672e73f416385858634e6cacf82622ecdd5ae8','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','103.253.26.224','2026-07-25 11:54:01.163','2026-07-25 00:12:12.883','2026-08-24 00:12:12.880',NULL);
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
('10e2fd63-1ce2-40f7-add6-5bd18540ca0a','c3eb005a2bbba6851a62d1f0c3600e2a29bdc19d270ec7b4192a18344f7a4a87','2026-07-25 05:13:52.716','0004_add_tmi_advanced_features',NULL,NULL,'2026-07-25 05:13:42.655',1),
('c5f64b53-79fe-4252-9d9e-44c761391f56','f4a729ccc141176c535e6831d4e76f80b80e9d904a6c080f37e0b0aa896a793f','2026-07-25 04:07:18.864','0003_add_user_class',NULL,NULL,'2026-07-25 04:07:17.542',1),
('da43796b-e03d-441f-8ef6-73ac181cee79','f6209ee6731d844f88457fc13e20c44557ee137f2eaf0a4307c04ce64905aaca','2026-07-19 08:15:17.717','0000_init',NULL,NULL,'2026-07-19 08:15:16.276',1),
('e3aff0b0-e326-4944-b797-c67781725678','50c155a1473eaa001c895bccc4980084797e171504d13febe2d7de841aaf7049','2026-07-25 06:16:42.107','0005_add_tmi_extended_modules',NULL,NULL,'2026-07-25 06:16:37.220',1),
('ead0da35-288a-472f-958a-1e681acbca4e','4e262bb83a7e76c8cd6b0f8c1f0a126fdd84fb80c8728d0fdb0d5b6e7fc1b078','2026-07-25 03:10:24.894','0002_add_lesson_plan',NULL,NULL,'2026-07-25 03:10:21.266',1),
('ef36046f-a8b8-4a74-9b0a-faa038d0cba8','8651ac2b4f32acabeda4da9ab27682b318dac810fadf8261bbc0f1999723d6c1','2026-07-25 02:31:15.612','0001_add_logbook_session_fields',NULL,NULL,'2026-07-25 02:31:12.775',1);
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

-- Dump completed on 2026-07-27 19:00:01
