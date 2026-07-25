ALTER TABLE `Logbook` ADD COLUMN `startTime` DATETIME(3) NULL;
ALTER TABLE `Logbook` ADD COLUMN `endTime` DATETIME(3) NULL;
ALTER TABLE `Logbook` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'Completed';

CREATE INDEX `Logbook_studentId_status_idx` ON `Logbook`(`studentId`, `status`);
